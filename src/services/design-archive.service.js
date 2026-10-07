import { recordGeneratedDesigns } from "../repositories/designs.repo.js";

// Tamamlanan bir üretim işinin görsellerini kalıcı tasarım arşivine yazar.
// Hem anlık teslim (/api/generation/status) hem de sayfa yenilendikten sonraki
// kurtarma yolu aynı eşlemeyi kullanır; böylece hangi yoldan teslim edilirse
// edilsin her görsel Tasarımlarım'a düşer. Best-effort: hata fırlatmaz.
export async function archiveGenerationJobImages({ userId, stage, clientJobId, metadata, images }) {
  const meta = metadata || {};
  const finishInfo = meta.finishInfo || {};
  return recordGeneratedDesigns({
    userId,
    stage,
    projectId: meta.projectId,
    projectTitle: meta.projectTitle || "",
    title: meta.sourceTitle || finishInfo.title || meta.projectTitle || "",
    product: meta.product || finishInfo.productValue || finishInfo.product || "yuzuk",
    productShape: meta.productShape || finishInfo.productShapeValue || finishInfo.shapeValue || "yuvarlak",
    designMode: meta.designMode || finishInfo.designModeValue || "engrave",
    clientJobId,
    options: {
      metal: meta.metal || finishInfo.metalValue || "",
      surface: meta.surface || finishInfo.surfaceValue || "",
      scene: meta.scene?.value || meta.scene || "",
      channel: meta.channel?.value || meta.channel || "",
      visualStyle: meta.visualStyle?.value || meta.visualStyle || "",
    },
    metadata: {},
    images,
  });
}
