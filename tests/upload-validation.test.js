import sharp from "sharp";
import { describe, expect, it } from "vitest";

import {
  MAX_UPLOAD_BYTES,
  detectImageContentType,
  parseImageDataUrl,
  validateImageDataUrl,
  validateImageUpload,
  validateImageUploadMetadata,
} from "../src/lib/upload-validation.js";

async function pngBuffer(width = 1, height = 1) {
  return sharp({
    create: {
      background: "#ffffff",
      channels: 3,
      height,
      width,
    },
  })
    .png()
    .toBuffer();
}

describe("upload validation", () => {
  it("PNG upload'u magic byte ve sharp metadata ile doğrular", async () => {
    const buffer = await pngBuffer(2, 3);

    const result = await validateImageUpload({
      buffer,
      contentType: "image/png",
      source: "Referans görsel",
    });

    expect(result.contentType).toBe("image/png");
    expect(result.width).toBe(2);
    expect(result.height).toBe(3);
    expect(result.size).toBe(buffer.byteLength);
  });

  it("content-type ile magic byte uyuşmazsa reddeder", async () => {
    const buffer = await pngBuffer();

    await expect(
      validateImageUpload({ buffer, contentType: "image/jpeg" })
    ).rejects.toMatchObject({ code: "image_type_mismatch" });
  });

  it("izinli olmayan content-type metadata aşamasında reddedilir", () => {
    expect(() => validateImageUploadMetadata({ contentType: "image/gif", size: 100 })).toThrow(
      /JPEG, PNG veya WebP/
    );
  });

  it("10MB üstü metadata'yı reddeder", () => {
    expect(() =>
      validateImageUploadMetadata({ contentType: "image/png", size: MAX_UPLOAD_BYTES + 1 })
    ).toThrow(/10MB/);
  });

  it("data URL'i parse edip doğrular", async () => {
    const buffer = await pngBuffer();
    const dataUrl = `data:image/png;base64,${buffer.toString("base64")}`;

    expect(parseImageDataUrl(dataUrl).contentType).toBe("image/png");
    await expect(validateImageDataUrl(dataUrl)).resolves.toMatchObject({
      contentType: "image/png",
      width: 1,
      height: 1,
    });
  });

  it("8192 piksel üstü genişliği reddeder", async () => {
    const buffer = await pngBuffer(8193, 1);

    await expect(validateImageUpload({ buffer, contentType: "image/png" })).rejects.toMatchObject({
      code: "image_dimensions_too_large",
    });
  });

  it("magic byte content-type tespit eder", async () => {
    const buffer = await pngBuffer();

    expect(detectImageContentType(buffer)).toBe("image/png");
    expect(detectImageContentType(Buffer.from("not an image"))).toBe("");
  });
});
