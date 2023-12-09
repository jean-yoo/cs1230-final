import * as THREE from 'three'
import { setupControlPanel } from './Config/ParamsControl'
import { setupLights, updateLighting } from './Objects/Lights';
import { genBgLights, moveLights } from './Objects/BgLights';
import { generateSnowParticles, moveSnowParticles } from './Objects/SnowParticles'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { bloomRender, BLOOM_LAYER, setupBloomRendering } from './Rendering';
import { BG_COLOR } from './Config/Config';
import { loadAsset, spawnProps } from './GenerateProps';
import Stats from 'three/examples/jsm/libs/stats.module'
import Particle from './Boids/Boids'
import { checkCollision } from './GenerateProps';
import { generateGlobeAndGround } from './Objects/GlobeSetup';
import { OutlineEffect } from '../OutlineEffect';
let effect;  

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
  glass: undefined,
  glowObjs: [] // Used to control blooming/lighting based on time of day
}

function enableGlow(obj) {
  if (obj.isMesh && !BLOOM_LAYER.test(obj.layers)) obj.layers.toggle(1)
  else if (obj.isPointLight) obj.intensity = 1
}
function disableGlow(obj) {
  if (obj.isMesh && BLOOM_LAYER.test(obj.layers)) obj.layers.toggle(1)
  else if (obj.isPointLight) obj.intensity = 0
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
camera.position.set(0, 1, 5)

// Setup renderer
snowglobe.renderer = new THREE.WebGLRenderer({ antialias: true });
snowglobe.renderer.localClippingEnabled = true;
snowglobe.renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(snowglobe.renderer.domElement);

// Setup FPS stats panel
const stats = new Stats()
document.body.appendChild(stats.dom)

effect = new OutlineEffect( snowglobe.renderer );
effect.enabled = true

// Setup camera rotation on mouse click
const cameraPan = new OrbitControls(camera, snowglobe.renderer.domElement)
cameraPan.enableDamping = true
cameraPan.dampingFactor = 0.03

// Setup a GUI with our paralocalmeters
setupControlPanel(snowglobe)

var blob, blobs, foid, foids;
blobs = [];
foids = [];
var count = 0;

function spawnBoids() {
  while (count != 10) {
    // init each particle at a random position and velocity
    foid = foids[count] = new Particle();
    // foid.position = new THREE.Vector3(1,1,1);
    // console.log(foid.position)
    // console.log(foid)
    // if (count >= 0 && count < 4) {
    // foid.position.x = THREE.MathUtils.randFloat(-5,-1.0); foid.position.y = -1.7; foid.position.z = THREE.MathUtils.randFloat(-4.5,-1.0);
    // } else if ((count >= 4) && (count < 8)) {
    //   foid.position.x = THREE.MathUtils.randFloat(2.0, 5.5); foid.position.y = -1.7; foid.position.z = THREE.MathUtils.randFloat(2.0,4.5);
    // } else {
    //   foid.position.x = THREE.MathUtils.randFloat(-1, 0.9); foid.position.y = -1.7; foid.position.z = THREE.MathUtils.randFloat(1.0,1.2);
    // }
    foid.position.x = 0; foid.position.y = -1.7; foid.position.z = 0;
    // console.log(checkCollision(foid.position, 1))
    while (!(checkCollision(foid.position, 1) === undefined)) {
      foid.position.x = THREE.MathUtils.randFloat(-5, 5); foid.position.y = -1.7; foid.position.z = THREE.MathUtils.randFloat(-4.5, 5);
      // console.log("dasfjs")
    }

    // foid.velocity.x = 0.00001; foid.velocity.y = 0; foid.velocity.z = 0.00001;
    // foid.setBoundaries(8, 8, 8);

    blob = blobs[count] = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.3),
      new THREE.MeshPhongMaterial({ color: "rgb(71, 50, 36)" }));
    blob.receiveShadow = true
    blob.castShadow = true
    blob.position.copy(foids[count].position)
    // blob.state = Math.ceil(Math.random() * 15);
    snowglobe.scene.add(blob);
    count++;
  }
}

loadAsset().then(() => { ASSETS_LOADED = true; })

// Add some lights!
setupLights(snowglobe.scene, snowglobe)
genBgLights(snowglobe.scene)
// generateSnowParticles(snowglobe.scene)
generateGlobeAndGround(snowglobe)
setupBloomRendering(snowglobe.scene, camera, snowglobe.renderer)
generateSnowParticles(snowglobe.scene)
snowglobe.params.timeOfDay = 11

// Rendering Loop: This is the "paintGL" equivalent in three.js
let propsGenerated = false
var genTime = 0

const GLOBE_BLOOM = { off: 0, on: 1 }
let globeBloom = GLOBE_BLOOM.off
const isNight = () => snowglobe.params.timeOfDay < 8.5 || snowglobe.params.timeOfDay > 18.5

function animate() {
  requestAnimationFrame(animate);
  if (!ASSETS_LOADED) return
  if (!propsGenerated) {
    spawnProps(snowglobe);
    spawnBoids()
    propsGenerated = true;
  }
  cameraPan.update()

  // if (clock.getElapsedTime() - genTime > 2) {
  //   generateSnowParticles(snowglobe.scene)
  //   genTime = clock.getElapsedTime()
  // }
  for (var i = 0, n = blobs.length; i < n; i++) {
    foid = foids[i];
    foid.swim(foids);
    blob = blobs[i]; blob.position.copy(foids[i].position);

    // Update the orientation of the foid
    blob.rotation.y = 0.06 * Math.atan2(- foid.velocity.z, foid.velocity.x);
    blob.rotation.z = 0.06 * Math.asin(foid.velocity.y / foid.velocity.length());
  }

  moveSnowParticles(snowglobe.scene)
  moveLights(camera, clock)

  // This function call abstracts away post-processing steps
  bloomRender(snowglobe.scene)

  // Turn the lights off at night
  if (isNight() && globeBloom == GLOBE_BLOOM.off) {
    for (const obj of snowglobe.glowObjs) { enableGlow(obj) }
    globeBloom = GLOBE_BLOOM.on
  } else if (!isNight() && globeBloom == GLOBE_BLOOM.on) {
    for (const obj of snowglobe.glowObjs) { disableGlow(obj) }
    globeBloom = GLOBE_BLOOM.off
  }

  //auto-run
  // snowglobe.params.timeOfDay += 0.05
  if (snowglobe.params.timeOfDay > 23.4) snowglobe.params.timeOfDay = 0

  updateLighting(snowglobe)
  stats.update()
}
animate();