import * as THREE from 'three';

let cubes = [];

const geometry = new THREE.BoxGeometry(0.25, 1, 0.25);
const material = new THREE.MeshLambertMaterial({ color: 0x331f0E});
// const material = new THREE.MeshBasicMaterial({color: 0x331f0E});

function updateCubes(scene, camera) {
  let range = 10;

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

      const new_cube = new THREE.Mesh(geometry, material);
      scene.add(new_cube);
      new_cube.position.set(i, 0.5, j);

      cubes.push(new_cube);
    }
  }
}

export { updateCubes }