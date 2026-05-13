import { Routes, Route } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout/MainLayout'
import Dashboard from '../pages/Dashboard/Dashboard'
import Turmas from '../pages/Cadastro/Turma/Turmas'

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
      </Routes>
    </MainLayout>
  )
}

export default AppRoutes
