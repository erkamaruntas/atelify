// Hobby plan serverless function sınırı (12) için iki admin endpoint'i tek dinamik
// route altında toplandı. URL'ler aynı kalır: /api/admin/credits ve
// /api/admin/production-requests. Gerçek handler mantığı underscore helper
// dosyalarında (Vercel _ ile başlayanları route saymaz).
import creditsHandler from "./_credits.js";
import designsHandler from "./_designs.js";
import productionRequestsHandler from "./_production-requests.js";
import rolesHandler from "./_roles.js";
import spendingHandler from "./_spending.js";
import ticketsHandler from "./_tickets.js";

// production-requests JSON gövdesi için bodyParser sınırı route dosyasında olmalı.
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

export default async function handler(request, response) {
  const value = request.query?.resource;
  const resource = Array.isArray(value) ? value[0] || "" : value || "";

  if (resource === "credits") {
    return creditsHandler(request, response);
  }
  if (resource === "production-requests") {
    return productionRequestsHandler(request, response);
  }
  if (resource === "roles") {
    return rolesHandler(request, response);
  }
  if (resource === "spending") {
    return spendingHandler(request, response);
  }
  if (resource === "tickets") {
    return ticketsHandler(request, response);
  }
  if (resource === "designs") {
    return designsHandler(request, response);
  }

  response.setHeader("Access-Control-Allow-Origin", "*");
  return response.status(404).json({ error: "Not found" });
}
