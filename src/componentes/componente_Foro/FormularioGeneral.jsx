import { useState } from 'react'

function FormularioReseniaGeneral({ onPublicacionCreada }) {
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [tag, setTag] = useState('general')
  const [likes, setLikes] = useState(0)

  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (titulo.trim().length < 3) {
      setMensaje('El título debe tener al menos 3 caracteres.')
      return
    }

    if (contenido.trim().length < 10) {
      setMensaje('El contenido debe tener al menos 10 caracteres.')
      return
    }

    setMensaje('')
    setCargando(true)

    try {
      const res = await fetch(`${API_URL}/api/comunidad/resenias-generales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo,
          contenido,
          tag,
          likes,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al publicar reseña')

      setMensaje('Publicado correctamente ✔')

      // limpiar formulario
      setTitulo('')
      setContenido('')
      setTag('general')
      setLikes(0)

      // notificar al padre si existe callback
      if (onPublicacionCreada) onPublicacionCreada(data)
    } catch (err) {
      setMensaje(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="form-resenia-general">
      <h3>Crear Reseña General</h3>

      {mensaje && <p className="mensaje">{mensaje}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Título:
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Escribe un título"
          />
        </label>

        <label>
          Tag / Categoría:
          <select value={tag} onChange={(e) => setTag(e.target.value)}>
            <option value="general">General</option>
            <option value="reseña">Reseña</option>
            <option value="noticia">Noticia</option>
            <option value="discusion">Discusión</option>
            <option value="pregunta">Pregunta</option>
          </select>
        </label>

        <label>
          Contenido:
          <textarea
            rows={4}
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="Escribe tu reseña..."
          ></textarea>
        </label>

        {/* Sistema de votos */}
        <div className="votacion">
          <p>Votar esta publicación:</p>
          <button type="button" onClick={() => setLikes(likes + 1)}>
            👍 {likes}
          </button>
        </div>

        <button type="submit" disabled={cargando}>
          {cargando ? 'Publicando...' : 'Publicar Reseña'}
        </button>
      </form>
    </div>
  )
}

export default FormularioReseniaGeneral