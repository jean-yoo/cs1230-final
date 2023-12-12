/* Add all the light sources in here */
import * as THREE from 'three'
let dirLight

export function setupLights(scene, snowglobe) {
    prevTimeOfDay = snowglobe.params.timeOfDay

    snowglobe.renderer.shadowMap.enabled = true
    snowglobe.renderer.shadowMap.type = THREE.PCFSoftShadowMap


    dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.layers.enable(0)
    dirLight.layers.enable(1)
    dirLight.castShadow = true
    
    scene.add(dirLight)


    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 2 );
    hemiLight.color.setHSL( 0.6, 1, 0.6 );
    hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    hemiLight.position.set( 0, 50, 0 );
    scene.add( hemiLight );

    

    const pointLight1 = new THREE.PointLight(0xffffff, 1, 100);
    pointLight1.position.set(0,0,1);
    scene.add(pointLight1);

 

    const ambient = new THREE.AmbientLight(0x404040, 1); // soft white light
    scene.add(ambient)
}
let prevTimeOfDay = 0
export function updateLighting(snowglobe) {
if (prevTimeOfDay !== snowglobe.params.timeOfDay) {
    prevTimeOfDay = snowglobe.params.timeOfDay
    updateTimeOfDay(snowglobe)
    }
}


const nightColor = new THREE.Color('#171324')
const dayColor = new THREE.Color('#53acff')
const duskColor = new THREE.Color('#ff9626')
function updateTimeOfDay(snowglobe) {
  const hour = snowglobe.params.timeOfDay
  const angle = (Math.PI * (hour + 0.5)) / 13 
  const sint = Math.sin(angle)
  const cost = Math.cos(angle)
  const dayness = THREE.MathUtils.smoothstep(hour, 4, 8) * (1 - THREE.MathUtils.smoothstep(hour, 19, 20))
  const duskness = THREE.MathUtils.smoothstep(hour, 18, 19) * (1 - THREE.MathUtils.smoothstep(hour, 19.25, 20.75))
  dirLight.position.set(sint + 0.5 - 1.5, 0.5 - cost, -sint - 0.5 - 1.5)

  snowglobe.params.dirLightIntensity = THREE.MathUtils.mapLinear(
    dirLight.position.y + duskness,
    -0.5,
    3,
    0,
    1.25
  )
  dirLight.intensity = snowglobe.params.dirLightIntensity
  const color1 = new THREE.Color(); 

  snowglobe.scene.background.set(color1.lerpColors(nightColor, dayColor, dayness))
  snowglobe.scene.background.set(color1.lerp(duskColor, duskness))


}
