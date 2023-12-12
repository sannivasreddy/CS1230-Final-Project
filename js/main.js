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
loader.setPath('./images/nylib/');

const textureCube = loader.load([
  'px.png', 'nx.png',
  'py.png', 'ny.png',
  'pz.png', 'nz.png'
]);

// scene.background = textureCube;

// const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.7);
// scene.add(hemiLight);

// const dirLight = new THREE.DirectionalLight(0xffffff, 3);
// dirLight.color.setHSL(0.1, 1, 0.95);
// dirLight.position.set(0, 1, 1);
// scene.add(dirLight);

//color, intensity, distance, decay


const texture_loader = new THREE.TextureLoader();
texture_loader.setPath('./images/worn_floor/');

const floor_color = texture_loader.load('wood_floor_worn_diff_1k.jpg');
floor_color.wrapS = THREE.RepeatWrapping;
floor_color.wrapT = THREE.RepeatWrapping;
floor_color.repeat.set(32, 32);
const floor_normal = texture_loader.load('wood_floor_worn_nor_gl_1k.exr');
const floor_disp = texture_loader.load('wood_floor_worn_disp_1k.exr');
const floor_rough = texture_loader.load('wood_floor_worn_rough_1k.exr');


const geometry = new THREE.PlaneGeometry(60, 60);
const material = new THREE.MeshPhongMaterial({
  map: floor_color
});
const floor = new THREE.Mesh( geometry, material );
floor.lookAt(new THREE.Vector3(0, 1, 0));
scene.add( floor );

scene.add(camera);

camera.position.set(0, 1, 0);

const clock = new THREE.Clock();
const direction = new THREE.Vector3();

const promise = loadBookshelf();
promise.then(result => {
  updateCubes(scene,camera, true);
});

let offsetX, offsetZ;


const ambient = new THREE.AmbientLight(0xffffff,0.2);
scene.add(ambient);
//color intensity distance angle penum
const spotLight = new THREE.SpotLight( 0xffffff, 5, 10, Math.PI * 0.1, 1);
spotLight.position.set(0, 3, 0 );
scene.add(spotLight);
const sphereSize = 1;
const spotLightHelper = new THREE.SpotLightHelper( spotLight);
scene.add( spotLightHelper );

// let pointLight = new THREE.PointLight(0xffffff,100,20,2);
// pointLight.position.set(0,4,0);
// let pointHelper = new THREE.PointLightHelper(pointLight, sphereSize);




function animate() {
	requestAnimationFrame( animate );

  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.normalize();

  const time = clock.getDelta();

  if ((direction.x !== 0) || (direction.z !== 0)) {
    controls.moveForward(direction.z * 2 * time);
    controls.moveRight(direction.x * 2 * time);

    updateCubes(scene, camera, false);

    floor.position.set(camera.position.x, floor.position.y, camera.position.z);
    //spotLight.position.set(camera.position.x + 3 , floor.position.y + 2, camera.position.z + 3);
    //targetObject.position.set(camera.position.x, floor.position.y, camera.position.z);

    offsetX = camera.position.x / 2;
    offsetZ = -camera.position.z / 2;
  
    floor.material.map.offset.set( offsetX, offsetZ );
  }

	renderer.render( scene, camera );
}

animate();