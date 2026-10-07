import {
  findUserIdByEmail,
  findUserIdById,
  refundUserCredits,
  spendUserCredits,
} from "../repositories/credits.repo.js";

const CREDIT_COSTS = {
  sketch: {
    "1k": { 1: 1, 4: 3 },
    "2k": { 1: 2, 4: 6 },
    "4k": { 1: 4, 4: 12 },
  },
  finish: { 1: 0, 4: 0 },
  mockup: {
    "1k": { 1: 5, 4: 15 },
    "2k": { 1: 8, 4: 24 },
    "4k": { 1: 13, 4: 39 },
  },
  manken: {
    "1k": { 1: 6, 4: 18 },
    "2k": { 1: 10, 4: 30 },
    "4k": { 1: 16, 4: 48 },
  },
};

export function creditCostFor(stage, count, options = {}) {
  if (stage === "sketch" || stage === "mockup" || stage === "manken") {
    const resolution = String(options?.resolution || "1k").toLowerCase();
    const resMap = CREDIT_COSTS[stage][resolution] || CREDIT_COSTS[stage]["1k"];
    const normalizedCount = Number(count) === 4 ? 4 : 1;
    return resMap[normalizedCount] || 0;
  }
  const stageMap = CREDIT_COSTS[stage];
  if (!stageMap) return 0;
  const normalizedCount = Number(count) === 4 ? 4 : 1;
  return stageMap[normalizedCount] || 0;
}

export async function resolveCreditTarget({ email, userId }) {
  const safeUserId = typeof userId === "string" ? userId.trim() : "";
  if (safeUserId) return findUserIdById(safeUserId);

  const safeEmail = typeof email === "string" ? email.trim() : "";
  if (!safeEmail) return "";
  return findUserIdByEmail(safeEmail);
}

export { spendUserCredits, refundUserCredits };
