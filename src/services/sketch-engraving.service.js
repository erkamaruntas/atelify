import sharp from "sharp";

// Hybrid stage-1 (sketch) deterministic engraving pipeline.
//
// For clean, high-contrast 2-tone artwork (logos / crests / seals) we can
// produce the engraving asset deterministically with sharp instead of calling
// the generative model. This eliminates the generative failure modes seen in
// stage 1 (hallucinated rings, stipple dots, invented names) and avoids the
// API cost for the common case.
//
// The classifier is intentionally conservative: when the input is not clearly
// clean 2-tone artwork, callers should fall back to the fal.ai API path.

const MAX_SIDE = 1024;
const TARGET_WHITE_RATIO = 0.18;
const BRIGHT_CUT_THRESHOLD = 145;
const DARK_CUT_THRESHOLD = 125;
const MIN_COMPONENT_AREA_RATIO = 0.000025;
const ROUND_DETAILED_CONTENT_SCALE = 0.86;
const OVAL_DETAILED_CONTENT_HEIGHT_SCALE = 0.92;
const OVAL_MINIMALIST_CONTENT_SCALE = 0.96;
const RECTANGLE_FRAME_HEIGHT_RATIO = 0.89;
const RECTANGLE_FRAME_WIDTH_TO_HEIGHT_RATIO = 355 / 482;
const RECTANGLE_DETAILED_CONTENT_SCALE = 1.04;
const RECTANGLE_MINIMALIST_CONTENT_SCALE = 1.04;

// Classifier thresholds (first pass — tune with real examples).
const CLASSIFY_MAX_COLOR_RATIO = 0.18; // mostly monochrome
const CLASSIFY_MIN_EXTREME_RATIO = 0.7; // clearly bimodal (near-black/near-white)
const CLASSIFY_MAX_MID_RATIO = 0.32; // few mid-tones (not a photo/gradient)
const CLASSIFY_MIN_FOREGROUND_RATIO = 0.01; // not blank
const CLASSIFY_MAX_FOREGROUND_RATIO = 0.6; // not mostly solid

function normalizeShape(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace("dikdörtgen", "dikdortgen");
  return ["dikdortgen", "kare", "oval", "yuvarlak"].includes(normalized) ? normalized : "yuvarlak";
}

function pixelLuma(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function parseImageDataUrlToBuffer(dataUrl) {
  const match = String(dataUrl || "").match(/^data:(image\/[a-zA-Z0-9.+-]+)(;base64)?,(.*)$/s);
  if (!match) return null;
  return match[2]
    ? Buffer.from(match[3], "base64")
    : Buffer.from(decodeURIComponent(match[3]), "utf8");
}

// ---------------------------------------------------------------------------
// Shape geometry
// ---------------------------------------------------------------------------

function shapeGeometry(shape, width, height) {
  const side = Math.min(width, height);
  const margin = Math.round(side * 0.055);
  const centerX = width / 2;
  const centerY = height / 2;

  if (shape === "yuvarlak") {
    return {
      centerX,
      centerY,
      radius: side * 0.445,
      shape,
      strokeWidth: Math.max(3, Math.round(side * 0.009)),
    };
  }

  if (shape === "oval") {
    // radiusX/radiusY ratio = 0.365/0.445 ≈ 0.82, matching the ring oval face
    // (assets/ring-templates/manifest.json oval-foto ~503x615).
    return {
      centerX,
      centerY,
      radiusX: side * 0.365,
      radiusY: side * 0.445,
      shape,
      strokeWidth: Math.max(3, Math.round(side * 0.009)),
    };
  }

  if (shape === "dikdortgen") {
    const rectHeight = Math.round(side * RECTANGLE_FRAME_HEIGHT_RATIO);
    const rectWidth = Math.round(rectHeight * RECTANGLE_FRAME_WIDTH_TO_HEIGHT_RATIO);
    return {
      height: rectHeight,
      radius: Math.round(rectWidth * 0.018),
      shape,
      strokeWidth: Math.max(3, Math.round(side * 0.009)),
      width: rectWidth,
      x: Math.round((width - rectWidth) / 2),
      y: Math.round((height - rectHeight) / 2),
    };
  }

  const squareSize = side - margin * 2;
  return {
    height: squareSize,
    radius: Math.round(side * 0.035),
    shape: "kare",
    strokeWidth: Math.max(3, Math.round(side * 0.009)),
    width: squareSize,
    x: Math.round((width - squareSize) / 2),
    y: Math.round((height - squareSize) / 2),
  };
}

// Inner box (as a fraction of the square canvas) the subject should fit inside,
// so the artwork sits comfortably within the shape with a margin to the border.
function innerFitBox(shape, side) {
  if (shape === "yuvarlak") return { height: Math.round(side * 0.58), width: Math.round(side * 0.58) };
  if (shape === "oval") return { height: Math.round(side * 0.58), width: Math.round(side * 0.476) };
  if (shape === "dikdortgen") return { height: Math.round(side * 0.78), width: Math.round(side * 0.5) };
  return { height: Math.round(side * 0.74), width: Math.round(side * 0.74) };
}

function isInsideShape(geometry, x, y) {
  if (geometry.shape === "yuvarlak") {
    const dx = x + 0.5 - geometry.centerX;
    const dy = y + 0.5 - geometry.centerY;
    return dx * dx + dy * dy <= geometry.radius * geometry.radius;
  }

  if (geometry.shape === "oval") {
    const dx = (x + 0.5 - geometry.centerX) / geometry.radiusX;
    const dy = (y + 0.5 - geometry.centerY) / geometry.radiusY;
    return dx * dx + dy * dy <= 1;
  }

  return (
    x >= geometry.x &&
    x < geometry.x + geometry.width &&
    y >= geometry.y &&
    y < geometry.y + geometry.height
  );
}

function shapeBorderSvg(shape, width, height, strokeColor = "#fff") {
  const geometry = shapeGeometry(shape, width, height);
  const stroke = geometry.strokeWidth;

  if (geometry.shape === "yuvarlak") {
    return Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <circle cx="${geometry.centerX}" cy="${geometry.centerY}" r="${geometry.radius}" fill="none" stroke="${strokeColor}" stroke-width="${stroke}" />
      </svg>
    `);
  }

  if (geometry.shape === "oval") {
    return Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <ellipse cx="${geometry.centerX}" cy="${geometry.centerY}" rx="${geometry.radiusX}" ry="${geometry.radiusY}" fill="none" stroke="${strokeColor}" stroke-width="${stroke}" />
      </svg>
    `);
  }

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect x="${geometry.x}" y="${geometry.y}" width="${geometry.width}" height="${geometry.height}" rx="${geometry.radius}" ry="${geometry.radius}" fill="none" stroke="${strokeColor}" stroke-width="${stroke}" />
    </svg>
  `);
}

function ovalBorderSvg(width, height, cx, cy, rx, ry, strokeWidth, strokeColor = "#fff") {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
    </svg>
  `);
}

// ---------------------------------------------------------------------------
// Stage-1 oval reframing (applied to the AI / fal.ai output)
//
// Instead of trusting the model to draw a consistent oval, we generate the
// content only and then crop + frame it deterministically to the EXACT oval of
// the stage-2 ring template, so every result drops onto the ring oval surface
// with no distortion. Ratios are the real photo-mold FACE aspect (width:height)
// from assets/ring-templates/manifest.json:
//   ring  oval-foto-* ~503x615 / 495x603  -> 0.82
//   kolye kolye-oval-foto-* ~321x430      -> 0.75
const OVAL_FRAME_FACE_RATIO = { kolye: 0.75, yuzuk: 0.82 };

// Reframe a generated sketch image into the fixed ring/pendant oval.
// Returns { buffer, contentType, width, height } or null when no reframing
// applies (non-oval shape, empty input) so the caller keeps the original.
export async function frameSketchArtworkToShape(inputBuffer, options = {}) {
  const shape = normalizeShape(options.shape);
  if (!inputBuffer || !inputBuffer.length) return null;

  const product = options.product === "kolye" ? "kolye" : "yuzuk";
  const isDetailed = String(options.designMode || "").trim().toLowerCase() === "emboss";
  if (shape === "yuvarlak") {
    return isDetailed
      ? frameRoundDetailedSketchArtwork(inputBuffer)
      : frameRoundMinimalistSketchArtwork(inputBuffer);
  }
  if (shape === "dikdortgen") {
    return isDetailed
      ? frameRectangularDetailedSketchArtwork(inputBuffer)
      : frameRectangularMinimalistSketchArtwork(inputBuffer);
  }
  if (shape !== "oval") return null;
  const ratio = OVAL_FRAME_FACE_RATIO[product] || OVAL_FRAME_FACE_RATIO.yuzuk;

  const side = MAX_SIDE;
  const bg = isDetailed ? "#000000" : "#ffffff";

  const cx = side / 2;
  const cy = side / 2;
  const ry = Math.round(side * 0.45);
  const rx = Math.round(ratio * ry);
  const fitH = isDetailed
    ? Math.round(2 * ry * OVAL_DETAILED_CONTENT_HEIGHT_SCALE)
    : Math.round(2 * ry * OVAL_MINIMALIST_CONTENT_SCALE);
  const fitW = isDetailed
    ? side
    : Math.round(2 * rx * OVAL_MINIMALIST_CONTENT_SCALE);

  // 1) Isolate the drawn content (trim the uniform mode background) and scale it
  //    to sit inside the oval safe area, so the elliptical crop never cuts it.
  let subject;
  try {
    const trimmed = await sharp(inputBuffer, { failOn: "none" })
      .rotate()
      .flatten({ background: bg })
      .trim({ threshold: 14 })
      .toBuffer();
    subject = await sharp(trimmed, { failOn: "none" })
      .resize({ fit: "inside", height: fitH, width: fitW, withoutEnlargement: false })
      .flatten({ background: bg })
      .removeAlpha()
      .toBuffer({ resolveWithObject: true });
  } catch {
    subject = await sharp(inputBuffer, { failOn: "none" })
      .rotate()
      .resize({ fit: "inside", height: fitH, width: fitW, withoutEnlargement: false })
      .flatten({ background: bg })
      .removeAlpha()
      .toBuffer({ resolveWithObject: true });
  }

  const left = Math.max(0, Math.round((side - subject.info.width) / 2));
  const contentBottom = Math.round(cy + ry - Math.max(3, Math.round(side * 0.009)) / 2);
  const top = isDetailed
    ? Math.max(0, Math.round(contentBottom - subject.info.height))
    : Math.max(0, Math.round((side - subject.info.height) / 2));

  // 2) Place the content on a full background canvas.
  const composed = await sharp({
    create: { background: bg, channels: 3, height: side, width: side },
  })
    .composite([{ input: subject.data, left, top }])
    .png()
    .toBuffer();

  // 3) Crop the content to the exact ring oval (transparent outside the oval).
  //    Done as its own pipeline so the mask is fully applied before compositing.
  const maskSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${side}" height="${side}"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#ffffff"/></svg>`
  );
  const ovalContent = await sharp(composed)
    .ensureAlpha()
    .composite([{ blend: "dest-in", input: maskSvg }])
    .png()
    .toBuffer();

  // 4) Lay the oval content over a solid background canvas.
  const contentOnBackground = await sharp({
    create: { background: bg, channels: 4, height: side, width: side },
  })
    .composite([{ input: ovalContent, left: 0, top: 0 }])
    .flatten({ background: bg })
    .png()
    .toBuffer();

  // Çerçevesiz (hem Detaylı hem Minimalist): görünür stroke çerçeve eklenmiyor.
  // İçerik zaten oval'e kırpıldı; placement bozulmaz.
  const buffer = await sharp(contentOnBackground, { failOn: "none" })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();

  return { buffer, contentType: "image/png", height: side, width: side };
}

export async function frameSketchArtworkForStageOneDisplay(inputBuffer, options = {}) {
  if (!inputBuffer || !inputBuffer.length) return null;
  const isDetailed = String(options.designMode || "").trim().toLowerCase() === "emboss";
  const side = MAX_SIDE;
  const bg = isDetailed ? "#000000" : "#ffffff";
  const geometry = shapeGeometry("yuvarlak", side, side);
  const contentSide = isDetailed
    ? Math.round(side * ROUND_DETAILED_CONTENT_SCALE)
    : Math.round(geometry.radius * 2 * 0.86);

  let subject;
  try {
    const base = sharp(inputBuffer, { failOn: "none" }).rotate().flatten({ background: bg });
    const source = isDetailed
      ? base
      : sharp(await base.trim({ background: bg, threshold: 14 }).toBuffer(), { failOn: "none" });
    subject = await source
      .resize({
        background: bg,
        fit: "inside",
        height: contentSide,
        width: contentSide,
        withoutEnlargement: false,
      })
      .flatten({ background: bg })
      .removeAlpha()
      .png()
      .toBuffer({ resolveWithObject: true });
  } catch {
    subject = await sharp(inputBuffer, { failOn: "none" })
      .rotate()
      .resize({
        background: bg,
        fit: "inside",
        height: contentSide,
        width: contentSide,
        withoutEnlargement: false,
      })
      .flatten({ background: bg })
      .removeAlpha()
      .png()
      .toBuffer({ resolveWithObject: true });
  }

  const left = Math.max(0, Math.round((side - subject.info.width) / 2));
  const contentBottom = Math.round(geometry.centerY + geometry.radius - geometry.strokeWidth / 2);
  const top = isDetailed
    ? Math.max(0, Math.round(contentBottom - subject.info.height))
    : Math.max(0, Math.round((side - subject.info.height) / 2));
  const buffer = await sharp({
    create: { background: bg, channels: 3, height: side, width: side },
  })
    .composite([{ input: subject.data, left, top }])
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();

  return { buffer, contentType: "image/png", height: side, width: side };
}

export async function buildStageOneSketchDeliveryImages(images, metadata = {}) {
  const sourceImages = Array.isArray(images) ? images : [];
  const shape = normalizeShape(metadata?.productShape);
  const product = metadata?.product === "kolye" ? "kolye" : "yuzuk";
  const designMode = metadata?.designMode === "emboss" ? "emboss" : "engrave";

  return Promise.all(
    sourceImages.map(async (image) => {
      const url = String(image?.url || "").trim();
      if (!/^https?:\/\//i.test(url)) {
        return { displayImage: image, stageSourceImage: null };
      }

      try {
        const response = await fetch(url);
        if (!response.ok) return { displayImage: image, stageSourceImage: null };

        const inputBuffer = Buffer.from(await response.arrayBuffer());
        const display = await frameSketchArtworkForStageOneDisplay(inputBuffer, { designMode });
        const displayImage = display?.buffer
          ? {
              ...image,
              buffer: display.buffer,
              contentType: display.contentType,
              height: display.height,
              width: display.width,
            }
          : image;

        if (shape === "yuvarlak") {
          return { displayImage, stageSourceImage: null };
        }

        const stageSource = await frameSketchArtworkToShape(inputBuffer, { designMode, product, shape });
        const stageSourceImage = stageSource?.buffer
          ? {
              ...image,
              buffer: stageSource.buffer,
              contentType: stageSource.contentType,
              height: stageSource.height,
              width: stageSource.width,
            }
          : null;

        return { displayImage, stageSourceImage };
      } catch (error) {
        console.error("[sketch] stage-1 display framing failed; using original image", error);
        return { displayImage: image, stageSourceImage: null };
      }
    })
  );
}

async function frameRoundMinimalistSketchArtwork(inputBuffer) {
  const side = MAX_SIDE;
  const bg = "#ffffff";
  const geometry = shapeGeometry("yuvarlak", side, side);
  const contentSide = Math.round(geometry.radius * 2 * 0.86);
  let subject;
  try {
    const trimmed = await sharp(inputBuffer, { failOn: "none" })
      .rotate()
      .flatten({ background: bg })
      .trim({ background: bg, threshold: 14 })
      .toBuffer();
    subject = await sharp(trimmed, { failOn: "none" })
      .resize({
        background: bg,
        fit: "inside",
        height: contentSide,
        width: contentSide,
        withoutEnlargement: false,
      })
      .flatten({ background: bg })
      .removeAlpha()
      .png()
      .toBuffer({ resolveWithObject: true });
  } catch {
    subject = await sharp(inputBuffer, { failOn: "none" })
      .rotate()
      .resize({
        background: bg,
        fit: "inside",
        height: contentSide,
        width: contentSide,
        withoutEnlargement: false,
      })
      .flatten({ background: bg })
      .removeAlpha()
      .png()
      .toBuffer({ resolveWithObject: true });
  }

  const left = Math.max(0, Math.round((side - subject.info.width) / 2));
  const top = Math.max(0, Math.round((side - subject.info.height) / 2));
  const composed = await sharp({
    create: { background: bg, channels: 3, height: side, width: side },
  })
    .composite([{ input: subject.data, left, top }])
    .png()
    .toBuffer();

  const circleMaskSvg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${side}" height="${side}" viewBox="0 0 ${side} ${side}">
      <circle cx="${geometry.centerX}" cy="${geometry.centerY}" r="${geometry.radius}" fill="#ffffff" />
    </svg>
  `);
  const clippedContent = await sharp(composed, { failOn: "none" })
    .ensureAlpha()
    .composite([{ input: circleMaskSvg, blend: "dest-in" }])
    .png()
    .toBuffer();

  const contentOnWhite = await sharp({
    create: { background: bg, channels: 4, height: side, width: side },
  })
    .composite([{ input: clippedContent, left: 0, top: 0 }])
    .flatten({ background: bg })
    .png()
    .toBuffer();

  // Çerçevesiz (Minimalist): görünür stroke çerçeve eklenmiyor.
  const buffer = await sharp(contentOnWhite, { failOn: "none" })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();

  return { buffer, contentType: "image/png", height: side, width: side };
}

async function frameRoundDetailedSketchArtwork(inputBuffer) {
  const side = MAX_SIDE;
  const bg = "#000000";
  const geometry = shapeGeometry("yuvarlak", side, side);
  const contentSide = Math.round(side * ROUND_DETAILED_CONTENT_SCALE);
  const prepared = await sharp(inputBuffer, { failOn: "none" })
    .rotate()
    .resize({
      background: bg,
      fit: "contain",
      height: contentSide,
      width: contentSide,
      withoutEnlargement: false,
    })
    .flatten({ background: bg })
    .removeAlpha()
    .png()
    .toBuffer({ resolveWithObject: true });

  const left = Math.max(0, Math.round((side - prepared.info.width) / 2));
  const contentBottom = Math.round(geometry.centerY + geometry.radius - geometry.strokeWidth / 2);
  const top = Math.max(0, Math.round(contentBottom - prepared.info.height));

  const composed = await sharp({
    create: { background: bg, channels: 3, height: side, width: side },
  })
    .composite([{ input: prepared.data, left, top }])
    .png()
    .toBuffer();

  const circleMaskSvg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${side}" height="${side}" viewBox="0 0 ${side} ${side}">
      <circle cx="${geometry.centerX}" cy="${geometry.centerY}" r="${geometry.radius}" fill="#ffffff" />
    </svg>
  `);
  const clippedContent = await sharp(composed, { failOn: "none" })
    .ensureAlpha()
    .composite([{ input: circleMaskSvg, blend: "dest-in" }])
    .png()
    .toBuffer();

  const contentOnBlack = await sharp({
    create: { background: bg, channels: 4, height: side, width: side },
  })
    .composite([{ input: clippedContent, left: 0, top: 0 }])
    .flatten({ background: bg })
    .png()
    .toBuffer();

  // Çerçevesiz (Detaylı/emboss): görünür stroke çerçeve eklenmiyor.
  const buffer = await sharp(contentOnBlack, { failOn: "none" })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();

  return { buffer, contentType: "image/png", height: side, width: side };
}

async function frameRectangularMinimalistSketchArtwork(inputBuffer) {
  return frameRectangularSketchArtwork(inputBuffer, { isDetailed: false });
}

async function frameRectangularDetailedSketchArtwork(inputBuffer) {
  return frameRectangularSketchArtwork(inputBuffer, { isDetailed: true });
}

async function frameRectangularSketchArtwork(inputBuffer, { isDetailed }) {
  const side = MAX_SIDE;
  const bg = isDetailed ? "#000000" : "#ffffff";
  const geometry = shapeGeometry("dikdortgen", side, side);
  const contentScale = isDetailed
    ? RECTANGLE_DETAILED_CONTENT_SCALE
    : RECTANGLE_MINIMALIST_CONTENT_SCALE;
  const fitW = Math.round(geometry.width * contentScale);
  const fitH = Math.round(geometry.height * contentScale);

  let subject;
  try {
    const trimmed = await sharp(inputBuffer, { failOn: "none" })
      .rotate()
      .flatten({ background: bg })
      .trim({ background: bg, threshold: 14 })
      .toBuffer();
    subject = await sharp(trimmed, { failOn: "none" })
      .resize({ fit: "inside", height: fitH, width: fitW, withoutEnlargement: false })
      .flatten({ background: bg })
      .removeAlpha()
      .png()
      .toBuffer({ resolveWithObject: true });
  } catch {
    subject = await sharp(inputBuffer, { failOn: "none" })
      .rotate()
      .resize({ fit: "inside", height: fitH, width: fitW, withoutEnlargement: false })
      .flatten({ background: bg })
      .removeAlpha()
      .png()
      .toBuffer({ resolveWithObject: true });
  }

  const left = Math.max(0, Math.round(geometry.x + (geometry.width - subject.info.width) / 2));
  const contentBottom = Math.round(geometry.y + geometry.height - geometry.strokeWidth / 2);
  const top = isDetailed
    ? Math.max(0, Math.round(contentBottom - subject.info.height))
    : Math.max(0, Math.round(geometry.y + (geometry.height - subject.info.height) / 2));

  const composed = await sharp({
    create: { background: bg, channels: 3, height: side, width: side },
  })
    .composite([{ input: subject.data, left, top }])
    .png()
    .toBuffer();

  const rectMaskSvg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${side}" height="${side}" viewBox="0 0 ${side} ${side}">
      <rect x="${geometry.x}" y="${geometry.y}" width="${geometry.width}" height="${geometry.height}" rx="${geometry.radius}" ry="${geometry.radius}" fill="#ffffff" />
    </svg>
  `);
  const clippedContent = await sharp(composed, { failOn: "none" })
    .ensureAlpha()
    .composite([{ input: rectMaskSvg, blend: "dest-in" }])
    .png()
    .toBuffer();

  const contentOnBackground = await sharp({
    create: { background: bg, channels: 4, height: side, width: side },
  })
    .composite([{ input: clippedContent, left: 0, top: 0 }])
    .flatten({ background: bg })
    .png()
    .toBuffer();

  // Çerçevesiz (hem Detaylı hem Minimalist): görünür stroke çerçeve eklenmiyor.
  const buffer = await sharp(contentOnBackground, { failOn: "none" })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();

  return { buffer, contentType: "image/png", height: side, width: side };
}

// ---------------------------------------------------------------------------
// Input preparation (trim → fit → center on square canvas)
// ---------------------------------------------------------------------------

async function prepareSquareCanvas(buffer, shape) {
  const base = sharp(buffer, { failOn: "none" }).rotate();

  // Trim a uniform border (e.g. white margin around a logo) so the subject can
  // be fit to the shape regardless of how the upload was framed.
  let trimmed;
  try {
    trimmed = await base
      .clone()
      .flatten({ background: "#ffffff" })
      .trim({ threshold: 12 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    trimmed = null;
  }

  const fit = innerFitBox(shape, MAX_SIDE);
  const subjectSource = trimmed?.data
    ? sharp(trimmed.data, { failOn: "none" })
    : base.clone();

  const subject = await subjectSource
    .resize({
      fit: "inside",
      height: fit.height,
      width: fit.width,
      withoutEnlargement: false,
    })
    .flatten({ background: "#ffffff" })
    .removeAlpha()
    .toBuffer({ resolveWithObject: true });

  const subjWidth = subject.info.width;
  const subjHeight = subject.info.height;
  const left = Math.max(0, Math.round((MAX_SIDE - subjWidth) / 2));
  const top = Math.max(0, Math.round((MAX_SIDE - subjHeight) / 2));

  const canvas = await sharp({
    create: {
      background: "#ffffff",
      channels: 3,
      height: MAX_SIDE,
      width: MAX_SIDE,
    },
  })
    .composite([{ input: subject.data, left, top }])
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    channels: canvas.info.channels || 3,
    data: canvas.data,
    height: canvas.info.height,
    width: canvas.info.width,
  };
}

// ---------------------------------------------------------------------------
// Statistics + classifier
// ---------------------------------------------------------------------------

function imageStats(data, width, height, channels) {
  const total = Math.max(1, width * height);
  let colorPixels = 0;
  let nearBlack = 0;
  let nearWhite = 0;
  let mid = 0;

  const edgeBand = Math.max(2, Math.round(Math.min(width, height) * 0.055));
  let edgeLumaTotal = 0;
  let edgeCount = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * channels;
      const r = data[index];
      const g = channels === 1 ? r : data[index + 1];
      const b = channels === 1 ? r : data[index + 2];
      if (Math.max(r, g, b) - Math.min(r, g, b) > 24) colorPixels += 1;

      const luma = pixelLuma(r, g, b);
      if (luma <= 60) nearBlack += 1;
      else if (luma >= 200) nearWhite += 1;
      else mid += 1;

      if (x < edgeBand || y < edgeBand || x >= width - edgeBand || y >= height - edgeBand) {
        edgeLumaTotal += luma;
        edgeCount += 1;
      }
    }
  }

  return {
    colorRatio: colorPixels / total,
    edgeLuma: edgeLumaTotal / Math.max(1, edgeCount),
    extremeRatio: (nearBlack + nearWhite) / total,
    midRatio: mid / total,
    nearBlackRatio: nearBlack / total,
    nearWhiteRatio: nearWhite / total,
  };
}

// Decide whether the input is clean enough for the deterministic path.
// Conservative: any doubt → not deterministic (caller falls back to the API).
export async function classifySketchInput(buffer, shape = "yuvarlak") {
  try {
    const prepared = await prepareSquareCanvas(buffer, normalizeShape(shape));
    const stats = imageStats(prepared.data, prepared.width, prepared.height, prepared.channels);

    // Foreground = the minority extreme relative to the (lighter) background.
    const foregroundRatio = stats.edgeLuma >= 128 ? stats.nearBlackRatio : stats.nearWhiteRatio;

    const deterministic =
      stats.colorRatio <= CLASSIFY_MAX_COLOR_RATIO &&
      stats.extremeRatio >= CLASSIFY_MIN_EXTREME_RATIO &&
      stats.midRatio <= CLASSIFY_MAX_MID_RATIO &&
      foregroundRatio >= CLASSIFY_MIN_FOREGROUND_RATIO &&
      foregroundRatio <= CLASSIFY_MAX_FOREGROUND_RATIO;

    return { deterministic, stats: { ...stats, foregroundRatio } };
  } catch (error) {
    return { deterministic: false, error: error?.message || "Sınıflandırma başarısız." };
  }
}

// ---------------------------------------------------------------------------
// Binarization (white cuts on black) + small-component cleanup
// ---------------------------------------------------------------------------

function candidateBinaryBuffer({ data, geometry, height, mode, width, channels }) {
  const output = Buffer.alloc(width * height * 3);
  let inside = 0;
  let white = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const outputIndex = (y * width + x) * 3;

      if (!isInsideShape(geometry, x, y)) {
        output[outputIndex] = 0;
        output[outputIndex + 1] = 0;
        output[outputIndex + 2] = 0;
        continue;
      }

      const inputIndex = (y * width + x) * channels;
      const r = data[inputIndex];
      const g = channels === 1 ? r : data[inputIndex + 1];
      const b = channels === 1 ? r : data[inputIndex + 2];
      const luma = pixelLuma(r, g, b);
      const whitePixel = mode === "dark-cuts" ? luma <= DARK_CUT_THRESHOLD : luma >= BRIGHT_CUT_THRESHOLD;
      const value = whitePixel ? 255 : 0;

      output[outputIndex] = value;
      output[outputIndex + 1] = value;
      output[outputIndex + 2] = value;
      inside += 1;
      if (whitePixel) white += 1;
    }
  }

  return {
    buffer: output,
    whiteRatio: white / Math.max(1, inside),
  };
}

function chooseBinaryCandidate(candidates, preferredMode) {
  const scored = candidates.map((candidate) => {
    const rangePenalty = candidate.whiteRatio < 0.006 || candidate.whiteRatio > 0.62 ? 1 : 0;
    const preferencePenalty = candidate.mode === preferredMode ? 0 : 0.08;
    return {
      ...candidate,
      score: Math.abs(candidate.whiteRatio - TARGET_WHITE_RATIO) + rangePenalty + preferencePenalty,
    };
  });

  return scored.sort((left, right) => left.score - right.score)[0] || candidates[0];
}

function toThreeChannelBinaryBuffer(data, width, height, channels) {
  const output = Buffer.alloc(width * height * 3);
  for (let index = 0, outputIndex = 0; index < data.length; index += channels, outputIndex += 3) {
    const r = data[index];
    const g = channels === 1 ? r : data[index + 1];
    const b = channels === 1 ? r : data[index + 2];
    const value = pixelLuma(r, g, b) >= 128 ? 255 : 0;
    output[outputIndex] = value;
    output[outputIndex + 1] = value;
    output[outputIndex + 2] = value;
  }
  return output;
}

function removeSmallWhiteComponents(buffer, width, height) {
  const minArea = Math.max(
    14,
    Math.round(Math.min(width, height) * Math.min(width, height) * MIN_COMPONENT_AREA_RATIO)
  );
  const output = Buffer.from(buffer);
  const visited = new Uint8Array(width * height);
  const component = [];
  const stack = [];
  let removedComponents = 0;
  let removedPixels = 0;

  function isWhite(pixelIndex) {
    return output[pixelIndex * 3] === 255;
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const startIndex = y * width + x;
      if (visited[startIndex] || !isWhite(startIndex)) continue;

      component.length = 0;
      stack.length = 0;
      stack.push(startIndex);
      visited[startIndex] = 1;

      while (stack.length) {
        const pixelIndex = stack.pop();
        component.push(pixelIndex);
        const px = pixelIndex % width;
        const py = Math.floor(pixelIndex / width);

        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (!dx && !dy) continue;
            const nx = px + dx;
            const ny = py + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
            const nextIndex = ny * width + nx;
            if (visited[nextIndex] || !isWhite(nextIndex)) continue;
            visited[nextIndex] = 1;
            stack.push(nextIndex);
          }
        }
      }

      if (component.length >= minArea) continue;
      removedComponents += 1;
      removedPixels += component.length;
      component.forEach((pixelIndex) => {
        const outputIndex = pixelIndex * 3;
        output[outputIndex] = 0;
        output[outputIndex + 1] = 0;
        output[outputIndex + 2] = 0;
      });
    }
  }

  return {
    buffer: output,
    removedComponents,
    removedPixels,
    smallComponentMinArea: minArea,
  };
}

async function cleanCandidateBuffer(buffer, width, height) {
  const cleaned = await sharp(buffer, {
    raw: { channels: 3, height, width },
  })
    .grayscale()
    .threshold(128)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const binaryBuffer = toThreeChannelBinaryBuffer(
    cleaned.data,
    cleaned.info.width,
    cleaned.info.height,
    cleaned.info.channels || 1
  );
  const componentResult = removeSmallWhiteComponents(binaryBuffer, cleaned.info.width, cleaned.info.height);

  return {
    ...componentResult,
    height: cleaned.info.height,
    width: cleaned.info.width,
  };
}

// ---------------------------------------------------------------------------
// Deterministic engraving render
// ---------------------------------------------------------------------------

export async function renderDeterministicEngraving(buffer, { shape } = {}) {
  const normalizedShape = normalizeShape(shape);
  const prepared = await prepareSquareCanvas(buffer, normalizedShape);
  const { data, width, height, channels } = prepared;
  const geometry = shapeGeometry(normalizedShape, width, height);
  const stats = imageStats(data, width, height, channels);
  const preferredMode = stats.edgeLuma > 150 ? "dark-cuts" : "bright-cuts";

  const candidate = chooseBinaryCandidate(
    [
      {
        mode: "bright-cuts",
        ...candidateBinaryBuffer({ data, geometry, height, mode: "bright-cuts", width, channels }),
      },
      {
        mode: "dark-cuts",
        ...candidateBinaryBuffer({ data, geometry, height, mode: "dark-cuts", width, channels }),
      },
    ],
    preferredMode
  );

  const cleaned = await cleanCandidateBuffer(candidate.buffer, width, height);

  const composed = await sharp(cleaned.buffer, {
    raw: { channels: 3, height: cleaned.height, width: cleaned.width },
  })
    .composite([{ input: shapeBorderSvg(normalizedShape, cleaned.width, cleaned.height), blend: "over" }])
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const composedChannels = composed.info.channels || 3;
  const binaryOutput = Buffer.alloc(cleaned.width * cleaned.height * 3);
  for (let index = 0, outputIndex = 0; index < composed.data.length; index += composedChannels, outputIndex += 3) {
    const r = composed.data[index];
    const g = composedChannels === 1 ? r : composed.data[index + 1];
    const b = composedChannels === 1 ? r : composed.data[index + 2];
    const value = pixelLuma(r, g, b) >= 128 ? 255 : 0;
    binaryOutput[outputIndex] = value;
    binaryOutput[outputIndex + 1] = value;
    binaryOutput[outputIndex + 2] = value;
  }

  const outputBuffer = await sharp(binaryOutput, {
    raw: { channels: 3, height: cleaned.height, width: cleaned.width },
  })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();

  return {
    buffer: outputBuffer,
    contentType: "image/png",
    engraving: {
      colorRatio: stats.colorRatio,
      mode: candidate.mode,
      removedSmallComponents: cleaned.removedComponents,
      shape: normalizedShape,
      whiteRatio: candidate.whiteRatio,
    },
    height: cleaned.height,
    width: cleaned.width,
  };
}
