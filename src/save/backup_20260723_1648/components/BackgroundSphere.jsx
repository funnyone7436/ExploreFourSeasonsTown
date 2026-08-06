import React, { useRef } from 'react'
import { useLoader, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function BackgroundSphere({ 
  speedSea1 = -0.0003,
  speedSea2 = 0.0006,
  speedSea3 = -0.0006,
  speedSea4 = 0.0010
}) {
  // 1. The background texture is back in the loader!
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

  // 4. Rotate AND bob each sea layer
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
      {/* BACKGROUND SPHERE: Restored successfully (-6) */}
      <mesh 
        scale={[-1, 1, 1]} 
        rotation={[0, Math.PI / 2, 0]} 
        renderOrder={-6}
      >
        <sphereGeometry args={[178, 64, 64]} />
        <meshBasicMaterial map={textureBg} side={THREE.BackSide} transparent={true} depthWrite={false} />
      </mesh>

      {/* SEA 4 */}
      <mesh 
        ref={sea4Ref}
        scale={[-1, 1, 1]} 
        rotation={[0, Math.PI / 2, 0]} 
        renderOrder={-5}
      >
        <sphereGeometry args={[124, 64, 64]} />
        <meshBasicMaterial map={textureSea4} side={THREE.BackSide} transparent={true} depthWrite={false} />
      </mesh>

      {/* SEA 3 */}
      <mesh 
        ref={sea3Ref}
        scale={[-1, 1, 1]} 
        rotation={[0, Math.PI / 2, 0]} 
        renderOrder={-4}
      >
        <sphereGeometry args={[123, 64, 64]} />
        <meshBasicMaterial map={textureSea3} side={THREE.BackSide} transparent={true} depthWrite={false} />
      </mesh>

      {/* SEA 2 */}
      <mesh 
        ref={sea2Ref}
        scale={[-1, 1, 1]} 
        rotation={[0, Math.PI / 2, 0]} 
        renderOrder={-3}
      >
        <sphereGeometry args={[122, 64, 64]} />
        <meshBasicMaterial map={textureSea2} side={THREE.BackSide} transparent={true} depthWrite={false} />
      </mesh>

      {/* SEA 1 */}
      <mesh 
        ref={sea1Ref}
        scale={[-1, 1, 1]} 
        rotation={[0, Math.PI / 2, 0]} 
        renderOrder={-2}
      >
        <sphereGeometry args={[121, 64, 64]} />
        <meshBasicMaterial map={textureSea1} side={THREE.BackSide} transparent={true} depthWrite={false} />
      </mesh>

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