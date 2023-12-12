// /* A snow particle implementation */
import * as THREE from 'three'

let particles;
let positions = [], velocities = []

const numSnowflakes = 50

const maxRange = 8, minRange = maxRange / 2;
const minHeight = -1

const geometry = new THREE.BufferGeometry()
const textureloader = new THREE.TextureLoader()

export function generateSnowParticles(scene) {
    for (let i = 0; i < numSnowflakes; i++) {
    positions.push(
        Math.floor(Math.random() * maxRange - minRange),
        Math.floor(Math.random() * 6 + minHeight),
        Math.floor(Math.random() * maxRange - minRange)
    )
    
    velocities.push(
        Math.floor(Math.random() * 4 - 3) * 0.001,
        Math.floor(Math.random() * 5 + 9.12) * 0.001,
        Math.floor(Math.random() * 4 - 3) * 0.003
    )
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3))

    const circGeom = new THREE.SphereGeometry(THREE.MathUtils.randFloat(0.3, 0.6))
    const circMat = new THREE.MeshBasicMaterial({ color: 0xfbe2ba })
    var tex = new THREE.TextureLoader().load("https://threejs.org/examples/textures/sprites/disc.png");

    const flakeMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size:0.1 });
    particles = new THREE.Points(geometry, flakeMaterial)
    scene.add(particles)

}

export function moveSnowParticles(params) {
    for (let i = 0; i <= numSnowflakes*3; i+= 3) {
        particles.geometry.attributes.position.array[i] -= particles.geometry.attributes.velocity.array[i] * params.snowSpeed
        particles.geometry.attributes.position.array[i+1] -= particles.geometry.attributes.velocity.array[i+1] * params.snowSpeed
        particles.geometry.attributes.position.array[i+2] -= particles.geometry.attributes.velocity.array[i+2] * params.snowSpeed

    
        if (particles.geometry.attributes.position.array[i+1] < -2 || particles.geometry.attributes.position.array[i] < -4
            || particles.geometry.attributes.position.array[i+2] > 3.5) {
            particles.geometry.attributes.position.array[i] = Math.floor(Math.random() * maxRange - minRange)
            particles.geometry.attributes.position.array[i+1]  = Math.floor(Math.random() * 6 + minHeight)
            particles.geometry.attributes.position.array[i+2] = Math.floor(Math.random() * maxRange - minRange)
        }
        }
        particles.geometry.attributes.position.needsUpdate = true;
    }
