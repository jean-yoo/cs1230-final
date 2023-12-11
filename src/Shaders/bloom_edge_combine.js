export const combineFragShader = `
uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;
uniform sampler2D edgeTexture;
varying vec2 uvCoords;

void main() {
        // if (texture2D(edgeTexture, uvCoords)[0] > 0.9) {
        //         gl_FragColor = vec4(vec3(0.0), 1.0);
        // } else {
        //         gl_FragColor = texture2D(baseTexture, uvCoords) + texture2D(bloomTexture, uvCoords);
        //         gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);
        // }

        gl_FragColor = texture2D(edgeTexture, uvCoords); // + texture2D(baseTexture, uvCoords) + texture2D(bloomTexture, uvCoords);
        gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);
}
`