import React, { useMemo } from 'react'
import { Clone } from '@react-three/drei'

export default function StaticScenery({
  models, radius, height, offsetAngle, a, refs
}) {
  
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
      airBalloon: { pos: [getX(offsetAngle + (Math.PI) - 1.6)-40, height , getZ(offsetAngle + (Math.PI) - 1.6)-40], rot: [0, offsetAngle + (Math.PI) - 1.6 + Math.PI, 0], scale: a },
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
      <group ref={refs.bikeRef} position={p.bike.pos} rotation={p.bike.rot} scale={[p.bike.scale, p.bike.scale, p.bike.scale]}>
        <Clone object={models.bike.scene} />
      </group>
      <group ref={refs.bigTreeRef} position={p.bigTree.pos} rotation={p.bigTree.rot} scale={[p.bigTree.scale, p.bigTree.scale, p.bigTree.scale]}>
        <Clone object={models.bigTree.scene} />
      </group>
      <group position={p.airBalloon.pos} rotation={p.airBalloon.rot} scale={[p.airBalloon.scale, p.airBalloon.scale, p.airBalloon.scale]}>
        <Clone object={models.airBalloon.scene} />
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