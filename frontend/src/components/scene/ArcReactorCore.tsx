"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type IronmanState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "processing"
  | "error";

interface ArcReactorCoreProps {
  isBooting?: boolean;
  state?: IronmanState;
}

export default function ArcReactorCore({
  isBooting = false,
  state = "idle",
}: ArcReactorCoreProps) {
  const spinRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);

  const { scene } = useGLTF("/models/arc-reactor.glb");

  const model = useMemo(() => {
    const cloned = scene.clone(true);

    // Remove unwanted base/background geometry
    cloned.traverse((object) => {
      const name = object.name.toLowerCase();

      if (
        name === "rad_base" ||
        name.includes("background") ||
        name.includes("backdrop")
      ) {
        object.visible = false;
      }
    });

    /*
     * IMPORTANT:
     *
     * GLB models often have their geometry offset from (0,0,0).
     * We calculate the real visual center and move the model
     * so the reactor rotates around its own center.
     */

    const box = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();

    box.getCenter(center);

    cloned.position.sub(center);

    return cloned;
  }, [scene]);

  useFrame((frame) => {
    if (!spinRef.current) return;

    const time = frame.clock.elapsedTime;

    let speed = 0.25;

    switch (state) {
      case "idle":
        speed = 0.25;
        break;

      case "listening":
        speed = 0.45;
        break;

      case "thinking":
        speed = 0.7;
        break;

      case "speaking":
        speed = 0.55;
        break;

      case "processing":
        speed = 1.0;
        break;

      case "error":
        speed = 0.1;
        break;
    }

    /*
     * FACE-ON SPIN
     *
     * Camera is looking from +Z toward the reactor.
     * Therefore Z is the front-facing rotation axis.
     *
     * This gives:
     *
     *        ↻
     *     [ CORE ]
     *        ↻
     *
     * instead of a planet-like tumble.
     */
    spinRef.current.rotation.z = time * speed;

    // Keep position absolutely fixed
    spinRef.current.position.set(0, 0, 0);

    // Keep the reactor face-on
    spinRef.current.rotation.x = 0;
    spinRef.current.rotation.y = 0;

    // Smooth boot / thinking pulse
    const pulse =
      state === "thinking" || state === "processing"
        ? 1 + Math.sin(time * 4) * 0.025
        : 1;

    const targetScale = (isBooting ? 1.08 : 1) * pulse;

    const scale = THREE.MathUtils.lerp(
      spinRef.current.scale.x,
      targetScale,
      0.08,
    );

    spinRef.current.scale.setScalar(scale);
  });

  return (
    /*
     * THIS GROUP IS THE ROTATION PIVOT.
     *
     * The GLB has been recentered around this point.
     */
    <group ref={spinRef} position={[0, 0, 0]} rotation={[0, 0, 0]} scale={1}>
      <group ref={modelRef}>
        <primitive object={model} />
      </group>
    </group>
  );
}

useGLTF.preload("/models/arc-reactor.glb");
