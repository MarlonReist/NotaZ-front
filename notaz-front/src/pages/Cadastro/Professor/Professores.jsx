import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import {
  atualizarProfessor,
  cadastrarProfessor,
  deletarProfessor,
  listarProfessores,
} from '../../../services/professorService'
import { listarUsuarios } from '../../../services/usuarioService'
import './Professores.css'

const formularioInicial = {
  ra: '',
  usuarioId: '',
}

function usuarioEstaAtivo(usuario) {
  const valor = usuario.ativo ?? usuario.status ?? usuario.active

  return valor === true || valor === 1 || valor === '1' || valor === 'true'
}

function Professores() {
  const [professores, setProfessores] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [professorEditando, setProfessorEditando] = useState(null)
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

      const [professoresResponse, usuariosResponse] = await Promise.all([
        listarProfessores(),
        listarUsuarios(),
      ])

      setProfessores(professoresResponse.data)
      setUsuarios(usuariosResponse.data)
    } catch (error) {
      const mensagem =
        error.response?.data?.message || 'Nao foi possivel carregar os dados.'

      setErro(mensagem)
    } finally {
      setCarregando(false)
    }
  }

  const usuariosProfessoresAtivos = useMemo(() => {
    return usuarios.filter(
      (usuario) => usuario.tipo === 'PROFESSOR' && usuarioEstaAtivo(usuario),
    )
  }, [usuarios])

  const professoresFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    if (!termo) {
      return professores
    }

    return professores.filter((professor) => {
      const ra = professor.ra?.toLowerCase() ?? ''
      const nome = professor.usuarioNome?.toLowerCase() ?? ''

      return ra.includes(termo) || nome.includes(termo)
    })
  }, [busca, professores])

  function abrirModalCadastro() {
    setFormulario(formularioInicial)
    setProfessorEditando(null)
    setErroFormulario('')
    setModalAberto(true)
  }

  function abrirModalEdicao(professor) {
    setFormulario({
      ra: professor.ra ?? '',
      usuarioId: String(professor.usuarioId ?? ''),
    })
    setProfessorEditando(professor)
    setErroFormulario('')
    setModalAberto(true)
  }

  function fecharModalCadastro() {
    if (salvando) {
      return
    }

    setModalAberto(false)
    setFormulario(formularioInicial)
    setProfessorEditando(null)
    setErroFormulario('')
  }

  function atualizarCampo(event) {
    const { name, value } = event.target

    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [name]: value,
    }))
  }

  async function salvarProfessor(event) {
    event.preventDefault()

    const professor = {
      ra: formulario.ra.trim(),
      usuarioId: Number(formulario.usuarioId),
    }

    if (!professor.ra || !professor.usuarioId) {
      setErroFormulario('Preencha RA e usuario para salvar o professor.')
      return
    }

    try {
      setSalvando(true)
      setErroFormulario('')

      if (professorEditando) {
        await atualizarProfessor(professorEditando.id, professor)
      } else {
        await cadastrarProfessor(professor)
      }

      await carregarDados()

      setModalAberto(false)
      setFormulario(formularioInicial)
      setProfessorEditando(null)
      setAviso(
        professorEditando
          ? 'Professor atualizado com sucesso.'
          : 'Professor cadastrado com sucesso.',
      )
    } catch (error) {
      const mensagem =
        error.response?.data?.message || 'Nao foi possivel salvar o professor.'

      setErroFormulario(mensagem)
    } finally {
      setSalvando(false)
    }
  }

  function pedirExclusaoProfessor(professor) {
    setConfirmacao({
      professor,
      titulo: 'Excluir professor',
      mensagem: `Deseja excluir o professor ${professor.usuarioNome}? Esta acao nao pode ser desfeita.`,
    })
  }

  async function excluirProfessor(professor) {
    try {
      setExcluindoId(professor.id)
      setErro('')
      setAviso('')

      await deletarProfessor(professor.id)
      await carregarDados()
      setAviso('Professor excluido com sucesso.')
    } catch (error) {
      const mensagem =
        error.response?.data?.message || 'Nao foi possivel excluir o professor.'

      setErro(mensagem)
    } finally {
      setExcluindoId(null)
    }
  }

  async function confirmarExclusaoProfessor() {
    if (!confirmacao) {
      return
    }

    const { professor } = confirmacao
    setConfirmacao(null)
    await excluirProfessor(professor)
  }

  return (
    <section className="professores-page">
      <div className="professores-header">
        <p>Gerenciar professores</p>

        <button
          type="button"
          className="professores-new-button"
          onClick={abrirModalCadastro}
        >
          <Plus size={18} />
          <span>Novo Professor</span>
        </button>
      </div>

      <div className="professores-card">
        <div className="professores-toolbar">
          <div className="professores-search-field">
            <Search size={18} />
            <input
              className="professores-search"
              type="text"
              placeholder="Buscar..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </div>
        </div>

        <table className="professores-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>RA</th>
              <th>Nome do usuario</th>
              <th>Acoes</th>
            </tr>
          </thead>

          <tbody>
            {carregando && (
              <tr>
                <td className="professores-empty" colSpan="4">
                  Carregando professores...
                </td>
              </tr>
            )}

            {!carregando && erro && (
              <tr>
                <td className="professores-error" colSpan="4">
                  {erro}
                </td>
              </tr>
            )}

            {!carregando && !erro && professoresFiltrados.length === 0 && (
              <tr>
                <td className="professores-empty" colSpan="4">
                  Nenhum professor encontrado.
                </td>
              </tr>
            )}

            {!carregando &&
              !erro &&
              professoresFiltrados.map((professor) => (
                <tr key={professor.id}>
                  <td>{professor.id}</td>
                  <td>{professor.ra}</td>
                  <td>{professor.usuarioNome}</td>
                  <td>
                    <div className="professores-actions">
                      <button
                        type="button"
                        className="professores-action-button"
                        aria-label="Editar professor"
                        onClick={() => abrirModalEdicao(professor)}
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        className="professores-action-button professores-action-button--danger"
                        aria-label="Excluir professor"
                        onClick={() => pedirExclusaoProfessor(professor)}
                        disabled={excluindoId === professor.id}
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
        <div className="professores-modal-backdrop">
          <div
            className="professores-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="professores-modal-title"
          >
            <div className="professores-modal-header">
              <div>
                <h2 id="professores-modal-title">
                  {professorEditando ? 'Editar professor' : 'Novo professor'}
                </h2>
                <p>
                  {professorEditando
                    ? 'Atualize os dados do professor selecionado.'
                    : 'Informe os dados para cadastrar um professor.'}
                </p>
              </div>

              <button
                type="button"
                className="professores-modal-close"
                onClick={fecharModalCadastro}
                aria-label="Fechar formulario"
              >
                <X size={18} />
              </button>
            </div>

            <form className="professores-form" onSubmit={salvarProfessor}>
              <label className="professores-form-field">
                <span>RA</span>
                <input
                  type="text"
                  name="ra"
                  placeholder="Ex: 2026001"
                  value={formulario.ra}
                  onChange={atualizarCampo}
                />
              </label>

              <label className="professores-form-field">
                <span>Usuario</span>
                <select
                  name="usuarioId"
                  value={formulario.usuarioId}
                  onChange={atualizarCampo}
                >
                  <option value="">Selecione um usuario professor ativo</option>
                  {usuariosProfessoresAtivos.map((usuario) => (
                    <option value={usuario.id} key={usuario.id}>
                      {usuario.nome} - {usuario.email}
                    </option>
                  ))}
                </select>
                <small className="professores-form-help">
                  Apenas usuarios ativos do tipo PROFESSOR aparecem aqui.
                </small>
              </label>

              {erroFormulario && (
                <p className="professores-form-error">{erroFormulario}</p>
              )}

              <div className="professores-form-actions">
                <button
                  type="button"
                  className="professores-form-button professores-form-button--secondary"
                  onClick={fecharModalCadastro}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="professores-form-button professores-form-button--primary"
                  disabled={salvando}
                >
                  {salvando ? 'Salvando...' : 'Salvar professor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmacao && (
        <div className="professores-confirm-backdrop">
          <div
            className="professores-confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="professores-confirm-title"
          >
            <h2 id="professores-confirm-title">{confirmacao.titulo}</h2>
            <p>{confirmacao.mensagem}</p>

            <div className="professores-confirm-actions">
              <button
                type="button"
                className="professores-confirm-button professores-confirm-button--secondary"
                onClick={() => setConfirmacao(null)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="professores-confirm-button professores-confirm-button--danger"
                onClick={confirmarExclusaoProfessor}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {aviso && <div className="professores-toast">{aviso}</div>}
    </section>
  )
}

export default Professores
