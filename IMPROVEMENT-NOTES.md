# Saturn Station 0.2 — improvement notes

Updated: 7 November 2026

These notes capture the direction agreed in chat and follow-up work suggested by the recent browser reviews. Unchecked items are proposed work, not implemented features or newly verified bugs.

## Direction to preserve

- Preserve 0.1 while developing the separate 0.2 prototype.
- Reference board: [Orion 4000](https://uk.pinterest.com/yomnk_/orion-4000/) — original shared link: https://pin.it/JdycxU2U7.
- The user likes the improved visuals, but wants a stronger expression of the intended direction.
- Aim for illustrated industrial science fiction: distinctive mechanisms, dusty cream and olive paint, rust, exposed repairs, restrained colour accents and a sense of history.
- Keep dim red emergency lighting at the start. Restoring power should briefly flicker into working lights at visible fixtures.
- Keep the compact 20-slot inventory and small rotatable inspection preview.
- Inspection must show only selected owned items, remain empty before selection, and clear unavailable items.
- Keep music and brightness settings with local persistence.

## Priority 1 — composition and visual identity

- [ ] Rework the strongest remaining box-shaped props into recognizable machines with a clear purpose. Use asymmetric housings, rounded castings, offset gauges and service connections.
- [ ] Give each working area one dominant silhouette: repair bay, generator machinery, control alcove and exit. Reduce small repeated shapes around those focal points.
- [ ] Review the whole walking route at normal camera distance. Foreground pillars still dominated portions of the last screenshots; use deliberate cutaway architecture before relying on transparency.
- [ ] Make occlusion fades gradual, and verify they restore correctly when the camera moves. Check that outlines and shadows do not leave distracting remnants.
- [ ] Create an intentional opening composition: MU-1 readable against the floor, the recoverable arm discoverable, and enough open space to understand movement.
- [ ] Add differences in age and repair history to individual machines: replacement panels, missing paint, handwritten service dates and mismatched fasteners. Avoid uniform wear on every surface.

Acceptance: repair bay, generator and terminal should be distinguishable by silhouette in a small screenshot, with MU-1 readable throughout the route.

## Priority 2 — illustration and materials

- [ ] Reduce any remaining wood-like grain on painted metal. Prefer broad pigment variation, edge wear and localized grime.
- [ ] Tune stepped shading so cream paint, steel, rubber and ceramic remain distinct under both lighting states.
- [ ] Use outlines selectively. Avoid giving every small detail equal visual weight.
- [ ] Add localized drawn details and surface artwork to focal assets rather than increasing geometry everywhere.
- [ ] Compare matching camera views against selected board references. Record which reference informs shape, surface treatment, palette or composition; do not treat all pins as one uniform style.

Acceptance: painted surfaces should read as illustrated metal at gameplay distance, with detail concentrated where it helps describe the object.

## Priority 3 — lighting and atmosphere

- [ ] Check default brightness on a fresh save. Emergency lighting should remain low and red while keeping MU-1, nearby floor and the first interaction readable.
- [ ] Check each work light from several angles: the visible luminous face should agree with where the light lands.
- [ ] Review light spill and shadows around walls, machinery and the exit; avoid light passing implausibly through solid structures.
- [ ] Keep flicker brief and staggered. Verify reduced-motion mode produces a gentle fade.
- [ ] Add subtle atmosphere only after composition works: occasional dust near lamps, a small vent release or slow indicator activity.

## Priority 4 — character and interactions

- [ ] Refine arm recovery so the gripper visibly contacts the part before lifting. Review reach distance, jaw closure and the transition into storage.
- [ ] Add distinct motions for throwing the generator switch and releasing the case.
- [ ] Review gait foot contact, turns and stopping at several frame rates.
- [ ] Keep interaction prompts concise and contextual. Position them so they do not cover MU-1 or the object being operated.
- [ ] Consider a short equip animation that visibly connects the recovered arm to the chassis.

## Priority 5 — interface, audio and continuity

- [ ] Review inventory selection, keyboard focus, drag-to-equip and equip/unequip at narrow window sizes.
- [ ] Check consumed power cells disappear from both inventory and inspection, with a consistent hotbar state.
- [ ] Balance the ambient music independently of machinery and footsteps; verify zero music volume leaves effects audible when master sound is on.
- [ ] Check settings from gameplay and the pause menu, including keyboard sliders, Escape, saved values and return to the previous pause state.
- [ ] Verify fresh start, reload, consumed items, power off, door state and restart. Restart should clear progress while preserving preferences.
- [ ] Show save/load failures clearly if local storage is unavailable.

## Verification and delivery

- [ ] Verify the committed build through the hosted page after deployment, as well as the local preview.
- [ ] Serve the prototype over HTTP when testing its JavaScript modules; separately review what a player sees when opening the HTML directly from disk.
- [ ] Capture comparable emergency and powered screenshots at default brightness.
- [ ] Profile frame rate before adding more geometry or effects. Prioritize reducing draw calls and unnecessary lights if performance drops.
- [ ] Keep runtime changes separate from these notes; mark a proposal complete only after its behaviour has been checked.

## Suggested next pass

Start with the opening repair-bay composition and one fully developed focal machine. Compare the result with the reference board before extending that treatment across the entire room.
