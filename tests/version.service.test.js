import { describe, expect, it } from "vitest";

import { getDeploymentVersion } from "../src/services/version.service.js";

describe("deployment version", () => {
  it("Vercel deployment identifiers from environment variables are combined", () => {
    const version = getDeploymentVersion({
      VERCEL_DEPLOYMENT_ID: "dpl_123",
      VERCEL_GIT_COMMIT_SHA: "abc123",
      VERCEL_GIT_COMMIT_REF: "main",
      VERCEL_URL: "ff-example.vercel.app",
      VERCEL_ENV: "production",
    });

    expect(version).toEqual({
      version: "dpl_123:abc123:ff-example.vercel.app",
      commitSha: "abc123",
      commitRef: "main",
      deploymentUrl: "ff-example.vercel.app",
      environment: "production",
    });
  });

  it("falls back to a stable local development version", () => {
    expect(getDeploymentVersion({})).toEqual({
      version: "local-development",
      commitSha: null,
      commitRef: null,
      deploymentUrl: null,
      environment: "development",
    });
  });
});
