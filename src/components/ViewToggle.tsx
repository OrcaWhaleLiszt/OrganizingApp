import { ViewMode } from '../types';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export default function ViewToggle({ 
  viewMode, 
  onViewChange, 
  currentDate, 
  onDateChange 
}: ViewToggleProps) {
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'daily') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === 'weekly') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (viewMode === 'monthly') {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'daily') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === 'weekly') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (viewMode === 'monthly') {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    onDateChange(newDate);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Previous button */}
      <button
        onClick={handlePrevious}
        className="px-2 py-1 text-gray-600 hover:text-gray-800 transition-colors text-lg"
        title="Previous"
      >
        ‹
      </button>

      {/* View mode buttons - no background, just text */}
      <div className="flex gap-1">
        {(['daily', 'weekly', 'monthly'] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => onViewChange(mode)}
            className={`px-3 py-1 text-sm font-medium transition-colors ${
              viewMode === mode
                ? 'text-blue-500 underline'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      {/* Next button */}
      <button
        onClick={handleNext}
        className="px-2 py-1 text-gray-600 hover:text-gray-800 transition-colors text-lg"
        title="Next"
      >
        ›
      </button>
    </div>
  );
}

