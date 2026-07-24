import type { Board } from '../types/kanban';

export const defaultBoard: Board = {
  columns: [
    {
      id: 'backlog',
      title: 'Ideias',
      color: '#8b5cf6',
      taskIds: ['task-1', 'task-2'],
    },
    {
      id: 'doing',
      title: 'Em andamento',
      color: '#0ea5e9',
      taskIds: ['task-3'],
    },
    {
      id: 'review',
      title: 'Em revisão',
      color: '#f59e0b',
      taskIds: ['task-4'],
    },
    {
      id: 'done',
      title: 'Concluído',
      color: '#10b981',
      taskIds: [],
    },
  ],
  tasks: {
    'task-1': {
      id: 'task-1',
      title: 'Definir identidade visual',
      description: 'Escolher tipografia, espaçamento e padrões de interface.',
      priority: 'medium',
      dueDate: '',
      tags: ['Design', 'UI'],
      createdAt: new Date().toISOString(),
    },
    'task-2': {
      id: 'task-2',
      title: 'Mapear fluxo do utilizador',
      description: 'Documentar o caminho principal e os estados de erro.',
      priority: 'low',
      dueDate: '',
      tags: ['UX'],
      createdAt: new Date().toISOString(),
    },
    'task-3': {
      id: 'task-3',
      title: 'Implementar drag & drop',
      description: 'Permitir mover e ordenar tarefas entre colunas.',
      priority: 'high',
      dueDate: '',
      tags: ['React', 'DND'],
      createdAt: new Date().toISOString(),
    },
    'task-4': {
      id: 'task-4',
      title: 'Validar responsividade',
      description: 'Testar a experiência em telemóvel, tablet e desktop.',
      priority: 'medium',
      dueDate: '',
      tags: ['QA'],
      createdAt: new Date().toISOString(),
    },
  },
};
