import React from 'react'
import { useGLTF, Clone } from '@react-three/drei'

export default function SceneModels({
  radius = 60,
  height = -2, 
  offsetAngle = Math.PI / 2 - Math.PI / 8 + Math.PI / 3, 
  a = 1
}) {
  const fallHouse = useGLTF('/glb/FallHouse_4.glb')
  const bookStore = useGLTF('/glb/BookStore.glb')
  const bigTree = useGLTF('/glb/BigTree.glb')
  const fallHouseTrees = useGLTF('/glb/FallHouseTrees.glb')

  const getX = (angle) => -radius * Math.sin(angle)
  const getZ = (angle) => -radius * Math.cos(angle)

  // 1. BookStore Math
  const bookStoreAngle = offsetAngle - 0.12
  const bookStorePos = [getX(bookStoreAngle), height+20, getZ(bookStoreAngle)]
  const bookStoreRot = [0, bookStoreAngle + Math.PI, 0] 
  const bookStoreScale = a * 3.3 // Restored to 1.5

  // 2. BigTree Math
  const bigTreeAngle = offsetAngle + (Math.PI / 2) + 0.08
  const bigTreePos = [getX(bigTreeAngle)+32, height+4.9, getZ(bigTreeAngle)+32]
  const bigTreeRot = [0, bigTreeAngle + Math.PI, 0]
  const bigTreeScale = a * 7 // Restored to 0.8

  // 3. FallHouse Math
  const fallHouseAngle = offsetAngle + Math.PI - 0.26
  const fallHousePos = [getX(fallHouseAngle)-16, height+8, getZ(fallHouseAngle)-16]
  const fallHouseRot = [0, fallHouseAngle + Math.PI, 0]
  const fallHouseScale = a * 0.25 // Safely shrinks the giant house to 2%

  // 4. FallHouse Trees Math
  const fallHouseTreeAngle = offsetAngle + Math.PI - 0.36
  const fallHouseTreesPos = [getX(fallHouseTreeAngle)-16, height+10, getZ(fallHouseTreeAngle)-16]
  const fallHouseTreesRot = fallHouseRot
  const fallHouseTreesScale = fallHouseScale*1.2

  return (
    <group>
      {/* House */}
      <group position={fallHousePos} rotation={fallHouseRot} scale={[fallHouseScale, fallHouseScale, fallHouseScale]}>
        <Clone object={fallHouse.scene} />
      </group>

      {/* House Trees */}
      <group position={fallHouseTreesPos} rotation={fallHouseTreesRot} scale={[fallHouseTreesScale, fallHouseTreesScale, fallHouseTreesScale]}>
        <Clone object={fallHouseTrees.scene} />
      </group>

      {/* Bookstore */}
      <group position={bookStorePos} rotation={bookStoreRot} scale={[bookStoreScale, bookStoreScale, bookStoreScale]}>
        <Clone object={bookStore.scene} />
      </group>

      {/* Tree */}
      <group position={bigTreePos} rotation={bigTreeRot} scale={[bigTreeScale, bigTreeScale, bigTreeScale]}>
        <Clone object={bigTree.scene} />
      </group>
    </group>
  )
}

useGLTF.preload('/glb/FallHouse_4.glb')
useGLTF.preload('/glb/BookStore.glb')
useGLTF.preload('/glb/BigTree.glb')
useGLTF.preload('/glb/FallHouseTrees.glb')