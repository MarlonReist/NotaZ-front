import api from './api'

function listarDisciplinas() {
  return api.get('/disciplinas')
}

function cadastrarDisciplina(disciplina) {
  return api.post('/disciplinas', disciplina)
}

function buscarDisciplinaPorId(id) {
  return api.get(`/disciplinas/${id}`)
}

function atualizarDisciplina(id, disciplina) {
  return api.put(`/disciplinas/${id}`, disciplina)
}

function deletarDisciplina(id) {
  return api.delete(`/disciplinas/${id}`)
}

export {
  listarDisciplinas,
  cadastrarDisciplina,
  buscarDisciplinaPorId,
  atualizarDisciplina,
  deletarDisciplina,
}
