import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/config/env.js", () => ({
  loadConfig: vi.fn(),
}));

vi.mock("../src/repositories/credits.repo.js", () => ({
  getSupabaseAuthClient: vi.fn(),
}));

vi.mock("../src/services/profiles.service.js", () => ({
  userHasAdminRole: vi.fn(),
}));

import { loadConfig } from "../src/config/env.js";
import { getSupabaseAuthClient } from "../src/repositories/credits.repo.js";
import { userHasAdminRole } from "../src/services/profiles.service.js";
import { verifyAdminUser, verifyOwnerUser } from "../src/services/auth.service.js";

function requestWithBearer(token = "token-1") {
  return {
    headers: {
      authorization: `Bearer ${token}`,
    },
  };
}

function mockAuthUser(user = { email: "user@example.com", id: "user-1" }) {
  getSupabaseAuthClient.mockReturnValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
  });
}

describe("verifyAdminUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadConfig.mockReturnValue({
      adminApiKey: "",
      adminEmails: Object.freeze([]),
      adminUserIds: Object.freeze([]),
    });
    mockAuthUser();
    userHasAdminRole.mockResolvedValue(false);
  });

  it("accepts users marked as admin in profiles (not owner)", async () => {
    userHasAdminRole.mockResolvedValue(true);

    await expect(verifyAdminUser(requestWithBearer())).resolves.toEqual({
      email: "user@example.com",
      id: "user-1",
      isApiKey: false,
      isOwner: false,
    });
  });

  it("marks env allowlist users as owner", async () => {
    loadConfig.mockReturnValue({
      adminApiKey: "",
      adminEmails: Object.freeze(["user@example.com"]),
      adminUserIds: Object.freeze([]),
    });

    await expect(verifyAdminUser(requestWithBearer())).resolves.toEqual({
      email: "user@example.com",
      id: "user-1",
      isApiKey: false,
      isOwner: true,
    });
  });

  it("rejects normal profile users", async () => {
    await expect(verifyAdminUser(requestWithBearer())).rejects.toMatchObject({
      message: "Bu işlem için yönetici yetkisi gerekli.",
      statusCode: 403,
    });
  });
});

describe("verifyOwnerUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadConfig.mockReturnValue({
      adminApiKey: "",
      adminEmails: Object.freeze([]),
      adminUserIds: Object.freeze([]),
    });
    mockAuthUser();
    userHasAdminRole.mockResolvedValue(false);
  });

  it("accepts env allowlist owners", async () => {
    loadConfig.mockReturnValue({
      adminApiKey: "",
      adminEmails: Object.freeze(["user@example.com"]),
      adminUserIds: Object.freeze([]),
    });

    await expect(verifyOwnerUser(requestWithBearer())).resolves.toMatchObject({
      id: "user-1",
      isOwner: true,
    });
  });

  it("rejects profile admins that are not owners", async () => {
    userHasAdminRole.mockResolvedValue(true);

    await expect(verifyOwnerUser(requestWithBearer())).rejects.toMatchObject({
      message: "Bu işlem için proje sahibi yetkisi gerekli.",
      statusCode: 403,
    });
  });
});
