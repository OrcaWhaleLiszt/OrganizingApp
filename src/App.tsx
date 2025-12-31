import { useState, useEffect } from 'react';
import { Task, ViewMode, SortBy, SortOrder } from './types';
import { calculateUrgency } from './utils/urgency';
import { saveTasks, loadTasks } from './utils/storage';
import { generateMockTasks } from './utils/mockData';
import SortBar from './components/SortBar';
import CreateTaskForm from './components/CreateTaskForm';
import DailyTimelineView from './components/DailyTimelineView';
import WeeklyTimelineView from './components/WeeklyTimelineView';
import MonthlyTimelineView from './components/MonthlyTimelineView';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [sortBy, setSortBy] = useState<SortBy>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'checklist' | 'calendar'>('checklist'); // For mobile only
  const [autoProgressEnabled, setAutoProgressEnabled] = useState(false);
  const [manuallyAdjustedTasks, setManuallyAdjustedTasks] = useState<Set<string>>(new Set());

  // Load tasks on mount
  useEffect(() => {
    const loadedTasks = loadTasks();
    
    // Si no hay tareas guardadas, cargar datos de prueba
    if (loadedTasks.length === 0) {
      const mockTasks = generateMockTasks();
      setTasks(mockTasks);
    } else {
      const tasksWithUrgency = loadedTasks.map(task => ({
        ...task,
        urgency: calculateUrgency(task),
      }));
      setTasks(tasksWithUrgency);
    }
  }, []);

  // Save tasks whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      saveTasks(tasks);
    }
  }, [tasks]);

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'urgency' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      urgency: calculateUrgency(taskData as Task),
      completed: false,
      createdAt: new Date(),
    };
    setTasks([...tasks, newTask]);
    setIsCreateTaskOpen(false); // Close the form after creating a task
  };

  const handleProgressChange = (id: string, progress: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, progress } : task
    ));
    // Mark as manually adjusted
    setManuallyAdjustedTasks(prev => new Set(prev).add(id));
  };

  const handleDurationChange = (id: string, duration: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, duration } : task
    ));
  };

  const handleStartTimeChange = (id: string, startDate: Date) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const updatedTask = { ...task, startDate };
        // Recalculate urgency when start time changes
        updatedTask.urgency = calculateUrgency(updatedTask);
        return updatedTask;
      }
      return task;
    }));
  };

  const handleToggleComplete = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleSort = (field: SortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleLoadMockData = () => {
    const mockTasks = generateMockTasks();
    setTasks(mockTasks);
  };

  // Sort tasks
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!sortBy) return 0;
    
    let comparison = 0;
    if (sortBy === 'urgency') {
      comparison = a.urgency - b.urgency;
    } else if (sortBy === 'importance') {
      comparison = a.importance - b.importance;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Filter by view mode (simplified for now)
  const filteredTasks = sortedTasks; // Can add date filtering later

  const renderTimelineView = () => {
    switch (viewMode) {
      case 'daily':
        return (
          <DailyTimelineView
            tasks={filteredTasks}
            onProgressChange={handleProgressChange}
            onDurationChange={handleDurationChange}
            onStartTimeChange={handleStartTimeChange}
            onToggleComplete={handleToggleComplete}
            onDeleteTask={handleDeleteTask}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            dayStartHour={4}
            mobileView={mobileView}
            autoProgressEnabled={autoProgressEnabled}
            manuallyAdjustedTasks={manuallyAdjustedTasks}
          />
        );
      case 'weekly':
        return (
          <WeeklyTimelineView
            tasks={filteredTasks}
            onProgressChange={handleProgressChange}
            onDurationChange={handleDurationChange}
            onStartTimeChange={handleStartTimeChange}
            onToggleComplete={handleToggleComplete}
            onDeleteTask={handleDeleteTask}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            mobileView={mobileView}
            autoProgressEnabled={autoProgressEnabled}
            manuallyAdjustedTasks={manuallyAdjustedTasks}
          />
        );
      case 'monthly':
        return (
          <MonthlyTimelineView
            tasks={filteredTasks}
            onProgressChange={handleProgressChange}
            onDurationChange={handleDurationChange}
            onStartTimeChange={handleStartTimeChange}
            onToggleComplete={handleToggleComplete}
            onDeleteTask={handleDeleteTask}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            mobileView={mobileView}
            autoProgressEnabled={autoProgressEnabled}
            manuallyAdjustedTasks={manuallyAdjustedTasks}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <SortBar
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        viewMode={viewMode}
        onViewChange={setViewMode}
        onLoadMockData={handleLoadMockData}
        autoProgressEnabled={autoProgressEnabled}
        onToggleAutoProgress={() => setAutoProgressEnabled(!autoProgressEnabled)}
      />
      
      <div className="flex-1 flex flex-col max-w-7xl mx-auto px-4 pt-4 w-full overflow-hidden">
        {filteredTasks.length > 0 && (
          <div className="flex items-center justify-center mb-2">
            {/* Checklist and Calendar labels/tabs */}
            <div className="flex">
              {/* Checklist tab - left half */}
              <button
                onClick={() => setMobileView('checklist')}
                className={`flex-1 text-center py-2 px-8 font-semibold text-sm transition-colors md:cursor-default
                  ${mobileView === 'checklist' ? 'text-blue-500 md:text-gray-800' : 'text-gray-800'}
                  md:text-gray-800 md:pointer-events-none`}
              >
                Checklist
              </button>

              {/* Calendar tab - right half */}
              <button
                onClick={() => setMobileView('calendar')}
                className={`flex-1 text-center py-2 px-8 font-semibold text-sm transition-colors md:cursor-default
                  ${mobileView === 'calendar' ? 'text-blue-500 md:text-gray-800' : 'text-gray-800'}
                  md:text-gray-800 md:pointer-events-none`}
              >
                Calendar
              </button>
            </div>
          </div>
        )}
        
        {filteredTasks.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="mb-4">No tasks yet. Create one below!</p>
            <button
              onClick={handleLoadMockData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              Load Mock Data
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            {renderTimelineView()}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      {!isCreateTaskOpen && (
        <button
          onClick={() => setIsCreateTaskOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-30"
          title="Create new task"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      )}

      {/* Create Task Form Overlay */}
      {isCreateTaskOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsCreateTaskOpen(false)}
          />
          
          {/* Form */}
          <div className="fixed inset-x-0 bottom-0 z-50">
            <div className="relative">
              {/* Close button */}
              <button
                onClick={() => setIsCreateTaskOpen(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
                title="Close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              
              <CreateTaskForm 
                onSubmit={handleCreateTask} 
                viewMode={viewMode}
                currentDate={currentDate}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;

