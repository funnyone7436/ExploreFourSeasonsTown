import { useEffect } from 'react'

export default function useCharacterAnimations(catActions, girlActions, squirrelActions, seagullActions) {
  useEffect(() => {
    if (catActions && Object.keys(catActions).length > 0) {
      const firstAnimationName = Object.keys(catActions)[0]
      catActions[firstAnimationName]?.reset().play()
    }
  }, [catActions])

  useEffect(() => {
    if (girlActions && Object.keys(girlActions).length > 0) {
      const firstAnimationName = Object.keys(girlActions)[0]
      girlActions[firstAnimationName]?.reset().play()
    }
  }, [girlActions])

  useEffect(() => {
    if (squirrelActions && Object.keys(squirrelActions).length > 0) {
      const firstAnimationName = Object.keys(squirrelActions)[0]
      squirrelActions[firstAnimationName]?.reset().play()
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