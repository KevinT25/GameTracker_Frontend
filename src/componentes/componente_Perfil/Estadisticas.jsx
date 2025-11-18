import '../../styles/Perfil.css'
import { useEffect, useRef } from 'react'

function Estadisticas({ stats }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!stats) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const size = 300
    const center = size / 2
    const radius = 100

    canvas.width = size
    canvas.height = size

    ctx.clearRect(0, 0, size, size)

    const labels = ['Jugado', 'Completados', 'Amigos', 'Logros', 'Reseñas']

    // Normalización
    const normalize = (value, max) => Math.min(value / max, 1)

    const values = [
      normalize(stats.tiempoActivo, 200), // 200 horas
      normalize(stats.misionesCompletadas, 50), // 50 misiones
      normalize(stats.cantidaddeamigos, 20), // 20 amigos
      normalize(stats.logrosObtenidos, 10), // 40 logros
      normalize(stats.reseñasDadas, 10), // 10 reseñas
    ]

    // Fondo del radar
    ctx.strokeStyle = 'rgba(212,175,55,0.4)'
    ctx.lineWidth = 1
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath()
      for (let j = 0; j < labels.length; j++) {
        const angle = (Math.PI * 2 * j) / labels.length
        const x = center + Math.cos(angle) * ((radius * i) / 5)
        const y = center + Math.sin(angle) * ((radius * i) / 5)
        if (j === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.stroke()
    }

    // Valores del jugador
    ctx.beginPath()
    for (let i = 0; i < values.length; i++) {
      const angle = (Math.PI * 2 * i) / values.length
      const valueRadius = radius * values[i]
      const x = center + Math.cos(angle) * valueRadius
      const y = center + Math.sin(angle) * valueRadius
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.fillStyle = 'rgba(212,175,55,0.3)'
    ctx.strokeStyle = 'rgba(212,175,55,0.8)'
    ctx.lineWidth = 2
    ctx.fill()
    ctx.stroke()

    // Etiquetas
    ctx.fillStyle = '#fff'
    ctx.font = '14px Cinzel Decorative'
    labels.forEach((label, i) => {
      const angle = (Math.PI * 2 * i) / labels.length
      const x = center + Math.cos(angle) * (radius + 25)
      const y = center + Math.sin(angle) * (radius + 25)
      ctx.textAlign = 'center'
      ctx.fillText(label, x, y)
    })
  }, [stats])

  return (
    <div className="estadisticas-container">
      <h2 className="estadisticas-title">Estadísticas</h2>

      <div className="estadisticas-content">
        <div className="estadisticas-left">
          <div className="stat-box glow">Amigos: {stats.cantidaddeamigos}</div>
          <div className="stat-box glow">
            Horas jugadas: {stats.tiempoActivo}
          </div>
          <div className="stat-box glow">
            Juegos completados: {stats.misionesCompletadas}
          </div>
          <div className="stat-box glow">
            Reseñas Escritas: {stats.reseñasDadas}
          </div>
          <div className="stat-box glow">
            Logros obtenidos: {stats.logrosObtenidos}
          </div>
        </div>

        <div className="chart-container">
          <canvas ref={canvasRef}></canvas>
        </div>
      </div>
    </div>
  )
}

export default Estadisticas
