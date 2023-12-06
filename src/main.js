import * as THREE from 'three'
import { setupControlPanel } from './Config/ParamsControl'
import { setupLights } from './Objects/Lights';
import { genBgLights, moveLights } from './Objects/BgLights';
import { generateSnowParticles, moveSnowParticles } from './Objects/SnowParticles'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { bloomRender, setupBloomRendering } from './BloomRender';
import { BG_COLOR } from './Config/Config';
import { loadAsset, initializeWFC, loadWFCAsset, initializePMF } from './WaveFunctionCollapse';
import Stats from 'three/examples/jsm/libs/stats.module'

let ASSETS_LOADED = false
// Setup scene
const scene = new THREE.Scene() 
scene.background = BG_COLOR.BLOOM_OFF

var clock = new THREE.Clock()
clock.start()

// Setup camera
let camera = new THREE.PerspectiveCamera(
    75, // field of view angle
    window.innerWidth / window.innerHeight, // aspect ratio
    0.1, 1000); // near and far planes
camera.position.set(0,1,5)

// Setup renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild(renderer.domElement);

// Setup FPS stats panel
const stats = new Stats()
document.body.appendChild(stats.dom)

// Setup camera rotation on mouse click
const cameraPan = new OrbitControls(camera, renderer.domElement)

// Setup a GUI with our paralocalmeters
setupControlPanel()

// Add a simple object for now...
// const geometry = new THREE.DodecahedronGeometry(1);
// const material = new THREE.MeshPhongMaterial( { color: 0xC54245 } );
// const thing = new THREE.Mesh(geometry, material);
// scene.add( thing );

// Add a floor... To be replaced by Perlin noise later?
// const floorgeometry = new THREE.BoxGeometry(8, 0.1, 5)
// const floormaterial = new THREE.MeshPhongMaterial({ color: 0xffffff })
// const floor = new THREE.Mesh(floorgeometry, floormaterial)
// floor.position.set(0, 0,0)
// scene.add(floor)

loadAsset(scene)
    .then(() => loadWFCAsset())
    .then(NUM_WFC_BLOCKS => {
        console.log("NUM WFC BLOCKS:", NUM_WFC_BLOCKS); 
        initializeWFC(scene); 
        ASSETS_LOADED = true;
    })
    .then(() => initializePMF())

// Add some lights!
setupLights(scene)

// Circular lights for background
genBgLights(scene)
generateSnowParticles(scene)

// Setup post-processing steps for selective bloom
setupBloomRendering(scene, camera, renderer)

// Rendering Loop: This is the "paintGL" equivalent in three.js
var genTime = 0
function animate() {
    requestAnimationFrame(animate);
    if (!ASSETS_LOADED) return;

    cameraPan.update()

    if (clock.getElapsedTime() - genTime > 2) {
        generateSnowParticles(scene)
        genTime = clock.getElapsedTime()
    }
    moveSnowParticles(scene)
    moveLights(camera, clock)

    // This function call abstracts away post-processing steps
    bloomRender(scene) 

    stats.update()
}
animate();