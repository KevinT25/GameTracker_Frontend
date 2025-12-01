import { useState, useEffect } from 'react'

function FormularioGeneral({
  tipo = 'general',
  editando,
  onPublicacionCreada,
}) {
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL

  const userId = localStorage.getItem('idUsuario')
  const userRole = localStorage.getItem('rol') || 'user'

  // ---------------------------------------------------
  // Si estamos editando, rellenar campos
  // ---------------------------------------------------
  useEffect(() => {
    if (editando) {
      setTitulo(editando.titulo || '')
      setContenido(editando.contenido || '')
    }
  }, [editando])

  // ---------------------------------------------------
  // Enviar formulario
  // ---------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (titulo.trim().length < 3) {
      setMensaje('El título debe tener al menos 3 caracteres.')
      return
    }
    if (contenido.trim().length < 5) {
      setMensaje('El contenido debe tener al menos 5 caracteres.')
      return
    }

    setCargando(true)
    setMensaje('')

    try {
      const metodo = editando ? 'PUT' : 'POST'
      const url = editando
        ? `${API_URL}/api/comunidad/${editando._id}`
        : `${API_URL}/api/comunidad`

      const res = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'x-user-role': userRole,
        },
        body: JSON.stringify({
          titulo,
          contenido,
          tag: tipo,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Error al publicar')

      setMensaje(editando ? 'Publicación actualizada' : 'Publicación creada')

      if (onPublicacionCreada) onPublicacionCreada(data)
    } catch (error) {
      setMensaje(error.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="formulario-general">
      <h2>{editando ? 'Editar publicación' : 'Nueva publicación'}</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Título:
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Escribe un título..."
          />
        </label>

        <label>
          Contenido:
          <textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            rows={5}
            placeholder="Escribe aquí tu publicación..."
          />
        </label>

        <button type="submit" disabled={cargando}>
          {cargando
            ? 'Guardando...'
            : editando
            ? 'Guardar cambios'
            : 'Publicar'}
        </button>
      </form>

      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  )
}

export default FormularioGeneral
