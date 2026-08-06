import React, { Suspense, useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Leva } from 'leva' 

import AppUI from './components/AppUI'
import CameraController from './components/CameraController'
import SceneModels from './components/SceneModels'
import BackgroundSphere from './components/BackgroundSphere'
import AudioSyncManager from './components/AudioSyncManager' 

export default function App() {
  const santaRef = useRef()
  
  const [motionValue, setMotionValue] = useState(0)
  const [isGameActive, setIsGameActive] = useState(true)
  


  const activeMotion = isGameActive ? motionValue : 0
  
  // 🎛️ MASTER DEBUG SWITCH: 
  // Set this to true to hide BOTH the Leva color panel and the Camera Pause button!
  const HIDE_DEBUG_PANEL = false 

  return (
    <>
      <Leva hidden={HIDE_DEBUG_PANEL} />
      
      <AppUI motionValue={activeMotion} isGameActive={isGameActive}/>


      <Canvas>
        <PerspectiveCamera makeDefault fov={75} position={[0, -0.8, 3]} far={2000} />
        
        <CameraController 
          speed={0.01} 
          initialAngle={Math.PI / 2} 
        />

        <Suspense fallback={null}>

          <BackgroundSphere />
          <SceneModels />
          
          <AudioSyncManager 
            santaRef={santaRef} 
            motionValue={activeMotion}
            onFirstLoopComplete={() => setIsGameActive(false)}
          />
        </Suspense>
      </Canvas>
    </>
  )
}