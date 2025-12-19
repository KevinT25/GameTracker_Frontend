const KEY = 'gameStates'

export const getGameStates = () => {
  return JSON.parse(localStorage.getItem(KEY) || '{}')
}

export const getGameState = (id) => {
  const all = getGameStates()
  return (
    all[id] || {
      wishlist: false,
      misjuegos: false,
      completado: false,
    }
  )
}

export const setGameState = (id, newState) => {
  const all = getGameStates()
  all[id] = newState
  localStorage.setItem(KEY, JSON.stringify(all))
}