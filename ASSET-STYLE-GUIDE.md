# Saturn Station — Asset Style Guide (draft v0.1)

**Purpose:** keep independently created assets visually coherent at the actual isometric gameplay camera distance. This is a working reference, not a demand to remake functional assets. Validate choices against screenshots in both emergency and restored-light states.

## North star

Illustrated industrial science fiction. Machines feel designed to be used, opened, repaired and maintained. Retro-futurist/cassette-futurist controls, imperfect manufacture, dusty painted casings and mechanically credible movement. Avoid uniformly detailed, sleek or generic sci-fi props.

## Forms and silhouette

1. Identify each asset's physical purpose before modelling. Give repair bay, generator, terminal, and bulkhead **different dominant silhouettes**.
2. Prefer asymmetric cast housings, service access panels, curved/rounded corners, offset gauges, ducts and grounded supports over repeated plain boxes.
3. Read at gameplay distance first. Work with one large mass, a few secondary forms and restrained small details. Keep the MU-1 silhouette readable against the floor.
4. Add mechanisms where motion or function explains them: pistons, joints, cables, actuators, clamps, isolators, rails. No floating detail for decoration alone.
5. Keep structural and collision footprints aligned; don't block the walking route with clutter.

## Materials and illustrative treatment

- Painted steel: sage/olive or warm cream, low-gloss with broad pigment variation. Edge chips appear at handling and impact points.
- Exposed structure: charcoal steel, dark gunmetal and rubber; metal should remain distinct from ceramic or plastics.
- Weathering: directional, uneven and localised near joins, oil paths, feet and repairs. Avoid all-over wood-grain noise and identical rust on every surface.
- Use selective linework, stepped shading and focused label artwork for the vintage illustrated feel. Prioritise silhouettes over tiny outlines.
- Repair history matters: mismatched replacement panels, hand-written service dates and varied fasteners.

### Working palette (approximate, not hard locks)

| Role | Reference |
| --- | --- |
| Weathered sage housing | `#78856B` |
| Dusty cream enamel | `#C6BFA5` |
| Exposed steel | `#434B49` |
| Localised oxidised metal | `#A06845` |
| Safety markings | `#B75842` |

Existing materials should be compared with these references, not automatically overwritten.

## Technology language

Tactile black modules, mechanical toggles, sloping control surfaces, circular scopes and analogue gauge banks, restrained CRT readouts, stencils and small hazard markings. The yellow-green instrument reference provided in project discussion informs the terminal. Original designs should interpret references rather than reproduce third-party art directly.

## Lighting and scene composition

Start with dim red emergency lighting that still makes MU-1, the floor and first recoverable arm readable. Restoring power briefly and staggeredly ignites **visible** fixtures with believable light direction. Use cutaway architecture and gradual occlusion fades to keep interaction objects visible. Reduced-motion mode should avoid strong flashing.

## Asset acceptance checklist

- [ ] Recognisable role and silhouette at normal game zoom
- [ ] Mechanical function and grounded connection points make sense
- [ ] Material reads as painted metal, steel, rubber, glass or ceramic where intended
- [ ] Wear has a physical cause and is not uniform
- [ ] Readable in emergency **and** powered lighting
- [ ] Doesn't obscure MU-1, block movement or overwhelm the local focal point
- [ ] Animation, interaction range, and collision agree with visible geometry
- [ ] Uses original work / appropriately credited and licensed source assets

## First benchmark

Polish **one repair-bay focal machine** to final-reference quality before spreading its techniques across the room. Capture paired normal-camera screenshots and compare them with chosen project reference images. Document what each reference contributes (shape, palette, texture, or framing).

## Reference sources

Project outline version 0.21, `IMPROVEMENT-NOTES.md`, `ASSET-CHANGES.md`, and the shared Orion 4000 visual reference board. References to Maschinen Krieger, vintage industrial machinery and retro sci-fi illustration describe broad direction, not copying instructions.
