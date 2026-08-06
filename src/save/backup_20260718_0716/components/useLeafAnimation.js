import { useFrame } from '@react-three/fiber'

export default function useLeafAnimation(targetRef, config) {
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (targetRef && targetRef.current) {
      // 1. SETUP PHASE
      if (targetRef.current.userData.isSetup === undefined) {
        const allItems = [];
        targetRef.current.traverse((child) => {
          if (child.isMesh && Object.keys(config).some(p => child.name.startsWith(p))) {
            allItems.push(child);
          }
        });

        allItems.sort((a, b) => a.name.localeCompare(b.name));
        targetRef.current.userData.activeSpinners = [];

        Object.keys(config).forEach(prefix => {
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
      for (let i = 0; i < activeItems.length; i++) {
        const child = activeItems[i];
        
        if (child.userData.type === 'petal') {
          const oscillation = Math.sin(time * child.userData.speed + child.userData.phaseOffset) * child.userData.amplitude;
          child.rotation.y = child.userData.baseRot.y + oscillation;
          child.rotation.x = child.userData.baseRot.x + (oscillation * 0.2);
        } else {
          const t = time * child.userData.speed;
          child.position.x = child.userData.basePos.x + Math.sin(t) * child.userData.swing;
          child.position.y = child.userData.basePos.y + Math.abs(Math.sin(t)) * child.userData.arcHeight;
        }
      }
    }
  });
}