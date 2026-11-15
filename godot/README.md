# Native Godot port

Import project.godot with Godot 4.3+ and run F5.

WASD camera-relative movement, drag orbit, scroll zoom, R reset, E nearby interaction, I inventory, C nearby maintenance station, Q fuel cell, Esc close/pause.

This incremental port implements the workshop progression from browser 0.2: power, case and cell, locker recovery, claw salvage, ETNA login, physical spec shard, manual component staging, fabrication, separate wrist placement and installation, exit. Geometry and UI are still greybox. Locker contents use fixed guaranteed drops, collection is button-based rather than individual 3D loot, card inspection is text-only, and fabrication confirmation is a click rather than hold. Missing full robot geometry, opening, menu, audio, saves, observation, first person, and detailed art.

Run rule tests: godot --headless --path godot --script res://test_progression.gd

No local Godot runtime verification performed. Browser game remains unchanged.
