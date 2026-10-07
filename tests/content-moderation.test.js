import { describe, expect, it } from "vitest";

import {
  ContentModerationError,
  assertAllContentAllowed,
  assertContentAllowed,
  isContentModerationError,
} from "../src/lib/content-moderation.js";

describe("assertContentAllowed", () => {
  it("boş veya zararsız metinlere izin verir", () => {
    expect(() => assertContentAllowed("")).not.toThrow();
    expect(() => assertContentAllowed("   ")).not.toThrow();
    expect(() => assertContentAllowed(null)).not.toThrow();
    expect(() => assertContentAllowed("Annemin doğum günü için kolye")).not.toThrow();
    expect(() => assertContentAllowed("vintage altın yüzük tasarımı")).not.toThrow();
  });

  it("yasaklı içerik için ContentModerationError fırlatır", () => {
    expect(() => assertContentAllowed("child porn")).toThrow(ContentModerationError);
    expect(() => assertContentAllowed("xxx porno")).toThrow(ContentModerationError);
  });

  it("leetspeak ve aralıklı kaçış denemelerini yakalar", () => {
    expect(() => assertContentAllowed("ch1ld p0rn")).toThrow(ContentModerationError);
    expect(() => assertContentAllowed("c h i l d   p o r n")).toThrow(ContentModerationError);
  });

  it("Türkçe karakterli yasaklı içeriği yakalar", () => {
    expect(() => assertContentAllowed("çocuk pornosu")).toThrow(ContentModerationError);
  });

  it("fırlatılan hata 422 ve content_blocked koduna sahiptir", () => {
    try {
      assertContentAllowed("csam", { field: "sourceTitle" });
      throw new Error("hata bekleniyordu");
    } catch (error) {
      expect(isContentModerationError(error)).toBe(true);
      expect(error.statusCode).toBe(422);
      expect(error.code).toBe("content_blocked");
      expect(error.field).toBe("sourceTitle");
    }
  });
});

describe("assertAllContentAllowed", () => {
  it("listedeki tüm alanları kontrol eder", () => {
    expect(() =>
      assertAllContentAllowed([
        { value: "temiz başlık", field: "title" },
        { value: "child sex", field: "note" },
      ])
    ).toThrow(ContentModerationError);
  });

  it("hepsi temizse hata vermez", () => {
    expect(() =>
      assertAllContentAllowed([
        { value: "kolye", field: "title" },
        { value: "gümüş yüzük", field: "note" },
        { value: "", field: "empty" },
      ])
    ).not.toThrow();
  });
});
