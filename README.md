# Saturn Station

An experimental 3D science-fiction exploration/adventure game set aboard a deteriorating industrial settlement orbiting Saturn.

Play as **MU-1**, a modular maintenance machine created to help the people living on the station. The present playable prototype is a self-contained workshop demo; the wider station, interchangeable systems and narrative are still in development.

## Play prototype 0.2

Serve the repository over HTTP (JavaScript modules require it):

```sh
python3 -m http.server 8876
```

Visit **http://localhost:8876/** (redirects to `prototype-3d.html`). The 0.2 main menu is integrated into the game. Requires a modern WebGL browser and an internet connection for the Three.js CDN.

**Controls:** WASD to move; drag the mouse to rotate the isometric camera; scroll to zoom; E to interact; I for inventory; Q to use a power cell; Escape to pause. Any first-person view can use its own appropriate mouse-look controls. For other controls follow the in-game prompts.

## Project status

- **Active:** prototype 0.2 — 3D workshop, Maker opening, equipment collection, power switching, ETNA terminal, main menu and local save slots.
- **Archived:** prototype 0.1 — retained only for reference at [legacy/0.1/](legacy/0.1/). No new features should target it.
- **Next:** end-to-end demo review and workshop art/animation polish, then more meaningful modular equipment and a second station area.
- **Later:** an installable charging interface for powered charging ports (design undecided); wider infrastructure restoration and inhabited areas.

See [ROADMAP.md](ROADMAP.md), [ASSET-STYLE-GUIDE.md](ASSET-STYLE-GUIDE.md), [OPENING.md](OPENING.md), [IMPROVEMENT-NOTES.md](IMPROVEMENT-NOTES.md) and [ASSET-CHANGES.md](ASSET-CHANGES.md).

## Tests

```sh
node --test tests/*.test.mjs
node verify-systems.mjs
node --check prototype-3d.js
node --check maker-opening.js
```

Automated checks do not replace a full browser playthrough. The root `index.html` forwards to the active prototype so static hosting opens 0.2 by default.

## Design decisions

MU-1 is the canonical robot designation (SRV-09 is retired). Third-person movement is WASD with mouse camera rotation and wheel zoom; first-person mode may differ. Do not implement plug-in charging yet: it is reserved for a future installable modification.

### Background music

The supplied `main menu.m4a` plays as a loop in the menu and game. A normalized MP3 is preferred for consistent browser playback; the original AAC and a PCM WAV fallback are retained. Music attempts autoplay, and a PLAY MUSIC button appears when playback is blocked. Clicks or keypresses (including inside the embedded menu) retry playback, respects MUSIC and SOUND controls, and pauses while the tab is hidden. Opening the menu keeps the same player; start/load currently reloads the game, so a recent session playback position is restored after that reload. Browser autoplay rules may require another gesture after navigation. No playback failure prevents gameplay.
