(function () {
  function readJson(key, fallback = null) {
    try {
      const source = window.localStorage.getItem(key);
      return source ? JSON.parse(source) : fallback;
    } catch {
      return fallback;
    }
  }

  function readArray(key) {
    const parsed = readJson(key, []);
    return Array.isArray(parsed) ? parsed : [];
  }

  function writeJson(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  window.FFStudioStorage = Object.freeze({
    readArray,
    readJson,
    writeJson,
  });
})();
