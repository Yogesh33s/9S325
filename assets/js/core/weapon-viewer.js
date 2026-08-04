import * as THREE from 'three';
import { gsap } from 'gsap';
import { OrbitControls } from '../vendor/three/controls/OrbitControls.js';
import { GLTFLoader } from '../vendor/three/loaders/GLTFLoader.js';
import { RGBELoader } from '../vendor/three/loaders/RGBELoader.js';
import { RoomEnvironment } from '../vendor/three/environments/RoomEnvironment.js';
import { EffectComposer } from '../vendor/three/postprocessing/EffectComposer.js';
import { RenderPass } from '../vendor/three/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../vendor/three/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '../vendor/three/postprocessing/OutputPass.js';
import { createProceduralWeapon } from './procedural-weapon.js';

const manifestCache = new Map();
const gltfLoader = new GLTFLoader();
const rgbeLoader = new RGBELoader();

const HOTSPOTS = [
  ['magazine','Magazine',[0.15,-0.88,0],[0.42,0.18,1.15],'Feeds cartridges into the action.','Usually steel or polymer, detachable for rapid reloads.','Steel or reinforced polymer','Magazine geometry strongly influences reload ergonomics and reliability.','Standard magazines, couplers, enhanced followers'],
  ['trigger','Trigger',[0.05,-0.34,0],[0.32,0.16,0.9],'Releases the firing sequence when pressed.','The trigger links user input to the sear or striker mechanism.','Steel with coated surfaces','Trigger feel is one of the most discussed ergonomics topics among armorers.','Match triggers, trigger shoes'],
  ['receiver','Receiver',[0,0.05,0],[0.5,0.18,1.05],'Core chassis housing the action.','The receiver anchors the operating system, barrel interface, and furniture.','Steel, aluminum, or stamped sheet metal','Receiver design defines modularity, maintenance access, and manufacturing style.','Rails, covers, optic mounts'],
  ['charging-handle', 'Charging Handle',[-0.08,0.2,0.24],[0.18,0.22,0.88],'Manually cycles the action.','Used for chamber checks, malfunctions, and initial loading.','Steel or aluminum','Charging handle placement affects ambidexterity and manipulation speed.','Extended latches, ambi handles'],
  ['handguard','Handguard',[1.4,0,0],[0.68,0.2,1.1],'Protects the support hand from barrel heat.','Also serves as the main accessory mounting zone on modern platforms.','Polymer, aluminum, or composite','Modern handguards evolved from simple shields to fully modular interface systems.','Rails, grips, lasers, lights'],
  ['barrel','Barrel',[2.85,0.02,0],[0.92,0.22,1],'Stabilizes the projectile and determines ballistic characteristics.','Length, profile, and twist rate shape velocity, handling, and thermal behavior.','Steel','Barrel profiles often reflect intended doctrine: compact mobility or sustained precision.','Muzzle devices, barrel sleeves'],
  ['gas-block','Gas Block',[1.98,0.12,0],[0.64,0.25,0.95],'Captures gas on many self-loading rifles.','Directs a portion of propellant gas into the operating cycle.','Steel','Gas regulation became especially important with suppressors and short barrels.','Adjustable gas blocks'],
  ['muzzle','Muzzle',[4.18,0.02,0],[1.04,0.25,0.92],'Exit point for the projectile and mount location for devices.','Often fitted with flash hiders, brakes, or suppressors.','Steel','Muzzle treatment can dramatically influence flash, recoil, and sound signature.','Brakes, flash hiders, suppressors'],
  ['suppressor','Suppressor',[4.9,0.02,0],[1.1,0.3,0.95],'Moderates blast and flash when installed.','The suppressor expands and cools gases to reduce signature.','Heat-treated metal alloys','Suppressor adoption changed expectations around sound, flash, and gas management.','Covers, QD mounts'],
  ['stock','Stock',[-1.65,0.02,0],[0.15,0.2,0.95],'Braces the weapon against the shoulder.','Length of pull and cheek weld heavily affect repeatability and comfort.','Polymer, wood, or metal','Collapsible and adjustable stocks rose with modular doctrine and body armor use.','Cheek risers, recoil pads'],
  ['grip','Grip',[0.02,-0.62,0],[0.3,0.14,0.88],'Primary firing-hand interface.','Grip angle and texture shape fatigue, control, and indexing.','Polymer or rubberized composite','Grip ergonomics often differentiate competing service patterns.','Grip panels, storage cores'],
  ['iron-sight-rear','Iron Sight',[1.02,0.48,0],[0.35,0.26,0.82],'Backup aiming reference.','Mechanical sights remain relevant even in optic-dominant setups.','Steel or aluminum','Many service rifles retain irons as redundancy in harsh conditions.','Flip-up sights, tritium inserts'],
  ['scope','Scope',[0.45,0.56,0],[0.4,0.3,0.88],'Optical sighting system.','Magnified and non-magnified optics changed target acquisition and effective range.','Aluminum with coated glass','Optics are among the largest leaps in practical infantry capability.','Mounts, magnifiers, caps'],
  ['safety-selector', 'Safety Selector',[-0.33,-0.04,0.28],[0.22,0.12,0.74],'Controls safe and fire states.','Selector ergonomics influence confidence and speed under stress.','Steel or polymer lever','Fire-control lever design often reflects doctrine and human factors thinking.','Ambidextrous selectors']
];

const loadManifest = async (path) => {
  if (manifestCache.has(path)) return manifestCache.get(path);
  try {
    const response = await fetch(path);
    const json = await response.json();
    manifestCache.set(path, json.available || []);
    return manifestCache.get(path);
  } catch {
    manifestCache.set(path, []);
    return [];
  }
};

export class WeaponViewer {
  constructor(container, weapon, options = {}) {
    this.container = container;
    this.weapon = weapon;
    this.options = { mode: 'preview', interactive: false, showHotspots: false, onHotspot: null, onAssetStatus: null, ...options };
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.pmrem = null;
    this.model = null;
    this.hotspots = [];
    this.hotspotElements = [];
    this.focusedHotspot = null;
    this.mouseInteracting = false;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.options.mode === 'detail' ? 2 : 1.5));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(this.options.mode === 'detail' ? 38 : 32, container.clientWidth / container.clientHeight, 0.1, 100);
    this.camera.position.set(2.7, 1.1, 6.1);
    this.defaultCamera = this.camera.position.clone();
    this.defaultTarget = new THREE.Vector3(0.5, 0.1, 0);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.minDistance = this.options.mode === 'detail' ? 2.4 : 4.6;
    this.controls.maxDistance = this.options.mode === 'detail' ? 9 : 7.2;
    this.controls.enabled = this.options.interactive;
    this.controls.target.copy(this.defaultTarget);
    this.controls.addEventListener('start', () => { this.mouseInteracting = true; });
    this.controls.addEventListener('end', () => { this.mouseInteracting = false; });

    if (this.options.mode === 'detail') {
      this.composer = new EffectComposer(this.renderer);
      this.composer.addPass(new RenderPass(this.scene, this.camera));
      const bloom = new UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), 0.7, 0.7, 0.4);
      this.composer.addPass(bloom);
      this.composer.addPass(new OutputPass());
    }

    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.addLights();
    this.addFloor();
    this.prepareEnvironment();
    this.loadWeapon();
    this.bindEvents();
    this.renderLoop();
  }

  addLights() {
    const hemi = new THREE.HemisphereLight('#d3e8ff', '#09111f', 1.4);
    this.scene.add(hemi);
    const key = new THREE.DirectionalLight('#ffffff', 2.6);
    key.position.set(4, 6, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight('#ff944f', 1.2);
    rim.position.set(-5, 2, -4);
    this.scene.add(rim);
    const fill = new THREE.PointLight('#76d6ff', 1.1, 18);
    fill.position.set(0, 1.8, 3.6);
    this.scene.add(fill);
  }

  addFloor() {
    const floor = new THREE.Mesh(new THREE.CircleGeometry(4.2, 48), new THREE.ShadowMaterial({ opacity: 0.25 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.35;
    floor.receiveShadow = true;
    this.scene.add(floor);
    const ring = new THREE.Mesh(new THREE.RingGeometry(2.6, 3.1, 64), new THREE.MeshBasicMaterial({ color: '#ff7b2f', transparent: true, opacity: 0.12, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -1.31;
    this.scene.add(ring);
  }

  async prepareEnvironment() {
    this.pmrem = new THREE.PMREMGenerator(this.renderer);
    const fallback = () => {
      const env = this.pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      this.scene.environment = env;
    };
    const availableEnvironments = await loadManifest('assets/environments/manifest.json');
    const environmentFile = this.weapon.environmentPath.split('/').pop();
    const hasHdr = availableEnvironments.includes(environmentFile);
    if (!hasHdr) {
      fallback();
      return;
    }
    try {
      const hdr = await rgbeLoader.loadAsync(this.weapon.environmentPath);
      const env = this.pmrem.fromEquirectangular(hdr).texture;
      this.scene.environment = env;
      hdr.dispose();
    } catch {
      fallback();
    }
  }

  async loadWeapon() {
    const availableModels = await loadManifest('assets/models/weapons/manifest.json');
    const modelFile = this.weapon.modelPath.split('/').pop();
    const hasModel = availableModels.includes(modelFile);
    let model;
    if (hasModel) {
      try {
        const gltf = await gltfLoader.loadAsync(this.weapon.modelPath);
        model = gltf.scene;
        this.options.onAssetStatus?.('GLB model loaded');
      } catch {
        model = createProceduralWeapon(this.weapon);
        this.options.onAssetStatus?.('Procedural exhibit active');
      }
    } else {
      model = createProceduralWeapon(this.weapon);
      this.options.onAssetStatus?.('Procedural exhibit active');
    }

    model.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        if (node.material) {
          node.material.envMapIntensity = node.material.envMapIntensity || 1.2;
          node.userData.baseColor = node.material.color?.clone?.() || null;
          node.userData.baseEmissive = node.material.emissive?.clone?.() || null;
          node.userData.baseEmissiveIntensity = node.material.emissiveIntensity || 0;
        }
      }
    });

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    model.position.y += size.y * 0.12 - 0.2;
    const fitScale = this.options.mode === 'detail' ? 3.3 / size.x : 2.4 / size.x;
    model.scale.multiplyScalar(fitScale);
    this.model = model;
    this.root.add(model);

    if (this.options.showHotspots) this.createHotspots();
  }

  createHotspots() {
    this.hotspots = HOTSPOTS.map(([id, label, position, focusOffset, purpose, description, material, history, accessories]) => {
      const anchor = new THREE.Object3D();
      anchor.position.set(...position);
      this.model.add(anchor);
      return { id, label, anchor, focusOffset: new THREE.Vector3(...focusOffset), purpose, description, material, history, accessories };
    });
    this.hotspots.forEach((hotspot) => {
      const element = document.createElement('div');
      element.className = 'weapon-hotspot';
      element.innerHTML = `<button type="button" aria-label="${hotspot.label}"></button><span>${hotspot.label}</span>`;
      element.querySelector('button').addEventListener('click', () => this.focusHotspot(hotspot.id));
      this.container.appendChild(element);
      this.hotspotElements.push({ hotspot, element });
    });
  }

  focusHotspot(id) {
    const hotspot = this.hotspots.find((item) => item.id === id);
    if (!hotspot) return;
    this.focusedHotspot = hotspot;
    const target = hotspot.anchor.getWorldPosition(new THREE.Vector3());
    const cam = target.clone().add(hotspot.focusOffset);
    gsap.to(this.camera.position, { x: cam.x, y: cam.y, z: cam.z, duration: 1.1, ease: 'power3.inOut' });
    gsap.to(this.controls.target, { x: target.x, y: target.y, z: target.z, duration: 1.1, ease: 'power3.inOut' });
    this.highlightMesh(id);
    this.options.onHotspot?.(hotspot);
  }

  highlightMesh(id) {
    if (!this.model) return;
    this.model.traverse((node) => {
      if (!node.isMesh || !node.material?.color) return;
      const isTarget = node.name.includes(id);
      node.material.color.copy(node.userData.baseColor || new THREE.Color('#6c788c'));
      node.material.emissive = node.material.emissive || new THREE.Color('#000000');
      node.material.emissive.copy(isTarget ? new THREE.Color('#ff7b2f') : new THREE.Color('#000000'));
      node.material.emissiveIntensity = isTarget ? 0.75 : (node.userData.baseEmissiveIntensity || 0);
      if (!isTarget) node.material.color.multiplyScalar(this.focusedHotspot ? 0.72 : 1);
    });
  }

  resetCamera() {
    this.focusedHotspot = null;
    gsap.to(this.camera.position, { x: this.defaultCamera.x, y: this.defaultCamera.y, z: this.defaultCamera.z, duration: 0.9, ease: 'power2.out' });
    gsap.to(this.controls.target, { x: this.defaultTarget.x, y: this.defaultTarget.y, z: this.defaultTarget.z, duration: 0.9, ease: 'power2.out' });
    this.highlightMesh('');
  }

  bindEvents() {
    const resize = () => {
      const width = this.container.clientWidth || 1;
      const height = this.container.clientHeight || 1;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
      this.composer?.setSize(width, height);
    };
    resize();
    window.addEventListener('resize', resize);
    this.container.addEventListener('dblclick', () => this.resetCamera());
  }

  updateHotspots() {
    if (!this.hotspotElements.length) return;
    this.hotspotElements.forEach(({ hotspot, element }) => {
      const world = hotspot.anchor.getWorldPosition(new THREE.Vector3());
      const projected = world.project(this.camera);
      const visible = projected.z < 1 && projected.z > -1;
      element.style.display = visible ? 'flex' : 'none';
      if (!visible) return;
      element.style.left = `${(projected.x * 0.5 + 0.5) * this.container.clientWidth}px`;
      element.style.top = `${(-projected.y * 0.5 + 0.5) * this.container.clientHeight}px`;
    });
  }

  renderLoop() {
    const tick = () => {
      requestAnimationFrame(tick);
      const delta = this.clock.getDelta();
      if (this.model && !this.mouseInteracting && !this.focusedHotspot) this.model.rotation.y += delta * (this.options.mode === 'detail' ? 0.18 : 0.3);
      this.controls.update();
      this.updateHotspots();
      if (this.composer) this.composer.render(); else this.renderer.render(this.scene, this.camera);
    };
    tick();
  }
}
