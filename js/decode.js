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
      return { variant: variant.name || "", error: "", fields };
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

  function suggestSchema(messages, deviceTypeName) {
    const schemas = listSchemas();
    const sample = (messages || []).filter((msg) => msg.kind === "uplink" && msg.hex).slice(0, 12);
    if (!sample.length || !schemas.length) return null;
    const hint = String(deviceTypeName || "").toLowerCase();
    let best = null;
    for (const item of schemas) {
      let score = 0;
      for (const msg of sample) {
        const decoded = decodeUplink(item.schema, msg.hex);
        if (decoded && !decoded.error && decoded.fields.length) score += 1;
      }
      if (hint && hint.includes(String(item.device || "").toLowerCase())) score += 3;
      if (/ranger[_-]?ix/.test(hint) && String(item.slug).startsWith("airwits_ix_")) {
        score += 8;
        const version = String(item.version || "").toLowerCase().replace(/\s/g, "");
        if (version && hint.includes(version.replace(".", "_")) || (version && hint.includes(version))) score += 4;
      }
      if (!best || score > best.score) best = { ...item, score };
    }
    return best && best.score > 0 ? best : null;
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
