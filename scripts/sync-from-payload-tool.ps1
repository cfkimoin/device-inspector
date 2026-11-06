# Copy codec, schema bundle, and Connected Insight client from ../payload-tool.
# Does not use a git submodule. Re-run whenever payload descriptions change.
param(
  [switch]$Rebuild
)

$ErrorActionPreference = "Stop"
$repo = Split-Path -Parent $PSScriptRoot
$payloadRepo = Resolve-Path (Join-Path $repo "..\payload-tool")
$tool = Join-Path $payloadRepo "src\payload-tool"

if (-not (Test-Path (Join-Path $tool "codec.global.js"))) {
  throw "payload-tool web app not found at $tool"
}

if ($Rebuild) {
  Write-Host "Rebuilding schemas in $tool"
  Push-Location $tool
  try {
    npm run build-schemas
    if ($LASTEXITCODE -ne 0) { throw "npm run build-schemas failed ($LASTEXITCODE)" }
  } finally {
    Pop-Location
  }
}

$codecDir = Join-Path $repo "js\codec"
$vendorDir = Join-Path $repo "js\vendor"
$dataDir = Join-Path $repo "data"
New-Item -ItemType Directory -Force -Path $codecDir, $vendorDir, $dataDir | Out-Null

Copy-Item (Join-Path $tool "codec.global.js") (Join-Path $codecDir "codec.global.js") -Force
Copy-Item (Join-Path $tool "connectedinsight.global.js") (Join-Path $vendorDir "connectedinsight.global.js") -Force
Copy-Item (Join-Path $tool "data\payload_schemas.global.js") (Join-Path $dataDir "payload_schemas.global.js") -Force
Copy-Item (Join-Path $tool "data\build_info.global.js") (Join-Path $dataDir "build_info.global.js") -Force

Write-Host "Synced codec, Connected Insight client, and schema bundle from $tool"
