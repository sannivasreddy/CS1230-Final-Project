import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 
  window.innerWidth / window.innerHeight, 0.1, 100);


camera.position.set(0,0,10);
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


const ambientLight = new THREE.AmbientLight(0xffffff, 1); // white light with intensity 0.5
//scene.add(ambientLight);


let modelLoader = new GLTFLoader();


// let bookshelfModel = modelLoader.load(
// 	// resource URL
// 	'/bookshelf.glb',
// 	// called when the resource is loaded
// 	function ( gltf ) {

//     const geometry = gltf.scene.children[0].geometry;
//     const originalMaterials = gltf.scene.children[0].material;
//     const textureMap = originalMaterials.map;

//     const geometry_two = gltf.scene.children[1].geometry;
//     const originalMaterials_two = gltf.scene.children[1].material;
//     const textureMap_two = originalMaterials_two.map;
    
//     const instanceMesh = new THREE.InstancedMesh(geometry, new THREE.MeshPhongMaterial({map: textureMap}), 5); // 5 instances
//     const instanceMesh_two = new THREE.InstancedMesh(geometry_two, new THREE.MeshPhongMaterial({map: textureMap_two}), 5);

//     for (let i = 0; i < 5; i++) {
//       // Create a transformation matrix for each instance
//       const matrix = new THREE.Matrix4();
//       const matrix_two = new THREE.Matrix4();

//       matrix.setPosition(new THREE.Vector3(i * 2, 0, 0)); // position each instance 2 units apart
//       matrix_two.setPosition(new THREE.Vector3(i*2, 0, 0));
//       //matrix.makeTranslation(20,0,0);
//       // ... apply additional transformations like rotation
    
//       // Set the matrix for the current instance
//       instanceMesh.setMatrixAt(i, matrix);
//       instanceMesh_two.setMatrixAt(i, matrix_two);
//     }



//     scene.add(instanceMesh);
//     scene.add(instanceMesh_two);


// 		// scene.add( gltf.scene );
//     // gltf.scene.scale.set(10,10,10);
    
// 	},
// 	// called while loading is progressing
// 	function ( xhr ) {

// 		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

// 	},
// 	// called when loading has errors
// 	function ( error ) {

// 		console.log( 'An error happened' );
//     console.log(error);

// 	}
// );


const pointLight = new THREE.PointLight( 0xffffff, 100, 100 );
pointLight.position.set( 10, 10, 10 );
scene.add( pointLight );

const sphereSize = 1;
const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
scene.add( pointLightHelper );

let map = new THREE.TextureLoader().load("https://i.imgur.com/MRAwlSR.png"); 
let woodMap = new THREE.TextureLoader().load("https://i.imgur.com/2PdASf1.png");
let bmap = new THREE.TextureLoader().load("https://i.imgur.com/bV9Rasi.jpg");
//let bmap = new THREE.TextureLoader().load("/booksBump.jpg");
let dmap = new THREE.TextureLoader().load("https://i.imgur.com/klX9f1V.jpg");


let floorTexture = new THREE.TextureLoader().load("https://i.imgur.com/bulJaEv.png");
let floorDis = new THREE.TextureLoader().load("https://i.imgur.com/pjje6ql.png");
floorTexture.repeat.set(2,2);
floorTexture.wrapS = THREE.MirroredRepeatWrapping;
floorTexture.wrapT = THREE.MirroredRepeatWrapping;

let floorMaterial = new THREE.MeshPhongMaterial({map: floorTexture, color: 0xffffff});

let floorGeometry = new THREE.BoxGeometry(20,1,40, 400, 400);

let floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);

floorMesh.translateY(-5.5);

scene.add(floorMesh);

//let dmap = new THREE.TextureLoader().load("/booksDis.jpg");

const loader = new GLTFLoader();

loader.load( '/better_bookshelf.glb', function ( gltf ) {

	scene.add( gltf.scene );

}, undefined, function ( error ) {

	console.error( error );

} );


let material = new THREE.MeshPhongMaterial({
  bumpMap: bmap,
  bumpScale: 5,
  displacementMap: dmap,
  displacementScale: .2,
  map: map,
  color: 0xffffff
});

var object = new THREE.Mesh(
  new THREE.BoxGeometry( 5, 10, 2,  200,200,1),
  [
      new THREE.MeshLambertMaterial( {bumpMap: bmap,map:woodMap}),
      new THREE.MeshLambertMaterial( {bumpMap: bmap, map: woodMap}),
      new THREE.MeshLambertMaterial( {bumpMap: bmap,map:woodMap} ),
      new THREE.MeshLambertMaterial( {bumpMap: bmap,map:woodMap}),
      new THREE.MeshLambertMaterial( {bumpMap:bmap, bumpScale: 1.3, displacementMap: dmap, displacementScale: 0.1, map: map}), 
      new THREE.MeshLambertMaterial( {bumpMap: bmap,map:woodMap}),
  ]
);

var object_two = new THREE.Mesh(
  new THREE.BoxGeometry( 5, 10, 2,  200,200,1),
  [
      new THREE.MeshLambertMaterial( {bumpMap: bmap,map:woodMap}),
      new THREE.MeshLambertMaterial( {bumpMap: bmap, map: woodMap}),
      new THREE.MeshLambertMaterial( {bumpMap: bmap,map:woodMap} ),
      new THREE.MeshLambertMaterial( {bumpMap: bmap,map:woodMap}),
      new THREE.MeshLambertMaterial( {bumpMap:bmap, bumpScale: 1.3, displacementMap: dmap, displacementScale: 0.1, map: map}), 
      new THREE.MeshLambertMaterial( {bumpMap: bmap,map:woodMap}),
  ]
);

let geometry = new THREE.BoxGeometry(10,10,10,5,5);
let brickWall = new THREE.Mesh(geometry,material);
object.translateX(10);
//scene.add(brickWall);
scene.add(object);



const clock = new THREE.Clock();
const direction = new THREE.Vector3();

function animate() {
	

  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.normalize();

  const time = clock.getDelta();

  controls.moveForward(direction.z * 5 * time);
  controls.moveRight(direction.x  * 5 * time);

	// cube.rotation.x += 0.01;
	// cube.rotation.y += 0.01;

  let endTime = performance.now();

  //console.log(`Animation loop execution time: ${(endTime - startTime).toFixed(3)} ms`);
  startTime = endTime;

  requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
let startTime = performance.now();
animate();