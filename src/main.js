import * as THREE from 'three'
import { setupControlPanel } from './ParamsControl'
import { particleSystems, generateSnowParticles } from './SnowParticles'
// Setup scene
const scene = new THREE.Scene()

var clock = new THREE.Clock()
clock.start()

// Setup camera
const camera = new THREE.PerspectiveCamera(
    75, // field of view angle
    window.innerWidth / window.innerHeight, // aspect ratio
    0.1, 1000); // near and far planes

// Setup renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild(renderer.domElement);

// Setup a GUI with our parameters
setupControlPanel()

// Add a simple object
const geometry = new THREE.DodecahedronGeometry(1);
const material = new THREE.MeshPhongMaterial( { color: 0xC54245 } );
const thing = new THREE.Mesh( geometry, material );
scene.add( thing );

// Add a floor... To be replaced by procedural generation
const floorgeometry = new THREE.BoxGeometry(8, 0.1, 5)
const floormaterial = new THREE.MeshPhongMaterial({ color: 0x1E792C })
const floor = new THREE.Mesh(floorgeometry, floormaterial)
floor.position.set(0,-1.5,0)
scene.add(floor)

// Add lights
const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.9 );
scene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.9);
directionalLight2.target = thing
directionalLight2.position.set(-1,0,0)
scene.add(directionalLight2)

const pointLight1 = new THREE.PointLight( 0xffffff, 1, 100 );
pointLight1.position.set( 0,-0.5,1.5 );
scene.add(pointLight1);

const ambient = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add(ambient);

camera.position.z = 3;
camera.position.y = 0;

// Rendering Loop: This is the "paintGL" equivalent in three.js
var genTime = 0
function animate() {
    requestAnimationFrame(animate);

    thing.rotation.x += 0.01;
    thing.rotation.y += 0.01;

    if (clock.getElapsedTime() - genTime > 2) {
        generateSnowParticles(scene)
        genTime = clock.getElapsedTime()
    }
    for (const particleSystem of particleSystems) {
        // Remove particles as they move off screen
        if (particleSystem.position.y <= -8) {
            particleSystems.shift(); // logically remove the particles
            scene.remove(particleSystem); // visually remove the particles 
            continue
        }
        particleSystem.position.y -= 0.01
    }

	renderer.render( scene, camera );
}
animate();