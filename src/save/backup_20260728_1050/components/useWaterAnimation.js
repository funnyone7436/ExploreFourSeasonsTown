import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function useWaterAnimation(boatRef, whaleRef) {
  const config = {
    boat: { speed: 0.04, radius: 121.5, center: [0, 2, 0], yOffset: -8, yAmplitude: 0.5, ySpeed: 3, hideStart: 0.8 * Math.PI, hideEnd: 1.96 * Math.PI, angleOffset: 0, rotationOffset: 0 },
    whale: { speed: 0.03, radius: 123.5, center: [0, 8.2, 0], yOffset: -8, yAmplitude: 1.0, ySpeed: 1.2, blowholeYOffset: 1.8, hideStart: 0.6 * Math.PI, hideEnd: 1.9 * Math.PI, angleOffset: Math.PI, rotationOffset: 0 }
  };

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // 1. BOAT ANIMATION
    if (boatRef?.current) {
      const { speed, radius, center, yOffset, yAmplitude, ySpeed, hideStart, hideEnd, angleOffset, rotationOffset } = config.boat;
      const angle = (time * speed) + Math.PI + angleOffset;
      boatRef.current.position.set(center[0] - radius * Math.sin(angle), center[1] + yOffset + Math.sin(time * ySpeed) * yAmplitude, center[2] - radius * Math.cos(angle));
      boatRef.current.rotation.y = angle + rotationOffset;
      const normalizedAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      boatRef.current.visible = !(normalizedAngle >= hideStart && normalizedAngle <= hideEnd);
    }

    // 2. WHALE ANIMATION & BUBBLE SPOUT
    if (whaleRef?.current) {
      // Setup bubbles (Only runs once)
// Setup bubbles (Only runs once)
      if (whaleRef.current.userData.bubbles === undefined) {
        const bubbleGeo = new THREE.SphereGeometry(0.5, 8, 8);
        const colors = [0xFF91AF, 0xFFD700, 0xB0E57C, 0x7DF9FF, 0x9B89FF, 0xFFB347, 0x89CFF0];
        
        whaleRef.current.userData.bubbles = [];
        for (let i = 0; i < 40; i++) {
          // Assign color from palette
          const color = colors[i % colors.length];
          const bubbleMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
          
          const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
          bubble.frustumCulled = false; 
          bubble.userData.life = Math.random() * 600; 
          bubble.userData.offsetX = (Math.random() - 0.5) * 1.5;
          bubble.userData.offsetZ = (Math.random() - 0.5) * 1.5;
          bubble.userData.sizeVar = 0.5 + Math.random() * 0.5; 
          
          whaleRef.current.add(bubble);
          whaleRef.current.userData.bubbles.push(bubble);
        }
      }

      // Movement Logic
      const { speed, radius, center, yOffset, yAmplitude, ySpeed, blowholeYOffset, hideStart, hideEnd, angleOffset, rotationOffset } = config.whale;
      const angle = (time * speed) + Math.PI + angleOffset;
      whaleRef.current.position.set(center[0] - radius * Math.sin(angle), center[1] + yOffset + Math.sin(time * ySpeed) * yAmplitude, center[2] - radius * Math.cos(angle));
      whaleRef.current.rotation.y = angle + rotationOffset;

      const normalizedAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      whaleRef.current.visible = !(normalizedAngle >= hideStart && normalizedAngle <= hideEnd);

      // Bubble Update
      if (whaleRef.current.visible) {
        whaleRef.current.userData.bubbles.forEach((bubble) => {
          bubble.userData.life += 1.2;
          if (bubble.userData.life > 300) bubble.userData.life = 0;
          
          const lifePercent = bubble.userData.life / 300;
          bubble.position.set(bubble.userData.offsetX * (1 + lifePercent * 5), blowholeYOffset + (lifePercent * 4), bubble.userData.offsetZ * (1 + lifePercent * 5));
          bubble.material.opacity = 0.9 * (1 - lifePercent); // Fade out
          bubble.scale.setScalar((0.5 + lifePercent) * bubble.userData.sizeVar);
        });
      }
    }
  });
}