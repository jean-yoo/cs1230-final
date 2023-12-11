export const fragmentShader = `
uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;
varying vec2 uvCoords;

void main() {
    gl_FragColor = texture2D(baseTexture, uvCoords) + texture2D(bloomTexture, uvCoords);
    
}
`