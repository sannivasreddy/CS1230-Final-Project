import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { updateCubes, loadModels, randomizeOffset, clearModels, initSceneLights } from './generator';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 
  window.innerWidth / window.innerHeight, 0.1, 200);

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(undefined, 1, 1, 1))

const controls = new PointerLockControls(camera, renderer.domElement);
controls.pointerSpeed = 2;

let locked = false;

renderer.domElement.addEventListener('click', function () {
  if (locked) {
    controls.unlock();
    locked = false;
  } else {
    controls.lock();
    locked = true;
  }
}, false)

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

function onKeyDown(event) {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      moveForward = true;
      break;

    case 'ArrowLeft':
    case 'KeyA':
      moveLeft = true;
      break;

    case 'ArrowDown':
    case 'KeyS':
      moveBackward = true;
      break;

    case 'ArrowRight':
    case 'KeyD':
      moveRight = true;
      break;
  }
}

function onKeyUp(event) {
  switch (event.code) {
    case 'ArrowUp':
    case 'KeyW':
      moveForward = false;
      break;

    case 'ArrowLeft':
    case 'KeyA':
      moveLeft = false;
      break;

    case 'ArrowDown':
    case 'KeyS':
      moveBackward = false;
      break;

    case 'ArrowRight':
    case 'KeyD':
      moveRight = false;
      break;
  }
}

document.addEventListener('keydown', onKeyDown, false)
document.addEventListener('keyup', onKeyUp, false)

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function randomizeScene() {
  clearModels(scene);
  randomizeOffset();
  updateCubes(scene, camera);
}

function createPanel() {
  const panel = new GUI({width: 300});

  const myObject = {
    'Randomize Scene': randomizeScene
  }
  panel.add(myObject, 'Randomize Scene');
}

createPanel();

// OLD LIGHTING
const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
scene.add(hemiLight);

// const dirLight = new THREE.DirectionalLight(0xffffff, 3);
// dirLight.color.setHSL(0.1, 1, 0.95);
// dirLight.position.set(0, 1, 1);
// scene.add(dirLight);

let ambientLight = new THREE.AmbientLight(0xffffff,0.5);
scene.add(ambientLight);

// initSceneLights(scene);

const texture_loader = new THREE.TextureLoader();
texture_loader.setPath('./images/worn_floor/');

// FLOOR

const floor_color = texture_loader.load('wood_floor_worn_diff_1k.jpg');
floor_color.wrapS = THREE.RepeatWrapping;
floor_color.wrapT = THREE.RepeatWrapping;
floor_color.repeat.set(32, 32);
const floor_disp = texture_loader.load('worn_disp.jpg');
const floor_bump = texture_loader.load('worn_b.jpg');

const geometry = new THREE.PlaneGeometry(60, 60, 10, 10);
const material = new THREE.MeshPhongMaterial({
  map: floor_color,
  displacementMap: floor_disp,
  displacementScale: 0.1,
  bumpMap: floor_bump,
  bumpScale: 10
});

const floor = new THREE.Mesh( geometry, material );
floor.lookAt(new THREE.Vector3(0, 1, 0));
scene.add( floor );

// RUG

const rug_texture = texture_loader.load('rug_two.png');
rug_texture.anisotropy = 8;
const rug_dis = texture_loader.load('rug_dis.png');
rug_texture.wrapS = THREE.RepeatWrapping;
rug_texture.wrapT = THREE.RepeatWrapping;
rug_texture.repeat.set(1,32);

const rug_geometry = new THREE.PlaneGeometry(1, 60, 100, 100);
const rug_material = new THREE.MeshPhongMaterial({map: rug_texture, displacementMap: rug_dis, displacementScale: 0.02});
const rug = new THREE.Mesh(rug_geometry, rug_material);
rug.lookAt(new THREE.Vector3(0,1,0));
rug.position.set(0,0.08,0);

scene.add(rug);

// WALLS 
texture_loader.setPath('./images/walls/');

const wall_ceiling_height = 55; 
const ceiling_height = 30;
const walls_height = 22;

const wall_forward_texture = texture_loader.load('library_window_two.png');
const wall_b = texture_loader.load('library_two_b.png');
const wall_dis = texture_loader.load('test.png');
const ceiling_dis = texture_loader.load('ceiling_dis.png');
const ceiling_texture = texture_loader.load('ceiling.png');

const wall_geometry = new THREE.PlaneGeometry(200, wall_ceiling_height, 1000, 1000);
const ceiling_geometry = new THREE.PlaneGeometry(120, 120, 100, 100);
const ceiling_material = new THREE.MeshPhongMaterial({
  map: ceiling_texture,
  displacementMap: ceiling_dis,
  displacementScale: 0
});
const wall_material_front = new THREE.MeshPhongMaterial({
  map: wall_forward_texture,
  bumpMap: wall_b,
  bumpScale: 10,
  displacementMap: wall_dis,
  displacementScale: 6
});

const wall_forward = new THREE.Mesh(wall_geometry, wall_material_front);
const wall_left = new THREE.Mesh(wall_geometry, wall_material_front);
const wall_right = new THREE.Mesh(wall_geometry, wall_material_front);
const wall_back = new THREE.Mesh(wall_geometry, wall_material_front);
const wall_ceiling = new THREE.Mesh(ceiling_geometry, ceiling_material);

wall_left.lookAt(new THREE.Vector3(1,0,0));
wall_forward.lookAt(new THREE.Vector3(0,0,0));
wall_right.lookAt(new THREE.Vector3(-1, 0, 0));
wall_back.lookAt(new THREE.Vector3(0,0,-1));
wall_ceiling.lookAt(new THREE.Vector3(0,-1,0));

wall_forward.position.set(0,walls_height,-100);
wall_left.position.set(-100, walls_height, 0);
wall_right.position.set(100, walls_height, 0);
wall_back.position.set(0, walls_height , 100);
wall_ceiling.position.set(0, ceiling_height, 0);

scene.add(wall_forward);
scene.add(wall_left);
scene.add(wall_right);
scene.add(wall_back);
scene.add(wall_ceiling);


scene.add(camera);

camera.position.set(0, 0.5, 0);

const clock = new THREE.Clock();
const direction = new THREE.Vector3();

const promise = loadModels();
promise.then(result => {
  updateCubes(scene, camera);
});

let offsetX, offsetZ;

function animate() {
  requestAnimationFrame(animate);

  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.normalize();

  const time = clock.getDelta();

  if ((direction.x !== 0) || (direction.z !== 0)) {
    controls.moveForward(direction.z * 2 * time);
    controls.moveRight(direction.x * 2 * time);

    updateCubes(scene, camera);

    floor.position.set(camera.position.x, floor.position.y, camera.position.z);
    rug.position.set(rug.position.x, rug.position.y, camera.position.z);

    wall_forward.position.set(camera.position.x, floor.position.y + walls_height, camera.position.z - 100);
    wall_left.position.set(camera.position.x - 100, floor.position.y + walls_height, camera.position.z);
    wall_right.position.set(camera.position.x + 100, floor.position.y + walls_height, camera.position.z);
    wall_back.position.set(camera.position.x, floor.position.y + walls_height, camera.position.z + 100);
    wall_ceiling.position.set(camera.position.x, floor.position.y + ceiling_height, camera.position.z);

    offsetX = camera.position.x / 2;
    offsetZ = -camera.position.z / 2;

    floor.material.map.offset.set(offsetX, offsetZ);
    rug.material.map.offset.set(0, offsetZ);
    wall_ceiling.material.map.offset.set(offsetX / 1000, -offsetZ / 1000);
  }

  composer.render();
}

animate();