import '../../styles/LogrosM.css'
import { useEffect } from 'react'

function LogrosM({ visible, logro, onClose }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => onClose(), 1000) // desaparece tras 5s
      return () => clearTimeout(timer)
    }
  }, [visible, onClose])

  if (!visible) return null

  return (
    <div className="logro-overlay">
      <div className="logro-modal">
        <div className="sparkle"></div>
        <div className="sparkle delay"></div>
        <div className="sparkle small"></div>
        <h2 className="titulo-logro">¡Logro Desbloqueado!</h2>
        <p className="nombre-logro">{logro}</p>
      </div>
    </div>
  )
}
export default LogrosM