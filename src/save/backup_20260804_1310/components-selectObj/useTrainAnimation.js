import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PI_2 = Math.PI * 2;
const LUT_RESOLUTION = 720; // Pre-calculate 720 distinct steps around the circle

const trainTrackPoints = [
  [0,             12.6],   
  [Math.PI * 0.5, 18],  
  [Math.PI * 0.6, 18],  
  [Math.PI * 1.0, 18],  
  [Math.PI * 1.1, 19],  
  [Math.PI * 1.2, 19],
  [Math.PI * 1.3, 17],
  [Math.PI * 1.4, 16.5],    
  [Math.PI * 1.5, 17],  
  [Math.PI * 1.8, 17],  
  [Math.PI * 1.95, 12.6],  
  [Math.PI * 2.0, 12.6]    
]

// Pure function to generate the Lookup Table (LUT) once
function generateHeightLUT(points, resolution) {
  const lut = new Float32Array(resolution);
  for (let i = 0; i < resolution; i++) {
    const targetAngle = (i / resolution) * PI_2;
    let height = 0;
    for (let j = 0; j < points.length - 1; j++) {
      if (targetAngle >= points[j][0] && targetAngle <= points[j + 1][0]) {
        const t = (targetAngle - points[j][0]) / (points[j + 1][0] - points[j][0]);
        const smoothT = t * t * (3 - 2 * t);
        height = points[j][1] + (points[j + 1][1] - points[j][1]) * smoothT;
        break;
      }
    }
    lut[i] = height;
  }
  return lut;
}

export default function useTrainAnimation(trainRef, trainScene, trainRadius, trainSpeed, trainCenter, gl, clipStartAngle, clipEndAngle) {
  
  const forwardDistance = useMemo(() => trainRadius * 0.05, [trainRadius]);
  
  // OPTIMIZATION: Pre-calculate the entire track geometry into memory exactly once!
  const heightLUT = useMemo(() => generateHeightLUT(trainTrackPoints, LUT_RESOLUTION), []);

  useEffect(() => {
    if (!trainRef.current || !gl) return

    gl.localClippingEnabled = true
    const centerVec = new THREE.Vector3(trainCenter[0], trainCenter[1], trainCenter[2])

    const normal1 = new THREE.Vector3(Math.cos(Math.PI * clipStartAngle), 0, -Math.sin(Math.PI * clipStartAngle))
    const plane1 = new THREE.Plane().setFromNormalAndCoplanarPoint(normal1, centerVec)

    const normal2 = new THREE.Vector3(-Math.cos(Math.PI * clipEndAngle), 0, Math.sin(Math.PI * clipEndAngle))
    const plane2 = new THREE.Plane().setFromNormalAndCoplanarPoint(normal2, centerVec)

    trainRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        const applyClipping = (mat) => {
          mat.clippingPlanes = [plane1, plane2]
          mat.clipIntersection = true 
          mat.side = THREE.DoubleSide 
          mat.needsUpdate = true 
        }

        if (Array.isArray(child.material)) {
          child.material = child.material.map(m => m.clone())
          child.material.forEach(applyClipping)
        } else {
          child.material = child.material.clone()
          applyClipping(child.material)
        }
      }
    })
  }, [trainScene, trainCenter, gl, clipStartAngle, clipEndAngle])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    if (trainRef.current) {
      const angle = (time * trainSpeed) + Math.PI
      
      const x = trainCenter[0] - trainRadius * Math.sin(angle)
      const z = trainCenter[2] - trainRadius * Math.cos(angle)
      
      // OPTIMIZATION: O(1) Instant array lookup instead of looping through coordinates!
      const normalizedAngle = ((angle % PI_2) + PI_2) % PI_2;
      const lutIndex = Math.floor((normalizedAngle / PI_2) * LUT_RESOLUTION) % LUT_RESOLUTION;
      const y = trainCenter[1] + heightLUT[lutIndex];
      
      trainRef.current.position.set(x, y, z)
      
      const lookAheadAngle = angle + 0.05
      const normalizedLookAhead = ((lookAheadAngle % PI_2) + PI_2) % PI_2;
      const lookAheadIndex = Math.floor((normalizedLookAhead / PI_2) * LUT_RESOLUTION) % LUT_RESOLUTION;
      const nextY = trainCenter[1] + heightLUT[lookAheadIndex];
      
      const pitchAngle = Math.atan2(nextY - y, forwardDistance)

      trainRef.current.rotation.y = angle + Math.PI
      trainRef.current.rotation.x = pitchAngle
    }
  })
}