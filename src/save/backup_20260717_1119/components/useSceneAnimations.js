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

// --- OPTIMIZATION: Moved track points outside of the render loop ---
const trainTrackPoints = [
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
  bookStoreRef
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

    // --- ANIMATE THE BALLOONS: OPTIMIZED ---
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

    // --- ANIMATE THE LEAVES & FLOWERS: OPTIMIZED & DETERMINISTIC ---
    if (bookStoreRef && bookStoreRef.current) {
      
      // 1. CONFIGURATION
      const leafConfig = {
        // Petals (Rotation logic)
        'Petal_01_Sakura_Cleft': { limit: 60, speed: 6, amplitude: 0.5, type: 'petal', key: 'Sakura' },
        'Flower_Round_02_Red': { limit: 20, speed: 6,  amplitude: 0.1, type: 'petal', key: 'Rounded' },
        'Flower_Round_02_Red_Vein_04': { limit: 60, speed: 8,  amplitude: 0.6, type: 'petal', key: 'Rounded1' },
        'Petal_03_Wide':         { limit: 80, speed: 6, amplitude: 0.6, type: 'petal', key: 'Wide' },
        'Petal_04_Elongated':    { limit: 10, speed: 2, amplitude: 0.2, type: 'petal', key: 'Elongated' },
        // Flowers (Arch/Position logic)
        'Flower_Round_01_Pink_Vein_02': { limit: 50, speed: 1, arcHeight: 1.2, swing: 0.6, type: 'flower', key: 'Flower1' },
        'Flower_Round_02_Red_Vein_04':  { limit: 60, speed: 1, arcHeight: 1.4, swing: 0.7, type: 'flower', key: 'Flower2' },
        'Flower_Round_03_Yellow_Vein_02': { limit: 20, speed: 1, arcHeight: 1.1, swing: .8, type: 'flower', key: 'Flower3' },
        'Flower_Round_04_Blue_Vein_02': { limit: 50, speed: 1, arcHeight: 1.3, swing: 1., type: 'flower', key: 'Flower4' }
      };

      // 2. SETUP PHASE: Sort, Select Top/Bottom based on Limit, and Collect
      if (bookStoreRef.current.userData.isSetup === undefined) {
        const allItems = [];
        bookStoreRef.current.traverse((child) => {
          if (child.isMesh && Object.keys(leafConfig).some(p => child.name.startsWith(p))) {
            allItems.push(child);
          }
        });

        // Sort by name for deterministic order
        allItems.sort((a, b) => a.name.localeCompare(b.name));

        bookStoreRef.current.userData.activeSpinners = [];

        // Process each category
        Object.keys(leafConfig).forEach(prefix => {
          const categoryItems = allItems.filter(item => item.name.startsWith(prefix));
          const config = leafConfig[prefix];
          
          // Dynamic limit selection
          let selectedItems = [];
          if (config.limit <= 0) {
            selectedItems = []; // If limit is 0, array stays empty
          } else if (categoryItems.length <= config.limit) {
            selectedItems = categoryItems;
          } else {
            const half = Math.floor(config.limit / 2);
            const top = categoryItems.slice(0, half);
            const bottom = categoryItems.slice(-half);
            selectedItems = [...top, ...bottom];
          }

          selectedItems.forEach(child => {
            child.userData.isSpinner = true;
            child.userData.type = config.type;
            child.userData.basePos = child.position.clone();
            child.userData.baseRot = child.rotation.clone();
            child.userData.speed = config.speed;
            
            // Setup specialized data based on type
            if (config.type === 'petal') {
              child.geometry = child.geometry.clone();
              child.geometry.center();
              const seed = child.position.x + child.position.y + child.position.z;
              child.userData.amplitude = config.amplitude * (0.5 + Math.abs(Math.sin(seed * 10)) * 0.5);
              child.userData.phaseOffset = seed * 5;
            } else {
              // Flower Arch Setup
              child.userData.arcHeight = config.arcHeight;
              child.userData.swing = config.swing;
            }

            bookStoreRef.current.userData.activeSpinners.push(child);
          });
        });
        
        bookStoreRef.current.userData.isSetup = true;
      }

      // 3. ANIMATION LOOP
      const activeItems = bookStoreRef.current.userData.activeSpinners;
      for (let i = 0; i < activeItems.length; i++) {
        const child = activeItems[i];
        
        if (child.userData.type === 'petal') {
          // Rotation Logic
          const oscillation = Math.sin(time * child.userData.speed + child.userData.phaseOffset) * child.userData.amplitude;
          child.rotation.y = child.userData.baseRot.y + oscillation;
          child.rotation.x = child.userData.baseRot.x + (oscillation * 0.2);
        } else {
          // Flower Arch Logic
          // x: horizontal, y: vertical arch (using abs(sin) for height)
          const t = time * child.userData.speed;
          child.position.x = child.userData.basePos.x + Math.sin(t) * child.userData.swing;
          child.position.y = child.userData.basePos.y + Math.abs(Math.sin(t)) * child.userData.arcHeight;
        }
      }
    }

    if (trainRef.current) {
      const angle = (time * trainSpeed) + Math.PI
      
      const x = trainCenter[0] - trainRadius * Math.sin(angle)
      const z = trainCenter[2] - trainRadius * Math.cos(angle)
      const y = trainCenter[1] + getTrackHeight(angle, trainTrackPoints)
      
      trainRef.current.position.set(x, y, z)
      
      const lookAheadAngle = angle + 0.05
      const nextY = trainCenter[1] + getTrackHeight(lookAheadAngle, trainTrackPoints)
      
      const heightDifference = nextY - y
      const forwardDistance = trainRadius * 0.05 
      
      const pitchAngle = Math.atan2(heightDifference, forwardDistance)

      trainRef.current.rotation.y = angle + Math.PI
      trainRef.current.rotation.x = pitchAngle
    }
  })
}