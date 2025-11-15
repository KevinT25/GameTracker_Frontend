import '../../styles/Perfil.css'
import { useEffect, useRef } from 'react'

function Estadisticas({ stats }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const size = 300
    const center = size / 2
    const radius = 100

    canvas.width = size
    canvas.height = size

    ctx.clearRect(0, 0, size, size)

    const labels = ['Jugado', 'Misiones', 'Amigos', 'Logros', 'Reseñas']
    const values = [
      stats.tiempoActivo / 100,
      stats.misionesCompletadas / 100,
      stats.cantidaddeamigos / 100,
      stats.logrosObtenidos / 100,
      stats.reseñasDadas / 100,
    ]

    // Dibujar fondo del radar
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

    // Dibujar los valores del jugador
    ctx.beginPath()
    for (let i = 0; i < values.length; i++) {
      const angle = (Math.PI * 2 * i) / values.length
      const valueRadius = radius * Math.min(values[i], 1.2) // permite superar el límite visual
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
            Misiones completadas: {stats.misionesCompletadas}
          </div>
          <div className="stat-box glow">
            Reseña Escritas: {stats.reseñasDadas}
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
