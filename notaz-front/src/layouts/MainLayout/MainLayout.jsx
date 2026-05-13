import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  BookOpen,
  Calendar,
  ChevronDown,
  ClipboardCheck,
  FileText,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  NotebookPen,
  School,
  UserRound,
  UsersRound,
} from 'lucide-react'
import './MainLayout.css'

const cadastroItems = [
  { label: 'Usuários', path: '/usuarios', icon: UsersRound },
  { label: 'Alunos', path: '/alunos', icon: GraduationCap },
  { label: 'Professores', path: '/professores', icon: UserRound },
  { label: 'Turmas', path: '/turmas', icon: School },
  { label: 'Disciplinas', path: '/disciplinas', icon: BookOpen },
  { label: 'Avaliações', path: '/avaliacoes', icon: ClipboardCheck },
]

const mainItems = [
  { label: 'Notas', path: '/notas', icon: FileText },
  { label: 'Aulas', path: '/aulas', icon: Calendar },
  { label: 'Frequência', path: '/frequencias', icon: NotebookPen },
  { label: 'Boletins', path: '/boletins', icon: ClipboardCheck },
]

const pageTitles = {
  '/': 'Visao geral',
  '/dashboard': 'Visão geral',
  '/usuarios': 'Usuários',
  '/alunos': 'Alunos',
  '/professores': 'Professores',
  '/turmas': 'Turmas',
  '/disciplinas': 'Disciplinas',
  '/avaliacoes': 'Avaliações',
  '/notas': 'Lançamento de notas',
  '/aulas': 'Aulas',
  '/frequencias': 'Frequência',
  '/boletins': 'Boletins',
}

function MainLayout({ children }) {
  const [cadastroAberto, setCadastroAberto] = useState(false)
  const { pathname } = useLocation()
  const currentPage = pageTitles[pathname] ?? pageTitles['/']

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="sidebar__brand-icon">N</span>
          <div>
            <strong>NOTAZ</strong>
            <small>Painel acadêmico</small>
          </div>
        </div>

        <nav className="sidebar__nav" aria-label="Menu principal">
          <NavLink className="sidebar__link" to="/dashboard">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <button
            type="button"
            className={`sidebar__toggle ${cadastroAberto ? 'sidebar__toggle--open' : ''}`}
            onClick={() => setCadastroAberto(!cadastroAberto)}
          >
            <span className="sidebar__item-content">
              <FolderOpen size={18} />
              <span>Cadastros</span>
            </span>
            <ChevronDown className="sidebar__chevron" size={16} />
          </button>

          {cadastroAberto && (
            <div className="sidebar__submenu">
              {cadastroItems.map((item) => (
                <NavLink className="sidebar__link" to={item.path} key={item.path}>
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}

          {mainItems.map((item) => (
            <NavLink className="sidebar__link" to={item.path} key={item.path}>
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="app-content">
        <header className="topbar">
          <h1>{currentPage}</h1>
        </header>

        <main className="page">{children}</main>
      </div>
    </div>
  )
}

export default MainLayout
