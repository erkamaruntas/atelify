export function setNoStoreHeaders(response) {
  response.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate");
  response.setHeader("Expires", "0");
  response.setHeader("Pragma", "no-cache");
  response.setHeader("Surrogate-Control", "no-store");
}

export const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  "Expires": "0",
  "Pragma": "no-cache",
  "Surrogate-Control": "no-store",
};
