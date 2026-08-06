import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'

export default function BackgroundGradient() {
  // 1. Setup the interactive control panel with new Waviness controls!
  const controls = useControls('Sky Settings', {
    colorTop: { value: '#12b5de', label: '1. Top (Purple)' },
    colorMid: { value: '#f0d8ec', label: '2. Mid (Red/Pink)' },
    colorHorizon: { value: '#e88bc9', label: '3. Horizon (Orange)' },
    colorBottom: { value: '#f7f402', label: '4. Bottom (Yellow)' },
    
    stop4: { value: 0.67, min: 0.1, max: 0.8, step: 0.01, label: 'Top Height' },
    stop3: { value: 0.50, min: 0.01, max: 0.8, step: 0.01, label: 'Mid Height' },
    stop2: { value: 0.46, min: 0.01, max: 0.8, step: 0.01, label: 'Horizon Line' },
    stop1: { value: 0.49, min: 0.01, max: 0.8, step: 0.01, label: 'Bottom Height' },
    
    waviness: { value: 0.02, min: 0.0, max: 0.2, step: 0.001, label: '〰️ Waviness' },
    cloudStretch: { value: 12.0, min: 1.0, max: 40.0, step: 0.1, label: '☁️ Cloud Stretch' }
  })

  const materialRef = useRef()

  // 2. The Custom GPU Shader with FBM Noise
  const shaderArgs = useMemo(() => ({
    uniforms: {
      colorTop: { value: new THREE.Color(controls.colorTop) },
      colorMid: { value: new THREE.Color(controls.colorMid) },
      colorHorizon: { value: new THREE.Color(controls.colorHorizon) },
      colorBottom: { value: new THREE.Color(controls.colorBottom) },
      stop1: { value: controls.stop1 },
      stop2: { value: controls.stop2 },
      stop3: { value: controls.stop3 },
      stop4: { value: controls.stop4 },
      waviness: { value: controls.waviness },
      cloudStretch: { value: controls.cloudStretch }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 colorTop;
      uniform vec3 colorMid;
      uniform vec3 colorHorizon;
      uniform vec3 colorBottom;
      
      uniform float stop1;
      uniform float stop2;
      uniform float stop3;
      uniform float stop4;
      
      uniform float waviness;
      uniform float cloudStretch;
      
      varying vec2 vUv;
      
      // 1. Basic Hash function for randomness
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      // 2. Smooth Noise function
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      
      // 3. Fractal Brownian Motion (Layers of noise for detail)
      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; ++i) {
          v += a * noise(p);
          p = p * 2.0;
          a *= 0.5;
        }
        return v;
      }
      
      void main() {
        // Stretch the noise heavily on the X-axis to make sweeping horizontal clouds
        vec2 noiseUv = vec2(vUv.x * cloudStretch, vUv.y * 10.0);
        float n = fbm(noiseUv);
        
        // Apply the noise distortion to the vertical (Y) coordinate
        float distortedY = vUv.y + (n - 0.5) * waviness;
        
        vec3 finalColor;
        
        // Calculate the colors using the WAVY distorted line instead of the straight one
        if (distortedY < stop1) {
          finalColor = colorBottom;
        } else if (distortedY < stop2) {
          finalColor = mix(colorBottom, colorHorizon, smoothstep(stop1, stop2, distortedY));
        } else if (distortedY < stop3) {
          finalColor = mix(colorHorizon, colorMid, smoothstep(stop2, stop3, distortedY));
        } else {
          finalColor = mix(colorMid, colorTop, smoothstep(stop3, stop4, distortedY));
        }
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  }), [])

  // 3. Real-time updates to the GPU
  useFrame(() => {
    if (materialRef.current) {
      const u = materialRef.current.uniforms
      u.colorTop.value.set(controls.colorTop)
      u.colorMid.value.set(controls.colorMid)
      u.colorHorizon.value.set(controls.colorHorizon)
      u.colorBottom.value.set(controls.colorBottom)
      
      u.stop1.value = controls.stop1
      u.stop2.value = controls.stop2
      u.stop3.value = controls.stop3
      u.stop4.value = controls.stop4
      
      u.waviness.value = controls.waviness
      u.cloudStretch.value = controls.cloudStretch
    }
  })

  return (
    // We add rotation so the texture seam sits at the back, hidden from the camera
    <mesh renderOrder={-10} rotation={[0, Math.PI / 2, 0]}>
      <sphereGeometry args={[500, 32, 32]} />
      <shaderMaterial 
        ref={materialRef}
        args={[shaderArgs]} 
        side={THREE.BackSide} 
        depthWrite={false} 
        fog={false}
      />
    </mesh>
  )
}