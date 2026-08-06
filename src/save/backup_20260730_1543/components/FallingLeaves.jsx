import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// 1. Component to control a single animated leaf
function Leaf({ url, startPosition, cameraAngleRef, zoneMin, zoneMax, baseSpeed = 0.015, groundDuration = 30, cooldownDuration = 10 }) {
  const { scene } = useGLTF(url)
  const leafRef = useRef()
  
  const clonedScene = useMemo(() => scene.clone(), [scene])

  const state = useRef({
    phase: 0,
    groundTime: 0,
    cooldownTime: 0, 
    fallSpeed: baseSpeed + Math.random() * 0.03,   
    wobbleSpeed: 1 + Math.random() * 2.0,      
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
    
    // Check if the camera is in this specific leaf's designated viewing zone
    const inZone = angle >= zoneMin && angle <= zoneMax;

    if (s.phase === 0) {
      // --- WAITING ON TREE (READY TO FALL) ---
      if (inZone) {
        if (Math.random() < 0.02) {
          s.phase = 1; 
        }
      }
    } 
    else if (s.phase === 1) {
      // --- FALLING STATE ---
      leafRef.current.position.y -= s.fallSpeed;
      leafRef.current.position.x += Math.sin(time * s.wobbleSpeed + s.timeOffset) * s.wobbleSize;
      leafRef.current.position.z += Math.cos(time * s.wobbleSpeed * 0.8 + s.timeOffset) * s.wobbleSize;

      leafRef.current.rotation.x += s.rotX;
      leafRef.current.rotation.y += s.rotY;
      leafRef.current.rotation.z += s.rotZ;

      if (leafRef.current.position.y <= -2.5) {
        leafRef.current.position.y = -2.5; 
        s.phase = 2; 
        s.groundTime = time; 
      }
    } 
    else if (s.phase === 2) {
      // --- ON GROUND STATE ---
      if (time - s.groundTime > groundDuration) {
        leafRef.current.position.set(...startPosition);
        leafRef.current.rotation.set(0, 0, 0);
        s.phase = 3; 
        s.cooldownTime = time; 
      }
    }
    else if (s.phase === 3) {
      // --- COOLDOWN STATE ---
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
    const treeAngle = 0.2 * Math.PI; 
    const treeRadius = 30; 
    const treeCenterX = Math.sin(treeAngle) * treeRadius;
    const treeCenterZ = Math.cos(treeAngle) * treeRadius;

    for (let i = 0; i < 16; i++) { 
      const x = treeCenterX + (Math.random() - 0.5) * 12; 
      const y = 12 + Math.random() * 1; 
      const z = treeCenterZ + (Math.random() - 0.5) * 12;
      
      configs.push({ 
        url: `/glb/LeafBigTree${i % 9}.glb`, 
        startPos: [x, y, z],
        zoneMin: 0.85 * Math.PI,  // Synced exactly with Cicada.mp3 start
        zoneMax: 1.50 * Math.PI,  // Synced exactly with Cicada.mp3 end
        baseSpeed: 0.015,
        groundDuration: 15,    
        cooldownDuration: 10   
      });
    }

    // ==========================================
    // BATCH 2: AUTUMN LEAVES
    // ==========================================
    const autumnAngle = .58 * Math.PI; 
    const autumnRadius = 70; 
    const autumnCenterX = Math.sin(autumnAngle) * autumnRadius;
    const autumnCenterZ = Math.cos(autumnAngle) * autumnRadius;

    for (let i = 0; i < 12; i++) { 
      const x = autumnCenterX + (Math.random() - 0.5) * 12; 
      const y = 24 + Math.random() * 1; 
      const z = autumnCenterZ + (Math.random() - 0.5) * 12;
      
      configs.push({ 
        url: `/glb/fallLeaf_${i % 15}.glb`, 
        startPos: [x, y, z],
        zoneMin: 1.40 * Math.PI, // Synced exactly with Leaves.mp3 start
        zoneMax: 1.95 * Math.PI, // Synced exactly with Leaves.mp3 end
        baseSpeed: 0.1,
        groundDuration: 45,     
        cooldownDuration: 2     
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