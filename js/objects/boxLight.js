import * as THREE from "three";

export class BoxLight {
  constructor() {
    this.group = new THREE.Group();
    this.addLight();
    this.addBox();
  }

  addLight() {
    this.light = new THREE.PointLight(0x00ffff, 10);
    this.light.castShadow = true;
    this.group.add(this.light);
  }

  addBox() {
    const lightGeo = new THREE.BoxGeometry(10, 10, 0.1);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lightBox = new THREE.Mesh(lightGeo, lightMat);
    this.group.add(lightBox);
  }

  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }
}
