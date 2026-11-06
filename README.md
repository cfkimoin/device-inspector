# Device Inspector

Local tool for one Sigfox device. It shows communication state, an approximate fix, basestation ids from message radio info, decoded history, Connected Insight observations, and a rules-based analysis panel.

The page is dark gray, with muted orange and green as highlights. Blue is used only for the small basestation marks on the location plot.

## Run

From this folder:

```text
python proxy.py
```

The app opens at `http://localhost:8787`. Opening `index.html` as a file cannot call Sigfox or Connected Insight.

## Keys

Use **Keys** to store named credentials in this browser.

- Sigfox: API login and password. A few group keys are enough.
- Connected Insight: a public token created while a partner-admin, corporate-admin, or corporate-user role is active. Provider tokens cannot read device observations.

## What one inspect calls

Sigfox quota is tight, so an inspect does not walk extra endpoints.

1. `GET /devices/{id}` with expanded names, certificates, and the last computed fix.
2. `GET /devices/{id}/messages` for about the last 92 days, paged at 100. Radio info on those messages supplies the basestation id and coordinates. Out-of-band data, when present on the message, is included in the same response. There is no separate location call and no second out-of-band listing.

After that history is on screen, Connected Insight observations load through the local proxy.

**Details** is optional. It calls `GET /device-types/{id}`. The callback list is requested only when downlink mode is webhook (`CALLBACK`). Direct hex, managed mode, and disabled downlink do not spend that extra call.

A 429 stops the message walk. Already retrieved messages stay on screen.

## Payload schemas

`../payload-tool` is the source of truth. This repo does not use a submodule.

```text
powershell -File scripts/sync-from-payload-tool.ps1
powershell -File scripts/sync-from-payload-tool.ps1 -Rebuild
```

The script copies the codec, the Connected Insight client, and the generated schema bundle.

## Analysis

Rules read a JSON snapshot (`Export` writes it). Current checks:

- TX or battery voltage step, reported as a likely battery change
- poor LQI together with sequence-number gaps
- a long silence compared with the usual interval
- communication state when Sigfox reports keepalive missed or messages blocked

New rules are separate files under `js/rules/` and register themselves. The snapshot is plain JSON so a later agent can use the same object.
