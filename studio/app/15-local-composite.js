// Atelify stüdyo — local-composite
// Ürün görselinin tarayıcıda canvas ile birleştirilmesi (gravür katmanı, çerçeve tespiti).
// Klasik script: tüm studio/app/*.js dosyaları aynı global kapsamı paylaşır ve
// studio.html'deki numara sırasıyla yüklenir. Sırayı değiştirme.


async function renderLocalFinishComposite({ formInfo, index, manifest, metal, sourceUrl, surface }) {
  const template = localProductTemplate(manifest, formInfo, metal);
  const canvasSize = manifest.defaults?.canvas || { width: 1024, height: 1024 };
  const canvas = document.createElement("canvas");
  canvas.width = Number(canvasSize.width) || 1024;
  canvas.height = Number(canvasSize.height) || 1024;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas oluşturulamadı.");

  const [templateImage, sourceImage] = await Promise.all([
    loadImageElement(localTemplateImageUrl(template, canvasSize)),
    loadImageElement(sourceUrl),
  ]);

  drawLocalTemplateImage(context, templateImage, canvas.width, canvas.height, template);

  const engraving = applyLocalDesignMode(
    mergeLocalEngravingConfig(manifest.defaults?.engraving, template.engraving),
    formInfo.designModeValue,
    metal
  );
  const layer = createLocalEngravingLayer({
    designMode: formInfo.designModeValue,
    engraving,
    index,
    metal,
    placement: template.placement,
    sourceImage,
    surface,
    template,
  });

  drawLocalEngravingLayer(context, layer, template.placement, template.shape, engraving);
  releaseCanvas(layer);
  templateImage.removeAttribute("src");
  sourceImage.removeAttribute("src");

  try {
    const outputUrl = canvas.toDataURL("image/png");
    releaseCanvas(canvas);
    return outputUrl;
  } catch {
    releaseCanvas(canvas);
    throw new Error("Bu tasarım tarayıcı güvenlik kısıtı nedeniyle işlenemedi. Görseli indirip yeniden yükleyerek deneyebilirsin.");
  }
}

function localProductTemplate(manifest, formInfo = {}, metal = {}) {
  const productValue = formInfo.productValue || "yuzuk";
  const shapeValue = formInfo.productShapeValue || formInfo.shapeValue || "yuvarlak";
  const isYuzukPhoto = productValue === "yuzuk" && shapeValue !== "dikdortgen";
  const isKolyePhoto = productValue === "kolye";
  const usePhotoTemplate = isYuzukPhoto || isKolyePhoto;
  const key = usePhotoTemplate
    ? finishRingMoldKeyFor(shapeValue, metal?.value, productValue)
    : formInfo.moldKey || DESIGN_SHAPE_OPTIONS[shapeValue]?.ringMold || selectedRingMoldConfig().key;
  const rawTemplate = usePhotoTemplate
    ? manifest?.templates?.[key]
    : null;
  if (!rawTemplate) return localFallbackProductTemplate(formInfo);
  const rawPlacement = rawTemplate.placement || {};
  const basePlacement = {
    centerX: Number(rawPlacement.centerX) || 512,
    centerY: Number(rawPlacement.centerY) || 454,
    height: Math.max(1, Number(rawPlacement.height) || 334),
    width: Math.max(1, Number(rawPlacement.width) || 334),
  };
  const { placement, templateCrop } = centerLocalPendantTemplatePlacement(
    basePlacement,
    productValue,
    manifest?.defaults?.canvas
  );

  return {
    engraving: rawTemplate.engraving || {},
    file: rawTemplate.file || "",
    key,
    product: productValue,
    shape: rawTemplate.shape || "yuvarlak",
    placement,
    templateCrop,
  };
}

function centerLocalPendantTemplatePlacement(placement, productValue, canvasSize = {}) {
  if (productValue !== "kolye") return { placement, templateCrop: null };

  const canvasWidth = Math.max(1, Number(canvasSize?.width) || 1024);
  const sideWidth = canvasWidth / 2;
  const sourceLeft = placement.centerX > sideWidth ? canvasWidth - sideWidth : 0;
  const targetLeft = (canvasWidth - sideWidth) / 2;

  return {
    placement: {
      ...placement,
      centerX: placement.centerX - sourceLeft + targetLeft,
    },
    templateCrop: {
      sourceLeftRatio: sourceLeft / canvasWidth,
      sourceWidthRatio: sideWidth / canvasWidth,
      targetLeftRatio: targetLeft / canvasWidth,
      targetWidthRatio: sideWidth / canvasWidth,
    },
  };
}

function localFallbackProductTemplate(formInfo = {}) {
  const productValue = formInfo.productValue || "yuzuk";
  const shapeValue = formInfo.productShapeValue || formInfo.shapeValue || "yuvarlak";
  const isPendant = productValue === "kolye";
  const placementByShape = {
    dikdortgen: { centerX: 512, centerY: isPendant ? 538 : 396, height: isPendant ? 292 : 284, width: isPendant ? 452 : 440 },
    kare: { centerX: 512, centerY: isPendant ? 538 : 396, height: isPendant ? 336 : 332, width: isPendant ? 336 : 332 },
    oval: { centerX: 512, centerY: isPendant ? 548 : 402, height: isPendant ? 420 : 386, width: isPendant ? 292 : 280 },
    yuvarlak: { centerX: 512, centerY: isPendant ? 538 : 400, height: isPendant ? 356 : 350, width: isPendant ? 356 : 350 },
  };
  return {
    engraving: {
      blend: "over",
      mask: {
        backgroundCutoff: ENGRAVING_BACKGROUND_CUTOFF,
        blur: 0.18,
        gain: 2.15,
        gamma: 1,
        minDarkness: ENGRAVING_MIN_DARKNESS,
        threshold: 224,
      },
      opacity: formInfo.designModeValue === "emboss" ? 0.44 : 0.58,
      scale: isPendant ? 0.82 : 0.86,
      shadow: { blur: 0.8, offsetX: 1, offsetY: 1, opacity: 0.12 },
      highlight: { blur: 0.35, offsetX: -1, offsetY: -1, opacity: 0.12 },
    },
    file: "",
    key: `${productValue}-${shapeValue}`,
    product: productValue,
    shape: shapeValue,
    placement: placementByShape[shapeValue] || placementByShape.yuvarlak,
  };
}

function localTemplateImageUrl(template, canvasSize) {
  if (template.file) return ringTemplateAssetUrl(template.file);
  const width = Number(canvasSize?.width) || 1024;
  const height = Number(canvasSize?.height) || 1024;
  return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#ffffff"/></svg>`)}`;
}

function mergeLocalEngravingConfig(defaults = {}, overrides = {}) {
  return {
    ...defaults,
    ...overrides,
    highlight: {
      ...(defaults.highlight || {}),
      ...(overrides.highlight || {}),
    },
    mask: {
      ...(defaults.mask || {}),
      ...(overrides.mask || {}),
    },
    shadow: {
      ...(defaults.shadow || {}),
      ...(overrides.shadow || {}),
    },
  };
}

function applyLocalDesignMode(engraving = {}, designMode = "engrave", metal = {}) {
  if (designMode !== "emboss") {
    return {
      ...engraving,
      highlight: { ...(engraving.highlight || {}), opacity: 0 },
      shadow: { ...(engraving.shadow || {}), opacity: 0 },
    };
  }

  return {
    ...engraving,
    blend: "over",
    lineColor: localEmbossLineColor(metal),
    opacity: clampNumber(Number(engraving.opacity ?? STAGE_TWO_FULL_OPACITY), STAGE_TWO_MIN_OPACITY, STAGE_TWO_FULL_OPACITY),
    shadow: {
      ...(engraving.shadow || {}),
      blur: 1,
      offsetX: 2,
      offsetY: 2,
      opacity: Math.max(0.14, Number(engraving.shadow?.opacity) || 0.14),
    },
    highlight: {
      ...(engraving.highlight || {}),
      blur: 0.45,
      offsetX: -2,
      offsetY: -2,
      opacity: Math.max(0.2, Number(engraving.highlight?.opacity) || 0.2),
    },
    mask: {
      ...(engraving.mask || {}),
      gain: Math.max(2, Number(engraving.mask?.gain) || 2),
      threshold: Math.min(235, Number(engraving.mask?.threshold) || 224),
    },
  };
}

function ringTemplateAssetUrl(file) {
  const safeFile = String(file || "").split("/").map(encodeURIComponent).join("/");
  return `./assets/ring-templates/${safeFile}`;
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    if (/^https?:\/\//i.test(src)) image.crossOrigin = "anonymous";
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Görsel yüklenemedi.")));
    image.src = src;
  });
}

function drawImageCover(context, image, targetWidth, targetHeight) {
  const scale = Math.max(targetWidth / image.naturalWidth, targetHeight / image.naturalHeight);
  const width = image.naturalWidth * scale;
  const height = image.naturalHeight * scale;
  context.drawImage(image, (targetWidth - width) / 2, (targetHeight - height) / 2, width, height);
}

function drawLocalTemplateImage(context, image, targetWidth, targetHeight, template = {}) {
  const crop = template.templateCrop;
  if (!crop) {
    drawImageCover(context, image, targetWidth, targetHeight);
    smoothLocalTemplateSurface(context, targetWidth, targetHeight, template);
    return;
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, targetWidth, targetHeight);
  context.drawImage(
    image,
    image.naturalWidth * crop.sourceLeftRatio,
    0,
    image.naturalWidth * crop.sourceWidthRatio,
    image.naturalHeight,
    targetWidth * crop.targetLeftRatio,
    0,
    targetWidth * crop.targetWidthRatio,
    targetHeight
  );
  smoothLocalTemplateSurface(context, targetWidth, targetHeight, template);
}

function smoothLocalTemplateSurface(context, targetWidth, targetHeight, template = {}) {
  if (!template.file || !template.placement) return;

  const placement = scaledPlacement(template.placement, targetWidth, targetHeight);
  const surfacePlacement = {
    ...placement,
    height: placement.height * TEMPLATE_SURFACE_SMOOTH_SCALE,
    width: placement.width * TEMPLATE_SURFACE_SMOOTH_SCALE,
  };
  const surfaceWidth = Math.max(1, Math.round(surfacePlacement.width));
  const surfaceHeight = Math.max(1, Math.round(surfacePlacement.height));
  const left = Math.max(0, Math.min(targetWidth - surfaceWidth, Math.round(surfacePlacement.centerX - surfaceWidth / 2)));
  const top = Math.max(0, Math.min(targetHeight - surfaceHeight, Math.round(surfacePlacement.centerY - surfaceHeight / 2)));
  const patch = document.createElement("canvas");
  patch.width = surfaceWidth;
  patch.height = surfaceHeight;
  const patchContext = patch.getContext("2d");
  if (!patchContext) return;

  patchContext.drawImage(context.canvas, left, top, surfaceWidth, surfaceHeight, 0, 0, surfaceWidth, surfaceHeight);
  context.save();
  clipEngravingShape(context, surfacePlacement, template.shape);
  context.filter = `blur(${TEMPLATE_SURFACE_SMOOTH_BLUR}px)`;
  context.drawImage(patch, left, top, surfaceWidth, surfaceHeight);
  context.restore();
  releaseCanvas(patch);
}

function scaledPlacement(placement, targetWidth, targetHeight) {
  const scaleX = targetWidth / 1024;
  const scaleY = targetHeight / 1024;
  return {
    centerX: placement.centerX * scaleX,
    centerY: placement.centerY * scaleY,
    height: placement.height * scaleY,
    width: placement.width * scaleX,
  };
}


function invertLocalCanvas(sourceCanvas) {
  const inv = document.createElement("canvas");
  inv.width = sourceCanvas.width;
  inv.height = sourceCanvas.height;
  const ctx = inv.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, inv.width, inv.height);
  ctx.drawImage(sourceCanvas, 0, 0);
  const imageData = ctx.getImageData(0, 0, inv.width, inv.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i]     = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
    data[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
  return inv;
}

function createLocalEngravingLayer({ designMode, engraving, index, metal, placement, sourceImage, surface, template }) {
  const layerPlacement = designMode === "emboss"
    ? detailedLocalOverlayPlacement(placement, template)
    : placement;
  const width = Math.max(1, Math.round(layerPlacement.width));
  const height = Math.max(1, Math.round(layerPlacement.height));
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = sourceImage.naturalWidth || sourceImage.width;
  sourceCanvas.height = sourceImage.naturalHeight || sourceImage.height;
  const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
  sourceContext.drawImage(sourceImage, 0, 0);

  const bounds = findDarkPixelBounds(sourceContext, sourceCanvas.width, sourceCanvas.height, engraving.mask || {});
  const layer = document.createElement("canvas");
  layer.width = width;
  layer.height = height;
  const layerContext = layer.getContext("2d", { willReadFrequently: true });
  const isFaceArtwork = shouldPreserveLocalFaceArtwork(sourceContext, sourceCanvas.width, sourceCanvas.height, template);
  const isEmbossMode = designMode === "emboss";
  if (isEmbossMode) {
    layer.dataset.detailedFaceArtwork = "1";
    layer.dataset.preserveFaceArtwork = "1";
    const drawCanvas = isFaceArtwork ? sourceCanvas : invertLocalCanvas(sourceCanvas);
    if (isSquareTemplateShape(template)) {
      const drawContext = drawCanvas.getContext("2d", { willReadFrequently: true });
      const frameBounds = findBrightSquareFrameBounds(drawContext, drawCanvas.width, drawCanvas.height);
      drawCanvasContain(layerContext, drawCanvas, width, height, frameBounds);
    } else {
      const drawContext = drawCanvas.getContext("2d", { willReadFrequently: true });
      const brightBounds = findBrightPixelBounds(drawContext, drawCanvas.width, drawCanvas.height);
      layerContext.drawImage(
        drawCanvas,
        brightBounds.left, brightBounds.top, brightBounds.width, brightBounds.height,
        0, 0, width, height
      );
    }
    knockoutBrightLocalArtworkPixels(layerContext, width, height);
    if (drawCanvas !== sourceCanvas) releaseCanvas(drawCanvas);
    releaseCanvas(sourceCanvas);
    return layer;
  }
  if (isFaceArtwork) {
    layer.dataset.preserveFaceArtwork = "1";
    drawLocalFaceArtworkLayer(layerContext, sourceCanvas, sourceContext, width, height);
    knockoutBrightLocalArtworkPixels(layerContext, width, height);
    releaseCanvas(sourceCanvas);
    return layer;
  }

  const isPhotoTemplate = String(template.key || "").startsWith("yuvarlak-foto") ||
    String(template.key || "").startsWith("oval-foto") ||
    String(template.key || "").startsWith("kolye-");
  const hasFitFrame = !isEmbossMode && isPhotoTemplate
    ? sourceHasLocalMinimalistFitFrame(sourceContext, sourceCanvas.width, sourceCanvas.height, template.shape)
    : false;
  const scaleByIndex = [0.86, 0.82, 0.9, 0.78][index % 4];
  const configuredScale = Number(engraving.scale);
  const baseScale = Number.isFinite(configuredScale)
    ? configuredScale
    : scaleByIndex;
  const templateScale = localEngravingSurfaceScale({
    baseScale,
    designMode,
    hasFitFrame,
    isPhotoTemplate,
    product: template.product,
  });
  const surfaceScale = surface?.value === "vintage" ? Math.min(templateScale, 0.92) : templateScale;
  const safeScale = isPhotoTemplate ? Math.min(surfaceScale, PHOTO_TEMPLATE_EDGE_SCALE_MAX) : surfaceScale;
  const scale = Math.min((width * safeScale) / bounds.width, (height * safeScale) / bounds.height);
  const shouldFillSurface = template.product === "kolye" && isPhotoTemplate;
  const drawWidth = shouldFillSurface ? width * safeScale : bounds.width * scale;
  const drawHeight = shouldFillSurface ? height * safeScale : bounds.height * scale;
  const drawX = (width - drawWidth) / 2;
  const drawY = (height - drawHeight) / 2 + (isPhotoTemplate && !hasFitFrame ? -height * 0.012 : 0);

  layerContext.drawImage(
    sourceCanvas,
    bounds.left,
    bounds.top,
    bounds.width,
    bounds.height,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );

  applyEngravingAlpha(layerContext, width, height, engraving, metal, index);
  if (hasFitFrame) {
    clearLocalFitFrameEdges(layerContext, width, height, template.shape);
  }
  releaseCanvas(sourceCanvas);
  return layer;
}

function isSquareTemplateShape(templateOrShape = {}) {
  const shape = typeof templateOrShape === "string"
    ? templateOrShape
    : templateOrShape.shape;
  const normalized = String(shape || "").trim().toLowerCase();
  return normalized === "kare" || normalized === "square";
}

function detailedLocalOverlayPlacement(placement, templateOrShape = {}) {
  const rawWidth = Math.max(1, placement.width);
  const rawHeight = Math.max(1, placement.height);
  const width = rawWidth * DETAILED_FACE_OVERLAY_SCALE;
  const height = rawHeight * DETAILED_FACE_OVERLAY_SCALE;
  const centerY = placement.centerY + placement.height * DETAILED_FACE_CENTER_Y_OFFSET;
  if (isSquareTemplateShape(templateOrShape)) {
    const side = Math.min(rawWidth, rawHeight) * DETAILED_SQUARE_FACE_OVERLAY_SCALE;
    return { ...placement, centerY, height: side, width: side };
  }
  return { ...placement, centerY, height, width };
}

function drawCanvasContain(context, sourceCanvas, width, height, sourceBounds = null) {
  const cropLeft = Math.max(0, Math.round(sourceBounds?.left ?? 0));
  const cropTop = Math.max(0, Math.round(sourceBounds?.top ?? 0));
  const sourceWidth = Math.max(1, Math.round(sourceBounds?.width ?? sourceCanvas.width));
  const sourceHeight = Math.max(1, Math.round(sourceBounds?.height ?? sourceCanvas.height));
  const scale = Math.min(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  context.drawImage(
    sourceCanvas,
    cropLeft,
    cropTop,
    sourceWidth,
    sourceHeight,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight
  );
}

function drawCanvasCover(context, sourceCanvas, width, height) {
  const sourceWidth = Math.max(1, sourceCanvas.width);
  const sourceHeight = Math.max(1, sourceCanvas.height);
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  context.drawImage(
    sourceCanvas,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight
  );
}

function localEngravingSurfaceScale({ baseScale = 1, designMode = "engrave", hasFitFrame = false, isPhotoTemplate = false, product = "" } = {}) {
  const safeBaseScale = Number.isFinite(baseScale) ? baseScale : 1;
  if (!isPhotoTemplate) return safeBaseScale;
  if (designMode !== "emboss") {
    if (hasFitFrame) return Math.max(safeBaseScale, PHOTO_TEMPLATE_MINIMALIST_FIT_FRAME_SCALE);
    const maxScale = product === "kolye" ? PHOTO_TEMPLATE_MINIMALIST_PENDANT_SCALE : PHOTO_TEMPLATE_MINIMALIST_RING_SCALE;
    return Math.min(safeBaseScale, maxScale);
  }
  return Math.max(safeBaseScale, PHOTO_TEMPLATE_EDGE_SCALE);
}

function sourceHasLocalMinimalistFitFrame(context, width, height, shape) {
  const imageData = context.getImageData(0, 0, width, height);
  const bounds = localDarkPixelBounds(imageData.data, width, height);
  if (!bounds || bounds.width < width * 0.34 || bounds.height < height * 0.34) return false;
  return localShapeHasFitFrame(imageData.data, width, height, bounds, shape);
}

function localDarkPixelBounds(data, width, height) {
  let left = width;
  let right = -1;
  let top = height;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = (y * width + x) * 4;
      const alpha = data[pixelIndex + 3];
      if (alpha < 24) continue;
      const luma = 0.2126 * data[pixelIndex] + 0.7152 * data[pixelIndex + 1] + 0.0722 * data[pixelIndex + 2];
      if (luma > 168) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }

  if (right < left || bottom < top) return null;
  return {
    bottom,
    height: Math.max(1, bottom - top + 1),
    left,
    right,
    top,
    width: Math.max(1, right - left + 1),
  };
}

function localShapeHasFitFrame(data, width, height, bounds, shape) {
  const normalizedShape = String(shape || "").trim().toLowerCase();
  if (["yuvarlak", "round", "oval", "vertical oval"].includes(normalizedShape)) {
    return localRoundedShapeHasFitFrame(data, width, bounds);
  }
  return localRectangularShapeHasFitFrame(data, width, bounds);
}

function localRoundedShapeHasFitFrame(data, imageWidth, bounds) {
  const binCount = 48;
  const bins = new Uint16Array(binCount);
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const radiusX = Math.max(1, bounds.width / 2);
  const radiusY = Math.max(1, bounds.height / 2);

  for (let y = bounds.top; y <= bounds.bottom; y += 1) {
    for (let x = bounds.left; x <= bounds.right; x += 1) {
      const pixelIndex = (y * imageWidth + x) * 4;
      const alpha = data[pixelIndex + 3];
      if (alpha < 24) continue;
      const luma = 0.2126 * data[pixelIndex] + 0.7152 * data[pixelIndex + 1] + 0.0722 * data[pixelIndex + 2];
      if (luma > 168) continue;
      const normalizedX = (x - centerX) / radiusX;
      const normalizedY = (y - centerY) / radiusY;
      const ellipseDistance = normalizedX * normalizedX + normalizedY * normalizedY;
      if (ellipseDistance < 0.68 || ellipseDistance > 1.14) continue;
      const angle = Math.atan2(normalizedY, normalizedX);
      const bin = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * binCount) % binCount;
      bins[bin] += 1;
    }
  }

  const minBinPixels = Math.max(2, Math.round(Math.min(bounds.width, bounds.height) * 0.018));
  const coveredBins = Array.from(bins).filter((count) => count >= minBinPixels).length;
  return coveredBins / binCount >= 0.58;
}

function localRectangularShapeHasFitFrame(data, imageWidth, bounds) {
  const band = Math.max(3, Math.round(Math.min(bounds.width, bounds.height) * 0.09));
  const topSpan = localEdgeDarkSpan(data, imageWidth, bounds.left, bounds.top, bounds.width, band, "x");
  const bottomSpan = localEdgeDarkSpan(data, imageWidth, bounds.left, bounds.bottom - band + 1, bounds.width, band, "x");
  const leftSpan = localEdgeDarkSpan(data, imageWidth, bounds.left, bounds.top, band, bounds.height, "y");
  const rightSpan = localEdgeDarkSpan(data, imageWidth, bounds.right - band + 1, bounds.top, band, bounds.height, "y");
  return (
    topSpan / bounds.width >= 0.54 &&
    bottomSpan / bounds.width >= 0.54 &&
    leftSpan / bounds.height >= 0.54 &&
    rightSpan / bounds.height >= 0.54
  );
}

function localEdgeDarkSpan(data, imageWidth, startX, startY, width, height, axis) {
  let min = Infinity;
  let max = -Infinity;
  for (let y = startY; y < startY + height; y += 1) {
    for (let x = startX; x < startX + width; x += 1) {
      const pixelIndex = (y * imageWidth + x) * 4;
      const alpha = data[pixelIndex + 3];
      if (alpha < 24) continue;
      const luma = 0.2126 * data[pixelIndex] + 0.7152 * data[pixelIndex + 1] + 0.0722 * data[pixelIndex + 2];
      if (luma > 168) continue;
      const coordinate = axis === "x" ? x : y;
      min = Math.min(min, coordinate);
      max = Math.max(max, coordinate);
    }
  }
  return Number.isFinite(min) && max >= min ? max - min + 1 : 0;
}

function shouldPreserveLocalFaceArtwork(context, width, height, template) {
  // Şekil gating yok — piksel analizinin kendisi karar verir (her şekil için face artwork algılaması)
  const data = context.getImageData(0, 0, width, height).data;
  const step = Math.max(4, Math.floor(Math.sqrt((width * height) / 9000)));
  let darkCount = 0;
  let brightCount = 0;
  let lumaTotal = 0;
  let sampleCount = 0;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const pixelIndex = (y * width + x) * 4;
      const alpha = data[pixelIndex + 3];
      if (alpha < 24) continue;
      const luma = 0.2126 * data[pixelIndex] + 0.7152 * data[pixelIndex + 1] + 0.0722 * data[pixelIndex + 2];
      lumaTotal += luma;
      sampleCount += 1;
      if (luma < 60) darkCount += 1;
      if (luma > 185) brightCount += 1;
    }
  }

  if (!sampleCount) return false;
  const darkRatio = darkCount / sampleCount;
  const brightRatio = brightCount / sampleCount;
  const meanLuma = lumaTotal / sampleCount;
  return darkRatio > 0.48 && brightRatio > 0.015 && meanLuma < 115;
}

function drawLocalFaceArtworkLayer(layerContext, sourceCanvas, sourceContext, width, height) {
  layerContext.fillStyle = "#000000";
  layerContext.fillRect(0, 0, width, height);

  const bounds = findBrightPixelBounds(sourceContext, sourceCanvas.width, sourceCanvas.height);
  const pad = Math.round(Math.min(bounds.width, bounds.height) * 0.035);
  const cropLeft = Math.max(0, bounds.left - pad);
  const cropTop = Math.max(0, bounds.top - pad);
  const cropRight = Math.min(sourceCanvas.width, bounds.right + pad);
  const cropBottom = Math.min(sourceCanvas.height, bounds.bottom + pad);
  const cropWidth = Math.max(1, cropRight - cropLeft);
  const cropHeight = Math.max(1, cropBottom - cropTop);
  const scale = Math.min(width / cropWidth, height / cropHeight);
  const drawWidth = cropWidth * scale;
  const drawHeight = cropHeight * scale;

  layerContext.drawImage(
    sourceCanvas,
    cropLeft,
    cropTop,
    cropWidth,
    cropHeight,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight
  );
}

function findBrightPixelBounds(context, width, height) {
  const data = context.getImageData(0, 0, width, height).data;
  let left = width;
  let right = 0;
  let top = height;
  let bottom = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = (y * width + x) * 4;
      const alpha = data[pixelIndex + 3];
      if (alpha < 24) continue;
      const luma = 0.2126 * data[pixelIndex] + 0.7152 * data[pixelIndex + 1] + 0.0722 * data[pixelIndex + 2];
      if (luma < 150) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }

  if (left > right || top > bottom) {
    return { bottom: height, height, left: 0, right: width, top: 0, width };
  }

  return {
    bottom,
    height: Math.max(1, bottom - top),
    left,
    right,
    top,
    width: Math.max(1, right - left),
  };
}

function findBrightSquareFrameBounds(context, width, height) {
  const imageData = context.getImageData(0, 0, width, height);
  const frameBounds = localSquareFrameLineBounds(imageData.data, width, height);
  if (frameBounds) return localSquareCropAroundBounds(frameBounds, width, height, 0);

  const bounds = findBrightPixelBoundsFromData(imageData.data, width, height, DETAILED_SQUARE_FRAME_LUMA_THRESHOLD);
  if (!bounds) return null;
  const sideRatio = Math.min(bounds.width, bounds.height) / Math.max(bounds.width, bounds.height);
  if (bounds.width < width * 0.52 || bounds.height < height * 0.52 || sideRatio < 0.82) {
    return null;
  }
  if (!looksLikeLocalSquareFrame(imageData.data, width, height, bounds)) {
    return null;
  }

  const padding = Math.max(0, Math.round(Math.min(bounds.width, bounds.height) * DETAILED_SQUARE_FRAME_PADDING_RATIO));
  return localSquareCropAroundBounds(bounds, width, height, padding);
}

function localSquareFrameLineBounds(data, width, height) {
  for (const threshold of DETAILED_SQUARE_FRAME_SCAN_THRESHOLDS) {
    const bounds = localSquareFrameLineBoundsAtThreshold(data, width, height, threshold);
    if (bounds) return bounds;
  }
  return null;
}

function localSquareFrameLineBoundsAtThreshold(data, width, height, threshold) {
  if (width < 1 || height < 1) return null;

  const rowCoverage = new Float32Array(height);
  const colCoverage = new Float32Array(width);
  for (let y = 0; y < height; y += 1) {
    let bright = 0;
    for (let x = 0; x < width; x += 1) {
      if (localPixelAboveThreshold(data, width, x, y, threshold)) bright += 1;
    }
    rowCoverage[y] = bright / width;
  }
  for (let x = 0; x < width; x += 1) {
    let bright = 0;
    for (let y = 0; y < height; y += 1) {
      if (localPixelAboveThreshold(data, width, x, y, threshold)) bright += 1;
    }
    colCoverage[x] = bright / height;
  }

  const rows = localCoverageClusters(rowCoverage, DETAILED_SQUARE_FRAME_MIN_LINE_RATIO);
  const cols = localCoverageClusters(colCoverage, DETAILED_SQUARE_FRAME_MIN_LINE_RATIO);
  let best = null;

  for (const top of rows.filter((cluster) => cluster.center < height * 0.45)) {
    for (const bottom of rows.filter((cluster) => cluster.center > height * 0.55)) {
      for (const left of cols.filter((cluster) => cluster.center < width * 0.45)) {
        for (const right of cols.filter((cluster) => cluster.center > width * 0.55)) {
          const candidate = {
            bottom: bottom.end,
            left: left.start,
            right: right.end,
            top: top.start,
          };
          candidate.width = candidate.right - candidate.left + 1;
          candidate.height = candidate.bottom - candidate.top + 1;
          if (!localSquareFrameCandidateLooksValid(data, width, height, candidate, threshold)) continue;
          const area = candidate.width * candidate.height;
          if (!best || area > best.area) best = { ...candidate, area };
        }
      }
    }
  }

  return best ? localImageBoundsToSize(best) : null;
}

function localCoverageClusters(coverage, minRatio) {
  const clusters = [];
  let start = -1;
  let peak = 0;

  for (let index = 0; index <= coverage.length; index += 1) {
    const value = index < coverage.length ? coverage[index] : 0;
    if (value >= minRatio) {
      if (start < 0) {
        start = index;
        peak = value;
      } else {
        peak = Math.max(peak, value);
      }
      continue;
    }

    if (start >= 0) {
      const end = index - 1;
      clusters.push({
        center: (start + end) / 2,
        end,
        peak,
        start,
      });
      start = -1;
      peak = 0;
    }
  }

  return clusters;
}

function localSquareFrameCandidateLooksValid(data, imageWidth, imageHeight, bounds, threshold) {
  const sideRatio = Math.min(bounds.width, bounds.height) / Math.max(bounds.width, bounds.height);
  if (
    bounds.width < imageWidth * DETAILED_SQUARE_FRAME_MIN_SIDE_RATIO ||
    bounds.height < imageHeight * DETAILED_SQUARE_FRAME_MIN_SIDE_RATIO ||
    sideRatio < 0.82
  ) {
    return false;
  }

  const band = Math.max(3, Math.round(Math.min(bounds.width, bounds.height) * 0.018));
  const minEdgeCoverage = 0.5;
  const edgesCovered =
    localMaxHorizontalLineCoverage(data, imageWidth, imageHeight, bounds.left, bounds.top, bounds.width, band, threshold) >= minEdgeCoverage &&
    localMaxHorizontalLineCoverage(data, imageWidth, imageHeight, bounds.left, bounds.bottom - band + 1, bounds.width, band, threshold) >= minEdgeCoverage &&
    localMaxVerticalLineCoverage(data, imageWidth, imageHeight, bounds.left, bounds.top, band, bounds.height, threshold) >= minEdgeCoverage &&
    localMaxVerticalLineCoverage(data, imageWidth, imageHeight, bounds.right - band + 1, bounds.top, band, bounds.height, threshold) >= minEdgeCoverage;
  if (!edgesCovered) return false;

  const cornerSize = Math.max(5, Math.round(band * 1.6));
  return (
    localCornerHasFrameInk(data, imageWidth, imageHeight, bounds.left, bounds.top, cornerSize, threshold) &&
    localCornerHasFrameInk(data, imageWidth, imageHeight, bounds.right, bounds.top, cornerSize, threshold) &&
    localCornerHasFrameInk(data, imageWidth, imageHeight, bounds.left, bounds.bottom, cornerSize, threshold) &&
    localCornerHasFrameInk(data, imageWidth, imageHeight, bounds.right, bounds.bottom, cornerSize, threshold)
  );
}

function localMaxHorizontalLineCoverage(data, imageWidth, imageHeight, left, top, width, height, threshold) {
  const startX = clampNumber(Math.round(left), 0, imageWidth);
  const endX = clampNumber(Math.round(left + width), 0, imageWidth);
  const startY = clampNumber(Math.round(top), 0, imageHeight);
  const endY = clampNumber(Math.round(top + height), 0, imageHeight);
  let maxCoverage = 0;

  for (let y = startY; y < endY; y += 1) {
    let bright = 0;
    for (let x = startX; x < endX; x += 1) {
      if (localPixelAboveThreshold(data, imageWidth, x, y, threshold)) bright += 1;
    }
    maxCoverage = Math.max(maxCoverage, bright / Math.max(1, endX - startX));
  }

  return maxCoverage;
}

function localMaxVerticalLineCoverage(data, imageWidth, imageHeight, left, top, width, height, threshold) {
  const startX = clampNumber(Math.round(left), 0, imageWidth);
  const endX = clampNumber(Math.round(left + width), 0, imageWidth);
  const startY = clampNumber(Math.round(top), 0, imageHeight);
  const endY = clampNumber(Math.round(top + height), 0, imageHeight);
  let maxCoverage = 0;

  for (let x = startX; x < endX; x += 1) {
    let bright = 0;
    for (let y = startY; y < endY; y += 1) {
      if (localPixelAboveThreshold(data, imageWidth, x, y, threshold)) bright += 1;
    }
    maxCoverage = Math.max(maxCoverage, bright / Math.max(1, endY - startY));
  }

  return maxCoverage;
}

function localCornerHasFrameInk(data, imageWidth, imageHeight, x, y, size, threshold) {
  const half = Math.max(2, Math.round(size / 2));
  const startX = clampNumber(Math.round(x) - half, 0, imageWidth);
  const endX = clampNumber(Math.round(x) + half + 1, 0, imageWidth);
  const startY = clampNumber(Math.round(y) - half, 0, imageHeight);
  const endY = clampNumber(Math.round(y) + half + 1, 0, imageHeight);
  let bright = 0;

  for (let yy = startY; yy < endY; yy += 1) {
    for (let xx = startX; xx < endX; xx += 1) {
      if (localPixelAboveThreshold(data, imageWidth, xx, yy, threshold)) bright += 1;
    }
  }

  return bright >= Math.max(2, Math.round(size * 0.4));
}

function localPixelAboveThreshold(data, width, x, y, threshold) {
  const pixelIndex = (y * width + x) * 4;
  const alpha = data[pixelIndex + 3];
  if (alpha < 24) return false;
  const luma = 0.2126 * data[pixelIndex] + 0.7152 * data[pixelIndex + 1] + 0.0722 * data[pixelIndex + 2];
  return luma >= threshold;
}

function localImageBoundsToSize(bounds) {
  return {
    bottom: bounds.bottom,
    height: bounds.bottom - bounds.top + 1,
    left: bounds.left,
    right: bounds.right,
    top: bounds.top,
    width: bounds.right - bounds.left + 1,
  };
}

function findBrightPixelBoundsFromData(data, width, height, threshold) {
  let left = width;
  let right = -1;
  let top = height;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = (y * width + x) * 4;
      const alpha = data[pixelIndex + 3];
      if (alpha < 24) continue;
      const luma = 0.2126 * data[pixelIndex] + 0.7152 * data[pixelIndex + 1] + 0.0722 * data[pixelIndex + 2];
      if (luma < threshold) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }

  if (right < left || bottom < top) return null;
  return { bottom, height: bottom - top + 1, left, right, top, width: right - left + 1 };
}

function looksLikeLocalSquareFrame(data, width, height, bounds) {
  const band = Math.max(3, Math.round(Math.min(bounds.width, bounds.height) * 0.018));
  const requiredRatio = 0.18;
  return (
    localBrightBandRatio(data, width, height, bounds.left, bounds.top, bounds.width, band) > requiredRatio &&
    localBrightBandRatio(data, width, height, bounds.left, bounds.bottom - band + 1, bounds.width, band) > requiredRatio &&
    localBrightBandRatio(data, width, height, bounds.left, bounds.top, band, bounds.height) > requiredRatio &&
    localBrightBandRatio(data, width, height, bounds.right - band + 1, bounds.top, band, bounds.height) > requiredRatio
  );
}

function localBrightBandRatio(data, imageWidth, imageHeight, left, top, width, height) {
  const startX = clampNumber(Math.round(left), 0, imageWidth);
  const startY = clampNumber(Math.round(top), 0, imageHeight);
  const endX = clampNumber(Math.round(left + width), 0, imageWidth);
  const endY = clampNumber(Math.round(top + height), 0, imageHeight);
  let bright = 0;
  let total = 0;

  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const pixelIndex = (y * imageWidth + x) * 4;
      const alpha = data[pixelIndex + 3];
      if (alpha < 24) continue;
      const luma = 0.2126 * data[pixelIndex] + 0.7152 * data[pixelIndex + 1] + 0.0722 * data[pixelIndex + 2];
      if (luma >= DETAILED_SQUARE_FRAME_LUMA_THRESHOLD) bright += 1;
      total += 1;
    }
  }

  return total > 0 ? bright / total : 0;
}

function localSquareCropAroundBounds(bounds, imageWidth, imageHeight, padding) {
  const targetSide = Math.min(
    Math.max(bounds.width, bounds.height) + padding * 2,
    imageWidth,
    imageHeight
  );
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const left = clampNumber(Math.round(centerX - targetSide / 2), 0, imageWidth - targetSide);
  const top = clampNumber(Math.round(centerY - targetSide / 2), 0, imageHeight - targetSide);
  return {
    height: Math.round(targetSide),
    left,
    top,
    width: Math.round(targetSide),
  };
}

function findDarkPixelBounds(context, width, height, mask = {}) {
  const data = context.getImageData(0, 0, width, height).data;
  const backgroundCutoff = engravingBackgroundCutoff(mask);
  let left = width;
  let right = 0;
  let top = height;
  let bottom = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixelIndex = (y * width + x) * 4;
      const alpha = data[pixelIndex + 3];
      if (alpha < 24) continue;
      const luma = 0.2126 * data[pixelIndex] + 0.7152 * data[pixelIndex + 1] + 0.0722 * data[pixelIndex + 2];
      if (luma >= backgroundCutoff) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }

  if (left > right || top > bottom) {
    return { bottom: height, height, left: 0, right: width, top: 0, width };
  }

  const pad = Math.round(Math.min(width, height) * 0.018);
  left = Math.max(0, left - pad);
  right = Math.min(width, right + pad);
  top = Math.max(0, top - pad);
  bottom = Math.min(height, bottom + pad);

  return {
    bottom,
    height: Math.max(1, bottom - top),
    left,
    right,
    top,
    width: Math.max(1, right - left),
  };
}

function applyEngravingAlpha(context, width, height, engraving, metal, index) {
  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const mask = engraving.mask || {};
  const threshold = clampNumber(Number(mask.threshold) || 232, 80, 255);
  const gain = clampNumber(Number(mask.gain) || 1.7, 0.2, 4);
  const gamma = clampNumber(Number(mask.gamma) || 1, 0.2, 4);
  const backgroundCutoff = engravingBackgroundCutoff(mask);
  const minDarkness = engravingMinDarkness(mask);
  const baseOpacity = clampNumber(Number(engraving.opacity ?? STAGE_TWO_FULL_OPACITY), STAGE_TWO_MIN_OPACITY, STAGE_TWO_FULL_OPACITY);
  const color = parseHexColor(engraving.lineColor || localEngravingLineColor(metal), { blue: 32, green: 35, red: 38 });

  for (let i = 0; i < pixels.length; i += 4) {
    const sourceAlpha = pixels[i + 3] / 255;
    if (sourceAlpha <= 0) {
      pixels[i + 3] = 0;
      continue;
    }

    const luma = 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];
    if (luma >= backgroundCutoff) {
      pixels[i + 3] = 0;
      continue;
    }

    const darkness = Math.pow(clampNumber(((threshold - luma) / threshold) * gain, 0, 1), gamma);
    if (darkness <= minDarkness) {
      pixels[i + 3] = 0;
      continue;
    }

    pixels[i] = color.red;
    pixels[i + 1] = color.green;
    pixels[i + 2] = color.blue;
    pixels[i + 3] = Math.round(255 * sourceAlpha * darkness * baseOpacity);
  }

  context.putImageData(imageData, 0, 0);
}

function clearLocalFitFrameEdges(context, width, height, shape) {
  const normalizedShape = String(shape || "").trim().toLowerCase();
  if (!["kare", "square", "dikdortgen", "rectangular"].includes(normalizedShape)) return;

  const band = Math.max(4, Math.round(Math.min(width, height) * PHOTO_TEMPLATE_FIT_FRAME_CLEAR_EDGE_RATIO));
  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (x >= band && x < width - band && y >= band && y < height - band) continue;
      pixels[(y * width + x) * 4 + 3] = 0;
    }
  }
  context.putImageData(imageData, 0, 0);
}

function engravingBackgroundCutoff(mask = {}) {
  return clampNumber(Number(mask.backgroundCutoff) || ENGRAVING_BACKGROUND_CUTOFF, 120, 245);
}

function engravingMinDarkness(mask = {}) {
  return clampNumber(Number(mask.minDarkness) || ENGRAVING_MIN_DARKNESS, 0, 0.5);
}

function knockoutBrightLocalArtworkPixels(context, width, height) {
  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const fadeStart = 170;
  const fadeEnd = 232;
  const fadeRange = fadeEnd - fadeStart;

  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3];
    if (alpha <= 0) continue;

    const luma = 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];
    if (luma <= fadeStart) continue;

    const alphaScale = clampNumber((fadeEnd - luma) / fadeRange, 0, 1);
    pixels[i + 3] = alphaScale <= 0.015 ? 0 : Math.round(alpha * alphaScale);
  }

  context.putImageData(imageData, 0, 0);
}

function localEngravingLineColor(metal) {
  if (metal?.value === "gumus") return "#1f2326";
  if (metal?.value === "rose") return "#2d1715";
  return "#24180c";
}

function localEmbossLineColor(metal) {
  if (metal?.value === "gumus") return "#f8fbff";
  if (metal?.value === "rose") return "#ffd8ca";
  return "#ffe6a6";
}

function drawLocalEngravingLayer(context, layer, placement, shape, engraving) {
  const preserveFaceArtwork = layer.dataset.preserveFaceArtwork === "1";
  const effectivePlacement = layer.dataset.detailedFaceArtwork === "1"
    ? detailedLocalOverlayPlacement(placement, shape)
    : placement;
  const width = Math.round(effectivePlacement.width);
  const height = Math.round(effectivePlacement.height);
  const rotation = ((Number(engraving.rotation) || 0) * Math.PI) / 180;
  const shadow = engraving.shadow || {};
  const highlight = engraving.highlight || {};

  context.save();
  clipEngravingShape(context, effectivePlacement, shape);
  context.translate(effectivePlacement.centerX, effectivePlacement.centerY);
  context.rotate(rotation);

  const shadowOpacity = preserveFaceArtwork ? 0 : clampNumber(Number(shadow.opacity) || 0, 0, 0.4);
  if (shadowOpacity > 0) {
    context.save();
    context.globalAlpha = shadowOpacity;
    context.filter = `blur(${clampNumber(Number(shadow.blur) || 0.7, 0, 4)}px)`;
    context.globalCompositeOperation = "multiply";
    context.drawImage(
      layer,
      -width / 2 + Math.round(Number(shadow.offsetX) || 1),
      -height / 2 + Math.round(Number(shadow.offsetY) || 1),
      width,
      height
    );
    context.restore();
  }

  context.globalCompositeOperation = preserveFaceArtwork || engraving.blend !== "multiply" ? "source-over" : "multiply";
  context.drawImage(layer, -width / 2, -height / 2, width, height);

  const highlightOpacity = preserveFaceArtwork ? 0 : clampNumber(Number(highlight.opacity) || 0, 0, 0.25);
  if (highlightOpacity > 0) {
    context.save();
    context.globalAlpha = highlightOpacity;
    context.filter = `blur(${clampNumber(Number(highlight.blur) || 0.3, 0, 2)}px)`;
    context.globalCompositeOperation = "screen";
    drawTintedEngravingLayer(
      context,
      layer,
      "#f7fbff",
      -width / 2 + Math.round(Number(highlight.offsetX) || -1),
      -height / 2 + Math.round(Number(highlight.offsetY) || -1),
      width,
      height
    );
    context.restore();
  }

  context.restore();
}

function drawTintedEngravingLayer(context, layer, color, x, y, width, height) {
  const tinted = document.createElement("canvas");
  tinted.width = layer.width;
  tinted.height = layer.height;
  const tintedContext = tinted.getContext("2d");
  if (!tintedContext) {
    context.drawImage(layer, x, y, width, height);
    return;
  }

  tintedContext.drawImage(layer, 0, 0);
  tintedContext.globalCompositeOperation = "source-in";
  tintedContext.fillStyle = color;
  tintedContext.fillRect(0, 0, tinted.width, tinted.height);
  context.drawImage(tinted, x, y, width, height);
}

function clipEngravingShape(context, placement, shape) {
  const width = Math.round(placement.width);
  const height = Math.round(placement.height);
  const left = Math.round(placement.centerX - width / 2);
  const top = Math.round(placement.centerY - height / 2);
  context.beginPath();
  if (shape === "yuvarlak") {
    context.arc(placement.centerX, placement.centerY, Math.min(width, height) / 2, 0, Math.PI * 2);
  } else if (shape === "oval") {
    context.ellipse(placement.centerX, placement.centerY, width / 2, height / 2, 0, 0, Math.PI * 2);
  } else {
    const radius = localOverlayCornerRadius(width, height, shape);
    roundedRectPath(context, left, top, width, height, radius);
  }
  context.clip();
}

function localOverlayCornerRadius(width, height, shape) {
  const normalizedShape = String(shape || "").trim().toLowerCase();
  const maxRadius = normalizedShape === "dikdortgen" || normalizedShape === "rectangular"
    ? RECTANGULAR_OVERLAY_CORNER_RADIUS
    : SQUARE_OVERLAY_CORNER_RADIUS;
  return Math.min(maxRadius, width * 0.035, height * 0.035);
}
