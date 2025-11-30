import { useState, useEffect } from 'react'

function Respuesta({ reseña, onClose, onSubmit }) {
  const [texto, setTexto] = useState('')

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleSubmit = () => {
    if (texto.trim() === '') return alert('La respuesta no puede estar vacía.')
    onSubmit(reseña._id, texto)
    setTexto('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const nombreAutor = reseña.nombreUsuario || 'el autor'
  const nombreJuego =
    reseña.juegoId?.titulo || reseña.titulo || 'la publicación'

  return (
    <div className="respuesta-modal-overlay">
      <div className="respuesta-modal-content">
        <h2>
          Responder a {nombreAutor} sobre {nombreJuego}
        </h2>

        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Escribe tu respuesta (Enter para enviar)"
        />

        <div className="respuesta-modal-acciones">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleSubmit}>Enviar</button>
        </div>
      </div>
    </div>
  )
}

export default Respuesta
