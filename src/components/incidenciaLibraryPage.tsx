import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiCliente'; // **VERIFICA ESTA RUTA**
import { Search, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Incidencia {
    ID: number;
    title: string;
    solution: string;
    category: string;
}

export function IncidenciaLibraryPage() {
    const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [openId, setOpenId] = useState<number | null>(null); // Para el acordeón de detalle

    useEffect(() => {
        const fetchIncidencias = async () => {
            try {
                // Llama al endpoint público
                const response = await api.get('/incidencias/public');
                setIncidencias(response as Incidencia[]);
            } catch (err) {
                console.error('Error al cargar la biblioteca:', err);
                setError('No se pudo cargar la biblioteca de incidencias.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchIncidencias();
    }, []);

    // Filtra las incidencias por título o solución
    const filteredIncidencias = (incidencias || []).filter((incidencia) => {
        if (!searchTerm) {
            return true;
        }

        const lowerCaseSearch = searchTerm.toLowerCase();

      
        const matchesTitle = incidencia.title.toLowerCase().includes(lowerCaseSearch);
        const matchesSolution = incidencia.solution.toLowerCase().includes(lowerCaseSearch);
        const matchesCategory = incidencia.category.toLowerCase().includes(lowerCaseSearch);

        return matchesTitle || matchesSolution || matchesCategory;
    });

    const toggleOpen = (id: number) => {
        setOpenId(openId === id ? null : id);
    };


    if (isLoading) return <div className="p-6 text-center dark:text-white">Cargando biblioteca...</div>;
    if (error) return <div className="p-6 text-center text-red-500 dark:text-red-400">{error}</div>;


    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold mb-6 text-neutral-800 dark:text-white flex items-center">
                <BookOpen className="w-6 h-6 mr-3 text-primary-500" />
                Biblioteca de Incidencias
            </h2>

            {/* Buscador */}
            <div className="relative mb-6">
                <input
                    type="text"
                    placeholder="Buscar por título , categoría o solución..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 border border-neutral-300 rounded-lg dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:ring-primary focus:border-primary transition"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500" />
            </div>

            {/* Lista de Incidencias */}
            <div className="space-y-4">
                {filteredIncidencias.length === 0 ? (
                    <p className="text-center text-neutral-500 dark:text-neutral-400 mt-10">
                        No se encontraron incidencias que coincidan con la búsqueda.
                    </p>
                ) : (
                    filteredIncidencias.map((incidencia) => {
                        const isOpen = openId === incidencia.ID;
                        return (
                            <div key={incidencia.ID} className="border border-neutral-300 dark:border-neutral-700 rounded-lg shadow-sm overflow-hidden">
                                
                                {/* Header del Acordeón */}
                                <button
                                    className="w-full text-left p-4 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition flex justify-between items-center"
                                    onClick={() => toggleOpen(incidencia.ID)}
                                >
                                    <span className="font-semibold text-neutral-800 dark:text-white">{incidencia.title}</span>
                                    {isOpen ? <ChevronUp className="w-5 h-5 text-primary-500" /> : <ChevronDown className="w-5 h-5 text-neutral-500" />}
                                </button>

                                {/* Contenido del Acordeón*/}
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-300 dark:border-neutral-700">
                                                <div className="text-sm font-medium mb-2 text-primary-600 dark:text-primary-400">
                                                    Categoría: <span className="font-normal text-neutral-700 dark:text-neutral-300 capitalize">{incidencia.category || 'General'}</span>
                                                </div>
                                                <div className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                                                    <h4 className="font-semibold mb-2 text-neutral-800 dark:text-white">Solución:</h4>
                                                    <p>{incidencia.solution}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}