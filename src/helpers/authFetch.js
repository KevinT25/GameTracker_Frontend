export async function authFetch(url, options = {}) {
  const token = localStorage.getItem('token')

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  }

  const res = await fetch(url, {
    ...options,
    headers,
  })

  return res
}
