/**
 * Hafif sunucu tarafı içerik moderasyonu.
 *
 * Amaç: kullanıcının yazdığı serbest metin alanlarının (tasarım başlığı, proje
 * adı, üretim talebi notu vb.) AI sağlayıcısına gönderilmeden veya kalıcı olarak
 * saklanmadan önce, açıkça yasaklı içerik barındırmadığını kontrol etmek.
 *
 * Bu katman, sağlayıcı tarafındaki görsel güvenlik filtresinin (safety_tolerance)
 * yerine değil, ona EK olarak çalışır. Kapsamı bilinçli olarak dar tutulmuştur;
 * yanlış pozitifleri azaltmak için yalnızca yüksek riskli kategorilere odaklanır
 * ve zamanla genişletilebilir.
 */

export class ContentModerationError extends Error {
  constructor(message, { field, category } = {}) {
    super(message);
    this.name = "ContentModerationError";
    this.statusCode = 422;
    this.code = "content_blocked";
    this.field = field || null;
    this.category = category || null;
  }
}

export function isContentModerationError(error) {
  return Boolean(error) && error.name === "ContentModerationError";
}

/**
 * Metni karşılaştırma için normalize eder: küçük harfe çevirir, Türkçe/aksanlı
 * karakterleri sadeleştirir, basit leetspeak ikamelerini geri alır ve boşlukları
 * tek boşluğa indirger. Böylece "ç0cuk", "c h i l d" gibi kaçış denemeleri de
 * yakalanır.
 */
function normalizeForMatch(value) {
  let text = String(value || "").toLowerCase();

  // Aksan/diakritik temizliği (Türkçe dahil).
  text = text.normalize("NFKD").replace(/[̀-ͯ]/g, "");
  text = text
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ç/g, "c")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u");

  // Basit leetspeak ikameleri.
  const leet = { 0: "o", 1: "i", 3: "e", 4: "a", 5: "s", 7: "t", "@": "a", $: "s" };
  text = text.replace(/[013457@$]/g, (ch) => leet[ch] || ch);

  // Harf araları boşluk/nokta/tire ile bölünmüşse ("c-h-i-l-d") birleştir, sonra
  // genel boşlukları tek boşluğa indir.
  text = text.replace(/\b(\w)[\s.\-_]+(?=\w\b)/g, "$1");
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

/**
 * Yasaklı kalıplar. Her giriş bir kategori ve o kategoriye ait regex listesi
 * içerir. Regex'ler normalize edilmiş metne karşı çalışır.
 *
 * Not: Bu liste hukuki/operasyonel ihtiyaca göre genişletilmelidir. En kritik
 * kategori (reşit olmayanların cinsel istismarı) öncelikli olarak kapsanmıştır.
 */
const BLOCK_RULES = [
  {
    category: "csae",
    label: "reşit olmayanların cinsel istismarı",
    patterns: [
      /\bchild\s?(porn|sex|sexual|nude|naked|abuse)\b/,
      /\b(cp|csam|pedo|pedophil|paedophil)\w*\b/,
      /\b(cocuk|kiz|oglan|bebe|resit\s?olmayan)\s+(porno\w*|seks\w*|ciplak\w*|cinsel\w*|istismar\w*)/,
      /\b(loli|shota)\b/,
      /\bminor\s?(sex|sexual|nude|porn)\b/,
    ],
  },
  {
    category: "explicit_sexual",
    label: "müstehcen/cinsel içerik",
    patterns: [/\b(porn|porno|hardcore\s?sex|xxx)\b/, /\b(rape|tecavuz)\b/],
  },
  {
    category: "violence_terror",
    label: "şiddet/terör içeriği",
    patterns: [
      /\b(bomb\s?(making|recipe)|nasil\s?bomba\s?yap)\b/,
      /\b(behead|kafa\s?kesme|katliam\s?talimat)\b/,
    ],
  },
  {
    category: "hate",
    label: "nefret söylemi",
    patterns: [/\b(gas\s?the|soykirim\s?yapal)\b/],
  },
];

/**
 * Verilen metni yasaklı kalıplara karşı kontrol eder. Eşleşme bulunursa
 * ContentModerationError fırlatır. Boş/whitespace metinler güvenli sayılır.
 *
 * @param {string} value İncelenecek metin.
 * @param {{ field?: string }} [options] Hata mesajında kullanılacak alan adı.
 */
export function assertContentAllowed(value, options = {}) {
  const raw = String(value || "").trim();
  if (!raw) return;

  const normalized = normalizeForMatch(raw);
  if (!normalized) return;

  for (const rule of BLOCK_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(normalized)) {
        throw new ContentModerationError(
          "Girdiğiniz içerik topluluk kurallarımıza aykırı olduğu için işleme alınamadı.",
          { field: options.field || null, category: rule.category }
        );
      }
    }
  }
}

/**
 * Birden fazla alanı tek seferde kontrol eder.
 * @param {Array<{ value: string, field?: string }>} entries
 */
export function assertAllContentAllowed(entries) {
  if (!Array.isArray(entries)) return;
  for (const entry of entries) {
    if (!entry) continue;
    assertContentAllowed(entry.value, { field: entry.field });
  }
}
