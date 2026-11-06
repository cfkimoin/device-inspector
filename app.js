(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const fmt = window.deviceInspectorFormat;
  const creds = window.deviceInspectorCredentials;
  const sigfox = window.deviceInspectorSigfox;
  const decode = window.deviceInspectorDecode;
  const charts = window.deviceInspectorCharts;
  const insightApi = window.deviceInspectorInsight;
  const rules = window.deviceInspectorRules;
  const snapshots = window.deviceInspectorSnapshot;

  const TZ_KEY = "deviceInspector.tz";
  const DEVICE_KEY = "deviceInspector.lastDevice";
  const SCHEMA_KEY = "deviceInspector.schema";
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
    autoSchema: !localStorage.getItem(SCHEMA_KEY),
    insightStore: null,
    insightNote: "",
    inspected: false,
    sigfoxPhase: "idle",
    insightPhase: "idle",
    sigfoxError: "",
    sigfoxField: "",
    insightField: "",
    tz: localStorage.getItem(TZ_KEY) === "utc" ? "utc" : "local"
  };

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
          <span>
            <button type="button" class="btn" data-use="${kind}:${fmt.escapeHtml(item.id)}">Use</button>
            <button type="button" class="btn" data-del="${kind}:${fmt.escapeHtml(item.id)}">Delete</button>
          </span>
        </div>`;
      }).join("")
      : `<p class="dim">None saved.</p>`;
  }

  function fillSchemas() {
    const schemas = decode.listSchemas();
    const options = [`<option value="">Auto</option>`].concat(schemas.map((item) => {
      const label = `${item.device} ${item.version}`;
      return `<option value="${fmt.escapeHtml(item.slug)}">${fmt.escapeHtml(label)}</option>`;
    }));
    $("schema-select").innerHTML = options.join("");
    if (state.schemaSlug && schemas.some((item) => item.slug === state.schemaSlug)) {
      $("schema-select").value = state.schemaSlug;
    }
    const info = window.payloadBuildInfo;
    $("schema-note").textContent = info
      ? `Schemas ${info.build_date_display || ""} ${info.git_commit_short || ""}`.trim()
      : "Schemas not synced";
  }

  function renderCalls() {
    $("call-count").textContent = `Sigfox calls ${sigfox.callCount()}`;
  }

  function fact(label, value) {
    return `<dt>${fmt.escapeHtml(label)}</dt><dd>${fmt.escapeHtml(value || "—")}</dd>`;
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
    const rows = [
      ["Name", device.name],
      ["Id", device.id],
      ["Device state", device.stateLabel],
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
    $("dossier-facts").innerHTML = rows.map(([label, value]) => fact(label, value)).join("");
  }

  function renderLocation() {
    const location = state.location || { pendingStations: true, stations: [] };
    charts.drawMap($("location-canvas"), location);
    const nearest = location?.nearest;
    if (!state.device) {
      $("location-meta").textContent = "Basestation ids come from the latest message. Their coordinates come from the basestation API.";
      $("station-list").innerHTML = "";
      return;
    }
    if (!location || location.pendingStations) {
      const fix = location?.approx;
      $("location-meta").textContent = fix
        ? `Computed fix ${fix.lat.toFixed(5)}, ${fix.lng.toFixed(5)} (${location.sourceLabel}). Basestation id loads with message history.`
        : "No computed fix yet. Basestation coordinates are looked up after the messages load.";
      $("station-list").innerHTML = "";
      return;
    }
    const heard = location.stations || [];
    const stamp = Number.isFinite(location.stationTime) ? time(location.stationTime) : "";
    if (nearest && heard.length) {
      const distance = Number.isFinite(location.distanceMeters)
        ? ` · ${location.distanceMeters < 1000 ? `${Math.round(location.distanceMeters)} m` : `${(location.distanceMeters / 1000).toFixed(1)} km`} from the fix`
        : "";
      const rssi = nearest.rssi == null ? "" : ` ${fmt.formatNumber(nearest.rssi, 1)} dBm`;
      $("location-meta").textContent = `Last message${stamp ? ` ${stamp}` : ""} · ${heard.length} basestation${heard.length === 1 ? "" : "s"}. Strongest ${nearest.id || "unknown"}${rssi}${distance}.`;
    } else if (location.approx) {
      $("location-meta").textContent = `Fix ${location.approx.lat.toFixed(5)}, ${location.approx.lng.toFixed(5)} (${location.sourceLabel}). No basestation was listed on the latest messages.`;
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
      return `<li><span>${fmt.escapeHtml(station.id || "station")}${station.name ? ` ${fmt.escapeHtml(station.name)}` : ""}</span><span style="color:${color}">${fmt.escapeHtml(rssi)}</span></li>`;
    }).join("");
  }

  function keepAliveText(seconds) {
    if (!seconds) return "Off";
    if (seconds % 86400 === 0) return `${seconds / 86400} d`;
    if (seconds % 3600 === 0) return `${seconds / 3600} h`;
    return `${Math.round(seconds / 60)} min`;
  }

  function renderDownlink() {
    const device = state.device;
    const seen = state.messages.map((msg) => msg.downlink).find((item) => item && (item.data || item.stationId));
    const seenHtml = seen
      ? `<p>Last downlink in history ${fmt.escapeHtml(time(seen.time))}${seen.stationId ? ` via cell ${fmt.escapeHtml(seen.stationId)}` : ""}${seen.data ? `: <span class="mono">${fmt.escapeHtml(seen.data)}</span>` : ""}.</p>`
      : `<p class="dim">No downlink answer in the loaded messages.</p>`;
    if (!device) {
      $("downlink-body").innerHTML = `<p class="dim">Direct or webhook configuration is not loaded until Details is clicked.</p>`;
      $("details-btn").disabled = true;
      return;
    }
    $("details-btn").disabled = detailsBusy || state.detailsLoaded;
    $("details-btn").textContent = state.detailsLoaded ? "Loaded" : (detailsBusy ? "Reading…" : "Details");
    if (!state.detailsLoaded) {
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

  function preferredField(fields) {
    const order = ["oob_vdd_tx", "bat_voltage", "battery_voltage", "temperature", "temp", "lqi"];
    for (const name of order) if (fields.has(name)) return name;
    return fields.keys().next().value || "";
  }

  function renderSigfoxChart() {
    const fields = numericFields();
    const select = $("sigfox-field");
    const previous = state.sigfoxField;
    select.innerHTML = [...fields.entries()].map(([name, meta]) => `<option value="${fmt.escapeHtml(name)}">${fmt.escapeHtml(fieldOptionLabel(meta))}</option>`).join("");
    const choice = fields.has(previous) ? previous : preferredField(fields);
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
    const chosen = series.find((item) => item.key === state.insightField) || series[0];
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

  function renderAll() {
    renderCalls();
    renderComms();
    renderFacts();
    renderLocation();
    renderDownlink();
    renderSigfoxChart();
    renderInsightChart();
    renderInsights();
    $("tz-local").classList.toggle("is-on", state.tz !== "utc");
    $("tz-utc").classList.toggle("is-on", state.tz === "utc");
  }

  function applySchema(slug, fromUser) {
    state.schemaSlug = slug || "";
    if (fromUser) {
      state.autoSchema = !slug;
      if (slug) localStorage.setItem(SCHEMA_KEY, slug);
      else localStorage.removeItem(SCHEMA_KEY);
    }
    if (!state.messages.length) return;
    const schema = decode.schemaBySlug(state.schemaSlug);
    state.messages = state.messages.map((msg) => ({
      ...msg,
      decoded: decode.decodeMessage(msg, schema?.schema)
    }));
    renderSigfoxChart();
    renderInsights();
  }

  function applyMessages(history) {
    let schema = decode.schemaBySlug(state.schemaSlug);
    if (state.autoSchema) {
      const suggested = decode.suggestSchema(history.messages, state.device?.deviceType?.name);
      if (suggested) {
        schema = suggested;
        state.schemaSlug = suggested.slug;
        $("schema-select").value = suggested.slug;
      }
    }
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
      state.insightPhase = "failed";
      renderInsightChart();
      updateReloadButtons();
      return;
    }
    const range = insightApi.rangeFor($("ci-range").value);
    renderInsightChart();
    try {
      state.insightStore = await insightApi.fetchObservations({
        deviceId: state.deviceId,
        apiKey: profile.token,
        fromMs: range.fromMs,
        toMs: range.toMs,
        onProgress: (progress) => {
          if (token === job) setStatus(`Connected Insight · ${progress.received} observations`);
        }
      });
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
    state.insightNote = "";
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
        setStatus("Looking up the last heard basestations…");
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
        setStatus("Looking up the last heard basestations…");
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
    const redraw = () => {
      renderSigfoxChart();
      renderInsightChart();
      renderLocation();
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
      renderCredentialLists();
      $("cred-modal").hidden = false;
    });
    $("cred-close").addEventListener("click", () => { $("cred-modal").hidden = true; });
    $("cred-modal").addEventListener("click", (event) => {
      if (event.target === $("cred-modal")) $("cred-modal").hidden = true;
    });
    $("sigfox-cred-form").addEventListener("submit", (event) => {
      event.preventDefault();
      try {
        creds.upsert("sigfox", {
          name: $("sfx-name").value,
          login: $("sfx-login").value,
          password: $("sfx-password").value
        });
        $("sfx-password").value = "";
        fillProfiles();
      } catch (error) {
        setStatus(error.message);
      }
    });
    $("ci-cred-form").addEventListener("submit", (event) => {
      event.preventDefault();
      try {
        creds.upsert("insight", { name: $("ci-name").value, token: $("ci-token").value });
        $("ci-token").value = "";
        fillProfiles();
      } catch (error) {
        setStatus(error.message);
      }
    });
    $("cred-modal").addEventListener("click", (event) => {
      const use = event.target?.dataset?.use;
      const del = event.target?.dataset?.del;
      if (use) {
        const [kind, id] = use.split(":");
        creds.select(kind, id);
        fillProfiles();
      }
      if (del) {
        const [kind, id] = del.split(":");
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
    bindCredentials();
    bindCharts();
    $("inspect-btn").addEventListener("click", inspect);
    $("sigfox-reload").addEventListener("click", reloadSigfox);
    $("insight-reload").addEventListener("click", reloadInsight);
    $("details-btn").addEventListener("click", loadDetails);
    $("export-btn").addEventListener("click", exportSnapshot);
    $("device-id").addEventListener("keydown", (event) => {
      if (event.key === "Enter") inspect();
    });
    $("schema-select").addEventListener("change", () => applySchema($("schema-select").value, true));
    $("sigfox-field").addEventListener("change", () => {
      state.sigfoxField = $("sigfox-field").value;
      renderSigfoxChart();
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
      if (event.key === "Escape") $("cred-modal").hidden = true;
    });
    renderAll();
  }

  boot();
})();
