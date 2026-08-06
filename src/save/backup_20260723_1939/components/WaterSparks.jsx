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

  // 1. PRE-CALCULATION PHASE
  // We calculate the positions and base matrices ONCE when the component mounts.
  const particles = useMemo(() => {
    const temp = []
    const dummy = new THREE.Object3D() // Move dummy inside useMemo so it gets garbage collected
    
    for (let i = 0; i < count; i++) {
      const angle = minAngle + Math.random() * (maxAngle - minAngle)
      
      const radiusOffset = (Math.random() - 0.5) * 200 
      const r = baseRadius + radiusOffset
      
      // Set the static positions
      dummy.position.x = trainCenter[0] - r * Math.sin(angle)
      dummy.position.y = height + (Math.random() - 0.5) * 1.5 
      dummy.position.z = trainCenter[2] - r * Math.cos(angle)
      dummy.updateMatrix() // Compute the heavy 3D matrix math ONLY ONCE per particle
      
      const speed = 1 + Math.random() * 2
      const phase = Math.random() * Math.PI * 2
      
      temp.push({ 
        baseMatrix: dummy.matrix.clone(), // Store the finished matrix
        speed, 
        phase 
      })
    }
    return temp
  }, [count, trainCenter, baseRadius, minAngle, maxAngle, height])

  // Create a single reusable matrix for the render loop to prevent memory leaks
  const tempMatrix = useMemo(() => new THREE.Matrix4(), [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    if (!instancedMeshRef.current) return;

    // 2. BOUNDED SWAY & BOBBING (Runs once per frame for the whole group)
    instancedMeshRef.current.rotation.y = Math.sin(time * 0.15) * 0.08;
    instancedMeshRef.current.position.y = Math.cos(time * 1.3 + 1) * 0.8;

    // 3. OPTIMIZED RENDER LOOP
    // Switched to a standard 'for' loop which processes slightly faster than .forEach()
    for (let i = 0; i < count; i++) {
      const { baseMatrix, speed, phase } = particles[i];
      
      // Calculate the twinkle scale
      const scale = (Math.sin(time * speed + phase) + 1) / 2;
      
      // Copy the static pre-calculated position
      tempMatrix.copy(baseMatrix);
      
      // HACK: Directly modify the matrix array to change the scale.
      // In a 4x4 transformation matrix without rotation, indices 0, 5, and 10 control X, Y, and Z scale.
      // This bypasses `dummy.updateMatrix()` and removes the CPU bottleneck.
      tempMatrix.elements[0] *= scale;
      tempMatrix.elements[5] *= scale;
      tempMatrix.elements[10] *= scale;
      
      instancedMeshRef.current.setMatrixAt(i, tempMatrix);
    }
    
    instancedMeshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={instancedMeshRef} args={[null, null, count]}>
      <circleGeometry args={[0.4, 4]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
    </instancedMesh>
  )
}