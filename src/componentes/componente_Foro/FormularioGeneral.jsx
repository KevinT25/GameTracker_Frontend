import { useState } from 'react'
import { authFetch } from '../../helpers/authFetch'

function FormularioReseniaGeneral({ tipo, onPublicacionCreada, onClose }) {
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
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

    const token = localStorage.getItem('token')
    if (!token) {
      setMensaje('Debes iniciar sesión para publicar.')
      window.dispatchEvent(new Event('openLoginModal'))
      return
    }

    setMensaje('')
    setCargando(true)

    try {
      const res = await authFetch(`${API_URL}/api/comunidad`, {
        method: 'POST',
        body: JSON.stringify({
          titulo,
          contenido,
          tag: tipo,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al publicar')

      setTitulo('')
      setContenido('')

      if (onPublicacionCreada) onPublicacionCreada(data)
      if (onClose) onClose()
    } catch (err) {
      setMensaje(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="overlay-general">
      <div className="form-resenia-general">
        <h3>Crear {tipo}</h3>

        {mensaje && <p className="mensaje">{mensaje}</p>}

        <form onSubmit={handleSubmit}>
          <label>
            Título
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Escribe un título"
            />
          </label>

          <label>
            Contenido
            <textarea
              rows={4}
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Escribe aquí..."
            />
          </label>

          <div className="form-resenia-acciones">
            <button
              type="button"
              onClick={onClose}
              disabled={cargando}
              className="btn-cancelar"
            >
              Cancelar
            </button>

            <button type="submit" disabled={cargando}>
              {cargando ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FormularioReseniaGeneral
