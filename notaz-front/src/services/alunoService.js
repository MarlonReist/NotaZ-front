import api from './api'

function listarAlunos() {
  return api.get('/alunos')
}

function cadastrarAluno(aluno) {
  return api.post('/alunos', aluno)
}

function buscarAlunoPorId(id) {
  return api.get(`/alunos/${id}`)
}

function atualizarAluno(id, aluno) {
  return api.put(`/alunos/${id}`, aluno)
}

function deletarAluno(id) {
  return api.delete(`/alunos/${id}`)
}

export {
  listarAlunos,
  cadastrarAluno,
  buscarAlunoPorId,
  atualizarAluno,
  deletarAluno,
}
