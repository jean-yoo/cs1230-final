import * as THREE from 'three'

export function setupLights(scene) {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight2.position.set(-1, 0, 0)
    scene.add(directionalLight2)

    const pointLight1 = new THREE.PointLight(0xffffff, 1, 100);
    pointLight1.position.set(0, -0.5, 1.5);
    scene.add(pointLight1);

    const ambient = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(ambient);
}