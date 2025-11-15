import './../../styles/CarruselSecun.css'
import { useEffect, useState } from 'react'
import SliderCategoria from './Categoria'

function SlidersContainer() {
  const [juegos, setJuegos] = useState([])

  useEffect(() => {
    fetch('http://localhost:3000/api/games')
      .then((res) => res.json())
      .then((data) => setJuegos(data))
      .catch((err) => console.error('Error al cargar juegos:', err))
  }, [])

  //Forma de busqueda de genero
  const juegosAventura = juegos.filter((j) =>
    j.genero.toLowerCase().includes('aventura')
  )
  const juegosAccion = juegos.filter((j) =>
    j.genero.toLowerCase().includes('acción')
  )

  //Forma de busqueda de clasificacion por edad
  const juegosTodoPublico = juegos.filter(
    (j) => j.clasificacionEdad === 'E' || j.clasificacionEdad === 'E10+'
  )
  const juegosT = juegos.filter(
    (j) => j.clasificacionEdad === 'T' || j.clasificacionEdad === '+18'
  )

  //Forma de busqueda por año
  const juegos2000 = juegos.filter(
    (j) => j.anioLanzamiento >= 2000 && j.anioLanzamiento <= 2010
  )

  //Forma de busqueda por dispositivo
  const juegosMovil = juegos.filter(
    (j) =>
      j.plataforma &&
      (j.plataforma.toLowerCase().includes('móvil') ||
        j.plataforma.toLowerCase().includes('android') ||
        j.plataforma.toLowerCase().includes('ios'))
  )
  const juegosPC = juegos.filter((j) =>
    j.plataforma.toLowerCase().includes('pc')
  )

  return (
    <div className="sliders-container">
      <SliderCategoria titulo="Juegos de Aventura" juegos={juegosAventura} />
      <SliderCategoria titulo="Juegos de Acción" juegos={juegosAccion} />
      <SliderCategoria titulo="Juegos para Todos" juegos={juegosT} />
      <SliderCategoria titulo="Los mejores juegos del 2000"  juegos={juegos2000}/>
      <SliderCategoria titulo="Los mejores juegos moviles"juegos={juegosMovil}/>
      <SliderCategoria titulo="Juegos de PC" juegos={juegosPC} />
      <SliderCategoria titulo="Todo Público" juegos={juegosTodoPublico} />
    </div>
  )
}

export default SlidersContainer
