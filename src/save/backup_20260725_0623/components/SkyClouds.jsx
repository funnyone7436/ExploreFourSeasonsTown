import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function SkyClouds({ trainCenter }) {
  const cloudsRef = useRef()

  const cloudsGeometry = useMemo(() => {
    // 1. REDUCED COUNT: Dropped from 50 to 15 so they don't form a massive glowing blob
    const count = 15; 
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * 0.4 * Math.PI; 
      const phi = Math.PI / 2 - (Math.random() * 0.2 + 0.15); 
      const r = 160 + Math.random() * 20; 
      
      const horizontalRadius = r * Math.sin(phi);
      
      positions[i * 3] = -horizontalRadius * Math.sin(theta);
      positions[i * 3 + 1] = r * Math.cos(phi); 
      positions[i * 3 + 2] = -horizontalRadius * Math.cos(theta);
      
      // 2. REDUCED BASE SCALE: Making the individual puffs naturally smaller
      scales[i] = Math.random() * 0.5 + 0.3;
    }
    
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    return geom;
  }, []);

  const cloudUniforms = useMemo(() => ({
    uTime: { value: 0.0 }
  }), []);

  useFrame((state) => {
    if (cloudsRef.current) {
      cloudsRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points ref={cloudsRef} geometry={cloudsGeometry} position={trainCenter}>
      <shaderMaterial 
        transparent={true}
        depthWrite={false}
        uniforms={cloudUniforms}
        vertexShader={`
          uniform float uTime;
          attribute float aScale;
          varying float vAlpha;
          
          void main() {
            vec3 pos = position;
            pos.x += sin(uTime * 0.2 + pos.y) * 4.0;
            pos.y += cos(uTime * 0.15 + pos.x) * 2.0;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            
            // 3. REDUCED SIZE MULTIPLIER: Dropped from 300.0 down to 80.0
            gl_PointSize = (80.0 * aScale) * (200.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
            
            // 4. REDUCED OPACITY: Dropped the base alpha so they are soft, wispy, and subtle
            vAlpha = 0.15 + 0.1 * sin(uTime * 0.4 + aScale * 10.0);
          }
        `}
        fragmentShader={`
          varying float vAlpha;
          
          void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float dist = length(uv);
            
            float alpha = smoothstep(0.5, 0.1, dist) * vAlpha;
            if (alpha < 0.01) discard;
            
            gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
          }
        `}
      />
    </points>
  )
}