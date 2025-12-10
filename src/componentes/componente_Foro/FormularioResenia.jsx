import { useState, useEffect } from 'react'
import iconGrimorio from '../../assets/Icons/iconGrimorio.png'
import iconGrimorioVacio from '../../assets/Icons/iconGrimorioVacio.png'

function FormularioReview({
  editando,
  onReviewCreada,
  juegoId,
  usuarioId,
  nombreUsuario,
}) {
  const [puntuacion, setPuntuacion] = useState(0)
  const [textoResenia, setTextoResenia] = useState('')
  const [horasJugadas, setHorasJugadas] = useState(0)
  const [asunto, setAsunto] = useState('')
  const [recomendaria, setRecomendaria] = useState(true)
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL

  const token = localStorage.getItem('token')

  // ---------------------------------------------------
  // Rellenar campos si estamos editando
  // ---------------------------------------------------
  useEffect(() => {
    if (editando) {
      setPuntuacion(editando.puntuacion || 0)
      setTextoResenia(editando.textoResenia || '')
      setHorasJugadas(editando.horasJugadas || 0)
      setAsunto(editando.asunto || '')
      setRecomendaria(editando.recomendaria ?? true)
    }
  }, [editando])

  // ---------------------------------------------------
  // Manejo de puntuación con grimorios
  // ---------------------------------------------------
  const seleccionarPuntuacion = (valor) => {
    setPuntuacion(valor)
  }

  // ---------------------------------------------------
  // Enviar formulario
  // ---------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!textoResenia.trim()) {
      setMensaje('La reseña no puede estar vacía.')
      return
    }

    setCargando(true)
    setMensaje('')

    try {
      const metodo = editando ? 'PUT' : 'POST'
      const url = editando
        ? `${API_URL}/api/reviews/${editando._id}`
        : `${API_URL}/api/reviews`

      const res = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          juegoId,
          usuarioId,
          nombreUsuario,
          puntuacion,
          textoResenia,
          horasJugadas,
          asunto,
          recomendaria,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Error al guardar reseña.')

      setMensaje(editando ? 'Reseña actualizada.' : 'Reseña publicada.')
      if (onReviewCreada) onReviewCreada(data)
    } catch (error) {
      setMensaje(error.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="reseña-container">
      <h3>{editando ? 'Editar reseña' : 'Nueva reseña'}</h3>

      <form onSubmit={handleSubmit}>
        {/* DATOS DEL JUEGO: asunto + horas jugadas */}
        <div className="datos-juego">
          <label>
            Asunto:
            <input
              type="text"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              placeholder="Ej: Excelente jugabilidad"
            />
          </label>

          <label>
            Horas jugadas:
            <input
              type="number"
              min="0"
              value={horasJugadas}
              onChange={(e) => setHorasJugadas(Number(e.target.value))}
            />
          </label>
        </div>

        {/* TEXTO DE RESEÑA */}
        <label>
          Reseña:
          <textarea
            value={textoResenia}
            onChange={(e) => setTextoResenia(e.target.value)}
            rows={5}
            placeholder="Escribe tu experiencia con el juego..."
          />
        </label>

        {/* RECOMENDARÍA */}
        <div className="recomendarias">
          <label>
            <input
              type="checkbox"
              className="checkbox-magic"
              checked={recomendaria}
              onChange={(e) => setRecomendaria(e.target.checked)}
            />
            Recomendado
          </label>
        </div>

        {/* PUNTUACIÓN */}
        <div className="label-puntuacion">
          <span>Puntuación:</span>

          <div className="rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <img
                key={n}
                src={n <= puntuacion ? iconGrimorio : iconGrimorioVacio}
                alt={`Puntuación ${n}`}
                className="grimorio"
                onClick={() => seleccionarPuntuacion(n)}
              />
            ))}
          </div>
        </div>

        {/* BOTÓN */}
        <button type="submit" disabled={cargando}>
          {cargando
            ? 'Guardando...'
            : editando
            ? 'Guardar cambios'
            : 'Publicar'}
        </button>
      </form>

      {mensaje && <p>{mensaje}</p>}
    </div>
  )
}

export default FormularioReview
