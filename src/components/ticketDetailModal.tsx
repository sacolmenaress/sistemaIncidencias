import React, { useState, useEffect } from 'react';
// --- ¡ARREGLO #1: Importar 'Variants' y 'motion'/'AnimatePresence' correctamente ---
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { X, Edit, Save, XCircle } from 'lucide-react';

// --- ¡ARREGLO #2: Corregir la ruta de importación y usar '.tsx'! ---
// (Asumiendo que 'components' y 'pages' son hermanos dentro de 'src')
import type { Ticket } from '../pages/dashboardPage.tsx';

interface ModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  isEditable?: boolean;
  onUpdate?: (updatedTicket: Partial<Ticket>) => Promise<void>;
}

// --- ¡ARREGLO #3: Tipar explícitamente las variantes ---
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

export function TicketDetailModal({ ticket, onClose, isEditable = false, onUpdate }: ModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedStatus, setEditedStatus] = useState('');
  const [editedPriority, setEditedPriority] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ticket) {
      setEditedTitle(ticket.title);
      setEditedDescription(ticket.description);
      setEditedStatus(ticket.status);
      setEditedPriority(ticket.priority);
    }
  }, [ticket]);

  const handleSave = async () => {
    if (!ticket || !onUpdate) return;

    setIsSaving(true);
    setError(null);
    try {
      await onUpdate({
        title: editedTitle,
        description: editedDescription,
        status: editedStatus,
        priority: editedPriority,
      });
      setIsEditing(false);
      onClose(); // Close modal after successful save
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al actualizar el ticket.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    // Reset to original values
    if (ticket) {
      setEditedTitle(ticket.title);
      setEditedDescription(ticket.description);
      setEditedStatus(ticket.status);
      setEditedPriority(ticket.priority);
    }
  };

  return (
    <AnimatePresence>
      {ticket && ( // <-- ¡La animación SÓLO se aplica si el ticket existe!
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit" // Usamos el 'exit' definido
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
            {/* Botón de Cerrar */}
            <button
              onClick={onClose}
              className="absolute -top-3 -right-3 rounded-full bg-red-600 p-1 text-white shadow-lg transition hover:scale-110"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Encabezado del Modal */}
            <div className="border-b border-neutral-200 pb-4 dark:border-neutral-700">
              {/* --- ARREGLO #4: TypeScript ahora sabe qué es 'ticket' --- */}
              <h3 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                #{ticket.id}: {isEditing ? (
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-neutral-900 dark:border-neutral-600 dark:text-neutral-100"
                  />
                ) : (
                  ticket.title
                )}
              </h3>
              <div className="mt-2 flex items-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400">
                <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                <span>|</span>
                {isEditing ? (
                  <select
                    value={editedStatus}
                    onChange={(e) => setEditedStatus(e.target.value)}
                    className="rounded border border-neutral-300 bg-transparent px-2 py-1 text-sm dark:border-neutral-600"
                  >
                    <option value="abierto">Abierto</option>
                    <option value="en proceso">En Proceso</option>
                    <option value="resuelto">Resuelto</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                ) : (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    ticket.status.toLowerCase() === 'resuelto' ? 'bg-green-100 text-green-800' :
                    ticket.status.toLowerCase().includes('proceso') ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {ticket.status}
                  </span>
                )}
              </div>
            </div>

            {/* Cuerpo del Modal */}
            <div className="mt-4 max-h-[60vh] overflow-y-auto">
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Prioridad:</label>
                {isEditing ? (
                  <select
                    value={editedPriority}
                    onChange={(e) => setEditedPriority(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                ) : (
                  <span className="mt-1 block text-neutral-600 dark:text-neutral-300 capitalize">{ticket.priority}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">Descripción:</label>
                {isEditing ? (
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
                  />
                ) : (
                  <p className="mt-2 whitespace-pre-wrap text-neutral-600 dark:text-neutral-300">
                    {ticket.description}
                  </p>
                )}
              </div>
            </div>

            {/* Botones de Acción */}
            {isEditable && (
              <div className="mt-6 flex justify-end space-x-3 border-t border-neutral-200 pt-4 dark:border-neutral-700">
                {error && <div className="flex-1 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</div>}
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 rounded-lg bg-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-500"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Cancelar</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center space-x-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Editar</span>
                  </button>
                )}
              </div>
            )}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
