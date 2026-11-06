(function () {
  "use strict";

  // Browser-side store, time-window, and chart-decimation helpers for
  // ConnectedInsight observations.
  //
  // fetchConnectedInsightObservations reads the public FoxerIoT API
  // GET /api/v1/get-observations through the same-origin /ci-proxy/ path.
  // It follows the response `next` link, keeping only that link's query string.
  //
  // The resolved store is:
  //   { series: [{ key, label, unit, t, v, count, min, max, sum, firstMs, lastMs }],
  //     totalPoints, skipped, truncated }
  // `t` and `v` are parallel Float64Arrays sorted by time. One series per
  // observation variable, including derived values such as dew point.

  const INSIGHT_ROW_HEIGHT = 30;
  const INSIGHT_MAX_SPACER_PX = 8000000;
  const INSIGHT_PRESETS = [
    { id: "1h", label: "Last hour" },
    { id: "1d", label: "Last 24 hours" },
    { id: "1w", label: "Last 7 days" },
    { id: "1mo", label: "Last month" },
    { id: "1y", label: "Last year" },
    { id: "all", label: "All history" }
  ];

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function floorToMinute(ms) {
    if (!Number.isFinite(ms)) return NaN;
    return Math.floor(ms / 60000) * 60000;
  }

  function shiftInstant(ms, step, direction) {
    if (!Number.isFinite(ms) || !direction) return null;
    if (step === "1h") return ms + direction * 3600000;
    if (step === "1d") return ms + direction * 86400000;
    if (step === "1w") return ms + direction * 7 * 86400000;
    if (step === "1mo" || step === "1y") {
      const date = new Date(ms);
      if (step === "1mo") date.setMonth(date.getMonth() + direction);
      else date.setFullYear(date.getFullYear() + direction);
      const shifted = date.getTime();
      return Number.isFinite(shifted) ? shifted : null;
    }
    return null;
  }

  function rangeForPreset(preset, nowMs) {
    if (!Number.isFinite(nowMs)) return null;
    if (preset === "all") {
      return { preset: "all", step: "all", fromMs: null, toMs: nowMs };
    }
    const fromMs = shiftInstant(nowMs, preset, -1);
    if (fromMs == null) return null;
    return { preset, step: preset, fromMs, toMs: nowMs };
  }

  function shiftRange(range, direction) {
    if (!range || range.step === "all" || range.fromMs == null || range.toMs == null) return range;
    const fromMs = shiftInstant(range.fromMs, range.step, direction);
    const toMs = shiftInstant(range.toMs, range.step, direction);
    if (fromMs == null || toMs == null || fromMs >= toMs) return range;
    return { ...range, fromMs, toMs };
  }

  function formatDatetimeLocalValue(ms) {
    if (!Number.isFinite(ms)) return "";
    const date = new Date(ms);
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  }

  function parseDatetimeLocalValue(value) {
    if (!value) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(value).trim());
    if (!match) return null;
    const ms = new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4]),
      Number(match[5]),
      0,
      0
    ).getTime();
    return Number.isFinite(ms) ? ms : null;
  }

  function formatDateInputValue(ms) {
    if (!Number.isFinite(ms)) return "";
    const date = new Date(ms);
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  }

  function parseDateInputStart(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
    if (!match) return null;
    const ms = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 0, 0, 0, 0).getTime();
    return Number.isFinite(ms) ? ms : null;
  }

  function parseDateInputEnd(value) {
    const start = parseDateInputStart(value);
    if (start == null) return null;
    const nextDay = new Date(start);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.getTime() - 60000;
  }

  function toEpochMs(value) {
    if (value instanceof Date) {
      const ms = value.getTime();
      return Number.isFinite(ms) ? ms : NaN;
    }
    if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return NaN;
      if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
        const numeric = Number(trimmed);
        return Number.isFinite(numeric) ? numeric : NaN;
      }
      const parsed = Date.parse(trimmed);
      return Number.isFinite(parsed) ? parsed : NaN;
    }
    return NaN;
  }

  function buildObservationStore(records) {
    const groups = new Map();
    let skipped = 0;
    const list = records || [];
    for (let i = 0; i < list.length; i++) {
      const rec = list[i];
      const name = String(rec?.name ?? rec?.key ?? "").trim();
      const time = toEpochMs(rec?.time ?? rec?.t);
      const value = Number(rec?.value ?? rec?.v);
      if (!name || !Number.isFinite(time) || !Number.isFinite(value)) {
        skipped += 1;
        continue;
      }
      let group = groups.get(name);
      if (!group) {
        group = {
          key: name,
          label: name,
          unit: "",
          times: [],
          values: []
        };
        groups.set(name, group);
      }
      if (rec?.label) group.label = String(rec.label);
      if (rec?.unit) group.unit = String(rec.unit);
      group.times.push(time);
      group.values.push(value);
    }

    const series = [];
    for (const group of groups.values()) {
      const count = group.times.length;
      const order = new Array(count);
      for (let i = 0; i < count; i++) order[i] = i;
      order.sort((a, b) => group.times[a] - group.times[b] || a - b);

      const times = [];
      const values = [];
      for (let i = 0; i < count; i++) {
        const index = order[i];
        const time = group.times[index];
        const value = group.values[index];
        if (times.length && times[times.length - 1] === time) values[values.length - 1] = value;
        else {
          times.push(time);
          values.push(value);
        }
      }

      const t = Float64Array.from(times);
      const v = Float64Array.from(values);
      let min = Infinity;
      let max = -Infinity;
      let sum = 0;
      for (let i = 0; i < v.length; i++) {
        const y = v[i];
        if (y < min) min = y;
        if (y > max) max = y;
        sum += y;
      }
      series.push({
        key: group.key,
        label: group.label,
        unit: group.unit,
        t,
        v,
        count: t.length,
        min,
        max,
        sum,
        firstMs: t.length ? t[0] : null,
        lastMs: t.length ? t[t.length - 1] : null
      });
    }

    series.sort((a, b) => String(a.label).localeCompare(String(b.label)));
    let totalPoints = 0;
    for (const item of series) totalPoints += item.count;
    return { series, totalPoints, skipped };
  }

  function findSeries(store, key) {
    const series = store?.series || [];
    for (const item of series) {
      if (item.key === key) return item;
    }
    return series[0] || null;
  }

  function chartPointBudget(widthPx) {
    const width = Number.isFinite(widthPx) && widthPx > 0 ? widthPx : 800;
    return Math.max(120, Math.min(800, Math.round(width)));
  }

  function downsampleMinMax(t, v, maxPoints) {
    const count = t?.length || 0;
    if (!count || !v || v.length !== count) return [];
    const limit = Math.max(2, maxPoints | 0);
    if (count <= limit) {
      const all = new Array(count);
      for (let i = 0; i < count; i++) all[i] = { x: t[i], y: v[i], i };
      return all;
    }

    const buckets = Math.max(1, Math.floor(limit / 2));
    const start = t[0];
    const span = (t[count - 1] - start) || 1;
    const indices = [0, count - 1];
    let bucket = -1;
    let minIndex = 0;
    let maxIndex = 0;

    const flush = () => {
      indices.push(minIndex, maxIndex);
    };

    for (let i = 0; i < count; i++) {
      const nextBucket = Math.min(buckets - 1, Math.floor(((t[i] - start) / span) * buckets));
      if (bucket === -1) {
        bucket = nextBucket;
        minIndex = i;
        maxIndex = i;
        continue;
      }
      if (nextBucket !== bucket) {
        flush();
        bucket = nextBucket;
        minIndex = i;
        maxIndex = i;
        continue;
      }
      if (v[i] < v[minIndex]) minIndex = i;
      if (v[i] >= v[maxIndex]) maxIndex = i;
    }
    flush();
    indices.sort((a, b) => a - b);

    const points = [];
    let previous = -1;
    for (const index of indices) {
      if (index === previous) continue;
      previous = index;
      points.push({ x: t[index], y: v[index], i: index });
    }
    return points;
  }

  function nearestIndex(t, x) {
    const count = t?.length || 0;
    if (!count || !Number.isFinite(x)) return -1;
    if (x <= t[0]) return 0;
    if (x >= t[count - 1]) return count - 1;
    let lo = 0;
    let hi = count - 1;
    while (lo + 1 < hi) {
      const mid = (lo + hi) >> 1;
      if (t[mid] <= x) lo = mid;
      else hi = mid;
    }
    return x - t[lo] <= t[hi] - x ? lo : hi;
  }

  function insightTableWindow(scrollTop, viewport, count, rowHeight, overscan) {
    const row = rowHeight > 0 ? rowHeight : INSIGHT_ROW_HEIGHT;
    const extra = overscan > 0 ? overscan : 0;
    const safeCount = count > 0 ? count : 0;
    const viewHeight = viewport > 0 ? viewport : 0;
    const natural = safeCount * row;
    const spacerHeight = Math.min(natural, INSIGHT_MAX_SPACER_PX);
    const viewRows = Math.max(1, Math.ceil((viewHeight || row) / row));
    let start = 0;
    if (safeCount > viewRows) {
      if (spacerHeight === natural) start = Math.floor((scrollTop > 0 ? scrollTop : 0) / row);
      else {
        const maxScroll = Math.max(1, spacerHeight - viewHeight);
        const progress = Math.min(1, Math.max(0, (scrollTop > 0 ? scrollTop : 0) / maxScroll));
        start = Math.round(progress * (safeCount - viewRows));
      }
    }
    start = Math.max(0, start - extra);
    const end = Math.min(safeCount, start + viewRows + extra * 2);
    const windowOffset = spacerHeight === natural ? start * row : (scrollTop > 0 ? scrollTop : 0);
    return { start, end, spacerHeight, windowOffset, rowHeight: row };
  }

  function formatInsightValue(value) {
    if (!Number.isFinite(value)) return "";
    const abs = Math.abs(value);
    let digits = 3;
    if (abs >= 1000) digits = 1;
    else if (abs >= 100) digits = 2;
    const rounded = Number(value.toFixed(digits));
    if (!Number.isFinite(rounded)) return "";
    let text = String(rounded);
    if (text.includes(".")) text = text.replace(/\.?0+$/, "");
    return text === "-0" ? "0" : text;
  }

  function csvCell(value) {
    const text = value == null ? "" : String(value);
    if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  }

  function exactSeriesIndex(series, time) {
    const times = series?.t;
    const count = times?.length || 0;
    let lo = 0;
    let hi = count - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const value = times[mid];
      if (value === time) return mid;
      if (value < time) lo = mid + 1;
      else hi = mid - 1;
    }
    return -1;
  }

  function observationAt(series, time) {
    const index = exactSeriesIndex(series, time);
    return index < 0 ? null : series.v[index];
  }

  function buildObservationGrid(store) {
    const series = (store?.series || []).filter((item) => item && item.count > 0);
    const cursors = series.map(() => 0);
    let total = 0;
    for (const item of series) total += item.count;
    const backing = new Float64Array(total);
    let count = 0;
    while (count < total) {
      let best = Infinity;
      let found = false;
      for (let s = 0; s < series.length; s++) {
        const cursor = cursors[s];
        if (cursor >= series[s].count) continue;
        const time = series[s].t[cursor];
        if (time < best) {
          best = time;
          found = true;
        }
      }
      if (!found) break;
      backing[count] = best;
      count += 1;
      for (let s = 0; s < series.length; s++) {
        if (cursors[s] < series[s].count && series[s].t[cursors[s]] === best) cursors[s] += 1;
      }
    }
    return { times: backing.subarray(0, count), series, count };
  }

  function seriesToCsvChunks(series, formatTime) {
    const chunks = ["timestamp,name,value,unit\n"];
    if (!series || !series.count) return chunks;
    const name = csvCell(series.label || series.key);
    const unit = csvCell(series.unit || "");
    let buffer = "";
    const stamp = typeof formatTime === "function" ? formatTime : (ms) => new Date(ms).toISOString();
    for (let i = 0; i < series.count; i++) {
      buffer += `${csvCell(stamp(series.t[i]))},${name},${csvCell(formatInsightValue(series.v[i]))},${unit}\n`;
      if (buffer.length > 1000000) {
        chunks.push(buffer);
        buffer = "";
      }
    }
    if (buffer) chunks.push(buffer);
    return chunks;
  }

  function gridToCsvChunks(grid, formatTime) {
    const series = grid?.series || [];
    const headers = ["timestamp"];
    for (const item of series) {
      const name = item.label || item.key || "";
      headers.push(item.unit ? `${name} (${item.unit})` : name);
    }
    const chunks = [`${headers.map(csvCell).join(",")}\n`];
    if (!grid?.count) return chunks;
    const stamp = typeof formatTime === "function" ? formatTime : (ms) => new Date(ms).toISOString();
    let buffer = "";
    for (let row = 0; row < grid.count; row++) {
      const time = grid.times[row];
      const cells = [csvCell(stamp(time))];
      for (const item of series) {
        const value = observationAt(item, time);
        cells.push(value == null ? "" : csvCell(formatInsightValue(value)));
      }
      buffer += `${cells.join(",")}\n`;
      if (buffer.length > 1000000) {
        chunks.push(buffer);
        buffer = "";
      }
    }
    if (buffer) chunks.push(buffer);
    return chunks;
  }

  const INSIGHT_PAGE_LIMIT = 1000;
  const INSIGHT_MAX_PAGES = 4000;
  const INSIGHT_ALL_FROM = "2014-01-01T00:00:00.000Z";
  const INSIGHT_OBSERVATIONS_PATH = "/ci-proxy/api/v1/get-observations";
  const INSIGHT_ACCOUNT_PATH = "/ci-proxy/api/v1/get-account";
  const INSIGHT_OBSERVATION_ROLES = ["partner-admin", "corporate-admin", "corporate-user"];

  function abortError() {
    const error = new Error("Fetch cancelled.");
    error.name = "AbortError";
    return error;
  }

  function insightAuthorization(apiKey) {
    return /^Bearer\s+/i.test(apiKey) ? apiKey : `Bearer ${apiKey}`;
  }

  function insightIsoTime(ms) {
    return new Date(ms).toISOString();
  }

  function observationRecordsFromPayload(payload) {
    const records = [];
    const blocks = Array.isArray(payload?.data) ? payload.data : [];
    for (const block of blocks) {
      const sets = Array.isArray(block?.observationSets) ? block.observationSets : [];
      for (const set of sets) {
        const name = String(set?.variable || "").trim();
        if (!name) continue;
        const observations = Array.isArray(set?.observations) ? set.observations : [];
        for (const obs of observations) {
          records.push({
            time: obs?.time,
            name,
            value: obs?.value,
            unit: obs?.unit || set?.unit || ""
          });
        }
      }
    }
    return records;
  }

  function nextObservationsQuery(payload) {
    const next = payload?.next;
    if (typeof next !== "string" || !next) return null;
    if (next.startsWith("?")) return next.slice(1) || null;
    const match = /\/get-observations\?([^#]*)/.exec(next);
    return match && match[1] ? match[1] : null;
  }

  function initialObservationsQuery(deviceId, fromMs, toMs) {
    const params = new URLSearchParams();
    params.append("deviceId", deviceId);
    params.append("limit", String(INSIGHT_PAGE_LIMIT));
    params.append("from", fromMs == null ? INSIGHT_ALL_FROM : insightIsoTime(fromMs));
    if (toMs != null) params.append("to", insightIsoTime(toMs));
    return params.toString();
  }

  function decodeBase64Url(part) {
    const padded = part.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded + "=".repeat((4 - (padded.length % 4)) % 4);
    const decode = globalThis.atob;
    if (typeof decode !== "function") return "";
    return decode(pad);
  }

  function jwtPayload(token) {
    const raw = String(token || "").replace(/^Bearer\s+/i, "").trim();
    const part = raw.split(".")[1];
    if (!part) return null;
    try {
      return JSON.parse(decodeBase64Url(part));
    } catch {
      return null;
    }
  }

  function isInvalidAuth(error) {
    return error?.code === "HTTP" && error.status === 400 && /auth\/invalid-auth/.test(error.message || "");
  }

  function accountRolesFromPayload(payload) {
    const roles = [];
    const blocks = Array.isArray(payload?.data) ? payload.data : [];
    for (const block of blocks) {
      const list = Array.isArray(block?.roles) ? block.roles : [];
      for (const role of list) {
        const name = String(role?.role || "").trim();
        const accessToken = String(role?.accessToken || "").trim();
        if (!name || !accessToken) continue;
        roles.push({
          role: name,
          organizationName: String(role?.organizationName || "").trim(),
          accessToken
        });
      }
    }
    return roles;
  }

  function roleLabel(role) {
    return role.organizationName ? `${role.role} at ${role.organizationName}` : role.role;
  }

  function tokenRoleReport(apiKey, accountPayload) {
    const ownRoleId = jwtPayload(apiKey)?.cf_role;
    const roles = accountRolesFromPayload(accountPayload);
    const matched = ownRoleId == null ? null : roles.find((role) => {
      const payload = jwtPayload(role.accessToken);
      return payload && Number(payload.cf_role) === Number(ownRoleId);
    });
    const eligible = roles.filter((role) => INSIGHT_OBSERVATION_ROLES.includes(role.role));
    const current = matched
      ? roleLabel(matched)
      : (roles.length ? `an account whose roles are ${[...new Set(roles.map((role) => role.role))].join(", ")}` : "");
    return { current, eligible };
  }

  function observationRoleError(report) {
    const current = report?.current || "";
    const eligible = Array.isArray(report?.eligible) ? report.eligible : [];
    const who = current ? `it is for ${current}` : "its role cannot read observations";
    const next = eligible.length
      ? ` Switch to ${eligible.map(roleLabel).join("; ")} and generate the API token there.`
      : " This account has none of those roles, so this login cannot read observations through the public API.";
    const error = new Error(
      `This token is valid, but ${who}. Observations accept ${INSIGHT_OBSERVATION_ROLES.join(", ")}.${next}`
    );
    error.code = "ROLE";
    error.status = 400;
    return error;
  }

  function badTokenError() {
    const error = new Error(
      "ConnectedInsight could not verify this token. Paste the public API token from the profile page, generated while a partner-admin, corporate-admin, or corporate-user role is active."
    );
    error.code = "BAD_TOKEN";
    error.status = 400;
    return error;
  }

  async function throwInsightHttpError(response) {
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
    error.code = "HTTP";
    error.status = response.status;
    throw error;
  }

  async function fetchConnectedInsightObservations(request) {
    if (request?.signal?.aborted) throw abortError();
    const deviceId = String(request?.deviceId || "").trim();
    const apiKey = String(request?.apiKey || "").trim();
    if (!deviceId) {
      const error = new Error("Device ID is required.");
      error.code = "MISSING_DEVICE";
      throw error;
    }
    if (!apiKey) {
      const error = new Error("ConnectedInsight API key is required.");
      error.code = "MISSING_KEY";
      throw error;
    }
    if (request?.fromMs != null && request?.toMs != null && !(request.fromMs < request.toMs)) {
      const error = new Error("Start time must be before the end time.");
      error.code = "BAD_RANGE";
      throw error;
    }
    const fetchImpl = request.fetchImpl || globalThis.fetch;
    if (typeof fetchImpl !== "function") {
      const error = new Error("ConnectedInsight fetch is not available in this environment.");
      error.code = "NO_FETCH";
      throw error;
    }

    const savedAuthorization = insightAuthorization(apiKey);

    async function insightGet(pathAndQuery, authorization) {
      if (request.signal?.aborted) throw abortError();
      const response = await fetchImpl(pathAndQuery, {
        method: "GET",
        headers: {
          Authorization: authorization,
          Accept: "application/json"
        },
        signal: request.signal
      });
      if (!response.ok) await throwInsightHttpError(response);
      return response.json();
    }

    async function fetchObservationPages(authorization) {
      const records = [];
      const seen = new Set();
      let query = initialObservationsQuery(deviceId, request.fromMs, request.toMs);
      let truncated = false;
      let page = 0;
      while (query && !seen.has(query)) {
        if (request.signal?.aborted) throw abortError();
        if (page >= INSIGHT_MAX_PAGES) {
          truncated = true;
          break;
        }
        seen.add(query);
        page += 1;
        const payload = await insightGet(`${INSIGHT_OBSERVATIONS_PATH}?${query}`, authorization);
        const pageRecords = observationRecordsFromPayload(payload);
        for (const record of pageRecords) records.push(record);
        if (typeof request.onProgress === "function") {
          request.onProgress({ received: records.length, page });
        }
        query = nextObservationsQuery(payload);
      }
      const store = buildObservationStore(records);
      store.truncated = truncated;
      return store;
    }

    try {
      return await fetchObservationPages(savedAuthorization);
    } catch (error) {
      if (isInvalidAuth(error)) {
        let report = { current: "", eligible: [] };
        try {
          const account = await insightGet(INSIGHT_ACCOUNT_PATH, savedAuthorization);
          report = tokenRoleReport(apiKey, account);
        } catch {
          report = { current: "", eligible: [] };
        }
        throw observationRoleError(report);
      }
      if (error?.code === "HTTP" && error.status === 400 && /auth\/bad-token/.test(error.message || "")) {
        throw badTokenError();
      }
      throw error;
    }
  }

  globalThis.payloadToolInsight = {
    INSIGHT_ROW_HEIGHT,
    INSIGHT_PRESETS,
    floorToMinute,
    rangeForPreset,
    shiftRange,
    formatDatetimeLocalValue,
    parseDatetimeLocalValue,
    formatDateInputValue,
    parseDateInputStart,
    parseDateInputEnd,
    buildObservationStore,
    findSeries,
    chartPointBudget,
    downsampleMinMax,
    nearestIndex,
    insightTableWindow,
    formatInsightValue,
    observationAt,
    buildObservationGrid,
    seriesToCsvChunks,
    gridToCsvChunks,
    fetchConnectedInsightObservations
  };
})();
