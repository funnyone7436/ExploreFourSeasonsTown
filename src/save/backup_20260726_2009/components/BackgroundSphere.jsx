import React, { useRef, useMemo } from 'react'
import { useLoader, useFrame } from '@react-three/fiber'
import { useGLTF, Clone } from '@react-three/drei'
import * as THREE from 'three'

export default function BackgroundSphere({ 
  speedSea1 = -0.0001,
  speedSea2 = 0.0006,
  speedSea3 = -0.0006,
  speedSea4 = 0.0010
}) {
  // --- ADJUST YOUR OFFSETS HERE ---
  
  // SEA 0 (Matches Sea 4 / back layer)
  const sea0OffsetPos = [0, -0.7, 0]; 
  const sea0OffsetRot = [0, Math.PI+0.215, 0]; 
  const sea0OffsetScale = [1, 1, 1];

  // SEA 1 (Matches Sea 3)
  const sea1OffsetPos = [0, 0, 0]; 
  const sea1OffsetRot = [0, -0.01, 0]; 
  const sea1OffsetScale = [0.98, 0.98, 0.98]; 

  // --------------------------------

  // 1. The background texture loader
  const [
    textureFront,
    textureSea1,
    textureSea2,
    textureSea3,
    textureSea4,
    textureBg 
  ] = useLoader(THREE.TextureLoader, [
    '/frame_8k_season_front_1_1043.png',
    '/frame_8k_season_sea_1_1043.png',
    '/frame_8k_season_sea_2_1043.png',
    '/frame_8k_season_sea_3_1043.png',
    '/frame_8k_season_sea_4_1043.png',
    '/frame_8k_season_bg_1_1043.png'
  ])

  // Load remaining 3D wave objects
  const sea0Gltf = useGLTF('/glb/sea0.001.glb')
  const sea1Gltf = useGLTF('/glb/sea1.001.glb')

  
  // Color adjustment for sea0
  useMemo(() => {
    sea0Gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.color = new THREE.Color('#12b5de'); 
		child.material.emissive = new THREE.Color('#12b5de'); 
        child.material.emissiveIntensity = 0.5;
      }
    });
  }, [sea0Gltf.scene]);

  // Color adjustment for sea1
  useMemo(() => {
    sea1Gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.color = new THREE.Color('#74cee5'); 
		// ADDED: Emission properties for sea1
        child.material.emissive = new THREE.Color('#74cee5'); 
        child.material.emissiveIntensity = 0.5;
      }
    });
  }, [sea1Gltf.scene]);


  // 2. Set color spaces
  textureFront.colorSpace = THREE.SRGBColorSpace
  textureSea1.colorSpace = THREE.SRGBColorSpace
  textureSea2.colorSpace = THREE.SRGBColorSpace
  textureSea3.colorSpace = THREE.SRGBColorSpace
  textureSea4.colorSpace = THREE.SRGBColorSpace
  textureBg.colorSpace = THREE.SRGBColorSpace

  // 3. Create refs for the moving layers
  const sea1Ref = useRef()
  const sea2Ref = useRef()
  const sea3Ref = useRef()
  const sea4Ref = useRef()

  // 4. Rotate AND bob each sea layer group
  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (sea1Ref.current) {
      sea1Ref.current.rotation.y += speedSea1
      sea1Ref.current.position.y = Math.sin(t * 0.8) * 1
    }
    
    if (sea2Ref.current) {
      sea2Ref.current.rotation.y += speedSea2
      sea2Ref.current.position.y = Math.cos(t * 1.1) * 1.2
    }
    
    if (sea3Ref.current) {
      sea3Ref.current.rotation.y += speedSea3
      sea3Ref.current.position.y = Math.sin(t * 0.9 + 1) * 1.4 
    }
    
    if (sea4Ref.current) {
      sea4Ref.current.rotation.y += speedSea4
      sea4Ref.current.position.y = Math.cos(t * 1.3 + 1) * 0.8
    }
  })

  return (
    <group>
      {/* BACKGROUND SPHERE */}
      <mesh 
        scale={[-1, 1, 1]} 
        rotation={[0, Math.PI / 2, 0]} 
        renderOrder={-6}
      >
        <sphereGeometry args={[178, 64, 64]} />
        <meshBasicMaterial map={textureBg} side={THREE.BackSide} transparent={true} depthWrite={false} />
      </mesh>

      {/* SEA 4 + sea0.001.glb */}
      <group ref={sea4Ref}>
        <mesh 
          scale={[-1, 1, 1]} 
          rotation={[0, Math.PI / 2, 0]} 
          renderOrder={-5}
        >
          <sphereGeometry args={[124, 64, 64]} />
          <meshBasicMaterial map={textureSea4} side={THREE.BackSide} transparent={true} depthWrite={false} />
        </mesh>
        <group position={sea0OffsetPos} rotation={sea0OffsetRot} scale={sea0OffsetScale}>
          <Clone object={sea0Gltf.scene} />
        </group>
      </group>

      {/* SEA 3 + sea1.001.glb */}
      <group ref={sea3Ref}>
        <mesh 
          scale={[-1, 1, 1]} 
          rotation={[0, Math.PI / 2, 0]} 
          renderOrder={-4}
        >
          <sphereGeometry args={[123, 64, 64]} />
          <meshBasicMaterial map={textureSea3} side={THREE.BackSide} transparent={true} depthWrite={false} />
        </mesh>
        <group position={sea1OffsetPos} rotation={sea1OffsetRot} scale={sea1OffsetScale}>
          <Clone object={sea1Gltf.scene} />
        </group>
      </group>

      {/* SEA 2 */}
      <group ref={sea2Ref}>
        <mesh 
          scale={[-1, 1, 1]} 
          rotation={[0, Math.PI / 2, 0]} 
          renderOrder={-3}
        >
          <sphereGeometry args={[122, 64, 64]} />
          <meshBasicMaterial map={textureSea2} side={THREE.BackSide} transparent={true} depthWrite={false} />
        </mesh>

      </group>

      {/* SEA 1 */}
      <group ref={sea1Ref}>
        <mesh 
          scale={[-1, 1, 1]} 
          rotation={[0, Math.PI / 2, 0]} 
          renderOrder={-2}
        >
          <sphereGeometry args={[121, 64, 64]} />
          <meshBasicMaterial map={textureSea1} side={THREE.BackSide} transparent={true} depthWrite={false} />
        </mesh>

      </group>

      {/* FRONT SPHERE */}
      <mesh 
        scale={[-1, 1, 1]} 
        rotation={[0, Math.PI / 2, 0]} 
        renderOrder={-1}
      >
        <sphereGeometry args={[120, 64, 64]} />
        <meshBasicMaterial map={textureFront} side={THREE.BackSide} transparent={true} depthWrite={false} />
      </mesh>
    </group>
  )
}

// Preload the GLTF objects
useGLTF.preload('/glb/sea0.001.glb')
useGLTF.preload('/glb/sea1.001.glb')
