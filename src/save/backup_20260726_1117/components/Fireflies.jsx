import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Fireflies({ count = 30 }) {
  const refs = useRef([...Array(count)].map(() => React.createRef()))

  const bugs = useRef(refs.current.map(() => ({
    velocity: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
    initialized: false,
    startAngle: 1.0 * Math.PI + Math.random() * 0.4 * Math.PI, 
    blinkOffset: Math.random() * Math.PI * 2 
  })));

  // NEW: We recreate the sun's timing logic here so the fireflies know exactly what time it is
  const animState = useRef({
    phase: 0,
    progress: 0,
    waitTimer: 0
  })

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // --- 1. CALCULATE DAY/NIGHT TIMING ---
    const s = animState.current;
    const animSpeed = 0.1; 
    const pauseDuration = 3.60; 

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

    const visibility = Math.max(0, Math.min(1, (0.65 - verticalProgress) * 3.0));

    // Initialize starting positions on the first frame
    refs.current.forEach((ref, i) => {
      if (!ref.current) return;
      if (!bugs.current[i].initialized) {
        const angle = bugs.current[i].startAngle;
        const radius = 135 + (Math.random() - 0.5) * 60;
        
        // FIXED: Replaced the hardcoded 135 with your 'radius' variable so they spread out!
        ref.current.position.set(-radius * Math.sin(angle), 8 + Math.random() * 6, -radius * Math.cos(angle));
        bugs.current[i].initialized = true;
      }
    });

    const center = 1.2 * Math.PI; 
    const range = 0.4 * Math.PI;  
    const targetAngle = center + Math.sin(time * 0.2) * range;
    
    const targetPos = new THREE.Vector3(
      -135 * Math.sin(targetAngle),
      10 + Math.sin(time * 0.5) * 4, 
      -135 * Math.cos(targetAngle)
    );

    // Apply the flocking logic
    refs.current.forEach((ref, i) => {
      if (!ref.current) return;

      // --- 2. PERFORMANCE OPTIMIZATION ---
      // If it is daytime, hide the fireflies and skip their movement math entirely!
      if (visibility <= 0.01) {
        ref.current.scale.set(0, 0, 0);
        return; 
      }

      const bug = bugs.current[i];
      const pos = ref.current.position;

      const alignment = new THREE.Vector3();
      const cohesion = new THREE.Vector3();
      const separation = new THREE.Vector3();
      let flockCount = 0;

      refs.current.forEach((otherRef, j) => {
        if (i === j || !otherRef.current) return;
        const dist = pos.distanceTo(otherRef.current.position);
        
        if (dist < 10) {
          alignment.add(bugs.current[j].velocity);
          cohesion.add(otherRef.current.position);
          if (dist < 9) separation.sub(otherRef.current.position.clone().sub(pos));
          flockCount++;
        }
      });

      if (flockCount > 0) {
        alignment.divideScalar(flockCount).normalize();
        cohesion.divideScalar(flockCount).sub(pos).normalize();
        separation.normalize();
      }

      const toTarget = targetPos.clone().sub(pos).normalize();
      toTarget.x *= 0.002; 
      toTarget.y *= 0.03;  
      toTarget.z *= 0.002; 
      
      bug.velocity.add(alignment.multiplyScalar(0.02));   
      bug.velocity.add(cohesion.multiplyScalar(0.01));   
      bug.velocity.add(separation.multiplyScalar(0.08));  
      bug.velocity.add(toTarget);
      
      bug.velocity.add(new THREE.Vector3(
         (Math.random() - 0.5) * 0.08,
         (Math.random() - 0.5) * 0.08,
         (Math.random() - 0.5) * 0.08
      ));

      bug.velocity.normalize().multiplyScalar(0.08); 
      pos.add(bug.velocity);

      // BLINKING & DAY/NIGHT FADING EFFECT
      const material = ref.current.children[0].material;
      if (material) {
        const intensity = Math.sin(time * 4.0 + bug.blinkOffset) * 0.5 + 0.5;
        
        // Multiply by visibility so they dim as morning approaches
        material.opacity = intensity * visibility;
        
        // Multiply scale by visibility so they smoothly shrink away to 0 
        const scalePulse = (0.5 + (intensity * 0.5)) * visibility;
        ref.current.scale.set(scalePulse, scalePulse, scalePulse);
      }
    });
  });

  return (
    <group>
      {refs.current.map((ref, i) => (
        <group key={`firefly-${i}`} ref={ref}>
          <mesh>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshBasicMaterial 
              color="#ccff00" 
              transparent={true}
              opacity={1}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}