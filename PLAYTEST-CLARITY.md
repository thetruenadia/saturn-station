# Opening clarity pass

Responds to the first external playtest: movement, camera, controls, pickups, ID card and next objectives were unclear.

Implemented:
- Four-page mechanics tutorial after the opening, replayable via H or Controls. Explains walking, orbit, zoom, R reset, E interaction, I inspection, C fabrication and Escape. No locker-location hint.
- Visible Controls and Inventory buttons, contextual instructions and an R camera reset.
- One progression-derived directive covering power, access, login, export, physical shard recovery, dismantling, missing ingredients, fabrication and exit. Finished modifications take priority over missing optional records. Death text is retained.
- Named pickup messages; a recent-items feed retains rapid pickups; subtle inventory attention feedback respects reduced motion. Dismantling lists each recovered component.
- The visible large salvage arm is now the dismantled object. Its model and marker are removed together; there is no duplicate decorative arm left behind.
- Two-sided 3D worker ID: station heading, portrait, barcode and yellow password note. Pickup asks for inspection; the inspection description explains how to use the password. Existing ETNA puzzle retained.
- Quick effects wait for the audio context to resume, rather than dropping the first effect. Dismantling now requests a collection sound.
- Service camera shifted to leave MU-1 clear of the side panel. Crafting previews are centred on their actual model bounds. Completed recipes stop reporting consumed ingredients as missing.

Deferred ideas:
- Manual ingredient placement as an optional crafting interaction.
- Additional interactive room props, after the existing route is clear.

Validation:
- 48 automated tests pass (including directive transitions, spoiler-free tutorial copy, audio resume/rapid effects, existing progression, geometry and save tests).
- Actual desktop browser: fresh opening/skip tutorial; all four guide pages; H replay; walking; camera orbit, zoom and R reset; physical salvage removal; rapid named pickups; worker card model/inspection; ETNA login; spec export/recovery; service camera and missing counts; collection of attainable parts; Enter fabrication; installed probe inspection; exit socket; congratulations; menu return; resume with installed probe and open door preserved.
- The browser run used built-in travel between distant stations. It is an assisted playthrough, not a complete ordinary traversal test.
- Screenshots captured locally in playtest/india-controls.jpg, india-salvage.jpg, india-id-card.jpg, india-workstation.jpg, india-installed-probe.jpg and india-demo-complete.jpg (not committed as repository assets).
- Audible output was not independently listened to. Pointer hold crafting and mobile layout remain unverified in this pass.

Changes remain on the existing feature branch and draft PR #7. Main and version 0.1 are untouched.
