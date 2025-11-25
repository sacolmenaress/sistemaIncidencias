import React, { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { TEInput, TERipple } from 'tw-elements-react';
import { UserPlus, Mail, ShieldCheck, Trash2, Users } from 'lucide-react'; 
import { api } from '../../services/apiCliente';

// --- NUEVO TIPO ---
// Definición del tipo User (debe coincidir con tu struct de Go)
interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: 'contador' | 'tecnico' | 'admin';
    mustChangePassword: boolean;
}

type Role = 'contador' | 'tecnico' | 'admin';

export function ManageUsers() {
    // --- ESTADOS PARA CREACIÓN (EXISTENTES) ---
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<Role>('contador');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [defaultPassword, setDefaultPassword] = useState<string | null>(null);
    const [simulatedEmail, setSimulatedEmail] = useState<string | null>(null);

    // --- ESTADOS PARA LISTADO (NUEVOS) ---
    const [users, setUsers] = useState<User[]>([]);
    const [isFetching, setIsFetching] = useState(true);

    // ------------------------------------------
    // 1. FUNCIONES DE LISTADO Y ELIMINACIÓN
    // ------------------------------------------

    // FUNCIÓN PARA OBTENER USUARIOS
    const fetchUsers = async () => {
        setIsFetching(true);
        try {
            // Llama a la ruta GET /api/v1/users (que debes crear en Go)
            const response = await api.get('/users'); 
            setUsers(response || []); 
        } catch (err) {
            console.error('Error al obtener la lista de usuarios:', err);
            // Si hay error (ej: 401 Unauthorized), la lista queda vacía
            setUsers([]);
        } finally {
            setIsFetching(false);
        }
    };
    
    // FUNCIÓN PARA ELIMINAR USUARIO (¡Tu código corregido!)
    const handleDeleteUser = async (userId: number) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar al usuario con ID ${userId}?`)) {
            return;
        }

        try {
            await api.delete(`/users/${userId}`);
            alert('Usuario eliminado con éxito.');
            // Recarga la lista para actualizar la interfaz
            fetchUsers(); 
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido al eliminar.';
            alert(`Error: ${errorMessage}`);
        }
    };

    // EFECTO: CARGAR USUARIOS AL INICIAR
    useEffect(() => {
        fetchUsers();
    }, []); 

    // ------------------------------------------
    // 2. FUNCIÓN DE CREACIÓN DE USUARIO (MODIFICADA)
    // ------------------------------------------
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        setDefaultPassword(null);
        setSimulatedEmail(null);

        try {
          const response = await api.post('/users', {
            firstName,
            lastName,
            email,
            role,
          });

          const { message, default_password, simulated_email_content } = response;

          setSuccess(message);
          setDefaultPassword(default_password);
          setSimulatedEmail(simulated_email_content);
          
          // Llama a fetchUsers para actualizar la lista después de crear
          fetchUsers(); 

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };


    // ------------------------------------------
    // 3. RENDERIZADO (JSX)
    // ------------------------------------------
    return (
        <div className="p-6 space-y-8">
            <h2 className="text-2xl font-semibold dark:text-white flex items-center space-x-2">
                <Users className="w-6 h-6" /> <span>Gestión de Usuarios</span>
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* --- SECCIÓN 1: CREAR NUEVO USUARIO (Formulario existente) --- */}
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-xl">
                    <h3 className="text-xl font-semibold mb-4 dark:text-white flex items-center space-x-2">
                        <UserPlus className="w-5 h-5" /> <span>Crear Nuevo Usuario</span>
                    </h3>
                    
                    {/* Mensajes de feedback */}
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
                    {success && (
                        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
                            <p>{success}</p>
                            {defaultPassword && <p className="font-semibold mt-1">Contraseña temporal: **{defaultPassword}**</p>}
                            {simulatedEmail && <pre className="mt-2 text-sm bg-green-200 p-2 rounded whitespace-pre-wrap">Email simulado: {simulatedEmail}</pre>}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <TEInput 
                            type="text" 
                            label="Nombre" 
                            value={firstName} 
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                            required
                        />
                         <TEInput 
                            type="text" 
                            label="Apellido" 
                            value={lastName} 
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                            required
                        />
                        <TEInput 
                            type="email" 
                            label="Email" 
                            value={email} 
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            required
                        />
                        
                        {/* Selector de Rol */}
                        <div className="relative mb-4 pt-3">
                            <ShieldCheck className="absolute top-1 left-3 w-5 h-5 text-neutral-500 dark:text-neutral-400 z-10" />
                            <label className="text-sm font-medium text-neutral-500 dark:text-neutral-400 block mb-1 ml-9">Rol</label>
                            <select
                                value={role}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => setRole(e.target.value as Role)}
                                className="w-full pl-10 pr-4 py-2.5 text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary appearance-none"
                                required
                            >
                                {/* Opciones disponibles */}
                                <option value="contador">Contador (Usuario Normal)</option>
                                <option value="tecnico">Técnico (Soporte)</option>
                                <option value="admin">Administrador (Control Total)</option>
                            </select>
                        </div>

                        <TERipple rippleColor="light" className="w-full">
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-block w-full rounded bg-primary px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-white shadow-md transition duration-150 ease-in-out hover:bg-primary-600 focus:outline-none disabled:opacity-50 flex items-center justify-center space-x-2"
                          >
                            <Mail className="h-4 w-4" /> <span>{isLoading ? 'Creando...' : 'Crear y Enviar Acceso'}</span>
                          </button>
                        </TERipple>
                    </form>
                </div>
                
                {/* Columna derecha (vacía o para otra cosa) */}
                <div className="hidden lg:block">
                    {/* Puedes agregar aquí estadísticas de usuario o instrucciones */}
                </div>
            </div>

            <hr className="my-8 border-neutral-300 dark:border-neutral-700" />
            
            {/* --- SECCIÓN 2: LISTA DE USUARIOS (TABLA NUEVA) --- */}
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-xl">
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Usuarios Existentes</h3>
                
                {isFetching && <p className="dark:text-neutral-300">Cargando usuarios...</p>}

                {!isFetching && users.length === 0 && <p className="text-neutral-500">No hay usuarios registrados.</p>}

                {!isFetching && users.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                            <thead className="bg-neutral-50 dark:bg-neutral-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">Nombre</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">Rol</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-400">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-200 dark:bg-neutral-800 dark:divide-neutral-700">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-white">{user.id}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300">{user.firstName} {user.lastName}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300">{user.email}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300 capitalize">{user.role}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {/* Botón de Eliminación */}
                                            <button 
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600 transition-colors disabled:opacity-50"
                                                title="Eliminar Usuario"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}