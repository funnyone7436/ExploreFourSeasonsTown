import React, { useEffect, useRef } from 'react'
import { loadAudioAndBeats, getAudio } from '../utils/AudioManager'

const GAME_LOOP_FPS = 1; 
const FRAME_DELAY_MS = 1000 / GAME_LOOP_FPS;
const BASE_FONT_SIZE = 16 

function isAudioPlaying(audio) {
  if (!audio) return false
  return !audio.ended
}

export default function AppUI({ motionValue, isGameActive, isAutoMode, setIsAutoMode }) {
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

  return (
    <>
      {/* CAMERA TOGGLE BUTTON - FORCE ANCHORED TO TOP LEFT */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20, 
        zIndex: 9999
      }}>
        <button 
          onClick={() => setIsAutoMode(!isAutoMode)}
          style={{
            backgroundColor: isAutoMode ? 'rgba(100, 200, 100, 0.8)' : 'rgba(200, 100, 100, 0.8)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            transition: 'background-color 0.2s'
          }}
        >
          {isAutoMode ? '⏸️ Stop Spin' : '▶️ Auto Spin'}
        </button>
      </div>

      {/* Bottom Center: Explore Title */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0,0,0,0.6)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '12px',
        fontSize: '18px',
        fontWeight: 'bold',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        lineHeight: '1.4'
      }}>
        <div style={{ fontSize: '18px', opacity: 0.9 }}> Explore Four Seasons Town </div>
        <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px', fontWeight: 'normal' }}>
          🖱️ Drag • ⌨️ Arrows
        </div>
      </div>

      {/* Bottom Right: Source Link */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        color: 'white',
        padding: '6px 10px',
        borderRadius: '8px',
        fontSize: '14px',
        zIndex: 1000
      }}>
        <div>🔐 Have fun!</div>
        <a href="https://github.com/funnyone7436/ExploreFourSeasonsTown" target="_blank" style={{ color: '#61dafb' }}>🔍 View full source</a>
      </div>
    </>
  )
}