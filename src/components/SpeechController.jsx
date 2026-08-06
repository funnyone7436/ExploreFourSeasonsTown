import { useEffect, useRef } from 'react'
import * as tf from '@tensorflow/tfjs'
import * as speechCommands from '@tensorflow-models/speech-commands'

export default function SpeechController({ onCommandDetected }) {
  const recognizerRef = useRef(null)
  const isLoadingRef = useRef(false)

  useEffect(() => {
    async function setupSpeechAI() {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;

      try {
        console.log("⏳ Loading AI Analysis Model...");
        
        const recognizer = speechCommands.create('BROWSER_FFT');
        await recognizer.ensureModelLoaded();
        recognizerRef.current = recognizer;

        console.log("🎤 AI Brain Active. Labels:", recognizer.wordLabels());

        recognizer.listen(result => {
          const scores = Array.from(result.scores);
          const labels = recognizer.wordLabels();
          const index = scores.indexOf(Math.max(...scores));
          const word = labels[index];
          const score = scores[index];

          if (score > 0.40) {
            console.log(`👂 AI Brain: ${word} (${(score * 100).toFixed(0)}%)`);
          }

          // Validation parameters for all directions
          const isUp = word === "up" && score > 0.995; 
          const isDown = word === "down" && score > 0.80;
          const isLeft = word === "left" && score > 0.85;
          const isRight = word === "right" && score > 0.85;

          if (isUp || isDown || isLeft || isRight) {
            console.log(`✅ VERIFIED: Moving ${word.toUpperCase()}`);
            onCommandDetected(word);
          }
        }, {
          probabilityThreshold: 0.90, 
          overlapFactor: 0.50,        
          invokeCallbackOnNoiseAndUnknown: false
        })
      } catch (err) {
        console.error("❌ AI Analysis Error:", err);
        isLoadingRef.current = false;
      }
    }

    setupSpeechAI();

    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.stopListening();
        recognizerRef.current = null;
        isLoadingRef.current = false;
      }
    };
  }, [onCommandDetected])

  return null
}