import { useState, useEffect, useRef } from 'react';
import { Task, ViewMode } from '../types';

interface CreateTaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'urgency' | 'createdAt' | 'originalViewMode'>) => void;
  viewMode: ViewMode;
  currentDate: Date;
}

export default function CreateTaskForm({ onSubmit, viewMode, currentDate }: CreateTaskFormProps) {
  const [title, setTitle] = useState('');
  const [importance, setImportance] = useState<number>(5);
  const [startHour, setStartHour] = useState<number>(9);
  const [startDay, setStartDay] = useState<number>(1);
  const [duration, setDuration] = useState<number>(1);
  
  const [editingImportance, setEditingImportance] = useState(false);
  const [editingDuration, setEditingDuration] = useState(false);
  const [editingStart, setEditingStart] = useState(false);
  
  const importanceInputRef = useRef<HTMLInputElement>(null);
  const durationInputRef = useRef<HTMLInputElement>(null);
  const startInputRef = useRef<HTMLInputElement>(null);

  // Get max duration based on view mode
  const getMaxDuration = () => {
    if (viewMode === 'daily') return 24; // hours
    if (viewMode === 'weekly') return 168; // 7 days in hours
    return 30; // days for monthly
  };

  // Get minimum duration based on view mode
  const getMinDuration = () => {
    if (viewMode === 'weekly') return 4; // 4 hours minimum for weekly
    if (viewMode === 'monthly') return 1; // 1 day minimum for monthly
    return 0; // 0 hours minimum for daily
  };

  // Get step size based on view mode and current duration
  const getStepSize = () => {
    if (viewMode === 'monthly') return 1;
    if (viewMode === 'weekly') {
      return duration < 24 ? 4 : 1; // 4-hour steps initially, then 1-day steps
    }
    return 0.5; // 30-minute steps for daily
  };

  // Get max start value based on view mode
  const getMaxStart = () => {
    if (viewMode === 'daily') return 23; // hours (0-23)
    if (viewMode === 'weekly') return 7; // days (1-7)
    return 31; // days for monthly (1-31)
  };

  // Format start value display
  const formatStartValue = () => {
    if (viewMode === 'daily') {
      return `${startHour.toString().padStart(2, '0')}:00`;
    }
    if (viewMode === 'weekly') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days[startDay - 1] || 'Mon';
    }
    return `Day ${startDay}`;
  };

  // Format duration display
  const formatDuration = () => {
    if (viewMode === 'monthly') return `${duration} day${duration !== 1 ? 's' : ''}`;
    if (duration < 0.5) return 'Quick';
    if (duration >= 24) {
      const days = Math.round(duration / 24);
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
    return `${duration}h`;
  };

  // Auto-set defaults when view mode changes
  useEffect(() => {
    if (viewMode === 'daily') {
      setStartHour(9);
      setDuration(2);
    } else if (viewMode === 'weekly') {
      setStartDay(1);
      setDuration(4); // Minimum 4 hours for weekly
    } else if (viewMode === 'monthly') {
      setStartDay(1);
      setDuration(3);
    }
  }, [viewMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let startDate: Date | null = null;

    if (viewMode === 'daily') {
      const date = new Date(currentDate);
      date.setHours(startHour, 0, 0, 0);
      startDate = date;
    } else if (viewMode === 'weekly') {
      const dayOfWeek = currentDate.getDay();
      const monday = new Date(currentDate);
      monday.setDate(currentDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const dayOffset = startDay === 7 ? 6 : startDay - 1;
      monday.setDate(monday.getDate() + dayOffset);
      monday.setHours(9, 0, 0, 0);
      startDate = monday;
    } else if (viewMode === 'monthly') {
      const date = new Date(currentDate);
      date.setDate(startDay);
      date.setHours(0, 0, 0, 0);
      startDate = date;
    }

    onSubmit({
      title: title.trim(),
      importance: importance,
      startDate: startDate,
      duration: duration,
      progress: 0,
      completed: false,
    });

    // Reset form (keep duration, importance, and start time for convenience)
    setTitle('');
  };

  const handleImportanceEdit = (value: string) => {
    const num = parseInt(value) || 1;
    setImportance(Math.max(1, Math.min(10, num)));
  };

  const handleDurationEdit = (value: string) => {
    const num = parseFloat(value) || 0;
    setDuration(Math.max(getMinDuration(), Math.min(getMaxDuration(), num)));
  };

  const handleStartEdit = (value: string) => {
    const num = parseInt(value) || (viewMode === 'daily' ? 0 : 1);
    if (viewMode === 'daily') {
      setStartHour(Math.max(0, Math.min(23, num)));
    } else {
      setStartDay(Math.max(1, Math.min(getMaxStart(), num)));
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t-2 border-gray-700 p-4 shadow-lg z-20">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        {/* Task Title */}
        <div className="mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title..."
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            required
          />
        </div>

        {/* Importance Slider */}
        <div className="mb-3">
          <div className="flex items-center gap-3">
            <label className="text-sm text-white w-24">Importance</label>
            <input
              type="range"
              min="1"
              max="10"
              value={importance}
              onChange={(e) => setImportance(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-dark"
            />
            {editingImportance ? (
              <input
                ref={importanceInputRef}
                type="number"
                value={importance}
                onChange={(e) => handleImportanceEdit(e.target.value)}
                onBlur={() => setEditingImportance(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingImportance(false)}
                className="w-12 px-2 py-1 text-sm bg-gray-800 border border-blue-500 text-white rounded text-center"
                min="1"
                max="10"
                autoFocus
              />
            ) : (
              <span
                onClick={() => {
                  setEditingImportance(true);
                  setTimeout(() => importanceInputRef.current?.select(), 0);
                }}
                className="w-12 text-sm font-medium text-white cursor-pointer hover:text-blue-400 text-center"
              >
                {importance}
              </span>
            )}
          </div>
        </div>

        {/* Duration Slider */}
        <div className="mb-3">
          <div className="flex items-center gap-3">
            <label className="text-sm text-white w-24">Duration</label>
            <input
              type="range"
              min={getMinDuration()}
              max={getMaxDuration()}
              step={getStepSize()}
              value={duration}
              onChange={(e) => setDuration(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-dark"
            />
            {editingDuration ? (
              <input
                ref={durationInputRef}
                type="number"
                value={duration}
                onChange={(e) => handleDurationEdit(e.target.value)}
                onBlur={() => setEditingDuration(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingDuration(false)}
                className="w-16 px-2 py-1 text-sm bg-gray-800 border border-blue-500 text-white rounded text-center"
                step={getStepSize()}
                autoFocus
              />
            ) : (
              <span
                onClick={() => {
                  setEditingDuration(true);
                  setTimeout(() => durationInputRef.current?.select(), 0);
                }}
                className="w-16 text-sm font-medium text-white cursor-pointer hover:text-blue-400 text-center"
              >
                {formatDuration()}
              </span>
            )}
          </div>
        </div>

        {/* Start Time/Day Slider */}
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-white w-24">
              {viewMode === 'daily' ? 'Start Hour' : 'Start Day'}
            </label>
            <input
              type="range"
              min={viewMode === 'daily' ? '0' : '1'}
              max={getMaxStart()}
              value={viewMode === 'daily' ? startHour : startDay}
              onChange={(e) => {
                if (viewMode === 'daily') {
                  setStartHour(parseInt(e.target.value));
                } else {
                  setStartDay(parseInt(e.target.value));
                }
              }}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-dark"
            />
            {editingStart ? (
              <input
                ref={startInputRef}
                type="number"
                value={viewMode === 'daily' ? startHour : startDay}
                onChange={(e) => handleStartEdit(e.target.value)}
                onBlur={() => setEditingStart(false)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingStart(false)}
                className="w-20 px-2 py-1 text-sm bg-gray-800 border border-blue-500 text-white rounded text-center"
                autoFocus
              />
            ) : (
              <span
                onClick={() => {
                  setEditingStart(true);
                  setTimeout(() => startInputRef.current?.select(), 0);
                }}
                className="w-20 text-sm font-medium text-white cursor-pointer hover:text-blue-400 text-center"
              >
                {formatStartValue()}
              </span>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2.5 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          Create Task
        </button>
      </form>
    </div>
  );
}

