import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Status from './../componentes/componente_Perfil/Status'
import Estadisticas from './../componentes/componente_Perfil/Estadisticas'
import MisJuegos from '../componentes/componente_Perfil/MisJuegos'
import MisLogros from '../componentes/componente_Perfil/MisLogros'

function Perfil() {
  const [stats, setStats] = useState(null)
  const { id } = useParams()
  const [usuarioId, setUsuarioId] = useState(null)

  useEffect(() => {
    let uid = id 

    if (!uid) {
      const userData = localStorage.getItem('user')
      if (!userData) return
      const usuario = JSON.parse(userData)
      uid = usuario?.id 
    }

    setUsuarioId(uid)
    if (!uid) return

    const obtenerEstadisticas = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/dataUser/usuario/${uid}/stats`
        )
        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error('Error al obtener estadísticas:', err)
      }
    }

    obtenerEstadisticas()
  }, [id])

  return (
    <div>
      <Status userId={usuarioId} />
      <div className="hr"></div>
      {stats ? (
        <div className="estadisticas-right">
          <Estadisticas stats={stats} />
        </div>
      ) : (
        <p className="cargando">Cargando estadísticas ...</p>
      )}
      <div className="hr"></div>
      <MisJuegos userId={usuarioId} />
      <div className="hr"></div>
      <MisLogros userId={usuarioId} />
    </div>
  )
}

export default Perfil
