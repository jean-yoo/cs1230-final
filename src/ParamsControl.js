// This is a pre-made GUI object from three.js!
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'

const parameters = { Parameter1: true, Parameter2: 2, Parameter3: 3.1415 }

export function setupControlPanel() { 
    const gui = new GUI()
    gui.add(parameters, 'Parameter1')
    const paramGroup1 = gui.addFolder("Parameter Group 1")
    paramGroup1.add(parameters, "Parameter2", 0.0, 100.0)
    paramGroup1.add(parameters, "Parameter3")
}