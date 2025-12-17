import { useEffect, useState, useCallback } from 'react'
import { authFetch } from '../../helpers/authFetch'
import '../../styles/Foro.css'
import Loader from '../componente_General/Loading'
import Respuesta from './Respuesta'
import FormularioReseniaGeneral from './FormularioGeneral'
import tiempoCarga3 from '../../assets/loadingGif/tiempoCarga3.gif'
import iconGrimorio from '../../assets/Icons/iconGrimorio.png'
import iconGrimorioVacio from '../../assets/Icons/iconGrimorioVacio.png'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL

function ListaResenias() {
  // =========================
  // ESTADO
  // =========================
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')
  const [vista, setVista] = useState('juegos')
  const [reseñas, setReseñas] = useState([])
  const [comentariosTexto, setComentariosTexto] = useState({})
  const [formComentarioAbierto, setFormComentarioAbierto] = useState(null)
  const [reseniaSeleccionada, setReseniaSeleccionada] = useState(null)

  const [showFormGeneral, setShowFormGeneral] = useState(false)
  const [tipoNuevaPublicacion, setTipoNuevaPublicacion] = useState('general')
  const navigate = useNavigate()

  const getUserId = () => {
    const stored = localStorage.getItem('user')
    if (!stored) return null
    const user = JSON.parse(stored)
    return user._id || user.id
  }

  const requireLogin = () => window.dispatchEvent(new Event('openLoginModal'))

  const actualizarItem = (actualizado) => {
    setItems((prev) =>
      prev.map((i) =>
        i._id === actualizado._id
          ? {
              ...actualizado,
              tipo: i.tipo,
              juegoId: i.juegoId,
            }
          : i
      )
    )
  }

  // CARGA DE DATOS
  const cargarTodo = useCallback(async () => {
    setLoading(true)
    try {
      const [reviewsRes, comunidadRes] = await Promise.all([
        fetch(`${API_URL}/api/reviews`),
        fetch(`${API_URL}/api/comunidad`),
      ])

      const reviews = await reviewsRes.json()
      const publicaciones = await comunidadRes.json()

      setItems([
        ...(Array.isArray(reviews)
          ? reviews.map((r) => ({ ...r, tipo: 'review' }))
          : []),
        ...(Array.isArray(publicaciones)
          ? publicaciones.map((p) => ({ ...p, tipo: 'publicacion' }))
          : []),
      ])
    } catch (err) {
      console.error('Error cargando datos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarTodo()
  }, [cargarTodo])

  // ACCIONES
  const crearComentario = async (item) => {
    const texto = comentariosTexto[item._id]
    if (!texto?.trim()) return

    const userId = getUserId()
    if (!userId) return requireLogin()

    const url =
      item.tipo === 'review'
        ? `${API_URL}/api/reviews/${item._id}/comentarios`
        : `${API_URL}/api/comunidad/${item._id}/comentar`

    try {
      const res = await authFetch(url, {
        method: 'POST',
        body: JSON.stringify({ texto }),
      })

      if (!res.ok) throw new Error()
      actualizarItem(await res.json())
      setComentariosTexto((s) => ({ ...s, [item._id]: '' }))
      setFormComentarioAbierto(null)
    } catch {
      alert('Error al comentar')
    }
  }

  const votarReview = async (id, voto) => {
    const userId = getUserId()
    if (!userId) return requireLogin()

    try {
      const res = await authFetch(`${API_URL}/api/reviews/votar/${id}`, {
        method: 'POST',
        body: JSON.stringify({ usuarioId: userId, voto }),
      })

      if (!res.ok) throw new Error()
      actualizarItem(await res.json())
    } catch {
      alert('Error al votar')
    }
  }

  const votarRespuesta = async (reviewId, respuestaId, voto) => {
    const userId = getUserId()
    if (!userId) return requireLogin()

    try {
      const res = await authFetch(
        `${API_URL}/api/reviews/${reviewId}/respuesta/${respuestaId}/votar`,
        { method: 'POST', body: JSON.stringify({ usuarioId: userId, voto }) }
      )

      if (!res.ok) throw new Error()
      actualizarItem(await res.json())
    } catch {
      alert('Error al votar respuesta')
    }
  }

  /* ================== RESPUESTAS ================== */
  const handleEnviarRespuesta = async (item, comentarioId, texto) => {
    if (!item || !item.tipo || !item.itemId) {
      console.error('Respuesta mal construida:', item)
      return
    }

    const userId = getUserId()
    if (!userId) return requireLogin()

    const url =
      item.tipo === 'review'
        ? `${API_URL}/api/reviews/${item.itemId}/comentarios/${comentarioId}/responder`
        : `${API_URL}/api/comunidad/${item.itemId}/comentario/${comentarioId}/responder`

    try {
      const res = await authFetch(url, {
        method: 'POST',
        body: JSON.stringify({ texto }),
      })

      if (!res.ok) throw new Error()

      actualizarItem(await res.json())
      setReseniaSeleccionada(null)
    } catch (err) {
      console.error(err)
    }
  }

  //Visitar perfil
  const visitarPerfil = (usuario) => {
    const id = typeof usuario === 'string' ? usuario : usuario?._id
    if (!id) return
    navigate(`/perfil/${id}`)
  }

  // FILTRADO
  const normalizar = (v) =>
    typeof v === 'string' ? v.toLowerCase().trim() : ''

  const itemsFiltrados = items.filter((r, index) => {
    const nombreJuego = normalizar(r.juegoId?.titulo)
    const nombreUsuario = normalizar(r.usuarioId?.nombre)
    const filtroBase = normalizar(filtro)

    const coincideTexto =
      nombreJuego.includes(filtroBase) || nombreUsuario.includes(filtroBase)

    if (!coincideTexto) return false

    if (vista === 'juegos') return r.tipo === 'review'
    if (vista === 'general') return r.tag === 'general'
    if (vista === 'discusion') return r.tag === 'discusion'
    if (vista === 'pregunta') return r.tag === 'pregunta'
    if (vista === 'fanart') return r.tag === 'fanart'
    if (vista === 'bug/errores') return r.tag === 'bug/errores'

    return true
  })

  if (loading) return <Loader imagen={tiempoCarga3} />

  return (
    <div className="lista-reseñas-container">
      <header className="lista-reseñas-header">
        <h1>Comunidad</h1>
        <p>Explora publicaciones y reseñas</p>
      </header>

      <button
        className="btn-crear-publicacion"
        onClick={() => {
          setTipoNuevaPublicacion(vista)
          setShowFormGeneral(true)
        }}
      >
        ❌ Crear
      </button>

      <div className="vista-selector">
        {[
          'juegos',
          'general',
          'discusion',
          'pregunta',
          'fanart',
          'bug/errores',
        ].map((v) => (
          <button
            key={v}
            className={vista === v ? 'vista-btn active' : 'vista-btn'}
            onClick={() => setVista(v)}
          >
            {v}
          </button>
        ))}
      </div>

      <input
        className="input-filtro"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        placeholder="Buscar..."
      />

      <div className="lista-reseñas-items">
        {itemsFiltrados.map((r) => (
          <div key={r._id} className="reseña-item">
            <details className="reseña-details">
              <summary className="reseña-summary">
                <div className="reseña-info">
                  {r.tipo === 'review' && r.juegoId?.imagenPortada && (
                    <img
                      src={r.juegoId.imagenPortada}
                      alt={r.juegoId.titulo}
                      className="reseña-img"
                    />
                  )}

                  <div className="reseña-textos">
                    <strong>
                      {r.tipo === 'review'
                        ? r.juegoId?.titulo
                        : r.asunto || r.tag?.toUpperCase()}
                    </strong>
                    <button
                      onClick={() => visitarPerfil(r.usuarioId)}
                      className="btn-Usuario"
                    >
                      <span>{r.usuarioId?.nombre || 'Anónimo'}</span>
                    </button>
                    {r.tipo === 'review' && (
                      <div className="grimorios-puntuacion">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <img
                            key={n}
                            src={
                              n <= r.puntuacion
                                ? iconGrimorio
                                : iconGrimorioVacio
                            }
                            className="grimorio"
                            alt="puntuación"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {r.tipo === 'review' && (
                  <div className="reseña-votos">
                    <button
                      className="btn-votar"
                      onClick={() => votarReview(r._id, 1)}
                    >
                      👍
                    </button>
                    <button
                      className="btn-votar"
                      onClick={() => votarReview(r._id, -1)}
                    >
                      👎
                    </button>
                    <span>{r.votos?.reduce((s, v) => s + v.voto, 0) || 0}</span>
                  </div>
                )}
              </summary>

              <div className="reseña-contenido">
                {r.tipo === 'review' && (
                  <div className="info-reseña">
                    <p>Asunto: {r.asunto || 'No especificado'}</p>
                    <p className="hr-jugadas">
                      Horas jugadas: {r.horasJugadas}
                    </p>
                  </div>
                )}

                <p className="reseña-texto">{r.textoResenia || r.contenido}</p>

                <button
                  className="btn-comentar"
                  onClick={() => setFormComentarioAbierto(r._id)}
                >
                  Añadir comentario
                </button>

                {formComentarioAbierto === r._id && (
                  <div className="form-comentario">
                    <textarea
                      value={comentariosTexto[r._id] || ''}
                      onChange={(e) =>
                        setComentariosTexto((s) => ({
                          ...s,
                          [r._id]: e.target.value,
                        }))
                      }
                      placeholder="Escribe un comentario..."
                    />
                    <button onClick={() => crearComentario(r)}>Comentar</button>
                  </div>
                )}

                {r.comentarios?.length > 0 && (
                  <div className="reseña-respuestas" style={{ marginTop: 12 }}>
                    {r.comentarios.map((comentario) => (
                      <div
                        key={comentario._id}
                        className="comentario-item"
                        style={{
                          padding: 8,
                          borderLeft: '2px solid #eee',
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <strong>
                            {comentario.usuarioId?.nombre || 'Anónimo'}
                          </strong>

                          <div
                            style={{
                              display: 'flex',
                              gap: 8,
                              alignItems: 'center',
                            }}
                          >
                            <button
                              onClick={() =>
                                setReseniaSeleccionada({
                                  itemId: r._id,
                                  tipo: r.tipo,
                                  comentarioId: comentario._id,
                                })
                              }
                            >
                              Responder
                            </button>
                          </div>
                        </div>

                        <p style={{ marginTop: 6 }}>{comentario.texto}</p>

                        {comentario.respuestas?.length > 0 && (
                          <div style={{ marginLeft: 12, marginTop: 8 }}>
                            {comentario.respuestas.map((resp) => (
                              <div
                                key={resp._id}
                                style={{
                                  padding: 6,
                                  borderLeft: '2px solid #f4f4f4',
                                  marginBottom: 6,
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                  }}
                                >
                                  <strong>
                                    {resp.usuarioId?.nombre || 'Anónimo'}
                                  </strong>

                                  <div className="Like">
                                    <button
                                      onClick={() =>
                                        votarRespuesta(r._id, resp._id, 1)
                                      }
                                      title="Me gusta"
                                    >
                                      👍
                                    </button>
                                    <button
                                      onClick={() =>
                                        votarRespuesta(r._id, resp._id, -1)
                                      }
                                      title="No me gusta"
                                    >
                                      👎
                                    </button>
                                  </div>
                                </div>

                                <p style={{ marginTop: 4 }}>{resp.texto}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </details>
          </div>
        ))}
      </div>

      {reseniaSeleccionada && (
        <Respuesta
          reseña={reseniaSeleccionada}
          onClose={() => setReseniaSeleccionada(null)}
          onSubmit={(texto) =>
            handleEnviarRespuesta(
              reseniaSeleccionada,
              reseniaSeleccionada.comentarioId,
              texto
            )
          }
        />
      )}

      {showFormGeneral && (
        <FormularioReseniaGeneral
          tipo={tipoNuevaPublicacion}
          onPublicacionCreada={cargarTodo}
          onClose={() => setShowFormGeneral(false)}
        />
      )}
    </div>
  )
}

export default ListaResenias
