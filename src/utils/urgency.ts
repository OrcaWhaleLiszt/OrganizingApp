import { Task } from '../types';

export function calculateUrgency(task: Task): number {
  if (!task.startDate || !task.duration) return 0;
  
  const endDate = new Date(task.startDate);
  endDate.setDate(endDate.getDate() + task.duration);
  const daysUntilStart = Math.ceil((task.startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  // High urgency if close to starting or ending
  if (daysUntilStart <= 0) return 5; // Should have already started
  if (daysUntilStart <= 3) return 4; // Very soon
  if (daysUntilStart <= 7) return 3; // Soon
  if (daysUntilStart <= 14) return 2; // Moderate
  return 1; // Low
}

export function getUrgencyColor(urgency: number): string {
  if (urgency >= 4) return 'border-red-500';
  if (urgency === 3) return 'border-orange-500';
  if (urgency === 2) return 'border-yellow-500';
  return 'border-gray-400';
}

