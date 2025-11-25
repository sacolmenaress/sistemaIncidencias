import React, { useState, useEffect, type FormEvent, type ChangeEvent, type ReactNode } from 'react';
import { useAuth } from '../../context/authContext';
import { api } from '../../services/apiCliente';
import { TEInput, TERipple } from 'tw-elements-react';
import { TicketDetailModal } from '../components/ticketDetailModal';
import { IncidenciaLibraryPage } from '../components/incidenciaLibraryPage';

import { 
  LayoutDashboard, 
  History, 
  PlusSquare, 
  User, 
  LogOut, 
  Settings, 
  XCircle,
  BookOpen
} from 'lucide-react';


interface TicketUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}
export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdById: number;
  user: TicketUser; 
  createdAt: string;
}

type DashboardView = 'dashboard' | 'reportar' | 'historial' | 'perfil' | 'biblioteca';



interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive: boolean;
}

function SidebarItem({ icon, label, onClick, isActive }: SidebarItemProps) {
  const baseClasses = "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer text-sm font-medium";
  const activeClasses = "bg-primary-600 text-white shadow-md";
  const inactiveClasses = "text-neutral-300 hover:bg-neutral-700 hover:text-white";

  return (
    <a onClick={onClick}>
      <a className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
        {icon}
        <span>{label}</span>
      </a>
    </a>
  );
}

interface UserSidebarProps {
  currentView: DashboardView;
  setView: (view: DashboardView) => void;
}

function UserSidebar({ currentView, setView }: UserSidebarProps) {
  const { logout } = useAuth(); 

  return (
    <nav className="flex w-64 flex-shrink-0 flex-col bg-neutral-800 dark:bg-neutral-900 shadow-2xl">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white tracking-wider">LC Consultores</h1>
      </div>
      
      <div className="flex-grow px-2 py-0 space-y-1">
        <ul className="space-y-2">
          // Navegación Principal
          <li><SidebarItem
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="Inicio"
            onClick={() => setView('dashboard')}
            isActive={currentView === 'dashboard'}
          /></li>
          // Panel de reportar incidencias
          <li><SidebarItem
            icon={<PlusSquare className="h-5 w-5" />}
            label="Reportar Incidencia"
            onClick={() => setView('reportar')}
            isActive={currentView === 'reportar'}
          /></li>
          <li><SidebarItem
            icon={<History className="h-5 w-5" />}
            label="Historial de Incidencias"
            onClick={() => setView('historial')}
            isActive={currentView === 'historial'}
          /></li>
          <li><SidebarItem 
                icon={<BookOpen className="w-5 h-5" />} 
                label="Biblioteca de Incidencias"
                onClick={() => setView('biblioteca')}
                isActive={currentView === 'biblioteca'}
            /></li>
        </ul>

        {/* Separador */}
        <div className="border-t border-neutral-700 pt-2"></div>

        <ul className="space-y-1">
          <SidebarItem
            icon={<User className="h-5 w-5" />}
            label="Perfil y Cuenta"
            onClick={() => setView('perfil')}
            isActive={currentView === 'perfil'}
          />
        </ul>
      </div>

      <div className="p-4 border-t border-neutral-700">
        <button
          onClick={logout}
          className="flex items-center space-x-3 p-3 rounded-lg text-sm font-medium w-full text-red-400 hover:bg-red-700 hover:text-white transition-colors duration-200"
        >
          <LogOut className="h-5 w-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </nav>
  );
}


// COMPONENTE: FORMULARIO DE REPORTE 
interface NewTicketData {
  title: string;
  description: string;
  priority: 'baja' | 'media' | 'alta';
}

function ReportTicketForm({ onTicketCreated }: { onTicketCreated: () => void }) {
  const [data, setData] = useState<NewTicketData>({ title: '', description: '', priority: 'media' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // LLAMADA CLAVE: POST /api/v1/tickets (Creación de Ticket Automática)
      await api.post('/tickets', data);
      
      setSuccess('¡Incidencia reportada con éxito! Su ticket ha sido registrado automáticamente.');
      // Resetea el formulario después de 1 segundo para mostrar el mensaje de éxito
      setTimeout(() => {
        setData({ title: '', description: '', priority: 'media' });
        onTicketCreated(); // Dispara la recarga del historial y cambia la vista
      }, 7000);
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al reportar la incidencia. Revise el estado del sistema.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="text-2xl font-semibold mb-6 text-neutral-800 dark:text-neutral-100">Reportar Nueva Incidencia</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-xl">
        {success && <div className="rounded-md bg-green-100 p-3 text-sm text-green-700 dark:bg-green-800 dark:text-green-100">{success}</div>}
        {error && <div className="rounded-md bg-red-100 p-3 text-sm text-red-700 dark:bg-red-800 dark:text-red-100">{error}</div>}

        <TEInput
          type="text"
          label="Título (Resumen de la Falla)"
          size="lg"
          value={data.title}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setData({ ...data, title: e.target.value })}
          required
        />
        
        <div className="relative">
          <label htmlFor="priority" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Prioridad (Clasificación)
          </label>
          <select
            id="priority"
            value={data.priority}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setData({ ...data, priority: e.target.value as 'baja' | 'media' | 'alta' })}
            className="mt-1 block w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2.5 text-neutral-700 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-600 dark:text-neutral-200 dark:focus:border-primary"
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </div>

        <textarea
          rows={4}
          placeholder="Descripción detallada de la incidencia..."
          value={data.description}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setData({ ...data, description: e.target.value })}
          required
          className="mt-1 block w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2.5 text-neutral-700 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-600 dark:text-neutral-200 dark:focus:border-primary"
        />

        <TERipple rippleColor="light" className="w-full">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-block w-full rounded bg-primary px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-white shadow-md transition duration-150 ease-in-out hover:bg-primary-600 focus:outline-none disabled:opacity-50"
          >
            {isLoading ? 'Reportando...' : 'Registrar Incidencia'}
          </button>
        </TERipple>
      </form>
    </div>
  );
}



function UserTicketsHistory({ refreshKey }: { refreshKey: number }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  const handleOpenModal = (ticket: Ticket) => setSelectedTicket(ticket);
  const handleCloseModal = () => setSelectedTicket(null);

  const handleUpdateTicket = async (updatedTicket: Partial<Ticket>) => {
    if (!selectedTicket) return;
    try {
      await api.put(`/tickets/${selectedTicket.id}`, updatedTicket);
      fetchTickets(); // Recargar la lista
    } catch (err) {
      console.error('Error al actualizar ticket:', err);
    }
  };

  const fetchTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // LLAMADA CLAVE: GET /api/v1/tickets/me (Historial del Usuario)
      const data = await api.get('/tickets/me');
      console.log('API Response for /tickets/me:', data); // Para depuración
      const tickets = Array.isArray(data) ? data : data.tickets || [];
      setTickets(tickets);
    } catch (err) {
      console.error('Error fetching tickets:', err); // Para depuración
      setError('Error al cargar su historial de incidencias.');
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [refreshKey]); 

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resuelto': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'en_proceso': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      default: return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'; // abierto
    }
  };

  if (isLoading) return <div className="text-center p-8 dark:text-white">Cargando historial...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-6 text-neutral-800 dark:text-neutral-100">Mi Historial de Incidencias</h2>
      
      {tickets.length === 0 ? (
        <div className="text-center p-10 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <History className="h-10 w-10 mx-auto mb-4 text-neutral-500 dark:text-neutral-400" />
          <p className="text-neutral-600 dark:text-neutral-300">Aún no ha reportado ninguna incidencia.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div 
              key={ticket.id} 
              className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer flex justify-between items-center"
              onClick={() => handleOpenModal(ticket)} 
            >
              <div>
                <h3 className="text-lg font-medium text-neutral-900 dark:text-white">#{ticket.id} - {ticket.title}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Prioridad: <span className={`font-semibold ${
                    ticket.priority === 'alta' ? 'text-red-500' :
                    ticket.priority === 'media' ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>{ticket.priority.toUpperCase()}</span> |
                  Reportado el: {new Date(ticket.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                {ticket.status.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      )}

      <TicketDetailModal 
        ticket={selectedTicket} 
        onClose={handleCloseModal} 
        isEditable={true} 
        onUpdate={handleUpdateTicket}
      />
    </div>
  );
}

// dashboardPage.tsx (Implementación local)

// dashboardPage.tsx (donde se define ProfileSettings)

// 1. Interfaz de Props: Le agregamos la función para redirigir
interface ProfileSettingsProps { 
    isForced: boolean;
    onPasswordChangeSuccess: () => void; // 👈 NUEVA PROP
}

function ProfileSettings({ isForced, onPasswordChangeSuccess }: ProfileSettingsProps) {
    // 2. OBTENER 'setUser' del contexto
    const { user, setUser } = useAuth(); // 👈 CAMBIO AQUÍ
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Si está forzado, solo devolvemos el div principal (sin datos personales)
    // para que el usuario solo pueda interactuar con el formulario.
    if (isForced && !user) {
        return <div className="mx-auto max-w-xl p-4">Cargando...</div>;
    }


    const handleSubmitPassword = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Si no está forzado, validamos la contraseña actual
        if (!isForced && oldPassword.length === 0) {
            setError('La contraseña actual es obligatoria.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('La nueva contraseña y su confirmación no coinciden.');
            return;
        }

        if (newPassword.length < 6) {
            setError('La nueva contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setIsLoading(true);

        try {
            // Si es forzado, enviamos una cadena vacía para oldPassword.
            const oldPasswordValue = isForced ? "" : oldPassword; 

            await api.put('/auth/password', { oldPassword: oldPasswordValue, newPassword });
            
            // 👇 LÓGICA CLAVE DE ÉXITO Y REDIRECCIÓN
            if (user) { 
                // 1. Actualizar el estado del usuario localmente (ya no debe cambiar la clave)
                const updatedUser = { ...user, mustChangePassword: false };
                setUser(updatedUser); 
            }

            setSuccess('¡Contraseña actualizada con éxito! Redirigiendo...');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // 2. Llamar a la función de redirección después de 1 segundo
            setTimeout(() => {
                onPasswordChangeSuccess(); 
            }, 5000); 
            
        } catch (err) {
            if (err instanceof Error) {
                // El error del backend se manejará aquí (ej: "La contraseña actual es incorrecta")
                setError(err.message);
            } else {
                setError('Error al actualizar la contraseña. Verifique que su contraseña actual sea correcta.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // --------------------------------------------------------------------------------------
    // CÓDIGO JSX
    // --------------------------------------------------------------------------------------
    
    // Si la clave está forzada, SOLO MOSTRAMOS EL ALERTA Y EL FORMULARIO
    if (isForced) {
        return (
            <div className="mx-auto max-w-xl p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
                    <strong className="font-bold">¡Atención!</strong>
                    <span className="block sm:inline"> Debe cambiar su contraseña temporal antes de continuar.</span>
                </div>
                
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-xl space-y-6">
                    {/* Solo el formulario cuando está forzado */}
                    <div>
                        <h3 className="text-xl font-medium text-neutral-900 dark:text-white mb-4">Cambiar Contraseña</h3>
                        <form onSubmit={handleSubmitPassword} className="space-y-4">
                            {success && <div className="rounded-md bg-green-100 p-3 text-sm text-green-700 dark:bg-green-800 dark:text-green-100">{success}</div>}
                            {error && <div className="rounded-md bg-red-100 p-3 text-sm text-red-700 dark:bg-red-800 dark:text-red-100">{error}</div>}
                            
                            {/* No se pide la contraseña actual cuando es forzado */}
                            <TEInput type="password" label="Nueva Contraseña" size="lg" value={newPassword} onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)} required />
                            <TEInput type="password" label="Confirmar Nueva Contraseña" size="lg" value={confirmPassword} onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)} required />
                            
                            <TERipple rippleColor="light" className="w-full">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="inline-block w-full rounded bg-primary px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-white shadow-md transition duration-150 ease-in-out hover:bg-primary-600 focus:outline-none disabled:opacity-50"
                                >
                                    {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                                </button>
                            </TERipple>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
    
    // SI NO ESTÁ FORZADO, MOSTRAMOS LA VISTA COMPLETA (Datos Personales + Formulario)
    return (
        <div className="mx-auto max-w-xl p-4">
            <h2 className="text-2xl font-semibold mb-6 text-neutral-800 dark:text-neutral-100">Configuración de Perfil</h2>
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-xl space-y-6">
                
                {/* Información del Usuario */}
                <div className="border-b pb-4 dark:border-neutral-700">
                    <h3 className="text-xl font-medium text-neutral-900 dark:text-white mb-2">Datos Personales</h3>
                    <p className="text-neutral-700 dark:text-neutral-300">Nombre: <span className="font-semibold">{user?.firstName} {user?.lastName}</span></p>
                    <p className="text-neutral-700 dark:text-neutral-300">Correo: <span className="font-semibold">{user?.email}</span></p>
                    <p className="text-neutral-700 dark:text-neutral-300">Rol: <span className="font-semibold">{user?.role.toUpperCase()}</span></p>
                </div>

                {/* Formulario de Contraseña */}
                <div>
                    <h3 className="text-xl font-medium text-neutral-900 dark:text-white mb-4">Cambiar Contraseña</h3>
                    <form onSubmit={handleSubmitPassword} className="space-y-4">
                        {success && <div className="rounded-md bg-green-100 p-3 text-sm text-green-700 dark:bg-green-800 dark:text-green-100">{success}</div>}
                        {error && <div className="rounded-md bg-red-100 p-3 text-sm text-red-700 dark:bg-red-800 dark:text-red-100">{error}</div>}
                        
                        <TEInput type="password" label="Contraseña Actual" size="lg" value={oldPassword} onChange={(e: ChangeEvent<HTMLInputElement>) => setOldPassword(e.target.value)} required />
                        <TEInput type="password" label="Nueva Contraseña" size="lg" value={newPassword} onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)} required />
                        <TEInput type="password" label="Confirmar Nueva Contraseña" size="lg" value={confirmPassword} onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)} required />
                        
                        <TERipple rippleColor="light" className="w-full">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="inline-block w-full rounded bg-primary px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-white shadow-md transition duration-150 ease-in-out hover:bg-primary-600 focus:outline-none disabled:opacity-50"
                            >
                                {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                            </button>
                        </TERipple>
                    </form>
                </div>
            </div>
        </div>
    );
}



export function DashboardPage() {
  const { user , logout } = useAuth();
  const [view, setView] = useState<DashboardView>('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Si mustChangePassword: true
    // forzamos la vista interna del dashboard a 'perfil' (donde está el cambio de clave)
    if (user && user.mustChangePassword) {
      setView('perfil'); 
    }
  }, [user]);

  const handleTicketCreated = () => {
    // 1. Cuando se crea un ticket con éxito, cambiamos la vista automáticamente a 'historial'.
    setView('historial'); 
    // 2. Aumentamos 'refreshKey' para forzar a que UserTicketsHistory recargue la lista
    setRefreshKey(prev => prev + 1); 
  };

  const handlePasswordChangeSuccess = () => {
        setView('dashboard');
    };


  //Al presionar en sidebar dirige al panel correspondiente
  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4 dark:text-white">¡Bienvenido(a), {user?.firstName} {user?.lastName}!</h2>
          <p className="dark:text-neutral-300">Utilice el menú de la izquierda para Reportar Incidencias o revisar su Historial.</p>
        </div>;

      case 'reportar':
        return <ReportTicketForm onTicketCreated={handleTicketCreated} />;

      case 'historial':
        return <UserTicketsHistory refreshKey={refreshKey} />; 

      case 'biblioteca':
        return <IncidenciaLibraryPage />;
      
      case 'perfil':
                return <ProfileSettings 
                    isForced={user?.mustChangePassword || false} 
                    onPasswordChangeSuccess={handlePasswordChangeSuccess} 
                />;    
              }
  };

  // --- ESTRUCTURA FINAL: LAYOUT CON SIDEBAR ---
  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-neutral-900"> 
      
      {/* 1. PANEL LATERAL (Sidebar) */}
      <UserSidebar currentView={view} setView={setView} /> 

      {/* 2. CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {renderContent()}
      </main>

    </div>
  );
}