import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useControls } from 'leva'

export default function SkyClouds({ trainCenter }) {
  const cloudsRef = useRef()

  const { cloudSpeed, cloudHeight, orbitRadius, dayColor, nightColor } = useControls('Cloud Settings', {
    cloudSpeed: { value: 0.05, min: 0.0, max: 0.5, step: 0.01, label: '☁️ Spin Speed' },
    cloudHeight: { value: 160, min: 50, max: 300, step: 10, label: '☁️ Height' },
    orbitRadius: { value: 160, min: 50, max: 400, step: 10, label: '☁️ Orbit Radius' },
    dayColor: { value: '#ffffff', label: '☀️ Day Color' },
    nightColor: { value: '#3a5b7c', label: '🌙 Night Color' }
  })

  const cloudsGeometry = useMemo(() => {
    const count = 15; 
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2; 
      const r = orbitRadius + (Math.random() - 0.5) * 40; 
      const y = cloudHeight + (Math.random() - 0.5) * 30;
      
      positions[i * 3] = r * Math.sin(theta);
      positions[i * 3 + 1] = y; 
      positions[i * 3 + 2] = r * Math.cos(theta);
      
      scales[i] = Math.random() * 0.5 + 0.3;
    }
    
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    return geom;
  }, [cloudHeight, orbitRadius]);

  const cloudUniforms = useMemo(() => ({
    uTime: { value: 0.0 },
    uDayMix: { value: 1.0 }, 
    uDayColor: { value: new THREE.Color() },
    uNightColor: { value: new THREE.Color() }
  }), []);

  useFrame((state) => {
    if (cloudsRef.current) {
      const time = state.clock.elapsedTime;
      
      cloudsRef.current.rotation.y = time * cloudSpeed;

      let dayMix = 1.0;
      state.scene.traverse((child) => {
        if (child.isDirectionalLight) {
          dayMix = Math.min(Math.max(child.intensity / 5.0, 0.0), 1.0);
        }
      });

      const u = cloudsRef.current.material.uniforms;
      u.uTime.value = time;
      u.uDayMix.value = dayMix;
      u.uDayColor.value.set(dayColor);
      u.uNightColor.value.set(nightColor);
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
            
            gl_PointSize = (100.0 * aScale) * (200.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
            
            vAlpha = 0.25 + 0.1 * sin(uTime * 0.4 + aScale * 10.0);
          }
        `}
        fragmentShader={`
          uniform float uDayMix;
          uniform vec3 uDayColor;
          uniform vec3 uNightColor;
          varying float vAlpha;
          
          void main() {
            vec2 uv = gl_PointCoord - 0.5;
            
            // THE FIX: Mathematically combine multiple circles to create a fluffy cloud shape
            float d1 = length(uv - vec2(-0.15, -0.05));
            float d2 = length(uv - vec2(0.15, -0.05));
            float d3 = length(uv - vec2(0.0, 0.1));
            float d4 = length(uv - vec2(0.0, -0.1));
            
            // Merge the circles together
            float shape = min(min(d1, d2), min(d3, d4));
            
            // Smooth the edges of the new merged shape
            float alpha = smoothstep(0.25, 0.1, shape) * vAlpha;
            if (alpha < 0.01) discard;
            
            vec3 finalColor = mix(uNightColor, uDayColor, uDayMix);
            
            gl_FragColor = vec4(finalColor, alpha);
          }
        `}
      />
    </points>
  )
}