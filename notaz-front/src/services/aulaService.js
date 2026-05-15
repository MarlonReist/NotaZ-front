import api from './api'

function listarAulas() {
  return api.get('/aulas')
}

function cadastrarAula(aula) {
  return api.post('/aulas', aula)
}

function buscarAulaPorId(id) {
  return api.get(`/aulas/${id}`)
}

function atualizarAula(id, aula) {
  return api.put(`/aulas/${id}`, aula)
}

function deletarAula(id) {
  return api.delete(`/aulas/${id}`)
}

export {
  listarAulas,
  cadastrarAula,
  buscarAulaPorId,
  atualizarAula,
  deletarAula,
}
