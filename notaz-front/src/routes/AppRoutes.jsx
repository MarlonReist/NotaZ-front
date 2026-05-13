import { Routes, Route } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout/MainLayout'
import Dashboard from '../pages/Dashboard/Dashboard'
import Turmas from '../pages/Cadastro/Turma/Turmas'
import Usuario from '../pages/Cadastro/Usuario/Usuario'

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
      </Routes>
    </MainLayout>
  )
}

export default AppRoutes
