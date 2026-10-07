import { patchGenerationJob } from "../repositories/generation-jobs.repo.js";
import { refundUserCredits } from "../repositories/credits.repo.js";

function refundedMetadata(metadata) {
  return metadata && typeof metadata === "object" && metadata.creditRefunded === true;
}

function refundLabelForStatus(status) {
  return status === "cancelled" ? "İptal edilen üretim iadesi" : "Başarısız üretim iadesi";
}

export async function refundFailedGenerationCredits(job, options = {}) {
  if (!job || typeof job !== "object") return { job: null, refund: null };

  const amount = Number.parseInt(job.creditCost, 10);
  const clientJobId = String(job.clientJobId || "").trim();
  const stage = String(job.stage || "").trim();
  const status = options.status === "cancelled" ? "cancelled" : "failed";
  const error = String(options.error || job.error || "Görsel oluşturma tamamlanamadı.").trim();

  if (!clientJobId || !stage || !job.userId || !Number.isFinite(amount) || amount <= 0) {
    return { job, refund: null };
  }

  if (refundedMetadata(job.metadata)) {
    return { job, refund: null };
  }

  const refund = await refundUserCredits({
    amount,
    jobId: clientJobId,
    label: refundLabelForStatus(status),
    stage,
    userId: job.userId,
  });
  const metadata = {
    ...(job.metadata || {}),
    creditRefunded: true,
    creditRefundedAt: new Date().toISOString(),
    creditRefundReason: error,
  };
  const patchedJob = await patchGenerationJob(clientJobId, {
    error,
    metadata,
    status,
  });

  return {
    job: patchedJob || { ...job, error, metadata, status },
    refund,
  };
}

export function creditRefundPayload(refund) {
  if (!refund) return {};
  return {
    creditBalance: refund.balance,
    isUnlimited: refund.isUnlimited,
  };
}
