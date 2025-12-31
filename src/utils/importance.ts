// Get color based on importance (1-10 scale)
export function getImportanceColor(importance: number) {
  if (importance >= 9) {
    // Very high importance - Red
    return {
      border: '#ef4444',
      fill: '#ef4444',
      progress: 'rgba(239, 68, 68, 0.15)',
      dots: '#ef4444'
    };
  } else if (importance >= 7) {
    // High importance - Orange
    return {
      border: '#f97316',
      fill: '#f97316',
      progress: 'rgba(249, 115, 22, 0.15)',
      dots: '#f97316'
    };
  } else if (importance >= 5) {
    // Medium importance - Amber/Yellow
    return {
      border: '#f59e0b',
      fill: '#f59e0b',
      progress: 'rgba(245, 158, 11, 0.15)',
      dots: '#f59e0b'
    };
  } else if (importance >= 3) {
    // Low importance - Lime/Green
    return {
      border: '#84cc16',
      fill: '#84cc16',
      progress: 'rgba(132, 204, 22, 0.15)',
      dots: '#84cc16'
    };
  } else {
    // Very low importance - Gray/Blue
    return {
      border: '#94a3b8',
      fill: '#94a3b8',
      progress: 'rgba(148, 163, 184, 0.15)',
      dots: '#94a3b8'
    };
  }
}


