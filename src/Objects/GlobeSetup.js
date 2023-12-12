import * as THREE from 'three'
import { CircularPerlinMesh } from '../Perlin';

export function generateGlobeAndGround(snowglobe) {
    // The globe itself
    var sphereGeometry = new THREE.SphereGeometry(6, 64, 64);
    var sphereMaterial = new THREE.MeshPhongMaterial({
        color: "#fff",
        opacity: 0.2,
        transparent: true,
        specular: new THREE.Color( 0xffffff ),
        shininess: 100,
    });
    var globeGlass = new THREE.Mesh(sphereGeometry, sphereMaterial);

    globeGlass.name = "SNOW_SPHERE"
    globeGlass.receiveShadow = false

    snowglobe.scene.add(globeGlass);
    globeGlass.layers.toggle(2)
    
    // Cap
    const circleGeometry = new THREE.CircleGeometry(5.35, 32);
    circleGeometry.rotateX(-Math.PI * 0.5)
    var circleMaterial = new THREE.MeshLambertMaterial({ color: "rgb(230, 225, 223)" });
    var groundCap = new THREE.Mesh(circleGeometry, circleMaterial);
    groundCap.receiveShadow = true;
    groundCap.position.set(0, -2.0, 0)

    // Partial sphere
    const geometry = new THREE.SphereGeometry(5.7, 32, 32, undefined, undefined, undefined, 1.212);
    const material = new THREE.MeshLambertMaterial({
        color: 0xfffffff,
        side: THREE.DoubleSide
    });
    var groundSide = new THREE.Mesh(geometry, material);
    groundSide.rotation.z = Math.PI
    groundSide.receiveShadow = true;
    groundSide.castShadow = true;
    snowglobe.scene.add(groundCap)
    snowglobe.scene.add(groundSide);
    // groundCap.layers.toggle(2)
    groundSide.layers.toggle(2)
    snowglobe.outlineObjs.push(groundSide)
    snowglobe.outlineObjs.push(globeGlass)

    // Perlin snow
    const perlinSnow = CircularPerlinMesh(10.5, 30)
    snowglobe.scene.add(perlinSnow)
    perlinSnow.position.set(-5.2, -3.1, -5.2)
    perlinSnow.receiveShadow = true
    snowglobe.outlineObjs.push(perlinSnow)
}