import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// 1. Component to control a single animated leaf
function Leaf({ url, startPosition, cameraAngleRef, zoneMin, zoneMax, baseSpeed = 0.015, groundDuration = 30, cooldownDuration = 10, groundY = -2.5, dropChance = 0.02 }) {
  const { scene } = useGLTF(url)
  const leafRef = useRef()
  
  const clonedScene = useMemo(() => scene.clone(), [scene])

  const state = useRef({
    phase: 0,
    groundTime: 0,
    cooldownTime: 0, 
    fallSpeed: baseSpeed + Math.random() * 0.01,   
    
    // CHANGED: Restored the original, natural flutter physics
    wobbleSpeed: 1.0 + Math.random() * 2.0,      
    wobbleSize: 0.02 + Math.random() * 0.04,   
    
    rotX: (Math.random() - 0.5) * 0.05,        
    rotY: (Math.random() - 0.5) * 0.05,        
    rotZ: (Math.random() - 0.5) * 0.05,        
    timeOffset: Math.random() * 100            
  })

  useFrame(({ clock }) => {
    if (!leafRef.current) return;
    
    const angle = cameraAngleRef.current;
    const time = clock.getElapsedTime();
    const s = state.current;
    
    const inZone = angle >= zoneMin && angle <= zoneMax;

    if (s.phase === 0) {
      if (inZone) {
        if (Math.random() < dropChance) {
          s.phase = 1; 
        }
      }
    } 
    else if (s.phase === 1) {
      leafRef.current.position.y -= s.fallSpeed;
      leafRef.current.position.x += Math.sin(time * s.wobbleSpeed + s.timeOffset) * s.wobbleSize;
      leafRef.current.position.z += Math.cos(time * s.wobbleSpeed * 0.8 + s.timeOffset) * s.wobbleSize;

      leafRef.current.rotation.x += s.rotX;
      leafRef.current.rotation.y += s.rotY;
      leafRef.current.rotation.z += s.rotZ;

      if (leafRef.current.position.y <= groundY) {
        leafRef.current.position.y = groundY; 
        s.phase = 2; 
        s.groundTime = time; 
      }
    } 
    else if (s.phase === 2) {
      if (time - s.groundTime > groundDuration) {
        leafRef.current.position.set(...startPosition);
        leafRef.current.rotation.set(0, 0, 0);
        s.phase = 3; 
        s.cooldownTime = time; 
      }
    }
    else if (s.phase === 3) {
      if (time - s.cooldownTime > cooldownDuration) {
        s.phase = 0; 
      }
    }
  })

  return <primitive object={clonedScene} ref={leafRef} position={startPosition} />
}

// 2. Main component to manage all leaves
export default function FallingLeaves() {
  const cameraAngleRef = useRef(0)

  useFrame(({ camera }) => {
    let angle = Math.atan2(camera.position.x, camera.position.z);
    if (angle < 0) angle += Math.PI * 2;
    cameraAngleRef.current = angle;
  })

  const allLeavesConfig = useMemo(() => {
    const configs = []
    
    // ==========================================
    // BATCH 1: BIG TREE LEAVES
    // ==========================================
    const treeRadius = 28; 
    const treeAngle = 0.25 * Math.PI; 
    const treeCenterX = Math.sin(treeAngle) * treeRadius;
    const treeCenterZ = Math.cos(treeAngle) * treeRadius;

    for (let i = 0; i < 56; i++) { 
      const x = treeCenterX + (Math.random() - 0.5) * 12; 
      const y = 5 + Math.random() * 1; 
      const z = treeCenterZ + (Math.random() - 0.5) * 12;
      
      configs.push({ 
        url: `/glb/LeafBigTree${i % 9}.glb`, 
        startPos: [x, y, z],
        zoneMin: 0.85 * Math.PI,  
        zoneMax: 1.50 * Math.PI,  
        baseSpeed: 0.02, // CHANGED: Fixed from 0.001 so they actually fall!
        groundDuration: 50,    
        cooldownDuration: 1,
        groundY: -2,
        dropChance: 0.02
      });
    }

    // ==========================================
    // BATCH 2: AUTUMN LEAVES (Original)
    // ==========================================
    const autumnAngle = .58 * Math.PI; 
    const autumnRadius = 70; 
    const autumnCenterX = Math.sin(autumnAngle) * autumnRadius;
    const autumnCenterZ = Math.cos(autumnAngle) * autumnRadius;

    for (let i = 0; i < 80; i++) { 
      const x = autumnCenterX + (Math.random() - 0.5) * 12; 
      const y = 24 + Math.random() * 1; 
      const z = autumnCenterZ + (Math.random() - 0.5) * 12;
      
      configs.push({ 
        url: `/glb/fallLeaf_${i % 15}.glb`, 
        startPos: [x, y, z],
        zoneMin: 1.40 * Math.PI, 
        zoneMax: 1.95 * Math.PI, 
        baseSpeed: 0.2, // CHANGED: Sped up slightly from 0.01
        groundDuration: 45,     
        cooldownDuration: 2,
        groundY: -1.,
        dropChance: 0.0015
      });
    }

    // ==========================================
    // BATCH 3: AUTUMN LEAVES (New Configurable Batch)
    // ==========================================
    const autumnAngle2 = 0.83 * Math.PI; 
    const autumnRadius2 = 70; 
    const autumnCenterX2 = Math.sin(autumnAngle2) * autumnRadius2;
    const autumnCenterZ2 = Math.cos(autumnAngle2) * autumnRadius2;

    for (let i = 0; i < 72; i++) { 
      const x = autumnCenterX2 + (Math.random() - 0.5) * 15; 
      const y = 26 + Math.random() * 5; 
      const z = autumnCenterZ2 + (Math.random() - 0.5) * 15;
      
      configs.push({ 
        url: `/glb/fallLeaf_${i % 15}.glb`, 
        startPos: [x, y, z],
        zoneMin: 1.40 * Math.PI, 
        zoneMax: 1.95 * Math.PI, 
        baseSpeed: 0.05, 
        groundDuration: 55,     
        cooldownDuration: 3,
        groundY: 0.0,
        dropChance: 0.001 
      });
    }

    // ==========================================
    // BATCH 4: BOOKSTORE PINK FLOWERS (GROUP 1)
    // ==========================================
    const flowerAngle1 = 1.55 * Math.PI; 
    const flowerRadius1 = 98; 
    const flowerCenterX1 = Math.sin(flowerAngle1) * flowerRadius1;
    const flowerCenterZ1 = Math.cos(flowerAngle1) * flowerRadius1;

    for (let i = 0; i < 80; i++) { 
      const x = flowerCenterX1 + (Math.random() - 0.5) * 20; 
      const y = 16 + Math.random() * 6; 
      const z = flowerCenterZ1 + (Math.random() - 0.5) * 20;
      
      configs.push({ 
        url: `/glb/pinkFlower_${i % 12}.glb`, 
        startPos: [x, y, z],
        zoneMin: 0.35 * Math.PI, 
        zoneMax: 0.95 * Math.PI, 
        baseSpeed: 0.06, 
        groundDuration: 30,     
        cooldownDuration: 5,
        groundY: 0.5,
        dropChance: 0.002 
      });
    }

    // ==========================================
    // BATCH 5: BOOKSTORE PINK FLOWERS (GROUP 2)
    // ==========================================
    const flowerAngle2 = 1.75 * Math.PI; 
    const flowerRadius2 = 96; 
    const flowerCenterX2 = Math.sin(flowerAngle2) * flowerRadius2;
    const flowerCenterZ2 = Math.cos(flowerAngle2) * flowerRadius2;

    for (let i = 0; i < 80; i++) { 
      const x = flowerCenterX2 + (Math.random() - 0.5) * 20; 
      const y = 16 + Math.random() * 6; 
      const z = flowerCenterZ2 + (Math.random() - 0.5) * 20;
      
      configs.push({ 
        url: `/glb/pinkFlower_${(i % 11) + 12}.glb`, 
        startPos: [x, y, z],
        zoneMin: 0.35 * Math.PI, 
        zoneMax: 0.95 * Math.PI, 
        baseSpeed: 0.06, 
        groundDuration: 40,    
        cooldownDuration: 8,
        groundY: 0.6, 
        dropChance: 0.0015 
      });
    }

    return configs;
  }, [])

  return (
    <group>
      {allLeavesConfig.map((leaf, index) => (
        <Leaf 
          key={index} 
          url={leaf.url} 
          startPosition={leaf.startPos} 
          cameraAngleRef={cameraAngleRef} 
          zoneMin={leaf.zoneMin}
          zoneMax={leaf.zoneMax}
          baseSpeed={leaf.baseSpeed}
          groundDuration={leaf.groundDuration}
          cooldownDuration={leaf.cooldownDuration}
          groundY={leaf.groundY}
          dropChance={leaf.dropChance} 
        />
      ))}
    </group>
  )
}

// Preload all models so they don't pop-in late
useGLTF.preload('/glb/LeafBigTree0.glb')
useGLTF.preload('/glb/LeafBigTree1.glb')
useGLTF.preload('/glb/LeafBigTree2.glb')
useGLTF.preload('/glb/LeafBigTree3.glb')
useGLTF.preload('/glb/LeafBigTree4.glb')
useGLTF.preload('/glb/LeafBigTree5.glb')
useGLTF.preload('/glb/LeafBigTree6.glb')
useGLTF.preload('/glb/LeafBigTree7.glb')
useGLTF.preload('/glb/LeafBigTree8.glb')

useGLTF.preload('/glb/fallLeaf_0.glb')
useGLTF.preload('/glb/fallLeaf_1.glb')
useGLTF.preload('/glb/fallLeaf_2.glb')
useGLTF.preload('/glb/fallLeaf_3.glb')
useGLTF.preload('/glb/fallLeaf_4.glb')
useGLTF.preload('/glb/fallLeaf_5.glb')
useGLTF.preload('/glb/fallLeaf_6.glb')
useGLTF.preload('/glb/fallLeaf_7.glb')
useGLTF.preload('/glb/fallLeaf_8.glb')
useGLTF.preload('/glb/fallLeaf_9.glb')
useGLTF.preload('/glb/fallLeaf_10.glb')
useGLTF.preload('/glb/fallLeaf_11.glb')
useGLTF.preload('/glb/fallLeaf_12.glb')
useGLTF.preload('/glb/fallLeaf_13.glb')
useGLTF.preload('/glb/fallLeaf_14.glb')

useGLTF.preload('/glb/pinkFlower_0.glb')
useGLTF.preload('/glb/pinkFlower_1.glb')
useGLTF.preload('/glb/pinkFlower_2.glb')
useGLTF.preload('/glb/pinkFlower_3.glb')
useGLTF.preload('/glb/pinkFlower_4.glb')
useGLTF.preload('/glb/pinkFlower_5.glb')
useGLTF.preload('/glb/pinkFlower_6.glb')
useGLTF.preload('/glb/pinkFlower_7.glb')
useGLTF.preload('/glb/pinkFlower_8.glb')
useGLTF.preload('/glb/pinkFlower_9.glb')
useGLTF.preload('/glb/pinkFlower_10.glb')
useGLTF.preload('/glb/pinkFlower_11.glb')
useGLTF.preload('/glb/pinkFlower_12.glb')
useGLTF.preload('/glb/pinkFlower_13.glb')
useGLTF.preload('/glb/pinkFlower_14.glb')
useGLTF.preload('/glb/pinkFlower_15.glb')
useGLTF.preload('/glb/pinkFlower_16.glb')
useGLTF.preload('/glb/pinkFlower_17.glb')
useGLTF.preload('/glb/pinkFlower_18.glb')
useGLTF.preload('/glb/pinkFlower_19.glb')
useGLTF.preload('/glb/pinkFlower_20.glb')
useGLTF.preload('/glb/pinkFlower_21.glb')
useGLTF.preload('/glb/pinkFlower_22.glb')