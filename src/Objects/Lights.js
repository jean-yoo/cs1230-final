/* Add all the light sources in here */
import * as THREE from 'three'

function addDirLight(scene, color, intensity, position, toggleHelper) {
    const directionalLight = new THREE.DirectionalLight(color, intensity);
    directionalLight.position.set(position[0], position[1], position[2])
    scene.add(directionalLight);
    if (toggleHelper) {
        const helper = new THREE.DirectionalLightHelper(directionalLight, 1);
        scene.add(helper);
    }
}
export function setupLights(scene) {
    addDirLight(scene, 0xffffff, 0.9, [0,0,3], true)
    addDirLight(scene, 0xffffff, 0.9, [-1,3,0], true)

    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight3.position.set(-1, 1, 3)
    scene.add(directionalLight3)


    const pointLight1 = new THREE.PointLight(0xffffff, 1, 100);
    pointLight1.position.set(0,3,0);
    scene.add(pointLight1);

    const ambient = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(ambient);
}