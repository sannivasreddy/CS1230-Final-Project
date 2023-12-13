export default /* glsl */ `
varying vec2 vUv;
uniform sampler2D tDiffuse;
uniform sampler2D sceneTex;

void main() {
    gl_FragColor = 1. - (1. - texture2D(tDiffuse, vUv))*(1. -  texture2D(sceneTex, vUv));
}
`;
