(function () {
  "use strict";

  function hexToBytes(input) {
    const hex = String(input || "").replace(/[^0-9a-fA-F]/g, "");
    if (!hex || hex.length % 2 !== 0) return new Uint8Array(0);
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16);
    return bytes;
  }

  function readLeUint16(bytes, offset) {
    return bytes[offset] | (bytes[offset + 1] << 8);
  }

  function decodeOob(hex) {
    const bytes = hexToBytes(hex);
    if (bytes.length < 8) return null;
    const decoded = {
      oob_vdd_idle: readLeUint16(bytes, 1) / 1000,
      oob_vdd_tx: readLeUint16(bytes, 3) / 1000,
      oob_temperature: readLeUint16(bytes, 5) / 10,
      oob_rssi: bytes[7] - 100
    };
    if (decoded.oob_vdd_idle < 1.5 || decoded.oob_vdd_idle > 5.5) return null;
    if (decoded.oob_vdd_tx < 0 || decoded.oob_vdd_tx > 5.5) return null;
    if (decoded.oob_temperature < -50 || decoded.oob_temperature > 125) return null;
    if (decoded.oob_rssi < -150 || decoded.oob_rssi > 30) return null;
    const fields = [
      field("oob_vdd_idle", "Idle voltage", decoded.oob_vdd_idle, "V"),
      field("oob_vdd_tx", "TX voltage", decoded.oob_vdd_tx, "V"),
      field("oob_temperature", "Temperature", decoded.oob_temperature, "°C"),
      field("oob_rssi", "RSSI", decoded.oob_rssi, "dBm")
    ];
    return { variant: "sigfox_oob", error: "", fields };
  }

  function field(name, label, number, unit) {
    const text = Number.isFinite(number)
      ? `${Number(number.toFixed(Math.abs(number) >= 100 ? 1 : 3))}${unit ? ` ${unit}` : ""}`
      : "";
    return { name, label, number: Number.isFinite(number) ? number : null, unit: unit || "", text };
  }

  function isReserved(item) {
    const name = String(item?.name || "").toLowerCase();
    const description = String(item?.description || "").toLowerCase();
    return name.includes("reserved") || description.startsWith("reserved");
  }

  function enumLabel(item, raw) {
    if (!Array.isArray(item?.enum_values)) return "";
    for (const entry of item.enum_values) {
      if (!entry || !Object.prototype.hasOwnProperty.call(entry, "value")) continue;
      if (String(entry.value) === String(raw)) return entry.label != null ? String(entry.label) : String(entry.value);
    }
    return "";
  }

  function scaleField(item, raw, meta) {
    if (isReserved(item)) return null;
    if (meta) return { name: item.name, label: item.name, number: null, unit: item.unit || "", text: meta.meaning || "sentinel" };
    if (item?.type === "bytes") return { name: item.name, label: item.name, number: null, unit: "", text: String(raw) };
    const named = enumLabel(item, raw);
    if (named) return { name: item.name, label: item.name, number: null, unit: "", text: named };
    if (item?.type === "bool") {
      const on = Number(raw) !== 0;
      return { name: item.name, label: item.name, number: on ? 1 : 0, unit: "", text: on ? "true" : "false" };
    }
    const add = Number(item?.add || 0);
    const mult = Number(item?.mult || 1);
    const div = item?.div == null ? 1 : Number(item.div);
    const scaled = ((Number(raw) + add) * mult) / div;
    if (!Number.isFinite(scaled)) return { name: item.name, label: item.name, number: null, unit: item.unit || "", text: String(raw) };
    return field(item.name, item.name, scaled, item.unit || "");
  }

  function decodeUplink(schema, hex) {
    const codec = window.payloadToolCodec;
    if (!codec || !schema) return { variant: "", error: "No payload schema", fields: [] };
    try {
      const variant = codec.pickUplinkPayload(schema, hex);
      if (!variant) return { variant: "", error: "No matching payload", fields: [] };
      const values = codec.decodeVariant(schema, variant, hex);
      const fields = [];
      for (const item of variant.fields || []) {
        if (!Object.prototype.hasOwnProperty.call(values, item.name)) continue;
        const scaled = scaleField(item, values[item.name], values[`${item.name}__meta`]);
        if (scaled) fields.push(scaled);
      }
      return { variant: variant.name || "", error: "", fields, values };
    } catch (error) {
      return { variant: "", error: error.message || String(error), fields: [] };
    }
  }

  function decodeMessage(message, schema) {
    const hex = String(message?.hex || "");
    if (!hex) return { variant: "", error: "", fields: [] };
    if (message.kind === "oob") {
      return decodeOob(hex) || { variant: "sigfox_oob", error: "OOB payload not recognized", fields: [] };
    }
    const uplink = decodeUplink(schema, hex);
    if (!uplink.error) return uplink;
    const oob = decodeOob(hex);
    if (oob) return oob;
    return uplink;
  }

  function listSchemas() {
    const versions = window.payloadSchemas?.device_versions || [];
    return versions.map((item) => ({
      slug: item.slug,
      device: item.device,
      version: item.version,
      schema: item.schema
    }));
  }

  function schemaBySlug(slug) {
    return listSchemas().find((item) => item.slug === slug) || null;
  }

  function normalizeHints(hints) {
    if (hints == null) return {};
    if (typeof hints === "string") return { deviceTypeName: hints };
    return hints;
  }

  function collapse(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/connected[_\s-]*(inventions|finland)/g, " ")
      .replace(/[^a-z0-9.]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function slugifyTokens(text) {
    return collapse(text).replace(/[.\s]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  }

  function parseRevision(text) {
    const raw = String(text || "");
    const dotted = raw.match(/r?\s*(\d+)\s*[._]\s*(\d+)/i);
    if (dotted) {
      const major = Number(dotted[1]);
      const minor = Number(dotted[2]);
      return {
        major,
        minor,
        label: `r${major}.${minor}`,
        slug: `r${major}_${minor}`,
        compact: `${major}_${minor}`
      };
    }
    const plain = raw.match(/(?:^|[^a-z0-9])r?\s*(\d+)(?![.\d])/i);
    if (plain) {
      const major = Number(plain[1]);
      return {
        major,
        minor: null,
        label: `r${major}`,
        slug: `r${major}`,
        compact: String(major)
      };
    }
    return null;
  }

  function familyKey(deviceName, slug) {
    if (slug) {
      return String(slug)
        .toLowerCase()
        .replace(/_r\d+(?:_\d+)?(?:_(?:sigfox|lorawan))?$/, "")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");
    }
    return slugifyTokens(deviceName)
      .replace(/_r\d+(?:_\d+)?(?:_(?:sigfox|lorawan))?$/, "")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
  }

  function aliasFamily(key) {
    const value = String(key || "");
    if (/ranger.*ix|ix.*ranger|airwits_ix/.test(value)) return "airwits_ix";
    if (/airwits_co2_plus|co2_plus/.test(value)) return "airwits_co2_plus";
    if (/airwits_co2|co2/.test(value) && !/plus/.test(value)) return "airwits_co2";
    if (/airwits_plus/.test(value)) return "airwits_plus";
    if (/airwits_pm|airwits pm/.test(value)) return "airwits_pm";
    if (/airwits_iaq|iaq/.test(value)) return "airwits_iaq";
    if (/airwits_tvoc|tvoc/.test(value)) return "airwits_tvoc";
    if (/multisense|multi_sense/.test(value)) return "airwits_multisense";
    if (/press.?guard/.test(value)) return "press_guard";
    if (/temp.?guard/.test(value)) return "temp_guard";
    if (/twin.?guard/.test(value)) return "twin_guard";
    if (/multi.?guard/.test(value)) return "multiguard";
    if (/flex.?sense/.test(value)) return "flex_sense";
    if (/detectify/.test(value)) return "detectify";
    if (/ecosense/.test(value)) return "ecosense";
    if (/^ranger$|ranger_r/.test(value)) return "ranger";
    if (/^airwits$|airwits_r/.test(value)) return "airwits";
    return value;
  }

  function stripNoise(text) {
    return String(text || "")
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/ig, " ")
      .replace(/\brnd\b/ig, " ")
      .replace(/\bconnected[_\s-]*(inventions|finland)\b/ig, " ");
  }

  function extractHint(text) {
    const cleaned = stripNoise(text);
    const collapsed = collapse(cleaned);
    const revisions = [];
    const versionRe = /\br?\s*\d+\s*[._]\s*\d+\b|\br\s*\d+\b/ig;
    let match;
    while ((match = versionRe.exec(collapsed))) {
      const parsed = parseRevision(match[0]);
      if (parsed) revisions.push(parsed);
    }
    const withoutVersions = collapsed.replace(versionRe, " ").replace(/\s+/g, " ").trim();
    const family = aliasFamily(slugifyTokens(withoutVersions));
    return { family, revisions, raw: collapsed };
  }

  function schemaMeta(item) {
    const family = aliasFamily(familyKey(item.device, item.slug));
    const revision = parseRevision(item.version) || parseRevision(item.slug);
    return { family, revision };
  }

  function revisionScore(hintRev, schemaRev) {
    if (!hintRev || !schemaRev) return 0;
    if (hintRev.slug === schemaRev.slug) return 12;
    if (hintRev.major === schemaRev.major && hintRev.minor != null && schemaRev.minor != null && hintRev.minor === schemaRev.minor) {
      return 12;
    }
    if (hintRev.major === schemaRev.major && (hintRev.minor == null || schemaRev.minor == null)) return 5;
    if (hintRev.major === schemaRev.major) return 2;
    return 0;
  }

  function expectedFirmware(schemaRev) {
    if (!schemaRev) return null;
    if (schemaRev.minor != null && schemaRev.minor <= 15) return schemaRev.minor;
    if (schemaRev.minor == null && schemaRev.major <= 15) return schemaRev.major;
    return null;
  }

  function fieldNumber(decoded, name) {
    const hit = (decoded?.fields || []).find((item) => item.name === name);
    if (hit && Number.isFinite(hit.number)) return hit.number;
    const raw = decoded?.values?.[name];
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }

  function saneFieldScore(decoded) {
    let score = 0;
    for (const item of decoded.fields || []) {
      const n = item.number;
      if (!Number.isFinite(n)) continue;
      const name = String(item.name || "").toLowerCase();
      if (name.includes("temp") && n >= -40 && n <= 85) score += 0.15;
      if ((name.includes("humid") || name === "rh") && n >= 0 && n <= 100) score += 0.15;
      if (name.includes("co2") && n >= 0 && n <= 10000) score += 0.2;
      if ((name.includes("vdd") || name.includes("battery") || name.includes("voltage")) && n >= 1.5 && n <= 5.5) score += 0.15;
    }
    return Math.min(2, score);
  }

  function scoreMessages(item, sample, insightVersion) {
    if (!sample.length) return { score: 0, detail: "no-sample" };
    const meta = schemaMeta(item);
    const expected = expectedFirmware(meta.revision);
    let ok = 0;
    let firmwareHits = 0;
    let firmwareMatch = 0;
    let sanity = 0;
    const versions = [];
    for (const msg of sample) {
      const decoded = decodeUplink(item.schema, msg.hex);
      if (!decoded || decoded.error || !decoded.fields.length) continue;
      ok += 1;
      sanity += saneFieldScore(decoded);
      const fw = fieldNumber(decoded, "firmware_version");
      if (fw != null) {
        firmwareHits += 1;
        versions.push(fw);
        if (expected != null && fw === expected) firmwareMatch += 1;
      }
    }
    const decodeRate = ok / sample.length;
    let score = decodeRate * 8;
    score += Math.min(2, sanity);
    if (firmwareHits) {
      const mode = modeNumber(versions);
      const stable = versions.filter((value) => value === mode).length / firmwareHits;
      score += stable * 2;
      if (expected != null) {
        const matchRate = firmwareMatch / firmwareHits;
        score += matchRate * 10;
        if (matchRate < 0.35) score -= 6;
      }
    }
    if (insightVersion != null && expected != null) {
      if (Number(insightVersion) === expected) score += 6;
      else score -= 2;
    }
    if (decodeRate < 0.25) score -= 8;
    return { score, detail: `decode=${ok}/${sample.length}` };
  }

  function modeNumber(values) {
    const counts = new Map();
    for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
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

  function bestRevisionScore(revisions, schemaRev) {
    let best = 0;
    for (const rev of revisions || []) best = Math.max(best, revisionScore(rev, schemaRev));
    return best;
  }

  function scoreParser(item, parserModel, parserRevision) {
    if (!parserModel && !parserRevision) return 0;
    const hint = extractHint(`${parserModel || ""} ${parserRevision || ""}`);
    const meta = schemaMeta(item);
    let score = 0;
    if (hint.family && hint.family === meta.family) score += 28;
    else if (hint.family && meta.family.includes(hint.family)) score += 16;
    else if (hint.family && hint.family.includes(meta.family)) score += 12;
    const revisions = hint.revisions.slice();
    if (parserRevision) {
      const explicit = parseRevision(parserRevision);
      if (explicit) revisions.push(explicit);
    }
    score += bestRevisionScore(revisions, meta.revision);
    return score;
  }

  function scoreDeviceType(item, deviceTypeName) {
    if (!deviceTypeName) return 0;
    const hint = extractHint(deviceTypeName);
    const meta = schemaMeta(item);
    let score = 0;
    if (hint.family && hint.family === meta.family) score += 14;
    else if (hint.family && (meta.family.includes(hint.family) || hint.family.includes(meta.family))) score += 8;
    else {
      const deviceSlug = slugifyTokens(item.device);
      if (hint.raw && collapse(item.device) && hint.raw.includes(collapse(item.device))) score += 6;
      else if (deviceSlug && slugifyTokens(deviceTypeName).includes(deviceSlug)) score += 4;
    }
    score += bestRevisionScore(hint.revisions, meta.revision);
    return score;
  }

  function suggestSchema(messages, hints) {
    const options = normalizeHints(hints);
    const schemas = listSchemas();
    const sample = (messages || []).filter((msg) => msg.kind === "uplink" && msg.hex).slice(0, 16);
    if (!schemas.length) return null;
    if (!sample.length && !options.parserModel && !options.deviceTypeName) return null;

    let best = null;
    for (const item of schemas) {
      const parserScore = scoreParser(item, options.parserModel, options.parserRevision);
      const typeScore = scoreDeviceType(item, options.deviceTypeName);
      const message = scoreMessages(item, sample, options.insightVersion);
      const score = parserScore + typeScore + message.score;
      if (!best || score > best.score) {
        best = {
          ...item,
          score,
          reasons: {
            parser: parserScore,
            deviceType: typeScore,
            messages: message.score,
            detail: message.detail
          }
        };
      }
    }
    if (!best || best.score < 6) return null;
    return best;
  }

  function decodeAll(messages, schema) {
    return (messages || []).map((msg) => ({
      ...msg,
      decoded: decodeMessage(msg, schema)
    }));
  }

  window.deviceInspectorDecode = {
    listSchemas,
    schemaBySlug,
    suggestSchema,
    decodeAll,
    decodeMessage
  };
})();
