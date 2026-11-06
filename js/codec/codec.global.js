(function () {
  const TYPE_BYTES = {
    bool: 1,
    u8: 1,
    i8: 1,
    u16: 2,
    i16: 2,
    u32: 4,
    i32: 4
  };

  function toSigned(value, bits) {
    const sign = 1 << (bits - 1);
    return value & sign ? value - (1 << bits) : value;
  }

  function normalizeHex(input) {
    return String(input || "")
      .replace(/0x/gi, "")
      .replace(/[^0-9a-fA-F]/g, "");
  }

  function hexToBytes(input) {
    const hex = normalizeHex(input);
    if (!hex) return new Uint8Array(0);
    if (hex.length % 2 !== 0) {
      throw new Error("Hex payload must contain an even number of characters.");
    }
    const result = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      result[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16);
    }
    return result;
  }

  function bytesToHex(bytes) {
    return Array.from(bytes, (item) => item.toString(16).padStart(2, "0")).join("").toUpperCase();
  }

  function byteLengthForType(field) {
    if (field.type === "bytes") return Number(field.length || 0);
    const size = TYPE_BYTES[field.type];
    if (!size) throw new Error(`Unsupported field type "${field.type}".`);
    return size;
  }

  function resolveFieldLayouts(fields) {
    let cursor = 0;
    return fields.map((field) => {
      const hasBitLayout = Number.isInteger(field.bit) && Number.isInteger(field.bits);
      if (hasBitLayout) {
        const resolvedByte = Number.isInteger(field.byte) ? field.byte : cursor;
        const end = resolvedByte + Math.max(1, Math.ceil((field.bit + field.bits) / 8));
        cursor = Math.max(cursor, end);
        return { ...field, _resolvedByte: resolvedByte, _resolvedOffset: null, _resolvedEnd: end };
      }
      const byteLen = byteLengthForType(field);
      const offset = Number.isInteger(field.byte) ? field.byte : cursor;
      const end = offset + byteLen;
      cursor = Math.max(cursor, end);
      return { ...field, _resolvedByte: null, _resolvedOffset: offset, _resolvedEnd: end };
    });
  }

  function readUnsigned(bytes, offset, length, endian) {
    let value = 0;
    if (endian === "little") {
      for (let i = 0; i < length; i += 1) value |= bytes[offset + i] << (8 * i);
      return value >>> 0;
    }
    for (let i = 0; i < length; i += 1) value = (value << 8) | bytes[offset + i];
    return value >>> 0;
  }

  function writeUnsigned(bytes, offset, length, endian, value) {
    if (endian === "little") {
      for (let i = 0; i < length; i += 1) bytes[offset + i] = (value >> (8 * i)) & 0xff;
      return;
    }
    for (let i = 0; i < length; i += 1) {
      const shift = 8 * (length - 1 - i);
      bytes[offset + i] = (value >> shift) & 0xff;
    }
  }

  function isOptionalField(field) {
    return field.optional === true;
  }

  function optionalFieldFitsInPayload(field, bytesLength) {
    if (field._resolvedByte != null) {
      const end = field._resolvedEnd ?? 0;
      return end <= bytesLength;
    }
    const len = byteLengthForType(field);
    return field._resolvedOffset + len <= bytesLength;
  }

  function readPrimitive(bytes, field, offset, endian) {
    if (field.type === "bytes") {
      const length = Number(field.length || 0);
      if (offset + length > bytes.length) throw new Error(`Field "${field.name}" extends past payload length.`);
      return bytes.slice(offset, offset + length);
    }
    const length = byteLengthForType(field);
    if (offset + length > bytes.length) throw new Error(`Field "${field.name}" extends past payload length.`);
    let raw = readUnsigned(bytes, offset, length, endian);
    if (field.type === "i8") raw = toSigned(raw, 8);
    if (field.type === "i16") raw = toSigned(raw, 16);
    if (field.type === "i32") raw = toSigned(raw, 32);
    return raw;
  }

  function writePrimitive(bytes, field, offset, endian, raw) {
    if (field.type === "bytes") {
      if (!(raw instanceof Uint8Array)) throw new Error(`Field "${field.name}" requires bytes input.`);
      const expected = Number(field.length || 0);
      if (raw.length !== expected) throw new Error(`Field "${field.name}" expects ${expected} bytes, got ${raw.length}.`);
      bytes.set(raw, offset);
      return;
    }
    const length = byteLengthForType(field);
    let normalized = raw;
    if (field.type === "bool") normalized = raw ? 1 : 0;
    writeUnsigned(bytes, offset, length, endian, normalized >>> 0);
  }

  function bitFieldSpanBytes(bit, bits) {
    return Math.max(1, Math.ceil((bit + bits) / 8));
  }

  // Bit fields are packed MSB-first (big-endian): the bytes from startByte over
  // the field's span form a big-endian integer, and `bit` is the field's offset
  // from the least-significant end of that integer. For single-byte fields this
  // is identical to a plain (byteValue >> bit) & mask extraction. Arithmetic
  // (not bitwise) operators are used so fields wider than 31 bits stay correct.
  function extractBits(bytes, startByte, bit, bits) {
    const span = bitFieldSpanBytes(bit, bits);
    let acc = 0;
    for (let i = 0; i < span; i += 1) {
      acc = acc * 256 + (bytes[startByte + i] & 0xff);
    }
    return Math.floor(acc / 2 ** bit) % 2 ** bits;
  }

  function setBits(bytes, startByte, bit, bits, value) {
    const span = bitFieldSpanBytes(bit, bits);
    let acc = 0;
    for (let i = 0; i < span; i += 1) {
      acc = acc * 256 + (bytes[startByte + i] & 0xff);
    }
    const high = Math.floor(acc / 2 ** (bit + bits));
    const low = acc % 2 ** bit;
    const field = ((value % 2 ** bits) + 2 ** bits) % 2 ** bits;
    acc = high * 2 ** (bit + bits) + field * 2 ** bit + low;
    for (let i = span - 1; i >= 0; i -= 1) {
      bytes[startByte + i] = acc % 256;
      acc = Math.floor(acc / 256);
    }
  }

  function parsePossibleHexNumber(value) {
    if (typeof value === "string" && /^0x/i.test(value)) return Number.parseInt(value, 16);
    return Number(value);
  }

  function applyScaling(raw, field) {
    if (field.type === "bytes") return bytesToHex(raw);
    const add = Number(field.add || 0);
    const mult = Number(field.mult || 1);
    const div = field.div == null ? null : Number(field.div);
    let value = (raw + add) * mult;
    if (div != null) value /= div;
    if (field.type === "bool") return Boolean(raw);
    return value;
  }

  function unscaleValue(inputValue, field) {
    if (field.type === "bytes") return hexToBytes(inputValue);
    if (field.type === "bool") return inputValue ? 1 : 0;
    const numericValue = Number(inputValue);
    if (Number.isNaN(numericValue)) throw new Error(`Field "${field.name}" requires a numeric value.`);
    const add = Number(field.add || 0);
    const mult = Number(field.mult || 1);
    const div = field.div == null ? null : Number(field.div);
    if (mult === 0) throw new Error(`Field "${field.name}" cannot use mult=0 when encoding.`);
    let raw = numericValue;
    if (div != null) raw *= div;
    raw /= mult;
    raw -= add;
    return Math.round(raw);
  }

  function trySentinelDecode(raw, field) {
    if (!Array.isArray(field.sentinel_values)) return null;
    let alternativeRaw = null;
    if (field.type === "i8") alternativeRaw = raw & 0xff;
    if (field.type === "i16") alternativeRaw = raw & 0xffff;
    if (field.type === "i32") alternativeRaw = raw >>> 0;
    for (const sentinel of field.sentinel_values) {
      const sentinelRaw = parsePossibleHexNumber(sentinel.raw);
      if (raw === sentinelRaw || alternativeRaw === sentinelRaw) {
        return {
          value: sentinel.output === undefined ? null : sentinel.output,
          sentinel: { meaning: sentinel.meaning || "sentinel", raw: sentinel.raw }
        };
      }
    }
    return null;
  }

  function trySentinelEncode(value, field) {
    if (!Array.isArray(field.sentinel_values)) return null;
    for (const sentinel of field.sentinel_values) {
      const sentinelOutput = sentinel.output === undefined ? null : sentinel.output;
      if (value === sentinelOutput) return parsePossibleHexNumber(sentinel.raw);
    }
    return null;
  }

  function checkValidValues(raw, field) {
    if (!Array.isArray(field.valid_values) || field.valid_values.length === 0) return;
    if (!field.valid_values.includes(raw)) {
      throw new Error(`Field "${field.name}" has invalid raw value ${raw}.`);
    }
  }

  function rawRangeForField(field) {
    if (Number.isInteger(field.bits) && field.bits > 0) {
      if (field.type && field.type.startsWith("i")) {
        return { min: -(2 ** (field.bits - 1)), max: (2 ** (field.bits - 1)) - 1 };
      }
      return { min: 0, max: (2 ** field.bits) - 1 };
    }
    const byType = {
      u8: { min: 0, max: 255 },
      i8: { min: -128, max: 127 },
      u16: { min: 0, max: 65535 },
      i16: { min: -32768, max: 32767 },
      u32: { min: 0, max: 4294967295 },
      i32: { min: -2147483648, max: 2147483647 }
    };
    return byType[field.type] || null;
  }

  function checkRawRange(raw, field) {
    if (field.type === "bytes") return;
    if (!Number.isFinite(raw)) throw new Error(`Field "${field.name}" must be a finite number.`);
    const range = rawRangeForField(field);
    if (!range) return;
    if (raw < range.min || raw > range.max) {
      throw new Error(`Field "${field.name}" raw value ${raw} is out of range ${range.min}..${range.max}.`);
    }
  }

  function normalizeRawInputValue(inputValue, field) {
    if (field.type === "bytes") {
      return hexToBytes(inputValue);
    }
    if (field.type === "bool") {
      if (typeof inputValue === "boolean") return inputValue ? 1 : 0;
      const numeric = Number(inputValue);
      if (!Number.isFinite(numeric)) {
        throw new Error(`Field "${field.name}" requires raw value 0 or 1.`);
      }
      return numeric === 0 ? 0 : 1;
    }
    const numeric = Number(inputValue);
    if (!Number.isFinite(numeric)) {
      throw new Error(`Field "${field.name}" requires a numeric raw value.`);
    }
    return Math.round(numeric);
  }

  function toDisplayRawValue(raw, field) {
    if (field.type === "bytes") return bytesToHex(raw);
    return raw;
  }

  function isReservedField(field) {
    const name = String(field?.name || "").toLowerCase();
    const description = String(field?.description || "").toLowerCase();
    return name.includes("reserved") || description.startsWith("reserved");
  }

  function reservedZeroValue(field) {
    if (field.type === "bytes") {
      const length = Number(field.length || 0);
      return "00".repeat(Math.max(0, length));
    }
    if (field.type === "bool") return false;
    return 0;
  }

  function resolveEncodeInputValue(values, field) {
    if (field.fixed_value !== undefined) {
      if (field.type === "bytes" && Number(field.fixed_value) === 0) {
        return reservedZeroValue(field);
      }
      return field.fixed_value;
    }
    if (Object.prototype.hasOwnProperty.call(values, field.name) && values[field.name] !== undefined) {
      return values[field.name];
    }
    if (field.default_value !== undefined) {
      if (field.type === "bytes" && Number(field.default_value) === 0) {
        return reservedZeroValue(field);
      }
      return field.default_value;
    }
    if (isReservedField(field)) return reservedZeroValue(field);
    return undefined;
  }

  function evaluateCondition(bytes, condition) {
    if (!condition) return true;
    const extracted = extractBits(bytes, condition.byte, condition.bit, condition.bits);
    return extracted === condition.value;
  }

  function pickUplinkPayload(schema, bytes) {
    const payloadBytes = typeof bytes === "string" ? hexToBytes(bytes) : bytes;
    const payloads = schema?.uplink?.payloads || [];
    for (const payload of payloads) {
      const expectedLength = Number.isInteger(payload.payload_length) ? payload.payload_length : payload.length;
      if (Number.isInteger(expectedLength) && payloadBytes.length !== expectedLength) continue;
      if (!evaluateCondition(payloadBytes, payload.discriminator)) continue;
      if (!evaluateCondition(payloadBytes, payload.discriminator_function)) continue;
      return payload;
    }
    return null;
  }

  function decodeVariant(schema, variant, hexInput) {
    const endian = schema.endian || "big";
    const bytes = typeof hexInput === "string" ? hexToBytes(hexInput) : hexInput;
    const fields = resolveFieldLayouts(variant.fields || []);
    const output = {};
    for (const field of fields) {
      if (isReservedField(field)) {
        continue;
      }
      if (isOptionalField(field) && !optionalFieldFitsInPayload(field, bytes.length)) {
        continue;
      }
      let raw;
      if (field._resolvedByte != null) {
        raw = extractBits(bytes, field._resolvedByte, field.bit, field.bits);
      } else {
        raw = readPrimitive(bytes, field, field._resolvedOffset, endian);
      }
      if (field.type !== "bytes") {
        const sentinelResult = trySentinelDecode(raw, field);
        if (sentinelResult) {
          output[`${field.name}__meta`] = sentinelResult.sentinel;
        }
      }
      output[field.name] = toDisplayRawValue(raw, field);
    }
    return output;
  }

  function computeOutputLength(variant, values) {
    const fields = resolveFieldLayouts(variant.fields || []);
    return fields.reduce((max, field) => {
      if (isOptionalField(field)) {
        const v = resolveEncodeInputValue(values, field);
        if (v === undefined) return max;
      }
      return Math.max(max, field._resolvedEnd || 0);
    }, 0);
  }

  function encodeVariant(schema, variant, values) {
    const endian = schema.endian || "big";
    const fields = resolveFieldLayouts(variant.fields || []);
    const bytes = new Uint8Array(computeOutputLength(variant, values));
    for (const field of fields) {
      const value = resolveEncodeInputValue(values, field);
      if (value === undefined) continue;
      if (field._resolvedByte != null) {
        let raw = trySentinelEncode(value, field);
        if (raw == null) raw = normalizeRawInputValue(value, field);
        checkRawRange(raw, field);
        checkValidValues(raw, field);
        setBits(bytes, field._resolvedByte, field.bit, field.bits, raw);
        continue;
      }
      let raw = trySentinelEncode(value, field);
      if (raw == null) raw = normalizeRawInputValue(value, field);
      checkRawRange(raw, field);
      checkValidValues(raw, field);
      writePrimitive(bytes, field, field._resolvedOffset, endian, raw);
    }
    return bytesToHex(bytes);
  }

  window.payloadToolCodec = {
    hexToBytes,
    bytesToHex,
    pickUplinkPayload,
    decodeVariant,
    encodeVariant
  };
})();
