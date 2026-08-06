import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

function getInterpolatedValues(targetAngle, points) {
  const normalizedAngle = Math.min(targetAngle, Math.PI * 2.0)
  
  for (let i = 0; i < points.length - 1; i++) {
    const angle1 = points[i][0]
    const height1 = points[i][1]
    const scale1 = points[i][2]
    
    const angle2 = points[i + 1][0]
    const height2 = points[i + 1][1]
    const scale2 = points[i + 1][2]
    
    if (normalizedAngle >= angle1 && normalizedAngle <= angle2) {
      if (angle1 === angle2) return { height: height1, scale: scale1 }
      
      const t = (normalizedAngle - angle1) / (angle2 - angle1)
      const smoothT = t * t * (3 - 2 * t) 
      
      const height = height1 + (height2 - height1) * smoothT
      const scale = scale1 + (scale2 - scale1) * smoothT
      
      return { height, scale }
    }
  }
  return { height: points[0][1], scale: points[0][2] }
}

export default function useCelestialAnimation(
  ref,
  {
    radius = 120,
    center = [0, 0, 0],
    pathPoints = [], 
    isActive = false, 
    stepTrigger = 0, // NEW: Listens for user key presses
    onComplete,
	onUpdate // 1. ADD THIS PARAMETER
  }
) {
  const animState = useRef({
    angle: 0,
    pauseTimer: 0,
    lastIndex: -1,
    isWaiting: false,
    lastTrigger: 0
  })

  useFrame((_, delta) => {
    if (!ref.current || pathPoints.length === 0) return
    const s = animState.current

    // If the user pressed a key, clear the waiting state
    if (stepTrigger !== s.lastTrigger) {
      s.isWaiting = false
      s.lastTrigger = stepTrigger
    }

    if (isActive && s.angle < Math.PI * 2.0) {
      
      // 1. Are we waiting for the user?
      if (s.isWaiting) {
         // Do nothing, wait for Enter/Space
      } 
      // 2. Are we waiting for a timer?
      else if (s.pauseTimer > 0) {
        s.pauseTimer -= delta
      } 
      // 3. Move forward!
      else {
        let currentIndex = 0
        let segmentSpeed = 0.5 

        for (let i = 0; i < pathPoints.length - 1; i++) {
          if (s.angle >= pathPoints[i][0] && s.angle < pathPoints[i + 1][0]) {
            currentIndex = i
            segmentSpeed = pathPoints[i][3] !== undefined ? pathPoints[i][3] : 0.000001
            break
          }
        }

        // Did we hit a new waypoint?
        if (currentIndex !== s.lastIndex) {
          s.lastIndex = currentIndex
          const pauseDuration = pathPoints[currentIndex][4] || 10
          
          if (pauseDuration === -1) {
            s.isWaiting = true // -1 means wait indefinitely for key press
          } else if (pauseDuration > 0) {
            s.pauseTimer = pauseDuration // Normal timed pause
          }
        }

        // Apply movement if not paused/waiting
        if (s.pauseTimer <= 0 && !s.isWaiting) {
          s.angle += segmentSpeed * delta
        }

        // Sequence end check
        if (s.angle >= Math.PI * 2.0) {
          s.angle = Math.PI * 2.0 
          if (onComplete) onComplete() 
        }
      }
    }

    const x = center[0] - radius * Math.sin(s.angle)
    const z = center[2] - radius * Math.cos(s.angle)
    const { height, scale } = getInterpolatedValues(s.angle, pathPoints)

    ref.current.position.set(x, height, z)
    ref.current.scale.set(scale, scale, scale)
    ref.current.lookAt(center[0], height, center[2])
	if (onUpdate) onUpdate(s.angle)
  })
}