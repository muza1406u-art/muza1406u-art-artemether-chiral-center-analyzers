import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.165.0/examples/jsm/controls/OrbitControls.js";

const canvas = document.querySelector("#scene");
const assignment = document.querySelector("#assignment");
const rButton = document.querySelector("#set-r");
const sButton = document.querySelector("#set-s");

const scene = new THREE.Scene();
scene.background = new THREE.Color("#020617");

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
camera.position.set(3, 2.5, 4.6);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0xffffff, 0.55));
const keyLight = new THREE.DirectionalLight(0xffffff, 0.75);
keyLight.position.set(5, 4, 5);
scene.add(keyLight);

const group = new THREE.Group();
scene.add(group);

const centerAtom = createAtom(0xfacc15, 0.22, "C*");
group.add(centerAtom.mesh);

const substituents = [
  createSubstituent("Priority 1: O-CH3", 0xf87171),
  createSubstituent("Priority 2: Carbon Ring", 0x60a5fa),
  createSubstituent("Priority 3: CH2 Group", 0x34d399),
  createSubstituent("Priority 4: H", 0xe5e7eb),
];
substituents.forEach((sub) => group.add(sub.mesh, sub.label));

const stereoLayouts = {
  R: [
    new THREE.Vector3(1.4, 0.6, 0.6),
    new THREE.Vector3(-1.2, 0.9, 0.35),
    new THREE.Vector3(0.2, -1.1, 1.25),
    new THREE.Vector3(0.25, 0.05, -1.5),
  ],
  S: [
    new THREE.Vector3(1.4, 0.6, 0.6),
    new THREE.Vector3(0.2, -1.1, 1.25),
    new THREE.Vector3(-1.2, 0.9, 0.35),
    new THREE.Vector3(0.25, 0.05, -1.5),
  ],
};

let currentConfig = "R";
updateModel(currentConfig);

rButton.addEventListener("click", () => {
  currentConfig = "R";
  setActiveButton(rButton);
  updateModel(currentConfig);
});

sButton.addEventListener("click", () => {
  currentConfig = "S";
  setActiveButton(sButton);
  updateModel(currentConfig);
});

function createAtom(color, radius) {
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.05 });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), material);
  return { mesh };
}

function createSubstituent(text, color) {
  const atom = createAtom(color, 0.16);
  const label = makeLabel(text, color);
  const bond = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 1, 18),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1 })
  );
  atom.mesh.add(bond);
  return { mesh: atom.mesh, label, bond };
}

function updateModel(config) {
  const targets = stereoLayouts[config];

  substituents.forEach((sub, i) => {
    const target = targets[i];
    sub.mesh.position.copy(target);
    sub.label.position.copy(target.clone().multiplyScalar(1.22));

    const direction = target.clone().normalize();
    sub.bond.position.copy(direction.clone().multiplyScalar(-0.45));
    sub.bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  });

  const clockwise = config === "R" ? "clockwise" : "counterclockwise";
  assignment.textContent = `${config} configuration: With priority 4 pointed away, 1 → 2 → 3 is ${clockwise}.`;
}

function setActiveButton(active) {
  [rButton, sButton].forEach((button) => button.classList.remove("active"));
  active.classList.add("active");
}

function makeLabel(text, color) {
  const spriteCanvas = document.createElement("canvas");
  spriteCanvas.width = 420;
  spriteCanvas.height = 100;
  const ctx = spriteCanvas.getContext("2d");
  ctx.fillStyle = "rgba(2,6,23,0.75)";
  ctx.fillRect(0, 0, spriteCanvas.width, spriteCanvas.height);
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "26px Segoe UI";
  ctx.fillText(text, 20, 58);
  ctx.strokeStyle = `#${color.toString(16).padStart(6, "0")}`;
  ctx.strokeRect(2, 2, spriteCanvas.width - 4, spriteCanvas.height - 4);

  const texture = new THREE.CanvasTexture(spriteCanvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.95, 0.45, 1);
  return sprite;
}

function resize() {
  const { clientWidth, clientHeight } = canvas;
  if (clientWidth === 0 || clientHeight === 0) return;
  camera.aspect = clientWidth / clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(clientWidth, clientHeight, false);
}

window.addEventListener("resize", resize);
resize();

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
