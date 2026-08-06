import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function useBalloonAnimation(bikeRef, bikeScene) {
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

  useFrame((state) => {
    const time = state.clock.elapsedTime
    if (bikeRef.current) {
      if (bikeRef.current.userData.activeBalloons === undefined) {
        bikeRef.current.userData.activeBalloons = []
        bikeRef.current.traverse((child) => {
          if (child.isMesh && (child.name.includes('Sphere') || child.name === 'Balloon')) {
            child.userData.basePosX = child.position.x
            child.userData.basePosY = child.position.y
            bikeRef.current.userData.activeBalloons.push(child)
          }
        })
      }

      const balloons = bikeRef.current.userData.activeBalloons;
      for (let i = 0; i < balloons.length; i++) {
        const child = balloons[i];
        const organicOffset = child.userData.basePosX * 5 + child.userData.basePosY * 5
        child.position.x = child.userData.basePosX + Math.sin(time * 2 + organicOffset) * 0.15
        child.position.y = child.userData.basePosY + Math.cos(time * 1.5 + organicOffset) * 0.15
      }
    }
  })
}