import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import FormularioReseniaGeneral from './FormularioGeneral'
import { authFetch } from '../../helpers/authFetch'

const API_URL = import.meta.env.VITE_API_URL

function Comunidad() {
  const [publicaciones, setPublicaciones] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [tipoPublicacion, setTipoPublicacion] = useState('general')
  const [editando, setEditando] = useState(null)

  const { tipo } = useParams()
  const navigate = useNavigate()

  const userId = localStorage.getItem('idUsuario')
  const userRole = localStorage.getItem('rol') || 'user'

  // -----------------------------------
  // Cargar publicaciones (ruta pública)
  // -----------------------------------
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

  // -----------------------------------
  // Mostrar formulario si viene /crear/:tipo
  // -----------------------------------
  useEffect(() => {
    if (tipo) {
      setTipoPublicacion(tipo)
      setMostrarFormulario(true)
    }
  }, [tipo])

  const cerrarFormulario = () => {
    setMostrarFormulario(false)
    setEditando(null)
    navigate('/comunidad')
  }

  // -----------------------------------
  // FUNCIONES CRUD PROTEGIDAS (JWT)
  // -----------------------------------

  const votar = async (id, voto) => {
    try {
      await authFetch(`${API_URL}/api/comunidad/${id}/votar`, {
        method: 'POST',
        body: JSON.stringify({ voto }),
      })

      cargarPublicaciones()
    } catch (error) {
      console.error('Error al votar:', error)
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar publicación?')) return

    try {
      await authFetch(`${API_URL}/api/comunidad/${id}`, {
        method: 'DELETE',
      })

      cargarPublicaciones()
    } catch (error) {
      console.error('Error al eliminar:', error)
    }
  }

  const comenzarEdicion = (pub) => {
    setEditando(pub)
    setTipoPublicacion(pub.tag)
    setMostrarFormulario(true)
  }

  // -----------------------------------
  // RENDER
  // -----------------------------------

  return (
    <div className="comunidad">
      {/* FILTROS */}
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

      {/* BOTÓN CREAR */}
      <button
        className="btn-crear-publicacion"
        onClick={() => navigate('/comunidad/crear/general')}
      >
        Crear publicación
      </button>

      {/* FORMULARIO POPUP */}
      {mostrarFormulario && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="popup-cerrar" onClick={cerrarFormulario}>
              ✖
            </button>

            <FormularioReseniaGeneral
              tipo={tipoPublicacion}
              editando={editando}
              onPublicacionCreada={() => {
                cerrarFormulario()
                cargarPublicaciones()
              }}
            />
          </div>
        </div>
      )}

      {/* LISTA DE PUBLICACIONES */}
      <h2>Publicaciones de la comunidad</h2>

      <div className="lista-publicaciones">
        {publicaciones.length === 0 && <p>No hay publicaciones aún.</p>}

        {publicaciones.map((p) => {
          const likes = p.votos?.filter((v) => v.voto === 1).length || 0
          const dislikes = p.votos?.filter((v) => v.voto === -1).length || 0

          return (
            <div key={p._id} className="publicacion-card">
              <h3>{p.titulo}</h3>
              <span className={`tag ${p.tag}`}>{p.tag}</span>
              <p>{p.contenido}</p>

              {/* VOTOS */}
              <div className="votos">
                <button onClick={() => votar(p._id, 1)}>👍</button>
                <span>{likes}</span>
                <button onClick={() => votar(p._id, -1)}>👎</button>
                <span>{dislikes}</span>
              </div>

              {/* BOTONES EDITAR / ELIMINAR */}
              <div className="acciones">
                {p.usuarioId === userId && (
                  <button onClick={() => comenzarEdicion(p)}>✏️ Editar</button>
                )}

                {(p.usuarioId === userId || userRole === 'admin') && (
                  <button onClick={() => eliminar(p._id)}>🗑 Eliminar</button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Comunidad
