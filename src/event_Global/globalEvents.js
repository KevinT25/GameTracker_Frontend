// Emitir un evento global
export const emitirEvento = (nombre, datos = {}) => {
  window.dispatchEvent(new CustomEvent(nombre, { detail: datos }))
}

// Escuchar un evento global
export const escucharEvento = (nombre, callback) => {
  window.addEventListener(nombre, callback)
}

// Dejar de escuchar evento
export const dejarDeEscuchar = (nombre, callback) => {
  window.removeEventListener(nombre, callback)
}

// Eventos específicos que usarás

// Evento cuando el usuario inicia o cierra sesión
export const eventoAuth = {
  nombre: 'auth_cambiado',
  emitir: (estado) => emitirEvento('auth_cambiado', { logueado: estado }),
}

// Evento para actualizar el header cuando se elimina la cuenta o se cierra sesión
export const eventoActualizarHeader = {
  nombre: 'header_actualizar',
  emitir: () => emitirEvento('header_actualizar'),
}
