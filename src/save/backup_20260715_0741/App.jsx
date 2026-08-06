import React, { Suspense, useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'

import AppUI from './components/AppUI'
import AudioSyncManager from './components/AudioSyncManager'
import CameraController from './components/CameraController'
import SceneModels from './components/SceneModels'
import BackgroundSphere from './components/BackgroundSphere'

export default function App() {
  const santaRef = useRef()
  
  const [motionValue, setMotionValue] = useState(0)
  const [isGameActive, setIsGameActive] = useState(true)

  const activeMotion = isGameActive ? motionValue : 0

  return (
    <>
      <AppUI motionValue={activeMotion} isGameActive={isGameActive}/>

      <Canvas>
        {/* Camera is placed safely back in the center, inside the sphere */}
        <PerspectiveCamera makeDefault fov={75} position={[0, 0, 3]} far={2000} />
        
        {/* Restored the spinning camera */}
        <CameraController speed={0.01} initialAngle={Math.PI / 2} />

        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 10, 5]} intensity={5} />

        <Suspense fallback={null}>
          
          <BackgroundSphere />
          
          {/* A completely clean call, no dangerous array props */}
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