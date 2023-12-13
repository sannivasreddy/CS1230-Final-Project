export default /* glsl */ `
    varying vec2 vUv;
    uniform sampler2D tDiffuse;  
    uniform sampler2D objectText;
    uniform sampler2D floorText;
    uniform vec2 lightPosition;  
    uniform float exposure;  
    uniform float decay;  
    uniform float density;  
    uniform float weight;  
    uniform int samples;  
    const int MAX_SAMPLES = 100;  
    void main()  
    {  
    vec4 original = texture2D(objectText, vUv);
    vec2 texCoord = vUv;  
    vec2 deltaTextCoord = texCoord - lightPosition;  
    deltaTextCoord *= 1.0 / float(samples) * density;  
    vec4 color = texture2D(tDiffuse, texCoord);  
    float illuminationDecay = 1.0;  
    for(int i=0; i < MAX_SAMPLES; i++)  
    {  
        if(i == samples){  
        break;  
        }  
        texCoord -= deltaTextCoord;  
        vec4 sampleColor = texture2D(tDiffuse, texCoord);  
        
        sampleColor *= illuminationDecay * weight;  
        color += sampleColor;  
        illuminationDecay *= decay;  
    }  


    //gl_FragColor = 1. - (1. - original)*(1. - finalColor);  
    vec4 finalColor = color * exposure;
    gl_FragColor = finalColor + original + texture2D(floorText, vUv);
    }  
`;
