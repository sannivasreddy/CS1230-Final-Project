import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let cubes = [];

const geometry = new THREE.BoxGeometry(0.25, 1, 0.25);
// const material = new THREE.MeshLambertMaterial({ color: 0x331f0E});
const material = new THREE.MeshBasicMaterial({color: 0x331f0E});

let bookshelf;
let old_shelf;
let desk;
let table;

let lamp;
let light_lamp;

light_lamp = new THREE.PointLight(0xefc070,10,10,2);
//let pointHelper = new THREE.PointLightHelper(light_lamp,0.1);
light_lamp.castShadow = true;
//light_lamp.add(pointHelper);

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


  const desk_gltf = await loader.loadAsync("./models/simple_desk_free.glb");
  desk = desk_gltf.scene;
  desk.rotation.set(0, 0, 0);

  const table_gltf = await loader.loadAsync("./models/round_table_and_chairs.glb");
  table = table_gltf.scene;
  table.rotation.set(0,Math.PI,0);



  const lamp_gltf = await loader.loadAsync("./models/primLamp.glb");
  lamp = lamp_gltf.scene;
  lamp.rotation.set(0,Math.PI,0);

  const transparentMaterial = new THREE.MeshBasicMaterial({
    color: 0x8F8563,
    opacity: 0.95, // Set the desired opacity between 0 and 1
    transparent: true, // Enable transparency for the material
  });

  const lampMesh = lamp.children[1];

  if (lampMesh.isMesh) {
    lampMesh.material = transparentMaterial;
  }

  
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
        //I've decided to only add desks and other objects every 5th row since it looks a little weird to have them interspersed w/ bookshelves
        if(j%5 == 0){
          if(desk){
            let desk_decider = rnd();
            if(desk_decider < 0.2){
              let desk_cube = desk.clone();
              desk_cube.position.set(i, 0 ,j);
              desk_cube.scale.set(0.5, 0.5, 0.5);

              scene.add(desk_cube);
              cubes.push(desk_cube);
              continue;
            } else if(desk_decider < 0.5){
              let table_cube = table.clone();
              table_cube.position.set(i, 0, j);
              table_cube.scale.set(0.3,0.3,0.3);

              scene.add(table_cube);
              cubes.push(table_cube);
              continue;
            } else if(desk_decider < 0.6){
              let lamp_cube = lamp.clone();
              lamp_cube.position.set(i, 0.1, j);
              let pointLight = new THREE.PointLight(0xefc070,5,2,0.5);
              pointLight.position.set(i, 1, j);
              lamp_cube.scale.set(0.2,0.2,0.2);
              scene.add(pointLight);
              scene.add(lamp_cube);
              cubes.push(pointLight);
              cubes.push(lamp_cube);
              continue;
            }
          }  
        }

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