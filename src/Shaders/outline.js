

export const outlineShader = {
    vert: `
        uniform float GRID_SIZE;
        uniform float thickness;
        void main() {
            vec3 extrudeP = position + thickness*GRID_SIZE*normal;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(extrudeP, 1.0 );
        }`,
    frag: `
        void main() {
            gl_FragColor = vec4(0,0,0,1);
        }`
}