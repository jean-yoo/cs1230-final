import * as THREE from 'three'
import { setupControlPanel } from './Config/ParamsControl'
import { setupLights, updateLighting } from './Objects/Lights';
import { genBgLights, moveLights } from './Objects/BgLights';
import { generateSnowParticles, moveSnowParticles } from './Objects/SnowParticles'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { masterRender, setupMasterRendering, BLOOM_LAYER } from './Rendering';
import { BG_COLOR } from './Config/Config';
import { loadAsset, spawnProps } from './GenerateProps';
import Stats from 'three/examples/jsm/libs/stats.module'
import Particle from './Boids/Boids'
import { checkCollision } from './GenerateProps';
import { generateGlobeAndGround } from './Objects/GlobeSetup';
import { genTree, genStar, plotSnow } from './Objects/TreeSnow';

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

// Setup camera rotation on mouse click
const cameraPan = new OrbitControls(camera, snowglobe.renderer.domElement)

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
generateSnowParticles(snowglobe.scene)
generateGlobeAndGround(snowglobe)
setupMasterRendering(snowglobe.scene, camera, snowglobe.renderer)

// Adding the tree
snowglobe.scene.fog = new THREE.FogExp2(2237993,.0015);
//genTree(snowglobe, scale, branches, DELTAX, DELTAY, DELTAZ, skin)
snowglobe.scene.add(genTree(snowglobe, 1, 14, 2.5, 0, 0, 1));

function getRand() {
  // Generate a random angle in radians
  var randomAngle = Math.random() * 2 * Math.PI;

  // Generate a random radius between 3 and 5
  var randomRadius = Math.random() * (4.8 - 3.0) + 3.0;

  // Calculate x and z coordinates based on polar to Cartesian conversion
  var x = randomRadius * Math.cos(randomAngle);
  var z = randomRadius * Math.sin(randomAngle);

  // Return the random coordinates as an object
  return { x: x, z: z };
}

const NUM_TREES = 40;

for (let i = 0.0; i < NUM_TREES; i++) {
  var tmp = getRand();
  if (i/NUM_TREES > 0.80) {
    var tree = genTree(snowglobe, 2, 14, tmp.x, 0, tmp.z, 0.8);
    var newPosition = new THREE.Vector3(0, -1, 0);
    tree.position.copy(newPosition);
  }
  else if (i/NUM_TREES > 0.4) {
    var tree = genTree(snowglobe, 3, 14, tmp.x, 0, tmp.z, 1.2);
    var newPosition = new THREE.Vector3(0, -1.5, 0);
    tree.position.copy(newPosition);
  }
  else {
    var tree = genTree(snowglobe, 5, 14, tmp.x, 0, tmp.z, 0.8);
    var newPosition = new THREE.Vector3(0, -1.5, 0);
    tree.position.copy(newPosition);
  }
  snowglobe.scene.add(tree);
}

const starGeometry = genStar(5, 10); // Function to create star geometry
const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const star = new THREE.Mesh(starGeometry, starMaterial);
star.scale.set(0.03, 0.03, 0.03);
star.rotation.z += 0.3;

// For pivoting around the right point
var pivotPoint = new THREE.Vector3(2.5, 0.1, -0.05);
var pivotContainer = new THREE.Object3D();
pivotContainer.add(star);
pivotContainer.position.copy(pivotPoint);
snowglobe.scene.add(pivotContainer);

// Adding multiple other trees


// ADDING SNOW
var snow = new THREE.Group();
var snow1 = new THREE.Path();
plotSnow(snow1);

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randi(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var points = snow1.getPoints();
var velocities = [];
var rotationalVelocities = [];

function reSnow(idx) {
  var n = Math.acos(-1+(2 * idx )/ 200)
        , t = Math.sqrt(200 * Math.PI) * n;
  mesh = snow.children[idx];
  mesh.position.x = (150 * Math.sin( n) * Math.cos( t))/40;
  mesh.position.y=(Math.random()*(150-(-150))-150)/60 + 3;
  mesh.position.z = (150 * Math.cos( n)+Math.floor(Math.random()*40+1))/40;
}

const SNOW_COUNT = 400;
for (var i=0;i<SNOW_COUNT;i++){
  var geometry = new THREE.BufferGeometry().setFromPoints(points);
  var material = new THREE.LineBasicMaterial( { color: 0xffffff ,side: THREE.DoubleSide } );
  var mesh = new THREE.Line( geometry, material ) ;
  var lineObject = new THREE.Object3D();
  lineObject.add(mesh);
  lineObject.scale.set(0.05,0.05,0.05);
  var n = Math.acos(-1+(2 * i )/ 200)
        , t = Math.sqrt(200 * Math.PI) * n;
  lineObject.position.x = (150 * Math.sin( n) * Math.cos( t))/30;
  lineObject.position.y=(Math.random()*(150-(-150))-150)/60 + 4;
  lineObject.position.z = (150 * Math.cos( n)+Math.floor(Math.random()*40+1))/30;

  const velocity = new THREE.Vector3(rand(-2,2),rand(-1,-3),0);
  velocities.push(velocity);
  const rot = randi(0,3);
  var rotationalVelocity;
  if(rot === 0) rotationalVelocity
      = new THREE.Vector3(rand(-30,30),0,0)
  if(rot === 1) rotationalVelocity
      = new THREE.Vector3(0,rand(-30,30),0)
  if(rot === 2) rotationalVelocity
      = new THREE.Vector3(0,0,rand(-30,30))
  rotationalVelocities.push(rotationalVelocity);
  snow.add(lineObject);
}
snowglobe.scene.add(snow);

//


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

  if (clock.getElapsedTime() - genTime > 2) {
    //generateSnowParticles(snowglobe.scene)
    genTime = clock.getElapsedTime()
  }
  for (var i = 0, n = blobs.length; i < n; i++) {
    foid = foids[i];
    foid.swim(foids);
    blob = blobs[i]; blob.position.copy(foids[i].position);

    // Update the orientation of the foid
    blob.rotation.y = 0.06 * Math.atan2(- foid.velocity.z, foid.velocity.x);
    blob.rotation.z = 0.06 * Math.asin(foid.velocity.y / foid.velocity.length());
  }

  //moveSnowParticles(snowglobe.scene);
  // new particle movement
  for (var i = 0; i < snow.children.length; i++) {
    if (snow.children[i].position.y*snow.children[i].position.y + snow.children[i].position.x*snow.children[i].position.x
      + snow.children[i].position.z*snow.children[i].position.z > 30) reSnow(i);
    else {
      var v = velocities[i];
      var rv = rotationalVelocities[i];
      snow.children[i].position.x += v.x/200;
      snow.children[i].position.y += v.y/200;
      snow.children[i].position.z += v.z/200;
      
      snow.children[i].rotation.x += rv.x / 2000;
      snow.children[i].rotation.y += rv.y / 2000;
      snow.children[i].rotation.z += rv.z / 2000;
    }
  }

  /// dynamics
  moveLights(camera, clock);
  pivotContainer.rotation.z += 0.01;
  const time = Date.now() * 0.001;
  const flashSpeed = 0.5;
  const intensity = Math.abs(Math.sin(time * flashSpeed));
  starMaterial.color.setRGB(Math.cos(intensity*5)*0.5, Math.cos(intensity*5)*0.5, Math.sin(intensity*2)*0.5);

  // This function call abstracts away post-processing steps
  masterRender(snowglobe.scene)

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