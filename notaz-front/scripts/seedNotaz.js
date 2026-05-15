const API_URL = process.env.VITE_BASE_URL || 'http://localhost:8080'

const cursos = ['SISTEMAS', 'ADMINISTRACAO', 'BIOMEDICINA']
const periodos = [
  'PRIMEIRO',
  'SEGUNDO',
  'TERCEIRO',
  'QUARTO',
  'QUINTO',
  'SEXTO',
  'SETIMO',
  'OITAVO',
]

const disciplinasPorCurso = {
  SISTEMAS: [
    'Logica de Programacao',
    'Banco de Dados',
    'Desenvolvimento Web',
    'Engenharia de Software',
    'Redes de Computadores',
    'Estrutura de Dados',
    'Sistemas Operacionais',
    'Projeto Integrador',
  ],
  ADMINISTRACAO: [
    'Teoria da Administracao',
    'Contabilidade Geral',
    'Gestao de Pessoas',
    'Marketing',
    'Financas',
    'Empreendedorismo',
    'Logistica',
    'Planejamento Estrategico',
  ],
  BIOMEDICINA: [
    'Biologia Celular',
    'Anatomia Humana',
    'Microbiologia',
    'Bioquimica',
    'Imunologia',
    'Parasitologia',
    'Analises Clinicas',
    'Projeto Biomedico',
  ],
}

const professoresBase = [
  { nome: 'Ana Ribeiro', email: 'ana.ribeiro@notaz.com', ra: 'PROF001' },
  { nome: 'Bruno Almeida', email: 'bruno.almeida@notaz.com', ra: 'PROF002' },
  { nome: 'Carla Mendes', email: 'carla.mendes@notaz.com', ra: 'PROF003' },
  { nome: 'Diego Santos', email: 'diego.santos@notaz.com', ra: 'PROF004' },
  { nome: 'Fernanda Costa', email: 'fernanda.costa@notaz.com', ra: 'PROF005' },
  { nome: 'Lucas Pereira', email: 'lucas.pereira@notaz.com', ra: 'PROF006' },
]

const nomesAlunos = [
  'Arthur Lima',
  'Beatriz Souza',
  'Caio Martins',
  'Daniela Rocha',
  'Eduardo Silva',
  'Fabiana Gomes',
  'Gabriel Oliveira',
  'Helena Costa',
  'Igor Ferreira',
  'Julia Almeida',
  'Karen Ribeiro',
  'Leonardo Santos',
  'Mariana Pereira',
  'Nicolas Barbosa',
  'Olivia Mendes',
  'Pedro Carvalho',
  'Rafaela Cardoso',
  'Samuel Nunes',
  'Tatiane Freitas',
  'Vinicius Araujo',
]

const senhaPadrao = 'Senha123'

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`${options.method || 'GET'} ${path} -> ${response.status} ${text}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

function post(path, body) {
  return request(path, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

async function carregarBase() {
  const [usuarios, turmas, professores, disciplinas, alunos, aulas, avaliacoes] =
    await Promise.all([
      request('/usuarios'),
      request('/turmas'),
      request('/professores'),
      request('/disciplinas'),
      request('/alunos'),
      request('/aulas'),
      request('/avaliacoes'),
    ])

  return { usuarios, turmas, professores, disciplinas, alunos, aulas, avaliacoes }
}

async function garantirUsuario(base, usuario) {
  const encontrado = base.usuarios.find((item) => item.email === usuario.email)

  if (encontrado) {
    return encontrado
  }

  const criado = await post('/usuarios', usuario)
  base.usuarios.push(criado)
  console.log(`usuario criado: ${criado.nome}`)
  return criado
}

async function garantirTurma(base, curso, periodo) {
  const encontrada = base.turmas.find(
    (turma) => turma.curso === curso && turma.periodo === periodo,
  )

  if (encontrada) {
    return encontrada
  }

  const criada = await post('/turmas', { curso, periodo })
  base.turmas.push(criada)
  console.log(`turma criada: ${curso} ${periodo}`)
  return criada
}

async function garantirProfessor(base, dadosProfessor) {
  const usuario = await garantirUsuario(base, {
    nome: dadosProfessor.nome,
    email: dadosProfessor.email,
    senha: senhaPadrao,
    tipo: 'PROFESSOR',
  })

  const encontrado = base.professores.find(
    (professor) => professor.usuarioId === usuario.id || professor.ra === dadosProfessor.ra,
  )

  if (encontrado) {
    return encontrado
  }

  const criado = await post('/professores', {
    ra: dadosProfessor.ra,
    usuarioId: usuario.id,
  })
  base.professores.push(criado)
  console.log(`professor criado: ${dadosProfessor.nome}`)
  return criado
}

async function garantirDisciplina(base, nome, professorId) {
  const encontrada = base.disciplinas.find(
    (disciplina) =>
      disciplina.nome === nome && String(disciplina.professorId) === String(professorId),
  )

  if (encontrada) {
    return encontrada
  }

  const criada = await post('/disciplinas', { nome, professorId })
  base.disciplinas.push(criada)
  console.log(`disciplina criada: ${nome}`)
  return criada
}

async function garantirAluno(base, dadosAluno) {
  const usuario = await garantirUsuario(base, {
    nome: dadosAluno.nome,
    email: dadosAluno.email,
    senha: senhaPadrao,
    tipo: 'ALUNO',
  })

  const encontrado = base.alunos.find(
    (aluno) => aluno.usuarioId === usuario.id || aluno.matricula === dadosAluno.matricula,
  )

  if (encontrado) {
    return encontrado
  }

  const criado = await post('/alunos', {
    matricula: dadosAluno.matricula,
    dataNascimento: dadosAluno.dataNascimento,
    usuarioId: usuario.id,
    turmaId: dadosAluno.turmaId,
  })
  base.alunos.push(criado)
  console.log(`aluno criado: ${dadosAluno.nome}`)
  return criado
}

async function garantirAula(base, aula) {
  const encontrada = base.aulas.find(
    (item) =>
      String(item.turmaId) === String(aula.turmaId) &&
      String(item.disciplinaId) === String(aula.disciplinaId) &&
      item.data === aula.data,
  )

  if (encontrada) {
    return encontrada
  }

  const criada = await post('/aulas', aula)
  base.aulas.push(criada)
  console.log(`aula criada: ${aula.data}`)
  return criada
}

async function garantirAvaliacao(base, avaliacao) {
  const encontrada = base.avaliacoes.find(
    (item) =>
      String(item.disciplinaId) === String(avaliacao.disciplinaId) &&
      item.nome === avaliacao.nome &&
      item.data === avaliacao.data,
  )

  if (encontrada) {
    return encontrada
  }

  const criada = await post('/avaliacoes', avaliacao)
  base.avaliacoes.push(criada)
  console.log(`avaliacao criada: ${avaliacao.nome}`)
  return criada
}

function dataAula(indicePeriodo, indiceDisciplina, semana) {
  const dia = String(2 + indicePeriodo * 3 + indiceDisciplina + semana * 7).padStart(2, '0')
  return `2026-03-${dia}`
}

function dataNascimento(indiceCurso, indiceAluno) {
  const mes = String((indiceAluno % 12) + 1).padStart(2, '0')
  const dia = String((indiceAluno % 27) + 1).padStart(2, '0')
  return `${2000 + indiceCurso}-${mes}-${dia}`
}

async function executarSeed() {
  console.log(`usando API: ${API_URL}`)
  const base = await carregarBase()

  const professores = []

  for (const dadosProfessor of professoresBase) {
    const professor = await garantirProfessor(base, dadosProfessor)
    professores.push(professor)
  }

  const turmasPorCursoPeriodo = new Map()

  for (const curso of cursos) {
    for (const periodo of periodos) {
      const turma = await garantirTurma(base, curso, periodo)
      turmasPorCursoPeriodo.set(`${curso}-${periodo}`, turma)
    }
  }

  const disciplinasPorCursoPeriodo = new Map()

  for (const [indiceCurso, curso] of cursos.entries()) {
    for (const [indicePeriodo, periodo] of periodos.entries()) {
      const professorA = professores[(indiceCurso * 2) % professores.length]
      const professorB = professores[(indiceCurso * 2 + 1) % professores.length]
      const nomes = disciplinasPorCurso[curso]
      const nomeA = `${curso} ${periodo} - ${nomes[indicePeriodo]}`
      const nomeB = `${curso} ${periodo} - Projeto Aplicado`

      const disciplinaA = await garantirDisciplina(base, nomeA, professorA.id)
      const disciplinaB = await garantirDisciplina(base, nomeB, professorB.id)

      disciplinasPorCursoPeriodo.set(`${curso}-${periodo}`, [disciplinaA, disciplinaB])
    }
  }

  for (const [indiceCurso, curso] of cursos.entries()) {
    for (let indiceAluno = 0; indiceAluno < 20; indiceAluno += 1) {
      const nomeBase = nomesAlunos[indiceAluno]
      const periodo = periodos[indiceAluno % periodos.length]
      const turma = turmasPorCursoPeriodo.get(`${curso}-${periodo}`)
      const sufixo = curso.toLowerCase()
      const numero = String(indiceAluno + 1).padStart(2, '0')

      await garantirAluno(base, {
        nome: `${nomeBase} ${curso}`,
        email: `${sufixo}.aluno${numero}@notaz.com`,
        matricula: `${curso.substring(0, 3)}2026${numero}`,
        dataNascimento: dataNascimento(indiceCurso, indiceAluno),
        turmaId: turma.id,
      })
    }
  }

  for (const [indiceCurso, curso] of cursos.entries()) {
    for (const [indicePeriodo, periodo] of periodos.entries()) {
      const turma = turmasPorCursoPeriodo.get(`${curso}-${periodo}`)
      const disciplinas = disciplinasPorCursoPeriodo.get(`${curso}-${periodo}`)

      for (const [indiceDisciplina, disciplina] of disciplinas.entries()) {
        await garantirAula(base, {
          data: dataAula(indicePeriodo, indiceDisciplina, 0),
          quantidadeAulas: 4,
          disciplinaId: disciplina.id,
          turmaId: turma.id,
        })

        await garantirAula(base, {
          data: dataAula(indicePeriodo, indiceDisciplina, 1),
          quantidadeAulas: 2,
          disciplinaId: disciplina.id,
          turmaId: turma.id,
        })

        await garantirAvaliacao(base, {
          nome: 'Prova 1',
          peso: 7,
          data: `2026-04-${String(5 + indicePeriodo).padStart(2, '0')}`,
          disciplinaId: disciplina.id,
        })

        await garantirAvaliacao(base, {
          nome: 'Trabalho',
          peso: 3,
          data: `2026-04-${String(15 + indicePeriodo).padStart(2, '0')}`,
          disciplinaId: disciplina.id,
        })
      }
    }
  }

  console.log('seed finalizado com sucesso.')
  console.log('resumo:')
  console.log(`- usuarios: ${base.usuarios.length}`)
  console.log(`- professores: ${base.professores.length}`)
  console.log(`- turmas: ${base.turmas.length}`)
  console.log(`- disciplinas: ${base.disciplinas.length}`)
  console.log(`- alunos: ${base.alunos.length}`)
  console.log(`- aulas: ${base.aulas.length}`)
  console.log(`- avaliacoes: ${base.avaliacoes.length}`)
}

executarSeed().catch((error) => {
  console.error('erro ao executar seed:')
  console.error(error.message)
  process.exit(1)
})
