import { fal } from "@fal-ai/client";

export const FAL_IMAGE_ENDPOINT = "fal-ai/nano-banana-pro/edit";

let configuredKey = "";

export function configureFal(falKey) {
  const key = String(falKey || "").trim();
  if (!key) throw new Error("Görsel üretim servisi yapılandırılmamış.");
  if (configuredKey === key) return;
  fal.config({ credentials: key });
  configuredKey = key;
}

// fal.ai bakiyesi bittiğinde (403 "Exhausted balance") ya da anahtar geçersiz/kilitli
// olduğunda üretim kullanıcı tarafında düzeltilemez; bu hataları ayırt etmek için.
const FAL_UNAVAILABLE_STATUSES = new Set([401, 402, 403]);
const FAL_UNAVAILABLE_PATTERN = /exhausted balance|insufficient (balance|credit)|user is locked|top up your balance|billing|invalid (api )?key|unauthorized/i;

export function isFalUnavailableError(error) {
  if (!error) return false;
  if (FAL_UNAVAILABLE_STATUSES.has(Number(error.status))) return true;
  const detail = typeof error.body?.detail === "string" ? error.body.detail : "";
  return FAL_UNAVAILABLE_PATTERN.test(`${error.message || ""} ${detail}`);
}

export { fal };
