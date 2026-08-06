import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function useSceneAnimations(catActions, girlActions, squirrelActions, bikeRef, bikeScene) {
  
  // --- Play the cat's default animation ---
  useEffect(() => {
    if (catActions && Object.keys(catActions).length > 0) {
      const firstAnimationName = Object.keys(catActions)[0]
      catActions[firstAnimationName]?.reset().play()
    }
  }, [catActions])

  // --- Play the girl's default animation ---
  useEffect(() => {
    if (girlActions && Object.keys(girlActions).length > 0) {
      const firstAnimationName = Object.keys(girlActions)[0]
      girlActions[firstAnimationName]?.reset().play()
    }
  }, [girlActions])

  // --- Play the squirrel's default animation ---
  useEffect(() => {
    if (squirrelActions && Object.keys(squirrelActions).length > 0) {
      const firstAnimationName = Object.keys(squirrelActions)[0]
      squirrelActions[firstAnimationName]?.reset().play()
    }
  }, [squirrelActions])

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
  }, [bikeScene, bikeRef])

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
}