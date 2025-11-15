import './../styles/Biblioteca.css'
import BibliotecaJuegos from '../componentes/componente_Biblioteca/BibliotecaJuegos'

function Biblioteca() {
  
  return (
    <>
      <div className="biblioteca">
        <div className="grid-juegos"></div>
        <BibliotecaJuegos />
      </div>
    </>
  )
}

export default Biblioteca
