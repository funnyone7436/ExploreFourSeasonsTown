import React, { useMemo, useRef } from 'react'
import { Clone } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function CelestialSystem({ sun, moon, a, trainCenter }) {
  const sunRef = useRef()
  const moonRef = useRef()
  const sunBeamsRef = useRef([])
  const sunHaloRef = useRef()
  
  // 1. Ref for the stars
  const starsRef = useRef() 

  const animState = useRef({
    phase: 0,
    progress: 0,
    waitTimer: 0
  })

  // 2. UPDATED: Generate a dome of stars with individual phases for twinkling
  const starsGeometry = useMemo(() => {
    const count = 80; // Increased star count for a better sky
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count); // Added to track light on/off state

    for (let i = 0; i < count; i++) {
      const theta = 2 * Math.PI * Math.random();
      // Keep stars in the upper hemisphere of the sky
      const phi = Math.acos(Math.random() * 0.8 + 0.1); 
      const r = 190; // Place them just inside the celestial radius
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      
      // Assign a random starting point for the twinkle sine wave
      phases[i] = Math.random() * Math.PI * 2; 
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    return geom;
  }, []);

  // Safely memoize the uniforms so React doesn't delete them during renders
  const sunUniforms = useMemo(() => ({ uOpacity: { value: 0.0 } }), [])
  
  // NEW: Uniforms specifically for controlling the star shader
  const starUniforms = useMemo(() => ({
    uTime: { value: 0.0 },
    uVisibility: { value: 0.0 }
  }), [])

  useMemo(() => {
    const sunMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPosition;
        float hash(vec3 p) {
            p = fract(p * 0.3183099 + 0.1);
            p *= 17.0;
            return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }
        float noise(in vec3 x) {
            vec3 i = floor(x);
            vec3 f = fract(x);
            f = f * f * (3.0 - 2.0 * f);
            return mix(mix(mix( hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)),f.x),
                           mix( hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)),f.x),f.y),
                       mix(mix( hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)),f.x),
                           mix( hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)),f.x),f.y),f.z);
        }
        void main() {
          float n = noise(vPosition * 0.8); 
          vec3 brightYellow = vec3(1.0, 0.9, 0.1);
          vec3 warmOrange = vec3(1.0, 0.65, 0.0); 
          vec3 baseColor = mix(warmOrange, brightYellow, n);
          gl_FragColor = vec4(baseColor, 1.0);
        }
      `
    });

    const moonMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vPosition;
        float hash(vec3 p) {
            p = fract(p * 0.3183099 + 0.1);
            p *= 17.0;
            return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }
        float noise(in vec3 x) {
            vec3 i = floor(x);
            vec3 f = fract(x);
            f = f * f * (3.0 - 2.0 * f);
            return mix(mix(mix( hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)),f.x),
                           mix( hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)),f.x),f.y),
                       mix(mix( hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)),f.x),
                           mix( hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)),f.x),f.y),f.z);
        }
        void main() {
          float n = noise(vPosition * 4.0);
          vec3 brightWhiteYellow = vec3(1.0, 0.98, 0.85); 
          vec3 warmCraterShadow = vec3(0.85, 0.80, 0.60); 
          vec3 finalColor = mix(warmCraterShadow, brightWhiteYellow, n * 0.5 + 0.5);
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    });

    sun.scene.traverse((child) => {
      if (child.isMesh) {
        child.material = sunMaterial;
        if (child.name.startsWith('SunBeam_')) {
          sunBeamsRef.current.push(child);
          child.scale.set(0.01, 0.01, 0.01);
        }
      }
    });
    
    moon.scene.traverse((child) => {
      if (child.isMesh) child.material = moonMaterial;
    });
  }, [sun.scene, moon.scene]);

  useFrame((state, delta) => {
    const s = animState.current;
    
    const animSpeed = 0.1; 
    const pauseDuration = 3.60; 
    const celestialRadius = 200;

    if (s.waitTimer > 0) {
      s.waitTimer -= delta; 
      if (s.waitTimer <= 0) {
        s.progress = 0;
        s.phase = (s.phase + 1) % 4; 
      }
    } else {
      s.progress += delta * animSpeed; 
      if (s.progress >= 1.0) {
        s.progress = 1.0;
        s.waitTimer = pauseDuration; 
      }
    }

    const t = Math.min(s.progress, 1.0);
    const smoothT = t * t * (3 - 2 * t); 
    
    let v = 0;
    if (s.phase === 0) v = -1 + smoothT;      
    else if (s.phase === 1) v = 0 + smoothT;  
    else if (s.phase === 2) v = 1 - smoothT;  
    else if (s.phase === 3) v = 0 - smoothT;  

    const verticalProgress = 1.0 - Math.abs(v);

    // --- APPLY TO SUN ---
    if (sunRef.current) {
      const elevation = verticalProgress * (Math.PI / 2); 
      const horizDist = celestialRadius * Math.cos(elevation);
      const sunY = celestialRadius * Math.sin(elevation) - 40; 
      
      const sunX = trainCenter[0] - horizDist * Math.sin(0.2 * Math.PI);
      const sunZ = trainCenter[2] - horizDist * Math.cos(0.2 * Math.PI);
      
      sunRef.current.position.set(sunX, sunY, sunZ);
      sunRef.current.lookAt(trainCenter[0], 0, trainCenter[2]);
      
      const currentSunScale = (a * 6) + ((1.0 - verticalProgress) * (a * 2));
      sunRef.current.scale.set(currentSunScale, currentSunScale, currentSunScale);
      
      const beamScale = 0.001 + (1.0 - 0.001) * verticalProgress;
      sunBeamsRef.current.forEach((beam) => {
        beam.scale.set(beamScale, beamScale, beamScale);
      });
      
      if (sunHaloRef.current) {
        const haloOpacity = Math.max(0.0, Math.min(1.0, (verticalProgress - 0.1) * 2.0)); 
        sunHaloRef.current.material.uniforms.uOpacity.value = haloOpacity;
        const haloScale = 1 + (verticalProgress * 30);
        sunHaloRef.current.scale.set(haloScale, haloScale, 1);
      }
    }

    // --- APPLY TO MOON ---
    if (moonRef.current) {
      const moonAngle = 1.2 * Math.PI + (v * 0.4 * Math.PI);
      const moonY = 120; 
      
      const moonX = trainCenter[0] - celestialRadius * Math.sin(moonAngle);
      const moonZ = trainCenter[2] - celestialRadius * Math.cos(moonAngle);
      
      moonRef.current.position.set(moonX, moonY, moonZ);
      moonRef.current.lookAt(trainCenter[0], moonY, trainCenter[2]);
    }
    
    // 3. UPDATED: APPLY TO STARS 
    if (starsRef.current) {
      // Stars only begin appearing when the sun is very low (verticalProgress < 0.4)
      let starVisibility = 0;
      if (verticalProgress < 0.4) {
        starVisibility = 1.0 - (verticalProgress / 0.4);
      }
      
      // Pass the updated visibility and elapsed time continuously into the shader
      starsRef.current.material.uniforms.uVisibility.value = starVisibility;
      starsRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <group>
      <group ref={sunRef} scale={[a * 4, a * 4, a * 4]}>
        <primitive object={sun.scene} />
        {/* SUN HALO */}
        <mesh ref={sunHaloRef} position={[0, 0, -2]}>
          <planeGeometry args={[1, 1]} />
          <shaderMaterial
            transparent={true}
            depthWrite={false}
            uniforms={sunUniforms}
            vertexShader={`
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              uniform float uOpacity;
              varying vec2 vUv;
              void main() {
                float dist = distance(vUv, vec2(0.5));
                float alpha = smoothstep(0.5, 0.15, dist);
                vec3 haloColor = vec3(1.1, 1.0, 0.7);
                gl_FragColor = vec4(haloColor, alpha * uOpacity);
              }
            `}
          />
        </mesh>
      </group>

      <group ref={moonRef} scale={[a * 4, a * 4, a * 4]}>
        <Clone object={moon.scene} />
      </group>

      {/* 4. UPDATED: STARS MESH */}
{/* 4. UPDATED: STARS MESH */}
      <points ref={starsRef} geometry={starsGeometry} position={trainCenter}>
        <shaderMaterial 
          transparent={true}
          depthWrite={false}
          uniforms={starUniforms}
          vertexShader={`
            uniform float uTime;
            uniform float uVisibility;
            attribute float aPhase;
            varying float vAlpha;
            
            void main() {
              // Mathematical twinkle (light on/off) unique to each star based on its phase
              float twinkle = sin(uTime * 2.5 + aPhase) * 0.5 + 0.5; 
              
              // Keep a baseline glow (0.3) so they don't disappear completely when "off"
              vAlpha = (twinkle * 0.7 + 0.3) * uVisibility; 
              
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              
              // Slightly increased size since the new sharp shape is more defined
              gl_PointSize = (12.0 * uVisibility) * (200.0 / -mvPosition.z);
              gl_Position = projectionMatrix * mvPosition;
            }
          `}
          fragmentShader={`
            varying float vAlpha;
            
            void main() {
              vec2 uv = gl_PointCoord - 0.5;
              
              // 1. A crisp, bright center instead of a blurry circle
              float dist = length(uv);
              float core = 1.0 - smoothstep(0.0, 0.08, dist);
              
              // 2. A subtle 4-pointed light cross (sparkle)
              float crossX = smoothstep(0.05, 0.0, abs(uv.x)) * smoothstep(0.5, 0.0, abs(uv.y));
              float crossY = smoothstep(0.05, 0.0, abs(uv.y)) * smoothstep(0.5, 0.0, abs(uv.x));
              float sparkle = crossX + crossY;
              
              // Combine the core and the sparkle
              float finalShape = max(core, sparkle);
              
              if (finalShape < 0.01) discard;
              
              // A crisp warm white/yellow star color
              gl_FragColor = vec4(1.0, 0.98, 0.9, finalShape * vAlpha);
            }
          `}
        />
      </points>
    </group>
  );
}