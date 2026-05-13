import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import {
  atualizarTurma,
  cadastrarTurma,
  deletarTurma,
  listarTurmas,
} from '../../../services/turmaService'
import './Turmas.css'

const formularioInicial = {
  periodo: '',
  curso: '',
}

const periodos = [
  { value: 'PRIMEIRO', label: 'Primeiro' },
  { value: 'SEGUNDO', label: 'Segundo' },
  { value: 'TERCEIRO', label: 'Terceiro' },
  { value: 'QUARTO', label: 'Quarto' },
  { value: 'QUINTO', label: 'Quinto' },
  { value: 'SEXTO', label: 'Sexto' },
  { value: 'SETIMO', label: 'Setimo' },
  { value: 'OITAVO', label: 'Oitavo' },
]

const cursos = [
  { value: 'SISTEMAS', label: 'Sistemas' },
  { value: 'ADMINISTRACAO', label: 'Administracao' },
  { value: 'BIOMEDICINA', label: 'Biomedicina' },
]

function Turmas() {
  const [turmas, setTurmas] = useState([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [turmaEditando, setTurmaEditando] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [erroFormulario, setErroFormulario] = useState('')
  const [excluindoId, setExcluindoId] = useState(null)

  useEffect(() => {
    carregarTurmas()
  }, [])

  async function carregarTurmas() {
    try {
      setCarregando(true)
      setErro('')

      const response = await listarTurmas()
      setTurmas(response.data)
    } catch (error) {
      const mensagem =
        error.response?.data?.message || 'Nao foi possivel carregar as turmas.'

      setErro(mensagem)
    } finally {
      setCarregando(false)
    }
  }

  const turmasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    if (!termo) {
      return turmas
    }

    return turmas.filter((turma) => {
      const periodo = turma.periodo?.toLowerCase() ?? ''
      const curso = turma.curso?.toLowerCase() ?? ''

      return periodo.includes(termo) || curso.includes(termo)
    })
  }, [busca, turmas])

  function abrirModalCadastro() {
    setFormulario(formularioInicial)
    setTurmaEditando(null)
    setErroFormulario('')
    setModalAberto(true)
  }

  function abrirModalEdicao(turma) {
    setFormulario({
      periodo: turma.periodo ?? '',
      curso: turma.curso ?? '',
    })
    setTurmaEditando(turma)
    setErroFormulario('')
    setModalAberto(true)
  }

  function fecharModalCadastro() {
    if (salvando) {
      return
    }

    setModalAberto(false)
    setFormulario(formularioInicial)
    setTurmaEditando(null)
    setErroFormulario('')
  }

  function atualizarCampo(event) {
    const { name, value } = event.target

    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [name]: value,
    }))
  }

  async function salvarTurma(event) {
    event.preventDefault()

    const turma = {
      periodo: formulario.periodo.trim(),
      curso: formulario.curso.trim(),
    }

    if (!turma.periodo || !turma.curso) {
      setErroFormulario('Preencha periodo e curso para cadastrar a turma.')
      return
    }

    try {
      setSalvando(true)
      setErroFormulario('')

      if (turmaEditando) {
        await atualizarTurma(turmaEditando.id, turma)
      } else {
        await cadastrarTurma(turma)
      }

      await carregarTurmas()

      setModalAberto(false)
      setFormulario(formularioInicial)
      setTurmaEditando(null)
    } catch (error) {
      const mensagem =
        error.response?.data?.message || 'Nao foi possivel salvar a turma.'

      setErroFormulario(mensagem)
    } finally {
      setSalvando(false)
    }
  }

  async function excluirTurma(turma) {
    const confirmou = window.confirm(
      `Deseja excluir a turma ${turma.periodo} - ${turma.curso}?`,
    )

    if (!confirmou) {
      return
    }

    try {
      setExcluindoId(turma.id)
      setErro('')

      await deletarTurma(turma.id)
      await carregarTurmas()
    } catch (error) {
      const mensagem =
        error.response?.data?.message || 'Nao foi possivel excluir a turma.'

      setErro(mensagem)
    } finally {
      setExcluindoId(null)
    }
  }

  return (
    <section className="turmas-page">
      <div className="turmas-header">
        <p>Gerenciar turmas</p>

        <button
          type="button"
          className="turmas-new-button"
          onClick={abrirModalCadastro}
        >
          <Plus size={18} />
          <span>Novo Cadastro</span>
        </button>
      </div>

      <div className="turmas-card">
        <div className="turmas-toolbar">
          <div className="turmas-search-field">
            <Search size={18} />
            <input
              className="turmas-search"
              type="text"
              placeholder="Buscar..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </div>
        </div>

        <table className="turmas-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Período</th>
              <th>Curso</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {carregando && (
              <tr>
                <td className="turmas-empty" colSpan="4">
                  Carregando turmas...
                </td>
              </tr>
            )}

            {!carregando && erro && (
              <tr>
                <td className="turmas-error" colSpan="4">
                  {erro}
                </td>
              </tr>
            )}

            {!carregando && !erro && turmasFiltradas.length === 0 && (
              <tr>
                <td className="turmas-empty" colSpan="4">
                  Nenhuma turma encontrada.
                </td>
              </tr>
            )}

            {!carregando &&
              !erro &&
              turmasFiltradas.map((turma) => (
                <tr key={turma.id}>
                  <td>{turma.id}</td>
                  <td>{turma.periodo}</td>
                  <td>{turma.curso}</td>
                  <td>
                    <div className="turmas-actions">
                      <button
                        type="button"
                        className="turmas-action-button"
                        aria-label="Editar turma"
                        onClick={() => abrirModalEdicao(turma)}
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        type="button"
                        className="turmas-action-button turmas-action-button--danger"
                        aria-label="Excluir turma"
                        onClick={() => excluirTurma(turma)}
                        disabled={excluindoId === turma.id}
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
        <div className="turmas-modal-backdrop">
          <div
            className="turmas-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="turmas-modal-title"
          >
            <div className="turmas-modal-header">
              <div>
                <h2 id="turmas-modal-title">
                  {turmaEditando ? 'Editar turma' : 'Nova turma'}
                </h2>
                <p>
                  {turmaEditando
                    ? 'Atualize os dados da turma selecionada.'
                    : 'Informe os dados para cadastrar uma turma.'}
                </p>
              </div>

              <button
                type="button"
                className="turmas-modal-close"
                onClick={fecharModalCadastro}
                aria-label="Fechar formulario"
              >
                <X size={18} />
              </button>
            </div>

            <form className="turmas-form" onSubmit={salvarTurma}>
              <label className="turmas-form-field">
                <span>Periodo</span>
                <select
                  name="periodo"
                  value={formulario.periodo}
                  onChange={atualizarCampo}
                >
                  <option value="">Selecione um periodo</option>
                  {periodos.map((periodo) => (
                    <option value={periodo.value} key={periodo.value}>
                      {periodo.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="turmas-form-field">
                <span>Curso</span>
                <select
                  name="curso"
                  value={formulario.curso}
                  onChange={atualizarCampo}
                >
                  <option value="">Selecione um curso</option>
                  {cursos.map((curso) => (
                    <option value={curso.value} key={curso.value}>
                      {curso.label}
                    </option>
                  ))}
                </select>
              </label>

              {erroFormulario && (
                <p className="turmas-form-error">{erroFormulario}</p>
              )}

              <div className="turmas-form-actions">
                <button
                  type="button"
                  className="turmas-form-button turmas-form-button--secondary"
                  onClick={fecharModalCadastro}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="turmas-form-button turmas-form-button--primary"
                  disabled={salvando}
                >
                  {salvando ? 'Salvando...' : 'Salvar turma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default Turmas
