const DEFAULT_MAX_BYTES = 8 * 1024 * 1024;

export async function readJsonRequestBody(request, maxBytes = DEFAULT_MAX_BYTES) {
  if (request.body && typeof request.body === "object" && !Buffer.isBuffer(request.body)) {
    return request.body;
  }
  if (typeof request.body === "string") {
    return parseJsonSource(request.body);
  }
  if (Buffer.isBuffer(request.body)) {
    return parseJsonSource(request.body.toString("utf8"));
  }
  return readJsonStream(request, maxBytes);
}

export async function readRawRequestBody(request, maxBytes = DEFAULT_MAX_BYTES) {
  if (Buffer.isBuffer(request.body)) return request.body;
  if (typeof request.body === "string") return Buffer.from(request.body, "utf8");
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("İstek gövdesi çok büyük."));
        request.destroy();
        return;
      }
      chunks.push(Buffer.from(chunk));
    });
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", () => reject(new Error("İstek okunamadı.")));
  });
}

function readJsonStream(request, maxBytes) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("İstek gövdesi çok büyük."));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });

    request.on("end", () => {
      try {
        const source = Buffer.concat(chunks).toString("utf8");
        resolve(parseJsonSource(source));
      } catch (error) {
        reject(error);
      }
    });

    request.on("error", () => {
      reject(new Error("İstek okunamadı."));
    });
  });
}

function parseJsonSource(source) {
  try {
    return source ? JSON.parse(source) : {};
  } catch {
    throw new Error("JSON gövdesi okunamadı.");
  }
}
