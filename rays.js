import * as THREE from "three";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

import vertexShader from "./js/shaders/vertexShader.glsl.js";
import fragmentShader from "./js/shaders/fragmentShader.glsl.js";
import rayFragmentShader from "./js/shaders/rayFragmentShader.glsl.js";

import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

import { BoxLight } from "./js/objects/boxLight.js";

var camera, renderer;

var composer;

var rayScene, rayTarget;
var objectScene, objectTarget;
var finalScene;

var godRayPass;
var shaderPass;

var cubeMesh, sphereMesh;

var mouseX = 0,
  mouseY = 0;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

const clock = new THREE.Clock();
const direction = new THREE.Vector3();

let light2;

init();
animate();

function init() {
  // Camera & Scene
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  camera.position.z = 5;
  finalScene = new THREE.Scene();
  rayScene = new THREE.Scene();
  objectScene = new THREE.Scene();

  // Init Targets
  rayTarget = new THREE.RenderTarget(window.innerWidth, window.innerHeight);
  objectTarget = new THREE.RenderTarget(window.innerWidth, window.innerHeight);

  shaderPass = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      texture2: { value: null },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });

  godRayPass = new ShaderPass({
    uniforms: {
      lightTex: { value: null },
      fX: { value: null },
      fY: { value: null },
    },
    vertexShader: vertexShader,
    fragmentShader: rayFragmentShader,
  });

  // Cube
  var cubeGeo = new THREE.BoxGeometry(1, 1, 1);
  var cubeMat = new THREE.MeshPhongMaterial({
    color: 0xff0000,
  });
  cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
  cubeMesh.translateX(-2);
  cubeMesh.translateZ(2);

  var pointLight = new THREE.PointLight(0xffffff, 100);
  pointLight.position.z = -5;

  objectScene.add(pointLight);
  objectScene.add(cubeMesh);

  var rayCubeGeo = new THREE.BoxGeometry(1, 1, 1);
  var rayCubeMat = new THREE.MeshDepthMaterial({
    color: 0x00ff00,
  });
  cubeMesh = new THREE.Mesh(rayCubeGeo, rayCubeMat);
  cubeMesh.translateX(-2);
  cubeMesh.translateZ(2);
  rayScene.add(pointLight);
  rayScene.add(cubeMesh);

  // Sphere
  var sphereGeo = new THREE.SphereGeometry(1, 32, 32);
  var sphereMat = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
  });
  sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  sphereMesh.translateZ(5);
  sphereMesh.translateY(10);
  //sphereMesh.rotateX(-Math.PI / 2);
  rayScene.add(sphereMesh);
  rayScene.add(cubeMesh);

  addLights();

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  document.addEventListener("keydown", onKeyDown, false);
  document.addEventListener("keyup", onKeyUp, false);
  initPostprocessing();
}

function addLights() {
  var light1 = new BoxLight();
  light2 = new BoxLight();
  var light3 = new BoxLight();
  var light4 = new BoxLight();

  light1.setPosition(0, 0, 100);
  light2.setPosition(0, 0, -100);

  rayScene.add(light1.group);
  rayScene.add(light2.group);
}

function initPostprocessing() {
  // Postprocessing Scene
  composer = new EffectComposer(renderer);

  composer.addPass(new RenderPass(finalScene, camera));
  composer.addPass(godRayPass);
  composer.addPass(shaderPass);
  //shaderPass.uniforms.texture1.value = composer.readBuffer.texture;
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
  }

  renderer.setRenderTarget(rayTarget);
  renderer.render(rayScene, camera);
  renderer.setRenderTarget(null);

  renderer.setRenderTarget(objectTarget);
  renderer.render(objectScene, camera);
  renderer.setRenderTarget(null);

  camera.updateMatrixWorld();

  // Project the 3D object's position to 2D screen coordinates
  var screenPosition = new THREE.Vector3();
  light2.group.getWorldPosition(screenPosition);
  screenPosition.project(camera);

  // Convert the screen coordinates to normalized device coordinates (NDC)
  var x = (screenPosition.x + 1) / 2;
  var y = (-screenPosition.y + 1) / 2;

  const rTexture = rayTarget.texture;
  const oTexture = objectTarget.texture;

  godRayPass.uniforms.lightTex.value = rTexture;
  godRayPass.uniforms.fX.value = x;
  godRayPass.uniforms.fY.value = y;

  shaderPass.uniforms.texture2.value = oTexture;

  composer.render();
}

const controls = new PointerLockControls(camera, renderer.domElement);
controls.pointerSpeed = 2;

let locked = false;

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
