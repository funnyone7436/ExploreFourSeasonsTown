import { useFrame } from '@react-three/fiber'
import { useRef, useMemo } from 'react'

const PI_2 = Math.PI * 2.0;
const LUT_RESOLUTION = 720; 

// Pure function to generate the Lookup Table (LUT) once
function generatePathLUT(points, resolution) {
  const heightLUT = new Float32Array(resolution);
  const scaleLUT = new Float32Array(resolution);
  
  if (!points || points.length === 0) return { heightLUT, scaleLUT };

  for (let i = 0; i < resolution; i++) {
    const targetAngle = (i / resolution) * PI_2;
    let h = points[0][1];
    let s = points[0][2];
    
    for (let j = 0; j < points.length - 1; j++) {
      if (targetAngle >= points[j][0] && targetAngle <= points[j + 1][0]) {
        if (points[j][0] === points[j+1][0]) {
          h = points[j][1];
          s = points[j][2];
        } else {
          const t = (targetAngle - points[j][0]) / (points[j + 1][0] - points[j][0]);
          const smoothT = t * t * (3 - 2 * t);
          h = points[j][1] + (points[j + 1][1] - points[j][1]) * smoothT;
          s = points[j][2] + (points[j + 1][2] - points[j][2]) * smoothT;
        }
        break;
      }
    }
    heightLUT[i] = h;
    scaleLUT[i] = s;
  }
  return { heightLUT, scaleLUT };
}

export default function useCelestialAnimation(
  ref,
  {
    radius = 120,
    center = [0, 0, 0],
    pathPoints = [], 
    isActive = false, 
    stepTrigger = 0, 
    onComplete,
    onUpdate 
  }
) {
  const animState = useRef({
    angle: 0,
    pauseTimer: 0,
    lastIndex: -1,
    isWaiting: false,
    lastTrigger: 0
  })

  // OPTIMIZATION: Pre-calculate the entire coordinate array into memory
  const { heightLUT, scaleLUT } = useMemo(() => generatePathLUT(pathPoints, LUT_RESOLUTION), [pathPoints]);

  useFrame((_, delta) => {
    if (!ref.current || pathPoints.length === 0) return
    const s = animState.current

    if (stepTrigger !== s.lastTrigger) {
      s.isWaiting = false
      s.lastTrigger = stepTrigger
    }

    if (isActive && s.angle < PI_2) {
      if (s.isWaiting) {
         // Do nothing, wait
      } else if (s.pauseTimer > 0) {
        s.pauseTimer -= delta
      } else {
        let currentIndex = 0
        let segmentSpeed = 0.5 

        for (let i = 0; i < pathPoints.length - 1; i++) {
          if (s.angle >= pathPoints[i][0] && s.angle < pathPoints[i + 1][0]) {
            currentIndex = i
            segmentSpeed = pathPoints[i][3] !== undefined ? pathPoints[i][3] : 0.000001
            break
          }
        }

        if (currentIndex !== s.lastIndex) {
          s.lastIndex = currentIndex
          const pauseDuration = pathPoints[currentIndex][4] || 10
          
          if (pauseDuration === -1) {
            s.isWaiting = true 
          } else if (pauseDuration > 0) {
            s.pauseTimer = pauseDuration 
          }
        }

        if (s.pauseTimer <= 0 && !s.isWaiting) {
          s.angle += segmentSpeed * delta
        }

        if (s.angle >= PI_2) {
          s.angle = PI_2 
          if (onComplete) onComplete() 
        }
      }
    }

    const x = center[0] - radius * Math.sin(s.angle)
    const z = center[2] - radius * Math.cos(s.angle)
    
    // OPTIMIZATION: O(1) Instant array lookup for height and scale!
    const normalizedAngle = Math.min(s.angle, PI_2);
    const lutIndex = Math.min(Math.floor((normalizedAngle / PI_2) * LUT_RESOLUTION), LUT_RESOLUTION - 1);
    
    const height = heightLUT[lutIndex];
    const scale = scaleLUT[lutIndex];

    ref.current.position.set(x, height, z)
    ref.current.scale.set(scale, scale, scale)
    ref.current.lookAt(center[0], height, center[2])
    if (onUpdate) onUpdate(s.angle)
  })
}