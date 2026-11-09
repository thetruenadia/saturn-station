# Manual assembly and installation pass

## Implemented

- Removed the permanent controls strip behind the hotbar. Exactly five equally sized boxes remain.
- Active directive is top centre, with stronger weight, a brighter heading and more readable action text. Crafting leaves it visible above the side panel.
- H opens controls-only help. The automatic four-page tutorial is replaced by brief initial move/look prompts and contextual E / recipe / wrist-slot arrows and labels. No password-location hint.
- Faded worker badge asset (`assets/worker-id.svg`) has Mara Venn's name, face and handwritten ETNA password. The inspection panel displays it directly at a readable size; physical 3D cards use the same artwork.
- Deleted the yellow marker geometry from the authored loose claw. Dismantling removes that actual visible model; restore keeps it removed.
- Parts are manually staged into matching recipe slots using drag/drop or click-to-place/load. Wrong types and overfilling are rejected. Staging never consumes inventory; closing cancels the tray safely.
- Fabrication consumes the loaded recipe once and produces an uninstalled probe. It appears in inventory. Installation requires placing it in the station's wrist modification slot and explicitly confirming. A stowed probe cannot open the exit.
- Saved progress distinguishes fabricated and installed probes; existing installed-probe saves remain compatible.
- UI hierarchy uses heavier headings/actions, green ready/installed states, amber placement/installation states and muted secondary information. Status words accompany colour.

## Verification

Automated suite: 53 passing logic/geometry tests, including staging limits/no consumption, separate fabrication/installation gates, uninstalled save restoration and absence of recovery-marker children. Existing system verification and syntax checks pass.

Actual browser at localhost:8771 (isolated save origin):

- Fresh opening/skip, initial movement/look prompts, H controls and the five-box HUD inspected.
- Walked to and dismantled the real claw. No yellow marker before collection, no claw after collection or after resume.
- Generator activation, physical locker pickup, faded ID card inspection, ETNA login and physical spec export/collection.
- Collected the actual attainable recipe parts. Travel command used between distant stations; this was assisted, not a full normal walking route.
- Dragged a servo into its slot; confirmed placed count. Closed/reopened and verified all 11 parts remained and staging reset.
- Click-placed the complete recipe, fabricated, and verified a separate uninstalled state and disabled installation confirmation.
- Reloaded and resumed: probe still uninstalled. Exit rejected the stowed probe.
- Dragged the probe into the wrist slot; confirmation became enabled. Confirmed installation separately, used the physical exit and reached congratulations.
- Captured final card inspection and installation-step screenshots locally in `playtest/room2-worker-card.jpg` and `playtest/room2-install-step.jpg` (outside this repository checkout).

Remaining unverified: mobile drag/drop ergonomics, hold-to-fabricate in the browser, independently listened-to audio, and a complete unassisted walking route. These changes are on PR #7, not deployed to main. Version 0.1 remains untouched.
