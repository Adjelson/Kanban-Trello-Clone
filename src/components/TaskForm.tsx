import { useMemo, useState, type FormEvent } from 'react';
import type { Priority, Task, TaskFormValues } from '../types/kanban';

interface TaskFormProps {
  task?: Task;
  onSubmit: (values: TaskFormValues) => void;
  onCancel: () => void;
}

const priorities: Array<{ value: Priority; label: string }> = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
];

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const initialTags = useMemo(() => task?.tags.join(', ') ?? '', [task]);
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '');
  const [tags, setTags] = useState(initialTags);
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (title.trim().length < 3) {
      setError('Use um título com pelo menos 3 caracteres.');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate,
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 5),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="task-title" className="mb-2 block text-sm font-semibold text-slate-700">
          Título <span className="text-rose-500">*</span>
        </label>
        <input
          id="task-title"
          autoFocus
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setError('');
          }}
          placeholder="Ex.: Preparar demonstração"
          className="field"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'task-title-error' : undefined}
        />
        {error && (
          <p id="task-title-error" className="mt-2 text-sm font-medium text-rose-600">
            {error}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="task-description" className="mb-2 block text-sm font-semibold text-slate-700">
          Descrição
        </label>
        <textarea
          id="task-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Adicione contexto suficiente para a próxima ação."
          rows={4}
          className="field resize-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="task-priority" className="mb-2 block text-sm font-semibold text-slate-700">
            Prioridade
          </label>
          <select
            id="task-priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value as Priority)}
            className="field"
          >
            {priorities.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="task-due-date" className="mb-2 block text-sm font-semibold text-slate-700">
            Prazo
          </label>
          <input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="field"
          />
        </div>
      </div>

      <div>
        <label htmlFor="task-tags" className="mb-2 block text-sm font-semibold text-slate-700">
          Etiquetas
        </label>
        <input
          id="task-tags"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="React, UX, Prioridade"
          className="field"
        />
        <p className="mt-2 text-xs text-slate-500">Separe por vírgulas. Máximo de 5 etiquetas.</p>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" className="btn-primary">
          {task ? 'Guardar alterações' : 'Criar tarefa'}
        </button>
      </div>
    </form>
  );
}
