import React, { useMemo, useRef } from 'react' 
import { useGLTF, Clone, useAnimations, Text, Billboard } from '@react-three/drei'
import { useThree } from '@react-three/fiber' 
import * as THREE from 'three' 
import useSceneAnimations from './useSceneAnimations' 

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
  
  // 1. Load the new Ocean/Sky models
  const sun = useGLTF('/glb/Sun.glb')
  const boat = useGLTF('/glb/Boat.glb')
  const whale = useGLTF('/glb/Whale.glb')
  const seagull = useGLTF('/glb/Seagull.glb')

  const bikeRef = useRef()
  const catRef = useRef()
  const girlRef = useRef() 
  const squirrelRef = useRef() 
  const trainRef = useRef() 
  const seagullRef = useRef() // 1. ADD THIS REFERENCE

  const { actions: catActions } = useAnimations(cat.animations, catRef)
  const { actions: girlActions } = useAnimations(girl.animations, girlRef) 
  const { actions: squirrelActions } = useAnimations(squirrel.animations, squirrelRef) 
  const { actions: seagullActions } = useAnimations(seagull.animations, seagullRef)

  const { gl } = useThree() 

  // --- TRAIN CONTROLS ---
  const trainScale = a          
  const trainRadius = 130            
  const trainSpeed = 0.06            
  const trainCenter = [0, 6, 0] 
  
  // --- NEW: CLIPPING TUNNEL CONTROLS (in PI) ---
  const clipStartAngle = 1.96 
  const clipEndAngle = 0.48   
  // ---------------------------------------------
  
  // --- DEBUG MODE CONTROLS ---
  const isDebugMode = true  
  const debugColors = ['#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff', '#800080', '#ffc0cb', '#00ffff', '#00ff00', '#ffffff']
  // ---------------------------

  // --- Fix Sun Material with Custom Noise Shader ---
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

        // Custom 3D Hash and Noise function (replaces Blender's Noise Texture)
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
          // Adjust the 8.0 to make the crayon pattern larger or smaller
          float n = noise(vPosition * 2.0); 
          
          // Defines the bright yellow and deep orange colors (RGB values from 0.0 to 1.0)
          vec3 color1 = vec3(1.0, 0.9, 0.1); // Yellow
          vec3 color2 = vec3(1.0, 0.35, 0.0); // Orange
          
          // Blends the colors together using the noise pattern
          vec3 finalColor = mix(color1, color2, n);
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    })

    sun.scene.traverse((child) => {
      if (child.isMesh) {
        child.material = sunMaterial
      }
    })
  }, [sun.scene])
  // -----------------------------------------------

  useSceneAnimations(
    catActions, 
    girlActions, 
    squirrelActions, 
	seagullActions,
    bikeRef, 
    bike.scene, 
    trainRef, 
    train.scene, 
    trainRadius, 
    trainSpeed, 
    trainCenter,
    gl,
    clipStartAngle, 
    clipEndAngle    
  )

  const getX = (angle) => -radius * Math.sin(angle)
  const getZ = (angle) => -radius * Math.cos(angle)

  // 1. BookStore Math
  const bookStoreAngle = offsetAngle - 0.12
  const bookStorePos = [getX(bookStoreAngle), height+20, getZ(bookStoreAngle)]
  const bookStoreRot = [0, bookStoreAngle + Math.PI, 0] 
  const bookStoreScale = a * 3.3 

  // 2. BigTree Math
  const bigTreeAngle = offsetAngle + (Math.PI / 2) + 0.06
  const bigTreePos = [getX(bigTreeAngle)+32, height+5.2, getZ(bigTreeAngle)+32]
  const bigTreeRot = [0, bigTreeAngle + Math.PI, 0]
  const bigTreeScale = a * 7.3 

  // 3. FallHouse Math
  const fallHouseAngle = offsetAngle + Math.PI - 0.36
  const fallHousePos = [getX(fallHouseAngle)-16, height+8, getZ(fallHouseAngle)-16]
  const fallHouseRot = [0, fallHouseAngle + Math.PI+0.3, 0]
  const fallHouseScale = a * 0.25 

  // 4. FallHouse Trees Math
  const fallHouseTreeAngle = offsetAngle + Math.PI - 0.36
  const fallHouseTreesPos = [getX(fallHouseTreeAngle)-16, height+10, getZ(fallHouseTreeAngle)-16]
  const fallHouseTreesRot = fallHouseRot
  const fallHouseTreesScale = fallHouseScale*1.2

  // 5. Bike Math
  const bikeAngle = offsetAngle + (Math.PI / 4) + 0.81 
  const bikePos = [getX(bikeAngle)-50, height + 3, getZ(bikeAngle)-50] 
  const bikeRot = [0, bikeAngle + Math.PI, 0]
  const bikeScale = 1 

  // 6. Air Balloon Math
  const airBalloonAngle = offsetAngle + (Math.PI) - 1.6
  const airBalloonPos = [getX(airBalloonAngle)-40, height , getZ(airBalloonAngle)-40] 
  const airBalloonRot = [0, airBalloonAngle + Math.PI, 0]
  const airBalloonScale = a 

  // 7. Cat Math 
  const catAngle = offsetAngle + 0.58
  const catPos = [getX(catAngle)+16, height + 5, getZ(catAngle)-16] 
  const catRot = [0, catAngle + Math.PI, 0]
  const catScale = a * 0.8

  // 8. Girl Math 
  const girlAngle = offsetAngle + 0.2
  const girlPos = [getX(girlAngle)+10, height + 5., getZ(girlAngle)-10] 
  const girlRot = [0, girlAngle + Math.PI+0.5, 0]
  const girlScale = a*0.46 

  // 9. Fence Math 
  const fenceAngle = girlAngle - .200  
  const fencePos = [getX(fenceAngle)-6, height+6.4, getZ(fenceAngle)+6] 
  const fenceRot = [-0.02, fenceAngle - Math.PI+0.12, 0]
  const fenceScale = a * 0.5 

  // 10. GirlReadingTable Math 
  const readingTableAngle = offsetAngle - 0.01 
  const readingTablePos = [getX(readingTableAngle)+6, height + 3, getZ(readingTableAngle)-6] 
  const readingTableRot = [0, readingTableAngle, 0]
  const readingTableScale = a * 0.4 

  // 11. Squirrel Math 
  const squirrelAngle = airBalloonAngle + 0.8
  const squirrelPos = [getX(squirrelAngle)-5, height + 5, getZ(squirrelAngle)-5] 
  const squirrelRot = [0, squirrelAngle, 0]
  const squirrelScale = a * 0.5

  // 12. Sun Math
  const sunAngle = Math.PI * 0.20
  const sunPos = [getX(sunAngle), height + 10, getZ(sunAngle)] 
  const sunRot = [0, sunAngle + Math.PI, 0]
  const sunScale = a * 1 

  // 13. Boat Math 
  const boatAngle = Math.PI * 0.22
  const boatPos = [getX(boatAngle), height - 2, getZ(boatAngle)] 
  const boatRot = [0, boatAngle + Math.PI + (Math.PI / 1), 0]
  const boatScale = a * 1.

  // 14. Whale Math
  const whaleAngle = Math.PI * 0.18
  const whalePos = [getX(whaleAngle) + 15, height + 2, getZ(whaleAngle) + 15] 
  const whaleRot = [0, whaleAngle + Math.PI + (Math.PI / 1), 0]
  const whaleScale = a * 1

  // 15. Seagull Math 
  const seagullAngle = Math.PI * 0.21
  const seagullPos = [getX(seagullAngle), height + 15, getZ(seagullAngle)] 
  const seagullRot = [0, seagullAngle + Math.PI, 0]
  const seagullScale = a * 1

  return (
    <group>
      <group position={fallHousePos} rotation={fallHouseRot} scale={[fallHouseScale, fallHouseScale, fallHouseScale]}>
        <Clone object={fallHouse.scene} />
      </group>

      <group position={fallHouseTreesPos} rotation={fallHouseTreesRot} scale={[fallHouseTreesScale, fallHouseTreesScale, fallHouseTreesScale]}>
        <Clone object={fallHouseTrees.scene} />
      </group>

      <group position={bookStorePos} rotation={bookStoreRot} scale={[bookStoreScale, bookStoreScale, bookStoreScale]}>
        <Clone object={bookStore.scene} />
      </group>

      <group ref={bikeRef} position={bikePos} rotation={bikeRot} scale={[bikeScale, bikeScale, bikeScale]}>
        <Clone object={bike.scene} />
      </group>

      <group position={bigTreePos} rotation={bigTreeRot} scale={[bigTreeScale, bigTreeScale, bigTreeScale]}>
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

      {/* Sun */}
      <group position={sunPos} rotation={sunRot} scale={[sunScale, sunScale, sunScale]}>
        <Clone object={sun.scene} />
      </group>

      {/* Boat */}
      <group position={boatPos} rotation={boatRot} scale={[boatScale, boatScale, boatScale]}>
        <Clone object={boat.scene} />
      </group>

      {/* Whale */}
      <group position={whalePos} rotation={whaleRot} scale={[whaleScale, whaleScale, whaleScale]}>
        <Clone object={whale.scene} />
      </group>

      {/* Seagull */}
	  <group ref={seagullRef} position={seagullPos} rotation={seagullRot} scale={[seagullScale, seagullScale, seagullScale]}>
        {/* Because it's animated, it's safer to use primitive instead of Clone, just like your cat and squirrel */}
        <primitive object={seagull.scene} />
      </group>

      {/* Train Component */}
      <group ref={trainRef} scale={[trainScale, trainScale, trainScale]}>
        <Clone object={train.scene} />
      </group>

      {/* --- DEBUG MARKERS --- */}
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
              <Text 
                fontSize={4} 
                color={color} 
                outlineWidth={0.2} 
                outlineColor="black"
              >
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