import '../../styles/Noticia.css'
import { useState, useEffect } from 'react'

function Noticies() {
  const [noticias, setNoticias] = useState([])
  const [nueva, setNueva] = useState({ encabezado: '', texto: '', imagen: '' })

  // Obtener todas las noticias
  useEffect(() => {
    fetch('http://localhost:3000/api/noticias')
      .then((res) => res.json())
      .then((data) => setNoticias(data))
      .catch((err) => console.error(err))
  }, [])

  // Agregar una noticia
  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch('http://localhost:3000/api/noticias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nueva),
    })
    const data = await res.json()
    setNoticias([data, ...noticias]) 
    setNueva({ encabezado: '', texto: '', imagen: '' })
  }
  return (
    <section className="noticia-contenedor">
      <h2 className="noticia-titulo ">🕯 Noticias del Reino</h2>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="noticia-formulario">
        <input
          className="input-noticia"
          type="text"
          placeholder="Encabezado..."
          value={nueva.encabezado}
          onChange={(e) => setNueva({ ...nueva, encabezado: e.target.value })}
        />
        <textarea
          className="input-noticia"
          id="text-area-noticia"
          placeholder="Texto..."
          value={nueva.texto}
          onChange={(e) => setNueva({ ...nueva, texto: e.target.value })}
        />
        <input
          className="input-noticia"
          type="text"
          placeholder="URL de imagen (opcional)"
          value={nueva.imagen}
          onChange={(e) => setNueva({ ...nueva, imagen: e.target.value })}
        />
        <button className="btn-publicar-noticia">Publicar Noticia</button>
      </form>

      {/* Lista de noticias */}
      <div className="lista-noticias">
        {noticias.map((n) => (
          <article key={n._id} className="tarjeta-noticia">
            {n.imagen && (
              <img src={n.imagen} alt={n.imagen} className="noticia-imagen" />
            )}
            <h3 className="noticia-encabezado">{n.encabezado}</h3>
            <p className="noticia-texto-cuerpo">{n.texto}</p>
            <p className="noticia-fecha">
              📜 {new Date(n.fecha).toLocaleDateString()}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Noticies
