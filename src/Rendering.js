import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import {OutlinePass} from 'three/examples/jsm/postprocessing/OutlinePass' 
import { vertexShader } from './Shaders/vertex';
import { fragmentShader } from './Shaders/frag';
import { BG_COLOR } from './Config/Config'

const BLOOM_SCENE = 1;
const BLOOM_STRENGTH = 0.6
const BLOOM_RADIUS = 0.4
const BLOOM_THRESHOLD = 0.0

export const BLOOM_LAYER = new THREE.Layers();
BLOOM_LAYER.set(BLOOM_SCENE);
const DARK_MATERIAL = new THREE.MeshBasicMaterial({ color: 'black' });
const TRANSPARENT_MATERIAL = new THREE.MeshBasicMaterial({transparent:true, opacity:0})
let materials = {}

let bloomComposer;
let combineComposer;
export function setupBloomRendering(scene, camera, renderer) {
    bloomComposer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innverWidth, window.innerHeight),
        BLOOM_STRENGTH,
        BLOOM_RADIUS,
        BLOOM_THRESHOLD)
    bloomComposer.addPass(renderPass)
    bloomComposer.addPass(bloomPass)
    bloomComposer.renderToScreen = false;

    combineComposer = new EffectComposer(renderer)
    const combinePass = new ShaderPass(
        new THREE.ShaderMaterial({
            uniforms: {
                baseTexture: { value: null },
                bloomTexture: { value: bloomComposer.renderTarget2.texture }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        }), "baseTexture")
    const outputPass = new OutputPass()
    combineComposer.addPass(renderPass)
    combineComposer.addPass(combinePass)
    combineComposer.addPass(outputPass)
}

function eraseNonBloomObj(obj) {
    if (obj.isMesh && !BLOOM_LAYER.test(obj.layers)) {
        materials[obj.uuid] = obj.material
        if (obj.name == "SNOW_SPHERE") obj.material = TRANSPARENT_MATERIAL
        else obj.material = DARK_MATERIAL
    }
}

function restoreNonBloomObj(obj) {
    if (materials[obj.uuid]) {
        obj.material = materials[obj.uuid]
    }
}

export function bloomRender(scene, effect, camera) {

    // Darken all non-bloom objects
    scene.traverse(eraseNonBloomObj)
    scene.background = BG_COLOR.BLOOM_ON
    bloomComposer.render() // render them

    // restore everything 
    scene.traverse(restoreNonBloomObj)
    scene.background = BG_COLOR.BLOOM_OFF
    combineComposer.render() // render bloom on top of the original
    effect.render( scene, camera );
}