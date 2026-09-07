"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import ArcReactorCore from "./ArcReactorCore";


export default function Scene({ isBooting = false }: { isBooting?: boolean }) {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
      <color attach="background" args={["#0a0a0c"]} />
      <ambientLight intensity={0.15} />

      <ArcReactorCore isBooting={isBooting} />
      

      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>

      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
}
