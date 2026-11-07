# Maker opening (prototype 0.2)

The game uses Three.js 0.170 with a procedural workshop, an orthographic OrbitControls gameplay camera, and inventory/terminal/power interactions in `prototype-3d.js`. The opening adds an independent fixed perspective camera and procedural civilian mechanic in `maker-opening.js`; timing is sampled by `opening-timeline.mjs`. No framework, external model, video, or second workshop is required. Version 0.1 is untouched.

## Run and review

From this repository run `python3 -m http.server 8876`, then visit http://127.0.0.1:8876/prototype-3d.html. Click **BEGIN BOOT SEQUENCE** (also enables browser audio). The 30 seconds start on that click.

- 0–11s: low tilted seated optical view; black boot flickers; Maker's hands/tool move at the chassis.
- 11–13s: vision stabilises; Maker notices the sensor.
- 13–17s: two metallic disturbance cues; Maker stops and turns toward the doorway.
- 17–19s: she withdraws her hands and stands.
- 19–24.5s: runs along the workshop aisles through the already-open north-east door into a short passage.
- 24.8–26.2s: the existing automatic door leaves close after she clears them.
- 26–30s: sensor failure and final black. No camera cuts or scene resets occur during the sequence.

Click **REBOOT · ENTER WORKSHOP** after shutdown to return to the existing orthographic gameplay and recover the missing arm. The change of viewpoint is deliberately outside the completed cutscene. Reload or use pause/restart to replay. ESC pauses; inventory, movement, terminal and charge drain remain suspended during the opening. Background tabs suspend the timeline. Resize during playback to check perspective framing.

Run `node --test tests/*.test.mjs`, `node --check prototype-3d.js`, and `node --check maker-opening.js`. Timing tests cover character order, door clearance and blackouts; existing tests cover inventory, terminal and collision regressions. Browser review remains necessary for framing, sound and animation quality.

## Scope

Maker uses blockout geometry, joint rotations and synthesised sound cues, with a cream maintenance coat, rust collar, dark work clothes and oversized civilian helmet. These are placeholders for authored art/animation/audio. The camera is fixed at the existing repair-bay spawn with seated lower-chassis geometry; the gameplay robot is hidden only during the opening. The original room remains intact, with a small passage added behind its existing doorway.

The checkout already contained uncommitted inventory/terminal/collision fixes, their ten regression tests and CI. These are preserved in this branch.
