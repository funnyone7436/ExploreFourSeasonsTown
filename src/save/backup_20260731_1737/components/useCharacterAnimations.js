import { useEffect } from 'react'

export default function useCharacterAnimations(catActions, girlActions, squirrelActions, seagullActions) {
  useEffect(() => {
    if (catActions) {
      // OPTIMIZATION: Store keys in a variable to avoid iterating the object twice
      const keys = Object.keys(catActions)
      if (keys.length > 0) {
        catActions[keys[0]]?.reset().play()
      }
    }
  }, [catActions])

  useEffect(() => {
    if (girlActions) {
      const keys = Object.keys(girlActions)
      if (keys.length > 0) {
        girlActions[keys[0]]?.reset().play()
      }
    }
  }, [girlActions])

  useEffect(() => {
    if (squirrelActions) {
      const keys = Object.keys(squirrelActions)
      if (keys.length > 0) {
        squirrelActions[keys[0]]?.reset().play()
      }
    }
  }, [squirrelActions])
  
  useEffect(() => {
    if (seagullActions) {
      Object.keys(seagullActions).forEach((animationName) => {
        seagullActions[animationName]?.reset().play()
      })
    }
  }, [seagullActions])
}