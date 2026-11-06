(function () {
  "use strict";

  const JUMP_V = 0.25;

  function day(ms) {
    return window.deviceInspectorFormat.formatDay(ms);
  }

  function series(voltages) {
    const groups = new Map();
    for (const point of voltages || []) {
      if (!Number.isFinite(point.value) || !Number.isFinite(point.at)) continue;
      if (/idle/i.test(point.name || "")) continue;
      if (!/tx|bat|volt/i.test(point.name || "")) continue;
      if (!groups.has(point.name)) groups.set(point.name, []);
      groups.get(point.name).push(point);
    }
    let best = [];
    for (const points of groups.values()) {
      if (points.length > best.length) best = points;
    }
    return best.sort((a, b) => a.at - b.at);
  }

  function batteryChange(snapshot) {
    const points = series(snapshot?.stats?.voltages);
    if (points.length < 4) return [];
    const insights = [];
    for (let i = 1; i < points.length; i += 1) {
      const prev = points[i - 1];
      const current = points[i];
      const delta = current.value - prev.value;
      if (delta < JUMP_V) continue;
      const follow = points.slice(i, i + 3);
      if (follow.length < 2) continue;
      const sustained = follow.every((point) => point.value >= current.value - 0.15);
      if (!sustained) continue;
      insights.push({
        id: `battery-${current.at}`,
        severity: "watch",
        title: "Likely battery change",
        detail: `Batteries were likely changed on ${day(current.at)}. A TX voltage jump of ${delta.toFixed(2)} V was detected (${prev.value.toFixed(2)} V to ${current.value.toFixed(2)} V).`,
        at: current.at,
        evidence: { from: prev, to: current, delta, name: current.name }
      });
      i += 2;
      if (insights.length >= 5) break;
    }
    return insights;
  }

  window.deviceInspectorRules.register(batteryChange);
})();
