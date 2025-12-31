import { Task } from '../types';
import TimelineBar from './TimelineBar';
import { useState, useRef, useEffect } from 'react';
import { getImportanceColor } from '../utils/importance';
import { Clock } from 'lucide-react';

interface WeeklyTimelineViewProps {
  tasks: Task[];
  onProgressChange: (id: string, progress: number) => void;
  onDurationChange?: (id: string, duration: number) => void;
  onStartTimeChange?: (id: string, startDate: Date) => void;
  onToggleComplete?: (id: string) => void;
  onDeleteTask?: (id: string) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  mobileView?: 'checklist' | 'calendar'; // For mobile-only tab switching
  autoProgressEnabled?: boolean;
  manuallyAdjustedTasks?: Set<string>;
}

export default function WeeklyTimelineView({
  tasks,
  onProgressChange,
  onDurationChange,
  onStartTimeChange,
  onToggleComplete,
  onDeleteTask,
  currentDate,
  onDateChange,
  mobileView = 'checklist',
  autoProgressEnabled = false,
  manuallyAdjustedTasks = new Set() // Temporarily disabled
}: WeeklyTimelineViewProps) {
  const [menuOpenTaskId, setMenuOpenTaskId] = useState<string | null>(null);
  const [currentTimePosition, setCurrentTimePosition] = useState<number>(25); // Position as percentage (0-100)
  const [isDraggingTimeLine, setIsDraggingTimeLine] = useState(false);
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const totalDays = 7;

  // Get week from currentDate (Monday to Sunday)
  const dayOfWeek = currentDate.getDay();
  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);

  // Sync scroll between left and right panels
  const handleLeftScroll = () => {
    if (leftScrollRef.current && rightScrollRef.current) {
      rightScrollRef.current.scrollTop = leftScrollRef.current.scrollTop;
    }
  };

  const handleRightScroll = () => {
    if (leftScrollRef.current && rightScrollRef.current) {
      leftScrollRef.current.scrollTop = rightScrollRef.current.scrollTop;
    }
  };

  // Calculate task status based on red line position
  const getTaskStatus = (task: Task) => {
    if (!task.startDate) return 'not scheduled';

    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(taskStart.getTime() + task.duration * 60 * 60 * 1000);

    // Calculate timeline position relative to task
    const weekStart = new Date(monday);
    const weekEnd = new Date(monday);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const taskStartPercent = ((taskStart.getTime() - weekStart.getTime()) / (weekEnd.getTime() - weekStart.getTime())) * 100;
    const taskEndPercent = ((taskEnd.getTime() - weekStart.getTime()) / (weekEnd.getTime() - weekStart.getTime())) * 100;

    const timelinePos = currentTimePosition;

    // Check if task is completed
    if (task.progress === 100) {
      const hoursAgo = ((timelinePos - taskEndPercent) / 100) * 168; // 7 days in hours
      if (hoursAgo > 0) {
        if (hoursAgo >= 24) {
          return `done ${Math.round(hoursAgo / 24)}d ago`;
        }
        if (hoursAgo >= 1) {
          return `done ${Math.round(hoursAgo)}h ago`;
        }
        return `done ${Math.round(hoursAgo * 60)}m ago`;
      }
      return 'completed';
    }

    // Timeline is before task starts
    if (timelinePos < taskStartPercent) {
      const hoursUntil = ((taskStartPercent - timelinePos) / 100) * 168;
      if (hoursUntil >= 24) {
        return `in ${Math.round(hoursUntil / 24)}d`;
      }
      if (hoursUntil >= 1) {
        return `in ${Math.round(hoursUntil)}h`;
      }
      return `in ${Math.round(hoursUntil * 60)}m`;
    }

    // Timeline is over the task (active or past)
    if (timelinePos >= taskStartPercent) {
      // If timeline is past task end and not completed
      if (timelinePos > taskEndPercent) {
        const hoursOverdue = ((timelinePos - taskEndPercent) / 100) * 168;
        if (hoursOverdue >= 24) {
          return `overdue ${Math.round(hoursOverdue / 24)}d`;
        }
        if (hoursOverdue >= 1) {
          return `overdue ${Math.round(hoursOverdue)}h`;
        }
        return `overdue ${Math.round(hoursOverdue * 60)}m`;
      }

      // Timeline is within task - show time remaining based on progress
      const totalDuration = task.duration * 60; // in minutes
      const progressPercent = task.progress / 100;
      const timeRemaining = totalDuration * (1 - progressPercent);

      // Format time remaining
      if (timeRemaining >= 1440) { // >= 1 day
        const days = Math.floor(timeRemaining / 1440);
        const hours = Math.round((timeRemaining % 1440) / 60);
        if (hours > 0) {
          return `${days}d ${hours}h left`;
        }
        return `${days}d left`;
      }
      if (timeRemaining >= 60) {
        const hours = Math.floor(timeRemaining / 60);
        const minutes = Math.round(timeRemaining % 60);
        if (minutes > 0) {
          return `${hours}h ${minutes}m left`;
        }
        return `${hours}h left`;
      }
      return `${Math.round(timeRemaining)}m left`;
    }

    return 'pending';
  };

  // Check if red line is over a task (for shadow effect)
  const isTaskActive = (task: Task): boolean => {
    if (!task.startDate) return false;
    
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(taskStart.getTime() + task.duration * 60 * 60 * 1000);
    
    const weekStart = new Date(monday);
    const weekEnd = new Date(monday);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const taskStartPercent = ((taskStart.getTime() - weekStart.getTime()) / (weekEnd.getTime() - weekStart.getTime())) * 100;
    const taskEndPercent = ((taskEnd.getTime() - weekStart.getTime()) / (weekEnd.getTime() - weekStart.getTime())) * 100;
    
    return currentTimePosition >= taskStartPercent && currentTimePosition <= taskEndPercent;
  };

  // Handle current time line dragging
  const handleTimeLineMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingTimeLine(true);
  };

  const handleTimeLineMouseMove = (e: MouseEvent) => {
    if (!isDraggingTimeLine || !timelineContainerRef.current) return;
    
    const rect = timelineContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setCurrentTimePosition(percentage);
  };

  const handleTimeLineMouseUp = () => {
    setIsDraggingTimeLine(false);
  };

  // Add/remove event listeners for time line dragging
  useEffect(() => {
    if (isDraggingTimeLine) {
      window.addEventListener('mousemove', handleTimeLineMouseMove);
      window.addEventListener('mouseup', handleTimeLineMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleTimeLineMouseMove);
        window.removeEventListener('mouseup', handleTimeLineMouseUp);
      };
    }
  }, [isDraggingTimeLine]);

  // Format date for header
  const formatWeeklyHeader = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const startMonth = months[monday.getMonth()];
    const endMonth = months[sunday.getMonth()];
    const startDate = monday.getDate();
    const endDate = sunday.getDate();
    const year = monday.getFullYear();
    
    // If same month
    if (monday.getMonth() === sunday.getMonth()) {
      return `${startMonth} ${startDate}-${endDate}, ${year}`;
    } else {
      // Different months
      return `${startMonth} ${startDate} - ${endMonth} ${endDate}, ${year}`;
    }
  };

  // Navigation handlers
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    onDateChange(newDate);
  };

  // Filter tasks within this week
  const weekTasks = tasks.filter(task => {
    if (!task.startDate) return false;
    const taskDate = new Date(task.startDate);
    taskDate.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return taskDate >= monday && taskDate <= sunday;
  });

  // Auto-progress logic
  useEffect(() => {
    console.log('Auto-progress effect running:', { autoProgressEnabled, currentTimePosition });

    if (autoProgressEnabled) {
      console.log('Auto-progress is enabled and not dragging');

      // Find tasks that need progress updates
      weekTasks.forEach(task => {
        console.log('Checking task:', task.id, 'progress:', task.progress, 'manually adjusted:', manuallyAdjustedTasks.has(task.id));

        if (!task.startDate) {
          console.log('Skipping task without start date');
          return; // Skip tasks without start date
        }

        // Skip manually adjusted tasks
        // if (manuallyAdjustedTasks.has(task.id)) {
        //   console.log('Skipping manually adjusted task:', task.id, 'total manually adjusted:', manuallyAdjustedTasks.size);
        //   return;
        // }

        const taskStart = new Date(task.startDate);
        const taskEnd = new Date(taskStart.getTime() + task.duration * 60 * 60 * 1000);

        const weekStart = new Date(monday);
        const weekEnd = new Date(monday);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const taskStartPercent = ((taskStart.getTime() - weekStart.getTime()) / (weekEnd.getTime() - weekStart.getTime())) * 100;
        const taskEndPercent = ((taskEnd.getTime() - weekStart.getTime()) / (weekEnd.getTime() - weekStart.getTime())) * 100;

        console.log('Task position calc:', {
          taskId: task.id,
          taskStartPercent,
          taskEndPercent,
          currentTimePosition,
          taskStart: taskStart.toISOString(),
          taskEnd: taskEnd.toISOString()
        });

        let expectedProgress = 0;

        if (currentTimePosition >= taskEndPercent) {
          // Timeline is at or past task end - task should be complete
          expectedProgress = 100;
          console.log('Timeline at/past task end, setting progress to 100 for task:', task.id);
        } else if (currentTimePosition >= taskStartPercent) {
          // Timeline is within task - calculate proportional progress
          const taskProgress = ((currentTimePosition - taskStartPercent) / (taskEndPercent - taskStartPercent)) * 100;
          expectedProgress = Math.round(Math.max(0, Math.min(100, taskProgress)));
          console.log('Timeline within task, calculated progress:', expectedProgress, 'for task:', task.id);
        } else {
          // Timeline is before task - task hasn't started
          expectedProgress = 0;
          console.log('Timeline before task, keeping progress at 0 for task:', task.id);
        }

        // Only update if different (avoid constant updates)
        if (task.progress !== expectedProgress) {
          console.log('Updating progress from', task.progress, 'to', expectedProgress);
          onProgressChange(task.id, expectedProgress);
        } else {
          console.log('Progress already correct:', task.progress);
        }
      });
    } else {
      console.log('Auto-progress not running:', { autoProgressEnabled });
    }
  }, [currentTimePosition, autoProgressEnabled, weekTasks, monday, onProgressChange, manuallyAdjustedTasks]);

  // Calculate positions for each task
  const getTaskPosition = (task: Task) => {
    if (!task.startDate) return { start: 0, width: 0 };
    
    const taskDate = new Date(task.startDate);
    const taskHour = taskDate.getHours();
    taskDate.setHours(0, 0, 0, 0);
    
    const daysFromMonday = Math.floor((taskDate.getTime() - monday.getTime()) / (1000 * 60 * 60 * 24));
    // Duration is in hours for weekly view, convert to day fraction
    const durationHours = task.duration || 1;
    const durationAsDayFraction = Math.min(1, durationHours / 24); // Cap at 1 day max
    
    const dayWidthPercent = 100 / totalDays; // Width of one day
    const startPercent = (daysFromMonday / totalDays) * 100;
    // Add hour offset within the day
    const hourOffsetPercent = (taskHour / 24) * dayWidthPercent;
    const widthPercent = durationAsDayFraction * dayWidthPercent;
    
    return {
      start: Math.max(0, Math.min(100, startPercent + hourOffsetPercent)),
      width: Math.max(1, Math.min(dayWidthPercent, widthPercent)),
    };
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Content area with integrated headers */}
      <div className="flex-1 flex overflow-hidden border-t-2 border-gray-300">
        {weekTasks.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
            No tasks scheduled for this week
          </div>
        ) : (
          <>
            {/* Left panel - Task list (scrollable) */}
            <div 
              ref={leftScrollRef}
              onScroll={handleLeftScroll}
              className={`flex-shrink-0 border-r-2 border-gray-300 overflow-y-auto relative bg-white w-full md:w-1/2
                ${mobileView === 'calendar' ? 'hidden md:block' : ''}`}
            >
              {/* Tasks label - sticky at top with navigation arrows */}
              <div className="sticky top-0 h-10 bg-gray-50 border-b border-gray-200 flex items-center justify-center gap-3 px-4 font-semibold text-sm text-gray-800 z-20">
                <button
                  onClick={handlePrevious}
                  className="px-2 py-1 hover:bg-gray-200 rounded transition-colors text-lg text-gray-700 hover:text-black"
                  title="Previous week"
                >
                  ‹
                </button>
                <span>{formatWeeklyHeader()}</span>
                <button
                  onClick={handleNext}
                  className="px-2 py-1 hover:bg-gray-200 rounded transition-colors text-lg text-gray-700 hover:text-black"
                  title="Next week"
                >
                  ›
                </button>
              </div>
              {/* Three-column layout: Checkbox (40px) | Tasks (~65%) | Status (~25%) */}
              <div className="flex" style={{ paddingTop: '60px' }}>
                {/* Checkbox column (minimal width) */}
                <div className="flex flex-col gap-2 px-1" style={{ width: '40px', flexShrink: 0 }}>
                  {weekTasks.map(task => {
                    // Calculate same dynamic height to match task cards
                    const maxHeight = 60;
                    const minHeight = 32;
                    const height = Math.max(minHeight, Math.min(maxHeight, 400 / weekTasks.length));
                    
                    // Determine clock icon status based on timeline position
                    const getClockStatus = () => {
                      if (!task.startDate || task.progress === 100) return null;

                      const taskStart = new Date(task.startDate);
                      const taskEnd = new Date(taskStart.getTime() + task.duration * 60 * 60 * 1000);

                      // Calculate position in timeline
                      const weekStart = new Date(monday);
                      const weekEnd = new Date(monday);
                      weekEnd.setDate(weekEnd.getDate() + 7);
                      const taskEndPercent = ((taskEnd.getTime() - weekStart.getTime()) / (weekEnd.getTime() - weekStart.getTime())) * 100;

                      if (currentTimePosition > taskEndPercent) {
                        // Task is overdue based on timeline
                        if (task.progress === 0) {
                          return 'red'; // No progress, red clock
                        } else {
                          return 'yellow'; // Some progress, yellow clock
                        }
                      }

                      return null; // Not overdue, no clock
                    };

                    const clockColor = getClockStatus();

                    // Checkbox only shows when task is completed
                    const showCheckbox = task.progress === 100;
                    
                    return (
                      <div 
                        key={task.id}
                        className="flex items-center justify-center"
                        style={{ height: `${height}px` }}
                      >
                        {/* Checkbox - only for completed tasks */}
                        {showCheckbox && onToggleComplete && (
                          <button
                            onClick={() => onToggleComplete(task.id)}
                            className="flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all hover:bg-gray-100"
                            style={{
                              borderColor: task.completed ? '#10b981' : '#d1d5db',
                              backgroundColor: task.completed ? '#10b981' : 'white',
                            }}
                          >
                            {task.completed && (
                              <svg
                                className="w-2.5 h-2.5 text-white"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </button>
                        )}
                        
                        {/* Clock icon - for overdue tasks that are not completed */}
                        {clockColor && (
                          <Clock className={`w-4 h-4 opacity-60 ${clockColor === 'red' ? 'text-red-500' : 'text-yellow-500'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Task cards column (~65%) */}
                <div className="flex flex-col gap-2 px-2" style={{ flex: '1 1 65%' }}>
                  {weekTasks.map(task => {
                    const isMenuOpen = menuOpenTaskId === task.id;
                    
                    // Calculate dynamic height based on totalTasks
                    const maxHeight = 60;
                    const minHeight = 32;
                    const height = Math.max(minHeight, Math.min(maxHeight, 400 / weekTasks.length));
                    
                    // Get importance color (same as timeline bars)
                    const colors = getImportanceColor(task.importance);
                    
                    return (
                      <div key={task.id} className="relative">
                        {/* Task card with progress background */}
                        <div
                          className={`relative flex items-center gap-2 px-2 border border-gray-200 hover:bg-gray-50 overflow-hidden w-full transition-shadow
                            ${isTaskActive(task) ? 'shadow-lg' : ''}`}
                          style={{
                            height: `${height}px`,
                            borderRadius: '16px',
                            backgroundColor: 'white',
                            opacity: task.completed ? 0.25 : 1,
                            transition: 'opacity 0.3s ease'
                          }}
                        >
                          {/* Progress background overlay */}
                          <div
                            className="absolute inset-0 transition-all duration-300"
                            style={{ 
                              width: `${task.progress}%`,
                              backgroundColor: colors.fill,
                              borderRadius: '16px'
                            }}
                          />
                          
                          {/* Invisible progress slider overlay */}
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={task.progress}
                            onChange={(e) => onProgressChange(task.id, parseInt(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />

                          {/* Content on top of progress */}
                          <div className="relative z-20 flex items-center gap-2 w-full pointer-events-none">
                            {/* Three-dot menu */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuOpenTaskId(isMenuOpen ? null : task.id);
                              }}
                              className="flex-shrink-0 text-gray-500 hover:text-gray-700 pointer-events-auto"
                            >
                              <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                                <circle cx="8" cy="3" r="1.5" />
                                <circle cx="8" cy="8" r="1.5" />
                                <circle cx="8" cy="13" r="1.5" />
                              </svg>
                            </button>
                            
                            {/* Task title */}
                            <span className="flex-1 text-xs font-medium truncate text-gray-700">
                              {task.title}
                            </span>
                          </div>
                        </div>

                        {/* Pop-up menu - OUTSIDE the overflow-hidden container */}
                        {isMenuOpen && (
                          <>
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setMenuOpenTaskId(null)}
                            />
                            <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[180px]">
                              <button
                                onClick={() => {
                                  if (onDeleteTask) {
                                    onDeleteTask(task.id);
                                    setMenuOpenTaskId(null);
                                  }
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                Delete task
                              </button>
                              <button
                                onClick={() => {
                                  // TODO: Implement importance level change
                                  setMenuOpenTaskId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                Change importance level
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Status column (~25%) */}
                <div className="flex flex-col gap-2 px-2" style={{ flex: '0 0 25%' }}>
                  {weekTasks.map(task => {
                    // Calculate same dynamic height to match task cards
                    const maxHeight = 60;
                    const minHeight = 32;
                    const height = Math.max(minHeight, Math.min(maxHeight, 400 / weekTasks.length));
                    
                    const status = getTaskStatus(task);
                    
                    return (
                      <div 
                        key={task.id}
                        className="flex items-center justify-center text-gray-600 text-xs"
                        style={{ height: `${height}px` }}
                      >
                        {/* Status text */}
                        <span className="font-medium">
                          {status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right panel - Timeline (scrollable) */}
            <div 
              ref={rightScrollRef}
              onScroll={handleRightScroll}
              className={`flex-1 overflow-auto scrollbar-thin
                ${mobileView === 'checklist' ? 'hidden md:block' : ''}`}
            >
              <div ref={timelineContainerRef} className="relative" style={{ minWidth: '900px', minHeight: '500px', paddingRight: '8px' }}>
                {/* Current time line indicator */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-red-500 cursor-ew-resize hover:w-1.5 transition-all"
                  style={{
                    left: `${currentTimePosition}%`,
                    zIndex: 100
                  }}
                  onMouseDown={handleTimeLineMouseDown}
                >
                  {/* Draggable handle at top */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full cursor-grab active:cursor-grabbing" />
                </div>

                {/* Day labels - now part of scrollable content */}
                <div className="flex h-10 sticky top-0 bg-gray-50 z-10">
                  {days.map((day, index) => {
                    const date = new Date(monday);
                    date.setDate(monday.getDate() + index);
                    return (
                      <div
                        key={index}
                        className="flex-1 text-center text-xs text-gray-500 flex flex-col justify-center"
                      >
                        <div className="font-medium">{day}</div>
                        <div className="text-gray-400">{date.getDate()}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Background grid */}
                <div className="absolute inset-0 flex" style={{ top: '40px' }}>
                  {days.map((_, index) => (
                    <div
                      key={index}
                      className="flex-1 border-r border-gray-200"
                      style={{ height: '100%' }}
                    />
                  ))}
                </div>

                {/* Task bars */}
                <div 
                  className="flex flex-col gap-2"
                  style={{ 
                    paddingTop: '60px',
                    paddingLeft: '8px',
                    paddingRight: '0px'
                  }}
                >
                  {weekTasks.map(task => {
                    const { start, width } = getTaskPosition(task);
                    return (
                      <TimelineBar
                        key={task.id}
                        task={task}
                        startPosition={start}
                        width={width}
                        onProgressChange={onProgressChange}
                        onDurationChange={onDurationChange}
                        onStartTimeChange={onStartTimeChange}
                        onToggleComplete={onToggleComplete}
                        totalTasks={weekTasks.length}
                        isActive={isTaskActive(task)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

