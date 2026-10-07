import { verifyAuthUser } from "../src/services/auth.service.js";
import {
  createTicket,
  listTickets,
  replyToTicket,
} from "../src/services/tickets.service.js";
import { setNoStoreHeaders } from "../src/lib/http.js";
import { readJsonRequestBody } from "../src/lib/request-body.js";
import { applyVercelRateLimit } from "../src/lib/rate-limit.js";
import { withApiErrorBoundary } from "../src/lib/error-boundary.js";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  setNoStoreHeaders(response);

  if (request.method === "OPTIONS") {
    return response.status(204).end();
  }

  if (request.method !== "GET" && request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  let user;
  try {
    user = await verifyAuthUser(request);
  } catch (error) {
    return response.status(error?.statusCode || 401).json({ error: error?.message || "Oturum doğrulanamadı." });
  }

  if (await applyVercelRateLimit(response, user.id, ["general"])) return;

  if (request.method === "GET") {
    const result = await listTickets({ user });
    return response.status(result.status).json(result.payload);
  }

  let body;
  try {
    body = await readJsonRequestBody(request);
  } catch (error) {
    return response.status(400).json({ error: error.message || "Geçersiz istek." });
  }

  // ticketId varsa mevcut talebe cevap; yoksa yeni talep.
  const result = body && body.ticketId
    ? await replyToTicket({ user, body })
    : await createTicket({ user, body });
  return response.status(result.status).json(result.payload);
}

export default withApiErrorBoundary(handler, { scope: "tickets" });
