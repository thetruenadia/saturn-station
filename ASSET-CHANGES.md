# Prototype 0.2 reference asset pass

- Replaced the fuel cartridge with a CubeSat-inspired amber module, copper winding and protective rails; updated its inventory icon and inspection model.
- Rebuilt the hinged cell case as military electronics equipment, retaining latch and collection behavior.
- Rebuilt the pressure door around a heavy frame, actuator cylinders, hazard stripe and central locking mechanism; retained sliding-leaf controls.
- Replaced the repeated benches with an articulated olive work arm.
- Moved the collectible service arm beside the work arm at (-7.2, 3); rebuilt it around the preceding olive industrial-arm reference.
- Replaced the observation window with a chamfered ship viewport and the supplied Enceladus image.
- Added a rotary converter, hydraulic press and vertical service engine around the perimeter. Their mechanisms start with auxiliary power and coast to a stop when power is removed. Reduced-motion mode keeps the mechanisms stationary while indicators still show power.
- Removed generic screen machines, spare crates, redundant benches, dense overhead pipe/cable layers and the obsolete floating CONTROL label. Simplified the spawn salvage pile.
- Replaced obsolete collision footprints with the actual authored machine bases.

Version 0.1 files remain unchanged. Procedural models interpret the supplied references; only the supplied Enceladus photograph is used as an image asset.

Verification: 16 automated geometry, motion and gameplay regression tests passed locally, plus the existing lighting/ownership checks. Browser checks covered opening skip, empty inventory, arm collection/equip and the rebuilt case latch; developer positioning/power commands were used for focused visual checks. These checks do not establish an uninterrupted end-to-end playthrough or mobile coverage for this asset pass.

## ETNA terminal and demo-completion pass

- The service claw is lowered to the deck and supports the collectible arm. Its geometry rests at deck height; release uses gravity, a low restitution floor collision and sleep, followed by a slower damped pickup motion.
- The power cabinet now uses yellow-green analogue controls, gauge clusters, keypad banks, a mechanical isolator and a powered amber scope inspired by the newly supplied reference.
- Replaced freestanding red-light poles with wall fixtures and a low repair-bay emergency strip.
- Added a physical note under the observation window: “The password is ETNA.” Collecting it retains it in inventory and exposes it as a local terminal file. Note ownership is saved.
- Enter starts a dedicated timed terminal boot. Password entry rejects incorrect input and ETNA opens the station browser. Commands, Files and Record Entry are separate navigable sections. Record Entry saves actual progress to local device storage and reports storage failure.
- Added synthesized terminal key clicks, boot sweep, access-denied and ready sounds that follow the existing sound setting. No recorded audio is downloaded.
- Interacting with the opened door completes the demo: black screen, confetti, animated MU-1 icon, restart, credits and a simple menu destination. The designed main menu remains the next pass.
- Power-off resets terminal authentication. Reduced motion disables decorative ending animation and powered machinery movement.

Validation: 22 local automated tests passed, plus existing lighting/ownership checks. Actual browser checks verified timed boot, wrong-password rejection, ETNA login, physical note pickup, reading its file, saving through Record Entry, opening the door, reaching the congratulations screen, credits, menu destination and restarting. Weighted pickup completed in the browser. Developer power/position commands were used to reach targeted checks; this is not an uninterrupted full playthrough. Sound synthesis was implemented; listening quality and mobile layout were not audited in this pass.
