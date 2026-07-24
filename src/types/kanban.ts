export type Priority = 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate?: string;
  tags: string[];
  createdAt: string;
};

export type Column = {
  id: string;
  title: string;
  color: string;
  taskIds: string[];
};

export type Board = {
  columns: Column[];
  tasks: Record<string, Task>;
};

export type TaskFormValues = Omit<Task, 'id' | 'createdAt'>;
