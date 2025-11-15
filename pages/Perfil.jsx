import { useEffect, useState } from 'react'
import Status from './../componentes/componente_Perfil/Status'
import Estadisticas from './../componentes/componente_Perfil/Estadisticas'
import MisJuegos from '../componentes/componente_Perfil/MisJuegos'
import MisLogros from '../componentes/componente_Perfil/MisLogros'

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
