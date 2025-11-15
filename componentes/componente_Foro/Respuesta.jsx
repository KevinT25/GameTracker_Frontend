import { useState } from 'react'

function Respuesta({ reseña, onClose, onSubmit }) {
  const [texto, setTexto] = useState('')

  const handleSubmit = () => {
    if (texto.trim() === '') {
      alert('La respuesta no puede estar vacía.')
      return
    }
    onSubmit(reseña._id, texto)
  }

  return (
    <div className="respuesta-modal-overlay">
      <div className="respuesta-modal-content">
        <h2 className="respuesta">
          Responder a {reseña.nombreUsuario || 'la reseña'} del juego {reseña.juegoId?.titulo || 'la reseña'}
        </h2>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe tu respuesta..."
          className="respuesta-modal-textarea"
        />
        <div className="respuesta-modal-acciones">
          <button onClick={onClose} className="btn-cancelar">
            Cancelar
          </button>
          <button onClick={handleSubmit} className="btn-enviar">
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}

export default Respuesta
