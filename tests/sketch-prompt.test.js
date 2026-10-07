import { describe, expect, it } from "vitest";

import {
  buildSketchPrompt,
  isDetailedSketch,
  normalizeDesignOptions,
  resolveSketchAspectRatio,
} from "../src/providers/fal/prompts/sketch.js";

describe("sketch prompt", () => {
  it("minimalist kare, oval, yuvarlak ve dikdörtgende şekilden bağımsız aynı çerçevesiz 1:1 prompt'u kullanır", () => {
    const roundPrompt = buildSketchPrompt(normalizeDesignOptions({
      designMode: "engrave",
      product: "yuzuk",
      productShape: "yuvarlak",
    }));
    const squarePrompt = buildSketchPrompt(normalizeDesignOptions({
      designMode: "engrave",
      product: "yuzuk",
      productShape: "kare",
    }));
    const ovalPrompt = buildSketchPrompt(normalizeDesignOptions({
      designMode: "engrave",
      product: "yuzuk",
      productShape: "oval",
    }));
    const pendantOvalPrompt = buildSketchPrompt(normalizeDesignOptions({
      designMode: "engrave",
      product: "kolye",
      productShape: "oval",
    }));
    const rectanglePrompt = buildSketchPrompt(normalizeDesignOptions({
      designMode: "engrave",
      product: "kolye",
      productShape: "dikdortgen",
    }));

    // Eskiz artık şekilden tamamen bağımsız (her zaman 1:1): tüm şekiller birebir
    // aynı çerçevesiz prompt'u üretir; şekil/çerçeve 2. aşamada eklenir.
    expect(roundPrompt).toContain("on a 1:1 canvas");
    expect(roundPrompt).toBe(squarePrompt);
    expect(roundPrompt).toBe(ovalPrompt);
    expect(roundPrompt).toBe(pendantOvalPrompt);
    expect(roundPrompt).toBe(rectanglePrompt);
    expect(roundPrompt).toContain("FRAME-FREE OUTPUT");
    expect(roundPrompt).toContain("The selected product shape is handled after generation");
    expect(roundPrompt).toContain("Do NOT draw any oval, circle, square, rectangle");
    expect(roundPrompt).toContain("our system adds the required frame later");
    expect(roundPrompt).not.toContain("MINIMALIST FIT FRAME");
    expect(roundPrompt).not.toContain("NO OVAL FRAME");
    expect(roundPrompt).not.toContain("NO ROUND FRAME");
    expect(roundPrompt).not.toContain("NO SQUARE FRAME");
    expect(roundPrompt).not.toContain("NO RECTANGLE FRAME");
    expect(roundPrompt).not.toContain("wide rectangular");
    expect(roundPrompt).not.toContain("horizontal rectangle");
    expect(roundPrompt).not.toContain("0.82 : 1");
    expect(roundPrompt).not.toContain("0.75 : 1");
    expect(roundPrompt).not.toContain("selected Yuvarlak");
    expect(roundPrompt).not.toContain("selected Kare");
    expect(roundPrompt).not.toContain("selected Oval");
    expect(roundPrompt).not.toContain("selected Dikdörtgen");
    expect(roundPrompt).not.toContain("use that visible border as the fit frame");
  });

  it("sketch API oranı şekilden bağımsız her zaman 1:1'dir", () => {
    expect(resolveSketchAspectRatio({ product: "kolye", productShape: "dikdortgen" })).toBe("1:1");
    expect(resolveSketchAspectRatio({ product: "kolye", productShape: "oval" })).toBe("1:1");
    expect(resolveSketchAspectRatio({ product: "yuzuk", productShape: "oval" })).toBe("1:1");
    expect(resolveSketchAspectRatio({ product: "yuzuk", productShape: "yuvarlak" })).toBe("1:1");
    expect(resolveSketchAspectRatio({ product: "kolye", productShape: "yuvarlak" })).toBe("1:1");
    expect(resolveSketchAspectRatio({ product: "kolye", productShape: "kare" })).toBe("1:1");
    expect(resolveSketchAspectRatio()).toBe("1:1");
  });

  it("detaylı modda ortak siyah plaka referanslı ve çerçevesiz çıktı ister", () => {
    const prompt = buildSketchPrompt(normalizeDesignOptions({
      designMode: "emboss",
      product: "yuzuk",
      productShape: "kare",
    }));

    expect(prompt).toContain("DETAYLI STAGE 1 TASK");
    expect(prompt).toContain("ONLY IMAGE 1 EXISTS");
    expect(prompt).toContain("single and only source");
    expect(prompt).toContain("Do not use, imagine, borrow, or introduce any other reference image");
    expect(prompt).toContain("SOURCE GEOMETRY LOCK");
    expect(prompt).toContain("Do NOT rotate, straighten");
    expect(prompt).toContain("front-facing studio portrait");
    expect(prompt).toContain("ABSOLUTE COLOR RULE");
    expect(prompt).toContain("whole output canvas background must be pure solid black");
    expect(prompt).toContain("Draw the subject using only pure white shapes");
    expect(prompt).toContain("do NOT make the face a black void");
    expect(prompt).toContain("No surrounding shape");
    expect(prompt).toContain("We will add the correct frame later");
    expect(prompt).toContain("No yellow, no gold, no cream");
    expect(prompt).toContain("If the face is three-quarter view, keep it three-quarter view");
    expect(prompt).toContain("no warm-white");
    expect(prompt).not.toContain("IMAGE 2");
    expect(prompt).not.toContain("STYLE REFERENCE");
    expect(prompt).not.toContain("pale silver/gold");
    expect(prompt).not.toContain("SQUARE DETAILED OUTPUT");
    expect(prompt).not.toContain("MINIMALIST FIT FRAME");
  });

  it("detaylı mod tüm ürün ve şekillerde şekilden bağımsız aynı 1:1 prompt'u kullanır", () => {
    const ringOval = normalizeDesignOptions({
      designMode: "emboss",
      product: "yuzuk",
      productShape: "oval",
    });
    const pendantOval = normalizeDesignOptions({
      designMode: "emboss",
      product: "kolye",
      productShape: "oval",
    });
    const ringSquare = normalizeDesignOptions({
      designMode: "emboss",
      product: "yuzuk",
      productShape: "kare",
    });

    expect(isDetailedSketch(ringOval)).toBe(true);
    expect(isDetailedSketch(pendantOval)).toBe(true);
    expect(buildSketchPrompt(ringOval)).toContain("flat 1:1 artwork asset");
    expect(buildSketchPrompt(pendantOval)).toContain("flat 1:1 artwork asset");
    expect(buildSketchPrompt(ringSquare)).toContain("flat 1:1 artwork asset");
    expect(buildSketchPrompt(ringOval)).toBe(buildSketchPrompt(pendantOval));
    expect(buildSketchPrompt(ringOval)).toBe(buildSketchPrompt(ringSquare));
  });
});
