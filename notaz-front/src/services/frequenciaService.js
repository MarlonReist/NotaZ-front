import api from './api'

function listarFrequencias() {
  return api.get('/frequencias')
}

function listarFrequenciasPorAula(aulaId) {
  return api.get(`/frequencias/aula/${aulaId}`)
}

function cadastrarFrequencia(frequencia) {
  return api.post('/frequencias', frequencia)
}

function buscarFrequenciaPorId(id) {
  return api.get(`/frequencias/${id}`)
}

function atualizarFrequencia(id, frequencia) {
  return api.put(`/frequencias/${id}`, frequencia)
}

function deletarFrequencia(id) {
  return api.delete(`/frequencias/${id}`)
}

function calcularResumoFrequencia(alunoId, disciplinaId) {
  return api.get(`/frequencias/resumo/aluno/${alunoId}/disciplina/${disciplinaId}`)
}

export {
  listarFrequencias,
  listarFrequenciasPorAula,
  cadastrarFrequencia,
  buscarFrequenciaPorId,
  atualizarFrequencia,
  deletarFrequencia,
  calcularResumoFrequencia,
}
