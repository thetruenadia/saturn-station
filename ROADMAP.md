# Saturn Station — Development Roadmap

Updated 7 November 2026. **This is a development checklist, not a claim that a feature has passed full QA.** Completed entries mean implemented or established in the repository. Manual verification is noted separately.

## Confirmed direction

- [x] Canonical character name: **MU-1**, replacing SRV-09.
- [x] Standard third-person controls: **WASD, mouse camera rotation, scroll zoom**. First-person can use distinct mouse-look controls.
- [x] Archive prototype 0.1 and focus active development on 0.2.
- [x] Record the draft visual style guide.
- [ ] Future: design an **installable charging component** to use powered ports. Not part of the immediate sprint.

## Milestone 1 — Complete and polish 0.2

- [x] Maker opening (implemented; presentation needs review)
- [x] 3D workshop, movement, camera and interactables
- [x] Collect and equip the manipulator; inventory inspection
- [x] Charge depletion and consumable power cell
- [x] Local auxiliary power and lighting change
- [x] ETNA terminal, password note, door command and demo ending
- [x] Main menu, save slots, load and resume
- [ ] **Uninterrupted start-to-finish playthrough without dev commands**
- [ ] Verify save/reload, depleted charge, restart and return-to-menu paths in the deployed build
- [ ] Improve repair-bay composition, visibility and machine silhouettes
- [ ] Polish manipulator pickup/contact, equipping, gait and Maker opening animation/audio
- [ ] Compare emergency/powered screenshots and refine light fixtures, shadows and materials
- [ ] Profile performance and check accessibility, narrower windows and reduced motion
- [ ] Make one focal machine the benchmark described in the style guide

## Milestone 2 — Modular gameplay and additional space

- [ ] Specify reusable component/attachment system
- [ ] Add a second installable part with a distinct function and trade-off
- [ ] Add at least one obstacle or interaction that requires that part
- [ ] Connect a second explorable station area
- [ ] Persist restored infrastructure state between areas and saves
- [ ] Plan recharge-port upgrade once modularity is proven

## Milestone 3 — Station and story

- [x] Core premise: maker-built MU-1 wakes after station-wide deterioration
- [x] Identity through change and voluntary assistance as thematic direction
- [ ] Decide what happened to the station (currently unresolved)
- [ ] Decide what happened to the Maker (currently unresolved)
- [ ] Plan station sections, connections and restoration dependencies
- [ ] Design an inhabitant and a meaningful service/help request
- [ ] Add discoverable records and environmental storytelling
- [ ] Connect modular upgrades/restoration to player choices

## Milestone 4 — Public demo readiness

- [x] Automated regression test suite exists
- [ ] Run latest automated tests and browser QA after each substantial change
- [ ] Verify hosted deployment and document its entry URL
- [ ] Check asset provenance and distribution/licensing; current film still is credited as a placeholder
- [ ] External playtesting and bug backlog
- [ ] Prepare versioned public demo notes

## Documentation and maintenance

- Current play entry is repository root, forwarding to `prototype-3d.html`.
- Prototype 0.1 is in `legacy/0.1/` and is not active.
- See `IMPROVEMENT-NOTES.md` for detailed visual polish proposals.
- Use GitHub Issues for concrete tasks with acceptance criteria; don't mark a proposal completed until actually checked.
