import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { outlineShader } from './Shaders/meshoutline'
//import { genTree, genStar, plotSnow, getRand, rand, randi } from './Objects/TreeSnow'
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
    THIRDDOG:0,
    TREE: 7
}

const BOUNDING_RADIUS = {
    HOUSE_SMALL: 1,
    LAMP: 0.2,
    CHURCH: 2,
    SNOWMAN_DERPY: 0.8,
    BASE: 0,
    PRESENTS: 0.2,
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
const OUTLINE_THICKNESS = 0.05
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

export function addMeshOutline(scene, obj) {
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

function showBounds(scene, pos, br) {
    const geometry = new THREE.RingGeometry((br-0.03)*GRID_SIZE, br*GRID_SIZE, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(pos.x, pos.y+0.2, pos.z)
    mesh.rotation.x = Math.PI / 2;
    scene.add(mesh);
}

function spawnBlock(scene, prototype, idx, visualizeBounds = true, ignoreCollision = false, outline = true) {
    const pos = idxToPos(idx[0], idx[1], idx[2])
    const br = BOUNDING_RADIUS[prototype.name]
    if (!ignoreCollision) {if (checkCollision(pos, br)) return }

    if (visualizeBounds) showBounds(scene, pos, br)

    const blockClone = prototype.obj.clone()
    blockClone.position.set(pos.x, pos.y, pos.z)
    scene.add(blockClone)
    if (!ignoreCollision) { collisionBoxes.push({ objType: prototype.type, pos: pos, boundingRadius: br }) }

    return blockClone
}

function spawnBlockPos(scene, prototype, pos, visualizeBounds = true, ignoreCollision = false, outline = true) {
    const br = BOUNDING_RADIUS[prototype.name]
    if (!ignoreCollision) {if (checkCollision(pos, br)) return }

    if (visualizeBounds) {
        showBounds(scene, pos, br)
    }

    const blockClone = prototype.obj.clone()
    blockClone.position.set(pos.x, pos.y, pos.z)
    scene.add(blockClone)

    if (!ignoreCollision) { collisionBoxes.push({ objType: prototype.type, pos: pos, boundingRadius: br }) }
    
    return blockClone
}

const threeTone = new THREE.TextureLoader().load('../assets/ToonShadingGradientMaps/threeTone.jpg')
const fiveTone = new THREE.TextureLoader().load('../assets/ToonShadingGradientMaps/fiveTone.jpg')
threeTone.minFilter = THREE.NearestFilter
threeTone.magFilter = THREE.NearestFilter
fiveTone.minFilter = THREE.NearestFilter
fiveTone.magFilter = THREE.NearestFilter

const hatToonMaterial = new THREE.MeshToonMaterial({ color: 0x2FC5FF, gradientMap: threeTone })
const snowToonMaterial = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: threeTone })
const baseToonMaterial = new THREE.MeshToonMaterial({ color: "rgb(71, 50, 36)", gradientMap: threeTone })
const treeToonMaterial = new THREE.MeshToonMaterial({color: 0x115c25, gradientMap:fiveTone})
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

    OBJ_DICT["SNOW_FULL_HEIGHT"].obj.children[0].material = snowToonMaterial

    for (const child of OBJ_DICT["CHURCH"].obj.children) {
        if (child.name.includes("Snow")) child.material = snowToonMaterial
    }

    for (const child of OBJ_DICT["HOUSE_SMALL"].obj.children) {
        if (child.name.includes("Snow")) child.material = snowToonMaterial
    }
    for (const child of OBJ_DICT["SNOWMAN_DERPY"].obj.children) {
        if (child.name.includes("Snow")) {
            child.material = snowToonMaterial
        } else if (child.name.includes("Hat")) {
            child.material = hatToonMaterial
        }
    }

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
        const dz = pos.z - body.pos.z
        const r2 = dx * dx  + dz * dz 
        const minDist = (body.boundingRadius + br) * GRID_SIZE
        if (r2 < minDist*minDist) { return body }
    }

    return undefined
}

const MAX_CHURCH_COUNT = 1
let churchCount = 0

const MAX_SNOWMAN_COUNT = 2
let snowmanCount = 0

const MAX_HOUSE_SMALL_COUNT = 6
let houseSmallCount = 0

const MAX_LAMP_COUNT = 10
let lampCount = 0

const MAX_PRESENT_COUNT = 10
let presentCount = 0

const MAX_ITR = 20; 
function genMultipleProps(snowglobe, prototype, max, innerRadius, outerRadius, f) {
    let itr = 0
    let count = 0
    while (count < max) {
        if (itr > MAX_ITR) return
        const rand = getRandRange(innerRadius, outerRadius)
        const obj = spawnBlockPos(snowglobe.scene, prototype, new THREE.Vector3(rand.x, -2, rand.z))
        if (obj) { f(obj); count += 1}
        itr += 1    
    }
} 

export function spawnProps(snowglobe) {
    console.log("Spawning Props...")
    const base = spawnBlock(snowglobe.scene, OBJ_DICT["BASE"], [radius, 0, radius], false, true, false)//.rotation.x = -Math.PI;
    if (base) {
        base.rotation.x = -Math.PI
        addMeshOutline(snowglobe.scene, base)
    }
    
    const churchFunc = (church) => {
        for (const child of church.children) {
            if (child.name.includes("Window"))
                snowglobe.glowObjs.push(child)
        }
    }
    genMultipleProps(snowglobe, OBJ_DICT["CHURCH"], MAX_CHURCH_COUNT, 0, 2, churchFunc)

    const houseFunc = (houseSmall) => {
        houseSmall.rotation.y = Math.random() * 2 * Math.PI
        for (const child of houseSmall.children) {
            if (child.name.includes("Window")) {
                snowglobe.glowObjs.push(child)
                break
            }
        }
    }
    genMultipleProps(snowglobe, OBJ_DICT["HOUSE_SMALL"], MAX_HOUSE_SMALL_COUNT, 2, 4, houseFunc)

    const snowmanFunc = (snowman) => {
        snowman.rotation.y = Math.random() * 2 * Math.PI
        snowmanCount += 1
        snowglobe.outlineObjs.push(snowman)
    }
    genMultipleProps(snowglobe, OBJ_DICT["SNOWMAN_DERPY"], MAX_SNOWMAN_COUNT, 0, 4, snowmanFunc)

    const lampFunc = (lamp) => {
        snowglobe.glowObjs.push(lamp.children[2])
        const pointLight = new THREE.PointLight(0xf5bf42, 1.0)
        pointLight.position.set(lamp.position.x, lamp.position.y+0.1, lamp.position.z)
        pointLight.distance = 1.5 * GRID_SIZE
        pointLight.castShadow = false
        pointLight.intensity = 0
        snowglobe.scene.add(pointLight)
        snowglobe.glowObjs.push(pointLight)
    }
    genMultipleProps(snowglobe, OBJ_DICT["LAMP"], MAX_LAMP_COUNT, 1, 4.5, lampFunc)

    const presentFunc = (present) => {
        present.rotation.y = Math.random() * 2 * Math.PI
    }
    genMultipleProps(snowglobe, OBJ_DICT["PRESENTS"], MAX_PRESENT_COUNT, 0, 5, presentFunc)
    return [OBJ_DICT["DOG"], OBJ_DICT["SPOTTY"], OBJ_DICT["THIRDDOG"]]
}

function getRandRange(innerRadius, outerRadius) {
    var randomAngle = Math.random() * 2 * Math.PI;
    var randomRadius = Math.random() * (outerRadius - innerRadius) + innerRadius;
    var x = randomRadius * Math.cos(randomAngle);
    var z = randomRadius * Math.sin(randomAngle);
    
    return { x: x, z: z };
  }

export function getRand() {
    var randomAngle = Math.random() * 2 * Math.PI;
    var randomRadius = Math.random() * (4.8 - 3.0) + 3.0;
    var x = randomRadius * Math.cos(randomAngle);
    var z = randomRadius * Math.sin(randomAngle);
    
    return { x: x, z: z };
  }
  
export function rand(min, max) {
    return Math.random() * (max - min) + min;
}

export function randi(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function genTree(snowglobe, scale, branches, DELTAX, DELTAY, DELTAZ, skin, treeMaterial=treeToonMaterial) {
    var branchesParent = new THREE.Object3D();
    const treePos = new THREE.Vector3(DELTAX, -1.5, DELTAZ)
    if (checkCollision(treePos, 1/scale)) return undefined
    var x = 0, y = 0;
    function addBranch(count, x, y, z, opts) {
        var points2 = [];
        var l;
        for (var i = 0; i < count * 2; i++) {
            if (i % 2 == 1) {
                l = count * 2;
            } else {
                l = count * 4;
            }
            var a = i / count * Math.PI;
            points2.push( new THREE.Vector2(Math.cos(a) * l, Math.sin(a) * l));
        }
        var branchShape = new THREE.Shape(points2);
        var branchGeometry = new THREE.ExtrudeGeometry(branchShape, opts);
        var branchMesh = new THREE.Mesh(branchGeometry, treeMaterial);

        branchMesh.scale.set(1/(90*skin*scale),skin/(90*scale),1/(90*skin*scale));
        if (y == 0) branchMesh.position.set(DELTAX, 0, DELTAZ);
        else branchMesh.position.set(DELTAX, y/(9*scale)+DELTAY, DELTAZ);
        branchMesh.rotation.set(Math.PI / 2, 0,Math.random()*10-1);
        
        branchesParent.add(branchMesh);
    }

    // options
    var options = {
    amount: 2,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelThickness: 3/scale,
    steps: 5,
    depth: 40
    };

    // add 14 branches
    var iBranchCnt = branches;
    for (var i1 = 0; i1 <= iBranchCnt; i1++) {
        addBranch(iBranchCnt + 3 - i1, DELTAX, -branches + i1, DELTAZ, options);
        options.bevelThickness = rand(2.5/scale, 3.5/scale);
        options.bevelSegments = randi(1, 3);
    }
    collisionBoxes.push({objType:BLOCKTYPE.TREE, pos: treePos, boundingRadius: 1/scale })
    showBounds(snowglobe.scene, treePos, 1/scale)
    return branchesParent;
}

export function genStar(innerRadius, outerRadius) {
    const shape = new THREE.Shape();
    for (let i = 0; i < 5; i++) {
    const theta = (i / 5) * Math.PI * 2;
    const x = Math.cos(theta);
    const y = Math.sin(theta);
    if (i === 0) {
        shape.moveTo(x * outerRadius, y * outerRadius);
    } else {
        shape.lineTo(x * outerRadius, y * outerRadius);
    }

    const innerTheta = ((i + 0.5) / 5) * Math.PI * 2;
    shape.lineTo(Math.cos(innerTheta) * innerRadius, Math.sin(innerTheta) * innerRadius);
    }

    const extrudeSettings = {
    steps: 1,
    depth: 5,
    bevelEnabled: false
    };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    return geometry;
}