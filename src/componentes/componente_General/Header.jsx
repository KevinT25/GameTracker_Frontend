import './../../styles/Header.css'
import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import iconIngresar from '../../assets/Icons/iconIngresar.png'
import iconRegistro from '../../assets/Icons/iconRegistro.png'
import Login from './Login'

// IMPORTAMOS EVENTOS
import {
  escucharEvento,
  dejarDeEscuchar,
  eventoAuth,
  eventoActualizarHeader,
} from '../../event_Global/globalEvents'

function Headers() {
  const [open, setOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [user, setUser] = useState(null)
  const navRef = useRef(null)

  // cargar usuario al iniciar
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  // EVENTO GLOBAL: login / logout
  useEffect(() => {
    const handleAuthChange = (e) => {
      const { logueado } = e.detail
      if (!logueado) {
        setUser(null)
        return
      }
      const userData = localStorage.getItem('user')
      setUser(userData ? JSON.parse(userData) : null)
    }

    escucharEvento(eventoAuth.nombre, handleAuthChange)

    return () => {
      dejarDeEscuchar(eventoAuth.nombre, handleAuthChange)
    }
  }, [])

  // EVENTO GLOBAL: refrescar header
  useEffect(() => {
    const handleHeaderUpdate = () => {
      const userData = localStorage.getItem('user')
      setUser(userData ? JSON.parse(userData) : null)
    }

    escucharEvento(eventoActualizarHeader.nombre, handleHeaderUpdate)

    return () => {
      dejarDeEscuchar(eventoActualizarHeader.nombre, handleHeaderUpdate)
    }
  }, [])

  useEffect(() => {
    const abrirModalLogin = () => {
      setIsLoginOpen(true)
    }

    window.addEventListener('openLoginModal', abrirModalLogin)

    return () => {
      window.removeEventListener('openLoginModal', abrirModalLogin)
    }
  }, [])

  // cerrar el menú hamburguesa con ESC o click fuera
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    function onClickOutside(e) {
      if (open && navRef.current && !navRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClickOutside)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClickOutside)
    }
  }, [open])

  return (
    <div ref={navRef}>
      <nav className={`navbar ${open ? 'nav-open' : ''}`}>
        <div className="logo">
          <Link to="/" id="Logo" onClick={() => setOpen(false)}>
            Game VR
          </Link>
        </div>

        <button
          className={`hamburger ${open ? 'is-active' : ''}`}
          aria-label="Abrir menú"
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen((s) => !s)}
        >
          <span />
          <span />
          <span />
        </button>

        <ul
          id="primary-navigation"
          className={`nav-links ${open ? 'open' : ''}`}
        >
          <li>
            <Link
              to="/"
              className="boton-gremio"
              onClick={() => setOpen(false)}
            >
              Inicio
            </Link>
          </li>
          <li>
            <Link
              to="/biblioteca"
              className="boton-gremio"
              onClick={() => setOpen(false)}
            >
              Inventario
            </Link>
          </li>
          <li>
            <Link
              to="/foro"
              className="boton-gremio"
              onClick={() => setOpen(false)}
            >
              Foro
            </Link>
          </li>
          <li>
            <Link
              to="/Ranking"
              className="boton-gremio"
              onClick={() => setOpen(false)}
            >
              Ranking
            </Link>
          </li>
          <li>
            {!user ? (
              <button
                className="boton-gremio"
                onClick={() => setIsLoginOpen(true)}
              >
                Perfil
                <img
                  src={iconRegistro}
                  alt="registrarte"
                  className="img-Icon"
                />
              </button>
            ) : (
              <Link to="/perfil" className="boton-gremio">
                Perfil
                <img src={iconIngresar} alt="perfil" className="img-Icon" />
              </Link>
            )}
          </li>
        </ul>
      </nav>

      <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  )
}

export default Headers
