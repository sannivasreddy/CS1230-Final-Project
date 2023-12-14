import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let bookshelf;
let old_shelf;
let desk;
let table;
let lamp;

let flag;

function modelsLoaded() {
  return bookshelf && old_shelf && desk && table && lamp && flag;
}

function hash(key) {
  key += ~(key << 15);
  key ^= (key >>> 10);
  key += (key << 3);
  key ^= (key >>> 6);
  key += ~(key << 11);
  key ^= (key >>> 16);
  return key >>> 0; // Ensure the result is an unsigned 32-bit integer
}

function seedrandom(seed) {
  let state = seed;

  return function() {
    state = (state * 1103515245 + 12345) % 0x80000000;
    return state / 0x80000000;
  };
}

export async function loadModels(scene) {
  const loader = new GLTFLoader();

  // Victorian Bookshelf - Opt textures are optimised with gltf-transform
  const gltf = await loader.loadAsync("./models/vict_opt.glb");
  bookshelf = gltf.scene;
  bookshelf.rotation.set(0, -Math.PI/2, 0);

  // Dusty Old Bookshelf
  const old_gltf = await loader.loadAsync("./models/oldshelf_opt.glb");
  old_shelf = old_gltf.scene;
  old_shelf.rotation.set(0, Math.PI, 0);

  // Desk
  const desk_gltf = await loader.loadAsync("./models/desk_opt.glb");
  desk = desk_gltf.scene;

  // Table
  const table_gltf = await loader.loadAsync("./models/table_opt.glb");
  table = table_gltf.scene;
  table.rotation.set(0,Math.PI,0);

  // Lamp
  const lamp_gltf = await loader.loadAsync("./models/sep_primLamp.glb");
  lamp = lamp_gltf.scene;
  lamp.rotation.set(0,Math.PI,0);

  const transparentMaterial = new THREE.MeshPhongMaterial({
    color: 0x8F8563,
    opacity: 0.95, // Set the desired opacity between 0 and 1
    transparent: true, // Enable transparency for the material
    side: THREE.DoubleSide,
    emissive: 0xefc070,
    emissiveIntensity: 1.6,
    toneMapped: false
  });

  lamp.children[2].material = transparentMaterial;

  // Flag
  const flag_gltf = await loader.loadAsync("./models/floating_pirate_flag.glb");

  flag = flag_gltf.scene;
  flag.scale.set(0.003, 0.003, 0.003);
  flag.position.set(0, -0.2, 0);
  flag.visible = false;
  scene.add(flag);
}

let i_offset = 0;
let j_offset = 0;

export function randomizeOffset() {
  i_offset = Math.floor(Math.random() * 1000000);
  j_offset = Math.floor(Math.random() * 1000000);
}

let cubes = [];

export function clearModels(scene) {
  for (const cube of cubes) {
    scene.remove(cube);
  }
  cubes = [];
}

let lights = [];

export function initSceneLights(scene) {
  for (let i = 0; i < 12; ++i) {
    const light = new THREE.PointLight(0xefc070,5,2,0.5);
    light.visible = false;
    lights.push(light);
    scene.add(light);
  }
}

export function setFlag(camera) {
  let look_dir = new THREE.Vector3();
  camera.getWorldDirection(look_dir);
  flag.position.set(camera.position.x + (0.5 * look_dir.x), flag.position.y, camera.position.z + (0.5 * look_dir.z));
  flag.visible = true;
}

export function unsetFlag() {
  flag.visible = false;
}

const globalseed = 0.001;

// const light_lamp = new THREE.PointLight(0xefc070,5,2,0.5);

export function updateCubes(scene, camera) {
  let range = 15;

  let nearest_x = Math.round(camera.position.x);
  let nearest_z = Math.round(camera.position.z);

  let new_cubes = [];
  let checked_points = [];

  for (let i = 0; i <= (2 * range); ++i) {
    checked_points[i] = [];
    for (let j = 0; j <= (2 * range); ++j) {
      checked_points[i][j] = false;
    }
  }

  for (const cube of cubes) {
    let x = cube.position.x;
    let z = cube.position.z;
    if ((x < nearest_x - range) || (x > nearest_x + range) ||
      (z < nearest_z - range) || (z > nearest_z + range)) {
      scene.remove(cube);
    } else {
      checked_points[x - (nearest_x - range)][z - (nearest_z - range)] = true;
      new_cubes.push(cube);
    }
  }

  cubes = new_cubes;

  // for (const light of lights) {
  //   let x = light.position.x;
  //   let z = light.position.z;
  //   if ((x < nearest_x - range) || (x > nearest_x + range) ||
  //     (z < nearest_z - range) || (z > nearest_z + range)) {
  //     light.visible = false;
  //   }
  // }

  for (let i = nearest_x - range; i <= nearest_x + range; ++i) {
    for (let j = nearest_z - range; j <= nearest_z + range; ++j) {
      if (checked_points[i - (nearest_x - range)][j - (nearest_z - range)]) {
        continue;
      }
      if (modelsLoaded()) {
        //I thought creating a walkway in the middle w/ no bookshelves would be cool
        if (i == 0) {
          continue;
        }
        const seed = 0.000000001 * hash((i + i_offset)^hash((j+j_offset)^globalseed));
        const rnd = seedrandom(seed);

        let new_cube;

        if ((j % 5) == 0) {
          let misc_decider = rnd();
          if (misc_decider < 0.3) {
            new_cube = desk.clone();
            new_cube.scale.set(0.5, 0.5, 0.5);
            new_cube.position.set(i, 0, j);
          }
          else if (misc_decider < 0.35) {
            // let possible_lamp;
            // for (const light of lights) {
            //   if (!light.visible) {
            //     possible_lamp = light;
            //     break;
            //   }
            // }
            // if (!possible_lamp) {
            //   continue;
            // }

            new_cube = lamp.clone();
            new_cube.scale.set(0.2, 0.2, 0.2);
            new_cube.position.set(i, 0.01, j);

            // possible_lamp.position.set(i, 0.7, j);
            // possible_lamp.visible = true;

            // let light = light_lamp.clone();
            // light.position.set(i, 0.7, j);
            // scene.add(light);
            // cubes.push(light);
          }
          else if (misc_decider < 0.7) {
            new_cube = table.clone();
            new_cube.scale.set(0.3, 0.3, 0.3);
            new_cube.position.set(i, 0, j);
          }

          if (new_cube) {
            scene.add(new_cube);
            cubes.push(new_cube);
          }
          continue;
        }

        // Clamp the heights so they aren't super tall or super short (Here, I also get rid 
        // of extremes so it's not just a boring grid and there's some randomness). 
        let height = rnd();
        if (height > 0.8 || height < 0.1) {
          continue;
        }
        if (height > 0.6) {
          height = 0.6;
        } else if (height < 0.3) {
          height = 0.3
        }

        let shelf_choose = rnd();
        if (shelf_choose >= 0.5) {
          new_cube = old_shelf.clone();
          if (i % 5 == 0) {
            new_cube.scale.set(1, height, 1);
          } else {
            new_cube.scale.set(0.5, height, 1);
          }

        } else {
          new_cube = bookshelf.clone();
          if (i % 5 == 0) {
            new_cube.scale.set(1, height, 0.4);
          } else {
            new_cube.scale.set(1, height, 0.2);
          }
        }

        new_cube.position.set(i, 0 ,j);

        scene.add(new_cube);
        cubes.push(new_cube);
      }
    }
  }
}