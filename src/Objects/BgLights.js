/* This file implements the circular moving lights in the background */

import * as THREE from 'three'

const RADIUS = 8
const COL_PARTITIONS = 8
const LIGHTS_PER_COL = 7
const Y_MIN = -5
const Y_MAX = 8
let circObjs = []

// Initialize the lights onto the scene
export function genBgLights(scene) {
    for (let i = 0; i < COL_PARTITIONS; i++) {
        for (let j = 0; j < LIGHTS_PER_COL; j++) {
            const theta = i * 2 * Math.PI / COL_PARTITIONS

            const xThetaInit = theta + THREE.MathUtils.randFloat(-0.3, 0.3)
            const lightX = RADIUS * Math.cos(xThetaInit)

            const lightY = THREE.MathUtils.randFloat(Y_MIN, Y_MAX)

            const zThetaInit = theta + THREE.MathUtils.randFloat(-0.3, 0.3)
            const lightZ = RADIUS * Math.sin(zThetaInit)
            const circGeom = new THREE.SphereGeometry(THREE.MathUtils.randFloat(0.3, 0.6))
            const circMat = new THREE.MeshBasicMaterial({ color: 0xfbe2ba })
            circMat.opacity = THREE.MathUtils.randFloat(0.04, 0.7)
            circMat.transparent = true
            const circle = new THREE.Mesh(circGeom, circMat)
            circle.layers.toggle(1)
            circle.position.set(lightX, lightY, lightZ)
            circObjs.push({ mesh: circle, xTheta: xThetaInit, zTheta:zThetaInit, phase:THREE.MathUtils.randFloat(0, 2*Math.PI)})  
            circle.name = "BG_LIGHT"
            scene.add(circle)
        }
    }
}

// Make the light circles move in an organic way
const THETA_MOVE_SPEED = 0.0005
const Y_MOVE_SPEED_MAX = 0.003
export function moveLights(camera, clock) {
    for (const circObj of circObjs) {
        const circle = circObj.mesh
        const newXTheta = circObj.xTheta + THREE.MathUtils.randFloat(0, THETA_MOVE_SPEED)
        circle.position.x = RADIUS * Math.cos(newXTheta)
        circObj.xTheta = newXTheta
        circle.position.y += THREE.MathUtils.randFloat(0,Y_MOVE_SPEED_MAX) * Math.sin(circObj.phase+clock.getElapsedTime())
        const newZTheta = circObj.zTheta + THREE.MathUtils.randFloat(0, THETA_MOVE_SPEED)
        circle.position.z = RADIUS * Math.sin(newZTheta)
        circObj.zTheta = newZTheta
        circObj.mesh.opacity *= 0
        //console.log(camera.position.distanceTo(circle.position))
        if (Math.abs(camera.position.distanceTo(circle.position)) * 0.1 < 0.8) {
            circle.layers.disable(1)
            if (Math.abs(camera.position.distanceTo(circle.position)) * 0.1 < 0.6) {
            circObj.mesh.visible = false
            } else {
            circle.opacity *= camera.position.distanceTo(circle.position) * 0.001
            }
        } else {
            if (!(circle.layers.isEnabled(1))) {
                circObj.mesh.visible = true
                circle.opacity = THREE.MathUtils.randFloat(0.04, 0.7)
                circle.layers.enable(1)
            }
        }

    }
}
