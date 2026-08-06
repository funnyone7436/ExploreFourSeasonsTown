import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// --- HELPER FUNCTION: Smoothly calculate height from your list ---
function getTrackHeight(targetAngle, points) {
  const normalizedAngle = ((targetAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)

  for (let i = 0; i < points.length - 1; i++) {
    const angle1 = points[i][0]
    const height1 = points[i][1]
    const angle2 = points[i + 1][0]
    const height2 = points[i + 1][1]

    if (normalizedAngle >= angle1 && normalizedAngle <= angle2) {
      const t = (normalizedAngle - angle1) / (angle2 - angle1)
      const smoothT = t * t * (3 - 2 * t)
      return height1 + (height2 - height1) * smoothT
    }
  }
  return 0
}

export default function useSceneAnimations(
  catActions, 
  girlActions, 
  squirrelActions, 
  seagullActions,
  bikeRef, 
  bikeScene, 
  trainRef, 
  trainScene, 
  trainRadius, 
  trainSpeed, 
  trainCenter,
  gl,
  clipStartAngle, // NEW
  clipEndAngle    // NEW
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
		if (seagullActions) {
		  // Loop through every animation track (e.g., "1" and "2") and play them together
		  Object.keys(seagullActions).forEach((animationName) => {
			seagullActions[animationName]?.reset().play()
		  })
		}
	  }, [seagullActions])

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

  // --- CLIPPING PLANES (The Disappearing Tunnel Effect) ---
  useEffect(() => {
    if (!trainRef.current || !gl) return

    gl.localClippingEnabled = true
    const centerVec = new THREE.Vector3(trainCenter[0], trainCenter[1], trainCenter[2])

    // Plane 1: Uses the new clipStartAngle
    const normal1 = new THREE.Vector3(Math.cos(Math.PI * clipStartAngle), 0, -Math.sin(Math.PI * clipStartAngle))
    const plane1 = new THREE.Plane()
    plane1.setFromNormalAndCoplanarPoint(normal1, centerVec)

    // Plane 2: Uses the new clipEndAngle
    const normal2 = new THREE.Vector3(-Math.cos(Math.PI * clipEndAngle), 0, Math.sin(Math.PI * clipEndAngle))
    const plane2 = new THREE.Plane()
    plane2.setFromNormalAndCoplanarPoint(normal2, centerVec)

    trainRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        
        const applyClipping = (mat) => {
          mat.clippingPlanes = [plane1, plane2]
          mat.clipIntersection = true 
          mat.side = THREE.DoubleSide 
          mat.needsUpdate = true 
        }

        if (Array.isArray(child.material)) {
          child.material = child.material.map(m => m.clone())
          child.material.forEach(applyClipping)
        } else {
          child.material = child.material.clone()
          applyClipping(child.material)
        }
      }
    })
    // Ensure the effect re-runs if you change the angles during development
  }, [trainScene, trainCenter, gl, clipStartAngle, clipEndAngle])
  // -----------------------------------------------------------

  useFrame((state) => {
    const time = state.clock.elapsedTime

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

    if (trainRef.current) {
      const angle = (time * trainSpeed) + Math.PI
      
      const trackPoints = [
        [0,             12.6],   
        [Math.PI * 0.5, 18],  
        [Math.PI * 0.6, 18],  
        [Math.PI * 1.0, 18],  
        [Math.PI * 1.1, 19],  
		[Math.PI * 1.2, 19],
		[Math.PI * 1.3, 17],
        [Math.PI * 1.4, 16.5],    
        [Math.PI * 1.5, 17],  
        [Math.PI * 1.8, 17],  
        [Math.PI * 1.95, 12.6],  
        [Math.PI * 2.0, 12.6]    
      ]

      const x = trainCenter[0] - trainRadius * Math.sin(angle)
      const z = trainCenter[2] - trainRadius * Math.cos(angle)
      const y = trainCenter[1] + getTrackHeight(angle, trackPoints)
      
      trainRef.current.position.set(x, y, z)
      
      const lookAheadAngle = angle + 0.05
      const nextY = trainCenter[1] + getTrackHeight(lookAheadAngle, trackPoints)
      
      const heightDifference = nextY - y
      const forwardDistance = trainRadius * 0.05 
      
      const pitchAngle = Math.atan2(heightDifference, forwardDistance)

      trainRef.current.rotation.y = angle + Math.PI
      trainRef.current.rotation.x = pitchAngle
    }
  })
}