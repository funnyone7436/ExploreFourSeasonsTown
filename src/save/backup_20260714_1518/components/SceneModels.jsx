import React, { useEffect, useRef } from 'react'
import { useGLTF, Clone, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three' 

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
  const bike = useGLTF('/glb/bike1.glb') 
  const airBalloon = useGLTF('/glb/airBalloon.glb')
  const cat = useGLTF('/glb/cat.glb') 
  const girl = useGLTF('/glb/Girl.glb') // 1. Load the Girl model

  const bikeRef = useRef()
  const catRef = useRef()
  const girlRef = useRef() // 2. Reference for the Girl

  const { actions: catActions } = useAnimations(cat.animations, catRef)
  const { actions: girlActions } = useAnimations(girl.animations, girlRef) // 3. Animations for the Girl

  // --- Play the cat's default animation ---
  useEffect(() => {
    if (catActions && Object.keys(catActions).length > 0) {
      const firstAnimationName = Object.keys(catActions)[0]
      catActions[firstAnimationName]?.reset().play()
    }
  }, [catActions])
  // -------------------------------------------------------------------

  // --- Play the girl's default animation ---
  useEffect(() => {
    if (girlActions && Object.keys(girlActions).length > 0) {
      const firstAnimationName = Object.keys(girlActions)[0]
      girlActions[firstAnimationName]?.reset().play()
    }
  }, [girlActions])
  // -------------------------------------------------------------------

  // --- Apply random colors to the balloons once the bike loads ---
  useEffect(() => {
    if (!bikeRef.current) return
    const balloonColors = ['#ff4d4d', '#ffed4a', '#4add74', '#4a90e2', '#ff66c4']

    bikeRef.current.traverse((child) => {
      if (child.isMesh && (child.name.includes('Sphere') || child.name === 'Balloon')) {
        if (child.material) {
          child.material = child.material.clone()
          const randomHex = balloonColors[Math.floor(Math.random() * balloonColors.length)]
          child.material.color = new THREE.Color(randomHex)
        }
      }
    })
  }, [bike.scene])
  // -------------------------------------------------------------------

  // --- Animate the balloons waving safely in the air ---
  useFrame((state) => {
    if (!bikeRef.current) return
    const time = state.clock.elapsedTime
    
    bikeRef.current.traverse((child) => {
      if (child.isMesh && (child.name.includes('Sphere') || child.name === 'Balloon')) {
        
        if (child.userData.basePosX === undefined) {
          child.userData.basePosX = child.position.x
          child.userData.basePosY = child.position.y
        }
        
        const organicOffset = child.userData.basePosX * 5 + child.userData.basePosY * 5
        
        child.position.x = child.userData.basePosX + Math.sin(time * 2 + organicOffset) * 0.15
        child.position.y = child.userData.basePosY + Math.cos(time * 1.5 + organicOffset) * 0.15
      }
    })
  })
  // -------------------------------------------------------------------

  const getX = (angle) => -radius * Math.sin(angle)
  const getZ = (angle) => -radius * Math.cos(angle)

  // 1. BookStore Math
  const bookStoreAngle = offsetAngle - 0.12
  const bookStorePos = [getX(bookStoreAngle), height+20, getZ(bookStoreAngle)]
  const bookStoreRot = [0, bookStoreAngle + Math.PI, 0] 
  const bookStoreScale = a * 3.3 

  // 2. BigTree Math
  const bigTreeAngle = offsetAngle + (Math.PI / 2) + 0.06
  const bigTreePos = [getX(bigTreeAngle)+32, height+5.2, getZ(bigTreeAngle)+32]
  const bigTreeRot = [0, bigTreeAngle + Math.PI, 0]
  const bigTreeScale = a * 7.3 

  // 3. FallHouse Math
  const fallHouseAngle = offsetAngle + Math.PI - 0.36
  const fallHousePos = [getX(fallHouseAngle)-16, height+8, getZ(fallHouseAngle)-16]
  const fallHouseRot = [0, fallHouseAngle + Math.PI+0.3, 0]
  const fallHouseScale = a * 0.25 

  // 4. FallHouse Trees Math
  const fallHouseTreeAngle = offsetAngle + Math.PI - 0.36
  const fallHouseTreesPos = [getX(fallHouseTreeAngle)-16, height+10, getZ(fallHouseTreeAngle)-16]
  const fallHouseTreesRot = fallHouseRot
  const fallHouseTreesScale = fallHouseScale*1.2

  // 5. Bike Math
  const bikeAngle = offsetAngle + (Math.PI / 4) + 0.81 
  const bikePos = [getX(bikeAngle)-50, height + 3, getZ(bikeAngle)-50] 
  const bikeRot = [0, bikeAngle + Math.PI, 0]
  const bikeScale = 1 

  // 6. Air Balloon Math
  const airBalloonAngle = offsetAngle + (Math.PI) - 1.6
  const airBalloonPos = [getX(airBalloonAngle)-40, height , getZ(airBalloonAngle)-40] 
  const airBalloonRot = [0, airBalloonAngle + Math.PI, 0]
  const airBalloonScale = a 

  // 7. Cat Math 
  const catAngle = offsetAngle + 0.68
  const catPos = [getX(catAngle)+28, height + 5, getZ(catAngle)-28] 
  const catRot = [0, catAngle + Math.PI, 0]
  const catScale = a * 0.7

  // 8. Girl Math 
  // Base angle set near the bookstore (-0.12). Adjust this to slide her left or right.
  const girlAngle = offsetAngle + 0.2
  // Height set to height+20 to match bookstore base. Add/subtract from getX or getZ to step her forward/backward.
  const girlPos = [getX(girlAngle)+10, height + 5., getZ(girlAngle)-10] 
  const girlRot = [0, girlAngle + Math.PI+0.5, 0]
  const girlScale = a*0.46 // Adjust to match her real scale against the bookstore

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

      {/* Bike */}
      <group ref={bikeRef} position={bikePos} rotation={bikeRot} scale={[bikeScale, bikeScale, bikeScale]}>
        <Clone object={bike.scene} />
      </group>

      {/* Tree */}
      <group position={bigTreePos} rotation={bigTreeRot} scale={[bigTreeScale, bigTreeScale, bigTreeScale]}>
        <Clone object={bigTree.scene} />
      </group>

      {/* Air Balloon */}
      <group position={airBalloonPos} rotation={airBalloonRot} scale={[airBalloonScale, airBalloonScale, airBalloonScale]}>
        <Clone object={airBalloon.scene} />
      </group>

      {/* Cat */}
      <group ref={catRef} position={catPos} rotation={catRot} scale={[catScale, catScale, catScale]}>
        <primitive object={cat.scene} />
      </group>

      {/* Girl */}
      <group ref={girlRef} position={girlPos} rotation={girlRot} scale={[girlScale, girlScale, girlScale]}>
        <primitive object={girl.scene} />
      </group>
    </group>
  )
}

useGLTF.preload('/glb/FallHouse_4.glb')
useGLTF.preload('/glb/BookStore.glb')
useGLTF.preload('/glb/BigTree.glb')
useGLTF.preload('/glb/FallHouseTrees.glb')
useGLTF.preload('/glb/bike1.glb')
useGLTF.preload('/glb/airBalloon.glb')
useGLTF.preload('/glb/cat.glb')
useGLTF.preload('/glb/Girl.glb') // 4. Preload the Girl