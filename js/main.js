import * as THREE from "three";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import { updateCubes, loadBookshelf } from "./generator";

import vertexShader from "./shaders/vertexShader.glsl.js";
import fragmentShader from "./shaders/fragmentShader.glsl.js";
import rayFragmentShader from "./shaders/rayFragmentShader.glsl.js";

import { Window } from "./objects/window";

var rayScene, rayTarget, rayPass;

var sceneTarget, blendPass;

var scene, camera, renderer, composer;

var texture_loader;

// Movement
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let direction = new THREE.Vector3();
const clock = new THREE.Clock();
let offsetX, offsetZ;

// Walls
var wall_forward, wall_back, wall_right, wall_left, wall_ceiling;
var wall_ceiling_height, ceiling_height;
var walls_height;
// Panes
var pane_forward, pane_back, pane_right, pane_left;

// Floor
var floor;

const loader = new THREE.CubeTextureLoader();
// loader.setPath('./images/nylib/');
loader.setPath("./images/walls/");

init();

const promise = loadBookshelf();
promise.then((result) => {
  updateCubes(scene, camera);
});

animate();

function init() {
  // Renderer, Camera, Scene
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  rayScene = new THREE.Scene();
  rayTarget = new THREE.WebGLRenderTarget(innerWidth, innerHeight);

  sceneTarget = new THREE.WebGLRenderTarget(innerWidth, innerHeight);

  rayPass = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      objectText: { value: null },
      floorText: { value: null },
      lightPosition: { value: new THREE.Vector2(0.5, 0.5) },
      exposure: { value: 0.1 },
      decay: { value: 0.95 },
      density: { value: 0.4 },
      weight: { value: 0.4 },
      samples: { value: 50 },
    },
    vertexShader: vertexShader,
    fragmentShader: rayFragmentShader,
  });

  blendPass = new ShaderPass({
    uniforms: {
      sceneTex: { value: null },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });

  camera.position.set(0, 0.5, 0);
  scene.add(camera);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  texture_loader = new THREE.TextureLoader();

  addLights();
  addFloor();
  addCeiling();
  addWalls();
  addWindowPanes();
  addControls();

  applyPostprocessing();
}

function applyPostprocessing() {
  composer = new EffectComposer(renderer);

  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(rayPass);
}

function animate() {
  requestAnimationFrame(animate);

  render();
}

function render() {
  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.normalize();

  const time = clock.getDelta();

  if (direction.x !== 0 || direction.z !== 0) {
    controls.moveForward(direction.z * 2 * time);
    controls.moveRight(direction.x * 2 * time);

    updateCubes(scene, camera);

    floor.position.set(camera.position.x, floor.position.y, camera.position.z);

    pane_forward.setWindowPanePosition(
      camera.position.x,
      floor.position.y + walls_height,
      camera.position.z - 100
    );

    wall_forward.position.set(
      camera.position.x,
      floor.position.y + walls_height,
      camera.position.z - 100
    );
    wall_left.position.set(
      camera.position.x - 100,
      floor.position.y + walls_height,
      camera.position.z
    );
    wall_right.position.set(
      camera.position.x + 100,
      floor.position.y + walls_height,
      camera.position.z
    );
    wall_back.position.set(
      camera.position.x,
      floor.position.y + walls_height,
      camera.position.z + 100
    );
    wall_ceiling.position.set(
      camera.position.x,
      floor.position.y + ceiling_height,
      camera.position.z
    );

    offsetX = camera.position.x;
    offsetZ = -camera.position.z;

    floor.material.map.offset.set(offsetX, offsetZ);
    wall_ceiling.material.map.offset.set(offsetX / 1000, -offsetZ / 1000);
  }

  renderer.setRenderTarget(sceneTarget);
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);

  rayPass.uniforms.objectText.value = sceneTarget.texture;

  renderer.setRenderTarget(rayTarget);
  renderer.render(rayScene, camera);
  renderer.setRenderTarget(null);

  // rayPass.uniforms.floorText.value = rayTarget.texture;

  composer.render();

  //renderer.render(scene, camera);
}

function addLights() {
  let ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(ambientLight);

  // let pointLight = new THREE.PointLight(0xefc070, 10, 10, 2);
  // let pointHelper = new THREE.PointLightHelper(pointLight, 0.1);
  // pointLight.castShadow = true;
  // pointLight.shadow.mapSize.width = 512; // default
  // pointLight.shadow.mapSize.height = 512; // default
  // pointLight.shadow.camera.near = 0.5; // default
  // pointLight.shadow.camera.far = 500; // default
  // pointLight.add(pointHelper);
  // pointLight.position.set(0, 0.25, 0);
  // scene.add(pointLight);
}

function addCeiling() {
  ceiling_height = 30;
  const ceiling_dis = texture_loader.load("ceiling_dis.png");
  const ceiling_texture = texture_loader.load("ceiling.png");

  ceiling_texture.wrapS = THREE.RepeatWrapping;
  ceiling_texture.wrapT = THREE.RepeatWrapping;

  const ceiling_geometry = new THREE.PlaneGeometry(120, 120, 100, 100);
  const ceiling_material = new THREE.MeshPhongMaterial({
    map: ceiling_texture,
    displacementMap: ceiling_dis,
    displacementScale: 0,
  });

  wall_ceiling = new THREE.Mesh(ceiling_geometry, ceiling_material);
  wall_ceiling.lookAt(new THREE.Vector3(0, -1, 0));
  wall_ceiling.position.set(0, ceiling_height, 0);
  scene.add(wall_ceiling);
}

function addFloor() {
  const rug_texture = texture_loader.load("rug.png");
  const rug_dis = texture_loader.load("rug_dis.png");

  rug_texture.wrapS = THREE.RepeatWrapping;
  rug_texture.wrapT = THREE.RepeatWrapping;
  rug_texture.repeat.set(1, 10);
  const rug_geometry = new THREE.PlaneGeometry(1.2, 20, 100, 100);
  const rug_material = new THREE.MeshPhongMaterial({
    map: rug_texture,
    displacementMap: rug_dis,
    displacementScale: 0.03,
  });
  const rug = new THREE.Mesh(rug_geometry, rug_material);
  rug.lookAt(new THREE.Vector3(0, 1, 0));
  rug.position.set(0, 0.08, 0);

  texture_loader.setPath("./images/worn_floor/");
  const floor_color = texture_loader.load("wood_floor_worn_diff_1k.jpg");
  floor_color.wrapS = THREE.RepeatWrapping;
  floor_color.wrapT = THREE.RepeatWrapping;
  floor_color.repeat.set(16, 16);
  const floor_disp = texture_loader.load("worn_dis.jpg");
  const floor_bump = texture_loader.load("word_dis.jpg");
  texture_loader.setPath("./images/walls/");
  const geometry = new THREE.PlaneGeometry(20, 20, 10, 10);
  const material = new THREE.MeshPhongMaterial({
    map: floor_color,
    displacementMap: floor_disp,
    displacementScale: 0.1,
    bumpMap: floor_bump,
    bumpScale: 10,
  });
  floor = new THREE.Mesh(geometry, material);
  floor.lookAt(new THREE.Vector3(0, 1, 0));

  scene.add(floor);
  scene.add(rug);
}

function addWalls() {
  wall_ceiling_height = 55;
  walls_height = 22;

  const wall_forward_texture = texture_loader.load("library_window_two.png");
  const wall_b = texture_loader.load("library_two_b.png");
  const wall_dis = texture_loader.load("test.png");

  wall_forward_texture.wrapS = THREE.RepeatWrapping;
  wall_forward_texture.wrapT = THREE.RepeatWrapping;

  wall_forward_texture.repeat.set(1, 1);

  const wall_geometry = new THREE.PlaneGeometry(
    200,
    wall_ceiling_height,
    1000,
    1000
  );
  const wall_material_front = new THREE.MeshPhongMaterial({
    map: wall_forward_texture,
    bumpMap: wall_b,
    bumpScale: 10,
    displacementMap: wall_dis,
    displacementScale: 6,
  });

  wall_forward = new THREE.Mesh(wall_geometry, wall_material_front);
  wall_left = new THREE.Mesh(wall_geometry, wall_material_front);
  wall_right = new THREE.Mesh(wall_geometry, wall_material_front);
  wall_back = new THREE.Mesh(wall_geometry, wall_material_front);

  wall_left.lookAt(new THREE.Vector3(1, 0, 0));
  wall_forward.lookAt(new THREE.Vector3(0, 0, 0));
  wall_right.lookAt(new THREE.Vector3(-1, 0, 0));
  wall_back.lookAt(new THREE.Vector3(0, 0, -1));

  wall_forward.position.set(0, walls_height, -100);
  wall_left.position.set(-100, walls_height, 0);
  wall_right.position.set(100, walls_height, 0);
  wall_back.position.set(0, walls_height, 100);

  scene.add(wall_forward);
  scene.add(wall_left);
  scene.add(wall_right);
  scene.add(wall_back);
}

function addWindowPanes() {
  pane_forward = new Window(0, 10, -100);
  scene.add(pane_forward.middleWindow);
  scene.add(pane_forward.leftWindow);
  scene.add(pane_forward.rightWindow);
  scene.add(pane_forward.farLeftWindow);
  scene.add(pane_forward.farRightWindow);
}

const controls = new PointerLockControls(camera, renderer.domElement);
controls.pointerSpeed = 2;

let locked = false;

function addControls() {
  document.addEventListener(
    "click",
    function () {
      if (locked) {
        controls.unlock();
        locked = false;
      } else {
        controls.lock();
        locked = true;
      }
    },
    false
  );
  document.addEventListener("keydown", onKeyDown, false);
  document.addEventListener("keyup", onKeyUp, false);
  window.addEventListener("resize", onWindowResize, false);
}

function onKeyDown(event) {
  switch (event.code) {
    case "ArrowUp":
    case "KeyW":
      moveForward = true;
      break;

    case "ArrowLeft":
    case "KeyA":
      moveLeft = true;
      break;

    case "ArrowDown":
    case "KeyS":
      moveBackward = true;
      break;

    case "ArrowRight":
    case "KeyD":
      moveRight = true;
      break;
  }
}

function onKeyUp(event) {
  switch (event.code) {
    case "ArrowUp":
    case "KeyW":
      moveForward = false;
      break;

    case "ArrowLeft":
    case "KeyA":
      moveLeft = false;
      break;

    case "ArrowDown":
    case "KeyS":
      moveBackward = false;
      break;

    case "ArrowRight":
    case "KeyD":
      moveRight = false;
      break;
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  rayTarget.setSize(window.innerWidth, window.innerHeight);
  sceneTarget.setSize(window.innerWidth, window.innerHeight);
}

// const torchlight = new THREE.SpotLight( 0xffffff, 10, 0, Math.PI/3);

// camera.add(torchlight);
// camera.add(torchlight.target);
// torchlight.position.set(0,0,0);
// torchlight.target.position.z = -1;

// loader.setPath('./images/nylib/');

// const textureCube = loader.load([
//   'px.png', 'nx.png',
//   'py.png', 'ny.png',
//   'pz.png', 'nz.png'
// ]);

// const textureCube = loader.load([
//   'square.png', 'square.png',
//   'square.png', 'square.png',
//   'square.png', 'square.png'
// ]);

// scene.background = textureCube;

// const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.7);
// scene.add(hemiLight);

// const dirLight = new THREE.DirectionalLight(0xffffff, 3);
// dirLight.color.setHSL(0.1, 1, 0.95);
// dirLight.position.set(0, 1, 1);
// scene.add(dirLight);
