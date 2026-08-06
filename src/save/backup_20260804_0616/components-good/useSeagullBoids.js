import { useRef, useEffect } from 'react' 
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const _alignment = new THREE.Vector3();
const _cohesion = new THREE.Vector3();
const _separation = new THREE.Vector3();
const _diff = new THREE.Vector3();
const _toTarget = new THREE.Vector3();
const _targetPos = new THREE.Vector3();

export default function useSeagullBoids(refs) {
  const birds = useRef(refs.current.map((_, i) => ({
    velocity: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
    startAngle: 0.2 * Math.PI + (Math.random() - 0.5) * 0.1 
  })));

  // OPTIMIZATION: Moved initialization out of the render loop entirely
  useEffect(() => {
    refs.current.forEach((ref, i) => {
      if (ref.current) {
        const angle = birds.current[i].startAngle;
        ref.current.position.set(-145 * Math.sin(angle), 20, -145 * Math.cos(angle));
      }
    });
  }, [refs]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    const center = 0.2 * Math.PI; 
    const range = 0.4 * Math.PI;  
    
    const targetAngle = center + Math.sin(time * 0.06) * range;
    
    _targetPos.set(
      -145 * Math.sin(targetAngle),
      36 + Math.sin(time * 0.01) * 16, 
      -145 * Math.cos(targetAngle)
    );

    refs.current.forEach((ref, i) => {
      if (!ref.current) return;
      const bird = birds.current[i];
      const pos = ref.current.position;

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

      _toTarget.subVectors(_targetPos, pos).normalize().multiplyScalar(0.02);

      bird.velocity.add(_alignment.multiplyScalar(0.02));   
      bird.velocity.add(_cohesion.multiplyScalar(0.005));   
      bird.velocity.add(_separation.multiplyScalar(0.05));  
      bird.velocity.add(_toTarget);
      
      bird.velocity.normalize().multiplyScalar(0.2); 

      pos.add(bird.velocity);
      ref.current.lookAt(0, 0, 0); 
    });
  });
}