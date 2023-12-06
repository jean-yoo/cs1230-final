import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const loader = new GLTFLoader()
var radius = 4 // number of blocks for the FLOOR
var height = 4 // number of blocks for anything above the floor
var sideLen = 2*radius + 1
var grid = new Array(Math.pow(2*radius+1, 2)*height) // corresponding to x, y, and z
for (let i = 0; i < grid.length; i++) grid[i] = -1;
const GRID_SIZE = 0.1

const BLOCKTYPE = { 
    NONE:-1, 
    BRICK_BLOCK: 0, 
    SNOW_FULL_HEIGHT: 1,
    CHURCH: 2,
    LAMP: 3
}

function getIdx(i, j, k) {
    return i + j*height + k*height*sideLen
}

function posToIdx(pos) {
    const i = (pos.x+radius*GRID_SIZE) / GRID_SIZE
    const j = pos.y / GRID_SIZE
    const k = (pos.z+radius*GRID_SIZE) / GRID_SIZE
    return getIdx(i,j,k)
}

function idxToPos(i, j, k) {
    let unscaled = new THREE.Vector3(i - radius, j, k - radius);
    return unscaled.multiplyScalar(GRID_SIZE)
}

function translate(obj, dx, dy, dz) {
    obj.translateX(dx); obj.translateY(dy); obj.translateZ(dz);
}

let OBJ_DICT = {}
let WFC_OBJ_DICT = {}
function loadAssetHelper(path, objName) {
    return loader.loadAsync(path)
        .then(gltf => { return gltf.scene })
        .then(object => {
            object.scale.set(GRID_SIZE,GRID_SIZE,GRID_SIZE)
            OBJ_DICT[objName] = { obj: object, type:BLOCKTYPE[objName] }
    })
}

function loadWFCAssetHelper(path, objName, transforms) {
    return loader.loadAsync(path)
        .then(gltf => { return gltf.scene })
        .then(object => {
            object.scale.set(GRID_SIZE,GRID_SIZE,GRID_SIZE)
            WFC_OBJ_DICT[objName] = { obj: object, type:BLOCKTYPE[objName], transforms:transforms }
    })
}
function spawnBlock(scene, prototype, idx) {
    const pos = idxToPos(idx[0], idx[1], idx[2])
    const blockClone = prototype.obj.clone()
    blockClone.position.set(pos.x, pos.y, pos.z)
    scene.add(blockClone)
    grid[getIdx(idx[0], idx[1], idx[2])] = prototype.type
    return blockClone
}

export async function loadAsset() {
    await loadAssetHelper('../assets/brick_block.gltf', "BRICK_BLOCK")
    await loadAssetHelper('../assets/snow_full_height.gltf', "SNOW_FULL_HEIGHT")
    await loadAssetHelper('../assets/house_small.gltf', "HOUSE_SMALL")
    await loadAssetHelper('../assets/snowman_derpy.gltf', "SNOWMAN_DERPY")
    await loadAssetHelper('../assets/church.gltf', "CHURCH")
    await loadAssetHelper('../assets/lamp.gltf', "LAMP")
    
    const threeTone = new THREE.TextureLoader().load('../assets/ToonShadingGradientMaps/threeTone.jpg')
    threeTone.minFilter = THREE.NearestFilter
    threeTone.magFilter = THREE.NearestFilter
    
    const hatToonMaterial = new THREE.MeshToonMaterial({ color: 0x2FC5FF, gradientMap:threeTone })
    const snowToonMaterial = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap:threeTone })
    
    OBJ_DICT["SNOW_FULL_HEIGHT"].obj.children[0].material = snowToonMaterial

    for (const child of OBJ_DICT["SNOWMAN_DERPY"].obj.children) {
        if (child.name.includes("Snow")) {
            child.material = snowToonMaterial
        } else if (child.name.includes("Hat")) {
            child.material = hatToonMaterial
        }
    }

    OBJ_DICT["LAMP"].obj.children[2].layers.toggle(1)
    for (const child of OBJ_DICT["LAMP"].obj.children) {
        if (child.name.includes("light")) child.material = new THREE.MeshToonMaterial({color:0xfffff0, gradientMap:threeTone})
        else child.material = new THREE.MeshToonMaterial({color:0x000000, gradientMap:threeTone})
    }
}

let NUM_WFC_BLOCKS = 0
export async function loadWFCAsset() {
    await loadWFCAssetHelper("../assets/door_block.gltf", "DOOR_BLOCK", [])
    await loadWFCAssetHelper("../assets/window_block.gltf", "WINDOW_BLOCK", ['ry'])

    for (const obj in WFC_OBJ_DICT) {
        NUM_WFC_BLOCKS += 1 + WFC_OBJ_DICT[obj].transforms.length
    }
    return NUM_WFC_BLOCKS
}

export function initializeWFC(scene) {
    spawnBlock(scene, OBJ_DICT["SNOW_FULL_HEIGHT"], [0,0,1])
    spawnBlock(scene, OBJ_DICT["BRICK_BLOCK"], [0,0,0])
    spawnBlock(scene, OBJ_DICT["BRICK_BLOCK"], [1,0,0])
    spawnBlock(scene, OBJ_DICT["SNOW_FULL_HEIGHT"], [1,0,1])
    spawnFloor(scene)
}

function unif(n) {
    return new Array(NUM_WFC_BLOCKS).fill(1/n)
}
const size = 3
const wfcH = 2
let m_pmf = new Array(size * size * wfcH)
export function initializePMF() {
    console.log("NUM WFC BLOCKS AT INITIALIZATION:", NUM_WFC_BLOCKS)
    
    for (let i = 0; i < m_pmf.length; i++) m_pmf[i] = unif(NUM_WFC_BLOCKS)
    collapse(m_pmf[1 + 0 * wfcH + 1 * size * wfcH])
}

function normalize(pmf) {
    let sum = 0
    let newPmf = new Array(pmf.length)
    for (const p of pmf) sum += p
    for (let i = 0; i < pmf.length; i++) pmf[i] = pmf[i] / sum
}

function collapse(pmf) {
    let acc = Math.random()
    for (let i = 0; i < pmf.length; i++) {
        acc -= pmf[i]
        if (acc < 0) {
            pmf.fill(0)
            pmf[i] = 1
            return i
        }
    }

    // In the case that the pmf sums up to 1
    const randIdx = Math.floor(pmf.length * Math.random())
    pmf.fill(0)
    pmf[randIdx] = 1
    return randIdx
}
let churchSpawned = false
function spawnFloor(scene) {
    for (let i = 0; i<2*radius+1; i++) 
        for (let k = 0; k < 2 * radius + 1; k++) {
            const blockType = grid[getIdx(i, 0, k)]
            if (blockType != BLOCKTYPE.NONE) continue; // if a block already is present, skip
            else {
                if (Math.random()> 0.7) spawnBlock(scene, OBJ_DICT["SNOW_FULL_HEIGHT"], [i,0,k])
                else spawnBlock(scene, OBJ_DICT["BRICK_BLOCK"], [i, 0, k])
            }  
        }

        for (let i = 0; i<2*radius+1; i++) 
            for (let k = 0; k < 2 * radius + 1; k++) {
                const groundBlockType = grid[getIdx(i, 0, k)]
                if (groundBlockType == BLOCKTYPE.BRICK_BLOCK && Math.random()>0.9) {
                    spawnBlock(scene, OBJ_DICT["HOUSE_SMALL"], [i,1,k])
                } else if (groundBlockType == BLOCKTYPE.BRICK_BLOCK && Math.random() > 0.95 && !churchSpawned) {
                    spawnBlock(scene, OBJ_DICT["CHURCH"], [i, 1, k])
                    churchSpawned = true
                } else if (groundBlockType == BLOCKTYPE.SNOW_FULL_HEIGHT) {
                    if (Math.random() > 0.8) {
                        const snowman = spawnBlock(scene, OBJ_DICT["SNOWMAN_DERPY"], [i, 1, k])
                        snowman.rotation.y += Math.random() * 2 * Math.PI
                    } else if (Math.random() > 0.9) {
                        const lamp = spawnBlock(scene, OBJ_DICT["LAMP"], [i,1,k])
                    }
                }
            }
}