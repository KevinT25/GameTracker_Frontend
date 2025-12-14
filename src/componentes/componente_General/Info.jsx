import './../../styles/Info.css'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { authFetch } from '../../helpers/authFetch'
import {
  escucharEvento,
  dejarDeEscuchar,
  eventoAuth,
} from '../../event_Global/globalEvents'

import FormularioResenias from '../componente_Foro/FormularioResenia'
import Respuesta from '../componente_Foro/Respuesta'
import Loader from '../componente_General/Loading'

import tiempoCarga4 from '../../assets/loadingGif/tiempoCarga4.gif'
import iconGrimorio from '../../assets/Icons/iconGrimorio.png'
import iconGrimorioVacio from '../../assets/Icons/iconGrimorioVacio.png'
import iconNoWishlist from '../../assets/Icons/iconNoWishlist.png'
import iconWishlist from '../../assets/Icons/iconWishlist.png'
import iconMisJuegos from '../../assets/Icons/iconMisJuegos.png'
import iconEliminar from '../../assets/Icons/iconEliminar.png'
import iconCompletados from '../../assets/Icons/iconCompletados.png'
import iconPorCompletar from '../../assets/Icons/iconPorCompletar.png'

/* =====================================================
   Helper CRÍTICO: preserva datos populados
===================================================== */
const mergeReseña = (prev, actualizada) => ({
  ...actualizada,
  usuarioId: prev.usuarioId,
  comentarios: actualizada.comentarios?.map((c, i) => ({
    ...c,
    usuarioId: prev.comentarios?.[i]?.usuarioId || c.usuarioId,
    respuestas: c.respuestas?.map((r, j) => ({
      ...r,
      usuarioId:
        prev.comentarios?.[i]?.respuestas?.[j]?.usuarioId || r.usuarioId,
    })),
  })),
})

function InfoJuego({ setJuegos }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [juego, setJuego] = useState(null)
  const [reseñas, setReseñas] = useState([])
  const [reseniaSeleccionada, setReseniaSeleccionada] = useState(null)
  const [comentarioTextoPorReview, setComentarioTextoPorReview] = useState({})
  const [mostrarFormularioComentario, setMostrarFormularioComentario] =
    useState(null)

  const API_URL = import.meta.env.VITE_API_URL
  const usuarioLS = JSON.parse(localStorage.getItem('user') || 'null')
  const [user, setUser] = useState(usuarioLS)

  const getUserId = () => user?._id || user?.id || null
  const getUserName = () => user?.nombre || user?.username || null

  /* ================== CARGA INICIAL ================== */
  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    setLoading(true)

    const cargarDatos = async () => {
      try {
        const [gameRes, reviewsRes] = await Promise.all([
          fetch(`${API_URL}/api/games/games/${id}`, {
            signal: controller.signal,
          }),
          fetch(`${API_URL}/api/reviews/juego/${id}`, {
            signal: controller.signal,
          }),
        ])

        if (cancelled) return

        if (gameRes.ok) {
          setJuego(await gameRes.json())
        }

        if (reviewsRes.ok) {
          const data = await reviewsRes.json()
          setReseñas(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(err)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    cargarDatos()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [id])

  /* ================== AUTH EVENTS ================== */
  useEffect(() => {
    const manejarAuth = (e) => {
      setUser(
        e.detail?.logueado ? JSON.parse(localStorage.getItem('user')) : null
      )
    }
    escucharEvento(eventoAuth.nombre, manejarAuth)
    return () => dejarDeEscuchar(eventoAuth.nombre, manejarAuth)
  }, [])

  /* ================== COMENTARIOS ================== */
  const crearComentario = async (reviewId) => {
    const texto = (comentarioTextoPorReview[reviewId] || '').trim()
    if (!texto) return

    try {
      const res = await authFetch(
        `${API_URL}/api/reviews/${reviewId}/comentarios`,
        {
          method: 'POST',
          body: JSON.stringify({ texto, usuarioId: getUserId() }),
        }
      )

      const actualizada = await res.json()
      setReseñas((prev) =>
        prev.map((r) =>
          r._id === actualizada._id ? mergeReseña(r, actualizada) : r
        )
      )
    } catch (err) {
      console.error(err)
    }
  }

  /* ================== RESPUESTAS ================== */
  const handleEnviarRespuesta = async (reseñaId, comentarioId, texto) => {
    try {
      const res = await authFetch(
        `${API_URL}/api/reviews/${reseñaId}/comentarios/${comentarioId}/responder`,
        {
          method: 'POST',
          body: JSON.stringify({ texto, usuarioId: getUserId() }),
        }
      )

      const actualizada = await res.json()
      setReseñas((prev) =>
        prev.map((r) =>
          r._id === actualizada._id ? mergeReseña(r, actualizada) : r
        )
      )
      setReseniaSeleccionada(null)
    } catch (err) {
      console.error(err)
    }
  }

  /* ================== VOTOS ================== */
  const votarReview = async (reviewId, voto) => {
    try {
      const res = await authFetch(`${API_URL}/api/reviews/votar/${reviewId}`, {
        method: 'POST',
        body: JSON.stringify({ voto, usuarioId: getUserId() }),
      })

      const actualizada = await res.json()
      setReseñas((prev) =>
        prev.map((r) =>
          r._id === actualizada._id ? mergeReseña(r, actualizada) : r
        )
      )
    } catch (err) {
      console.error(err)
    }
  }

  const votarRespuesta = async (reviewId, respuestaId, voto) => {
    try {
      const res = await authFetch(
        `${API_URL}/api/reviews/${reviewId}/respuesta/${respuestaId}/votar`,
        {
          method: 'POST',
          body: JSON.stringify({ voto, usuarioId: getUserId() }),
        }
      )

      const actualizada = await res.json()
      setReseñas((prev) =>
        prev.map((r) =>
          r._id === actualizada._id ? mergeReseña(r, actualizada) : r
        )
      )
    } catch (err) {
      console.error(err)
    }
  }

  const descarga = () => {
    navigate('/Download', { state: { iframeUrl: juego.descarga } })
  }

  if (loading) return <Loader imagen={tiempoCarga4} />
  if (!juego) return <p>No se encontró el juego.</p>

  return (
    <div className="info-juego">
      <img
        src={juego.imagenPortada}
        alt={juego.titulo}
        className="portada-info"
      />
      <h1>{juego.titulo}</h1>
      <p className="subtitle">{juego.descripcion}</p>

      <p>
        <strong>Género:</strong> {juego.genero}
      </p>
      <p>
        <strong>Plataforma:</strong> {juego.plataforma}
      </p>
      <div className="acciones-juego">
        <button className="btn-jugar" onClick={descarga}>
          {' '}
          Jugar{' '}
        </button>

        <button
          className={`mygame-boton ${juego.misjuegos ? 'activo' : ''}`}
          onClick={() =>
            actualizarEstado(juego._id, 'misjuegos', !juego.misjuegos)
          }
          data-tooltip={`${juego.misjuegos ? 'Quitar' : 'Añadir'} mis juegos`}
        >
          <img
            src={juego.misjuegos ? iconMisJuegos : iconEliminar}
            className="iconGames"
          />
        </button>

        <button
          className={`mywishlist-boton ${juego.wishlist ? 'activo' : ''}`}
          onClick={() =>
            actualizarEstado(juego._id, 'wishlist', !juego.wishlist)
          }
          data-tooltip={`${juego.wishlist ? 'Quitar' : 'Añadir'} favorito`}
        >
          <img
            src={juego.wishlist ? iconWishlist : iconNoWishlist}
            className="iconGames"
          />
        </button>

        <button
          className={`completado-boton ${juego.completado ? 'activo' : ''}`}
          onClick={() =>
            actualizarEstado(juego._id, 'completado', !juego.completado)
          }
          data-tooltip={`${juego.completado ? 'Quitar' : 'Añadir'} completado`}
        >
          <img
            src={juego.completado ? iconCompletados : iconPorCompletar}
            className="iconGames"
          />
        </button>
      </div>

      <FormularioResenias
        juegoId={juego._id}
        usuarioId={getUserId()}
        nombreUsuario={getUserName()}
        onReseniaEnviada={(nueva) => setReseñas((p) => [nueva, ...p])}
      />

      {reseñas.map((r) => (
        <div key={r._id} className="reseña-item">
          <details className="reseña-details">
            <summary className="reseña-summary">
              <div className="reseña-info">
                <strong>{r.usuarioId?.nombre || 'Anónimo'}</strong>

                <div className="grimorios-puntuacion">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <img
                      key={n}
                      src={n <= r.puntuacion ? iconGrimorio : iconGrimorioVacio}
                      className="grimorio"
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  className="btn-votar"
                  onClick={(e) => {
                    e.preventDefault()
                    votarReview(r._id, 1)
                  }}
                  title="Me gusta"
                >
                  👍
                </button>

                <button
                  className="btn-votar"
                  onClick={(e) => {
                    e.preventDefault()
                    votarReview(r._id, -1)
                  }}
                  title="No me gusta"
                >
                  👎
                </button>

                <span>
                  {r.votos ? r.votos.reduce((s, v) => s + v.voto, 0) : 0}
                </span>
              </div>
            </summary>

            <div className="reseña-contenido">
              <div className="info-reseña">
                <p>Asunto: {r.asunto || 'No especificada'}</p>
                <p className="hr-jugadas">Horas jugadas: {r.horasJugadas}</p>
              </div>

              <p className="reseña-texto">{r.textoResenia}</p>

              <div style={{ marginTop: 8 }}>
                {mostrarFormularioComentario === r._id ? (
                  <>
                    <textarea
                      rows={2}
                      value={comentarioTextoPorReview[r._id] || ''}
                      onChange={(e) =>
                        setComentarioTextoPorReview((s) => ({
                          ...s,
                          [r._id]: e.target.value,
                        }))
                      }
                      placeholder="Escribe un comentario..."
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      <button onClick={() => crearComentario(r._id)}>
                        Comentar
                      </button>
                      <button
                        onClick={() => setMostrarFormularioComentario(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <button onClick={() => setMostrarFormularioComentario(r._id)}>
                    Añadir comentario
                  </button>
                )}
              </div>

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
                                ...r,
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

                                <div
                                  style={{
                                    display: 'flex',
                                    gap: 8,
                                    alignItems: 'center',
                                  }}
                                >
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

      {reseniaSeleccionada && (
        <Respuesta
          reseña={reseniaSeleccionada}
          onClose={() => setReseniaSeleccionada(null)}
          onEnviar={handleEnviarRespuesta}
        />
      )}
    </div>
  )
}

export default InfoJuego
