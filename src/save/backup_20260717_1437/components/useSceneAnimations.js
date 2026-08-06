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
  bookStoreRef,
  bigTreeRef, 
  fallHouseTreesRef 
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

    // --- ANIMATE THE BALLOONS ---
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

    // --- ANIMATE THE LEAVES & FLOWERS: BOOKSTORE ---
    if (bookStoreRef && bookStoreRef.current) {
      
      const leafConfig = {
        'Petal_01_Sakura_Cleft':          { limit: 60, speed: 6, amplitude: 0.5, arcHeight: 1.2, swing: 0.6, type: 'petal', key: 'Sakura' },
        'Flower_Round_02_Red':            { limit: 20, speed: 6, amplitude: 0.1, arcHeight: 1.2, swing: 0.6, type: 'petal', key: 'Rounded' },
        'Flower_Round_02_Red_Vein_04':    { limit: 60, speed: 8, amplitude: 0.6, arcHeight: 1.4, swing: 0.7, type: 'petal', key: 'Rounded1' },
        'Petal_03_Wide':                  { limit: 80, speed: 6, amplitude: 0.6, arcHeight: 1.2, swing: 0.6, type: 'petal', key: 'Wide' },
        'Petal_04_Elongated':             { limit: 10, speed: 2, amplitude: 0.2, arcHeight: 1.2, swing: 0.6, type: 'petal', key: 'Elongated' },
        'Flower_Round_01_Pink_Vein_02':   { limit: 50, speed: 1, amplitude: 0.5, arcHeight: 1.2, swing: 0.6, type: 'flower', key: 'Flower1' },
        'Flower_Round_02_Red_Vein_04_FL': { limit: 60, speed: 1, amplitude: 0.5, arcHeight: 1.4, swing: 0.7, type: 'flower', key: 'Flower2' },
        'Flower_Round_03_Yellow_Vein_02': { limit: 20, speed: 1, amplitude: 0.5, arcHeight: 1.1, swing: 0.8, type: 'flower', key: 'Flower3' },
        'Flower_Round_04_Blue_Vein_02':   { limit: 50, speed: 1, amplitude: 0.5, arcHeight: 1.3, swing: 1.0, type: 'flower', key: 'Flower4' }
      };

      if (bookStoreRef.current.userData.isSetup === undefined) {
        const allItems = [];
        bookStoreRef.current.traverse((child) => {
          if (child.isMesh && Object.keys(leafConfig).some(p => child.name.startsWith(p))) {
            allItems.push(child);
          }
        });

        allItems.sort((a, b) => a.name.localeCompare(b.name));
        bookStoreRef.current.userData.activeSpinners = [];

        Object.keys(leafConfig).forEach(prefix => {
          const categoryItems = allItems.filter(item => item.name.startsWith(prefix));
          const config = leafConfig[prefix];
          
          let selectedItems = [];
          if (config.limit <= 0) {
            selectedItems = []; 
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
            
            // Assign all variables safely
            child.userData.amplitude = config.amplitude;
            child.userData.arcHeight = config.arcHeight;
            child.userData.swing = config.swing;
            
            if (config.type === 'petal') {
              child.geometry = child.geometry.clone();
              child.geometry.center();
              const seed = child.position.x + child.position.y + child.position.z;
              child.userData.amplitude = config.amplitude * (0.5 + Math.abs(Math.sin(seed * 10)) * 0.5);
              child.userData.phaseOffset = seed * 5;
            }

            bookStoreRef.current.userData.activeSpinners.push(child);
          });
        });
        
        bookStoreRef.current.userData.isSetup = true;
      }

      const activeItems = bookStoreRef.current.userData.activeSpinners;
      for (let i = 0; i < activeItems.length; i++) {
        const child = activeItems[i];
        
        if (child.userData.type === 'petal') {
          const oscillation = Math.sin(time * child.userData.speed + child.userData.phaseOffset) * child.userData.amplitude;
          child.rotation.y = child.userData.baseRot.y + oscillation;
          child.rotation.x = child.userData.baseRot.x + (oscillation * 0.2);
        } else {
          const t = time * child.userData.speed;
          child.position.x = child.userData.basePos.x + Math.sin(t) * child.userData.swing;
          child.position.y = child.userData.basePos.y + Math.abs(Math.sin(t)) * child.userData.arcHeight;
        }
      }
    }

    // --- ANIMATE THE BIG TREE LEAVES ---
    if (bigTreeRef && bigTreeRef.current) {
      
      const defaultLimit = 80;
      const higherLimit = 60;

      // Fully unified config structure
      const bigTreeConfig = {
        'Leaf_DarkGreen_Bent':       { limit: defaultLimit, speed: 0.5, amplitude: 0.45, arcHeight: 0.01, swing: 0.1, type: 'petal', key: 'DGB' },
        'Leaf_DarkGreen_Long':       { limit: higherLimit,  speed: 6.0, amplitude: 0.02, arcHeight: 0.2, swing: 0.2, type: 'petal', key: 'DGL' },
        'Leaf_DarkGreen_Standard':   { limit: defaultLimit, speed: 0.1, amplitude: 0.38, arcHeight: 0.1, swing: 0.2, type: 'flower', key: 'DGS' },
        'Leaf_DarkGreen_Wide':       { limit: defaultLimit, speed: 0.4, amplitude: 0.61, arcHeight: 0.2, swing: 0.2, type: 'petal', key: 'DGW' },
        'Leaf_LightGreen_Bent':      { limit: defaultLimit, speed: 0.8, amplitude: 0.55, arcHeight: 0.01, swing: 0.1, type: 'petal', key: 'LGB' },
        'Leaf_LightGreen_Long':      { limit: higherLimit,  speed: 0.5, amplitude: 0.29, arcHeight: 0.2, swing: 0.2, type: 'petal', key: 'LGL' },
        'Leaf_LightGreen_Standard':  { limit: defaultLimit, speed: 8.0, amplitude: 0.02, arcHeight: 0.2, swing: 0.2, type: 'petal', key: 'LGS' },
        'Leaf_LightGreen_Wide':      { limit: defaultLimit, speed: 0.7, amplitude: 0.88, arcHeight: 0.01, swing: 0.1, type: 'petal', key: 'LGW' },
        'Leaf_MidGreen_Bent':        { limit: defaultLimit, speed: 0.6, amplitude: 0.06, arcHeight: 0.2, swing: 0.2, type: 'petal', key: 'MGB' },
        'Leaf_MidGreen_Long':        { limit: higherLimit,  speed: 0.9, amplitude: 0.31, arcHeight: 0.1, swing: 0.2, type: 'flower', key: 'MGL' },
        'Leaf_MidGreen_Standard':    { limit: defaultLimit, speed: 0.3, amplitude: 0.09, arcHeight: 0.2, swing: 0.2, type: 'petal', key: 'MGS' },
        'Leaf_MidGreen_Wide':        { limit: defaultLimit, speed: 7.0, amplitude: 0.24, arcHeight: 0.2, swing: 0.2, type: 'petal', key: 'MGW' },
        'Leaf_YellowGreen_Bent':     { limit: higherLimit,  speed: 0.8, amplitude: 0.86, arcHeight: 0.01, swing: 0.1, type: 'flower', key: 'YGB' },
        'Leaf_YellowGreen_Long':     { limit: defaultLimit, speed: 0.5, amplitude: 0.48, arcHeight: 0.2, swing: 0.2, type: 'petal', key: 'YGL' },
        'Leaf_YellowGreen_Standard': { limit: defaultLimit, speed: 0.9, amplitude: 0.35, arcHeight: 0.2, swing: 0.2, type: 'petal', key: 'YGS' },
        'Leaf_YellowGreen_Wide':     { limit: defaultLimit, speed: 0.1, amplitude: 0.69, arcHeight: 0.2, swing: 0.2, type: 'petal', key: 'YGW' }
      };

      if (bigTreeRef.current.userData.isSetup === undefined) {
        const allItems = [];
        bigTreeRef.current.traverse((child) => {
          if (child.isMesh && Object.keys(bigTreeConfig).some(p => child.name.startsWith(p))) {
            allItems.push(child);
          }
        });

        allItems.sort((a, b) => a.name.localeCompare(b.name));
        bigTreeRef.current.userData.activeSpinners = [];

        Object.keys(bigTreeConfig).forEach(prefix => {
          const categoryItems = allItems.filter(item => item.name.startsWith(prefix));
          const config = bigTreeConfig[prefix];
          
          let selectedItems = [];
          if (config.limit <= 0) {
            selectedItems = [];
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
            
            // Assign all variables safely
            child.userData.amplitude = config.amplitude;
            child.userData.arcHeight = config.arcHeight;
            child.userData.swing = config.swing;
            
            if (config.type === 'petal') {
              child.geometry = child.geometry.clone();
              child.geometry.center();
              const seed = child.position.x + child.position.y + child.position.z;
              child.userData.amplitude = config.amplitude * (0.5 + Math.abs(Math.sin(seed * 10)) * 0.5);
              child.userData.phaseOffset = seed * 5;
            }

            bigTreeRef.current.userData.activeSpinners.push(child);
          });
        });
        
        bigTreeRef.current.userData.isSetup = true;
      }

      const activeItems = bigTreeRef.current.userData.activeSpinners;
      for (let i = 0; i < activeItems.length; i++) {
        const child = activeItems[i];
        
        if (child.userData.type === 'petal') {
          const oscillation = Math.sin(time * child.userData.speed + child.userData.phaseOffset) * child.userData.amplitude;
          child.rotation.y = child.userData.baseRot.y + oscillation;
          child.rotation.x = child.userData.baseRot.x + (oscillation * 0.2);
        } else {
          const t = time * child.userData.speed;
          child.position.x = child.userData.basePos.x + Math.sin(t) * child.userData.swing;
          child.position.y = child.userData.basePos.y + Math.abs(Math.sin(t)) * child.userData.arcHeight;
        }
      }
    }

    // --- ANIMATE THE FALL HOUSE TREES ---
    if (fallHouseTreesRef && fallHouseTreesRef.current) {
      
      const defaultLimit = 80;
      const higherLimit = 60;

      // Fully unified config structure
      const fallHouseTreeConfig = {
        'Leaf_DarkGreen_Bent':       { limit: defaultLimit, speed: 1.5, amplitude: 0.45, arcHeight: 1.2, swing: 0.8, type: 'flower', key: 'DGB' },
        'Leaf_DarkGreen_Long':       { limit: higherLimit,  speed: 3.7, amplitude: 0.72, arcHeight: 1.2, swing: 0.8, type: 'petal', key: 'DGL' },
        'Leaf_DarkGreen_Standard':   { limit: defaultLimit, speed: 7.1, amplitude: 0.38, arcHeight: 1.2, swing: 0.8, type: 'petal', key: 'DGS' },
        'Leaf_DarkGreen_Wide':       { limit: defaultLimit, speed: 4.4, amplitude: 0.61, arcHeight: 1.2, swing: 0.8, type: 'flower', key: 'DGW' },
        'Leaf_LightGreen_Bent':      { limit: defaultLimit, speed: 2.8, amplitude: 0.55, arcHeight: 1.2, swing: 0.8, type: 'petal', key: 'LGB' },
        'Leaf_LightGreen_Long':      { limit: higherLimit,  speed: 6.5, amplitude: 0.29, arcHeight: 1.2, swing: 0.8, type: 'petal', key: 'LGL' },
        'Leaf_LightGreen_Standard':  { limit: defaultLimit, speed: 5.9, amplitude: 0.78, arcHeight: 1.2, swing: 0.8, type: 'petal', key: 'LGS' },
        'Leaf_LightGreen_Wide':      { limit: defaultLimit, speed: 3.1, amplitude: 0.42, arcHeight: 1.2, swing: 0.8, type: 'flower', key: 'LGW' },
        'Leaf_MidGreen_Bent':        { limit: defaultLimit, speed: 7.6, amplitude: 0.66, arcHeight: 1.2, swing: 0.8, type: 'petal', key: 'MGB' },
        'Leaf_MidGreen_Long':        { limit: higherLimit,  speed: 4.9, amplitude: 0.31, arcHeight: 1.2, swing: 0.8, type: 'petal', key: 'MGL' },
        'Leaf_MidGreen_Standard':    { limit: defaultLimit, speed: 2.3, amplitude: 0.59, arcHeight: 1.2, swing: 0.8, type: 'petal', key: 'MGS' },
        'Leaf_MidGreen_Wide':        { limit: defaultLimit, speed: 6.2, amplitude: 0.24, arcHeight: 1.2, swing: 0.8, type: 'petal', key: 'MGW' },
        'Leaf_YellowGreen_Bent':     { limit: higherLimit,  speed: 3.8, amplitude: 0.75, arcHeight: 1.2, swing: 0.8, type: 'flower', key: 'YGB' },
        'Leaf_YellowGreen_Long':     { limit: defaultLimit, speed: 5.5, amplitude: 0.48, arcHeight: 1.2, swing: 0.8, type: 'petal', key: 'YGL' },
        'Leaf_YellowGreen_Standard': { limit: defaultLimit, speed: 7.9, amplitude: 0.35, arcHeight: 1.2, swing: 0.8, type: 'petal', key: 'YGS' },
        'Leaf_YellowGreen_Wide':     { limit: defaultLimit, speed: 4.1, amplitude: 0.69, arcHeight: 1.2, swing: 0.8, type: 'petal', key: 'YGW' }
      };

      if (fallHouseTreesRef.current.userData.isSetup === undefined) {
        const allItems = [];
        fallHouseTreesRef.current.traverse((child) => {
          if (child.isMesh && Object.keys(fallHouseTreeConfig).some(p => child.name.startsWith(p))) {
            allItems.push(child);
          }
        });

        allItems.sort((a, b) => a.name.localeCompare(b.name));
        fallHouseTreesRef.current.userData.activeSpinners = [];

        Object.keys(fallHouseTreeConfig).forEach(prefix => {
          const categoryItems = allItems.filter(item => item.name.startsWith(prefix));
          const config = fallHouseTreeConfig[prefix];
          
          let selectedItems = [];
          if (config.limit <= 0) {
            selectedItems = [];
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
            
            // Assign all variables safely
            child.userData.amplitude = config.amplitude;
            child.userData.arcHeight = config.arcHeight;
            child.userData.swing = config.swing;
            
            if (config.type === 'petal') {
              child.geometry = child.geometry.clone();
              child.geometry.center();
              const seed = child.position.x + child.position.y + child.position.z;
              child.userData.amplitude = config.amplitude * (0.5 + Math.abs(Math.sin(seed * 10)) * 0.5);
              child.userData.phaseOffset = seed * 5;
            }

            fallHouseTreesRef.current.userData.activeSpinners.push(child);
          });
        });
        
        fallHouseTreesRef.current.userData.isSetup = true;
      }

      const activeItems = fallHouseTreesRef.current.userData.activeSpinners;
      for (let i = 0; i < activeItems.length; i++) {
        const child = activeItems[i];
        
        if (child.userData.type === 'petal') {
          const oscillation = Math.sin(time * child.userData.speed + child.userData.phaseOffset) * child.userData.amplitude;
          child.rotation.y = child.userData.baseRot.y + oscillation;
          child.rotation.x = child.userData.baseRot.x + (oscillation * 0.2);
        } else {
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