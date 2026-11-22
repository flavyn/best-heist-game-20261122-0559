# Vault Shift

[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/c/best-heist-game-20261122-0559)
[![Rank](https://make.fun/badge/best-heist-game-20261122-0559/flavyn/best-heist-game-20261122-0559/rank.svg)](https://make.fun/c/best-heist-game-20261122-0559)
[![Reward](https://make.fun/badge/best-heist-game-20261122-0559/flavyn/best-heist-game-20261122-0559/reward.svg)](https://make.fun/c/best-heist-game-20261122-0559)

A quiet kind of crime. Read amber patrol cones and cyan camera sweeps, slip behind steel crates, steal three luminous stones, and find a clean exit. Original canvas art, deterministic simulation, and synthesized WebAudio; no dependencies or network access during play.

## Run it

```sh
node serve.ts
# Open http://127.0.0.1:8080 in Chrome
```

WASD or arrows move. Click the floor to route around cover. Space near a crate toggles crouch; moving stands up. Cover blocks vision from the far side, including while standing. The exposed side remains dangerous. Hold no keys while watching for a patrol window.

Aim with the mouse and press **1** to toss a decoy (2 credits, 3 seconds). **2** loops all CCTV (3 credits, 4 seconds). Start with 6 credits; each stone earns 4 and extraction earns 3. **R** retries the current room and restores its starting credits. **N** continues after extraction, or starts a fresh run after the third room. Full alarm rewinds the room after a brief caught moment.

The three rooms are Night Vault, Neon Exchange, and Freight Hold. Each has multiple routes, more security than the last, and its own hand-authored layout. All collision and cone occlusion use the same solid rectangles. Click routes use a deterministic grid search. Fixed loops and seeded guard detail make retries repeatable.

To audit and capture four real 1280×800 Chrome renders, set `NODE_PATH` to your global npm modules folder with Playwright installed, then run `node tools/shoot.mjs`. The harness exercises real keyboard and mouse input plus controlled simulation fixtures, rejects external requests and page errors, and compares every packaged file after two runs of `main.ts`. Temporary packages are created outside the repository. `window.vaultShift` exposes the simulation for inspection. `?shot=play&level=0`, `?shot=alert&level=1`, `?shot=clear&level=0`, and `?shot=vault&level=2` freeze in-engine screenshot poses.

To package: `MAKEFUN_OUTPUT_DIR=/your/output node main.ts` (PowerShell: `$env:MAKEFUN_OUTPUT_DIR = 'D:/your/output'; node main.ts`). Without the variable the destination is `/output`. The unchanged kit dossier builder enforces the competition caps.
