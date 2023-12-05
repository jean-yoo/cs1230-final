import * as THREE from 'three'
import { setupControlPanel } from './Config/ParamsControl'
import { setupLights, updateLighting } from './Objects/Lights';
import { genBgLights, moveLights } from './Objects/BgLights';
import { generateSnowParticles, moveSnowParticles } from './Objects/SnowParticles'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { bloomRender, setupBloomRendering } from './BloomRender';
import { BG_COLOR } from './Config/Config';
import { loadAsset, initializeWFC } from './WaveFunctionCollapse';
import Stats from 'three/examples/jsm/libs/stats.module'

const snowglobe = {
    gui: undefined,
    // container: document.getElementById('container'),
    // canvas: document.getElementById('cityscape'),
    // screenResolution: undefined,
    // camera: undefined,
    scene: undefined,
    renderer: undefined,
    // cloudComposer: undefined,
    // bloomComposer: undefined,
    // shaderComposer: undefined,
    // orbitControls: undefined,
    params: undefined,
    // stats: undefined, // Temporary
    glass: undefined
  }
  

let ASSETS_LOADED = false
// Setup scene
snowglobe.scene = new THREE.Scene() 
snowglobe.scene.background = BG_COLOR.BLOOM_OFF

var clock = new THREE.Clock()
clock.start()

// Setup camera
let camera = new THREE.PerspectiveCamera(
    75, // field of view angle
    window.innerWidth / window.innerHeight, // aspect ratio
    0.1, 1000); // near and far planes
camera.position.set(0,1,5)

// Setup renderer
snowglobe.renderer = new THREE.WebGLRenderer();
snowglobe.renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild(snowglobe.renderer.domElement);

// Setup FPS stats panel
const stats = new Stats()
document.body.appendChild(stats.dom)

// Setup camera rotation on mouse click
const cameraPan = new OrbitControls(camera, snowglobe.renderer.domElement)

// Setup a GUI with our paralocalmeters
setupControlPanel(snowglobe)

// Add a simple object for now...
// const geometry = new THREE.DodecahedronGeometry(1);
// const material = new THREE.MeshPhongMaterial( { color: 0xC54245 } );
// const thing = new THREE.Mesh(geometry, material);
// thing.castShadow = true
// thing.receiveShadow = true
// snowglobe.scene.add( thing );
var sphereGeometry = new THREE.SphereGeometry(6, 32, 32);
var sphereMaterial = new THREE.MeshPhongMaterial({
  color: "#fff",
  opacity: 0.4,
  transparent: true,
  specular: new THREE.Color( 0xffffff ),
  shininess: 60,
//   emissive: new THREE.Color( 0xffffff )
});
var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.receiveShadow = true
sphere.castShadow = true
snowglobe.scene.add(sphere);
snowglobe.glass = sphere; 

// Add a floor... To be replaced by Perlin noise later?
// const floorgeometry = new THREE.BoxGeometry(8, 0.1, 5)
// const floormaterial = new THREE.MeshPhongMaterial({ color: 0xffffff })
// const floor = new THREE.Mesh(floorgeometry, floormaterial)
// floor.position.set(0, 0,0)
// snowglobe.scene.add(floor)

loadAsset(snowglobe.scene).then(() => { initializeWFC(snowglobe.scene); ASSETS_LOADED = true; })

// Add some lights!
setupLights(snowglobe.scene, snowglobe)

// Circular lights for background
genBgLights(snowglobe.scene)
generateSnowParticles(snowglobe.scene)

// Setup post-processing steps for selective bloom
setupBloomRendering(snowglobe.scene, camera, snowglobe.renderer)

// Rendering Loop: This is the "paintGL" equivalent in three.js
var genTime = 0
function animate() {
    requestAnimationFrame(animate);
    if (!ASSETS_LOADED) return;

    cameraPan.update()

    if (clock.getElapsedTime() - genTime > 2) {
        generateSnowParticles(snowglobe.scene)
        genTime = clock.getElapsedTime()
    }
    moveSnowParticles(snowglobe.scene)
    moveLights(camera, clock)

    // This function call abstracts away post-processing steps
    bloomRender(snowglobe.scene) 

    updateLighting(snowglobe)

    stats.update()
}
animate();