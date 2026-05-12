import { useState } from 'react'
import './MainLayout.css'

const cadastroItems = [
  'Usuarios',
  'Alunos',
  'Professores',
  'Turmas',
  'Disciplinas',
  'Avaliacoes',
]

const mainItems = ['Notas', 'Aulas', 'Frequencia', 'Boletins']

function MainLayout({ children, section, title }) {
  const [cadastroAberto, setCadastroAberto] = useState(true)

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="sidebar__brand-icon">N</span>
          <div>
            <strong>NOTAZ</strong>
            <small>Painel academico</small>
          </div>
        </div>

        <nav className="sidebar__nav" aria-label="Menu principal">
          <a className="sidebar__link sidebar__link--active" href="#dashboard">
            Dashboard
          </a>

          <button
            type="button"
            className={`sidebar__toggle ${cadastroAberto ? 'sidebar__toggle--open' : ''}`}
            onClick={() => setCadastroAberto(!cadastroAberto)}
          >
            <span>Cadastros</span>
            <span className="sidebar__chevron">⌄</span>
          </button>

          {cadastroAberto && (
            <div className="sidebar__submenu">
              {cadastroItems.map((item) => (
                <a className="sidebar__link sidebar__link--nested" href="#" key={item}>
                  {item}
                </a>
              ))}
            </div>
          )}

          {mainItems.map((item) => (
            <a className="sidebar__link" href="#" key={item}>
              {item}
            </a>
          ))}
        </nav>
      </aside>

      <div className="app-content">
        <header className="topbar">
          <div>
            <span className="topbar__eyebrow">{section}</span>
            <h1>{title}</h1>
          </div>

          <div className="topbar__user">
            <span>Admin</span>
            <div className="topbar__avatar">A</div>
          </div>
        </header>

        <main className="page">{children}</main>
      </div>
    </div>
  )
}

export default MainLayout
