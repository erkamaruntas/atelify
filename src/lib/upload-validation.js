import sharp from "sharp";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_DIMENSION = 8192;
export const ALLOWED_IMAGE_CONTENT_TYPES = Object.freeze([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export class UploadValidationError extends Error {
  constructor(message, code = "invalid_upload", statusCode = 400) {
    super(message);
    this.name = "UploadValidationError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function isUploadValidationError(error) {
  return error instanceof UploadValidationError || error?.name === "UploadValidationError";
}

export function normalizeUploadContentType(value) {
  const contentType = String(value || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  return contentType === "image/jpg" ? "image/jpeg" : contentType;
}

export function validateImageUploadMetadata(meta = {}) {
  const contentType = normalizeUploadContentType(meta.contentType || meta.content_type);
  const size = Number(meta.size ?? meta.contentLength ?? meta.content_length ?? 0);

  if (!ALLOWED_IMAGE_CONTENT_TYPES.includes(contentType)) {
    throw new UploadValidationError(
      "Sadece JPEG, PNG veya WebP görsel yükleyebilirsin.",
      "unsupported_image_type"
    );
  }

  if (!Number.isFinite(size) || size <= 0) {
    throw new UploadValidationError("Görsel boyutu okunamadı.", "invalid_image_size");
  }

  if (size > MAX_UPLOAD_BYTES) {
    throw new UploadValidationError("Görsel en fazla 10MB olabilir.", "image_too_large");
  }

  return { contentType, size };
}

export function detectImageContentType(buffer) {
  const bytes = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer || []);

  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }

  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  return "";
}

export function parseImageDataUrl(dataUrl) {
  const match = String(dataUrl || "").match(/^data:([^;,]+)(;base64)?,(.*)$/s);
  if (!match) {
    throw new UploadValidationError("Görsel data URI formatı geçersiz.", "invalid_data_url");
  }

  const contentType = normalizeUploadContentType(match[1]);
  const buffer = match[2]
    ? Buffer.from(match[3], "base64")
    : Buffer.from(decodeURIComponent(match[3]), "utf8");

  return { buffer, contentType };
}

export async function validateImageUpload(input = {}) {
  const buffer = Buffer.isBuffer(input.buffer) ? input.buffer : Buffer.from(input.buffer || []);
  const contentType = normalizeUploadContentType(input.contentType || input.content_type);
  const source = String(input.source || "Görsel").trim() || "Görsel";

  validateImageUploadMetadata({
    contentType,
    size: input.size ?? buffer.byteLength,
  });

  if (!buffer.length) {
    throw new UploadValidationError(`${source} boş görünüyor.`, "empty_image");
  }

  if (buffer.byteLength > MAX_UPLOAD_BYTES) {
    throw new UploadValidationError("Görsel en fazla 10MB olabilir.", "image_too_large");
  }

  const detectedContentType = detectImageContentType(buffer);
  if (!detectedContentType) {
    throw new UploadValidationError(
      "Görsel dosya imzası JPEG, PNG veya WebP ile eşleşmiyor.",
      "invalid_image_signature"
    );
  }

  if (detectedContentType !== contentType) {
    throw new UploadValidationError(
      "Görsel içerik tipi dosya içeriğiyle eşleşmiyor.",
      "image_type_mismatch"
    );
  }

  let metadata;
  try {
    metadata = await sharp(buffer, { failOn: "none" }).metadata();
  } catch {
    throw new UploadValidationError(`${source} okunamadı.`, "unreadable_image");
  }

  const width = Number(metadata?.width || 0);
  const height = Number(metadata?.height || 0);
  if (!width || !height) {
    throw new UploadValidationError(`${source} boyutları okunamadı.`, "missing_image_dimensions");
  }

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    throw new UploadValidationError(
      `Görsel boyutu en fazla ${MAX_IMAGE_DIMENSION}x${MAX_IMAGE_DIMENSION} olabilir.`,
      "image_dimensions_too_large"
    );
  }

  return {
    buffer,
    contentType: detectedContentType,
    format: metadata.format || "",
    height,
    size: buffer.byteLength,
    width,
  };
}

export async function validateImageDataUrl(dataUrl, options = {}) {
  const parsed = parseImageDataUrl(dataUrl);
  return validateImageUpload({
    ...parsed,
    source: options.source,
  });
}
