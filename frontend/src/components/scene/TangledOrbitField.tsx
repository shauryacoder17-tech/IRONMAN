"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const EMBER = new THREE.Color("#F5A623"); // warm amber/gold

// Builds a ring path with layered sine-wave "noise" instead of a perfect
// circle — this irregularity is what makes it read as hand-scribbled
// rather than a clean geometric ring.
function jitteredRingPoints(
  radius: number,
  segments: number,
  jitter: number,
  seed: number,
) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const wobble =
      Math.sin(a * 5 + seed) * 0.5 +
      Math.sin(a * 13 + seed * 2.7) * 0.3 +
      Math.sin(a * 29 + seed * 5.1) * 0.2;
    const r = radius + wobble * jitter;
    points.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
  }
  return points;
}

type RingConfig = {
  radius: number;
  tilt: [number, number, number];
  speed: number;
  jitter: number;
  strands?: number;
};

function OrbitRing({ radius, tilt, speed, jitter, strands = 2 }: RingConfig) {
  const groupRef = useRef<THREE.Group>(null);

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: EMBER,
        transparent: true,
        opacity: 0.5,
      }),
    [],
  );

  const geometries = useMemo(
    () =>
      Array.from({ length: strands }, (_, s) =>
        new THREE.BufferGeometry().setFromPoints(
          jitteredRingPoints(radius, 220, jitter, s * 37.1 + radius * 9.7),
        ),
      ),
    [radius, jitter, strands],
  );

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * speed;
    }
  });

  return (
    <group ref={groupRef} rotation={tilt}>
      {geometries.map((geo, i) => (
        <primitive key={i} object={new THREE.Line(geo, material)} />
      ))}
    </group>
  );
}

// Four rings, each tilted on a different axis and spinning at a different
// speed/direction — the overlap of independently-tumbling rings is what
// creates that chaotic "energy field" silhouette from your reference.
const RINGS: RingConfig[] = [
  { radius: 1.5, tilt: [0.3, 0.6, 0], speed: 0.15, jitter: 0.12 },
  { radius: 1.85, tilt: [1.2, -0.3, 0.4], speed: -0.1, jitter: 0.18 },
  { radius: 2.15, tilt: [-0.5, 1.0, 0.2], speed: 0.08, jitter: 0.2 },
  { radius: 1.25, tilt: [0.8, 0.2, -0.6], speed: -0.2, jitter: 0.1 },
];

export default function TangledOrbitField() {
  return (
    <group>
      {RINGS.map((r, i) => (
        <OrbitRing key={i} {...r} />
      ))}
    </group>
  );
}
