import { useEffect, useMemo, useState } from 'react'
import {
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import {
  ativarUsuario,
  atualizarUsuario,
  cadastrarUsuario,
  deletarUsuario,
  desativarUsuario,
  listarUsuarios,
} from '../../../services/usuarioService'
import './Usuario.css'

const formularioInicial = {
  nome: '',
  email: '',
  senha: '',
  tipo: '',
}

const tiposUsuario = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'PROFESSOR', label: 'Professor' },
  { value: 'ALUNO', label: 'Aluno' },
]

function formatarData(data) {
  if (!data) {
    return '-'
  }

  return new Intl.DateTimeFormat('pt-BR').format(new Date(data))
}

function usuarioEstaAtivo(usuario) {
  const valor = usuario.ativo ?? usuario.status ?? usuario.active

  return valor === true || valor === 1 || valor === '1' || valor === 'true'
}

function Usuario() {
  const [usuarios, setUsuarios] = useState([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [usuarioEditando, setUsuarioEditando] = useState(null)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erroFormulario, setErroFormulario] = useState('')
  const [excluindoId, setExcluindoId] = useState(null)
  const [alterandoStatusId, setAlterandoStatusId] = useState(null)
  const [aviso, setAviso] = useState('')
  const [confirmacao, setConfirmacao] = useState(null)

  useEffect(() => {
    carregarUsuarios()
  }, [])

  async function carregarUsuarios() {
    try {
      setCarregando(true)
      setErro('')

      const response = await listarUsuarios()
      setUsuarios(response.data)
    } catch (error) {
      const mensagem =
        error.response?.data?.message || 'Nao foi possivel carregar os usuarios.'

      setErro(mensagem)
    } finally {
      setCarregando(false)
    }
  }

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    if (!termo) {
      return usuarios
    }

    return usuarios.filter((usuario) => {
      const nome = usuario.nome?.toLowerCase() ?? ''
      const email = usuario.email?.toLowerCase() ?? ''
      const tipo = usuario.tipo?.toLowerCase() ?? ''

      return (
        nome.includes(termo) ||
        email.includes(termo) ||
        tipo.includes(termo)
      )
    })
  }, [busca, usuarios])

  function abrirModalCadastro() {
    setFormulario(formularioInicial)
    setUsuarioEditando(null)
    setMostrarSenha(false)
    setErroFormulario('')
    setModalAberto(true)
  }

  function abrirModalEdicao(usuario) {
    setFormulario({
      nome: usuario.nome ?? '',
      email: usuario.email ?? '',
      senha: '',
      tipo: usuario.tipo ?? '',
    })
    setUsuarioEditando(usuario)
    setMostrarSenha(false)
    setErroFormulario('')
    setModalAberto(true)
  }

  function fecharModalCadastro() {
    if (salvando) {
      return
    }

    setModalAberto(false)
    setFormulario(formularioInicial)
    setUsuarioEditando(null)
    setMostrarSenha(false)
    setErroFormulario('')
  }

  function atualizarCampo(event) {
    const { name, value } = event.target

    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [name]: value,
    }))
  }

  async function salvarUsuario(event) {
    event.preventDefault()

    const usuario = {
      nome: formulario.nome.trim(),
      email: formulario.email.trim(),
      tipo: formulario.tipo,
    }

    const senha = formulario.senha.trim()

    if (!usuario.nome || !usuario.email || !usuario.tipo) {
      setErroFormulario('Preencha todos os campos para cadastrar o usuario.')
      return
    }

    if (!usuarioEditando && !senha) {
      setErroFormulario('Informe uma senha para cadastrar o usuario.')
      return
    }

    if (senha) {
      usuario.senha = senha
    }

    try {
      setSalvando(true)
      setErroFormulario('')

      if (usuarioEditando) {
        await atualizarUsuario(usuarioEditando.id, usuario)
      } else {
        await cadastrarUsuario(usuario)
      }

      await carregarUsuarios()

      setModalAberto(false)
      setFormulario(formularioInicial)
      setUsuarioEditando(null)
      setMostrarSenha(false)
      setAviso(
        usuarioEditando
          ? 'Usuario atualizado com sucesso.'
          : 'Usuario cadastrado com sucesso.',
      )
    } catch (error) {
      const mensagem =
        error.response?.data?.message || 'Nao foi possivel salvar o usuario.'

      setErroFormulario(mensagem)
    } finally {
      setSalvando(false)
    }
  }

  function pedirExclusaoUsuario(usuario) {
    setConfirmacao({
      tipo: 'excluir',
      usuario,
      titulo: 'Excluir usuario',
      mensagem: `Deseja excluir o usuario ${usuario.nome}? Esta acao nao pode ser desfeita.`,
      textoConfirmar: 'Excluir',
    })
  }

  async function excluirUsuario(usuario) {
    try {
      setExcluindoId(usuario.id)
      setErro('')
      setAviso('')

      await deletarUsuario(usuario.id)
      await carregarUsuarios()
      setAviso('Usuario excluido com sucesso.')
    } catch (error) {
      const mensagem =
        error.response?.data?.message || 'Nao foi possivel excluir o usuario.'

      setErro(mensagem)
    } finally {
      setExcluindoId(null)
    }
  }

  function pedirAlteracaoStatusUsuario(usuario) {
    const estaAtivo = usuarioEstaAtivo(usuario)
    const acao = estaAtivo ? 'desativar' : 'ativar'

    setConfirmacao({
      tipo: 'status',
      usuario,
      titulo: estaAtivo ? 'Desativar usuario' : 'Ativar usuario',
      mensagem: `Deseja ${acao} o usuario ${usuario.nome}?`,
      textoConfirmar: estaAtivo ? 'Desativar' : 'Ativar',
    })
  }

  async function alterarStatusUsuario(usuario) {
    const estaAtivo = usuarioEstaAtivo(usuario)
    const acao = estaAtivo ? 'desativar' : 'ativar'

    try {
      setAlterandoStatusId(usuario.id)
      setErro('')
      setAviso('')

      if (estaAtivo) {
        await desativarUsuario(usuario.id)
        setAviso('Usuario desativado com sucesso.')
      } else {
        await ativarUsuario(usuario.id)
        setAviso('Usuario ativado com sucesso.')
      }

      await carregarUsuarios()
    } catch (error) {
      const mensagem =
        error.response?.data?.message ||
        `Nao foi possivel ${acao} o usuario.`

      setErro(mensagem)
    } finally {
      setAlterandoStatusId(null)
    }
  }

  async function confirmarAcaoUsuario() {
    if (!confirmacao) {
      return
    }

    const { tipo, usuario } = confirmacao
    setConfirmacao(null)

    if (tipo === 'excluir') {
      await excluirUsuario(usuario)
      return
    }

    await alterarStatusUsuario(usuario)
  }

  return (
    <section className="usuarios-page">
      <div className="usuarios-header">
        <p>Gerenciar usuarios</p>

        <button
          type="button"
          className="usuarios-new-button"
          onClick={abrirModalCadastro}
        >
          <Plus size={18} />
          <span>Novo Usuario</span>
        </button>
      </div>

      <div className="usuarios-card">
        <div className="usuarios-toolbar">
          <div className="usuarios-search-field">
            <Search size={18} />
            <input
              className="usuarios-search"
              type="text"
              placeholder="Buscar..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </div>
        </div>

        <table className="usuarios-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Ativo</th>
              <th>Data de criacao</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {carregando && (
              <tr>
                <td className="usuarios-empty" colSpan="7">
                  Carregando usuarios...
                </td>
              </tr>
            )}

            {!carregando && erro && (
              <tr>
                <td className="usuarios-error" colSpan="7">
                  {erro}
                </td>
              </tr>
            )}

            {!carregando && !erro && usuariosFiltrados.length === 0 && (
              <tr>
                <td className="usuarios-empty" colSpan="7">
                  Nenhum usuario encontrado.
                </td>
              </tr>
            )}

            {!carregando &&
              !erro &&
              usuariosFiltrados.map((usuario) => {
                const estaAtivo = usuarioEstaAtivo(usuario)

                return (
                  <tr key={usuario.id}>
                    <td>{usuario.id}</td>
                    <td>{usuario.nome}</td>
                    <td>{usuario.email}</td>
                    <td>
                      <span className="usuarios-badge usuarios-badge--tipo">
                        {usuario.tipo}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`usuarios-badge ${
                          estaAtivo
                            ? 'usuarios-badge--active'
                            : 'usuarios-badge--inactive'
                        }`}
                      >
                        {estaAtivo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>{formatarData(usuario.dataCriacao)}</td>
                    <td>
                      <div className="usuarios-actions">
                        <button
                          type="button"
                          className="usuarios-action-button"
                          aria-label="Editar usuario"
                          onClick={() => abrirModalEdicao(usuario)}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          className="usuarios-action-button usuarios-action-button--danger"
                          aria-label="Excluir usuario"
                          onClick={() => pedirExclusaoUsuario(usuario)}
                          disabled={excluindoId === usuario.id}
                        >
                          <Trash2 size={17} />
                        </button>

                        <button
                          type="button"
                          className={`usuarios-action-button ${
                            estaAtivo
                              ? 'usuarios-action-button--warning'
                              : 'usuarios-action-button--success'
                          }`}
                          aria-label={
                            estaAtivo ? 'Desativar usuario' : 'Ativar usuario'
                          }
                          onClick={() => pedirAlteracaoStatusUsuario(usuario)}
                          disabled={alterandoStatusId === usuario.id}
                        >
                          {estaAtivo ? (
                            <PowerOff size={17} />
                          ) : (
                            <Power size={17} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div className="usuarios-modal-backdrop">
          <div
            className="usuarios-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="usuarios-modal-title"
          >
            <div className="usuarios-modal-header">
              <div>
                <h2 id="usuarios-modal-title">
                  {usuarioEditando ? 'Editar usuario' : 'Novo usuario'}
                </h2>
                <p>
                  {usuarioEditando
                    ? 'Atualize os dados do usuario selecionado.'
                    : 'Informe os dados para cadastrar um usuario.'}
                </p>
              </div>

              <button
                type="button"
                className="usuarios-modal-close"
                onClick={fecharModalCadastro}
                aria-label="Fechar formulario"
              >
                <X size={18} />
              </button>
            </div>

            <form className="usuarios-form" onSubmit={salvarUsuario}>
              <label className="usuarios-form-field">
                <span>Nome</span>
                <input
                  type="text"
                  name="nome"
                  placeholder="Ex: Maria Silva"
                  value={formulario.nome}
                  onChange={atualizarCampo}
                />
              </label>

              <label className="usuarios-form-field">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  placeholder="Ex: maria@email.com"
                  value={formulario.email}
                  onChange={atualizarCampo}
                />
              </label>

              <label className="usuarios-form-field">
                <span>Senha</span>
                <div className="usuarios-password-field">
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    name="senha"
                    placeholder={
                      usuarioEditando
                        ? 'Deixe em branco para manter a senha'
                        : 'Digite uma senha'
                    }
                    value={formulario.senha}
                    onChange={atualizarCampo}
                  />
                  <button
                    type="button"
                    className="usuarios-password-toggle"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <label className="usuarios-form-field">
                <span>Tipo</span>
                <select
                  name="tipo"
                  value={formulario.tipo}
                  onChange={atualizarCampo}
                  disabled={Boolean(usuarioEditando)}
                >
                  <option value="">Selecione um tipo</option>
                  {tiposUsuario.map((tipo) => (
                    <option value={tipo.value} key={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
                {usuarioEditando && (
                  <small className="usuarios-form-help">
                    O tipo do usuario nao pode ser alterado apos o cadastro.
                  </small>
                )}
              </label>

              {erroFormulario && (
                <p className="usuarios-form-error">{erroFormulario}</p>
              )}

              <div className="usuarios-form-actions">
                <button
                  type="button"
                  className="usuarios-form-button usuarios-form-button--secondary"
                  onClick={fecharModalCadastro}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="usuarios-form-button usuarios-form-button--primary"
                  disabled={salvando}
                >
                  {salvando ? 'Salvando...' : 'Salvar usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmacao && (
        <div className="usuarios-confirm-backdrop">
          <div
            className="usuarios-confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="usuarios-confirm-title"
          >
            <h2 id="usuarios-confirm-title">{confirmacao.titulo}</h2>
            <p>{confirmacao.mensagem}</p>

            <div className="usuarios-confirm-actions">
              <button
                type="button"
                className="usuarios-confirm-button usuarios-confirm-button--secondary"
                onClick={() => setConfirmacao(null)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className={`usuarios-confirm-button ${
                  confirmacao.tipo === 'excluir'
                    ? 'usuarios-confirm-button--danger'
                    : 'usuarios-confirm-button--primary'
                }`}
                onClick={confirmarAcaoUsuario}
              >
                {confirmacao.textoConfirmar}
              </button>
            </div>
          </div>
        </div>
      )}

      {aviso && <div className="usuarios-toast">{aviso}</div>}
    </section>
  )
}

export default Usuario
