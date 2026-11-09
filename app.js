(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const fmt = window.deviceInspectorFormat;
  const creds = window.deviceInspectorCredentials;
  const favs = window.deviceInspectorFavorites;
  const sigfox = window.deviceInspectorSigfox;
  const decode = window.deviceInspectorDecode;
  const charts = window.deviceInspectorCharts;
  const insightApi = window.deviceInspectorInsight;
  const rules = window.deviceInspectorRules;
  const snapshots = window.deviceInspectorSnapshot;

  const TZ_KEY = "deviceInspector.tz";
  const DEVICE_KEY = "deviceInspector.lastDevice";
  const SCHEMA_KEY = "deviceInspector.schema";
  const AUTO_SCHEMA_KEY = "deviceInspector.autoSchema";
  const GREEN = "#7f9468";
  const ORANGE = "#c4845a";

  let job = 0;
  let busy = false;
  let detailsBusy = false;
  const state = {
    deviceId: "",
    device: null,
    deviceType: null,
    callbacks: null,
    detailsLoaded: false,
    location: null,
    messages: [],
    messageNote: "",
    rateLimited: false,
    schemaSlug: localStorage.getItem(SCHEMA_KEY) || "",
    autoSchema: localStorage.getItem(AUTO_SCHEMA_KEY) !== "0",
    insightStore: null,
    insightParser: null,
    insightVersion: null,
    insightNote: "",
    inspected: false,
    sigfoxPhase: "idle",
    insightPhase: "idle",
    sigfoxError: "",
    sigfoxField: "",
    insightField: "",
    consumptionCache: new Map(),
    consumptionLoading: false,
    consumptionNote: "",
    tz: localStorage.getItem(TZ_KEY) === "utc" ? "utc" : "local"
  };
  let statsJob = 0;

  function setStatus(text) {
    $("status-line").textContent = text;
  }

  function setLoading(on) {
    document.body.classList.toggle("is-loading", on);
  }

  function setBusy(on) {
    busy = on;
    $("inspect-btn").disabled = on;
    setLoading(on || detailsBusy);
    updateReloadButtons();
  }

  function shortReason(text) {
    const value = String(text || "").replace(/\s+/g, " ").trim();
    if (value.length <= 160) return value;
    return `${value.slice(0, 157)}…`;
  }

  function updateReloadButtons() {
    const canRetry = state.inspected && !busy && !detailsBusy;
    $("sigfox-reload").hidden = !(canRetry && state.sigfoxPhase !== "ready");
    $("insight-reload").hidden = !(canRetry && state.insightPhase !== "ready");
  }

  function normalizeId(value) {
    return String(value || "").replace(/[^0-9a-fA-F]/g, "").toUpperCase();
  }

  function sigfoxDecimalId(value) {
    const raw = String(value || "").trim();
    if (!/^[0-9a-fA-F]+$/.test(raw)) return "";
    const n = Number.parseInt(raw, 16);
    if (!Number.isFinite(n) || n < 0) return "";
    return String(n);
  }

  function deviceBackendUrl(id) {
    const decimal = sigfoxDecimalId(id);
    return decimal ? `https://backend.sigfox.com/device/${decimal}/info` : "";
  }

  function stationBackendUrl(id) {
    const decimal = sigfoxDecimalId(id);
    return decimal ? `https://backend.sigfox.com/baseStation/${decimal}/info` : "";
  }

  function backendIdLink(id, url) {
    if (!id) return "—";
    const text = fmt.escapeHtml(id);
    if (!url) return text;
    return `<a href="${fmt.escapeHtml(url)}" target="_blank" rel="noreferrer noopener">${text}</a>`;
  }

  function time(ms) {
    return fmt.formatTime(ms, state.tz);
  }

  function fillProfiles() {
    const sigfoxList = creds.list("sigfox");
    const insightList = creds.list("insight");
    const sigfoxActive = creds.active("sigfox");
    const insightActive = creds.active("insight");
    $("sigfox-profile").innerHTML = [`<option value="">No Sigfox key</option>`]
      .concat(sigfoxList.map((item) => `<option value="${fmt.escapeHtml(item.id)}">${fmt.escapeHtml(item.name)}</option>`))
      .join("");
    $("ci-profile").innerHTML = [`<option value="">No Insight key</option>`]
      .concat(insightList.map((item) => `<option value="${fmt.escapeHtml(item.id)}">${fmt.escapeHtml(item.name)}</option>`))
      .join("");
    if (sigfoxActive) $("sigfox-profile").value = sigfoxActive.id;
    if (insightActive) $("ci-profile").value = insightActive.id;
    renderCredentialLists();
  }

  function renderCredentialLists() {
    renderCredentialColumn("sigfox", "sigfox-cred-list");
    renderCredentialColumn("insight", "ci-cred-list");
  }

  function renderCredentialColumn(kind, elementId) {
    const active = creds.active(kind);
    const rows = creds.list(kind);
    $(elementId).innerHTML = rows.length
      ? rows.map((item) => {
        const inUse = active && active.id === item.id;
        return `<div class="cred-row">
          <span>${fmt.escapeHtml(item.name)}${inUse ? ' <span class="in-use">in use</span>' : ""}</span>
          <span class="cred-buttons">
            <button type="button" class="btn" data-edit="${kind}:${fmt.escapeHtml(item.id)}">Edit</button>
            <button type="button" class="btn" data-use="${kind}:${fmt.escapeHtml(item.id)}">Use</button>
            <button type="button" class="btn" data-del="${kind}:${fmt.escapeHtml(item.id)}">Delete</button>
          </span>
        </div>`;
      }).join("")
      : `<p class="dim">None saved.</p>`;
  }

  function clearSigfoxCredForm() {
    $("sfx-id").value = "";
    $("sfx-name").value = "";
    $("sfx-login").value = "";
    $("sfx-password").value = "";
    $("sfx-password").placeholder = "";
    $("sfx-save").textContent = "Save Sigfox key";
    $("sfx-cancel").hidden = true;
  }

  function clearInsightCredForm() {
    $("ci-id").value = "";
    $("ci-name").value = "";
    $("ci-token").value = "";
    $("ci-token").placeholder = "";
    $("ci-save").textContent = "Save Insight key";
    $("ci-cancel").hidden = true;
  }

  function editCredential(kind, id) {
    const profile = creds.get(kind, id);
    if (!profile) return;
    if (kind === "sigfox") {
      $("sfx-id").value = profile.id;
      $("sfx-name").value = profile.name || "";
      $("sfx-login").value = profile.login || "";
      $("sfx-password").value = "";
      $("sfx-password").placeholder = "Leave blank to keep";
      $("sfx-save").textContent = "Update Sigfox key";
      $("sfx-cancel").hidden = false;
      $("sfx-name").focus();
    } else {
      $("ci-id").value = profile.id;
      $("ci-name").value = profile.name || "";
      $("ci-token").value = "";
      $("ci-token").placeholder = "Leave blank to keep";
      $("ci-save").textContent = "Update Insight key";
      $("ci-cancel").hidden = false;
      $("ci-name").focus();
    }
  }

  function fillSchemas() {
    const schemas = decode.listSchemas();
    $("schema-select").innerHTML = schemas.map((item) => {
      const label = `${item.device} ${item.version}`;
      return `<option value="${fmt.escapeHtml(item.slug)}">${fmt.escapeHtml(label)}</option>`;
    }).join("");
    if (state.schemaSlug && schemas.some((item) => item.slug === state.schemaSlug)) {
      $("schema-select").value = state.schemaSlug;
    } else if (schemas.length) {
      state.schemaSlug = schemas[0].slug;
      $("schema-select").value = state.schemaSlug;
    }
    const auto = $("auto-schema");
    if (auto) auto.checked = state.autoSchema;
    const info = window.payloadBuildInfo;
    $("schema-note").textContent = info
      ? `Schemas ${info.build_date_display || ""} ${info.git_commit_short || ""}`.trim()
      : "Schemas not synced";
  }

  function setAutoSchema(on) {
    state.autoSchema = !!on;
    localStorage.setItem(AUTO_SCHEMA_KEY, state.autoSchema ? "1" : "0");
    const auto = $("auto-schema");
    if (auto) auto.checked = state.autoSchema;
  }

  function schemaLabel(slug) {
    const item = decode.schemaBySlug(slug);
    return item ? `${item.device} ${item.version}` : (slug || "No schema");
  }

  function fillFavoriteSelect(selectedId) {
    const recent = favs.recent(favs.DROPDOWN_LIMIT);
    const total = favs.list().length;
    const options = [`<option value="">Favourites${total ? ` (${Math.min(total, favs.DROPDOWN_LIMIT)} of ${total})` : ""}</option>`];
    for (const item of recent) {
      options.push(`<option value="${fmt.escapeHtml(item.id)}">${fmt.escapeHtml(favs.label(item))}</option>`);
    }
    if (total > favs.DROPDOWN_LIMIT) {
      options.push(`<option value="__manage__">Manage all (${total})…</option>`);
    }
    $("favorite-select").innerHTML = options.join("");
    if (selectedId && recent.some((item) => item.id === selectedId)) {
      $("favorite-select").value = selectedId;
    }
  }

  function fillFavoriteSchemaOptions(selected) {
    const schemas = decode.listSchemas();
    $("fav-schema").innerHTML = [`<option value="">No schema</option>`]
      .concat(schemas.map((item) => `<option value="${fmt.escapeHtml(item.slug)}">${fmt.escapeHtml(`${item.device} ${item.version}`)}</option>`))
      .join("");
    if (selected) $("fav-schema").value = selected;
  }

  function resetFavoriteForm(seed) {
    $("fav-id").value = seed?.id || "";
    $("fav-device-id").value = seed?.deviceId || normalizeId($("device-id").value) || state.deviceId || "";
    $("fav-name").value = seed?.name || "";
    fillFavoriteSchemaOptions(seed?.schemaSlug || state.schemaSlug || "");
  }

  function renderFavoriteList() {
    const items = favs.list();
    if (!items.length) {
      $("favorite-list").innerHTML = `<p class="dim">No favourites yet.</p>`;
      return;
    }
    $("favorite-list").innerHTML = items.map((item) => {
      const schema = schemaLabel(item.schemaSlug);
      return `<div class="fav-row" data-id="${fmt.escapeHtml(item.id)}">
        <div class="fav-main">
          <div class="fav-title">${fmt.escapeHtml(favs.label(item))}</div>
          <div class="fav-meta">${fmt.escapeHtml(schema)}</div>
        </div>
        <div class="fav-buttons">
          <button class="btn btn-green" type="button" data-act="open">Open</button>
          <button class="btn" type="button" data-act="edit">Edit</button>
          <button class="btn" type="button" data-act="delete">Delete</button>
        </div>
      </div>`;
    }).join("");
  }

  function openFavoriteModal(seed) {
    resetFavoriteForm(seed || null);
    renderFavoriteList();
    $("favorite-modal").hidden = false;
  }

  function applyFavorite(item, options) {
    if (!item) return;
    const touch = options?.touch !== false;
    if (touch) favs.touch(item.id);
    const deviceId = normalizeId(item.deviceId);
    $("device-id").value = deviceId;
    localStorage.setItem(DEVICE_KEY, deviceId);
    if (item.schemaSlug && decode.schemaBySlug(item.schemaSlug)) {
      state.schemaSlug = item.schemaSlug;
      $("schema-select").value = item.schemaSlug;
      localStorage.setItem(SCHEMA_KEY, item.schemaSlug);
      setAutoSchema(false);
      state.sigfoxField = "";
      state.insightField = "";
      if (state.messages.length) applySchema(item.schemaSlug, false);
    }
    fillFavoriteSelect(item.id);
    setStatus(`Favourite loaded${item.name ? ` · ${item.name}` : ""} · ${deviceId}${item.schemaSlug ? ` · ${schemaLabel(item.schemaSlug)}` : ""}.`);
  }

  function currentFavoriteName() {
    return favs.cleanName(state.device?.name || "", normalizeId($("device-id").value) || state.deviceId);
  }

  function saveCurrentFavorite() {
    const deviceId = normalizeId($("device-id").value) || state.deviceId;
    if (!deviceId) {
      setStatus("Enter a device id before saving a favourite.");
      return;
    }
    try {
      const saved = favs.upsert({
        deviceId,
        name: currentFavoriteName(),
        schemaSlug: state.schemaSlug || $("schema-select").value || ""
      });
      fillFavoriteSelect(saved.id);
      setStatus(`Saved favourite ${favs.label(saved)}${saved.schemaSlug ? ` · ${schemaLabel(saved.schemaSlug)}` : ""}.`);
    } catch (error) {
      setStatus(error.message || String(error));
    }
  }

  function bindFavorites() {
    fillFavoriteSelect();
    $("favorite-save").addEventListener("click", saveCurrentFavorite);
    $("favorite-manage").addEventListener("click", () => openFavoriteModal());
    $("favorite-close").addEventListener("click", () => { $("favorite-modal").hidden = true; });
    $("favorite-modal").addEventListener("click", (event) => {
      if (event.target === $("favorite-modal")) $("favorite-modal").hidden = true;
    });
    $("fav-reset").addEventListener("click", () => resetFavoriteForm(null));
    $("favorite-select").addEventListener("change", () => {
      const value = $("favorite-select").value;
      if (!value) return;
      if (value === "__manage__") {
        $("favorite-select").value = "";
        openFavoriteModal();
        return;
      }
      const item = favs.get(value);
      if (!item) return;
      applyFavorite(item);
    });
    $("favorite-form").addEventListener("submit", (event) => {
      event.preventDefault();
      try {
        const saved = favs.upsert({
          id: $("fav-id").value || undefined,
          deviceId: $("fav-device-id").value,
          name: $("fav-name").value,
          schemaSlug: $("fav-schema").value
        });
        fillFavoriteSelect(saved.id);
        resetFavoriteForm(null);
        renderFavoriteList();
        setStatus(`Saved favourite ${favs.label(saved)}.`);
      } catch (error) {
        setStatus(error.message || String(error));
      }
    });
    $("favorite-list").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-act]");
      const row = event.target.closest(".fav-row[data-id]");
      if (!button || !row) return;
      const item = favs.get(row.getAttribute("data-id"));
      if (!item) return;
      const act = button.getAttribute("data-act");
      if (act === "open") {
        applyFavorite(item);
        $("favorite-modal").hidden = true;
      } else if (act === "edit") {
        resetFavoriteForm(item);
      } else if (act === "delete") {
        favs.remove(item.id);
        fillFavoriteSelect();
        if ($("fav-id").value === item.id) resetFavoriteForm(null);
        renderFavoriteList();
        setStatus(`Deleted favourite ${favs.label(item)}.`);
      }
    });
  }

  function renderCalls() {
    $("call-count").textContent = `Sigfox calls ${sigfox.callCount()}`;
  }

  function fact(label, value, className, options) {
    const cls = className ? ` class="${className}"` : "";
    const body = options?.html ? (value || "—") : fmt.escapeHtml(value || "—");
    return `<dt>${fmt.escapeHtml(label)}</dt><dd${cls}>${body}</dd>`;
  }

  function renderComms() {
    const banner = $("comms-banner");
    const device = state.device;
    if (!device) {
      banner.className = "comms comms-idle";
      banner.innerHTML = `<span class="comms-dot"></span><div><div class="comms-label">Comms</div><p class="comms-detail">Communication state appears after the device call.</p></div>`;
      return;
    }
    const described = sigfox.describeComState(device.comState);
    const lqi = fmt.formatLqi(device.lqi);
    banner.className = `comms comms-${described.key}`;
    banner.innerHTML = `<span class="comms-dot"></span><div>
      <div class="comms-label">${fmt.escapeHtml(described.label)}</div>
      <p class="comms-detail">${fmt.escapeHtml(described.detail)} Last message ${fmt.escapeHtml(time(device.lastCom))}. Link ${fmt.escapeHtml(lqi)}.</p>
    </div>`;
  }

  function renderFacts() {
    const device = state.device;
    if (!device) {
      $("dossier-facts").innerHTML = "";
      return;
    }
    const token = device.token;
    const tokenText = token
      ? [token.detailMessage, token.end ? `until ${time(token.end)}` : ""].filter(Boolean).join(" · ")
      : "";
    const stateLabel = device.stateLabel || "—";
    const stateClass = device.state === 0 ? "fact-ok" : "fact-bad";
    const rows = [
      ["Name", device.name],
      ["Id", backendIdLink(device.id, deviceBackendUrl(device.id)), null, { html: true }],
      ["Device state", `${stateLabel}  (Last seen ${time(device.lastCom)})`, stateClass],
      ["Activation", time(device.activationTime)],
      ["Created", time(device.creationTime)],
      ["Token", tokenText],
      ["Link quality", fmt.formatLqi(device.lqi)],
      ["Product certificate", device.prototype ? "Prototype" : device.productCertificate],
      ["Modem certificate", device.modemCertificate],
      ["Device type", device.deviceType.name || device.deviceType.id],
      ["Group", device.group.name || device.group.id],
      ["Contract", device.contract.name || device.contract.id],
      ["Sequence", device.sequenceNumber == null ? "" : String(device.sequenceNumber)],
      ["Registered position", device.registeredLocation ? `${device.registeredLocation.lat.toFixed(5)}, ${device.registeredLocation.lng.toFixed(5)}` : ""]
    ];
    $("dossier-facts").innerHTML = rows.map(([label, value, className, options]) => fact(label, value, className, options)).join("");
  }

  function renderLocation() {
    const location = state.location || { pendingStations: true, stations: [] };
    charts.drawMap($("location-canvas"), location, { keepView: true });
    const nearest = location?.nearest;
    if (!state.device) {
      $("location-meta").textContent = "Basestation ids come from the last 3 messages with radio info. Their coordinates come from the basestation API.";
      $("station-list").innerHTML = "";
      return;
    }
    if (!location || location.pendingStations) {
      const fix = location?.approx;
      $("location-meta").textContent = fix
        ? `Computed fix ${fix.lat.toFixed(5)}, ${fix.lng.toFixed(5)} (${location.sourceLabel}). Basestation ids load with message history.`
        : "No computed fix yet. Basestation coordinates are looked up after the messages load.";
      $("station-list").innerHTML = "";
      return;
    }
    const heard = location.stations || [];
    const stamp = Number.isFinite(location.stationTime) ? time(location.stationTime) : "";
    const windowLabel = location.stationMessageCount === 1 ? "Last message" : `Last ${location.stationMessageCount || 3} messages`;
    if (nearest && heard.length) {
      const distance = Number.isFinite(location.distanceMeters)
        ? ` · ${location.distanceMeters < 1000 ? `${Math.round(location.distanceMeters)} m` : `${(location.distanceMeters / 1000).toFixed(1)} km`} from the fix`
        : "";
      const rssi = nearest.rssi == null ? "" : ` ${fmt.formatNumber(nearest.rssi, 1)} dBm`;
      $("location-meta").textContent = `${windowLabel}${stamp ? ` · newest ${stamp}` : ""} · ${heard.length} basestation${heard.length === 1 ? "" : "s"}. Strongest ${nearest.id || "unknown"}${rssi}${distance}.`;
    } else if (location.approx) {
      $("location-meta").textContent = `Fix ${location.approx.lat.toFixed(5)}, ${location.approx.lng.toFixed(5)} (${location.sourceLabel}). No basestation was listed on the last messages.`;
    } else if ((location.stations || []).length) {
      const ids = location.stations.map((station) => station.id).filter(Boolean).join(", ");
      const failure = location.stations.find((station) => station.error);
      $("location-meta").textContent = failure
        ? `Heard ${ids}. The basestation API did not return coordinates. ${failure.error}`
        : `Heard ${ids}. Coordinates were not on the message or the basestation record.`;
    } else {
      $("location-meta").textContent = "The loaded messages did not include basestation ids.";
    }
    const stations = [...heard].sort((a, b) => (b.rssi ?? -999) - (a.rssi ?? -999));
    $("station-list").innerHTML = stations.map((station) => {
      const color = charts.rssiColor(station.rssi);
      const rssi = station.rssi == null ? "—" : `${fmt.formatNumber(station.rssi, 1)} dBm`;
      const idHtml = station.id
        ? backendIdLink(station.id, stationBackendUrl(station.id))
        : "station";
      const nameHtml = station.name ? ` ${fmt.escapeHtml(station.name)}` : "";
      return `<li><span>${idHtml}${nameHtml}</span><span style="color:${color}">${fmt.escapeHtml(rssi)}</span></li>`;
    }).join("");
  }

  function keepAliveText(seconds) {
    if (!seconds) return "Off";
    if (seconds % 86400 === 0) return `${seconds / 86400} d`;
    if (seconds % 3600 === 0) return `${seconds / 3600} h`;
    return `${Math.round(seconds / 60)} min`;
  }

  function renderDownlink() {
    const panel = $("downlink-panel");
    const summary = $("downlink-summary");
    const device = state.device;
    const seen = state.messages.map((msg) => msg.downlink).find((item) => item && (item.data || item.stationId));
    const seenHtml = seen
      ? `<p>Last downlink in history ${fmt.escapeHtml(time(seen.time))}${seen.stationId ? ` via cell ${fmt.escapeHtml(seen.stationId)}` : ""}${seen.data ? `: <span class="mono">${fmt.escapeHtml(seen.data)}</span>` : ""}.</p>`
      : `<p class="dim">No downlink answer in the loaded messages.</p>`;
    const seenNote = seen
      ? `Last DL ${time(seen.time)}${seen.stationId ? ` · ${seen.stationId}` : ""}`
      : "No downlink in loaded messages";
    if (!device) {
      panel?.classList.remove("is-open");
      if (summary) summary.textContent = "Not loaded · click Details";
      $("downlink-body").innerHTML = `<p class="dim">Direct or webhook configuration is not loaded until Details is clicked.</p>`;
      $("details-btn").disabled = true;
      return;
    }
    $("details-btn").disabled = detailsBusy || state.detailsLoaded;
    $("details-btn").textContent = state.detailsLoaded ? "Loaded" : (detailsBusy ? "Reading…" : "Details");
    if (!state.detailsLoaded) {
      panel?.classList.remove("is-open");
      if (summary) summary.textContent = detailsBusy ? "Reading device type…" : `Not loaded · ${seenNote}`;
      $("downlink-body").innerHTML = `<p class="dim">Direct or webhook configuration stays unloaded until Details is clicked. That avoids the device-type and callback calls.</p>${seenHtml}`;
      return;
    }
    const type = state.deviceType;
    const modeClass = type?.downlinkKey === "direct" ? "mode-direct" : (type?.downlinkKey === "callback" ? "mode-callback" : "");
    let config = "";
    if (type?.downlinkKey === "direct") {
      config = `<p>Direct hex <span class="mono">${fmt.escapeHtml(type.downlinkDataString || "—")}</span></p>`;
    } else if (type?.downlinkKey === "callback") {
      const hooks = state.callbacks || [];
      const downlinkHooks = hooks.filter((item) => item.downlinkHook || item.callbackSubtype === 3);
      const shown = downlinkHooks.length ? downlinkHooks : hooks.filter((item) => item.url);
      config = shown.length
        ? `<ul class="stations">${shown.map((item) => {
          const href = fmt.safeHttpUrl(item.url);
          const url = href ? `<a href="${fmt.escapeHtml(href)}" rel="noreferrer noopener">${fmt.escapeHtml(href)}</a>` : fmt.escapeHtml(item.url || item.recipient || item.channel);
          const tag = item.downlinkHook ? `<span class="hook">downlink</span>` : fmt.escapeHtml(item.subtypeLabel || item.typeLabel || "");
          return `<li><span>${item.httpMethod ? `${fmt.escapeHtml(item.httpMethod)} ` : ""}${url}</span><span>${tag}${item.enabled ? "" : " off"}</span></li>`;
        }).join("")}</ul>`
        : `<p>Webhook mode, but Sigfox returned no callback URL.</p>`;
    } else if (type?.downlinkKey === "none") {
      config = `<p>Downlink is disabled for this device type.</p>`;
    } else if (type) {
      config = `<p>${fmt.escapeHtml(type.downlinkLabel)}. ${fmt.escapeHtml(type.downlinkDataString || "")}</p>`;
    }
    const extra = [
      type?.keepAlive != null ? `Keep-alive ${keepAliveText(type.keepAlive)}` : "",
      type?.payloadTypeLabel ? `Payload ${type.payloadTypeLabel}` : "",
      type?.alertEmail ? `Alert ${type.alertEmail}` : ""
    ].filter(Boolean).join(" · ");
    panel?.classList.add("is-open");
    if (summary) summary.textContent = `${type?.downlinkLabel || "Unknown"}${extra ? ` · ${extra}` : ""}`;
    $("downlink-body").innerHTML = `
      <div class="downlink-mode ${modeClass}">${fmt.escapeHtml(type?.downlinkLabel || "Unknown")}</div>
      ${config}
      <p class="dim">${fmt.escapeHtml(extra)}</p>
      ${seenHtml}`;
  }

  function numericFields() {
    const fields = new Map();
    fields.set("lqi", { label: "LQI", unit: "" });
    fields.set("best_rssi", { label: "Best RSSI", unit: "dBm" });
    for (const msg of state.messages) {
      for (const item of msg.decoded?.fields || []) {
        if (!Number.isFinite(item.number)) continue;
        const existing = fields.get(item.name);
        if (!existing) fields.set(item.name, { label: item.name, unit: item.unit || "" });
        else if (!existing.unit && item.unit) existing.unit = item.unit;
      }
    }
    return fields;
  }

  function fieldOptionLabel(meta) {
    if (!meta) return "";
    return meta.unit ? `${meta.label} (${meta.unit})` : meta.label;
  }

  function historySamples(message, fieldName) {
    const decoded = message.decoded?.fields || [];
    const byName = new Map(decoded.map((item) => [item.name, item]));
    const interval = byName.get("interval_m") || byName.get("interval");
    const minutes = Number(interval?.number);
    if (!Number.isFinite(minutes) || minutes <= 0 || !Number.isFinite(message.time)) return [];
    const bases = fieldName === "temperature" ? ["temperature", "temp"] : [fieldName];
    const samples = [];
    for (const base of bases) {
      for (let step = 1; step <= 6; step += 1) {
        const sample = byName.get(`${base}_history${step}`);
        if (!sample || !Number.isFinite(sample.number)) continue;
        samples.push({ x: message.time - step * minutes * 60000, y: sample.number });
      }
    }
    return samples;
  }

  function bestRssi(message) {
    let best = null;
    for (const station of message.stations || []) {
      if (station.rssi == null) continue;
      if (best == null || station.rssi > best) best = station.rssi;
    }
    return best;
  }

  function sigfoxSeries(name) {
    const points = [];
    for (const msg of state.messages) {
      if (!Number.isFinite(msg.time)) continue;
      if (name === "lqi" && Number.isFinite(msg.lqi) && msg.lqi >= 0 && msg.lqi <= 3) {
        points.push({ x: msg.time, y: msg.lqi });
      } else if (name === "best_rssi") {
        const rssi = bestRssi(msg);
        if (rssi != null) points.push({ x: msg.time, y: rssi });
      } else {
        const item = (msg.decoded?.fields || []).find((field) => field.name === name);
        if (item && Number.isFinite(item.number)) points.push({ x: msg.time, y: item.number });
        for (const sample of historySamples(msg, name)) points.push(sample);
      }
    }
    return points.sort((a, b) => a.x - b.x);
  }

  function pickExisting(fields, candidates) {
    for (const name of candidates) if (fields.has(name)) return name;
    return "";
  }

  function isHeaderishField(name) {
    return /^(firmware|reserved|is_system|message_type|header|version$|seq|lqi|best_rssi)/i.test(String(name || ""));
  }

  function preferredSigfoxField(fields) {
    const slug = String(state.schemaSlug || "").toLowerCase();
    const deviceType = String(state.device?.deviceType?.name || "").toLowerCase();
    const hint = `${slug} ${deviceType}`;
    if (/co2/.test(hint)) {
      const hit = pickExisting(fields, ["co2_level", "co2", "CO2", "max_co2", "min_co2"]);
      if (hit) return hit;
    }
    if (/airwits_pm|_pm_|airwits pm|\bpm\b/.test(hint)) {
      const hit = pickExisting(fields, ["pm_25", "pm25", "pm2_5", "pm2.5"]);
      if (hit) return hit;
    }
    if (/iaq|tvoc/.test(hint)) {
      const hit = pickExisting(fields, ["tvoc", "tvoc_val", "avg_tvoc", "max_tvoc"]);
      if (hit) return hit;
    }
    if (/detectify/.test(hint)) {
      const hit = pickExisting(fields, ["state", "state_change", "state_changed"]);
      if (hit) return hit;
    }
    if (/press_guard|pressguard/.test(hint)) {
      const hit = pickExisting(fields, ["diff_pressure", "differential_pressure"]);
      if (hit) return hit;
    }
    if (/multiguard|multi_guard/.test(hint)) {
      const hit = pickExisting(fields, ["co2_level", "co2", "CO2"]);
      if (hit) return hit;
    }
    if (/airwits|ranger|temp|flex|eco|multi/.test(hint)) {
      const hit = pickExisting(fields, ["temperature", "temp", "temperature1"]);
      if (hit) return hit;
    }
    const temp = pickExisting(fields, ["temperature", "temp", "temperature1"]);
    if (temp) return temp;
    for (const name of fields.keys()) {
      if (!isHeaderishField(name)) return name;
    }
    return fields.keys().next().value || "";
  }

  function insightAliasesFor(sigfoxField) {
    const key = String(sigfoxField || "").toLowerCase();
    if (/^temp/.test(key)) return ["temperature", "temp"];
    if (/co2/.test(key)) return ["co2", "co2_level", "CO2"];
    if (/pm/.test(key)) return ["pm_25", "pm25", "pm2.5", "pm2_5", "PM2.5"];
    if (/tvoc/.test(key)) return ["tvoc", "TVOC", "tvoc_val", "avg_tvoc"];
    if (/^state/.test(key)) return ["state", "occupancy", "movement", "state_change"];
    if (/diff_pressure|pressure/.test(key)) return ["diff_pressure", "differential_pressure", "pressure"];
    return [sigfoxField];
  }

  function preferredInsightKey(series, sigfoxField) {
    if (!series.length) return "";
    const aliases = insightAliasesFor(sigfoxField).map((item) => String(item || "").toLowerCase());
    for (const alias of aliases) {
      const exact = series.find((item) => String(item.key || "").toLowerCase() === alias
        || String(item.label || "").toLowerCase() === alias);
      if (exact) return exact.key;
    }
    for (const alias of aliases) {
      const soft = series.find((item) => {
        const key = String(item.key || "").toLowerCase();
        const label = String(item.label || "").toLowerCase();
        return (alias && key.includes(alias)) || (alias && label.includes(alias));
      });
      if (soft) return soft.key;
    }
    return series[0].key;
  }

  function renderSigfoxChart() {
    const fields = numericFields();
    const select = $("sigfox-field");
    const previous = state.sigfoxField;
    select.innerHTML = [...fields.entries()].map(([name, meta]) => `<option value="${fmt.escapeHtml(name)}">${fmt.escapeHtml(fieldOptionLabel(meta))}</option>`).join("");
    const choice = fields.has(previous) ? previous : preferredSigfoxField(fields);
    state.sigfoxField = choice || "";
    if (choice) select.value = choice;
    const meta = fields.get(choice) || { unit: "" };
    const points = choice ? sigfoxSeries(choice) : [];
    const sigfoxMissing = state.sigfoxPhase === "failed" && !state.messages.length;
    charts.drawSeries($("sigfox-chart"), sigfoxMissing ? [] : points, {
      color: GREEN,
      unit: meta.unit || "",
      tz: state.tz,
      empty: sigfoxMissing ? "Not loaded" : (state.messages.length ? "No samples for this field" : (state.sigfoxPhase === "loading" ? "Loading Sigfox history…" : "History loads after the device is on screen.")),
      detail: sigfoxMissing ? shortReason(state.sigfoxError || "The Sigfox history request failed.") : ""
    });
    const decoded = state.messages.filter((msg) => msg.decoded && !msg.decoded.error && msg.decoded.fields?.length).length;
    const unitText = meta.unit ? ` ${meta.unit}` : "";
    const span = points.length ? `${time(points[0].x)} → ${time(points[points.length - 1].x)}` : "";
    $("sigfox-readout").textContent = state.messages.length
      ? `${state.messages.length} messages · ${points.length} plotted${unitText}${span ? ` · ${span}` : ""} · ${decoded} decoded${state.messageNote ? ` · ${state.messageNote}` : ""}`
      : (state.sigfoxPhase === "failed"
        ? (state.sigfoxError || "Sigfox history did not load.")
        : (state.sigfoxPhase === "loading"
          ? "Loading Sigfox history…"
          : "History loads after the device is on screen. About three months, one paged call sequence."));
    const recent = [...state.messages].filter((msg) => Number.isFinite(msg.time)).sort((a, b) => b.time - a.time).slice(0, 6);
    $("recent-frames").innerHTML = recent.map((msg) => {
      const variant = msg.decoded?.variant || msg.decoded?.error || msg.kind;
      return `<div><span>${fmt.escapeHtml(time(msg.time))}  ${msg.seq == null ? "" : `#${msg.seq}`}</span><span>${fmt.escapeHtml(fmt.formatLqi(msg.lqi))}  ${fmt.escapeHtml(variant)}</span></div>`;
    }).join("");
  }

  function renderInsightChart() {
    const series = state.insightStore?.series || [];
    const select = $("ci-field");
    select.innerHTML = series.map((item) => {
      const label = item.unit ? `${item.label || item.key} (${item.unit})` : (item.label || item.key);
      return `<option value="${fmt.escapeHtml(item.key)}">${fmt.escapeHtml(label)}</option>`;
    }).join("");
    const preferred = preferredInsightKey(series, state.sigfoxField);
    const chosen = series.find((item) => item.key === state.insightField)
      || series.find((item) => item.key === preferred)
      || series[0];
    if (chosen) {
      state.insightField = chosen.key;
      select.value = chosen.key;
      const points = insightApi.downsample(chosen.t, chosen.v, $("ci-chart").clientWidth || 640);
      charts.drawSeries($("ci-chart"), points, {
        color: ORANGE,
        unit: chosen.unit || "",
        tz: state.tz,
        empty: "No observations"
      });
      const unitText = chosen.unit ? ` ${chosen.unit}` : "";
      const span = Number.isFinite(chosen.firstMs) && Number.isFinite(chosen.lastMs)
        ? ` · ${time(chosen.firstMs)} → ${time(chosen.lastMs)}`
        : "";
      $("ci-readout").textContent = `${chosen.label || chosen.key}${unitText} · ${chosen.count || chosen.t?.length || 0} observations${span}${state.insightNote ? ` · ${state.insightNote}` : ""}`;
      return;
    }
    const insightMissing = state.insightPhase === "failed";
    charts.drawSeries($("ci-chart"), [], {
      color: ORANGE,
      empty: insightMissing ? "Not loaded" : (state.insightPhase === "loading" ? "Loading Connected Insight…" : (state.insightPhase === "ready" ? "No observations in this window" : "Loads after the Sigfox history.")),
      detail: insightMissing ? shortReason(state.insightNote || "The Connected Insight request failed.") : ""
    });
    $("ci-readout").textContent = insightMissing
      ? (state.insightNote || "Connected Insight did not load.")
      : (state.insightPhase === "loading" ? "Loading Connected Insight…" : (state.insightNote || "Loads after the Sigfox history."));
  }

  function currentSnapshot() {
    const schema = decode.schemaBySlug(state.schemaSlug);
    return snapshots.build({
      deviceId: state.deviceId,
      device: state.device,
      deviceType: state.deviceType,
      callbacks: state.callbacks || [],
      location: state.location,
      messages: state.messages,
      messageError: state.messageNote,
      rateLimited: state.rateLimited,
      insightStore: state.insightStore,
      schema: schema ? { slug: schema.slug, device: schema.device, version: schema.version } : null,
      sigfoxCalls: sigfox.callCount()
    });
  }

  function renderInsights() {
    if (!state.device) {
      $("insights-body").innerHTML = `<p class="dim">Anomalies appear after the device and its history are loaded.</p>`;
      return;
    }
    const found = rules.run(currentSnapshot());
    if (!found.length) {
      $("insights-body").innerHTML = `<article class="insight insight-good"><div class="kicker">Clear</div><h3>No anomalies in this snapshot</h3><p>Rules ran on the data loaded so far.</p></article>`;
      return;
    }
    $("insights-body").innerHTML = found.map((item) => `<article class="insight insight-${fmt.escapeHtml(item.severity || "info")}">
      <div class="kicker">${fmt.escapeHtml(item.severity || "info")}${item.at ? ` · ${fmt.escapeHtml(time(item.at))}` : ""}</div>
      <h3>${fmt.escapeHtml(item.title)}</h3>
      <p>${fmt.escapeHtml(item.detail)}</p>
    </article>`).join("");
  }

  function consumptionEntry(deviceId) {
    const id = String(deviceId || "").toUpperCase();
    if (!id) return null;
    let entry = state.consumptionCache.get(id);
    if (!entry) {
      entry = { years: {}, days: [], note: "", complete: false };
      state.consumptionCache.set(id, entry);
    }
    return entry;
  }

  function rebuildConsumptionDays(entry) {
    const days = [];
    for (const year of Object.keys(entry.years).map(Number).sort((a, b) => a - b)) {
      const block = entry.years[year];
      if (block?.days) days.push(...block.days);
    }
    entry.days = days;
  }

  function consumptionSeries(days) {
    return [
      {
        key: "uplink",
        label: "Uplink",
        color: GREEN,
        points: days.map((day) => ({ x: day.time, y: day.uplink }))
      },
      {
        key: "downlink",
        label: "Downlink",
        color: "#9b7bb8",
        points: days.map((day) => ({ x: day.time, y: day.downlink }))
      },
      {
        key: "oob",
        label: "OOB",
        color: "#5f9ea0",
        points: days.map((day) => ({ x: day.time, y: day.oob }))
      }
    ];
  }

  function renderStatsButton() {
    const btn = $("stats-btn");
    if (!btn) return;
    btn.disabled = !state.device || state.consumptionLoading;
    btn.textContent = state.consumptionLoading ? "Loading stats…" : "Message stats";
  }

  function renderStatsChart() {
    const canvas = $("stats-chart");
    if (!canvas) return;
    const entry = state.deviceId ? state.consumptionCache.get(String(state.deviceId).toUpperCase()) : null;
    const days = entry?.days || [];
    const loading = state.consumptionLoading;
    charts.drawMultiSeries(canvas, consumptionSeries(days), {
      unit: "msg",
      tz: state.tz,
      empty: loading ? "Loading yearly consumptions…" : "No consumption data yet",
      detail: loading ? state.consumptionNote : (state.consumptionNote || "Open Message stats to load yearly Sigfox consumptions.")
    });
    const yearCount = entry ? Object.keys(entry.years).length : 0;
    const uplink = days.reduce((sum, day) => sum + (day.uplink || 0), 0);
    const downlink = days.reduce((sum, day) => sum + (day.downlink || 0), 0);
    const oob = days.reduce((sum, day) => sum + (day.oob || 0), 0);
    if (days.length) {
      $("stats-meta").textContent = `${yearCount} year${yearCount === 1 ? "" : "s"} · ${days.length} days · uplink ${uplink} · downlink ${downlink} · oob ${oob}${entry?.complete ? "" : " · loading…"}${state.consumptionNote ? ` · ${state.consumptionNote}` : ""}`;
    } else {
      $("stats-meta").textContent = state.consumptionNote
        || "Daily Sigfox consumptions by year. Loaded only when you open this panel.";
    }
    if (!$("stats-readout").dataset.hover) {
      $("stats-readout").textContent = days.length ? "Hover the chart for a day." : "No day selected.";
    }
    $("stats-refresh").disabled = !state.device || state.consumptionLoading;
    renderStatsButton();
  }

  async function loadConsumptionStats(options) {
    const force = options?.force === true;
    if (!state.device || !state.deviceId) {
      setStatus("Inspect a device before opening message stats.");
      return;
    }
    const auth = creds.sigfoxAuthHeader();
    if (!auth) {
      setStatus("Select a Sigfox key first.");
      return;
    }
    const deviceId = String(state.deviceId).toUpperCase();
    const entry = consumptionEntry(deviceId);
    const years = sigfox.consumptionYearsForDevice(state.device);
    const missing = force
      ? years
      : years.filter((year) => {
          const block = entry.years[year];
          return !block || block.error || !Array.isArray(block.days);
        });
    if (!missing.length) {
      rebuildConsumptionDays(entry);
      entry.complete = true;
      state.consumptionNote = "Using cached consumptions for this device.";
      renderStatsChart();
      return;
    }
    for (const year of missing) delete entry.years[year];
    const my = ++statsJob;
    state.consumptionLoading = true;
    state.consumptionNote = force ? "Refreshing yearly consumptions…" : "Loading yearly consumptions…";
    renderStatsChart();
    try {
      for (let index = 0; index < missing.length; index += 1) {
        if (my !== statsJob) return;
        if (String(state.deviceId).toUpperCase() !== deviceId) return;
        const year = missing[index];
        state.consumptionNote = `Loading ${year} (${index + 1}/${missing.length})…`;
        renderStatsChart();
        renderCalls();
        try {
          const block = await sigfox.loadDeviceConsumptionYear(deviceId, year, auth);
          if (my !== statsJob) return;
          entry.years[year] = block;
          rebuildConsumptionDays(entry);
          renderStatsChart();
          renderCalls();
        } catch (error) {
          if (error?.code === "RATE_LIMIT") {
            state.consumptionNote = error.message || "Sigfox rate limit reached.";
            entry.complete = false;
            break;
          }
          entry.years[year] = { year, days: [], error: error.message || String(error) };
          state.consumptionNote = `${year}: ${error.message || String(error)}`;
          rebuildConsumptionDays(entry);
          renderStatsChart();
        }
      }
      if (my !== statsJob) return;
      const have = years.filter((year) => entry.years[year] && !entry.years[year].error).length;
      entry.complete = have === years.length;
      if (!state.consumptionNote || /Loading/.test(state.consumptionNote)) {
        state.consumptionNote = entry.complete
          ? `Loaded ${have} year${have === 1 ? "" : "s"} from activation.`
          : `Loaded ${have} of ${years.length} years.`;
      }
    } finally {
      if (my === statsJob) {
        state.consumptionLoading = false;
        renderStatsChart();
        renderCalls();
      }
    }
  }

  function openStatsModal(force) {
    if (!state.device) {
      setStatus("Inspect a device before opening message stats.");
      return;
    }
    $("stats-modal").hidden = false;
    $("stats-readout").dataset.hover = "";
    renderStatsChart();
    loadConsumptionStats({ force: force === true });
  }

  function renderAll() {
    renderCalls();
    renderComms();
    renderFacts();
    renderLocation();
    renderDownlink();
    renderSigfoxChart();
    renderInsightChart();
    renderInsights();
    renderStatsButton();
    if (!$("stats-modal").hidden) renderStatsChart();
    $("tz-local").classList.toggle("is-on", state.tz !== "utc");
    $("tz-utc").classList.toggle("is-on", state.tz === "utc");
  }

  function applySchema(slug, fromUser) {
    state.schemaSlug = slug || "";
    if (fromUser) {
      if (slug) localStorage.setItem(SCHEMA_KEY, slug);
      else localStorage.removeItem(SCHEMA_KEY);
      state.sigfoxField = "";
      state.insightField = "";
    }
    if (!state.messages.length) return;
    const schema = decode.schemaBySlug(state.schemaSlug);
    state.messages = state.messages.map((msg) => ({
      ...msg,
      decoded: decode.decodeMessage(msg, schema?.schema)
    }));
    renderSigfoxChart();
    renderInsightChart();
    renderInsights();
  }

  function schemaHints() {
    return {
      deviceTypeName: state.device?.deviceType?.name || "",
      parserModel: state.insightParser?.model || "",
      parserRevision: state.insightParser?.revision || "",
      insightVersion: state.insightVersion
    };
  }

  function maybeAutodetectSchema() {
    if (!state.autoSchema || !state.messages.length) return false;
    const suggested = decode.suggestSchema(state.messages, schemaHints());
    if (!suggested?.slug) return false;
    if (suggested.slug === state.schemaSlug) return false;
    state.schemaSlug = suggested.slug;
    $("schema-select").value = suggested.slug;
    localStorage.setItem(SCHEMA_KEY, suggested.slug);
    state.sigfoxField = "";
    state.insightField = "";
    applySchema(suggested.slug, false);
    return true;
  }

  function applyMessages(history) {
    let schema = decode.schemaBySlug(state.schemaSlug);
    if (state.autoSchema) {
      const suggested = decode.suggestSchema(history.messages, schemaHints());
      if (suggested) {
        schema = suggested;
        state.schemaSlug = suggested.slug;
        $("schema-select").value = suggested.slug;
        localStorage.setItem(SCHEMA_KEY, suggested.slug);
      }
    }
    state.sigfoxField = "";
    state.insightField = "";
    state.messages = decode.decodeAll(history.messages, schema?.schema);
    state.rateLimited = history.rateLimited;
    const notes = [];
    if (history.rateLimited) notes.push(history.error || "Stopped on the Sigfox rate limit");
    if (history.truncated) notes.push("History truncated at the page cap");
    state.messageNote = notes.join(". ");
    state.location = sigfox.locationFromMessages(state.messages, state.device);
    renderAll();
  }

  async function loadInsight(token) {
    state.insightPhase = "loading";
    state.insightNote = "";
    const profile = creds.active("insight");
    if (!profile) {
      state.insightNote = "No Connected Insight key selected.";
      state.insightStore = null;
      state.insightParser = null;
      state.insightVersion = null;
      state.insightPhase = "failed";
      renderInsightChart();
      updateReloadButtons();
      return;
    }
    const range = insightApi.rangeFor($("ci-range").value);
    renderInsightChart();
    try {
      if (insightApi.fetchDeviceInfo) {
        try {
          setStatus("Connected Insight · reading device parser…");
          const info = await insightApi.fetchDeviceInfo({
            deviceId: state.deviceId,
            apiKey: profile.token
          });
          if (token !== job) return;
          state.insightParser = info?.parser || null;
          if (state.autoSchema && maybeAutodetectSchema()) {
            setStatus(`Schema set from Connected Insight parser${state.insightParser?.model ? ` (${state.insightParser.model}${state.insightParser.revision ? ` ${state.insightParser.revision}` : ""})` : ""}.`);
          }
        } catch {
          if (token !== job) return;
          state.insightParser = state.insightParser || null;
        }
      }
      state.insightStore = await insightApi.fetchObservations({
        deviceId: state.deviceId,
        apiKey: profile.token,
        fromMs: range.fromMs,
        toMs: range.toMs,
        onProgress: (progress) => {
          if (token === job) setStatus(`Connected Insight · ${progress.received} observations`);
        }
      });
      if (token !== job) return;
      state.insightVersion = insightApi.firmwareVersionFromStore
        ? insightApi.firmwareVersionFromStore(state.insightStore)
        : null;
      if (state.autoSchema) maybeAutodetectSchema();
      state.insightPhase = "ready";
      state.insightNote = state.insightStore?.truncated ? "Insight history truncated" : "";
    } catch (error) {
      if (token !== job) return;
      state.insightStore = null;
      state.insightPhase = "failed";
      state.insightNote = error.message || String(error);
    }
    if (token === job) {
      renderInsightChart();
      renderInsights();
      updateReloadButtons();
    }
  }

  async function inspect() {
    const deviceId = normalizeId($("device-id").value);
    $("device-id").value = deviceId;
    if (!deviceId) {
      setStatus("Enter one device id.");
      return;
    }
    const auth = creds.sigfoxAuthHeader();
    if (!auth) {
      setStatus("Select a Sigfox key first.");
      return;
    }
    if (state.deviceId === deviceId && state.messages.length) {
      const agreed = window.confirm("This device was already loaded. Fetching again uses more of the Sigfox quota. Continue?");
      if (!agreed) return;
    }
    const my = ++job;
    statsJob += 1;
    sigfox.resetCallCount();
    state.inspected = true;
    state.deviceId = deviceId;
    state.sigfoxPhase = "loading";
    state.insightPhase = "idle";
    state.sigfoxError = "";
    state.device = null;
    state.deviceType = null;
    state.callbacks = null;
    state.detailsLoaded = false;
    state.location = null;
    state.messages = [];
    state.messageNote = "";
    state.rateLimited = false;
    state.insightStore = null;
    state.insightParser = null;
    state.insightVersion = null;
    state.insightNote = "";
    state.consumptionLoading = false;
    state.consumptionNote = "";
    localStorage.setItem(DEVICE_KEY, deviceId);
    setBusy(true);
    try {
      renderAll();
      setStatus("Reading the device. Message history starts after this.");
      const dossier = await sigfox.loadDossier(deviceId, auth, {
        onProgress: (text) => { if (my === job) setStatus(text); },
        cancelled: () => my !== job
      });
      if (my !== job) return;
      state.device = dossier.device;
      state.location = dossier.location;
      renderAll();
      setStatus("Device is on screen. Loading Sigfox messages…");
      const history = await sigfox.loadMessages(deviceId, auth, {
        onProgress: (text) => { if (my === job) { setStatus(text); renderCalls(); } },
        cancelled: () => my !== job
      });
      if (my !== job) return;
      state.sigfoxPhase = history.rateLimited ? "failed" : "ready";
      state.sigfoxError = history.rateLimited ? (history.error || "Sigfox rate limit reached before the history finished.") : "";
      applyMessages(history);
      const heard = sigfox.lastHeardStations(state.messages);
      if (heard.length) {
        setStatus("Looking up basestations from the last 3 messages…");
        const stations = await sigfox.loadStationLocations(heard, auth, {
          onProgress: (text) => { if (my === job) { setStatus(text); renderCalls(); } },
          cancelled: () => my !== job
        });
        if (my !== job) return;
        state.location = sigfox.locationFromMessages(state.messages, state.device, stations);
        renderLocation();
      }
      setStatus("Sigfox history loaded. Loading Connected Insight…");
      await loadInsight(my);
      if (my !== job) return;
      const tail = state.rateLimited ? " Sigfox stopped early on the rate limit." : "";
      setStatus(`Done. ${sigfox.callCount()} Sigfox calls.${tail}`);
      renderCalls();
    } catch (error) {
      if (my !== job) return;
      if (state.sigfoxPhase !== "ready") {
        state.sigfoxPhase = "failed";
        state.sigfoxError = error.message || String(error);
      }
      if (state.insightPhase === "idle" || state.insightPhase === "loading") {
        state.insightPhase = "failed";
        state.insightNote = "Not loaded. Insight was not requested because Sigfox did not finish.";
      }
      setStatus(error.message || String(error));
      renderAll();
    } finally {
      if (my === job) setBusy(false);
    }
  }

  async function reloadSigfox() {
    const deviceId = normalizeId($("device-id").value) || state.deviceId;
    $("device-id").value = deviceId;
    if (!deviceId) {
      setStatus("Enter one device id.");
      return;
    }
    const auth = creds.sigfoxAuthHeader();
    if (!auth) {
      setStatus("Select a Sigfox key first.");
      return;
    }
    if (state.messages.length) {
      const agreed = window.confirm("Fetching Sigfox again uses more of the quota. Continue?");
      if (!agreed) return;
    }
    const my = ++job;
    state.inspected = true;
    state.deviceId = deviceId;
    state.sigfoxPhase = "loading";
    state.sigfoxError = "";
    localStorage.setItem(DEVICE_KEY, deviceId);
    setBusy(true);
    try {
      renderSigfoxChart();
      if (!state.device || state.device.id !== deviceId) {
        setStatus("Reading the device again…");
        const dossier = await sigfox.loadDossier(deviceId, auth, {
          onProgress: (text) => { if (my === job) setStatus(text); },
          cancelled: () => my !== job
        });
        if (my !== job) return;
        state.device = dossier.device;
        state.location = dossier.location;
        renderAll();
      }
      setStatus("Reloading Sigfox messages…");
      const history = await sigfox.loadMessages(deviceId, auth, {
        onProgress: (text) => { if (my === job) { setStatus(text); renderCalls(); } },
        cancelled: () => my !== job
      });
      if (my !== job) return;
      state.sigfoxPhase = history.rateLimited ? "failed" : "ready";
      state.sigfoxError = history.rateLimited ? (history.error || "Sigfox rate limit reached before the history finished.") : "";
      applyMessages(history);
      const heard = sigfox.lastHeardStations(state.messages);
      if (heard.length) {
        setStatus("Looking up basestations from the last 3 messages…");
        const stations = await sigfox.loadStationLocations(heard, auth, {
          onProgress: (text) => { if (my === job) { setStatus(text); renderCalls(); } },
          cancelled: () => my !== job
        });
        if (my !== job) return;
        state.location = sigfox.locationFromMessages(state.messages, state.device, stations);
        renderLocation();
      }
      const tail = state.rateLimited ? " Sigfox stopped early on the rate limit." : "";
      setStatus(state.sigfoxPhase === "ready" ? `Sigfox history loaded.${tail}` : (state.sigfoxError || "Sigfox history did not load."));
      renderCalls();
    } catch (error) {
      if (my !== job) return;
      state.sigfoxPhase = "failed";
      state.sigfoxError = error.message || String(error);
      setStatus(state.sigfoxError);
      renderAll();
    } finally {
      if (my === job) setBusy(false);
    }
  }

  async function reloadInsight() {
    const deviceId = normalizeId($("device-id").value) || state.deviceId;
    if (deviceId) {
      $("device-id").value = deviceId;
      state.deviceId = deviceId;
    }
    if (!state.deviceId) {
      setStatus("Enter one device id.");
      return;
    }
    const my = ++job;
    state.inspected = true;
    setBusy(true);
    try {
      setStatus("Reloading Connected Insight…");
      await loadInsight(my);
      if (my !== job) return;
      setStatus(state.insightPhase === "ready" ? "Connected Insight loaded." : (state.insightNote || "Connected Insight did not load."));
    } finally {
      if (my === job) setBusy(false);
    }
  }

  async function loadDetails() {
    if (!state.device || state.detailsLoaded || detailsBusy) return;
    const auth = creds.sigfoxAuthHeader();
    if (!auth) {
      setStatus("Select a Sigfox key first.");
      return;
    }
    const my = job;
    detailsBusy = true;
    setLoading(true);
    renderDownlink();
    try {
      const result = await sigfox.loadDownlinkDetails(state.device.deviceType.id, auth, {
        onProgress: (text) => { if (my === job) setStatus(text); }
      });
      if (my !== job) return;
      state.deviceType = result.deviceType;
      state.callbacks = result.callbacks;
      state.detailsLoaded = true;
      if (result.deviceType.name && !state.device.deviceType.name) {
        state.device.deviceType.name = result.deviceType.name;
      }
      setStatus(result.deviceType.downlinkMode === 1
        ? "Downlink details loaded, including the webhook list."
        : "Downlink details loaded. Callback list was skipped because this type is not webhook mode.");
      renderFacts();
      renderDownlink();
      renderCalls();
      renderInsights();
    } catch (error) {
      if (my === job) setStatus(error.message || String(error));
    } finally {
      detailsBusy = false;
      setLoading(busy);
      if (my === job) renderDownlink();
    }
  }

  function exportSnapshot() {
    if (!state.device) {
      setStatus("Nothing to export yet.");
      return;
    }
    const blob = new Blob([JSON.stringify(currentSnapshot(), null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `device-${state.deviceId || "snapshot"}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function bindCharts() {
    charts.bindMapControls($("location-canvas"));
    const redraw = () => {
      renderSigfoxChart();
      renderInsightChart();
      charts.drawMap($("location-canvas"), state.location || { pendingStations: true, stations: [] }, { keepView: true });
    };
    const observer = new ResizeObserver(redraw);
    observer.observe($("sigfox-chart"));
    observer.observe($("ci-chart"));
    observer.observe($("location-canvas"));
    $("sigfox-chart").addEventListener("mousemove", (event) => {
      const hit = charts.hitSeries($("sigfox-chart"), event.offsetX);
      if (!hit) return;
      const unit = $("sigfox-chart")._unit ? ` ${$("sigfox-chart")._unit}` : "";
      $("sigfox-readout").textContent = `${time(hit.x)} · ${fmt.formatNumber(hit.y)}${unit}`;
    });
    $("ci-chart").addEventListener("mousemove", (event) => {
      const hit = charts.hitSeries($("ci-chart"), event.offsetX);
      if (!hit) return;
      const unit = $("ci-chart")._unit ? ` ${$("ci-chart")._unit}` : "";
      $("ci-readout").textContent = `${time(hit.x)} · ${fmt.formatNumber(hit.y)}${unit}`;
    });
  }

  function bindCredentials() {
    $("creds-btn").addEventListener("click", () => {
      clearSigfoxCredForm();
      clearInsightCredForm();
      renderCredentialLists();
      $("cred-modal").hidden = false;
    });
    $("cred-close").addEventListener("click", () => { $("cred-modal").hidden = true; });
    $("cred-modal").addEventListener("click", (event) => {
      if (event.target === $("cred-modal")) $("cred-modal").hidden = true;
    });
    $("sfx-cancel").addEventListener("click", clearSigfoxCredForm);
    $("ci-cancel").addEventListener("click", clearInsightCredForm);
    $("sigfox-cred-form").addEventListener("submit", (event) => {
      event.preventDefault();
      try {
        creds.upsert("sigfox", {
          id: $("sfx-id").value || undefined,
          name: $("sfx-name").value,
          login: $("sfx-login").value,
          password: $("sfx-password").value
        });
        clearSigfoxCredForm();
        fillProfiles();
        setStatus("Sigfox key saved.");
      } catch (error) {
        setStatus(error.message);
      }
    });
    $("ci-cred-form").addEventListener("submit", (event) => {
      event.preventDefault();
      try {
        creds.upsert("insight", {
          id: $("ci-id").value || undefined,
          name: $("ci-name").value,
          token: $("ci-token").value
        });
        clearInsightCredForm();
        fillProfiles();
        setStatus("Insight key saved.");
      } catch (error) {
        setStatus(error.message);
      }
    });
    $("cred-modal").addEventListener("click", (event) => {
      const edit = event.target?.dataset?.edit;
      const use = event.target?.dataset?.use;
      const del = event.target?.dataset?.del;
      if (edit) {
        const [kind, id] = edit.split(":");
        editCredential(kind, id);
      }
      if (use) {
        const [kind, id] = use.split(":");
        creds.select(kind, id);
        fillProfiles();
      }
      if (del) {
        const [kind, id] = del.split(":");
        if ((kind === "sigfox" && $("sfx-id").value === id) || (kind === "insight" && $("ci-id").value === id)) {
          if (kind === "sigfox") clearSigfoxCredForm();
          else clearInsightCredForm();
        }
        creds.remove(kind, id);
        fillProfiles();
      }
    });
    $("sigfox-profile").addEventListener("change", () => {
      const id = $("sigfox-profile").value;
      if (id) creds.select("sigfox", id);
    });
    $("ci-profile").addEventListener("change", () => {
      const id = $("ci-profile").value;
      if (id) creds.select("insight", id);
    });
  }

  function boot() {
    if (location.protocol === "file:") {
      setStatus("Open this through python proxy.py so Sigfox and Connected Insight can be reached.");
    }
    const savedDevice = localStorage.getItem(DEVICE_KEY) || "";
    if (savedDevice) $("device-id").value = savedDevice;
    fillProfiles();
    fillSchemas();
    fillFavoriteSelect();
    bindCredentials();
    bindFavorites();
    bindCharts();
    $("inspect-btn").addEventListener("click", inspect);
    $("sigfox-reload").addEventListener("click", reloadSigfox);
    $("insight-reload").addEventListener("click", reloadInsight);
    $("details-btn").addEventListener("click", loadDetails);
    $("stats-btn").addEventListener("click", () => openStatsModal(false));
    $("stats-refresh").addEventListener("click", () => openStatsModal(true));
    $("stats-close").addEventListener("click", () => { $("stats-modal").hidden = true; });
    $("stats-modal").addEventListener("click", (event) => {
      if (event.target === $("stats-modal")) $("stats-modal").hidden = true;
    });
    $("stats-chart").addEventListener("mousemove", (event) => {
      const hit = charts.hitMultiSeries($("stats-chart"), event.offsetX);
      if (!hit) return;
      const uplink = hit.values.uplink;
      const downlink = hit.values.downlink;
      const oob = hit.values.oob;
      $("stats-readout").dataset.hover = "1";
      $("stats-readout").textContent = `${time(hit.x)} · uplink ${uplink ?? "—"} · downlink ${downlink ?? "—"} · oob ${oob ?? "—"}`;
    });
    $("export-btn").addEventListener("click", exportSnapshot);
    $("device-id").addEventListener("keydown", (event) => {
      if (event.key === "Enter") inspect();
    });
    $("auto-schema").addEventListener("change", () => {
      setAutoSchema($("auto-schema").checked);
    });
    $("schema-select").addEventListener("change", () => applySchema($("schema-select").value, true));
    $("sigfox-field").addEventListener("change", () => {
      state.sigfoxField = $("sigfox-field").value;
      state.insightField = "";
      renderSigfoxChart();
      renderInsightChart();
    });
    $("ci-field").addEventListener("change", () => {
      state.insightField = $("ci-field").value;
      renderInsightChart();
    });
    $("ci-range").addEventListener("change", async () => {
      if (state.deviceId) {
        const my = job;
        setStatus("Loading Connected Insight for the new window…");
        setLoading(true);
        try {
          await loadInsight(my);
        } finally {
          if (!busy && !detailsBusy) setLoading(false);
        }
      }
    });
    $("tz-local").addEventListener("click", () => {
      state.tz = "local";
      localStorage.setItem(TZ_KEY, "local");
      renderAll();
    });
    $("tz-utc").addEventListener("click", () => {
      state.tz = "utc";
      localStorage.setItem(TZ_KEY, "utc");
      renderAll();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      $("cred-modal").hidden = true;
      $("favorite-modal").hidden = true;
      $("stats-modal").hidden = true;
    });
    renderAll();
  }

  boot();
})();
