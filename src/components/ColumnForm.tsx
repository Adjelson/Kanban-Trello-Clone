import { useState, type FormEvent } from 'react';

interface ColumnFormProps {
  initialTitle?: string;
  initialColor?: string;
  onSubmit: (title: string, color: string) => void;
  onCancel: () => void;
}

const colors = ['#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

export function ColumnForm({
  initialTitle = '',
  initialColor = colors[0],
  onSubmit,
  onCancel,
}: ColumnFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [color, setColor] = useState(initialColor);
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (title.trim().length < 2) {
      setError('Introduza um nome com pelo menos 2 caracteres.');
      return;
    }
    onSubmit(title.trim(), color);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="column-title" className="mb-2 block text-sm font-semibold text-slate-700">
          Nome da coluna
        </label>
        <input
          id="column-title"
          autoFocus
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setError('');
          }}
          placeholder="Ex.: Em validação"
          className="field"
        />
        {error && <p className="mt-2 text-sm font-medium text-rose-600">{error}</p>}
      </div>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-slate-700">Cor de identificação</legend>
        <div className="flex flex-wrap gap-3">
          {colors.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setColor(option)}
              className={`h-10 w-10 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                color === option ? 'scale-110 ring-2 ring-slate-900 ring-offset-2' : 'hover:scale-105'
              }`}
              style={{ backgroundColor: option }}
              aria-label={`Selecionar cor ${option}`}
              aria-pressed={color === option}
            />
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" className="btn-primary">
          Guardar coluna
        </button>
      </div>
    </form>
  );
}
