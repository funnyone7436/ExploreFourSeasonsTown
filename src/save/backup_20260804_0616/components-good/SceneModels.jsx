import React, { useMemo, useRef, useEffect, useState } from 'react' 
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

import WaterSparks from './WaterSparks'
import Fireflies from './Fireflies'
import OceanAudio from './OceanAudio'
import FallingLeaves from './FallingLeaves'

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
  a = 1,
  musicTrigger // <--- 1. ACCEPT THE NEW PROP
}) {
  const fallHouse = useGLTF(`${import.meta.env.BASE_URL}glb/FallHouse_4.glb`)
  const bookStore = useGLTF(`${import.meta.env.BASE_URL}glb/BookStore.glb`)
  const bigTree = useGLTF(`${import.meta.env.BASE_URL}glb/BigTree.glb`)
  const fallHouseTrees = useGLTF(`${import.meta.env.BASE_URL}glb/FallHouseTrees.glb`)
  const bike = useGLTF(`${import.meta.env.BASE_URL}glb/bike1.glb`) 
  
  const airBalloon = useGLTF(`${import.meta.env.BASE_URL}glb/airBalloon.glb`)
  const airBalloon1 = useGLTF(`${import.meta.env.BASE_URL}glb/airBalloon1.glb`) 
  const airBalloon2 = useGLTF(`${import.meta.env.BASE_URL}glb/airBalloon2.glb`) 
  const airBalloon3 = useGLTF(`${import.meta.env.BASE_URL}glb/airBalloon3.glb`) 
  
  const balloonString0 = useGLTF(`${import.meta.env.BASE_URL}glb/balloonString0.glb`)
  const balloonString1 = useGLTF(`${import.meta.env.BASE_URL}glb/balloonString1.glb`)
  const balloonString2 = useGLTF(`${import.meta.env.BASE_URL}glb/balloonString2.glb`)
  const balloonString3 = useGLTF(`${import.meta.env.BASE_URL}glb/balloonString3.glb`)
  const balloonString4 = useGLTF(`${import.meta.env.BASE_URL}glb/balloonString4.glb`)
  const balloonString5 = useGLTF(`${import.meta.env.BASE_URL}glb/balloonString5.glb`)

  const cat = useGLTF(`${import.meta.env.BASE_URL}glb/cat.glb`) 
  const girl = useGLTF(`${import.meta.env.BASE_URL}glb/Girl.glb`) 
  const fence = useGLTF(`${import.meta.env.BASE_URL}glb/fence.glb`)
  const girlReadingTable = useGLTF(`${import.meta.env.BASE_URL}glb/GirlReadingTable.glb`)
  const squirrel = useGLTF(`${import.meta.env.BASE_URL}glb/Squirrel.glb`) 
  const train = useGLTF(`${import.meta.env.BASE_URL}glb/Train.glb`) 
  const moon = useGLTF(`${import.meta.env.BASE_URL}glb/Moon.glb`)
  const sun = useGLTF(`${import.meta.env.BASE_URL}glb/Sun.glb`)
  const boat = useGLTF(`${import.meta.env.BASE_URL}glb/Boat.glb`)
  const whale = useGLTF(`${import.meta.env.BASE_URL}glb/Whale.glb`)
  const seagull = useGLTF(`${import.meta.env.BASE_URL}glb/Seagull.glb`)
  const twoPersons = useGLTF(`${import.meta.env.BASE_URL}glb/twoPersons.glb`)
  const redCar = useGLTF(`${import.meta.env.BASE_URL}glb/RedCar.glb`)

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
  const isDebugMode = false  
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
    
    const flyawayStrings = [balloonString0, balloonString1, balloonString2, balloonString3, balloonString4, balloonString5];
    flyawayStrings.forEach((glb, idx) => {
      glb.scene.traverse((child) => {
        if (child.isMesh) {
          child.name = 'Sphere_Flyaway_' + idx + '_' + child.name;
        }
      })
    })
  }, [train.scene, balloonString0, balloonString1, balloonString2, balloonString3, balloonString4, balloonString5])
  
  useCharacterAnimations(catActions, girlActions, squirrelActions)
  useBalloonAnimation(bikeRef, bike.scene)
  useTrainAnimation(trainRef, train.scene, trainRadius, trainSpeed, trainCenter, gl, clipStartAngle, clipEndAngle)
  
  useLeafAnimation(bookStoreRef, bookStoreConfig, 0.1)
  useLeafAnimation(fallHouseTreesRef, fallHouseTreeConfig, 0.15)
  useLeafAnimation(bigTreeRef, bigTreeConfig, 0.15)
  useWaterAnimation(boatRef, whaleRef) 
  useSeagullBoids(seagullRefs)
  
  return (
    <group>
      <StaticScenery 
        models={{ 
          fallHouse, bookStore, bigTree, fallHouseTrees, bike, 
          airBalloon, airBalloon1, airBalloon2, airBalloon3, 
          balloonString0, balloonString1, balloonString2, balloonString3, balloonString4, balloonString5, 
          cat, girl, fence, girlReadingTable, squirrel, boat, whale, redCar 
        }}
        radius={radius} height={height} offsetAngle={offsetAngle} a={a}
        refs={{ fallHouseTreesRef, bookStoreRef, bikeRef, bigTreeRef, catRef, girlRef, squirrelRef, boatRef, whaleRef }}
      />
      <CelestialSystem sun={sun} moon={moon} a={a} trainCenter={trainCenter} />

      <Fireflies />
      <FallingLeaves />
      
      {/* 2. PASS THE TRIGGER TO THE AUDIO COMPONENT */}
      <OceanAudio />

      <WaterSparks trainCenter={trainCenter} baseRadius={trainRadius+8} />

      {seagullRefs.current.map((ref, i) => (
        <AnimatedSeagull key={`seagull-${i}`} birdRef={ref} seagullGltf={seagull} scale={[a * 1, a * 1, a * 1]} />
      ))}
      <group ref={trainRef} scale={[trainScale, trainScale, trainScale]}>
        <Clone object={train.scene} />
      </group>
    </group>
  )
}