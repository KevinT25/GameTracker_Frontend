import '../../styles/Perfil.css'
import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom' // ✅ añadido
import iconMisJuegos from '../../../assets/Icons/iconMisJuegos.png'
import iconCompletados from '../../../assets/Icons/iconCompletados.png'
import iconPorCompletar from '../../../assets/Icons/iconPorCompletar.png'
import SliderCategoria from '../componente_Home/Categoria'

function MisJuegos() {
  const [juegos, setJuegos] = useState([])
  const [query, setQuery] = useState('')
  const [estadoJuego, setEstadoJuego] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  
  const API_URL = import.meta.env.VITE_API_URL
  const { id } = useParams()
  // Obtener juegos del usuario correcto
  useEffect(() => {
    let uid = id

    if (!uid) {
      // 🔹 si NO hay userId → mi perfil
      const user = JSON.parse(localStorage.getItem('user'))
      uid = user?.id || user?._id
    }

    if (!uid) return

    fetch(`${API_URL}/api/datauser/usuario/${uid}`)
      .then((res) => {
        if (!res.ok) throw new Error('No se pudieron obtener los juegos')
        return res.json()
      })
      .then((data) => {
        const misJuegos = data.filter((item) => item.misjuegos === true)
        const juegosUsuario = misJuegos.map((item) => item.juegoId)
        setJuegos(juegosUsuario)
      })
      .catch((err) => setError(err.message))
  }, [id])

  // 🔹 Filtros y ordenamiento
  const filteredAndSorted = useMemo(() => {
    let filteredList = juegos.filter((game) => {
      if (query) {
        const lowerQuery = query.toLowerCase()
        if (!game.titulo.toLowerCase().includes(lowerQuery)) return false
      }

      if (estadoJuego === 'completado' && !game.completado) return false
      if (estadoJuego === 'por_completar' && game.completado) return false

      return true
    })

    return filteredList
  }, [juegos, query, estadoJuego])

  if (error) return <div className="mis-juegos">Error: {error}</div>
  if (juegos.length === 0)
    return (
      <div className="mis-juegos" id="error">
        No hay juegos aún.
      </div>
    )

  return (
    <div className="mis-juegos">
      <header className="mis-juegos-header">
        <h2 className="sub-title">
          <img src={iconMisJuegos} alt="Mis Juegos" className="icon-titulo" />
          Mis Juegos
        </h2>
      </header>

      <div className="busqueda">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar entre los juegos..."
        />
      </div>

      <details className="filtros">
        <summary>Filtros</summary>
        <div className="contenido-filtros">
          <div className="bloque-filtro">
            <div className="grupo-botones">
              <button
                onClick={() =>
                  setEstadoJuego(
                    estadoJuego === 'completado' ? '' : 'completado'
                  )
                }
                className={estadoJuego === 'completado' ? 'activo' : ''}
              >
                <img
                  src={iconCompletados}
                  alt="Completados"
                  className="icon_filtro"
                />
                Completados
              </button>
              <button
                onClick={() =>
                  setEstadoJuego(
                    estadoJuego === 'por_completar' ? '' : 'por_completar'
                  )
                }
                className={estadoJuego === 'por_completar' ? 'activo' : ''}
              >
                <img
                  src={iconPorCompletar}
                  alt="Por completar"
                  className="icon_filtro"
                />
                Por Completar
              </button>
            </div>
          </div>
        </div>
      </details>

      <section className="coleccion">
        <p>
          Mostrando {filteredAndSorted.length} de {juegos.length} juegos
        </p>
        <SliderCategoria juegos={filteredAndSorted} id="carrusel" />

        <button
          className="button-navegate"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/biblioteca`)
          }}
        >
          Explorar más Juegos
        </button>
      </section>
    </div>
  )
}

export default MisJuegos
