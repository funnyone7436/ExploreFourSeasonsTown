import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import { OrbitControls } from '@react-three/drei'

// OPTIMIZATION: Moved speed constants outside the component 
// so they aren't re-declared in memory 60 times a second!
const AUTO_SPIN_SPEED = 0.005;
const VERTICAL_SPEED = 0.2; 
const MANUAL_SPIN_SPEED = 0.02; 

export default function CameraOrbitController({ initialAngle = 0, isAutoMode = true }) {
  const { camera, gl } = useThree()
  const controlsRef = useRef()
  
  // Track the current state of the arrow keys
  const keys = useRef({ ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false })

  // Setup keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (keys.current.hasOwnProperty(e.code)) {
        keys.current[e.code] = true
      }
    }
    const handleKeyUp = (e) => {
      if (keys.current.hasOwnProperty(e.code)) {
        keys.current[e.code] = false
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.setAzimuthalAngle(initialAngle)
      controlsRef.current.update()
    }
  }, [initialAngle])

  useFrame(() => {
    if (!controlsRef.current) return
    const controls = controlsRef.current

    if (isAutoMode) {
      // AUTO MOVING MODE
      controls.setAzimuthalAngle(controls.getAzimuthalAngle() + AUTO_SPIN_SPEED)
    } else {
      // KEYBOARD CONTROL ONLY MODE
      // 1. UP/DOWN: Move the camera's target up and down
      if (keys.current.ArrowUp) {
        controls.target.y += VERTICAL_SPEED
      }
      if (keys.current.ArrowDown) {
        controls.target.y -= VERTICAL_SPEED
      }

      // 2. LEFT/RIGHT: Spin the camera around the circle
      if (keys.current.ArrowLeft) {
        controls.setAzimuthalAngle(controls.getAzimuthalAngle() + MANUAL_SPIN_SPEED)
      }
      if (keys.current.ArrowRight) {
        controls.setAzimuthalAngle(controls.getAzimuthalAngle() - MANUAL_SPIN_SPEED)
      }
    }

    // Always update controls at the end of the frame
    controls.update()
  })

  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enableZoom={true}
      enablePan={false}
      target={[0, 0, 0]}
    />
  )
}