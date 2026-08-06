import React, { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// OPTIMIZATION: Pre-calculate all the PI zone boundaries here.
// This saves the GPU from doing heavy multiplication math on every single frame!
const PI_2 = Math.PI * 2;
const ZONE_OCEAN_1_END = 0.45 * Math.PI;
const ZONE_OCEAN_2_START = 1.85 * Math.PI;
const ZONE_BIRD_START = 0.35 * Math.PI;
const ZONE_BIRD_END = 0.95 * Math.PI;
const ZONE_CICADA_START = 0.85 * Math.PI;
const ZONE_CICADA_END = 1.50 * Math.PI;
const ZONE_FALL_START = 1.40 * Math.PI;
const ZONE_FALL_END = 1.95 * Math.PI;

export default function OceanAudio() {
  const oceanAudioRef = useRef(null)
  const birdAudioRef = useRef(null)
  const cicadaAudioRef = useRef(null) 
  const fallAudioRef = useRef(null) 
  const isPlaying = useRef(false)
  const springAudioRef = useRef(null)
  
  const targetOceanVolume = useRef(0)
  const targetBirdVolume = useRef(0)
  const targetCicadaVolume = useRef(0) 
  const targetFallVolume = useRef(0) 
  const targetSpringVolume = useRef(0.1)

  useEffect(() => {
    // GITHUB PAGES FIX: Used import.meta.env.BASE_URL for all audio assets
    // 1. Load the Ocean audio
    const oceanAudio = new Audio(`${import.meta.env.BASE_URL}ocean.mp3`)
    oceanAudio.loop = true
    oceanAudio.volume = 0 
    oceanAudioRef.current = oceanAudio

    // 2. Load the Bird audio
    const birdAudio = new Audio(`${import.meta.env.BASE_URL}bird.mp3`)
    birdAudio.loop = true
    birdAudio.volume = 0
    birdAudioRef.current = birdAudio

    // 3. Load the Cicada audio
    const cicadaAudio = new Audio(`${import.meta.env.BASE_URL}Cicada.mp3`)
    cicadaAudio.loop = true
    cicadaAudio.volume = 0
    cicadaAudioRef.current = cicadaAudio

    // 4. Load the Fall audio
    const fallAudio = new Audio(`${import.meta.env.BASE_URL}Leaves.mp3`)
    fallAudio.loop = true
    fallAudio.volume = 0
    fallAudioRef.current = fallAudio
	
    const springAudio = new Audio(`${import.meta.env.BASE_URL}Spring.mp3`)
    springAudio.loop = true
    springAudio.volume = 0
    springAudioRef.current = springAudio

    // 5. Wait for the user's first click to unlock ALL audio playback
    const initAudio = () => {
      if (!isPlaying.current) {
        oceanAudio.play().catch(error => console.error("Failed to play ocean.mp3", error))
        birdAudio.play().catch(error => console.error("Failed to play bird.mp3", error))
        cicadaAudio.play().catch(error => console.error("Failed to play Cicada.mp3", error)) 
        fallAudio.play().catch(error => console.error("Failed to play fall1.mp3", error))
		springAudio.play().catch(error => console.error("Failed to play Spring.mp3", error)) // ADDED
        isPlaying.current = true
      }
    }

    window.addEventListener('pointerdown', initAudio, { once: true })

    // Cleanup all audio files when component unmounts
    return () => {
      window.removeEventListener('pointerdown', initAudio)
      oceanAudio.pause()
      oceanAudio.src = ''
      birdAudio.pause()
      birdAudio.src = ''
      cicadaAudio.pause() 
      cicadaAudio.src = ''
      fallAudio.pause() 
      fallAudio.src = ''
	  springAudio.pause() // ADDED
      springAudio.src = ''
    }
  }, [])

  // 6. Monitor the camera angle and smooth fade the volumes
  useFrame(({ camera }, delta) => {
    if (!oceanAudioRef.current || !birdAudioRef.current || !cicadaAudioRef.current || !fallAudioRef.current || !isPlaying.current) return;

    // Calculate azimuthal angle
    let angle = Math.atan2(camera.position.x, camera.position.z);
    if (angle < 0) {
      angle += PI_2; // Optimized from Math.PI * 2
    }

    // Use the optimized static boundaries instead of running math every frame
    const oceanInView = (angle >= 0 && angle <= ZONE_OCEAN_1_END) || (angle >= ZONE_OCEAN_2_START && angle <= PI_2);
    const birdInView = angle >= ZONE_BIRD_START && angle <= ZONE_BIRD_END; 
    const cicadaInView = angle >= ZONE_CICADA_START && angle <= ZONE_CICADA_END; 
    const fallInView = angle >= ZONE_FALL_START && angle <= ZONE_FALL_END; 

    // Set the target volumes based on which zone the camera is in
    targetOceanVolume.current = oceanInView ? 0.9 : 0.0; 
    targetBirdVolume.current = birdInView ? 0.12 : 0.0; 
    targetCicadaVolume.current = cicadaInView ? 0.12 : 0.0; 
    targetFallVolume.current = fallInView ? 0.6 : 0.0; 
	
    // Calculate the new smooth volumes
    const newOceanVol = THREE.MathUtils.lerp(oceanAudioRef.current.volume, targetOceanVolume.current, delta * 0.5);
    const newBirdVol = THREE.MathUtils.lerp(birdAudioRef.current.volume, targetBirdVolume.current, delta * 0.5);
    const newCicadaVol = THREE.MathUtils.lerp(cicadaAudioRef.current.volume, targetCicadaVolume.current, delta * 0.5);
    const newFallVol = THREE.MathUtils.lerp(fallAudioRef.current.volume, targetFallVolume.current, delta * 0.5); 
	const newSpringVol = THREE.MathUtils.lerp(springAudioRef.current.volume, targetSpringVolume.current, delta * 0.2); 

    // Apply the volumes, strictly clamped between 0.0 and 1.0 to prevent HTMLMediaElement errors
    oceanAudioRef.current.volume = THREE.MathUtils.clamp(newOceanVol, 0, 1);
    birdAudioRef.current.volume = THREE.MathUtils.clamp(newBirdVol, 0, 1);
    cicadaAudioRef.current.volume = THREE.MathUtils.clamp(newCicadaVol, 0, 1);
    fallAudioRef.current.volume = THREE.MathUtils.clamp(newFallVol, 0, 1); 
	springAudioRef.current.volume = THREE.MathUtils.clamp(newSpringVol, 0, 1); 
  });

  return null; 
}