import React from 'react'
import { useGLTF, Clone } from '@react-three/drei'

export default function SceneModels({
  a = 1,
  // Let's test a 5% scale for the house to find the "Goldilocks" size
  fallHouseScale = a * 0.05, 
  bookStoreScale = a,
  bigTreeScale = a
}) {
  const fallHouse = useGLTF('/glb/FallHouse_2.glb')
  const bookStore = useGLTF('/glb/BookStore.glb')
  const bigTree = useGLTF('/glb/BigTree.glb')

  return (
    <group>
      {/* LEFT: Big Tree placed at X: -20, Z: -30 */}
      <group position={[-20, -5, -30]} scale={[bigTreeScale, bigTreeScale, bigTreeScale]}>
        {/* Clone safely duplicates the model without corrupting the cache! */}
        <Clone object={bigTree.scene} />
      </group>

      {/* CENTER: Fall House placed at X: 0, Z: -30 (Directly in front of you) */}
      <group position={[0, -5, -30]} scale={[fallHouseScale, fallHouseScale, fallHouseScale]}>
        <Clone object={fallHouse.scene} />
      </group>

      {/* RIGHT: Book Store placed at X: 20, Z: -30 */}
      <group position={[20, -5, -30]} scale={[bookStoreScale, bookStoreScale, bookStoreScale]}>
        <Clone object={bookStore.scene} />
      </group>
    </group>
  )
}

useGLTF.preload('/glb/FallHouse_2.glb')
useGLTF.preload('/glb/BookStore.glb')
useGLTF.preload('/glb/BigTree.glb')