import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import {
  atualizarAluno,
  cadastrarAluno,
  deletarAluno,
  listarAlunos,
} from '../../../services/alunoService'
import { listarTurmas } from '../../../services/turmaService'
import { listarUsuarios } from '../../../services/usuarioService'
import './Alunos.css'

const formularioInicial = {
  matricula: '',
  dataNascimento: '',
  usuarioId: '',
  turmaId: '',
}

function usuarioEstaAtivo(usuario) {
  const valor = usuario.ativo ?? usuario.status ?? usuario.active

  return valor === true || valor === 1 || valor === '1' || valor === 'true'
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

function Alunos() {
  const [alunos, setAlunos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [turmas, setTurmas] = useState([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [alunoEditando, setAlunoEditando] = useState(null)
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

      const [alunosResponse, usuariosResponse, turmasResponse] =
        await Promise.all([listarAlunos(), listarUsuarios(), listarTurmas()])

      setAlunos(alunosResponse.data)
      setUsuarios(usuariosResponse.data)
      setTurmas(turmasResponse.data)
    } catch (error) {
      const mensagem =
        error.response?.data?.message || 'Nao foi possivel carregar os dados.'

      setErro(mensagem)
    } finally {
      setCarregando(false)
    }
  }

  const usuariosAlunosAtivos = useMemo(() => {
    return usuarios.filter(
      (usuario) => usuario.tipo === 'ALUNO' && usuarioEstaAtivo(usuario),
    )
  }, [usuarios])

  const turmasPorId = useMemo(() => {
    return turmas.reduce((mapa, turma) => {
      mapa[turma.id] = turma
      return mapa
    }, {})
  }, [turmas])

  const alunosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()

    if (!termo) {
      return alunos
    }

    return alunos.filter((aluno) => {
      const turma = turmasPorId[aluno.turmaId]
      const matricula = aluno.matricula?.toLowerCase() ?? ''
      const nome = aluno.usuarioNome?.toLowerCase() ?? ''
      const turmaTexto = descreverTurma(turma).toLowerCase()

      return (
        matricula.includes(termo) ||
        nome.includes(termo) ||
        turmaTexto.includes(termo)
      )
    })
  }, [alunos, busca, turmasPorId])

  function abrirModalCadastro() {
    setFormulario(formularioInicial)
    setAlunoEditando(null)
    setErroFormulario('')
    setModalAberto(true)
  }

  function abrirModalEdicao(aluno) {
    setFormulario({
      matricula: aluno.matricula ?? '',
      dataNascimento: aluno.dataNascimento ?? '',
      usuarioId: String(aluno.usuarioId ?? ''),
      turmaId: String(aluno.turmaId ?? ''),
    })
    setAlunoEditando(aluno)
    setErroFormulario('')
    setModalAberto(true)
  }

  function fecharModalCadastro() {
    if (salvando) {
      return
    }

    setModalAberto(false)
    setFormulario(formularioInicial)
    setAlunoEditando(null)
    setErroFormulario('')
  }

  function atualizarCampo(event) {
    const { name, value } = event.target

    setFormulario((formularioAtual) => ({
      ...formularioAtual,
      [name]: value,
    }))
  }

  async function salvarAluno(event) {
    event.preventDefault()

    const aluno = {
      matricula: formulario.matricula.trim(),
      dataNascimento: formulario.dataNascimento,
      usuarioId: Number(formulario.usuarioId),
      turmaId: Number(formulario.turmaId),
    }

    if (
      !aluno.matricula ||
      !aluno.dataNascimento ||
      !aluno.usuarioId ||
      !aluno.turmaId
    ) {
      setErroFormulario('Preencha todos os campos para salvar o aluno.')
      return
    }

    try {
      setSalvando(true)
      setErroFormulario('')

      if (alunoEditando) {
        await atualizarAluno(alunoEditando.id, aluno)
      } else {
        await cadastrarAluno(aluno)
      }

      await carregarDados()

      setModalAberto(false)
      setFormulario(formularioInicial)
      setAlunoEditando(null)
      setAviso(
        alunoEditando
          ? 'Aluno atualizado com sucesso.'
          : 'Aluno cadastrado com sucesso.',
      )
    } catch (error) {
      const mensagem =
        error.response?.data?.message || 'Nao foi possivel salvar o aluno.'

      setErroFormulario(mensagem)
    } finally {
      setSalvando(false)
    }
  }

  function pedirExclusaoAluno(aluno) {
    setConfirmacao({
      aluno,
      titulo: 'Excluir aluno',
      mensagem: `Deseja excluir o aluno ${aluno.usuarioNome}? Esta acao nao pode ser desfeita.`,
    })
  }

  async function excluirAluno(aluno) {
    try {
      setExcluindoId(aluno.id)
      setErro('')
      setAviso('')

      await deletarAluno(aluno.id)
      await carregarDados()
      setAviso('Aluno excluido com sucesso.')
    } catch (error) {
      const mensagem =
        error.response?.data?.message || 'Nao foi possivel excluir o aluno.'

      setErro(mensagem)
    } finally {
      setExcluindoId(null)
    }
  }

  async function confirmarExclusaoAluno() {
    if (!confirmacao) {
      return
    }

    const { aluno } = confirmacao
    setConfirmacao(null)
    await excluirAluno(aluno)
  }

  return (
    <section className="alunos-page">
      <div className="alunos-header">
        <p>Gerenciar alunos</p>

        <button
          type="button"
          className="alunos-new-button"
          onClick={abrirModalCadastro}
        >
          <Plus size={18} />
          <span>Novo Aluno</span>
        </button>
      </div>

      <div className="alunos-card">
        <div className="alunos-toolbar">
          <div className="alunos-search-field">
            <Search size={18} />
            <input
              className="alunos-search"
              type="text"
              placeholder="Buscar..."
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </div>
        </div>

        <table className="alunos-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Matricula</th>
              <th>Nome do usuario</th>
              <th>Turma</th>
              <th>Data de nascimento</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {carregando && (
              <tr>
                <td className="alunos-empty" colSpan="6">
                  Carregando alunos...
                </td>
              </tr>
            )}

            {!carregando && erro && (
              <tr>
                <td className="alunos-error" colSpan="6">
                  {erro}
                </td>
              </tr>
            )}

            {!carregando && !erro && alunosFiltrados.length === 0 && (
              <tr>
                <td className="alunos-empty" colSpan="6">
                  Nenhum aluno encontrado.
                </td>
              </tr>
            )}

            {!carregando &&
              !erro &&
              alunosFiltrados.map((aluno) => (
                <tr key={aluno.id}>
                  <td>{aluno.id}</td>
                  <td>{aluno.matricula}</td>
                  <td>{aluno.usuarioNome}</td>
                  <td>{descreverTurma(turmasPorId[aluno.turmaId])}</td>
                  <td>{formatarData(aluno.dataNascimento)}</td>
                  <td>
                    <div className="alunos-actions">
                      <button
                        type="button"
                        className="alunos-action-button"
                        aria-label="Editar aluno"
                        onClick={() => abrirModalEdicao(aluno)}
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        className="alunos-action-button alunos-action-button--danger"
                        aria-label="Excluir aluno"
                        onClick={() => pedirExclusaoAluno(aluno)}
                        disabled={excluindoId === aluno.id}
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
        <div className="alunos-modal-backdrop">
          <div
            className="alunos-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="alunos-modal-title"
          >
            <div className="alunos-modal-header">
              <div>
                <h2 id="alunos-modal-title">
                  {alunoEditando ? 'Editar aluno' : 'Novo aluno'}
                </h2>
                <p>
                  {alunoEditando
                    ? 'Atualize os dados do aluno selecionado.'
                    : 'Informe os dados para cadastrar um aluno.'}
                </p>
              </div>

              <button
                type="button"
                className="alunos-modal-close"
                onClick={fecharModalCadastro}
                aria-label="Fechar formulario"
              >
                <X size={18} />
              </button>
            </div>

            <form className="alunos-form" onSubmit={salvarAluno}>
              <label className="alunos-form-field">
                <span>Matricula</span>
                <input
                  type="text"
                  name="matricula"
                  placeholder="Ex: 2026001"
                  value={formulario.matricula}
                  onChange={atualizarCampo}
                />
              </label>

              <label className="alunos-form-field">
                <span>Data de nascimento</span>
                <input
                  type="date"
                  name="dataNascimento"
                  value={formulario.dataNascimento}
                  onChange={atualizarCampo}
                />
              </label>

              <label className="alunos-form-field">
                <span>Usuario</span>
                <select
                  name="usuarioId"
                  value={formulario.usuarioId}
                  onChange={atualizarCampo}
                >
                  <option value="">Selecione um usuario aluno ativo</option>
                  {usuariosAlunosAtivos.map((usuario) => (
                    <option value={usuario.id} key={usuario.id}>
                      {usuario.nome} - {usuario.email}
                    </option>
                  ))}
                </select>
                <small className="alunos-form-help">
                  Apenas usuarios ativos do tipo ALUNO aparecem aqui.
                </small>
              </label>

              <label className="alunos-form-field">
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

              {erroFormulario && (
                <p className="alunos-form-error">{erroFormulario}</p>
              )}

              <div className="alunos-form-actions">
                <button
                  type="button"
                  className="alunos-form-button alunos-form-button--secondary"
                  onClick={fecharModalCadastro}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="alunos-form-button alunos-form-button--primary"
                  disabled={salvando}
                >
                  {salvando ? 'Salvando...' : 'Salvar aluno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmacao && (
        <div className="alunos-confirm-backdrop">
          <div
            className="alunos-confirm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="alunos-confirm-title"
          >
            <h2 id="alunos-confirm-title">{confirmacao.titulo}</h2>
            <p>{confirmacao.mensagem}</p>

            <div className="alunos-confirm-actions">
              <button
                type="button"
                className="alunos-confirm-button alunos-confirm-button--secondary"
                onClick={() => setConfirmacao(null)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="alunos-confirm-button alunos-confirm-button--danger"
                onClick={confirmarExclusaoAluno}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {aviso && <div className="alunos-toast">{aviso}</div>}
    </section>
  )
}

export default Alunos
