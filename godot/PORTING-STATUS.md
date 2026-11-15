# Godot feature parity checklist

Reference: the current Saturn Station 0.2 browser prototype and the Generator 04 hall built for its next room. Work stays on `godot-port`; the browser prototype and `main` remain unchanged.

## Ported and covered by tests

- [x] Main menu entry, new demo, saved-shift continuation, master-volume and default-view preferences, credits.
- [x] Workshop movement, orbit/zoom/reset, isometric and first-person camera modes, pause, charge and portable cells.
- [x] Service-case power cell, auxiliary grid switch, lockers, worker card, recoverable maintenance arm and physical probe fabrication/install progression.
- [x] Native screen panels for inventory, authentication, and recipe staging.
- [x] Native MU-1 meshes, recoverable arm, movement gait, servicing reach, and probe state.
- [x] Industrial workshop overhead trays, exposed cable runs, wall returns and powered cabinets.
- [x] Generator 04's monumental vessel, peripheral generator shells, multi-level galleries, connected descending stair route and isometric/perspective traversal.
- [x] Door-triggered demo ending with a dancing MU-1 model, animated confetti, restart, credits and main-menu choices.
- [x] Progress serialization and continue-menu routing.

## Remaining parity work

- [x] Port the continuous Maker opening, its skip behavior and handoff to gameplay.
- [ ] Port menu-only music, interaction sounds, terminal boot/key sounds and ambient audio.
- [ ] Port window inspection and its cinematic Enceladus view.
- [x] Add terminal boot flow, ETNA password, commands/files sections and a saved record-entry section.
- [x] Add a cinematic observation-window interaction, recoverable ETNA note and short narration at major workshop props.
- [x] Add a centered top-screen task directive plus pickup and power-restored notices.
- [x] Render the worker access card with a faded portrait, name and ETNA password when inspected.
- [ ] Add terminal boot/key sounds and expand the file archive to match the browser's full contents.
- [ ] Match tutorial prompts, directives, notices, pickup feedback and item inspection to the browser game's current clarity work.
- [ ] Port the full interactive prop/narration coverage, including room storytelling and the remaining functional objects.
- [ ] Replace the remaining simplified props and materials with higher-detail native assets while preserving the worn, cable-dense industrial aesthetic.
- [ ] Visually playtest desktop and mobile-like window sizes and iterate on camera, collision, interaction distances and layout.
