import { describe, expect, it } from "vitest";

import { buildMockupPrompt } from "../src/providers/fal/prompts/mockup.js";

const BASE_OPTIONS = {
  channel: "etsy",
  designMode: "engrave",
  metal: "gumus",
  productShape: "kare",
  ratioLabel: "1:1",
  sourceTitle: "",
  surface: "parlak",
  visualStyle: "minimal",
};

describe("mockup prompt", () => {
  it("manken yüzük görselinde yüzüğün parmağa ters takılmasını engeller", () => {
    const prompt = buildMockupPrompt({
      ...BASE_OPTIONS,
      product: "yuzuk",
      scene: "manken",
    });

    expect(prompt).toContain("RING WEARING ORIENTATION (CRITICAL — FACE MUST READ UPRIGHT, NEVER UPSIDE DOWN)");
    expect(prompt).toContain("must appear RIGHT-WAY-UP from the camera's / viewer's point of view");
    expect(prompt).toContain("worn in the normal forward direction on the finger (never backwards)");
    expect(prompt).toContain("the TOP edge of the uploaded face artwork points toward the fingertip and fingernail");
    expect(prompt).toContain("BOTTOM edge points toward the knuckle, wrist and palm");
    expect(prompt).toContain("Do NOT rotate the whole ring 180 degrees around the finger axis");
    expect(prompt).toContain("do NOT make it look like the model put the ring on backwards");
    expect(prompt).toContain("show the face artwork upside down");
  });

  it("yüzük takılış yönü kuralını sadece manken yüzük sahnesine ekler", () => {
    const ringPackshotPrompt = buildMockupPrompt({
      ...BASE_OPTIONS,
      product: "yuzuk",
      scene: "mockup",
    });
    const pendantModelPrompt = buildMockupPrompt({
      ...BASE_OPTIONS,
      product: "kolye",
      scene: "manken",
    });

    expect(ringPackshotPrompt).not.toContain("RING WEARING ORIENTATION");
    expect(pendantModelPrompt).not.toContain("RING WEARING ORIENTATION");
  });

  it("sağ/sol yan baskı çekimi prompt'una geri düşmez", () => {
    const prompt = buildMockupPrompt({
      ...BASE_OPTIONS,
      product: "yuzuk",
      scene: "manken",
      sidePrint: true,
      sidePrintSide: "left",
    });

    expect(prompt).not.toContain("TWO REFERENCE IMAGES");
    expect(prompt).not.toContain("SIDE THREE-QUARTER SHOT");
    expect(prompt).not.toContain("IMAGE 2 is the");
    expect(prompt).toContain("SIDE-SHOULDER ENGRAVINGS (CRITICAL — LEFT vs RIGHT MUST NOT BE CONFUSED)");
    expect(prompt).toContain("The 2nd image is the LEFT-shoulder engraving");
    expect(prompt).toContain("The 3rd image is the RIGHT-shoulder engraving");
    expect(prompt).toContain("it is a hard error to put the same engraving on both shoulders");
    expect(prompt).toContain("must NOT become a one-sided or blank-shouldered ring");
    expect(prompt).toContain("Do NOT leave a shoulder blank");
  });
});
