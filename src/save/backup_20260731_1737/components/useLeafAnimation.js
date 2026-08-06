import { useFrame } from '@react-three/fiber'

export default function useLeafAnimation(targetRef, config) {
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (targetRef && targetRef.current) {
      // 1. SETUP PHASE
      if (targetRef.current.userData.isSetup === undefined) {
        const allItems = [];
        // OPTIMIZATION: pre-fetch object keys once
        const configKeys = Object.keys(config);
        
        targetRef.current.traverse((child) => {
          if (child.isMesh && configKeys.some(p => child.name.startsWith(p))) {
            allItems.push(child);
          }
        });

        allItems.sort((a, b) => a.name.localeCompare(b.name));
        targetRef.current.userData.activeSpinners = [];

        configKeys.forEach(prefix => {
          const categoryItems = allItems.filter(item => item.name.startsWith(prefix));
          const catConfig = config[prefix];
          
          let selectedItems = [];
          if (catConfig.limit <= 0) {
            selectedItems = []; 
          } else if (categoryItems.length <= catConfig.limit) {
            selectedItems = categoryItems;
          } else {
            const half = Math.floor(catConfig.limit / 2);
            const top = categoryItems.slice(0, half);
            const bottom = categoryItems.slice(-half);
            selectedItems = [...top, ...bottom];
          }

          selectedItems.forEach(child => {
            child.userData.isSpinner = true;
            child.userData.type = catConfig.type;
            child.userData.basePos = child.position.clone();
            child.userData.baseRot = child.rotation.clone();
            child.userData.speed = catConfig.speed;
            
            // Assign all variables safely
            child.userData.amplitude = catConfig.amplitude;
            child.userData.arcHeight = catConfig.arcHeight;
            child.userData.swing = catConfig.swing;
            
            if (catConfig.type === 'petal') {
              child.geometry = child.geometry.clone();
              child.geometry.center();
              const seed = child.position.x + child.position.y + child.position.z;
              child.userData.amplitude = catConfig.amplitude * (0.5 + Math.abs(Math.sin(seed * 10)) * 0.5);
              child.userData.phaseOffset = seed * 5;
            }

            targetRef.current.userData.activeSpinners.push(child);
          });
        });
        
        targetRef.current.userData.isSetup = true;
      }

      // 2. ANIMATION LOOP
      const activeItems = targetRef.current.userData.activeSpinners;
      const len = activeItems.length;
      
      // OPTIMIZATION: Use a standard for-loop with cached length for maximum speed
      for (let i = 0; i < len; i++) {
        const child = activeItems[i];
        
        // OPTIMIZATION: Cache userData lookup
        const d = child.userData; 
        
        if (d.type === 'petal') {
          const oscillation = Math.sin(time * d.speed + d.phaseOffset) * d.amplitude;
          child.rotation.y = d.baseRot.y + oscillation;
          child.rotation.x = d.baseRot.x + (oscillation * 0.2);
        } else {
          const t = time * d.speed;
          child.position.x = d.basePos.x + Math.sin(t) * d.swing;
          child.position.y = d.basePos.y + Math.abs(Math.sin(t)) * d.arcHeight;
        }
      }
    }
  });
}