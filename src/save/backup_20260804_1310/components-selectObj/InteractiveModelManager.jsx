import React, { useState, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

/**
 * 1. THE 3D SCENE COMPONENT
 * Handles loading, rendering, and manipulating the models.
 */
function SceneContent({ setSelectedMesh, selectedMesh, setAllMeshes }) {
  // Load the 4 specific models using your environment paths[cite: 2]
  const fallHouse = useGLTF(`${import.meta.env.BASE_URL}glb/FallHouse_4.glb`)
  const bookStore = useGLTF(`${import.meta.env.BASE_URL}glb/BookStore.glb`)
  const bigTree = useGLTF(`${import.meta.env.BASE_URL}glb/BigTree.glb`)
  const fallHouseTrees = useGLTF(`${import.meta.env.BASE_URL}glb/FallHouseTrees.glb`)

  // Traverse on load to collect names and prepare materials for highlighting
  useEffect(() => {
    const scenes = [
      { scene: fallHouse.scene, prefix: 'FallHouse' },
      { scene: bookStore.scene, prefix: 'BookStore' },
      { scene: bigTree.scene, prefix: 'BigTree' },
      { scene: fallHouseTrees.scene, prefix: 'FallHouseTrees' }
    ]

    const extractedNames = []

    scenes.forEach(({ scene, prefix }) => {
      scene.traverse((child) => {
        if (child.isMesh) {
          // If a mesh doesn't have a specific name, give it a unique one so we can select it
          if (!child.name || child.name.includes("Mesh_")) {
            child.name = `${prefix}_Part_${child.uuid.substring(0, 5)}`
          }

          extractedNames.push(child.name)

          // Clone the material and backup its original state so we can reset it after highlighting
          if (!child.userData.isSetup) {
            child.material = child.material.clone()
            // Store the original emissive color in userData
            child.userData.originalEmissive = child.material.emissive.clone()
            child.userData.isSetup = true
          }
        }
      })
    })

    // Send the compiled list of names to the parent UI component
    setAllMeshes(extractedNames)
  }, [fallHouse, bookStore, bigTree, fallHouseTrees, setAllMeshes])

  // React to selection changes to highlight the active mesh
  useEffect(() => {
    const scenes = [fallHouse.scene, bookStore.scene, bigTree.scene, fallHouseTrees.scene]
    
    scenes.forEach((scene) => {
      scene.traverse((child) => {
        if (child.isMesh && child.userData.isSetup) {
          if (child.name === selectedMesh) {
            // HIGHLIGHT: Set emissive color to bright red when selected
            child.material.emissive.setHex(0xff0000) 
            child.material.emissiveIntensity = 2
          } else {
            // RESET: Revert to original emissive color when deselected
            child.material.emissive.copy(child.userData.originalEmissive)
            child.material.emissiveIntensity = 1
          }
        }
      })
    })
  }, [selectedMesh, fallHouse, bookStore, bigTree, fallHouseTrees])

  // Handle clicking directly on the 3D models
  const handlePointerDown = (e) => {
    e.stopPropagation() // Prevent selecting objects behind the clicked object
    if (e.object.isMesh) {
      setSelectedMesh(e.object.name)
    }
  }

  return (
    <group 
      onPointerDown={handlePointerDown}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    >
      {/* Positioned slightly apart for visibility. Adjust as needed for your actual scene */}
      <primitive object={fallHouse.scene} position={[-8, 0, 0]} />
      <primitive object={bookStore.scene} position={[8, 0, 0]} />
      <primitive object={bigTree.scene} position={[0, 0, -8]} />
      <primitive object={fallHouseTrees.scene} position={[0, 0, 8]} />
    </group>
  )
}

/**
 * 2. THE MAIN WRAPPER (UI + CANVAS)
 * Manages the state and renders both the 2D Panel and the 3D Canvas
 */
export default function InteractiveModelManager() {
  const [allMeshes, setAllMeshes] = useState([])
  const [selectedMesh, setSelectedMesh] = useState(null)

  // CSS for the side panel overlay
  const uiStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '320px',
    height: '100vh',
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    color: 'white',
    padding: '20px',
    overflowY: 'auto',
    fontFamily: 'sans-serif',
    zIndex: 10,
    boxSizing: 'border-box'
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      
      {/* --- UI PANEL --- */}
      <div style={uiStyle}>
        <h2 style={{ marginTop: 0 }}>Model Inspector</h2>
        
        {/* Currently Selected Display */}
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#333', borderRadius: '6px' }}>
          <strong style={{ fontSize: '14px', color: '#aaa' }}>Selected Object:</strong>
          <p style={{ color: '#ff5555', margin: '8px 0 0 0', wordBreak: 'break-all', fontWeight: 'bold' }}>
            {selectedMesh ? selectedMesh : 'None selected'}
          </p>
        </div>

        <hr style={{ borderColor: '#444', marginBottom: '20px' }} />
        
        {/* Clickable List of All Children */}
        <h3 style={{ fontSize: '16px', color: '#ddd' }}>All Children ({allMeshes.length})</h3>
        
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
          {allMeshes.map((meshName, index) => (
            <li 
              key={index}
              onClick={() => setSelectedMesh(meshName)}
              style={{
                padding: '10px',
                borderBottom: '1px solid #444',
                cursor: 'pointer',
                backgroundColor: selectedMesh === meshName ? '#552222' : 'transparent',
                fontSize: '13px',
                wordBreak: 'break-all',
                transition: 'background-color 0.2s'
              }}
            >
              {meshName}
            </li>
          ))}
        </ul>
      </div>

      {/* --- 3D CANVAS --- */}
      <Canvas camera={{ position: [0, 10, 25], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={1.2} />
        
        <Suspense fallback={null}>
          <SceneContent 
            setSelectedMesh={setSelectedMesh} 
            selectedMesh={selectedMesh}
            setAllMeshes={setAllMeshes}
          />
        </Suspense>

        <OrbitControls makeDefault />
      </Canvas>
    </div>
  )
}