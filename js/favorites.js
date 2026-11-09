(function () {
  "use strict";

  const STORAGE_KEY = "deviceInspector.favorites.v1";
  const DROPDOWN_LIMIT = 10;

  function emptyStore() {
    return { items: [] };
  }

  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "");
      if (!parsed || typeof parsed !== "object") return emptyStore();
      const items = Array.isArray(parsed.items) ? parsed.items : [];
      return {
        items: items.map((item) => ({
          id: String(item.id || ""),
          deviceId: String(item.deviceId || "").toUpperCase(),
          name: String(item.name || "").trim(),
          schemaSlug: String(item.schemaSlug || ""),
          updatedAt: Number(item.updatedAt) || 0,
          usedAt: Number(item.usedAt) || Number(item.updatedAt) || 0
        })).filter((item) => item.id && item.deviceId)
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
    return `fav-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function cleanName(raw, deviceId) {
    const name = String(raw || "").trim();
    const id = String(deviceId || "").trim().toUpperCase();
    if (!name) return "";
    if (id && name.toUpperCase() === id) return "";
    return name;
  }

  function list() {
    return load().items
      .slice()
      .sort((a, b) => (b.usedAt || 0) - (a.usedAt || 0) || (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  function recent(limit) {
    return list().slice(0, limit == null ? DROPDOWN_LIMIT : limit);
  }

  function label(item) {
    const id = item.deviceId || "";
    const name = cleanName(item.name, id);
    return name ? `${name} (${id})` : id;
  }

  function findByDeviceId(deviceId) {
    const id = String(deviceId || "").trim().toUpperCase();
    if (!id) return null;
    return list().find((item) => item.deviceId === id) || null;
  }

  function upsert(input) {
    const deviceId = String(input.deviceId || "").trim().toUpperCase();
    if (!deviceId) throw new Error("A device id is required.");
    const now = Date.now();
    const store = load();
    const existingIndex = input.id
      ? store.items.findIndex((item) => item.id === input.id)
      : store.items.findIndex((item) => item.deviceId === deviceId);
    const previous = existingIndex >= 0 ? store.items[existingIndex] : null;
    const next = {
      id: previous?.id || input.id || uid(),
      deviceId,
      name: cleanName(input.name, deviceId),
      schemaSlug: String(input.schemaSlug || "").trim(),
      updatedAt: now,
      usedAt: input.touch === false ? (previous?.usedAt || now) : now
    };
    if (existingIndex >= 0) store.items[existingIndex] = next;
    else store.items.push(next);
    save(store);
    return { ...next };
  }

  function touch(id) {
    const store = load();
    const item = store.items.find((row) => row.id === id);
    if (!item) return null;
    item.usedAt = Date.now();
    save(store);
    return { ...item };
  }

  function remove(id) {
    const store = load();
    store.items = store.items.filter((item) => item.id !== id);
    save(store);
  }

  function get(id) {
    return list().find((item) => item.id === id) || null;
  }

  window.deviceInspectorFavorites = {
    DROPDOWN_LIMIT,
    list,
    recent,
    label,
    cleanName,
    findByDeviceId,
    upsert,
    touch,
    remove,
    get
  };
})();
