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
    ctx.strokeStyle = GRID;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 24; x < width; x += 28) {
      ctx.moveTo(x, 12);
      ctx.lineTo(x, height - 12);
    }
    for (let y = 16; y < height; y += 22) {
      ctx.moveTo(12, y);
      ctx.lineTo(width - 12, y);
    }
    ctx.stroke();
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
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const padX = 58;
    const padTop = 16;
    const padBottom = 28;
    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;
    const xOf = (x) => padX + ((x - minX) / spanX) * (width - padX - 12);
    const yOf = (y) => height - padBottom - ((y - minY) / spanY) * (height - padBottom - padTop);

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

    ctx.fillStyle = TEXT;
    ctx.font = "11px Consolas, monospace";
    const fmt = window.deviceInspectorFormat;
    const unit = options?.unit ? ` ${options.unit}` : "";
    ctx.fillText(`${fmt.formatNumber(maxY)}${unit}`, 8, 14);
    ctx.fillText(`${fmt.formatNumber(minY)}${unit}`, 8, height - padBottom);
    const tz = options?.tz || "local";
    const startLabel = fmt.formatTime(minX, tz);
    const endLabel = fmt.formatTime(maxX, tz);
    ctx.fillText(startLabel, padX, height - 8);
    ctx.fillText(endLabel, Math.max(padX, width - ctx.measureText(endLabel).width - 8), height - 8);
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
    const n = 2 ** zoom;
    const x0 = Math.floor(originX / 256);
    const y0 = Math.floor(originY / 256);
    const x1 = Math.floor((originX + width - 1) / 256);
    const y1 = Math.floor((originY + height - 1) / 256);
    const tiles = [];
    for (let ty = y0; ty <= y1; ty += 1) {
      if (ty < 0 || ty >= n) continue;
      for (let tx = x0; tx <= x1; tx += 1) tiles.push({ z: zoom, x: tx, y: ty });
    }
    return { zoom, originX, originY, tiles };
  }

  function tileKey(view) {
    return `${view.zoom}:${view.tiles.map((tile) => `${tile.x}/${tile.y}`).join(",")}`;
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

  function paintMap(canvas, location, view, images) {
    const { ctx, width, height } = size(canvas);
    ctx.fillStyle = "#e6e4e0";
    ctx.fillRect(0, 0, width, height);
    ctx.filter = "grayscale(1)";
    let drawn = 0;
    view.tiles.forEach((tile, index) => {
      const img = images[index];
      if (!img) return;
      drawn += 1;
      ctx.drawImage(img, tile.x * 256 - view.originX, tile.y * 256 - view.originY, 256, 256);
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

    const ordered = [...placed].sort((a, b) => (a.rssi ?? -999) - (b.rssi ?? -999));
    for (const station of ordered) {
      const at = screenOf(station.lat, station.lng, view);
      ctx.beginPath();
      ctx.arc(at.x, at.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = rssiColor(station.rssi);
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "#1c1e20";
      ctx.stroke();
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
    const note = drawn ? "© OpenStreetMap" : "OpenStreetMap tiles did not load";
    ctx.fillText(note, 8, height - 8);
  }

  function drawMap(canvas, location) {
    const token = (canvas._mapSeq = (canvas._mapSeq || 0) + 1);
    const stations = location?.stations || [];
    const approx = location?.approx || null;
    const points = [];
    if (approx && Number.isFinite(approx.lat) && Number.isFinite(approx.lng)) points.push(approx);
    for (const station of stations) {
      if (Number.isFinite(station.lat) && Number.isFinite(station.lng)) points.push(station);
    }
    if (!points.length) {
      paintEmpty(canvas, location);
      return;
    }
    const { width, height } = cssSize(canvas);
    const { ctx } = size(canvas);
    ctx.fillStyle = "#e6e4e0";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#3c403c";
    ctx.font = "13px Bahnschrift, Segoe UI, sans-serif";
    ctx.fillText("Loading map…", 18, height / 2);

    const paint = async () => {
      let view = mapView(points, width, height);
      let images = await Promise.all(view.tiles.map((tile) => loadTile(tile.z, tile.x, tile.y)));
      if (canvas._mapSeq !== token) return;
      const now = cssSize(canvas);
      const next = mapView(points, now.width, now.height);
      if (tileKey(next) !== tileKey(view)) {
        view = next;
        images = await Promise.all(view.tiles.map((tile) => loadTile(tile.z, tile.x, tile.y)));
        if (canvas._mapSeq !== token) return;
      }
      paintMap(canvas, location, view, images);
    };
    paint().catch(() => {
      if (canvas._mapSeq !== token) return;
      paintEmpty(canvas, location);
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

  window.deviceInspectorCharts = { drawSeries, drawMap, hitSeries, rssiColor };
})();
