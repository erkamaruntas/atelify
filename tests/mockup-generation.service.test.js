import { describe, expect, it } from "vitest";

import { normalizeMockupOptions } from "../src/services/generation.service.js";

describe("mockup generation options", () => {
  it("3. ve 4. aşamada eski sağ/sol yan baskı seçimini yok sayar", () => {
    const options = normalizeMockupOptions({
      product: "yuzuk",
      scene: "manken",
      sidePrint: true,
      sidePrintSide: "left",
    });

    expect(options).not.toHaveProperty("sidePrintSide");
    expect(options.sidePrint).toBe(true);
    expect(options.product).toBe("yuzuk");
    expect(options.scene).toBe("manken");
  });
});
