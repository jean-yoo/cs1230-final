import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { outlineShader } from './Shaders/outline'
import { genTree, genStar, plotSnow, getRand, rand, randi } from './Objects/TreeSnow'
// import { EDGE_LAYER } from './Rendering'

const loader = new GLTFLoader()
var radius = 4 // number of blocks for the FLOOR
var height = 4 // number of blocks for anything above the floor
var sideLen = 2 * radius + 1
var grid = new Array(Math.pow(2 * radius + 1, 2) * height) // corresponding to x, y, and z
for (let i = 0; i < grid.length; i++) grid[i] = -1;
const GRID_SIZE = 0.7

const BLOCKTYPE = {
    NONE: -1,
    BRICK_BLOCK: 0,
    SNOW_FULL_HEIGHT: 1,
    CHURCH: 2,
    LAMP: 3,
    HOUSE_SMALL: 4,
    SNOWMAN_DERPY: 1,
    BASE: 0,
    PRESENTS: 5,
    DOG: 0,
    SPOTTY:0,
    THIRDDOG:0
}

const BOUNDING_RADIUS = {
    HOUSE_SMALL: 1,
    LAMP: 0.5,
    CHURCH: 3,
    SNOWMAN_DERPY: 1,
    BASE: 0,
    PRESENTS: 0.5,
    DOG: 0
}

function getIdx(i, j, k) {
    return i + j * height + k * height * sideLen
}

function posToIdx(pos) {
    const i = (pos.x + radius * GRID_SIZE) / GRID_SIZE
    const j = pos.y / GRID_SIZE
    const k = (pos.z + radius * GRID_SIZE) / GRID_SIZE
    return getIdx(i, j, k)
}

function idxToPos(i, j, k) {
    let unscaled = new THREE.Vector3(i - radius, j - 2/GRID_SIZE, k - radius);
    return unscaled.multiplyScalar(GRID_SIZE)
}

function translate(obj, dx, dy, dz) {
    obj.translateX(dx); obj.translateY(dy); obj.translateZ(dz);
}

let OBJ_DICT = {}
function loadAssetHelper(path, objName) {
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
            object.scale.set(GRID_SIZE, GRID_SIZE, GRID_SIZE)
            OBJ_DICT[objName] = { obj: object, type: BLOCKTYPE[objName], name:objName }
        })
}


let collisionBoxes = []
const OUTLINE_THICKNESS = 0.06
// const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide })
const outlineMaterial = new THREE.ShaderMaterial({
    uniforms: {
        GRID_SIZE: { value: GRID_SIZE },
        thickness: { value: OUTLINE_THICKNESS }
    },
    vertexShader: outlineShader.vert,
    fragmentShader: outlineShader.frag,
    side: THREE.BackSide
})

export function addOutline(scene, obj) {
    const outlineClone = obj.clone()
    if (obj.material)
        obj.material = outlineMaterial
    for (const child of outlineClone.children) { 
        if (child.name.includes("roof")) continue
        child.material = outlineMaterial 
    }
    scene.add(outlineClone)
    return outlineClone
}
function spawnBlock(scene, prototype, idx, visualizeBounds = false, ignoreCollision = false, outline = true) {
    const pos = idxToPos(idx[0], idx[1], idx[2])
    const br = BOUNDING_RADIUS[prototype.name]
    if (!ignoreCollision) {if (checkCollision(pos, br)) return }

    // if (visualizeBounds) {
    //     const geometry = new THREE.RingGeometry((br-0.03)*GRID_SIZE, br*GRID_SIZE, 32);
    //     const material = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    //     const mesh = new THREE.Mesh(geometry, material);
    //     mesh.position.set(pos.x, pos.y+0.2, pos.z)
    //     mesh.rotation.x = Math.PI / 2;
    //     scene.add(mesh);
    // }

    const blockClone = prototype.obj.clone()
    blockClone.position.set(pos.x, pos.y, pos.z)
    scene.add(blockClone)
    // if(outline)
    //     addOutline(scene, blockClone)

    grid[getIdx(idx[0], idx[1], idx[2])] = prototype.type
    if (!ignoreCollision) { collisionBoxes.push({ objType: prototype.type, pos: pos, boundingRadius: br }) }
    
    // const g = new THREE.Group()
    // scene.add(g)
    return blockClone
}

export async function loadAsset() {
    await loadAssetHelper('../assets/snow_full_height.gltf', "SNOW_FULL_HEIGHT")
    await loadAssetHelper('../assets/house_small.gltf', "HOUSE_SMALL")
    await loadAssetHelper('../assets/snowman_derpy.gltf', "SNOWMAN_DERPY")
    await loadAssetHelper('../assets/church.gltf', "CHURCH")
    await loadAssetHelper('../assets/lamp.gltf', "LAMP")
    await loadAssetHelper('../assets/base.gltf', "BASE")
    await loadAssetHelper('../assets/presents.gltf', "PRESENTS")
    await loadAssetHelper('../assets/dog.gltf', "DOG")
    await loadAssetHelper('../assets/spotty.gltf', "SPOTTY")
    await loadAssetHelper('../assets/thirddog.gltf', "THIRDDOG")

    const threeTone = new THREE.TextureLoader().load('../assets/ToonShadingGradientMaps/threeTone.jpg')
    threeTone.minFilter = THREE.NearestFilter
    threeTone.magFilter = THREE.NearestFilter

    const hatToonMaterial = new THREE.MeshToonMaterial({ color: 0x2FC5FF, gradientMap: threeTone })
    const snowToonMaterial = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: threeTone })
    const baseToonMaterial = new THREE.MeshToonMaterial({ color: "rgb(71, 50, 36)", gradientMap: threeTone })

    OBJ_DICT["SNOW_FULL_HEIGHT"].obj.children[0].material = snowToonMaterial

    for (const child of OBJ_DICT["CHURCH"].obj.children) {
        if (child.name.includes("Snow")) child.material = snowToonMaterial
        // else if (child.name.includes("Window")) child.layers.toggle(1)
    }

    for (const child of OBJ_DICT["HOUSE_SMALL"].obj.children) {
        if (child.name.includes("Snow")) child.material = snowToonMaterial
        // else if (child.name.includes("Window")) child.layers.toggle(1)
    }
    for (const child of OBJ_DICT["SNOWMAN_DERPY"].obj.children) {
        if (child.name.includes("Snow")) {
            child.material = snowToonMaterial
        } else if (child.name.includes("Hat")) {
            child.material = hatToonMaterial
        }
    }

    // OBJ_DICT["LAMP"].obj.children[2].layers.toggle(1)
    for (const child of OBJ_DICT["LAMP"].obj.children) {
        if (child.name.includes("light")) child.material = new THREE.MeshToonMaterial({ color: 0xfffff0, gradientMap: threeTone })
        else child.material = new THREE.MeshToonMaterial({ color: 0x000000, gradientMap: threeTone })
    }
    for (const child of OBJ_DICT["BASE"].obj.children) {
        child.material = baseToonMaterial
    }

    return await loadAssetHelper('../assets/brick_block.gltf', "BRICK_BLOCK")
}

export function checkCollision(pos, br) {
    for (const body of collisionBoxes) {
        const dx = pos.x - body.pos.x
        const dy = pos.y - body.pos.y
        const dz = pos.z - body.pos.z
        const r2 = dx * dx  + dz * dz 
        const minDist = (body.boundingRadius + br) * GRID_SIZE
    //     if (body.type == BLOCKTYPE.CHURCH) {
    //     console.log(r2, minDist*minDist)
    // }
    // console.log(body.type)
        if (r2 < minDist*minDist) {return body }
    }

    return undefined
}

let churchSpawned = false
const MAX_SNOWMAN_COUNT = 2
let snowmanCount = 0
export function spawnProps(snowglobe) {
    // console.log(OBJ_DICT)
    // for (let i = 0; i<2*radius+1; i++) 
    //     for (let k = 0; k < 2 * radius + 1; k++) {
    //         const blockType = grid[getIdx(i, 0, k)]
    //         if (blockType != BLOCKTYPE.NONE) continue; // if a block already is present, skip
    //         else {
    //             if (Math.random()> 0.7) spawnBlock(scene, OBJ_DICT["SNOW_FULL_HEIGHT"], [i,0,k])
    //             else spawnBlock(scene, OBJ_DICT["BRICK_BLOCK"], [i, 0, k])
    //         }  
    //     }
    const base = spawnBlock(snowglobe.scene, OBJ_DICT["BASE"], [radius, 0, radius], false, true, false)//.rotation.x = -Math.PI;
    if (base) {
        base.rotation.x = -Math.PI
        // addOutline(snowglobe.scene, base)
    }
    // console.log(snowglobe)
    const randI = Math.floor(radius + 0.15*sideLen*Math.random())
    const randK = Math.floor(radius + 0.15*sideLen*Math.random())
    // if (!churchSpawned) {
    //     const church = spawnBlock(snowglobe.scene, OBJ_DICT["CHURCH"], [randI, 0, randK])
    //     if (church) {
    //         for (const child of church.children) {
    //             if (child.name.includes("Window"))
    //                 snowglobe.glowObjs.push(child)
    //         }
    //         churchSpawned = true
    //         church.rotation.x = 2 * Math.PI
    //         // addOutline(snowglobe.scene, church)
    //     }
    //     console.log(church.isMesh && EDGE_LAYER.test(church.layers))
    // }

    for (let i = 0; i < 2 * radius + 1; i++)
        for (let k = 0; k < 2 * radius + 1; k++) {
            // const groundBlockType = grid[getIdx(i, 0, k)]
            if (Math.random() > 0.8) {
                const houseSmall = spawnBlock(snowglobe.scene, OBJ_DICT["HOUSE_SMALL"], [i, 0, k], BOUNDING_RADIUS["HOUSE_SMALL"])
                if (houseSmall) {
                    houseSmall.rotation.y = Math.random() * 2 * Math.PI
                    for (const child of houseSmall.children) {
                        if (child.name.includes("Window")) {
                            snowglobe.glowObjs.push(child)
                            break
                        }
                    }
                    // addOutline(snowglobe.scene, houseSmall)
                }
            } else if (Math.random() > 0.8 && snowmanCount <= MAX_SNOWMAN_COUNT) {
                const snowman = spawnBlock(snowglobe.scene, OBJ_DICT["SNOWMAN_DERPY"], [i, 0, k], BOUNDING_RADIUS["SNOWMAN_DERPY"])
                if (snowman) {
                    snowman.rotation.y = Math.random() * 2 * Math.PI
                    snowmanCount += 1
                    // addOutline(snowglobe.scene, snowman)
                }
            } else if (Math.random() > 0.8) {
                const lamp = spawnBlock(snowglobe.scene, OBJ_DICT["LAMP"], [i, 0, k], BOUNDING_RADIUS["LAMP"])
                
                if (lamp) {
                    snowglobe.glowObjs.push(lamp.children[2])
                    const pointLight = new THREE.PointLight(0xf5bf42, 1.0)
                    pointLight.position.set(lamp.position.x, lamp.position.y+0.1, lamp.position.z)
                    pointLight.distance = 1.5 * GRID_SIZE
                    pointLight.castShadow = false
                    pointLight.intensity = 0
                    snowglobe.scene.add(pointLight)
                    snowglobe.glowObjs.push(pointLight)
                    // addOutline(snowglobe.scene, lamp)
                }
            } else if ((Math.random() > 0.9)) {
                const present = spawnBlock(snowglobe.scene, OBJ_DICT["PRESENTS"], [i, 0, k], BOUNDING_RADIUS["PRESENTS"])
                if (present) {
                    present.rotation.y = Math.random() * 2 * Math.PI
                    // addOutline(snowglobe.scene, present)
                }
            }
    }
    return [OBJ_DICT["DOG"], OBJ_DICT["SPOTTY"], OBJ_DICT["THIRDDOG"]]
}