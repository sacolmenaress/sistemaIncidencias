import React, { useState, useEffect, type FormEvent, memo, useCallback } from 'react';
import { api } from '../../services/apiCliente'; 
import { Plus, Edit, Trash2, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { TEInput, TERipple } from 'tw-elements-react';
import { motion, AnimatePresence } from 'framer-motion'; 

interface Incidencia {
    ID: number;
    title: string;
    solution: string;
    category: string;
    isPublic: boolean;
}

interface IncidenciaModalProps {
    isModalOpen: boolean;
    setIsModalOpen: (open: boolean) => void;
    formData: Incidencia;
    setFormData: React.Dispatch<React.SetStateAction<Incidencia>>;
    handleFormSubmit: (e: FormEvent) => Promise<void>;
    isLoading: boolean;
    error: string | null;
    isEditing: boolean;
}

const initialIncidenciaState: Incidencia = {
    ID: 0, // 0 para nuevo
    title: '',
    solution: '',
    category: 'General',
    isPublic: true,
};

export function ManageIncidencias() {
    const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // States para Form/Modal
    const [formData, setFormData] = useState<Incidencia>(initialIncidenciaState);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isEditing = formData.ID !== 0;

    useEffect(() => {
        fetchIncidencias();
    }, []);

    // Función principal para obtener la lista de incidencias para gestión
    const fetchIncidencias = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get('/incidencias'); 
            setIncidencias(response as Incidencia[]);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al cargar las incidencias.');
        } finally {
            setIsLoading(false);
        }
    }, [setIncidencias, setIsLoading, setError]);

    // Función para manejar la creación o actualización de una incidencia
    const handleFormSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null); // Limpiar el éxito anterior

        try {
            if (isEditing) {
                // Lógica de Edición
                await api.put(`/incidencias/${formData.ID}`, formData);
                setSuccess('Incidencia actualizada con éxito.');
            } else {
                // Lógica de Creación
                await api.post('/incidencias', formData);
                setSuccess('Incidencia creada con éxito.');
            }
            
            // ¡ESTO ES LO CRUCIAL! Recarga la lista DESPUÉS de un éxito
            fetchIncidencias(); 
            
            // Limpiar formulario y cerrar modal
            setFormData(initialIncidenciaState); 
            setIsModalOpen(false); 

        } catch (err: any) {
            // ... (Tu lógica de error)
            setError(err.response?.data?.error || 'Error al guardar la incidencia.');
        } finally {
            setIsLoading(false);
        }
    // Dependencias: Incluir fetchIncidencias para que use la versión más reciente
    }, [formData, isEditing, fetchIncidencias, setFormData, setIsModalOpen, setIsLoading, setError, setSuccess]);

    // Función para manejar la eliminación de una incidencia
    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta incidencia? Esta acción no se puede deshacer.')) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            await api.delete(`/incidencias/${id}`);
            setSuccess('Incidencia eliminada con éxito.');
            fetchIncidencias();
        } catch (err) {
            console.error('Error al eliminar la incidencia:', err);
            setError('Error al eliminar la incidencia.');
        } finally {
            setIsLoading(false);
        }
    };

    const openCreateModal = () => {
        setFormData(initialIncidenciaState);
        setIsModalOpen(true);
    };

    const openEditModal = (incidencia: Incidencia) => {
        // Clonar para evitar mutaciones directas del estado de la lista
        setFormData({...incidencia}); 
        setIsModalOpen(true);
    };

    // Componente del Modal/Formulario

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-6 text-neutral-800 dark:text-white flex items-center">
                <BookOpen className="w-6 h-6 mr-3 text-primary-500" />
                Gestión de Biblioteca de Incidencias
            </h2>

             {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 dark:bg-green-900 dark:border-green-700 dark:text-green-300 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="block sm:inline">{success}</span>
                </div>
            )}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 dark:bg-red-900 dark:border-red-700 dark:text-red-300 flex items-center">
                    <XCircle className="w-5 h-5 mr-2" />
                    <span className="block sm:inline">{error}</span>
                </div>
            )}


            {/* Botón de Añadir */}
            <div className="mb-6 text-right">
                <TERipple rippleColor="light">
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center rounded bg-primary px-4 py-2 text-sm font-medium text-white shadow-md transition duration-150 ease-in-out hover:bg-primary-600 disabled:opacity-50"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Añadir Nueva Incidencia
                    </button>
                </TERipple>
            </div>

            {/* Tabla de Incidencias */}
            <div className={`overflow-x-auto bg-white dark:bg-neutral-800 rounded-lg shadow ${isLoading ? 'opacity-70' : ''}`}>
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                    <thead className="bg-neutral-50 dark:bg-neutral-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-300">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-300">Título</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-300">Categoría</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-300">Pública</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider dark:text-neutral-300">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                            {/* VERIFICACIÓN CORREGIDA: 
                                            Si 'incidencias' no existe O su longitud es 0, y no estamos cargando, muestra el mensaje.
                                            */}
                                            {(!incidencias || incidencias.length === 0) && !isLoading ? (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
                                                        {error ? `Error al cargar: ${error}` : 'No hay incidencias registradas.'}
                                                    </td>
                                                </tr>
                                            ) : (
                                                // Usamos el operador de encadenamiento opcional (?) para asegurar que map solo se llame si incidencias existe.
                                                incidencias?.map((incidencia) => (
                                                    <tr key={incidencia.ID} className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-primary-600 dark:text-primary-400">{incidencia.ID}</td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-800 dark:text-neutral-200">{incidencia.title}</td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300 capitalize">{incidencia.category || 'General'}</td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                            {incidencia.isPublic ? (
                                                                <CheckCircle className="w-5 h-5 text-green-500" aria-label="Pública" role="img" />
                                                            ) : (
                                                                <XCircle className="w-5 h-5 text-red-500" aria-label="Privada" role="img" />
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                            <button 
                                                                onClick={() => openEditModal(incidencia)}
                                                                className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-600 transition-colors disabled:opacity-50"
                                                                title="Editar Incidencia"
                                                            >
                                                                <Edit className="w-4 h-4 inline" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(incidencia.ID)}
                                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600 transition-colors disabled:opacity-50"
                                                                title="Eliminar Incidencia"
                                                            >
                                                                <Trash2 className="w-4 h-4 inline" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                </table>
                {isLoading && <div className="p-4 text-center dark:text-white">Cargando datos...</div>}
            </div>


            <IncidenciaFormModalMemo
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                formData={formData}
                setFormData={setFormData}
                handleFormSubmit={handleFormSubmit}
                isLoading={isLoading}
                error={error}
                isEditing={isEditing}
            />

        </div>
    );
}



const IncidenciaFormModalComponent: React.FC<IncidenciaModalProps> = ({ 
    isModalOpen, setIsModalOpen, formData, setFormData, handleFormSubmit, isLoading, error, isEditing 
}) => (
    <AnimatePresence>
        {isModalOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) { 
                            setIsModalOpen(false);
                            }
                        }} 
                    >
                    <motion.div
                        initial={{ scale: 0.9, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 50 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-2xl p-6"
                        onClick={(e) => e.stopPropagation()} 
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center border-b pb-3 mb-4 dark:border-neutral-700">
                            <h3 className="text-xl font-semibold dark:text-white">
                                {isEditing ? 'Editar Incidencia' : 'Crear Nueva Incidencia'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleFormSubmit}>
                            <div className="mb-4">
                                <TEInput
                                    type="text"
                                    label="Título"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    required
                                    className="dark:text-white"
                                />
                            </div>


                            <div className="mb-4">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Categoría</label>
                                <TEInput
                                    type="text"
                                    label="Categoría (Ej: Redes, Impresoras, Software)"
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    className="dark:text-white"
                                />
                            </div>

        
                            <div className="mb-4">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1">Solución Detallada</label>
                                <textarea
                                    value={formData.solution}
                                    onChange={(e) => setFormData(prev => ({ ...prev, solution: e.target.value }))}
                                    rows={6}
                                    required
                                    className="w-full p-3 border border-neutral-300 rounded-lg dark:bg-neutral-700 dark:border-neutral-600 dark:text-white focus:ring-primary focus:border-primary transition"
                                    placeholder="Detalles paso a paso de la solución..."
                                />
                            </div>

                
                            <div className="mb-6 flex items-center">
                                <input
                                    type="checkbox"
                                    id="isPublic"
                                    checked={formData.isPublic}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                                    className="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-neutral-800 focus:ring-2 dark:bg-neutral-700 dark:border-neutral-600"
                                />
                                <label htmlFor="isPublic" className="ml-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Visible para el usuario final (Pública)
                                </label>
                            </div>
                            
                      
                            <TERipple rippleColor="light">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full rounded bg-primary px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-white shadow-md transition duration-150 ease-in-out hover:bg-primary-600 focus:outline-none disabled:opacity-50"
                                >
                                    {isLoading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Incidencia'}
                                </button>
                            </TERipple>

                            {error && <p className="text-red-500 mt-3 text-center text-sm">{error}</p>}
                        </form>
                    </motion.div>
                </motion.div>
            )}
    </AnimatePresence>
);


const IncidenciaFormModalMemo = memo(IncidenciaFormModalComponent);