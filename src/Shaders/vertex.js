export const vertexShader =  `
    varying vec2 uvCoords;
    void main() {
        uvCoords = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
`