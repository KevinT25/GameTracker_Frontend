import './../../styles/CarruselSecun.css'
import { useEffect, useState } from 'react'
import SliderCategoria from './Categoria'
import { authFetch } from '../../helpers/authFetch' 

function SlidersContainer() {
  const [juegos, setJuegos] = useState([])
  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    let cancelado = false

    authFetch(`${API_URL}/api/games`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelado) setJuegos(data)
      })
      .catch((err) => console.error('Error al cargar juegos:', err))

    return () => {
      cancelado = true
    }
  }, [])

  // --- FILTROS (se mantienen IGUAL que los tuyos) ---

  const juegosAventura = juegos.filter((j) =>
    j.genero?.toLowerCase().includes('aventura')
  )

  const juegosAccion = juegos.filter((j) =>
    j.genero?.toLowerCase().includes('acción')
  )

  const juegosTodoPublico = juegos.filter(
    (j) => j.clasificacionEdad === 'E' || j.clasificacionEdad === 'E10+'
  )

  const juegosT = juegos.filter(
    (j) => j.clasificacionEdad === 'T' || j.clasificacionEdad === '+18'
  )

  const juegos2000 = juegos.filter(
    (j) => j.anioLanzamiento >= 2000 && j.anioLanzamiento <= 2010
  )

  const juegosMovil = juegos.filter((j) =>
    j.plataforma?.toLowerCase().match(/móvil|android|ios|movile/)
  )

  const juegosPC = juegos.filter(
    (j) =>
      j.plataforma?.toLowerCase().includes('pc') ||
      j.plataforma?.toLowerCase().includes('xbox')
  )

  return (
    <div className="sliders-container">
      <SliderCategoria titulo="Juegos de Aventura" juegos={juegosAventura} />
      <SliderCategoria titulo="Juegos de Acción" juegos={juegosAccion} />
      <SliderCategoria titulo="Juegos para Todos" juegos={juegosT} />
      <SliderCategoria
        titulo="Los mejores juegos del 2000"
        juegos={juegos2000}
      />
      <SliderCategoria
        titulo="Los mejores juegos móviles"
        juegos={juegosMovil}
      />
      <SliderCategoria titulo="Juegos de PC y XBOX" juegos={juegosPC} />
      <SliderCategoria titulo="Todo Público" juegos={juegosTodoPublico} />
    </div>
  )
}

export default SlidersContainer
