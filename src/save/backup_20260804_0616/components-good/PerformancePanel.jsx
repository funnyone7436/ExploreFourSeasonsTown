import React, { useEffect, useRef } from 'react'

// --- 1. GLOBAL TRACKER (Non-Reactive) ---
// This sits outside React so we can update it thousands of times a second without lagging.
export const performanceData = {}

export function trackTime(moduleName, callback) {
  const start = performance.now()
  const result = callback()
  const end = performance.now()
  const duration = end - start

  if (!performanceData[moduleName]) {
    performanceData[moduleName] = { current: 0, average: 0 }
  }
  
  const stats = performanceData[moduleName]
  stats.current = duration
  
  // Use a simple exponential moving average to smooth out the numbers so they are readable
  stats.average = stats.average === 0 ? duration : (stats.average * 0.9) + (duration * 0.1)

  return result
}

// --- 2. STANDALONE UI PANEL ---
export default function PerformancePanel() {
  const panelRef = useRef(null)

  useEffect(() => {
    // Update the UI text twice a second (500ms)
    const interval = setInterval(() => {
      if (!panelRef.current) return
      
      let html = '<div style="margin-bottom: 8px; font-weight: bold; border-bottom: 1px solid #555; padding-bottom: 4px;">CPU Profiler (ms)</div>'
      
      const keys = Object.keys(performanceData).sort()
      
      if (keys.length === 0) {
        html += '<div style="font-size: 12px; color: #aaa;">Waiting for data...</div>'
      } else {
        keys.forEach(key => {
          const data = performanceData[key]
          // Highlight slow modules in red (anything taking more than 3ms per frame)
          const color = data.average > 3.0 ? '#ff5555' : '#aaffaa'
          
          html += `
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
              <span>${key}:</span>
              <span style="color: ${color}; font-weight: bold;">${data.average.toFixed(2)} ms</span>
            </div>
          `
        })
      }
      
      // Direct DOM manipulation bypasses React rendering
      panelRef.current.innerHTML = html
    }, 500) 

    return () => clearInterval(interval)
  }, [])

  return (
    <div 
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        color: '#ffffff',
        padding: '12px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        minWidth: '220px',
        zIndex: 999999, // Floating above absolutely everything
        pointerEvents: 'none',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
      }}
    >
      <div ref={panelRef}>Loading...</div>
    </div>
  )
}