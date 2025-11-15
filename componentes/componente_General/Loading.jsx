function Loader({ imagen }) {
  return (
    <div>
      <img
        src={imagen}
        alt="Cargando..."
        style={{ width: '100vw', height: '90vh', alignItems: 'flex-start'}}
      />
    </div>
  )
}

export default Loader
