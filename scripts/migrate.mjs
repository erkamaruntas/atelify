#!/usr/bin/env node
// scripts/migrate.mjs
// Basit, takipli SQL migration runner.
//
// supabase/migrations/ içindeki *.sql dosyalarını dosya adına göre sıralayıp
// daha önce uygulanmamış olanları sırayla, her birini tek transaction içinde
// uygular. Uygulananları public.ff_schema_migrations tablosunda kaydeder; bir
// daha çalıştırmaz. Böylece "hangi migration canlıya gitti?" sorusu ortadan
// kalkar.
//
// Kullanım:
//   node scripts/migrate.mjs status            -> uygulanan / bekleyen listesi
//   node scripts/migrate.mjs baseline 0005     -> 0005'e kadar olanları
//                                                 ÇALIŞTIRMADAN "uygulandı" işaretle
//   node scripts/migrate.mjs up                -> bekleyenleri uygula (varsayılan)
//
// Bağlantı: SUPABASE_DB_URL (.env) — Supabase Dashboard -> Settings -> Database
//   -> Connection string (URI). Pooler/direct fark etmez; şifreyi içermeli.

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const rootDir = fileURLToPath(new URL("../", import.meta.url));
const migrationsDir = join(rootDir, "supabase", "migrations");

function loadDotenv() {
  const filePath = join(rootDir, ".env");
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function listMigrationFiles() {
  return readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();
}

async function ensureTrackingTable(client) {
  await client.query(`
    create table if not exists public.ff_schema_migrations (
      name        text        primary key,
      applied_at  timestamptz not null default now()
    );
  `);
}

async function appliedSet(client) {
  const { rows } = await client.query("select name from public.ff_schema_migrations");
  return new Set(rows.map((row) => row.name));
}

async function cmdStatus(client) {
  const files = listMigrationFiles();
  const applied = await appliedSet(client);
  console.log(`Migration durumu (${migrationsDir}):\n`);
  for (const file of files) {
    console.log(`  ${applied.has(file) ? "✓ uygulandı " : "• bekliyor  "}  ${file}`);
  }
  const pending = files.filter((file) => !applied.has(file));
  console.log(`\nToplam ${files.length} dosya · ${applied.size} uygulandı · ${pending.length} bekliyor.`);
}

function leadingNumber(name) {
  const match = name.match(/^(\d+)/);
  return match ? Number.parseInt(match[1], 10) : Number.NaN;
}

async function cmdBaseline(client, upto) {
  const threshold = leadingNumber(String(upto || ""));
  if (!Number.isFinite(threshold)) {
    console.error("Kullanım: node scripts/migrate.mjs baseline <numara>  (örn. 0005)");
    process.exitCode = 1;
    return;
  }
  // Lider numarası <= threshold olan tüm migration'ları, ÇALIŞTIRMADAN
  // "uygulandı" diye işaretle. (Bunlar daha önce elle uygulanmış olanlar.)
  const files = listMigrationFiles();
  const applied = await appliedSet(client);
  let marked = 0;
  for (const file of files) {
    if (leadingNumber(file) > threshold || applied.has(file)) continue;
    await client.query(
      "insert into public.ff_schema_migrations (name) values ($1) on conflict (name) do nothing",
      [file]
    );
    console.log(`  baseline (çalıştırılmadı): ${file}`);
    marked += 1;
  }
  console.log(`\n${marked} migration baseline olarak işaretlendi.`);
}

async function cmdUp(client) {
  const files = listMigrationFiles();
  const applied = await appliedSet(client);
  const pending = files.filter((file) => !applied.has(file));
  if (!pending.length) {
    console.log("Bekleyen migration yok. Veritabanı güncel.");
    return;
  }
  console.log(`${pending.length} bekleyen migration uygulanacak:\n`);
  for (const file of pending) {
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    process.stdout.write(`  → ${file} ... `);
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query(
        "insert into public.ff_schema_migrations (name) values ($1) on conflict (name) do nothing",
        [file]
      );
      await client.query("commit");
      console.log("ok");
    } catch (error) {
      await client.query("rollback").catch(() => {});
      console.log("HATA");
      console.error(`\n${file} uygulanamadı:\n${error.message}\n`);
      throw error;
    }
  }
  console.log("\nTüm bekleyen migration'lar uygulandı.");
}

async function main() {
  loadDotenv();
  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error(
      "SUPABASE_DB_URL tanımlı değil.\n" +
        "Supabase Dashboard -> Settings -> Database -> Connection string (URI) değerini\n" +
        ".env dosyasına SUPABASE_DB_URL=... olarak ekle."
    );
    process.exit(1);
  }

  const command = process.argv[2] || "up";
  const arg = process.argv[3];

  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await ensureTrackingTable(client);
    if (command === "status") await cmdStatus(client);
    else if (command === "baseline") await cmdBaseline(client, arg);
    else if (command === "up") await cmdUp(client);
    else {
      console.error(`Bilinmeyen komut: ${command}. (status | baseline | up)`);
      process.exitCode = 1;
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
