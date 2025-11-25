import { LoginPage } from './pages/loginPage';
import { DashboardPage } from '../src/pages/dashboardPage'; // ¡Asegúrate de importar!
import { useAuth } from '../context/authContext';
import { AdminDashboardPage } from './pages/adminDashboardPage';

function App() {
  const { isAuthenticated, isLoading, user} = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 text-white">Cargando...</div>
  }

  //No está autenticado , muestra login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (user && (user.role === 'admin' || user.role === 'tecnico')) {
    // Si es Admin o Técnico, muestra el Panel de Admin
    return <AdminDashboardPage />;
  } else {
    return <DashboardPage />;
  }

}

export default App;