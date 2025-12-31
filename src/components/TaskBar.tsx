import { useState } from 'react';
import { Task } from '../types';
import { getUrgencyColor } from '../utils/urgency';

interface TaskBarProps {
  task: Task;
  onProgressChange: (id: string, progress: number) => void;
}

export default function TaskBar({ task, onProgressChange }: TaskBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const urgencyColor = getUrgencyColor(task.urgency);
  const importanceWidth = (task.importance / 5) * 100;
  
  // Determinar si es una tarea rápida (menos de 2 horas de duración)
  const isQuickTask = task.duration < 2;
  
  // Mostrar checkmark si el progreso es 100 o si es una tarea rápida
  const showCheckmark = task.progress === 100 || isQuickTask;

  return (
    <div className={`mb-3 p-3 rounded-lg border-2 ${urgencyColor} bg-white shadow-sm relative`}>
      <div className="flex items-center justify-between mb-2 gap-2">
        {/* Menú de tres puntos */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray-500 hover:text-gray-700 cursor-pointer flex-shrink-0"
          aria-label="Opciones de tarea"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="8" cy="13" r="1.5" />
          </svg>
        </button>

        {/* Título de la tarea */}
        <span className="font-medium text-sm flex-1 truncate">{task.title}</span>
        
        {/* Porcentaje de progreso */}
        <span className="text-xs text-gray-600 ml-2 flex-shrink-0">{task.progress}%</span>
        
        {/* Checkmark (solo cuando corresponde) */}
        {showCheckmark && (
          <div className="flex-shrink-0">
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="none" 
              stroke={task.progress === 100 ? "#10b981" : "#6b7280"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 6L7.5 14.5L4 11" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Menú pop-up */}
      {isMenuOpen && (
        <>
          {/* Overlay para cerrar el menú */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menú */}
          <div className="absolute left-0 top-12 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-20 min-w-[200px]">
            {/* Por ahora vacío */}
            <div className="text-gray-500 text-sm">Menú de opciones</div>
          </div>
        </>
      )}

      {/* Progress bar */}
      <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-blue-500 transition-all duration-300 flex items-center justify-center"
          style={{ width: `${task.progress}%` }}
        >
          {task.progress > 10 && (
            <span className="text-xs text-white font-medium">{task.progress}%</span>
          )}
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={task.progress}
          onChange={(e) => onProgressChange(task.id, parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {/* Importance bar */}
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-500"
          style={{ width: `${importanceWidth}%` }}
        />
      </div>
    </div>
  );
}

