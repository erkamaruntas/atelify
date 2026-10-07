export function normalizeDesignOptions(body) {
  const product = normalizeEnum(body.product, ["kolye", "yuzuk"], "yuzuk");
  const productShape = normalizeEnum(body.productShape, ["dikdortgen", "kare", "oval", "yuvarlak"], "yuvarlak");
  const designMode = normalizeEnum(body.designMode, ["emboss", "engrave"], "engrave");
  const canvasAspectRatio = resolveSketchAspectRatio({ product, productShape });
  const productMap = {
    kolye: { label: "Kolye", prompt: "pendant necklace" },
    yuzuk: { label: "Yüzük", prompt: "ring" },
  };
  const shapeMap = {
    dikdortgen: { label: "Dikdörtgen", prompt: "vertical rectangular flat engraving artwork boundary, clearly taller than wide" },
    kare: { label: "Kare", prompt: "square flat engraving artwork boundary with equal width and height, not circular" },
    oval: { label: "Oval", prompt: "vertical oval fitting area at one fixed proportion that is clearly taller than wide, not round or circular" },
    yuvarlak: { label: "Yuvarlak", prompt: "round circular flat engraving artwork boundary" },
  };
  const modeMap = {
    emboss: { label: "Detaylı", prompt: "negative detailed white or silver engraving artwork on a solid black canvas" },
    engrave: { label: "Minimalist", prompt: "minimal black line artwork for direct engraving" },
  };

  return {
    canvasAspectRatio,
    designMode,
    designModeLabel: modeMap[designMode].label,
    designModePrompt: modeMap[designMode].prompt,
    product,
    productLabel: productMap[product].label,
    productPrompt: productMap[product].prompt,
    productShape,
    shapeLabel: shapeMap[productShape].label,
    shapePrompt: shapeMap[productShape].prompt,
  };
}

// Eskiz artık ŞEKİLDEN BAĞIMSIZ üretilir: her zaman 1:1 kare tuval. Böylece tek bir
// eskiz, 2. aşamada (finish) yuvarlak/kare/oval/dikdörtgen herhangi bir ürün şekline
// kırpılıp oturtulabilir. Şekil sınırı/çerçeve yalnız 2. aşamada eklenir; bu yüzden
// 1. aşamada şekle göre değişen bir oran yoktur.
export function resolveSketchAspectRatio() {
  return "1:1";
}

export function isDetailedSketch(opts = {}) {
  return opts.designMode === "emboss";
}

export function buildSketchPrompt(opts) {
  if (opts.designMode === "emboss") {
    return buildDetailedSketchPrompt(opts);
  }
  return buildMinimalistSketchPrompt(opts);
}

// DETAILED / Detaylı: one shared black-plate engraving prompt for all products
// and shapes. Frames are added later by the product/template stage.
function buildDetailedSketchPrompt({ canvasAspectRatio = "1:1" } = {}) {
  return [
    "DETAYLI STAGE 1 TASK: Bana IMAGE 1'deki konunun siyah beyaz sadece vektörel çizimini çıkar; sadece çizim çıkar.",
    "Bu çizim sonradan plaka/yüzük/kolye üzerine kazınacak. Şu aşamada ürün, yüzük, kolye, plaka renderı, mockup veya fotoğraf üretme.",
    "ONLY IMAGE 1 EXISTS: use the uploaded image as the single and only source for both subject and composition. Do not use, imagine, borrow, or introduce any other reference image, face, person, pose, hairstyle, clothing, or composition.",
    "Copy only IMAGE 1's visible person, face, logo, object, tattoo, drawing, pose, crop, proportions, silhouette, readable text, and composition.",
    "SOURCE GEOMETRY LOCK: preserve IMAGE 1's exact camera angle, head turn, head tilt, gaze direction, face orientation, shoulder angle, crop, framing, and silhouette. Do NOT rotate, straighten, center-correct, beautify, symmetrize, mirror, zoom out, zoom in, or convert the subject into a front-facing studio portrait.",
    "ABSOLUTE COLOR RULE: pure black (#000000) and pure white (#ffffff) only. No yellow, no gold, no cream, no ivory, no beige, no warm-white, no silver, no gray, no off-white, no colored antialiasing, no tinted highlights.",
    "Most important: the whole output canvas background must be pure solid black from edge to edge. Draw the subject using only pure white shapes and pure black cut/detail lines.",
    "PORTRAIT VALUE RULE: if IMAGE 1 is a face/person, do NOT make the face a black void. The main face/skin/neck areas must read as white engraved surface, with black only for hair, deep shadow, pupils, eyebrows, nostrils, mouth line, beard/stubble marks, and internal detail cuts. Keep the eyes readable with pupils/iris/detail; do not turn the eyes into blank white lenses.",
    "No surrounding shape: do NOT draw any oval, circle, square, rectangle, badge, frame, rim, border, halo, plate edge, ring line, pendant outline, or decorative container around the drawing. We will add the correct frame later.",
    `Output must be a flat ${canvasAspectRatio} artwork asset only, centered and large. No 3D, no metal body, no hand, no finger, no chain, no product photo, no shadows, no background scene.`,
    "Use clean black-and-white vector-style engraving: crisp edges, bold readable cuts, large flat black areas, controlled simple linework. Keep the drawing detailed enough to recognize the subject, but not photo-realistic.",
    "No gray, no color, no gradients, no soft shading, no blur, no texture, no dots, no stipple, no halftone, no dense hatching, no fine cross-hatching, no tiny noisy scratches.",
    "Lines must be clear, separated, and readable when engraved very small. If a detail would become muddy on a ring or pendant, simplify it into a larger clean shape or omit it.",
    "SOURCE TYPE RULES: Portrait/person: preserve exact likeness, face shape, hairline, eyebrows, eyes, nose, mouth, facial hair, age, pose, expression, head angle, camera angle, crop, shoulder position, and silhouette while simplifying into engraved lines. If the face is three-quarter view, keep it three-quarter view. If the head is tilted or turned, keep the same tilt and turn. Logo/crest/monogram/text: copy only visible shapes and readable characters; never complete, guess, correct, translate, or invent missing letters. Tattoo/drawing/symbol: clean the same linework without redesigning it. Object/animal/building: preserve the visible silhouette, angle, main contours, and distinctive features; omit unclear tiny details.",
    "This is a trace-and-clean task, not a redesign. If unsure, use fewer, thicker lines and leave uncertain details black.",
    "Final result: only the extracted pure-black-background pure-white vector engraving drawing, with no frame and no extra object.",
  ].join(" ");
}

// MINIMALIST / Minimalist: clean black line stencil on white.
// Şekilden tamamen bağımsız (frame-free): tek bir 1:1 eskiz üretilir, şekil sınırı
// 2. aşamada eklenir.
function buildMinimalistSketchPrompt(opts) {
  return buildFrameFreeMinimalistSketchPrompt(opts);
}

function buildFrameFreeMinimalistSketchPrompt({ canvasAspectRatio = "1:1", designModeLabel, designModePrompt }) {
  return [
    "MINIMALIST STAGE 1 TASK: Convert IMAGE 1 into a faithful black-and-white engraving stencil drawing only.",
    "FRAME-FREE OUTPUT: create only the raw subject/motif line artwork. Do NOT draw any oval, circle, square, rectangle, badge, medallion, border, rim, ring, outline, frame, plate edge, container, halo, or decorative enclosure.",
    "The selected product shape is handled after generation by deterministic post-processing. Ignore the final shape while drawing; do not create a shape boundary yourself.",
    "ONLY IMAGE 1 EXISTS: use the uploaded image as the single and only source for subject, pose, composition, visible text, symbols, and proportions. Do not use any other reference image or imagined cleaner version.",
    `Generate the output on a ${canvasAspectRatio} canvas as a flat isolated template only.`,
    "Canvas must be plain pure white. Draw pure black artwork only. No gray, no color, no gradients, no shading, no fill tones, no texture, no watermark.",
    "The output must be a flat black-and-white VECTOR-STYLE 2D trace with crisp sharp edges and clean separated lines.",
    "CRITICAL FRAME RULE: if the source image contains an outer oval/circle/square/rectangle frame, border, ring, rim, badge edge, or plate outline, do NOT copy that outer boundary as the final frame. Extract only the subject/motif/text/inner artwork; our system adds the required frame later.",
    "CRITICAL TEXT RULE: Render ONLY letter shapes, numbers, initials, dates, monograms, school names, or words that are physically visible in the source. If text is partially obscured or unreadable, trace only visible characters. Never complete, guess, correct, translate, or invent missing letters.",
    "CRITICAL MOTIF RULE: Copy only what you see in the logo, crest, shield, seal, emblem, symbol, and linework. Do not redesign, beautify, mirror, symmetrize, or add details. If part of the design is unclear, omit it rather than guessing.",
    `Simplify only enough to make the visible artwork usable as ${designModePrompt}; unclear details should be omitted or reduced, not invented. When the subject is a person or face, simplicity must never override likeness: keep the real facial proportions and identity features even while using few, clean lines.`,
    "For ordinary photos, trace the main visible subject itself; do not turn it into a new crest, coin, badge, logo, medallion, or jewelry face.",
    "If the uploaded image is a portrait, the minimal line drawing must still be a clear, recognizable likeness of that specific person: capture their actual face shape, hairline/baldness, eyebrows, eye shape and spacing, nose, exact mustache/beard shape, mouth, jaw, wrinkles, age, and expression with confident clean lines. Do not output a generic or different face.",
    "Do not add cross-hatching, engraving texture, shading strokes, decorative fill lines, extra parallel lines, or noisy scratches.",
    "Absolutely forbidden: photorealistic jewelry render, worn ring photo, display hand, display finger, product-model skin, metal body, black stone, glossy surface, studio backdrop, shadows, perspective, or 3D mockup. The result is only the frame-free engraving stencil artwork.",
    `The selected surface treatment will be ${designModeLabel}.`,
  ].join(" ");
}

function normalizeEnum(value, allowed, fallback) {
  const normalized = String(value || "").trim().toLowerCase().replace("dikdörtgen", "dikdortgen");
  return allowed.includes(normalized) ? normalized : fallback;
}
