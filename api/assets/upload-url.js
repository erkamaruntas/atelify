import { verifyAuthUser } from "../../src/services/auth.service.js";
import { createSignedUploadUrl } from "../../src/services/storage.service.js";
import { setNoStoreHeaders } from "../../src/lib/http.js";
import { readJsonRequestBody } from "../../src/lib/request-body.js";
import { isUploadValidationError } from "../../src/lib/upload-validation.js";
import { withApiErrorBoundary } from "../../src/lib/error-boundary.js";

async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  setNoStoreHeaders(response);

  if (request.method === "OPTIONS") {
    return response.status(204).end();
  }

  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  let user;
  try {
    user = await verifyAuthUser(request);
  } catch (error) {
    return response.status(error?.statusCode || 401).json({ error: error?.message || "Oturum doğrulanamadı." });
  }

  let body;
  try {
    body = await readJsonRequestBody(request);
  } catch (error) {
    return response.status(400).json({ error: error.message || "Geçersiz istek." });
  }

  try {
    const upload = await createSignedUploadUrl(user.id, body);
    return response.status(200).json({ upload });
  } catch (error) {
    if (isUploadValidationError(error)) {
      return response.status(error.statusCode || 400).json({
        code: error.code,
        error: error.message,
      });
    }
    console.error("[assets-upload-url] create failed", error);
    return response.status(error?.statusCode || 500).json({
      error: error?.message || "Upload URL oluşturulamadı.",
    });
  }
}

export default withApiErrorBoundary(handler, { scope: "assets-upload-url" });
