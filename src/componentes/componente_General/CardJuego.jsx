import './../../styles/CardJuego.css'
import { useNavigate } from 'react-router-dom'

function CardJuego({ juego }) {

    const navigate = useNavigate()

    const irInfo = () => {
      navigate(`/info/${juego._id}`)
    }
  return (
    <div className="card-juego" onClick={irInfo}>
      <div className="portada">
        <img
          className="slide-img"
          src={juego.imagenPortada}
          alt={juego.titulo}
        />
      </div>
      <div className="titulo">{juego.titulo}</div>
    </div>
  )
}

export default CardJuego
