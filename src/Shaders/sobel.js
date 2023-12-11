export const edgeFragShader = `
uniform sampler2D base;
uniform float H;
uniform float W;
varying vec2 uvCoords;

float toGrayscale(vec4 color) {
    return 0.299*color[0] + 0.587*color[1] + 0.114*color[2];
}

void main() {
    float Kx[9] = float[9](1.0,0.0,-1.0,2.0,0.0,-2.0,1.0,0.0,-1.0);
    float Ky[9] = float[9](1.0,2.0,1.0,0.0,0.0,0.0,-1.0,-2.0,-1.0);
    float Gx = 0.; float Gy = 0.;
    for (int i=0; i<=2; i++) {
        for (int j=0; j<=2; j++) {
            vec2 filterCoords = vec2(uvCoords[0] + float(i-1)/W, uvCoords[1] + float(j-1)/H);
            Gx += Kx[3*i + j] * toGrayscale(texture2D(base, filterCoords));
            Gy += Ky[3*i + j] * toGrayscale(texture2D(base, filterCoords));
        }
    }
    float mag = sqrt(Gx*Gx + Gy*Gy);
    if (mag > 0.05) {
        gl_FragColor = vec4(vec3(1.0), 1.0);
    } else {
        gl_FragColor = vec4(vec3(0.0), 1.0);
    }
}
`