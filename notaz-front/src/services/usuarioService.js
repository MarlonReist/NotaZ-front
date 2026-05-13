import api from './api'

function listarUsuarios() {
  return api.get('/usuarios')
}

function cadastrarUsuario(usuario) {
  return api.post('/usuarios', usuario)
}

function buscarUsuarioPorId(id) {
  return api.get(`/usuarios/${id}`)
}

function atualizarUsuario(id, usuario) {
  return api.put(`/usuarios/${id}`, usuario)
}

function deletarUsuario(id) {
  return api.delete(`/usuarios/${id}`)
}

function ativarUsuario(id) {
  return api.put(`/usuarios/${id}/ativar`)
}

function desativarUsuario(id) {
  return api.put(`/usuarios/${id}/desativar`)
}

export {
  listarUsuarios,
  cadastrarUsuario,
  buscarUsuarioPorId,
  atualizarUsuario,
  deletarUsuario,
  ativarUsuario,
  desativarUsuario,
}
