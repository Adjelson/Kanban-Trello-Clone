import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Column, Task } from '../types/kanban';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditColumn: () => void;
  onDeleteColumn: () => void;
}

export function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onEditColumn,
  onDeleteColumn,
}: KanbanColumnProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'column', columnId: column.id },
  });

  return (
    <section
      className={`flex max-h-full w-[86vw] min-w-[86vw] flex-col rounded-3xl border bg-slate-50/90 p-3 shadow-sm transition sm:w-80 sm:min-w-80 ${
        isOver ? 'border-sky-300 ring-4 ring-sky-100' : 'border-slate-200'
      }`}
      aria-label={`Coluna ${column.title}`}
    >
      <header className="flex items-center justify-between gap-3 px-1 pb-3 pt-1">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: column.color }} />
          <h2 className="truncate text-sm font-extrabold text-slate-900">{column.title}</h2>
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
            {tasks.length}
          </span>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-slate-800 hover:shadow-sm"
            aria-label={`Ações da coluna ${column.title}`}
            aria-expanded={menuOpen}
          >
            <MoreHorizontal size={19} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 z-30 w-40 animate-fade-in rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEditColumn();
                }}
                className="menu-item"
              >
                <Pencil size={15} /> Editar coluna
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDeleteColumn();
                }}
                className="menu-item text-rose-600 hover:bg-rose-50"
              >
                <Trash2 size={15} /> Excluir coluna
              </button>
            </div>
          )}
        </div>
      </header>

      <div ref={setNodeRef} className="min-h-28 flex-1 space-y-3 overflow-y-auto px-0.5 pb-2 pr-1">
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => onEditTask(task.id)}
              onDelete={() => onDeleteTask(task.id)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <button
            type="button"
            onClick={onAddTask}
            className="flex min-h-28 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 px-4 text-center text-sm font-semibold text-slate-400 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
          >
            <Plus className="mb-2" size={20} />
            Adicionar a primeira tarefa
          </button>
        )}
      </div>

      {tasks.length > 0 && (
        <button
          type="button"
          onClick={onAddTask}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold text-slate-500 transition hover:bg-white hover:text-slate-900 hover:shadow-sm"
        >
          <Plus size={18} /> Adicionar tarefa
        </button>
      )}
    </section>
  );
}
