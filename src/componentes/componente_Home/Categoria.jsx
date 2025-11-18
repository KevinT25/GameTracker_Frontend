import { useState } from 'react'
import CardJuego from '../componente_General/CardJuego'

function SliderCategoria({ titulo, juegos }) {
  const [indice, setIndice] = useState(0)

  const siguiente = () => {
    if (indice >= juegos.length - 1) {
      setIndice(0)
      return
    }
    setIndice((prev) => prev + 1)
  }

  const anterior = () => {
    if (indice <= 0) {
      setIndice(juegos.length - 1)
      return
    }
    setIndice((prev) => prev - 1)
  }

  // Duplica los juegos para lograr efecto de bucle visual
  const juegosExtendidos = [...juegos, ...juegos, ...juegos]

  return (
    <div className="slider-categoria">
      <h2 className="titulo-categoria">{titulo}</h2>

      <div className="contenedor-slider">
        <button className="nav-btn izquierda" onClick={anterior}>
          ❮
        </button>

        <div
          className="slider-track"
          style={{
            transform: `translateX(-${(indice * 100) / 4}%)`,
          }}
        >
          {juegosExtendidos.map((juego, i) => (
            <CardJuego key={`${titulo}-${i}`} juego={juego} />
          ))}
        </div>

        <button className="nav-btn derecha" onClick={siguiente}>
          ❯
        </button>
      </div>
    </div>
  )
}

export default SliderCategoria
