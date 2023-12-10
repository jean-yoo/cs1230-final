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
import { plotSnow } from './Objects/TreeSnow';
import { getRand, rand, randi, genTree, genStar } from './GenerateProps';
let effect;  

const snowglobe = {
  gui: undefined,
  // container: document.getElementById('container'),
  // canvas: document.getElementById('cityscape'),
  // screenResolution: undefined,
  autorun: false,
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
cameraPan.maxPolarAngle = Math.PI / 1.6

// Setup a GUI with our paralocalmeters
setupControlPanel(snowglobe)

var blob, blobs, foid, foids;
blobs = [];
foids = [];
var count = 0;

function spawnBoids(dogs) {
  while (count !=8) {
    // init each particle at a random position and velocity
    foid = foids[count] = new Particle();
    foid.position = new THREE.Vector3(1,-1.85,1);
    // console.log(foid.position)
    // console.log(foid)
    // foid.position.x = 0; foid.position.y = -2; foid.position.z = 0;
    // console.log(checkCollision(foid.position, 1))
    while (!(checkCollision(foid.position, 1) === undefined)) {
      //foid.position.x = 0; foid.position.y = -1.8; foid.position.z = 0;
      // console.log("dasfjs")
      if (count >= 0 && count < 4) {
        foid.position.x = THREE.MathUtils.randFloat(-1, -1.0); foid.position.y = -1.85; foid.position.z = THREE.MathUtils.randFloat(-4.5,-1.0);
        } else if ((count >= 4) && (count <8)) {
          foid.position.x = THREE.MathUtils.randFloat(2.0, 5.5); foid.position.y = -1.85; foid.position.z = THREE.MathUtils.randFloat(2.0,4.5);
        } else {
          foid.position.x = THREE.MathUtils.randFloat(-1, 0.9); foid.position.y = -1.85; foid.position.z = THREE.MathUtils.randFloat(1.0,1.2);
        }
    }

    // foid.velocity.x = 0.00001; foid.velocity.y = 0; foid.velocity.z = 0.00001;
    // foid.setBoundaries(8, 8, 8);
    var dog_prob = Math.random()
    if (dog_prob < 0.4) {
      blob = blobs[count] = dogs[0].obj.clone()
    } else if ((dog_prob >= 0.4) && (dog_prob < 0.7)) {
      blob = blobs[count] = dogs[1].obj.clone()
    } else {
      blob = blobs[count] = dogs[2].obj.clone()
    }
    // new THREE.Mesh(
    //   new THREE.DodecahedronGeometry(0.3),
    //   new THREE.MeshPhongMaterial({ color: "rgb(71, 50, 36)" }));
    blob.receiveShadow = true
    blob.castShadow = true
    blob.position.copy(foids[count].position)
    blob.rotation.x = 0; blob.rotation.y = 0; blob.rotation.z = 0; 
    // blob.lookAt(new THREE.Vector3(-50, 0, THREE.MathUtils.randFloat(-90, -10)));
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
//generateSnowParticles(snowglobe.scene)
snowglobe.params.timeOfDay = 18.431

/*
Tree and Snow
*/
// snowglobe.scene.fog = new THREE.FogExp2(2237993,.0015);
const NUM_TREES = 20;
const SNOW_COUNT = 400;

// MAIN TREE w/ STAR
snowglobe.scene.add(genTree(snowglobe, 1, 14, 0.5, 0, 0, 1));
const starGeometry = genStar(5, 10); // Function to create star geometry
const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const star = new THREE.Mesh(starGeometry, starMaterial);
star.scale.set(0.03, 0.03, 0.03);
star.rotation.z += 0.3;

var pivotPoint = new THREE.Vector3(0.5, 0.1, -0.05);
var pivotContainer = new THREE.Object3D();
pivotContainer.add(star);
pivotContainer.position.copy(pivotPoint);
snowglobe.scene.add(pivotContainer);

// Randomly scattered trees
var tree, newPosition;
for (let i = 0.0; i < NUM_TREES; i++) {
  do {
    var tmp = getRand();
    if (i/NUM_TREES > 0.80) {
      tree = genTree(snowglobe, 2, 14, tmp.x, 0, tmp.z, 0.8);
      newPosition = new THREE.Vector3(0, -1, 0);
      tree.position.copy(newPosition);
    }
    else if (i/NUM_TREES > 0.4) {
      tree = genTree(snowglobe, 3, 14, tmp.x, 0, tmp.z, 1.2);
      newPosition = new THREE.Vector3(0, -1.5, 0);
      tree.position.copy(newPosition);
    }
    else {
      tree = genTree(snowglobe, 5, 14, tmp.x, 0, tmp.z, 0.8);
      newPosition = new THREE.Vector3(0, -1.5, 0);
      tree.position.copy(newPosition);
    }
  } while (!(checkCollision(tree.position, 1) === undefined));
  snowglobe.scene.add(tree);
}


// ADDING SNOW
var snow = new THREE.Group();
var snowPath = new THREE.Path();
plotSnow(snowPath);

var points = snowPath.getPoints();
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

var geometry = new THREE.BufferGeometry().setFromPoints(points);
var material = new THREE.LineBasicMaterial( { color: 0xffffff ,side: THREE.DoubleSide } );
for (var i=0;i<SNOW_COUNT;i++) {
  var mesh = new THREE.Line(geometry, material);
  var lineObject = new THREE.Object3D();
  lineObject.add(mesh);
  lineObject.scale.set(0.05,0.05,0.05);
  var n = Math.acos(-1+(2 * i )/ 200), t = Math.sqrt(200 * Math.PI) * n;
  lineObject.position.x = (150 * Math.sin( n) * Math.cos( t))/30;
  lineObject.position.y=(Math.random()*(150-(-150))-150)/60 + 4;
  lineObject.position.z = (150 * Math.cos( n)+Math.floor(Math.random()*40+1))/30;

  const velocity = new THREE.Vector3(rand(-2,2),rand(-0.1, -1),0);
  velocities.push(velocity);
  const rot = randi(0,3);
  var rotationalVelocity;
  if(rot === 0) rotationalVelocity = new THREE.Vector3(rand(-30,30),0,0)
  if(rot === 1) rotationalVelocity = new THREE.Vector3(0,rand(-30,30),0)
  if(rot === 2) rotationalVelocity = new THREE.Vector3(0,0,rand(-30,30))
  rotationalVelocities.push(rotationalVelocity);
  snow.add(lineObject);
}
snowglobe.scene.add(snow);

// Rendering Loop: This is the "paintGL" equivalent in three.js
let propsGenerated = false
var genTime = 0
//generateSnowParticles(snowglobe.scene)

const GLOBE_BLOOM = { off: 0, on: 1 }
let globeBloom = GLOBE_BLOOM.off
const isNight = () => snowglobe.params.timeOfDay < 8.5 || snowglobe.params.timeOfDay > 20

function animate() {
  requestAnimationFrame(animate);
  if (!ASSETS_LOADED) return
  if (!propsGenerated) {
    const dogs = spawnProps(snowglobe);
    spawnBoids(dogs)
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

    // blob.lookAt(new THREE.Vector3(foids[i].velocity))

    // Update the orientation of the foid
    // blob.rotation.x = foids[i].direction.x; 
    //blob.rotation.z= foids[i].direction.z; 
    // blob.rotation.y = 1 * Math.atan2(- foid.velocity.z, foid.velocity.x);
    // blob.rotation.z = 1 * Math.asin(foid.velocity.y / foid.velocity.length());
    // blob.rotation.x = foid.direction.x * -10000
    // blob.rotation.y =-90
    // blob.rotation.z = foid.direction.z
    // blob.lookAt(foid.direction.clone().multiplyScalar(-1000000).x, -2, 0)
    // const dir = new THREE.Vector3()
    // blob.getWorldDirection(dir)
    // const ler = dir.lerp(foid.direction.clone().multiplyScalar(-10000), 1)
    // var idk = blob.worldToLocal(new THREE.Vector3(0,0,0))
    // // console.log(dir)
    // // console.log(ler.normalize())
    // // console.log(-1*Math.abs(dir.x), -1*Math.abs(dir.z))
    // // blob.lookAt(new THREE.Vector3(0, -2, 0))
    // // blob.rotateY(dir.x * 0.02 - dir.z * 0.01)
    var mat = blob.matrix 
    var idk = foid.direction.applyMatrix4(mat)

    blob.lookAt(new THREE.Vector3(-idk.x*0.1, -2 , idk.z*0.1))
    blob.rotateY(Math.PI)
  }

  //moveSnowParticles(snowglobe.scene)
  // new particle movement
  for (var i = 0; i < snow.children.length; i++) {
    if (snow.children[i].position.y*snow.children[i].position.y + snow.children[i].position.x*snow.children[i].position.x
      + snow.children[i].position.z*snow.children[i].position.z > 30) reSnow(i);
    else {
      var v = velocities[i];
      var rv = rotationalVelocities[i];
      snow.children[i].position.x += v.x/200;
      snow.children[i].position.y += ((Math.abs(snowglobe.params.timeOfDay-12)+1) / 2)*v.y/200;
      snow.children[i].position.z += v.z/200;
      
      snow.children[i].rotation.x += rv.x / 2000;
      snow.children[i].rotation.y += rv.y / 2000;
      snow.children[i].rotation.z += rv.z / 2000;
    }
  }
  moveLights(camera, clock)
  pivotContainer.rotation.z += 0.01;
  const time = Date.now() * 0.001;
  const flashSpeed = 0.5;
  const intensity = Math.abs(Math.sin(time * flashSpeed));
  starMaterial.color.setRGB(Math.cos(intensity*5)*0.5, Math.cos(intensity*5)*0.5, Math.sin(intensity*2)*0.5);

  // This function call abstracts away post-processing steps
  bloomRender(snowglobe.scene, effect, camera)

  // Turn the lights off at night
  if (isNight() && globeBloom == GLOBE_BLOOM.off) {
    for (const obj of snowglobe.glowObjs) { enableGlow(obj) }
    globeBloom = GLOBE_BLOOM.on
  } else if (!isNight() && globeBloom == GLOBE_BLOOM.on) {
    for (const obj of snowglobe.glowObjs) { disableGlow(obj) }
    globeBloom = GLOBE_BLOOM.off
  }

  //auto-run
  if (snowglobe.params.autorun) {
  snowglobe.params.timeOfDay += 0.02
  }
  if (snowglobe.params.timeOfDay > 23.4) snowglobe.params.timeOfDay = 0
  // if (isNight()) snowglobe.scene.fog.density += 0.0003;
  // else snowglobe.scene.fog.density -= 0.0003;
  if (snowglobe.params.timeOfDay > 23.4) snowglobe.params.timeOfDay = 0

  updateLighting(snowglobe)
  stats.update()
}
animate();

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    snowglobe.renderer.setSize( window.innerWidth, window.innerHeight );

}

// AUDIO
var listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source
var sound = new THREE.Audio( listener );

var audioLoader = new THREE.AudioLoader();

//Load a sound and set it as the Audio object's buffer
audioLoader.load('../song.mp3', function( buffer ) {
    sound.setBuffer( buffer );
    sound.setLoop(true);
    sound.setVolume(0.2);
    sound.play();
});