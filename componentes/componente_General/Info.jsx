import './../../styles/Info.css'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import FormularioResenias from '../componente_Foro/FormularioResenia'
import Respuesta from '../componente_Foro/Respuesta'
import Loader from '../componente_General/Loading'
import tiempoCarga4 from './../../../assets/loadingGif/tiempoCarga4.gif'
import iconGrimorio from '../../../assets/Icons/iconGrimorio.png'
import iconGrimorioVacio from '../../../assets/Icons/iconGrimorioVacio.png'
import iconNoWishlist from '../../../assets/Icons/iconNoWishlist.png'
import iconWishlist from '../../../assets/Icons/iconWishlist.png'
import iconMisJuegos from '../../../assets/Icons/iconMisJuegos.png'
import iconEliminar from '../../../assets/Icons/iconEliminar.png'
import iconCompletados from '../../../assets/Icons/iconCompletados.png'
import iconPorCompletar from '../../../assets/Icons/iconPorCompletar.png'

function InfoJuego({ setJuegos }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [juego, setJuego] = useState(null)
  const [user, setUser] = useState(null)
  const [reseñas, setReseñas] = useState([])
  const [reseniaSeleccionada, setReseniaSeleccionada] = useState(null)

  // Obtener usuario desde localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsed = JSON.parse(userData)
        setUser(parsed)
      } catch (err) {
        console.error('Error parseando usuario:', err)
      }
    }
  }, [])

  // Cargar datos del juego y reseñas
  useEffect(() => {
    if (!user) return

    setLoading(true)
    let cancelled = false
    const userId = user._id || user.id

    const fetchData = async () => {
      try {
        const resJuego = await fetch(
          `http://localhost:3000/api/games/games/${id}`
        )
        if (!resJuego.ok)
          throw new Error('Error al obtener los datos del juego')
        let dataJuego = await resJuego.json()

        const resUserRelacion = await fetch(
          `http://localhost:3000/api/dataUser/usuario/${userId}`
        )
        if (!resUserRelacion.ok)
          throw new Error('Error al obtener relación del usuario')
        const dataUser = await resUserRelacion.json()

        if (cancelled) return

        const relacion = Array.isArray(dataUser)
          ? dataUser.find((d) => {
              const idJuego =
                typeof d.juegoId === 'object' ? d.juegoId._id : d.juegoId
              return idJuego === dataJuego._id
            })
          : null

        if (relacion) {
          dataJuego = {
            ...dataJuego,
            misjuegos: relacion.misjuegos,
            wishlist: relacion.wishlist,
            completado: relacion.completado,
          }
        } else {
          dataJuego = {
            ...dataJuego,
            misjuegos: false,
            wishlist: false,
            completado: false,
          }
        }

        setJuego(dataJuego)
        setLoading(false)

        // Cargar reseñas del juego
        const resReseñas = await fetch(
          `http://localhost:3000/api/reviews/game/${id}`
        )
        if (resReseñas.ok) {
          const dataReseñas = await resReseñas.json()
          setReseñas(dataReseñas)
        }
      } catch (err) {
        console.error('Error al cargar datos en InfoJuego:', err)
        setLoading(false)
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [id, user])

  // Función para actualizar estado usuario-juego
  const actualizarEstado = async (juegoId, campo, valor) => {
    try {
      let userId = user?._id || user?.id
      if (!userId) {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const parsed = JSON.parse(storedUser)
          userId = parsed._id || parsed.id
        }
      }
      if (!userId) {
        navigate('/perfil')
        return
      }

      const res = await fetch(
        `http://localhost:3000/api/dataUser/usuario/${userId}/juego/${juegoId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [campo]: valor }),
        }
      )

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error('Error al actualizar:', err)
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
    } catch (error) {
      console.error('Error al conectar con el backend:', error)
    }
  }

  // Actualiza reseñas al enviar una nueva
  const handleReseniaEnviada = (nuevaResenia) => {
    setReseñas((prev) => [nuevaResenia, ...prev])
  }

  // Maneja el envío de una respuesta
  const handleEnviarRespuesta = async (reseñaId, textoRespuesta) => {
    if (!user?._id && !user?.id) {
      alert('Debes iniciar sesión para responder.')
      return
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/reviews/${reseñaId}/responder`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            respuesta: textoRespuesta,
            usuarioId: user._id || user.id,
          }),
        }
      )

      if (!res.ok) throw new Error('Error al enviar respuesta.')

      const dataActualizada = await res.json()

      // Actualiza reseñas localmente
      setReseñas((prev) =>
        prev.map((r) => (r._id === dataActualizada._id ? dataActualizada : r))
      )

      setReseniaSeleccionada(null)
    } catch (err) {
      console.error('Error enviando respuesta:', err)
      alert('Hubo un problema al enviar tu respuesta.')
    }
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
        <button className="btn-jugar">Descargar</button>

        <button
          className={`mygame-boton ${juego.misjuegos ? 'activo' : ''}`}
          onClick={() =>
            actualizarEstado(juego._id, 'misjuegos', !juego.misjuegos)
          }
          data-tooltip={`${juego.misjuegos ? 'Quitar' : 'Añadir'} mi juego`}
        >
          <img
            src={juego.misjuegos ? iconMisJuegos : iconEliminar}
            alt={juego.misjuegos ? 'En mis juegos' : 'Agregar a mis juegos'}
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
            alt={juego.wishlist ? 'En wishlist' : 'Agregar a wishlist'}
            className="iconGames"
          />
        </button>

        <button
          className={`completado-boton ${juego.completado ? 'activo' : ''}`}
          onClick={() =>
            actualizarEstado(juego._id, 'completado', !juego.completado)
          }
          data-tooltip={`${
            juego.completado ? 'Quitar' : 'Añadir'
          } Completado `}
        >
          <img
            src={juego.completado ? iconCompletados : iconPorCompletar}
            alt={
              juego.completado
                ? 'Juego completado'
                : 'Marcar como por completar'
            }
            className="iconGames"
          />
        </button>
      </div>

      {/* Formulario de reseñas */}
      <FormularioResenias
        juegoId={juego._id}
        usuarioId={user?._id || user?.id}
        nombreUsuario={user?.nombre}
        onReseniaEnviada={handleReseniaEnviada}
      />

      {/* Lista de reseñas */}
      <div className="reseña">
        <h3>Reseñas de usuarios</h3>
        {reseñas.length === 0 && <p>No hay reseñas aún.</p>}

        {reseñas.map((r) => (
          <div key={r._id} className="reseña-item">
            <details className="reseña-details">
              <summary className="reseña-summary">
                <div className="reseña-info">
                  <strong className="reseña-titulo">
                    {r.usuarioId?.nombre || 'Anónimo'}
                  </strong>
                  <div className="grimorios-puntuacion">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <img
                        key={n}
                        src={
                          n <= r.puntuacion ? iconGrimorio : iconGrimorioVacio
                        }
                        alt={`grimorio ${
                          n <= r.puntuacion ? 'activo' : 'vacío'
                        }`}
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
                        <strong>
                          {resp.usuarioId?.nombre || 'Usuario anónimo'}:
                        </strong>{' '}
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
