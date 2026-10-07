import { describe, expect, it } from "vitest";
import sharp from "sharp";

import { frameSketchArtworkToShape } from "../src/services/sketch-engraving.service.js";

async function blackCanvasWithWhiteCenter() {
  const centerMark = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
      <rect x="472" y="472" width="80" height="80" fill="#fff"/>
    </svg>
  `);

  return sharp({
    create: {
      background: "#000000",
      channels: 3,
      height: 1024,
      width: 1024,
    },
  })
    .composite([{ input: centerMark, left: 0, top: 0 }])
    .png()
    .toBuffer();
}

async function whiteCanvasWithBlackCenter() {
  const centerMark = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
      <rect x="472" y="472" width="80" height="80" fill="#000"/>
    </svg>
  `);

  return sharp({
    create: {
      background: "#ffffff",
      channels: 3,
      height: 1024,
      width: 1024,
    },
  })
    .composite([{ input: centerMark, left: 0, top: 0 }])
    .png()
    .toBuffer();
}

async function whiteCanvasWithBlackWideMotif() {
  const motif = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
      <path d="M210 512 C330 390 694 390 814 512 C692 638 332 638 210 512 Z" fill="none" stroke="#000" stroke-width="24"/>
      <path d="M300 512 H724" fill="none" stroke="#000" stroke-width="18" stroke-linecap="round"/>
    </svg>
  `);

  return sharp({
    create: {
      background: "#ffffff",
      channels: 3,
      height: 1024,
      width: 1024,
    },
  })
    .composite([{ input: motif, left: 0, top: 0 }])
    .png()
    .toBuffer();
}

async function blackCanvasWithWhiteTopBand() {
  const topBand = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
      <rect x="472" y="0" width="80" height="80" fill="#fff"/>
    </svg>
  `);

  return sharp({
    create: {
      background: "#000000",
      channels: 3,
      height: 1024,
      width: 1024,
    },
  })
    .composite([{ input: topBand, left: 0, top: 0 }])
    .png()
    .toBuffer();
}

async function blackCanvasWithWhiteBottomBand() {
  const bottomBand = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
      <rect x="0" y="944" width="1024" height="80" fill="#fff"/>
    </svg>
  `);

  return sharp({
    create: {
      background: "#000000",
      channels: 3,
      height: 1024,
      width: 1024,
    },
  })
    .composite([{ input: bottomBand, left: 0, top: 0 }])
    .png()
    .toBuffer();
}

async function blackCanvasWithWideTopAndBottomBands() {
  const bands = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
      <rect x="472" y="0" width="80" height="80" fill="#fff"/>
      <rect x="0" y="944" width="1024" height="80" fill="#fff"/>
    </svg>
  `);

  return sharp({
    create: {
      background: "#000000",
      channels: 3,
      height: 1024,
      width: 1024,
    },
  })
    .composite([{ input: bands, left: 0, top: 0 }])
    .png()
    .toBuffer();
}

async function rawRgb(buffer) {
  const image = await sharp(buffer, { failOn: "none" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  return {
    channels: image.info.channels || 3,
    data: image.data,
    height: image.info.height,
    width: image.info.width,
  };
}

function lumaAt(image, x, y) {
  const index = (y * image.width + x) * image.channels;
  const r = image.data[index];
  const g = image.channels === 1 ? r : image.data[index + 1];
  const b = image.channels === 1 ? r : image.data[index + 2];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

describe("sketch engraving framing", () => {
  const rectLeft = 177;
  const rectRight = 848;
  const rectTop = 57;
  const rectBottom = 968;

  it("detaylı oval çıktıya görünür çerçeve eklemez (çerçevesiz)", async () => {
    const source = await blackCanvasWithWhiteCenter();
    const framed = await frameSketchArtworkToShape(source, {
      designMode: "emboss",
      product: "yuzuk",
      shape: "oval",
    });

    expect(framed).toEqual(expect.objectContaining({
      contentType: "image/png",
      height: 1024,
      width: 1024,
    }));

    const image = await rawRgb(framed.buffer);
    // İçerik alta yaslı; oval üst kenarında eskiden beyaz çerçeve vardı, artık
    // arka plan (siyah) olmalı. Merkez içerik (beyaz) korunur.
    expect(lumaAt(image, 512, 51)).toBeLessThan(25);
    expect(lumaAt(image, 8, 8)).toBeLessThan(8);
    expect(lumaAt(image, 512, 512)).toBeGreaterThan(230);
  });

  it("minimalist oval çıktıya görünür çerçeve eklemez (çerçevesiz)", async () => {
    const source = await whiteCanvasWithBlackCenter();
    const framed = await frameSketchArtworkToShape(source, {
      designMode: "engrave",
      product: "yuzuk",
      shape: "oval",
    });

    expect(framed).toEqual(expect.objectContaining({
      contentType: "image/png",
      height: 1024,
      width: 1024,
    }));

    const image = await rawRgb(framed.buffer);
    // Çerçevesiz: oval kenarındaki siyah çerçeve gitti; üst kenar/köşe beyaz arka
    // plan, merkez içerik (siyah) korunur.
    expect(lumaAt(image, 512, 51)).toBeGreaterThan(230);
    expect(lumaAt(image, 8, 8)).toBeGreaterThan(230);
    expect(lumaAt(image, 512, 512)).toBeLessThan(25);
  });

  it("minimalist oval motifi çerçeve içinde daha dolu yerleştirir", async () => {
    const source = await whiteCanvasWithBlackWideMotif();
    const framed = await frameSketchArtworkToShape(source, {
      designMode: "engrave",
      product: "yuzuk",
      shape: "oval",
    });

    const image = await rawRgb(framed.buffer);
    expect(lumaAt(image, 170, 512)).toBeLessThan(25);
    expect(lumaAt(image, 854, 512)).toBeLessThan(25);
  });

  it("detaylı oval çizimi alta yaslar ve oval dışını siyah bırakır", async () => {
    const source = await blackCanvasWithWhiteBottomBand();
    const framed = await frameSketchArtworkToShape(source, {
      designMode: "emboss",
      product: "yuzuk",
      shape: "oval",
    });

    const image = await rawRgb(framed.buffer);
    expect(lumaAt(image, 512, 940)).toBeGreaterThan(230);
    expect(lumaAt(image, 120, 900)).toBeLessThan(8);
  });

  it("detaylı oval geniş kaynakta üst boşluğu azaltmak için yüksekliğe göre sığdırır", async () => {
    const source = await blackCanvasWithWideTopAndBottomBands();
    const framed = await frameSketchArtworkToShape(source, {
      designMode: "emboss",
      product: "yuzuk",
      shape: "oval",
    });

    const image = await rawRgb(framed.buffer);
    expect(lumaAt(image, 512, 150)).toBeGreaterThan(230);
  });

  it("detaylı yuvarlak çıktıya görünür çerçeve eklemez (çerçevesiz)", async () => {
    const source = await blackCanvasWithWhiteCenter();
    const framed = await frameSketchArtworkToShape(source, {
      designMode: "emboss",
      shape: "yuvarlak",
    });

    expect(framed).toEqual(expect.objectContaining({
      contentType: "image/png",
      height: 1024,
      width: 1024,
    }));

    const image = await rawRgb(framed.buffer);
    // Eski beyaz çemberin durduğu üst kenar artık arka plan (siyah) olmalı.
    expect(lumaAt(image, 512, 56)).toBeLessThan(25);
    expect(lumaAt(image, 8, 8)).toBeLessThan(8);
    expect(lumaAt(image, 512, 512)).toBeGreaterThan(230);
  });

  it("detaylı yuvarlak çizimi çemberin içine sığacak şekilde küçültür", async () => {
    const source = await blackCanvasWithWhiteTopBand();
    const framed = await frameSketchArtworkToShape(source, {
      designMode: "emboss",
      shape: "yuvarlak",
    });

    const image = await rawRgb(framed.buffer);
    expect(lumaAt(image, 512, 20)).toBeLessThan(8);
    expect(lumaAt(image, 512, 128)).toBeGreaterThan(230);
  });

  it("detaylı yuvarlak çizimi alta yaslar ve çember dışını siyah bırakır", async () => {
    const source = await blackCanvasWithWhiteBottomBand();
    const framed = await frameSketchArtworkToShape(source, {
      designMode: "emboss",
      shape: "yuvarlak",
    });

    const image = await rawRgb(framed.buffer);
    expect(lumaAt(image, 512, 940)).toBeGreaterThan(230);
    expect(lumaAt(image, 120, 900)).toBeLessThan(8);
  });

  it("minimalist yuvarlak çıktıya görünür çerçeve eklemez (çerçevesiz)", async () => {
    const source = await whiteCanvasWithBlackCenter();
    const framed = await frameSketchArtworkToShape(source, {
      designMode: "engrave",
      shape: "yuvarlak",
    });

    expect(framed).toEqual(expect.objectContaining({
      contentType: "image/png",
      height: 1024,
      width: 1024,
    }));

    const image = await rawRgb(framed.buffer);
    // Çerçevesiz: üst kenardaki siyah çember gitti; üst kenar/köşe beyaz, merkez siyah.
    expect(lumaAt(image, 512, 56)).toBeGreaterThan(230);
    expect(lumaAt(image, 8, 8)).toBeGreaterThan(230);
    expect(lumaAt(image, 512, 512)).toBeLessThan(25);
  });

  it("detaylı dikdörtgen çıktıya görünür çerçeve eklemez (çerçevesiz)", async () => {
    const source = await blackCanvasWithWhiteCenter();
    const framed = await frameSketchArtworkToShape(source, {
      designMode: "emboss",
      product: "kolye",
      shape: "dikdortgen",
    });

    expect(framed).toEqual(expect.objectContaining({
      contentType: "image/png",
      height: 1024,
      width: 1024,
    }));

    const image = await rawRgb(framed.buffer);
    // İçerik alta yaslı; üst kenarda eskiden beyaz çerçeve vardı, artık arka plan.
    // Şekil dışı ve üst kenar siyah; merkez içerik (beyaz) korunur.
    expect(lumaAt(image, 512, rectTop)).toBeLessThan(25);
    expect(lumaAt(image, 120, 512)).toBeLessThan(8);
    expect(lumaAt(image, 512, 20)).toBeLessThan(8);
    expect(lumaAt(image, 512, 512)).toBeGreaterThan(230);
  });

  it("minimalist dikdörtgen çıktıya görünür çerçeve eklemez (çerçevesiz)", async () => {
    const source = await whiteCanvasWithBlackCenter();
    const framed = await frameSketchArtworkToShape(source, {
      designMode: "engrave",
      product: "kolye",
      shape: "dikdortgen",
    });

    expect(framed).toEqual(expect.objectContaining({
      contentType: "image/png",
      height: 1024,
      width: 1024,
    }));

    const image = await rawRgb(framed.buffer);
    // Çerçevesiz: üst/alt kenardaki siyah çerçeve gitti (beyaz arka plan); şekil dışı
    // beyaz; merkez içerik (siyah) korunur.
    expect(lumaAt(image, 512, rectTop)).toBeGreaterThan(230);
    expect(lumaAt(image, 512, rectBottom)).toBeGreaterThan(230);
    expect(lumaAt(image, 120, 512)).toBeGreaterThan(230);
    expect(lumaAt(image, 512, 20)).toBeGreaterThan(230);
    expect(lumaAt(image, 512, 512)).toBeLessThan(25);
  });
});
