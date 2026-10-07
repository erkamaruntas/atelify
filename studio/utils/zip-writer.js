// Tarayıcıda bağımlılıksız ZIP üretimi (STORE / sıkıştırmasız).
// Görseller (PNG/JPG/WebP) zaten sıkıştırılmış olduğundan deflate kazanç sağlamaz;
// bu yüzden yalnızca dosyaları bir araya koyan sade bir yazıcı yeterli.
(function (root) {
  const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[n] = c >>> 0;
    }
    return table;
  })();

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i += 1) {
      crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function dosDateTime(date) {
    const d = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
    const year = Math.max(1980, d.getFullYear());
    return {
      time: (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2),
      date: ((year - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
    };
  }

  // files: [{ name: string, data: Uint8Array, date?: Date }] → Uint8Array (ZIP arşivi)
  function createZipBytes(files) {
    const encoder = new TextEncoder();
    const entries = [];
    let localSize = 0;

    for (const file of files) {
      const nameBytes = encoder.encode(file.name);
      const data = file.data instanceof Uint8Array ? file.data : new Uint8Array(file.data || []);
      const { time, date } = dosDateTime(file.date);
      entries.push({ nameBytes, data, crc: crc32(data), time, date, offset: localSize });
      localSize += 30 + nameBytes.length + data.length;
    }

    const centralSize = entries.reduce((sum, entry) => sum + 46 + entry.nameBytes.length, 0);
    const out = new Uint8Array(localSize + centralSize + 22);
    const view = new DataView(out.buffer);
    let p = 0;

    // Bit 11: dosya adları UTF-8 (Türkçe karakterler için).
    const FLAGS = 0x0800;

    for (const entry of entries) {
      view.setUint32(p, 0x04034b50, true);
      view.setUint16(p + 4, 20, true);
      view.setUint16(p + 6, FLAGS, true);
      view.setUint16(p + 8, 0, true);
      view.setUint16(p + 10, entry.time, true);
      view.setUint16(p + 12, entry.date, true);
      view.setUint32(p + 14, entry.crc, true);
      view.setUint32(p + 18, entry.data.length, true);
      view.setUint32(p + 22, entry.data.length, true);
      view.setUint16(p + 26, entry.nameBytes.length, true);
      view.setUint16(p + 28, 0, true);
      out.set(entry.nameBytes, p + 30);
      out.set(entry.data, p + 30 + entry.nameBytes.length);
      p += 30 + entry.nameBytes.length + entry.data.length;
    }

    const centralStart = p;
    for (const entry of entries) {
      view.setUint32(p, 0x02014b50, true);
      view.setUint16(p + 4, 20, true);
      view.setUint16(p + 6, 20, true);
      view.setUint16(p + 8, FLAGS, true);
      view.setUint16(p + 10, 0, true);
      view.setUint16(p + 12, entry.time, true);
      view.setUint16(p + 14, entry.date, true);
      view.setUint32(p + 16, entry.crc, true);
      view.setUint32(p + 20, entry.data.length, true);
      view.setUint32(p + 24, entry.data.length, true);
      view.setUint16(p + 28, entry.nameBytes.length, true);
      view.setUint16(p + 30, 0, true);
      view.setUint16(p + 32, 0, true);
      view.setUint16(p + 34, 0, true);
      view.setUint16(p + 36, 0, true);
      view.setUint32(p + 38, 0, true);
      view.setUint32(p + 42, entry.offset, true);
      out.set(entry.nameBytes, p + 46);
      p += 46 + entry.nameBytes.length;
    }

    view.setUint32(p, 0x06054b50, true);
    view.setUint16(p + 4, 0, true);
    view.setUint16(p + 6, 0, true);
    view.setUint16(p + 8, entries.length, true);
    view.setUint16(p + 10, entries.length, true);
    view.setUint32(p + 12, centralSize, true);
    view.setUint32(p + 16, centralStart, true);
    view.setUint16(p + 20, 0, true);

    return out;
  }

  root.FFZipWriter = Object.freeze({ createZipBytes, crc32 });
})(typeof window !== "undefined" ? window : globalThis);
