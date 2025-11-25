import React, { useEffect, useState, type FormEvent } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { X } from 'lucide-react';
import { api } from '../../services/apiCliente'; 
import { TEInput, TERipple } from 'tw-elements-react';

// Importamos el tipo 'Ticket' que ya exportamos
import type { Ticket } from '../pages/dashboardPage.tsx'; 

interface ModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  onUpdate: () => void; // ¡NUEVO! Función para avisar que se actualizó
}

// --- Variantes de animación (igual que en TicketDetailModal) ---
const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }, // Añadido 'exit' para AnimatePresence
};

const modalVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } },
  exit: { opacity: 0, y: 50, scale: 0.9, transition: { duration: 0.2 } },
};

export function AdminTicketModal({ ticket, onClose, onUpdate }: ModalProps) {
  // --- ¡NUEVO! Estados para el formulario de edición ---
  const [newStatus, setNewStatus] = useState(ticket?.status || 'abierto');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Efecto para actualizar el estado si el ticket cambia
  useEffect(() => {
    if (ticket) {
      setNewStatus(ticket.status);
    }
  }, [ticket]);

  if (!ticket) return null;

  // --- ¡NUEVO! Manejador para actualizar el ticket ---
  const handleUpdateTicket = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Llamamos al endpoint PUT que ya creamos en Go
      await api.put(`/tickets/${ticket.id}`, {
        status: newStatus,
      });
      
      setIsLoading(false);
      onUpdate(); // Avisa al dashboard que recargue la lista
      onClose(); // Cierra el modal

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al actualizar el ticket.");
      }
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resuelto':
        return 'bg-green-100 text-green-800';
      case 'en proceso':
      case 'en_proceso':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <AnimatePresence>
      {ticket && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className="relative mx-4 w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-800"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={onClose} 
              className="absolute -top-3 -right-3 rounded-full bg-red-600 p-1 text-white shadow-lg transition hover:scale-110"
            >
              <X className="h-5 w-5" />
            </button>

            {/* --- Encabezado (Igual que antes) --- */}
            <div className="border-b border-neutral-200 pb-4 dark:border-neutral-700">
              <h3 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                #{ticket.id}: {ticket.title}
              </h3>
              <div className="mt-2 flex items-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400">
                <span>Creado por: {ticket.user.firstName} {ticket.user.lastName}</span>
                <span>|</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadge(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>
            </div>

            {/* --- Cuerpo (Igual que antes) --- */}
            <div className="mt-4 max-h-[40vh] overflow-y-auto">
              <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">Descripción:</h4>
              <p className="mt-2 whitespace-pre-wrap text-neutral-600 dark:text-neutral-300">
                {ticket.description}
              </p>
            </div>

            {/* --- ¡NUEVO! Formulario de Gestión de Admin --- */}
            <form onSubmit={handleUpdateTicket} className="mt-6 border-t border-neutral-200 pt-6 dark:border-neutral-700">
              <h4 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">Panel de Gestión</h4>
              
              {error && <div className="mt-2 rounded-md bg-red-100 p-3 text-sm text-red-700">{error}</div>}

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Selector de Estado */}
                <div>
                  <label htmlFor="status" className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    Cambiar Estado
                  </label>
                  <select
                    id="status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="block w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2.5 text-neutral-700 transition duration-200 ease-in-out focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-600 dark:text-neutral-200 dark:focus:border-primary"
                  >
                    <option value="abierto">Abierto</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="resuelto">Resuelto</option>
                  </select>
                </div>

                {/* Botón de Actualizar */}
                <div className="sm:self-end">
                  <TERipple rippleColor="light" className="w-full">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-block w-full rounded bg-primary px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-white shadow-md transition duration-150 ease-in-out hover:bg-primary-600 focus:outline-none disabled:opacity-50"
                    >
                      {isLoading ? 'Actualizando...' : 'Actualizar Ticket'}
                    </button>
                  </TERipple>
                </div>
              </div>
            </form>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}