import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import {
  atualizarAula,
  cadastrarAula,
  deletarAula,
  listarAulas,
} from '../../services/aulaService'
import { listarDisciplinas } from '../../services/disciplinaService'
import { listarTurmas } from '../../services/turmaService'
import './Aulas.css'

const formularioInicial = {
  data: '',
  quantidadeAulas: '',
  professorId: '',
  disciplinaId: '',
  turmaId: '',
}

function formatarData(data) {
  if (!data) {
    return '-'
  }

  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(
    new Date(data),
  )
}

function descreverTurma(turma) {
  if (!turma) {
    return '-'
  }

  return `${turma.periodo} - ${turma.curso}`
}

function Aulas() {
  const [aulas, setAulas] = useState([])
  const [disciplinas, setDisciplinas] = useState([])
  const [turmas, setTurmas] = useState([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [aulaEditando, setAulaEditando] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [erroFormulario, setErroFormulario] = useState('')
  const [excluindoId, setExcluindoId] = useState(null)
  const [confirmacao, setConfirmacao] = useState(null)
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      setCarregando(true)
      setErro('')

      const [aulasResponse, disciplinasResponse, turmasResponse] =
        await Promise.all([listarAulas(), listarDisciplinas(), listarTurmas()])

      setAulas(aulasResponse.data)
      setDisciplinas(disciplinasResponse.data)
      setTurmas(turmasResponse.data)
    } catch (error) {
      const mensagem =
        error.response?.data?.message || 'Nao foi possivel carregar os dados.'

      setErro(mensagem)
    } finally {
      setCarregando(false)
    }
  }

  const turmasPorId = useMemo(() => {
    return turmas.reduce((mapa, turma) => {
      mapa[turma.id] = turma
      return mapa
    }, {})
  }, [turmas])

  const professoresDasDisciplinas = useMemo(() => {
    const professores = new Map()

    disciplinas.forEach((disciplina) => {
      if (!disciplina.professorId) {
        return
      }

      professores.set(disciplina.professorId, {
        id: disciplina.professorId,
        nome: disciplina.professorNome,
        ra: disciplina.professorRa,
      })
    })

    return Array.from(professores.values()).sort((a, b) =>
      a.nome.localeCompare(b.nome),
    )
  }, [disciplinas])

  const disciplinasFiltradasPorProfessor = useMemo(() => {
    if (!formulario.professorId) {
      return []
    }

    return disciplinas.filter(
      (disciplina) =>
        String(disciplina.professorId) === String(formulario.professorId),
    )
  }, [disciplinas, formulario.professorId])

  const aulasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    if (!termo) {
      return aulas
    }

    return aulas.filter((aula) => {
      const turma = turmasPorId[aula.turmaId]
      const disciplina = aula.disciplinaNome?.toLowerCase() ?? ''
      const turmaTexto = descreverTurma(turma).toLowerCase()
      const data = aula.data ?? ''

      return (
        disciplina.includes(termo) ||
        turmaTexto.includes(termo) ||
        data.includes(termo)
      )
    })
  }, [aulas, busca, turmasPorId])

  function abrirModalCadastro() {
    setFormulario(formularioInicial)
    setAulaEditando(null)
    setErroFormulario('')
    setModalAberto(true)
  }

  function abrirModalEdicao(aula) {
    const disciplinaSelecionada = disciplinas.find(
      (disciplina) => disciplina.id === aula.disciplinaId,
    )

    setFormulario({
      data: aula.data ?? '',
      quantidadeAulas: String(aula.quantidadeAulas ?? ''),
      professorId: String(disciplinaSelecionada?.professorId ?? ''),
      disciplinaId: String(aula.disciplinaId ?? ''),
      turmaId: String(aula.turmaId ?? ''),
    })
    setAulaEditando(aula)
    setErroFormulario('')
    setModalAberto(true)
  }

  function fecharModalCadastro() {
    if (salvando) {
      return
    }

    setModalAberto(false)
    setFormulario(formularioInicial)
    setAulaEditando(null)
    setErroFormulario('')
  }

  function atualizarCampo(event) {
    const { name, value } = event.target

    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [name]: value,
      ...(name === 'professorId' ? { disciplinaId: '' } : {}),
    }))
  }

  async function salvarAula(event) {
    event.preventDefault()

    const aula = {
      data: formulario.data,
      quantidadeAulas: Number(formulario.quantidadeAulas),
      disciplinaId: Number(formulario.disciplinaId),
      turmaId: Number(formulario.turmaId),
    }

    if (!aula.data || !aula.quantidadeAulas || !aula.disciplinaId || !aula.turmaId) {
      setErroFormulario('Preencha todos os campos para salvar a aula.')
      return
    }

    if (aula.quantidadeAulas <= 0) {
      setErroFormulario('A quantidade de aulas deve ser maior que zero.')
      return
    }

    try {
      setSalvando(true)
      setErroFormulario('')

      if (aulaEditando) {
        await atualizarAula(aulaEditando.id, aula)
      } else {
        await cadastrarAula(aula)
      }

      await carregarDados()

      setModalAberto(false)
      setFormulario(formularioInicial)
      setAulaEditando(null)
      setAviso(
        aulaEditando ? 'Aula atualizada com sucesso.' : 'Aula cadastrada com sucesso.',
      )
    } catch (error) {
      const mensagem =
        error.response?.data?.message || 'Nao foi possivel salvar a aula.'

      setErroFormulario(mensagem)
    } finally {
      setSalvando(false)
    }
  }

  function pedirExclusaoAula(aula) {
    setConfirmacao({
      aula,
      titulo: 'Excluir aula',
      mensagem: `Deseja excluir a aula de ${aula.disciplinaNome} em ${formatarData(
        aula.data,
      )}? Esta acao nao pode ser desfeita.`,
    })
  }

  async function excluirAula(aula) {
    try {
      setExcluindoId(aula.id)
      setErro('')
      setAviso('')

      await deletarAula(aula.id)
      await carregarDados()
      setAviso('Aula excluida com sucesso.')
    } catch (error) {
      const mensagem =
        error.response?.data?.message || 'Nao foi possivel excluir a aula.'

      setErro(mensagem)
    } finally {
      setExcluindoId(null)
    }
  }

  async function confirmarExclusaoAula() {
    if (!confirmacao) {
      return
    }

    const { aula } = confirmacao
    setConfirmacao(null)
    await excluirAula(aula)
  }

  return (
    <section className="aulas-page">
      <div className="aulas-header">
        <p>Gerenciar aulas dadas</p>

        <button type="button" className="aulas-new-button" onClick={abrirModalCadastro}>
          <Plus size={18} />
          <span>Nova Aula</span>
        </button>
      </div>

      <div className="aulas-card">
        <div className="aulas-toolbar">
          <div className="aulas-search-field">
            <Search size={18} />
            <input
              className="aulas-search"
              type="text"
              placeholder="Buscar..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </div>
        </div>

        <table className="aulas-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Data</th>
              <th>Quantidade</th>
              <th>Disciplina</th>
              <th>Turma</th>
              <th>Acoes</th>
            </tr>
          </thead>

          <tbody>
            {carregando && (
              <tr>
                <td className="aulas-empty" colSpan="6">
                  Carregando aulas...
                </td>
              </tr>
            )}

            {!carregando && erro && (
              <tr>
                <td className="aulas-error" colSpan="6">
                  {erro}
                </td>
              </tr>
            )}

            {!carregando && !erro && aulasFiltradas.length === 0 && (
              <tr>
                <td className="aulas-empty" colSpan="6">
                  Nenhuma aula encontrada.
                </td>
              </tr>
            )}

            {!carregando &&
              !erro &&
              aulasFiltradas.map((aula) => (
                <tr key={aula.id}>
                  <td>{aula.id}</td>
                  <td>{formatarData(aula.data)}</td>
                  <td>{aula.quantidadeAulas}</td>
                  <td>{aula.disciplinaNome}</td>
                  <td>{descreverTurma(turmasPorId[aula.turmaId])}</td>
                  <td>
                    <div className="aulas-actions">
                      <button
                        type="button"
                        className="aulas-action-button"
                        aria-label="Editar aula"
                        onClick={() => abrirModalEdicao(aula)}
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        className="aulas-action-button aulas-action-button--danger"
                        aria-label="Excluir aula"
                        onClick={() => pedirExclusaoAula(aula)}
                        disabled={excluindoId === aula.id}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div className="aulas-modal-backdrop">
          <div
            className="aulas-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="aulas-modal-title"
          >
            <div className="aulas-modal-header">
              <div>
                <h2 id="aulas-modal-title">
                  {aulaEditando ? 'Editar aula' : 'Nova aula'}
                </h2>
                <p>
                  {aulaEditando
                    ? 'Atualize os dados da aula selecionada.'
                    : 'Informe os dados para cadastrar uma aula.'}
                </p>
              </div>

              <button
                type="button"
                className="aulas-modal-close"
                onClick={fecharModalCadastro}
                aria-label="Fechar formulario"
              >
                <X size={18} />
              </button>
            </div>

            <form className="aulas-form" onSubmit={salvarAula}>
              <label className="aulas-form-field">
                <span>Data</span>
                <input
                  type="date"
                  name="data"
                  value={formulario.data}
                  onChange={atualizarCampo}
                />
              </label>

              <label className="aulas-form-field">
                <span>Quantidade de aulas</span>
                <input
                  type="number"
                  name="quantidadeAulas"
                  min="1"
                  step="1"
                  placeholder="Ex: 4"
                  value={formulario.quantidadeAulas}
                  onChange={atualizarCampo}
                />
              </label>

              <label className="aulas-form-field">
                <span>Professor</span>
                <select
                  name="professorId"
                  value={formulario.professorId}
                  onChange={atualizarCampo}
                >
                  <option value="">Selecione um professor</option>
                  {professoresDasDisciplinas.map((professor) => (
                    <option value={professor.id} key={professor.id}>
                      {professor.nome} - RA {professor.ra}
                    </option>
                  ))}
                </select>
              </label>

              <label className="aulas-form-field">
                <span>Disciplina</span>
                <select
                  name="disciplinaId"
                  value={formulario.disciplinaId}
                  onChange={atualizarCampo}
                  disabled={!formulario.professorId}
                >
                  <option value="">
                    {formulario.professorId
                      ? 'Selecione uma disciplina'
                      : 'Selecione um professor primeiro'}
                  </option>
                  {disciplinasFiltradasPorProfessor.map((disciplina) => (
                    <option value={disciplina.id} key={disciplina.id}>
                      {disciplina.nome}
                    </option>
                  ))}
                </select>
                <small className="aulas-form-help">
                  O backend bloqueia aulas se o professor da disciplina estiver
                  inativo.
                </small>
              </label>

              <label className="aulas-form-field">
                <span>Turma</span>
                <select
                  name="turmaId"
                  value={formulario.turmaId}
                  onChange={atualizarCampo}
                >
                  <option value="">Selecione uma turma</option>
                  {turmas.map((turma) => (
                    <option value={turma.id} key={turma.id}>
                      {descreverTurma(turma)}
                    </option>
                  ))}
                </select>
              </label>

              {erroFormulario && <p className="aulas-form-error">{erroFormulario}</p>}

              <div className="aulas-form-actions">
                <button
                  type="button"
                  className="aulas-form-button aulas-form-button--secondary"
                  onClick={fecharModalCadastro}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="aulas-form-button aulas-form-button--primary"
                  disabled={salvando}
                >
                  {salvando ? 'Salvando...' : 'Salvar aula'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmacao && (
        <div className="aulas-confirm-backdrop">
          <div
            className="aulas-confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="aulas-confirm-title"
          >
            <h2 id="aulas-confirm-title">{confirmacao.titulo}</h2>
            <p>{confirmacao.mensagem}</p>

            <div className="aulas-confirm-actions">
              <button
                type="button"
                className="aulas-confirm-button aulas-confirm-button--secondary"
                onClick={() => setConfirmacao(null)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="aulas-confirm-button aulas-confirm-button--danger"
                onClick={confirmarExclusaoAula}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {aviso && <div className="aulas-toast">{aviso}</div>}
    </section>
  )
}

export default Aulas
