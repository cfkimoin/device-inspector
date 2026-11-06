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
    downsample
  };
})();
