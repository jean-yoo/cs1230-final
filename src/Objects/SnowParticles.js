/* A snow particle implementation */
import * as THREE from 'three'

let particleSystems = []

export function generateSnowParticles(scene) {
    const vertices = [];
    for (let i = 0; i < 15; i++) {
        const x = THREE.MathUtils.randFloatSpread(5);
        const y = THREE.MathUtils.randFloatSpread(3) + 4;
        const z = THREE.MathUtils.randFloatSpread(5);
        vertices.push(x, y, z);
    }
    const particles = new THREE.BufferGeometry();
    particles.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const particleMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size:0.1 });
    const newParticleSystem = new THREE.Points(particles, particleMaterial);
    newParticleSystem.layers.toggle(1)
    scene.add(newParticleSystem)
    particleSystems.push(newParticleSystem)
}

export function moveSnowParticles(scene) {
    for (const particleSystem of particleSystems) {
        // Remove particles as they move off screen
        if (particleSystem.position.y <= -8) {
            particleSystems.shift(); // logically remove the particles
            scene.remove(particleSystem); // visually remove the particles 
            continue
        }
        particleSystem.position.y -= 0.01
    }
}