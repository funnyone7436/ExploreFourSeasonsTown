import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// OPTIMIZATION: Pre-allocate all math vectors outside the loop to stop memory leaks
const _alignment = new THREE.Vector3();
const _cohesion = new THREE.Vector3();
const _separation = new THREE.Vector3();
const _diff = new THREE.Vector3();
const _toTarget = new THREE.Vector3();
const _targetPos = new THREE.Vector3();

export default function Fireflies({ count = 30 }) {
  const refs = useRef([...Array(count)].map(() => React.createRef()))

  const bugs = useRef(refs.current.map(() => ({
    velocity: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
    initialized: false,
    startAngle: 1.0 * Math.PI + Math.random() * 0.4 * Math.PI, 
    blinkOffset: Math.random() * Math.PI * 2 
  })));

  const animState = useRef({ phase: 0, progress: 0, waitTimer: 0 })

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    const s = animState.current;
    const animSpeed = 0.01; 
    const pauseDuration = 6.0; 

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

    refs.current.forEach((ref, i) => {
      if (!ref.current) return;
      if (!bugs.current[i].initialized) {
        const angle = bugs.current[i].startAngle;
        const radius = 135 + (Math.random() - 0.5) * 10;
        ref.current.position.set(-radius * Math.sin(angle), 1 + Math.random() * 6, -radius * Math.cos(angle));
        bugs.current[i].initialized = true;
      }
    });

    const center = 1.2 * Math.PI; 
    const range = 0.5 * Math.PI;  
    const targetAngle = center + Math.sin(time * 0.2) * range;
    
    // OPTIMIZATION: Use pre-allocated vector instead of new THREE.Vector3
    _targetPos.set(
      -135 * Math.sin(targetAngle),
      10 + Math.sin(time * 0.5) * 4, 
      -135 * Math.cos(targetAngle)
    );

    refs.current.forEach((ref, i) => {
      if (!ref.current) return;

      if (visibility <= 0.01) {
        ref.current.scale.set(0, 0, 0);
        return; 
      }

      const bug = bugs.current[i];
      const pos = ref.current.position;

      // OPTIMIZATION: Reset global vectors instead of creating new ones
      _alignment.set(0,0,0);
      _cohesion.set(0,0,0);
      _separation.set(0,0,0);
      let flockCount = 0;

      refs.current.forEach((otherRef, j) => {
        if (i === j || !otherRef.current) return;
        const dist = pos.distanceTo(otherRef.current.position);
        
        if (dist < 10) {
          _alignment.add(bugs.current[j].velocity);
          _cohesion.add(otherRef.current.position);
          if (dist < 9) {
             // OPTIMIZATION: Replaced .clone() with subVectors
             _diff.subVectors(otherRef.current.position, pos);
             _separation.sub(_diff);
          }
          flockCount++;
        }
      });

      if (flockCount > 0) {
        _alignment.divideScalar(flockCount).normalize();
        _cohesion.divideScalar(flockCount).sub(pos).normalize();
        _separation.normalize();
      }

      // OPTIMIZATION: Replaced .clone() with subVectors
      _toTarget.subVectors(_targetPos, pos).normalize();
      _toTarget.x *= 0.002; 
      _toTarget.y *= 0.03;  
      _toTarget.z *= 0.002; 
      
      bug.velocity.add(_alignment.multiplyScalar(0.02));   
      bug.velocity.add(_cohesion.multiplyScalar(0.01));   
      bug.velocity.add(_separation.multiplyScalar(0.08));  
      bug.velocity.add(_toTarget);
      
      // OPTIMIZATION: Apply random flutter directly to x,y,z instead of creating a new Vector3
      bug.velocity.x += (Math.random() - 0.5) * 0.08;
      bug.velocity.y += (Math.random() - 0.5) * 0.08;
      bug.velocity.z += (Math.random() - 0.5) * 0.08;

      bug.velocity.normalize().multiplyScalar(0.08); 
      pos.add(bug.velocity);

      const material = ref.current.children[0].material;
      if (material) {
        const intensity = Math.sin(time * 4.0 + bug.blinkOffset) * 0.5 + 0.5;
        material.opacity = intensity * visibility;
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
            <meshBasicMaterial color="#ccff00" transparent={true} opacity={1} />
          </mesh>
        </group>
      ))}
    </group>
  )
}