// src/components/CameraController.jsx
import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import { OrbitControls } from '@react-three/drei'

export default function CameraOrbitController({ initialAngle = 0 }) {
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

    // 1. UP/DOWN: Move the camera's target up and down
    const verticalSpeed = 0.2; 
    if (keys.current.ArrowUp) {
      controls.target.y += verticalSpeed
    }
    if (keys.current.ArrowDown) {
      controls.target.y -= verticalSpeed
    }

    // 2. LEFT/RIGHT: Spin the camera around the circle
    const manualSpinSpeed = 0.02; 
    if (keys.current.ArrowLeft) {
      controls.setAzimuthalAngle(controls.getAzimuthalAngle() + manualSpinSpeed)
    }
    if (keys.current.ArrowRight) {
      controls.setAzimuthalAngle(controls.getAzimuthalAngle() - manualSpinSpeed)
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