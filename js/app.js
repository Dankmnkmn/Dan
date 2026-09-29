import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CATALOG, BODY_TYPES, TINTS, PAINTS } from './data.js';
import { buildCar } from './car.js';

const state = {
  brand: 'Peugeot',
  model: '3008',
  front: 'none',
  rear: '15',
  paint: 'blanc',
};

const $ = (id) => document.getElementById(id);
const tintById = (id) => TINTS.find((t) => t.id === id);
const paintById = (id) => PAINTS.find((p) => p.id === id);
const currentModel = () => CATALOG.find((b) => b.brand === state.brand).models.find((m) => m.name === state.model);

// ---------- Scène 3D ----------
const viewport = $('viewport');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
viewport.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 3.5;
controls.maxDistance = 22;
controls.maxPolarAngle = Math.PI * 0.49;
controls.enablePan = false;

const sun = new THREE.DirectionalLight(0xffffff, 1.6);
sun.position.set(4, 8, 5);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 25 });
sun.shadow.radius = 6;
scene.add(sun);
scene.add(new THREE.HemisphereLight(0xdfe8f0, 0x3a3a3a, 0.5));

const floor = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.ShadowMaterial({ opacity: 0.32 }));
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);
const plinth = new THREE.Mesh(
  new THREE.CircleGeometry(3.4, 96),
  new THREE.MeshStandardMaterial({ color: 0x7f868c, roughness: 0.6, metalness: 0.1, transparent: true, opacity: 0.1 }),
);
plinth.rotation.x = -Math.PI / 2;
plinth.position.y = 0.002;
scene.add(plinth);

let car = null;
// Opacités animées : valeur affichée → valeur cible
const glassAnim = { front: { cur: 0, target: 0 }, rear: { cur: 0, target: 0 } };

function rebuildCar() {
  const m = currentModel();
  if (car) {
    scene.remove(car.group);
    car.dispose();
  }
  glassAnim.front.target = tintById(state.front).opacity;
  glassAnim.rear.target = tintById(state.rear).opacity;
  glassAnim.front.cur = glassAnim.front.target;
  glassAnim.rear.cur = glassAnim.rear.target;
  car = buildCar(m, paintById(state.paint).hex, glassAnim.front.cur, glassAnim.rear.cur);
  scene.add(car.group);
  controls.target.set(0, m.H * 0.45, 0);
  plinth.scale.setScalar(m.L / 4.4);
}

const VIEWS = {
  rear34: (d) => new THREE.Vector3(-d.L * 1.05, d.H * 1.35, d.W * 2.4),
  front34: (d) => new THREE.Vector3(d.L * 1.05, d.H * 1.25, d.W * 2.3),
  side: (d) => new THREE.Vector3(0, d.H * 0.9, d.L * 1.45),
  rear: (d) => new THREE.Vector3(-d.L * 1.5, d.H * 1.2, 0.001),
};
let camTween = null;
function setView(name, instant = false) {
  // Recul adapté au format de l'écran pour que le véhicule reste entier dans le cadre
  const fit = 1.2 / Math.min(1, camera.aspect / 1.35);
  const to = VIEWS[name](car.dims).multiplyScalar(fit);
  document.querySelectorAll('[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === name)));
  if (instant || reduceMotion) {
    camera.position.copy(to);
    camTween = null;
  } else {
    camTween = { from: camera.position.clone(), to, t: 0 };
  }
}

function resize() {
  const { clientWidth: w, clientHeight: h } = viewport;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(viewport);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clock = new THREE.Clock();
function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (camTween) {
    camTween.t = Math.min(1, camTween.t + dt * 1.6);
    const e = 1 - Math.pow(1 - camTween.t, 3);
    camera.position.lerpVectors(camTween.from, camTween.to, e);
    if (camTween.t >= 1) camTween = null;
  }
  for (const zone of ['front', 'rear']) {
    const a = glassAnim[zone];
    if (Math.abs(a.cur - a.target) > 0.001) {
      a.cur += (a.target - a.cur) * Math.min(1, dt * (reduceMotion ? 60 : 5));
      car.materials[zone].opacity = a.cur;
    }
  }
  controls.autoRotate = $('autorotate').checked && !camTween;
  controls.autoRotateSpeed = 1.2;
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

// ---------- Interface ----------
function fillBrands() {
  $('brand').innerHTML = CATALOG.map((b) => `<option value="${b.brand}">${b.brand}</option>`).join('');
  $('brand').value = state.brand;
}
function fillModels() {
  const models = CATALOG.find((b) => b.brand === state.brand).models;
  $('model').innerHTML = models.map((m) => `<option value="${m.name}">${m.name}</option>`).join('');
  if (!models.some((m) => m.name === state.model)) state.model = models[0].name;
  $('model').value = state.model;
}

function tintButtons(zone) {
  const el = $(`tints-${zone}`);
  el.innerHTML = TINTS.map(
    (t) => `<button type="button" class="tint" data-zone="${zone}" data-tint="${t.id}" aria-pressed="false" title="${t.name}">
      <span class="tint-swatch" style="--o:${t.opacity}"></span>
      <span class="tint-label">${t.label}</span>
    </button>`,
  ).join('');
}

function fillPaints() {
  $('paints').innerHTML = PAINTS.map(
    (p) => `<button type="button" class="paint" data-paint="${p.id}" aria-pressed="false" title="${p.name}" aria-label="${p.name}" style="--c:${p.hex}"></button>`,
  ).join('');
}

function describeTint(id) {
  const t = tintById(id);
  return t.vlt === null ? 'Verre d’origine' : `TLV ${t.vlt} % · ${t.name.toLowerCase()}`;
}

function syncUI() {
  document.querySelectorAll('.tint').forEach((b) => b.setAttribute('aria-pressed', String(state[b.dataset.zone] === b.dataset.tint)));
  document.querySelectorAll('.paint').forEach((b) => b.setAttribute('aria-pressed', String(state.paint === b.dataset.paint)));
  const m = currentModel();
  $('vehicle-name').textContent = `${state.brand} ${state.model}`;
  $('vehicle-meta').textContent = `${BODY_TYPES[m.body].label} · ${m.L.toFixed(2).replace('.', ',')} m`;
  $('sum-front').textContent = describeTint(state.front);
  $('sum-rear').textContent = describeTint(state.rear);
  $('sum-paint').textContent = paintById(state.paint).name;
  $('tint-front-value').textContent = tintById(state.front).label;
  $('tint-rear-value').textContent = tintById(state.rear).label;
  $('legal').hidden = state.front === 'none';
}

function setTint(zone, id) {
  state[zone] = id;
  glassAnim[zone].target = tintById(id).opacity;
  syncUI();
}

$('brand').addEventListener('change', (e) => {
  state.brand = e.target.value;
  fillModels();
  rebuildCar();
  setView('rear34');
  syncUI();
});
$('model').addEventListener('change', (e) => {
  state.model = e.target.value;
  rebuildCar();
  setView('rear34');
  syncUI();
});
document.addEventListener('click', (e) => {
  const tint = e.target.closest('.tint');
  if (tint) setTint(tint.dataset.zone, tint.dataset.tint);
  const paint = e.target.closest('.paint');
  if (paint) {
    state.paint = paint.dataset.paint;
    car.materials.paint.color.set(paintById(state.paint).hex);
    syncUI();
  }
  const view = e.target.closest('[data-view]');
  if (view) setView(view.dataset.view);
});
$('reset').addEventListener('click', () => {
  setTint('front', 'none');
  setTint('rear', 'none');
});

fillBrands();
fillModels();
tintButtons('front');
tintButtons('rear');
fillPaints();
rebuildCar();
resize();
setView('rear34', true);
syncUI();
tick();
