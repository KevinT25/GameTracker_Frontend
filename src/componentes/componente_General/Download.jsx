import { useLocation } from 'react-router-dom'

function Download() {
  const location = useLocation()
  const { iframeUrl } = location.state || {}
  console.log(iframeUrl)
  return (
    <iframe
      src={iframeUrl}
      style={{
        width: '90vw',
        height: '85vh',
        margin: 'auto',
        padding: '0',
        border: 'none',
        overflow: 'hidden',
        display: 'block',
      }}
      allowFullScreen
      frameborder="0"
    />
  )
}

export default Download
