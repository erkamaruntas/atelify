// Hobby plan serverless function sınırı (12) için üretim takip uç noktaları tek
// dinamik route altında toplandı. Eski URL'ler vercel.json rewrite'larıyla aynı
// kalır: /api/generation-status, /api/generation-delivered, /api/recover-generations.
import deliveredHandler from "./_delivered.js";
import recoverHandler from "./_recover.js";
import statusHandler from "./_status.js";

const HANDLERS = {
  delivered: deliveredHandler,
  recover: recoverHandler,
  status: statusHandler,
};

export default async function handler(request, response) {
  const value = request.query?.action;
  const action = Array.isArray(value) ? value[0] || "" : value || "";
  const target = HANDLERS[action];
  if (target) return target(request, response);

  response.setHeader("Access-Control-Allow-Origin", "*");
  return response.status(404).json({ error: "Not found" });
}
