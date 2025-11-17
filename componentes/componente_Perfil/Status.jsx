import '../../styles/Perfil.css'
import { useEffect, useState, useMemo } from 'react'
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
import iconAmigo from '../../../assets/Icons/iconAmigo.png'
import iconNoAmigo from '../../../assets/Icons/iconNoAmigo.png'

function Status({ userId }) {
  const userLocalMemo = useMemo(
    () => JSON.parse(localStorage.getItem('user')),
    []
  )
  const visitingId = userId || userLocalMemo?.id
  const esMiPerfil = useMemo(
    () => !userId || userId === userLocalMemo?.id,
    [userId, userLocalMemo]
  )

  const [user, setUser] = useState(null)
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  const [loading, setLoading] = useState(true)
  const [openDetail, setOpenDetail] = useState(null)
  const [opcion, setOpcion] = useState('')
  const [esAmigo, setEsAmigo] = useState(false)
  const [lvl, setLvl] = useState(0)
  const [logros, setLogros] = useState([])
  const [miLogro, setMiLogro] = useState('')

  const navigate = useNavigate()

  // --- Cargar datos del usuario del perfil ---
  useEffect(() => {
    if (!visitingId) {
      setIsLoginOpen(true)
      setLoading(false)
      return
    }

    if (esMiPerfil) {
      setUser(userLocalMemo)
    } else {
      const fetchUser = async () => {
        try {
          const res = await fetch(
            `http://localhost:3000/api/users/users/${visitingId}`
          )
          const data = await res.json()
          setUser(data)
        } catch (err) {
          console.error('Error cargando usuario visitado:', err)
        }
      }
      fetchUser()
    }
  }, [visitingId, esMiPerfil, userLocalMemo])

  // --- Cargar estadísticas, logros, etc ----
  useEffect(() => {
    if (!user) return

    const uid = visitingId

    const fetchData = async () => {
      try {
        setLoading(true)

        const statsRes = await fetch(
          `http://localhost:3000/api/dataUser/usuario/${uid}/stats`
        )
        const logrosRes = await fetch(
          `http://localhost:3000/api/usuario/${uid}/miLogro`
        )
        const dataUserRes = await fetch(
          `http://localhost:3000/api/dataUser/usuario/${uid}`
        )

        if (statsRes.ok) {
          const stats = await statsRes.json()
          const nivel = Number(stats.level) || 0
          setLvl(Math.min(nivel, 80))
        }

        if (logrosRes.ok) {
          const logrosData = await logrosRes.json()
          if (Array.isArray(logrosData)) {
            const soloNombres = logrosData.map((l) =>
              typeof l === 'string' ? l : l.nombre
            )
            setLogros(soloNombres)
          }
        }

        if (dataUserRes.ok) {
          const dataUser = await dataUserRes.json()
          if (Array.isArray(dataUser) && dataUser.length > 0) {
            if (dataUser[0].miLogro) setMiLogro(dataUser[0].miLogro)
          }
          if (dataUser[0]?.genero) setOpcion(dataUser[0].genero)
        }
      } catch (err) {
        console.error('Error cargando datos del perfil:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, visitingId])

  // --- Verificar si ya es amigo ---
  useEffect(() => {
    if (!user) return

    const storedUser = JSON.parse(localStorage.getItem('user'))
    const usuarioId = storedUser?._id || storedUser?.id
    const amigoId = user?._id || user?.id

    if (!usuarioId || !amigoId || usuarioId === amigoId) return

    const verificarAmistad = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/dataUser/usuario/${usuarioId}`
        )
        const data = await res.json()

        if (Array.isArray(data) && data[0]?.amigos) {
          const lista = data[0].amigos.map((a) => a._id || a)
          setEsAmigo(lista.includes(amigoId))
        }
      } catch (err) {
        console.error('Error verificando amistad', err)
      }
    }

    verificarAmistad()
  }, [user])

  // --- Agregar amigo ---
  async function agregarAmigo(usuarioId, amigoId) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/dataUser/usuario/${usuarioId}/anadir-amigo/${amigoId}`,
        { method: 'POST' }
      )

      const data = await response.json()

      if (response.ok) {
        alert(`Amigo agregado: total amigos ${data.cantidadamigos}`)
        return data.amigos
      } else {
        alert(`Error: ${data.message}`)
      }
    } catch (error) {
      alert(`Error: ${error.message}`)
    }
  }

  const Amigo = (amigoId) => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      alert('Debes iniciar sesión para agregar amigos.')
      return
    }

    const usuario = JSON.parse(storedUser)
    const usuarioId = usuario._id || usuario.id

    if (!amigoId) {
      alert('No se pudo identificar al usuario a agregar.')
      return
    }

    agregarAmigo(usuarioId, amigoId)
    setEsAmigo(true)
  }

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

  if (loading) return <div className="perfil-loading">Cargando perfil...</div>

  return (
    <>
      <div className="title">
        <span></span>
        <h1>{esMiPerfil ? 'STATUS' : `Perfil de ${user?.nombre}`}</h1>

        {esMiPerfil ? (
          <button
            className="btn-logout"
            onClick={() => navigate('/Confi')}
            data-tooltip="Configuración"
          >
            <img
              src={iconConfiguracion}
              alt="configuración"
              className="iconConfi"
            />
          </button>
        ) : (
          <button
            className="btn-logout"
            onClick={() => {
              if (!esAmigo) {
                Amigo(user?._id || user?.id)
              }
            }}
            data-tooltip={esAmigo ? 'Ya son amigos' : 'Agregar amigo'}
            disabled={esAmigo}
          >
            <img
              src={esAmigo ? iconAmigo : iconNoAmigo}
              alt={esAmigo ? 'Ya son amigos' : 'Agregar amigo'}
              className="icon-amigo"
            />
          </button>
        )}
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
            {esMiPerfil ? 'Bienvenido:' : 'Jugador:'}
            <p>{user?.nombre || 'Aventurero Anónimo'}</p>
          </h2>

          {/* SOLO EDITABLE SI ES MI PERFIL */}
          <details
            className="atribute"
            id="genero-Selection"
            open={openDetail === 'genero'}
            disabled={!esMiPerfil}
          >
            <summary
              id="summary-genero"
              onClick={(e) => {
                if (!esMiPerfil) return
                e.preventDefault()
                setOpenDetail(openDetail === 'genero' ? null : 'genero')
              }}
            >
              <h2>Género:</h2>
              <p>{opcion || 'Un Caballero novato'}</p>
            </summary>

            {esMiPerfil &&
              [
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
                if (!esMiPerfil) return
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
                  className={`item-logro ${esMiPerfil ? 'activo' : ''}`}
                  onClick={() => esMiPerfil && seleccionarLogro(nombre)}
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
