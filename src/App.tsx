import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { AlertTriangle, Keyboard, MousePointer2, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ColumnForm } from './components/ColumnForm';
import { Header } from './components/Header';
import { KanbanColumn } from './components/KanbanColumn';
import { Modal } from './components/Modal';
import { TaskCard } from './components/TaskCard';
import { TaskForm } from './components/TaskForm';
import { defaultBoard } from './data/defaultBoard';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Board, Task, TaskFormValues } from './types/kanban';

const STORAGE_KEY = 'flowboard-kanban-v1';
const HISTORY_LIMIT = 30;

type TaskModalState =
  | { mode: 'create'; columnId: string }
  | { mode: 'edit'; columnId: string; taskId: string }
  | null;

type ColumnModalState = { mode: 'create' } | { mode: 'edit'; columnId: string } | null;

type ConfirmState =
  | { type: 'task'; taskId: string }
  | { type: 'column'; columnId: string }
  | { type: 'reset' }
  | null;

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function cloneBoard(board: Board): Board {
  return structuredClone(board);
}

export default function App() {
  const { value: board, setValue: setBoard, savedAt } = useLocalStorage<Board>(STORAGE_KEY, defaultBoard);
  const [history, setHistory] = useState<Board[]>([]);
  const [search, setSearch] = useState('');
  const [taskModal, setTaskModal] = useState<TaskModalState>(null);
  const [columnModal, setColumnModal] = useState<ColumnModalState>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('Quadro carregado.');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const boardRef = useRef(board);
  const dragOriginRef = useRef<Board | null>(null);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  useEffect(() => {
    if (announcement === 'Quadro carregado.') return;
    setNoticeVisible(true);
    const timeout = window.setTimeout(() => setNoticeVisible(false), 2800);
    return () => window.clearTimeout(timeout);
  }, [announcement]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const commitBoard = useCallback(
    (nextBoard: Board, message: string) => {
      setHistory((current) => [...current.slice(-(HISTORY_LIMIT - 1)), cloneBoard(boardRef.current)]);
      setBoard(nextBoard);
      setAnnouncement(message);
    },
    [setBoard],
  );

  const findColumnIdByTask = useCallback(
    (taskId: string, sourceBoard: Board = boardRef.current) =>
      sourceBoard.columns.find((column) => column.taskIds.includes(taskId))?.id,
    [],
  );

  const filteredBoard = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-PT');
    if (!query) return board;

    return {
      ...board,
      columns: board.columns.map((column) => ({
        ...column,
        taskIds: column.taskIds.filter((taskId) => {
          const task = board.tasks[taskId];
          const haystack = [task.title, task.description, task.tags.join(' '), task.priority]
            .join(' ')
            .toLocaleLowerCase('pt-PT');
          return haystack.includes(query);
        }),
      })),
    };
  }, [board, search]);

  const firstColumnId = board.columns[0]?.id;

  const openCreateTask = useCallback(
    (columnId?: string) => {
      const targetColumnId = columnId ?? firstColumnId;
      if (!targetColumnId) {
        setColumnModal({ mode: 'create' });
        setAnnouncement('Crie uma coluna antes de adicionar tarefas.');
        return;
      }
      setTaskModal({ mode: 'create', columnId: targetColumnId });
    },
    [firstColumnId],
  );

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !isTyping) {
        event.preventDefault();
        if (history.length > 0) {
          const previous = history[history.length - 1];
          setHistory((items) => items.slice(0, -1));
          setBoard(previous);
          setAnnouncement('Última ação desfeita.');
        }
      }

      if (event.key === '/' && !isTyping) {
        event.preventDefault();
        document.getElementById('global-search')?.focus();
      }

      if (event.key.toLowerCase() === 'n' && !isTyping && !event.ctrlKey && !event.metaKey) {
        openCreateTask();
      }

      if (event.key.toLowerCase() === 'c' && !isTyping && !event.ctrlKey && !event.metaKey) {
        setColumnModal({ mode: 'create' });
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [history, openCreateTask, setBoard]);

  const handleUndo = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setHistory((items) => items.slice(0, -1));
    setBoard(previous);
    setAnnouncement('Última ação desfeita.');
  };

  const handleCreateTask = (values: TaskFormValues) => {
    if (!taskModal || taskModal.mode !== 'create') return;
    const taskId = createId('task');
    const nextBoard = cloneBoard(board);
    const column = nextBoard.columns.find((item) => item.id === taskModal.columnId);
    if (!column) return;

    nextBoard.tasks[taskId] = {
      id: taskId,
      createdAt: new Date().toISOString(),
      ...values,
    };
    column.taskIds.push(taskId);
    commitBoard(nextBoard, `Tarefa “${values.title}” criada.`);
    setTaskModal(null);
  };

  const handleEditTask = (values: TaskFormValues) => {
    if (!taskModal || taskModal.mode !== 'edit') return;
    const existing = board.tasks[taskModal.taskId];
    if (!existing) return;

    const nextBoard = cloneBoard(board);
    nextBoard.tasks[taskModal.taskId] = { ...existing, ...values };
    commitBoard(nextBoard, `Tarefa “${values.title}” atualizada.`);
    setTaskModal(null);
  };

  const handleCreateColumn = (title: string, color: string) => {
    const nextBoard = cloneBoard(board);
    nextBoard.columns.push({ id: createId('column'), title, color, taskIds: [] });
    commitBoard(nextBoard, `Coluna “${title}” criada.`);
    setColumnModal(null);
  };

  const handleEditColumn = (title: string, color: string) => {
    if (!columnModal || columnModal.mode !== 'edit') return;
    const nextBoard = cloneBoard(board);
    const column = nextBoard.columns.find((item) => item.id === columnModal.columnId);
    if (!column) return;
    column.title = title;
    column.color = color;
    commitBoard(nextBoard, `Coluna “${title}” atualizada.`);
    setColumnModal(null);
  };

  const executeDelete = () => {
    if (!confirm) return;
    const nextBoard = cloneBoard(board);

    if (confirm.type === 'task') {
      const task = nextBoard.tasks[confirm.taskId];
      nextBoard.columns.forEach((column) => {
        column.taskIds = column.taskIds.filter((taskId) => taskId !== confirm.taskId);
      });
      delete nextBoard.tasks[confirm.taskId];
      commitBoard(nextBoard, `Tarefa “${task?.title ?? ''}” excluída.`);
    }

    if (confirm.type === 'column') {
      const column = nextBoard.columns.find((item) => item.id === confirm.columnId);
      if (!column) return;
      column.taskIds.forEach((taskId) => delete nextBoard.tasks[taskId]);
      nextBoard.columns = nextBoard.columns.filter((item) => item.id !== confirm.columnId);
      commitBoard(nextBoard, `Coluna “${column.title}” e as suas tarefas foram excluídas.`);
    }

    if (confirm.type === 'reset') {
      commitBoard(cloneBoard(defaultBoard), 'Quadro restaurado para o exemplo inicial.');
    }

    setConfirm(null);
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    dragOriginRef.current = cloneBoard(boardRef.current);
    const taskId = String(active.id);
    setActiveTaskId(taskId);
    const task = boardRef.current.tasks[taskId];
    if (task) setAnnouncement(`A mover a tarefa “${task.title}”.`);
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const sourceColumnId = findColumnIdByTask(activeId);
    const targetColumnId = boardRef.current.columns.some((column) => column.id === overId)
      ? overId
      : findColumnIdByTask(overId);

    if (!sourceColumnId || !targetColumnId || sourceColumnId === targetColumnId) return;

    const nextBoard = cloneBoard(boardRef.current);
    const sourceColumn = nextBoard.columns.find((column) => column.id === sourceColumnId);
    const targetColumn = nextBoard.columns.find((column) => column.id === targetColumnId);
    if (!sourceColumn || !targetColumn) return;

    sourceColumn.taskIds = sourceColumn.taskIds.filter((id) => id !== activeId);
    const overIndex = targetColumn.taskIds.indexOf(overId);
    const insertIndex = overIndex >= 0 ? overIndex : targetColumn.taskIds.length;
    targetColumn.taskIds.splice(insertIndex, 0, activeId);
    setBoard(nextBoard);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveTaskId(null);
    if (!over) {
      if (dragOriginRef.current) setBoard(dragOriginRef.current);
      dragOriginRef.current = null;
      setAnnouncement('Movimento cancelado.');
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    const columnId = findColumnIdByTask(activeId);
    if (!columnId) return;

    const currentBoard = boardRef.current;
    const nextBoard = cloneBoard(currentBoard);
    const column = nextBoard.columns.find((item) => item.id === columnId);
    if (!column) return;

    const oldIndex = column.taskIds.indexOf(activeId);
    const newIndex = column.taskIds.indexOf(overId);

    if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
      const [moved] = column.taskIds.splice(oldIndex, 1);
      column.taskIds.splice(newIndex, 0, moved);
    }

    const task = nextBoard.tasks[activeId];
    const originBoard = dragOriginRef.current;
    if (originBoard) {
      setHistory((current) => [...current.slice(-(HISTORY_LIMIT - 1)), originBoard]);
    }
    dragOriginRef.current = null;
    setBoard(nextBoard);
    const targetColumn = nextBoard.columns.find((item) => item.id === columnId);
    setAnnouncement(`Tarefa “${task.title}” movida para “${targetColumn?.title ?? ''}”.`);
  };

  const activeTask = activeTaskId ? board.tasks[activeTaskId] : null;
  const selectedTask = taskModal?.mode === 'edit' ? board.tasks[taskModal.taskId] : undefined;
  const selectedColumn = columnModal?.mode === 'edit'
    ? board.columns.find((column) => column.id === columnModal.columnId)
    : undefined;

  const totalTasks = Object.keys(board.tasks).length;
  const savedLabel = savedAt
    ? `Guardado automaticamente às ${savedAt.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`
    : 'Guardado automaticamente neste dispositivo';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#e0f2fe,_transparent_32%),linear-gradient(to_bottom,_#f8fafc,_#eef2ff)] text-slate-900">
      <a
        href="#board"
        className="fixed left-3 top-3 z-[60] -translate-y-20 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition focus:translate-y-0"
      >
        Ir para o quadro
      </a>

      <Header
        search={search}
        onSearchChange={setSearch}
        onAddTask={() => openCreateTask()}
        onAddColumn={() => setColumnModal({ mode: 'create' })}
        onUndo={handleUndo}
        canUndo={history.length > 0}
        onOpenHelp={() => setHelpOpen(true)}
        savedLabel={savedLabel}
      />

      <main id="board" className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">Workspace pessoal</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Planeamento de produto</h2>
            <p className="mt-1 text-sm text-slate-500">
              {board.columns.length} colunas · {totalTasks} tarefas · arraste para reorganizar
            </p>
          </div>
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="self-start rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 hover:text-slate-950"
            >
              Limpar pesquisa
            </button>
          )}
        </section>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={() => {
            if (dragOriginRef.current) setBoard(dragOriginRef.current);
            dragOriginRef.current = null;
            setActiveTaskId(null);
            setAnnouncement('Movimento cancelado.');
          }}
        >
          <div className="flex min-h-[calc(100vh-230px)] snap-x snap-mandatory gap-4 overflow-x-auto pb-6 pr-4 sm:gap-5">
            {filteredBoard.columns.map((column) => {
              const tasks = column.taskIds
                .map((taskId) => filteredBoard.tasks[taskId])
                .filter((task): task is Task => Boolean(task));
              return (
                <div key={column.id} className="snap-start">
                  <KanbanColumn
                    column={column}
                    tasks={tasks}
                    onAddTask={() => openCreateTask(column.id)}
                    onEditTask={(taskId) => setTaskModal({ mode: 'edit', columnId: column.id, taskId })}
                    onDeleteTask={(taskId) => setConfirm({ type: 'task', taskId })}
                    onEditColumn={() => setColumnModal({ mode: 'edit', columnId: column.id })}
                    onDeleteColumn={() => setConfirm({ type: 'column', columnId: column.id })}
                  />
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => setColumnModal({ mode: 'create' })}
              className="flex h-36 w-[86vw] min-w-[86vw] snap-start items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-slate-300 bg-white/45 text-sm font-black text-slate-500 transition hover:border-sky-300 hover:bg-white hover:text-sky-700 sm:w-80 sm:min-w-80"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white shadow-sm">+</span>
              Criar nova coluna
            </button>
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="w-80">
                <TaskCard task={activeTask} onEdit={() => undefined} onDelete={() => undefined} isOverlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {search && filteredBoard.columns.every((column) => column.taskIds.length === 0) && (
          <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="font-bold text-slate-900">Nenhuma tarefa encontrada.</p>
            <p className="mt-1 text-sm text-slate-500">Tente outro termo ou limpe a pesquisa.</p>
          </div>
        )}
      </main>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {noticeVisible && (
        <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 animate-slide-up rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white shadow-2xl sm:bottom-6">
          {announcement}
        </div>
      )}

      {taskModal && (
        <Modal
          title={taskModal.mode === 'create' ? 'Nova tarefa' : 'Editar tarefa'}
          description={
            taskModal.mode === 'create'
              ? `A tarefa será adicionada à coluna “${board.columns.find((column) => column.id === taskModal.columnId)?.title ?? ''}”.`
              : 'Atualize apenas as informações necessárias.'
          }
          onClose={() => setTaskModal(null)}
        >
          <TaskForm
            task={selectedTask}
            onSubmit={taskModal.mode === 'create' ? handleCreateTask : handleEditTask}
            onCancel={() => setTaskModal(null)}
          />
        </Modal>
      )}

      {columnModal && (
        <Modal
          title={columnModal.mode === 'create' ? 'Criar coluna' : 'Editar coluna'}
          description="Use um nome curto e uma cor que facilite o reconhecimento visual."
          onClose={() => setColumnModal(null)}
          size="sm"
        >
          <ColumnForm
            initialTitle={selectedColumn?.title}
            initialColor={selectedColumn?.color}
            onSubmit={columnModal.mode === 'create' ? handleCreateColumn : handleEditColumn}
            onCancel={() => setColumnModal(null)}
          />
        </Modal>
      )}

      {confirm && (
        <Modal title="Confirmar ação" onClose={() => setConfirm(null)} size="sm">
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertTriangle size={26} />
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-950">
              {confirm.type === 'reset' ? 'Restaurar o quadro?' : 'Excluir definitivamente?'}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {confirm.type === 'column'
                ? 'As tarefas existentes nesta coluna também serão removidas. Poderá usar “Desfazer” logo depois.'
                : confirm.type === 'task'
                  ? 'A tarefa será removida do quadro. Poderá usar “Desfazer” logo depois.'
                  : 'O conteúdo atual será substituído pelo quadro de demonstração.'}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <button type="button" onClick={() => setConfirm(null)} className="btn-secondary">
                Cancelar
              </button>
              <button type="button" onClick={executeDelete} className="btn-danger">
                {confirm.type === 'reset' ? 'Restaurar' : 'Excluir'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {helpOpen && (
        <Modal
          title="Ajuda rápida"
          description="Atalhos, drag & drop e princípios de usabilidade aplicados."
          onClose={() => setHelpOpen(false)}
          size="lg"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <HelpCard icon={<MousePointer2 size={20} />} title="Arrastar tarefas">
              Segure o ícone de arrastar e mova a tarefa. Também funciona por teclado com Tab, Espaço e setas.
            </HelpCard>
            <HelpCard icon={<Keyboard size={20} />} title="Atalhos">
              Use <kbd>N</kbd> para nova tarefa, <kbd>C</kbd> para nova coluna, <kbd>/</kbd> para pesquisar e <kbd>Ctrl/⌘ + Z</kbd> para desfazer.
            </HelpCard>
            <HelpCard icon={<ShieldCheck size={20} />} title="Prevenção de erros">
              Exclusões pedem confirmação, os formulários validam campos e as ações podem ser desfeitas.
            </HelpCard>
            <HelpCard icon={<Sparkles size={20} />} title="Persistência automática">
              O quadro é guardado no LocalStorage do navegador. Não é necessário criar conta.
            </HelpCard>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <h3 className="font-black text-slate-950">Princípios aplicados</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Status de gravação visível, linguagem familiar, ações reversíveis, componentes consistentes,
              validações preventivas, reconhecimento por cores e ícones, atalhos, interface minimalista,
              mensagens de erro claras e ajuda acessível.
            </p>
          </div>

          <div className="mt-5 flex justify-end">
            <button type="button" onClick={() => setConfirm({ type: 'reset' })} className="btn-secondary">
              <RotateCcw size={17} /> Restaurar exemplo
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function HelpCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <article className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-sky-700">
        {icon}
        <h3 className="font-black text-slate-950">{title}</h3>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-500">{children}</p>
    </article>
  );
}
