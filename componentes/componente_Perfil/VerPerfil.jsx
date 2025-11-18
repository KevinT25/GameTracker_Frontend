import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Status from './Status'
import Estadisticas from './Estadisticas'
import MisJuegos from './MisJuegos'
import MisLogros from './MisLogros'

function VerPerfil() {
  const { id } = useParams()
  const [stats, setStats] = useState(null)
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    if (!id) return

    // Obtener datos del usuario visitado
    const obtenerUsuario = async () => {
      const API_URL = import.meta.env.VITE_API_URL
      const res = await fetch(`${API_URL}/api/users/users/${id}`)
      const data = await res.json()
      setUsuario(data)
    }

    // Obtener estadisticas del usuario visitado
    const obtenerStats = async () => {
      const API_URL = import.meta.env.VITE_API_URL
      const res = await fetch(`${API_URL}/api/dataUser/usuario/${id}/stats`)
      const data = await res.json()
      setStats(data)
    }

    obtenerUsuario()
    obtenerStats()
  }, [id])

  if (!usuario) return <p className="cargando">Cargando perfil...</p>

  return (
    <div>
        <Status userId={id} />
      <div className="hr"></div>
        {stats ? (
        <div className="estadisticas-right">
          <Estadisticas stats={stats} />
        </div>
        ) : (
          <p className="cargando">Cargando estadísticas...</p>
        )}
      <div className="hr"></div>
        <MisJuegos userId={id} />
      <div className="hr"></div>
        <MisLogros userId={id} />
    </div>
  )
}

export default VerPerfil
