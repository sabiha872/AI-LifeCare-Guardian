import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

export default function TalkingAvatar({ isSpeaking = false }) {
  const { scene } = useGLTF("/avatar-type2.glb");
  const headRef = useRef(null);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.name === "Head_Mesh") {
        headRef.current = child;
      }
    });
  }, [scene]);

  useFrame((state) => {
    if (!headRef.current) return;

    const mesh = headRef.current;

    const mouthOpen =
      mesh.morphTargetDictionary?.mouthOpen;

    const jawOpen =
      mesh.morphTargetDictionary?.jawOpen;

    if (mouthOpen !== undefined) {
      mesh.morphTargetInfluences[mouthOpen] =
        isSpeaking
          ? 0.15 + Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.65
          : 0;
    }

    if (jawOpen !== undefined) {
      mesh.morphTargetInfluences[jawOpen] =
        isSpeaking
          ? 0.1 + Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.45
          : 0;
    }
  });

  return (
    <primitive
      object={scene}
      scale={1.6}
      position={[0, -1.5, 0]}
    />
  );
}

useGLTF.preload("/avatar-type2.glb");