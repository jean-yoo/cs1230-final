import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { vertexShader } from './Shaders/vertex';
import { combineFragShader } from './Shaders/combine';
import { edgeFragShader } from './Shaders/sobel'
import { BG_COLOR } from './Config/Config'

const BLOOM_SCENE = 1;
const EDGE_SCENE = 2;

const BLOOM_STRENGTH = 0.6
const BLOOM_RADIUS = 0.4
const BLOOM_THRESHOLD = 0.0

export const BLOOM_LAYER = new THREE.Layers();
BLOOM_LAYER.set(BLOOM_SCENE);
export const EDGE_LAYER = new THREE.Layers();
EDGE_LAYER.set(EDGE_SCENE);
const DARK_MATERIAL = new THREE.MeshBasicMaterial({ color: 'black' });
const TRANSPARENT_MATERIAL = new THREE.MeshBasicMaterial({transparent:true, opacity:0})
let materials = {}
let lightIntensities = {}

let bloomComposer
let combineComposer
let edgeComposer
let baseComposer
/*
    1) bloomComposer draws everything on the "bloom" layer to an offscreen texture
    2) combineComposerdraws everything in the scene and combine it with the offscreen b
*/
const edgePass = new ShaderPass(
    new THREE.ShaderMaterial({
        uniforms: {
            base: { value: null },
            W: { value: window.innerWidth },
            H: { value: window.innerHeight }
        },
        vertexShader: vertexShader,
        fragmentShader: edgeFragShader
    }), "base")
export function setupMasterRendering(scene, camera, renderer) {
    bloomComposer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        BLOOM_STRENGTH,
        BLOOM_RADIUS,
        BLOOM_THRESHOLD)
    bloomComposer.addPass(renderPass)
    bloomComposer.addPass(bloomPass)
    bloomComposer.renderToScreen = false;

    edgeComposer = new EffectComposer(renderer)

    edgeComposer.addPass(renderPass)
    edgeComposer.addPass(edgePass)
    edgeComposer.renderToScreen = false

    baseComposer = new EffectComposer(renderer)
    baseComposer.addPass(renderPass)
    baseComposer.renderToScreen = false;

    combineComposer = new EffectComposer(renderer)
    const combinePass = new ShaderPass(
        new THREE.ShaderMaterial({
            uniforms: {
                bloomTexture: { value: bloomComposer.renderTarget2.texture },
                // edgeTexture: { value: edgeComposer.renderTarget2.texture },
                baseTexture: { value: baseComposer.renderTarget2.texture }
            },
            vertexShader: vertexShader,
            fragmentShader: combineFragShader
        }))
    const outputPass = new OutputPass()
    combineComposer.addPass(combinePass)
    //combineComposer.addPass(edgePass)
    combineComposer.addPass(outputPass)
}

function eraseNonBloomObj(obj) {
    if (obj.isMesh && !BLOOM_LAYER.test(obj.layers)) {
        materials[obj.uuid] = obj.material
        if (obj.name == "SNOW_SPHERE") obj.material = TRANSPARENT_MATERIAL
        else obj.material = DARK_MATERIAL
    }
}

function restoreObj(obj) {
    if (obj.isMesh && materials[obj.uuid]) {
        obj.material = materials[obj.uuid]
    } else if ((obj.isPointLight || obj.isDirectionalLight) && lightIntensities[obj.uuid]) {
        obj.intensity = lightIntensities[obj.uuid]
    }
}

function eraseNonEdgeObj(obj) {
    materials[obj.uuid] = obj.material
    if (obj.name === "SnowParticle") { obj.material = DARK_MATERIAL }
    if (obj.isMesh && !EDGE_LAYER.test(obj.layers)) { obj.material = TRANSPARENT_MATERIAL }
    else if (obj.isPointLight || obj.isDirectionalLight) {
        lightIntensities[obj.uuid] = obj.intensity
        obj.intensity = 0
    }
}

export function masterRender(scene) {
    baseComposer.render() // Memorize the "base" scene, without bloom or edge

    // Darken all non-bloom objects
    scene.traverse(eraseNonBloomObj)
    const bgColorTemp = scene.background
    scene.background = BG_COLOR.BLOOM_ON
    bloomComposer.render() // render them
    scene.traverse(restoreObj)

    // edgePass.uniforms.c = {value : 0.1}
    // scene.traverse(eraseNonEdgeObj)
    // edgeComposer.render()

    // restore everything 
    scene.traverse(restoreObj)
    scene.background = bgColorTemp
    combineComposer.render() // render bloom on top of the original
}