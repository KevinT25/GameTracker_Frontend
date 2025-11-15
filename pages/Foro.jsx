import '../styles/Foro.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ListaResenias from '../componentes/componente_Foro/ListaResenias'
import iconPlus from '../../assets/Icons/iconPlus.png'

function Foro() {
  const [noticias, setNoticias] = useState([])
  const navigate = useNavigate()

  // Obtener todas las noticias
  useEffect(() => {
    fetch('http://localhost:3000/api/noticias')
      .then((res) => res.json())
      .then((data) => setNoticias(data))
      .catch((err) => console.error(err))
  }, [])

  const subirNoticie = () => {
    navigate('/Noticies')
  }

  return (
    <div className="foro">
      <ListaResenias />
      <section className="notice">
        <div className="header">
          <h2 className="titulo-noticia">🕯 Noticias del Reino</h2>
          <button onClick={subirNoticie} className="icon-plus">
            <img src={iconPlus} alt={iconPlus} />
          </button>
        </div>
        <div className="cuerpo-noticia">
          {noticias.map((n) => (
            <article key={n._id}>
              {n.imagen && <img src={n.imagen} alt={n.imagen} />}
              <h3 className="titulo-noticia">{n.encabezado}</h3>
              <p>{n.texto}</p>
              <p>{new Date(n.fecha).toLocaleDateString()}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Foro
