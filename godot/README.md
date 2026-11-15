# Native Godot port

Open `godot/project.godot` in Godot 4.3+ and run the main scene (F6) or project (F5).

WASD moves relative to the camera, drag to orbit, scroll to zoom, R resets, E interacts, I opens inventory, C uses the nearby maintenance station, Q consumes a fuel cell, and Esc closes or pauses.

The native workshop implements the browser 0.2 progression: auxiliary power, case and cell, locker recovery, claw salvage, ETNA login, physical spec shard, manual component staging, fabrication, separate wrist placement and installation, and exit. The reusable MU-1 scene builds its asymmetrical chassis, folded maintenance arm, recoverable yellow service arm, articulated legs and probe from native meshes. Its gait and service reach animate in-game. The workshop atmosphere scene adds overhead cable trays, exposed hanging umbilicals, wall pipe returns and a bank of powered cabinets.

Some migration gaps remain: locker contents use fixed guaranteed drops and are collected through interface buttons; card inspection is text-only; fabrication confirmation is a click rather than hold. The opening, menu, audio, saves, observation, first-person mode and full asset replacement are not yet ported. The original browser game remains unchanged.

Run the progression model test:

```sh
godot --headless --path godot --script res://test_progression.gd
```

Run the end-to-end workshop scene test:

```sh
godot --headless --path godot --script res://test_workshop.gd
```
