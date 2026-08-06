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
import useCelestialAnimation from './useCelestialAnimation'

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

  const sunRef = useRef()
  const moonRef = useRef()

  // --- NEW SEQUENCE STATE ---
  // 'idle' = waiting for Enter key
  // 'sun' = sun is moving
  // 'moon' = moon is moving
  // 'done' = everything finished
// --- NEW SEQUENCE AND STEP STATE ---
  const [sequence, setSequence] = useState('idle')
  const [stepTrigger, setStepTrigger] = useState(0) // Tracks how many times you press Enter/Space

  // Listen for Enter or Space key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.code === 'Space') {
        setSequence((prev) => {
          if (prev === 'idle') return 'sun'
          return prev 
        })
        // Increment trigger to unpause the animation at waypoints
        setStepTrigger((prev) => prev + 1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  // --------------------------
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
    const sunMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPosition;
        float hash(vec3 p) {
            p = fract(p * 0.3183099 + 0.1);
            p *= 17.0;
            return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }
        float noise(in vec3 x) {
            vec3 i = floor(x);
            vec3 f = fract(x);
            f = f * f * (3.0 - 2.0 * f);
            return mix(mix(mix( hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)),f.x),
                           mix( hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)),f.x),f.y),
                       mix(mix( hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)),f.x),
                           mix( hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)),f.x),f.y),f.z);
        }
        void main() {
          float n = noise(vPosition * 2.0); 
          vec3 color1 = vec3(1.0, 0.9, 0.1);
          vec3 color2 = vec3(1.0, 0.35, 0.0);
          gl_FragColor = vec4(mix(color1, color2, n), 1.0);
        }
      `
    });

    const moonMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPosition;
        float hash(vec3 p) {
            p = fract(p * 0.3183099 + 0.1);
            p *= 17.0;
            return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }
        float noise(in vec3 x) {
            vec3 i = floor(x);
            vec3 f = fract(x);
            f = f * f * (3.0 - 2.0 * f);
            return mix(mix(mix( hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)),f.x),
                           mix( hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)),f.x),f.y),
                       mix(mix( hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)),f.x),
                           mix( hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)),f.x),f.y),f.z);
        }
        void main() {
          float n = noise(vPosition * 4.0);
          vec3 brightWhiteYellow = vec3(1.0, 0.98, 0.85); 
          vec3 warmCraterShadow = vec3(0.85, 0.80, 0.60); 
          vec3 finalColor = mix(warmCraterShadow, brightWhiteYellow, n * 0.5 + 0.5);
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    });

    sun.scene.traverse((child) => {
      if (child.isMesh) child.material = sunMaterial;
    });
    moon.scene.traverse((child) => {
      if (child.isMesh) child.material = moonMaterial;
    });
  }, [sun.scene, moon.scene]);

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

  // --- CELESTIAL ANIMATIONS ---
  // Array format: [Angle, Height, Scale, Speed-to-next, Pause-in-seconds]
  
// --- CELESTIAL ANIMATIONS ---
  // Array format: [Angle, Height, Scale, Speed-to-next, Pause (-1 means wait for Enter)]
  
  const sunPath = [
    [Math.PI * 0.0, -20, a * 5.6, 0.5, -1], // Starts hidden, waits for 1st Enter to rise
    [Math.PI * 0.2,  40, a * 4.6, 0.5, -1], // Rises to 30, waits for Enter
    [Math.PI * 0.4,  90, a * 3.0, 0.5, -1], 
    [Math.PI * 0.6, 100, a * 2.0, 0.5, -1], 
    [Math.PI * 0.8, 100, a * 2.0, 0.5, -1], 
    [Math.PI * 1.0, 100, a * 2.0, 0.5, -1], 
    [Math.PI * 1.2, 100, a * 2.0, 0.5, -1], 
    [Math.PI * 1.4,  96, a * 2.0, 0.5, -1], 
    [Math.PI * 1.6,  80, a * 2.0, 0.5, -1], 
    [Math.PI * 1.8,  80, a * 3.6, 0.5, -1], 
    [Math.PI * 1.9,  50, a * 4.0, 0.5, -1], 
    [Math.PI * 2.0, -20, a * 5.6, 0.0, -1]  // Sun finishes and hides
  ]

  const moonPath = [
    [Math.PI * 0.0, -20, a * 5.5, 0.5, -1], // Waits underground while sun moves                 
    [Math.PI * 0.2,  40, a * 4.5, 0.5, -1], // Follows same waypoints if you want!
    [Math.PI * 0.4,  90, a * 3.5, 0.5, -1], 
    [Math.PI * 0.6, 100, a * 1.5, 0.5, -1], 
    [Math.PI * 0.8, 100, a * 1.5, 0.5, -1], 
    [Math.PI * 1.0, 100, a * 1.5, 0.5, -1], 
    [Math.PI * 1.2, 100, a * 1.5, 0.5, -1], 
    [Math.PI * 1.4,  96, a * 1.5, 0.5, -1], 
    [Math.PI * 1.6,  80, a * 2.5, 0.5, -1], 
    [Math.PI * 1.8,  80, a * 3.6, 0.5, -1], 
	[Math.PI * 1.9,  50, a * 4.0, 0.5, -1], 
    [Math.PI * 2.0, -20, a * 5.6, 0.0, -1]        
  ]

  // SUN
  useCelestialAnimation(sunRef, {
    radius: 200, 
    center: [0, 0, 0], 
    pathPoints: sunPath,
    isActive: sequence === 'sun',
    stepTrigger: stepTrigger, // Pass the keypress tracker here
    onComplete: () => setSequence('moon') 
  })

  // MOON
  useCelestialAnimation(moonRef, {
    radius: 200, 
    center: trainCenter, 
    pathPoints: moonPath,
    isActive: sequence === 'moon',
    stepTrigger: stepTrigger, // Pass the keypress tracker here
    onComplete: () => setSequence('done') 
  })
  // ------------------------------------------

  const getX = (angle) => -radius * Math.sin(angle)
  const getZ = (angle) => -radius * Math.cos(angle)

  const bookStoreAngle = offsetAngle - 0.12
  const bookStorePos = [getX(bookStoreAngle), height+20, getZ(bookStoreAngle)]
  const bookStoreRot = [0, bookStoreAngle + Math.PI, 0] 
  const bookStoreScale = a * 3.3 

  const bigTreeAngle = offsetAngle + (Math.PI / 2) + 0.06
  const bigTreePos = [getX(bigTreeAngle)+32, height+5.2, getZ(bigTreeAngle)+32]
  const bigTreeRot = [0, bigTreeAngle + Math.PI, 0]
  const bigTreeScale = a * 7.3 

  const fallHouseAngle = offsetAngle + Math.PI - 0.36
  const fallHousePos = [getX(fallHouseAngle)-16, height+8, getZ(fallHouseAngle)-16]
  const fallHouseRot = [0, fallHouseAngle + Math.PI+0.3, 0]
  const fallHouseScale = a * 0.25 

  const fallHouseTreeAngle = offsetAngle + Math.PI - 0.36
  const fallHouseTreesPos = [getX(fallHouseTreeAngle)-16, height+10, getZ(fallHouseTreeAngle)-16]
  const fallHouseTreesRot = fallHouseRot
  const fallHouseTreesScale = fallHouseScale*1.2

  const bikeAngle = offsetAngle + (Math.PI / 4) + 0.81 
  const bikePos = [getX(bikeAngle)-50, height + 3, getZ(bikeAngle)-50] 
  const bikeRot = [0, bikeAngle + Math.PI, 0]
  const bikeScale = 1 

  const airBalloonAngle = offsetAngle + (Math.PI) - 1.6
  const airBalloonPos = [getX(airBalloonAngle)-40, height , getZ(airBalloonAngle)-40] 
  const airBalloonRot = [0, airBalloonAngle + Math.PI, 0]
  const airBalloonScale = a 

  const catAngle = offsetAngle + 0.58
  const catPos = [getX(catAngle)+16, height + 5, getZ(catAngle)-16] 
  const catRot = [0, catAngle + Math.PI, 0]
  const catScale = a * 0.8

  const girlAngle = offsetAngle + 0.2
  const girlPos = [getX(girlAngle)+10, height + 5., getZ(girlAngle)-10] 
  const girlRot = [0, girlAngle + Math.PI+0.5, 0]
  const girlScale = a*0.46 

  const fenceAngle = girlAngle - .200  
  const fencePos = [getX(fenceAngle)-6, height+6.4, getZ(fenceAngle)+6] 
  const fenceRot = [-0.02, fenceAngle - Math.PI+0.12, 0]
  const fenceScale = a * 0.5 

  const readingTableAngle = offsetAngle - 0.01 
  const readingTablePos = [getX(readingTableAngle)+6, height + 3, getZ(readingTableAngle)-6] 
  const readingTableRot = [0, readingTableAngle, 0]
  const readingTableScale = a * 0.4 

  const squirrelAngle = airBalloonAngle + 0.8
  const squirrelPos = [getX(squirrelAngle)-5, height + 5, getZ(squirrelAngle)-5] 
  const squirrelRot = [0, squirrelAngle, 0]
  const squirrelScale = a * 0.5

  const boatAngle = Math.PI * 0.22
  const boatPos = [getX(boatAngle), height - 2, getZ(boatAngle)] 
  const boatRot = [0, boatAngle + Math.PI + (Math.PI / 1), 0]
  const boatScale = a * 1.6

  const whaleAngle = Math.PI * 0.18
  const whalePos = [getX(whaleAngle) + 15, height + 2, getZ(whaleAngle) + 15] 
  const whaleRot = [0, whaleAngle + Math.PI + Math.PI, 0]
  const whaleScale = a * 5

  const seagullAngle = Math.PI * 0.21
  const seagullPos = [getX(seagullAngle), height + 15, getZ(seagullAngle)] 
  const seagullRot = [0, seagullAngle + Math.PI, 0]
  const seagullScale = a * 1

  const twoPersonsAngle = offsetAngle - 0.10
  const twoPersonsPos = [getX(twoPersonsAngle) + 15, height + 5, getZ(twoPersonsAngle) - 15] 
  const twoPersonsRot = [0, twoPersonsAngle + Math.PI, 0]
  const twoPersonsScale = a * 1 

  const redCarAngle = offsetAngle - 0.38
  const redCarPos = [getX(redCarAngle) + 12, height + 12, getZ(redCarAngle) - 12] 
  const redCarRot = [0, redCarAngle + Math.PI + (Math.PI / 2), 0] 
  const redCarScale = a * 1 
  
  return (
    <group>
      <group position={fallHousePos} rotation={fallHouseRot} scale={[fallHouseScale, fallHouseScale, fallHouseScale]}>
        <Clone object={fallHouse.scene} />
      </group>

      <group ref={fallHouseTreesRef} position={fallHouseTreesPos} rotation={fallHouseTreesRot} scale={[fallHouseTreesScale, fallHouseTreesScale, fallHouseTreesScale]}>
        <Clone object={fallHouseTrees.scene} />
      </group>

      <group ref={bookStoreRef} position={bookStorePos} rotation={bookStoreRot} scale={[bookStoreScale, bookStoreScale, bookStoreScale]}>
        <Clone object={bookStore.scene} />
      </group>

      <group ref={bikeRef} position={bikePos} rotation={bikeRot} scale={[bikeScale, bikeScale, bikeScale]}>
        <Clone object={bike.scene} />
      </group>

      <group ref={bigTreeRef} position={bigTreePos} rotation={bigTreeRot} scale={[bigTreeScale, bigTreeScale, bigTreeScale]}>
        <Clone object={bigTree.scene} />
      </group>

      <group position={airBalloonPos} rotation={airBalloonRot} scale={[airBalloonScale, airBalloonScale, airBalloonScale]}>
        <Clone object={airBalloon.scene} />
      </group>

      <group ref={catRef} position={catPos} rotation={catRot} scale={[catScale, catScale, catScale]}>
        <primitive object={cat.scene} />
      </group>

      <group ref={girlRef} position={girlPos} rotation={girlRot} scale={[girlScale, girlScale, girlScale]}>
        <primitive object={girl.scene} />
      </group>

      <group position={fencePos} rotation={fenceRot} scale={[fenceScale, fenceScale, fenceScale]}>
        <Clone object={fence.scene} />
      </group>

      <group position={readingTablePos} rotation={readingTableRot} scale={[readingTableScale, readingTableScale, readingTableScale]}>
        <Clone object={girlReadingTable.scene} />
      </group>

      <group ref={squirrelRef} position={squirrelPos} rotation={squirrelRot} scale={[squirrelScale, squirrelScale, squirrelScale]}>
        <primitive object={squirrel.scene} />
      </group>

      <group ref={sunRef}>
        <Clone object={sun.scene} />
      </group>
	  
      <group ref={moonRef}>
        <Clone object={moon.scene} />
      </group>

      <group ref={boatRef} position={boatPos} rotation={boatRot} scale={[boatScale, boatScale, boatScale]}>
        <Clone object={boat.scene} />
      </group>

      <group ref={whaleRef} position={whalePos} rotation={whaleRot} scale={[whaleScale, whaleScale, whaleScale]}>
        <Clone object={whale.scene} />
      </group>

      {seagullRefs.current.map((ref, i) => (
        <AnimatedSeagull 
          key={`seagull-${i}`} 
          birdRef={ref} 
          seagullGltf={seagull} 
          scale={[seagullScale, seagullScale, seagullScale]} 
        />
      ))}

      <group position={redCarPos} rotation={redCarRot} scale={[redCarScale, redCarScale, redCarScale]}>
        <Clone object={redCar.scene} />
      </group>

      <group ref={trainRef} scale={[trainScale, trainScale, trainScale]}>
        <Clone object={train.scene} />
      </group>
      
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