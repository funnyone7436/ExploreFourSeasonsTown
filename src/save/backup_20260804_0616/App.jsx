import React, { Suspense, useState, useRef, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Leva } from 'leva' 

import AppUI from './components/AppUI'
import CameraController from './components/CameraController'
import SceneModels from './components/SceneModels'
import BackgroundSphere from './components/BackgroundSphere'
import AudioSyncManager from './components/AudioSyncManager' 

export default function App() {
  // 1. ADDED THIS MISSING LINE TO FIX THE CRASH!
  const [isAutoMode, setIsAutoMode] = useState(true) 
 
  const santaRef = useRef()
  const [motionValue, setMotionValue] = useState(0)
  const [isGameActive, setIsGameActive] = useState(true)

  const activeMotion = isGameActive ? motionValue : 0
  const HIDE_DEBUG_PANEL = false 

  return (
    <>
      <Leva hidden={HIDE_DEBUG_PANEL} />
      
      {/* 2. PASS THE STATE AND THE TOGGLE FUNCTION TO THE UI */}
      <AppUI 
        motionValue={activeMotion} 
        isGameActive={isGameActive}
        isAutoMode={isAutoMode}
        setIsAutoMode={setIsAutoMode}
      />

      <Canvas>
        <PerspectiveCamera makeDefault fov={75} position={[1.763, -0.8, 2.427]} far={2000} />
        
        <CameraController 
          speed={0.01} 
          initialAngle={0.2 * Math.PI} 
          isAutoMode={isAutoMode} /* 3. FIXED: Now uses the state instead of being stuck on 'false' */
        />

        <Suspense fallback={null}>
          <BackgroundSphere />
          <SceneModels />
        </Suspense>
      </Canvas>
    </>
  )
}