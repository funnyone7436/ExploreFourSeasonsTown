import { useRef } from 'react' 
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function useSeagullBoids(refs) {
  // Store unique initial phases and velocities
  const birds = useRef(refs.current.map((_, i) => ({
    velocity: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
    initialized: false, // Flag to set start position only once
    startAngle: 0.2 * Math.PI + (Math.random() - 0.5) * 0.1 
  })));

  useFrame((state) => {
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
    
	// Reduce 0.2 to 0.1 to give the birds time to follow the patrol
	// 1. SETTINGS: Easily change these two variables to control the range
    const center = 0.2 * Math.PI; // The middle of your patrol
    const range = 0.3 * Math.PI;  // How far it swings (0.2 + 0.2 = 0.4, 0.2 - 0.2 = 0)
    
    // 2. TARGET ANGLE: Oscillates between (center - range) and (center + range)
    const targetAngle = center + Math.sin(time * 0.01) * range;
    
    const targetPos = new THREE.Vector3(
      -145 * Math.sin(targetAngle),
      36 + Math.sin(time * 0.01) * 16, // Vertical drifting
      -145 * Math.cos(targetAngle)
    );

    refs.current.forEach((ref, i) => {
      if (!ref.current) return;
      const bird = birds.current[i];
      const pos = ref.current.position;

      // Boid Forces
      const alignment = new THREE.Vector3();
      const cohesion = new THREE.Vector3();
      const separation = new THREE.Vector3();
      let count = 0;

      refs.current.forEach((otherRef, j) => {
        if (i === j || !otherRef.current) return;
        const dist = pos.distanceTo(otherRef.current.position);
        if (dist < 20) {
          alignment.add(birds.current[j].velocity);
          cohesion.add(otherRef.current.position);
          if (dist < 8) separation.sub(otherRef.current.position.clone().sub(pos));
          count++;
        }
      });

      if (count > 0) {
        alignment.divideScalar(count).normalize();
        cohesion.divideScalar(count).sub(pos).normalize();
        separation.normalize();
      }

      // FLOCK PULL: Gently pull toward target
      // Increase the pull strength from 0.02 to 0.05
	  const toTarget = targetPos.clone().sub(pos).normalize().multiplyScalar(0.02);

      // Apply forces
      bird.velocity.add(alignment.multiplyScalar(0.04));
      bird.velocity.add(cohesion.multiplyScalar(0.01));
      bird.velocity.add(separation.multiplyScalar(0.09));
      bird.velocity.add(toTarget);
      
      // REDUCED SPEED
      bird.velocity.normalize().multiplyScalar(0.2); 

      pos.add(bird.velocity);
      ref.current.lookAt(0, 0, 0); 
    });
  });
}