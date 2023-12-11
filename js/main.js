import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { updateCubes, loadBookshelf } from './generator';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 
  window.innerWidth / window.innerHeight, 0.1, 100);

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new PointerLockControls(camera, renderer.domElement);
controls.pointerSpeed = 2;

let locked = false;

document.addEventListener('click', function () {
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

// const torchlight = new THREE.SpotLight( 0xffffff, 10, 0, Math.PI/3);

// camera.add(torchlight);
// camera.add(torchlight.target);
// torchlight.position.set(0,0,0);
// torchlight.target.position.z = -1;

const loader = new THREE.CubeTextureLoader();
loader.setPath('./images/daylight/');

const textureCube = loader.load([
  'Daylight Box_Right.bmp', 'Daylight Box_Left.bmp',
  'Daylight Box_Top.bmp', 'Daylight Box_Bottom.bmp',
  'Daylight Box_Front.bmp', 'Daylight Box_Back.bmp'
]);

scene.background = textureCube;

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 3);
dirLight.color.setHSL(0.1, 1, 0.95);
dirLight.position.set(0, 1, 1);
scene.add(dirLight);

const texture_loader = new THREE.TextureLoader();
texture_loader.setPath('./images/worn_floor/');

const floor_color = texture_loader.load('wood_floor_worn_diff_1k.jpg');
floor_color.wrapS = THREE.RepeatWrapping;
floor_color.wrapT = THREE.RepeatWrapping;
floor_color.repeat.set(16, 16);
const floor_normal = texture_loader.load('wood_floor_worn_nor_gl_1k.exr');
const floor_disp = texture_loader.load('wood_floor_worn_disp_1k.exr');
const floor_rough = texture_loader.load('wood_floor_worn_rough_1k.exr');


const geometry = new THREE.PlaneGeometry(20, 20);
const material = new THREE.MeshStandardMaterial({
  map: floor_color,
  displacementMap: floor_disp,
  normalMap: floor_normal,
  roughnessMap: floor_rough
});
const plane = new THREE.Mesh( geometry, material );
plane.lookAt(new THREE.Vector3(0, 1, 0));
scene.add( plane );

scene.add(camera);

camera.position.set(0, 0.5, 0);

const clock = new THREE.Clock();
const direction = new THREE.Vector3();

const promise = loadBookshelf();
promise.then(result => {
  updateCubes(scene,camera);
});

let offsetX, offsetZ;

function animate() {
	requestAnimationFrame( animate );

  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.normalize();

  const time = clock.getDelta();

  if ((direction.x !== 0) || (direction.z !== 0)) {
    controls.moveForward(direction.z * 1 * time);
    controls.moveRight(direction.x * 1 * time);

    updateCubes(scene, camera);

    plane.position.set(camera.position.x, plane.position.y, camera.position.z);

    offsetX = camera.position.x;
    offsetZ = -camera.position.z;
  
    plane.material.map.offset.set( offsetX, offsetZ );
  }

	renderer.render( scene, camera );
}

animate();