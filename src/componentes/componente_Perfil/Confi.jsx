import '../../styles/confi.css'
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  eventoAuth,
  eventoActualizarHeader,
} from '../../event_Global/globalEvents'
import { authFetch } from '../../helpers/authFetch'

function Confi() { 
  const [juegos, setJuegos] = useState([])
  const [editandoId, setEditandoId] = useState(null)

  // campos juego
  const [titulo, setTitulo] = useState('')
  const [genero, setGenero] = useState('')
  const [plataforma, setPlataforma] = useState('')
  const [anioLanzamiento, setAnioLanzamiento] = useState('')
  const [clasificacionEdad, setClasificacionEdad] = useState('')
  const [desarrollador, setDesarrollador] = useState('')
  const [imagenPortada, setImagenPortada] = useState('')
  const [descripcion, setDescripcion] = useState('')

  // cuenta
  const [user, setUser] = useState(null)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [contrasenia, setContrasenia] = useState('')

  // logros
  const [logros, setLogros] = useState([])

  const API_URL = import.meta.env.VITE_API_URL
  const navigate = useNavigate()

  // --- Cargar usuario ---
  const cargarUsuario = () => {
    try {
      const raw = localStorage.getItem('user')
      if (!raw) {
        setUser(null)
        return
      }

      const parsed = JSON.parse(raw)
      setUser(parsed)
      setNombre(parsed.nombre || '')
      setEmail(parsed.email || '')
    } catch (err) {
      console.error('Error leyendo usuario desde localStorage', err)
      setUser(null)
    }
  }

  // --- Obtener juegos ---
  const fetchJuegos = useCallback(async () => {
    const uid = user?.id || user?._id
    if (!uid) return

    try {
      const res = await authFetch(`${API_URL}/api/games?facilitador=${uid}`)
      if (!res.ok) throw new Error(await res.text())

      const data = await res.json()
      const filtrados = data.filter((g) => g && g._id)

      setJuegos(filtrados)
    } catch (err) {
      console.error('Error cargando juegos:', err)
    }
  }, [user])

  useEffect(() => {
    cargarUsuario()
  }, [])

  useEffect(() => {
    if (user) fetchJuegos()
  }, [user, fetchJuegos])

  // --- Crear juego ---
  const crearJuego = async () => {
    const uid = user.id || user._id

    const nuevoJuego = {
      titulo,
      genero,
      plataforma,
      anioLanzamiento,
      clasificacionEdad,
      desarrollador,
      imagenPortada,
      descripcion,
      facilitador: uid,
    }

    try {
      const res = await authFetch(`${API_URL}/api/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoJuego),
      })

      if (!res.ok) throw new Error(await res.text())

      await fetchJuegos()
      limpiarFormularioJuego()
    } catch (err) {
      console.error('Error creando juego:', err)
    }
  }

  // --- Actualizar juego ---
  const actualizarJuego = async () => {
    if (!editandoId) return

    const actualizado = {
      titulo,
      genero,
      plataforma,
      anioLanzamiento,
      clasificacionEdad,
      desarrollador,
      imagenPortada,
      descripcion,
    }

    try {
      const res = await authFetch(`${API_URL}/api/games/games/${editandoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actualizado),
      })

      if (!res.ok) throw new Error(await res.text())

      const data = await res.json()

      setJuegos((prev) => prev.map((j) => (j._id === editandoId ? data : j)))
      setEditandoId(null)
      limpiarFormularioJuego()
    } catch (err) {
      console.error('Error actualizando juego:', err)
    }
  }

  // --- Preparar edición ---
  const prepararEdicion = (juego) => {
    if (!juego) return

    setEditandoId(juego._id)
    setTitulo(juego.titulo || '')
    setGenero(juego.genero || '')
    setPlataforma(juego.plataforma || '')
    setAnioLanzamiento(juego.anioLanzamiento || '')
    setClasificacionEdad(juego.clasificacionEdad || '')
    setDesarrollador(juego.desarrollador || '')
    setImagenPortada(juego.imagenPortada || '')
    setDescripcion(juego.descripcion || '')
  }

  // --- Limpiar formulario ---
  const limpiarFormularioJuego = () => {
    setTitulo('')
    setGenero('')
    setPlataforma('')
    setAnioLanzamiento('')
    setClasificacionEdad('')
    setDesarrollador('')
    setImagenPortada('')
    setDescripcion('')
  }

  // --- Actualizar cuenta ---
  const actualizarCuenta = async () => {
    const id = user.id || user._id

    try {
      const res = await authFetch(`${API_URL}/api/users/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, contrasenia }),
      })

      if (!res.ok) throw new Error(await res.text())

      const data = await res.json()

      localStorage.setItem(
        'user',
        JSON.stringify({
          id: data._id || data.id,
          nombre: data.nombre,
          email: data.email,
        })
      )

      cargarUsuario()
      eventoActualizarHeader.emitir()
      alert('Cuenta actualizada')
    } catch (err) {
      console.error('Error actualizando cuenta:', err)
    }
  }

  // --- Eliminar cuenta ---
  const eliminarCuenta = async () => {
    if (!confirm('¿Eliminar tu cuenta permanentemente?')) return

    const id = user.id || user._id

    try {
      const res = await authFetch(`${API_URL}/api/users/users/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error(await res.text())

      localStorage.removeItem('user')
      setUser(null)

      eventoAuth.emitir(false)
      eventoActualizarHeader.emitir()

      alert('Cuenta eliminada')
      navigate('/')
    } catch (err) {
      console.error('Error eliminando cuenta:', err)
    }
  }

  // --- Cerrar sesión ---
  const cerrarSesion = () => {
    localStorage.removeItem('user')

    setUser(null)
    setNombre('')
    setEmail('')
    setContrasenia('')
    setJuegos([])

    eventoAuth.emitir(false)
    eventoActualizarHeader.emitir()

    alert('Has cerrado sesión.')
    navigate('/')
  }

  // --- Cargar logros ---
  useEffect(() => {
    const cargarLogros = async () => {
      try {
        const resAll = await fetch(`${API_URL}/api/achievements`)
        if (!resAll.ok) throw new Error('Error al cargar logros generales')
        const todosLogros = await resAll.json()

        const uid = user?.id || user?._id

        if (!uid) {
          setLogros(todosLogros)
          return
        }

        const resUnlocked = await Fetch(
          `${API_URL}/api/usuario/${uid}/logros`
        )
        if (!resUnlocked.ok)
          throw new Error('Error al cargar logros desbloqueados')

        const logrosDesbloqueados = await resUnlocked.json()

        const ids = new Set(logrosDesbloqueados.map((l) => l._id))

        setLogros(
          todosLogros.map((l) => ({
            ...l,
            desbloqueado: ids.has(l._id),
          }))
        )
      } catch (err) {
        console.error('Error cargando logros:', err)
      }
    }

    cargarLogros()
  }, [user])

  return (
    <div className="confi-container">
      <section className="confi-juegos">
        <h2>{editandoId ? 'Editar Juego' : 'Subir Juego'}</h2>

        <div className="form">
          <input
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          <input
            placeholder="Género"
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
          />
          <input
            placeholder="Plataforma"
            value={plataforma}
            onChange={(e) => setPlataforma(e.target.value)}
          />
          <input
            placeholder="Año lanzamiento"
            value={anioLanzamiento}
            onChange={(e) => setAnioLanzamiento(e.target.value)}
          />
          <input
            placeholder="Clasificación"
            value={clasificacionEdad}
            onChange={(e) => setClasificacionEdad(e.target.value)}
          />
          <input
            placeholder="Desarrollador"
            value={desarrollador}
            onChange={(e) => setDesarrollador(e.target.value)}
          />
          <input
            placeholder="URL imagen portada"
            value={imagenPortada}
            onChange={(e) => setImagenPortada(e.target.value)}
            className="url-confi"
          />
          <textarea
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        <div className="form-actions">
          {editandoId ? (
            <>
              <button onClick={actualizarJuego} className="btn-gold">
                Guardar cambios
              </button>
              <button
                onClick={() => {
                  setEditandoId(null)
                  limpiarFormularioJuego()
                }}
                className="btn-gold"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button onClick={crearJuego} className="btn-gold">
              Subir juego
            </button>
          )}
        </div>

        <h3>Lista de juegos</h3>
        <div className="lista-juegos">
          {juegos.map((g, i) => {
            if (!g || !g._id) return null
            return (
              <div key={g._id || i} className="item-juego">
                <img
                  src={g?.imagenPortada || '/placeholder.jpg'}
                  alt={g?.titulo || 'Sin título'}
                  className="mini-portada"
                />
                <div className="meta">
                  <strong>{g.titulo}</strong>
                  <small>
                    {g.genero} • {g.desarrollador}
                  </small>
                </div>
                <div className="actions">
                  <button
                    onClick={() => prepararEdicion(g)}
                    className="btn-gold"
                  >
                    Editar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="confi-cuenta">
        <h2>Mi Cuenta</h2>
        <form onSubmit={(e) => e.preventDefault()} className="form">
          <input
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            placeholder="Email"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Contraseña (nueva)"
            type="password"
            autoComplete="new-password"
            value={contrasenia}
            onChange={(e) => setContrasenia(e.target.value)}
          />
        </form>
        <div className="form-actions">
          <button onClick={actualizarCuenta} className="btn-gold">
            Actualizar cuenta
          </button>
          <button onClick={eliminarCuenta} className="danger">
            Eliminar cuenta
          </button>
          <button onClick={cerrarSesion} className="danger">
            Cerrar sesión
          </button>
        </div>
      </section>

      <section className="all-logros">
        <h3 className="title-logro">Logros</h3>
        {logros.length > 0 ? (
          logros.map((logro) => (
            <div
              key={logro._id || logro.id || logro.nombre}
              className={`item-logro ${
                logro.desbloqueado ? 'activo' : 'bloqueado'
              }`}
            >
              <img
                src={logro.icono}
                alt={logro.nombre}
                className="img-logros"
              />
              <div>
                <strong>{logro.nombre}</strong>
                <p>{logro.descripcion}</p>
                <small>{logro.condicion}</small>
              </div>
            </div>
          ))
        ) : (
          <p>No hay logros disponibles.</p>
        )}
      </section>
    </div>
  )
}

export default Confi
