import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { updateCubes } from './generator';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 
  window.innerWidth / window.innerHeight, 0.1, 100);

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
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

updateCubes(scene, camera);

const torchlight = new THREE.SpotLight( 0xffd04f, 10, 0, Math.PI/3);

camera.add(torchlight);
camera.add(torchlight.target);
torchlight.position.set(0,0,0);
torchlight.target.position.z = -1;

scene.add(camera);

camera.position.y = 0.5;

const clock = new THREE.Clock();
const direction = new THREE.Vector3();

function animate() {
	requestAnimationFrame( animate );

  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.normalize();

  const time = clock.getDelta();

  if ((direction.x !== 0) || (direction.z !== 0)) {
    updateCubes(scene, camera);
  }

  controls.moveForward(direction.z * 2 * time);
  controls.moveRight(direction.x  * 2 * time);

	renderer.render( scene, camera );
}

animate();