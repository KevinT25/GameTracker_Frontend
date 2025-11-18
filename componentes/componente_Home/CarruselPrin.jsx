import './../../styles/CarruselPrin.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Loader from '../componente_General/Loading'
import tiempoCarga2 from './../../../assets/loadingGif/tiempoCarga2.gif'

function SliderCarruselPrincipal() {
  const [juegosRecomendados, setRecomendados] = useState([])
  const [loading, setLoading] = useState(true)
  const [indice, setIndice] = useState(0)
  const navigate = useNavigate()
  const API_URL = import.meta.env.VITE_API_URL
  useEffect(() => {
    setLoading(true)

    const timeout = setTimeout(() => {
      setLoading(true)
    }, 7000)

    fetch(`${API_URL}/api/games`)
      .then((res) => res.json())
      .then((data) => {
        const aleatorios = [...data].sort(() => Math.random() - 0.5).slice(0, 5)
        setRecomendados(aleatorios)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error al cargar juegos:', err)
      })
      .finally(() => clearTimeout(timeout))
  }, [])

  useEffect(() => {
    if (juegosRecomendados.length === 0) return
    const intervalo = setInterval(() => {
      setIndice((prev) => (prev + 1) % juegosRecomendados.length)
    }, 5000)
    return () => clearInterval(intervalo)
  }, [juegosRecomendados])

  if (loading) return <Loader imagen={tiempoCarga2} />

  return (
    <section className="slider-carrusel">
      {juegosRecomendados.map((juego, i) => (
        <div
          key={juego._id}
          className={`slide ${i === indice ? 'activo' : ''}`}
          onClick={() => navigate(`/info/${juego._id}`)}
          style={{ cursor: 'pointer' }}
        >
          <img
            className="slide-img"
            src={juego.imagenPortada}
            alt={juego.titulo}
          />
          <div className="overlay">
            <span></span>
            <button
              className="button"
              onClick={(e) => {
                e.stopPropagation() // Evita que se dispare el onClick del slide
                navigate(`/biblioteca`)
              }}
            >
              Ver más
            </button>
          </div>
        </div>
      ))}
    </section>
  )
}

export default SliderCarruselPrincipal
