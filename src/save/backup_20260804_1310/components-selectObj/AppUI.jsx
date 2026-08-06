import React, { useEffect, useRef } from 'react'
import { loadAudioAndBeats, getAudio } from '../utils/AudioManager'

const GAME_LOOP_FPS = 1; 
const FRAME_DELAY_MS = 1000 / GAME_LOOP_FPS;
const BASE_FONT_SIZE = 16 

function isAudioPlaying(audio) {
  if (!audio) return false
  return !audio.ended
}

// 1. Accept the new props here
export default function AppUI({ 
  motionValue, isGameActive, isAutoMode, setIsAutoMode,
  allMeshes, selectedMesh, setSelectedMesh 
}) {
  const audioStarted = useRef(false)
  const motionValRef = useRef(0) 

  useEffect(() => {
    motionValRef.current = motionValue
  }, [motionValue])

  useEffect(() => {
    const setup = async () => {
      if (typeof loadAudioAndBeats === 'function') {
         await loadAudioAndBeats()
      }
    }
    setup()
  }, [])

  useEffect(() => {
    let timerId = null 
    const audio = getAudio()
    if (audio) {
      audio.volume = 0.1; 
    }

    const loop = () => {
      if (motionValRef.current > 0 && !audioStarted.current) {
        const activeAudio = getAudio()
        if (activeAudio) {
          audioStarted.current = true
        }
      }
      timerId = setTimeout(loop, FRAME_DELAY_MS)
    }

    loop()
    return () => clearTimeout(timerId)
  }, [isGameActive])

  // CSS for the new side panel overlay
  const uiStyle = {
    position: 'absolute',
    top: '80px', // Pushed down so it doesn't cover your Auto Spin button
    left: '20px',
    width: '300px',
    maxHeight: 'calc(100vh - 120px)',
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
    backdropFilter: 'blur(4px)',
    color: 'white',
    padding: '20px',
    overflowY: 'auto',
    fontFamily: 'sans-serif',
    zIndex: 9999,
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
    boxSizing: 'border-box'
  }

  return (
    <>
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 9999 }}>
        <button 
          onClick={() => setIsAutoMode(!isAutoMode)}
          style={{
            backgroundColor: isAutoMode ? 'rgba(100, 200, 100, 0.8)' : 'rgba(200, 100, 100, 0.8)',
            color: 'white', border: 'none', padding: '8px 16px',
            borderRadius: '8px', fontSize: '14px', fontWeight: 'bold',
            cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            transition: 'background-color 0.2s'
          }}
        >
          {isAutoMode ? '⏸️ Stop Spin' : '▶️ Auto Spin'}
        </button>
      </div>

      {/* 2. THE NEW MODEL INSPECTOR UI PANEL */}
      <div style={uiStyle}>
        <h2 style={{ marginTop: 0, fontSize: '18px' }}>Model Inspector</h2>
        
        <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}>
          <strong style={{ fontSize: '12px', color: '#ccc' }}>Selected Object:</strong>
          <p style={{ color: '#ff7777', margin: '5px 0 0 0', wordBreak: 'break-all', fontWeight: 'bold', fontSize: '14px' }}>
            {selectedMesh ? selectedMesh : 'None selected'}
          </p>
        </div>

        <h3 style={{ fontSize: '14px', color: '#ddd' }}>Clickable Parts ({allMeshes?.length || 0})</h3>
        
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
          {allMeshes && allMeshes.map((meshName, index) => (
            <li 
              key={index}
              onClick={() => setSelectedMesh(meshName)}
              style={{
                padding: '8px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                backgroundColor: selectedMesh === meshName ? 'rgba(255,100,100,0.3)' : 'transparent',
                fontSize: '12px',
                wordBreak: 'break-all',
                transition: 'background-color 0.2s'
              }}
            >
              {meshName}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ /* Explore Title - unedited */ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '10px 20px', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', lineHeight: '1.4' }}>
        <div style={{ fontSize: '18px', opacity: 0.9 }}> Explore Four Seasons Town </div>
        <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px', fontWeight: 'normal' }}> 🖱️ Drag • ⌨️ Arrows </div>
      </div>

      <div style={{ /* Source Link - unedited */ position: 'absolute', bottom: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '6px 10px', borderRadius: '8px', fontSize: '14px', zIndex: 1000 }}>
        <div>🔐 No worries, just fun!</div>
        <a href="https://github.com/funnyone7436/Flowers-In-Spring" target="_blank" style={{ color: '#61dafb' }}>🔍 View full source</a>
      </div>
    </>
  )
}