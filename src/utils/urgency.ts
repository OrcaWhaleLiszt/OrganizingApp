import { Task } from '../types';

export function calculateUrgency(task: Task): number {
  if (!task.startDate || !task.duration) return 0;

  const now = Date.now();
  const startTime = task.startDate.getTime();
  const endTime = task.startDate.getTime() + task.duration * 60 * 60 * 1000; // duration is in hours

  const hoursUntilStart = Math.ceil((startTime - now) / (1000 * 60 * 60));
  const hoursUntilEnd = Math.ceil((endTime - now) / (1000 * 60 * 60));

  // High urgency if already overdue or ending soon
  if (hoursUntilEnd <= 0) return 5; // Already overdue
  if (hoursUntilStart <= 0) return 4; // Already started, ending soon
  if (hoursUntilStart <= 24) return 4; // Starting within 24 hours
  if (hoursUntilStart <= 72) return 3; // Starting within 3 days
  if (hoursUntilStart <= 168) return 2; // Starting within 1 week
  return 1; // Low urgency
}

export function getUrgencyColor(urgency: number): string {
  if (urgency >= 4) return 'border-red-500';
  if (urgency === 3) return 'border-orange-500';
  if (urgency === 2) return 'border-yellow-500';
  return 'border-gray-400';
}

