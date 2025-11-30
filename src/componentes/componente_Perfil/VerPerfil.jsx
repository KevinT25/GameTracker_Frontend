import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { authFetch } from '../../helpers/authFetch'
import Status from './Status'
import Estadisticas from './Estadisticas'
import MisJuegos from './MisJuegos'
import MisLogros from './MisLogros'

function VerPerfil() {
  const { id } = useParams()
  const [stats, setStats] = useState(null)
  const [usuario, setUsuario] = useState(null)
  const API_URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    if (!id) return

    // --- Obtener Usuario ---
    const obtenerUsuario = async () => {
      try {
        const res = await authFetch(`${API_URL}/api/users/users/${id}`)
        if (!res.ok) throw new Error(await res.text())

        const data = await res.json()
        setUsuario(data)
      } catch (err) {
        console.error('Error cargando usuario:', err)
        setUsuario(null) // Evitar crash
      }
    }
    
    console.log('actualizado')
    // --- Obtener Stats ---
    const obtenerStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/dataUser/usuario/${id}/stats`)
        if (!res.ok) throw new Error(await res.text())

        const data = await res.json()
        setStats(data)
      } catch (err) {
        console.error('Error cargando stats:', err)
        setStats(null)
      }
    }

    obtenerUsuario()
    obtenerStats()
  }, [id])
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
