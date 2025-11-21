import './../../styles/Info.css'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { authFetch } from '../../helpers/authFetch'

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

function InfoJuego({ setJuegos }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [juego, setJuego] = useState(null)
  const [reseñas, setReseñas] = useState([])
  const [reseniaSeleccionada, setReseniaSeleccionada] = useState(null)
  const API_URL = import.meta.env.VITE_API_URL

  // Leer usuario desde localStorage desde el primer render (evita delay)
  const usuarioLS = JSON.parse(localStorage.getItem('user') || 'null')
  const [user, setUser] = useState(usuarioLS)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    setLoading(true)

    const userId = user?._id || user?.id || null

    const cargarDatos = async () => {
      try {
        // lanzar fetchs en paralelo (con abort)
        const gameFetch = fetch(`${API_URL}/api/games/games/${id}`, {
          signal: controller.signal,
        })
        const reviewsFetch = fetch(`${API_URL}/api/reviews/game/${id}`, {
          signal: controller.signal,
        })

        // relación solo si hay userId; sino devolvemos mock con ok=false
        const relationFetch = userId
          ? authFetch(`${API_URL}/api/dataUser/usuario/${userId}`, {
              signal: controller.signal,
            })
          : Promise.resolve({ ok: false, status: 204, json: async () => [] })

        // Esperar resultados
        const [gameRes, relationRes, reviewsRes] = await Promise.all(
          [gameFetch, relationFetch, reviewsFetch].map((p) =>
            p.then((r) => r).catch((err) => ({ ok: false, error: err }))
          )
        )
        console.log('actualizado')
        if (cancelled) return

        // Procesar juego
        if (gameRes && gameRes.ok) {
          const dataJuego = await gameRes.json()

          // Procesar relación
          let dataRelacion = []
          if (relationRes && relationRes.ok) {
            try {
              dataRelacion = await relationRes.json()
            } catch (e) {
              dataRelacion = []
            }
          }

          const relacion = Array.isArray(dataRelacion)
            ? dataRelacion.find((d) => {
                const idJuego = d?.juegoId?._id ?? d?.juegoId
                return idJuego === dataJuego._id
              })
            : null

          const enriched = {
            ...dataJuego,
            misjuegos: relacion?.misjuegos || false,
            wishlist: relacion?.wishlist || false,
            completado: relacion?.completado || false,
          }

          setJuego(enriched)
        } else {
          // Si falla el fetch del juego, dejamos juego en null
          console.error(
            'Error obteniendo datos del juego',
            gameRes?.error || gameRes
          )
          setJuego(null)
        }

        if (reviewsRes && reviewsRes.ok) {
          try {
            const dataReseñas = await reviewsRes.json()
            setReseñas(Array.isArray(dataReseñas) ? dataReseñas : [])
          } catch (e) {
            setReseñas([])
          }
        } else {
          console.error(
            'Error cargando reseñas',
            reviewsRes?.error || reviewsRes
          )
          setReseñas([])
        }
      } catch (err) {
        if (err.name === 'AbortError') {
        } else {
          console.error('Error en InfoJuego (catch):', err)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user ? user._id || user.id : null])

  // Actualizar estado usuario-juego
  const actualizarEstado = async (juegoId, campo, valor) => {
    try {
      let userId = user?._id || user?.id

      if (!userId) {
        const saved = localStorage.getItem('user')
        if (saved) {
          const parsed = JSON.parse(saved)
          userId = parsed._id || parsed.id
        }
      }

      if (!userId) return navigate('/perfil')

      const res = await authFetch(
        `${API_URL}/api/dataUser/usuario/${userId}/juego/${juegoId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ [campo]: valor }),
        }
      )

      if (!res.ok) {
        console.error(await res.json().catch(() => {}))
        return
      }

      setJuego((prev) => (prev ? { ...prev, [campo]: valor } : prev))

      if (typeof setJuegos === 'function') {
        setJuegos((prev) =>
          Array.isArray(prev)
            ? prev.map((j) =>
                j._id === juegoId ? { ...j, [campo]: valor } : j
              )
            : prev
        )
      }
    } catch (err) {
      console.error('Error actualizando estado:', err)
    }
  }

  // Nueva reseña
  const handleReseniaEnviada = (nueva) => {
    setReseñas((prev) => [nueva, ...prev])
  }

  // Enviar respuesta
  const handleEnviarRespuesta = async (reseñaId, texto) => {
    if (!user?._id && !user?.id) {
      return alert('Debes iniciar sesión para responder.')
    }

    try {
      const res = await authFetch(
        `${API_URL}/api/reviews/${reseñaId}/responder`,
        {
          method: 'POST',
          body: JSON.stringify({
            respuesta: texto,
            usuarioId: user._id || user.id,
          }),
        }
      )

      if (!res.ok) throw new Error('Error enviando respuesta')

      const actualizada = await res.json()

      setReseñas((prev) =>
        prev.map((r) => (r._id === actualizada._id ? actualizada : r))
      )

      setReseniaSeleccionada(null)
    } catch (err) {
      console.error('Error respuesta:', err)
      alert('Hubo un problema al responder.')
    }
  }

  // Render
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
        <button className="btn-jugar">Descargar</button>

        <button
          className={`mygame-boton ${juego.misjuegos ? 'activo' : ''}`}
          onClick={() =>
            actualizarEstado(juego._id, 'misjuegos', !juego.misjuegos)
          }
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
        >
          <img
            src={juego.completado ? iconCompletados : iconPorCompletar}
            className="iconGames"
          />
        </button>
      </div>

      <FormularioResenias
        juegoId={juego._id}
        usuarioId={user?._id || user?.id}
        nombreUsuario={user?.nombre}
        onReseniaEnviada={handleReseniaEnviada}
      />

      <div className="reseña">
        <h3>Reseñas de usuarios</h3>

        {reseñas.length === 0 && <p>No hay reseñas aún.</p>}

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
                        src={
                          n <= r.puntuacion ? iconGrimorio : iconGrimorioVacio
                        }
                        className="grimorio"
                      />
                    ))}
                  </div>
                </div>

                <button
                  className="btn-responder"
                  onClick={(e) => {
                    e.preventDefault()
                    setReseniaSeleccionada(r)
                  }}
                >
                  Responder
                </button>
              </summary>

              <div className="reseña-contenido">
                <div className="info-reseña">
                  <p>Asunto: {r.dificultad || 'No especificada'}</p>
                  <p className="hr-jugadas">Horas jugadas: {r.horasJugadas}</p>
                </div>

                <p className="reseña-texto">{r.textoResenia}</p>

                {r.respuestas?.length > 0 && (
                  <div className="reseña-respuestas">
                    {r.respuestas.map((resp, i) => (
                      <div key={i} className="respuesta-item">
                        <strong>{resp.usuarioId?.nombre || 'Anónimo'}:</strong>
                        {resp.texto}
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
            onSubmit={handleEnviarRespuesta}
          />
        )}
      </div>
    </div>
  )
}

export default InfoJuego
