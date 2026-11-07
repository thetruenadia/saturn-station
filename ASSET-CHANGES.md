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
