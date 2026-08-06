import React, { useMemo, useRef, useEffect } from 'react' 
import { useGLTF, Clone, useAnimations, Text, Billboard } from '@react-three/drei'
import { useThree } from '@react-three/fiber' 
import * as THREE from 'three' 
import { SkeletonUtils } from 'three-stdlib'

import { bookStoreConfig, bigTreeConfig, fallHouseTreeConfig } from './animationConfigs'
import useCharacterAnimations from './useCharacterAnimations'
import useBalloonAnimation from './useBalloonAnimation'
import useTrainAnimation from './useTrainAnimation'
import useLeafAnimation from './useLeafAnimation'
import useWaterAnimation from './useWaterAnimation'
import useSeagullBoids from './useSeagullBoids'

import CelestialSystem from './CelestialSystem'
import StaticScenery from './StaticScenery'

function AnimatedSeagull({ seagullGltf, birdRef, scale }) {
  const clonedScene = useMemo(() => SkeletonUtils.clone(seagullGltf.scene), [seagullGltf.scene]);
  const { actions } = useAnimations(seagullGltf.animations, clonedScene);
  
  useEffect(() => {
    const actionNames = Object.keys(actions);
    if (actionNames.length > 0) {
      setTimeout(() => {
        actionNames.forEach((actionName) => {
          actions[actionName]?.play();
        });
      }, Math.random() * 1000); 
    }
  }, [actions]);

  return (
    <group ref={birdRef} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
}

export default function SceneModels({
  radius = 60,
  height = -2, 
  offsetAngle = Math.PI / 2 - Math.PI / 8 + Math.PI / 3, 
  a = 1
}) {
  const fallHouse = useGLTF('/glb/FallHouse_4.glb')
  const bookStore = useGLTF('/glb/BookStore.glb')
  const bigTree = useGLTF('/glb/BigTree.glb')
  const fallHouseTrees = useGLTF('/glb/FallHouseTrees.glb')
  const bike = useGLTF('/glb/bike1.glb') 
  const airBalloon = useGLTF('/glb/airBalloon.glb')
  const cat = useGLTF('/glb/cat.glb') 
  const girl = useGLTF('/glb/Girl.glb') 
  const fence = useGLTF('/glb/fence.glb')
  const girlReadingTable = useGLTF('/glb/GirlReadingTable.glb')
  const squirrel = useGLTF('/glb/Squirrel.glb') 
  const train = useGLTF('/glb/Train.glb') 
  const moon = useGLTF('/glb/Moon.glb')
  const sun = useGLTF('/glb/Sun.glb')
  const boat = useGLTF('/glb/Boat.glb')
  const whale = useGLTF('/glb/Whale.glb')
  const seagull = useGLTF('/glb/Seagull.glb')
  const twoPersons = useGLTF('/glb/twoPersons.glb')
  const redCar = useGLTF('/glb/RedCar.glb')

  const bikeRef = useRef()
  const catRef = useRef()
  const girlRef = useRef() 
  const squirrelRef = useRef() 
  const trainRef = useRef() 
  const seagullRefs = useRef([...Array(12)].map(() => React.createRef()))
  
  const bookStoreRef = useRef()
  const bigTreeRef = useRef() 
  const fallHouseTreesRef = useRef()
  
  const boatRef = useRef()    
  const whaleRef = useRef()   

  const { actions: catActions } = useAnimations(cat.animations, catRef)
  const { actions: girlActions } = useAnimations(girl.animations, girlRef) 
  const { actions: squirrelActions } = useAnimations(squirrel.animations, squirrelRef) 

  const { gl } = useThree() 

  const trainScale = a          
  const trainRadius = 130            
  const trainSpeed = 0.06            
  const trainCenter = [0, 6, 0] 
  const clipStartAngle = 1.96 
  const clipEndAngle = 0.48   
  const isDebugMode = true  
  const debugColors = ['#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff', '#800080', '#ffc0cb', '#00ffff', '#00ff00', '#ffffff']

  useMemo(() => {
    train.scene.traverse((child) => {
      if (child.isMesh && child.name.startsWith('Body_Cream_')) {
        child.material = child.material.clone()
        child.material.color = new THREE.Color(0xffffff)
        child.material.emissive = new THREE.Color(0xffffff)
        child.material.emissiveIntensity = 12.0 
      }
    })
  }, [train.scene])

  useCharacterAnimations(catActions, girlActions, squirrelActions)
  useBalloonAnimation(bikeRef, bike.scene)
  useTrainAnimation(trainRef, train.scene, trainRadius, trainSpeed, trainCenter, gl, clipStartAngle, clipEndAngle)
  useLeafAnimation(bookStoreRef, bookStoreConfig)
  useLeafAnimation(bigTreeRef, bigTreeConfig)
  useLeafAnimation(fallHouseTreesRef, fallHouseTreeConfig)
  useWaterAnimation(boatRef, whaleRef) 
  useSeagullBoids(seagullRefs)
  
  return (
    <group>
      {/* 1. Static Scenery Math and Rendering */}
      <StaticScenery 
        models={{ fallHouse, bookStore, bigTree, fallHouseTrees, bike, airBalloon, cat, girl, fence, girlReadingTable, squirrel, boat, whale, redCar }}
        radius={radius} height={height} offsetAngle={offsetAngle} a={a}
        refs={{ fallHouseTreesRef, bookStoreRef, bikeRef, bigTreeRef, catRef, girlRef, squirrelRef, boatRef, whaleRef }}
      />

      {/* 2. Celestial Animation Math and Rendering */}
      <CelestialSystem 
        sun={sun} moon={moon} a={a} trainCenter={trainCenter}
      />

      {/* 3. Boids and Train */}
      {seagullRefs.current.map((ref, i) => (
        <AnimatedSeagull 
          key={`seagull-${i}`} 
          birdRef={ref} 
          seagullGltf={seagull} 
          scale={[a * 1, a * 1, a * 1]} 
        />
      ))}

      <group ref={trainRef} scale={[trainScale, trainScale, trainScale]}>
        <Clone object={train.scene} />
      </group>
      
      {/* 4. Debug Data */}
      {isDebugMode && debugColors.map((color, index) => {
        const markerAngle = Math.PI * 0.2 * index;
        const markerX = trainCenter[0] - trainRadius * Math.sin(markerAngle);
        const markerZ = trainCenter[2] - trainRadius * Math.cos(markerAngle);
        const markerY = trainCenter[1]; 
        return (
          <group key={`debug-${index}`} position={[markerX, markerY, markerZ]}>
            <mesh>
              <sphereGeometry args={[2, 16, 16]} />
              <meshBasicMaterial color={color} wireframe />
            </mesh>
            <Billboard position={[0, 5, 0]}>
              <Text fontSize={4} color={color} outlineWidth={0.2} outlineColor="black">
                {`${(index * 0.2).toFixed(1)} PI`}
              </Text>
            </Billboard>
          </group>
        )
      })}
    </group>
  )
}

useGLTF.preload('/glb/FallHouse_4.glb')
useGLTF.preload('/glb/BookStore.glb')
useGLTF.preload('/glb/BigTree.glb')
useGLTF.preload('/glb/FallHouseTrees.glb')
useGLTF.preload('/glb/bike1.glb')
useGLTF.preload('/glb/airBalloon.glb')
useGLTF.preload('/glb/cat.glb')
useGLTF.preload('/glb/Girl.glb')
useGLTF.preload('/glb/fence.glb')
useGLTF.preload('/glb/GirlReadingTable.glb')
useGLTF.preload('/glb/Squirrel.glb')
useGLTF.preload('/glb/Train.glb')
useGLTF.preload('/glb/Sun.glb')
useGLTF.preload('/glb/Boat.glb')
useGLTF.preload('/glb/Whale.glb')
useGLTF.preload('/glb/Seagull.glb')
useGLTF.preload('/glb/twoPersons.glb')
useGLTF.preload('/glb/RedCar.glb')
useGLTF.preload('/glb/Moon.glb')