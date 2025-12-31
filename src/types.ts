export interface Task {
  id: string;
  title: string;
  importance: number; // 1-10
  startDate: Date | null;
  duration: number; // in hours for daily/weekly views, in days for monthly view
  progress: number; // 0-100
  urgency: number; // automatically calculated
  completed: boolean; // marked as done
  createdAt: Date;
  originalViewMode: ViewMode; // which view mode the task was created in
}

export type ViewMode = 'daily' | 'weekly' | 'monthly';
export type SortBy = 'urgency' | 'importance' | null;
export type SortOrder = 'asc' | 'desc';

