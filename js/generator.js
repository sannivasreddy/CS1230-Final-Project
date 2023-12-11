import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let cubes = [];

const geometry = new THREE.BoxGeometry(0.25, 1, 0.25);
// const material = new THREE.MeshLambertMaterial({ color: 0x331f0E});
const material = new THREE.MeshBasicMaterial({color: 0x331f0E});

let bookshelf;
let old_shelf;

function hash(key) {
  key += ~(key << 15);
  key ^= (key >>> 10);
  key += (key << 3);
  key ^= (key >>> 6);
  key += ~(key << 11);
  key ^= (key >>> 16);
  return key >>> 0; // Ensure the result is an unsigned 32-bit integer
}

const globalseed = 0.001;

function seedrandom(seed) {
  let state = seed;

  return function() {
    state = (state * 1103515245 + 12345) % 0x80000000;
    return state / 0x80000000;
  };
}

async function loadBookshelf() {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync("./models/victorian_bookshelf.glb");
  bookshelf = gltf.scene;
  bookshelf.rotation.set(0, -Math.PI/2, 0);

  const old_gltf = await loader.loadAsync("./models/dusty_old_bookshelf.glb");
  old_shelf = old_gltf.scene;
  old_shelf.rotation.set(0, Math.PI, 0);
}

function updateCubes(scene, camera) {
  let range = 8;

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

  for (let i = nearest_x - range; i <= nearest_x + range; ++i) {
    for (let j = nearest_z - range; j <= nearest_z + range; ++j) {
      if (checked_points[i - (nearest_x - range)][j - (nearest_z - range)]) {
        continue;
      }
      if (bookshelf && old_shelf) {
        //I thought creating a walkway in the middle w/ no bookshelves would be cool
        if(i==0){
          continue;
        }
        const seed = 0.000000001 * hash(i^hash(j^globalseed));
        const rnd = seedrandom(seed);

        // Clamp the heights so they aren't super tall or super short (Here, I also get rid 
        // of extremes so it's not just a boring grid and there's some randomness). 
        // Could also add some desks here or something
        let height = rnd();
        if (height > 0.8 || height < 0.1) {
          continue;
        }
        if (height > 0.6) {
          height = 0.6;
        } else if (height < 0.3) {
          height = 0.3
        }
        let new_cube;

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
            new_cube.scale.set(1, height, 0.5);
          } else {
            new_cube.scale.set(1, height, 0.25);
          }
        }

        new_cube.position.set(i, 0 ,j);

        scene.add(new_cube);
        cubes.push(new_cube);
      }
    }
  }
}



// function updateCubes(scene, camera) {
//   let range = 10;

//   let nearest_x = Math.round(camera.position.x);
//   let nearest_z = Math.round(camera.position.z);

//   let new_cubes = [];

//   let checked_points = [];

//   for (let i = 0; i <= (2 * range); ++i) {
//     checked_points[i] = [];
//     for (let j = 0; j <= (2 * range); ++j) {
//       checked_points[i][j] = false;
//     }
//   }

//   for (const cube of cubes) {
//     let x = cube.position.x;
//     let z = cube.position.z;
//     if ((x < nearest_x - range) || (x > nearest_x + range) ||
//       (z < nearest_z - range) || (z > nearest_z + range)) {
//       scene.remove(cube);
//     } else {
//       checked_points[x - (nearest_x - range)][z - (nearest_z - range)] = true;
//       new_cubes.push(cube);
//     }
//   }

//   cubes = new_cubes;

//   for (let i = nearest_x - range; i <= nearest_x + range; ++i) {
//     for (let j = nearest_z - range; j <= nearest_z + range; ++j) {
//       if (checked_points[i - (nearest_x - range)][j - (nearest_z - range)]) {
//         continue;
//       }

//       const new_cube = new THREE.Mesh(geometry, material);
//       scene.add(new_cube);
//       new_cube.position.set(i, 0.5, j);

//       cubes.push(new_cube);
//     }
//   }
// }

export { updateCubes, loadBookshelf }