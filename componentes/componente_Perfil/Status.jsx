import '../../styles/Perfil.css'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import iconConfiguracion from './../../../assets/Icons/iconConfiguracion.png'
import perfilKnight from './../../../assets/perfilPlayer/perfilKnight.jpg'
import perfilDwarf from './../../../assets/perfilPlayer/perfilDwarf.png'
import perfilDragonMan from './../../../assets/perfilPlayer/perfilDragonMan.png'
import perfilCatGirl from './../../../assets/perfilPlayer/perfilCatGirl.png'
import perfilBearMan from './../../../assets/perfilPlayer/perfilBearMan.png'
import perfilElf from './../../../assets/perfilPlayer/perfilElf.png'
import perfilDarkelf from './../../../assets/perfilPlayer/perfilDarkElf.png'
import perfilFairy from './../../../assets/perfilPlayer/perfilFairy.png'
import perfilBarbarian from './../../../assets/perfilPlayer/perfilBarbarian.png'
import perfilWizard from './../../../assets/perfilPlayer/perfilWizard.png'
import perfilBard from './../../../assets/perfilPlayer/perfilBard.png'
import perfilSaint from './../../../assets/perfilPlayer/perfilSaint.png'
import perfilAssesing from './../../../assets/perfilPlayer/perfilAssesing.png'
import perfilNecromance from './../../../assets/perfilPlayer/perfilNecromance.png'
import perfilLancer from './../../../assets/perfilPlayer/perfilLancer.png'
import perfilCultist from './../../../assets/perfilPlayer/perfilCultist.png'
import perfilMerchant from './../../../assets/perfilPlayer/perfilMerchant.png'
import perfilHomunculus from './../../../assets/perfilPlayer/perfilHomunculus.png'
import Login from './../componente_General/Login'

function Status() {
  const [user, setUser] = useState(null)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [openDetail, setOpenDetail] = useState(null)
  const [opcion, setOpcion] = useState('')
  const [lvl, setLvl] = useState(0)
  const [logros, setLogros] = useState([])
  const [miLogro, setMiLogro] = useState('')
  const navigate = useNavigate()

  // Verifica usuario al cargar
  useEffect(() => {
    const userData = localStorage.getItem('user')

    if (!userData) {
      setIsLoginOpen(true)
      setLoading(false)
      return
    }
    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    } catch (err) {
      console.error('Error parseando user desde localStorage:', err)
      setIsLoginOpen(true)
      setLoading(false)
    }
  }, [])

  // Cargar datos del backend
  useEffect(() => {
    if (!user) return

    const uid = user.id || user._id

    const fetchData = async () => {
      try {
        setLoading(true)

        const urls = {
          stats: `http://localhost:3000/api/dataUser/usuario/${uid}/stats`,
          logros: `http://localhost:3000/api/usuario/${uid}/miLogro`,
          dataUser: `http://localhost:3000/api/dataUser/usuario/${uid}`,
        }

        const [statsRes, logrosRes, dataUserRes] = await Promise.all([
          fetch(urls.stats),
          fetch(urls.logros),
          fetch(urls.dataUser),
        ])

        // Stats
        if (statsRes.ok) {
          const stats = await statsRes.json()

          const nivel = Number(stats.level) || 0

          setLvl(Math.min(nivel, 80))
        } else {
          console.error('Error stats:', await statsRes.text())
        }

        // Logros
        if (logrosRes.ok) {
          const logrosData = await logrosRes.json()

          // Si ya vienen como strings, los usamos directamente
          if (Array.isArray(logrosData)) {
            const soloNombres = logrosData.map(
              (l) => (typeof l === 'string' ? l : l.nombre) // si es objeto, toma nombre
            )
            setLogros(soloNombres)
          }
        } else {
          console.error('Error logros:', await logrosRes.text())
        }

        // Mi Logro
        if (dataUserRes.ok) {
          const dataUser = await dataUserRes.json()

          if (Array.isArray(dataUser) && dataUser.length > 0) {
            if (dataUser[0].miLogro) {
              setMiLogro(dataUser[0].miLogro)
            }
          }
        } else {
          console.error('Error dataUser:', await dataUserRes.text())
        }
      } catch (err) {
        console.error('Error cargando datos del perfil:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Guarda logro
  const seleccionarLogro = async (logro) => {
    try {
      const uid = user?.id || user?._id

      const url = `http://localhost:3000/api/usuario/${uid}/miLogro`

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ miLogro: logro }),
      })

      const responseText = await response.text()

      if (!response.ok) {
        console.error('Error en PUT miLogro:', responseText)
        return
      }

      setMiLogro(logro)
    } catch (error) {
      console.error('Error al seleccionar logro:', error)
    }
  }

  // Guardar género
  const guardarGenero = async (nuevoGenero) => {
    try {
      const uid = user?.id || user?._id

      const url = `http://localhost:3000/api/dataUser/usuario/${uid}/genero`

      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genero: nuevoGenero }),
      })

      if (!response.ok) throw new Error(await response.text())

      setOpcion(nuevoGenero)
    } catch (err) {
      console.error('Error al guardar el género:', err)
    }
  }

  const mostrarImagen = () => {
    const opciones = {
      'Caballero del Alba': perfilKnight,
      'Dwarf de Hierro': perfilDwarf,
      'DragonMan del Fuego Eterno': perfilDragonMan,
      'Nekomimi de Sombras Suaves': perfilCatGirl,
      'BearMan del Norte': perfilBearMan,
      'Elfo del gran Bosque': perfilElf,
      'Dark Elf los repudiados por el bosque': perfilDarkelf,
      'Fairy de Luz Pura': perfilFairy,
      'Barbarian del Rugido Antiguo': perfilBarbarian,
      'Wizard del Ojo Arcano': perfilWizard,
      'Bardo de las Mil Canciones': perfilBard,
      'Santa del Sol Blanco': perfilSaint,
      'Asesino del Silencio': perfilAssesing,
      'Necromante de la Tumba': perfilNecromance,
      'Lancero imperial': perfilLancer,
      'Cultista, seguidor heretico': perfilCultist,
      'Mercader del Oro Viejo': perfilMerchant,
      'Homúnculo, la aberracion del mundo': perfilHomunculus,
    }
    return opciones[opcion] || perfilKnight
  }

  const rango = () => {
    if (lvl < 10) return 'Aspirante'
    if (lvl < 20) return 'Aprendiz'
    if (lvl < 30) return 'Aventurero'
    if (lvl < 40) return 'Guerrero Veterano'
    if (lvl < 50) return 'Caballero Élite'
    if (lvl < 60) return 'Maestro de Armas'
    if (lvl < 70) return 'Héroe de la Corona'
    if (lvl < 80) return 'Campeón del Reino'
    return 'Leyenda Eterna'
  }

  // Mostrar login si no hay usuario
  if (!user) {
    return (
      <Login
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false)
          const userData = localStorage.getItem('user')
          if (userData) setUser(JSON.parse(userData))
          else navigate('/')
        }}
      />
    )
  }

  // Mostrar loading o error
  if (loading) {
    return <div className="perfil-loading">Cargando tu perfil...</div>
  }

  // Render principal
  return (
    <>
      <div className="title">
        <span></span> <h1>STATUS</h1>
        <button
          className="btn-logout"
          onClick={() => navigate('/Confi')}
          data-tooltip="Configuracion"
        >
          <img
            src={iconConfiguracion}
            alt="configuración"
            className="iconConfi"
          />
        </button>
      </div>

      <div className="status">
        <div className="atributes-iz">
          <img
            src={mostrarImagen()}
            alt="imagen del perfil"
            className="atributes"
            id="personaje"
          />
          <div className="level">
            Level: {lvl}
            <progress
              className="level-progress"
              max={80}
              value={lvl}
            ></progress>
          </div>
        </div>

        <div className="atributes-der">
          <h2 className="atribute">
            Bienvenido: <p>{user.nombre || 'Aventurero Anónimo'}</p>
          </h2>

          <details
            className="atribute"
            id="genero-Selection"
            open={openDetail === 'genero'}
          >
            <summary
              id="summary-genero"
              onClick={(e) => {
                e.preventDefault() // Evita que el details se abra automáticamente
                setOpenDetail(openDetail === 'genero' ? null : 'genero')
              }}
            >
              <h2>Género:</h2>
              <p>{opcion || 'Un Caballero novato'}</p>
            </summary>

            {[
              'Dwarf de Hierro',
              'DragonMan del Fuego Eterno',
              'Nekomimi de Sombras Suaves',
              'BearMan del Norte',
              'Elfo del gran Bosque',
              'Dark Elf los repudiados por el bosque',
              'Fairy de Luz Pura',
              'Barbarian del Rugido Antiguo',
              'Wizard del Ojo Arcano',
              'Bardo de las Mil Canciones',
              'Santa del Sol Blanco',
              'Asesino del Silencio',
              'Necromante de la Tumba',
              'Lancero imperial',
              'Cultista, seguidor heretico',
              'Mercader del Oro Viejo',
              'Homúnculo, la aberracion del mundo',
            ].map((genero) => (
              <button key={genero} onClick={() => guardarGenero(genero)}>
                {genero}
              </button>
            ))}
          </details>

          <details
            className="atribute"
            id="logro-Selection"
            open={openDetail === 'logro'}
          >
            <summary
              id="summary-logro"
              onClick={(e) => {
                e.preventDefault()
                setOpenDetail(openDetail === 'logro' ? null : 'logro')
              }}
            >
              <h2>Titulo:</h2>
              <p>{miLogro || 'Novato'}</p>
            </summary>

            {logros.length > 0 ? (
              logros.map((nombre) => (
                <div
                  key={nombre}
                  role="button"
                  className="item-logro activo"
                  onClick={() => seleccionarLogro(nombre)}
                >
                  <p>{nombre}</p>
                </div>
              ))
            ) : (
              <p>Ningún logro aun</p>
            )}
          </details>

          <h2 className="atribute">
            Rango: <p>{rango()}</p>
          </h2>
        </div>
      </div>
    </>
  )
}

export default Status
