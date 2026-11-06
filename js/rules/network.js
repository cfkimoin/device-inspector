(function () {
  "use strict";

  function day(ms) {
    return window.deviceInspectorFormat.formatDay(ms);
  }

  function network(snapshot) {
    const insights = [];
    const stats = snapshot?.stats;
    if (!stats) return insights;
    const com = stats.comState;
    if (com === 3) {
      insights.push({
        id: "comms-missed",
        severity: "alert",
        title: "Keepalive missed",
        detail: "Sigfox communication state is RED. The device missed its keepalive window.",
        at: snapshot.sigfox?.device?.lastCom || null
      });
    } else if (com === 0) {
      insights.push({
        id: "comms-blocked",
        severity: "alert",
        title: "Communication blocked",
        detail: "Sigfox is not accepting messages. The device is suspended or off contract.",
        at: snapshot.sigfox?.device?.lastCom || null
      });
    }

    const lqi = stats.lqi || {};
    const gaps = stats.seqGaps || [];
    const seq = stats.seq || {};
    const poor = lqi.count >= 8 && (lqi.poorRatio >= 0.15 || lqi.poorStreak >= 4);
    const broken = gaps.length >= 2 || gaps.some((gap) => gap.missing >= 3);
    if (seq.usual >= 2 && seq.singleSkips >= 5) {
      insights.push({
        id: "seq-oob-step",
        severity: "info",
        title: "Sequence skips look like OOB",
        detail: `Uplink sequence numbers usually advance by ${seq.usual}. ${seq.singleSkips} of those steps skip a single number, which is what an out-of-band frame between uplinks looks like. OOB messages are not downloaded, so those skips are not counted as lost uplinks.`
      });
    }
    if (poor || broken) {
      const parts = [];
      if (poor && broken) {
        parts.push("Network degradation detected: poor LQI and breaks in message sequence numbers.");
      } else if (poor) {
        parts.push(`Poor link quality on ${lqi.poor} of ${lqi.count} messages.`);
      } else {
        parts.push(`${gaps.length} breaks in the message sequence numbers.`);
      }
      if (gaps[0]) parts.push(`Latest break on ${day(gaps[gaps.length - 1].at)}, ${gaps[gaps.length - 1].missing} missing.`);
      insights.push({
        id: "network-degradation",
        severity: "watch",
        title: "Network degradation",
        detail: parts.join(" "),
        at: gaps.length ? gaps[gaps.length - 1].at : snapshot.sigfox?.device?.lastCom || null,
        evidence: {
          poorLqiRatio: lqi.poorRatio,
          poorLqiStreak: lqi.poorStreak,
          gapCount: gaps.length,
          gaps: gaps.slice(-8)
        }
      });
    }
    return insights;
  }

  window.deviceInspectorRules.register(network);
})();
