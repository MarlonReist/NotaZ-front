import api from './api'

function listarAvaliacoes() {
  return api.get('/avaliacoes')
}

function cadastrarAvaliacao(avaliacao) {
  return api.post('/avaliacoes', avaliacao)
}

function buscarAvaliacaoPorId(id) {
  return api.get(`/avaliacoes/${id}`)
}

function atualizarAvaliacao(id, avaliacao) {
  return api.put(`/avaliacoes/${id}`, avaliacao)
}

function deletarAvaliacao(id) {
  return api.delete(`/avaliacoes/${id}`)
}

export {
  listarAvaliacoes,
  cadastrarAvaliacao,
  buscarAvaliacaoPorId,
  atualizarAvaliacao,
  deletarAvaliacao,
}
