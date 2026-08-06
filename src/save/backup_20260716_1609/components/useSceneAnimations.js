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
  clipStartAngle, 
  clipEndAngle,
  bookStoreRef // 1. ADDED REFERENCE HERE
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

  // --- CLIPPING PLANES ---
  useEffect(() => {
    if (!trainRef.current || !gl) return

    gl.localClippingEnabled = true
    const centerVec = new THREE.Vector3(trainCenter[0], trainCenter[1], trainCenter[2])

    const normal1 = new THREE.Vector3(Math.cos(Math.PI * clipStartAngle), 0, -Math.sin(Math.PI * clipStartAngle))
    const plane1 = new THREE.Plane()
    plane1.setFromNormalAndCoplanarPoint(normal1, centerVec)

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
// --- ANIMATE THE LEAVES: FULL CONTROL ---
    if (bookStoreRef && bookStoreRef.current) {
      
      // 1. CONFIGURATION: Change these numbers to control your scene
      const leafConfig = {
        'Petal_01_Sakura_Cleft': { limit: 50, speed: 10, key: 'Sakura' },   // Combined top 20 + bottom 30
        'Petal_02_Rounded':      { limit: 60, speed: 12,  key: 'Rounded' },  // Combined top 30 + bottom 30
        'Petal_03_Wide':         { limit: 80, speed: 20,  key: 'Wide' },     // Combined top 40 + bottom 40
        'Petal_04_Elongated':    { limit: 60, speed: 8, key: 'Elongated' } // Combined top 30 + bottom 30
      };

      // Initialize counters if they don't exist
      if (!bookStoreRef.current.userData.counters) {
        bookStoreRef.current.userData.counters = { Sakura: 0, Rounded: 0, Wide: 0, Elongated: 0 };
      }

      bookStoreRef.current.traverse((child) => {
        if (child.isMesh) {
          // Find if this mesh matches any of our leaf prefixes
          const prefix = Object.keys(leafConfig).find(p => child.name.startsWith(p));
          
          if (prefix) {
            const config = leafConfig[prefix];
            const counts = bookStoreRef.current.userData.counters;

            // 2. INITIALIZATION: Run once for the leaf
            if (child.userData.initialized === undefined) {
              
              if (counts[config.key] < config.limit) {
                child.userData.isSpinner = true;
                
                // Clone geometry and center pivot only for selected spinners
                child.geometry = child.geometry.clone();
                child.geometry.center(); 
                
                child.userData.baseRot = child.rotation.clone();
                child.userData.speed = config.speed; // Uses the speed defined in config
                child.userData.phaseOffset = Math.random() * Math.PI * 2;
                
                counts[config.key]++;
              } else {
                child.userData.isSpinner = false;
              }
              child.userData.initialized = true;
            }

            // 3. APPLY ANIMATION
            if (child.userData.isSpinner) {
              const amplitude = 0.3; 
              const oscillation = Math.sin(time * child.userData.speed + child.userData.phaseOffset) * amplitude;
              
              child.rotation.y = child.userData.baseRot.y + oscillation;
              child.rotation.x = child.userData.baseRot.x + (oscillation * 0.2); 
            }
          }
        }
      });
    }
    // --------------------------------------------------
// --------------------------------------------------
    // --------------------------------------------------
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