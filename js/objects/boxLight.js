import * as THREE from "three";

export class BoxLight {
  constructor() {
    this.group = new THREE.Group();
    this.addLight();
    this.addLightRay();
    this.addBox();
  }

  addLight() {
    this.light = new THREE.PointLight(0x00ffff, 10);
    this.light.castShadow = true;
    this.group.add(this.light);
  }

  addLightRay() {
    const rayGeo = new THREE.ConeGeometry(2, 5, 4);
    const rayMat = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.FrontSide,
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
      opacity: 0.3,
    });
    const ray = new THREE.Mesh(rayGeo, rayMat);
    ray.rotateY(Math.PI / 4);
    this.group.add(ray);
  }

  addBox() {
    const lightGeo = new THREE.BoxGeometry(2, 1, 0.1);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lightBox = new THREE.Mesh(lightGeo, lightMat);
    lightBox.rotateX(Math.PI / 2);
    this.group.add(lightBox);
  }

  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }
}
