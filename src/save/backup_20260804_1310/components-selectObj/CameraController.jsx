import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useEffect } from 'react'
import { OrbitControls } from '@react-three/drei'

const AUTO_SPIN_SPEED = 0.005;
const VERTICAL_SPEED = 0.01; 
const MANUAL_SPIN_SPEED = 0.06; 

export default function CameraOrbitController({ 
  initialAngle = 0.2 * Math.PI, 
  isAutoMode = true
 
}) {
  const { camera, gl } = useThree()
  const controlsRef = useRef()
  const keys = useRef({ ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false })

  // 1. Setup keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (keys.current.hasOwnProperty(e.code)) keys.current[e.code] = true
    }
    const handleKeyUp = (e) => {
      if (keys.current.hasOwnProperty(e.code)) keys.current[e.code] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

// 2. Initial Setup
  useEffect(() => {
    // We use a tiny 10ms delay to ensure the camera and OrbitControls 
    // are fully mounted before we force the new angle!
    const timer = setTimeout(() => {
      if (controlsRef.current) {
        controlsRef.current.setAzimuthalAngle(initialAngle)
        controlsRef.current.update()
      }
    }, 10)
    
    return () => clearTimeout(timer)
  }, [initialAngle])


  // 4. Standard Frame Loop (Keyboard & Auto)
  useFrame(() => {
    const controls = controlsRef.current

    if (isAutoMode) {
      controls.setAzimuthalAngle(controls.getAzimuthalAngle() + AUTO_SPIN_SPEED)
    } else {
      if (keys.current.ArrowUp) controls.target.y += VERTICAL_SPEED
      if (keys.current.ArrowDown) controls.target.y -= VERTICAL_SPEED
      if (keys.current.ArrowLeft) controls.setAzimuthalAngle(controls.getAzimuthalAngle() + MANUAL_SPIN_SPEED)
      if (keys.current.ArrowRight) controls.setAzimuthalAngle(controls.getAzimuthalAngle() - MANUAL_SPIN_SPEED)
    }

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