import { useState } from 'react'

function FormularioReseniaGeneral({ tipo, onPublicacionCreada }) {
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [likes, setLikes] = useState(0)

  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL

  const endpoint = `${API_URL}/api/comunidad/${tipo}`

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
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        window.dispatchEvent(new Event('openLoginModal'))
        return
      }

      const user = JSON.parse(storedUser)
      const userId = user._id || user.id

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo,
          contenido,
          tag: tipo,
          likes,
          usuarioId: userId,
          nombreUsuario: user.nombre,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al publicar')

      setMensaje('Publicado correctamente ✔')
      setTitulo('')
      setContenido('')
      setLikes(0)

      if (onPublicacionCreada) onPublicacionCreada(data)
    } catch (err) {
      setMensaje(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="form-resenia-general popup">
      <h3>Crear {tipo}</h3>

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
          Contenido:
          <textarea
            rows={4}
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="Escribe aquí..."
          ></textarea>
        </label>

        <div className="votacion">
          <p>Votar esta publicación:</p>
          <button type="button" onClick={() => setLikes(likes + 1)}>
            👍 {likes}
          </button>
        </div>

        <button type="submit" disabled={cargando}>
          {cargando ? 'Publicando...' : 'Publicar'}
        </button>
      </form>
    </div>
  )
}

export default FormularioReseniaGeneral
