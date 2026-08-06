import { useRef } from 'react' 
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// OPTIMIZATION: Pre-allocate vectors outside the render loop.
// This prevents creating thousands of new objects per second, eliminating stutter.
const _alignment = new THREE.Vector3();
const _cohesion = new THREE.Vector3();
const _separation = new THREE.Vector3();
const _diff = new THREE.Vector3();
const _toTarget = new THREE.Vector3();
const _targetPos = new THREE.Vector3();

export default function useSeagullBoids(refs) {
  // Store unique initial phases and velocities
  const birds = useRef(refs.current.map((_, i) => ({
    velocity: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
    initialized: false, // Flag to set start position only once
    startAngle: 0.2 * Math.PI + (Math.random() - 0.5) * 0.1 
  })));

  useFrame((state) => {
    // OPTIMIZATION: Read clock directly
    const time = state.clock.elapsedTime;
    
    // Initialize positions only once on the first frame
    refs.current.forEach((ref, i) => {
      if (!ref.current) return;
      if (!birds.current[i].initialized) {
        const angle = birds.current[i].startAngle;
        ref.current.position.set(-145 * Math.sin(angle), 20, -145 * Math.cos(angle));
        birds.current[i].initialized = true;
      }
    });
    
    // 1. SETTINGS: Easily change these two variables to control the range
    const center = 0.2 * Math.PI; // The middle of your patrol
    const range = 0.4 * Math.PI;  // How far it swings (0.2 + 0.2 = 0.4, 0.2 - 0.2 = 0)
    
    // 2. TARGET ANGLE: Oscillates between (center - range) and (center + range)
    const targetAngle = center + Math.sin(time * 0.06) * range;
    
    // OPTIMIZATION: Update existing vector instead of 'new THREE.Vector3()'
    _targetPos.set(
      -145 * Math.sin(targetAngle),
      36 + Math.sin(time * 0.01) * 16, // Vertical drifting
      -145 * Math.cos(targetAngle)
    );

    refs.current.forEach((ref, i) => {
      if (!ref.current) return;
      const bird = birds.current[i];
      const pos = ref.current.position;

      // Boid Forces
      // OPTIMIZATION: Reset global vectors to zero for this specific bird
      _alignment.set(0, 0, 0);
      _cohesion.set(0, 0, 0);
      _separation.set(0, 0, 0);
      let count = 0;

      refs.current.forEach((otherRef, j) => {
        if (i === j || !otherRef.current) return;
        const dist = pos.distanceTo(otherRef.current.position);
        
        if (dist < 20) {
          _alignment.add(birds.current[j].velocity);
          _cohesion.add(otherRef.current.position);
          if (dist < 8) {
            // OPTIMIZATION: Avoid .clone() and use subVectors
            _diff.subVectors(otherRef.current.position, pos);
            _separation.sub(_diff);
          }
          count++;
        }
      });

      if (count > 0) {
        _alignment.divideScalar(count).normalize();
        _cohesion.divideScalar(count).sub(pos).normalize();
        _separation.normalize();
      }

      // FLOCK PULL: Gently pull toward target
      // OPTIMIZATION: Avoid .clone() by using subVectors
      _toTarget.subVectors(_targetPos, pos).normalize().multiplyScalar(0.02);

      // Apply forces
      bird.velocity.add(_alignment.multiplyScalar(0.02));   // Lowered from 0.04
      bird.velocity.add(_cohesion.multiplyScalar(0.005));   // Lowered from 0.01
      bird.velocity.add(_separation.multiplyScalar(0.05));  // Lowered from 0.09
      bird.velocity.add(_toTarget);
      
      // REDUCED SPEED
      bird.velocity.normalize().multiplyScalar(0.2); 

      pos.add(bird.velocity);
      ref.current.lookAt(0, 0, 0); 
    });
  });
}