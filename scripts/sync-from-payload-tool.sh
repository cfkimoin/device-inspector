#!/usr/bin/env bash
# Copy codec, schema bundle, and Connected Insight client from ../payload-tool.
set -euo pipefail

REBUILD=0
if [[ "${1:-}" == "--rebuild" ]]; then
  REBUILD=1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOOL="$(cd "$ROOT/../payload-tool/src/payload-tool" && pwd)"

if [[ ! -f "$TOOL/codec.global.js" ]]; then
  echo "payload-tool web app not found at $TOOL" >&2
  exit 1
fi

if [[ "$REBUILD" -eq 1 ]]; then
  echo "Rebuilding schemas in $TOOL"
  (cd "$TOOL" && npm run build-schemas)
fi

mkdir -p "$ROOT/js/codec" "$ROOT/js/vendor" "$ROOT/data"
cp "$TOOL/codec.global.js" "$ROOT/js/codec/codec.global.js"
cp "$TOOL/connectedinsight.global.js" "$ROOT/js/vendor/connectedinsight.global.js"
cp "$TOOL/data/payload_schemas.global.js" "$ROOT/data/payload_schemas.global.js"
cp "$TOOL/data/build_info.global.js" "$ROOT/data/build_info.global.js"

echo "Synced codec, Connected Insight client, and schema bundle from $TOOL"
