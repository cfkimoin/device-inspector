(function () {
  "use strict";

  function client() {
    return window.payloadToolInsight || null;
  }

  function rangeFor(preset, nowMs) {
    const now = Number.isFinite(nowMs) ? nowMs : Date.now();
    if (preset === "3mo") return { fromMs: now - 92 * 24 * 60 * 60 * 1000, toMs: now };
    if (preset === "all") return { fromMs: null, toMs: now };
    const lib = client();
    if (lib?.rangeForPreset) {
      const range = lib.rangeForPreset(preset, now);
      if (range) return range;
    }
    const days = preset === "1h" ? 1 / 24 : preset === "1d" ? 1 : preset === "1w" ? 7 : 30;
    return { fromMs: now - days * 24 * 60 * 60 * 1000, toMs: now };
  }

  function authorization(apiKey) {
    const raw = String(apiKey || "").trim();
    if (!raw) return "";
    return /^Bearer\s+/i.test(raw) ? raw : `Bearer ${raw}`;
  }

  async function insightGet(pathAndQuery, apiKey) {
    const response = await fetch(pathAndQuery, {
      method: "GET",
      headers: {
        Authorization: authorization(apiKey),
        Accept: "application/json"
      }
    });
    if (!response.ok) {
      let detail = "";
      try {
        const body = await response.json();
        detail = body?.error || body?.message || "";
      } catch {
        detail = "";
      }
      const error = new Error(detail
        ? `ConnectedInsight ${response.status}: ${detail}`
        : `ConnectedInsight request failed (${response.status}).`);
      error.status = response.status;
      throw error;
    }
    return response.json();
  }

  function firstDevice(payload) {
    const data = payload?.data;
    if (Array.isArray(data) && data.length) return data[0];
    if (data && typeof data === "object" && !Array.isArray(data)) return data;
    return null;
  }

  function pickParser(device, parser) {
    const model = String(
      device?.parserModel
      || device?.parser?.model
      || device?.deviceParser?.model
      || parser?.parserModel
      || parser?.model
      || ""
    ).trim();
    const revision = String(
      device?.parserRevision
      || device?.parser?.revision
      || device?.deviceParser?.revision
      || parser?.parserRevision
      || parser?.revision
      || ""
    ).trim();
    const parserId = device?.parserId ?? device?.parser?.id ?? device?.deviceParser?.id ?? parser?.parserId ?? null;
    if (!model && !revision && parserId == null) return null;
    return { model, revision, parserId };
  }

  async function fetchDeviceInfo(request) {
    const deviceId = String(request?.deviceId || "").trim();
    const apiKey = String(request?.apiKey || "").trim();
    if (!deviceId) throw new Error("Device ID is required.");
    if (!apiKey) throw new Error("ConnectedInsight API key is required.");
    const params = new URLSearchParams();
    params.append("deviceId", deviceId);
    params.append("excludeLatestObservations", "true");
    const payload = await insightGet(`/ci-proxy/api/v1/get-devices?${params}`, apiKey);
    const device = firstDevice(payload);
    let parser = pickParser(device, null);
    if ((!parser?.model || !parser?.revision) && parser?.parserId != null) {
      try {
        const parserParams = new URLSearchParams();
        parserParams.append("parserId", String(parser.parserId));
        const parsers = await insightGet(`/ci-proxy/api/v1/get-parsers?${parserParams}`, apiKey);
        const row = firstDevice(parsers);
        parser = pickParser(device, row) || parser;
      } catch {
        // Parser lookup is optional; device-type + messages still work.
      }
    }
    return {
      device,
      parser,
      displayName: device?.displayName ? String(device.displayName) : ""
    };
  }

  function firmwareVersionFromStore(store) {
    const series = store?.series || [];
    const preferred = series.find((item) => /^(version|firmware_version|fw_version)$/i.test(item.key))
      || series.find((item) => /version/i.test(item.key || "") || /version/i.test(item.label || ""));
    if (!preferred?.v?.length) return null;
    const recent = Array.from(preferred.v).slice(-40);
    const counts = new Map();
    for (const value of recent) {
      const n = Number(value);
      if (!Number.isFinite(n)) continue;
      counts.set(n, (counts.get(n) || 0) + 1);
    }
    let best = null;
    let bestCount = -1;
    for (const [value, count] of counts) {
      if (count > bestCount) {
        best = value;
        bestCount = count;
      }
    }
    return best;
  }

  async function fetchObservations(request) {
    const lib = client();
    if (!lib?.fetchConnectedInsightObservations) {
      throw new Error("Connected Insight client is not loaded. Run scripts/sync-from-payload-tool.");
    }
    return lib.fetchConnectedInsightObservations(request);
  }

  function downsample(t, v, width) {
    const lib = client();
    const budget = lib?.chartPointBudget ? lib.chartPointBudget(width) : 400;
    if (lib?.downsampleMinMax) return lib.downsampleMinMax(t, v, budget);
    const count = t?.length || 0;
    const points = [];
    for (let i = 0; i < count; i += 1) points.push({ x: t[i], y: v[i], i });
    return points;
  }

  window.deviceInspectorInsight = {
    rangeFor,
    fetchObservations,
    fetchDeviceInfo,
    firmwareVersionFromStore,
    downsample
  };
})();
