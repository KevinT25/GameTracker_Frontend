import { useEffect, useState } from 'react'
import Status from './Status'
import Estadisticas from './Estadisticas'
import MisJuegos from './MisJuegos'
import MisLogros from './MisLogros'

function Perfil() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      return
    }

    const usuario = JSON.parse(userData)
    const usuarioId = usuario?.id

    const obtenerEstadisticas = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/dataUser/usuario/${usuarioId}/stats`
        )
        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error('Error al obtener estadísticas:', err)
      }
    }
    obtenerEstadisticas()
  }, [])

  return (
    <div>
      <Status />
      <div className="hr"></div>
      {stats ? (
        <div className="estadisticas-right">
          <Estadisticas stats={stats} />
        </div>
      ) : (
        <p className="cargando">Cargando tus estadisticas ...</p>
      )}
      <div className="hr"></div>
      <MisJuegos />
      <div className="hr"></div>
      <MisLogros />
    </div>
  )
}

export default Perfil
