import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function useWaterAnimation(boatRef, whaleRef) {
  
  // --- CONFIGURATION FOR TESTING ---
  // You can freely adjust position offsets, speeds, and sine wave values here
  const config = {
    boat: { 
      speed: 0.1,           // Matches train speed
      radius: 121.5,           // Matches train radius
      center: [0, 2, 0],     // Matches train center
      yOffset: -8,           // Pushes boat down to water level relative to the train center
      yAmplitude: 2.8,       // How high/low it bobs
      ySpeed: 3,           // How fast it bobs
      hideStart: 0.6 * Math.PI, 
      hideEnd: 1.92 * Math.PI,
      angleOffset: 0,        // Start position offset on the circle
      rotationOffset: 0 // 180 degree turn for the boat
    },
    whale: { 
      speed: 0.1, 
      radius: 123.5, 
      center: [0, 9, 0], 
      yOffset: -8,
      yAmplitude: 1.0, 
      ySpeed: 1.2,
      blowholeYOffset: 2.5,  // Adjust this if bubbles spawn too high/low on the model
      hideStart: 0.46 * Math.PI,
      hideEnd: 1.9 * Math.PI,
      angleOffset: Math.PI,  // Puts the whale on the exact opposite side of the circle from the boat
      rotationOffset: 0      // 0 degree turn so the whale faces its natural forward direction
    }
  };

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // --- 1. BOAT ANIMATION ---
    if (boatRef && boatRef.current) {
      const { speed, radius, center, yOffset, yAmplitude, ySpeed, hideStart, hideEnd, angleOffset, rotationOffset } = config.boat;
      
      const angle = (time * speed) + Math.PI + angleOffset;
      
      // Train circle math
      boatRef.current.position.x = center[0] - radius * Math.sin(angle);
      boatRef.current.position.z = center[2] - radius * Math.cos(angle);
      
      // Sine wave bobbing math
      boatRef.current.position.y = center[1] + yOffset + Math.sin(time * ySpeed) * yAmplitude;
      
      // Face direction of travel
      boatRef.current.rotation.y = angle + rotationOffset; 
      
      // Disappear logic (Normalize angle to 0 - 2PI)
      const normalizedAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      boatRef.current.visible = !(normalizedAngle >= hideStart && normalizedAngle <= hideEnd);
    }

    // --- 2. WHALE ANIMATION & BUBBLE SPOUT ---
    if (whaleRef && whaleRef.current) {
      // Setup bubbles on the very first frame
      if (whaleRef.current.userData.bubbles === undefined) {
        const bubbleGeo = new THREE.SphereGeometry(0.3, 8, 8);
        const bubbleMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });
        
        whaleRef.current.userData.bubbles = [];
        
        for (let i = 0; i < 30; i++) {
          const bubble = new THREE.Mesh(bubbleGeo, bubbleMat.clone());
          bubble.userData.life = Math.random() * 100; 
          bubble.userData.offsetX = (Math.random() - 0.5) * 1.5;
          bubble.userData.offsetZ = (Math.random() - 0.5) * 1.5;
          
          // Add the bubble directly to the Whale group
          whaleRef.current.add(bubble);
          whaleRef.current.userData.bubbles.push(bubble);
        }
      }

      const { speed, radius, center, yOffset, yAmplitude, ySpeed, blowholeYOffset, hideStart, hideEnd, angleOffset, rotationOffset } = config.whale;

      const angle = (time * speed) + Math.PI + angleOffset;
      
      // Train circle math
      whaleRef.current.position.x = center[0] - radius * Math.sin(angle);
      whaleRef.current.position.z = center[2] - radius * Math.cos(angle);
      
      // Sine wave bobbing math
      whaleRef.current.position.y = center[1] + yOffset + Math.sin(time * ySpeed) * yAmplitude;
      
      // Face direction of travel with corrected offset
      whaleRef.current.rotation.y = angle + rotationOffset;

      // Disappear logic (Normalize angle to 0 - 2PI)
      const normalizedAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      whaleRef.current.visible = !(normalizedAngle >= hideStart && normalizedAngle <= hideEnd);

      // Animate the Spouting Bubbles (Only process math if the whale is visible)
      if (whaleRef.current.visible) {
        const bubbles = whaleRef.current.userData.bubbles;
        for (let i = 0; i < bubbles.length; i++) {
          const bubble = bubbles[i];
          
          bubble.userData.life += 1;
          
          // Reset bubble to the bottom of the blowhole
          if (bubble.userData.life > 100) {
            bubble.userData.life = 0;
            bubble.userData.offsetX = (Math.random() - 0.5) * 1.5;
            bubble.userData.offsetZ = (Math.random() - 0.5) * 1.5;
          }

          const lifePercent = bubble.userData.life / 100;
          const spoutMaxHeight = 8; 
          
          bubble.position.set(
            bubble.userData.offsetX * (1 + lifePercent), 
            blowholeYOffset + (lifePercent * spoutMaxHeight),
            bubble.userData.offsetZ * (1 + lifePercent)
          );

          // Fade out and grow as it rises
          bubble.material.opacity = 0.8 * (1 - lifePercent);
          const scale = 1 + (lifePercent * 2);
          bubble.scale.set(scale, scale, scale);
        }
      }
    }
  });
}