import { useEffect, useState } from 'react'
import { getGameState, setGameState } from '../helpers/gameState'

export const useGameState = (id) => {
  const [state, setState] = useState(() => getGameState(id))

  const toggle = (campo) => {
    setState((prev) => {
      const updated = { ...prev, [campo]: !prev[campo] }
      setGameState(id, updated)
      return updated
    })
  }

  useEffect(() => {
    setState(getGameState(id))
  }, [id])

  return { state, toggle }
}