(function () {
  "use strict";

  const GRID = "#2a2e32";
  const TEXT = "#8d918c";
  const ORANGE = "#c4845a";
  const STATION = "#6cb6ff";

  function size(canvas) {
    const width = Math.max(1, canvas.clientWidth || 320);
    const height = Math.max(1, canvas.clientHeight || 180);
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { ctx, width, height };
  }

  function clear(ctx, width, height) {
    ctx.fillStyle = "#121416";
    ctx.fillRect(0, 0, width, height);
  }

  function niceStep(span, targetTicks) {
    const rough = Math.abs(span) / Math.max(1, targetTicks - 1);
    if (!(rough > 0)) return 1;
    const pow = 10 ** Math.floor(Math.log10(rough));
    const norm = rough / pow;
    const base = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
    return base * pow;
  }

  function niceTicks(min, max, target) {
    const goal = Math.max(2, target || 5);
    if (!Number.isFinite(min) || !Number.isFinite(max)) return [0];
    if (min === max) {
      const pad = Math.abs(min) || 1;
      return niceTicks(min - pad, max + pad, goal);
    }
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    const step = niceStep(hi - lo, goal);
    const start = Math.floor(lo / step) * step;
    const end = Math.ceil(hi / step) * step;
    const ticks = [];
    for (let value = start; value <= end + step * 0.5; value += step) {
      ticks.push(Number(value.toPrecision(12)));
      if (ticks.length > 24) break;
    }
    return ticks;
  }

  function timeTicks(min, max, target) {
    const goal = Math.max(2, target || 4);
    if (!Number.isFinite(min) || !Number.isFinite(max)) return [Date.now()];
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    if (hi === lo) return [lo];
    const span = hi - lo;
    const steps = [
      60e3, 5 * 60e3, 15 * 60e3, 30 * 60e3,
      3600e3, 2 * 3600e3, 3 * 3600e3, 6 * 3600e3, 12 * 3600e3,
      86400e3, 2 * 86400e3, 7 * 86400e3, 14 * 86400e3, 30 * 86400e3
    ];
    let step = steps[steps.length - 1];
    for (const candidate of steps) {
      if (span / candidate <= goal) {
        step = candidate;
        break;
      }
    }
    const start = Math.ceil(lo / step) * step;
    const ticks = [];
    for (let value = start; value <= hi; value += step) {
      ticks.push(value);
      if (ticks.length > 16) break;
    }
    if (!ticks.length || ticks[0] > lo + step * 0.05) ticks.unshift(lo);
    if (ticks[ticks.length - 1] < hi - step * 0.05) ticks.push(hi);
    return ticks;
  }

  function extent(values) {
    let min = Infinity;
    let max = -Infinity;
    for (const value of values || []) {
      if (!Number.isFinite(value)) continue;
      if (value < min) min = value;
      if (value > max) max = value;
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 1 };
    return { min, max };
  }

  function targetTickCount(pixelSpan, size) {
    return Math.max(3, Math.min(8, Math.round(pixelSpan / size)));
  }

  function drawAxes(ctx, width, height, plot, options) {
    const fmt = window.deviceInspectorFormat;
    const unit = options?.unit ? ` ${options.unit}` : "";
    const tz = options?.tz || "local";
    const yTicks = niceTicks(plot.minY, plot.maxY, targetTickCount(height - plot.padTop - plot.padBottom, 36));
    const xTicks = options?.timeAxis === false
      ? niceTicks(plot.minX, plot.maxX, targetTickCount(width - plot.padX - 12, 120))
      : timeTicks(plot.minX, plot.maxX, targetTickCount(width - plot.padX - 12, 120));

    ctx.strokeStyle = GRID;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const y of yTicks) {
      const py = plot.yOf(y);
      ctx.moveTo(plot.padX, py);
      ctx.lineTo(width - 12, py);
    }
    for (const x of xTicks) {
      const px = plot.xOf(x);
      ctx.moveTo(px, plot.padTop);
      ctx.lineTo(px, height - plot.padBottom);
    }
    ctx.stroke();

    ctx.fillStyle = TEXT;
    ctx.font = "11px Consolas, monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (const y of yTicks) {
      const label = `${fmt.formatNumber(y)}${unit}`;
      ctx.fillText(label, plot.padX - 6, plot.yOf(y));
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    const xLabels = xTicks.map((x) => ({ x, label: fmt.formatTime(x, tz) }));
    for (let index = 0; index < xLabels.length; index += 1) {
      const item = xLabels[index];
      const px = plot.xOf(item.x);
      const textWidth = ctx.measureText(item.label).width;
      let drawX = px;
      if (index === 0) drawX = Math.max(plot.padX + textWidth / 2, px);
      if (index === xLabels.length - 1) drawX = Math.min(width - 8 - textWidth / 2, px);
      ctx.fillText(item.label, drawX, height - 8);
    }
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }

  function fillWrapped(ctx, text, x, y, maxWidth) {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    let line = "";
    let lineY = y;
    let used = 0;
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > maxWidth) {
        ctx.fillText(line, x, lineY);
        line = word;
        lineY += 16;
        used += 1;
        if (used >= 3) return;
      } else {
        line = next;
      }
    }
    if (line && used < 4) ctx.fillText(line, x, lineY);
  }

  function drawSeries(canvas, points, options) {
    const { ctx, width, height } = size(canvas);
    clear(ctx, width, height);
    const color = options?.color || ORANGE;
    const rows = (points || []).filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
    if (!rows.length) {
      ctx.fillStyle = TEXT;
      const title = options?.empty || "No samples";
      ctx.font = "15px Bahnschrift, Segoe UI, sans-serif";
      ctx.fillText(title, 18, options?.detail ? height / 2 - 12 : height / 2);
      if (options?.detail) {
        ctx.font = "12px Bahnschrift, Segoe UI, sans-serif";
        fillWrapped(ctx, options.detail, 18, height / 2 + 12, width - 36);
      }
      return;
    }
    const xs = rows.map((point) => point.x);
    const ys = rows.map((point) => point.y);
    const xExtent = extent(xs);
    const yExtent = extent(ys);
    const yTicks = niceTicks(yExtent.min, yExtent.max, targetTickCount(height - 44, 36));
    const minX = xExtent.min;
    const maxX = xExtent.max;
    const minY = Math.min(yExtent.min, yTicks[0]);
    const maxY = Math.max(yExtent.max, yTicks[yTicks.length - 1]);
    const padX = 58;
    const padTop = 16;
    const padBottom = 28;
    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;
    const xOf = (x) => padX + ((x - minX) / spanX) * (width - padX - 12);
    const yOf = (y) => height - padBottom - ((y - minY) / spanY) * (height - padBottom - padTop);
    drawAxes(ctx, width, height, { minX, maxX, minY, maxY, padX, padTop, padBottom, xOf, yOf }, options);

    ctx.beginPath();
    rows.forEach((point, index) => {
      const x = xOf(point.x);
      const y = yOf(point.y);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    canvas._series = rows;
    canvas._project = { xOf, yOf };
    canvas._unit = options?.unit || "";
  }

  function hitSeries(canvas, offsetX) {
    const rows = canvas._series || [];
    const project = canvas._project;
    if (!rows.length || !project) return null;
    let best = null;
    let bestDist = 14;
    for (const point of rows) {
      const dist = Math.abs(project.xOf(point.x) - offsetX);
      if (dist < bestDist) {
        best = point;
        bestDist = dist;
      }
    }
    return best;
  }

  function drawMultiSeries(canvas, seriesList, options) {
    const { ctx, width, height } = size(canvas);
    clear(ctx, width, height);
    const series = (seriesList || [])
      .map((item) => ({
        key: item.key || "",
        label: item.label || item.key || "",
        color: item.color || ORANGE,
        points: (item.points || []).filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
      }))
      .filter((item) => item.points.length);
    if (!series.length) {
      ctx.fillStyle = TEXT;
      ctx.font = "15px Bahnschrift, Segoe UI, sans-serif";
      ctx.fillText(options?.empty || "No samples", 18, options?.detail ? height / 2 - 12 : height / 2);
      if (options?.detail) {
        ctx.font = "12px Bahnschrift, Segoe UI, sans-serif";
        fillWrapped(ctx, options.detail, 18, height / 2 + 12, width - 36);
      }
      canvas._series = [];
      canvas._multiSeries = [];
      canvas._project = null;
      return;
    }
    const xs = series.flatMap((item) => item.points.map((point) => point.x));
    const ys = series.flatMap((item) => item.points.map((point) => point.y));
    const xExtent = extent(xs);
    const yExtent = extent(ys);
    const minX = xExtent.min;
    const maxX = xExtent.max;
    const dataMaxY = Math.max(yExtent.max, 1);
    const yTicks = niceTicks(0, dataMaxY, targetTickCount(height - 44, 36));
    const minY = 0;
    const maxY = Math.max(dataMaxY, yTicks[yTicks.length - 1]);
    const padX = 58;
    const padTop = 22;
    const padBottom = 28;
    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;
    const xOf = (x) => padX + ((x - minX) / spanX) * (width - padX - 12);
    const yOf = (y) => height - padBottom - ((y - minY) / spanY) * (height - padBottom - padTop);
    drawAxes(ctx, width, height, { minX, maxX, minY, maxY, padX, padTop, padBottom, xOf, yOf }, options);

    for (const item of series) {
      ctx.beginPath();
      item.points.forEach((point, index) => {
        const x = xOf(point.x);
        const y = yOf(point.y);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    let legendX = padX;
    const legendY = 12;
    ctx.font = "11px Bahnschrift, Segoe UI, sans-serif";
    for (const item of series) {
      ctx.fillStyle = item.color;
      ctx.fillRect(legendX, legendY - 7, 10, 3);
      ctx.fillStyle = TEXT;
      ctx.fillText(item.label, legendX + 14, legendY);
      legendX += ctx.measureText(item.label).width + 28;
    }

    canvas._series = series[0].points;
    canvas._multiSeries = series;
    canvas._project = { xOf, yOf, minX, maxX };
    canvas._unit = options?.unit || "";
  }

  function hitMultiSeries(canvas, offsetX) {
    const series = canvas._multiSeries || [];
    const project = canvas._project;
    if (!series.length || !project) return null;
    const xs = series[0].points.map((point) => point.x);
    let bestX = null;
    let bestDist = 16;
    for (const x of xs) {
      const dist = Math.abs(project.xOf(x) - offsetX);
      if (dist < bestDist) {
        bestX = x;
        bestDist = dist;
      }
    }
    if (bestX == null) return null;
    const values = {};
    for (const item of series) {
      const point = item.points.find((row) => row.x === bestX);
      values[item.key || item.label] = point ? point.y : null;
    }
    return { x: bestX, values };
  }

  const tileCache = new Map();

  function cssSize(canvas) {
    return {
      width: Math.max(1, canvas.clientWidth || 320),
      height: Math.max(1, canvas.clientHeight || 180)
    };
  }

  function worldPx(lat, lng, zoom) {
    const scale = 256 * (2 ** zoom);
    const x = ((lng + 180) / 360) * scale;
    const sin = Math.sin((lat * Math.PI) / 180);
    const y = (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale;
    return { x, y };
  }

  function tilesFor(zoom, originX, originY, width, height) {
    const tileZoom = Math.max(0, Math.min(18, Math.floor(zoom)));
    const scale = 2 ** (zoom - tileZoom);
    const tileSize = 256 * scale;
    const n = 2 ** tileZoom;
    const x0 = Math.floor(originX / tileSize);
    const y0 = Math.floor(originY / tileSize);
    const x1 = Math.floor((originX + width - 1) / tileSize);
    const y1 = Math.floor((originY + height - 1) / tileSize);
    const tiles = [];
    for (let ty = y0; ty <= y1; ty += 1) {
      if (ty < 0 || ty >= n) continue;
      for (let tx = x0; tx <= x1; tx += 1) tiles.push({ z: tileZoom, x: tx, y: ty });
    }
    return { zoom, tileZoom, tileSize, originX, originY, tiles };
  }

  function mapView(points, width, height) {
    let zoom = 11;
    for (let z = 11; z >= 3; z -= 1) {
      const px = points.map((point) => worldPx(point.lat, point.lng, z));
      const dx = Math.max(...px.map((point) => point.x)) - Math.min(...px.map((point) => point.x));
      const dy = Math.max(...px.map((point) => point.y)) - Math.min(...px.map((point) => point.y));
      zoom = z;
      if (dx <= (width - 64) * 0.72 && dy <= (height - 64) * 0.72) break;
    }
    const px = points.map((point) => worldPx(point.lat, point.lng, zoom));
    const minX = Math.min(...px.map((point) => point.x));
    const maxX = Math.max(...px.map((point) => point.x));
    const minY = Math.min(...px.map((point) => point.y));
    const maxY = Math.max(...px.map((point) => point.y));
    const originX = (minX + maxX) / 2 - width / 2;
    const originY = (minY + maxY) / 2 - height / 2;
    return tilesFor(zoom, originX, originY, width, height);
  }

  function tileKey(view) {
    return `${view.tileZoom}:${view.tileSize.toFixed(3)}:${view.tiles.map((tile) => `${tile.x}/${tile.y}`).join(",")}`;
  }

  function locationFingerprint(location) {
    const approx = location?.approx;
    const stations = (location?.stations || [])
      .map((station) => `${station.id || ""}:${station.lat},${station.lng}:${station.rssi}`)
      .join("|");
    return `${approx?.lat},${approx?.lng},${approx?.radius}|${stations}|${location?.pendingStations ? 1 : 0}`;
  }

  function mapPoints(location) {
    const points = [];
    const approx = location?.approx || null;
    if (approx && Number.isFinite(approx.lat) && Number.isFinite(approx.lng)) points.push(approx);
    for (const station of location?.stations || []) {
      if (Number.isFinite(station.lat) && Number.isFinite(station.lng)) points.push(station);
    }
    return points;
  }

  function loadTile(z, x, y) {
    const n = 2 ** z;
    if (y < 0 || y >= n) return Promise.resolve(null);
    const xx = ((x % n) + n) % n;
    const key = `${z}/${xx}/${y}`;
    if (tileCache.has(key)) return tileCache.get(key);
    const pending = new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = `https://tile.openstreetmap.org/${key}.png`;
    });
    tileCache.set(key, pending);
    return pending;
  }

  function screenOf(lat, lng, view) {
    const point = worldPx(lat, lng, view.zoom);
    return { x: point.x - view.originX, y: point.y - view.originY };
  }

  function paintEmpty(canvas, location) {
    const { ctx, width, height } = size(canvas);
    clear(ctx, width, height);
    ctx.fillStyle = TEXT;
    ctx.font = "13px Bahnschrift, Segoe UI, sans-serif";
    ctx.fillText(location?.pendingStations ? "Basestations load with message history" : "No radio fix", 18, height / 2);
  }

  function clusterStations(placed, view) {
    const clusters = [];
    for (const station of placed) {
      const at = screenOf(station.lat, station.lng, view);
      let cluster = null;
      for (const item of clusters) {
        const dx = item.x - at.x;
        const dy = item.y - at.y;
        if ((dx * dx) + (dy * dy) <= 14 * 14) {
          cluster = item;
          break;
        }
      }
      if (cluster) {
        cluster.stations.push(station);
        const n = cluster.stations.length;
        cluster.x = ((cluster.x * (n - 1)) + at.x) / n;
        cluster.y = ((cluster.y * (n - 1)) + at.y) / n;
      } else {
        clusters.push({ x: at.x, y: at.y, stations: [station] });
      }
    }
    for (const cluster of clusters) {
      cluster.stations.sort((a, b) => (b.rssi ?? -999) - (a.rssi ?? -999));
    }
    return clusters;
  }

  function drawStationLabel(ctx, text, x, y, width, height) {
    const label = String(text || "");
    if (!label) return;
    ctx.font = "11px Consolas, Cascadia Mono, monospace";
    const padX = 4;
    const padY = 2;
    const metrics = ctx.measureText(label);
    const boxW = metrics.width + padX * 2;
    const boxH = 14;
    let left = x + 8;
    let top = y - boxH / 2;
    if (left + boxW > width - 4) left = x - 8 - boxW;
    if (top < 4) top = 4;
    if (top + boxH > height - 4) top = height - 4 - boxH;
    ctx.fillStyle = "rgba(16,18,20,0.82)";
    ctx.fillRect(left, top, boxW, boxH);
    ctx.strokeStyle = "rgba(44,48,52,0.9)";
    ctx.lineWidth = 1;
    ctx.strokeRect(left, top, boxW, boxH);
    ctx.fillStyle = STATION;
    ctx.textBaseline = "middle";
    ctx.fillText(label, left + padX, top + boxH / 2 + 0.5);
  }

  function paintMap(canvas, location, view, images) {
    const { ctx, width, height } = size(canvas);
    ctx.fillStyle = "#e6e4e0";
    ctx.fillRect(0, 0, width, height);
    ctx.filter = "grayscale(1)";
    let drawn = 0;
    const tileSize = view.tileSize || 256;
    view.tiles.forEach((tile, index) => {
      const img = images[index];
      if (!img) return;
      drawn += 1;
      ctx.drawImage(img, tile.x * tileSize - view.originX, tile.y * tileSize - view.originY, tileSize, tileSize);
    });
    ctx.filter = "none";

    const stations = location?.stations || [];
    const approx = location?.approx || null;
    const placed = stations.filter((station) => Number.isFinite(station.lat) && Number.isFinite(station.lng));
    if (approx?.radius && Number.isFinite(approx.lat) && Number.isFinite(approx.lng)) {
      const metersPerPixel = (156543.03392 * Math.cos((approx.lat * Math.PI) / 180)) / (2 ** view.zoom);
      const at = screenOf(approx.lat, approx.lng, view);
      ctx.beginPath();
      ctx.arc(at.x, at.y, Math.max(8, Math.min(approx.radius / metersPerPixel, height)), 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(196,132,90,0.7)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    const clusters = clusterStations(placed, view);
    for (const cluster of clusters) {
      const marker = cluster.stations[0];
      ctx.beginPath();
      ctx.arc(cluster.x, cluster.y, cluster.stations.length > 1 ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = rssiColor(marker.rssi);
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "#1c1e20";
      ctx.stroke();
      if (cluster.stations.length > 1) {
        ctx.fillStyle = "#101214";
        ctx.font = "10px Bahnschrift, Segoe UI, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(cluster.stations.length), cluster.x, cluster.y + 0.5);
        ctx.textAlign = "start";
      }
      cluster.stations.forEach((station, index) => {
        const labelY = cluster.y + (index - (cluster.stations.length - 1) / 2) * 16;
        drawStationLabel(ctx, station.id || "?", cluster.x, labelY, width, height);
      });
    }

    if (approx && Number.isFinite(approx.lat) && Number.isFinite(approx.lng)) {
      const at = screenOf(approx.lat, approx.lng, view);
      ctx.strokeStyle = ORANGE;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(at.x - 7, at.y);
      ctx.lineTo(at.x + 7, at.y);
      ctx.moveTo(at.x, at.y - 7);
      ctx.lineTo(at.x, at.y + 7);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(28,30,32,0.72)";
    ctx.font = "11px Bahnschrift, Segoe UI, sans-serif";
    ctx.textBaseline = "alphabetic";
    const note = drawn ? "© OpenStreetMap" : "OpenStreetMap tiles did not load";
    ctx.fillText(note, 8, height - 8);
    canvas._mapHits = clusters;
    canvas._mapView = view;
  }

  function drawMap(canvas, location, options) {
    bindMapControls(canvas);
    const token = (canvas._mapSeq = (canvas._mapSeq || 0) + 1);
    canvas._mapLocation = location || null;
    const points = mapPoints(location);
    if (!points.length) {
      canvas._mapFp = "";
      canvas._mapCamera = null;
      paintEmpty(canvas, location);
      return;
    }
    const { width, height } = cssSize(canvas);
    const fingerprint = locationFingerprint(location);
    const keepView = options?.keepView && canvas._mapCamera && canvas._mapFp === fingerprint;
    canvas._mapFp = fingerprint;
    const { ctx } = size(canvas);
    if (!keepView) {
      ctx.fillStyle = "#e6e4e0";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#3c403c";
      ctx.font = "13px Bahnschrift, Segoe UI, sans-serif";
      ctx.fillText("Loading map…", 18, height / 2);
    }

    const paint = async () => {
      let view = keepView
        ? tilesFor(canvas._mapCamera.zoom, canvas._mapCamera.originX, canvas._mapCamera.originY, width, height)
        : mapView(points, width, height);
      let images = await Promise.all(view.tiles.map((tile) => loadTile(tile.z, tile.x, tile.y)));
      if (canvas._mapSeq !== token) return;
      const now = cssSize(canvas);
      const next = keepView
        ? tilesFor(view.zoom, view.originX, view.originY, now.width, now.height)
        : mapView(points, now.width, now.height);
      if (tileKey(next) !== tileKey(view)) {
        view = next;
        images = await Promise.all(view.tiles.map((tile) => loadTile(tile.z, tile.x, tile.y)));
        if (canvas._mapSeq !== token) return;
      }
      canvas._mapCamera = { zoom: view.zoom, originX: view.originX, originY: view.originY };
      paintMap(canvas, location, view, images);
    };
    paint().catch(() => {
      if (canvas._mapSeq !== token) return;
      paintEmpty(canvas, location);
    });
  }

  function setMapCamera(canvas, zoom, originX, originY) {
    const clampedZoom = Math.max(3, Math.min(18, zoom));
    canvas._mapCamera = { zoom: clampedZoom, originX, originY };
    if (canvas._mapLocation) drawMap(canvas, canvas._mapLocation, { keepView: true });
  }

  function wheelDeltaPixels(event, pageHeight) {
    let delta = event.deltaY;
    if (event.deltaMode === 1) delta *= 16;
    else if (event.deltaMode === 2) delta *= pageHeight || 320;
    return delta;
  }

  function escapeTip(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatRssi(rssi) {
    return Number.isFinite(rssi) ? `${Number(rssi).toFixed(1)} dBm` : "—";
  }

  function stationTipHtml(station) {
    const lines = [];
    lines.push(`<div class="tip-title">${escapeTip(station.id || "unknown")}</div>`);
    if (station.name) lines.push(`<div>${escapeTip(station.name)}</div>`);
    lines.push(`<div class="tip-dim">RSSI ${escapeTip(formatRssi(station.rssi))}</div>`);
    if (Number.isFinite(station.lat) && Number.isFinite(station.lng)) {
      lines.push(`<div class="tip-dim">${station.lat.toFixed(5)}, ${station.lng.toFixed(5)}</div>`);
    } else {
      lines.push(`<div class="tip-dim">No coordinates (often roaming / not visible)</div>`);
    }
    if (Number.isFinite(station.elevation)) lines.push(`<div class="tip-dim">Elevation ${escapeTip(station.elevation)} m</div>`);
    if (station.antenna) lines.push(`<div class="tip-dim">Antenna ${escapeTip(station.antenna)}</div>`);
    if (station.status) lines.push(`<div class="tip-dim">Status ${escapeTip(station.status)}</div>`);
    if (station.error) lines.push(`<div class="tip-dim">Lookup failed: ${escapeTip(station.error)}</div>`);
    return `<div class="tip-block">${lines.join("")}</div>`;
  }

  function mapTooltipEl(canvas) {
    const wrap = canvas.parentElement;
    if (!wrap) return null;
    return wrap.querySelector(".map-tooltip") || document.getElementById("map-tooltip");
  }

  function hideMapTooltip(canvas) {
    const tip = mapTooltipEl(canvas);
    if (tip) tip.hidden = true;
    canvas.classList.remove("is-hovering-station");
  }

  function showMapTooltip(canvas, cluster, offsetX, offsetY) {
    const tip = mapTooltipEl(canvas);
    if (!tip || !cluster?.stations?.length) {
      hideMapTooltip(canvas);
      return;
    }
    const count = cluster.stations.length;
    const head = count > 1 ? `<div class="tip-count">${count} basestations here</div>` : "";
    tip.innerHTML = head + cluster.stations.map(stationTipHtml).join("");
    tip.hidden = false;
    canvas.classList.add("is-hovering-station");
    const wrap = canvas.parentElement;
    const wrapW = wrap?.clientWidth || canvas.clientWidth;
    const wrapH = wrap?.clientHeight || canvas.clientHeight;
    const tipW = tip.offsetWidth || 180;
    const tipH = tip.offsetHeight || 80;
    let left = offsetX + 14;
    let top = offsetY + 14;
    if (left + tipW > wrapW - 6) left = offsetX - tipW - 12;
    if (top + tipH > wrapH - 6) top = offsetY - tipH - 12;
    tip.style.left = `${Math.max(6, left)}px`;
    tip.style.top = `${Math.max(6, top)}px`;
  }

  function hitCluster(canvas, offsetX, offsetY) {
    const hits = canvas._mapHits || [];
    let best = null;
    let bestDist = 16;
    for (const cluster of hits) {
      const dx = cluster.x - offsetX;
      const dy = cluster.y - offsetY;
      const dist = Math.sqrt((dx * dx) + (dy * dy));
      if (dist <= bestDist) {
        best = cluster;
        bestDist = dist;
      }
    }
    return best;
  }

  function bindMapControls(canvas) {
    if (canvas._mapControls) return;
    canvas._mapControls = true;
    let drag = null;
    let wheelDelta = 0;
    let wheelFocus = null;
    let wheelFrame = 0;

    canvas.addEventListener("wheel", (event) => {
      if (!canvas._mapCamera || !canvas._mapLocation) return;
      event.preventDefault();
      hideMapTooltip(canvas);
      const rect = canvas.getBoundingClientRect();
      wheelDelta += wheelDeltaPixels(event, rect.height);
      wheelFocus = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      if (wheelFrame) return;
      wheelFrame = requestAnimationFrame(() => {
        wheelFrame = 0;
        if (!canvas._mapCamera || !wheelFocus) {
          wheelDelta = 0;
          return;
        }
        const oldZoom = canvas._mapCamera.zoom;
        const nextZoom = Math.max(3, Math.min(18, oldZoom - wheelDelta * 0.00125));
        wheelDelta = 0;
        if (Math.abs(nextZoom - oldZoom) < 0.0005) return;
        const scale = 2 ** (nextZoom - oldZoom);
        const worldX = canvas._mapCamera.originX + wheelFocus.x;
        const worldY = canvas._mapCamera.originY + wheelFocus.y;
        setMapCamera(canvas, nextZoom, worldX * scale - wheelFocus.x, worldY * scale - wheelFocus.y);
      });
    }, { passive: false });

    canvas.addEventListener("pointerdown", (event) => {
      if (!canvas._mapCamera || event.button !== 0) return;
      hideMapTooltip(canvas);
      drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
      canvas.classList.add("is-dragging");
      canvas.setPointerCapture(event.pointerId);
    });

    canvas.addEventListener("pointermove", (event) => {
      const rect = canvas.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      if (drag && drag.pointerId === event.pointerId && canvas._mapCamera) {
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        drag.x = event.clientX;
        drag.y = event.clientY;
        setMapCamera(
          canvas,
          canvas._mapCamera.zoom,
          canvas._mapCamera.originX - dx,
          canvas._mapCamera.originY - dy
        );
        return;
      }
      if (drag) return;
      const cluster = hitCluster(canvas, offsetX, offsetY);
      if (cluster) showMapTooltip(canvas, cluster, offsetX, offsetY);
      else hideMapTooltip(canvas);
    });

    const endDrag = (event) => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      drag = null;
      canvas.classList.remove("is-dragging");
    };
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
    canvas.addEventListener("pointerleave", () => hideMapTooltip(canvas));
    canvas.addEventListener("dblclick", (event) => {
      if (!canvas._mapLocation) return;
      event.preventDefault();
      hideMapTooltip(canvas);
      canvas._mapCamera = null;
      drawMap(canvas, canvas._mapLocation);
    });
  }

  function rssiColor(rssi) {
    const value = Number(rssi);
    if (!Number.isFinite(value)) return "#6e7370";
    const t = Math.max(0, Math.min(1, (value - (-140)) / 40));
    if (t < 0.5) return mixColor("#a86858", "#c4845a", t / 0.5);
    return mixColor("#c4845a", "#8faf72", (t - 0.5) / 0.5);
  }

  function mixColor(from, to, t) {
    const a = hexRgb(from);
    const b = hexRgb(to);
    const channel = (index) => Math.round(a[index] + (b[index] - a[index]) * t);
    return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
  }

  function hexRgb(hex) {
    const value = hex.replace("#", "");
    return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
  }

  window.deviceInspectorCharts = {
    drawSeries,
    drawMultiSeries,
    drawMap,
    hitSeries,
    hitMultiSeries,
    rssiColor,
    bindMapControls
  };
})();
