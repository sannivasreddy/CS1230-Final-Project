export default /* glsl */ `

varying vec2 vUv;
uniform sampler2D lightTex;

float exposure = 0.6;
float decay  = 0.93;
float density = 0.96;
float weight = 0.90;

int samples = 50;

void main() {

    vec2 toCenter = vec2(0.5, 0.5) - vUv;
    vec2 coord = vUv;
    vec4 color = vec4(0.0);
    float delta = 1.0 / float(samples);
    float illuminationDecay = 1.0;

    for(int i =0; i < samples; i++) {

        vec4 colorSamp = texture2D(lightTex, coord + toCenter * delta * float(i));

        color += colorSamp * (illuminationDecay * weight);
        illuminationDecay *= weight;

    }

    color.a  = 1.;
    gl_FragColor = color;
}
`;
