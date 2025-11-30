import './App.css'
import { Routes, Route } from 'react-router-dom'
import Headers from './componentes/componente_General/Header'
import Footer from './componentes/componente_General/Footer'
import Login from './componentes/componente_General/Login'
import Info from './componentes/componente_General/Info'
import Confi from './componentes/componente_Perfil/Confi'
import Noticies from './componentes/componente_Foro/Noticie'
import Comunidad from './componentes/componente_Foro/Comunidad'
import VerPerfil from './componentes/componente_Perfil/VerPerfil'
import Ranking from './componentes/componente_General/Ranking'
import Download from './componentes/componente_General/Download'
import Home from './pages/Home'
import Perfil from './pages/Perfil'
import Biblioteca from './pages/Biblioteca'
import Foro from './pages/Foro'

function App() {
  return (
    <>
      <Headers />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/perfil/:id" element={<VerPerfil />} />
        <Route path="/Confi" element={<Confi />} />
        <Route path="/info/:id" element={<Info />} />
        <Route path="/Download" element={<Download />} />
        <Route path="/foro" element={<Foro />} />
        <Route path="/comunidad/tipo=:tipo" element={<Comunidad />} />
        <Route path="/Noticies" element={<Noticies />} />
        <Route path="/Ranking" element={<Ranking />} />
        <Route path="/biblioteca" element={<Biblioteca />} />
        <Route path="/Login" element={<Login />} />
      </Routes>
      <Footer />
    </>
  )
}
export default App
