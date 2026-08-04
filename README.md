# WeaponVerse

WeaponVerse is a premium local-first 3D weapon museum built with **HTML, CSS, and vanilla JavaScript**, using **Three.js** and **GSAP** for cinematic presentation and interaction.

## Stack
- HTML5
- CSS3
- Vanilla JavaScript (ES modules)
- Three.js
- GSAP
- GLTFLoader
- OrbitControls
- EffectComposer + UnrealBloomPass
- HDR environment fallback via RoomEnvironment when no `.hdr` file is present

## Features
- Cinematic intro with smoke, embers, projectile streaks, flash, shake, and logo reveal
- Dark glassmorphism UI with mouse spotlight and atmospheric particles
- Responsive category, timeline, gallery, and about pages
- Dedicated weapon detail page with:
  - 3D inspection
  - Orbit + zoom + double-click reset
  - Hotspots
  - GSAP camera fly-ins
  - Component information panel
- Procedural Web Audio ambient layer, hover, click, and impact cues
- Graceful procedural weapon fallback when custom GLB/GLTF files are missing

## Folder structure
```
WeaponVerse/
├── index.html
├── categories.html
├── timeline.html
├── gallery.html
├── about.html
├── weapon.html
├── README.md
└── assets/
    ├── audio/
    ├── css/
    ├── environments/
    ├── fonts/
    ├── icons/
    ├── js/
    │   ├── core/
    │   ├── data/
    │   ├── pages/
    │   └── vendor/
    ├── models/
    │   └── weapons/
    ├── shaders/
    └── textures/
```

## Run locally
Because the project uses ES modules and optional fetch checks for local assets, serve it with a simple static server.

### Python
```bash
python3 -m http.server 8080
```
Then open:
```text
http://localhost:8080/
```

### Node
```bash
npx serve .
```

## Optional asset drop-in
Add freely licensed assets at these paths to replace the procedural fallback:
- `assets/models/weapons/ak47.glb`
- `assets/models/weapons/m4a1.glb`
- `assets/models/weapons/mp5.glb`
- `assets/environments/studio_small_03_1k.hdr`

Then register the files in:
- `assets/models/weapons/manifest.json`
- `assets/environments/manifest.json`

Example model manifest:
```json
{ "available": ["ak47.glb", "m4a1.glb", "mp5.glb"] }
```

Example environment manifest:
```json
{ "available": ["studio_small_03_1k.hdr"] }
```

The application automatically loads the real asset when listed in the manifest and otherwise keeps the experience fully functional with the procedural museum model.

## Verification checklist
- [x] All pages created
- [x] All categories present
- [x] Weapon detail page supports camera reset and hotspots
- [x] Responsive layouts use CSS grid and avoid horizontal overflow
- [x] No external CDN required; vendor files are local
- [x] Playwright validation completed with zero console errors on the default procedural build

## Notes
- Audio starts after the first user interaction because browsers block autoplay audio contexts.
- The procedural fallback is intentionally stylized so the site still feels premium even before custom GLB assets are added.
