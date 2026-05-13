import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import {
  atualizarDisciplina,
  cadastrarDisciplina,
  deletarDisciplina,
  listarDisciplinas,
} from '../../../services/disciplinaService'
import { listarProfessores } from '../../../services/professorService'
import './Disciplinas.css'

const formularioInicial = {
  nome: '',
  professorId: '',
}

function Disciplinas() {
  const [disciplinas, setDisciplinas] = useState([])
  const [professores, setProfessores] = useState([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [disciplinaEditando, setDisciplinaEditando] = useState(null)
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

      const [disciplinasResponse, professoresResponse] = await Promise.all([
        listarDisciplinas(),
        listarProfessores(),
      ])

      setDisciplinas(disciplinasResponse.data)
      setProfessores(professoresResponse.data)
    } catch (error) {
      const mensagem =
        error.response?.data?.message || 'Nao foi possivel carregar os dados.'

      setErro(mensagem)
    } finally {
      setCarregando(false)
    }
  }

  const disciplinasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    if (!termo) {
      return disciplinas
    }

    return disciplinas.filter((disciplina) => {
      const nome = disciplina.nome?.toLowerCase() ?? ''
      const professorNome = disciplina.professorNome?.toLowerCase() ?? ''
      const professorRa = disciplina.professorRa?.toLowerCase() ?? ''

      return (
        nome.includes(termo) ||
        professorNome.includes(termo) ||
        professorRa.includes(termo)
      )
    })
  }, [busca, disciplinas])

  function abrirModalCadastro() {
    setFormulario(formularioInicial)
    setDisciplinaEditando(null)
    setErroFormulario('')
    setModalAberto(true)
  }

  function abrirModalEdicao(disciplina) {
    setFormulario({
      nome: disciplina.nome ?? '',
      professorId: String(disciplina.professorId ?? ''),
    })
    setDisciplinaEditando(disciplina)
    setErroFormulario('')
    setModalAberto(true)
  }

  function fecharModalCadastro() {
    if (salvando) {
      return
    }

    setModalAberto(false)
    setFormulario(formularioInicial)
    setDisciplinaEditando(null)
    setErroFormulario('')
  }

  function atualizarCampo(event) {
    const { name, value } = event.target

    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [name]: value,
    }))
  }

  async function salvarDisciplina(event) {
    event.preventDefault()

    const disciplina = {
      nome: formulario.nome.trim(),
      professorId: Number(formulario.professorId),
    }

    if (!disciplina.nome || !disciplina.professorId) {
      setErroFormulario('Preencha nome e professor para salvar a disciplina.')
      return
    }

    try {
      setSalvando(true)
      setErroFormulario('')

      if (disciplinaEditando) {
        await atualizarDisciplina(disciplinaEditando.id, disciplina)
      } else {
        await cadastrarDisciplina(disciplina)
      }

      await carregarDados()

      setModalAberto(false)
      setFormulario(formularioInicial)
      setDisciplinaEditando(null)
      setAviso(
        disciplinaEditando
          ? 'Disciplina atualizada com sucesso.'
          : 'Disciplina cadastrada com sucesso.',
      )
    } catch (error) {
      const mensagem =
        error.response?.data?.message || 'Nao foi possivel salvar a disciplina.'

      setErroFormulario(mensagem)
    } finally {
      setSalvando(false)
    }
  }

  function pedirExclusaoDisciplina(disciplina) {
    setConfirmacao({
      disciplina,
      titulo: 'Excluir disciplina',
      mensagem: `Deseja excluir a disciplina ${disciplina.nome}? Esta ação não pode ser desfeita.`,
    })
  }

  async function excluirDisciplina(disciplina) {
    try {
      setExcluindoId(disciplina.id)
      setErro('')
      setAviso('')

      await deletarDisciplina(disciplina.id)
      await carregarDados()
      setAviso('Disciplina excluida com sucesso.')
    } catch (error) {
      const mensagem =
        error.response?.data?.message || 'Nao foi possivel excluir a disciplina.'

      setErro(mensagem)
    } finally {
      setExcluindoId(null)
    }
  }

  async function confirmarExclusaoDisciplina() {
    if (!confirmacao) {
      return
    }

    const { disciplina } = confirmacao
    setConfirmacao(null)
    await excluirDisciplina(disciplina)
  }

  return (
    <section className="disciplinas-page">
      <div className="disciplinas-header">
        <p>Gerenciar disciplinas</p>

        <button
          type="button"
          className="disciplinas-new-button"
          onClick={abrirModalCadastro}
        >
          <Plus size={18} />
          <span>Nova Disciplina</span>
        </button>
      </div>

      <div className="disciplinas-card">
        <div className="disciplinas-toolbar">
          <div className="disciplinas-search-field">
            <Search size={18} />
            <input
              className="disciplinas-search"
              type="text"
              placeholder="Buscar..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </div>
        </div>

        <table className="disciplinas-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Professor</th>
              <th>RA Professor</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {carregando && (
              <tr>
                <td className="disciplinas-empty" colSpan="5">
                  Carregando disciplinas...
                </td>
              </tr>
            )}

            {!carregando && erro && (
              <tr>
                <td className="disciplinas-error" colSpan="5">
                  {erro}
                </td>
              </tr>
            )}

            {!carregando && !erro && disciplinasFiltradas.length === 0 && (
              <tr>
                <td className="disciplinas-empty" colSpan="5">
                  Nenhuma disciplina encontrada.
                </td>
              </tr>
            )}

            {!carregando &&
              !erro &&
              disciplinasFiltradas.map((disciplina) => (
                <tr key={disciplina.id}>
                  <td>{disciplina.id}</td>
                  <td>{disciplina.nome}</td>
                  <td>{disciplina.professorNome}</td>
                  <td>{disciplina.professorRa}</td>
                  <td>
                    <div className="disciplinas-actions">
                      <button
                        type="button"
                        className="disciplinas-action-button"
                        aria-label="Editar disciplina"
                        onClick={() => abrirModalEdicao(disciplina)}
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        className="disciplinas-action-button disciplinas-action-button--danger"
                        aria-label="Excluir disciplina"
                        onClick={() => pedirExclusaoDisciplina(disciplina)}
                        disabled={excluindoId === disciplina.id}
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
        <div className="disciplinas-modal-backdrop">
          <div
            className="disciplinas-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="disciplinas-modal-title"
          >
            <div className="disciplinas-modal-header">
              <div>
                <h2 id="disciplinas-modal-title">
                  {disciplinaEditando ? 'Editar disciplina' : 'Nova disciplina'}
                </h2>
                <p>
                  {disciplinaEditando
                    ? 'Atualize os dados da disciplina selecionada.'
                    : 'Informe os dados para cadastrar uma disciplina.'}
                </p>
              </div>

              <button
                type="button"
                className="disciplinas-modal-close"
                onClick={fecharModalCadastro}
                aria-label="Fechar formulario"
              >
                <X size={18} />
              </button>
            </div>

            <form className="disciplinas-form" onSubmit={salvarDisciplina}>
              <label className="disciplinas-form-field">
                <span>Nome</span>
                <input
                  type="text"
                  name="nome"
                  placeholder="Ex: Matematica"
                  value={formulario.nome}
                  onChange={atualizarCampo}
                />
              </label>

              <label className="disciplinas-form-field">
                <span>Professor</span>
                <select
                  name="professorId"
                  value={formulario.professorId}
                  onChange={atualizarCampo}
                >
                  <option value="">Selecione um professor</option>
                  {professores.map((professor) => (
                    <option value={professor.id} key={professor.id}>
                      {professor.usuarioNome} - RA {professor.ra}
                    </option>
                  ))}
                </select>
                <small className="disciplinas-form-help">
                  O backend bloqueia disciplinas com professor inativo.
                </small>
              </label>

              {erroFormulario && (
                <p className="disciplinas-form-error">{erroFormulario}</p>
              )}

              <div className="disciplinas-form-actions">
                <button
                  type="button"
                  className="disciplinas-form-button disciplinas-form-button--secondary"
                  onClick={fecharModalCadastro}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="disciplinas-form-button disciplinas-form-button--primary"
                  disabled={salvando}
                >
                  {salvando ? 'Salvando...' : 'Salvar disciplina'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmacao && (
        <div className="disciplinas-confirm-backdrop">
          <div
            className="disciplinas-confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="disciplinas-confirm-title"
          >
            <h2 id="disciplinas-confirm-title">{confirmacao.titulo}</h2>
            <p>{confirmacao.mensagem}</p>

            <div className="disciplinas-confirm-actions">
              <button
                type="button"
                className="disciplinas-confirm-button disciplinas-confirm-button--secondary"
                onClick={() => setConfirmacao(null)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="disciplinas-confirm-button disciplinas-confirm-button--danger"
                onClick={confirmarExclusaoDisciplina}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {aviso && <div className="disciplinas-toast">{aviso}</div>}
    </section>
  )
}

export default Disciplinas
