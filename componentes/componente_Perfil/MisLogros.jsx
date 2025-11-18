import '../../styles/Perfil.css'
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'

function MisLogros() {
  const [logros, setLogros] = useState([])
  const [logrosVisibles, setLogrosVisibles] = useState(4)
  const [logroActivo, setLogroActivo] = useState(null)

  const API_URL = import.meta.env.VITE_API_URL
  const { id } = useParams()

  const cargarLogros = useCallback(async () => {
    let uid = id

    if (!uid) {
      const user = JSON.parse(localStorage.getItem('user'))
      uid = user?.id || user?._id
    }

    if (!uid) return

    try {
      const res = await fetch(`${API_URL}/api/usuario/${uid}/logros`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      if (Array.isArray(data)) {
        setLogros(data)
      } else {
        console.warn('Respuesta inesperada, no es un array.')
      }
    } catch (err) {
      console.error('Error cargando los logros:', err)
    }
  }, [id])

  useEffect(() => {
    cargarLogros()
  }, [cargarLogros])

  const mostrarMas = () => {
    setLogrosVisibles((prev) => (prev >= logros.length ? 4 : prev + 4))
  }

  return (
    <div className="mis-logros-container">
      <h2 className="titulo-seccion">Mis Logros</h2>

      <div className="grid-logros">
        {logros.slice(0, logrosVisibles).map((logro) => (
          <div
            key={logro._id}
            className="logro-card"
            onClick={() => setLogroActivo(logro)}
          >
            <div className="rombo"></div>
            <img src={logro.icono} alt={logro.nombre} className="icon-logro" />
            <h3>{logro.nombre}</h3>
          </div>
        ))}
      </div>

      {logros.length > 4 && (
        <button className="btn-vermas" onClick={mostrarMas}>
          {logrosVisibles >= logros.length ? 'Ver menos ▲' : 'Ver más ▼'}
        </button>
      )}

      {logroActivo && (
        <dialog open className="dialog-logro" id="dialog-logro">
          <div className="dialog-content">
            <img
              src={logroActivo.icono}
              alt={logroActivo.nombre}
              className="icon-logro"
            />
            <h3>{logroActivo.nombre}</h3>
            <p>{logroActivo.descripcion}</p>
            <button onClick={() => setLogroActivo(null)}>Cerrar</button>
          </div>
        </dialog>
      )}
    </div>
  )
}

export default MisLogros
