import { Task } from '../types';

const STORAGE_KEY = 'organizing-app-tasks';

export function saveTasks(tasks: Task[]): void {
  try {
    const serialized = JSON.stringify(tasks.map(task => ({
      ...task,
      startDate: task.startDate ? task.startDate.toISOString() : null,
      createdAt: task.createdAt.toISOString(),
    })));
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save tasks:', error);
  }
}

export function loadTasks(): Task[] {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return [];
    
    const tasks = JSON.parse(serialized);
    return tasks.map((task: any) => ({
      ...task,
      startDate: task.startDate ? new Date(task.startDate) : null,
      createdAt: new Date(task.createdAt),
      originalViewMode: task.originalViewMode || 'daily', // fallback for old data
    }));
  } catch (error) {
    console.error('Failed to load tasks:', error);
    return [];
  }
}

