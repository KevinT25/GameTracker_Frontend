import { useState } from 'react'
import iconGrimorio from '../../../assets/Icons/iconGrimorio.png'
import iconGrimorioVacio from '../../../assets/Icons/iconGrimorioVacio.png'

function FormularioResenias({
  juegoId,
  usuarioId,
  nombreUsuario,
  onReseniaEnviada,
}) {
  const [puntuacion, setPuntuacion] = useState(0)
  const [textoResenia, setTextoResenia] = useState('')
  const [horasJugadas, setHorasJugadas] = useState(0)
  const [dificultad, setDificultad] = useState('')
  const [recomendaria, setRecomendaria] = useState(true)
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const [respuestas, setRespuestas] = useState([])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (textoResenia.trim().length < 5) {
      setMensaje('La reseña debe tener al menos 5 caracteres.')
      return
    }

    setCargando(true)
    setMensaje('')

    try {
      const API_URL = import.meta.env.VITE_API_URL
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          juegoId,
          usuarioId,
          nombreUsuario,
          puntuacion,
          textoResenia,
          horasJugadas,
          dificultad,
          recomendaria,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al enviar resenia')

      setMensaje('Reseña enviada correctamente')

      // Limpiar campos
      setPuntuacion(0)
      setTextoResenia('')
      setHorasJugadas(0)
      setDificultad('')
      setRecomendaria(true)

      // Notificar al componente padre
      if (typeof onReseniaEnviada === 'function') onReseniaEnviada(data)

      // Actualizar respuestas si existen
      if (data.respuestas) setRespuestas(data.respuestas)
    } catch (err) {
      setMensaje(err.message)
    } finally {
      setCargando(false)
    }
  }



  return (
    <div className="reseña-container">
      <h3>Escribe tu reseña</h3>
      <form onSubmit={handleSubmit}>
        <label>
          Reseña:
          <textarea
            value={textoResenia}
            onChange={(e) => setTextoResenia(e.target.value)}
            rows={4}
          />
        </label>

        <div className="datos-juego">
          <label>
            Asunto:
            <input
              type="text"
              value={dificultad}
              onChange={(e) => setDificultad(e.target.value)}
              placeholder="Explicacion"
            />
          </label>
          <label>
            Horas jugadas:
            <input
              type="number"
              value={horasJugadas}
              onChange={(e) => setHorasJugadas(Number(e.target.value))}
              min={0}
            />
          </label>
        </div>

        <div className="recomendarias">
          <label className="label-puntuacion">
            Puntuación:
            <div className="rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <img
                  key={n}
                  src={n <= puntuacion ? iconGrimorio : iconGrimorioVacio}
                  alt={`${n} grmorio`}
                  onClick={() => setPuntuacion(n)}
                  className="grimorio"
                />
              ))}
            </div>
          </label>
          <label>
            <input
              type="checkbox"
              checked={recomendaria}
              onChange={(e) => setRecomendaria(e.target.checked)}
              className="checkbox-magic"
            />
            Recomendaría el juego
          </label>
        </div>

        <button type="submit" disabled={cargando}>
          {cargando ? 'Enviando...' : 'Enviar reseña'}
        </button>
      </form>

      {mensaje && <p>{mensaje}</p>}

      {/* Mostrar respuestas con nombre y título */}
      {respuestas.length > 0 && <RespuestasList respuestas={respuestas} />}
    </div>
  )
}

export default FormularioResenias
