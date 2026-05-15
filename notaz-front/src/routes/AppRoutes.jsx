import { Routes, Route } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout/MainLayout'
import Dashboard from '../pages/Dashboard/Dashboard'
import Turmas from '../pages/Cadastro/Turma/Turmas'
import Usuario from '../pages/Cadastro/Usuario/Usuario'
import Professores from '../pages/Cadastro/Professor/Professores'
import Disciplinas from '../pages/Cadastro/Disciplina/Disciplinas'
import Alunos from '../pages/Cadastro/Aluno/Alunos'
import Avaliacoes from '../pages/Cadastro/Avaliacao/Avaliacoes'

function AppRoutes() {
  return (
    <MainLayout>
      <Routes>
        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/turmas"
          element={<Turmas />}
        />

        <Route
          path="/usuarios"
          element={<Usuario />}
        />

        <Route
          path="/professores"
          element={<Professores />}
        />

        <Route
          path="/disciplinas"
          element={<Disciplinas />}
        />

        <Route
          path="/alunos"
          element={<Alunos />}
        />

        <Route
          path="/avaliacoes"
          element={<Avaliacoes />}
        />
      </Routes>
    </MainLayout>
  )
}

export default AppRoutes
