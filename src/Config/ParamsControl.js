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

    gui.add(parameters, 'timeOfDay', 0, 24)
    gui.add(parameters, 'autorun')
    gui.add(parameters, 'snowSpeed', 0.5, 3)
    gui.add(parameters, 'music')

    snowglobe.params = parameters
    gui.close()
    snowglobe.gui = gui
}
export function updateParams(params) {
    parameters = params;
}