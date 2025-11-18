import '../../styles/Ranking.css'
import { useEffect, useState } from 'react'

import rankingAmigo from '../../../assets/ranking/rankingAmigo.png'
import rankingLogro from '../../../assets/ranking/rankingLogro.png'
import rankingReseña from '../../../assets/ranking/rankingReseña.png'
import rankingJuego from '../../../assets/ranking/rankingJuego.png'
import rankingHora from '../../../assets/ranking/rankingHora.png'

const estatuas = [
  { src: rankingAmigo, alt: 'Ranking de amigos', key: 'cantidaddeamigos' },
  { src: rankingHora, alt: 'Ranking de horas', key: 'tiempoActivo' },
  {
    src: rankingJuego,
    alt: 'Ranking de juegos completados',
    key: 'misionesCompletadas',
  },
  { src: rankingReseña, alt: 'Ranking de reseñas', key: 'reseñasDadas' },
  {
    src: rankingLogro,
    alt: 'Ranking de logros obtenidos',
    key: 'logrosObtenidos',
  },
]

function Ranking() {
  const [rankingData, setRankingData] = useState([])
  const [misStats, setMisStats] = useState(null)
  const [mostrarMiRanking, setMostrarMiRanking] = useState(false)
  const [usuarioId, setUsuarioId] = useState(null)
  
  // Cargar ranking general
  useEffect(() => {
    const cargarRanking = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL
        const res = await fetch(`${API_URL}/api/dataUser/leaderboard`)
        if (!res.ok) throw new Error('Error al cargar ranking')
        const data = await res.json()
        setRankingData(data)
      } catch (err) {
        console.error('Error cargando ranking:', err)
      }
    }
    cargarRanking()
  }, [])

  // Obtener ID del usuario actual
  useEffect(() => {
    let uid = null

    const userData = localStorage.getItem('user')
    if (userData) uid = JSON.parse(userData)?.id

    setUsuarioId(uid)

    if (!uid) return

    const cargarMisStats = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL
        const res = await fetch(`${API_URL}/api/dataUser/usuario/${uid}/stats`)
        const data = await res.json()
        setMisStats(data)
      } catch (err) {
        console.error('Error al cargar mis stats:', err)
      }
    }

    cargarMisStats()
  }, [])

  //Calcular mi puesto por categoría
  const calcularPuesto = (key) => {
    if (!misStats || !usuarioId || rankingData.length === 0) return null

    const ordenados = [...rankingData].sort(
      (a, b) => (b[key] || 0) - (a[key] || 0)
    )

    const index = ordenados.findIndex((u) => u.usuarioId === usuarioId)

    if (index === -1) return { miPuesto: null }

    return { miPuesto: index + 1 }
  }

  return (
    <div className="ranking">
      <h2>Salón de la fama</h2>

      <button
        className="btn-ranking"
        onClick={() => setMostrarMiRanking(!mostrarMiRanking)}
      >
        {mostrarMiRanking ? 'Ver Top 1' : 'Ver mi ranking'}
      </button>

      <div className="salon-container">
        {estatuas.map((r, i) => {
          let nombre = '---'
          let valor = 0

          if (!mostrarMiRanking) {
            /** === Mostrar TOP 1 === */
            const topUser = [...rankingData].sort(
              (a, b) => (b[r.key] || 0) - (a[r.key] || 0)
            )[0]
            nombre = topUser?.nombre || '---'
            valor = topUser?.[r.key] || 0
          } else if (misStats) {
            /** === Mostrar MIS DATOS === */
            nombre = misStats.nombre || 'Yo'
            valor = misStats[r.key] || 0
          }

          const puesto = mostrarMiRanking ? calcularPuesto(r.key) : null

          return (
            <div key={i} className="estatua-wrapper">
              <h3>
                {mostrarMiRanking ? (
                  `Top ${puesto?.miPuesto} de ${rankingData.length}`
                ) : (
                  <>
                    <span>{nombre}</span>
                    <p>Top 1 de {rankingData.length}</p>
                  </>
                )}
              </h3>

              <img src={r.src} alt={r.alt} className="estatua-img" />

              <h3>{r.alt}</h3>
              <p className="valor-ranking">{valor}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Ranking
