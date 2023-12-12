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
import { OutlineEffect } from './OutlineEffect';
import { plotSnow } from './Objects/TreeSnow';
import { getRand, rand, randi, genTree, genStar } from './GenerateProps';
let effect;

const snowglobe = {
  gui: undefined,
  autorun: false,
  scene: undefined,
  renderer: undefined,
  params: undefined,
  glass: undefined,
  perlinSnow: undefined,
  groundSide: undefined,
  outlineObjs: [],
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

effect = new OutlineEffect(snowglobe.renderer);
effect.enabled = true

// Setup camera rotation on mouse click
const cameraPan = new OrbitControls(camera, snowglobe.renderer.domElement)
cameraPan.enableDamping = true
cameraPan.dampingFactor = 0.03
cameraPan.maxPolarAngle = Math.PI / 1.8

// Setup a GUI with our paralocalmeters
setupControlPanel(snowglobe)

// var debug= new THREE.Mesh(
//   new THREE.DodecahedronGeometry(10),
//   new THREE.MeshPhongMaterial({ color: "rgb(71, 50, 36)" }));
// debug.position.set(-10, 0, 10)
// snowglobe.scene.add(debug)

var blob, blobs, boid, boids;
blobs = [];
boids = [];
var count = 0;

const MAX_ITR = 100
function spawnBoids(dogs) {
  let itr = 0
  while (count != 8) {
    if (itr > MAX_ITR) break
    // init each particle at a random position and velocity
    boid = boids[count] = new Particle();
    boid.position = new THREE.Vector3(1, -1.85, 1);
    while (checkCollision(boid.position, 1)) {
      if (count >= 0 && count < 4) {
        boid.position.x = THREE.MathUtils.randFloat(-1, -3.0); boid.position.y = -1.85; boid.position.z = THREE.MathUtils.randFloat(-4.5, -1.0);
      } else if ((count >= 4) && (count < 8)) {
        boid.position.x = THREE.MathUtils.randFloat(2.0, 5.5); boid.position.y = -1.85; boid.position.z = THREE.MathUtils.randFloat(2.0, 4.5);
      } else {
        boid.position.x = THREE.MathUtils.randFloat(-1, 0.9); boid.position.y = -1.85; boid.position.z = THREE.MathUtils.randFloat(1.0, 1.2);
      }
    }
    var dog_prob = Math.random()
    if (dog_prob < 0.4) {
      blob = blobs[count] = dogs[0].obj.clone()
    } else if ((dog_prob >= 0.4) && (dog_prob < 0.7)) {
      blob = blobs[count] = dogs[1].obj.clone()
    } else {
      blob = blobs[count] = dogs[2].obj.clone()
    }
    blob.receiveShadow = true
    blob.castShadow = true
    blob.position.copy(boids[count].position)
    blob.rotation.x = 0; blob.rotation.y = 0; blob.rotation.z = 0;
    snowglobe.scene.add(blob);
    count++;
    itr++;
  }
}

loadAsset().then(() => { ASSETS_LOADED = true; })

// Add some lights!
setupLights(snowglobe.scene, snowglobe)
genBgLights(snowglobe.scene)
//generateSnowParticles(snowglobe.scene)
generateGlobeAndGround(snowglobe)
//generateSnowParticles(snowglobe.scene)
snowglobe.params.timeOfDay = 18.431

/*
Tree and Snow
*/
// snowglobe.scene.fog = new THREE.FogExp2(2237993,.0015);
const NUM_TREES = 5;
const SNOW_COUNT = 300;

let treesAdded = false
var pivotContainer
let starMaterial
let starPointLight
function generateTrees() {
  // MAIN TREE w/ STAR
  const textureLoader = new THREE.TextureLoader();
  // const treeMaterial = new THREE.MeshStandardMaterial({ map: treeTexture, color: new THREE.Color(0x007B0A), roughness: 0.5 });
  snowglobe.scene.add(genTree(snowglobe, 1, 14, 0.5, 0, 0, 1, { bigTree: true }));
  const starGeometry = genStar(5, 10); // Function to create star geometry
  starMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const star = new THREE.Mesh(starGeometry, starMaterial);
  star.scale.set(0.03, 0.03, 0.03);
  star.rotation.z += 0.3;

  var pivotPoint = new THREE.Vector3(0.5, 0.1, -0.05);
  pivotContainer = new THREE.Object3D();
  pivotContainer.add(star);
  pivotContainer.position.copy(pivotPoint);
  snowglobe.scene.add(pivotContainer);

  // light
  starPointLight = new THREE.PointLight(0xfffff, 1.0)
  // pointLight.color.setRGB(Math.cos(intensity*5)*0.5, Math.cos(intensity*5)*0.5, Math.sin(intensity*2)*0.5);
  starPointLight.position.set(star.position.x, 0, star.position.z)
  starPointLight.distance = 0
  starPointLight.castShadow = false
  snowglobe.scene.add(starPointLight)
  snowglobe.glowObjs.push(starPointLight)

  // Randomly scattered trees
  var tree, newPosition;
  let treeCount = 0
  while (treeCount < NUM_TREES) {
    var tmp = getRand();
    if (i / NUM_TREES > 0.80) {
      tree = genTree(snowglobe, 2, 14, tmp.x, 0, tmp.z, 0.8);
      if (!tree) continue
      newPosition = new THREE.Vector3(0, -1, 0);
      tree.position.copy(newPosition);
    }
    else if (i / NUM_TREES > 0.4) {
      tree = genTree(snowglobe, 3, 14, tmp.x, 0, tmp.z, 1.2);
      if (!tree) continue
      newPosition = new THREE.Vector3(0, -1.5, 0);
      tree.position.copy(newPosition);
    }
    else {
      tree = genTree(snowglobe, 5, 14, tmp.x, 0, tmp.z, 0.8);
      if (!tree) continue
      newPosition = new THREE.Vector3(0, -1.5, 0);
      tree.position.copy(newPosition);
    }
    treeCount += 1
    snowglobe.scene.add(tree);
  }
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
  if (rot === 0) rotationalVelocity = new THREE.Vector3(rand(-30,30),0,0)
  else if (rot === 1) rotationalVelocity = new THREE.Vector3(0,rand(-30,30),0)
  else rotationalVelocity = new THREE.Vector3(0,0,rand(-30,30))
  rotationalVelocities.push(rotationalVelocity);
  snow.add(lineObject);
}
snowglobe.scene.add(snow);
// Rendering Loop: This is the "paintGL" equivalent in three.js
let propsGenerated = false
var genTime = 0
// generateSnowParticles(snowglobe.scene)

const GLOBE_BLOOM = { off: 0, on: 1 }
let globeBloom = GLOBE_BLOOM.off
const isNight = () => snowglobe.params.timeOfDay < 7 || snowglobe.params.timeOfDay > 20

let renderSetup = false
function animate() {
  requestAnimationFrame(animate);
  if (!ASSETS_LOADED) return
  if (!treesAdded) {
    generateTrees()
    treesAdded = true
  }

  if (!propsGenerated) {
    const dogs = spawnProps(snowglobe);
    spawnBoids(dogs)
    // console.log("Spawned Dogs!")
    propsGenerated = true;
  }

  if (treesAdded && propsGenerated && !renderSetup) {
    setupBloomRendering(snowglobe.scene, camera, snowglobe.renderer)
    renderSetup = true
  }

  // Turn the lights off at night
  if (isNight() && globeBloom == GLOBE_BLOOM.off) {
    for (const obj of snowglobe.glowObjs) { enableGlow(obj) }
    globeBloom = GLOBE_BLOOM.on
  } else if (!isNight() && globeBloom == GLOBE_BLOOM.on) {
    for (const obj of snowglobe.glowObjs) { disableGlow(obj) }
    globeBloom = GLOBE_BLOOM.off
  }

  cameraPan.update()

  for (var i = 0, n = blobs.length; i < n; i++) {
    boid = boids[i];
    boid.move(boids, snowglobe.params);
    blob = blobs[i]; blob.position.copy(boids[i].position);

    var mat = blob.matrix
    var transformedDir = boid.direction.applyMatrix4(mat)

    blob.lookAt(new THREE.Vector3(-transformedDir.x * 0.1, -2, transformedDir.z * 0.1))
    blob.rotateY(Math.PI)
  }

  //moveSnowParticles(snowglobe.params)
  // new particle movement
  for (var i = 0; i < snow.children.length; i++) {
    if (snow.children[i].position.y * snow.children[i].position.y + snow.children[i].position.x * snow.children[i].position.x
      + snow.children[i].position.z * snow.children[i].position.z > 30) reSnow(i);
    else {
      var v = velocities[i];
      var rv = rotationalVelocities[i];
      snow.children[i].position.x += v.x / 200;
      snow.children[i].position.y += snowglobe.params.snowSpeed * v.y / 100;
      snow.children[i].position.z += v.z / 200;

      snow.children[i].rotation.x += rv.x / 2000;
      snow.children[i].rotation.y += rv.y / 2000;
      snow.children[i].rotation.z += rv.z / 2000;
    }
  }
  moveLights(camera, clock)
  if (treesAdded) {
    pivotContainer.rotation.z += 0.01;
    const time = Date.now() * 0.001;
    const flashSpeed = 0.5;
    const intensity = Math.abs(Math.sin(time * flashSpeed));
    starMaterial.color.setRGB(Math.cos(intensity * 5) * 0.5, Math.cos(intensity * 5) * 0.5, Math.sin(intensity * 2) * 0.5);
    starPointLight.color.setRGB(Math.cos(intensity * 5), Math.cos(intensity * 5), Math.sin(intensity * 2));
  }
  // This function call abstracts away post-processing steps
  if (treesAdded && propsGenerated)
    bloomRender(snowglobe.scene, snowglobe.renderer, effect, camera)

  //auto-run
  if (snowglobe.params.autorun) {
    snowglobe.params.timeOfDay += 0.02
  }
  if (snowglobe.params.timeOfDay > 23.4) snowglobe.params.timeOfDay = 0

  updateLighting(snowglobe)
  if (spacebar_pressed) {
    if (clock.elapsedTime < 0.009 && (snowglobe.params.snowSpeed != 7)) {
      save_speed = snowglobe.params.snowSpeed;
    }
    if (clock.getElapsedTime() < 2) {
      snowglobe.params.snowSpeed = 7
      spacebar_waspressed = true
    }
  }
  //   }
  else {
    if (spacebar_waspressed && (clock2.getElapsedTime() > 2)) {
      snowglobe.params.snowSpeed = save_speed
      clock2.stop()
      spacebar_waspressed = false;
    }
  }


  stats.update()
  if (!snowglobe.params.music) {
    sound.pause()
  } else {
    if (!sound.isPlaying) {
      sound.play()
    }
  }
}
// AUDIO
if (snowglobe.params.music) {
  var listener = new THREE.AudioListener();
  camera.add(listener);

  var sound = new THREE.Audio(listener);
  var audioLoader = new THREE.AudioLoader();
  var isAudioLoaded = false;
  var isAudioPlaying = false;

  function loadAudio() {
    audioLoader.load('./assets/song.mp3', function (buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.2);
      sound.stop()
      if (!sound.isPlaying) {
      sound.play()
      }
      isAudioLoaded = true;
    });
  }
loadAudio();
animate();
var save_speed = 100;

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  snowglobe.renderer.setSize(window.innerWidth, window.innerHeight);
}

var spacebar_pressed = false;
var spacebar_waspressed = false;
document.addEventListener("keydown", function (event) {
  if (event.keyCode == 32) {
    spacebar_pressed = true;
    clock.start()
  };
});

var clock2 = new THREE.Clock()
document.addEventListener("keyup", function (event) {
  if (event.keyCode == 32) {
    spacebar_pressed = false;
    clock.stop()
    clock2.start()
  };
});

// const listener = new THREE.AudioListener();
// camera.add( listener );

// // create a global audio source
// const sound = new THREE.Audio( listener );
// sound.hasPlaybackControl = true

// // load a sound and set it as the Audio object's buffer
// const audioLoader = new THREE.AudioLoader();
// audioLoader.load( 'assets/song.mp3', function( buffer ) {
// 	sound.setBuffer( buffer );
// 	sound.setLoop( true );
// 	sound.setVolume( 0.2 );
// 	sound.pause();
// });

  // function playAudio() {
  //   if (isAudioLoaded && !isAudioPlaying) {
  //     sound.play();
  //     isAudioPlaying = true;
  //   }
  // }
//   // snowglobe.scene.addEventListener('click', playAudio);
}
