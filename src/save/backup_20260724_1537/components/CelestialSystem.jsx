import React, { useMemo, useRef } from 'react'
import { Clone } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useControls } from 'leva' // 1. IMPORT LEVA

export default function CelestialSystem({ sun, moon, a, trainCenter }) {
  const sunRef = useRef()
  const moonRef = useRef()
  const sunBeamsRef = useRef([])
  const sunHaloRef = useRef()
  const starsRef = useRef() 
  const skyMaterialRef = useRef() // NEW: Ref for the sky shader

  const animState = useRef({
    phase: 0,
    progress: 0,
    waitTimer: 0
  })

// 2. ADD LEVA CONTROLS BACK
  const skyControls = useControls('Sky Settings', {
    colorTop: { value: '#12b5de', label: '1. Top Color' },
    colorMid: { value: '#f0d8ec', label: '2. Mid Color' },
    colorHorizon: { value: '#e88bc9', label: '3. Horizon Color' },
    colorBottom: { value: '#f7f402', label: '4. Bottom Color' },
    
    stop4: { value: 0.67, min: 0.1, max: 0.8, step: 0.01, label: 'Top Height' },
    stop3: { value: 0.50, min: 0.01, max: 0.8, step: 0.01, label: 'Mid Height' },
    stop2: { value: 0.46, min: 0.01, max: 0.8, step: 0.01, label: 'Horizon Line' },
    stop1: { value: 0.49, min: 0.01, max: 0.8, step: 0.01, label: 'Bottom Height' },
    
    waviness: { value: 0.02, min: 0.0, max: 0.2, step: 0.001, label: '〰️ Waviness' },
    cloudStretch: { value: 12.0, min: 1.0, max: 40.0, step: 0.1, label: '☁️ Cloud Stretch' }
  })

  // --- DAY & NIGHT PRESETS FOR THE SKY ---
  // Define colors outside the loop for performance
  const palettes = useMemo(() => ({
    dayTop: new THREE.Color('#12b5de'),
    dayMid: new THREE.Color('#f0d8ec'),
    dayHoriz: new THREE.Color('#e88bc9'),
    dayBot: new THREE.Color('#f7f402'),
    nightTop: new THREE.Color('#020111'),
    nightMid: new THREE.Color('#10052b'),
    nightHoriz: new THREE.Color('#150c26'),
    nightBot: new THREE.Color('#000000'),
  }), [])

  // INITIALIZE ALL UNIFORMS
  const sunUniforms = useMemo(() => ({ uOpacity: { value: 0.0 } }), [])
  const starUniforms = useMemo(() => ({ uTime: { value: 0.0 }, uVisibility: { value: 0.0 } }), [])
  
  // NEW: Sky uniforms merged from BackgroundGradient
  const skyShaderArgs = useMemo(() => ({
    uniforms: {
      colorTop: { value: new THREE.Color() },
      colorMid: { value: new THREE.Color() },
      colorHorizon: { value: new THREE.Color() },
      colorBottom: { value: new THREE.Color() },
      stop1: { value: 0.0 },
      stop2: { value: 0.0 },
      stop3: { value: 0.0 },
      stop4: { value: 0.0 },
      waviness: { value: 0.0 },
      cloudStretch: { value: 0.0 }
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
      
      float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i); float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0)); float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      
      float fbm(vec2 p) {
        float v = 0.0; float a = 0.5;
        for (int i = 0; i < 4; ++i) { v += a * noise(p); p = p * 2.0; a *= 0.5; }
        return v;
      }
      
      void main() {
        vec2 noiseUv = vec2(vUv.x * cloudStretch, vUv.y * 10.0);
        float n = fbm(noiseUv);
        float distortedY = vUv.y + (n - 0.5) * waviness;
        vec3 finalColor;
        
        if (distortedY < stop1) { finalColor = colorBottom; } 
        else if (distortedY < stop2) { finalColor = mix(colorBottom, colorHorizon, smoothstep(stop1, stop2, distortedY)); } 
        else if (distortedY < stop3) { finalColor = mix(colorHorizon, colorMid, smoothstep(stop2, stop3, distortedY)); } 
        else { finalColor = mix(colorMid, colorTop, smoothstep(stop3, stop4, distortedY)); }
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  }), [])

  const starsGeometry = useMemo(() => {
    const count = 120; 
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count); 

    for (let i = 0; i < count; i++) {
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(Math.random() * 0.8 + 0.1); 
      const r = 190; 
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      phases[i] = Math.random() * Math.PI * 2; 
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    return geom;
  }, []);

  useMemo(() => {
    // ... [KEEP YOUR EXISTING SUN AND MOON SHADERS EXACTLY AS THEY WERE IN SOURCE 12] ...
    const sunMaterial = new THREE.ShaderMaterial({
      vertexShader: `varying vec3 vPosition; void main() { vPosition = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `varying vec3 vPosition; float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); } float noise(in vec3 x) { vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(mix(mix( hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)),f.x), mix( hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)),f.x),f.y), mix(mix( hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)),f.x), mix( hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)),f.x),f.y),f.z); } void main() { float n = noise(vPosition * 0.8); vec3 brightYellow = vec3(1.0, 0.9, 0.1); vec3 warmOrange = vec3(1.0, 0.65, 0.0); vec3 baseColor = mix(warmOrange, brightYellow, n); gl_FragColor = vec4(baseColor, 1.0); }`
    });

    const moonMaterial = new THREE.ShaderMaterial({
      vertexShader: `varying vec3 vPosition; void main() { vPosition = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `varying vec3 vPosition; float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); } float noise(in vec3 x) { vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(mix(mix( hash(i+vec3(0,0,0)), hash(i+vec3(1,0,0)),f.x), mix( hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)),f.x),f.y), mix(mix( hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)),f.x), mix( hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)),f.x),f.y),f.z); } void main() { float n = noise(vPosition * 4.0); vec3 brightWhiteYellow = vec3(1.0, 0.98, 0.85); vec3 warmCraterShadow = vec3(0.85, 0.80, 0.60); vec3 finalColor = mix(warmCraterShadow, brightWhiteYellow, n * 0.5 + 0.5); gl_FragColor = vec4(finalColor, 1.0); }`
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
      if (s.waitTimer <= 0) { s.progress = 0; s.phase = (s.phase + 1) % 4; }
    } else {
      s.progress += delta * animSpeed; 
      if (s.progress >= 1.0) { s.progress = 1.0; s.waitTimer = pauseDuration; }
    }

    const t = Math.min(s.progress, 1.0);
    const smoothT = t * t * (3 - 2 * t); 
    
    let v = 0;
    if (s.phase === 0) v = -1 + smoothT;      
    else if (s.phase === 1) v = 0 + smoothT;  
    else if (s.phase === 2) v = 1 - smoothT;  
    else if (s.phase === 3) v = 0 - smoothT;  

    const verticalProgress = 1.0 - Math.abs(v); // 1.0 is Noon, 0.0 is Night

    // --- 1. NEW: APPLY SUN TIMING TO SKY SHADER ---
// --- APPLY TIMING TO SKY SHADER & LEVA OVERRIDE ---
    if (skyMaterialRef.current) {
      const u = skyMaterialRef.current.uniforms;
      
      // Pull live values from your Leva panel so you can tweak them visually
      u.colorTop.value.set(skyControls.colorTop);
      u.colorMid.value.set(skyControls.colorMid);
      u.colorHorizon.value.set(skyControls.colorHorizon);
      u.colorBottom.value.set(skyControls.colorBottom);
      
      u.stop1.value = skyControls.stop1;
      u.stop2.value = skyControls.stop2;
      u.stop3.value = skyControls.stop3;
      u.stop4.value = skyControls.stop4;
      
      u.waviness.value = skyControls.waviness;
      u.cloudStretch.value = skyControls.cloudStretch;
    }

    // --- 2. APPLY TO SUN ---
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
      sunBeamsRef.current.forEach((beam) => { beam.scale.set(beamScale, beamScale, beamScale); });
      
      if (sunHaloRef.current) {
        const haloOpacity = Math.max(0.0, Math.min(1.0, (verticalProgress - 0.1) * 2.0)); 
        sunHaloRef.current.material.uniforms.uOpacity.value = haloOpacity;
        const haloScale = 1 + (verticalProgress * 30);
        sunHaloRef.current.scale.set(haloScale, haloScale, 1);
      }
    }

    // --- 3. APPLY TO MOON ---
    if (moonRef.current) {
      const moonAngle = 1.2 * Math.PI + (v * 0.4 * Math.PI);
      const moonY = 120; 
      const moonX = trainCenter[0] - celestialRadius * Math.sin(moonAngle);
      const moonZ = trainCenter[2] - celestialRadius * Math.cos(moonAngle);
      
      moonRef.current.position.set(moonX, moonY, moonZ);
      moonRef.current.lookAt(trainCenter[0], moonY, trainCenter[2]);
    }
    
    // --- 4. APPLY TO STARS ---
    if (starsRef.current) {
      let starVisibility = 0;
      if (verticalProgress < 0.4) { starVisibility = 1.0 - (verticalProgress / 0.4); }
      starsRef.current.material.uniforms.uVisibility.value = starVisibility;
      starsRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <group>
      {/* 1. NEW: THE MERGED SKY MESH */}
      <mesh renderOrder={-10} rotation={[0, Math.PI / 2, 0]}>
        <sphereGeometry args={[500, 32, 32]} />
        <shaderMaterial 
          ref={skyMaterialRef}
          args={[skyShaderArgs]} 
          side={THREE.BackSide} 
          depthWrite={false} 
          fog={false}
        />
      </mesh>

      {/* 2. THE SUN */}
      <group ref={sunRef} scale={[a * 4, a * 4, a * 4]}>
        <primitive object={sun.scene} />
        <mesh ref={sunHaloRef} position={[0, 0, -2]}>
          <planeGeometry args={[1, 1]} />
          <shaderMaterial transparent={true} depthWrite={false} uniforms={sunUniforms} vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`} fragmentShader={`uniform float uOpacity; varying vec2 vUv; void main() { float dist = distance(vUv, vec2(0.5)); float alpha = smoothstep(0.5, 0.15, dist); vec3 haloColor = vec3(1.1, 1.0, 0.7); gl_FragColor = vec4(haloColor, alpha * uOpacity); }`} />
        </mesh>
      </group>

      {/* 3. THE MOON */}
      <group ref={moonRef} scale={[a * 4, a * 4, a * 4]}>
        <Clone object={moon.scene} />
      </group>

      {/* 4. THE STARS */}
      <points ref={starsRef} geometry={starsGeometry} position={trainCenter}>
        <shaderMaterial transparent={true} depthWrite={false} uniforms={starUniforms} vertexShader={`uniform float uTime; uniform float uVisibility; attribute float aPhase; varying float vAlpha; void main() { float twinkle = sin(uTime * 2.5 + aPhase) * 0.5 + 0.5; vAlpha = (twinkle * 0.7 + 0.3) * uVisibility; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); gl_PointSize = (15.0 * uVisibility) * (200.0 / -mvPosition.z); gl_Position = projectionMatrix * mvPosition; }`} fragmentShader={`varying float vAlpha; void main() { vec2 uv = gl_PointCoord - 0.5; float dist = length(uv); float core = 1.0 - smoothstep(0.0, 0.08, dist); float crossX = smoothstep(0.05, 0.0, abs(uv.x)) * smoothstep(0.5, 0.0, abs(uv.y)); float crossY = smoothstep(0.05, 0.0, abs(uv.y)) * smoothstep(0.5, 0.0, abs(uv.x)); float sparkle = crossX + crossY; float finalShape = max(core, sparkle); if (finalShape < 0.01) discard; gl_FragColor = vec4(1.0, 0.98, 0.9, finalShape * vAlpha); }`} />
      </points>
    </group>
  );
}