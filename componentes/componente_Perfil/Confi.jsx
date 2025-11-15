import '../../styles/confi.css'
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

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
  const [IsLoginOpen, setIsLoginOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [contrasenia, setContrasenia] = useState('')
  // logros
  const [logros, setLogros] = useState([])

  const navigate = useNavigate()

  const cargarUsuario = () => {
    try {
      const raw = localStorage.getItem('user')
      if (!raw) {
        setUser(null)
        setIsLoginOpen(true)
        return
      }
      const parsed = JSON.parse(raw)
      setUser(parsed)
      setNombre(parsed.nombre || '')
      setEmail(parsed.email || '')
    } catch (err) {
      console.error('Error leyendo user desde localStorage', err)
      setUser(null)
      setIsLoginOpen(true)
    }
  }

  const fetchJuegos = useCallback(async () => {
    const uid = user?.id || user?._id
    if (!uid) return
    try {
      const res = await fetch(
        `http://localhost:3000/api/games?facilitador=${uid}`
      )
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setJuegos(data)
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

  // --- Juegos CRUD ---
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
      const res = await fetch('http://localhost:3000/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoJuego),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      await fetchJuegos()
      setJuegos(() => [data])
      limpiarFormularioJuego()
    } catch (err) {
      console.error('Error creando juego:', err)
    }
  }

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
      const res = await fetch(
        `http://localhost:3000/api/games/games/${editandoId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(actualizado),
        }
      )
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setJuegos((prev) => prev.map((p) => (p._id === editandoId ? data : p)))
      setEditandoId(null)
      limpiarFormularioJuego()
    } catch (err) {
      console.error('Error actualizando juego:', err)
    }
  }

  const prepararEdicion = (juego) => {
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

  // --- Cuenta (editar / eliminar) ---
  const actualizarCuenta = async () => {
    const id = user.id || user._id
    try {
      const res = await fetch(`http://localhost:3000/api/users/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, contrasenia }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      // actualizar localStorage y estado
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: data._id || data.id,
          nombre: data.nombre,
          email: data.email,
        })
      )
      cargarUsuario()
      alert('Cuenta actualizada')
    } catch (err) {
      console.error('Error actualizando cuenta:', err)
    }
  }

  const eliminarCuenta = async () => {
    if (!confirm('¿Eliminar tu cuenta permanentemente?')) return
    const id = user.id || user._id
    try {
      const res = await fetch(`http://localhost:3000/api/users/users/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error(await res.text())
      // limpiar sesión y redirigir
      localStorage.removeItem('user')
      setUser(null)
      alert('Cuenta eliminada')
      navigate('/')
    } catch (err) {
      console.error('Error eliminando cuenta:', err)
    }
  }

  const cerrarSesion = () => {
    localStorage.removeItem('user')
    window.dispatchEvent(new Event('userChange')) 
    setUser(null)
    setNombre('')
    setEmail('')
    setContrasenia('')
    setJuegos([])
    navigate('/')

    alert('Has cerrado sesión correctamente.')
  }

  // --- Logros -------
  useEffect(() => {
    const cargarLogros = async () => {
      try {
        // Cargar todos los logros
        const resAll = await fetch('http://localhost:3000/api/achievements')
        if (!resAll.ok) throw new Error('Error al cargar logros generales')
        const todosLogros = await resAll.json()

        // Si hay usuario logeado, cargar los desbloqueados
        const uid = user?.id || user?._id
        if (!uid) {
          setLogros(todosLogros)
          return
        }

        const resUnlocked = await fetch(
          `http://localhost:3000/api/usuario/${uid}/logros`
        )
        if (!resUnlocked.ok)
          throw new Error('Error al cargar logros desbloqueados')
        const logrosDesbloqueados = await resUnlocked.json()

        // Marcar los desbloqueados
        const idsDesbloqueados = new Set(logrosDesbloqueados.map((l) => l._id))
        const logrosConEstado = todosLogros.map((l) => ({
          ...l,
          desbloqueado: idsDesbloqueados.has(l._id),
        }))

        setLogros(logrosConEstado)
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
            required
          />
          <input
            placeholder="Género"
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
            required
          />
          <input
            placeholder="Plataforma"
            value={plataforma}
            onChange={(e) => setPlataforma(e.target.value)}
            required
          />
          <input
            placeholder="Año lanzamiento"
            value={anioLanzamiento}
            onChange={(e) => setAnioLanzamiento(e.target.value)}
            required
          />
          <input
            placeholder="Clasificación"
            value={clasificacionEdad}
            onChange={(e) => setClasificacionEdad(e.target.value)}
            required
          />
          <input
            placeholder="Desarrollador"
            value={desarrollador}
            onChange={(e) => setDesarrollador(e.target.value)}
            required
          />
          <input
            placeholder="URL imagen portada"
            value={imagenPortada}
            onChange={(e) => setImagenPortada(e.target.value)}
            className="url-confi"
            required
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
          {juegos.map((g) => (
            <div key={g._id} className="item-juego">
              <img
                src={g.imagenPortada}
                alt={g.titulo}
                className="mini-portada"
              />
              <div className="meta">
                <strong>{g.titulo}</strong>
                <small>
                  {g.genero} • {g.desarrollador}
                </small>
              </div>
              <div className="actions">
                <button onClick={() => prepararEdicion(g)} className="btn-gold">
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="confi-cuenta">
        <h2>Mi Cuenta</h2>
        <div className="form">
          <input
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Contraseña (nueva)"
            type="password"
            value={contrasenia}
            onChange={(e) => setContrasenia(e.target.value)}
          />
        </div>
        <div className="form-actions">
          <button onClick={actualizarCuenta} className="btn-gold">
            Actualizar cuenta
          </button>
          <button onClick={eliminarCuenta} className="danger">
            Eliminar cuenta
          </button>
          <button onClick={cerrarSesion} className="danger">
            Cerrar sesion
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
              <strong>{logro.nombre}</strong>
              <p>{logro.descripcion}</p>
              <img
                src={logro.icono}
                alt={logro.nombre}
                className="sin-logros"
              />
              <small>{logro.condicion}</small>
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
