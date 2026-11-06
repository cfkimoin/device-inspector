(function () {
  "use strict";

  const SIX_HOURS = 6 * 60 * 60 * 1000;

  function silence(snapshot) {
    const timing = snapshot?.stats?.timing;
    if (!timing || timing.count < 5 || !Number.isFinite(timing.medianMs) || !Number.isFinite(timing.lastGapMs)) {
      return [];
    }
    const limit = Math.max(timing.medianMs * 3, SIX_HOURS);
    if (timing.lastGapMs <= limit) return [];
    const fmt = window.deviceInspectorFormat;
    const ratio = timing.medianMs > 0 ? timing.lastGapMs / timing.medianMs : 0;
    return [{
      id: `silence-${timing.last}`,
      severity: "watch",
      title: "Long silence",
      detail: `The last gap is ${fmt.formatDuration(timing.lastGapMs)}, about ${ratio.toFixed(1)}× the usual ${fmt.formatDuration(timing.medianMs)} interval. Last message ${fmt.formatTime(timing.last, "local")}.`,
      at: timing.last,
      evidence: { medianMs: timing.medianMs, lastGapMs: timing.lastGapMs }
    }];
  }

  window.deviceInspectorRules.register(silence);
})();
