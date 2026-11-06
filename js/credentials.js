(function () {
  "use strict";

  const STORAGE_KEY = "deviceInspector.credentials.v1";

  function emptyStore() {
    return { sigfox: [], insight: [], activeSigfox: "", activeInsight: "" };
  }

  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "");
      if (!parsed || typeof parsed !== "object") return emptyStore();
      return {
        sigfox: Array.isArray(parsed.sigfox) ? parsed.sigfox : [],
        insight: Array.isArray(parsed.insight) ? parsed.insight : [],
        activeSigfox: String(parsed.activeSigfox || ""),
        activeInsight: String(parsed.activeInsight || "")
      };
    } catch {
      return emptyStore();
    }
  }

  function save(store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  function uid() {
    if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
    return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function list(kind) {
    return load()[kind].map((item) => ({ ...item }));
  }

  function active(kind) {
    const store = load();
    const id = kind === "sigfox" ? store.activeSigfox : store.activeInsight;
    return store[kind].find((item) => item.id === id) || null;
  }

  function upsert(kind, profile) {
    const store = load();
    const name = String(profile.name || "").trim();
    if (!name) throw new Error("A name is required.");
    const next = {
      id: profile.id || uid(),
      name
    };
    if (kind === "sigfox") {
      next.login = String(profile.login || "").trim();
      next.password = String(profile.password || "");
      if (!next.login || !next.password) throw new Error("Sigfox login and password are required.");
    } else {
      next.token = String(profile.token || "").trim();
      if (!next.token) throw new Error("A Connected Insight token is required.");
    }
    const index = store[kind].findIndex((item) => item.id === next.id);
    if (index >= 0) store[kind][index] = next;
    else store[kind].push(next);
    if (kind === "sigfox") store.activeSigfox = next.id;
    else store.activeInsight = next.id;
    save(store);
    return next;
  }

  function remove(kind, id) {
    const store = load();
    store[kind] = store[kind].filter((item) => item.id !== id);
    if (kind === "sigfox" && store.activeSigfox === id) store.activeSigfox = store.sigfox[0]?.id || "";
    if (kind === "insight" && store.activeInsight === id) store.activeInsight = store.insight[0]?.id || "";
    save(store);
  }

  function select(kind, id) {
    const store = load();
    if (!store[kind].some((item) => item.id === id)) return;
    if (kind === "sigfox") store.activeSigfox = id;
    else store.activeInsight = id;
    save(store);
  }

  function basicAuth(login, password) {
    const bytes = new TextEncoder().encode(`${login}:${password}`);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return `Basic ${btoa(binary)}`;
  }

  function sigfoxAuthHeader() {
    const profile = active("sigfox");
    if (!profile) return "";
    return basicAuth(profile.login, profile.password);
  }

  window.deviceInspectorCredentials = {
    list,
    active,
    upsert,
    remove,
    select,
    sigfoxAuthHeader
  };
})();
