"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createEnergyMaterial } from "./shaders/energyShader";

export default function ArcReactorCore({
  isBooting = false,
}: {
  isBooting?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const energyMaterial = useMemo(
    () =>
      createEnergyMaterial(
        new THREE.Color("#ff6a00"),
        new THREE.Color("#3da9fc"),
      ),
    [],
  );

  useFrame((state) => {
    energyMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    energyMaterial.uniforms.uIntensity.value = isBooting ? 2.5 : 1.5;

    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.05;
      groupRef.current.scale.setScalar(isBooting ? 1.18 : 1);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh material={energyMaterial}>
        <circleGeometry args={[1.2, 64]} />
      </mesh>

      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}
