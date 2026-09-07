"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type MindCoreProps = {
  audioLevel?: number; // 0-1, from useSpeechAudioLevel while Jarvis speaks
  isSpeaking?: boolean;
};

const AURORA_STOPS = [
  new THREE.Color("#7C3AED"),
  new THREE.Color("#22D3EE"),
  new THREE.Color("#F59E0B"),
];

export default function MindCore({
  audioLevel = 0,
  isSpeaking = false,
}: MindCoreProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);

  const { positions, baseRadii } = useMemo(() => {
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const baseRadii = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.4 * (0.8 + Math.random() * 0.3);
      baseRadii[i] = r;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return { positions, baseRadii };
  }, []);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.03,
        color: AURORA_STOPS[0],
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    [],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Slow aurora color cycle (idle) — cycles through the 3 stops over ~20s
    const cycle = (t * 0.05) % AURORA_STOPS.length;
    const i = Math.floor(cycle);
    const next = AURORA_STOPS[(i + 1) % AURORA_STOPS.length];
    material.color.copy(AURORA_STOPS[i]).lerp(next, cycle - i);

    // Idle drift rotation
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.08;
      groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.05;
    }

    // Shrink + tighten when speaking, driven by real audio level
    const targetScale = isSpeaking ? 0.7 - audioLevel * 0.15 : 1.0;
    if (pointsRef.current) {
      const current = pointsRef.current.scale.x;
      const lerped = THREE.MathUtils.lerp(current, targetScale, 0.1);
      pointsRef.current.scale.setScalar(lerped);
    }

    // Brighten with speech energy
    material.opacity = isSpeaking ? 0.7 + audioLevel * 0.3 : 0.9;
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} material={material}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
      </points>
    </group>
  );
}
