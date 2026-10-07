import { randomUUID } from "node:crypto";
import { getSupabaseAdminClient } from "../repositories/credits.repo.js";
import { loadConfig } from "../config/env.js";
import { validateImageUploadMetadata } from "../lib/upload-validation.js";
import { createLogger } from "../lib/logger.js";

const log = createLogger("storage");

const MAX_PERSISTED_IMAGE_BYTES = 32 * 1024 * 1024;

function storageBucketName() {
  return loadConfig().storageBucket;
}

function sanitizePathSegment(value, fallback = "asset") {
  const segment = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.:-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return segment ? segment.slice(0, 180) : fallback;
}

function normalizeContentType(value, fallback = "image/png") {
  const contentType = String(value || "").trim().toLowerCase();
  return contentType.startsWith("image/") ? contentType : fallback;
}

function extensionForContentType(contentType) {
  const normalized = normalizeContentType(contentType);
  if (normalized.includes("jpeg") || normalized.includes("jpg")) return "jpg";
  if (normalized.includes("webp")) return "webp";
  if (normalized.includes("gif")) return "gif";
  if (normalized.includes("svg")) return "svg";
  return "png";
}

function storagePathFor({ clientJobId, contentType, index, stage, userId }) {
  const safeUserId = sanitizePathSegment(userId, "anonymous");
  const safeStage = sanitizePathSegment(stage, "generated");
  const safeJobId = sanitizePathSegment(clientJobId, randomUUID());
  const imageNumber = String(index + 1).padStart(2, "0");
  return `${safeUserId}/${safeStage}/${safeJobId}/${imageNumber}.${extensionForContentType(contentType)}`;
}

function referenceUploadPathFor({ contentType, userId }) {
  const safeUserId = sanitizePathSegment(userId, "anonymous");
  return `${safeUserId}/references/${randomUUID()}.${extensionForContentType(contentType)}`;
}

function parseDataUrl(dataUrl) {
  const match = String(dataUrl || "").match(/^data:(image\/[a-zA-Z0-9.+-]+)(;base64)?,(.*)$/s);
  if (!match) throw new Error("Görsel data URI formatı geçersiz.");
  const contentType = normalizeContentType(match[1]);
  const buffer = match[2]
    ? Buffer.from(match[3], "base64")
    : Buffer.from(decodeURIComponent(match[3]), "utf8");
  return { buffer, contentType };
}

async function fetchImageAsset(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Üretilen görsel storage için indirilemedi.");

  const contentType = normalizeContentType(response.headers.get("content-type") || "");
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > MAX_PERSISTED_IMAGE_BYTES) {
    throw new Error("Üretilen görsel storage limiti için çok büyük.");
  }

  const arrayBuffer = await response.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_PERSISTED_IMAGE_BYTES) {
    throw new Error("Üretilen görsel storage limiti için çok büyük.");
  }

  return {
    buffer: Buffer.from(arrayBuffer),
    contentType,
  };
}

async function imageAssetFromGeneratedImage(image) {
  if (image?.buffer) {
    return {
      buffer: Buffer.isBuffer(image.buffer) ? image.buffer : Buffer.from(image.buffer),
      contentType: normalizeContentType(image.contentType || image.content_type),
    };
  }

  const url = String(image?.url || image?.imageUrl || "").trim();
  if (url.startsWith("data:image/")) return parseDataUrl(url);
  if (/^https?:\/\//i.test(url)) return fetchImageAsset(url);

  throw new Error("Storage'a alınacak görsel URL'i geçersiz.");
}

function storageMetadata({ bucket, contentType, path, publicUrl }) {
  return {
    bucket,
    contentType,
    path,
    provider: "supabase",
    publicUrl,
  };
}

export async function persistGeneratedImages(images, context = {}) {
  const sourceImages = Array.isArray(images) ? images : [];
  if (!sourceImages.length) return [];
  if (sourceImages.every((image) => image?.storagePath && image?.storageBucket && image?.url)) {
    return sourceImages;
  }

  const bucket = storageBucketName();
  if (!bucket) throw new Error("Kalıcı görsel storage bucket adı eksik.");

  let supabase;
  try {
    supabase = getSupabaseAdminClient();
  } catch (error) {
    log.error("storage admin client unavailable", { error, kind: "storage_config" });
    throw new Error("Görsel depolama şu an kullanılamıyor.");
  }

  const storedImages = [];
  for (let index = 0; index < sourceImages.length; index += 1) {
    const image = sourceImages[index] || {};
    if (image.storagePath && image.storageBucket && image.url) {
      storedImages.push(image);
      continue;
    }

    const asset = await imageAssetFromGeneratedImage(image);
    const contentType = normalizeContentType(image.contentType || image.content_type || asset.contentType);
    const path = storagePathFor({
      clientJobId: context.clientJobId,
      contentType,
      index,
      stage: context.stage,
      userId: context.userId,
    });

    const { error } = await supabase.storage.from(bucket).upload(path, asset.buffer, {
      cacheControl: "31536000",
      contentType,
      upsert: true,
    });
    if (error) {
      log.error("generated image upload failed", { error, kind: "storage_upload" });
      throw new Error("Üretilen görsel kaydedilemedi.");
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = data?.publicUrl || "";
    if (!publicUrl) {
      throw new Error("Üretilen görselin adresi alınamadı.");
    }

    const metadata = storageMetadata({ bucket, contentType, path, publicUrl });
    storedImages.push({
      ...image,
      contentType,
      storage: metadata,
      storageBucket: bucket,
      storagePath: path,
      storageProvider: "supabase",
      storageUrl: publicUrl,
      url: publicUrl,
    });
  }

  return storedImages;
}

export async function createSignedUploadUrl(userId, meta = {}) {
  const safeUserId = String(userId || "").trim();
  if (!safeUserId) {
    const error = new Error("Oturum doğrulanamadı.");
    error.statusCode = 401;
    throw error;
  }

  const { contentType, size } = validateImageUploadMetadata(meta);
  const bucket = storageBucketName();
  if (!bucket) throw new Error("Kalıcı görsel storage bucket adı eksik.");

  let supabase;
  try {
    supabase = getSupabaseAdminClient();
  } catch (error) {
    log.error("storage admin client unavailable", { error, kind: "storage_config" });
    throw new Error("Görsel depolama şu an kullanılamıyor.");
  }

  const path = referenceUploadPathFor({ contentType, userId: safeUserId });
  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
  if (error) {
    log.error("signed upload url failed", { error, kind: "storage_signed_url" });
    throw new Error("Görsel yükleme bağlantısı oluşturulamadı.");
  }

  const signedUrl = data?.signedUrl || data?.signedURL || "";
  if (!signedUrl) {
    throw new Error("Görsel yükleme bağlantısı oluşturulamadı.");
  }

  return {
    bucket,
    contentType,
    path: data?.path || path,
    signedUrl,
    size,
    token: data?.token || "",
  };
}
