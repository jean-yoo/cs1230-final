import * as THREE from 'three'

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

export function genTree(snowglobe, scale, branches, DELTAX, DELTAY, DELTAZ, skin) {
    var branchesParent = new THREE.Object3D();

    var x = 0, y = 0;
    const textureLoader = new THREE.TextureLoader();
    const treeTexture = textureLoader.load('../pineTexture.jpg');
    const treeMaterial = new THREE.MeshStandardMaterial({ map: treeTexture, color: new THREE.Color(0x007B0A), roughness: 0.5});
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

export function plotSnow(snow1) {
  // q1
snow1.moveTo(0, 0);
snow1.lineTo(0.6, 0);
snow1.moveTo(0.8, -0.2);
snow1.lineTo(0.6, 0);
snow1.moveTo(0.8, 0.2);
snow1.lineTo(0.6, 0);
snow1.moveTo(0.4, 0);
snow1.lineTo(0.6, 0.2);
snow1.moveTo(0.4, 0);
snow1.lineTo(0.6, -0.2);
snow1.moveTo(0.4, 0.2);
snow1.lineTo(0.2, 0.2);
snow1.moveTo(0.2, 0.2);
snow1.lineTo(0.2, 0.4);
snow1.moveTo(0, 0);
snow1.lineTo(0.4, 0.4);
snow1.moveTo(0.4, 0.4);
snow1.lineTo(0.6, 0.4);
snow1.moveTo(0.4, 0.4);
snow1.lineTo(0.4, 0.6);
snow1.moveTo(0, 0);
snow1.lineTo(0, 0.4);
snow1.lineTo(0.2, 0.6);
snow1.moveTo(0.2, 0.8);
snow1.lineTo(0, 0.6);
snow1.lineTo(-0.2, 0.8);
snow1.moveTo(0, 0.4);
snow1.lineTo(-0.2, 0.6);

// q2
snow1.moveTo(0, 0);
snow1.lineTo(-0.6, 0);
snow1.moveTo(-0.8, -0.2);
snow1.lineTo(-0.6, 0);
snow1.moveTo(-0.8, 0.2);
snow1.lineTo(-0.6, 0);
snow1.moveTo(-0.4, 0);
snow1.lineTo(-0.6, 0.2);
snow1.moveTo(-0.4, 0);
snow1.lineTo(-0.6, -0.2);
snow1.moveTo(-0.4, 0.2);
snow1.lineTo(-0.2, 0.2);
snow1.moveTo(-0.2, 0.2);
snow1.lineTo(-0.2, 0.4);
snow1.moveTo(0, 0);
snow1.lineTo(-0.4, 0.4);
snow1.moveTo(-0.4, 0.4);
snow1.lineTo(-0.6, 0.4);
snow1.moveTo(-0.4, 0.4);
snow1.lineTo(-0.4, 0.6);
snow1.moveTo(0, 0);
snow1.lineTo(0, 0.4);
snow1.lineTo(-0.2, 0.6);
snow1.moveTo(-0.2, 0.8);
snow1.lineTo(0, 0.6);
snow1.lineTo(-0.2, 0.8);
snow1.moveTo(0, 0.4);
snow1.lineTo(-0.2, 0.6);

// q3
snow1.moveTo(0, 0);
snow1.lineTo(-0.6, 0);
snow1.moveTo(-0.8, -0.2);
snow1.lineTo(-0.6, 0);
snow1.moveTo(-0.8, -0.2);
snow1.lineTo(-0.6, 0);
snow1.moveTo(-0.4, 0);
snow1.lineTo(-0.6, -0.2);
snow1.moveTo(-0.4, 0);
snow1.lineTo(-0.6, -0.2);
snow1.moveTo(-0.4, -0.2);
snow1.lineTo(-0.2, -0.2);
snow1.moveTo(-0.2, -0.2);
snow1.lineTo(-0.2, -0.4);
snow1.moveTo(0, 0);
snow1.lineTo(-0.4, -0.4);
snow1.moveTo(-0.4, -0.4);
snow1.lineTo(-0.6, -0.4);
snow1.moveTo(-0.4, -0.4);
snow1.lineTo(-0.4, -0.6);
snow1.moveTo(0, 0);
snow1.lineTo(0, -0.4);
snow1.lineTo(-0.2, -0.6);
snow1.moveTo(-0.2, -0.8);
snow1.lineTo(0, -0.6);
snow1.lineTo(-0.2, -0.8);
snow1.moveTo(0, 0.4);
snow1.lineTo(-0.2, -0.6);

// q4
snow1.moveTo(0, 0);
snow1.lineTo(0.6, 0);
snow1.moveTo(0.8, -0.2);
snow1.lineTo(0.6, 0);
snow1.moveTo(0.8, -0.2);
snow1.lineTo(0.6, 0);
snow1.moveTo(0.4, 0);
snow1.lineTo(0.6, -0.2);
snow1.moveTo(0.4, 0);
snow1.lineTo(0.6, -0.2);
snow1.moveTo(0.4, -0.2);
snow1.lineTo(0.2, -0.2);
snow1.moveTo(0.2, -0.2);
snow1.lineTo(0.2, -0.4);
snow1.moveTo(0, 0);
snow1.lineTo(0.4, -0.4);
snow1.moveTo(0.4, -0.4);
snow1.lineTo(0.6, -0.4);
snow1.moveTo(0.4, -0.4);
snow1.lineTo(0.4, -0.6);
snow1.moveTo(0, 0);
snow1.lineTo(0, -0.4);
snow1.lineTo(0.2, -0.6);
snow1.moveTo(0.2, -0.8);
snow1.lineTo(0, -0.6);
snow1.lineTo(-0.2, -0.8);
snow1.moveTo(0, 0.4);
snow1.lineTo(-0.2, -0.6);

}