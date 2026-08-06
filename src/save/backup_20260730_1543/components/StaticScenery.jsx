import React, { useMemo, useRef } from 'react'
import { Clone } from '@react-three/drei' 
import { useFrame } from '@react-three/fiber' 

export default function StaticScenery({
  models, radius, height, offsetAngle, a, refs
}) {
  
  const b1Ref = useRef()
  const b2Ref = useRef()
  const b3Ref = useRef()

  const p = useMemo(() => {
    const getX = (angle) => -radius * Math.sin(angle)
    const getZ = (angle) => -radius * Math.cos(angle)

    // ==========================================
    // 🎈 FLYAWAY BALLOONS HELPER FUNCTION
    // Adjust the angles below using simple PI multipliers (e.g., 0.4, 1.0)
    // ==========================================
    const getFlyPos = (piAngle) => {
      const angle = piAngle * Math.PI - 0.04*Math.PI;
      // Change 'height + 3' if you want them floating higher or lower
      return [getX(angle), height + 10 + (Math.random() * 0.5), getZ(angle)];
    };

    return {
      bookStore: { pos: [getX(offsetAngle - 0.12), height+20, getZ(offsetAngle - 0.12)], rot: [0, offsetAngle - 0.12 + Math.PI, 0], scale: a * 3.3 },
      bigTree: { pos: [getX(offsetAngle + (Math.PI / 2) + 0.06)+32, height+5.2, getZ(offsetAngle + (Math.PI / 2) + 0.06)+32], rot: [0, offsetAngle + (Math.PI / 2) + 0.06 + Math.PI, 0], scale: a * 7.3 },
      fallHouse: { pos: [getX(offsetAngle + Math.PI - 0.36)-16, height+8, getZ(offsetAngle + Math.PI - 0.36)-16], rot: [0, offsetAngle + Math.PI - 0.36 + Math.PI+0.3, 0], scale: a * 0.25 },
      fallHouseTrees: { pos: [getX(offsetAngle + Math.PI - 0.36)-16, height+10, getZ(offsetAngle + Math.PI - 0.36)-16], rot: [0, offsetAngle + Math.PI - 0.36 + Math.PI+0.3, 0], scale: a * 0.25 * 1.2 },
      bike: { pos: [getX(offsetAngle + (Math.PI / 4) + 0.94)-50, height + 3, getZ(offsetAngle + (Math.PI / 4) + 0.94)-50], rot: [0, offsetAngle + (Math.PI / 4) + 0.81 + Math.PI, 0], scale: 1 },
      
	  
      // Distributed evenly across your requested 0.4 PI to 1.0 PI range!
      flyaway0: { pos: getFlyPos(0.962*Math.PI), rot: [0, 0, 0], scale: 1 },
      flyaway1: { pos: getFlyPos(0.956*Math.PI), rot: [0, 0, 0], scale: 1 },
      flyaway2: { pos: getFlyPos(0.959*Math.PI), rot: [0, 0, 0], scale: 1 },
      flyaway3: { pos: getFlyPos(0.958*Math.PI), rot: [0, 0, 0], scale: 1 },
      flyaway4: { pos: getFlyPos(0.957*Math.PI), rot: [0, 0, 0], scale: 1 },
      flyaway5: { pos: getFlyPos(0.961*Math.PI), rot: [0, 0, 0], scale: 1 },
      
      airBalloon: { 
        pos: [getX(offsetAngle + (Math.PI) - 1.6)-40, height, getZ(offsetAngle + (Math.PI) - 1.6)-40], 
        rot: [0, offsetAngle + (Math.PI) - 1.6 + Math.PI, 0], 
        scale: a 
      },
      
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

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    const sweepAngle = 1.8 * Math.PI - Math.cos(t * 0.1) * 0.1 * Math.PI;
    const currentX = -radius * Math.sin(sweepAngle);
    const currentZ = -radius * Math.cos(sweepAngle);
    
    if (b1Ref.current) {
      b1Ref.current.position.x = currentX + 40;
      b1Ref.current.position.z = currentZ + 40;
      b1Ref.current.position.y = p.airBalloon1.pos[1] + Math.sin(t * 0.2) * .2 ;
      b1Ref.current.lookAt(state.camera.position); 
    }
    if (b2Ref.current) {
      b2Ref.current.position.x = currentX + 40;
      b2Ref.current.position.z = currentZ + 40;
      b2Ref.current.position.y = p.airBalloon2.pos[1] + Math.sin(t * 0.3 + 1.0) * .3;
      b2Ref.current.lookAt(state.camera.position); 
    }
    if (b3Ref.current) {
      b3Ref.current.position.x = currentX + 40;
      b3Ref.current.position.z = currentZ + 40;
      b3Ref.current.position.y = p.airBalloon3.pos[1] + Math.sin(t * 0.1 + 2.0) * 0.6;
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
	  
      {/* BIKE AND FLYAWAY BALLOONS */}
      {/* We removed position/rotation from the main ref so balloons don't inherit the bike's spot! */}
      <group ref={refs.bikeRef}>
        
        {/* 1. The Bike (Positioned normally) */}
        <group position={p.bike.pos} rotation={p.bike.rot} scale={[p.bike.scale, p.bike.scale, p.bike.scale]}>
          <Clone object={models.bike.scene} />
        </group>
        
        {/* 2. The Balloons (Positioned independently along the perimeter) */}
        <group name="Flyaway_Anchor_0" position={p.flyaway0.pos} rotation={p.flyaway0.rot} scale={[p.flyaway0.scale, p.flyaway0.scale, p.flyaway0.scale]}>
          <Clone object={models.balloonString0.scene} />
        </group>
        <group name="Flyaway_Anchor_1" position={p.flyaway1.pos} rotation={p.flyaway1.rot} scale={[p.flyaway1.scale, p.flyaway1.scale, p.flyaway1.scale]}>
          <Clone object={models.balloonString1.scene} />
        </group>
        <group name="Flyaway_Anchor_2" position={p.flyaway2.pos} rotation={p.flyaway2.rot} scale={[p.flyaway2.scale, p.flyaway2.scale, p.flyaway2.scale]}>
          <Clone object={models.balloonString2.scene} />
        </group>
        <group name="Flyaway_Anchor_3" position={p.flyaway3.pos} rotation={p.flyaway3.rot} scale={[p.flyaway3.scale, p.flyaway3.scale, p.flyaway3.scale]}>
          <Clone object={models.balloonString3.scene} />
        </group>
        <group name="Flyaway_Anchor_4" position={p.flyaway4.pos} rotation={p.flyaway4.rot} scale={[p.flyaway4.scale, p.flyaway4.scale, p.flyaway4.scale]}>
          <Clone object={models.balloonString4.scene} />
        </group>
        <group name="Flyaway_Anchor_5" position={p.flyaway5.pos} rotation={p.flyaway5.rot} scale={[p.flyaway5.scale, p.flyaway5.scale, p.flyaway5.scale]}>
          <Clone object={models.balloonString5.scene} />
        </group>
      </group>
      
      <group ref={refs.bigTreeRef} position={p.bigTree.pos} rotation={p.bigTree.rot} scale={[p.bigTree.scale, p.bigTree.scale, p.bigTree.scale]}>
        <Clone object={models.bigTree.scene} />
      </group>
      
      <group position={p.airBalloon.pos} rotation={p.airBalloon.rot} scale={[p.airBalloon.scale, p.airBalloon.scale, p.airBalloon.scale]}>
        <Clone object={models.airBalloon.scene} />
      </group>
      
      <group ref={b1Ref} position={p.airBalloon1.pos} rotation={p.airBalloon1.rot} scale={[p.airBalloon1.scale, p.airBalloon1.scale, p.airBalloon1.scale]}>
        <Clone object={models.airBalloon1.scene} />
      </group>
      <group ref={b2Ref} position={p.airBalloon2.pos} rotation={p.airBalloon2.rot} scale={[p.airBalloon2.scale, p.airBalloon2.scale, p.airBalloon2.scale]}>
        <Clone object={models.airBalloon2.scene} />
      </group>
      <group ref={b3Ref} position={p.airBalloon3.pos} rotation={p.airBalloon3.rot} scale={[p.airBalloon3.scale, p.airBalloon3.scale, p.airBalloon3.scale]}>
        <Clone object={models.airBalloon3.scene} />
      </group>

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