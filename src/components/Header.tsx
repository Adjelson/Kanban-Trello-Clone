import { CircleHelp, Columns3, Plus, Search, Undo2 } from 'lucide-react';

interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onAddTask: () => void;
  onAddColumn: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onOpenHelp: () => void;
  savedLabel: string;
}

export function Header({
  search,
  onSearchChange,
  onAddTask,
  onAddColumn,
  onUndo,
  canUndo,
  onOpenHelp,
  savedLabel,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
              <Columns3 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-slate-950">Flowboard</h1>
                <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-sky-700 ring-1 ring-sky-100">
                  Kanban
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500">{savedLabel}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenHelp}
            className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Abrir ajuda"
          >
            <CircleHelp size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 sm:w-64 lg:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              id="global-search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Pesquisar tarefas…"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-12 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
            />
            <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-400 sm:block">
              /
            </kbd>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
              title="Desfazer última ação (Ctrl/Cmd + Z)"
            >
              <Undo2 size={17} />
              <span className="hidden xl:inline">Desfazer</span>
            </button>
            <button
              type="button"
              onClick={onAddColumn}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <Columns3 size={17} />
              <span className="hidden sm:inline">Nova coluna</span>
            </button>
            <button type="button" onClick={onAddTask} className="btn-primary h-11 whitespace-nowrap px-4">
              <Plus size={18} /> Nova tarefa
            </button>
            <button
              type="button"
              onClick={onOpenHelp}
              className="hidden rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:block"
              aria-label="Abrir ajuda"
            >
              <CircleHelp size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
