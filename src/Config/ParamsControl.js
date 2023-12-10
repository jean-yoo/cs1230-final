// This is a pre-made GUI object from three.js!
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'

let parameters = { 
    timeOfDay: 18.432, 
    autorun: false
 }

export function setupControlPanel(snowglobe) { 
    const gui = new GUI()
    // gui.add(parameters, 'Parameter1')
    // const paramGroup1 = gui.addFolder("Parameter Group 1")
    // paramGroup1.add(parameters, "Parameter2", 0.0, 100.0)
    // paramGroup1.add(parameters, "Parameter3")

    gui.add(parameters, 'timeOfDay', 0, 24)
    gui.add(parameters, 'autorun')

    // gui.add(parameters, 'dirLightIntensity', 0, 2)

    // gui.add(parameters, 'zoom', 0.025, 2)

    snowglobe.params = parameters
    snowglobe.gui = gui
    console.log(gui)
}
export function updateParams(params) {
    parameters = params;
}