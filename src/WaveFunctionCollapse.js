import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const loader = new GLTFLoader()
var radius = 3 // number of blocks extending in each direction, given a center block
var grid = new Array(Math.pow(2*radius+1, 3)) // corresponding to x, y, and z
for (let i = 0; i < grid.length; i++) grid[i] = -1;
const GRID_SIZE = 1

const BLOCKTYPE = { NONE:-1, BRICK: 0, SNOW_FULL_HEIGHT: 1 }

function posToIdx(pos) {
    const sideLen = 2*radius + 1
    const i = (pos.x+radius*GRID_SIZE) / GRID_SIZE
    const j = (pos.y+radius*GRID_SIZE) / GRID_SIZE
    const k = (pos.z+radius*GRID_SIZE) / GRID_SIZE
    return i*sideLen + j*sideLen + k
}

function idxToPos(i, j, k) {
    let unscaled = new THREE.Vector3(i - radius, j - radius, k - radius);
    return unscaled.multiplyScalar(GRID_SIZE)
}

function translate(obj, dx, dy, dz) {
    obj.translateX(dx); obj.translateY(dy); obj.translateZ(dz);
}

let OBJ_DICT = {}
// the 'offset' parameter is used to account for the blender transforms
function loadAssetHelper(path, objName, offset) {
    return loader.loadAsync(path)
        .then(gltf => { 
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
                }
              });
            return gltf.scene})
        .then(object => {
            // object.scale.set(GRID_SIZE,GRID_SIZE,GRID_SIZE)
            OBJ_DICT[objName] = { obj: object, type:BLOCKTYPE[objName] }
    })
}

function spawnBlock(scene, prototype, position) {
    const blockClone = prototype.obj.clone()
    blockClone.position.set(position.x, position.y, position.z)
    scene.add(blockClone)
    grid[posToIdx(position)] = prototype.type
}

export async function loadAsset() {
    await loadAssetHelper('../assets/brick_block.gltf', "BRICK_BLOCK", new THREE.Vector3(0, 0, 0.5))
    await loadAssetHelper('../assets/snow_full_height.gltf', "SNOW_FULL_HEIGHT", new THREE.Vector3(-2, 0, 0.5))
    console.log(OBJ_DICT)
    console.log(OBJ_DICT["SNOW_FULL_HEIGHT"].obj.children[1])
}

export function initializeWFC(scene) {
    spawnBlock(scene, OBJ_DICT["SNOW_FULL_HEIGHT"], idxToPos(0,0,1))
    spawnBlock(scene, OBJ_DICT["BRICK_BLOCK"], idxToPos(0, 0, 0))
    spawnBlock(scene, OBJ_DICT["BRICK_BLOCK"], idxToPos(1, 0, 0))
    spawnBlock(scene, OBJ_DICT["SNOW_FULL_HEIGHT"], idxToPos(1,0,1))
    spawnFloor(scene)
}

function spawnFloor(scene) {
    for (let i = 0; i<2*radius+1; i++) {
        for (let k = 0; k < 2 * radius + 1; k++) {
            const blockType = grid[i * (2 * radius + 1) + k * (2 * radius + 1)]
            if (blockType != BLOCKTYPE.NONE) continue; 
            else {
                if (Math.random()>0.7) spawnBlock(scene, OBJ_DICT["SNOW_FULL_HEIGHT"], idxToPos(i, 0, k))
                else spawnBlock(scene, OBJ_DICT["BRICK_BLOCK"], idxToPos(i, 0, k))
            }  
        }
    }
}