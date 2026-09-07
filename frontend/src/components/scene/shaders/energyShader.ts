import * as THREE from "three";

export const energyVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const energyFragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uCoreColor;
  uniform vec3 uEdgeColor;

  void main() {
    vec2 uv = vUv - vec2(0.5);
    float dist = length(uv);

    float rings = sin(dist * 20.0 - uTime * 3.0) * 0.5 + 0.5;
    float coreGlow = pow(1.0 - smoothstep(0.0, 0.3, dist), 2.0);
    float edgeFade = 1.0 - smoothstep(0.3, 0.5, dist);

    vec3 color = mix(uEdgeColor, uCoreColor, coreGlow) + uCoreColor * rings * 0.4;
    float alpha = edgeFade * (0.5 + rings * 0.3 + coreGlow * 0.5);

    gl_FragColor = vec4(color * uIntensity, alpha);
  }
`;

export function createEnergyMaterial(
  coreColor: THREE.Color,
  edgeColor: THREE.Color,
) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 1.5 },
      uCoreColor: { value: coreColor },
      uEdgeColor: { value: edgeColor },
    },
    vertexShader: energyVertexShader,
    fragmentShader: energyFragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}
