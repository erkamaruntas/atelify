import { describe, expect, it } from "vitest";

import "../studio/utils/zip-writer.js";

const { createZipBytes, crc32 } = globalThis.FFZipWriter;

function readEntries(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eocd = bytes.length - 22;
  expect(view.getUint32(eocd, true)).toBe(0x06054b50);
  const count = view.getUint16(eocd + 10, true);
  let p = view.getUint32(eocd + 16, true);
  const decoder = new TextDecoder();
  const entries = [];
  for (let i = 0; i < count; i += 1) {
    expect(view.getUint32(p, true)).toBe(0x02014b50);
    const crc = view.getUint32(p + 16, true);
    const size = view.getUint32(p + 24, true);
    const nameLength = view.getUint16(p + 28, true);
    const offset = view.getUint32(p + 42, true);
    const name = decoder.decode(bytes.subarray(p + 46, p + 46 + nameLength));
    const localNameLength = view.getUint16(offset + 26, true);
    const dataStart = offset + 30 + localNameLength;
    entries.push({ name, crc, data: bytes.subarray(dataStart, dataStart + size) });
    p += 46 + nameLength;
  }
  return entries;
}

describe("zip writer", () => {
  it("standart CRC-32 üretir", () => {
    expect(crc32(new TextEncoder().encode("hello")).toString(16)).toBe("3610a686");
  });

  it("dosyaları adları ve içerikleriyle birlikte arşivler", () => {
    const first = new Uint8Array([1, 2, 3, 4, 5]);
    const second = new TextEncoder().encode("Atelify");
    const zip = createZipBytes([
      { name: "01-büst-yüzük.png", data: first },
      { name: "02-çizim.webp", data: second },
    ]);

    const entries = readEntries(zip);
    expect(entries.map((entry) => entry.name)).toEqual(["01-büst-yüzük.png", "02-çizim.webp"]);
    expect(Array.from(entries[0].data)).toEqual([1, 2, 3, 4, 5]);
    expect(new TextDecoder().decode(entries[1].data)).toBe("Atelify");
    expect(entries[1].crc).toBe(crc32(second));
  });

  it("boş liste için geçerli boş arşiv döner", () => {
    const zip = createZipBytes([]);
    expect(zip.length).toBe(22);
    expect(readEntries(zip)).toEqual([]);
  });
});
