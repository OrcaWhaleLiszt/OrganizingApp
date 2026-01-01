import { Task } from '../types';
import { getImportanceColor } from '../utils/importance';
import { useState, useRef, useEffect } from 'react';

interface TimelineBarProps {
  task: Task;
  startPosition: number; // Percentage from left (0-100)
  width: number; // Percentage width (0-100)
  onProgressChange: (id: string, progress: number) => void;
  onDurationChange?: (id: string, duration: number) => void;
  onStartTimeChange?: (id: string, startDate: Date) => void;
  onToggleComplete?: (id: string) => void;
  totalTasks?: number; // Total number of tasks for dynamic sizing
  isActive?: boolean; // Whether red line is over this task
  forceFilled?: boolean; // Force the bar to appear filled (like a subtask)
  isSubtask?: boolean; // Whether this bar represents a subtask (affects height)
}

export default function TimelineBar({
  task,
  startPosition,
  width,
  onProgressChange,
  onDurationChange,
  onStartTimeChange,
  totalTasks = 1,
  isActive = false,
  forceFilled = false,
  isSubtask = false
}: TimelineBarProps) {
  const isQuickTask = task.duration < 0.5;
  const isSubtask = task.duration <= 0.5; // Subtasks are ≤30 minutes

  // Check if task should be shown as filled (completely filled progress bar)
  const shouldBeFilled = forceFilled || isQuickTask;

  // For filled tasks, show 100% progress
  const displayProgress = shouldBeFilled ? 100 : task.progress;

  // Get colors based on importance (1-10 scale)
  const colors = getImportanceColor(task.importance);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHoveringEdge, setIsHoveringEdge] = useState(false);
  const [isHoveringHandle, setIsHoveringHandle] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number>(0);
  const dragStartPosition = useRef<number>(0);
  
  // Dynamic height: taller when few tasks, shorter when many
  const maxHeight = 60;
  const minHeight = 32;
  const baseHeight = Math.max(minHeight, Math.min(maxHeight, 400 / totalTasks));
  const height = isSubtask ? Math.max(minHeight * 0.5, baseHeight * 0.5) : baseHeight;

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onProgressChange(task.id, parseInt(e.target.value));
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dragStartX.current = e.clientX;
    dragStartPosition.current = width;
    setIsResizing(true);
  };

  const handleDragMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dragStartX.current = e.clientX;
    dragStartPosition.current = startPosition;
    setIsDragging(true);
  };

  const handleBarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const barWidth = rect.width;
    const isNearEdge = x > barWidth - 10;
    setIsHoveringEdge(isNearEdge);
  };

  // Resize event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !onDurationChange) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const mouseX = e.clientX - containerRect.left;
      const barStartX = (startPosition / 100) * containerWidth;
      const newBarWidth = mouseX - barStartX;
      const newWidthPercent = (newBarWidth / containerWidth) * 100;
      const totalHours = 24;
      const newDuration = Math.max(0.5, (newWidthPercent / 100) * totalHours);
      
      onDurationChange(task.id, parseFloat(newDuration.toFixed(1)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, startPosition, task.id, onDurationChange]);

  // Drag event listeners
  useEffect(() => {
    const handleDragMove = (e: MouseEvent) => {
      if (!containerRef.current || !onStartTimeChange || !task.startDate) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const deltaX = e.clientX - dragStartX.current;
      const deltaPercent = (deltaX / containerWidth) * 100;
      const newPosition = Math.max(0, Math.min(100 - width, dragStartPosition.current + deltaPercent));
      const totalHours = 24;
      const newStartHour = (newPosition / 100) * totalHours;
      const newStartDate = new Date(task.startDate);
      const hours = Math.floor(newStartHour);
      const minutes = Math.round((newStartHour - hours) * 60);
      newStartDate.setHours(hours, minutes, 0, 0);
      
      onStartTimeChange(task.id, newStartDate);
    };

    const handleDragUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragUp);
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragUp);
      };
    }
  }, [isDragging, width, task.id, task.startDate, onStartTimeChange]);

  return (
    <div 
      className="relative flex items-center select-none" 
      style={{ 
        height: `${height}px`, 
        width: '100%',
        opacity: task.completed ? 0.25 : 1,
        transition: 'opacity 0.3s ease',
      }}
    >
      <div 
        ref={containerRef}
        className="relative h-full w-full"
      >
        {/* Background green container - extends full width */}
        {!shouldBeFilled && (
          <div
            className="absolute h-full pointer-events-none"
            style={{
              left: `${startPosition}%`,
              width: `${width}%`,
              backgroundColor: colors.border,
              borderRadius: '16px',
              zIndex: 0,
            }}
          />
        )}

        {/* Main bar container - white interior, ends before right edge */}
        <div
          className={`absolute h-full flex items-center select-none transition-shadow ${
            isActive ? 'shadow-lg' : ''
          }`}
          style={{
            left: `${startPosition}%`,
            width: `calc(${width}% - 12px)`, // White container ends 12px before right edge
            minWidth: '40px',
            cursor: isHoveringEdge ? 'ew-resize' : isHoveringHandle ? 'move' : 'default',
            backgroundColor: shouldBeFilled ? colors.fill : 'white',
            border: shouldBeFilled ? 'none' : `4px solid ${colors.border}`,
            borderRadius: '16px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            zIndex: 1,
          }}
          onMouseMove={handleBarMouseMove}
          onMouseLeave={() => {
            setIsHoveringEdge(false);
            setIsHoveringHandle(false);
          }}
        >
          {/* Progress fill background */}
          {!shouldBeFilled && (
            <div
              className="absolute inset-0 transition-all duration-300 pointer-events-none"
              style={{ 
                width: `${displayProgress}%`,
                borderRadius: '12px',
                backgroundColor: colors.progress,
                zIndex: 0,
              }}
            />
          )}

          {/* Drag handle - left side */}
          {onStartTimeChange && (
            <div
              className="absolute left-0 top-0 bottom-0 w-6 cursor-move z-20 flex items-center justify-center pointer-events-auto"
              onMouseDown={handleDragMouseDown}
              onMouseEnter={() => setIsHoveringHandle(true)}
              onMouseLeave={() => setIsHoveringHandle(false)}
              style={{
                backgroundColor: isHoveringHandle || isDragging ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              }}
            >
              <div className="flex flex-col gap-[2px] pointer-events-none">
                <div className="flex gap-[2px]">
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: shouldBeFilled ? 'white' : colors.dots }}></div>
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: shouldBeFilled ? 'white' : colors.dots }}></div>
                </div>
                <div className="flex gap-[2px]">
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: shouldBeFilled ? 'white' : colors.dots }}></div>
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: shouldBeFilled ? 'white' : colors.dots }}></div>
                </div>
                <div className="flex gap-[2px]">
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: shouldBeFilled ? 'white' : colors.dots }}></div>
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: shouldBeFilled ? 'white' : colors.dots }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Task title */}
          <span 
            className="absolute text-xs font-medium z-20 truncate select-none pointer-events-none" 
            style={{ 
              left: onStartTimeChange ? '28px' : '8px', 
              maxWidth: 'calc(100% - 36px)',
              color: shouldBeFilled ? 'white' : '#374151'
            }}
          >
            {task.title}
          </span>
          
          {/* Progress slider input */}
          {!shouldBeFilled && (
            <input
              type="range"
              min="0"
              max="100"
              value={displayProgress}
              onChange={handleProgressChange}
              className="absolute opacity-0 z-10"
              style={{ 
                cursor: isHoveringEdge ? 'ew-resize' : isHoveringHandle ? 'move' : 'pointer',
                left: onStartTimeChange ? '24px' : '0',
                right: '16px',
                top: 0,
                bottom: 0,
                width: 'auto',
                height: '100%',
                pointerEvents: isHoveringEdge || isResizing ? 'none' : 'auto',
              }}
            />
          )}

          {/* Resize indicator - right edge */}
          {onDurationChange && !isQuickTask && (
            <div
              className="absolute right-0 top-0 bottom-0 pointer-events-none"
              style={{
                width: '6px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '0 12px 12px 0',
              }}
            />
          )}

          {/* Resize handle - right edge */}
          {onDurationChange && !isQuickTask && (
            <div
              className="absolute right-0 top-0 bottom-0 cursor-ew-resize z-30 pointer-events-auto"
              onMouseDown={handleResizeMouseDown}
              onMouseEnter={() => setIsHoveringEdge(true)}
              style={{
                width: '14px',
                backgroundColor: isHoveringEdge || isResizing ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                borderRadius: '0 12px 12px 0',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
