import * as THREE from "three";

export class Window {
  constructor() {
    this.material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

    this.material.transparent = true;
    this.material.opacity = 0.5;

    this.addLeftLight();
    this.addMiddleLight();
    this.addRightLight();
    this.addFarRightLight();
    this.addFarLeftLight();
  }

  addMiddleLight() {
    const geometry = new THREE.PlaneGeometry(20, 20, 1);
    this.middleWindow = new THREE.Mesh(geometry, this.material);
  }

  addRightLight() {
    const geometry = new THREE.PlaneGeometry(20, 20, 1);
    this.rightWindow = new THREE.Mesh(geometry, this.material);
  }

  addLeftLight() {
    const geometry = new THREE.PlaneGeometry(20, 20, 1);

    this.leftWindow = new THREE.Mesh(geometry, this.material);
  }

  addFarRightLight() {
    const geometry = new THREE.PlaneGeometry(20, 20, 1);
    this.farRightWindow = new THREE.Mesh(geometry, this.material);
  }

  addFarLeftLight() {
    const geometry = new THREE.PlaneGeometry(20, 20, 1);
    this.farLeftWindow = new THREE.Mesh(geometry, this.material);
  }

  setWindowPanePosition(x, y, z) {
    this.middleWindow.position.set(x, y, z);
    this.leftWindow.position.set(x + 40, y, z);
    this.rightWindow.position.set(x - 40, y, z);
    this.farLeftWindow.position.set(x + 80, y, z);
    this.farRightWindow.position.set(x - 80, y, z);
  }
}
