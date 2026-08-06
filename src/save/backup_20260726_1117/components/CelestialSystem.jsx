import React, { useMemo, useRef } from 'react'
import { Clone } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useControls } from 'leva' 

export default function CelestialSystem({ sun, moon, a, trainCenter }) {
  const sunRef = useRef()
  const moonRef = useRef()
  const sunBeamsRef = useRef([])
  const sunHaloRef = useRef()
  const starsRef = useRef() 
  const skyMaterialRef = useRef() 
  
  const ambientLightRef = useRef()
  const directionalLightRef = useRef()

  const animState = useRef({
    phase: 0,
    progress: 0,
    waitTimer: 0
  })

  // --- EXACT VALUES EXTRACTED FROM YOUR IMAGES ---
  const palettes = useMemo(() => ({
    // DAY SETTING
    dayTop: new THREE.Color('#04c9f5'),
    dayMid: new THREE.Color('#32c9eb'),
    dayHoriz: new THREE.Color('#9be2f2'),
    dayBot: new THREE.Color('#f2f2f2'),
    // NIGHT SETTING
    nightTop: new THREE.Color('#03829d'),
    nightMid: new THREE.Color('#0e8daa'),
    nightHoriz: new THREE.Color('#1fb3d5'),
    nightBot: new THREE.Color('#afe5e4'),
  }), [])

// 🎛️ Toggle this to completely hide the Sky Settings from the Leva panel
  const HIDE_SKY_PANEL = true; 

  // LEVA DEBUG PANEL
  const skyControls = useControls('Sky Settings', 
    HIDE_SKY_PANEL ? {} : {
      debugOverride: { value: false, label: '🔧 Debug Override' }, 
      colorTop: { value: '#04c9f5', label: '1. Top Color' },
      colorMid: { value: '#32c9eb', label: '2. Mid Color' },
      colorHorizon: { value: '#9be2f2', label: '3. Horizon Color' },
      colorBottom: { value: '#f2f2f2', label: '4. Bottom Color' },
      
      stop4: { value: 0.80, min: 0.1, max: 0.99, step: 0.01, label: 'Top Height' },
      stop3: { value: 0.68, min: 0.01, max: 0.99, step: 0.01, label: 'Mid Height' },
      stop2: { value: 0.58, min: 0.01, max: 0.99, step: 0.01, label: 'Horizon Line' },
      stop1: { value: 0.49, min: 0.01, max: 0.99, step: 0.01, label: 'Bottom Height' },
      
      waviness: { value: 0.02, min: 0.0, max: 0.2, step: 0.001, label: '〰️ Waviness' },
      cloudStretch: { value: 40.0, min: 1.0, max: 100.0, step: 0.1, label: '☁️ Cloud Stretch' }
    }
  )

  const sunUniforms = useMemo(() => ({ uOpacity: { value: 0.0 } }), [])
  const starUniforms = useMemo(() => ({ uTime: { value: 0.0 }, uVisibility: { value: 0.0 } }), [])
  
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
      cloudStretch: { value: 0.0 },
	  uTime: { value: 0.0 }
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
	  uniform float uTime; // 2. DECLARE IT HERE
      
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
        vec2 noiseUv = vec2(vUv.x * cloudStretch + (uTime * 0.001), vUv.y * 10.0);
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

    const verticalProgress = 1.0 - Math.abs(v); 

// --- APPLY SKY SHADER LOGIC ---
    if (skyMaterialRef.current) {
      const u = skyMaterialRef.current.uniforms;
	  const time = state.clock.elapsedTime;	  
	  u.uTime.value = time;
      
      if (skyControls.debugOverride) {
        // 🔧 DEBUG MODE: Use Leva values entirely (No glitches!)
        u.colorTop.value.set(skyControls.colorTop);
        u.colorMid.value.set(skyControls.colorMid);
        u.colorHorizon.value.set(skyControls.colorHorizon);
        u.colorBottom.value.set(skyControls.colorBottom);
        u.stop1.value = skyControls.stop1;
        u.stop2.value = skyControls.stop2;
        u.stop3.value = skyControls.stop3;
        u.stop4.value = skyControls.stop4;
        u.waviness.value = skyControls.waviness;
        
        // Removed the infinite time multiplier here
        u.cloudStretch.value = skyControls.cloudStretch; 
		
      } else {
        // 🌅 ANIMATION MODE: Lerp between Night and Day
        u.colorTop.value.lerpColors(palettes.nightTop, palettes.dayTop, verticalProgress);
        u.colorMid.value.lerpColors(palettes.nightMid, palettes.dayMid, verticalProgress);
        u.colorHorizon.value.lerpColors(palettes.nightHoriz, palettes.dayHoriz, verticalProgress);
        u.colorBottom.value.lerpColors(palettes.nightBot, palettes.dayBot, verticalProgress);
        
        u.stop1.value = 0.49;
        u.stop2.value = 0.58;
        u.stop3.value = 0.68;
        u.stop4.value = 0.80;
        u.waviness.value = 0.02;

        // Blends smoothly from 1.0 to 40.0 based purely on the sun's position. No glitches!
        u.cloudStretch.value = THREE.MathUtils.lerp(1.0, 40.0, verticalProgress);
      }
    }

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
      sunBeamsRef.current.forEach((beam) => { beam.scale.set(beamScale, beamScale, beamScale); });
      
      if (sunHaloRef.current) {
        const haloOpacity = Math.max(0.0, Math.min(1.0, (verticalProgress - 0.1) * 2.0)); 
        sunHaloRef.current.material.uniforms.uOpacity.value = haloOpacity;
        const haloScale = 1 + (verticalProgress * 30);
        sunHaloRef.current.scale.set(haloScale, haloScale, 1);
      }
	  // ADDED: Update the lighting based on the sun's animation state
      if (ambientLightRef.current) {
        // Fades between 0.15 (Night) and 1.5 (Day)
        ambientLightRef.current.intensity = 0.6 + (verticalProgress * 1.2);
      }
      if (directionalLightRef.current) {
        // Fades between 0.0 (Night) and 5.0 (Day)
        directionalLightRef.current.intensity = verticalProgress * 5.0;
        // Bind the light source directly to the animated sun's coordinates!
        directionalLightRef.current.position.set(sunX, sunY, sunZ);
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
    
    // --- APPLY TO STARS ---
    if (starsRef.current) {
      let starVisibility = 0;
      if (verticalProgress < 0.4) { starVisibility = 1.0 - (verticalProgress / 0.4); }
      starsRef.current.material.uniforms.uVisibility.value = starVisibility;
      starsRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <group>
	{/* ADDED: Dynamic Lighting */}
      <ambientLight ref={ambientLightRef} />
      <directionalLight ref={directionalLightRef} />
	
      {/* 1. THE SKY */}
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