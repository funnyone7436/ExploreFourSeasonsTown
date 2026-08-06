import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Fireflies({ count = 30 }) {
  // Create refs for each individual firefly
  const refs = useRef([...Array(count)].map(() => React.createRef()))

  // Store unique initial phases, velocities, and blinking offsets
  const bugs = useRef(refs.current.map(() => ({
    velocity: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
    initialized: false,
    // Start randomly anywhere between 1.0 PI and 1.4 PI
    startAngle: 1.0 * Math.PI + Math.random() * 0.4 * Math.PI, 
    blinkOffset: Math.random() * Math.PI * 2 // So they don't all blink at the exact same time
  })));

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Initialize starting positions on the first frame
    refs.current.forEach((ref, i) => {
      if (!ref.current) return;
      if (!bugs.current[i].initialized) {
        const angle = bugs.current[i].startAngle;
        // Radius of 135 (near the trees/tracks). Height low to the ground (8 to 14)
        ref.current.position.set(-135 * Math.sin(angle), 8 + Math.random() * 6, -135 * Math.cos(angle));
        bugs.current[i].initialized = true;
      }
    });

    // 1. SETTINGS: Center of patrol is 1.2 PI. It swings 0.2 PI in both directions (1.0 to 1.4)
    const center = 1.2 * Math.PI; 
    const range = 0.4 * Math.PI;  

    // 2. TARGET ANGLE: Drifts back and forth slowly
    const targetAngle = center + Math.sin(time * 0.2) * range;
    
    // The invisible point the fireflies are drawn to
    const targetPos = new THREE.Vector3(
      -135 * Math.sin(targetAngle),
      10 + Math.sin(time * 0.5) * 4, // Gentle vertical drifting
      -135 * Math.cos(targetAngle)
    );

    // Apply the flocking logic
    refs.current.forEach((ref, i) => {
      if (!ref.current) return;
      const bug = bugs.current[i];
      const pos = ref.current.position;

      // Boid Forces
      const alignment = new THREE.Vector3();
      const cohesion = new THREE.Vector3();
      const separation = new THREE.Vector3();
      let flockCount = 0;

      refs.current.forEach((otherRef, j) => {
        if (i === j || !otherRef.current) return;
        const dist = pos.distanceTo(otherRef.current.position);
        
        // Fireflies interact at a much closer range than seagulls
        if (dist < 10) {
          alignment.add(bugs.current[j].velocity);
          cohesion.add(otherRef.current.position);
          if (dist < 3) separation.sub(otherRef.current.position.clone().sub(pos));
          flockCount++;
        }
      });

      if (flockCount > 0) {
        alignment.divideScalar(flockCount).normalize();
        cohesion.divideScalar(flockCount).sub(pos).normalize();
        separation.normalize();
      }

      // FLOCK PULL: Pull toward target
      const toTarget = targetPos.clone().sub(pos).normalize().multiplyScalar(0.02);

      // Apply forces
      bug.velocity.add(alignment.multiplyScalar(0.02));   
      bug.velocity.add(cohesion.multiplyScalar(0.01));   
      bug.velocity.add(separation.multiplyScalar(0.08));  
      bug.velocity.add(toTarget);
      
      // ADDED: Random erratic jitter unique to insects so they buzz around
      bug.velocity.add(new THREE.Vector3(
         (Math.random() - 0.5) * 0.08,
         (Math.random() - 0.5) * 0.08,
         (Math.random() - 0.5) * 0.08
      ));

      // REDUCED SPEED: Slower than seagulls
      bug.velocity.normalize().multiplyScalar(0.08); 

      pos.add(bug.velocity);

      // BLINKING EFFECT: Access the material and pulse it
      const material = ref.current.children[0].material;
      if (material) {
        // Fast blinking based on time + their unique offset
        const intensity = Math.sin(time * 4.0 + bug.blinkOffset) * 0.5 + 0.5;
        material.opacity = intensity;
        
        // Optional: you can also pulse the scale!
        const scalePulse = 0.5 + (intensity * 0.5);
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
              color="#ccff00" // Neon yellow-green 
              transparent={true}
              opacity={1}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}