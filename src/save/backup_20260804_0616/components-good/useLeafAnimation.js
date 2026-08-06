import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

// ==========================================
// OPTIMIZATION: DUAL LOOKUP TABLES
// Pre-calculating both the sine wave and the absolute sine wave
// ==========================================
const TABLE_SIZE = 2048;
const MASK = TABLE_SIZE - 1; // 2047 (Used for instant bitwise wrapping)
const RAD_TO_INDEX = TABLE_SIZE / (Math.PI * 2);

const sinTable = new Float32Array(TABLE_SIZE);
const absSinTable = new Float32Array(TABLE_SIZE);

for (let i = 0; i < TABLE_SIZE; i++) {
  const s = Math.sin((i / TABLE_SIZE) * Math.PI * 2);
  sinTable[i] = s;
  absSinTable[i] = Math.abs(s);
}
// ==========================================

export default function useLeafAnimation(targetRef, config, dampener = 0.2) {
  // A dedicated local memory block just for this specific tree's animation data
  const animData = useRef(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (targetRef && targetRef.current) {
      
      // 1. SETUP PHASE (Only runs once)
      if (!animData.current) {
        const allItems = [];
        const configKeys = Object.keys(config);
        
        targetRef.current.traverse((child) => {
          if (child.isMesh && configKeys.some(p => child.name.startsWith(p))) {
            allItems.push(child);
          }
        });

        allItems.sort((a, b) => a.name.localeCompare(b.name));
        
        // We use a flat array of highly optimized Structs specifically built for speed
        const fastArray = [];

        configKeys.forEach(prefix => {
          const categoryItems = allItems.filter(item => item.name.startsWith(prefix));
          const catConfig = config[prefix];
          
          let selectedItems = [];
          if (catConfig.limit > 0) {
            if (categoryItems.length <= catConfig.limit) {
              selectedItems = categoryItems;
            } else {
              const half = Math.floor(catConfig.limit / 2);
              selectedItems = [...categoryItems.slice(0, half), ...categoryItems.slice(-half)];
            }
          }

          selectedItems.forEach(child => {
            const seed = child.position.x + child.position.y + child.position.z;
            
            // Instead of hiding data inside child.userData, we store direct pointers
            // to the exact memory addresses (child.position) we need to update.
            fastArray.push({
              pos: child.position, // Direct pointer to the Three.js Vector3
              bx: child.position.x,
              by: child.position.y,
              sw: (catConfig.swing || catConfig.amplitude) * dampener,
              ah: (catConfig.arcHeight || 0.5) * dampener,
              sp: catConfig.speed * RAD_TO_INDEX,
              ph: (seed * 5) * RAD_TO_INDEX
            });
          });
        });
        
        // Save the optimized flat array to our local Ref
        animData.current = fastArray;
      }

      // 2. THE ULTIMATE OPTIMIZED LOOP
      // We bypass Three.js Object3D hierarchy entirely!
      const items = animData.current;
      const len = items.length;
      
      for (let i = 0; i < len; i++) {
        const d = items[i];
        
        // Bitwise logic converts float to int and instantly wraps at 2047
        const index = ((time * d.sp + d.ph) | 0) & MASK;
        
        // Modifying the direct Vector3 pointer
        d.pos.x = d.bx + sinTable[index] * d.sw;
        d.pos.y = d.by + absSinTable[index] * d.ah;
      }
    }
  });
}