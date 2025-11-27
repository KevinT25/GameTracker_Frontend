import { useLocation } from 'react-router-dom'

function Download() {
  const location = useLocation()
  const { iframeUrl } = location.state || {}
  console.log(iframeUrl)
  return (
    <iframe
      src={iframeUrl}
      style={{ width: '90vw', height: '85vh', border: 'none' }}
      allowFullScreen="true"
      frameborder="0"
      scrolling="no"
    />
  )
}

export default Download
