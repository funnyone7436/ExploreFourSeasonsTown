import React, { Suspense, useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'

import BackgroundSphere from './components/BackgroundSphere'
import AppUI from './components/AppUI'
import AudioSyncManager from './components/AudioSyncManager'
import CameraController from './components/CameraController'
import SceneModels from './components/SceneModels'

export default function App() {
  const santaRef = useRef()
  
  const [motionValue, setMotionValue] = useState(0)
  const [isGameActive, setIsGameActive] = useState(true)

  const activeMotion = isGameActive ? motionValue : 0

  return (
    <>
      <AppUI motionValue={activeMotion} isGameActive={isGameActive}/>

      <Canvas>
        <PerspectiveCamera makeDefault fov={75} position={[0, 0, 3]} far={2000} />
        
        <CameraController speed={0.01} initialAngle={Math.PI / 2} />

        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 10, 5]} intensity={5} />

        <Suspense fallback={null}>
          <BackgroundSphere />
          
          {/* You can use this comment style OUTSIDE the tag */}
          <SceneModels 
            // 1. BookStore at 0 degrees (straight back)
            bookStorePos={[0, -2, -15]} 
            bookStoreRot={[0, 0, 0]} 
            bookStoreScale={[1.5, 1.5, 1.5]}
            
            // 2. BigTree 90 degrees anti-clockwise (to the left)
            bigTreePos={[-15, -2, 0]} 
            bigTreeRot={[0, Math.PI / 2, 0]} 
            bigTreeScale={[0.8, 0.8, 0.8]}

            // 3. FallHouse another 90 degrees anti-clockwise (straight ahead/behind camera)
            fallHousePos={[0, -2, 15]} 
            fallHouseRot={[0, Math.PI, 0]} 
            fallHouseScale={[1, 1, 1]}
          />
          
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