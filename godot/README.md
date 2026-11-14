# Saturn Station — Godot migration milestone 1

Import godot/project.godot in Godot 4 and press F6 (workshop scene) or F5 (project).
Compatibility renderer chosen for broad Mac support. This native greybox preserves the 0.2 room footprint, machinery locations, MU-1 spawn and palette, orthographic camera, WASD, mouse orbit, zoom, charge drain and a basic generator interaction. It does not reproduce the existing detailed Three.js geometry.

Test: move around the room, check obstacles and boundary, rotate/zoom/reset camera, approach the generator in the northwest and press E, verify grid changes, verify I and Esc suspend movement and charge. Restart the scene to reset.

Not yet migrated: full robot geometry/animation, detailed room art, Maker opening, menu/audio, inventory contents, crafting, modular installation, terminal/ETNA, exit puzzle, observation view, saves, first-person view. No plug-in charging added. Browser prototype remains unchanged. This milestone has not been run in Godot; report parser or runtime errors before proceeding.

Source references: ../README.md, ../room-layout.js, ../prototype-3d.js and ../ROOM-DESIGN.md.
