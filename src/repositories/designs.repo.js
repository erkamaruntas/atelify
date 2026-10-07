// Kalıcı tasarım arşivi veri katmanı (ff_designs + ff_design_assets).
// Eski 80-sınırlı JSONB blob (ff_user_studio_state.saved_designs) yerine, her
// üretilen görseli kalıcı bir satır olarak tutar; Tasarımlarım'ı tarih bazlı
// (son N gün) listeler ve eski kayıtları (görsel dosyalarıyla) temizler.
//
// Tasarım: her ÜRETİLEN GÖRSEL = bir ff_designs satırı + bir ff_design_assets
// (output) — Tasarımlarım'da her görsel ayrı seçilebilir bir tasarım olduğu için.
//
// Bu katman BEST-EFFORT'tur: Supabase yapılandırılmamışsa ya da yazma hata verirse
// sessizce no-op yapar; üretim akışını asla bozmaz.
import { getSupabaseAdminClient } from "./credits.repo.js";
import { createLogger } from "../lib/logger.js";

const log = createLogger("designs-repo");

const DESIGNS_TABLE = "ff_designs";
const DESIGN_ASSETS_TABLE = "ff_design_assets";
const DEFAULT_RETENTION_DAYS = 30;
const DEFAULT_LIST_LIMIT = 500;

const ALLOWED_STAGES = new Set(["sketch", "finish", "mockup", "manken"]);
const ALLOWED_PRODUCTS = new Set(["yuzuk", "kolye"]);
const ALLOWED_SHAPES = new Set(["dikdortgen", "kare", "oval", "yuvarlak"]);
const ALLOWED_MODES = new Set(["engrave", "emboss"]);

function adminClientOrNull() {
  try {
    return getSupabaseAdminClient();
  } catch (error) {
    log.warn("designs archive disabled (supabase not configured)", { error: error?.message });
    return null;
  }
}

function plainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeUuidOrNull(value) {
  const id = String(value || "").trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ? id : null;
}

function normalizeEnum(value, allowed, fallback) {
  const normalized = String(value || "").trim().toLowerCase();
  return allowed.has(normalized) ? normalized : fallback;
}

// Bir üretim turunun (tek aşama, N görsel) kalıcı kaydını yazar.
// images: persistGeneratedImages çıktısı ({ url, storageBucket, storagePath, contentType, width?, height? }).
// Her görsel için bir design + bir asset satırı eklenir. Best-effort: hata fırlatmaz.
export async function recordGeneratedDesigns(input = {}) {
  const userId = normalizeUuidOrNull(input.userId);
  const images = Array.isArray(input.images) ? input.images : [];
  if (!userId || !images.length) return [];

  const supabase = adminClientOrNull();
  if (!supabase) return [];

  const stage = normalizeEnum(input.stage, ALLOWED_STAGES, "sketch");
  const product = normalizeEnum(input.product, ALLOWED_PRODUCTS, "yuzuk");
  const productShape = normalizeEnum(input.productShape, ALLOWED_SHAPES, "yuvarlak");
  const designMode = normalizeEnum(input.designMode, ALLOWED_MODES, "engrave");
  const projectId = normalizeUuidOrNull(input.projectId);
  const clientJobId = String(input.clientJobId || "").trim().slice(0, 160) || null;
  const title = String(input.title || "").trim().slice(0, 200);
  const options = plainObject(input.options);
  // Proje kimliği (ff-project-…) UUID olmadığından project_id sütununa yazılamıyor;
  // tasarımın üretildiği projeyi gösterebilmek için kimlik+adı metadata içine taşı.
  const rawProjectId = String(input.projectId || "").trim().slice(0, 160);
  const projectTitle = String(input.projectTitle || "").trim().slice(0, 200);
  const metadata = {
    ...plainObject(input.metadata),
    ...(rawProjectId ? { projectId: rawProjectId } : {}),
    ...(projectTitle ? { projectTitle } : {}),
  };

  try {
    // Aynı üretim işi hem anlık teslim hem kurtarma yolundan tamamlanabilir;
    // iş daha önce arşivlendiyse tekrar yazma.
    if (clientJobId) {
      const { data: existing, error: existingError } = await supabase
        .from(DESIGNS_TABLE)
        .select("id")
        .eq("user_id", userId)
        .eq("client_job_id", clientJobId)
        .limit(1);
      if (existingError) throw existingError;
      if (Array.isArray(existing) && existing.length) return [];
    }

    const designRows = images
      .map((image) => (image?.storagePath && (image.storageBucket || image.bucket) ? image : null))
      .filter(Boolean)
      .map(() => ({
        user_id: userId,
        project_id: projectId,
        title,
        product,
        product_shape: productShape,
        design_mode: designMode,
        stage,
        client_job_id: clientJobId,
        options,
        metadata,
      }));
    if (!designRows.length) return [];

    const { data: designs, error: designError } = await supabase
      .from(DESIGNS_TABLE)
      .insert(designRows)
      .select("id");
    if (designError) throw designError;

    const insertedDesigns = Array.isArray(designs) ? designs : [];
    const usableImages = images.filter(
      (image) => image?.storagePath && (image.storageBucket || image.bucket)
    );

    const assetRows = insertedDesigns
      .map((design, index) => {
        const image = usableImages[index];
        if (!design?.id || !image) return null;
        return {
          design_id: design.id,
          user_id: userId,
          kind: "output",
          storage_bucket: image.storageBucket || image.bucket,
          storage_path: image.storagePath,
          public_url: image.url || image.storageUrl || "",
          content_type: image.contentType || image.content_type || "image/png",
          width: Number.isFinite(Number(image.width)) ? Number(image.width) : null,
          height: Number.isFinite(Number(image.height)) ? Number(image.height) : null,
          position: index,
          metadata: {},
        };
      })
      .filter(Boolean);

    if (assetRows.length) {
      const { error: assetError } = await supabase.from(DESIGN_ASSETS_TABLE).insert(assetRows);
      if (assetError) throw assetError;
    }

    return insertedDesigns.map((design) => design.id);
  } catch (error) {
    log.error("recordGeneratedDesigns failed", { error: error?.message || error, stage });
    return [];
  }
}

// Kullanıcının son N gün içinde ürettiği tasarımları (görselleriyle) döndürür.
export async function listRecentDesigns({ userId, sinceDays = DEFAULT_RETENTION_DAYS, limit = DEFAULT_LIST_LIMIT } = {}) {
  const safeUserId = normalizeUuidOrNull(userId);
  if (!safeUserId) return [];

  const supabase = adminClientOrNull();
  if (!supabase) return [];

  const days = Number.isFinite(Number(sinceDays)) && Number(sinceDays) > 0 ? Number(sinceDays) : DEFAULT_RETENTION_DAYS;
  const safeLimit = Math.min(Math.max(1, Number.parseInt(limit, 10) || DEFAULT_LIST_LIMIT), 2000);
  const cutoffIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  try {
    const { data, error } = await supabase
      .from(DESIGNS_TABLE)
      .select(
        `id, project_id, title, product, product_shape, design_mode, stage, client_job_id, options, metadata, created_at,
         assets:${DESIGN_ASSETS_TABLE} ( public_url, storage_bucket, storage_path, content_type, width, height, position, kind )`
      )
      .eq("user_id", safeUserId)
      .is("archived_at", null)
      .gte("created_at", cutoffIso)
      .order("created_at", { ascending: false })
      .limit(safeLimit);
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    log.error("listRecentDesigns failed", { error: error?.message || error });
    return [];
  }
}

// N günden eski tasarımları (ve görsel dosyalarını) siler. Cron/temizlik içindir.
// Önce Storage nesnelerini siler, sonra satırları (asset'ler cascade ile gider).
export async function deleteDesignsOlderThan({ days = DEFAULT_RETENTION_DAYS } = {}) {
  const supabase = adminClientOrNull();
  if (!supabase) return { deletedDesigns: 0, deletedAssets: 0 };

  const retentionDays = Number.isFinite(Number(days)) && Number(days) > 0 ? Number(days) : DEFAULT_RETENTION_DAYS;
  const cutoffIso = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();

  try {
    const { data: oldDesigns, error: selectError } = await supabase
      .from(DESIGNS_TABLE)
      .select(`id, assets:${DESIGN_ASSETS_TABLE} ( storage_bucket, storage_path )`)
      .lt("created_at", cutoffIso)
      .limit(2000);
    if (selectError) throw selectError;

    const designs = Array.isArray(oldDesigns) ? oldDesigns : [];
    if (!designs.length) return { deletedDesigns: 0, deletedAssets: 0 };

    // Storage nesnelerini bucket'a göre grupla ve sil.
    const pathsByBucket = new Map();
    let assetCount = 0;
    for (const design of designs) {
      for (const asset of design.assets || []) {
        const bucket = String(asset.storage_bucket || "").trim();
        const path = String(asset.storage_path || "").trim();
        if (!bucket || !path) continue;
        if (!pathsByBucket.has(bucket)) pathsByBucket.set(bucket, []);
        pathsByBucket.get(bucket).push(path);
        assetCount += 1;
      }
    }
    for (const [bucket, paths] of pathsByBucket) {
      const { error: removeError } = await supabase.storage.from(bucket).remove(paths);
      if (removeError) log.warn("storage cleanup partial failure", { bucket, error: removeError?.message });
    }

    const ids = designs.map((design) => design.id).filter(Boolean);
    const { error: deleteError } = await supabase.from(DESIGNS_TABLE).delete().in("id", ids);
    if (deleteError) throw deleteError;

    return { deletedDesigns: ids.length, deletedAssets: assetCount };
  } catch (error) {
    log.error("deleteDesignsOlderThan failed", { error: error?.message || error });
    return { deletedDesigns: 0, deletedAssets: 0 };
  }
}
