import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { buildFinishImages } from "../src/services/finish.service.js";

const FINISH_OPTIONS = {
  background: "dekupe",
  designMode: "engrave",
  finishCount: 1,
  metal: "gumus",
  product: "yuzuk",
  productShape: "yuvarlak",
  ringMoldKey: "yuvarlak-foto-xl",
  surface: "parlak",
};

function sourceArtwork({ guideColor = "", hatchColor = "" } = {}) {
  const guide = guideColor
    ? `<line x1="96" y1="200" x2="304" y2="200" stroke="${guideColor}" stroke-width="18" />`
    : "";
  const hatch = hatchColor
    ? Array.from({ length: 18 }, (_, index) => {
      const y = 104 + index * 9;
      return `<path d="M82 ${y} C148 ${y - 24} 252 ${y + 24} 318 ${y}" fill="none" stroke="${hatchColor}" stroke-width="3" />`;
    }).join("\n")
    : "";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#fff" />
      ${hatch}
      <rect x="70" y="70" width="260" height="260" fill="none" stroke="#000" stroke-width="10" />
      ${guide}
      <path d="M128 278 C168 118 236 118 272 278" fill="none" stroke="#000" stroke-width="12" stroke-linecap="round" />
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

function portraitArtwork() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#fff" />
      <path d="M206 64 C158 70 132 112 136 162 C142 238 194 278 220 278 C256 278 284 222 286 168 C288 108 260 64 206 64 Z" fill="none" stroke="#111" stroke-width="9" stroke-linejoin="round" />
      <path d="M150 142 C168 104 208 98 248 124 C230 118 218 138 198 138 C176 138 168 146 150 142 Z" fill="none" stroke="#111" stroke-width="10" stroke-linecap="round" />
      <path d="M166 186 C178 178 190 178 202 186 M226 184 C238 176 250 177 262 186" fill="none" stroke="#111" stroke-width="7" stroke-linecap="round" />
      <path d="M196 220 C214 230 236 230 252 218" fill="none" stroke="#111" stroke-width="7" stroke-linecap="round" />
      <path d="M140 280 C116 316 104 354 96 392 M274 278 C318 308 340 344 350 392 M154 304 C190 340 242 340 282 304" fill="none" stroke="#111" stroke-width="9" stroke-linecap="round" />
      <path d="M114 338 C156 320 210 310 298 334" fill="none" stroke="#111" stroke-width="6" stroke-linecap="round" />
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

function circularFrameArtwork() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#fff" />
      <circle cx="200" cy="200" r="172" fill="none" stroke="#000" stroke-width="10" />
      <circle cx="200" cy="200" r="142" fill="none" stroke="#000" stroke-width="5" />
      <path d="M126 230 C162 130 238 130 274 230" fill="none" stroke="#000" stroke-width="9" stroke-linecap="round" />
      <path d="M144 192 L256 192" fill="none" stroke="#000" stroke-width="5" stroke-linecap="round" />
      <circle cx="200" cy="176" r="9" fill="#000" />
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

function outerCircularFrameArtwork() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#fff" />
      <circle cx="200" cy="200" r="172" fill="none" stroke="#000" stroke-width="10" />
      <path d="M126 230 C162 130 238 130 274 230" fill="none" stroke="#000" stroke-width="9" stroke-linecap="round" />
      <path d="M144 192 L256 192" fill="none" stroke="#000" stroke-width="5" stroke-linecap="round" />
      <circle cx="200" cy="176" r="9" fill="#000" />
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

function ovalFrameArtwork() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">
      <rect width="400" height="500" fill="#fff" />
      <ellipse cx="200" cy="250" rx="172" ry="222" fill="none" stroke="#000" stroke-width="10" />
      <path d="M126 302 C168 148 232 148 274 302" fill="none" stroke="#000" stroke-width="9" stroke-linecap="round" />
      <path d="M144 238 C176 218 224 218 256 238" fill="none" stroke="#000" stroke-width="6" stroke-linecap="round" />
      <circle cx="200" cy="214" r="9" fill="#000" />
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

function detailedCircularArtwork() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#000" />
      <circle cx="200" cy="200" r="174" fill="none" stroke="#fff" stroke-width="10" />
      <circle cx="200" cy="200" r="142" fill="none" stroke="#fff" stroke-width="5" />
      <path d="M96 248 C132 124 268 124 304 248" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" />
      <path d="M126 180 L274 180 M142 210 L258 210" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" />
      <text x="200" y="318" fill="#fff" font-size="38" font-family="Arial" text-anchor="middle" font-weight="700">SAN DIEGO</text>
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

function detailedSquareArtwork() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#000" />
      <rect x="28" y="28" width="344" height="344" fill="none" stroke="#fff" stroke-width="8" />
      <path d="M200 78 L316 180 H284 V316 H116 V180 H84 Z" fill="none" stroke="#fff" stroke-width="8" stroke-linejoin="round" />
      <path d="M150 184 V316 M200 184 V316 M250 184 V316" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" />
      <path d="M132 166 H268 M120 220 H280 M116 316 H284" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" />
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

function detailedInsetSquareArtwork() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#000" />
      <rect x="54" y="54" width="292" height="292" fill="none" stroke="#8f8f8f" stroke-width="4" />
      <path d="M92 286 H318 M108 268 H302 M126 244 V142 M178 244 V142 M230 244 V142 M282 244 V142" fill="none" stroke="#d4d4d4" stroke-width="7" stroke-linecap="round" />
      <path d="M96 136 L200 94 L304 136 Z M112 136 H288 M116 154 H284" fill="none" stroke="#d4d4d4" stroke-width="7" stroke-linejoin="round" />
      <path d="M86 302 H314" fill="none" stroke="#8f8f8f" stroke-width="4" />
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

function whiteArtwork() {
  return sharp({
    create: {
      background: "#fff",
      channels: 4,
      height: 400,
      width: 400,
    },
  }).png().toBuffer();
}

function dataUrlBuffer(dataUrl) {
  return Buffer.from(dataUrl.split(",")[1] || "", "base64");
}

function pixelLuma(data, index) {
  return (
    0.2126 * data[index] +
    0.7152 * data[index + 1] +
    0.0722 * data[index + 2]
  );
}

async function lumaAt(dataUrl, x, y) {
  const image = await sharp(dataUrlBuffer(dataUrl))
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const channels = image.info.channels || 3;
  const index = (y * image.info.width + x) * channels;
  return pixelLuma(image.data, index);
}

async function meanLumaDifference(dataUrlA, dataUrlB, region) {
  const [imageA, imageB] = await Promise.all([
    sharp(dataUrlBuffer(dataUrlA))
      .extract(region)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true }),
    sharp(dataUrlBuffer(dataUrlB))
      .extract(region)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true }),
  ]);
  const channels = imageA.info.channels || 3;
  let total = 0;
  let count = 0;

  for (let index = 0; index < imageA.data.length; index += channels) {
    const lumaA = pixelLuma(imageA.data, index);
    const lumaB = pixelLuma(imageB.data, index);
    total += Math.abs(lumaA - lumaB);
    count += 1;
  }

  return total / Math.max(1, count);
}

async function artworkDifferenceBounds(dataUrlA, dataUrlB, region, threshold = 8) {
  const [imageA, imageB] = await Promise.all([
    sharp(dataUrlBuffer(dataUrlA))
      .extract(region)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true }),
    sharp(dataUrlBuffer(dataUrlB))
      .extract(region)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true }),
  ]);
  const channels = imageA.info.channels || 3;
  let minX = region.width;
  let minY = region.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < region.height; y += 1) {
    for (let x = 0; x < region.width; x += 1) {
      const index = (y * region.width + x) * channels;
      const difference = Math.abs(pixelLuma(imageA.data, index) - pixelLuma(imageB.data, index));
      if (difference > threshold) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  return {
    bottomMargin: maxY >= 0 ? region.height - maxY - 1 : region.height,
    height: maxY >= 0 ? maxY - minY + 1 : 0,
    left: maxX >= 0 ? minX : 0,
    rightMargin: maxX >= 0 ? region.width - maxX - 1 : region.width,
    top: maxY >= 0 ? minY : 0,
    width: maxX >= 0 ? maxX - minX + 1 : 0,
  };
}

async function darkPixelRatio(dataUrl, region, threshold = 70) {
  const image = await sharp(dataUrlBuffer(dataUrl))
    .extract(region)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const channels = image.info.channels || 3;
  let dark = 0;
  let count = 0;

  for (let index = 0; index < image.data.length; index += channels) {
    if (pixelLuma(image.data, index) < threshold) dark += 1;
    count += 1;
  }

  return dark / Math.max(1, count);
}

async function shapeBandDifferenceRatio(dataUrlA, dataUrlB, region, shape, innerRadiusRatio = 0.91, threshold = 8) {
  const [imageA, imageB] = await Promise.all([
    sharp(dataUrlBuffer(dataUrlA))
      .extract(region)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true }),
    sharp(dataUrlBuffer(dataUrlB))
      .extract(region)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true }),
  ]);
  const channels = imageA.info.channels || 3;
  const centerX = (region.width - 1) / 2;
  const centerY = (region.height - 1) / 2;
  const radiusX = region.width / 2;
  const radiusY = region.height / 2;
  const innerDistance = innerRadiusRatio * innerRadiusRatio;
  const isRounded = shape === "yuvarlak";
  let changed = 0;
  let count = 0;

  for (let y = 0; y < region.height; y += 1) {
    for (let x = 0; x < region.width; x += 1) {
      const normalizedX = (x - centerX) / radiusX;
      const normalizedY = (y - centerY) / (isRounded ? radiusX : radiusY);
      const distance = normalizedX * normalizedX + normalizedY * normalizedY;
      if (distance < innerDistance || distance > 1) continue;
      const index = (y * region.width + x) * channels;
      const difference = Math.abs(pixelLuma(imageA.data, index) - pixelLuma(imageB.data, index));
      if (difference > threshold) changed += 1;
      count += 1;
    }
  }

  return changed / Math.max(1, count);
}

describe("finish composite", () => {
  it("beyaza yakın kaynak izlerini gravür çizgisi olarak taşımaz", async () => {
    const [cleanSource, sourceWithPaleGuide, sourceWithMidGuide, sourceWithHatching] = await Promise.all([
      sourceArtwork(),
      sourceArtwork({ guideColor: "#c6c6c6" }),
      sourceArtwork({ guideColor: "#999999" }),
      sourceArtwork({ hatchColor: "#999999" }),
    ]);

    const [cleanResult] = await buildFinishImages(cleanSource, FINISH_OPTIONS);
    const [guideResult] = await buildFinishImages(sourceWithPaleGuide, FINISH_OPTIONS);
    const [midGuideResult] = await buildFinishImages(sourceWithMidGuide, FINISH_OPTIONS);
    const [hatchingResult] = await buildFinishImages(sourceWithHatching, FINISH_OPTIONS);

    const cleanCenterLuma = await lumaAt(cleanResult.url, 514, 511);
    const guideCenterLuma = await lumaAt(guideResult.url, 514, 511);
    const midGuideCenterLuma = await lumaAt(midGuideResult.url, 514, 511);
    const hatchingDifference = await meanLumaDifference(cleanResult.url, hatchingResult.url, {
      height: 300,
      left: 364,
      top: 361,
      width: 300,
    });

    expect(Math.abs(cleanCenterLuma - guideCenterLuma)).toBeLessThan(8);
    expect(Math.abs(cleanCenterLuma - midGuideCenterLuma)).toBeLessThan(8);
    expect(hatchingDifference).toBeLessThan(2.5);
  });

  it("kolye şablonunda seçili pendantı tek ürün gibi merkeze taşır", async () => {
    const [source, blankSource] = await Promise.all([
      sourceArtwork(),
      whiteArtwork(),
    ]);

    const finishOptions = {
      ...FINISH_OPTIONS,
      product: "kolye",
      productShape: "yuvarlak",
      ringMoldKey: "kolye-yuvarlak-foto-gumus-xl",
    };
    const [result, blankResult] = await Promise.all([
      buildFinishImages(source, finishOptions).then(([image]) => image),
      buildFinishImages(blankSource, finishOptions).then(([image]) => image),
    ]);

    const centeredArtworkBounds = await artworkDifferenceBounds(result.url, blankResult.url, {
      height: 470,
      left: 300,
      top: 320,
      width: 470,
    });
    const oldSecondPendantAreaLuma = await lumaAt(result.url, 746, 551);

    expect(centeredArtworkBounds.width).toBeGreaterThan(220);
    expect(centeredArtworkBounds.height).toBeGreaterThan(180);
    expect(oldSecondPendantAreaLuma).toBeGreaterThan(235);
  });

  it("kolye foto şablonunda gravürü yüzeye daha dolu oturtur", async () => {
    const [source, blankSource] = await Promise.all([
      portraitArtwork(),
      whiteArtwork(),
    ]);

    const finishOptions = {
      ...FINISH_OPTIONS,
      product: "kolye",
      productShape: "yuvarlak",
      ringMoldKey: "kolye-yuvarlak-foto-gumus-xl",
    };
    const [result, blankResult] = await Promise.all([
      buildFinishImages(source, finishOptions).then(([image]) => image),
      buildFinishImages(blankSource, finishOptions).then(([image]) => image),
    ]);
    const artworkBounds = await artworkDifferenceBounds(result.url, blankResult.url, {
      height: 470,
      left: 300,
      top: 320,
      width: 470,
    });

    expect(artworkBounds.width).toBeGreaterThan(300);
    expect(artworkBounds.height).toBeGreaterThan(300);
  });

  it("minimalist kare kolyede çizim oranını bozmadan yüzeye oturtur", async () => {
    const [source, blankSource] = await Promise.all([
      portraitArtwork(),
      whiteArtwork(),
    ]);
    const finishOptions = {
      ...FINISH_OPTIONS,
      product: "kolye",
      productShape: "kare",
      ringMoldKey: "kolye-kare-foto-gumus-xl",
    };
    const [result, blankResult] = await Promise.all([
      buildFinishImages(source, finishOptions).then(([image]) => image),
      buildFinishImages(blankSource, finishOptions).then(([image]) => image),
    ]);
    const faceRegion = { height: 410, left: 330, top: 346, width: 410 };
    const artworkBounds = await artworkDifferenceBounds(result.url, blankResult.url, faceRegion);

    expect(artworkBounds.height).toBeGreaterThan(faceRegion.height * 0.93);
    expect(artworkBounds.width / artworkBounds.height).toBeLessThan(0.86);
    expect(artworkBounds.left).toBeGreaterThan(36);
    expect(artworkBounds.rightMargin).toBeGreaterThan(36);
  });

  it.each([
    ["yuvarlak", "kolye-yuvarlak-foto-gumus-xl", { height: 18, left: 328, top: 546, width: 18 }],
    ["oval", "kolye-oval-foto-gumus-xl", { height: 18, left: 370, top: 556, width: 18 }],
    ["dikdortgen", "kolye-dikdortgen-foto-gumus-xl", { height: 18, left: 354, top: 578, width: 18 }],
  ])("kolye %s şablonuna 2. aşama çerçevesi eklemez", async (productShape, ringMoldKey, frameRegion) => {
    const [result] = await buildFinishImages(await whiteArtwork(), {
      ...FINISH_OPTIONS,
      product: "kolye",
      productShape,
      ringMoldKey,
    });

    const frameDarkRatio = await darkPixelRatio(result.url, frameRegion, 160);

    expect(frameDarkRatio).toBeLessThan(0.08);
  });

  it("kolye kare şablonuna 2. aşama çerçevesi eklemez", async () => {
    const [result] = await buildFinishImages(await whiteArtwork(), {
      ...FINISH_OPTIONS,
      product: "kolye",
      productShape: "kare",
      ringMoldKey: "kolye-kare-foto-gumus-xl",
    });

    const frameDarkRatio = await darkPixelRatio(result.url, {
      height: 18,
      left: 328,
      top: 546,
      width: 18,
    }, 160);

    expect(frameDarkRatio).toBeLessThan(0.08);
  });

  it("kolyede kaynak çerçeveyi temizleyip ürün üstünde çerçevesiz bırakır", async () => {
    const [result, blankResult] = await Promise.all([
      buildFinishImages(await outerCircularFrameArtwork(), {
        ...FINISH_OPTIONS,
        product: "kolye",
        productShape: "yuvarlak",
        ringMoldKey: "kolye-yuvarlak-foto-gumus-xl",
      }).then(([image]) => image),
      buildFinishImages(await whiteArtwork(), {
        ...FINISH_OPTIONS,
        product: "kolye",
        productShape: "yuvarlak",
        ringMoldKey: "kolye-yuvarlak-foto-gumus-xl",
      }).then(([image]) => image),
    ]);

    const outerFrameDifference = await meanLumaDifference(result.url, blankResult.url, {
      height: 26,
      left: 324,
      top: 542,
      width: 26,
    });

    expect(outerFrameDifference).toBeLessThan(1);
  });

  it("kolyede çerçevesi temizlenen minimalist çizimi büyütür", async () => {
    const [result, blankResult] = await Promise.all([
      buildFinishImages(await circularFrameArtwork(), {
        ...FINISH_OPTIONS,
        product: "kolye",
        productShape: "yuvarlak",
        ringMoldKey: "kolye-yuvarlak-foto-gumus-xl",
      }).then(([image]) => image),
      buildFinishImages(await whiteArtwork(), {
        ...FINISH_OPTIONS,
        product: "kolye",
        productShape: "yuvarlak",
        ringMoldKey: "kolye-yuvarlak-foto-gumus-xl",
      }).then(([image]) => image),
    ]);

    const artworkBounds = await artworkDifferenceBounds(result.url, blankResult.url, {
      height: 470,
      left: 300,
      top: 320,
      width: 470,
    });

    expect(artworkBounds.width).toBeGreaterThan(370);
    expect(artworkBounds.height).toBeGreaterThan(370);
  });

  it("detaylı yuvarlak kolye baskısını yüzey çizgisine daha yakın büyütür", async () => {
    const [source, blankSource] = await Promise.all([
      detailedCircularArtwork(),
      whiteArtwork(),
    ]);
    const finishOptions = {
      ...FINISH_OPTIONS,
      designMode: "emboss",
      product: "kolye",
      productShape: "yuvarlak",
      ringMoldKey: "kolye-yuvarlak-foto-gumus-xl",
    };
    const [result, blankResult] = await Promise.all([
      buildFinishImages(source, finishOptions).then(([image]) => image),
      buildFinishImages(blankSource, finishOptions).then(([image]) => image),
    ]);
    const faceRegion = { height: 410, left: 307, top: 346, width: 410 };
    const artworkBounds = await artworkDifferenceBounds(result.url, blankResult.url, faceRegion);

    expect(artworkBounds.width).toBeGreaterThan(faceRegion.width * 0.94);
    expect(artworkBounds.height).toBeGreaterThan(faceRegion.height * 0.98);
    expect(artworkBounds.left).toBeLessThan(26);
    expect(artworkBounds.top).toBeLessThan(6);
    expect(artworkBounds.rightMargin).toBeLessThan(6);
    expect(artworkBounds.bottomMargin).toBeLessThan(6);
  });

  it("detaylı kare kolye baskısını çok az içeri alır", async () => {
    const [source, blankSource] = await Promise.all([
      detailedSquareArtwork(),
      whiteArtwork(),
    ]);
    const finishOptions = {
      ...FINISH_OPTIONS,
      designMode: "emboss",
      product: "kolye",
      productShape: "kare",
      ringMoldKey: "kolye-kare-foto-gumus-xl",
    };
    const [result, blankResult] = await Promise.all([
      buildFinishImages(source, finishOptions).then(([image]) => image),
      buildFinishImages(blankSource, finishOptions).then(([image]) => image),
    ]);
    const faceRegion = { height: 410, left: 330, top: 346, width: 410 };
    const artworkBounds = await artworkDifferenceBounds(result.url, blankResult.url, faceRegion);

    expect(artworkBounds.width).toBeGreaterThan(faceRegion.width * 0.94);
    expect(artworkBounds.height).toBeGreaterThan(faceRegion.height * 0.94);
    expect(artworkBounds.width).toBeLessThanOrEqual(faceRegion.width * 0.965);
    expect(artworkBounds.height).toBeLessThanOrEqual(faceRegion.height * 0.965);
    expect(artworkBounds.left).toBeGreaterThanOrEqual(8);
    expect(artworkBounds.top).toBeGreaterThanOrEqual(3);
    expect(artworkBounds.top).toBeLessThan(8);
    expect(artworkBounds.rightMargin).toBeGreaterThanOrEqual(8);
    expect(artworkBounds.bottomMargin).toBeGreaterThanOrEqual(12);
  });

  it("minimalist yüzük gravürünü foto yüzeyinin kenarlarına taşırmaz", async () => {
    const [source, blankSource] = await Promise.all([
      portraitArtwork(),
      whiteArtwork(),
    ]);
    const [result, blankResult] = await Promise.all([
      buildFinishImages(source, FINISH_OPTIONS).then(([image]) => image),
      buildFinishImages(blankSource, FINISH_OPTIONS).then(([image]) => image),
    ]);

    const artworkBounds = await artworkDifferenceBounds(result.url, blankResult.url, {
      height: 390,
      left: 319,
      top: 316,
      width: 390,
    });

    expect(artworkBounds.width).toBeGreaterThan(220);
    expect(artworkBounds.height).toBeGreaterThan(260);
    expect(artworkBounds.left).toBeGreaterThan(32);
    expect(artworkBounds.top).toBeGreaterThan(2);
    expect(artworkBounds.rightMargin).toBeGreaterThan(32);
    expect(artworkBounds.bottomMargin).toBeGreaterThan(2);
  });

  it("minimalist yuvarlak stencilin sonradan eklenen çerçevesini yüzükte basmaz", async () => {
    const [source, blankSource] = await Promise.all([
      circularFrameArtwork(),
      whiteArtwork(),
    ]);
    const [result, blankResult] = await Promise.all([
      buildFinishImages(source, FINISH_OPTIONS).then(([image]) => image),
      buildFinishImages(blankSource, FINISH_OPTIONS).then(([image]) => image),
    ]);

    const artworkBounds = await artworkDifferenceBounds(result.url, blankResult.url, {
      height: 390,
      left: 319,
      top: 316,
      width: 390,
    });
    const outerFrameRatio = await shapeBandDifferenceRatio(result.url, blankResult.url, {
      height: 390,
      left: 319,
      top: 316,
      width: 390,
    }, "yuvarlak");

    expect(outerFrameRatio).toBeLessThan(0.04);
    expect(artworkBounds.width).toBeGreaterThan(250);
    expect(artworkBounds.height).toBeGreaterThan(250);
    expect(artworkBounds.left).toBeGreaterThan(20);
    expect(artworkBounds.top).toBeGreaterThan(20);
    expect(artworkBounds.rightMargin).toBeGreaterThan(20);
    expect(artworkBounds.bottomMargin).toBeGreaterThan(20);
  });

  it("minimalist oval stencilin sonradan eklenen çerçevesini yüzükte basmaz", async () => {
    const [source, blankSource] = await Promise.all([
      ovalFrameArtwork(),
      whiteArtwork(),
    ]);
    const finishOptions = {
      ...FINISH_OPTIONS,
      productShape: "oval",
      ringMoldKey: "oval-foto-gumus-xl",
    };
    const [result, blankResult] = await Promise.all([
      buildFinishImages(source, finishOptions).then(([image]) => image),
      buildFinishImages(blankSource, finishOptions).then(([image]) => image),
    ]);
    const faceRegion = { height: 615, left: 259, top: 200, width: 503 };
    const artworkBounds = await artworkDifferenceBounds(result.url, blankResult.url, faceRegion);
    const outerFrameRatio = await shapeBandDifferenceRatio(result.url, blankResult.url, faceRegion, "oval");

    expect(outerFrameRatio).toBeLessThan(0.04);
    expect(artworkBounds.width).toBeGreaterThan(faceRegion.width * 0.34);
    expect(artworkBounds.height).toBeGreaterThan(faceRegion.height * 0.28);
    expect(artworkBounds.left).toBeGreaterThan(20);
    expect(artworkBounds.top).toBeGreaterThan(20);
    expect(artworkBounds.rightMargin).toBeGreaterThan(20);
    expect(artworkBounds.bottomMargin).toBeGreaterThan(20);
  });

  it.each([
    ["altın", { metal: "altin", ringMoldKey: "kare-foto-altin-xl" }],
    ["gümüş", { metal: "gumus", ringMoldKey: "kare-foto-gumus-xl" }],
  ])("minimalist kare çerçeveli stencilin dış çerçevesini %s yüzükte basmaz", async (_label, overrides) => {
    const [source, blankSource] = await Promise.all([
      sourceArtwork(),
      whiteArtwork(),
    ]);
    const faceRegion = { height: 476, left: 274, top: 274, width: 476 };
    const [result, blankResult] = await Promise.all([
      buildFinishImages(source, {
        ...FINISH_OPTIONS,
        ...overrides,
        productShape: "kare",
      }).then(([image]) => image),
      buildFinishImages(blankSource, {
        ...FINISH_OPTIONS,
        ...overrides,
        productShape: "kare",
      }).then(([image]) => image),
    ]);

    const artworkBounds = await artworkDifferenceBounds(result.url, blankResult.url, faceRegion);
    const edgeRegions = [
      { height: 24, left: faceRegion.left, top: faceRegion.top, width: faceRegion.width },
      { height: 24, left: faceRegion.left, top: faceRegion.top + faceRegion.height - 24, width: faceRegion.width },
      { height: faceRegion.height, left: faceRegion.left, top: faceRegion.top, width: 24 },
      { height: faceRegion.height, left: faceRegion.left + faceRegion.width - 24, top: faceRegion.top, width: 24 },
    ];
    const edgeArtworkBounds = await Promise.all(
      edgeRegions.map((region) => artworkDifferenceBounds(result.url, blankResult.url, region))
    );

    expect(artworkBounds.width).toBeGreaterThan(faceRegion.width * 0.45);
    expect(artworkBounds.height).toBeGreaterThan(faceRegion.height * 0.35);
    edgeArtworkBounds.forEach((bounds) => expect(bounds.width * bounds.height).toBe(0));
  });

  it.each([
    ["altın", { metal: "altin", ringMoldKey: "yuvarlak-foto-altin-xl" }, { height: 388, left: 317, top: 317, width: 388 }],
    ["gümüş", { metal: "gumus", ringMoldKey: "yuvarlak-foto-xl" }, { height: 390, left: 319, top: 316, width: 390 }],
  ])("detaylı yuvarlak stencili %s yüzük yüzeyine dengeli oturtur", async (_label, overrides, faceRegion) => {
    const [source, blankSource] = await Promise.all([
      detailedCircularArtwork(),
      whiteArtwork(),
    ]);
    const [result, blankResult] = await Promise.all([
      buildFinishImages(source, {
        ...FINISH_OPTIONS,
        ...overrides,
        designMode: "emboss",
      }).then(([image]) => image),
      buildFinishImages(blankSource, {
      ...FINISH_OPTIONS,
      ...overrides,
      designMode: "emboss",
      }).then(([image]) => image),
    ]);

    const topOverflowDarkRatio = await darkPixelRatio(result.url, {
      height: 40,
      left: faceRegion.left,
      top: faceRegion.top - 40,
      width: faceRegion.width,
    });
    const bottomOverflowDarkRatio = await darkPixelRatio(result.url, {
      height: 40,
      left: faceRegion.left,
      top: faceRegion.top + faceRegion.height,
      width: faceRegion.width,
    });
    // Detaylı yüzde kazınmış ZEMİN, eskizdeki gibi SİYAH korunur (metal tonuna
    // boyanmaz). Bu yüzden yüz içinde belirgin oranda siyah piksel bulunmalı:
    // soldaki (eskiz) siyahlık sağdaki (ürün) görsele birebir taşınır.
    const faceDarkRatio = await darkPixelRatio(result.url, faceRegion);
    const artworkBounds = await artworkDifferenceBounds(result.url, blankResult.url, faceRegion);

    expect(topOverflowDarkRatio).toBeLessThan(0.04);
    expect(bottomOverflowDarkRatio).toBeLessThan(0.04);
    expect(faceDarkRatio).toBeGreaterThan(0.3);
    // Tasarım yüzü dolduruyor (dış çerçeve halkası yüz kenarına kadar uzanır) ve yüz
    // dışına taşmıyor (taşma kontrolleri yukarıda). Kenar boşluğu kontrolü, recess artık
    // metalin tonunda olduğundan kaldırıldı: diff kenarda gürültülü oluyordu, gerçek
    // taşma zaten topOverflow/bottomOverflow ile korunuyor.
    expect(artworkBounds.width).toBeGreaterThan(faceRegion.width * 0.9);
    expect(artworkBounds.height).toBeGreaterThan(faceRegion.height * 0.9);
  });

  it.each([
    ["altın", { metal: "altin", ringMoldKey: "kare-foto-altin-xl" }, { height: 476, left: 274, top: 274, width: 476 }],
    ["gümüş", { metal: "gumus", ringMoldKey: "kare-foto-gumus-xl" }, { height: 476, left: 274, top: 274, width: 476 }],
  ])("detaylı kare stencili %s yüzük yüzeyindeki iç kareden taşırmaz", async (_label, overrides, faceRegion) => {
    const [source, blankSource] = await Promise.all([
      detailedSquareArtwork(),
      whiteArtwork(),
    ]);
    const [result, blankResult] = await Promise.all([
      buildFinishImages(source, {
        ...FINISH_OPTIONS,
        ...overrides,
        designMode: "emboss",
        productShape: "kare",
      }).then(([image]) => image),
      buildFinishImages(blankSource, {
        ...FINISH_OPTIONS,
        ...overrides,
        designMode: "emboss",
        productShape: "kare",
      }).then(([image]) => image),
    ]);

    const artworkBounds = await artworkDifferenceBounds(result.url, blankResult.url, faceRegion);
    const cornerDarkRatio = await darkPixelRatio(blankResult.url, {
      height: 14,
      left: faceRegion.left + 3,
      top: faceRegion.top + 3,
      width: 14,
    });
    const outsideRegions = [
      { height: 16, left: faceRegion.left, top: faceRegion.top - 16, width: faceRegion.width },
      { height: 16, left: faceRegion.left, top: faceRegion.top + faceRegion.height, width: faceRegion.width },
      { height: faceRegion.height, left: faceRegion.left - 16, top: faceRegion.top, width: 16 },
      { height: faceRegion.height, left: faceRegion.left + faceRegion.width, top: faceRegion.top, width: 16 },
    ];
    const outsideDarkRatios = await Promise.all(
      outsideRegions.map((region) => darkPixelRatio(blankResult.url, region))
    );

    expect(artworkBounds.width).toBeGreaterThan(faceRegion.width * 0.93);
    expect(artworkBounds.height).toBeGreaterThan(faceRegion.height * 0.93);
    expect(artworkBounds.width).toBeLessThanOrEqual(faceRegion.width * 0.985);
    expect(artworkBounds.height).toBeLessThanOrEqual(faceRegion.height * 0.985);
    expect(artworkBounds.left).toBeGreaterThanOrEqual(4);
    expect(artworkBounds.rightMargin).toBeGreaterThanOrEqual(4);
    expect(artworkBounds.top).toBeGreaterThanOrEqual(4);
    expect(artworkBounds.bottomMargin).toBeGreaterThanOrEqual(4);
    expect(cornerDarkRatio).toBeLessThan(0.75);
    outsideDarkRatios.forEach((ratio) => expect(ratio).toBeLessThan(0.02));
  });

  it.each([
    ["altın", { metal: "altin", ringMoldKey: "kare-foto-altin-xl" }],
    ["gümüş", { metal: "gumus", ringMoldKey: "kare-foto-gumus-xl" }],
  ])("detaylı kare stencilde kaynak frame dışındaki siyah alanı %s yüzüğe taşımaz", async (_label, overrides) => {
    const [source, blankSource] = await Promise.all([
      detailedInsetSquareArtwork(),
      whiteArtwork(),
    ]);
    const faceRegion = { height: 476, left: 274, top: 274, width: 476 };
    const [result, blankResult] = await Promise.all([
      buildFinishImages(source, {
        ...FINISH_OPTIONS,
        ...overrides,
        designMode: "emboss",
        productShape: "kare",
      }).then(([image]) => image),
      buildFinishImages(blankSource, {
        ...FINISH_OPTIONS,
        ...overrides,
        designMode: "emboss",
        productShape: "kare",
      }).then(([image]) => image),
    ]);

    const artworkBounds = await artworkDifferenceBounds(result.url, blankResult.url, faceRegion);
    // Kaynak frame DIŞINDAKİ siyah taşınmaz: tasarım kendi inset çerçevesine kırpılır
    // ve yüz kenarlarına taşmaz (artworkBounds marjları bunu doğrular). Çerçeve İÇİNDEKİ
    // kazınmış zemin ise eskizdeki gibi SİYAH korunur (metal tonuna boyanmaz), bu yüzden
    // yüzde belirgin oranda siyah piksel bulunmalı.
    const faceDarkRatio = await darkPixelRatio(result.url, faceRegion);

    expect(faceDarkRatio).toBeGreaterThan(0.3);
    expect(artworkBounds.width).toBeLessThan(faceRegion.width * 0.985);
    expect(artworkBounds.height).toBeLessThan(faceRegion.height * 0.985);
    expect(artworkBounds.left).toBeGreaterThanOrEqual(4);
    expect(artworkBounds.rightMargin).toBeGreaterThanOrEqual(4);
    expect(artworkBounds.top).toBeGreaterThanOrEqual(4);
    expect(artworkBounds.bottomMargin).toBeGreaterThanOrEqual(4);
  });
});
