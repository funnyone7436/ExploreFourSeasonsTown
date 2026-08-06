import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

// Helper to calculate smooth transitions between specific angles
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
      // Prevent division by zero if angles are identical
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
    onComplete
  }
) {
  // Track internal state manually instead of using elapsed global time
  const animState = useRef({
    angle: 0,
    pauseTimer: 0,
    lastIndex: -1
  })

  useFrame((_, delta) => {
    if (!ref.current || pathPoints.length === 0) return

    const s = animState.current

    // Only progress the math if this celestial body's turn is active
    if (isActive && s.angle < Math.PI * 2.0) {
      
      // If we are currently paused, just countdown the timer and do nothing else
      if (s.pauseTimer > 0) {
        s.pauseTimer -= delta
      } else {
        // Find out which segment of the path we are currently in
        let currentIndex = 0
        let segmentSpeed = 0.5 // Default speed fallback

        for (let i = 0; i < pathPoints.length - 1; i++) {
          if (s.angle >= pathPoints[i][0] && s.angle < pathPoints[i + 1][0]) {
            currentIndex = i
            // Grab the speed variable (Index 3)
            segmentSpeed = pathPoints[i][3] !== undefined ? pathPoints[i][3] : 0.5
            break
          }
        }

        // Did we just hit a brand new waypoint? Trigger its pause!
        if (currentIndex !== s.lastIndex) {
          s.lastIndex = currentIndex
          // Grab the pause duration variable (Index 4)
          const pauseDuration = pathPoints[currentIndex][4] || 0
          if (pauseDuration > 0) {
            s.pauseTimer = pauseDuration
          }
        }

        // If we aren't newly paused, move forward based on delta time and current speed
        if (s.pauseTimer <= 0) {
          s.angle += segmentSpeed * delta
        }

        // Are we finished with the full 360 circle?
        if (s.angle >= Math.PI * 2.0) {
          s.angle = Math.PI * 2.0 
          if (onComplete) onComplete() // Signal to SceneModels that this object is done
        }
      }
    }

    // Always update position mathematically (keeps inactive objects safely hidden at their 0 angle)
    const x = center[0] - radius * Math.sin(s.angle)
    const z = center[2] - radius * Math.cos(s.angle)
    const { height, scale } = getInterpolatedValues(s.angle, pathPoints)

    ref.current.position.set(x, height, z)
    ref.current.scale.set(scale, scale, scale)
    ref.current.lookAt(center[0], height, center[2])
  })
}