window.payloadSchemas = {
  "generated_at": "2026-11-09T14:57:01.329Z",
  "build_info": {
    "build_date_iso": "2026-11-09T14:57:01.329Z",
    "build_date_display": "09-11-2026",
    "git_commit_short": "d34ab18"
  },
  "source_paths": {
    "index": "payload_descriptions/index.yaml",
    "descriptions": "payload_descriptions/*.yaml"
  },
  "docs": {
    "readme_excerpt": "# Payload descriptions for IoT devices\n\nMachine-readable payload descriptions for supported device versions. Each YAML defines **uplink** and **downlink** (where applicable) with bit- and byte-level layout so parsers can be generated or verified.\n\n- **One file per device version:** `<slug>.yaml` (e.g. `airwits_r2.yaml`, `airwits_co2_r8_4.yaml`).\n- **Index:** `index.yaml` lists all supported versio",
    "parser_guide_excerpt": "# Guide: Creating a parser from payload description YAMLs\r\n\r\nThis document describes how to build a **decoder** (and optionally encoder) for device payloads using the YAML description files in this folder. It covers how to interpret discriminators and how to apply field scaling (`add`, `div`, `mult`).\r\n\r\n---\r\n\r\n## 1. Overview\r\n\r\n- Each YAML describes **one device version** (e.g. `airwits_r5_2`).\r\n"
  },
  "device_versions": [
    {
      "slug": "airwits_r2",
      "device": "Airwits",
      "version": "R2",
      "note": "",
      "schema": {
        "name": "airwits_r2",
        "device": "Airwits",
        "device_version": "R2",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits R2/R3 uplink only; simple temp + humidity.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "description": "Only message type; no header byte.",
              "fields": [
                {
                  "name": "temperature",
                  "byte": 0,
                  "type": "i16",
                  "add": -400,
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. value = (raw - 400) / 10 °C."
                },
                {
                  "name": "humidity",
                  "byte": 2,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": []
        }
      }
    },
    {
      "slug": "airwits_r3",
      "device": "Airwits",
      "version": "R3",
      "note": "",
      "schema": {
        "name": "airwits_r3",
        "device": "Airwits",
        "device_version": "R3",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits R3 uplink and downlink.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "description": "Only message type; no system messages.",
              "fields": [
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "scheduler_on",
                  "byte": 0,
                  "bit": 1,
                  "bits": 1,
                  "type": "bool",
                  "description": "Scheduler enabled. 0=off, 1=on."
                },
                {
                  "name": "full_tx_power_on",
                  "byte": 0,
                  "bit": 2,
                  "bits": 1,
                  "type": "bool",
                  "description": "Full transmit power. 0=off, 1=on."
                },
                {
                  "name": "power_control_on",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Power control enabled. 0=off, 1=on."
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble (4 bits)."
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "add": -400,
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. value = (raw - 400) / 10 °C."
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "timezone",
                  "byte": 0,
                  "bit": 0,
                  "bits": 5,
                  "type": "u8",
                  "description": "0..12=UTC+0..+12, 13..23=UTC-11..-1."
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 5,
                  "bits": 1,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "power_ctrl_on",
                  "byte": 0,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "Power control. 0=disabled, 1=enabled."
                },
                {
                  "name": "reconfigure",
                  "byte": 0,
                  "bit": 7,
                  "bits": 1,
                  "type": "bool",
                  "description": "Apply config. 0=ignore, 1=apply."
                },
                {
                  "name": "timestamp",
                  "byte": 1,
                  "type": "u32",
                  "unit": "s",
                  "description": "Unix epoch timestamp."
                },
                {
                  "name": "disabled_wkend",
                  "byte": 5,
                  "bit": 0,
                  "bits": 1,
                  "type": "bool",
                  "description": "Weekend disabled. 0=enabled, 1=disabled."
                },
                {
                  "name": "active_hours_idx",
                  "byte": 5,
                  "bit": 1,
                  "bits": 3,
                  "type": "u8",
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "00_24"
                    },
                    {
                      "value": 1,
                      "label": "06_18"
                    },
                    {
                      "value": 2,
                      "label": "06_21"
                    },
                    {
                      "value": 3,
                      "label": "08_16"
                    },
                    {
                      "value": 4,
                      "label": "08_18"
                    },
                    {
                      "value": 5,
                      "label": "08_22"
                    },
                    {
                      "value": 6,
                      "label": "09_24"
                    },
                    {
                      "value": 7,
                      "label": "22_06"
                    }
                  ],
                  "description": "Active hours preset index. See enum."
                },
                {
                  "name": "update_interval_idx",
                  "byte": 5,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "10_min"
                    },
                    {
                      "value": 1,
                      "label": "15_min"
                    },
                    {
                      "value": 2,
                      "label": "20_min"
                    },
                    {
                      "value": 3,
                      "label": "25_min"
                    },
                    {
                      "value": 4,
                      "label": "30_min"
                    },
                    {
                      "value": 5,
                      "label": "45_min"
                    },
                    {
                      "value": 6,
                      "label": "60_min"
                    },
                    {
                      "value": 7,
                      "label": "90_min"
                    },
                    {
                      "value": 8,
                      "label": "120_min"
                    },
                    {
                      "value": 9,
                      "label": "180_min"
                    },
                    {
                      "value": 10,
                      "label": "240_min"
                    },
                    {
                      "value": 11,
                      "label": "360_min"
                    },
                    {
                      "value": 12,
                      "label": "480_min"
                    },
                    {
                      "value": 13,
                      "label": "600_min"
                    },
                    {
                      "value": 14,
                      "label": "720_min"
                    },
                    {
                      "value": 15,
                      "label": "1440_min"
                    }
                  ],
                  "description": "Update interval index. See enum."
                },
                {
                  "name": "device_conf",
                  "byte": 6,
                  "type": "u16",
                  "description": "Bit0 must be set to 1 or the device ignores this downlink."
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_r4_1",
      "device": "Airwits",
      "version": "R4.1",
      "note": "",
      "schema": {
        "name": "airwits_r4_1",
        "device": "Airwits",
        "device_version": "R4.1",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits R4.1 uplink (header + temp + humidity).",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "fields": [
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble (4 bits)."
                },
                {
                  "name": "power_control",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Power control. 0=disabled, 1=enabled."
                },
                {
                  "name": "current_tx_power",
                  "byte": 0,
                  "bit": 2,
                  "bits": 1,
                  "type": "bool",
                  "description": "Current TX power. 0=reduced, 1=high."
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "add": -400,
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. value = (raw - 400) / 10 °C."
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "reconfigure",
                  "byte": 0,
                  "bit": 7,
                  "bits": 1,
                  "type": "bool",
                  "description": "Reconfigure flag. 0=no, 1=yes.",
                  "default_value": 1
                },
                {
                  "name": "power_control",
                  "byte": 0,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "Power control. 0=disabled, 1=enabled.",
                  "default_value": 1
                },
                {
                  "name": "sampling_interval",
                  "byte": 1,
                  "type": "u8",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "description": "Uplink interval. Decoded as (raw+2)*5 min.",
                  "default_value": 4
                },
                {
                  "name": "reserved",
                  "byte": 2,
                  "type": "bytes",
                  "length": 6,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_r5_1",
      "device": "Airwits",
      "version": "R5.1",
      "note": "Same payload as R4.1; difference is larger battery.",
      "schema": {
        "name": "airwits_r5_1",
        "device": "Airwits",
        "device_version": "R5.1",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits R5.1 uses the same payload format as R4.1.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "fields": [
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble (4 bits)."
                },
                {
                  "name": "power_control",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Power control. 0=disabled, 1=enabled."
                },
                {
                  "name": "current_tx_power",
                  "byte": 0,
                  "bit": 2,
                  "bits": 1,
                  "type": "bool",
                  "description": "Current TX power. 0=reduced, 1=high."
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "add": -400,
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. value = (raw - 400) / 10 °C."
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "reconfigure",
                  "byte": 0,
                  "bit": 7,
                  "bits": 1,
                  "type": "bool",
                  "description": "Reconfigure flag. 0=no, 1=yes.",
                  "default_value": 1
                },
                {
                  "name": "power_control",
                  "byte": 0,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "Power control. 0=disabled, 1=enabled.",
                  "default_value": 1
                },
                {
                  "name": "sampling_interval",
                  "byte": 1,
                  "type": "u8",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "description": "Uplink interval. Decoded as (raw+2)*5 min.",
                  "default_value": 4
                },
                {
                  "name": "reserved",
                  "byte": 2,
                  "type": "bytes",
                  "length": 6,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_r5_2",
      "device": "Airwits",
      "version": "R5.2",
      "note": "",
      "schema": {
        "name": "airwits_r5_2",
        "device": "Airwits",
        "device_version": "R5.2",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits R5.2 uplink and downlink.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble (4 bits)."
                },
                {
                  "name": "txp_reduct",
                  "byte": 0,
                  "bit": 1,
                  "bits": 2,
                  "type": "u8",
                  "description": "TX power class [0=0dB, 1=1dB, 2=3dB, 3=6dB]."
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. value = raw / 10 °C."
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %."
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "txp_reduct",
                  "byte": 0,
                  "bit": 5,
                  "bits": 2,
                  "type": "u8",
                  "description": "ETSI only transmit power setting [0=0dB, 1=1dB, 2=auto-3dB, 3=auto-6dB]",
                  "valid_values": [
                    0,
                    1,
                    2,
                    3
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "0 dB"
                    },
                    {
                      "value": 1,
                      "label": "1 dB"
                    },
                    {
                      "value": 2,
                      "label": "Auto 3 dB"
                    },
                    {
                      "value": 3,
                      "label": "Auto 6 dB"
                    }
                  ],
                  "default_value": 1
                },
                {
                  "name": "sampling_interval",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sampling interval. Decoded as (raw + 2) * 5 min.",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "default_value": 4
                },
                {
                  "name": "reserved",
                  "byte": 2,
                  "type": "bytes",
                  "length": 6,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_r5_3",
      "device": "Airwits",
      "version": "R5.3",
      "note": "",
      "schema": {
        "name": "airwits_r5_3",
        "device": "Airwits",
        "device_version": "R5.3",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits R5.3; measurement like R5.2 with optional history, plus Sys0/Sys1.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble (4 bits)."
                },
                {
                  "name": "txp_reduct",
                  "byte": 0,
                  "bit": 1,
                  "bits": 2,
                  "type": "u8",
                  "description": "TX power class [0=0dB, 1=1dB, 2=3dB, 3=6dB]."
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. value = raw / 10 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "temperature_history1",
                  "byte": 4,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Historical temperature sample 1. value = raw / 10 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity_history1",
                  "byte": 6,
                  "type": "u8",
                  "unit": "%",
                  "description": "Historical humidity sample 1 in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "temperature_history2",
                  "byte": 7,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Historical temperature sample 2. value = raw / 10 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity_history2",
                  "byte": 9,
                  "type": "u8",
                  "unit": "%",
                  "description": "Historical humidity sample 2 in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "interval_m",
                  "byte": 10,
                  "type": "u8",
                  "description": "Duration of multi-measure window (units TBD)."
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "txp_reduct",
                  "byte": 0,
                  "bit": 5,
                  "bits": 2,
                  "type": "u8",
                  "description": "ETSI only transmit power setting [0=0dB, 1=1dB, 2=auto-3dB, 3=auto-6dB]",
                  "valid_values": [
                    0,
                    1,
                    2,
                    3
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "0 dB"
                    },
                    {
                      "value": 1,
                      "label": "1 dB"
                    },
                    {
                      "value": 2,
                      "label": "Auto 3 dB"
                    },
                    {
                      "value": 3,
                      "label": "Auto 6 dB"
                    }
                  ],
                  "default_value": 1
                },
                {
                  "name": "mm_mode",
                  "byte": 0,
                  "bit": 4,
                  "bits": 1,
                  "type": "bool",
                  "description": "Multi-measure mode. 0=off, 1=on.",
                  "default_value": false
                },
                {
                  "name": "sampling_interval",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sampling interval code.",
                  "default_value": 4
                },
                {
                  "name": "reserved",
                  "byte": 2,
                  "type": "bytes",
                  "length": 6,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_r6_4",
      "device": "Airwits",
      "version": "R6.4",
      "note": "",
      "schema": {
        "name": "airwits_r6_4",
        "device": "Airwits",
        "device_version": "R6.4",
        "radio_technologies": [
          "Sigfox",
          "LoRaWAN"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits R6.4; uplink like R5.3, downlink with mm mode.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "payload_length": 4,
              "description": "Single-sample measurement (4 bytes total).",
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble (4 bits)."
                },
                {
                  "name": "txp_reduct",
                  "byte": 0,
                  "bit": 1,
                  "bits": 2,
                  "type": "u8",
                  "description": "TX power class [0=0dB, 1=1dB, 2=3dB, 3=6dB]."
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. value = raw / 10 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                }
              ]
            },
            {
              "name": "measurement_time_series",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "payload_length": 11,
              "description": "Time-series measurement (11 bytes): current + 2 historical samples and interval.",
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble (4 bits)."
                },
                {
                  "name": "txp_reduct",
                  "byte": 0,
                  "bit": 1,
                  "bits": 2,
                  "type": "u8",
                  "description": "TX power class [0=0dB, 1=1dB, 2=3dB, 3=6dB]."
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. value = raw / 10 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "temperature_history1",
                  "byte": 4,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Historical temperature sample 1. value = raw / 10 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity_history1",
                  "byte": 6,
                  "type": "u8",
                  "unit": "%",
                  "description": "Historical humidity sample 1 in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "temperature_history2",
                  "byte": 7,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Historical temperature sample 2. value = raw / 10 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity_history2",
                  "byte": 9,
                  "type": "u8",
                  "unit": "%",
                  "description": "Historical humidity sample 2 in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "interval_m",
                  "byte": 10,
                  "type": "u8",
                  "description": "Duration of multi-measure window (units TBD)."
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "txp_reduct",
                  "byte": 0,
                  "bit": 5,
                  "bits": 2,
                  "type": "u8",
                  "description": "ETSI only transmit power setting [0=0dB, 1=1dB, 2=auto-3dB, 3=auto-6dB]",
                  "valid_values": [
                    0,
                    1,
                    2,
                    3
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "0 dB"
                    },
                    {
                      "value": 1,
                      "label": "1 dB"
                    },
                    {
                      "value": 2,
                      "label": "Auto 3 dB"
                    },
                    {
                      "value": 3,
                      "label": "Auto 6 dB"
                    }
                  ],
                  "default_value": 1
                },
                {
                  "name": "mm_mode",
                  "byte": 0,
                  "bit": 4,
                  "bits": 1,
                  "type": "bool",
                  "description": "Multi-measure mode. 0=off, 1=on.",
                  "default_value": false
                },
                {
                  "name": "sampling_interval",
                  "byte": 1,
                  "type": "u8",
                  "description": "When multi-measure is 0 then sample/send interval is ((raw + 2) x 5). When multi-measure is 1 then raw>=4, sample interval is (raw) and send in every 3 samples.",
                  "default_value": 4
                },
                {
                  "name": "reserved",
                  "byte": 2,
                  "type": "bytes",
                  "length": 6,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_r7_5",
      "device": "Airwits",
      "version": "R7.5",
      "note": "Airwits Sigfox R7.5; same payload as iX Sigfox R1.5.",
      "schema": {
        "name": "airwits_r7_5",
        "device": "Airwits",
        "device_version": "R7.5",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits Sigfox R7.5.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "description": "Single-sample measurement, 4 bytes. Discriminator byte 0 bit 3 = 0.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "length": 4,
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble (4 bits)."
                },
                {
                  "name": "tx_power_reduced",
                  "byte": 0,
                  "bit": 2,
                  "bits": 1,
                  "type": "bool",
                  "description": "Reduced transmit power. 0=full, 1=reduced."
                },
                {
                  "name": "tx_bitrate_600",
                  "byte": 0,
                  "bit": 1,
                  "bits": 1,
                  "type": "bool",
                  "description": "Bitrate mode. 0=100bps, 1=600bps."
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. value = raw / 10 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                }
              ]
            },
            {
              "name": "measurement_time_series",
              "description": "Time-series measurement, 11 bytes. Discriminator byte 0 bit 3 = 0.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "length": 11,
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble (4 bits)."
                },
                {
                  "name": "tx_power_reduced",
                  "byte": 0,
                  "bit": 2,
                  "bits": 1,
                  "type": "bool",
                  "description": "Reduced transmit power. 0=full, 1=reduced."
                },
                {
                  "name": "tx_bitrate_600",
                  "byte": 0,
                  "bit": 1,
                  "bits": 1,
                  "type": "bool",
                  "description": "Bitrate mode. 0=100bps, 1=600bps."
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. value = raw / 10 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "temp_history1",
                  "byte": 4,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Historical temperature sample 1. value = raw / 10 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity_history1",
                  "byte": 6,
                  "type": "u8",
                  "unit": "%",
                  "description": "Historical humidity sample 1 in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "temp_history2",
                  "byte": 7,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Historical temperature sample 2. value = raw / 10 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity_history2",
                  "byte": 9,
                  "type": "u8",
                  "unit": "%",
                  "description": "Historical humidity sample 2 in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "interval_m",
                  "byte": 10,
                  "type": "u8",
                  "unit": "min",
                  "description": "Interval between time-series samples in min."
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "txp_reduction",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Transmit power reduction in dB (0dB-7dB).",
                  "default_value": 0
                },
                {
                  "name": "bitrate",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "u8",
                  "description": "Bitrate mode. 0=100bps, 1=600bps.",
                  "valid_values": [
                    0,
                    1
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "100bps"
                    },
                    {
                      "value": 1,
                      "label": "600bps"
                    }
                  ],
                  "default_value": 1
                },
                {
                  "name": "send_time_series",
                  "byte": 0,
                  "bit": 4,
                  "bits": 1,
                  "type": "bool",
                  "description": "Send time-series samples. 0=off, 1=on.",
                  "default_value": 0
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 5,
                  "bits": 3,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "sampling_interval",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sampling interval code.",
                  "default_value": 4
                },
                {
                  "name": "reserved",
                  "byte": 2,
                  "type": "bytes",
                  "length": 6,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_r8_5",
      "device": "Airwits",
      "version": "R8.5",
      "note": "Airwits LoRaWAN R8.5; same payload as iX LoRaWAN R2.5.",
      "schema": {
        "name": "airwits_r8_5",
        "device": "Airwits",
        "device_version": "R8.5",
        "radio_technologies": [
          "LoRaWAN"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits LoRaWAN R8.5.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "description": "Single-sample measurement, 4 bytes. Discriminator byte 0 bit 3 = 0.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "length": 4,
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble (4 bits)."
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. value = raw / 10 °C."
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %."
                }
              ]
            },
            {
              "name": "measurement_time_series",
              "description": "Time-series measurement, 11 bytes. Discriminator byte 0 bit 3 = 0.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "length": 11,
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble (4 bits)."
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. value = raw / 10 °C."
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %."
                },
                {
                  "name": "temp_history1",
                  "byte": 4,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Historical temperature sample 1. value = raw / 10 °C."
                },
                {
                  "name": "humidity_history1",
                  "byte": 6,
                  "type": "u8",
                  "unit": "%",
                  "description": "Historical humidity sample 1 in %."
                },
                {
                  "name": "temp_history2",
                  "byte": 7,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Historical temperature sample 2. value = raw / 10 °C."
                },
                {
                  "name": "humidity_history2",
                  "byte": 9,
                  "type": "u8",
                  "unit": "%",
                  "description": "Historical humidity sample 2 in %."
                },
                {
                  "name": "interval_m",
                  "byte": 10,
                  "type": "u8",
                  "unit": "min",
                  "description": "Interval between time-series samples in min."
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "reserved_not_in_use_low",
                  "byte": 0,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "description": "Reserved / not in use. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "send_time_series",
                  "byte": 0,
                  "bit": 4,
                  "bits": 1,
                  "type": "bool",
                  "description": "Send time-series samples. 0=off, 1=on.",
                  "default_value": false
                },
                {
                  "name": "reserved_not_in_use_high",
                  "byte": 0,
                  "bit": 5,
                  "bits": 3,
                  "type": "u8",
                  "description": "Reserved / not in use. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "sampling_interval",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sampling interval code. Effective interval is (raw + 1) minutes.",
                  "default_value": 29
                },
                {
                  "name": "reserved",
                  "byte": 2,
                  "type": "bytes",
                  "length": 6,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_ix_r1_5",
      "device": "Airwits iX",
      "version": "R1.5",
      "note": "Airwits iX Sigfox R1.5; coating variant of Airwits R7.5.",
      "schema": {
        "name": "airwits_ix_r1_5",
        "device": "Airwits iX",
        "device_version": "R1.5",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits iX Sigfox R1.5; same payload as Airwits Sigfox R7.5.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "description": "Single-sample measurement, 4 bytes. Discriminator byte 0 bit 3 = 0.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "length": 4,
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble (4 bits)."
                },
                {
                  "name": "tx_power_reduced",
                  "byte": 0,
                  "bit": 2,
                  "bits": 1,
                  "type": "bool",
                  "description": "Reduced transmit power. 0=full, 1=reduced."
                },
                {
                  "name": "tx_bitrate_600",
                  "byte": 0,
                  "bit": 1,
                  "bits": 1,
                  "type": "bool",
                  "description": "Bitrate mode. 0=100bps, 1=600bps."
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. value = raw / 10 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                }
              ]
            },
            {
              "name": "measurement_time_series",
              "description": "Time-series measurement, 11 bytes. Discriminator byte 0 bit 3 = 0.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "length": 11,
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble (4 bits)."
                },
                {
                  "name": "tx_power_reduced",
                  "byte": 0,
                  "bit": 2,
                  "bits": 1,
                  "type": "bool",
                  "description": "Reduced transmit power. 0=full, 1=reduced."
                },
                {
                  "name": "tx_bitrate_600",
                  "byte": 0,
                  "bit": 1,
                  "bits": 1,
                  "type": "bool",
                  "description": "Bitrate mode. 0=100bps, 1=600bps."
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. value = raw / 10 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "temp_history1",
                  "byte": 4,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Historical temperature sample 1. value = raw / 10 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity_history1",
                  "byte": 6,
                  "type": "u8",
                  "unit": "%",
                  "description": "Historical humidity sample 1 in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "temp_history2",
                  "byte": 7,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Historical temperature sample 2. value = raw / 10 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity_history2",
                  "byte": 9,
                  "type": "u8",
                  "unit": "%",
                  "description": "Historical humidity sample 2 in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "interval_m",
                  "byte": 10,
                  "type": "u8",
                  "unit": "min",
                  "description": "Interval between time-series samples in min."
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "txp_reduction",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Transmit power reduction in dB (0dB-7dB).",
                  "default_value": 0
                },
                {
                  "name": "bitrate",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "u8",
                  "description": "Bitrate mode. 0=100bps, 1=600bps.",
                  "valid_values": [
                    0,
                    1
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "100bps"
                    },
                    {
                      "value": 1,
                      "label": "600bps"
                    }
                  ],
                  "default_value": 1
                },
                {
                  "name": "send_time_series",
                  "byte": 0,
                  "bit": 4,
                  "bits": 1,
                  "type": "bool",
                  "description": "Send time-series samples. 0=off, 1=on.",
                  "default_value": 0
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 5,
                  "bits": 3,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "sampling_interval",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sampling interval code.",
                  "default_value": 4
                },
                {
                  "name": "reserved",
                  "byte": 2,
                  "type": "bytes",
                  "length": 6,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_ix_r2_5",
      "device": "Airwits iX",
      "version": "R2.5",
      "note": "Airwits iX LoRaWAN R2.5; coating variant of Airwits R8.5.",
      "schema": {
        "name": "airwits_ix_r2_5",
        "device": "Airwits iX",
        "device_version": "R2.5",
        "radio_technologies": [
          "LoRaWAN"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits iX LoRaWAN R2.5.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "description": "Single-sample measurement, 4 bytes. Discriminator byte 0 bit 3 = 0.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "length": 4,
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble (4 bits)."
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. value = raw / 10 °C."
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %."
                }
              ]
            },
            {
              "name": "measurement_time_series",
              "description": "Time-series measurement, 11 bytes. Discriminator byte 0 bit 3 = 0.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "length": 11,
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble (4 bits)."
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. value = raw / 10 °C."
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %."
                },
                {
                  "name": "temp_history1",
                  "byte": 4,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Historical temperature sample 1. value = raw / 10 °C."
                },
                {
                  "name": "humidity_history1",
                  "byte": 6,
                  "type": "u8",
                  "unit": "%",
                  "description": "Historical humidity sample 1 in %."
                },
                {
                  "name": "temp_history2",
                  "byte": 7,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Historical temperature sample 2. value = raw / 10 °C."
                },
                {
                  "name": "humidity_history2",
                  "byte": 9,
                  "type": "u8",
                  "unit": "%",
                  "description": "Historical humidity sample 2 in %."
                },
                {
                  "name": "interval_m",
                  "byte": 10,
                  "type": "u8",
                  "unit": "min",
                  "description": "Interval between time-series samples in min."
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "reserved_not_in_use_low",
                  "byte": 0,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "description": "Reserved / not in use. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "send_time_series",
                  "byte": 0,
                  "bit": 4,
                  "bits": 1,
                  "type": "bool",
                  "description": "Send time-series samples. 0=off, 1=on.",
                  "default_value": false
                },
                {
                  "name": "reserved_not_in_use_high",
                  "byte": 0,
                  "bit": 5,
                  "bits": 3,
                  "type": "u8",
                  "description": "Reserved / not in use. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "sampling_interval",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sampling interval code. Effective interval is (raw + 1) minutes.",
                  "default_value": 29
                },
                {
                  "name": "reserved",
                  "byte": 2,
                  "type": "bytes",
                  "length": 6,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_plus_r1_1",
      "device": "Airwits Plus",
      "version": "R1.1",
      "note": "",
      "schema": {
        "name": "airwits_plus_r1_1",
        "device": "Airwits Plus",
        "device_version": "R1.1",
        "radio_technologies": [
          "Sigfox"
        ],
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits Plus R1.1 uplink and downlink.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "fields": [
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble (4 bits)."
                },
                {
                  "name": "power_control",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Power control. 0=disabled, 1=enabled."
                },
                {
                  "name": "current_tx_power",
                  "byte": 0,
                  "bit": 2,
                  "bits": 1,
                  "type": "bool",
                  "description": "Current TX power. 0=reduced, 1=high."
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "add": -400,
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. value = (raw - 400) / 10 °C."
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "reconf",
                  "byte": 0,
                  "bit": 7,
                  "bits": 1,
                  "type": "bool",
                  "description": "Apply configuration update. 0=ignore, 1=apply."
                },
                {
                  "name": "active_power_control",
                  "byte": 0,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "Active power control. 0=disabled, 1=enabled."
                },
                {
                  "name": "sampling_interval",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sampling interval code. Decoded as (raw + 2) * 5 min.",
                  "add": 2,
                  "mult": 5,
                  "unit": "min"
                },
                {
                  "name": "reserved",
                  "byte": 2,
                  "type": "bytes",
                  "length": 6,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_plus_r1_2",
      "device": "Airwits Plus",
      "version": "R1.2",
      "note": "",
      "schema": {
        "name": "airwits_plus_r1_2",
        "device": "Airwits Plus",
        "device_version": "R1.2",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits Plus R1.2 uplink and downlink.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble (4 bits)."
                },
                {
                  "name": "txp_reduction_class",
                  "byte": 0,
                  "bit": 1,
                  "bits": 2,
                  "type": "u8",
                  "description": "0=0dB, 1=1dB, 2=3dB, 3=6dB."
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. value = raw / 10 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 5,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "txp_mode",
                  "byte": 0,
                  "bit": 5,
                  "bits": 2,
                  "type": "u8",
                  "description": "ETSI only: 0=0dB, 1=1dB, 2=auto-3dB, 3=auto-6dB."
                },
                {
                  "name": "debug_flag",
                  "byte": 0,
                  "bit": 7,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 0 for normal downlinks."
                },
                {
                  "name": "send_interval",
                  "byte": 1,
                  "type": "u8",
                  "unit": "min",
                  "description": "0=11min; >214=18h; else (n+2)*5min."
                },
                {
                  "name": "reserved",
                  "byte": 2,
                  "type": "bytes",
                  "length": 6,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_plus_r3_3",
      "device": "Airwits Plus",
      "version": "R3.3",
      "note": "",
      "schema": {
        "name": "airwits_plus_r3_3",
        "device": "Airwits Plus",
        "device_version": "R3.3",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits Plus BRM81W10132 (RC1 Sigfox) Cosmic Dust payload layout.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "description": "Measurement uplink (is_system_message=0).",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble."
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 0 for measurement message.",
                  "fixed_value": 0
                },
                {
                  "name": "reserved_mid",
                  "byte": 0,
                  "bit": 2,
                  "bits": 1,
                  "type": "u8",
                  "description": "Reserved. Keep 0.",
                  "default_value": 0
                },
                {
                  "name": "bitrate_in_use",
                  "byte": 0,
                  "bit": 1,
                  "bits": 1,
                  "type": "u8",
                  "description": "Bitrate in use. 0=100 bps, 1=600 bps.",
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "100 bps"
                    },
                    {
                      "value": 1,
                      "label": "600 bps"
                    }
                  ]
                },
                {
                  "name": "reserved_lsb",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "u8",
                  "description": "Reserved. Keep 0.",
                  "default_value": 0
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Signed temperature in tenths of °C (e.g. 251 = 25.1°C, -35 = -3.5°C)."
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity."
                }
              ]
            },
            {
              "name": "system0",
              "description": "System message function 0. Sent once after device test.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble."
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system message.",
                  "fixed_value": 1
                },
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for Sys0.",
                  "fixed_value": 0
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone (1=RC1)."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware version."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier (27=Airwits Plus)."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build timestamp YYMMDDHHMM."
                }
              ]
            },
            {
              "name": "system1",
              "description": "System message function 1. Sent after every DL request.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble."
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system message.",
                  "fixed_value": 1
                },
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for Sys1.",
                  "fixed_value": 1
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "description": "Thousands of messages sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "mult": 20,
                  "unit": "mV",
                  "description": "Last TX voltage in N*20 mV (e.g. 164 => 3280 mV)."
                },
                {
                  "name": "config_txp_reduction",
                  "byte": 3,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "TX power reduction 0..7 dB."
                },
                {
                  "name": "config_bitrate",
                  "byte": 3,
                  "bit": 3,
                  "bits": 1,
                  "type": "u8",
                  "description": "Bitrate. 0=100 bps, 1=600 bps.",
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "100 bps"
                    },
                    {
                      "value": 1,
                      "label": "600 bps"
                    }
                  ]
                },
                {
                  "name": "config_reserved1",
                  "byte": 3,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Reserved.",
                  "default_value": 0
                },
                {
                  "name": "config_send_interval",
                  "byte": 4,
                  "type": "u8",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "description": "Send interval. (raw + 2) * 5 min."
                },
                {
                  "name": "config_reserved2",
                  "byte": 5,
                  "type": "bytes",
                  "length": 6,
                  "description": "Reserved bytes.",
                  "default_value": 0
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "description": "Configuration downlink (8 bytes).",
              "fields": [
                {
                  "name": "txp_reduction",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "TX power reduction in dB. 0 means 0 dB reduction; range 0..7.",
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "0 dB"
                    },
                    {
                      "value": 1,
                      "label": "1 dB"
                    },
                    {
                      "value": 2,
                      "label": "2 dB"
                    },
                    {
                      "value": 3,
                      "label": "3 dB"
                    },
                    {
                      "value": 4,
                      "label": "4 dB"
                    },
                    {
                      "value": 5,
                      "label": "5 dB"
                    },
                    {
                      "value": 6,
                      "label": "6 dB"
                    },
                    {
                      "value": 7,
                      "label": "7 dB"
                    }
                  ],
                  "default_value": 0
                },
                {
                  "name": "bitrate",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "u8",
                  "description": "Bitrate selector. 0=100 bps, 1=600 bps.",
                  "valid_values": [
                    0,
                    1
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "100 bps"
                    },
                    {
                      "value": 1,
                      "label": "600 bps"
                    }
                  ],
                  "default_value": 1
                },
                {
                  "name": "reserved1",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Reserved. Keep 0.",
                  "default_value": 0
                },
                {
                  "name": "send_interval",
                  "byte": 1,
                  "type": "u8",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "description": "Send interval config. (raw + 2) * 5 min.",
                  "default_value": 4
                },
                {
                  "name": "reserved2",
                  "byte": 2,
                  "type": "bytes",
                  "length": 6,
                  "description": "Reserved. Keep all bytes 0x00.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_co2_r2",
      "device": "Airwits CO2",
      "version": "R2",
      "note": "",
      "schema": {
        "name": "airwits_co2_r2",
        "device": "Airwits CO2",
        "device_version": "R2",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits CO2 R2 uplink and downlink.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "description": "Only message type; no header byte.",
              "fields": [
                {
                  "name": "temperature",
                  "byte": 0,
                  "type": "u16",
                  "add": -400,
                  "div": 10,
                  "unit": "°C",
                  "description": "Decoded as (raw - 400) / 10. Unit: °C."
                },
                {
                  "name": "humidity",
                  "byte": 2,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %."
                },
                {
                  "name": "co2_level",
                  "byte": 3,
                  "type": "u16",
                  "unit": "ppm",
                  "description": "CO2 concentration in ppm."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "transmission_interval_code",
                  "byte": 0,
                  "type": "u8",
                  "description": "Transmission interval. 1=10min, 2=20min, 3=30min, 4=1h, 5=2h.",
                  "valid_values": [
                    1,
                    2,
                    3,
                    4,
                    5
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "not_applicable"
                    },
                    {
                      "value": 1,
                      "label": "10_min"
                    },
                    {
                      "value": 2,
                      "label": "20_min"
                    },
                    {
                      "value": 3,
                      "label": "30_min_default"
                    },
                    {
                      "value": 4,
                      "label": "1_h"
                    },
                    {
                      "value": 5,
                      "label": "2_h"
                    },
                    {
                      "value": 6,
                      "label": "not_applicable"
                    },
                    {
                      "value": 7,
                      "label": "not_applicable"
                    },
                    {
                      "value": 8,
                      "label": "not_applicable"
                    },
                    {
                      "value": 9,
                      "label": "not_applicable"
                    },
                    {
                      "value": 10,
                      "label": "not_applicable"
                    },
                    {
                      "value": 11,
                      "label": "not_applicable"
                    },
                    {
                      "value": 12,
                      "label": "not_applicable"
                    },
                    {
                      "value": 13,
                      "label": "not_applicable"
                    },
                    {
                      "value": 14,
                      "label": "not_applicable"
                    },
                    {
                      "value": 15,
                      "label": "not_applicable"
                    }
                  ],
                  "default_value": 3
                },
                {
                  "name": "measurement_interval_code",
                  "byte": 1,
                  "type": "u8",
                  "description": "Measurement interval. 1=10min, 2=20min, 3=30min, 4=1h, 5=2h.",
                  "valid_values": [
                    1,
                    2,
                    3,
                    4,
                    5
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "not_applicable"
                    },
                    {
                      "value": 1,
                      "label": "10_min"
                    },
                    {
                      "value": 2,
                      "label": "20_min"
                    },
                    {
                      "value": 3,
                      "label": "30_min_default"
                    },
                    {
                      "value": 4,
                      "label": "1_h"
                    },
                    {
                      "value": 5,
                      "label": "2_h"
                    },
                    {
                      "value": 6,
                      "label": "not_applicable"
                    },
                    {
                      "value": 7,
                      "label": "not_applicable"
                    },
                    {
                      "value": 8,
                      "label": "not_applicable"
                    },
                    {
                      "value": 9,
                      "label": "not_applicable"
                    },
                    {
                      "value": 10,
                      "label": "not_applicable"
                    },
                    {
                      "value": 11,
                      "label": "not_applicable"
                    },
                    {
                      "value": 12,
                      "label": "not_applicable"
                    },
                    {
                      "value": 13,
                      "label": "not_applicable"
                    },
                    {
                      "value": 14,
                      "label": "not_applicable"
                    },
                    {
                      "value": 15,
                      "label": "not_applicable"
                    }
                  ],
                  "default_value": 3
                },
                {
                  "name": "temperature_delta_threshold",
                  "byte": 2,
                  "type": "u8",
                  "div": 10,
                  "unit": "°C",
                  "description": "Decoded as raw / 10. Unit: °C.",
                  "default_value": 0
                },
                {
                  "name": "humidity_delta_threshold",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Humidity delta threshold in %.",
                  "default_value": 0
                },
                {
                  "name": "co2_delta_threshold",
                  "byte": 4,
                  "type": "u16",
                  "unit": "ppm",
                  "description": "CO2 delta threshold in ppm.",
                  "default_value": 400
                },
                {
                  "name": "reserved",
                  "byte": 6,
                  "type": "bytes",
                  "length": 2,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_co2_r3",
      "device": "Airwits CO2",
      "version": "R3",
      "note": "",
      "schema": {
        "name": "airwits_co2_r3",
        "device": "Airwits CO2",
        "device_version": "R3",
        "radio_technologies": [
          "Sigfox"
        ],
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits CO2 R3; same format as R4.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "fields": [
                {
                  "name": "temperature",
                  "byte": 0,
                  "type": "i16",
                  "add": -400,
                  "div": 10,
                  "unit": "°C",
                  "description": "Decoded as (raw - 400) / 10. Unit: °C."
                },
                {
                  "name": "humidity",
                  "byte": 2,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %."
                },
                {
                  "name": "co2_level",
                  "byte": 3,
                  "type": "u16",
                  "unit": "ppm",
                  "description": "CO2 concentration in ppm."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": []
        }
      }
    },
    {
      "slug": "airwits_co2_r4",
      "device": "Airwits CO2",
      "version": "R4",
      "note": "",
      "schema": {
        "name": "airwits_co2_r4",
        "device": "Airwits CO2",
        "device_version": "R4",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits CO2 R4/R3 uplink; temp + humidity + CO2.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "fields": [
                {
                  "name": "temperature",
                  "byte": 0,
                  "type": "i16",
                  "add": -400,
                  "div": 10,
                  "unit": "°C",
                  "description": "Decoded as (raw - 400) / 10. Unit: °C."
                },
                {
                  "name": "humidity",
                  "byte": 2,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %."
                },
                {
                  "name": "co2_level",
                  "byte": 3,
                  "type": "u16",
                  "unit": "ppm",
                  "description": "CO2 concentration in ppm."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": []
        }
      }
    },
    {
      "slug": "airwits_co2_r5_2",
      "device": "Airwits CO2",
      "version": "R5.2",
      "note": "",
      "schema": {
        "name": "airwits_co2_r5_2",
        "device": "Airwits CO2",
        "device_version": "R5.2",
        "radio_technologies": [
          "Sigfox"
        ],
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits CO2 R5.2/R6.2 uplink and downlink.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "fields": [
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version (4 bits)."
                },
                {
                  "name": "auto_cal",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "bool",
                  "description": "0 = off, 1 = auto-calibration active."
                },
                {
                  "name": "zero_point_fixed",
                  "byte": 0,
                  "bit": 1,
                  "bits": 1,
                  "type": "bool",
                  "description": "0 = not fixed, 1 = zero point fixed."
                },
                {
                  "name": "power_control",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Power control. 0=disabled, 1=enabled."
                },
                {
                  "name": "current_tx_power",
                  "byte": 0,
                  "bit": 2,
                  "bits": 1,
                  "type": "bool",
                  "description": "Current TX power. 0=reduced, 1=high."
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "add": -400,
                  "div": 10,
                  "unit": "°C",
                  "description": "Decoded as (raw - 400) / 10. Unit: °C."
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %."
                },
                {
                  "name": "co2_level",
                  "byte": 4,
                  "type": "u16",
                  "unit": "ppm",
                  "description": "CO2 concentration in ppm."
                },
                {
                  "name": "co2_baseline",
                  "byte": 6,
                  "type": "u16",
                  "mult": 10,
                  "unit": "ppm",
                  "description": "Decoded as raw * 10 ppm."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "abc_period",
                  "byte": 0,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "description": "(raw x 2) days, if raw=0 ABC is off",
                  "default_value": 1
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 4,
                  "bits": 2,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "power_control",
                  "byte": 0,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "0=off, 1=on (ETSI ONLY)",
                  "default_value": 1
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 7,
                  "bits": 1,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "send_interval",
                  "byte": 1,
                  "type": "u8",
                  "description": "((raw + 2) x 5) min",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "default_value": 4
                },
                {
                  "name": "baseline10",
                  "byte": 2,
                  "type": "u8",
                  "description": "(raw x 10) ppm, if raw=0 then 40 (400ppm)",
                  "mult": 10,
                  "unit": "ppm",
                  "default_value": 40
                },
                {
                  "name": "reserved",
                  "byte": 3,
                  "type": "bytes",
                  "length": 5,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_co2_r5_1",
      "device": "Airwits CO2",
      "version": "R5.1",
      "note": "",
      "schema": {
        "name": "airwits_co2_r5_1",
        "device": "Airwits CO2",
        "device_version": "R5.1",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits CO2 R5.1 uplink and downlink.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "description": "Only message type; no system-message function in provided format.",
              "fields": [
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 2,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "transmit_power_full",
                  "byte": 0,
                  "bit": 2,
                  "bits": 1,
                  "type": "bool",
                  "description": "0 = reduced, 1 = full transmit power."
                },
                {
                  "name": "power_control",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "0 = inactive, 1 = active."
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version (4 bits)."
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "u16",
                  "add": -400,
                  "div": 10,
                  "unit": "°C",
                  "description": "Decoded as (raw - 400) / 10. Unit: °C."
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %."
                },
                {
                  "name": "co2_level",
                  "byte": 4,
                  "type": "u16",
                  "unit": "ppm",
                  "description": "CO2 concentration in ppm."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 6,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "power_control",
                  "byte": 0,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "0 = disabled, 1 = enabled.",
                  "default_value": 1
                },
                {
                  "name": "dl_reconfigure_enable",
                  "byte": 0,
                  "bit": 7,
                  "bits": 1,
                  "type": "bool",
                  "description": "0 = disabled, 1 = enable reconfigure.",
                  "default_value": 1
                },
                {
                  "name": "update_interval",
                  "byte": 1,
                  "type": "u8",
                  "add": 1,
                  "mult": 5,
                  "unit": "min",
                  "description": "Decoded as (raw + 1) * 5 min.",
                  "default_value": 4
                },
                {
                  "name": "reserved",
                  "byte": 2,
                  "type": "bytes",
                  "length": 6,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_co2_r6_22",
      "device": "Airwits CO2",
      "version": "R6.22",
      "note": "",
      "schema": {
        "name": "airwits_co2_r6_22",
        "device": "Airwits CO2",
        "device_version": "R6.22",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits CO2 R6.22; measurement (7B) or Sys1 only. No Sys0. Distinguish by payload length (14 hex chars = measurement).",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "description": "7 bytes (14 hex chars). Selected by payload length. Header bit 3 is not a discriminator: after a downlink it can be set on a normal measurement (for example 0x25 becomes 0x28) and the frame is still temperature, humidity, and CO2.",
              "payload_length": 7,
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Header bit 3. Not used to select the variant; 7-byte frames are always measurements. 0 on a typical measurement, 1 after some downlinks.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version (4 bits)."
                },
                {
                  "name": "txp_reduct",
                  "byte": 0,
                  "bit": 1,
                  "bits": 2,
                  "type": "u8",
                  "description": "TX power class [0=0dB, 1=1dB, 2=3dB, 3=6dB]."
                },
                {
                  "name": "autocal_triggered",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "bool",
                  "description": "Auto ABC calibration status. 1 if auto ABC calibration was performed after the previous message was sent."
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "add": -400,
                  "div": 10,
                  "unit": "°C",
                  "description": "Decoded as (raw - 400) / 10. Unit: °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %.",
                  "sentinel_values": [
                    {
                      "raw": 0,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "co2_level",
                  "byte": 4,
                  "type": "u16",
                  "unit": "ppm",
                  "description": "CO2 concentration in ppm.",
                  "sentinel_values": [
                    {
                      "raw": 0,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "co2_baseline",
                  "byte": 6,
                  "type": "u8",
                  "mult": 10,
                  "unit": "ppm",
                  "description": "Decoded as raw * 10 ppm."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "Status/config echo for any uplink that is not 7 bytes. Usually 11 bytes (header, message count, TX voltage, 8-byte config). 12 bytes when send_co2_offset_in_sys1 pads a drift/10 byte. Header bits are not used for selection: the echo sent right after a downlink can have bit 3 clear and still carry the active config.",
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                },
                {
                  "name": "co2_drift",
                  "byte": 11,
                  "type": "u8",
                  "mult": 10,
                  "unit": "ppm",
                  "optional": true,
                  "description": "Present only when send_co2_offset_in_sys1 is enabled (12-byte Sys1). The byte stores drift/10; decoded as raw * 10 ppm."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 6,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "power_control",
                  "byte": 0,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "0=off, 1=on (ETSI ONLY)",
                  "default_value": 1
                },
                {
                  "name": "enable_sys1",
                  "byte": 0,
                  "bit": 7,
                  "bits": 1,
                  "type": "bool",
                  "description": "0=off, 1=send sys1 message after each DL request",
                  "default_value": 0
                },
                {
                  "name": "send_interval",
                  "byte": 1,
                  "type": "u8",
                  "description": "Message send interval [0=11min, >214=18h, else (raw+2)*5min]",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "default_value": 4
                },
                {
                  "name": "reserved",
                  "byte": 2,
                  "type": "bytes",
                  "length": 5,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "disable_drift_comp",
                  "byte": 7,
                  "bit": 0,
                  "bits": 1,
                  "type": "bool",
                  "description": "0=no, 1=yes",
                  "default_value": 0
                },
                {
                  "name": "send_co2_offset_in_sys1",
                  "byte": 7,
                  "bit": 1,
                  "bits": 1,
                  "type": "bool",
                  "description": "0=no, 1=yes (if enabled System1 message will be padded with extra drift/10 byte.)",
                  "default_value": 0
                },
                {
                  "name": "enable_full_abc",
                  "byte": 7,
                  "bit": 2,
                  "bits": 1,
                  "type": "bool",
                  "description": "0=full abc disabled, 1=full abc enabled",
                  "default_value": 0
                },
                {
                  "name": "reserved",
                  "byte": 7,
                  "bit": 3,
                  "bits": 5,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_co2_r6_3",
      "device": "Airwits CO2",
      "version": "R6.3",
      "note": "",
      "schema": {
        "name": "airwits_co2_r6_3",
        "device": "Airwits CO2",
        "device_version": "R6.3",
        "radio_technologies": [
          "Sigfox"
        ],
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits CO2 R6.3/R7.3; shared parser with R7.3/R8.4.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version (4 bits)."
                },
                {
                  "name": "txp_reduct",
                  "byte": 0,
                  "bit": 1,
                  "bits": 2,
                  "type": "u8",
                  "description": "TX power class [0=0dB, 1=1dB, 2=3dB, 3=6dB]."
                },
                {
                  "name": "autocal_triggered",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "bool",
                  "description": "Auto ABC calibration status. 1 if auto ABC calibration was performed after the previous message was sent."
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Decoded as raw / 10. Unit: °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "co2_level",
                  "byte": 4,
                  "type": "u16",
                  "unit": "ppm",
                  "description": "CO2 concentration in ppm.",
                  "sentinel_values": [
                    {
                      "raw": 0,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "co2_level_raw",
                  "byte": 6,
                  "type": "u16",
                  "unit": "ppm",
                  "description": "Raw CO2 reading in ppm."
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "txp_reduct",
                  "byte": 0,
                  "bit": 6,
                  "bits": 2,
                  "type": "u8",
                  "description": "ETSI only transmit power setting [0=0dB, 1=1dB, 2=auto-3dB, 3=auto-6dB]",
                  "valid_values": [
                    0,
                    1,
                    2,
                    3
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "0 dB"
                    },
                    {
                      "value": 1,
                      "label": "1 dB"
                    },
                    {
                      "value": 2,
                      "label": "Auto 3 dB"
                    },
                    {
                      "value": 3,
                      "label": "Auto 6 dB"
                    }
                  ],
                  "default_value": 1
                },
                {
                  "name": "abc_level",
                  "byte": 0,
                  "bit": 4,
                  "bits": 2,
                  "type": "u8",
                  "description": "Automatic Baseline Calibration (ABC) level",
                  "valid_values": [
                    0,
                    1,
                    2,
                    3
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "Set calibration off, send raw CO2"
                    },
                    {
                      "value": 1,
                      "label": "Pause ABC, but keep previous offset"
                    },
                    {
                      "value": 2,
                      "label": "Use drift-down compensation only"
                    },
                    {
                      "value": 3,
                      "label": "Use full ABC"
                    }
                  ],
                  "default_value": 3
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "send_interval",
                  "byte": 1,
                  "type": "u8",
                  "description": "Message send interval ((raw + 2) x 5) min",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "default_value": 4
                },
                {
                  "name": "co2_baseline",
                  "byte": 2,
                  "type": "u8",
                  "description": "Custom baseline for ABC target (raw x 10) ppm",
                  "mult": 10,
                  "unit": "ppm",
                  "default_value": 40
                },
                {
                  "name": "co2_interval",
                  "byte": 3,
                  "type": "u8",
                  "description": "ABC interval. If raw=0 then OFF else (raw x 4) h",
                  "mult": 4,
                  "unit": "h",
                  "default_value": 45
                },
                {
                  "name": "reserved",
                  "byte": 4,
                  "type": "bytes",
                  "length": 4,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_co2_r7_3",
      "device": "Airwits CO2",
      "version": "R7.3",
      "note": "",
      "schema": {
        "name": "airwits_co2_r7_3",
        "device": "Airwits CO2",
        "device_version": "R7.3",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits CO2 R7.3; same format as R6.3, R7.3C, R8.4 (shared parser in tool).",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version (4 bits)."
                },
                {
                  "name": "txp_reduct",
                  "byte": 0,
                  "bit": 1,
                  "bits": 2,
                  "type": "u8",
                  "description": "TX power class [0=0dB, 1=1dB, 2=3dB, 3=6dB]."
                },
                {
                  "name": "abc_triggered",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "bool",
                  "description": "Auto ABC calibration status. 1 if auto ABC calibration was performed after the previous message was sent."
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Decoded as raw / 10. Unit: °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Humidity value [0=0% ... 100=100%].",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "co2_level",
                  "byte": 4,
                  "type": "u16",
                  "unit": "ppm",
                  "description": "CO2 concentration [370=370ppm ... 5000=5000ppm].",
                  "sentinel_values": [
                    {
                      "raw": 0,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "txp_reduct",
                  "byte": 0,
                  "bit": 6,
                  "bits": 2,
                  "type": "u8",
                  "description": "ETSI only transmit power setting [0=0dB, 1=1dB, 2=auto-3dB, 3=auto-6dB]",
                  "valid_values": [
                    0,
                    1,
                    2,
                    3
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "0 dB"
                    },
                    {
                      "value": 1,
                      "label": "1 dB"
                    },
                    {
                      "value": 2,
                      "label": "Auto 3 dB"
                    },
                    {
                      "value": 3,
                      "label": "Auto 6 dB"
                    }
                  ],
                  "default_value": 1
                },
                {
                  "name": "abc_level",
                  "byte": 0,
                  "bit": 4,
                  "bits": 2,
                  "type": "u8",
                  "description": "Automatic Baseline Calibration (ABC) level",
                  "valid_values": [
                    0,
                    1,
                    2,
                    3
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "Set calibration off, send raw CO2"
                    },
                    {
                      "value": 1,
                      "label": "Pause ABC, but keep previous offset"
                    },
                    {
                      "value": 2,
                      "label": "Use drift-down compensation only"
                    },
                    {
                      "value": 3,
                      "label": "Use full ABC"
                    }
                  ],
                  "default_value": 3
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "send_interval",
                  "byte": 1,
                  "type": "u8",
                  "description": "Message send interval ((raw + 2) x 5) min",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "default_value": 4
                },
                {
                  "name": "co2_baseline",
                  "byte": 2,
                  "type": "u8",
                  "description": "Custom baseline for ABC target (raw x 10) ppm",
                  "mult": 10,
                  "unit": "ppm",
                  "default_value": 40
                },
                {
                  "name": "co2_interval",
                  "byte": 3,
                  "type": "u8",
                  "description": "ABC interval. If raw=0 then OFF else (raw x 4) h",
                  "mult": 4,
                  "unit": "h",
                  "default_value": 45
                },
                {
                  "name": "reserved",
                  "byte": 4,
                  "type": "bytes",
                  "length": 4,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_co2_r8_4",
      "device": "Airwits CO2",
      "version": "R8.4",
      "note": "",
      "schema": {
        "name": "airwits_co2_r8_4",
        "device": "Airwits CO2",
        "device_version": "R8.4",
        "radio_technologies": [
          "Sigfox",
          "LoRaWAN"
        ],
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits CO2 R8.4; same format as R7.3C.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version"
                },
                {
                  "name": "msg_type",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Is always set to 0 in measurement message",
                  "fixed_value": 0
                },
                {
                  "name": "txp_reduct",
                  "byte": 0,
                  "bit": 1,
                  "bits": 2,
                  "type": "u8",
                  "description": "TX power class [0=0dB, 1=1dB, 2=3dB, 3=6dB]"
                },
                {
                  "name": "abc_triggered",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "bool",
                  "description": "1 if ABC triggered else 0"
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Decoded as raw / 10. Unit: °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "co2_level",
                  "byte": 4,
                  "type": "u16",
                  "unit": "ppm",
                  "description": "CO2 concentration in ppm.",
                  "sentinel_values": [
                    {
                      "raw": 0,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "txp_reduct",
                  "byte": 0,
                  "bit": 6,
                  "bits": 2,
                  "type": "u8",
                  "description": "ETSI only transmit power setting [0=0dB, 1=1dB, 2=auto-3dB, 3=auto-6dB]",
                  "valid_values": [
                    0,
                    1,
                    2,
                    3
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "0 dB"
                    },
                    {
                      "value": 1,
                      "label": "1 dB"
                    },
                    {
                      "value": 2,
                      "label": "Auto 3 dB"
                    },
                    {
                      "value": 3,
                      "label": "Auto 6 dB"
                    }
                  ],
                  "default_value": 1
                },
                {
                  "name": "abc_disable",
                  "byte": 0,
                  "bit": 5,
                  "bits": 1,
                  "type": "bool",
                  "description": "Automatic baseline calibration disable [0=no, 1=yes]",
                  "default_value": 0
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 5,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "send_interval",
                  "byte": 1,
                  "type": "u8",
                  "description": "Message send interval [0=11min,>214=18h,else (n+2)*5min]",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "default_value": 4
                },
                {
                  "name": "co2_baseline",
                  "byte": 2,
                  "type": "u8",
                  "description": "Custom baseline for auto zero point algorithm target",
                  "default_value": 40,
                  "mult": 10,
                  "unit": "ppm"
                },
                {
                  "name": "co2_interval",
                  "byte": 3,
                  "type": "u8",
                  "description": "Auto zeropoint interval [if n=0 then OFF, else n*4h]",
                  "mult": 4,
                  "unit": "h",
                  "default_value": 45
                },
                {
                  "name": "reserved",
                  "byte": 4,
                  "type": "bytes",
                  "length": 4,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_co2_r9_5",
      "device": "Airwits CO2",
      "version": "R9.5",
      "note": "",
      "schema": {
        "name": "airwits_co2_r9_5",
        "device": "Airwits CO2",
        "device_version": "R9.5",
        "radio_technologies": [
          "LoRaWAN"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits CO2 R9.5 uplink and downlink.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "description": "Measurement payload. Docs reserve bytes 6-7; observed examples may omit reserved tail bytes.",
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version (4 bits)."
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 1,
                  "bits": 2,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "abc_triggered",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "bool",
                  "description": "0 = not triggered, 1 = ABC calibration triggered."
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Decoded as raw / 10. Unit: °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "co2_level",
                  "byte": 4,
                  "type": "u16",
                  "unit": "ppm",
                  "description": "CO2 concentration in ppm.",
                  "sentinel_values": [
                    {
                      "raw": 0,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "reserved",
                  "byte": 6,
                  "type": "bytes",
                  "length": 2,
                  "optional": true,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 5,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "auto_zero_disable",
                  "byte": 0,
                  "bit": 5,
                  "bits": 1,
                  "type": "bool",
                  "description": "0 = enabled, 1 = disabled.",
                  "default_value": 0
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 6,
                  "bits": 2,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "send_interval",
                  "byte": 1,
                  "type": "u8",
                  "add": 1,
                  "unit": "min",
                  "description": "Decoded as (raw + 1) min.",
                  "default_value": 29
                },
                {
                  "name": "co2_baseline",
                  "byte": 2,
                  "type": "u8",
                  "unit": "ppm",
                  "description": "CO2 baseline in ppm.",
                  "default_value": 40
                },
                {
                  "name": "co2_interval",
                  "byte": 3,
                  "type": "u8",
                  "mult": 4,
                  "unit": "h",
                  "description": "0 = OFF, else n*4h.",
                  "default_value": 45
                },
                {
                  "name": "reserved",
                  "byte": 4,
                  "type": "bytes",
                  "length": 4,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_co2_r10_5",
      "device": "Airwits CO2",
      "version": "R10.5",
      "note": "",
      "schema": {
        "name": "airwits_co2_r10_5",
        "device": "Airwits CO2",
        "device_version": "R10.5",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits CO2 R10.5 uplink and downlink.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "description": "Measurement payload. Normal uplink is 6 bytes.",
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version (4 bits)."
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 1,
                  "bits": 2,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "abc_triggered",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "bool",
                  "description": "1 = automatic baseline correction (ABC) was performed during this measurement cycle, 0 = no ABC was performed. Always 0 when ABC is disabled (CO2 interval = 0 or auto_zero_disable = 1)."
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Decoded as raw / 10. Unit: °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "co2_level",
                  "byte": 4,
                  "type": "u16",
                  "unit": "ppm",
                  "description": "CO2 concentration in ppm, clamped to 400..5000 ppm. In normal mode the value is calibrated against the configured co2_baseline. In raw mode (auto_zero_disable = 1) the value is reported uncalibrated for off-device post-processing.",
                  "sentinel_values": [
                    {
                      "raw": 0,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "txp_reduction",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "unit": "dB",
                  "description": "Sigfox TX power reduction in dB from full power. Raw value is the reduction amount, not absolute TX power.",
                  "default_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "baudrate",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "u8",
                  "description": "Sigfox TX data rate. 0 = 100 bps, 1 = 600 bps.",
                  "default_value": 1,
                  "valid_values": [
                    0,
                    1
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "100 bps"
                    },
                    {
                      "value": 1,
                      "label": "600 bps"
                    }
                  ]
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 4,
                  "bits": 1,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "auto_zero_disable",
                  "byte": 0,
                  "bit": 5,
                  "bits": 1,
                  "type": "bool",
                  "description": "Automatic CO2 zero-point calibration. 0 = enabled, the device runs ABC and the reported CO2 is calibrated against the configured co2_baseline. 1 = disabled (raw mode), ABC is turned off and the reported CO2 is uncalibrated; intended for systems that perform their own ABC after the data leaves the device.",
                  "default_value": 0
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 6,
                  "bits": 2,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "send_interval",
                  "byte": 1,
                  "type": "u8",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "description": "Measurement send interval. Decoded as (raw + 2) * 5 min, with raw 0 clamped to 11 min.",
                  "default_value": 4
                },
                {
                  "name": "co2_baseline",
                  "byte": 2,
                  "type": "u8",
                  "mult": 10,
                  "unit": "ppm",
                  "description": "Automatic baseline correction (ABC) target. Decoded as raw * 10 ppm. Sets the CO2 level to which the device calibrates the lowest CO2 readings (typical fresh-air target is 400 ppm). Ignored in raw mode (auto_zero_disable = 1).",
                  "default_value": 40
                },
                {
                  "name": "co2_interval",
                  "byte": 3,
                  "type": "u8",
                  "mult": 4,
                  "unit": "h",
                  "description": "Automatic baseline correction (ABC) interval. Decoded as raw * 4 h. 0 = ABC paused (current calibration is kept and not updated); the configured co2_baseline still applies to reported values.",
                  "default_value": 45
                },
                {
                  "name": "reserved",
                  "byte": 4,
                  "type": "bytes",
                  "length": 4,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_co2_plus_r1_0",
      "device": "Airwits CO2 Plus",
      "version": "R1.0",
      "note": "",
      "schema": {
        "name": "airwits_co2_plus_r1_0",
        "device": "Airwits CO2 Plus",
        "device_version": "R1.0",
        "radio_technologies": [
          "Sigfox"
        ],
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits CO2 Plus R1.0 uplink and downlink.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version (4 bits)."
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Decoded as raw / 10. Unit: °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "co2",
                  "byte": 4,
                  "type": "u16",
                  "unit": "ppm",
                  "description": "CO2 concentration in ppm.",
                  "sentinel_values": [
                    {
                      "raw": 0,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "min_co2",
                  "byte": 6,
                  "type": "u16",
                  "unit": "ppm",
                  "description": "Minimum CO2 in ppm."
                },
                {
                  "name": "max_co2",
                  "byte": 8,
                  "type": "u16",
                  "unit": "ppm",
                  "description": "Maximum CO2 in ppm."
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "power_control",
                  "byte": 0,
                  "bit": 7,
                  "bits": 1,
                  "type": "bool",
                  "description": "Power control. 0=off, 1=on."
                },
                {
                  "name": "send_stats",
                  "byte": 0,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "Send min/max CO2 in uplink. 0=no, 1=yes."
                },
                {
                  "name": "sampling_interval",
                  "byte": 1,
                  "type": "u8",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "description": "Uplink interval. Decoded as (raw+2)*5 min."
                },
                {
                  "name": "extra_meas_count_minus1",
                  "byte": 2,
                  "type": "u8",
                  "add": 1,
                  "description": "Extra measurement count minus 1. Decode: count = raw + 1."
                },
                {
                  "name": "co2_offset",
                  "byte": 3,
                  "type": "u8",
                  "mult": 10,
                  "unit": "ppm",
                  "description": "CO2 offset. Decoded as raw * 10 ppm."
                },
                {
                  "name": "co2_threshold",
                  "byte": 4,
                  "type": "u8",
                  "mult": 10,
                  "unit": "ppm",
                  "description": "CO2 threshold. Decoded as raw * 10 ppm."
                },
                {
                  "name": "reserved",
                  "byte": 5,
                  "type": "bytes",
                  "length": 2,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_co2_plus_r1_1",
      "device": "Airwits CO2 Plus",
      "version": "R1.1",
      "note": "",
      "schema": {
        "name": "airwits_co2_plus_r1_1",
        "device": "Airwits CO2 Plus",
        "device_version": "R1.1",
        "radio_technologies": [
          "LoRaWAN"
        ],
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits CO2 Plus R1.1 uplink and downlink.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version (4 bits)."
                },
                {
                  "name": "power_control",
                  "byte": 0,
                  "bit": 1,
                  "bits": 2,
                  "type": "u8",
                  "description": "Device-specific value."
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Decoded as raw / 10. Unit: °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "co2",
                  "byte": 4,
                  "type": "u16",
                  "unit": "ppm",
                  "description": "CO2 concentration in ppm.",
                  "sentinel_values": [
                    {
                      "raw": 0,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "min_co2",
                  "byte": 6,
                  "type": "u16",
                  "unit": "ppm",
                  "description": "Minimum CO2 in ppm."
                },
                {
                  "name": "max_co2",
                  "byte": 8,
                  "type": "u16",
                  "unit": "ppm",
                  "description": "Maximum CO2 in ppm."
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "send_stats",
                  "byte": 0,
                  "bit": 7,
                  "bits": 1,
                  "type": "bool",
                  "description": "Send min/max CO2 in uplink. 0=no, 1=yes.",
                  "default_value": false
                },
                {
                  "name": "factory_calibration",
                  "byte": 0,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "Factory calibration. 0=off, 1=on.",
                  "default_value": false
                },
                {
                  "name": "txp_reduct",
                  "byte": 0,
                  "bit": 4,
                  "bits": 2,
                  "type": "u8",
                  "description": "ETSI only transmit power setting [0=0dB, 1=1dB, 2=auto-3dB, 3=auto-6dB]",
                  "valid_values": [
                    0,
                    1,
                    2,
                    3
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "0 dB"
                    },
                    {
                      "value": 1,
                      "label": "1 dB"
                    },
                    {
                      "value": 2,
                      "label": "Auto 3 dB"
                    },
                    {
                      "value": 3,
                      "label": "Auto 6 dB"
                    }
                  ],
                  "default_value": 1
                },
                {
                  "name": "sampling_interval",
                  "byte": 1,
                  "type": "u8",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "description": "Uplink interval. Decoded as (raw+2)*5 min.",
                  "default_value": 4
                },
                {
                  "name": "extra_meas_count",
                  "byte": 2,
                  "type": "u8",
                  "description": "Extra measurement count.",
                  "default_value": 2
                },
                {
                  "name": "co2_baseline",
                  "byte": 3,
                  "type": "u8",
                  "mult": 10,
                  "unit": "ppm",
                  "description": "CO2 baseline. Decoded as raw * 10 ppm.",
                  "default_value": 40
                },
                {
                  "name": "co2_threshold",
                  "byte": 4,
                  "type": "u8",
                  "mult": 10,
                  "unit": "ppm",
                  "description": "CO2 threshold. Decoded as raw * 10 ppm.",
                  "default_value": 100
                },
                {
                  "name": "auto_zero_interval",
                  "byte": 5,
                  "type": "u8",
                  "mult": 4,
                  "unit": "min",
                  "description": "Automatic baseline compensation interval. Decoded as raw * 4 hours. Set to 0 to halt baseline compensation.",
                  "default_value": 45
                },
                {
                  "name": "reserved",
                  "byte": 6,
                  "type": "bytes",
                  "length": 2,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_co2_plus_r2_2",
      "device": "Airwits CO2 Plus",
      "version": "R2.2",
      "note": "Airwits CO2 Plus Sigfox H2a S2a. RC1 only. Downlink byte 0 carries TX power reduction and 100/600 bps.",
      "schema": {
        "name": "airwits_co2_plus_r2_2",
        "device": "Airwits CO2 Plus",
        "device_version": "R2.2",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits CO2 Plus Sigfox H2a S2a (R2.2) uplink and downlink. Sigfox RC1 only.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "description": "Measurement payload. 6 bytes by default. 10 bytes when downlink send_stats is 1 (min_co2 and max_co2 appended).",
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version (4 bits). S2a reports 2."
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Reserved. Always 0.",
                  "default_value": 0
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Decoded as raw / 10. Unit: °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %.",
                  "sentinel_values": [
                    {
                      "raw": 101,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "co2",
                  "byte": 4,
                  "type": "u16",
                  "unit": "ppm",
                  "description": "CO2 concentration in ppm. In normal mode the sensor ABC target stays 400 ppm and the reported value is co2_sensor + (co2_baseline - 400), clamped to 400..5000 ppm. In raw mode (auto_zero_disable = 1) the sensor reading is sent without that offset.",
                  "sentinel_values": [
                    {
                      "raw": 0,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "min_co2",
                  "byte": 6,
                  "type": "u16",
                  "unit": "ppm",
                  "optional": true,
                  "description": "Minimum CO2 in ppm since the previous uplink. Present only when send_stats is 1, making the payload 10 bytes instead of 6."
                },
                {
                  "name": "max_co2",
                  "byte": 8,
                  "type": "u16",
                  "unit": "ppm",
                  "optional": true,
                  "description": "Maximum CO2 in ppm since the previous uplink. Present only when send_stats is 1, making the payload 10 bytes instead of 6."
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes. Sent once after power-up.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble. S2a reports 2."
                },
                {
                  "name": "reserved",
                  "byte": 1,
                  "type": "u8",
                  "description": "Reserved. Former radio-mode and radio-zone bits. Always 0.",
                  "default_value": 0
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier. H2a reports 2."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier. This product reports 21."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier, YYMMDDHHMM."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes. Sent after a downlink request.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble. S2a reports 2."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Battery voltage during load. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active 8-byte downlink configuration."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "description": "8-byte configuration. A downlink-request uplink is sent at full power and 100 bps. Other uplinks use txp_reduction and baudrate.",
              "fields": [
                {
                  "name": "txp_reduction",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "unit": "dB",
                  "description": "Sigfox TX power reduction from full power. 0 = 15 dBm, 1 = 14 dBm, 2 = 13 dBm, 3 = 12 dBm, 4 = 11 dBm, 5-7 = 10 dBm.",
                  "default_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "baudrate",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "u8",
                  "description": "Sigfox TX data rate. 0 = 100 bps, 1 = 600 bps.",
                  "default_value": 1,
                  "valid_values": [
                    0,
                    1
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "100 bps"
                    },
                    {
                      "value": 1,
                      "label": "600 bps"
                    }
                  ]
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 4,
                  "bits": 2,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "auto_zero_disable",
                  "byte": 0,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "0 = auto zero enabled. The sensor ABC target stays 400 ppm and the reported CO2 includes the co2_baseline offset. 1 = raw mode. Sensor ABC is off and the reported CO2 has no software offset.",
                  "default_value": 0
                },
                {
                  "name": "send_stats",
                  "byte": 0,
                  "bit": 7,
                  "bits": 1,
                  "type": "bool",
                  "description": "Send period min and max CO2 in the measurement uplink. 0 = no, 1 = yes.",
                  "default_value": 0
                },
                {
                  "name": "send_interval",
                  "byte": 1,
                  "type": "u8",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "description": "Uplink interval. Decoded as (raw + 2) * 5 min. Raw 0 is 11 min. Raw above 214 is clamped to 214.",
                  "default_value": 4
                },
                {
                  "name": "extra_meas_count",
                  "byte": 2,
                  "type": "u8",
                  "description": "Extra measurements between uplinks. The display updates on every measurement. Measurements per uplink period are raw + 1.",
                  "default_value": 2
                },
                {
                  "name": "co2_baseline",
                  "byte": 3,
                  "type": "u8",
                  "mult": 10,
                  "unit": "ppm",
                  "description": "Reported CO2 baseline. Decoded as raw * 10 ppm. Raw 0 means 400 ppm. Applied as a software offset on top of the sensor reading, whose ABC target stays 400 ppm. Ignored in raw mode (auto_zero_disable = 1).",
                  "default_value": 40
                },
                {
                  "name": "co2_threshold",
                  "byte": 4,
                  "type": "u8",
                  "mult": 10,
                  "unit": "ppm",
                  "description": "Display alert CO2 threshold. Decoded as raw * 10 ppm. Default 100 = 1000 ppm.",
                  "default_value": 100
                },
                {
                  "name": "co2_interval",
                  "byte": 5,
                  "type": "u8",
                  "mult": 4,
                  "unit": "h",
                  "description": "Sensor ABC interval. Decoded as raw * 4 h. 0 halts sensor ABC (current calibration is kept) but the co2_baseline offset is still applied. Ignored in raw mode.",
                  "default_value": 45
                },
                {
                  "name": "reserved",
                  "byte": 6,
                  "type": "bytes",
                  "length": 2,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_iaq_r1_1",
      "device": "Airwits IAQ",
      "version": "R1.1",
      "note": "",
      "schema": {
        "name": "airwits_iaq_r1_1",
        "device": "Airwits IAQ",
        "device_version": "R1.1",
        "radio_technologies": [
          "Sigfox"
        ],
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Downlink like Airwits Gen.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "fields": [
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble (4 bits)."
                },
                {
                  "name": "power_control",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Power control. 0=disabled, 1=enabled."
                },
                {
                  "name": "current_tx_power",
                  "byte": 0,
                  "bit": 2,
                  "bits": 1,
                  "type": "bool",
                  "description": "Current TX power. 0=reduced, 1=high."
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "add": -400,
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. value = (raw - 400) / 10 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "min_tvoc",
                  "byte": 4,
                  "type": "u16",
                  "unit": "ppb",
                  "description": "Minimum TVOC concentration in ppb."
                },
                {
                  "name": "max_tvoc",
                  "byte": 6,
                  "type": "u16",
                  "unit": "ppb",
                  "description": "Maximum TVOC concentration in ppb."
                },
                {
                  "name": "avg_tvoc",
                  "byte": 8,
                  "type": "u16",
                  "unit": "ppb",
                  "description": "Average TVOC concentration in ppb."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "reconf",
                  "byte": 0,
                  "bit": 7,
                  "bits": 1,
                  "type": "bool",
                  "description": "Apply configuration update. 0=ignore, 1=apply."
                },
                {
                  "name": "active_power_control",
                  "byte": 0,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "Active power control. 0=disabled, 1=enabled."
                },
                {
                  "name": "sampling_interval",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sampling interval code. Decoded as (raw + 2) * 5 min.",
                  "add": 2,
                  "mult": 5,
                  "unit": "min"
                },
                {
                  "name": "reserved",
                  "byte": 2,
                  "type": "bytes",
                  "length": 6,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_pm_r1_1",
      "device": "Airwits PM",
      "version": "R1.1",
      "note": "",
      "schema": {
        "name": "airwits_pm_r1_1",
        "device": "Airwits PM",
        "device_version": "R1.1",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits PM R1.1 uplink and downlink.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "description": "Only message type; no header byte.",
              "fields": [
                {
                  "name": "temperature",
                  "byte": 0,
                  "type": "u16",
                  "add": -400,
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. value = (raw - 400) / 10 °C."
                },
                {
                  "name": "humidity",
                  "byte": 2,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %."
                },
                {
                  "name": "pm_25",
                  "byte": 3,
                  "type": "u16",
                  "unit": "ug/m3",
                  "description": "PM2.5 mass concentration in µg/m³."
                },
                {
                  "name": "pm_10",
                  "byte": 5,
                  "type": "u16",
                  "unit": "ug/m3",
                  "description": "PM10 mass concentration in µg/m³."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "transmission_interval_code",
                  "byte": 0,
                  "type": "u8",
                  "description": "Transmission interval code. See enum.",
                  "valid_values": [
                    1,
                    2,
                    3,
                    4,
                    5
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "not_applicable"
                    },
                    {
                      "value": 1,
                      "label": "10_min"
                    },
                    {
                      "value": 2,
                      "label": "20_min"
                    },
                    {
                      "value": 3,
                      "label": "30_min_default"
                    },
                    {
                      "value": 4,
                      "label": "1_h"
                    },
                    {
                      "value": 5,
                      "label": "2_h"
                    },
                    {
                      "value": 6,
                      "label": "not_applicable"
                    },
                    {
                      "value": 7,
                      "label": "not_applicable"
                    },
                    {
                      "value": 8,
                      "label": "not_applicable"
                    },
                    {
                      "value": 9,
                      "label": "not_applicable"
                    },
                    {
                      "value": 10,
                      "label": "not_applicable"
                    },
                    {
                      "value": 11,
                      "label": "not_applicable"
                    },
                    {
                      "value": 12,
                      "label": "not_applicable"
                    },
                    {
                      "value": 13,
                      "label": "not_applicable"
                    },
                    {
                      "value": 14,
                      "label": "not_applicable"
                    },
                    {
                      "value": 15,
                      "label": "not_applicable"
                    }
                  ]
                },
                {
                  "name": "measurement_interval_code",
                  "byte": 1,
                  "type": "u8",
                  "description": "Measurement interval code. See enum.",
                  "valid_values": [
                    1,
                    2,
                    3,
                    4,
                    5
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "not_applicable"
                    },
                    {
                      "value": 1,
                      "label": "10_min"
                    },
                    {
                      "value": 2,
                      "label": "20_min"
                    },
                    {
                      "value": 3,
                      "label": "30_min_default"
                    },
                    {
                      "value": 4,
                      "label": "1_h"
                    },
                    {
                      "value": 5,
                      "label": "2_h"
                    },
                    {
                      "value": 6,
                      "label": "not_applicable"
                    },
                    {
                      "value": 7,
                      "label": "not_applicable"
                    },
                    {
                      "value": 8,
                      "label": "not_applicable"
                    },
                    {
                      "value": 9,
                      "label": "not_applicable"
                    },
                    {
                      "value": 10,
                      "label": "not_applicable"
                    },
                    {
                      "value": 11,
                      "label": "not_applicable"
                    },
                    {
                      "value": 12,
                      "label": "not_applicable"
                    },
                    {
                      "value": 13,
                      "label": "not_applicable"
                    },
                    {
                      "value": 14,
                      "label": "not_applicable"
                    },
                    {
                      "value": 15,
                      "label": "not_applicable"
                    }
                  ]
                },
                {
                  "name": "pm_25_delta_threshold",
                  "byte": 2,
                  "type": "u8",
                  "unit": "ug/m3",
                  "description": "PM2.5 delta threshold for transmission trigger in µg/m³."
                },
                {
                  "name": "pm_10_delta_threshold",
                  "byte": 3,
                  "type": "u8",
                  "unit": "ug/m3",
                  "description": "PM10 delta threshold for transmission trigger in µg/m³."
                },
                {
                  "name": "reserved",
                  "byte": 4,
                  "type": "bytes",
                  "length": 4,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_pm_r2_1",
      "device": "Airwits PM",
      "version": "R2.1",
      "note": "",
      "schema": {
        "name": "airwits_pm_r2_1",
        "device": "Airwits PM",
        "device_version": "R2.1",
        "radio_technologies": [
          "Sigfox"
        ],
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Downlink like Airwits Gen.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "fields": [
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble (4 bits)."
                },
                {
                  "name": "power_control",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Power control. 0=disabled, 1=enabled."
                },
                {
                  "name": "current_tx_power",
                  "byte": 0,
                  "bit": 2,
                  "bits": 1,
                  "type": "bool",
                  "description": "Current TX power. 0=reduced, 1=high."
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "add": -400,
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. value = (raw - 400) / 10 °C."
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %."
                },
                {
                  "name": "pm_1",
                  "byte": 4,
                  "type": "u16",
                  "unit": "ug/m3",
                  "description": "PM1.0 mass concentration in µg/m³."
                },
                {
                  "name": "pm_25",
                  "byte": 6,
                  "type": "u16",
                  "unit": "ug/m3",
                  "description": "PM2.5 mass concentration in µg/m³."
                },
                {
                  "name": "pm_10",
                  "byte": 8,
                  "type": "u16",
                  "unit": "ug/m3",
                  "description": "PM10 mass concentration in µg/m³."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "reconf",
                  "byte": 0,
                  "bit": 7,
                  "bits": 1,
                  "type": "bool",
                  "description": "Apply configuration update. 0=ignore, 1=apply."
                },
                {
                  "name": "active_power_control",
                  "byte": 0,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "Active power control. 0=disabled, 1=enabled."
                },
                {
                  "name": "sampling_interval",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sampling interval code. Decoded as (raw + 2) * 5 min.",
                  "add": 2,
                  "mult": 5,
                  "unit": "min"
                },
                {
                  "name": "reserved",
                  "byte": 2,
                  "type": "bytes",
                  "length": 6,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_pm_r2_2",
      "device": "Airwits PM",
      "version": "R2.2",
      "note": "",
      "schema": {
        "name": "airwits_pm_r2_2",
        "device": "Airwits PM",
        "device_version": "R2.2",
        "radio_technologies": [
          "Sigfox"
        ],
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Measurement plus Sys0/Sys1, downlink with tx_power.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble (4 bits)."
                },
                {
                  "name": "txp_reduct",
                  "byte": 0,
                  "bit": 1,
                  "bits": 2,
                  "type": "u8",
                  "description": "TX power class [0=0dB, 1=1dB, 2=3dB, 3=6dB]."
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. value = raw / 10 °C."
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %."
                },
                {
                  "name": "pm_1",
                  "byte": 4,
                  "type": "u16",
                  "div": 10,
                  "unit": "ug/m3",
                  "description": "PM1.0 mass concentration. value = raw / 10 µg/m³."
                },
                {
                  "name": "pm_25",
                  "byte": 6,
                  "type": "u16",
                  "div": 10,
                  "unit": "ug/m3",
                  "description": "PM2.5 mass concentration. value = raw / 10 µg/m³."
                },
                {
                  "name": "pm_10",
                  "byte": 8,
                  "type": "u16",
                  "div": 10,
                  "unit": "ug/m3",
                  "description": "PM10 mass concentration. value = raw / 10 µg/m³."
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "tx_power",
                  "byte": 0,
                  "bit": 6,
                  "bits": 2,
                  "type": "u8",
                  "description": "Transmit power index (2 bits)."
                },
                {
                  "name": "sampling_interval",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sampling interval. Decoded as (raw + 2) * 5 min.",
                  "add": 2,
                  "mult": 5,
                  "unit": "min"
                },
                {
                  "name": "reserved",
                  "byte": 2,
                  "type": "bytes",
                  "length": 6,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_pm_r3_3",
      "device": "Airwits PM",
      "version": "R3.3",
      "note": "",
      "schema": {
        "name": "airwits_pm_r3_3",
        "device": "Airwits PM",
        "device_version": "R3.3",
        "radio_technologies": [
          "Sigfox",
          "LoRaWAN"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits PM R3.3 uplink and downlink.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble (4 bits)."
                },
                {
                  "name": "txp_reduction_class",
                  "byte": 0,
                  "bit": 1,
                  "bits": 2,
                  "type": "u8",
                  "description": "0=0dB, 1=1dB, 2=3dB, 3=6dB.",
                  "default_value": 1
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. value = raw / 10 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "pm_1",
                  "byte": 4,
                  "type": "u16",
                  "div": 10,
                  "unit": "ug/m3",
                  "description": "PM1.0 mass concentration. value = raw / 10 µg/m³.",
                  "sentinel_values": [
                    {
                      "raw": 65526,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "pm_25",
                  "byte": 6,
                  "type": "u16",
                  "div": 10,
                  "unit": "ug/m3",
                  "description": "PM2.5 mass concentration. value = raw / 10 µg/m³.",
                  "sentinel_values": [
                    {
                      "raw": 65526,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "pm_4",
                  "byte": 8,
                  "type": "u16",
                  "div": 10,
                  "unit": "ug/m3",
                  "description": "PM4 mass concentration. value = raw / 10 µg/m³."
                },
                {
                  "name": "pm_10",
                  "byte": 10,
                  "type": "u16",
                  "div": 10,
                  "unit": "ug/m3",
                  "description": "PM10 mass concentration. value = raw / 10 µg/m³.",
                  "sentinel_values": [
                    {
                      "raw": 65526,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 6,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "txp_mode",
                  "byte": 0,
                  "bit": 6,
                  "bits": 2,
                  "type": "u8",
                  "description": "ETSI only: 0=0dB, 1=1dB, 2=auto-3dB, 3=auto-6dB.",
                  "default_value": 1
                },
                {
                  "name": "send_interval",
                  "byte": 1,
                  "type": "u8",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "description": "Send interval config. (raw + 2) * 5 min. Min 11min, Max 18h",
                  "default_value": 4
                },
                {
                  "name": "pm_warmup",
                  "byte": 2,
                  "type": "u8",
                  "unit": "s",
                  "description": "PM warmup time.",
                  "default_value": 3
                },
                {
                  "name": "pm_measure",
                  "byte": 3,
                  "type": "u8",
                  "unit": "s",
                  "description": "PM averaging time.",
                  "default_value": 4
                },
                {
                  "name": "reserved",
                  "byte": 4,
                  "type": "bytes",
                  "length": 4,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_pm_r3_4",
      "device": "Airwits PM",
      "version": "R3.4",
      "note": "",
      "schema": {
        "name": "airwits_pm_r3_4",
        "device": "Airwits PM",
        "device_version": "R3.4",
        "radio_technologies": [
          "Sigfox",
          "LoRaWAN"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits PM R3.4 uplink and downlink. Measurement payload is 11 bytes with four PM observations packed as 14-bit unsigned x10 values.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "description": "11 bytes. PM values are packed MSB-first into bytes 4-10 in order PM1.0, PM2.5, PM4.0, PM10.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble (4 bits). R3.4 / S4a uses value 4."
                },
                {
                  "name": "txp_reduction_class",
                  "byte": 0,
                  "bit": 1,
                  "bits": 2,
                  "type": "u8",
                  "description": "0=0dB, 1=1dB, 2=3dB, 3=6dB.",
                  "default_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "0 dB"
                    },
                    {
                      "value": 1,
                      "label": "1 dB"
                    },
                    {
                      "value": 2,
                      "label": "3 dB"
                    },
                    {
                      "value": 3,
                      "label": "6 dB"
                    }
                  ]
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "u8",
                  "description": "Reserved. Set to 0.",
                  "default_value": 0
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. Decoded as raw / 10 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "pm_1",
                  "byte": 4,
                  "bit": 2,
                  "bits": 14,
                  "type": "u16",
                  "div": 10,
                  "unit": "ug/m3",
                  "description": "PM1.0 mass concentration. Decoded as raw / 10 µg/m³. Raw extraction: ((payload[4] << 8) | payload[5]) >> 2."
                },
                {
                  "name": "pm_25",
                  "byte": 5,
                  "bit": 4,
                  "bits": 14,
                  "type": "u16",
                  "div": 10,
                  "unit": "ug/m3",
                  "description": "PM2.5 mass concentration. Decoded as raw / 10 µg/m³. Raw extraction: (((payload[5] << 16) | (payload[6] << 8) | payload[7]) >> 4) & 0x3FFF."
                },
                {
                  "name": "pm_4",
                  "byte": 7,
                  "bit": 6,
                  "bits": 14,
                  "type": "u16",
                  "div": 10,
                  "unit": "ug/m3",
                  "description": "PM4.0 mass concentration. Decoded as raw / 10 µg/m³. Raw extraction: (((payload[7] << 16) | (payload[8] << 8) | payload[9]) >> 6) & 0x3FFF."
                },
                {
                  "name": "pm_10",
                  "byte": 9,
                  "bit": 0,
                  "bits": 14,
                  "type": "u16",
                  "div": 10,
                  "unit": "ug/m3",
                  "description": "PM10 mass concentration. Decoded as raw / 10 µg/m³. Raw extraction: ((payload[9] << 8) | payload[10]) & 0x3FFF."
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 6,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "txp_mode",
                  "byte": 0,
                  "bit": 6,
                  "bits": 2,
                  "type": "u8",
                  "description": "ETSI only: 0=full power, 1=optimized -1dB, 2=auto-3dB, 3=auto-6dB.",
                  "default_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "Full power"
                    },
                    {
                      "value": 1,
                      "label": "Optimized -1 dB"
                    },
                    {
                      "value": 2,
                      "label": "Auto 3 dB"
                    },
                    {
                      "value": 3,
                      "label": "Auto 6 dB"
                    }
                  ]
                },
                {
                  "name": "send_interval",
                  "byte": 1,
                  "type": "u8",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "description": "Message send interval. Decoded as (raw + 2) * 5 min. Firmware enforces minimum 11 min.",
                  "default_value": 4
                },
                {
                  "name": "pm_warmup",
                  "byte": 2,
                  "type": "u8",
                  "unit": "s",
                  "description": "PM sensor warm-up time in seconds. Raw 0 uses firmware default.",
                  "default_value": 4
                },
                {
                  "name": "pm_measure",
                  "byte": 3,
                  "type": "u8",
                  "unit": "s",
                  "description": "PM sensor measurement/averaging time in seconds. Raw 0 uses firmware default.",
                  "default_value": 3
                },
                {
                  "name": "reserved",
                  "byte": 4,
                  "type": "bytes",
                  "length": 4,
                  "description": "Reserved. Set all bytes to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "airwits_tvoc_r1",
      "device": "Airwits TVOC",
      "version": "R1",
      "note": "",
      "schema": {
        "name": "airwits_tvoc_r1",
        "device": "Airwits TVOC",
        "device_version": "R1",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits TVOC R1 uplink.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "fields": [
                {
                  "name": "temperature",
                  "byte": 0,
                  "type": "i16",
                  "add": -400,
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. value = (raw - 400) / 10 °C."
                },
                {
                  "name": "humidity",
                  "byte": 2,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %."
                },
                {
                  "name": "tvoc_val",
                  "byte": 3,
                  "type": "u16",
                  "unit": "ppb",
                  "description": "TVOC concentration in ppb."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": []
        }
      }
    },
    {
      "slug": "airwits_multisense_r1_1",
      "device": "MultiSense",
      "version": "R1.1",
      "note": "",
      "schema": {
        "name": "airwits_multisense_r1_1",
        "device": "MultiSense",
        "device_version": "R1.1",
        "radio_technologies": [
          "Sigfox",
          "LoRaWAN"
        ],
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Airwits MultiSense and MultiSense Plus H1c S1a. Same payloads on Sigfox and LoRaWAN (port 7). Measurement 12 bytes, Sys0 8 bytes, Sys1 11 bytes, downlink 8 bytes.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "description": "12 bytes. PM1.0/PM2.5/PM10 are 10-bit values packed in bytes 8-11 (0x3FF = error per value).",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble. S1a reports 1."
                },
                {
                  "name": "on_battery",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "bool",
                  "description": "Power source. 0=USB-C, 1=battery."
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 1,
                  "bits": 2,
                  "type": "u8",
                  "description": "Reserved. Always 0.",
                  "fixed_value": 0
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Ambient temperature. Decoded as raw / 10 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %, 0..100.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "co2_level",
                  "byte": 4,
                  "type": "u16",
                  "unit": "ppm",
                  "description": "CO2 concentration in ppm after software auto-calibration (420 ppm target, 7-day period). Floored to 420 ppm during the first 24 h after boot.",
                  "sentinel_values": [
                    {
                      "raw": 0,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "tvoc",
                  "byte": 6,
                  "type": "u16",
                  "unit": "ppb",
                  "description": "TVOC concentration in ppb. 0xFFFF during the first 27 minutes after boot (sensor settling) or on sensor error.",
                  "sentinel_values": [
                    {
                      "raw": 65535,
                      "meaning": "not_ready",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "pm_1",
                  "byte": 8,
                  "bit": 6,
                  "bits": 10,
                  "type": "u16",
                  "unit": "ug/m3",
                  "description": "PM1.0 mass concentration in µg/m³, 0..1000. Raw extraction: (((payload[8] << 8) | payload[9]) >> 6) & 0x3FF.",
                  "sentinel_values": [
                    {
                      "raw": 1023,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "pm_25",
                  "byte": 9,
                  "bit": 4,
                  "bits": 10,
                  "type": "u16",
                  "unit": "ug/m3",
                  "description": "PM2.5 mass concentration in µg/m³, 0..1000. Raw extraction: (((payload[9] << 8) | payload[10]) >> 4) & 0x3FF.",
                  "sentinel_values": [
                    {
                      "raw": 1023,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "pm_10",
                  "byte": 10,
                  "bit": 2,
                  "bits": 10,
                  "type": "u16",
                  "unit": "ug/m3",
                  "description": "PM10 mass concentration in µg/m³, 0..1000. Raw extraction: (((payload[10] << 8) | payload[11]) >> 2) & 0x3FF.",
                  "sentinel_values": [
                    {
                      "raw": 1023,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes. Sent once at boot (after join on LoRaWAN).",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Build-selected radio regions. High nibble = LoRaWAN region, low nibble = Sigfox RC."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes. Sent after every applied downlink and as a daily report. Bytes 3-10 echo the active configuration in the downlink layout (PM steps always nibble-packed in byte 3).",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "Thousands of uplinks sent since power-on. Always 0 in S1a."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 20,
                  "unit": "V",
                  "description": "Battery voltage during last transmission in 50 mV units. Decoded as raw / 20 V."
                },
                {
                  "name": "reserved_cfg_b0_7",
                  "byte": 3,
                  "bit": 7,
                  "bits": 1,
                  "type": "u8",
                  "description": "Reserved. Echo of downlink byte 0 bit 7."
                },
                {
                  "name": "cfg_led_disable",
                  "byte": 3,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "Active LED setting. 0=LEDs follow AQI policy, 1=LEDs off."
                },
                {
                  "name": "cfg_battery_save_disable",
                  "byte": 3,
                  "bit": 5,
                  "bits": 1,
                  "type": "bool",
                  "description": "Active battery-save setting. 0=battery uses battery-save defaults, 1=downlink cadence also applies on battery."
                },
                {
                  "name": "reserved_cfg_b0_0_4",
                  "byte": 3,
                  "bit": 0,
                  "bits": 5,
                  "type": "u8",
                  "description": "Reserved. Always 0."
                },
                {
                  "name": "cfg_measurement_interval",
                  "byte": 4,
                  "type": "u8",
                  "add": 1,
                  "unit": "min",
                  "description": "Active USB measurement interval. Decoded as raw + 1 min (after cadence guard widening)."
                },
                {
                  "name": "cfg_send_after_n_meas",
                  "byte": 5,
                  "type": "u8",
                  "add": 1,
                  "description": "Active USB send cadence. Uplink every raw + 1 measurement blocks."
                },
                {
                  "name": "cfg_pm_warmup",
                  "byte": 6,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "add": 1,
                  "mult": 4,
                  "unit": "s",
                  "description": "Active PM sensor warm-up. Decoded as (raw + 1) * 4 s."
                },
                {
                  "name": "cfg_pm_measure",
                  "byte": 6,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "add": 1,
                  "unit": "s",
                  "description": "Active PM sensor measurement window. Decoded as raw + 1 s."
                },
                {
                  "name": "reserved_cfg",
                  "byte": 7,
                  "type": "bytes",
                  "length": 4,
                  "description": "Reserved. Always 0."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "description": "8 bytes (LoRaWAN port 7). Applied immediately and echoed in Sys1. Settings apply to USB-C power; on battery the device keeps battery-save defaults (30 min interval, send every block, PM 4 s + 3 s) unless battery_save_disable = 1. The device also accepts PM steps split as byte 3 = warm-up, byte 4 = measure; this tool encodes the nibble-packed layout.",
              "fields": [
                {
                  "name": "reserved_b0_7",
                  "byte": 0,
                  "bit": 7,
                  "bits": 1,
                  "type": "u8",
                  "description": "Reserved. Keep 0.",
                  "fixed_value": 0
                },
                {
                  "name": "led_disable",
                  "byte": 0,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "Status LED. 0=LEDs follow AQI policy, 1=LEDs off at all times (both power modes).",
                  "default_value": 0
                },
                {
                  "name": "battery_save_disable",
                  "byte": 0,
                  "bit": 5,
                  "bits": 1,
                  "type": "bool",
                  "description": "0=downlink settings apply to USB-C power only, 1=also apply them on battery.",
                  "default_value": 0
                },
                {
                  "name": "reserved_b0_0_4",
                  "byte": 0,
                  "bit": 0,
                  "bits": 5,
                  "type": "u8",
                  "description": "Reserved. Must be 0; the device rejects the downlink otherwise.",
                  "fixed_value": 0
                },
                {
                  "name": "measurement_interval",
                  "byte": 1,
                  "type": "u8",
                  "add": 1,
                  "unit": "min",
                  "description": "Measurement interval. Decoded as raw + 1 min. Raw above 239 is clamped to 240 min. The device may widen too-short intervals to fit PM timing. Default 5 min (Headless: 15 min).",
                  "default_value": 4
                },
                {
                  "name": "send_after_n_meas",
                  "byte": 2,
                  "type": "u8",
                  "add": 1,
                  "description": "Send cadence. Uplink every raw + 1 measurement blocks. Default every 3 blocks (Headless: every block).",
                  "default_value": 2
                },
                {
                  "name": "pm_warmup",
                  "byte": 3,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "add": 1,
                  "mult": 4,
                  "unit": "s",
                  "description": "PM sensor warm-up time. Decoded as (raw + 1) * 4 s, 4..64 s.",
                  "default_value": 7
                },
                {
                  "name": "pm_measure",
                  "byte": 3,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "add": 1,
                  "unit": "s",
                  "description": "PM sensor measurement window. Decoded as raw + 1 s, 1..16 s.",
                  "default_value": 4
                },
                {
                  "name": "reserved",
                  "byte": 4,
                  "type": "bytes",
                  "length": 4,
                  "description": "Reserved. Keep 0x00.",
                  "fixed_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "detectify_r1_1",
      "device": "Detectify",
      "version": "R1.1",
      "note": "",
      "schema": {
        "name": "detectify_r1_1",
        "device": "Detectify",
        "device_version": "R1.1",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Detectify R1.1 uplink and downlink.",
        "uplink": {
          "payloads": [
            {
              "name": "space_status",
              "description": "Single-byte occupancy status.",
              "fields": [
                {
                  "name": "status_code",
                  "byte": 0,
                  "type": "u8",
                  "description": "Occupancy status. 0=space_available_no_movement, 255=space_occupied_movement_detected.",
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "space_available_no_movement"
                    },
                    {
                      "value": 255,
                      "label": "space_occupied_movement_detected"
                    }
                  ]
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "detection_interval",
                  "byte": 0,
                  "type": "u8",
                  "unit": "min",
                  "description": "Detection interval in min."
                },
                {
                  "name": "occupied_send_interval",
                  "byte": 1,
                  "type": "u8",
                  "unit": "min",
                  "description": "Send interval when occupied, in min."
                },
                {
                  "name": "available_send_interval",
                  "byte": 2,
                  "type": "u8",
                  "unit": "min",
                  "description": "Send interval when available, in min."
                },
                {
                  "name": "reserved",
                  "byte": 3,
                  "type": "bytes",
                  "length": 5,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "detectify_r2",
      "device": "Detectify",
      "version": "R2",
      "note": "Same payload format as Detectify R1.1.",
      "schema": {
        "name": "detectify_r2",
        "device": "Detectify",
        "device_version": "R2",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Detectify R2 uplink and downlink.",
        "uplink": {
          "payloads": [
            {
              "name": "space_status",
              "description": "Single-byte occupancy status.",
              "fields": [
                {
                  "name": "status_code",
                  "byte": 0,
                  "type": "u8",
                  "description": "Occupancy status. 0=space_available_no_movement, 255=space_occupied_movement_detected.",
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "space_available_no_movement"
                    },
                    {
                      "value": 255,
                      "label": "space_occupied_movement_detected"
                    }
                  ]
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "detection_interval",
                  "byte": 0,
                  "type": "u8",
                  "unit": "min",
                  "description": "Detection interval in min."
                },
                {
                  "name": "occupied_send_interval",
                  "byte": 1,
                  "type": "u8",
                  "unit": "min",
                  "description": "Send interval when occupied, in min."
                },
                {
                  "name": "available_send_interval",
                  "byte": 2,
                  "type": "u8",
                  "unit": "min",
                  "description": "Send interval when available, in min."
                },
                {
                  "name": "reserved",
                  "byte": 3,
                  "type": "bytes",
                  "length": 5,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "detectify_r3_1",
      "device": "Detectify",
      "version": "R3.1",
      "note": "",
      "schema": {
        "name": "detectify_r3_1",
        "device": "Detectify",
        "device_version": "R3.1",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Detectify R3.1 uplink and downlink.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "fields": [
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble."
                },
                {
                  "name": "power_control",
                  "byte": 0,
                  "bit": 4,
                  "bits": 1,
                  "type": "bool",
                  "description": "Power control flag."
                },
                {
                  "name": "full_tx_power",
                  "byte": 0,
                  "bit": 5,
                  "bits": 1,
                  "type": "bool",
                  "description": "Full transmit power flag."
                },
                {
                  "name": "activity_count_period",
                  "byte": 1,
                  "type": "u16",
                  "description": "Activity count period."
                },
                {
                  "name": "cumulative_activity_count",
                  "byte": 3,
                  "type": "u32",
                  "description": "Cumulative activity count."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "activity_reporting_period",
                  "byte": 0,
                  "type": "u8",
                  "add": 1,
                  "mult": 10,
                  "unit": "min",
                  "description": "Activity reporting period. Decoded as (raw + 1) * 10 min."
                },
                {
                  "name": "inactivity_reporting_period",
                  "byte": 1,
                  "type": "u8",
                  "add": 1,
                  "mult": 10,
                  "unit": "min",
                  "description": "Inactivity reporting period. Decoded as (raw + 1) * 10 min."
                },
                {
                  "name": "apc_reconfigure",
                  "byte": 2,
                  "bit": 0,
                  "bits": 1,
                  "type": "bool",
                  "description": "APC reconfigure flag."
                },
                {
                  "name": "active_power_control",
                  "byte": 2,
                  "bit": 1,
                  "bits": 1,
                  "type": "bool",
                  "description": "Active power control flag."
                },
                {
                  "name": "reserved",
                  "byte": 3,
                  "type": "bytes",
                  "length": 5,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "detectify_r3_2",
      "device": "Detectify",
      "version": "R3.2",
      "note": "",
      "schema": {
        "name": "detectify_r3_2",
        "device": "Detectify",
        "device_version": "R3.2",
        "radio_technologies": [
          "Sigfox"
        ],
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "No system messages in parser.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "fields": [
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "power_control",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Power control. 0=disabled, 1=enabled."
                },
                {
                  "name": "current_tx_power",
                  "byte": 0,
                  "bit": 2,
                  "bits": 1,
                  "type": "bool",
                  "description": "Current TX power. 0=reduced, 1=high."
                },
                {
                  "name": "activity_status",
                  "byte": 0,
                  "bit": 1,
                  "bits": 1,
                  "type": "bool",
                  "description": "Activity status flag."
                },
                {
                  "name": "activity_count",
                  "byte": 1,
                  "type": "u16",
                  "description": "Activity count."
                },
                {
                  "name": "cumulative_activity_count",
                  "byte": 3,
                  "type": "u32",
                  "description": "Cumulative activity count."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "power_control",
                  "byte": 0,
                  "bit": 1,
                  "bits": 1,
                  "type": "bool",
                  "description": "TX power reduction control. 0=off, 1=on.",
                  "default_value": 1
                },
                {
                  "name": "reconfigure",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "bool",
                  "description": "Reconfigure flag. 0=no, 1=yes."
                },
                {
                  "name": "activity_reporting_period",
                  "byte": 1,
                  "type": "u8",
                  "add": 2,
                  "mult": 11,
                  "div": 2,
                  "unit": "min",
                  "description": "Activity reporting period. Decoded as (raw+2)*5.5 min.",
                  "default_value": 4
                },
                {
                  "name": "inactivity_reporting_period",
                  "byte": 2,
                  "type": "u8",
                  "add": 2,
                  "mult": 11,
                  "div": 2,
                  "unit": "min",
                  "description": "Inactivity reporting period. Decoded as (raw+2)*5.5 min.",
                  "default_value": 85
                },
                {
                  "name": "inactivity_detection_period",
                  "byte": 3,
                  "type": "u8",
                  "add": 1,
                  "mult": 11,
                  "div": 2,
                  "unit": "min",
                  "description": "Inactivity detection period. Decoded as (raw+1)*5.5 min.",
                  "default_value": 2
                },
                {
                  "name": "reserved",
                  "byte": 4,
                  "type": "bytes",
                  "length": 4,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "detectify_r4_3",
      "device": "Detectify",
      "version": "R4.3",
      "note": "",
      "schema": {
        "name": "detectify_r4_3",
        "device": "Detectify",
        "device_version": "R4.3",
        "radio_technologies": [
          "Sigfox"
        ],
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Detectify R4.3; measurement (msgchk 0,2,4,6), Sys0 (8), Sys1 (9).",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "activity_status",
                  "byte": 0,
                  "bit": 2,
                  "bits": 1,
                  "type": "bool",
                  "description": "Activity status flag."
                },
                {
                  "name": "state_change",
                  "byte": 0,
                  "bit": 1,
                  "bits": 1,
                  "type": "bool",
                  "description": "State change flag."
                },
                {
                  "name": "activity_count",
                  "byte": 1,
                  "type": "u16",
                  "optional": true,
                  "description": "Activity count."
                },
                {
                  "name": "cumulative_activity_count",
                  "byte": 3,
                  "type": "u32",
                  "optional": true,
                  "description": "Cumulative activity count."
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "send_activity_count",
                  "byte": 0,
                  "bit": 7,
                  "bits": 1,
                  "type": "bool",
                  "description": "Include activity count in uplink. 0=no, 1=yes."
                },
                {
                  "name": "resend_inactivity",
                  "byte": 0,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "Resend inactivity flag. 0=no, 1=yes."
                },
                {
                  "name": "resend_activity",
                  "byte": 0,
                  "bit": 5,
                  "bits": 1,
                  "type": "bool",
                  "description": "Resend activity flag. 0=no, 1=yes."
                },
                {
                  "name": "activity_reporting_period",
                  "byte": 1,
                  "type": "u8",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "description": "Activity reporting period. Decoded as (raw+2)*5 min."
                },
                {
                  "name": "inactivity_reporting_period",
                  "byte": 2,
                  "type": "u8",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "description": "Inactivity reporting period. Decoded as (raw+2)*5 min."
                },
                {
                  "name": "inactivity_detection_period",
                  "byte": 3,
                  "type": "u8",
                  "add": 1,
                  "mult": 5,
                  "unit": "min",
                  "description": "Inactivity detection period. Decoded as (raw+1)*5 min."
                },
                {
                  "name": "reserved",
                  "byte": 4,
                  "type": "bytes",
                  "length": 4,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "detectify_r5_3",
      "device": "Detectify",
      "version": "R5.3",
      "note": "",
      "schema": {
        "name": "detectify_r5_3",
        "device": "Detectify",
        "device_version": "R5.3",
        "radio_technologies": [
          "Sigfox",
          "LoRaWAN"
        ],
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Measurement when msgchk le 7 and bit3 eq 0. Sys0 8, Sys1 9.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "txp",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "bool",
                  "description": "Transmit power flag."
                },
                {
                  "name": "activity_status",
                  "byte": 0,
                  "bit": 2,
                  "bits": 1,
                  "type": "bool",
                  "description": "Activity status flag."
                },
                {
                  "name": "state_change",
                  "byte": 0,
                  "bit": 1,
                  "bits": 1,
                  "type": "bool",
                  "description": "State change flag."
                },
                {
                  "name": "activity_count",
                  "byte": 1,
                  "type": "u16",
                  "optional": true,
                  "description": "Activity count."
                },
                {
                  "name": "cumulative_activity_count",
                  "byte": 3,
                  "type": "u32",
                  "optional": true,
                  "description": "Cumulative activity count."
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "send_activity_count",
                  "byte": 0,
                  "bit": 7,
                  "bits": 1,
                  "type": "bool",
                  "description": "Include activity count in uplink. 0=no, 1=yes."
                },
                {
                  "name": "resend_inactivity",
                  "byte": 0,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "Resend inactivity flag. 0=no, 1=yes."
                },
                {
                  "name": "resend_activity",
                  "byte": 0,
                  "bit": 5,
                  "bits": 1,
                  "type": "bool",
                  "description": "Resend activity flag. 0=no, 1=yes."
                },
                {
                  "name": "txp_reduct",
                  "byte": 0,
                  "bit": 0,
                  "bits": 2,
                  "type": "u8",
                  "description": "ETSI only transmit power setting [0=0dB, 1=1dB, 2=auto-3dB, 3=auto-6dB]",
                  "valid_values": [
                    0,
                    1,
                    2,
                    3
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "0 dB"
                    },
                    {
                      "value": 1,
                      "label": "1 dB"
                    },
                    {
                      "value": 2,
                      "label": "Auto 3 dB"
                    },
                    {
                      "value": 3,
                      "label": "Auto 6 dB"
                    }
                  ],
                  "default_value": 1
                },
                {
                  "name": "activity_reporting_period",
                  "byte": 1,
                  "type": "u8",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "description": "Activity reporting period. Decoded as (raw+2)*5 min."
                },
                {
                  "name": "inactivity_reporting_period",
                  "byte": 2,
                  "type": "u8",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "description": "Inactivity reporting period. Decoded as (raw+2)*5 min."
                },
                {
                  "name": "inactivity_detection_period",
                  "byte": 3,
                  "type": "u8",
                  "add": 1,
                  "mult": 5,
                  "unit": "min",
                  "description": "Inactivity detection period. Decoded as (raw+1)*5 min."
                },
                {
                  "name": "reserved",
                  "byte": 4,
                  "type": "bytes",
                  "length": 4,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "detectify_r6_5",
      "device": "Detectify",
      "version": "R6.5",
      "note": "",
      "schema": {
        "name": "detectify_r6_5",
        "device": "Detectify",
        "device_version": "R6.5",
        "radio_technologies": [
          "Sigfox"
        ],
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Detectify R6.5 Sigfox payloads. Measurement (1/7B), Sys0 (8B), Sys1 (11B), config downlink (8B).",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "description": "Measurement message. Header-only (1B) or with counters (7B).",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "fixed_value": 0,
                  "description": "0 = measurement payload."
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble."
                },
                {
                  "name": "state",
                  "byte": 0,
                  "bit": 2,
                  "bits": 1,
                  "type": "bool",
                  "description": "0=inactive, 1=active."
                },
                {
                  "name": "state_changed",
                  "byte": 0,
                  "bit": 1,
                  "bits": 1,
                  "type": "bool",
                  "description": "0=no change, 1=state changed."
                },
                {
                  "name": "reserved_0",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "u8",
                  "description": "Reserved, always 0. TX config visible in SYS1 config echo.",
                  "default_value": 0
                },
                {
                  "name": "period_activity",
                  "byte": 1,
                  "type": "u16",
                  "optional": true,
                  "description": "Activity count during period. Present only when counters enabled."
                },
                {
                  "name": "cumulative_activity",
                  "byte": 3,
                  "type": "u32",
                  "optional": true,
                  "description": "Cumulative activity count. Present only when counters enabled."
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "description": "Configuration downlink, 8 bytes (Sigfox). Byte0 low nibble (txp_reduction + baudrate) matches R7 wire format.",
              "fields": [
                {
                  "name": "txp_reduction",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "TX power reduction in dB from full power. Raw value is the reduction amount, not absolute TX power.",
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ],
                  "default_value": 0
                },
                {
                  "name": "baudrate",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "u8",
                  "description": "Sigfox bitrate. 0=100 bps, 1=600 bps. DL-request uplinks always use 100 bps + full power.",
                  "valid_values": [
                    0,
                    1
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "100 bps"
                    },
                    {
                      "value": 1,
                      "label": "600 bps"
                    }
                  ],
                  "default_value": 1
                },
                {
                  "name": "reserved_0",
                  "byte": 0,
                  "bit": 4,
                  "bits": 3,
                  "type": "u8",
                  "description": "Reserved. Must be 0.",
                  "default_value": 0
                },
                {
                  "name": "send_activity_counts",
                  "byte": 0,
                  "bit": 7,
                  "bits": 1,
                  "type": "bool",
                  "description": "0=header-only measurement, 1=include counters (7-byte measurement).",
                  "valid_values": [
                    0,
                    1
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "off"
                    },
                    {
                      "value": 1,
                      "label": "on"
                    }
                  ],
                  "default_value": 0
                },
                {
                  "name": "activity_reporting_period_cfg",
                  "byte": 1,
                  "type": "u8",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "description": "ARP period in minutes (linearized): decoded as (raw+2)*5 min.",
                  "default_value": 2
                },
                {
                  "name": "inactivity_reporting_period_cfg",
                  "byte": 2,
                  "type": "u8",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "description": "IRP period in minutes (linearized): decoded as (raw+2)*5 min.",
                  "default_value": 94
                },
                {
                  "name": "inactivity_detection_period_cfg",
                  "byte": 3,
                  "type": "u8",
                  "add": 1,
                  "mult": 1,
                  "unit": "min",
                  "description": "IDP period in minutes: decoded as (raw+1)*1 min.",
                  "default_value": 14
                },
                {
                  "name": "reserved",
                  "byte": 4,
                  "type": "bytes",
                  "length": 4,
                  "description": "Reserved. Must be all zero.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "detectify_r7_5",
      "device": "Detectify",
      "version": "R7.5",
      "note": "",
      "schema": {
        "name": "detectify_r7_5",
        "device": "Detectify",
        "device_version": "R7.5",
        "radio_technologies": [
          "LoRaWAN"
        ],
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Detectify R7.5 LoRaWAN payloads. Measurement (1/7B), Sys0 (8B), Sys1 (11B), config downlink (8B) on port 7.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "description": "Measurement message. Header-only (1B) or with counters (7B).",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "fixed_value": 0,
                  "description": "0 = measurement payload."
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble."
                },
                {
                  "name": "state",
                  "byte": 0,
                  "bit": 2,
                  "bits": 1,
                  "type": "bool",
                  "description": "0=inactive, 1=active."
                },
                {
                  "name": "state_changed",
                  "byte": 0,
                  "bit": 1,
                  "bits": 1,
                  "type": "bool",
                  "description": "0=no change, 1=state changed."
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "u8",
                  "description": "Reserved.",
                  "default_value": 0
                },
                {
                  "name": "period_activity",
                  "byte": 1,
                  "type": "u16",
                  "optional": true,
                  "description": "Activity count during period. Present only when counters enabled."
                },
                {
                  "name": "cumulative_activity",
                  "byte": 3,
                  "type": "u32",
                  "optional": true,
                  "description": "Cumulative activity count. Present only when counters enabled."
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "description": "Configuration downlink, 8 bytes, expected on LoRaWAN port 7.",
              "fields": [
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 7,
                  "type": "u8",
                  "description": "Reserved. Must be 0.",
                  "default_value": 0
                },
                {
                  "name": "send_activity_counts",
                  "byte": 0,
                  "bit": 7,
                  "bits": 1,
                  "type": "bool",
                  "description": "0=header-only measurement, 1=include counters (7-byte measurement).",
                  "valid_values": [
                    0,
                    1
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "off"
                    },
                    {
                      "value": 1,
                      "label": "on"
                    }
                  ],
                  "default_value": 0
                },
                {
                  "name": "activity_reporting_period_cfg",
                  "byte": 1,
                  "type": "u8",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "description": "ARP period in minutes (linearized): decoded as (raw+2)*5 min.",
                  "default_value": 2
                },
                {
                  "name": "inactivity_reporting_period_cfg",
                  "byte": 2,
                  "type": "u8",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "description": "IRP period in minutes (linearized): decoded as (raw+2)*5 min.",
                  "default_value": 94
                },
                {
                  "name": "inactivity_detection_period_cfg",
                  "byte": 3,
                  "type": "u8",
                  "add": 1,
                  "mult": 1,
                  "unit": "min",
                  "description": "IDP period in minutes: decoded as (raw+1)*1 min.",
                  "default_value": 14
                },
                {
                  "name": "reserved",
                  "byte": 4,
                  "type": "bytes",
                  "length": 4,
                  "description": "Reserved. Must be all zero.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "ecosense_r1_1",
      "device": "EcoSense",
      "version": "R1.1",
      "note": "",
      "schema": {
        "name": "ecosense_r1_1",
        "device": "EcoSense",
        "device_version": "R1.1",
        "radio_technologies": [
          "Sigfox",
          "LoRaWAN"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "EcoSense R1.1 uplink and downlink.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "txp_reduct",
                  "byte": 0,
                  "bit": 1,
                  "bits": 2,
                  "type": "u8",
                  "description": "TX power class [0=0dB, 1=1dB, 2=3dB, 3=6dB]."
                },
                {
                  "name": "device_esm",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "bool",
                  "description": "Energy-save mode flag."
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Temperature. Decoded as raw / 10 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "lux",
                  "byte": 4,
                  "type": "u16",
                  "unit": "lx",
                  "description": "Illuminance in lx."
                },
                {
                  "name": "energy_reserve",
                  "byte": 6,
                  "type": "u8",
                  "description": "Energy reserve level."
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                },
                {
                  "name": "tx_power",
                  "byte": 0,
                  "bit": 5,
                  "bits": 2,
                  "type": "u8",
                  "description": "Transmit power class."
                },
                {
                  "name": "sampling_interval",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sampling interval. Decoded as (raw + 2) * 5 min.",
                  "add": 2,
                  "mult": 5,
                  "unit": "min"
                },
                {
                  "name": "esm_interval",
                  "byte": 2,
                  "type": "u8",
                  "description": "Energy-save-mode interval. Decoded as (raw + 2) * 5 min.",
                  "add": 2,
                  "mult": 5,
                  "unit": "min"
                },
                {
                  "name": "lpm_energy_level",
                  "byte": 3,
                  "type": "u8",
                  "description": "Low-power-mode energy level."
                },
                {
                  "name": "reserved",
                  "byte": 4,
                  "type": "bytes",
                  "length": 4,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "ecosense_r2_2",
      "device": "EcoSense",
      "version": "R2.2",
      "note": "",
      "schema": {
        "name": "ecosense_r2_2",
        "device": "EcoSense",
        "device_version": "R2.2",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "EcoSense R2.2 uplink and downlink payload layout.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "description": "Measurement message (7 bytes), selected when is_system_message == 0.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Measurement discriminator bit.",
                  "fixed_value": 0
                },
                {
                  "name": "reserved_header_bits",
                  "byte": 0,
                  "bit": 1,
                  "bits": 2,
                  "type": "u8",
                  "description": "Reserved (legacy tx-power-class bits). Keep 0.",
                  "fixed_value": 0
                },
                {
                  "name": "energy_saving_mode",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "bool",
                  "description": "Energy saving mode flag. 0=normal, 1=low-energy mode."
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i16",
                  "div": 10,
                  "unit": "°C",
                  "description": "Temperature. Decoded as raw / 10 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Relative humidity in %."
                },
                {
                  "name": "lux",
                  "byte": 4,
                  "type": "u16",
                  "unit": "lx",
                  "description": "Illuminance in lux."
                },
                {
                  "name": "energy_reserve",
                  "byte": 6,
                  "type": "u8",
                  "unit": "%",
                  "description": "Estimated energy reserve in %."
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "description": "EcoSense R2.2 configuration downlink (8 bytes).",
              "fields": [
                {
                  "name": "reserved1",
                  "byte": 0,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "description": "Reserved. Keep 0x0.",
                  "default_value": 0
                },
                {
                  "name": "txp_reduction",
                  "byte": 0,
                  "bit": 4,
                  "bits": 3,
                  "type": "u8",
                  "description": "TX power reduction in dB (0..7). 0 means 0 dB reduction.",
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "0 dB"
                    },
                    {
                      "value": 1,
                      "label": "1 dB"
                    },
                    {
                      "value": 2,
                      "label": "2 dB"
                    },
                    {
                      "value": 3,
                      "label": "3 dB"
                    },
                    {
                      "value": 4,
                      "label": "4 dB"
                    },
                    {
                      "value": 5,
                      "label": "5 dB"
                    },
                    {
                      "value": 6,
                      "label": "6 dB"
                    },
                    {
                      "value": 7,
                      "label": "7 dB"
                    }
                  ],
                  "default_value": 0
                },
                {
                  "name": "baudrate",
                  "byte": 0,
                  "bit": 7,
                  "bits": 1,
                  "type": "u8",
                  "description": "Uplink bitrate selector. 0=100 bps, 1=600 bps.",
                  "valid_values": [
                    0,
                    1
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "100 bps"
                    },
                    {
                      "value": 1,
                      "label": "600 bps"
                    }
                  ],
                  "default_value": 1
                },
                {
                  "name": "sampling_interval",
                  "byte": 1,
                  "type": "u8",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "description": "Normal mode transmission interval. Decoded as (raw + 2) * 5 min.",
                  "default_value": 10
                },
                {
                  "name": "esm_sampling_interval",
                  "byte": 2,
                  "type": "u8",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "description": "Low-energy mode transmission interval. Decoded as (raw + 2) * 5 min.",
                  "default_value": 22
                },
                {
                  "name": "esm_threshold_percentage",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Low-energy mode threshold in percent (0..100).",
                  "default_value": 30
                },
                {
                  "name": "reserved3",
                  "byte": 4,
                  "type": "bytes",
                  "length": 4,
                  "description": "Reserved. Keep all bytes 0x00.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "flex_sense_r1_1",
      "device": "FlexSense",
      "version": "R1.1",
      "note": "",
      "schema": {
        "name": "flex_sense_r1_1",
        "device": "FlexSense",
        "device_version": "R1.1",
        "radio_technologies": [
          "Sigfox"
        ],
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "FlexSense R1.1; measurement (msgchk 0,2,4,6), Sys0 (8), Sys1 (9).",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "s1_alert",
                  "byte": 0,
                  "bit": 2,
                  "bits": 1,
                  "type": "bool",
                  "description": "Sensor 1 alert flag."
                },
                {
                  "name": "s2_alert",
                  "byte": 0,
                  "bit": 1,
                  "bits": 1,
                  "type": "bool",
                  "description": "Sensor 2 alert flag."
                },
                {
                  "name": "t1",
                  "byte": 1,
                  "type": "i16",
                  "div": 100,
                  "unit": "°C",
                  "description": "Temperature sensor 1. Decoded as raw / 100 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "no_sensor_data",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "h1",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Humidity sensor 1 in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "no_sensor_data",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "t2",
                  "byte": 4,
                  "type": "i16",
                  "div": 100,
                  "unit": "°C",
                  "description": "Temperature sensor 2. Decoded as raw / 100 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "no_sensor_data",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "h2",
                  "byte": 6,
                  "type": "u8",
                  "unit": "%",
                  "description": "Humidity sensor 2 in %.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "no_sensor_data",
                      "output": null
                    }
                  ]
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "reporting_period",
                  "byte": 0,
                  "type": "u8",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "description": "Reporting period. Decoded as (raw+2)*5 min."
                },
                {
                  "name": "alerting_strategy",
                  "byte": 1,
                  "bit": 0,
                  "bits": 1,
                  "type": "bool",
                  "description": "Alerting strategy. 0=every reporting period, 1=every 11 min."
                },
                {
                  "name": "sampling_rate_minus1",
                  "byte": 1,
                  "bit": 1,
                  "bits": 7,
                  "type": "u8",
                  "description": "Sampling rate minus 1. Decode: sampling_rate = raw + 1."
                },
                {
                  "name": "s1_trigger_count_minus1",
                  "byte": 2,
                  "bit": 0,
                  "bits": 6,
                  "type": "u8",
                  "description": "Sensor 1 trigger count minus 1. Decode: count = raw + 1."
                },
                {
                  "name": "s1_threshold_type",
                  "byte": 2,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "Sensor 1 threshold type. 0=below, 1=above."
                },
                {
                  "name": "s1_alert_enable",
                  "byte": 2,
                  "bit": 7,
                  "bits": 1,
                  "type": "bool",
                  "description": "Sensor 1 alert enable. 0=off, 1=on."
                },
                {
                  "name": "s1_threshold",
                  "byte": 3,
                  "type": "i16",
                  "div": 100,
                  "unit": "°C",
                  "description": "Sensor 1 temperature threshold. Decoded as raw/100 °C."
                },
                {
                  "name": "s2_trigger_count_minus1",
                  "byte": 5,
                  "bit": 0,
                  "bits": 6,
                  "type": "u8",
                  "description": "Sensor 2 trigger count minus 1. Decode: count = raw + 1."
                },
                {
                  "name": "s2_threshold_type",
                  "byte": 5,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "Sensor 2 threshold type. 0=below, 1=above."
                },
                {
                  "name": "s2_alert_enable",
                  "byte": 5,
                  "bit": 7,
                  "bits": 1,
                  "type": "bool",
                  "description": "Sensor 2 alert enable. 0=off, 1=on."
                },
                {
                  "name": "s2_threshold",
                  "byte": 6,
                  "type": "i16",
                  "div": 100,
                  "unit": "°C",
                  "description": "Sensor 2 temperature threshold. Decoded as raw/100 °C."
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "flex_sense_r2_1",
      "device": "FlexSense",
      "version": "R2.1",
      "note": "",
      "schema": {
        "name": "flex_sense_r2_1",
        "device": "FlexSense",
        "device_version": "R2.1",
        "radio_technologies": [
          "Sigfox"
        ],
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "FlexSense R2.1; measurement (msgchk 0-7), Sys0 (8), Sys1 (9), downlink with tx power.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "pctrl",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "bool",
                  "description": "Power control flag."
                },
                {
                  "name": "s1_alert",
                  "byte": 0,
                  "bit": 2,
                  "bits": 1,
                  "type": "bool",
                  "description": "Sensor 1 alert flag."
                },
                {
                  "name": "s2_alert",
                  "byte": 0,
                  "bit": 1,
                  "bits": 1,
                  "type": "bool",
                  "description": "Sensor 2 alert flag."
                },
                {
                  "name": "flx_auto_power",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "bool",
                  "description": "Flex auto power flag."
                },
                {
                  "name": "t1",
                  "byte": 1,
                  "type": "i16",
                  "div": 100,
                  "description": "Temperature sensor 1. Decoded as raw / 100.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "no_sensor_data",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "h1",
                  "byte": 3,
                  "type": "u8",
                  "description": "Humidity sensor 1.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "no_sensor_data",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "t2",
                  "byte": 4,
                  "type": "i16",
                  "div": 100,
                  "description": "Temperature sensor 2. Decoded as raw / 100.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "no_sensor_data",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "h2",
                  "byte": 6,
                  "type": "u8",
                  "description": "Humidity sensor 2.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "no_sensor_data",
                      "output": null
                    }
                  ]
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sigfox Radio Zone + LoRa variant within the zone."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "reporting_period_code",
                  "byte": 0,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "description": "Reporting period code. 0..15 maps to 11,15,20,25,30,45,60,90,120,180,240,300,360,540,720,1440 min.",
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15
                  ]
                },
                {
                  "name": "txp_reduct",
                  "byte": 0,
                  "bit": 4,
                  "bits": 2,
                  "type": "u8",
                  "description": "ETSI only transmit power setting [0=0dB, 1=1dB, 2=auto-3dB, 3=auto-6dB]",
                  "valid_values": [
                    0,
                    1,
                    2,
                    3
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "0 dB"
                    },
                    {
                      "value": 1,
                      "label": "1 dB"
                    },
                    {
                      "value": 2,
                      "label": "Auto 3 dB"
                    },
                    {
                      "value": 3,
                      "label": "Auto 6 dB"
                    }
                  ],
                  "default_value": 1
                },
                {
                  "name": "alerting_strategy",
                  "byte": 1,
                  "bit": 0,
                  "bits": 1,
                  "type": "bool",
                  "description": "Alerting strategy. 0=every reporting period, 1=every 11 min."
                },
                {
                  "name": "sampling_rate_minus1",
                  "byte": 1,
                  "bit": 1,
                  "bits": 7,
                  "type": "u8",
                  "description": "Sampling rate minus 1. Decode: sampling_rate = raw + 1."
                },
                {
                  "name": "s1_trigger_count_minus1",
                  "byte": 2,
                  "bit": 0,
                  "bits": 6,
                  "type": "u8",
                  "description": "Sensor 1 trigger count minus 1. Decode: count = raw + 1."
                },
                {
                  "name": "s1_threshold_type",
                  "byte": 2,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "Sensor 1 threshold type. 0=below, 1=above."
                },
                {
                  "name": "s1_alert_enable",
                  "byte": 2,
                  "bit": 7,
                  "bits": 1,
                  "type": "bool",
                  "description": "Sensor 1 alert enable. 0=off, 1=on."
                },
                {
                  "name": "s1_threshold",
                  "byte": 3,
                  "type": "i16",
                  "div": 100,
                  "unit": "°C",
                  "description": "Sensor 1 temperature threshold. Decoded as raw/100 °C."
                },
                {
                  "name": "s2_trigger_count_minus1",
                  "byte": 5,
                  "bit": 0,
                  "bits": 6,
                  "type": "u8",
                  "description": "Sensor 2 trigger count minus 1. Decode: count = raw + 1."
                },
                {
                  "name": "s2_threshold_type",
                  "byte": 5,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "Sensor 2 threshold type. 0=below, 1=above."
                },
                {
                  "name": "s2_alert_enable",
                  "byte": 5,
                  "bit": 7,
                  "bits": 1,
                  "type": "bool",
                  "description": "Sensor 2 alert enable. 0=off, 1=on."
                },
                {
                  "name": "s2_threshold",
                  "byte": 6,
                  "type": "i16",
                  "div": 100,
                  "unit": "°C",
                  "description": "Sensor 2 temperature threshold. Decoded as raw/100 °C."
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "flex_sense_r4_3",
      "device": "FlexSense",
      "version": "R4.3",
      "note": "",
      "schema": {
        "name": "flex_sense_r4_3",
        "device": "FlexSense",
        "device_version": "R4.3",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "FlexSense R4.3; measurement (8 bytes), Sys0 (8 bytes), Sys1 (11 bytes), and 8-byte downlink config for BRM81W1 RC1.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "description": "Measurement payload. Byte 0 bit 0 is reserved in R4.3; no auto-power field is present.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "u8",
                  "description": "Reserved. Set to 0. Previous FlexSense generations exposed this bit as an auto-power flag.",
                  "fixed_value": 0,
                  "default_value": 0
                },
                {
                  "name": "sensor1_alert",
                  "byte": 0,
                  "bit": 1,
                  "bits": 1,
                  "type": "bool",
                  "description": "Sensor 1 alert flag."
                },
                {
                  "name": "sensor2_alert",
                  "byte": 0,
                  "bit": 2,
                  "bits": 1,
                  "type": "bool",
                  "description": "Sensor 2 alert flag."
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for measurement payloads.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble. R4.3 production firmware reports 3."
                },
                {
                  "name": "temperature1",
                  "byte": 1,
                  "type": "i16",
                  "div": 100,
                  "unit": "°C",
                  "description": "Temperature sensor 1. Decoded as raw / 100 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "missing_or_error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity1",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Humidity sensor 1 in %. 0xFF means humidity is missing or not applicable for temperature-only probes.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "missing_or_not_applicable",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "temperature2",
                  "byte": 4,
                  "type": "i16",
                  "div": 100,
                  "unit": "°C",
                  "description": "Temperature sensor 2. Decoded as raw / 100 °C.",
                  "sentinel_values": [
                    {
                      "raw": 32768,
                      "meaning": "missing_or_error",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "humidity2",
                  "byte": 6,
                  "type": "u8",
                  "unit": "%",
                  "description": "Humidity sensor 2 in %. 0xFF means humidity is missing or not applicable for temperature-only probes.",
                  "sentinel_values": [
                    {
                      "raw": 255,
                      "meaning": "missing_or_not_applicable",
                      "output": null
                    }
                  ]
                },
                {
                  "name": "reserved",
                  "byte": 7,
                  "bit": 0,
                  "bits": 2,
                  "type": "u8",
                  "description": "Reserved. Set to 0.",
                  "fixed_value": 0,
                  "default_value": 0
                },
                {
                  "name": "probe2_kind",
                  "byte": 7,
                  "bit": 2,
                  "bits": 2,
                  "type": "u8",
                  "description": "Probe 2 kind. 0=none, 1=digital_th, 2=digital_t, 3=analog_t.",
                  "valid_values": [
                    0,
                    1,
                    2,
                    3
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "none"
                    },
                    {
                      "value": 1,
                      "label": "digital_th"
                    },
                    {
                      "value": 2,
                      "label": "digital_t"
                    },
                    {
                      "value": 3,
                      "label": "analog_t"
                    }
                  ]
                },
                {
                  "name": "reserved",
                  "byte": 7,
                  "bit": 4,
                  "bits": 2,
                  "type": "u8",
                  "description": "Reserved. Set to 0.",
                  "fixed_value": 0,
                  "default_value": 0
                },
                {
                  "name": "probe1_kind",
                  "byte": 7,
                  "bit": 6,
                  "bits": 2,
                  "type": "u8",
                  "description": "Probe 1 kind. 0=none, 1=digital_th, 2=digital_t, 3=analog_t.",
                  "valid_values": [
                    0,
                    1,
                    2,
                    3
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "none"
                    },
                    {
                      "value": 1,
                      "label": "digital_th"
                    },
                    {
                      "value": 2,
                      "label": "digital_t"
                    },
                    {
                      "value": 3,
                      "label": "analog_t"
                    }
                  ]
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble. R4.3 production firmware reports 3."
                },
                {
                  "name": "reserved",
                  "byte": 1,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "description": "Reserved. Set to 0.",
                  "fixed_value": 0,
                  "default_value": 0
                },
                {
                  "name": "radio_zone",
                  "byte": 1,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Sigfox radio zone. FlexSense R4.3 uses RC1 only.",
                  "fixed_value": 1,
                  "default_value": 1
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier. R4 hardware reports 4."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier. FlexSense is 0x12 (18)."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build timestamp identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble. R4.3 production firmware reports 3."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand uplinks have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "description": "8-byte downlink configuration payload.",
              "fields": [
                {
                  "name": "reporting_period_code",
                  "byte": 0,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "description": "Reporting period code. 0..15 maps to 11,15,20,25,30,45,60,90,120,180,240,300,360,540,720,1440 min.",
                  "default_value": 6,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "11 min"
                    },
                    {
                      "value": 1,
                      "label": "15 min"
                    },
                    {
                      "value": 2,
                      "label": "20 min"
                    },
                    {
                      "value": 3,
                      "label": "25 min"
                    },
                    {
                      "value": 4,
                      "label": "30 min"
                    },
                    {
                      "value": 5,
                      "label": "45 min"
                    },
                    {
                      "value": 6,
                      "label": "60 min"
                    },
                    {
                      "value": 7,
                      "label": "90 min"
                    },
                    {
                      "value": 8,
                      "label": "120 min"
                    },
                    {
                      "value": 9,
                      "label": "180 min"
                    },
                    {
                      "value": 10,
                      "label": "240 min"
                    },
                    {
                      "value": 11,
                      "label": "300 min"
                    },
                    {
                      "value": 12,
                      "label": "360 min"
                    },
                    {
                      "value": 13,
                      "label": "540 min"
                    },
                    {
                      "value": 14,
                      "label": "720 min"
                    },
                    {
                      "value": 15,
                      "label": "1440 min"
                    }
                  ]
                },
                {
                  "name": "tx_power_reduction",
                  "byte": 0,
                  "bit": 4,
                  "bits": 3,
                  "type": "u8",
                  "unit": "dB",
                  "description": "BRM81W1 TX power reduction in dB. Effective TX power is reduced separately by firmware; this field reports the reduction value, not absolute dBm.",
                  "default_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "0 dB"
                    },
                    {
                      "value": 1,
                      "label": "1 dB"
                    },
                    {
                      "value": 2,
                      "label": "2 dB"
                    },
                    {
                      "value": 3,
                      "label": "3 dB"
                    },
                    {
                      "value": 4,
                      "label": "4 dB"
                    },
                    {
                      "value": 5,
                      "label": "5 dB"
                    },
                    {
                      "value": 6,
                      "label": "6 dB"
                    },
                    {
                      "value": 7,
                      "label": "7 dB"
                    }
                  ]
                },
                {
                  "name": "bitrate",
                  "byte": 0,
                  "bit": 7,
                  "bits": 1,
                  "type": "u8",
                  "description": "BRM81W1 TX data rate. 0 = 100 bps, 1 = 600 bps. Downlink-request transmissions are forced to 100 bps by firmware.",
                  "default_value": 1,
                  "valid_values": [
                    0,
                    1
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "100 bps"
                    },
                    {
                      "value": 1,
                      "label": "600 bps"
                    }
                  ]
                },
                {
                  "name": "alerting_strategy",
                  "byte": 1,
                  "bit": 0,
                  "bits": 1,
                  "type": "bool",
                  "description": "Alerting strategy. 0=every reporting period, 1=every 11 min.",
                  "default_value": 0
                },
                {
                  "name": "sampling_rate_minus1",
                  "byte": 1,
                  "bit": 1,
                  "bits": 7,
                  "type": "u8",
                  "description": "Sampling rate minus 1. Decode: sampling_rate = raw + 1 samples per reporting period.",
                  "default_value": 0
                },
                {
                  "name": "sensor1_trigger_count_minus1",
                  "byte": 2,
                  "bit": 0,
                  "bits": 6,
                  "type": "u8",
                  "description": "Sensor 1 trigger count minus 1. Decode: count = raw + 1.",
                  "default_value": 0
                },
                {
                  "name": "sensor1_threshold_type",
                  "byte": 2,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "Sensor 1 threshold type. 0=below, 1=above.",
                  "default_value": 0
                },
                {
                  "name": "sensor1_alert_enable",
                  "byte": 2,
                  "bit": 7,
                  "bits": 1,
                  "type": "bool",
                  "description": "Sensor 1 alert enable. 0=off, 1=on.",
                  "default_value": 0
                },
                {
                  "name": "sensor1_threshold",
                  "byte": 3,
                  "type": "i16",
                  "div": 100,
                  "unit": "°C",
                  "description": "Sensor 1 temperature threshold. Decoded as raw / 100 °C.",
                  "default_value": 0
                },
                {
                  "name": "sensor2_trigger_count_minus1",
                  "byte": 5,
                  "bit": 0,
                  "bits": 6,
                  "type": "u8",
                  "description": "Sensor 2 trigger count minus 1. Decode: count = raw + 1.",
                  "default_value": 0
                },
                {
                  "name": "sensor2_threshold_type",
                  "byte": 5,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "Sensor 2 threshold type. 0=below, 1=above.",
                  "default_value": 0
                },
                {
                  "name": "sensor2_alert_enable",
                  "byte": 5,
                  "bit": 7,
                  "bits": 1,
                  "type": "bool",
                  "description": "Sensor 2 alert enable. 0=off, 1=on.",
                  "default_value": 0
                },
                {
                  "name": "sensor2_threshold",
                  "byte": 6,
                  "type": "i16",
                  "div": 100,
                  "unit": "°C",
                  "description": "Sensor 2 temperature threshold. Decoded as raw / 100 °C.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "press_guard_r3",
      "device": "PressGuard",
      "version": "R3",
      "note": "",
      "schema": {
        "name": "press_guard_r3",
        "device": "PressGuard",
        "device_version": "R3",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "PressGuard R3 uplink and downlink.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "description": "Only message type; no header byte.",
              "fields": [
                {
                  "name": "pressure_difference",
                  "byte": 0,
                  "type": "u16",
                  "add": -5000,
                  "div": 10,
                  "unit": "Pa",
                  "description": "Pressure difference. Decoded as (raw + (-5000)) / 10 Pa."
                },
                {
                  "name": "temperature",
                  "byte": 2,
                  "type": "u16",
                  "add": -400,
                  "div": 10,
                  "unit": "°C",
                  "description": "Temperature. Decoded as (raw + (-400)) / 10 °C."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "transmission_interval_code",
                  "byte": 0,
                  "type": "u8",
                  "description": "Transmission interval. 1=10 min, 2=20 min, 3=30 min (default), 4=1 h, 5=2 h.",
                  "valid_values": [
                    1,
                    2,
                    3,
                    4,
                    5
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "not_applicable"
                    },
                    {
                      "value": 1,
                      "label": "10_min"
                    },
                    {
                      "value": 2,
                      "label": "20_min"
                    },
                    {
                      "value": 3,
                      "label": "30_min_default"
                    },
                    {
                      "value": 4,
                      "label": "1_h"
                    },
                    {
                      "value": 5,
                      "label": "2_h"
                    },
                    {
                      "value": 6,
                      "label": "not_applicable"
                    },
                    {
                      "value": 7,
                      "label": "not_applicable"
                    },
                    {
                      "value": 8,
                      "label": "not_applicable"
                    },
                    {
                      "value": 9,
                      "label": "not_applicable"
                    },
                    {
                      "value": 10,
                      "label": "not_applicable"
                    },
                    {
                      "value": 11,
                      "label": "not_applicable"
                    },
                    {
                      "value": 12,
                      "label": "not_applicable"
                    },
                    {
                      "value": 13,
                      "label": "not_applicable"
                    },
                    {
                      "value": 14,
                      "label": "not_applicable"
                    },
                    {
                      "value": 15,
                      "label": "not_applicable"
                    }
                  ]
                },
                {
                  "name": "measurement_interval_code",
                  "byte": 1,
                  "type": "u8",
                  "description": "Measurement interval. 1=10 min, 2=20 min, 3=30 min (default), 4=1 h, 5=2 h.",
                  "valid_values": [
                    1,
                    2,
                    3,
                    4,
                    5
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "not_applicable"
                    },
                    {
                      "value": 1,
                      "label": "10_min"
                    },
                    {
                      "value": 2,
                      "label": "20_min"
                    },
                    {
                      "value": 3,
                      "label": "30_min_default"
                    },
                    {
                      "value": 4,
                      "label": "1_h"
                    },
                    {
                      "value": 5,
                      "label": "2_h"
                    },
                    {
                      "value": 6,
                      "label": "not_applicable"
                    },
                    {
                      "value": 7,
                      "label": "not_applicable"
                    },
                    {
                      "value": 8,
                      "label": "not_applicable"
                    },
                    {
                      "value": 9,
                      "label": "not_applicable"
                    },
                    {
                      "value": 10,
                      "label": "not_applicable"
                    },
                    {
                      "value": 11,
                      "label": "not_applicable"
                    },
                    {
                      "value": 12,
                      "label": "not_applicable"
                    },
                    {
                      "value": 13,
                      "label": "not_applicable"
                    },
                    {
                      "value": 14,
                      "label": "not_applicable"
                    },
                    {
                      "value": 15,
                      "label": "not_applicable"
                    }
                  ]
                },
                {
                  "name": "pressure_difference_delta_threshold",
                  "byte": 2,
                  "type": "u8",
                  "div": 10,
                  "unit": "Pa",
                  "description": "Pressure difference delta threshold. Decoded as raw / 10 Pa."
                },
                {
                  "name": "reserved",
                  "byte": 3,
                  "type": "bytes",
                  "length": 5,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "press_guard_r4_1",
      "device": "PressGuard",
      "version": "R4.1",
      "note": "",
      "schema": {
        "name": "press_guard_r4_1",
        "device": "PressGuard",
        "device_version": "R4.1",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "PressGuard R4.1 uplink and downlink.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "fields": [
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "current_tx_power",
                  "byte": 0,
                  "bit": 2,
                  "bits": 1,
                  "type": "bool",
                  "description": "Current TX power. 0=reduced, 1=high."
                },
                {
                  "name": "power_control",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Power control. 0=disabled, 1=enabled."
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i8",
                  "add": -40,
                  "unit": "°C",
                  "description": "Temperature. Decoded as raw + (-40) °C."
                },
                {
                  "name": "pressure",
                  "byte": 2,
                  "type": "u16",
                  "div": 10,
                  "add": -500,
                  "unit": "hPa",
                  "description": "Pressure. Decoded as (raw + (-500)) / 10 hPa."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "reconf",
                  "byte": 0,
                  "bit": 7,
                  "bits": 1,
                  "type": "bool",
                  "description": "Apply configuration update. 0=ignore, 1=apply."
                },
                {
                  "name": "active_power_control",
                  "byte": 0,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "Active power control. 0=disabled, 1=enabled."
                },
                {
                  "name": "sampling_interval",
                  "byte": 1,
                  "type": "u8",
                  "description": "Sampling interval code. Decoded as (raw + 2) * 5 min.",
                  "add": 2,
                  "mult": 5,
                  "unit": "min"
                },
                {
                  "name": "reserved",
                  "byte": 2,
                  "type": "bytes",
                  "length": 6,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "press_guard_r5_2_sigfox",
      "device": "PressGuard",
      "version": "R5.2 (Sigfox)",
      "note": "PressGuard H5a S2b Sigfox. Send interval is (raw+2)*5 min, minimum 11 min.",
      "schema": {
        "name": "press_guard_r5_2_sigfox",
        "device": "PressGuard",
        "device_version": "R5.2",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "PressGuard R5.2 Sigfox uplink and downlink. Measurement is 4 bytes (header, temperature, differential pressure). Sys0 is 8 bytes, Sys1 is 11 bytes, config downlink is 8 bytes.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "description": "Measurement message (4 bytes), selected when is_system_message == 0.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "0 = measurement payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble (4 bits). R5.2 / S2b reports 2."
                },
                {
                  "name": "txp_reduct",
                  "byte": 0,
                  "bit": 1,
                  "bits": 2,
                  "type": "u8",
                  "description": "TX power class used for this uplink. 0=0 dB, 1=-1 dB, 2=auto-3 dB, 3=auto-6 dB. ETSI Sigfox only; other regions report 0 dB.",
                  "valid_values": [
                    0,
                    1,
                    2,
                    3
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "0 dB"
                    },
                    {
                      "value": 1,
                      "label": "-1 dB"
                    },
                    {
                      "value": 2,
                      "label": "Auto 3 dB"
                    },
                    {
                      "value": 3,
                      "label": "Auto 6 dB"
                    }
                  ]
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "u8",
                  "description": "Reserved. Keep 0.",
                  "default_value": 0
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i8",
                  "unit": "°C",
                  "description": "Temperature in 1 °C steps. Range -20 .. 85 °C. Sensor error is reported as 0."
                },
                {
                  "name": "diff_pressure",
                  "byte": 2,
                  "type": "i16",
                  "div": 10,
                  "unit": "Pa",
                  "description": "Differential pressure. Decoded as raw / 10 Pa. Range -500.0 .. 500.0 Pa. Sensor error is reported as 0.0."
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble. R5.2 / S2b reports 2."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Packed as 0xAB: A = Sigfox radio zone, B = LoRaWAN variant within that zone. Known values: 10=RC1/EU868, 20=RC2/US915, 41=RC4/AS923, 42=RC4/AU915."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier. PressGuard R5.2 (H5a) reports 5."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier. PressGuard reports 29."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes. Sent after a downlink.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble. R5.2 / S2b reports 2."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "description": "PressGuard R5.2 Sigfox configuration downlink (8 bytes).",
              "fields": [
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 6,
                  "type": "u8",
                  "description": "Reserved. Keep 0x00.",
                  "default_value": 0
                },
                {
                  "name": "txp_reduct",
                  "byte": 0,
                  "bit": 6,
                  "bits": 2,
                  "type": "u8",
                  "description": "ETSI only transmit power setting. 0=0 dB, 1=-1 dB, 2=auto-3 dB, 3=auto-6 dB.",
                  "valid_values": [
                    0,
                    1,
                    2,
                    3
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "0 dB"
                    },
                    {
                      "value": 1,
                      "label": "-1 dB"
                    },
                    {
                      "value": 2,
                      "label": "Auto 3 dB"
                    },
                    {
                      "value": 3,
                      "label": "Auto 6 dB"
                    }
                  ],
                  "default_value": 1
                },
                {
                  "name": "send_interval",
                  "byte": 1,
                  "type": "u8",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "description": "Message send interval. Decoded as (raw + 2) * 5 min. Raw 0 is clamped to 11 min (Sigfox duty cycle).",
                  "default_value": 4
                },
                {
                  "name": "reserved",
                  "byte": 2,
                  "type": "bytes",
                  "length": 6,
                  "description": "Reserved. Keep all bytes 0x00.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "press_guard_r5_2_lorawan",
      "device": "PressGuard",
      "version": "R5.2 (LoRaWAN)",
      "note": "PressGuard H5a S2b LoRaWAN. Send interval is (raw+1)*1 min. Uplink layout matches the Sigfox variant.",
      "schema": {
        "name": "press_guard_r5_2_lorawan",
        "device": "PressGuard",
        "device_version": "R5.2",
        "radio_technologies": [
          "LoRaWAN"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "PressGuard R5.2 LoRaWAN uplink and downlink. Measurement is 4 bytes (header, temperature, differential pressure). Sys0 is 8 bytes, Sys1 is 11 bytes, config downlink is 8 bytes.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "description": "Measurement message (4 bytes), selected when is_system_message == 0.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "0 = measurement payload.",
                  "fixed_value": 0
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Firmware version nibble (4 bits). R5.2 / S2b reports 2."
                },
                {
                  "name": "txp_reduct",
                  "byte": 0,
                  "bit": 1,
                  "bits": 2,
                  "type": "u8",
                  "description": "TX power class used for this uplink. 0=0 dB, 1=-1 dB, 2=auto-3 dB, 3=auto-6 dB. LoRaWAN uplinks report 0 dB.",
                  "valid_values": [
                    0,
                    1,
                    2,
                    3
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "0 dB"
                    },
                    {
                      "value": 1,
                      "label": "-1 dB"
                    },
                    {
                      "value": 2,
                      "label": "Auto 3 dB"
                    },
                    {
                      "value": 3,
                      "label": "Auto 6 dB"
                    }
                  ]
                },
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 1,
                  "type": "u8",
                  "description": "Reserved. Keep 0.",
                  "default_value": 0
                },
                {
                  "name": "temperature",
                  "byte": 1,
                  "type": "i8",
                  "unit": "°C",
                  "description": "Temperature in 1 °C steps. Range -20 .. 85 °C. Sensor error is reported as 0."
                },
                {
                  "name": "diff_pressure",
                  "byte": 2,
                  "type": "i16",
                  "div": 10,
                  "unit": "Pa",
                  "description": "Differential pressure. Decoded as raw / 10 Pa. Range -500.0 .. 500.0 Pa. Sensor error is reported as 0.0."
                }
              ]
            },
            {
              "name": "system_msg_0",
              "description": "System message function 0 (startup/device info), 8 bytes.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 0
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 0 for function 0.",
                  "fixed_value": 0,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble. R5.2 / S2b reports 2."
                },
                {
                  "name": "cf_radio_region",
                  "byte": 1,
                  "type": "u8",
                  "description": "Packed as 0xAB: A = Sigfox radio zone, B = LoRaWAN variant within that zone. Known values: 10=RC1/EU868, 20=RC2/US915, 41=RC4/AS923, 42=RC4/AU915."
                },
                {
                  "name": "hw_release",
                  "byte": 2,
                  "type": "u8",
                  "description": "Hardware release identifier. PressGuard R5.2 (H5a) reports 5."
                },
                {
                  "name": "device_type",
                  "byte": 3,
                  "type": "u8",
                  "description": "Device type identifier. PressGuard reports 29."
                },
                {
                  "name": "firmware_build",
                  "byte": 4,
                  "type": "u32",
                  "description": "Firmware build identifier."
                }
              ]
            },
            {
              "name": "system_msg_1",
              "description": "System message function 1 (status/config echo), 11 bytes. Sent after a downlink.",
              "discriminator": {
                "byte": 0,
                "bit": 3,
                "bits": 1,
                "value": 1
              },
              "discriminator_function": {
                "byte": 0,
                "bit": 0,
                "bits": 3,
                "value": 1
              },
              "fields": [
                {
                  "name": "system_message_function",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Always 1 for function 1.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "is_system_message",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Always 1 for system messages.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble. R5.2 / S2b reports 2."
                },
                {
                  "name": "message_count1000",
                  "byte": 1,
                  "type": "u8",
                  "mult": 1000,
                  "description": "How many thousand messages have been sent since power on."
                },
                {
                  "name": "last_tx_voltage",
                  "byte": 2,
                  "type": "u8",
                  "div": 50,
                  "unit": "V",
                  "description": "Last TX voltage. Decoded as raw / 50 V."
                },
                {
                  "name": "config",
                  "byte": 3,
                  "type": "bytes",
                  "length": 8,
                  "description": "Active downlink configuration bytes."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "description": "PressGuard R5.2 LoRaWAN configuration downlink (8 bytes).",
              "fields": [
                {
                  "name": "reserved",
                  "byte": 0,
                  "bit": 0,
                  "bits": 6,
                  "type": "u8",
                  "description": "Reserved. Keep 0x00.",
                  "default_value": 0
                },
                {
                  "name": "txp_reduct",
                  "byte": 0,
                  "bit": 6,
                  "bits": 2,
                  "type": "u8",
                  "description": "ETSI only transmit power setting. 0=0 dB, 1=-1 dB, 2=auto-3 dB, 3=auto-6 dB. Present in the payload but not used in LoRaWAN mode.",
                  "valid_values": [
                    0,
                    1,
                    2,
                    3
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "0 dB"
                    },
                    {
                      "value": 1,
                      "label": "-1 dB"
                    },
                    {
                      "value": 2,
                      "label": "Auto 3 dB"
                    },
                    {
                      "value": 3,
                      "label": "Auto 6 dB"
                    }
                  ],
                  "default_value": 1
                },
                {
                  "name": "send_interval",
                  "byte": 1,
                  "type": "u8",
                  "add": 1,
                  "mult": 1,
                  "unit": "min",
                  "description": "Message send interval. Decoded as (raw + 1) * 1 min.",
                  "default_value": 29
                },
                {
                  "name": "reserved",
                  "byte": 2,
                  "type": "bytes",
                  "length": 6,
                  "description": "Reserved. Keep all bytes 0x00.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "multiguard_r2",
      "device": "MultiGuard",
      "version": "R2",
      "note": "",
      "schema": {
        "name": "multiguard_r2",
        "device": "MultiGuard",
        "device_version": "R2",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "MultiGuard R2 uplink; voltage/current/pulse by device_type.",
        "uplink": {
          "payloads": [
            {
              "name": "voltage",
              "discriminator": {
                "byte": 0,
                "bit": 0,
                "bits": 8,
                "value": 1
              },
              "fields": [
                {
                  "name": "message_type",
                  "byte": 0,
                  "bit": 0,
                  "bits": 8,
                  "type": "u8",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 1,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15,
                    16,
                    17,
                    18,
                    19,
                    20,
                    21,
                    22,
                    23,
                    24,
                    25,
                    26,
                    27,
                    28,
                    29,
                    30,
                    31,
                    32,
                    33,
                    34,
                    35,
                    36,
                    37,
                    38,
                    39,
                    40,
                    41,
                    42,
                    43,
                    44,
                    45,
                    46,
                    47,
                    48,
                    49,
                    50,
                    51,
                    52,
                    53,
                    54,
                    55,
                    56,
                    57,
                    58,
                    59,
                    60,
                    61,
                    62,
                    63,
                    64,
                    65,
                    66,
                    67,
                    68,
                    69,
                    70,
                    71,
                    72,
                    73,
                    74,
                    75,
                    76,
                    77,
                    78,
                    79,
                    80,
                    81,
                    82,
                    83,
                    84,
                    85,
                    86,
                    87,
                    88,
                    89,
                    90,
                    91,
                    92,
                    93,
                    94,
                    95,
                    96,
                    97,
                    98,
                    99,
                    100,
                    101,
                    102,
                    103,
                    104,
                    105,
                    106,
                    107,
                    108,
                    109,
                    110,
                    111,
                    112,
                    113,
                    114,
                    115,
                    116,
                    117,
                    118,
                    119,
                    120,
                    121,
                    122,
                    123,
                    124,
                    125,
                    126,
                    127,
                    128,
                    129,
                    130,
                    131,
                    132,
                    133,
                    134,
                    135,
                    136,
                    137,
                    138,
                    139,
                    140,
                    141,
                    142,
                    143,
                    144,
                    145,
                    146,
                    147,
                    148,
                    149,
                    150,
                    151,
                    152,
                    153,
                    154,
                    155,
                    156,
                    157,
                    158,
                    159,
                    160,
                    161,
                    162,
                    163,
                    164,
                    165,
                    166,
                    167,
                    168,
                    169,
                    170,
                    171,
                    172,
                    173,
                    174,
                    175,
                    176,
                    177,
                    178,
                    179,
                    180,
                    181,
                    182,
                    183,
                    184,
                    185,
                    186,
                    187,
                    188,
                    189,
                    190,
                    191,
                    192,
                    193,
                    194,
                    195,
                    196,
                    197,
                    198,
                    199,
                    200,
                    201,
                    202,
                    203,
                    204,
                    205,
                    206,
                    207,
                    208,
                    209,
                    210,
                    211,
                    212,
                    213,
                    214,
                    215,
                    216,
                    217,
                    218,
                    219,
                    220,
                    221,
                    222,
                    223,
                    224,
                    225,
                    226,
                    227,
                    228,
                    229,
                    230,
                    231,
                    232,
                    233,
                    234,
                    235,
                    236,
                    237,
                    238,
                    239,
                    240,
                    241,
                    242,
                    243,
                    244,
                    245,
                    246,
                    247,
                    248,
                    249,
                    250,
                    251,
                    252,
                    253,
                    254,
                    255
                  ]
                },
                {
                  "name": "device_type",
                  "byte": 0,
                  "type": "u8",
                  "description": "Device type (1=voltage)."
                },
                {
                  "name": "device_vol",
                  "byte": 1,
                  "type": "u16",
                  "mult": 2,
                  "unit": "V",
                  "description": "Voltage. Decoded as raw * 2 V."
                }
              ]
            },
            {
              "name": "current",
              "discriminator": {
                "byte": 0,
                "bit": 0,
                "bits": 8,
                "value": 2
              },
              "fields": [
                {
                  "name": "message_type",
                  "byte": 0,
                  "bit": 0,
                  "bits": 8,
                  "type": "u8",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 2,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15,
                    16,
                    17,
                    18,
                    19,
                    20,
                    21,
                    22,
                    23,
                    24,
                    25,
                    26,
                    27,
                    28,
                    29,
                    30,
                    31,
                    32,
                    33,
                    34,
                    35,
                    36,
                    37,
                    38,
                    39,
                    40,
                    41,
                    42,
                    43,
                    44,
                    45,
                    46,
                    47,
                    48,
                    49,
                    50,
                    51,
                    52,
                    53,
                    54,
                    55,
                    56,
                    57,
                    58,
                    59,
                    60,
                    61,
                    62,
                    63,
                    64,
                    65,
                    66,
                    67,
                    68,
                    69,
                    70,
                    71,
                    72,
                    73,
                    74,
                    75,
                    76,
                    77,
                    78,
                    79,
                    80,
                    81,
                    82,
                    83,
                    84,
                    85,
                    86,
                    87,
                    88,
                    89,
                    90,
                    91,
                    92,
                    93,
                    94,
                    95,
                    96,
                    97,
                    98,
                    99,
                    100,
                    101,
                    102,
                    103,
                    104,
                    105,
                    106,
                    107,
                    108,
                    109,
                    110,
                    111,
                    112,
                    113,
                    114,
                    115,
                    116,
                    117,
                    118,
                    119,
                    120,
                    121,
                    122,
                    123,
                    124,
                    125,
                    126,
                    127,
                    128,
                    129,
                    130,
                    131,
                    132,
                    133,
                    134,
                    135,
                    136,
                    137,
                    138,
                    139,
                    140,
                    141,
                    142,
                    143,
                    144,
                    145,
                    146,
                    147,
                    148,
                    149,
                    150,
                    151,
                    152,
                    153,
                    154,
                    155,
                    156,
                    157,
                    158,
                    159,
                    160,
                    161,
                    162,
                    163,
                    164,
                    165,
                    166,
                    167,
                    168,
                    169,
                    170,
                    171,
                    172,
                    173,
                    174,
                    175,
                    176,
                    177,
                    178,
                    179,
                    180,
                    181,
                    182,
                    183,
                    184,
                    185,
                    186,
                    187,
                    188,
                    189,
                    190,
                    191,
                    192,
                    193,
                    194,
                    195,
                    196,
                    197,
                    198,
                    199,
                    200,
                    201,
                    202,
                    203,
                    204,
                    205,
                    206,
                    207,
                    208,
                    209,
                    210,
                    211,
                    212,
                    213,
                    214,
                    215,
                    216,
                    217,
                    218,
                    219,
                    220,
                    221,
                    222,
                    223,
                    224,
                    225,
                    226,
                    227,
                    228,
                    229,
                    230,
                    231,
                    232,
                    233,
                    234,
                    235,
                    236,
                    237,
                    238,
                    239,
                    240,
                    241,
                    242,
                    243,
                    244,
                    245,
                    246,
                    247,
                    248,
                    249,
                    250,
                    251,
                    252,
                    253,
                    254,
                    255
                  ]
                },
                {
                  "name": "device_type",
                  "byte": 0,
                  "type": "u8",
                  "description": "Device type (2=current)."
                },
                {
                  "name": "device_cur",
                  "byte": 1,
                  "type": "u16",
                  "mult": 2,
                  "div": 1000,
                  "unit": "A",
                  "description": "Current. Decoded as raw * 2 / 1000 A."
                }
              ]
            },
            {
              "name": "pulse",
              "discriminator": {
                "byte": 0,
                "bit": 0,
                "bits": 8,
                "value": 3
              },
              "fields": [
                {
                  "name": "message_type",
                  "byte": 0,
                  "bit": 0,
                  "bits": 8,
                  "type": "u8",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 3,
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15,
                    16,
                    17,
                    18,
                    19,
                    20,
                    21,
                    22,
                    23,
                    24,
                    25,
                    26,
                    27,
                    28,
                    29,
                    30,
                    31,
                    32,
                    33,
                    34,
                    35,
                    36,
                    37,
                    38,
                    39,
                    40,
                    41,
                    42,
                    43,
                    44,
                    45,
                    46,
                    47,
                    48,
                    49,
                    50,
                    51,
                    52,
                    53,
                    54,
                    55,
                    56,
                    57,
                    58,
                    59,
                    60,
                    61,
                    62,
                    63,
                    64,
                    65,
                    66,
                    67,
                    68,
                    69,
                    70,
                    71,
                    72,
                    73,
                    74,
                    75,
                    76,
                    77,
                    78,
                    79,
                    80,
                    81,
                    82,
                    83,
                    84,
                    85,
                    86,
                    87,
                    88,
                    89,
                    90,
                    91,
                    92,
                    93,
                    94,
                    95,
                    96,
                    97,
                    98,
                    99,
                    100,
                    101,
                    102,
                    103,
                    104,
                    105,
                    106,
                    107,
                    108,
                    109,
                    110,
                    111,
                    112,
                    113,
                    114,
                    115,
                    116,
                    117,
                    118,
                    119,
                    120,
                    121,
                    122,
                    123,
                    124,
                    125,
                    126,
                    127,
                    128,
                    129,
                    130,
                    131,
                    132,
                    133,
                    134,
                    135,
                    136,
                    137,
                    138,
                    139,
                    140,
                    141,
                    142,
                    143,
                    144,
                    145,
                    146,
                    147,
                    148,
                    149,
                    150,
                    151,
                    152,
                    153,
                    154,
                    155,
                    156,
                    157,
                    158,
                    159,
                    160,
                    161,
                    162,
                    163,
                    164,
                    165,
                    166,
                    167,
                    168,
                    169,
                    170,
                    171,
                    172,
                    173,
                    174,
                    175,
                    176,
                    177,
                    178,
                    179,
                    180,
                    181,
                    182,
                    183,
                    184,
                    185,
                    186,
                    187,
                    188,
                    189,
                    190,
                    191,
                    192,
                    193,
                    194,
                    195,
                    196,
                    197,
                    198,
                    199,
                    200,
                    201,
                    202,
                    203,
                    204,
                    205,
                    206,
                    207,
                    208,
                    209,
                    210,
                    211,
                    212,
                    213,
                    214,
                    215,
                    216,
                    217,
                    218,
                    219,
                    220,
                    221,
                    222,
                    223,
                    224,
                    225,
                    226,
                    227,
                    228,
                    229,
                    230,
                    231,
                    232,
                    233,
                    234,
                    235,
                    236,
                    237,
                    238,
                    239,
                    240,
                    241,
                    242,
                    243,
                    244,
                    245,
                    246,
                    247,
                    248,
                    249,
                    250,
                    251,
                    252,
                    253,
                    254,
                    255
                  ]
                },
                {
                  "name": "device_type",
                  "byte": 0,
                  "type": "u8",
                  "description": "Device type (3=pulse)."
                },
                {
                  "name": "device_pulse",
                  "byte": 1,
                  "type": "u36",
                  "description": "Pulse count."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "reconfigure",
                  "byte": 0,
                  "bit": 7,
                  "bits": 1,
                  "type": "bool",
                  "description": "Reconfigure flag. 0=no, 1=yes."
                },
                {
                  "name": "power_control",
                  "byte": 0,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "Power control. 0=disabled, 1=enabled."
                },
                {
                  "name": "sampling_interval",
                  "byte": 1,
                  "type": "u8",
                  "add": 2,
                  "mult": 5,
                  "unit": "min",
                  "description": "Uplink interval. Decoded as (raw+2)*5 min."
                },
                {
                  "name": "reserved",
                  "byte": 2,
                  "type": "bytes",
                  "length": 6,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "ranger_r1_1",
      "device": "Ranger",
      "version": "R1.1",
      "note": "",
      "schema": {
        "name": "ranger_r1_1",
        "device": "Ranger",
        "device_version": "R1.1",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Ranger R1.1 uplink-only payloads with Message1/Message2 split.",
        "uplink": {
          "payloads": [
            {
              "name": "message1",
              "discriminator": {
                "byte": 0,
                "bit": 7,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "device_revision",
                  "byte": 0,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device revision nibble."
                },
                {
                  "name": "cyclic_context_id",
                  "byte": 0,
                  "bit": 4,
                  "bits": 2,
                  "type": "u8",
                  "description": "Cyclic context identifier."
                },
                {
                  "name": "update_contains_two_messages",
                  "byte": 0,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "Update contains two messages flag."
                },
                {
                  "name": "packet_id",
                  "byte": 0,
                  "bit": 7,
                  "bits": 1,
                  "type": "u8",
                  "description": "Message1 packet id is always 0.",
                  "fixed_value": 0
                },
                {
                  "name": "rssi_station_a",
                  "byte": 1,
                  "type": "u8",
                  "description": "RSSI of station A."
                },
                {
                  "name": "mac_station_a",
                  "byte": 2,
                  "type": "bytes",
                  "length": 6,
                  "description": "MAC address of station A."
                },
                {
                  "name": "stationary_unit_days",
                  "byte": 8,
                  "bit": 0,
                  "bits": 1,
                  "type": "bool",
                  "description": "0=hours, 1=days."
                },
                {
                  "name": "stationary_count",
                  "byte": 8,
                  "bit": 1,
                  "bits": 7,
                  "type": "u8",
                  "description": "Stationary count value."
                },
                {
                  "name": "mac_station_c_first3",
                  "byte": 9,
                  "type": "bytes",
                  "length": 3,
                  "optional": true,
                  "description": "First 3 bytes of station C MAC, if found."
                }
              ]
            },
            {
              "name": "message2",
              "discriminator": {
                "byte": 0,
                "bit": 7,
                "bits": 1,
                "value": 1
              },
              "fields": [
                {
                  "name": "device_revision",
                  "byte": 0,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device revision nibble."
                },
                {
                  "name": "cyclic_context_id",
                  "byte": 0,
                  "bit": 4,
                  "bits": 2,
                  "type": "u8",
                  "description": "Cyclic context identifier."
                },
                {
                  "name": "update_contains_two_messages",
                  "byte": 0,
                  "bit": 6,
                  "bits": 1,
                  "type": "bool",
                  "description": "Update contains two messages flag."
                },
                {
                  "name": "packet_id",
                  "byte": 0,
                  "bit": 7,
                  "bits": 1,
                  "type": "u8",
                  "description": "Message2 packet id is always 1.",
                  "fixed_value": 1
                },
                {
                  "name": "rssi_station_b",
                  "byte": 1,
                  "type": "u8",
                  "description": "RSSI of station B."
                },
                {
                  "name": "mac_station_b",
                  "byte": 2,
                  "type": "bytes",
                  "length": 6,
                  "description": "MAC address of station B."
                },
                {
                  "name": "rssi_station_c",
                  "byte": 8,
                  "type": "u8",
                  "optional": true,
                  "description": "RSSI of station C, if found."
                },
                {
                  "name": "mac_station_c_last3",
                  "byte": 9,
                  "type": "bytes",
                  "length": 3,
                  "optional": true,
                  "description": "Last 3 bytes of station C MAC, if found."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": []
        }
      }
    },
    {
      "slug": "ranger_r1_3",
      "device": "Ranger",
      "version": "R1.3",
      "note": "",
      "schema": {
        "name": "ranger_r1_3",
        "device": "Ranger",
        "device_version": "R1.3",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "Ranger R1.3 uplink and downlink.",
        "uplink": {
          "payloads": [
            {
              "name": "message_type_1",
              "discriminator": {
                "byte": 1,
                "bit": 0,
                "bits": 1,
                "value": 0
              },
              "fields": [
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "ccid",
                  "byte": 1,
                  "bit": 2,
                  "bits": 2,
                  "type": "u8",
                  "description": "Cyclic context identifier."
                },
                {
                  "name": "message_id",
                  "byte": 1,
                  "bit": 0,
                  "bits": 1,
                  "type": "u8",
                  "description": "Message type identifier.",
                  "fixed_value": 0
                },
                {
                  "name": "sta_unit_val",
                  "byte": 2,
                  "bit": 7,
                  "bits": 1,
                  "type": "bool",
                  "description": "Stationary unit value (0=hours, 1=days)."
                },
                {
                  "name": "sta_time",
                  "byte": 2,
                  "bit": 2,
                  "bits": 5,
                  "type": "u8",
                  "description": "Stationary time value."
                },
                {
                  "name": "r_type",
                  "byte": 2,
                  "bit": 1,
                  "bits": 1,
                  "type": "bool",
                  "description": "Ranger type flag."
                },
                {
                  "name": "bat_st",
                  "byte": 2,
                  "bit": 0,
                  "bits": 1,
                  "type": "bool",
                  "description": "Battery status flag."
                },
                {
                  "name": "r1",
                  "byte": 3,
                  "type": "u8",
                  "description": "RSSI value 1."
                },
                {
                  "name": "m1",
                  "byte": 4,
                  "type": "bytes",
                  "length": 6,
                  "description": "MAC address 1."
                },
                {
                  "name": "m3",
                  "byte": 10,
                  "type": "bytes",
                  "length": 3,
                  "optional": true,
                  "description": "MAC address 3 partial."
                }
              ]
            },
            {
              "name": "message_type_2",
              "discriminator": {
                "byte": 1,
                "bit": 0,
                "bits": 1,
                "value": 1
              },
              "fields": [
                {
                  "name": "is_system_message",
                  "byte": 1,
                  "bit": 0,
                  "bits": 1,
                  "type": "bool",
                  "description": "Fixed discriminator value for this payload.",
                  "fixed_value": 1
                },
                {
                  "name": "firmware_version",
                  "byte": 0,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "description": "Device firmware version nibble."
                },
                {
                  "name": "r2",
                  "byte": 1,
                  "type": "u8",
                  "description": "RSSI value 2."
                },
                {
                  "name": "m2",
                  "byte": 2,
                  "type": "bytes",
                  "length": 6,
                  "description": "MAC address 2."
                },
                {
                  "name": "r3",
                  "byte": 8,
                  "type": "u8",
                  "optional": true,
                  "description": "RSSI value 3."
                },
                {
                  "name": "m3",
                  "byte": 9,
                  "type": "bytes",
                  "length": 3,
                  "optional": true,
                  "description": "MAC address 3 partial."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "observation_period_idx",
                  "byte": 0,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Observation period index (D0). 0..15 maps to 10, 15, 20, 30, 45, 60, 90, 120, 150, 180, 240, 300, 360, 480, 600, 720 min.",
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15
                  ]
                },
                {
                  "name": "periodic_activity_reporting",
                  "byte": 0,
                  "bit": 3,
                  "bits": 1,
                  "type": "bool",
                  "description": "Periodic activity reporting. 0=disabled, 1=enabled."
                },
                {
                  "name": "periodic_inactivity_reporting_idx",
                  "byte": 0,
                  "bit": 0,
                  "bits": 3,
                  "type": "u8",
                  "description": "Periodic inactivity reporting index (D1 lower bits). 0..7 maps to 1, 2, 3, 4, 6, 9, 12, 24 h.",
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7
                  ]
                },
                {
                  "name": "sensor_threshold_idx",
                  "byte": 1,
                  "bit": 4,
                  "bits": 4,
                  "type": "u8",
                  "description": "Accelerometer sensitivity index (D2). 0..15 maps to 63mg, 20mg, 35mg, 63mg, 74mg, 0.125g, 0.188g, 0.25g, 0.375g, 0.5g, 0.75g, 1.047g, 1.5g, 2g, 4g, 8g.",
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15
                  ]
                },
                {
                  "name": "sensor_count_idx",
                  "byte": 1,
                  "bit": 0,
                  "bits": 4,
                  "type": "u8",
                  "description": "Accelerometer integration time index (D3). 0..15 maps to 10s, 2s, 3s, 4s, 5s, 7s, 10s, 15s, 20s, 30s, 45s, 60s, 90s, 120s, 180s, 330s.",
                  "valid_values": [
                    0,
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15
                  ]
                },
                {
                  "name": "reserved",
                  "byte": 2,
                  "type": "bytes",
                  "length": 6,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "temp_guard_r3",
      "device": "TempGuard",
      "version": "R3",
      "note": "",
      "schema": {
        "name": "temp_guard_r3",
        "device": "TempGuard",
        "device_version": "R3",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "TempGuard R3 uplink and downlink.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "description": "Only message type; no header byte.",
              "fields": [
                {
                  "name": "temperature_enclosure",
                  "byte": 0,
                  "type": "u16",
                  "add": -400,
                  "div": 10,
                  "unit": "°C",
                  "description": "Enclosure temperature. Decoded as (raw + (-400)) / 10 °C."
                },
                {
                  "name": "temperature_left",
                  "byte": 2,
                  "type": "u16",
                  "add": -400,
                  "div": 10,
                  "unit": "°C",
                  "description": "Left sensor temperature. Decoded as (raw + (-400)) / 10 °C."
                },
                {
                  "name": "temperature_right",
                  "byte": 4,
                  "type": "u16",
                  "add": -400,
                  "div": 10,
                  "unit": "°C",
                  "description": "Right sensor temperature. Decoded as (raw + (-400)) / 10 °C."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "transmission_interval_code",
                  "byte": 0,
                  "type": "u8",
                  "description": "Transmission interval. 1=10 min, 2=20 min, 3=30 min (default), 4=1 h, 5=2 h.",
                  "valid_values": [
                    1,
                    2,
                    3,
                    4,
                    5
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "not_applicable"
                    },
                    {
                      "value": 1,
                      "label": "10_min"
                    },
                    {
                      "value": 2,
                      "label": "20_min"
                    },
                    {
                      "value": 3,
                      "label": "30_min_default"
                    },
                    {
                      "value": 4,
                      "label": "1_h"
                    },
                    {
                      "value": 5,
                      "label": "2_h"
                    },
                    {
                      "value": 6,
                      "label": "not_applicable"
                    },
                    {
                      "value": 7,
                      "label": "not_applicable"
                    },
                    {
                      "value": 8,
                      "label": "not_applicable"
                    },
                    {
                      "value": 9,
                      "label": "not_applicable"
                    },
                    {
                      "value": 10,
                      "label": "not_applicable"
                    },
                    {
                      "value": 11,
                      "label": "not_applicable"
                    },
                    {
                      "value": 12,
                      "label": "not_applicable"
                    },
                    {
                      "value": 13,
                      "label": "not_applicable"
                    },
                    {
                      "value": 14,
                      "label": "not_applicable"
                    },
                    {
                      "value": 15,
                      "label": "not_applicable"
                    }
                  ]
                },
                {
                  "name": "measurement_interval_code",
                  "byte": 1,
                  "type": "u8",
                  "description": "Measurement interval. 1=10 min, 2=20 min, 3=30 min (default), 4=1 h, 5=2 h.",
                  "valid_values": [
                    1,
                    2,
                    3,
                    4,
                    5
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "not_applicable"
                    },
                    {
                      "value": 1,
                      "label": "10_min"
                    },
                    {
                      "value": 2,
                      "label": "20_min"
                    },
                    {
                      "value": 3,
                      "label": "30_min_default"
                    },
                    {
                      "value": 4,
                      "label": "1_h"
                    },
                    {
                      "value": 5,
                      "label": "2_h"
                    },
                    {
                      "value": 6,
                      "label": "not_applicable"
                    },
                    {
                      "value": 7,
                      "label": "not_applicable"
                    },
                    {
                      "value": 8,
                      "label": "not_applicable"
                    },
                    {
                      "value": 9,
                      "label": "not_applicable"
                    },
                    {
                      "value": 10,
                      "label": "not_applicable"
                    },
                    {
                      "value": 11,
                      "label": "not_applicable"
                    },
                    {
                      "value": 12,
                      "label": "not_applicable"
                    },
                    {
                      "value": 13,
                      "label": "not_applicable"
                    },
                    {
                      "value": 14,
                      "label": "not_applicable"
                    },
                    {
                      "value": 15,
                      "label": "not_applicable"
                    }
                  ]
                },
                {
                  "name": "temp_delta_threshold_enclosure",
                  "byte": 2,
                  "type": "u8",
                  "div": 10,
                  "unit": "°C",
                  "description": "Enclosure temperature delta threshold. Decoded as raw / 10 °C."
                },
                {
                  "name": "temp_delta_threshold_left",
                  "byte": 3,
                  "type": "u8",
                  "div": 10,
                  "unit": "°C",
                  "description": "Left sensor temperature delta threshold. Decoded as raw / 10 °C."
                },
                {
                  "name": "temp_delta_threshold_right",
                  "byte": 4,
                  "type": "u8",
                  "div": 10,
                  "unit": "°C",
                  "description": "Right sensor temperature delta threshold. Decoded as raw / 10 °C."
                },
                {
                  "name": "reserved",
                  "byte": 5,
                  "type": "bytes",
                  "length": 3,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    },
    {
      "slug": "twin_guard_r2",
      "device": "TwinGuard",
      "version": "R2",
      "note": "",
      "schema": {
        "name": "twin_guard_r2",
        "device": "TwinGuard",
        "device_version": "R2",
        "radio_technologies": [
          "Sigfox"
        ],
        "schema_version": 1,
        "endian": "big",
        "manufacturer": "Connected Inventions",
        "description": "TwinGuard R2 uplink and downlink.",
        "uplink": {
          "payloads": [
            {
              "name": "measurement",
              "description": "Only message type; no header byte.",
              "fields": [
                {
                  "name": "temperature_left",
                  "byte": 0,
                  "type": "u16",
                  "add": -400,
                  "div": 10,
                  "unit": "°C",
                  "description": "Left sensor temperature. Decoded as (raw + (-400)) / 10 °C."
                },
                {
                  "name": "humidity_left",
                  "byte": 2,
                  "type": "u8",
                  "unit": "%",
                  "description": "Left sensor relative humidity in %."
                },
                {
                  "name": "temperature_right",
                  "byte": 3,
                  "type": "u16",
                  "add": -400,
                  "div": 10,
                  "unit": "°C",
                  "description": "Right sensor temperature. Decoded as (raw + (-400)) / 10 °C."
                },
                {
                  "name": "humidity_right",
                  "byte": 5,
                  "type": "u8",
                  "unit": "%",
                  "description": "Right sensor relative humidity in %."
                }
              ]
            }
          ]
        },
        "downlink": {
          "payloads": [
            {
              "name": "config",
              "fields": [
                {
                  "name": "transmission_interval_code",
                  "byte": 0,
                  "type": "u8",
                  "description": "Transmission interval. 1=10 min, 2=20 min, 3=30 min (default), 4=1 h, 5=2 h.",
                  "valid_values": [
                    1,
                    2,
                    3,
                    4,
                    5
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "not_applicable"
                    },
                    {
                      "value": 1,
                      "label": "10_min"
                    },
                    {
                      "value": 2,
                      "label": "20_min"
                    },
                    {
                      "value": 3,
                      "label": "30_min_default"
                    },
                    {
                      "value": 4,
                      "label": "1_h"
                    },
                    {
                      "value": 5,
                      "label": "2_h"
                    },
                    {
                      "value": 6,
                      "label": "not_applicable"
                    },
                    {
                      "value": 7,
                      "label": "not_applicable"
                    },
                    {
                      "value": 8,
                      "label": "not_applicable"
                    },
                    {
                      "value": 9,
                      "label": "not_applicable"
                    },
                    {
                      "value": 10,
                      "label": "not_applicable"
                    },
                    {
                      "value": 11,
                      "label": "not_applicable"
                    },
                    {
                      "value": 12,
                      "label": "not_applicable"
                    },
                    {
                      "value": 13,
                      "label": "not_applicable"
                    },
                    {
                      "value": 14,
                      "label": "not_applicable"
                    },
                    {
                      "value": 15,
                      "label": "not_applicable"
                    }
                  ]
                },
                {
                  "name": "measurement_interval_code",
                  "byte": 1,
                  "type": "u8",
                  "description": "Measurement interval. 1=10 min, 2=20 min, 3=30 min (default), 4=1 h, 5=2 h.",
                  "valid_values": [
                    1,
                    2,
                    3,
                    4,
                    5
                  ],
                  "enum_values": [
                    {
                      "value": 0,
                      "label": "not_applicable"
                    },
                    {
                      "value": 1,
                      "label": "10_min"
                    },
                    {
                      "value": 2,
                      "label": "20_min"
                    },
                    {
                      "value": 3,
                      "label": "30_min_default"
                    },
                    {
                      "value": 4,
                      "label": "1_h"
                    },
                    {
                      "value": 5,
                      "label": "2_h"
                    },
                    {
                      "value": 6,
                      "label": "not_applicable"
                    },
                    {
                      "value": 7,
                      "label": "not_applicable"
                    },
                    {
                      "value": 8,
                      "label": "not_applicable"
                    },
                    {
                      "value": 9,
                      "label": "not_applicable"
                    },
                    {
                      "value": 10,
                      "label": "not_applicable"
                    },
                    {
                      "value": 11,
                      "label": "not_applicable"
                    },
                    {
                      "value": 12,
                      "label": "not_applicable"
                    },
                    {
                      "value": 13,
                      "label": "not_applicable"
                    },
                    {
                      "value": 14,
                      "label": "not_applicable"
                    },
                    {
                      "value": 15,
                      "label": "not_applicable"
                    }
                  ]
                },
                {
                  "name": "temp_delta_threshold_left",
                  "byte": 2,
                  "type": "u8",
                  "div": 10,
                  "unit": "°C",
                  "description": "Left sensor temperature delta threshold. Decoded as raw / 10 °C."
                },
                {
                  "name": "humidity_delta_threshold_left",
                  "byte": 3,
                  "type": "u8",
                  "unit": "%",
                  "description": "Left sensor humidity delta threshold in %."
                },
                {
                  "name": "temp_delta_threshold_right",
                  "byte": 4,
                  "type": "u8",
                  "div": 10,
                  "unit": "°C",
                  "description": "Right sensor temperature delta threshold. Decoded as raw / 10 °C."
                },
                {
                  "name": "humidity_delta_threshold_right",
                  "byte": 5,
                  "type": "u8",
                  "unit": "%",
                  "description": "Right sensor humidity delta threshold in %."
                },
                {
                  "name": "reserved",
                  "byte": 6,
                  "type": "bytes",
                  "length": 2,
                  "description": "Reserved. Set all bits to 0.",
                  "default_value": 0
                }
              ]
            }
          ]
        }
      }
    }
  ]
};
