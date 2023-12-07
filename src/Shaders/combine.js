export const combineFragShader = `
uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;
uniform sampler2D edgeTexture;
varying vec2 uvCoords;

void main() {

        gl_FragColor = texture2D(baseTexture, uvCoords) + texture2D(bloomTexture, uvCoords);
        gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);
}
`