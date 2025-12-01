import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Loader from '../componente_General/Loading'
import Respuesta from './Respuesta'
import FormularioReseniaGeneral from './FormularioGeneral'
import tiempoCarga3 from '../../assets/loadingGif/tiempoCarga3.gif'

function ListaResenias() {
  const [items, setItems] = useState([])
  const [filtro, setFiltro] = useState('')
  const [vista, setVista] = useState('juegos')
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const [showFormGeneral, setShowFormGeneral] = useState(false)
  const [tipoNuevaPublicacion, setTipoNuevaPublicacion] = useState('general')

  const navigate = useNavigate()
  const API_URL = import.meta.env.VITE_API_URL

  // Cargar reseñas + publicaciones
  const cargarTodo = () => {
    setLoading(true)
    const timeout = setTimeout(() => setLoading(false), 7000)

    Promise.all([
      fetch(`${API_URL}/api/reviews`).then((res) => res.json()),
      fetch(`${API_URL}/api/comunidad`).then((res) => res.json()),
    ])
      .then(([reviews, publicaciones]) => {
        const reviewsFormateadas = reviews.map((r) => ({
          ...r,
          tipo: 'review',
        }))

        const publicacionesFormateadas = publicaciones.map((p) => ({
          ...p,
          tipo: 'publicacion',
        }))

        setItems([...reviewsFormateadas, ...publicacionesFormateadas])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error cargando datos:', err)
        setLoading(false)
      })
      .finally(() => clearTimeout(timeout))
  }

  useEffect(() => {
    cargarTodo()
  }, [])

  const verPerfil = (id) => {
    navigate(`/perfil/${id}`)
  }

  const abrirModal = (item) => {
    setSelectedItem(item)
    setShowModal(true)
  }

  const enviarRespuesta = async (id, respuesta) => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      window.dispatchEvent(new Event('openLoginModal'))
      return
    }

    const user = JSON.parse(storedUser)
    const userId = user._id || user.id

    const endpoint =
      selectedItem.tipo === 'review'
        ? `${API_URL}/api/reviews/${id}/responder`
        : `${API_URL}/api/publicaciones/${id}/comentar`

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respuesta, usuarioId: userId }),
      })

      const data = await res.json()

      if (res.ok) {
        setItems((prev) => prev.map((r) => (r._id === id ? data : r)))
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setShowModal(false)
    }
  }

  // Filtro por texto + tipo
  const itemsFiltrados = items.filter((r) => {
    const coincideFiltro =
      r.nombreUsuario?.toLowerCase().includes(filtro.toLowerCase()) ||
      r.textoResenia?.toLowerCase().includes(filtro.toLowerCase()) ||
      r.contenido?.toLowerCase().includes(filtro.toLowerCase()) ||
      r.asunto?.toLowerCase().includes(filtro.toLowerCase()) ||
      r.juegoId?.titulo?.toLowerCase().includes(filtro.toLowerCase())

    if (!coincideFiltro) return false

    switch (vista) {
      case 'juegos':
        return r.tipo === 'review'
      case 'generales':
        return r.tipo === 'publicacion' && r.tag === 'general'
      case 'fanart':
        return r.tipo === 'publicacion' && r.tag === 'fanart'
      case 'noticias':
        return r.tipo === 'publicacion' && r.tag === 'noticia'
      default:
        return true
    }
  })

  if (loading) return <Loader imagen={tiempoCarga3} />

  return (
    <div className="lista-reseñas-container">
      <header className="lista-reseñas-header">
        <h1 className="lista-reseñas-titulo">Comunidad</h1>
        <p className="lista-reseñas-subtitulo">
          Explora publicaciones y participa en la comunidad
        </p>
      </header>

      {/* Botón Crear */}
      <button
        className="btn-crear-publicacion"
        onClick={() => {
          setTipoNuevaPublicacion(vista)
          setShowFormGeneral(true)
        }}
      >
        ➕ Crear{' '}
        {vista === 'juegos'
          ? 'reseña de juego'
          : vista === 'generales'
          ? 'reseña general'
          : vista}
      </button>

      {/* Selector de vistas */}
      <div className="vista-selector">
        <button
          className={vista === 'juegos' ? 'vista-btn active' : 'vista-btn'}
          onClick={() => setVista('juegos')}
        >
          🎮 Reseñas de juegos
        </button>

        <button
          className={vista === 'generales' ? 'vista-btn active' : 'vista-btn'}
          onClick={() => setVista('generales')}
        >
          📝 Reseñas generales
        </button>

        <button
          className={vista === 'fanart' ? 'vista-btn active' : 'vista-btn'}
          onClick={() => setVista('fanart')}
        >
          🖼️ Fanarts
        </button>

        <button
          className={vista === 'noticias' ? 'vista-btn active' : 'vista-btn'}
          onClick={() => setVista('noticias')}
        >
          📰 Noticias
        </button>
      </div>

      {/* Filtro */}
      <div className="lista-reseñas-filtro">
        <input
          type="text"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Buscar por texto, usuario o juego..."
          className="input-filtro"
        />
      </div>

      {/* LISTADO */}
      {itemsFiltrados.length > 0 ? (
        <div className="lista-reseñas-items">
          {itemsFiltrados.map((r) => (
            <div key={r._id} className="reseña-item">
              <details className="reseña-details">
                <summary className="reseña-summary">
                  <div className="reseña-summary-info">
                    {r.tipo === 'review' && r.juegoId?.imagenPortada && (
                      <img
                        src={r.juegoId.imagenPortada}
                        alt={r.juegoId.titulo}
                        className="reseña-imagenPortada"
                      />
                    )}

                    <div className="reseña-info">
                      <strong className="reseña-titulo">
                        {r.tipo === 'review'
                          ? r.juegoId?.titulo
                          : r.asunto || r.tag?.toUpperCase()}
                      </strong>

                      <button
                        onDoubleClick={() =>
                          verPerfil(r.usuarioId?._id || r.usuarioId)
                        }
                        className="btn-amigo"
                      >
                        <p className="reseña-usuario">Por: {r.nombreUsuario}</p>
                      </button>
                    </div>
                  </div>

                  <button
                    className="btn-responder"
                    onClick={(e) => {
                      e.preventDefault()
                      abrirModal(r)
                    }}
                  >
                    Responder
                  </button>
                </summary>

                <div className="reseña-contenido">
                  {r.tipo === 'review' && (
                    <div className="datos-reseña">
                      <p>Horas jugadas: {r.horasJugadas}</p>
                      <p>Recomendado: {r.recomendaria ? 'Sí' : 'No'}</p>
                    </div>
                  )}

                  <p className="reseña-texto">
                    {r.textoResenia || r.contenido}
                  </p>

                  {r.comentarios && r.comentarios.length > 0 && (
                    <div className="reseña-respuestas">
                      {r.comentarios.map((c) => (
                        <div key={c._id} className="respuesta-item">
                          <strong>{c.nombreUsuario}</strong>: {c.texto}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </details>
            </div>
          ))}
        </div>
      ) : (
        <p>No hay publicaciones disponibles.</p>
      )}

      {/* Modal Respuestas */}
      {showModal && selectedItem && (
        <Respuesta
          reseña={selectedItem}
          onClose={() => setShowModal(false)}
          onSubmit={enviarRespuesta}
        />
      )}

      {/* Modal Crear Publicación */}
      {showFormGeneral && (
        <div className="overlay-general">
          <FormularioReseniaGeneral
            tipo={tipoNuevaPublicacion}
            onClose={() => setShowFormGeneral(false)}
            onCreated={() => {
              setShowFormGeneral(false)
              cargarTodo()
            }}
          />
        </div>
      )}
    </div>
  )
}

export default ListaResenias
