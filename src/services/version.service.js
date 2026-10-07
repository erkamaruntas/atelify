function cleanEnvValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function firstEnvValue(env, keys) {
  for (const key of keys) {
    const value = cleanEnvValue(env?.[key]);
    if (value) return value;
  }
  return "";
}

export function getDeploymentVersion(env = process.env) {
  const deploymentId = firstEnvValue(env, [
    "VERCEL_DEPLOYMENT_ID",
    "DEPLOYMENT_ID",
    "BUILD_ID",
  ]);
  const commitSha = firstEnvValue(env, [
    "VERCEL_GIT_COMMIT_SHA",
    "NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA",
    "GITHUB_SHA",
    "COMMIT_SHA",
    "SOURCE_VERSION",
    "CF_PAGES_COMMIT_SHA",
    "NETLIFY_COMMIT_REF",
  ]);
  const commitRef = firstEnvValue(env, [
    "VERCEL_GIT_COMMIT_REF",
    "NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF",
    "GITHUB_REF_NAME",
    "BRANCH",
    "CF_PAGES_BRANCH",
    "HEAD",
  ]);
  const deploymentUrl = firstEnvValue(env, [
    "VERCEL_URL",
    "VERCEL_BRANCH_URL",
    "VERCEL_PROJECT_PRODUCTION_URL",
    "DEPLOYMENT_URL",
    "URL",
  ]);
  const environment = firstEnvValue(env, ["VERCEL_ENV", "NODE_ENV"]) || "development";
  const version = [deploymentId, commitSha, deploymentUrl].filter(Boolean).join(":");

  return {
    version: version || "local-development",
    commitSha: commitSha || null,
    commitRef: commitRef || null,
    deploymentUrl: deploymentUrl || null,
    environment,
  };
}
