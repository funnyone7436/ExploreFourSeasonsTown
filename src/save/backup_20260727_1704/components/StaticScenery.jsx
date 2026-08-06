import React, { useMemo, useRef } from 'react'
import { Clone } from '@react-three/drei'
import { useFrame } from '@react-three/fiber' // ADDED: useFrame for the floating loop

export default function StaticScenery({
  models, radius, height, offsetAngle, a, refs
}) {
  
  // ADDED: Create local refs specifically for the 3 new balloons
  const b1Ref = useRef()
  const b2Ref = useRef()
  const b3Ref = useRef()

  // OPTIMIZATION: All math runs only once when the scene loads
  const p = useMemo(() => {
    const getX = (angle) => -radius * Math.sin(angle)
    const getZ = (angle) => -radius * Math.cos(angle)

    return {
      bookStore: { pos: [getX(offsetAngle - 0.12), height+20, getZ(offsetAngle - 0.12)], rot: [0, offsetAngle - 0.12 + Math.PI, 0], scale: a * 3.3 },
      bigTree: { pos: [getX(offsetAngle + (Math.PI / 2) + 0.06)+32, height+5.2, getZ(offsetAngle + (Math.PI / 2) + 0.06)+32], rot: [0, offsetAngle + (Math.PI / 2) + 0.06 + Math.PI, 0], scale: a * 7.3 },
      fallHouse: { pos: [getX(offsetAngle + Math.PI - 0.36)-16, height+8, getZ(offsetAngle + Math.PI - 0.36)-16], rot: [0, offsetAngle + Math.PI - 0.36 + Math.PI+0.3, 0], scale: a * 0.25 },
      fallHouseTrees: { pos: [getX(offsetAngle + Math.PI - 0.36)-16, height+10, getZ(offsetAngle + Math.PI - 0.36)-16], rot: [0, offsetAngle + Math.PI - 0.36 + Math.PI+0.3, 0], scale: a * 0.25 * 1.2 },
      bike: { pos: [getX(offsetAngle + (Math.PI / 4) + 0.81)-50, height + 3, getZ(offsetAngle + (Math.PI / 4) + 0.81)-50], rot: [0, offsetAngle + (Math.PI / 4) + 0.81 + Math.PI, 0], scale: 1 },
      
      // MAIN AIR BALLOON
      airBalloon: { 
        pos: [getX(offsetAngle + (Math.PI) - 1.6)-40, height, getZ(offsetAngle + (Math.PI) - 1.6)-40], 
        rot: [0, offsetAngle + (Math.PI) - 1.6 + Math.PI, 0], 
        scale: a 
      },
      
      // NEW AIR BALLOONS (Exact same position and rotation as the main balloon)
      airBalloon1: { 
        pos: [getX(offsetAngle-3.2)+40, height+50, getZ(offsetAngle-3.2)+40], 
        rot: [0, offsetAngle + (Math.PI) - .6, 0], 
        scale: a * 0.6 
      },
      airBalloon2: { 
        pos: [getX(offsetAngle-3.2)+40, height+52, getZ(offsetAngle-3.2)+40], 
        rot: [0, offsetAngle + (Math.PI) - .6, 0], 
        scale: a * 0.5 
      },
      airBalloon3: { 
        pos: [getX(offsetAngle-3.2)+40, height+50, getZ(offsetAngle-3.2)+40], 
        rot: [0, offsetAngle + (Math.PI) - 0.6, 0], 
        scale: a * 0.7 
      },
      cat: { pos: [getX(offsetAngle + 0.58)+16, height + 5, getZ(offsetAngle + 0.58)-16], rot: [0, offsetAngle + 0.58 + Math.PI, 0], scale: a * 0.8 },
      girl: { pos: [getX(offsetAngle + 0.21)+10, height + 7., getZ(offsetAngle + 0.21)-10], rot: [0, offsetAngle + 0.21 + Math.PI+0.5, 0], scale: a * 0.46 },
      fence: { pos: [getX(offsetAngle + 0.21 - .200)-8, height+7.4, getZ(offsetAngle + 0.21 - .200)+8], rot: [-0.02, offsetAngle + 0.21 - .200 - Math.PI+0.12, 0], scale: a * 0.5 },
      readingTable: { pos: [getX(offsetAngle - 0.01)+6, height + 3, getZ(offsetAngle - 0.01)-6], rot: [0, offsetAngle - 0.01, 0], scale: a * 0.4 },
      squirrel: { pos: [getX(offsetAngle + (Math.PI) - 1.6 + 0.8)-5, height + 5, getZ(offsetAngle + (Math.PI) - 1.6 + 0.8)-5], rot: [0, offsetAngle + (Math.PI) - 1.6 + 0.8, 0], scale: a * 0.5 },
      boat: { pos: [getX(Math.PI * 0.22), height - 2, getZ(Math.PI * 0.22)], rot: [0, Math.PI * 0.22 + Math.PI + (Math.PI / 1), 0], scale: a * 1.6 },
      whale: { pos: [getX(Math.PI * 0.18) + 15, height + 2, getZ(Math.PI * 0.18) + 15], rot: [0, Math.PI * 0.18 + Math.PI + Math.PI, 0], scale: a * 5 },
      redCar: { pos: [getX(offsetAngle - 0.38) + 12, height + 12, getZ(offsetAngle - 0.38) - 12], rot: [0, offsetAngle - 0.38 + Math.PI + (Math.PI / 2), 0], scale: a * 1 }
    }
  }, [radius, height, offsetAngle, a])

// ADDED: Continuous animation loop for the floating and circular movement
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    // 1. Calculate the sweeping circular angle (From 1.5 PI to 1.7 PI and back)
    // The center is 1.6 PI, and the swing is 0.1 PI in each direction.
    // Starts at 1.5 PI when t=0, reaches 1.7 PI, and returns infinitely.
    const sweepAngle = 1.8 * Math.PI - Math.cos(t * 0.1) * 0.1 * Math.PI;
    
    // 2. Calculate the X and Z coordinates for this angle along the main radius
    const currentX = -radius * Math.sin(sweepAngle);
    const currentZ = -radius * Math.cos(sweepAngle);
    
    // 3. Apply the sweeping X/Z positions (keeping the +40 offsets) and dynamic Y floating
    // The first Math.sin handles the large, slow altitude change (e.g., drifting up and down by 8 to 12 units).
    // The second Math.sin handles the quick, small wind bobble effect.
    if (b1Ref.current) {
      b1Ref.current.position.x = currentX + 40;
      b1Ref.current.position.z = currentZ + 40;
      b1Ref.current.position.y = p.airBalloon1.pos[1] + Math.sin(t * 0.2) * .2 ;
      // ADDED: Force balloon 1 to always look at the camera
      b1Ref.current.lookAt(state.camera.position); 
    }
    if (b2Ref.current) {
      b2Ref.current.position.x = currentX + 40;
      b2Ref.current.position.z = currentZ + 40;
      b2Ref.current.position.y = p.airBalloon2.pos[1] + Math.sin(t * 0.3 + 1.0) * .3;
      // ADDED: Force balloon 2 to always look at the camera
      b2Ref.current.lookAt(state.camera.position); 
    }
    if (b3Ref.current) {
      b3Ref.current.position.x = currentX + 40;
      b3Ref.current.position.z = currentZ + 40;
      b3Ref.current.position.y = p.airBalloon3.pos[1] + Math.sin(t * 0.1 + 2.0) * 0.6;
      // ADDED: Force balloon 3 to always look at the camera
      b3Ref.current.lookAt(state.camera.position); 
    }
  });
  
  
  return (
    <group>
      <group position={p.fallHouse.pos} rotation={p.fallHouse.rot} scale={[p.fallHouse.scale, p.fallHouse.scale, p.fallHouse.scale]}>
        <Clone object={models.fallHouse.scene} />
      </group>
      <group ref={refs.fallHouseTreesRef} position={p.fallHouseTrees.pos} rotation={p.fallHouseTrees.rot} scale={[p.fallHouseTrees.scale, p.fallHouseTrees.scale, p.fallHouseTrees.scale]}>
        <Clone object={models.fallHouseTrees.scene} />
      </group>
      <group ref={refs.bookStoreRef} position={p.bookStore.pos} rotation={p.bookStore.rot} scale={[p.bookStore.scale, p.bookStore.scale, p.bookStore.scale]}>
        <Clone object={models.bookStore.scene} />
      </group>
	  
	  {/* UPDATED: Grouping the flyaways inside 'Flyaway_Anchor' groups, shifted up into the balloon bunch */}
      <group ref={refs.bikeRef} position={p.bike.pos} rotation={p.bike.rot} scale={[p.bike.scale, p.bike.scale, p.bike.scale]}>
        <Clone object={models.bike.scene} />
        <group name="Flyaway_Anchor_0" position={[0, 4.5, 0]}><Clone object={models.balloonString0.scene} /></group>
        <group name="Flyaway_Anchor_1" position={[0, 4.5, 0]}><Clone object={models.balloonString1.scene} /></group>
        <group name="Flyaway_Anchor_2" position={[0, 4.5, 0]}><Clone object={models.balloonString2.scene} /></group>
        <group name="Flyaway_Anchor_3" position={[0, 4.5, 0]}><Clone object={models.balloonString3.scene} /></group>
        <group name="Flyaway_Anchor_4" position={[0, 4.5, 0]}><Clone object={models.balloonString4.scene} /></group>
        <group name="Flyaway_Anchor_5" position={[0, 4.5, 0]}><Clone object={models.balloonString5.scene} /></group>
      </group>
      
      
      <group ref={refs.bigTreeRef} position={p.bigTree.pos} rotation={p.bigTree.rot} scale={[p.bigTree.scale, p.bigTree.scale, p.bigTree.scale]}>
        <Clone object={models.bigTree.scene} />
      </group>
      
      {/* MAIN AIR BALLOON */}
      <group position={p.airBalloon.pos} rotation={p.airBalloon.rot} scale={[p.airBalloon.scale, p.airBalloon.scale, p.airBalloon.scale]}>
        <Clone object={models.airBalloon.scene} />
      </group>
      
      {/* UPDATED: Added local refs to the three new balloons to track them for animation */}
      <group ref={b1Ref} position={p.airBalloon1.pos} rotation={p.airBalloon1.rot} scale={[p.airBalloon1.scale, p.airBalloon1.scale, p.airBalloon1.scale]}>
        <Clone object={models.airBalloon1.scene} />
      </group>
      <group ref={b2Ref} position={p.airBalloon2.pos} rotation={p.airBalloon2.rot} scale={[p.airBalloon2.scale, p.airBalloon2.scale, p.airBalloon2.scale]}>
        <Clone object={models.airBalloon2.scene} />
      </group>
      <group ref={b3Ref} position={p.airBalloon3.pos} rotation={p.airBalloon3.rot} scale={[p.airBalloon3.scale, p.airBalloon3.scale, p.airBalloon3.scale]}>
        <Clone object={models.airBalloon3.scene} />
      </group>
      {/* ------------------------- */}

      <group ref={refs.catRef} position={p.cat.pos} rotation={p.cat.rot} scale={[p.cat.scale, p.cat.scale, p.cat.scale]}>
        <primitive object={models.cat.scene} />
      </group>
      <group ref={refs.girlRef} position={p.girl.pos} rotation={p.girl.rot} scale={[p.girl.scale, p.girl.scale, p.girl.scale]}>
        <primitive object={models.girl.scene} />
      </group>
      <group position={p.fence.pos} rotation={p.fence.rot} scale={[p.fence.scale, p.fence.scale, p.fence.scale]}>
        <Clone object={models.fence.scene} />
      </group>
      <group position={p.readingTable.pos} rotation={p.readingTable.rot} scale={[p.readingTable.scale, p.readingTable.scale, p.readingTable.scale]}>
        <Clone object={models.girlReadingTable.scene} />
      </group>
      <group ref={refs.squirrelRef} position={p.squirrel.pos} rotation={p.squirrel.rot} scale={[p.squirrel.scale, p.squirrel.scale, p.squirrel.scale]}>
        <primitive object={models.squirrel.scene} />
      </group>
      <group ref={refs.boatRef} position={p.boat.pos} rotation={p.boat.rot} scale={[p.boat.scale, p.boat.scale, p.boat.scale]}>
        <Clone object={models.boat.scene} />
      </group>
      <group ref={refs.whaleRef} position={p.whale.pos} rotation={p.whale.rot} scale={[p.whale.scale, p.whale.scale, p.whale.scale]}>
        <Clone object={models.whale.scene} />
      </group>
      <group position={p.redCar.pos} rotation={p.redCar.rot} scale={[p.redCar.scale, p.redCar.scale, p.redCar.scale]}>
        <Clone object={models.redCar.scene} />
      </group>
    </group>
  )
}