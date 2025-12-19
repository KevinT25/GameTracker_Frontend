import './../../styles/CardJuego.css'
import { useNavigate } from 'react-router-dom'
import { useGameState } from '../../Hooks/useGameState'

import iconNoWishlist from '../../assets/Icons/iconNoWishlist.png'
import iconWishlist from '../../assets/Icons/iconWishlist.png'
import iconMisJuegos from '../../assets/Icons/iconMisJuegos.png'
import iconEliminar from '../../assets/Icons/iconEliminar.png'

function CardJuego({ juego }) {
  const navigate = useNavigate()
  const { state, toggle } = useGameState(juego._id)

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

      {/* BOTONES */}
      <div className="acciones-card">
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggle('misjuegos')
          }}
          className={state.misjuegos ? 'activo' : ''}
        >
          <img
            src={state.misjuegos ? iconMisJuegos : iconEliminar}
            alt="Mis juegos"
          />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            toggle('wishlist')
          }}
          className={state.wishlist ? 'activo' : ''}
        >
          <img
            src={state.wishlist ? iconWishlist : iconNoWishlist}
            alt="Wishlist"
          />
        </button>
      </div>
    </div>
  )
}

export default CardJuego