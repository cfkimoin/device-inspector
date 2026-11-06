(function () {
  "use strict";

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function isTime(ms) {
    return Number.isFinite(ms) && ms > 0;
  }

  function formatTime(ms, mode) {
    if (!isTime(ms)) return "—";
    const date = new Date(ms);
    if (mode === "utc") {
      return `${date.getUTCDate()}.${date.getUTCMonth() + 1}.${date.getUTCFullYear()} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())} UTC`;
    }
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function formatDay(ms) {
    if (!isTime(ms)) return "—";
    const date = new Date(ms);
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
  }

  function formatDuration(ms) {
    if (!Number.isFinite(ms) || ms < 0) return "—";
    const minutes = Math.round(ms / 60000);
    if (minutes < 90) return `${minutes} min`;
    const hours = Math.round(minutes / 60);
    if (hours < 48) return `${hours} h`;
    const days = Math.round(hours / 24);
    return `${days} d`;
  }

  const LQI = ["LIMIT", "AVERAGE", "GOOD", "EXCELLENT", "N/A"];

  function formatLqi(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "—";
    if (n >= 0 && n < LQI.length) return LQI[n];
    return String(value);
  }

  function formatNumber(value, digits) {
    if (!Number.isFinite(value)) return "—";
    const places = digits == null ? (Math.abs(value) >= 100 ? 1 : 2) : digits;
    const text = value.toFixed(places);
    return text.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
  }

  function safeHttpUrl(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
      const url = new URL(raw);
      if (url.protocol === "https:" || url.protocol === "http:") return url.href;
    } catch {
      return "";
    }
    return "";
  }

  window.deviceInspectorFormat = {
    escapeHtml,
    formatTime,
    formatDay,
    formatDuration,
    formatLqi,
    formatNumber,
    safeHttpUrl,
    LQI
  };
})();
