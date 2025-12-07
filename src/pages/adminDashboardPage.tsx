import React, { useState, useEffect, useMemo, type FormEvent, type ChangeEvent } from 'react';
import { useAuth } from '../../context/authContext';
import { api } from '../../services/apiCliente';
import { TEInput, TERipple } from 'tw-elements-react';
import { AdminTicketModal } from '../components/adminTicketModal';
import { ManageUsers } from '../components/manageUsers';
import { isAfter, subDays, parseISO } from 'date-fns';
import type { Ticket } from './dashboardPage';
import { ManageIncidencias } from '../components/manageIncidencias';
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  User,
  ShieldCheck, 
  LogOut, 
  Filter,
  Search,
  CheckCircle,
  Clock,
  Circle,
  BarChart2,
  Bell, 
  AlertTriangle,
  BookOpen
} from 'lucide-react';


interface User {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  role: 'contador' | 'tecnico' | 'admin';
  mustChangePassword: boolean;
}


type AdminDashboardView = 'reportes_y_control' | 'manage_users' | 'perfil' | 'manage_incidencias';

type PriorityFilter = 'todos' | 'baja' | 'media' | 'alta';

const shouldNotify = (ticket: Ticket): 'abierto_viejo' | 'en_proceso_viejo' | null => {
    const oneWeekAgo = subDays(new Date(), 7); 
    const createdAtDate = parseISO(ticket.createdAt);

    // Abierto > 1 Semana y sin atender
    if (ticket.status === 'abierto' && isAfter(createdAtDate, oneWeekAgo) ) {
        if (isAfter(oneWeekAgo, createdAtDate)) {
             return 'abierto_viejo';
        }
    }


    if (ticket.status === 'en_proceso') {
        if (isAfter(oneWeekAgo, createdAtDate)) {
             return 'en_proceso_viejo';
        }
    }

    return null;
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive: boolean;
}

function SidebarItem({ icon, label, onClick, isActive }: SidebarItemProps) {
  const baseClasses = "flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 cursor-pointer text-sm font-medium";
  const activeClasses = "bg-primary-600 text-white shadow-md";
  const inactiveClasses = "text-neutral-300 hover:bg-neutral-700 hover:text-white";

  return (
    <li onClick={onClick}>
      <a className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
        {icon}
        <span>{label}</span>
      </a>
    </li>
  );
}

interface AdminSidebarProps {
  currentView: AdminDashboardView;
  setView: (view: AdminDashboardView) => void;
  user: User | null;
}

function AdminSidebar({ currentView, setView, user }: AdminSidebarProps) {
  const { logout } = useAuth();

  return (
    <nav className="flex w-64 flex-shrink-0 flex-col bg-neutral-800 dark:bg-neutral-900 shadow-2xl">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white tracking-wider">LC Consultores (Admin)</h1>
      </div>

      <div className="flex-grow p-4 space-y-2">
        <ul className="space-y-1">
          <SidebarItem
            icon={<ShieldCheck className="h-5 w-5" />}
            label="Control de Incidencias"
            onClick={() => setView('reportes_y_control')}
            isActive={currentView === 'reportes_y_control'}
          />
          {(user?.role === 'admin' || user?.role === 'tecnico') && (
            <SidebarItem
              icon={<Users className="h-5 w-5" />}
              label="Gestión de Usuarios"
              onClick={() => setView('manage_users')}
              isActive={currentView === 'manage_users'}
            />
          )}
          <SidebarItem 
                icon={<BookOpen className="w-5 h-5" />}
                label="Gestionar Biblioteca Incidencias"
                onClick={() => setView('manage_incidencias')}
                isActive={currentView === 'manage_incidencias'}
            />
        </ul>

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


function ManageTickets({ refreshKey }: { refreshKey: number }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'abierto' | 'en_proceso' | 'resuelto'>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/tickets') as { tickets: Ticket[] }; 
      setTickets(response.tickets); 
    } catch (err) {
      setError('Error al cargar la lista de tickets. Verifique la conexión con la API.');
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [refreshKey]); 

  const handleTicketUpdated = () => {
    fetchTickets(); // Forzar la recarga de tickets tras una actualización en el modal
    setSelectedTicket(null); // Cerrar el modal
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
        case 'resuelto': return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'en_proceso': return <Clock className="h-4 w-4 text-yellow-500" />;
        default: return <Circle className="h-4 w-4 text-red-500" />;
    }
  };


  const filteredTickets = useMemo(() => {
    let currentTickets = tickets;

    if (statusFilter !== 'all') {
      currentTickets = currentTickets.filter(t => t.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      currentTickets = currentTickets.filter(t => 
        t.title.toLowerCase().includes(query) ||
        t.id.toString().includes(query) ||
        t.user.firstName.toLowerCase().includes(query) ||
        t.user.lastName.toLowerCase().includes(query)
      );
    }

    if (priorityFilter !== 'todos') {
        currentTickets = currentTickets.filter(t => t.priority === priorityFilter);
    }

    return currentTickets;
  }, [tickets, statusFilter, searchQuery, priorityFilter]);


  if (isLoading) return <div className="text-center p-8 dark:text-white">Cargando todos los tickets para control operacional...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-6 text-neutral-800 dark:text-neutral-100 flex items-center">
        <ShieldCheck className="h-6 w-6 mr-2 text-primary-500" /> Control y Gestión de Incidencias
      </h2>

      {/* --- Controles de Filtro y Búsqueda --- */}
      <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-md mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
                type="text"
                placeholder="Buscar por Título, ID o Usuario..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            />
        </div>
        <div>
        <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                <Filter className="inline h-4 w-4 mr-1" /> Filtrar por Estado
            </label>
        </div>
        <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            <BarChart2 className="inline h-4 w-4 mr-1" /> Filtrar por Prioridad
            </label>
            <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
            className="w-full border rounded-lg p-2 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            >
            <option value="todos">Todas</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
            </select>
            </div>
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="w-full border rounded-lg p-2 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            >
                <option value="all">Mostrar Todos</option>
                <option value="abierto">Abierto</option>
                <option value="en_proceso">En Proceso</option>
                <option value="resuelto">Resuelto</option>
            </select>
        </div>

        <div className="min-w-[150px] flex items-end">
            <div className="flex items-center text-sm font-medium dark:text-white">
                <BarChart2 className="h-5 w-5 mr-1 text-teal-500" /> 
                Tickets encontrados: <span className="ml-1 font-bold text-lg text-primary-600">{filteredTickets.length}</span>
            </div>
        </div>
      </div>


      <div className="overflow-x-auto bg-white dark:bg-neutral-800 rounded-lg shadow-xl">
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
          <thead className="bg-neutral-50 dark:bg-neutral-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-300">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-300">Título / Reportó</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-300">Prioridad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-300">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-300">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-300">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {filteredTickets.map((ticket) => { 
                const notificationType = shouldNotify(ticket);

                const NotificationIcon = () => {
                    if (!notificationType) return null;
                    const Icon = notificationType === 'abierto_viejo' ? Bell : AlertTriangle;
                    const color = notificationType === 'abierto_viejo' ? 'text-red-500' : 'text-yellow-500';
                    const title = notificationType === 'abierto_viejo'
                        ? '¡ALARMA! Abierto y desatendido por más de 7 días.'
                        : 'Revisar: ¿Resuelto? En proceso por más de 7 días.';
                    return (
                        <span title={title} className="inline-flex">
                            <Icon className={`h-5 w-5 ml-2 cursor-pointer ${color}`} />
                        </span>
                    );
                };

                return ( 
                    <tr 
                        key={ticket.id} 
                        className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition duration-150 cursor-pointer"
                        onClick={() => setSelectedTicket(ticket)}
                    >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-white">#{ticket.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-neutral-900 dark:text-white">{ticket.title}</div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400">por: {ticket.user.firstName} {ticket.user.lastName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`font-semibold ${
                                ticket.priority === 'alta' ? 'text-red-500' : 
                                ticket.priority === 'medium' ? 'text-yellow-500' : 
                                'text-green-500'
                            }`}>
                                {ticket.priority.toUpperCase()}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-600 text-neutral-800 dark:text-neutral-200">
                                {getStatusIcon(ticket.status)}
                                <span className="ml-1">{ticket.status.replace('_', ' ').toUpperCase()}</span>
                                <NotificationIcon /> 
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                                onClick={(e) => { e.stopPropagation(); setSelectedTicket(ticket); }}
                                className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                            >
                                Gestionar
                            </button>
                        </td>
                    </tr>
                );
            })}
          </tbody>
        </table>
      </div>


      <AdminTicketModal
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onUpdate={handleTicketUpdated} // Se llama al actualizar el ticket
      />
    </div>
  );
}



export interface ProfileSettingsProps {
    isForced: boolean; 
}

export function ProfileSettings({ isForced }: ProfileSettingsProps) { 
  const { logout } = useAuth(); 
  const [oldPassword, setOldPassword] = useState('');
    const { user } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
  
    const handleSubmitPassword = async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccess(null);
  
      if (newPassword !== confirmPassword) {
        setError('La nueva contraseña y su confirmación no coinciden.');
        return;
      }
  
      if (newPassword.length < 6) {
        setError('La nueva contraseña debe tener al menos 6 caracteres.');
        return;
      }
  
      setIsLoading(true);
      setError(null);
      setSuccess(null);
  
      try {
      await api.put('/auth/password', {
        oldPassword: isForced ? '' : oldPassword, 
        newPassword,
      });

      setSuccess('Contraseña actualizada con éxito. Por favor, inicie sesión de nuevo.');
      setTimeout(logout, 10000); 
      
    } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error al actualizar la contraseña. Verifique que su contraseña actual sea correcta.');
        }
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <div className="mx-auto max-w-xl p-4">
        <h2 className="text-2xl font-semibold mb-6 text-neutral-800 dark:text-neutral-100">Configuración de Perfil</h2>

        {isForced && (
        <div className="rounded-md bg-yellow-100 p-4 mb-6 text-yellow-800 border border-yellow-300 font-medium flex items-start">
            <ShieldCheck className="mr-3 h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>
                <span className="font-bold">¡Cambio de Contraseña Obligatorio!</span>
                <br/>
                Por motivos de seguridad, debe establecer una nueva contraseña.
            </span>
        </div>
    )}

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
              
              {!isForced && (
              <TEInput type="password" 
              label="Contraseña Actual" 
              size="lg" value={oldPassword} onChange={(e: ChangeEvent<HTMLInputElement>) => setOldPassword(e.target.value)} 
              required />
              )}
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


export function AdminDashboardPage() {
  const [view, setView] = useState<AdminDashboardView>('reportes_y_control');
  const { user, logout } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (user && user.mustChangePassword) {
      setView('perfil');
    }
  }, [user]); 

  const renderContent = () => {
    switch (view) {
      case 'reportes_y_control':
        return <ManageTickets refreshKey={refreshKey} />; 
      
      case 'manage_users':
        return <ManageUsers />;

      case 'manage_incidencias':
        return <ManageIncidencias />;
        
      case 'perfil':
        return <ProfileSettings isForced={user?.mustChangePassword || false} />;
    }
  };

  return (
    <div className="flex h-screen bg-neutral-100 dark:bg-neutral-900">
      <AdminSidebar currentView={view} setView={setView} user={user} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
}