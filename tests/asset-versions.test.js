import { describe, expect, it } from "vitest";
import { collectAssetRefs } from "../scripts/asset-versions.mjs";

// vercel.json, ?v= ile istenen JS/CSS'i 1 yıl önbelleğe alır. Etiket dosya
// içeriğiyle uyuşmazsa kullanıcılar eski dosyayı görür. Düzeltmek için:
//   npm run assets:version
describe("HTML asset sürüm etiketleri", () => {
  const refs = collectAssetRefs();

  it("en az bir referans bulur", () => {
    expect(refs.length).toBeGreaterThan(0);
  });

  it("referans verilen her dosya var", () => {
    const missing = refs.filter((r) => !r.exists).map((r) => `${r.page} → ${r.ref}`);
    expect(missing).toEqual([]);
  });

  it("her ?v= etiketi dosya içeriğiyle eşleşir (npm run assets:version)", () => {
    const stale = refs
      .filter((r) => r.exists && r.current !== r.expected)
      .map((r) => `${r.page} → ${r.ref} (v=${r.current ?? "yok"}, olmalı ${r.expected})`);
    expect(stale).toEqual([]);
  });
});
