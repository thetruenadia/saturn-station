# Gameplay polish validation

Branch: feature/gameplay-polish-access-probe
Base: e942237ee3f78baba0abef42ba3a69c17903edfb (main at start of work)

## Changes

- Access Probe is a wrist saddle and articulated third finger, with a keyed connector and twin electrical contacts. The live robot, inventory robot clone, installed modification inspection and fabrication preview use the same geometry.
- The actual large maintenance arm is now the workstation's selectable world model. Opening it requires auxiliary power and proximity. MU-1 is positioned at a collider-clear servicing point beneath the raised arm; a fixed useful isometric camera leaves the side panel visible. Closing restores camera preferences. No complex animation added.
- Fabrication retains the existing recipe card, selection/Enter and 1.25-second hold controls. Each required component shows owned/required counts and missing quantities. Locked/discovered styles remain grey/green; matching component types stack independently of obsolete rarity fields.
- Terminal Files separates station records, access information, specification reading and physical specification export. ETNA and the existing commands/recording remain intact.
- Explicit hints identifying locker 106 were removed at the user's request; locker labels and collected-card provenance remain.
- Field arm installation controls no longer allow body part replacement. Legacy saves no longer mount an obsolete replacement arm automatically.
- Physical loot targeting ignores out-of-reach items and clears a previously selected container after interaction. Restoring an open door requires its installed probe and station power. Door-close feedback correctly directs the player to the physical socket.

## Automated checks

43/43 tests pass using the exact Three.js version used by the game (0.170.0).

New regression coverage includes mixed-rarity stacking; owned/missing recipe counts; power, discovery and proximity gating; deterministic available recipe parts; collider-clear service position; wrist attachment/key/contact geometry and clone visibility; shipped shard/dismantling/fabrication transitions; duplicate dismantling prevention; and workshop progression save restoration. The field-installation regression now asserts installation is blocked.

These are logic and geometry tests, not visual proof.

## Actual browser checks

Executed on an isolated local origin at http://localhost:8770/prototype-3d.html. The built-in travel command was used between stations; this was an assisted test, not an ordinary walking playthrough.

Passed in the browser before connection failure:
- Main menu Start game and opening skip launch a fresh game.
- Remote workshop activation without power is rejected.
- Generator interaction restores power with the original manipulator and no collected Industrial Claw.
- Worker locker opens and its physical card can be collected with E.
- Inventory card inspection displays the ETNA password.
- Powered terminal opens and Enter starts its boot sequence.
- Fresh room screenshot visually inspected.

The browser connection then repeatedly timed out, including after reconnect attempts. The final edits (including removal of locker hints) have automated coverage but were not visually rechecked.

Still unverified in the final browser build:
- Final servicing position/camera composition and third-finger appearance.
- Final recipe panel layout, keyboard crafting and pointer hold crafting.
- ETNA login, physical spec export/pickup, claw dismantling, crafting and exit as one browser sequence.
- Browser save/load of the completed fabrication sequence.
- Ordinary traversal/collision routes and mobile layout.

Keep this PR unmerged pending those checks. No changes to main, version 0.1 or legacy/0.1 files.

## Follow-up clarity pass

The subsequent assisted browser run reached demo completion and verified installed-probe/open-door restoration. It also checked final service framing, the centred arm preview, ETNA and export, component collection, Enter fabrication and the new tutorial/pickup feedback. See [PLAYTEST-CLARITY.md](PLAYTEST-CLARITY.md) for current results and remaining checks; the initial timeout report above is historical. Current suite: 48 passing tests. Pointer hold, mobile layout, audible-output listening and a full ordinary walking route remain unverified.

## Current manual assembly follow-up

Manual ingredient staging and separate probe installation are now implemented and browser-tested. The card asset, five-slot HUD, top-centre directive, controls-only H help and stronger text hierarchy are included. See [ASSEMBLY-PLAYTEST.md](ASSEMBLY-PLAYTEST.md) for the current 53-test result, assisted browser sequence and remaining checks; earlier deferred-item and auto-install descriptions above are historical.
