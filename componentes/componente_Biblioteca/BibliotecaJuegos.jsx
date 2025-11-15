import './../../styles/Biblioteca.css'
import { useEffect, useState } from 'react'
import AllJuegos from './AllJuegos'
import Loader from '../componente_General/Loading'
import tiempoCarga1 from './../../../assets/loadingGif/tiempoCarga1.gif'

function BibliotecaJuegos() {
  const [juegos, setJuegos] = useState([])
  const [loading, setLoading] = useState(true)
  

  useEffect(() => {
    setLoading(true)

    const timeout = setTimeout(() => {
      setLoading(true)
    }, 5000)

    fetch('http://localhost:3000/api/games')
      .then((res) => res.json())
      .then((data) => setJuegos(data), setLoading(false))
      .catch((err) => {
        console.error('Error al cargar juegos:', err)
      })
      .finally(() => clearTimeout(timeout))
  }, [])

  if (loading) return <Loader imagen={tiempoCarga1} />

  return (
    <div className="biblioteca">
      <header>
        <h1>Biblioteca de Juegos</h1>
        <p className="descripcion">Explora tu colección y guarda favoritos.</p>
      </header>
      <AllJuegos juegos={juegos} setJuegos={setJuegos} />
    </div>
  )
}

export default BibliotecaJuegos
