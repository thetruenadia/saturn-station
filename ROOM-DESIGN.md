# Room design and observation pass

## Layout and story

The west wall contains the power control, compressor, rotary converter and press, connected by a visible utility bus. The maintenance arm and spare-cell case remain in the service bay. The crew corner groups the lockers, control terminal and observation port, with a cup, a seat, a helmet and an unfinished handover. Sorted rejected jaws and marks on the press connect the broken claw to the surrounding machinery. Scattered floor pads and the obstructive old exchanger catwalk are removed; floor routes and zone stencils provide orientation.

Positions, collision footprints, locker placement, specification output and the Maker's new departure aisle live in `room-layout.js`. Existing saves preserve inventory and progression; obstructed saved positions fall back to the existing clear spawn.

Nine optional examine interactions provide short MU-1 observations without granting puzzle inventory or revealing the password location. Repeat observations use a bounded set of lines. Their read counts persist with the game record.

## Observation port

E at the window moves the camera toward the actual room window, with the HUD hidden. The same rendered moon, stars and plumes fill the glass in both gameplay and the close-up. There is no on-screen caption. Pointer and left/right input add subtle parallax once the camera settles. Escape or the close icon returns to the room. Movement and charge drain pause during the shot. Reduced motion skips the camera move and parallax.

## Artwork and exact generation prompts

Mode: built-in image generation tool. Original reference files are retained. Generated PNG masters remain under the tool's default generated-images directory; the game consumes high-quality JPEG exports in this checkout.

### Menu background

Final asset: `assets/menu-enceladus-v2.jpg`, 1672 × 941. Input edit target: `assets/menu-enceladus.jpg`. Original supplied film composition attribution remains in menu credits.

Prompt:

> Use case: precise-object-edit. Asset type: high resolution background image for Saturn Station game main menu. Edit target: the supplied Enceladus image. Preserve its entire composition: the enormous icy curved limb sweeping diagonally from upper left down to mid-right; backlit ice plumes descending into dark space; the tiny lone spacecraft beneath the limb near lower middle; quiet dark negative space. Improve image quality, clean compression and softness, resolve fine natural ice ridges and delicate volumetric plume detail without oversharpening. Cinematic photographic realism, restrained blue-grey and charcoal palette, subtle grain, dark exposure. No UI, no text, no logos, no extra planets or ships. Keep overall subject placement and visual mood very close. Landscape 16:9, highest available resolution.

### Observation moon surface

Final asset: `assets/enceladus-surface-v2.jpg`, 1774 × 887. New generated texture, not a scientific surface map. Lighting and depth are supplied by the live Three.js scene.

Prompt:

> Use case: stylized-concept. Asset type: seamless equirectangular colour texture for a 3D icy moon in the Saturn Station game. Create an unlit flat 2:1 longitude-latitude surface map inspired by Enceladus: pale ivory-grey ice, fine branching fractures, long blue-grey tiger-stripe fissures concentrated near the lower quarter, weathered ridges, subtle craters and regional variations. Detailed natural scientific-visualisation surface photography, restrained cinematic realism, very fine texture, not a diagram. Full image filled edge-to-edge with continuous icy terrain. Left and right edges must tile seamlessly. No perspective, no sphere silhouette, no lighting gradient, no cast shadows, no stars, no sky, no text, no labels, no border. Highest available landscape resolution. This will be wrapped onto an actual lit 3D sphere.

## Verification

58 automated tests pass, including collision-clear reachability of power, terminal, case, station, lockers, output shard and exit; a clear Maker departure route; bounded observations; and real-depth moon/star/plume geometry. Existing fabrication, installation, inventory, terminal and save tests remain included.

Actual local browser checks at localhost:8772:

- Improved menu artwork inspected in the real menu.
- Walked to and dismantled the claw; optional cup observation displayed; window approach, parallax input and Escape return executed.
- Relocated power cabinet activated through the actual interaction.
- Moved lockers, ETNA terminal, output shard and real fuel-cell use worked.
- Collected attainable recipe parts, manually fabricated, separately installed and opened the exit; congratulations reached. Travel between distant stations used the developer travel command, so this is assisted coverage.

The follow-up window revision was visually checked at 662 × 724 and 1280 × 800. The same physical frame stays visible during the push-in. The bulkhead posts and rivets clear the glass, no captions or HUD controls are visible, and Escape returns to gameplay. The port was reached in an assisted local run. Narration read counts survived save and reload. Uninterrupted Maker playback, mobile touch, browser hold-to-fabricate, and independently listened-to sound remain unverified.
