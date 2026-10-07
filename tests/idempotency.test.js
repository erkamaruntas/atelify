import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/repositories/credits.repo.js", () => ({
  getSupabaseAdminClient: vi.fn(),
}));

vi.mock("../src/repositories/generation-jobs.repo.js", () => ({
  readGenerationJob: vi.fn(),
  sanitizeClientJobId: (value) => {
    const id = String(value || "").trim();
    return /^[a-zA-Z0-9_.:-]{8,160}$/.test(id) ? id : "";
  },
}));

import { getSupabaseAdminClient } from "../src/repositories/credits.repo.js";
import { readGenerationJob } from "../src/repositories/generation-jobs.repo.js";
import { createGenerationIdempotency } from "../src/utils/idempotency.js";

class FakeSupabaseQuery {
  constructor(rows) {
    this.rows = rows;
    this.filters = {};
    this.operation = "";
    this.insertRow = null;
    this.updateValues = null;
    this.ltFilter = null;
  }

  delete() {
    this.operation = "delete";
    return this;
  }

  insert(row) {
    this.operation = "insert";
    this.insertRow = row;
    return this;
  }

  select() {
    if (!this.operation) this.operation = "select";
    return this;
  }

  update(values) {
    this.operation = "update";
    this.updateValues = values;
    return this;
  }

  eq(column, value) {
    this.filters[column] = value;
    return this;
  }

  lt(column, value) {
    this.ltFilter = { column, value };
    return this.execute();
  }

  single() {
    return this.execute();
  }

  maybeSingle() {
    return this.execute();
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }

  async execute() {
    const key = this.filters.key || this.insertRow?.key;

    if (this.operation === "delete") {
      const row = this.rows.get(key);
      if (row && this.ltFilter?.column === "expires_at" && row.expires_at < this.ltFilter.value) {
        this.rows.delete(key);
      }
      return { error: null };
    }

    if (this.operation === "insert") {
      if (this.rows.has(this.insertRow.key)) {
        return { data: null, error: { code: "23505", message: "duplicate key value" } };
      }
      const row = {
        created_at: new Date().toISOString(),
        response_payload: null,
        ...this.insertRow,
      };
      this.rows.set(row.key, row);
      return { data: row, error: null };
    }

    if (this.operation === "select") {
      return { data: this.rows.get(key) || null, error: null };
    }

    if (this.operation === "update") {
      const row = this.rows.get(key);
      if (row && (!this.filters.user_id || row.user_id === this.filters.user_id)) {
        Object.assign(row, this.updateValues);
      }
      return { error: null };
    }

    return { data: null, error: null };
  }
}

function makeFakeAdmin(rows) {
  return {
    from: () => new FakeSupabaseQuery(rows),
  };
}

function makeMissingIdempotencyTableAdmin() {
  return {
    from: () => ({
      delete() {
        return this;
      },
      eq() {
        return this;
      },
      lt() {
        return Promise.resolve({
          error: {
            code: "PGRST205",
            message: "Could not find the table 'public.idempotency_keys' in the schema cache",
          },
        });
      },
    }),
  };
}

function futureDate() {
  return new Date(Date.now() + 60_000).toISOString();
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("createGenerationIdempotency", () => {
  it("yeni clientJobId için claim alır ve finalize response_payload yazar", async () => {
    const rows = new Map();
    getSupabaseAdminClient.mockReturnValue(makeFakeAdmin(rows));

    const idempotency = await createGenerationIdempotency({
      clientJobId: "job-12345",
      stage: "sketch",
      userId: "user-1",
    });
    const result = await idempotency.finalize({ status: 202, payload: { pending: true } });

    expect(idempotency.proceed).toBe(true);
    expect(result).toEqual({ status: 202, payload: { pending: true } });
    expect(rows.get("job-12345").response_payload.status).toBe(202);
    expect(rows.get("job-12345").response_payload.payload).toEqual({ pending: true });
  });

  it("stored response varsa işlemi tekrar koşturmaz ve idempotent flag döner", async () => {
    const rows = new Map([
      [
        "job-12345",
        {
          key: "job-12345",
          user_id: "user-1",
          expires_at: futureDate(),
          response_payload: { status: 202, payload: { pending: true } },
        },
      ],
    ]);
    getSupabaseAdminClient.mockReturnValue(makeFakeAdmin(rows));

    const idempotency = await createGenerationIdempotency({
      clientJobId: "job-12345",
      stage: "sketch",
      userId: "user-1",
    });

    expect(idempotency.proceed).toBe(false);
    expect(idempotency.response).toEqual({
      status: 202,
      payload: { idempotent: true, pending: true },
    });
    expect(readGenerationJob).not.toHaveBeenCalled();
  });

  it("response henüz yoksa mevcut generation job üzerinden pending döner", async () => {
    const rows = new Map([
      [
        "job-12345",
        {
          key: "job-12345",
          user_id: "user-1",
          expires_at: futureDate(),
          response_payload: null,
        },
      ],
    ]);
    getSupabaseAdminClient.mockReturnValue(makeFakeAdmin(rows));
    readGenerationJob.mockResolvedValue({
      clientJobId: "job-12345",
      requestId: "req-1",
      stage: "sketch",
      status: "queued",
      userId: "user-1",
    });

    const idempotency = await createGenerationIdempotency({
      clientJobId: "job-12345",
      pendingPayload: { draftCount: 4 },
      stage: "sketch",
      userId: "user-1",
    });

    expect(idempotency.proceed).toBe(false);
    expect(idempotency.response).toEqual({
      status: 202,
      payload: {
        clientJobId: "job-12345",
        draftCount: 4,
        idempotent: true,
        pending: true,
        requestId: "req-1",
        stage: "sketch",
        status: "queued",
      },
    });
  });

  it("aynı key başka kullanıcıya aitse 403 döner", async () => {
    const rows = new Map([
      [
        "job-12345",
        {
          key: "job-12345",
          user_id: "user-2",
          expires_at: futureDate(),
          response_payload: null,
        },
      ],
    ]);
    getSupabaseAdminClient.mockReturnValue(makeFakeAdmin(rows));

    const idempotency = await createGenerationIdempotency({
      clientJobId: "job-12345",
      stage: "sketch",
      userId: "user-1",
    });

    expect(idempotency.proceed).toBe(false);
    expect(idempotency.response).toEqual({
      status: 403,
      payload: { error: "Bu üretim başka bir kullanıcıya ait." },
    });
    expect(readGenerationJob).not.toHaveBeenCalled();
  });

  it("geçersiz clientJobId verilirse idempotency katmanını bypass eder", async () => {
    const idempotency = await createGenerationIdempotency({
      clientJobId: "bad",
      stage: "sketch",
      userId: "user-1",
    });

    expect(idempotency.proceed).toBe(true);
    expect(await idempotency.finalize({ status: 200, payload: { ok: true } })).toEqual({
      status: 200,
      payload: { ok: true },
    });
    expect(getSupabaseAdminClient).not.toHaveBeenCalled();
  });

  it("idempotency tablosu schema cache'te yoksa generation_jobs claim katmanına düşer", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    getSupabaseAdminClient.mockReturnValue(makeMissingIdempotencyTableAdmin());

    try {
      const idempotency = await createGenerationIdempotency({
        clientJobId: "job-12345",
        stage: "sketch",
        userId: "user-1",
      });

      expect(idempotency.proceed).toBe(true);
      expect(await idempotency.finalize({ status: 202, payload: { pending: true } })).toEqual({
        status: 202,
        payload: { pending: true },
      });
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("idempotency_keys table is unavailable"),
        expect.objectContaining({ code: "PGRST205" })
      );
    } finally {
      warnSpy.mockRestore();
    }
  });
});
