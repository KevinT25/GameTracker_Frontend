import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import FormularioReseniaGeneral from './FormularioGeneral'

const API_URL = import.meta.env.VITE_API_URL

function Comunidad() {
  const [publicaciones, setPublicaciones] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [tipoPublicacion, setTipoPublicacion] = useState('general')

  const { tipo } = useParams()
  const navigate = useNavigate()

  // 🔥 Abrir popup automáticamente si /comunidad/crear/:tipo
  useEffect(() => {
    if (tipo) {
      setTipoPublicacion(tipo)
      setMostrarFormulario(true)
    }
  }, [tipo])

  // 🔥 Cargar publicaciones desde backend
  const cargarPublicaciones = async (filtroTag = null) => {
    try {
      const url = filtroTag
        ? `${API_URL}/api/comunidad?tag=${filtroTag}`
        : `${API_URL}/api/comunidad`

      const res = await fetch(url)
      const data = await res.json()
      setPublicaciones(data)
    } catch (error) {
      console.error('Error al cargar publicaciones:', error)
    }
  }

  useEffect(() => {
    cargarPublicaciones()
  }, [])

  // 🔥 Cerrar popup
  const cerrarFormulario = () => {
    setMostrarFormulario(false)
    navigate('/comunidad')
  }

  return (
    <div className="comunidad">
      {/* ===================================== */}
      {/* BOTONES DE FILTRO POR TAG */}
      {/* ===================================== */}
      <div className="filtros">
        <button onClick={() => cargarPublicaciones(null)}>Todos</button>
        <button onClick={() => cargarPublicaciones('general')}>General</button>
        <button onClick={() => cargarPublicaciones('discusion')}>
          Discusión
        </button>
        <button onClick={() => cargarPublicaciones('pregunta')}>
          Preguntas
        </button>
        <button onClick={() => cargarPublicaciones('fanart')}>FanArt</button>
        <button onClick={() => cargarPublicaciones('bug/errores')}>
          Bugs / Errores
        </button>
      </div>

      {/* ===================================== */}
      {/* BOTÓN PARA CREAR PUBLICACIÓN */}
      {/* ===================================== */}
      <button
        className="btn-crear-publicacion"
        onClick={() => navigate('/comunidad/crear/general')}
      >
        Crear publicación
      </button>

      {/* ===================================== */}
      {/* POPUP DEL FORMULARIO */}
      {/* ===================================== */}
      {mostrarFormulario && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="popup-cerrar" onClick={cerrarFormulario}>
              ✖
            </button>

            <FormularioReseniaGeneral
              tipo={tipoPublicacion}
              onPublicacionCreada={() => {
                cerrarFormulario()
                cargarPublicaciones()
              }}
            />
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* LISTA DE PUBLICACIONES */}
      {/* ===================================== */}
      <h2>Publicaciones de la comunidad</h2>

      <div className="lista-publicaciones">
        {publicaciones.length === 0 && <p>No hay publicaciones aún.</p>}

        {publicaciones.map((p) => (
          <div key={p._id} className="publicacion-card">
            <h3>{p.titulo}</h3>
            <span className={`tag ${p.tag}`}>{p.tag}</span>
            <p>{p.contenido}</p>

            {/* Likes y dislikes */}
            <p>
              👍 {p.votos?.filter((v) => v.voto === 1).length || 0} — 👎{' '}
              {p.votos?.filter((v) => v.voto === -1).length || 0}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Comunidad
