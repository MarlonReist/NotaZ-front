import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, ClipboardCheck, RotateCcw, Save } from 'lucide-react'
import { listarAlunos } from '../../services/alunoService'
import { listarAulas } from '../../services/aulaService'
import {
  atualizarFrequencia,
  cadastrarFrequencia,
  listarFrequenciasPorAula,
} from '../../services/frequenciaService'
import { listarUsuarios } from '../../services/usuarioService'
import './Frequencia.css'

const ordemPeriodos = [
  'PRIMEIRO',
  'SEGUNDO',
  'TERCEIRO',
  'QUARTO',
  'QUINTO',
  'SEXTO',
  'SETIMO',
  'OITAVO',
]

function formatarData(data) {
  if (!data) {
    return '-'
  }

  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(
    new Date(data),
  )
}

function usuarioEstaAtivo(usuario) {
  return (
    usuario.ativo === true ||
    usuario.ativo === 1 ||
    usuario.ativo === '1' ||
    usuario.ativo === 'true'
  )
}

function normalizarPresente(valor) {
  return valor === true || valor === 1 || valor === '1' || valor === 'true'
}

function descreverAula(aula) {
  if (!aula) {
    return 'Selecione uma aula'
  }

  const turma = aula.turmaPeriodo && aula.turmaCurso
    ? `${aula.turmaPeriodo} - ${aula.turmaCurso}`
    : `Turma ${aula.turmaId}`

  return `${formatarData(aula.data)} - ${turma} - ${aula.quantidadeAulas} aulas`
}

function Frequencia() {
  const [aulas, setAulas] = useState([])
  const [alunos, setAlunos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [filtros, setFiltros] = useState({
    curso: '',
    periodo: '',
    disciplinaId: '',
  })
  const [aulaSelecionadaId, setAulaSelecionadaId] = useState('')
  const [marcacoes, setMarcacoes] = useState({})
  const [frequenciasDaAula, setFrequenciasDaAula] = useState([])
  const [carregandoChamada, setCarregandoChamada] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      setCarregando(true)
      setErro('')

      const [aulasResponse, alunosResponse, usuariosResponse] = await Promise.all([
        listarAulas(),
        listarAlunos(),
        listarUsuarios(),
      ])

      setAulas(aulasResponse.data)
      setAlunos(alunosResponse.data)
      setUsuarios(usuariosResponse.data)
    } catch (error) {
      const mensagem =
        error.response?.data?.message || 'Nao foi possivel carregar os dados.'

      setErro(mensagem)
    } finally {
      setCarregando(false)
    }
  }

  const alunosAtivos = useMemo(() => {
    const usuarioAlunoAtivoIds = new Set(
      usuarios
        .filter((usuario) => usuario.tipo === 'ALUNO' && usuarioEstaAtivo(usuario))
        .map((usuario) => usuario.id),
    )

    return alunos.filter((aluno) => usuarioAlunoAtivoIds.has(aluno.usuarioId))
  }, [alunos, usuarios])

  const cursosDisponiveis = useMemo(() => {
    const cursos = new Set()

    aulas.forEach((aula) => {
      if (aula.turmaCurso) {
        cursos.add(aula.turmaCurso)
      }
    })

    return Array.from(cursos).sort()
  }, [aulas])

  const periodosDisponiveis = useMemo(() => {
    const periodos = new Set()

    aulas
      .filter((aula) => !filtros.curso || aula.turmaCurso === filtros.curso)
      .forEach((aula) => {
        if (aula.turmaPeriodo) {
          periodos.add(aula.turmaPeriodo)
        }
      })

    return ordemPeriodos.filter((periodo) => periodos.has(periodo))
  }, [aulas, filtros.curso])

  const materiasDisponiveis = useMemo(() => {
    const materias = new Map()

    aulas
      .filter((aula) => !filtros.curso || aula.turmaCurso === filtros.curso)
      .filter((aula) => !filtros.periodo || aula.turmaPeriodo === filtros.periodo)
      .forEach((aula) => {
        if (aula.disciplinaId && aula.disciplinaNome) {
          materias.set(aula.disciplinaId, aula.disciplinaNome)
        }
      })

    return Array.from(materias.entries())
      .map(([id, nome]) => ({ id, nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome))
  }, [aulas, filtros.curso, filtros.periodo])

  const aulasFiltradas = useMemo(() => {
    return aulas
      .filter((aula) => !filtros.curso || aula.turmaCurso === filtros.curso)
      .filter((aula) => !filtros.periodo || aula.turmaPeriodo === filtros.periodo)
      .filter(
        (aula) =>
          !filtros.disciplinaId ||
          String(aula.disciplinaId) === String(filtros.disciplinaId),
      )
  }, [aulas, filtros])

  const aulaSelecionada = useMemo(() => {
    return aulas.find((aula) => String(aula.id) === String(aulaSelecionadaId))
  }, [aulaSelecionadaId, aulas])

  const alunosDaAula = useMemo(() => {
    if (!aulaSelecionada) {
      return []
    }

    return alunosAtivos
      .filter((aluno) => String(aluno.turmaId) === String(aulaSelecionada.turmaId))
      .sort((a, b) => a.usuarioNome.localeCompare(b.usuarioNome))
  }, [alunosAtivos, aulaSelecionada])

  const frequenciasDaAulaPorAluno = useMemo(() => {
    return frequenciasDaAula.reduce((mapa, frequencia) => {
      mapa[frequencia.alunoId] = frequencia
      return mapa
    }, {})
  }, [frequenciasDaAula])

  useEffect(() => {
    if (!aulaSelecionada) {
      setMarcacoes({})
      return
    }

    const novasMarcacoes = {}

    alunosDaAula.forEach((aluno) => {
      const frequenciaSalva = frequenciasDaAulaPorAluno[aluno.id]
      novasMarcacoes[aluno.id] = frequenciaSalva
        ? normalizarPresente(frequenciaSalva.presente)
        : false
    })

    setMarcacoes(novasMarcacoes)
  }, [aulaSelecionada, alunosDaAula, frequenciasDaAulaPorAluno])

  const totalPresentes = alunosDaAula.filter((aluno) => marcacoes[aluno.id]).length
  const totalAusentes = alunosDaAula.length - totalPresentes

  function limparAulaSelecionada() {
    setAulaSelecionadaId('')
    setFrequenciasDaAula([])
    setMarcacoes({})
    setAviso('')
    setErro('')
  }

  function alterarFiltro(event) {
    const { name, value } = event.target

    setFiltros((filtrosAtuais) => ({
      ...filtrosAtuais,
      [name]: value,
      ...(name === 'curso' ? { periodo: '', disciplinaId: '' } : {}),
      ...(name === 'periodo' ? { disciplinaId: '' } : {}),
    }))
    limparAulaSelecionada()
  }

  async function alterarAula(event) {
    const aulaId = event.target.value

    setAulaSelecionadaId(aulaId)
    setFrequenciasDaAula([])
    setAviso('')
    setErro('')

    if (!aulaId) {
      return
    }

    try {
      setCarregandoChamada(true)

      const response = await listarFrequenciasPorAula(aulaId)
      setFrequenciasDaAula(response.data)
    } catch (error) {
      const mensagem =
        error.response?.status === 404
          ? 'O backend ainda nao possui GET /frequencias/aula/{aulaId}.'
          : error.response?.data?.message ||
            'Nao foi possivel carregar a chamada salva desta aula.'

      setErro(mensagem)
    } finally {
      setCarregandoChamada(false)
    }
  }

  function alternarPresenca(alunoId) {
    setMarcacoes((marcacoesAtuais) => ({
      ...marcacoesAtuais,
      [alunoId]: !marcacoesAtuais[alunoId],
    }))
  }

  function marcarTodos() {
    const novasMarcacoes = {}

    alunosDaAula.forEach((aluno) => {
      novasMarcacoes[aluno.id] = true
    })

    setMarcacoes(novasMarcacoes)
  }

  function limparMarcacoes() {
    const novasMarcacoes = {}

    alunosDaAula.forEach((aluno) => {
      novasMarcacoes[aluno.id] = false
    })

    setMarcacoes(novasMarcacoes)
    setAviso('')
  }

  async function salvarChamada() {
    if (!aulaSelecionada) {
      setErro('Selecione uma aula para salvar a chamada.')
      return
    }

    if (alunosDaAula.length === 0) {
      setErro('Nenhum aluno ativo encontrado para a turma desta aula.')
      return
    }

    try {
      setSalvando(true)
      setErro('')
      setAviso('')

      const requisicoes = alunosDaAula.map((aluno) => {
        const frequenciaExistente = frequenciasDaAulaPorAluno[aluno.id]
        const payload = {
          presente: Boolean(marcacoes[aluno.id]),
          alunoId: Number(aluno.id),
          aulaId: Number(aulaSelecionada.id),
        }

        if (frequenciaExistente) {
          return atualizarFrequencia(frequenciaExistente.id, payload)
        }

        return cadastrarFrequencia(payload)
      })

      await Promise.all(requisicoes)
      await carregarDados()
      const response = await listarFrequenciasPorAula(aulaSelecionada.id)
      setFrequenciasDaAula(response.data)
      setAviso('Chamada salva com sucesso.')
    } catch (error) {
      const mensagem =
        error.response?.data?.message || 'Nao foi possivel salvar a chamada.'

      setErro(mensagem)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <section className="frequencias-page">
      <div className="frequencias-header">
        <div>
          <p>Chamada por aula</p>
          <h2>Marque os alunos presentes na turma selecionada.</h2>
        </div>
      </div>

      <div className="frequencias-card">
        <div className="frequencias-selector">
          <label className="frequencias-field">
            <span>Curso</span>
            <select
              name="curso"
              value={filtros.curso}
              onChange={alterarFiltro}
              disabled={carregando}
            >
              <option value="">Todos os cursos</option>
              {cursosDisponiveis.map((curso) => (
                <option value={curso} key={curso}>
                  {curso}
                </option>
              ))}
            </select>
          </label>

          <label className="frequencias-field">
            <span>Semestre</span>
            <select
              name="periodo"
              value={filtros.periodo}
              onChange={alterarFiltro}
              disabled={carregando || !filtros.curso}
            >
              <option value="">
                {filtros.curso ? 'Todos os semestres' : 'Selecione o curso'}
              </option>
              {periodosDisponiveis.map((periodo) => (
                <option value={periodo} key={periodo}>
                  {periodo}
                </option>
              ))}
            </select>
          </label>

          <label className="frequencias-field">
            <span>Materia</span>
            <select
              name="disciplinaId"
              value={filtros.disciplinaId}
              onChange={alterarFiltro}
              disabled={carregando || !filtros.periodo}
            >
              <option value="">
                {filtros.periodo ? 'Todas as materias' : 'Selecione o semestre'}
              </option>
              {materiasDisponiveis.map((materia) => (
                <option value={materia.id} key={materia.id}>
                  {materia.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="frequencias-field">
            <span>Aula / data</span>
            <select
              value={aulaSelecionadaId}
              onChange={alterarAula}
              disabled={carregando || !filtros.disciplinaId}
            >
              <option value="">
                {carregando
                  ? 'Carregando aulas...'
                  : filtros.disciplinaId
                    ? 'Selecione uma aula'
                    : 'Selecione a materia'}
              </option>
              {aulasFiltradas.map((aula) => (
                <option value={aula.id} key={aula.id}>
                  {descreverAula(aula)}
                </option>
              ))}
            </select>
          </label>

          {aulaSelecionada && (
            <div className="frequencias-aula-info">
              <span>{formatarData(aulaSelecionada.data)}</span>
              <strong>{aulaSelecionada.disciplinaNome}</strong>
              <span>
                {aulaSelecionada.turmaPeriodo} - {aulaSelecionada.turmaCurso}
              </span>
              <span>{aulaSelecionada.quantidadeAulas} aulas</span>
            </div>
          )}
        </div>

        {erro && <p className="frequencias-message frequencias-message--error">{erro}</p>}

        {carregandoChamada && (
          <p className="frequencias-message frequencias-message--info">
            Carregando chamada salva...
          </p>
        )}

        {!aulaSelecionada && !erro && (
          <div className="frequencias-empty-state">
            <ClipboardCheck size={42} />
            <strong>Selecione uma aula para iniciar a chamada.</strong>
            <span>Depois disso, os alunos daquela turma aparecem aqui.</span>
          </div>
        )}

        {aulaSelecionada && (
          <>
            <div className="frequencias-toolbar">
              <div className="frequencias-summary">
                <span>
                  <strong>{alunosDaAula.length}</strong> alunos
                </span>
                <span>
                <strong>{totalPresentes}</strong> presentes
                </span>
                <span>
                  <strong>{totalAusentes}</strong> ausentes
                </span>
              </div>

              <div className="frequencias-actions">
                <button
                  type="button"
                  className="frequencias-button frequencias-button--secondary"
                  onClick={marcarTodos}
                  disabled={salvando || carregandoChamada || alunosDaAula.length === 0}
                >
                  <CheckCircle2 size={17} />
                  <span>Marcar todos</span>
                </button>

                <button
                  type="button"
                  className="frequencias-button frequencias-button--secondary"
                  onClick={limparMarcacoes}
                  disabled={salvando || carregandoChamada || alunosDaAula.length === 0}
                >
                  <RotateCcw size={17} />
                  <span>Limpar</span>
                </button>

                <button
                  type="button"
                  className="frequencias-button frequencias-button--primary"
                  onClick={salvarChamada}
                  disabled={salvando || carregandoChamada || alunosDaAula.length === 0}
                >
                  <Save size={17} />
                  <span>{salvando ? 'Salvando...' : 'Salvar chamada'}</span>
                </button>
              </div>
            </div>

            {alunosDaAula.length === 0 ? (
              <div className="frequencias-empty-state">
                <ClipboardCheck size={42} />
                <strong>Nenhum aluno ativo nesta turma.</strong>
                <span>Confira o cadastro de alunos e usuarios ativos.</span>
              </div>
            ) : (
              <div className="frequencias-list">
                {alunosDaAula.map((aluno) => {
                  const presente = Boolean(marcacoes[aluno.id])

                  return (
                    <label
                      className={`frequencias-student ${
                        presente ? 'frequencias-student--checked' : ''
                      }`}
                      key={aluno.id}
                    >
                      <input
                        type="checkbox"
                        checked={presente}
                        onChange={() => alternarPresenca(aluno.id)}
                      />

                      <span className="frequencias-check" />

                      <div className="frequencias-student-info">
                        <strong>{aluno.usuarioNome}</strong>
                        <span>Matricula {aluno.matricula}</span>
                      </div>

                      <span
                        className={`frequencias-status ${
                          presente
                            ? 'frequencias-status--present'
                            : 'frequencias-status--absent'
                        }`}
                      >
                        {presente ? 'Presente' : 'Ausente'}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {aviso && <div className="frequencias-toast">{aviso}</div>}
    </section>
  )
}

export default Frequencia
