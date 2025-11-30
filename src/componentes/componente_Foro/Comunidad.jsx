import { useEffect, useState } from 'react'
import FormularioReseniaGeneral from './FormularioGeneral'

const API_URL = import.meta.env.VITE_API_URL

function Comunidad() {
  const [publicaciones, setPublicaciones] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  // cargar publicaciones existentes
  const cargarPublicaciones = async () => {
    const res = await fetch(`${API_URL}/api/comunidad/resenias-generales`)
    const data = await res.json()
    setPublicaciones(data)
  }

  useEffect(() => {
    cargarPublicaciones()
  }, [])

  return (
    <div className="comunidad">
      {/* Botón para abrir el formulario */}
      <button
        className="btn-crear-publicacion"
        onClick={() => setMostrarFormulario(true)}
      >
        Crear publicación
      </button>

      {/* Formulario visible solo si el usuario lo abre */}
      {mostrarFormulario && (
        <FormularioReseniaGeneral
          onPublicacionCreada={(nueva) => {
            setMostrarFormulario(false)
            cargarPublicaciones()
          }}
        />
      )}

      <h2>Publicaciones de la comunidad</h2>
      <div className="lista-publicaciones">
        {publicaciones.map((p) => (
          <div key={p._id} className="publicacion-card">
            <h3>{p.titulo}</h3>
            <span className={`tag ${p.tag}`}>{p.tag}</span>
            <p>{p.contenido}</p>
            <p>👍 {p.likes}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Comunidad
