import api from './api'

function listarProfessores() {
  return api.get('/professores')
}

function cadastrarProfessor(professor) {
  return api.post('/professores', professor)
}

function buscarProfessorPorId(id) {
  return api.get(`/professores/${id}`)
}

function atualizarProfessor(id, professor) {
  return api.put(`/professores/${id}`, professor)
}

function deletarProfessor(id) {
  return api.delete(`/professores/${id}`)
}

export {
  listarProfessores,
  cadastrarProfessor,
  buscarProfessorPorId,
  atualizarProfessor,
  deletarProfessor,
}
