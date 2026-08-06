import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function WaterSparks({ 
  count = 160, 
  trainCenter, 
  baseRadius, 
  minAngle = 0.04 * Math.PI, 
  maxAngle = 0.36 * Math.PI, 
  height = -1 
}) {
  const instancedMeshRef = useRef()

  const particles = useMemo(() => {
    const temp = []
    const dummy = new THREE.Object3D() 
    
    for (let i = 0; i < count; i++) {
      const angle = minAngle + Math.random() * (maxAngle - minAngle)
      
      const radiusOffset = (Math.random() - 0.5) * 200 
      const r = baseRadius + radiusOffset
      
      dummy.position.x = trainCenter[0] - r * Math.sin(angle)
      dummy.position.y = height + (Math.random() - 0.5) * 1.5 
      dummy.position.z = trainCenter[2] - r * Math.cos(angle)
      
      // Randomize the base scale so the spheres have varying starting sizes
      const baseScale = 0.5 + Math.random() * 1.0;
      dummy.scale.set(baseScale, baseScale, baseScale);

      dummy.updateMatrix() 
      
      const speed = 1 + Math.random() * 2
      const phase = Math.random() * Math.PI * 2
      
      temp.push({ 
        baseMatrix: dummy.matrix.clone(), 
        speed, 
        phase 
      })
    }
    return temp
  }, [count, trainCenter, baseRadius, minAngle, maxAngle, height])

  // Reuse objects to prevent memory leaks in the render loop
  const tempMatrix = useMemo(() => new THREE.Matrix4(), [])
  const scaleVector = useMemo(() => new THREE.Vector3(), []) 

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    if (!instancedMeshRef.current) return;

    instancedMeshRef.current.rotation.y = Math.sin(time * 0.15) * 0.08;
    instancedMeshRef.current.position.y = Math.cos(time * 1.3 + 1) * 0.8;

    for (let i = 0; i < count; i++) {
      const { baseMatrix, speed, phase } = particles[i];
      
      const scale = (Math.sin(time * speed + phase) + 1) / 2;
      
      tempMatrix.copy(baseMatrix);
      
      // Safely apply the twinkle scale using the reusable Vector3
      scaleVector.set(scale, scale, scale);
      tempMatrix.scale(scaleVector);
      
      instancedMeshRef.current.setMatrixAt(i, tempMatrix);
    }
    
    instancedMeshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={instancedMeshRef} args={[null, null, count]}>
      {/* 
        Replaced the shapeGeometry with a sphereGeometry.
        0.3 is the radius. 8 and 8 are the width/height segments (kept low for high performance).
      */}
      <sphereGeometry args={[0.3, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
    </instancedMesh>
  )
}