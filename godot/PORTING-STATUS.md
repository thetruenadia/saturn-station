# Godot feature parity checklist

Reference: the current Saturn Station 0.2 browser prototype and the Generator 04 hall built for its next room. Work stays on `godot-port`; the browser prototype and `main` remain unchanged.

## Ported and covered by tests

- [x] Main menu entry, new demo, saved-shift continuation, master-volume and default-view preferences, credits.
- [x] Workshop movement, orbit/zoom/reset, isometric and first-person camera modes, pause, charge and portable cells.
- [x] Match MU-1's inertial movement ramp/braking and cadence-based synthetic footstep sounds.
- [x] Match the browser's two-link foot placement, stance/swing timing and planted-foot lift gait.
- [x] Service-case power cell, auxiliary grid switch, lockers, worker card, recoverable manipulator item with separate inspect/equip/stow state, and physical probe fabrication/install progression.
- [x] Native screen panels for inventory, authentication, and recipe staging.
- [x] Native MU-1 meshes, recoverable arm, movement gait, servicing reach, and probe state.
- [x] Industrial workshop overhead trays, exposed cable runs, wall returns and powered cabinets.
- [x] Stage workshop power-up lighting: wall-mounted emergency beacons dim as overhead fixtures flicker on in sequence; auxiliary shutdown restores emergency lighting.
- [x] Generator 04's monumental vessel, peripheral generator shells, multi-level galleries, connected descending stair route and isometric/perspective traversal.
- [x] Door-triggered demo ending with a dancing MU-1 model, animated confetti, restart, credits and main-menu choices.
- [x] Progress and world-state serialization, including MU-1 position/heading, remaining charge, and camera state, with periodic and pause/close saves plus a file-backed save/reload regression.

## Remaining parity work

- [x] Port the continuous Maker opening, its skip behavior and handoff to gameplay.
- [x] Add the opening's seated service chassis, dim exit passage and timed mechanical boot cues.
- [x] Port the original menu track with an on/off setting and stop/reset when starting or continuing the demo.
- [x] Add a low looping workshop power-room ambience; stop it on the menu backdrop so menu music remains separate.
- [x] Port window inspection and its cinematic Enceladus view.
- [x] Add terminal boot flow, ETNA password, commands/files sections and a saved record-entry section.
- [x] Port terminal commands 1/2/3: report the isolated link, close the exit, and shut down auxiliary power.
- [x] Add a cinematic observation-window interaction, recoverable ETNA note and short narration at major workshop props.
- [x] Add a centered top-screen task directive plus pickup and power-restored notices.
- [x] Port the in-game pause and settings screens with resume/restart, master volume, sound toggle, and saved brightness controls.
- [x] Add the browser's power-depletion shutdown screen and a reboot action that starts a fresh shift.
- [x] Keep a persistent, concise movement and camera control legend on the gameplay screen.
- [x] Add a five-slot quick inventory strip with numbered keyboard selection.
- [x] Add rotating 3D inventory inspection for the recovered manipulator, power cell, access card, note and fabrication parts; adapt the inventory grid to narrow windows.
- [x] Model the portable power cell as a CubeSat-inspired frame, visible copper cell array, translucent amber side covers and control board.
- [x] Build distinct rotating previews for the access card, ETNA note, gear, servo motor, wiring loom, control chip and armour plate.
- [x] Show the service case opening, reveal the physical power cell, remove it on pickup, and restore that case state from saved progression.
- [x] Replace the generic key-device blocks with a phosphor CRT terminal and a multi-control auxiliary power panel whose lamps and screen respond to grid state and terminal boot/authentication.
- [x] Port click-to-select object interactions and E-triggered auto-approach, with WASD interruption and state-aware target prompts.
- [x] Add a projected proximity marker with the current action or a move-closer cue; hide it behind panels, pauses and cutscenes.
- [x] Port the loose manipulator recovery and equipment-mount flow: its model begins in the maintenance claw, disappears on recovery, enters storage, and must be fitted before operating the case or switch.
- [x] Animate the recovered manipulator from the maintenance claw to MU-1 before storing it, with servo and recovery sounds.
- [x] Add a 20-slot item grid with item descriptions and manipulator equip/stow controls.
- [x] Reflow the item grid and inspection panel for narrow windows, including a stacked 320-pixel layout and resize-triggered refresh.
- [x] Add crew belongings, sorted repair rejects, wall utility wiring and floor routes as linked, inspectable room details.
- [x] Render the worker access card with a faded portrait, name and ETNA password when inspected.
- [x] Add native UI click and typing sounds, terminal boot tones, and pickup chimes.
- [x] Require manually dragging recipe components into the fabrication tray before crafting.
- [x] Expose the full native station file archive, including system status and staff directory, alongside the logs/spec/incident records.
- [x] Replace probe place/confirm buttons with a drag-to-wrist-socket installation target and regression coverage.
- [ ] Finish remaining pickup feedback polish and add authored models for non-inventory room props.
- [ ] Port the full interactive prop/narration coverage, including room storytelling and the remaining functional objects.
- [ ] Replace the remaining simplified props and materials with higher-detail native assets while preserving the worn, cable-dense industrial aesthetic.
- [ ] Visually playtest desktop and mobile-like window sizes and iterate on camera, collision, interaction distances and layout.
