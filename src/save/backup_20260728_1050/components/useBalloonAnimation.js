import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function useBalloonAnimation(bikeRef, bikeScene) {
  useEffect(() => {
    if (!bikeRef.current) return
    const balloonColors = ['#ff4d4d', '#ffed4a', '#4add74', '#4a90e2', '#ff66c4']

    bikeRef.current.traverse((child) => {
      if (child.isMesh && (child.name.includes('Sphere') || child.name === 'Balloon')) {
        if (child.material) {
          child.material = child.material.clone()
          const randomHex = balloonColors[Math.floor(Math.random() * balloonColors.length)]
          child.material.color = new THREE.Color(randomHex)
        }
      }
    })
    
    // Hide the anchor groups initially and record their exact starting positions
    bikeRef.current.children.forEach(child => {
      if (child.name && child.name.includes('Flyaway_Anchor')) {
        child.visible = false;
        child.userData.isFlying = false;
        child.userData.flyProgress = 0;
        child.userData.basePosX = child.position.x;
        child.userData.basePosY = child.position.y;
        child.userData.basePosZ = child.position.z;
      }
    });
  }, [bikeScene, bikeRef])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    if (bikeRef.current) {
      if (bikeRef.current.userData.activeBalloons === undefined) {
        bikeRef.current.userData.activeBalloons = []
        bikeRef.current.userData.flyawayBalloons = [] 
        bikeRef.current.userData.nextFlyTime = time + 2; 
        
        // 1. Collect the permanent balloons for the static bobbing effect
        bikeRef.current.traverse((child) => {
          if (child.isMesh && (child.name.includes('Sphere') || child.name === 'Balloon')) {
            // Prevent the meshes inside the flyaway groups from being added to the static array
            let isFlyawayMesh = false;
            let current = child;
            while(current.parent) {
              if (current.parent.name && current.parent.name.includes('Flyaway_Anchor')) {
                isFlyawayMesh = true;
                break;
              }
              current = current.parent;
            }
            
            if (!isFlyawayMesh) {
              child.userData.basePosX = child.position.x
              child.userData.basePosY = child.position.y
              bikeRef.current.userData.activeBalloons.push(child)
            }
          }
        })

        // 2. Collect the entire Flyaway Anchor Groups (keeps sphere and string glued together)
        bikeRef.current.children.forEach(child => {
          if (child.name && child.name.includes('Flyaway_Anchor')) {
            bikeRef.current.userData.flyawayBalloons.push(child)
          }
        });
      }

      // Existing static bobbing animation
      const balloons = bikeRef.current.userData.activeBalloons;
      for (let i = 0; i < balloons.length; i++) {
        const child = balloons[i];
        const organicOffset = child.userData.basePosX * 5 + child.userData.basePosY * 5
        child.position.x = child.userData.basePosX + Math.sin(time * 2 + organicOffset) * 0.15
        child.position.y = child.userData.basePosY + Math.cos(time * 1.5 + organicOffset) * 0.15
      }
      
      // Flyaway logic using the integrated Anchor Groups
      const flyaways = bikeRef.current.userData.flyawayBalloons;
      if (time > bikeRef.current.userData.nextFlyTime) {
        const countToFly = Math.floor(Math.random() * 3) + 1; 
        let launched = 0;
        
        for (let i = 0; i < flyaways.length && launched < countToFly; i++) {
          if (!flyaways[i].userData.isFlying) {
            flyaways[i].userData.isFlying = true;
            flyaways[i].userData.flyProgress = 0;
            flyaways[i].visible = true;
            
            // Snap back to the anchor spot exactly where the balloon cluster is
            flyaways[i].position.set(flyaways[i].userData.basePosX, flyaways[i].userData.basePosY, flyaways[i].userData.basePosZ);
            flyaways[i].scale.set(1, 1, 1);
            launched++;
          }
        }
        bikeRef.current.userData.nextFlyTime = time + Math.random() * 6 + 6; 
      }
      
      // Animate the flying groups
      for (let i = 0; i < flyaways.length; i++) {
        const child = flyaways[i];
        if (child.userData.isFlying) {
          child.userData.flyProgress += 0.005; 
          
          // Move the entire group upward and laterally
          child.position.y += 0.05; 
          child.position.x += Math.sin(time * 2 + i) * 0.02;
          child.position.z += Math.cos(time * 1.5 + i) * 0.02;
          
          // Begin scaling down when it's reached 70% of its lifecycle
          if (child.userData.flyProgress > 0.7) {
            const shrink = Math.max(0, 1 - (child.userData.flyProgress - 0.7) * 3.33);
            child.scale.set(shrink, shrink, shrink);
          }
          
          if (child.userData.flyProgress > 1.0) {
            child.userData.isFlying = false;
            child.visible = false;
          }
        }
      }
    }
  })
}