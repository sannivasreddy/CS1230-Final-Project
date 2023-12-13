import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let bookshelf;
let old_shelf;
let desk;
let table;
let lamp;

function modelsLoaded() {
  return bookshelf && old_shelf && desk && table && lamp;
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

let unused_lights = [];
let used_lights = [];

export function initSceneLights(scene) {
  for (let i = 0; i < 16; ++i) {
    const light = new THREE.PointLight(0xefc070,5,2,0.5);
    light.visible = false;
    unused_lights.push(light);
    scene.add(light);
  }
}

export async function loadModels() {
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

  const transparentMaterial = new THREE.MeshPhongMaterial({
    color: 0x8F8563,
    opacity: 0.95, // Set the desired opacity between 0 and 1
    transparent: true, // Enable transparency for the material
    side: THREE.DoubleSide,
    emissive: 0xefc070,
    emissiveIntensity: 2,
    toneMapped: false
  });

  lamp.children[2].material = transparentMaterial;

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

const globalseed = 0.001;

const light_lamp = new THREE.PointLight(0xefc070,5,2,0.5);

export function updateCubes(scene, camera) {
  let range = 5;

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

  // let new_used_lights = [];
  // let cur_light = used_lights.pop();
  // while (cur_light !== undefined) {
  //   let x = cur_light.position.x;
  //   let z = cur_light.position.z;
  //   if ((x < nearest_x - range) || (x > nearest_x + range) ||
  //     (z < nearest_z - range) || (z > nearest_z + range)) {
  //     light.visible = false;
  //     unused_lights.push(cur_light);
  //   } else {
  //     new_used_lights.push(cur_light);
  //   }
  //   cur_light = used_lights.pop();
  // }
  // used_lights = new_used_lights;

  cubes = new_cubes;

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
          else if (misc_decider < 0.4) {
            // let possible_lamp = unused_lights.pop();
            // if (possible_lamp === undefined) {
            //   continue;
            // }
            new_cube = lamp.clone();
            new_cube.scale.set(0.2, 0.2, 0.2);
            new_cube.position.set(i, 0.1, j);

            let light = light_lamp.clone();
            light.position.set(i, 0.7, j);
            scene.add(light);
            cubes.push(light);

            // possible_lamp.position.set(i, 0.7, j);
            // possible_lamp.visible = true;
            // used_lights.push(possible_lamp);
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