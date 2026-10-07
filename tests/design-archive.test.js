import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/repositories/credits.repo.js", () => ({
  getSupabaseAdminClient: vi.fn(),
}));

import { getSupabaseAdminClient } from "../src/repositories/credits.repo.js";
import { recordGeneratedDesigns } from "../src/repositories/designs.repo.js";
import { archiveGenerationJobImages } from "../src/services/design-archive.service.js";

const USER_ID = "11111111-2222-4333-8444-555555555555";
const IMAGE = {
  storageBucket: "ff-design-assets",
  storagePath: `${USER_ID}/manken/job-1/1.png`,
  url: "https://storage/1.png",
  contentType: "image/png",
};

// Supabase sorgu zincirini taklit eden küçük sahte istemci.
function fakeSupabase({ existing = [] } = {}) {
  const inserts = [];
  const client = {
    inserts,
    from(table) {
      const query = {
        select: () => query,
        eq: () => query,
        limit: async () => ({ data: existing, error: null }),
        insert(rows) {
          inserts.push({ table, rows });
          return {
            select: async () => ({ data: rows.map((_, index) => ({ id: `design-${index}` })), error: null }),
            then: (resolve) => resolve({ error: null }),
          };
        },
      };
      return query;
    },
  };
  return client;
}

let client;

beforeEach(() => {
  client = fakeSupabase();
  getSupabaseAdminClient.mockReturnValue(client);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("recordGeneratedDesigns", () => {
  it("manken aşamasını arşive manken olarak yazar", async () => {
    const ids = await recordGeneratedDesigns({
      userId: USER_ID,
      stage: "manken",
      clientJobId: "job-1",
      images: [IMAGE],
    });

    expect(ids).toEqual(["design-0"]);
    const designInsert = client.inserts.find((entry) => entry.table === "ff_designs");
    expect(designInsert.rows[0].stage).toBe("manken");
    expect(client.inserts.find((entry) => entry.table === "ff_design_assets").rows[0].public_url).toBe(IMAGE.url);
  });

  it("aynı üretim işi daha önce arşivlendiyse tekrar yazmaz", async () => {
    client = fakeSupabase({ existing: [{ id: "old-design" }] });
    getSupabaseAdminClient.mockReturnValue(client);

    const ids = await recordGeneratedDesigns({
      userId: USER_ID,
      stage: "mockup",
      clientJobId: "job-1",
      images: [IMAGE],
    });

    expect(ids).toEqual([]);
    expect(client.inserts).toHaveLength(0);
  });
});

describe("archiveGenerationJobImages", () => {
  it("iş metadata'sını arşiv alanlarına eşler (finishInfo yedekleriyle)", async () => {
    await archiveGenerationJobImages({
      userId: USER_ID,
      stage: "manken",
      clientJobId: "job-2",
      metadata: {
        projectId: "ff-project-abc",
        projectTitle: "Annem için",
        finishInfo: { title: "Gül kolye", productValue: "kolye", productShapeValue: "oval", metalValue: "altin" },
        scene: { value: "manken" },
      },
      images: [IMAGE],
    });

    const row = client.inserts.find((entry) => entry.table === "ff_designs").rows[0];
    expect(row).toMatchObject({
      stage: "manken",
      title: "Gül kolye",
      product: "kolye",
      product_shape: "oval",
      client_job_id: "job-2",
    });
    expect(row.options).toMatchObject({ metal: "altin", scene: "manken" });
    // UUID olmayan proje kimliği metadata'ya taşınır.
    expect(row.project_id).toBeNull();
    expect(row.metadata).toMatchObject({ projectId: "ff-project-abc", projectTitle: "Annem için" });
  });
});
