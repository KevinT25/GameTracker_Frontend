import { useState, useEffect } from 'react'

function Respuesta({ titulo, subtitulo, onClose, onSubmit }) {
  const [texto, setTexto] = useState('')

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = () => {
    if (!texto.trim()) {
      alert('La respuesta no puede estar vacía.')
      return
    }

    onSubmit(texto.trim())
    setTexto('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // const nombreAutor = reseña?.usuarioId?.nombre || 'el autor' 
  // const nombreJuego = reseña?.juegoId?.titulo || 'el juego'

  return (
    <div className="respuesta-modal-overlay">
      <div className="respuesta-modal-content">
        <h2>
          {titulo}
          {subtitulo && <span> {subtitulo}</span>}
        </h2>

        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Escribe tu respuesta..."
          className="respuesta-modal-textarea"
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
