import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

function subtract(a,b) {
    return new Array(a[0]-b[0], a[1]-b[1])
}

function dot(a,b) {
    return a[0]*b[0] + a[1]*b[1]
}

const ease = (alpha) => 3*alpha*alpha - 2*alpha*alpha*alpha
const interpolate = (a,b,alpha)=>a+ease(alpha)*(b-a)
const LOOKUP_SIZE = 1024
class Perlin {
    grid
    m
    n

    constructor(m,n,freqs=[1]) {
        this.m = m
        this.n = n

        this.grid = new Array(LOOKUP_SIZE)
        this.freqs = freqs
        for (let i=0; i<this.grid.length; i++) {
            const randV = new Array(2)
            randV[0] = Math.random()
            randV[1] = Math.random()
            const sum = randV[0] + randV[1]
            randV[0] /= sum
            randV[1] /= sum
            this.grid[i] = randV
        }
    }

    getRandomVec2 = (col, row) => {
        const v = this.grid[(row*13 + col*23) % LOOKUP_SIZE]
        return v
    }
    
    computeIntensity = (x,z) => {
        const scaledX = x*this.n; const scaledZ = z*this.m;
        const col = Math.floor(scaledX)
        const row = Math.floor(scaledZ)

        const offset1 = subtract([col, row], [scaledX,scaledZ])
        const offset2 = subtract([col, row+1], [scaledX,scaledZ])
        const offset3 = subtract([col+1, row], [scaledX,scaledZ])
        const offset4 = subtract([col+1, row+1], [scaledX,scaledZ])

        const v1 = dot(this.getRandomVec2(col, row), offset1)
        const v2 = dot(this.getRandomVec2(col, row+1), offset2)
        const v3 = dot(this.getRandomVec2(col+1, row), offset3)
        const v4 = dot(this.getRandomVec2(col+1, row+1), offset4)

        const u1 = interpolate(v1, v2, 0.5)
        const u2 = interpolate(v3, v4, 0.5)


        return interpolate(u1,u2, 0.5)
    }

    // Takes in NORMALIZED coordinates in [0,1) and computes the height
    getHeight = (x,z) => {
        let acc = 0
        for (const freq of this.freqs) {
            acc += this.computeIntensity(x*freq,z*freq)/freq
        }
        return acc
    }

    getPosition = (x,z) => {
        const p = [x, this.getHeight(x,z), z]
        return p
    }
}

function addVertexToArr(v, a) {
    a.push(v[0]); a.push(v[1]); a.push(v[2])
}

export function CircularPerlinMesh(size, res) {
    const perlin = new Perlin(res, res, [8,16,32])
    // const gridSize = res / radius
    let vertices = []
    let indices = []
    const center = res/2
    for (let i=0; i<res; i++) {
        for (let j=0; j<res; j++) {
            const x1 = j; const x2 = x1+1
            const z1 = i; const z2 = z1 + 1
            // Only generate within a circle 
            if ((x1 - center) * (x1 - center) + (z1 - center) * (z1 - center) > center * center
                || (x2 - center) * (x2 - center) + (z2 - center) * (z2 - center) > center * center)
            continue
            
            const p1 = perlin.getPosition(x1/res,z1/res)
            const p2 = perlin.getPosition(x1/res,z2/res)
            const p3 = perlin.getPosition(x2/res,z1/res)
            const p4 = perlin.getPosition(x2/res,z2/res)

            addVertexToArr(p1, vertices); addVertexToArr(p2, vertices); addVertexToArr(p3, vertices);
            addVertexToArr(p3, vertices); addVertexToArr(p2, vertices); addVertexToArr(p4, vertices);

            indices.push(x1 * res + z1); indices.push(x1 * res + z2); indices.push(x2 * res + z1);
            indices.push(x2 * res + z1); indices.push(x1 * res + z2); indices.push(x2 * res + z2);
        }
    }
    

    vertices = new Float32Array(vertices)
    const fiveTone = new THREE.TextureLoader().load('../assets/ToonShadingGradientMaps/fiveTone.jpg')
    fiveTone.minFilter = THREE.NearestFilter
    fiveTone.magFilter = THREE.NearestFilter
    const snowToonMaterial = new THREE.MeshToonMaterial({ color: "rgb(230, 225, 223)", gradientMap: fiveTone })

    let geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    geom.deleteAttribute("normal")
    geom = BufferGeometryUtils.mergeVertices(geom);
    geom.computeVertexNormals()

    const mesh = new THREE.Mesh(geom, snowToonMaterial)
    mesh.scale.set(size,size,size)
    return mesh
}