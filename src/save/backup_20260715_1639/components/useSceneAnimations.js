import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// --- HELPER FUNCTION: Smoothly calculate height from your list ---
function getTrackHeight(targetAngle, points) {
  // Normalize the angle to loop infinitely between 0 and 2*PI
  const normalizedAngle = ((targetAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)

  // Loop through your list to find which segment the train is currently on
  for (let i = 0; i < points.length - 1; i++) {
    const angle1 = points[i][0]
    const height1 = points[i][1]
    const angle2 = points[i + 1][0]
    const height2 = points[i + 1][1]

    if (normalizedAngle >= angle1 && normalizedAngle <= angle2) {
      // Calculate how far along the train is between the two points (0.0 to 1.0)
      const t = (normalizedAngle - angle1) / (angle2 - angle1)

      // Smooth the transition (Smoothstep) so it feels like a coaster, avoiding sharp corners
      const smoothT = t * t * (3 - 2 * t)

      // Return the exact calculated height for this frame
      return height1 + (height2 - height1) * smoothT
    }
  }
  return 0
}

export default function useSceneAnimations(
  catActions, 
  girlActions, 
  squirrelActions, 
  bikeRef, 
  bikeScene, 
  trainRef, 
  trainRadius, 
  trainSpeed, 
  trainCenter
) {
  
  useEffect(() => {
    if (catActions && Object.keys(catActions).length > 0) {
      const firstAnimationName = Object.keys(catActions)[0]
      catActions[firstAnimationName]?.reset().play()
    }
  }, [catActions])

  useEffect(() => {
    if (girlActions && Object.keys(girlActions).length > 0) {
      const firstAnimationName = Object.keys(girlActions)[0]
      girlActions[firstAnimationName]?.reset().play()
    }
  }, [girlActions])

  useEffect(() => {
    if (squirrelActions && Object.keys(squirrelActions).length > 0) {
      const firstAnimationName = Object.keys(squirrelActions)[0]
      squirrelActions[firstAnimationName]?.reset().play()
    }
  }, [squirrelActions])

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

    // 1. Animate Balloons
    if (bikeRef.current) {
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
    }

    // 2. Animate Train Circling with Custom Two-Pair List
    if (trainRef.current) {
      const angle = time * trainSpeed
      
      // --- YOUR CUSTOM TWO-PAIR LIST: [Angle, Height Offset] ---
      // Math.PI * 2 is a full circle. Each 0.2 step is a new segment (10 total segments).
      // You can change the second number in each array to completely redesign the roller coaster!
      const trackPoints = [
        [0,             0],   // Start flat

        [Math.PI * 0.6, 16],  // Highest peak! (Halfway around circle)
        [Math.PI * 1.0, 16],  // Highest peak! (Halfway around circle)
        [Math.PI * 1.2, 28],  // Highest peak! (Halfway around circle)

        [Math.PI * 2.0, 0]    // Must match the start [0, 0] to loop smoothly
      ]

      // Standard circle X and Z
      const x = trainCenter[0] - trainRadius * Math.sin(angle)
      const z = trainCenter[2] - trainRadius * Math.cos(angle)
      
      // Calculate exactly how high the train should be at this exact angle
      const y = trainCenter[1] + getTrackHeight(angle, trackPoints)
      
      trainRef.current.position.set(x, y, z)
      
      // --- Calculate Pitch (Nose Up/Down) ---
      // We look slightly ahead on the track to see where the next height is
      const lookAheadAngle = angle + 0.05
      const nextY = trainCenter[1] + getTrackHeight(lookAheadAngle, trackPoints)
      
      // Compare current height to next height
      const heightDifference = nextY - y
      const forwardDistance = trainRadius * 0.05 // Distance traveled along the arc
      
      // Point the nose exactly toward the next height target
      const pitchAngle = Math.atan2(heightDifference, forwardDistance)

      trainRef.current.rotation.y = angle + Math.PI
      trainRef.current.rotation.x = pitchAngle
    }
  })
}