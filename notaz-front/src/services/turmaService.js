import api from './api'

function listarTurmas() {
  return api.get('/turmas')
}

function cadastrarTurma(turma) {
  return api.post('/turmas', turma)
}

function buscarTurmaPorId(id) {
  return api.get(`/turmas/${id}`)
}

function atualizarTurma(id, turma) {
  return api.put(`/turmas/${id}`, turma)
}

function deletarTurma(id) {
  return api.delete(`/turmas/${id}`)
}

export {
  listarTurmas,
  cadastrarTurma,
  buscarTurmaPorId,
  atualizarTurma,
  deletarTurma,
}
