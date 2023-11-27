// A snow particle implementation
// ... To be replaced by a more sophisticated one... 
import * as THREE from 'three'

export var particleSystems = []
export function generateSnowParticles(scene) {
    const vertices = [];
    for (let i = 0; i < 50; i++) {
        const x = THREE.MathUtils.randFloatSpread(5);
        const y = THREE.MathUtils.randFloatSpread(3) + 4;
        const z = THREE.MathUtils.randFloatSpread(5);
        vertices.push(x, y, z);
    }
    const particles = new THREE.BufferGeometry();
    particles.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const particleMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size:0.1 });
    const newParticleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(newParticleSystem)
    particleSystems.push(newParticleSystem)
}