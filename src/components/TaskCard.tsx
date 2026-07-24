import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { CalendarDays, GripVertical, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Task } from '../types/kanban';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  isOverlay?: boolean;
}

const priorityStyles = {
  low: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  medium: 'bg-amber-50 text-amber-700 ring-amber-100',
  high: 'bg-rose-50 text-rose-700 ring-rose-100',
};

const priorityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

export function TaskCard({ task, onEdit, onDelete, isOverlay = false }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: isOverlay ? `${task.id}-overlay` : task.id,
    disabled: isOverlay,
    data: { type: 'task', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dueDate = task.dueDate
    ? new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' }).format(
        new Date(`${task.dueDate}T12:00:00`),
      )
    : null;

  const isOverdue = Boolean(task.dueDate && new Date(`${task.dueDate}T23:59:59`) < new Date());

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-within:ring-2 focus-within:ring-sky-200 ${
        isDragging ? 'opacity-35' : ''
      } ${isOverlay ? 'rotate-2 shadow-2xl' : ''}`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 cursor-grab rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing"
          aria-label={`Arrastar tarefa ${task.title}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={18} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="break-words text-sm font-bold leading-5 text-slate-900">{task.title}</h3>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Abrir ações da tarefa"
                aria-expanded={menuOpen}
              >
                <MoreHorizontal size={18} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-9 z-20 w-36 animate-fade-in rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit();
                    }}
                    className="menu-item"
                  >
                    <Pencil size={15} /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete();
                    }}
                    className="menu-item text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 size={15} /> Excluir
                  </button>
                </div>
              )}
            </div>
          </div>

          {task.description && (
            <p className="mt-2 line-clamp-3 text-sm leading-5 text-slate-500">{task.description}</p>
          )}

          {task.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {task.tags.map((tag) => (
                <span key={tag} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${priorityStyles[task.priority]}`}>
              {priorityLabels[task.priority]}
            </span>
            {dueDate && (
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold ${isOverdue ? 'text-rose-600' : 'text-slate-500'}`}
                title={isOverdue ? 'Prazo ultrapassado' : 'Data limite'}
              >
                <CalendarDays size={14} /> {dueDate}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
