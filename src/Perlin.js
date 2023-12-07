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
const LOOKUP_SIZE = 2048
class Perlin {
    grid
    m
    n

    constructor(m,n,freqs=[1]) {
        this.m = m
        this.n = n
        this.grid = new Array(m*n)
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
        // console.log( Math.floor(i*7 + j*11) )
        // const idx = Math.abs(Math.floor(i*7 + j*11)) % LOOKUP_SIZE
        // console.log(col,row)
        const v = this.grid[(row%this.m)*this.m + col%this.n]
        // console.log(v)
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
        // console.log("v2", v2)
        const u1 = interpolate(v1, v2, 0.5)
        const u2 = interpolate(v3, v4, 0.5)
        // console.log("u2", u2)

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
    const perlin = new Perlin(res, res, [4,8])
    // const gridSize = res / radius
    let vertices = []
    for (let i=0; i<res; i++) {
        for (let j=0; j<res; j++) {
            const x1 = j; const x2 = x1+1
            const z1 = i; const z2 = z1+1

            const p1 = perlin.getPosition(x1/res,z1/res)
            const p2 = perlin.getPosition(x1/res,z2/res)
            const p3 = perlin.getPosition(x2/res,z1/res)
            const p4 = perlin.getPosition(x2/res,z2/res)

            addVertexToArr(p1, vertices); addVertexToArr(p2, vertices); addVertexToArr(p3, vertices);
            addVertexToArr(p3, vertices); addVertexToArr(p2, vertices); addVertexToArr(p4, vertices);
        }
    }
    
    // const mat = new THREE.MeshBasicMaterial({color: 0xffffff})
    // const sphereGeom = new THREE.SphereGeometry(0.01)
    // let points = []
    // for (let i=0; i<vertices.length; i+=3) {
    //     const x = vertices[i]; const y = vertices[i+1]; const z = vertices[i+2];
    //     const v = new THREE.Mesh(sphereGeom, mat)
    //     v.position.set(x,y,z)
    //     points.push(v)
    // }
    // console.log(vertices)
    vertices = new Float32Array(vertices)
    const fiveTone = new THREE.TextureLoader().load('../assets/ToonShadingGradientMaps/fiveTone.jpg')
    fiveTone.minFilter = THREE.NearestFilter
    fiveTone.magFilter = THREE.NearestFilter
    const snowToonMaterial = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: fiveTone })
    // const mat = new THREE.MeshPhongMaterial({color:0xffffff})
    const geom = new THREE.BufferGeometry()
    geom.computeVertexNormals()
    geom.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) )

    const mergeGeom = BufferGeometryUtils.mergeVertices(geom, 0.25);
    mergeGeom.computeVertexNormals(true);

    const mesh = new THREE.Mesh(mergeGeom, snowToonMaterial)
    mesh.scale.set(size,size,size)
    return mesh
}