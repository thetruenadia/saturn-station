# Saturn Station — native Godot port

Open `godot/project.godot` in Godot 4.7 or newer and press F5. The Godot build now starts at a native main menu; the original browser game remains unchanged.

The current playable route covers the B-7 service bay through Generator 04. It includes a continuous Maker opening with a Y skip and direct handoff to gameplay, the workshop repair and fabrication sequence with components dragged into a fabrication tray and the finished probe dragged into MU-1's wrist socket, a loose manipulator animated from the maintenance claw before it is stored and equipped through the inventory, click-to-select and E-to-approach object interactions, a native MU-1 robot with walking and service animations, a more connected industrial ceiling and wall system, staged overhead lighting and wall-mounted emergency beacons that respond to auxiliary power, saved workshop progression and world state (position, heading, charge, and camera) with a tested file-backed save and reload, native menu and in-game pause/settings/credits screens, a power-depletion shutdown screen with fresh-shift reboot, saved sound and brightness preferences, the large Generator 04 gallery, continuous walkable stairs, isometric/perspective camera switching, and a demo ending with animated confetti and a miniature dancing MU-1. The workshop has a responsive 20-slot item grid that reflows to three columns with stacked inspection at 320 pixels, a rotatable 3D inspection preview and five-slot numbered quick inventory, a persistent movement/camera legend, a centered task directive, pickup notices, an inspectable staff card and ETNA access note, a cinematic observation window, connected wall wiring and floor route marks, and story details for equipment and crew belongings.

Controls: WASD walk; click an object and press E to approach or interact; E also interacts with the nearest object; I inventory; C maintenance bench; Q use a cell; V switch isometric/perspective; drag to orbit; scroll to zoom; R reset view; Esc close or pause. WASD interrupts the automatic approach. Generator 04 also accepts arrow-key movement; E returns through the upper service door or completes the demo at the lower gallery door.

## Still being ported

This is a staged migration, not yet a feature-complete replacement. Richer component inspection and the browser build's full materials and prop interactions still need native Godot implementations. The original menu track loops only on the main menu with a saved toggle; it stops when a demo starts. The workshop has a quiet looping power-room hum, separate synthesized click/key/pickup cues, and terminal boot tones. The ambience is stopped on the menu backdrop, keeping the menu soundtrack separate. Terminal commands 1, 2 and 3 check the isolated link, seal the exit, and shut down auxiliary power. The observation window currently uses a procedural Enceladus stand-in; the terminal also has ETNA authentication, command and file sections, a persistent record-entry section, and probe-spec release. Locker recovery remains a simplified interface. Recipe components must be dragged into the fabrication tray, and the finished probe must then be dragged into MU-1's wrist socket. Visual playtesting remains unverified.

## Regression checks

```sh
godot --headless --path godot --editor --quit
godot --headless --path godot --script res://test_progression.gd
godot --headless --path godot --script res://test_workshop.gd
godot --headless --path godot --script res://test_generator_hall.gd
godot --headless --path godot --script res://test_main_menu.gd
```
