// HTML sayfalarındaki yerel JS/CSS (ve zaten ?v= taşıyan diğer dosyaların)
// sürüm etiketlerini dosya içeriğinin özetiyle (hash) eşitler.
//
// Neden: vercel.json bu dosyaları ?v= ile istendiğinde 1 yıl önbelleğe alır.
// Dosya değişip etiket değişmezse kullanıcı eski dosyayı görür. Etiket içerikten
// üretildiği için dosya değişince etiket de kendiliğinden değişir.
//
//   npm run assets:version   → etiketleri günceller
//   npm test                 → tests/asset-versions.test.js uyuşmazlıkta başarısız olur
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = fileURLToPath(new URL("..", import.meta.url));

// src="./x.js" | href="/x.css?v=..." gibi yerel referanslar
const REF_PATTERN = /(\s(?:src|href)=")(\.?\/[^"?#]+)(\?v=[^"#]*)?(")/g;
const ALWAYS_VERSIONED = /\.(?:js|css)$/;

export function contentVersion(filePath) {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex").slice(0, 10);
}

export function htmlPages(root = ROOT) {
  return readdirSync(root).filter((name) => name.endsWith(".html"));
}

// Her referans için { page, ref, file, current, expected } döndürür.
export function collectAssetRefs(root = ROOT) {
  const refs = [];
  for (const page of htmlPages(root)) {
    const html = readFileSync(join(root, page), "utf8");
    for (const match of html.matchAll(REF_PATTERN)) {
      const [, , ref, query] = match;
      const shouldVersion = ALWAYS_VERSIONED.test(ref) || Boolean(query);
      if (!shouldVersion) continue;
      const file = join(root, ref.replace(/^\.?\//, ""));
      refs.push({
        page,
        ref,
        file,
        exists: existsSync(file),
        current: query ? query.slice(3) : null,
        expected: existsSync(file) ? contentVersion(file) : null,
      });
    }
  }
  return refs;
}

export function updateAssetVersions(root = ROOT) {
  let changed = 0;
  for (const page of htmlPages(root)) {
    const path = join(root, page);
    const html = readFileSync(path, "utf8");
    const next = html.replace(REF_PATTERN, (all, attr, ref, query, close) => {
      if (!ALWAYS_VERSIONED.test(ref) && !query) return all;
      const file = join(root, ref.replace(/^\.?\//, ""));
      if (!existsSync(file)) return all;
      return `${attr}${ref}?v=${contentVersion(file)}${close}`;
    });
    if (next !== html) {
      writeFileSync(path, next);
      changed += 1;
    }
  }
  return changed;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const changed = updateAssetVersions();
  const missing = collectAssetRefs().filter((r) => !r.exists);
  console.log(`${changed} sayfa güncellendi.`);
  if (missing.length) {
    console.warn("Bulunamayan dosyalar:", missing.map((r) => `${r.page} → ${r.ref}`).join(", "));
    process.exitCode = 1;
  }
}
