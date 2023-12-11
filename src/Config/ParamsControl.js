// This is a pre-made GUI object from three.js!
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'

let parameters = { 
    timeOfDay: 18.432, 
    autorun: false,
    snowSpeed: 1,
    music: true
 }

export function setupControlPanel(snowglobe) { 
    const gui = new GUI()
    // gui.add(parameters, 'Parameter1')
    // const paramGroup1 = gui.addFolder("Parameter Group 1")
    // paramGroup1.add(parameters, "Parameter2", 0.0, 100.0)
    // paramGroup1.add(parameters, "Parameter3")

    gui.add(parameters, 'timeOfDay', 0, 24)
    gui.add(parameters, 'autorun')
    gui.add(parameters, 'snowSpeed', 0.5, 3)
    gui.add(parameters, 'music')

    // gui.add(parameters, 'zoom', 0.025, 2)

    snowglobe.params = parameters
    gui.close()
    snowglobe.gui = gui
    console.log(gui)
}
export function updateParams(params) {
    parameters = params;
}