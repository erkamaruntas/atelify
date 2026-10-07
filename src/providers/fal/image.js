import { fal, FAL_IMAGE_ENDPOINT } from "./client.js";

export async function submitImageGeneration(input) {
  const queued = await fal.queue.submit(FAL_IMAGE_ENDPOINT, { input });
  const requestId = queued?.request_id || queued?.requestId || "";
  if (!requestId) {
    throw new Error("Görsel üretim isteği başlatılamadı.");
  }
  return requestId;
}

export async function fetchImageStatus(requestId) {
  const status = await fal.queue.status(FAL_IMAGE_ENDPOINT, { requestId, logs: false });
  return normalizeFalQueueStatus(status?.status);
}

export async function fetchImageResult(requestId) {
  return fal.queue.result(FAL_IMAGE_ENDPOINT, { requestId });
}

export async function uploadDataUrlToFal(dataUrl, fileName = "ff-reference") {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Görsel data URI formatı geçersiz.");
  }
  const [, mimeType, base64Source] = match;
  const extension = mimeType.split("/")[1] || "jpg";
  const buffer = Buffer.from(base64Source, "base64");
  const file = new File([buffer], `${fileName}.${extension}`, { type: mimeType });
  return fal.storage.upload(file);
}

export function normalizeFalQueueStatus(status) {
  const normalized = String(status || "").trim().toUpperCase();
  if (normalized === "COMPLETED") return "completed";
  if (normalized === "FAILED") return "failed";
  if (normalized === "CANCELLED" || normalized === "CANCELED") return "cancelled";
  if (normalized === "IN_PROGRESS") return "running";
  return "queued";
}

export function normalizeFalImages(result, stage, count) {
  const images = Array.isArray(result?.data?.images) ? result.data.images : [];
  const labelPrefix = {
    finish: "Ürün Görseli",
    mockup: "Mockup",
    manken: "Manken",
    sketch: "Tasarım",
  }[stage] || "Görsel";

  return images.slice(0, count).map((image, index) => ({
    contentType: image.content_type || "image/png",
    height: image.height || null,
    label: `${labelPrefix} ${String(index + 1).padStart(2, "0")}`,
    url: image.url,
    width: image.width || null,
  }));
}
