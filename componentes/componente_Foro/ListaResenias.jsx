import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Loader from '../componente_General/Loading'
import Respuesta from './Respuesta'
import tiempoCarga3 from './../../../assets/loadingGif/tiempoCarga3.gif'

function ListaResenias() {
  const [reseñas, setReseñas] = useState([])
  const [filtro, setFiltro] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedResenia, setSelectedResenia] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  // Cargar reseñas
  useEffect(() => {
    setLoading(true)
    const timeout = setTimeout(() => setLoading(false), 7000)

    fetch('http://localhost:3000/api/reviews')
      .then((res) => res.json())
      .then((data) => {
        setReseñas(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error al cargar reseñas:', err)
        setLoading(false)
      })
      .finally(() => clearTimeout(timeout))
  }, [])

  const verPerfil = (id) => {
    navigate(`/perfil/${id}`)
  }

  // Abrir modal de respuesta
  const abrirModal = (resenia) => {
    setSelectedResenia(resenia)
    setShowModal(true)
  }

  // Enviar respuesta desde modal
  const enviarRespuesta = async (idReseña, respuesta) => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      console.error('Usuario no logueado')
      navigate('/perfil')
      return
    }

    const user = JSON.parse(storedUser)
    const userId = user._id || user.id

    try {
      const res = await fetch(
        `http://localhost:3000/api/reviews/${idReseña}/responder`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            respuesta,
            usuarioId: userId,
          }),
        }
      )

      const data = await res.json()

      if (res.ok) {
        // data ya contiene la reseña completa y actualizada
        setReseñas((prev) => prev.map((r) => (r._id === idReseña ? data : r)))
      } else {
        console.error('Error al responder:', data.error)
        alert(`Error: ${data.error}`)
      }
    } catch (err) {
      console.error('Error al enviar respuesta:', err)
    } finally {
      setShowModal(false)
    }
  }

  // Filtrar reseñas por nombre del juego
  const reseñasFiltradas = reseñas.filter(
    (r) =>
      r.juegoId?.titulo?.toLowerCase().includes(filtro.toLowerCase()) ||
      r.nombreUsuario?.toLowerCase().includes(filtro.toLowerCase())
  )

  if (loading) return <Loader imagen={tiempoCarga3} />

  return (
    <div className="lista-reseñas-container">
      <header className="lista-reseñas-header">
        <h1 className="lista-reseñas-titulo">Comparte tu experiencia</h1>
        <p className="lista-reseñas-subtitulo">
          Comparte y descubre opiniones de toda la comunidad
        </p>
      </header>

      <div className="lista-reseñas-filtro">
        <input
          type="text"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Filtrar por nombre del juego..."
          className="input-filtro"
        />
      </div>

      {reseñasFiltradas.length > 0 ? (
        <div className="lista-reseñas-items">
          {reseñasFiltradas.map((r) => (
            <div key={r._id} className="reseña-item">
              <details className="reseña-details">
                <summary className="reseña-summary">
                  <div className="reseña-summary-info">
                    <img
                      src={r.juegoId?.imagenPortada || r.juego}
                      alt={r.juegoId?.titulo || 'Sin título'}
                      className="reseña-imagenPortada"
                    />
                    <div className="reseña-info">
                      <strong className="reseña-titulo">
                        {r.juegoId?.titulo}
                      </strong>
                      <button
                        onDoubleClick={() => verPerfil(r.usuarioId._id)}
                        className="btn-amigo"
                        data-tooltip="Visitar perfil"
                      >
                        <p className="reseña-usuario">Por: {r.nombreUsuario}</p>
                      </button>
                      <p className="reseña-recomendaria">
                        {r.recomendaria ? 'Recomendado' : 'No recomendado'}
                      </p>
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
                  <div className="datos-reseña">
                    <p id="reseña-dificultad">
                      Asunto: {r.dificultad || 'No especificada'}
                    </p>
                    <p id="reseña-horasJugadas">
                      Horas jugadas: {r.horasJugadas}
                    </p>
                  </div>
                  <p className="reseña-texto">{r.textoResenia}</p>

                  {/* Respuestas */}
                  {r.respuestas && r.respuestas.length > 0 && (
                    <div className="reseña-respuestas">
                      {r.respuestas.map((resp) => (
                        <div
                          key={resp._id || Math.random()}
                          className="respuesta-item"
                        >
                          <strong>
                            {resp.usuarioId?.nombre || 'Usuario anónimo'}
                          </strong>
                          : {resp.texto}
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
        <p>No hay reseñas disponibles.</p>
      )}

      {showModal && selectedResenia && (
        <Respuesta
          reseña={selectedResenia}
          onClose={() => setShowModal(false)}
          onSubmit={enviarRespuesta}
        />
      )}
    </div>
  )
}

export default ListaResenias
