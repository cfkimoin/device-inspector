(function () {
  "use strict";

  // One device, as few Sigfox endpoints as possible.
  // Automatic:
  //   1. GET /devices/{id}?fields=...     dossier, comms, certificates, last fix
  //   2. GET /devices/{id}/messages       all pages, ~3 months, basestation ids in rinfos
  //   3. GET /base-stations/{id}          only the stations heard on the latest message
  // Only if the user clicks Details:
  //   3. GET /device-types/{id}           direct vs webhook, downlink hex, keep-alive
  //   4. GET /device-types/{id}/callbacks only when that mode is CALLBACK
  // Not called: /locations, /certificate, /users, a second OOB listing.

  const GAP_MS = 1100;
  const PAGE_LIMIT = 100;
  const MAX_PAGES = 200;
  const HISTORY_MS = 92 * 24 * 60 * 60 * 1000;
  const DEVICE_FIELDS = "deviceType(name),group(name,type,level,bssId,customerBssId),contract(name),productCertificate(key),modemCertificate(key)";
  const MESSAGE_FIELDS = "oob,ackRequired,rinfos(cbStatus,rep,repetitions,baseStation(name)),downlinkAnswerStatus(baseStation(name))";

  const COM_STATE = {
    0: {
      key: "blocked",
      label: "Comms blocked",
      detail: "Keepalive is enabled, but the device is suspended or off contract. The network is not accepting messages."
    },
    1: {
      key: "ok",
      label: "Comms OK",
      detail: "Keepalive is met. Communication is allowed."
    },
    3: {
      key: "missed",
      label: "Keepalive missed",
      detail: "Communication is still allowed, but the device has missed its keepalive window."
    },
    4: {
      key: "off",
      label: "No keepalive",
      detail: "Keepalive is disabled on this device type."
    },
    5: {
      key: "unseen",
      label: "Not seen",
      detail: "This device has never been seen on the Sigfox cloud."
    }
  };

  const DEVICE_STATE = {
    0: "OK",
    1: "Dead",
    2: "Off contract",
    3: "Disabled",
    5: "Deleted",
    6: "Suspended",
    7: "Not activable"
  };

  const DOWNLINK_MODE = {
    0: { key: "direct", label: "Direct" },
    1: { key: "callback", label: "Webhook" },
    2: { key: "none", label: "None" },
    3: { key: "managed", label: "Managed" }
  };

  const PAYLOAD_TYPE = {
    2: "Regular",
    3: "Custom grammar",
    4: "Geolocation",
    5: "ASCII",
    9: "Sensitv2"
  };

  const CALLBACK_TYPE = {
    0: "Data",
    1: "Service",
    2: "Error"
  };

  const CALLBACK_SUBTYPE = {
    1: "Geoloc (deprecated)",
    2: "Uplink",
    3: "Bidirectional",
    4: "Acknowledge",
    5: "Repeater",
    6: "Data advanced"
  };

  let lastRequestAt = 0;
  let chain = Promise.resolve();
  let calls = 0;

  function resetCallCount() {
    calls = 0;
  }

  function callCount() {
    return calls;
  }

  function unwrap(json) {
    if (!json || typeof json !== "object") return null;
    if (json.data && typeof json.data === "object" && !Array.isArray(json.data)) return json.data;
    return json;
  }

  function num(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function proxyGetNow(path, authHeader) {
    calls += 1;
    const response = await fetch(`/sigfox-proxy/${path}`, {
      headers: { Authorization: authHeader, Accept: "application/json" }
    });
    if (response.status === 429) {
      const error = new Error("Sigfox rate limit reached. Stopped so this tool does not send more calls.");
      error.code = "RATE_LIMIT";
      throw error;
    }
    if (!response.ok) {
      let detail = "";
      try {
        const body = await response.json();
        detail = body.message || body.error || "";
      } catch {
        detail = "";
      }
      const error = new Error(detail ? `Sigfox ${response.status}: ${detail}` : `Sigfox ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return response.json();
  }

  function proxyGet(path, authHeader) {
    const task = chain.then(async () => {
      const pause = Math.max(0, lastRequestAt + GAP_MS - Date.now());
      if (pause > 0) await wait(pause);
      lastRequestAt = Date.now();
      return proxyGetNow(path, authHeader);
    });
    chain = task.catch(() => {});
    return task;
  }

  function describeComState(code) {
    const n = Number(code);
    return COM_STATE[n] || {
      key: "unknown",
      label: Number.isFinite(n) ? `Comms ${n}` : "Comms unknown",
      detail: "Sigfox did not return a known communication state."
    };
  }

  function finitePair(lat, lng) {
    const la = num(lat);
    const ln = num(lng);
    if (la == null || ln == null) return null;
    if (la === 0 && ln === 0) return null;
    return { lat: la, lng: ln };
  }

  function normalizeDevice(json) {
    const device = unwrap(json) || {};
    const registered = finitePair(device.location?.lat, device.location?.lng);
    const computedRaw = device.lastComputedLocation || null;
    const computedPair = finitePair(computedRaw?.lat, computedRaw?.lng);
    return {
      id: String(device.id || "").toUpperCase(),
      name: device.name ? String(device.name) : "",
      comState: num(device.comState),
      state: num(device.state),
      stateLabel: DEVICE_STATE[Number(device.state)] || (device.state == null ? "" : String(device.state)),
      lqi: num(device.lqi),
      lastCom: num(device.lastCom),
      activationTime: num(device.activationTime),
      creationTime: num(device.creationTime),
      lastEditionTime: num(device.lastEditionTime),
      sequenceNumber: num(device.sequenceNumber),
      messageModulo: num(device.messageModulo) || 4096,
      pac: device.pac ? String(device.pac) : "",
      prototype: device.prototype === true,
      satelliteCapable: device.satelliteCapable === true,
      activable: device.activable === true,
      automaticRenewal: device.automaticRenewal === true,
      token: device.token ? {
        state: num(device.token.state),
        detailMessage: device.token.detailMessage ? String(device.token.detailMessage) : "",
        end: num(device.token.end),
        freeMessages: num(device.token.freeMessages),
        freeMessagesSent: num(device.token.freeMessagesSent)
      } : null,
      deviceType: {
        id: device.deviceType?.id ? String(device.deviceType.id) : "",
        name: device.deviceType?.name ? String(device.deviceType.name) : ""
      },
      group: {
        id: device.group?.id ? String(device.group.id) : "",
        name: device.group?.name ? String(device.group.name) : ""
      },
      contract: {
        id: device.contract?.id ? String(device.contract.id) : "",
        name: device.contract?.name ? String(device.contract.name) : ""
      },
      productCertificate: device.productCertificate?.key ? String(device.productCertificate.key) : "",
      modemCertificate: device.modemCertificate?.key ? String(device.modemCertificate.key) : "",
      registeredLocation: registered,
      lastComputedLocation: computedPair ? {
        lat: computedPair.lat,
        lng: computedPair.lng,
        radius: num(computedRaw.radius),
        source: computedRaw.sourceCode ?? computedRaw.source ?? null
      } : null
    };
  }

  function normalizeDeviceType(json) {
    const dt = unwrap(json) || {};
    const mode = num(dt.downlinkMode);
    const described = DOWNLINK_MODE[mode] || { key: "unknown", label: mode == null ? "Unknown" : `Mode ${mode}` };
    return {
      id: dt.id ? String(dt.id) : "",
      name: dt.name ? String(dt.name) : "",
      description: dt.description ? String(dt.description) : "",
      downlinkMode: mode,
      downlinkKey: described.key,
      downlinkLabel: described.label,
      downlinkDataString: dt.downlinkDataString ? String(dt.downlinkDataString) : "",
      payloadType: num(dt.payloadType),
      payloadTypeLabel: PAYLOAD_TYPE[Number(dt.payloadType)] || "",
      payloadConfig: dt.payloadConfig ? String(dt.payloadConfig) : "",
      keepAlive: num(dt.keepAlive) || 0,
      alertEmail: dt.alertEmail ? String(dt.alertEmail) : "",
      contractName: dt.contract?.name ? String(dt.contract.name) : ""
    };
  }

  function normalizeCallback(raw) {
    return {
      id: raw?.id ? String(raw.id) : "",
      channel: raw?.channel ? String(raw.channel) : "",
      callbackType: num(raw?.callbackType),
      typeLabel: CALLBACK_TYPE[Number(raw?.callbackType)] || "",
      callbackSubtype: num(raw?.callbackSubtype),
      subtypeLabel: CALLBACK_SUBTYPE[Number(raw?.callbackSubtype)] || "",
      enabled: raw?.enabled !== false,
      dead: raw?.dead === true,
      downlinkHook: raw?.downlinkHook === true,
      url: raw?.url ? String(raw.url).trim() : "",
      httpMethod: raw?.httpMethod ? String(raw.httpMethod) : "",
      contentType: raw?.contentType ? String(raw.contentType) : "",
      recipient: raw?.recipient ? String(raw.recipient) : ""
    };
  }

  function stationsFromMessage(msg) {
    const list = Array.isArray(msg?.rinfos) ? msg.rinfos : [];
    return list.map((info) => ({
      id: info?.baseStation?.id ? String(info.baseStation.id) : "",
      name: info?.baseStation?.name ? String(info.baseStation.name) : "",
      lat: num(info?.lat),
      lng: num(info?.lng),
      rssi: num(info?.rssi),
      time: num(msg?.time)
    })).filter((station) => station.id || (station.lat != null && station.lng != null));
  }

  function computedFromMessage(msg) {
    const raw = msg?.computedLocation;
    const items = Array.isArray(raw) ? raw : (raw ? [raw] : []);
    for (const item of items) {
      const pair = finitePair(item?.lat, item?.lng);
      if (!pair) continue;
      return {
        lat: pair.lat,
        lng: pair.lng,
        radius: num(item.radius),
        source: item.source ?? item.sourceCode ?? null,
        time: num(msg?.time)
      };
    }
    return null;
  }

  function downlinkFromMessage(msg) {
    const status = msg?.downlinkAnswerStatus;
    if (!status || typeof status !== "object") return null;
    const data = status.data ? String(status.data) : "";
    const stationId = status.baseStation?.id ? String(status.baseStation.id) : "";
    if (!data && !stationId) return null;
    return {
      data,
      stationId,
      stationName: status.baseStation?.name ? String(status.baseStation.name) : "",
      time: num(msg?.time)
    };
  }

  function normalizeMessage(msg) {
    const oob = msg?.oob;
    let oobHex = "";
    if (typeof oob === "string") oobHex = oob.trim();
    else if (oob && typeof oob === "object") oobHex = String(oob.data || oob.hex || oob.payload || "").trim();
    const data = msg?.data ? String(msg.data).trim() : "";
    let kind = "uplink";
    let hex = data;
    if (oob === true || oobHex) {
      kind = "oob";
      hex = oobHex || data;
    } else if (!data) {
      kind = "empty";
      hex = "";
    }
    return {
      time: num(msg?.time),
      seq: num(msg?.seqNumber),
      lqi: num(msg?.lqi),
      hex,
      kind,
      ackRequired: msg?.ackRequired === true,
      stations: stationsFromMessage(msg),
      computed: computedFromMessage(msg),
      downlink: downlinkFromMessage(msg)
    };
  }

  function locationSourceLabel(source) {
    const n = Number(source);
    if (n === 1) return "GPS";
    if (n === 2) return "network";
    if (Number.isFinite(n)) return `source ${n}`;
    return "computed";
  }

  function haversineMeters(a, b) {
    if (!a || !b) return null;
    const r = 6371000;
    const p1 = a.lat * Math.PI / 180;
    const p2 = b.lat * Math.PI / 180;
    const dp = (b.lat - a.lat) * Math.PI / 180;
    const dl = (b.lng - a.lng) * Math.PI / 180;
    const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
    return 2 * r * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  function locationFromDevice(device) {
    const fix = device?.lastComputedLocation || null;
    return {
      approx: fix ? { ...fix, kind: "computed" } : null,
      stations: [],
      nearest: null,
      sourceLabel: fix ? locationSourceLabel(fix.source) : "",
      pendingStations: true
    };
  }

  function locationFromMessages(messages, device, resolvedStations) {
    const ordered = [...(messages || [])].filter((msg) => Number.isFinite(msg.time)).sort((a, b) => b.time - a.time);
    let stations = [];
    let stationTime = null;
    let computed = null;
    for (const msg of ordered) {
      if (!computed && msg.computed) computed = msg.computed;
      if (stations.length === 0 && (msg.stations || []).some((station) => station.id || station.lat != null)) {
        stations = msg.stations;
        stationTime = msg.time;
      }
      if (computed && stations.length) break;
    }
    if (Array.isArray(resolvedStations)) stations = resolvedStations;
    if (!computed && device?.lastComputedLocation) {
      computed = { ...device.lastComputedLocation, time: device.lastCom };
    }
    const placed = stations.filter((station) => station.lat != null && station.lng != null);
    let nearest = null;
    for (const station of placed) {
      if (!nearest || (station.rssi != null && (nearest.rssi == null || station.rssi > nearest.rssi))) {
        nearest = station;
      }
    }
    const approx = computed
      ? { ...computed, kind: "computed" }
      : (nearest ? { lat: nearest.lat, lng: nearest.lng, radius: null, source: null, time: stationTime, kind: "basestation" } : null);
    return {
      approx,
      stations,
      nearest,
      stationTime,
      sourceLabel: computed ? locationSourceLabel(computed.source) : (nearest ? "nearest basestation" : ""),
      distanceMeters: haversineMeters(computed, nearest),
      pendingStations: false
    };
  }

  function lastHeardStations(messages) {
    const ordered = [...(messages || [])].filter((msg) => Number.isFinite(msg.time)).sort((a, b) => b.time - a.time);
    for (const msg of ordered) {
      const stations = (msg.stations || []).filter((station) => station.id);
      if (stations.length) return stations;
    }
    return [];
  }

  async function loadStationLocations(stations, authHeader, hooks) {
    const located = [];
    const seen = new Set();
    for (const station of stations || []) {
      if (!station?.id || seen.has(station.id)) continue;
      seen.add(station.id);
      if (station.lat != null && station.lng != null) {
        located.push(station);
        continue;
      }
      if (hooks?.cancelled?.()) break;
      hooks?.onProgress?.(`Basestation ${station.id}`);
      try {
        const json = await proxyGet(`base-stations/${encodeURIComponent(station.id)}`, authHeader);
        const body = unwrap(json) || {};
        const pair = finitePair(body.location?.lat ?? body.lat, body.location?.lng ?? body.lng);
        located.push({
          ...station,
          name: station.name || (body.name ? String(body.name) : ""),
          lat: pair ? pair.lat : null,
          lng: pair ? pair.lng : null
        });
      } catch (error) {
        located.push({ ...station, error: error.message || String(error) });
      }
    }
    return located;
  }

  function nextPath(nextUrl) {
    if (!nextUrl || typeof nextUrl !== "string") return null;
    const marker = "/v2/";
    const index = nextUrl.indexOf(marker);
    if (index >= 0) return nextUrl.slice(index + marker.length);
    if (nextUrl.startsWith("devices/")) return nextUrl;
    return null;
  }

  async function loadDossier(deviceId, authHeader, hooks) {
    const id = encodeURIComponent(deviceId);
    hooks?.onProgress?.("Reading device");
    const deviceJson = await proxyGet(`devices/${id}?fields=${encodeURIComponent(DEVICE_FIELDS)}`, authHeader);
    const device = normalizeDevice(deviceJson);
    if (!device.id) device.id = deviceId;
    return { device, location: locationFromDevice(device) };
  }

  async function loadDownlinkDetails(deviceTypeId, authHeader, hooks) {
    if (!deviceTypeId) throw new Error("This device has no device type id, so downlink details are unavailable.");
    hooks?.onProgress?.("Reading device type");
    const deviceType = normalizeDeviceType(
      await proxyGet(`device-types/${encodeURIComponent(deviceTypeId)}`, authHeader)
    );
    let callbacks = [];
    if (deviceType.downlinkMode === 1) {
      hooks?.onProgress?.("Reading downlink webhook");
      const callbackJson = await proxyGet(
        `device-types/${encodeURIComponent(deviceTypeId)}/callbacks`,
        authHeader
      );
      const rows = Array.isArray(callbackJson?.data) ? callbackJson.data : [];
      callbacks = rows.map(normalizeCallback);
    }
    return { deviceType, callbacks };
  }

  async function loadMessages(deviceId, authHeader, hooks) {
    const since = Date.now() - HISTORY_MS;
    const id = encodeURIComponent(deviceId);
    let path = `devices/${id}/messages?limit=${PAGE_LIMIT}&since=${since}&fields=${encodeURIComponent(MESSAGE_FIELDS)}`;
    const messages = [];
    let pages = 0;
    let rateLimited = false;
    let error = "";
    while (path && pages < MAX_PAGES) {
      if (hooks?.cancelled?.()) break;
      pages += 1;
      hooks?.onProgress?.(`Sigfox messages, page ${pages}`);
      let json;
      try {
        json = await proxyGet(path, authHeader);
      } catch (err) {
        if (err?.code === "RATE_LIMIT") {
          rateLimited = true;
          error = err.message;
          break;
        }
        throw err;
      }
      const rows = Array.isArray(json?.data) ? json.data : [];
      for (const row of rows) messages.push(normalizeMessage(row));
      hooks?.onProgress?.(`${messages.length} Sigfox messages`);
      path = nextPath(json?.paging?.next);
      if (!rows.length) break;
    }
    return {
      messages,
      pages,
      rateLimited,
      error,
      truncated: pages >= MAX_PAGES && !!path
    };
  }

  window.deviceInspectorSigfox = {
    resetCallCount,
    callCount,
    describeComState,
    loadDossier,
    loadDownlinkDetails,
    loadMessages,
    lastHeardStations,
    loadStationLocations,
    locationFromMessages,
    HISTORY_MS
  };
})();
