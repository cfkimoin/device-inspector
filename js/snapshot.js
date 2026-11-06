(function () {
  "use strict";

  const VOLTAGE_NAMES = /vdd|volt|battery|bat_/i;

  function bestRssi(message) {
    let best = null;
    for (const station of message.stations || []) {
      if (station.rssi == null) continue;
      if (best == null || station.rssi > best) best = station.rssi;
    }
    return best;
  }

  function voltagesFromMessages(messages) {
    const points = [];
    for (const msg of messages || []) {
      if (!Number.isFinite(msg.time)) continue;
      for (const item of msg.decoded?.fields || []) {
        if (!VOLTAGE_NAMES.test(item.name) || !Number.isFinite(item.number)) continue;
        points.push({ at: msg.time, value: item.number, name: item.name, source: "sigfox" });
      }
    }
    return points;
  }

  function voltagesFromInsight(series) {
    const points = [];
    for (const item of series || []) {
      const name = item.label || item.key || "";
      if (!VOLTAGE_NAMES.test(name)) continue;
      const count = item.points?.length || 0;
      for (let i = 0; i < count; i += 1) {
        const point = item.points[i];
        if (!Number.isFinite(point.t) || !Number.isFinite(point.v)) continue;
        points.push({ at: point.t, value: point.v, name, source: "insight" });
      }
    }
    return points;
  }

  function sequenceReport(messages, modulo) {
    const mod = Number.isFinite(modulo) && modulo > 1 ? modulo : 4096;
    const ordered = (messages || [])
      .filter((msg) => Number.isFinite(msg.seq) && Number.isFinite(msg.time))
      .sort((a, b) => a.time - b.time || a.seq - b.seq);
    const steps = [];
    for (let i = 1; i < ordered.length; i += 1) {
      const prev = ordered[i - 1];
      const curr = ordered[i];
      const step = (curr.seq - prev.seq + mod) % mod;
      if (step === 0 || step >= Math.min(500, mod - 1)) continue;
      steps.push({ at: curr.time, step, from: prev.seq, to: curr.seq });
    }
    const typical = steps.map((item) => item.step).filter((step) => step <= 4).sort((a, b) => a - b);
    const usual = typical.length ? typical[Math.floor(typical.length / 2)] : 1;
    const gaps = [];
    let singleSkips = 0;
    for (const item of steps) {
      if (item.step === 2) singleSkips += 1;
      const missing = item.step - usual;
      if (missing > 0) gaps.push({ at: item.at, missing, from: item.from, to: item.to });
    }
    return { gaps, usual, singleSkips };
  }

  function lqiStats(messages) {
    const values = (messages || []).map((msg) => msg.lqi).filter((value) => Number.isFinite(value) && value >= 0 && value <= 3);
    let poor = 0;
    let streak = 0;
    let bestStreak = 0;
    for (const value of values) {
      if (value === 0) {
        poor += 1;
        streak += 1;
        if (streak > bestStreak) bestStreak = streak;
      } else {
        streak = 0;
      }
    }
    return {
      count: values.length,
      poor,
      poorRatio: values.length ? poor / values.length : 0,
      poorStreak: bestStreak
    };
  }

  function intervals(messages) {
    const times = (messages || []).map((msg) => msg.time).filter((time) => Number.isFinite(time)).sort((a, b) => a - b);
    const deltas = [];
    for (let i = 1; i < times.length; i += 1) deltas.push(times[i] - times[i - 1]);
    const sorted = [...deltas].sort((a, b) => a - b);
    const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : null;
    return {
      count: times.length,
      first: times[0] ?? null,
      last: times.length ? times[times.length - 1] : null,
      medianMs: median,
      lastGapMs: deltas.length ? deltas[deltas.length - 1] : null
    };
  }

  function serializeInsight(store) {
    const series = (store?.series || []).map((item) => {
      const points = [];
      const count = item.count || item.t?.length || 0;
      for (let i = 0; i < count; i += 1) points.push({ t: item.t[i], v: item.v[i] });
      return {
        key: item.key,
        label: item.label,
        unit: item.unit || "",
        count,
        min: item.min,
        max: item.max,
        firstMs: item.firstMs,
        lastMs: item.lastMs,
        points
      };
    });
    return { truncated: !!store?.truncated, series };
  }

  function build(input) {
    const messages = input.messages || [];
    const insight = serializeInsight(input.insightStore);
    const timing = intervals(messages);
    const seq = sequenceReport(messages, input.device?.messageModulo);
    return {
      deviceId: input.deviceId || "",
      fetchedAt: Date.now(),
      schema: input.schema || null,
      sigfoxCalls: input.sigfoxCalls || 0,
      sigfox: {
        device: input.device || null,
        deviceType: input.deviceType || null,
        callbacks: input.callbacks || [],
        location: input.location || null,
        messages,
        messageError: input.messageError || "",
        rateLimited: !!input.rateLimited
      },
      insight,
      stats: {
        messageCount: messages.length,
        modulo: input.device?.messageModulo || 4096,
        timing,
        lqi: lqiStats(messages),
        seq,
        seqGaps: seq.gaps,
        voltages: voltagesFromMessages(messages).concat(voltagesFromInsight(insight.series)),
        comState: input.device?.comState ?? null
      }
    };
  }

  window.deviceInspectorSnapshot = { build };
})();
