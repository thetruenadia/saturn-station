# Saturn Station — native Godot port

Open `godot/project.godot` in Godot 4.7 or newer and press F5. The Godot build now starts at a native main menu; the original browser game remains unchanged.

The current playable route covers the B-7 service bay through Generator 04. It includes a continuous Maker opening with a Y skip and direct handoff to gameplay, the workshop repair and fabrication sequence, a native MU-1 robot with walking and service animations, a more connected industrial ceiling and wall system, persisted workshop progress, a native menu/settings/credits screen, the large Generator 04 gallery, continuous walkable stairs, isometric/perspective camera switching, and a demo ending with animated confetti and a miniature dancing MU-1. The workshop has a centered task directive, pickup notices, an inspectable staff card and ETNA access note, a cinematic observation window, and short story lines for major equipment.

Controls: WASD walk, E interact, I inventory, C maintenance bench, Q use a cell, V switch isometric/perspective, drag to orbit, scroll to zoom, R reset view, Esc close or pause. Generator 04 also accepts arrow-key movement; E returns through the upper service door or completes the demo at the lower gallery door.

## Still being ported

This is a staged migration, not yet a feature-complete replacement. Ambient room audio, fuller movement and probe-install guidance, richer component inspection, and the browser build's full materials and prop interactions still need native Godot implementations. The original menu track now loops only on the main menu with a saved toggle; it stops when a demo starts. Workshop interactions have synthesized click, key and pickup cues, and the terminal plays a short boot sequence. The observation window currently uses a procedural Enceladus stand-in; the terminal also has ETNA authentication, command and file sections, a persistent record-entry section, and probe specification release. Workshop salvage remains a guaranteed recovery interface, rather than individually manipulable 3D components.

## Regression checks

```sh
godot --headless --path godot --editor --quit
godot --headless --path godot --script res://test_progression.gd
godot --headless --path godot --script res://test_workshop.gd
godot --headless --path godot --script res://test_generator_hall.gd
godot --headless --path godot --script res://test_main_menu.gd
```
