export const RATIO_OPTIONS = {
  portrait: { aspectRatio: "4:5", label: "4:5" },
  square: { aspectRatio: "1:1", label: "1:1" },
  wide: { aspectRatio: "16:9", label: "16:9" },
};

export function buildMockupPrompt({ channel, designMode, metal, product, productShape, ratioLabel, scene, sidePrint, sourceTitle, surface, visualStyle }) {
  const productMap = {
    kolye: "pendant necklace",
    yuzuk: "ring",
  };
  const shapeMap = {
    dikdortgen: "rectangular",
    kare: "square",
    oval: "oval",
    yuvarlak: "round",
  };
  const modeMap = {
    emboss: "raised embossed relief detail",
    engrave: "engraved recessed detail",
  };
  const metalMap = {
    altin: "polished gold",
    gumus: "polished silver",
    rose: "rose gold",
  };
  const surfaceMap = {
    fircalanmis: "a brushed satin metal finish",
    mat: "a matte metal finish",
    parlak: "a glossy high-polish metal finish",
    vintage: "an antiqued, oxidized vintage metal finish",
  };
  const metalColor = metalMap[metal] || metalMap.altin;
  const surfaceFinish = surfaceMap[surface] || surfaceMap.parlak;
  // Hem kazıma (engrave) hem kabartma (emboss) modunda oyuk/zemin bölgeleri
  // ARTIK siyaha boyanmıyor / oksitlenmiyor: aynı metal renginde, sadece ince
  // mat/pütürlü (kumlanmış) doku ve hafif derinlik gölgesiyle ayrışan çıplak metal.
  // Ton metale göre değişir: gümüşte koyu gri, altında koyu/antik sarı-altın,
  // rose'da koyu rose-gold. Doku aynı (kumlanmış mat), sadece renk tonu farklı.
  const recessTone = {
    altin: "a matte, sand-blasted frosted YELLOW-GOLD tone — a warm, clearly YELLOW gold, the SAME yellow-gold color as the rest of the piece, just with a matte frosted finish instead of bright polish. It MUST stay plainly yellow gold: NEVER black, NEVER charcoal, NEVER dark gray, NEVER brown, NEVER olive/green, NEVER bronze-brown and NEVER silver — and NOT darkened. Think 'matte yellow gold background', not a dark or blackened background",
    gumus: "a darker, matte, sand-blasted frosted gunmetal / darkened-steel GRAY tone",
    rose: "a darker, matte, sand-blasted frosted darker ROSE-GOLD tone (a darkened rosy pink-gold that stays clearly rose-toned — never gray and never plain yellow)",
  }[metal] || "a darker, matte, sand-blasted frosted gunmetal / darkened-steel GRAY tone";
  const recessContrastNote =
    `the recessed/textured areas read as ${recessTone}. They are only SLIGHTLY toned down from the bright polished design — they stay in the SAME metal color family and are distinguished MAINLY by their matte, frosted, sand-blasted finish versus the bright glossy polish of the design, NOT by being darkened into a dark, black, charcoal, gray, brown, olive/green or muddy background. Keep the design legible through this finish-and-depth difference, NEVER by turning the background into a dark or near-black field. They stay real textured bare metal rather than bright white, pure dead black, or any painted/enamel fill, all kept on one flat plane (flat engraving, never a raised 3D relief)`;
  const isPendant = product === "kolye";
  const productFaceTerm = isPendant ? "pendant face" : "ring face";
  const ringWearingOrientationRule = !isPendant
    ? "RING WEARING ORIENTATION (CRITICAL — FACE MUST READ UPRIGHT, NEVER UPSIDE DOWN): the engraved face artwork must appear RIGHT-WAY-UP from the camera's / viewer's point of view in the final photo, in the EXACT same upright rotation as the uploaded source render. A portrait's head/top stays at the TOP of the frame and the chin/shoulders/base stays at the BOTTOM; lettering, crest, monogram, date and any text must read normally left-to-right and upright, never inverted, never rotated, never mirrored. It is a hard error for the worn ring to show the face artwork upside down, sideways, tilted past a few degrees, or back-to-front. The ring is worn in the normal forward direction on the finger (never backwards): orient the worn ring so the TOP edge of the uploaded face artwork points toward the fingertip and fingernail while the BOTTOM edge points toward the knuckle, wrist and palm — but ABOVE ALL, after any natural camera angle, the artwork must still read upright to the viewer. Do NOT rotate the whole ring 180 degrees around the finger axis, do NOT flip the signet head end-for-end, do NOT turn the face upside down, and do NOT make it look like the model put the ring on backwards or wore it inverted."
    : "";
  const sidePrintIdentityRule = sidePrint && !isPendant
    ? "SIDE-SHOULDER ENGRAVINGS (CRITICAL — LEFT vs RIGHT MUST NOT BE CONFUSED): the input images are provided in a FIXED ORDER. The 1st image is the main ring (front face). The 2nd image is the LEFT-shoulder engraving. The 3rd image is the RIGHT-shoulder engraving. These two shoulder references are TWO DIFFERENT engravings — they are NOT the same artwork and NOT interchangeable. They are NOT separate objects, extra rings, stickers, decals, or scene props: each shows the real engraving that belongs on its own side of THIS SAME finished ring's band. The same left/right arrangement is also visible in the 1st (main) image: the engraving sitting on the LEFT side of that main composite is the LEFT shoulder, and the engraving on the RIGHT side is the RIGHT shoulder — use that visible arrangement as the ground truth for which engraving goes where (left stays left, right stays right, exactly as shown). Engrave the 2nd-image artwork onto the ring's LEFT shoulder ONLY and the 3rd-image artwork onto the ring's RIGHT shoulder ONLY, rendered as genuine recessed metal engravings in the same metal and finish as the band. The two shoulders must carry their OWN DISTINCT engravings — it is a hard error to put the same engraving on both shoulders. The finished photo must NOT become a one-sided or blank-shouldered ring: keep BOTH distinct shoulder engravings as part of the ring identity, each on its correct side. Show whichever shoulders the camera angle naturally reveals, and when both shoulders are visible each must clearly carry ITS OWN corresponding engraving (left engraving on the left, right engraving on the right). Do NOT leave a shoulder blank, do NOT copy or duplicate one shoulder's engraving onto both sides, do NOT drop or omit either engraving, do NOT mirror, swap, or flip left and right, and do NOT place these reference engravings anywhere except on their correct shoulder. If the main image additionally shows these engravings as flat side panels beside the face, treat all of them as the very same two shoulders, never as extra panels or extra rings."
    : "";
  const sceneMap = {
    manken: [
      "SCENE MODE: WORN ON A REAL LIVING HUMAN. This must be an on-body sales photograph of the jewelry worn by a real, living human person, not a standalone tabletop packshot, product cutout, or catalog object render.",
      "ABSOLUTELY NO MANNEQUIN: do NOT place the jewelry on a mannequin, dress form, display bust, neck bust, jewelry stand, foam/velvet display form, plastic or wax dummy, store-window display, or any artificial body. The body wearing the piece must be 100% a real human being with natural living skin (visible pores, fine skin texture, natural skin tone variation, soft veins, subtle imperfections), not smooth synthetic plastic, resin, or matte display material.",
      isPendant
        ? "Place the same pendant naturally on the upper chest / décolletage of a real, living human FEMALE model — a real woman with natural living skin (real neck, collarbone and skin clearly visible) — framed close-up so the pendant face occupies a large area of the composition with the face turned directly toward the camera. The wearer must read clearly as a woman, never a man and never a genderless mannequin/bust."
        : "Place the same ring naturally on the finger of a real human hand (real living skin, natural finger shape, knuckle creases, and nail visible), framed close-up so the signet face occupies a large area of the composition with the face turned directly toward the camera.",
      ringWearingOrientationRule,
      isPendant
        ? "GRAVITY & HANGING REALISM (CRITICAL): the pendant hangs from the chain and obeys gravity. The chain goes around the neck and the pendant hangs DOWN from it, coming to rest LOW on the upper chest / sternum, well BELOW the collarbone and throat — it must lie FLAT against the chest skin, touching and resting on the body with realistic contact shadow. The pendant must NEVER float in mid-air, hover off the skin, levitate, or sit up high at throat / neck / collarbone / windpipe level as if pinned there. The chain must be visibly taut and supporting the pendant's weight from above, with the bail at the TOP of the pendant where the chain attaches; the pendant cannot sit higher than the point where the chain naturally lets it fall. No part of the pendant may hang off the body into empty space or appear weightless."
        : "",
      `CRITICAL — ENGRAVING VISIBILITY: The engraved/embossed top-face artwork on the ${isPendant ? "pendant" : "ring"} MUST stay razor-sharp and high-contrast, exactly as detailed as the uploaded source. Reproduce every line, hatch, stipple dot, letter, number, border, crest detail, and portrait stroke from the source face artwork without softening, smoothing, blurring, or simplifying.`,
      `Angle the ${productFaceTerm} directly toward the camera at 0–15° tilt maximum so the entire engraving is visible; never let the ${productFaceTerm} foreshorten, lean away, hide behind a ${isPendant ? "chain or clothing fold" : "finger"}, or sit at a steep angle that obscures the design.`,
      `Preserve the strong contrast of the engraving — ${recessContrastNote}. Do not soften or wash the design under skin tone reflections, soft lighting, or shadow.`,
      `Use focused close-range studio-quality lighting that highlights the engraved linework. Keep the real human ${isPendant ? "neck/chest skin" : "hand/finger skin"} natural and neutral, with realistic contact shadows, but never let lighting reduce engraving legibility.`,
      isPendant
        ? "If a chain is visible, keep it slim, neutral, and secondary; the pendant face must remain the visual hero. Do not crop or hide the pendant face behind the chain or fabric folds."
        : "",
    ].filter(Boolean).join(" "),
    mockup: [
      "SCENE MODE: STANDALONE PRODUCT PACKSHOT ON A PURE WHITE BACKGROUND. This must be a clean e-commerce product-listing photograph of the jewelry alone, exactly like a marketplace catalog hero image — not a worn/on-body model image and not a styled lifestyle scene.",
      "BACKGROUND (CRITICAL): a seamless, evenly lit, plain PURE WHITE studio background (bright white, like #FFFFFF to a very light cool-white). No colored backdrop, no warm/beige/cream tint, no gradient, no textured surface, no tabletop wood/stone/fabric, no props, no decorative scene, no shadows cast across the backdrop. The product sits on this clean white field with only a soft, subtle, realistic contact shadow directly beneath it for grounding.",
      "No human body, hand, finger, neck, mannequin, skin, clothing, worn context, lifestyle model, jewelry box, packaging, display stand, or any prop may appear in this scene — the jewelry is the only object in the frame, centered with comfortable negative space around it.",
      "If the uploaded source is a flat front render or straight product render, reinterpret it as the same real three-dimensional jewelry piece photographed from a slight, natural product camera angle (near front, 0–20° tilt).",
      isPendant
        ? "For a pendant, show the front face large and readable, with the bail and a short section of slim chain visible at the top, floating cleanly on the pure white background like a jewelry e-commerce listing photo."
        : "For a ring, show the front face large and readable with the band receding naturally, presented cleanly on the pure white background like a jewelry e-commerce listing photo.",
      `CRITICAL — ENGRAVING VISIBILITY: The engraved top-face artwork must stay razor-sharp and high-contrast. Preserve every line, hatch, stipple, lettering, border, crest detail, and portrait stroke from the source with maximum clarity; do not soften, smooth, blur, or simplify the design. The contrast comes from finish and depth: ${recessContrastNote}.`,
      `Keep the ${productFaceTerm} angled directly toward the camera so the entire engraving is fully visible and legible at thumbnail size; do not let perspective foreshorten, tilt away, or compress the engraving.`,
      `Use clean, even, soft studio lighting with realistic metal reflections and a gentle grounded contact shadow, but lighting must not wash out, glare across, or dull the engraved face. The ${productFaceTerm} stays in razor-sharp focus.`,
      isPendant
        ? "Do not include a hand, person, neck bust, jewelry box, packaging, or display stand. A small portion of slim chain near the bail is acceptable but optional."
        : "Do not include a hand, person, neck bust, jewelry box, packaging, or display stand.",
    ].join(" "),
  };
  const channelMap = {
    etsy: [
      "CHANNEL STYLE: Etsy marketplace listing hero image.",
      "Use an approachable handmade/small-studio sales look: warm neutral background, natural but controlled light, product large in frame, and strong thumbnail readability.",
      "Keep the composition simple and trustworthy, with very restrained props only if they do not compete with the jewelry. No ad layout, no text overlay, no logo graphic, no price tag.",
    ].join(" "),
    instagram: [
      "CHANNEL STYLE: Instagram social product post.",
      "Use a more editorial, scroll-stopping composition with tasteful mood, richer shadows, and stronger material texture than a plain listing photo.",
      "The image may feel more styled, but the jewelry face must remain fully visible and sharp. No captions, stickers, UI elements, text overlay, added logos, or extra products.",
    ].join(" "),
    katalog: [
      "CHANNEL STYLE: print catalog product image.",
      "Use precise catalog photography: neutral gray or white background, even controlled lighting, true metal color, consistent scale, full product visibility, and technical clarity.",
      "Avoid lifestyle mood, dramatic crops, heavy props, social-media styling, and decorative scene clutter. Prioritize product shape, face artwork, and material accuracy.",
    ].join(" "),
    shopify: [
      "CHANNEL STYLE: Shopify product page hero image.",
      "Use a clean premium e-commerce look: polished studio lighting, crisp product edges, refined reflections, web-ready negative space, and a consistent brand-store feel.",
      "Make it conversion-focused and upscale, less casual than Etsy and less editorial than Instagram. No text overlay, no banner design, no logo graphic, no price tag.",
    ].join(" "),
  };
  const styleMap = {
    dogal: "natural daylight, warm neutral materials, soft realistic shadows",
    editorial: "editorial jewelry styling with controlled composition and polished art direction",
    luks: "luxury boutique lighting, premium materials, elegant high-end styling",
    minimal: "minimal clean studio styling, warm white background, restrained props",
  };
  const sourceCopy = sourceTitle ? `The uploaded design source is named "${sourceTitle}".` : "";

  // EN ÖNEMLİ kural: tasarımın siyah alanları metale KAZINMIŞ (oyulmuş) bölgelerdir.
  // Boya/mine/baskı/sticker/siyah taş DEĞİL. Mod'a göre kazıma (recessed) ya da
  // kabartma (raised relief). Bu, AI'ın siyahı yanlış malzeme sanmasını engeller.
  const engravingPhysics = designMode === "emboss"
    ? `ENGRAVING PHYSICS — FLAT ENGRAVING ONLY (kazıma), NOT A RAISED 3D RELIEF AND NOT A PRINTED IMAGE: this is the detailed/filled engraving style, but it is still PURE FLAT ENGRAVING cut into the flat face of the metal — it is NOT embossed, NOT a raised relief, NOT a bas-relief, and NOT a 3D sculpture. The design shapes are bright polished ${metalColor} that sit FLUSH with the flat face, on the SAME single flat plane, while the surrounding field is engraved/recessed and given a fine matte, lightly granular, sand-blasted / frosted tool texture (a slightly rough, "pütürlü" bare-metal finish) in ${recessTone}, only SLIGHTLY toned down from the bright polished design and staying in the SAME metal color family — the design stays legible MAINLY through the matte-versus-polished finish difference, NEVER by darkening the field into a dark, black, gray, brown or olive background. The design must NOT rise, pop, bulge, round out, or stand proud off the surface; no part of the figure (face, body, wings, limbs, drapery, hair) may protrude, balloon into a 3D model, or cast its own sculptural drop-shadow. The ONLY depth is the very shallow incised engraving cut that separates the bright design from the darker recessed field — a crisp engraved boundary line, not a raised lip or edge. Keep the recessed field real textured bare metal: NOT bright white, NOT pure dead black, and NOT filled with paint, ink, enamel, or an oxidized coating. NEVER render it as flat dead black, a black sticker, a decal, glossy enamel/epoxy paint or ink, a printed/stamped/UV-printed graphic, or a separate black gemstone/onyx inlay. UNIFORM DEPTH: the recessed field is engraved to the SAME consistent shallow depth and matte texture everywhere — no shallow, partial, or skipped spots.`
    : `ENGRAVING PHYSICS — REAL HAND-ENGRAVED BARE METAL (kazıma), NOT A PRINTED IMAGE AND NOT BLACKENED: every shape of the design is metal that has been physically CARVED AWAY into recessed grooves. These grooves are NOT oxidized, NOT blackened, NOT antiqued, NOT filled with paint, ink, enamel, or niello, and NOT colored in at all — they are bare ${metalColor} of the SAME tone as the surrounding surface, only with a fine matte, lightly granular, sand-blasted / frosted tool texture (a slightly rough, "pütürlü" bare-metal finish) left inside the cut. The design reads against the surface purely through this contrast of finish and depth: the carved grooves are soft, matte and lightly textured with gentle shadow pooling at the deepest point and a faint metallic sheen on the bevelled cut walls, while the surrounding flat ${metalColor} surface stays smoother, brighter and more reflective, with a crisp bright polished highlight running along the shoulder where the flat surface meets each cut. Give the carved grooves ${recessTone}, only SLIGHTLY toned down from the bright polished surface and staying in the SAME metal color family — the design stays legible MAINLY through the matte-versus-polished finish difference, NEVER by darkening the grooves into a dark, black, gray, brown or olive background — and keep them real textured bare metal: NOT bright white, NOT pure dead black, and NOT filled with paint, ink, enamel, niello, or an oxidized coating. NEVER render them as flat dead black, a black sticker, a decal, glossy enamel/epoxy paint or ink, or a separate onyx inlay. UNIFORM DEPTH: every carved region (large fields and fine lines alike) is cut to the SAME consistent depth with the SAME fine matte texture — no shallow, skipped, or un-engraved patches — even though light naturally plays across that depth.`;

  return [
    `The uploaded image is a real, finished ${metalColor} ${shapeMap[productShape] || shapeMap.yuvarlak} ${productMap[product] || productMap.yuzuk} product render — the engraving is ALREADY applied to the ${productFaceTerm}. It is the actual product to photograph, NOT a flat design to redraw and NOT a blank piece to engrave.`,
    sourceCopy,
    `Re-photograph THIS EXACT piece as a professional sales and presentation photograph. Keep its identity identical to the uploaded render — same ${metalColor} (${surfaceFinish}), same shape, proportions, band/bail, silhouette, and the same engraved ${productFaceTerm} artwork in the same position, scale, and rotation. You may relight it and shoot it from a natural product camera angle, but do NOT redesign the piece, rebuild the band, swap the metal or finish, resize/move/re-letter the engraving, or nest the existing product inside another ring or pendant.`,
    engravingPhysics,
    `FLAT ENGRAVING — ABSOLUTELY NO 3D RELIEF ON THE FACE: the artwork on the ${productFaceTerm} is FLAT engraving cut into the flat metal face and must stay within that single flat plane. Do NOT turn it into a raised 3D relief, high-relief, bas-relief, embossed sculpture, dimensional figurine, cast statuette, or popped-out carved model. No element of the design may bulge, round out, lift off, float above, or cast a separate sculptural drop-shadow as if it were a 3D object glued onto the surface. The face reads as one smooth flat surface with engraving cut into it — any depth comes ONLY from shallow engraved grooves and tonal/texture difference, never from the design rising above the plane. The three-dimensional form belongs ONLY to the whole jewelry body (band, bail, outer edges, rounded plate); the engraved picture itself stays strictly flat.`,
    sidePrintIdentityRule,
    `PRESERVE THE FACE ENGRAVING EXACTLY: reproduce the engraved ${productFaceTerm} artwork from the uploaded render line-for-line — every line, hatch, stipple dot, letter, number, date, monogram, border curve, crest element, emblem, and portrait stroke, rendering the recessed/background areas as fine matte, lightly textured bare-metal areas in ${recessTone}, only slightly toned down and in the SAME metal color family (NOT bright white, NOT pure dead black, NOT a dark/gray/olive/brown field, NOT painted) against the brighter polished un-engraved flat areas, all on one flat plane. Do NOT invent, complete, beautify, simplify, rotate, mirror, wash out, blur, smooth, hide under glare/highlights, crop, flatten into a blank disk, or replace it with generic decoration. It must stay razor-sharp and legible even at small listing-thumbnail size.`,
    "Lighting, reflections, and camera angle may add realism, but must not reduce the engraving's sharpness, contrast, or completeness, and must not foreshorten the face so far that the artwork becomes unreadable.",
    sceneMap[scene] || sceneMap.mockup,
    // Kanal ve estetik ton seçenekleri 3. aşamada (mockup) kaldırıldı: bu aşama
    // her zaman beyaz arka planlı sade ürün görseli üretir. Kanal/ton ipuçları
    // yalnızca manken (4. aşama) sahnesinde uygulanır.
    scene === "manken" ? (channelMap[channel] || channelMap.etsy) : "",
    scene === "manken" ? `Use ${styleMap[visualStyle] || styleMap.minimal}.` : "",
    `Generate the image in the selected ${ratioLabel} photo aspect ratio. Keep the jewelry sharp, premium, fully visible, and commercially usable.`,
    "Do not add new text, new logos, watermark, price tag, extra jewelry, duplicated product, distorted hands, malformed mannequin, transparent background, checkerboard, sketch, vector art, unfinished prototype, or unrelated props. Do not replace existing lettering or emblem with invented words.",
  ].filter(Boolean).join(" ");
}
