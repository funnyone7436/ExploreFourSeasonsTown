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
  
  // State to track if the camera is currently paused
  const [isCameraPaused, setIsCameraPaused] = useState(false)

  const activeMotion = isGameActive ? motionValue : 0
  
  // 🎛️ MASTER DEBUG SWITCH: 
  // Set this to true to hide BOTH the Leva color panel and the Camera Pause button!
  const HIDE_DEBUG_PANEL = false 

  return (
    <>
      <Leva hidden={HIDE_DEBUG_PANEL} />
      
      <AppUI motionValue={activeMotion} isGameActive={isGameActive}/>

      {/* The pause button will only show up if HIDE_DEBUG_PANEL is false */}
      {!HIDE_DEBUG_PANEL && (
        <button 
          onClick={() => setIsCameraPaused(!isCameraPaused)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            padding: '10px 20px',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: isCameraPaused ? '#4caf50' : '#f44336', 
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            transition: 'background-color 0.3s ease'
          }}
        >
          {isCameraPaused ? '▶ Resume Camera' : '⏸ Pause Camera'}
        </button>
      )}

      <Canvas>
        <PerspectiveCamera makeDefault fov={75} position={[0, -0.8, 3]} far={2000} />
        
        <CameraController 
          speed={0.01} 
          initialAngle={Math.PI / 2} 
          isPaused={isCameraPaused} 
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