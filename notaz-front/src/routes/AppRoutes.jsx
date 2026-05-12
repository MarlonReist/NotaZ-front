import MainLayout from '../layouts/MainLayout/MainLayout'
import Dashboard from '../pages/Dashboard/Dashboard'

function AppRoutes() {
  return (
    <MainLayout title="Visao geral" section="Dashboard">
      <Dashboard />
    </MainLayout>
  )
}

export default AppRoutes
