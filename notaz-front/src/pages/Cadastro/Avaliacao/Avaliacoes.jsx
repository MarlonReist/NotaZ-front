import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import {
  atualizarAvaliacao,
  cadastrarAvaliacao,
  deletarAvaliacao,
  listarAvaliacoes,
} from '../../../services/avaliacaoService'
import { listarDisciplinas } from '../../../services/disciplinaService'
import './Avaliacoes.css'

const formularioInicial = {
  nome: '',
  peso: '',
  data: '',
  professorId: '',
  disciplinaId: '',
}

function formatarData(data) {
  if (!data) {
    return '-'
  }

  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(
    new Date(data),
  )
}

function Avaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState([])
  const [disciplinas, setDisciplinas] = useState([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [avaliacaoEditando, setAvaliacaoEditando] = useState(null)
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

      const [avaliacoesResponse, disciplinasResponse] = await Promise.all([
        listarAvaliacoes(),
        listarDisciplinas(),
      ])

      setAvaliacoes(avaliacoesResponse.data)
      setDisciplinas(disciplinasResponse.data)
    } catch (error) {
      const mensagem =
        error.response?.data?.message || 'Nao foi possivel carregar os dados.'

      setErro(mensagem)
    } finally {
      setCarregando(false)
    }
  }

  const avaliacoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    if (!termo) {
      return avaliacoes
    }

    return avaliacoes.filter((avaliacao) => {
      const nome = avaliacao.nome?.toLowerCase() ?? ''
      const disciplinaNome = avaliacao.disciplinaNome?.toLowerCase() ?? ''

      return nome.includes(termo) || disciplinaNome.includes(termo)
    })
  }, [avaliacoes, busca])

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

  function abrirModalCadastro() {
    setFormulario(formularioInicial)
    setAvaliacaoEditando(null)
    setErroFormulario('')
    setModalAberto(true)
  }

  function abrirModalEdicao(avaliacao) {
    const disciplinaSelecionada = disciplinas.find(
      (disciplina) => disciplina.id === avaliacao.disciplinaId,
    )

    setFormulario({
      nome: avaliacao.nome ?? '',
      peso: String(avaliacao.peso ?? ''),
      data: avaliacao.data ?? '',
      professorId: String(disciplinaSelecionada?.professorId ?? ''),
      disciplinaId: String(avaliacao.disciplinaId ?? ''),
    })
    setAvaliacaoEditando(avaliacao)
    setErroFormulario('')
    setModalAberto(true)
  }

  function fecharModalCadastro() {
    if (salvando) {
      return
    }

    setModalAberto(false)
    setFormulario(formularioInicial)
    setAvaliacaoEditando(null)
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

  async function salvarAvaliacao(event) {
    event.preventDefault()

    const avaliacao = {
      nome: formulario.nome.trim(),
      peso: Number(formulario.peso),
      data: formulario.data,
      disciplinaId: Number(formulario.disciplinaId),
    }

    if (
      !avaliacao.nome ||
      !avaliacao.peso ||
      !avaliacao.data ||
      !avaliacao.disciplinaId
    ) {
      setErroFormulario('Preencha todos os campos para salvar a avaliacao.')
      return
    }

    if (avaliacao.peso <= 0) {
      setErroFormulario('O peso deve ser maior que zero.')
      return
    }

    try {
      setSalvando(true)
      setErroFormulario('')

      if (avaliacaoEditando) {
        await atualizarAvaliacao(avaliacaoEditando.id, avaliacao)
      } else {
        await cadastrarAvaliacao(avaliacao)
      }

      await carregarDados()

      setModalAberto(false)
      setFormulario(formularioInicial)
      setAvaliacaoEditando(null)
      setAviso(
        avaliacaoEditando
          ? 'Avaliacao atualizada com sucesso.'
          : 'Avaliacao cadastrada com sucesso.',
      )
    } catch (error) {
      const mensagem =
        error.response?.data?.message || 'Nao foi possivel salvar a avaliacao.'

      setErroFormulario(mensagem)
    } finally {
      setSalvando(false)
    }
  }

  function pedirExclusaoAvaliacao(avaliacao) {
    setConfirmacao({
      avaliacao,
      titulo: 'Excluir avaliacao',
      mensagem: `Deseja excluir a avaliacao ${avaliacao.nome}? Esta acao nao pode ser desfeita.`,
    })
  }

  async function excluirAvaliacao(avaliacao) {
    try {
      setExcluindoId(avaliacao.id)
      setErro('')
      setAviso('')

      await deletarAvaliacao(avaliacao.id)
      await carregarDados()
      setAviso('Avaliacao excluida com sucesso.')
    } catch (error) {
      const mensagem =
        error.response?.data?.message || 'Nao foi possivel excluir a avaliacao.'

      setErro(mensagem)
    } finally {
      setExcluindoId(null)
    }
  }

  async function confirmarExclusaoAvaliacao() {
    if (!confirmacao) {
      return
    }

    const { avaliacao } = confirmacao
    setConfirmacao(null)
    await excluirAvaliacao(avaliacao)
  }

  return (
    <section className="avaliacoes-page">
      <div className="avaliacoes-header">
        <p>Gerenciar avaliações</p>

        <button
          type="button"
          className="avaliacoes-new-button"
          onClick={abrirModalCadastro}
        >
          <Plus size={18} />
          <span>Nova Avaliacao</span>
        </button>
      </div>

      <div className="avaliacoes-card">
        <div className="avaliacoes-toolbar">
          <div className="avaliacoes-search-field">
            <Search size={18} />
            <input
              className="avaliacoes-search"
              type="text"
              placeholder="Buscar..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </div>
        </div>

        <table className="avaliacoes-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Peso</th>
              <th>Data</th>
              <th>Disciplina</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {carregando && (
              <tr>
                <td className="avaliacoes-empty" colSpan="6">
                  Carregando avaliações...
                </td>
              </tr>
            )}

            {!carregando && erro && (
              <tr>
                <td className="avaliacoes-error" colSpan="6">
                  {erro}
                </td>
              </tr>
            )}

            {!carregando && !erro && avaliacoesFiltradas.length === 0 && (
              <tr>
                <td className="avaliacoes-empty" colSpan="6">
                  Nenhuma avaliacao encontrada.
                </td>
              </tr>
            )}

            {!carregando &&
              !erro &&
              avaliacoesFiltradas.map((avaliacao) => (
                <tr key={avaliacao.id}>
                  <td>{avaliacao.id}</td>
                  <td>{avaliacao.nome}</td>
                  <td>{avaliacao.peso}</td>
                  <td>{formatarData(avaliacao.data)}</td>
                  <td>{avaliacao.disciplinaNome}</td>
                  <td>
                    <div className="avaliacoes-actions">
                      <button
                        type="button"
                        className="avaliacoes-action-button"
                        aria-label="Editar avaliacao"
                        onClick={() => abrirModalEdicao(avaliacao)}
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        className="avaliacoes-action-button avaliacoes-action-button--danger"
                        aria-label="Excluir avaliacao"
                        onClick={() => pedirExclusaoAvaliacao(avaliacao)}
                        disabled={excluindoId === avaliacao.id}
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
        <div className="avaliacoes-modal-backdrop">
          <div
            className="avaliacoes-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="avaliacoes-modal-title"
          >
            <div className="avaliacoes-modal-header">
              <div>
                <h2 id="avaliacoes-modal-title">
                  {avaliacaoEditando ? 'Editar avaliacao' : 'Nova avaliacao'}
                </h2>
                <p>
                  {avaliacaoEditando
                    ? 'Atualize os dados da avaliacao selecionada.'
                    : 'Informe os dados para cadastrar uma avaliacao.'}
                </p>
              </div>

              <button
                type="button"
                className="avaliacoes-modal-close"
                onClick={fecharModalCadastro}
                aria-label="Fechar formulario"
              >
                <X size={18} />
              </button>
            </div>

            <form className="avaliacoes-form" onSubmit={salvarAvaliacao}>
              <label className="avaliacoes-form-field">
                <span>Nome</span>
                <input
                  type="text"
                  name="nome"
                  placeholder="Ex: Prova 1"
                  value={formulario.nome}
                  onChange={atualizarCampo}
                />
              </label>

              <label className="avaliacoes-form-field">
                <span>Peso</span>
                <input
                  type="number"
                  name="peso"
                  min="0"
                  step="0.1"
                  placeholder="Ex: 2"
                  value={formulario.peso}
                  onChange={atualizarCampo}
                />
              </label>

              <label className="avaliacoes-form-field">
                <span>Data</span>
                <input
                  type="date"
                  name="data"
                  value={formulario.data}
                  onChange={atualizarCampo}
                />
              </label>

              <label className="avaliacoes-form-field">
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
                <small className="avaliacoes-form-help">
                  Primeiro escolha o professor para reduzir a lista de
                  disciplinas.
                </small>
              </label>

              <label className="avaliacoes-form-field">
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
                <small className="avaliacoes-form-help">
                  O backend bloqueia avaliações se o professor da disciplina
                  estiver inativo.
                </small>
              </label>

              {erroFormulario && (
                <p className="avaliacoes-form-error">{erroFormulario}</p>
              )}

              <div className="avaliacoes-form-actions">
                <button
                  type="button"
                  className="avaliacoes-form-button avaliacoes-form-button--secondary"
                  onClick={fecharModalCadastro}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="avaliacoes-form-button avaliacoes-form-button--primary"
                  disabled={salvando}
                >
                  {salvando ? 'Salvando...' : 'Salvar avaliacao'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmacao && (
        <div className="avaliacoes-confirm-backdrop">
          <div
            className="avaliacoes-confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="avaliacoes-confirm-title"
          >
            <h2 id="avaliacoes-confirm-title">{confirmacao.titulo}</h2>
            <p>{confirmacao.mensagem}</p>

            <div className="avaliacoes-confirm-actions">
              <button
                type="button"
                className="avaliacoes-confirm-button avaliacoes-confirm-button--secondary"
                onClick={() => setConfirmacao(null)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="avaliacoes-confirm-button avaliacoes-confirm-button--danger"
                onClick={confirmarExclusaoAvaliacao}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {aviso && <div className="avaliacoes-toast">{aviso}</div>}
    </section>
  )
}

export default Avaliacoes
