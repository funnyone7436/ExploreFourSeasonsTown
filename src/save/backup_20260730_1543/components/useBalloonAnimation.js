import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function useBalloonAnimation(bikeRef, bikeScene) {
  useEffect(() => {
    if (!bikeRef.current) return
    
    const balloonColors = ['#ff4d4d', '#ffed4a', '#4add74', '#4a90e2', '#ff66c4']
    
    let colorBag = [];
    
    const fillAndShuffleBag = () => {
      let newBag = [...balloonColors];
      for (let i = newBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newBag[i], newBag[j]] = [newBag[j], newBag[i]]; 
      }
      return newBag;
    };

    bikeRef.current.traverse((child) => {
      if (child.isMesh && (child.name.includes('Sphere') || child.name === 'Balloon')) {
        if (child.material) {
          child.material = child.material.clone()
          
          if (colorBag.length === 0) {
            colorBag = fillAndShuffleBag();
          }
          
          const assignedHex = colorBag.pop();
          child.material.color = new THREE.Color(assignedHex)
        }
      }
    })
    
    // HOT RELOAD FIX: Only record the position once, and safely reset balloons on save
    bikeRef.current.children.forEach(child => {
      if (child.name && child.name.includes('Flyaway_Anchor')) {
        
        // Only save the base position if it hasn't been saved yet
        if (child.userData.basePosX === undefined) {
          child.userData.basePosX = child.position.x+6;
          child.userData.basePosY = child.position.y;
          child.userData.basePosZ = child.position.z;
        }
        
        // Force the balloon back to the true starting line
        child.position.set(child.userData.basePosX, child.userData.basePosY, child.userData.basePosZ);
        
        child.visible = false;
        child.userData.isFlying = false;
        child.userData.flyProgress = 0;
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
        
        bikeRef.current.traverse((child) => {
          if (child.isMesh && (child.name.includes('Sphere') || child.name === 'Balloon')) {
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

        bikeRef.current.children.forEach(child => {
          if (child.name && child.name.includes('Flyaway_Anchor')) {
            bikeRef.current.userData.flyawayBalloons.push(child)
          }
        });
      }

      const balloons = bikeRef.current.userData.activeBalloons;
      for (let i = 0; i < balloons.length; i++) {
        const child = balloons[i];
        const organicOffset = child.userData.basePosX * 5 + child.userData.basePosY * 5
        child.position.x = child.userData.basePosX + Math.sin(time * 2 + organicOffset) * 0.15
        child.position.y = child.userData.basePosY + Math.cos(time * 1.5 + organicOffset) * 0.15
      }
      
	 const flyaways = bikeRef.current.userData.flyawayBalloons;
      if (time > bikeRef.current.userData.nextFlyTime) {
        const countToFly = Math.floor(Math.random() * 8) + 2; 
        let launched = 0;
        
        // 1. Re-declare the colors so this animation loop can see them
        const colors = ['#ff4d4d', '#ffed4a', '#4add74', '#4a90e2', '#ff66c4'];
        
        for (let i = 0; i < flyaways.length && launched < countToFly; i++) {
          if (!flyaways[i].userData.isFlying) {
            flyaways[i].userData.isFlying = true;
            flyaways[i].userData.flyProgress = 0;
            flyaways[i].visible = true;
            
            // 2. Pick a random color and traverse the anchor to paint the actual mesh inside!
            const randomHex = colors[Math.floor(Math.random() * colors.length)];
            flyaways[i].traverse((descendant) => {
              if (descendant.isMesh && descendant.material) {
                descendant.material.color.set(randomHex);
              }
            });
            
            flyaways[i].position.set(flyaways[i].userData.basePosX, flyaways[i].userData.basePosY, flyaways[i].userData.basePosZ);
            flyaways[i].scale.set(1, 1, 1);
            launched++;
          }
        }
        bikeRef.current.userData.nextFlyTime = time + Math.random() * 6 + 6; 
      }
      
      for (let i = 0; i < flyaways.length; i++) {
        const child = flyaways[i];
        if (child.userData.isFlying) {
          
          child.userData.flyProgress += 0.002; 
          child.position.y += 0.08; 
          
          child.position.x += Math.sin(time * 2 + i) * 0.02;
          child.position.z += Math.cos(time * 1.5 + i) * 0.02;
          
          if (child.userData.flyProgress > 0.85) {
            const shrink = Math.max(0, 1 - (child.userData.flyProgress - 0.85) * 6.66);
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