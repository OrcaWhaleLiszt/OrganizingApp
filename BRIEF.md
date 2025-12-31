# Brief: AI-Powered Task Management Application

## 📋 Project Summary

Simple, mobile-friendly web application for task management with automatic prioritization system based on urgency and importance.

## 🎯 Main Features

### 1. Task Creation
- **Quick mode**: Create tasks instantly without specifying details
- **Full mode**: Form with questions:
  - Importance: Scale 1-5 (required in full mode)
  - Planned start date: "When do you plan to start?"
  - Estimated duration: "How long will it take?"
  - Progress: Slider 0-100% (adjustable after creation)

### 2. Task Visualization
- Task list with horizontal bars
- Each task displays:
  - Title/description
  - Importance indicator (1-5)
  - Progress bar with slider control
  - Automatically calculated urgency
  - Estimated start and end date

### 3. Filters
- **Urgency**: Automatically calculated based on:
  - Planned start date
  - Estimated duration
  - Current date
- **Importance**: Filter by level (1-5)
- Location: Top of the interface

### 4. User Interface
- Responsive design (mobile-first)
- Floating creation form (top or bottom)
- Intuitive and minimalist interface
- Touch-friendly slider to adjust progress

## 🛠️ Proposed Tech Stack

### Frontend
- **React** with **Vite** (fast, modern, perfect for mobile)
- **TypeScript** (type safety)
- **Tailwind CSS** (quick and responsive styling)
- **LocalStorage** (local data persistence, no initial backend)

### Data Structure
```typescript
interface Task {
  id: string;
  title: string;
  importance: number; // 1-5
  startDate: Date | null;
  duration: number; // in days
  progress: number; // 0-100
  urgency: number; // automatically calculated
  createdAt: Date;
}
```

## 📱 Interface Design (Proposal)

### Main Layout
```
┌─────────────────────────────────┐
│  [Urgency Filter] [Import. Filter] │  ← Filters (top)
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐ │
│  │ Task 1 [████░░░░] 80%     │ │
│  │ Importance: ⭐⭐⭐⭐         │ │
│  │ Urgency: High             │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │ Task 2 [███░░░░░] 30%     │ │
│  │ Importance: ⭐⭐⭐          │ │
│  │ Urgency: Medium           │ │
│  └───────────────────────────┘ │
│                                 │
├─────────────────────────────────┤
│  [Creation Form]                │  ← Form (bottom)
│  ┌───────────────────────────┐ │
│  │ Title: [____________]     │ │
│  │ Importance: [1] [2] [3]   │ │
│  │ Start date: [____]        │ │
│  │ Duration: [____] days     │ │
│  │ [Create Task]             │ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

### Design Features
- **Mobile-first**: Design optimized for small screens
- **Colors**: Color scheme based on urgency/importance
- **Touch interactions**: Large buttons, easy-to-use sliders
- **Subtle animations**: Smooth transitions for better UX

## 🔧 Technical Features

### Urgency Calculation
```typescript
function calculateUrgency(task: Task): number {
  if (!task.startDate || !task.duration) return 0;
  
  const endDate = new Date(task.startDate);
  endDate.setDate(endDate.getDate() + task.duration);
  const daysUntilStart = (task.startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  const daysUntilEnd = (endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  
  // High urgency if close to starting or ending
  if (daysUntilStart <= 0) return 5; // Should have already started
  if (daysUntilStart <= 3) return 4; // Very soon
  if (daysUntilStart <= 7) return 3; // Soon
  if (daysUntilStart <= 14) return 2; // Moderate
  return 1; // Low
}
```

### Persistence
- **LocalStorage**: Save tasks locally
- No initial backend (can migrate to Vercel + database later)

## 📅 Estimated Timeline

### Phase 1: Setup and Structure (15-20 min)
- Set up React + Vite + TypeScript project
- Install dependencies (Tailwind CSS)
- Basic folder structure

### Phase 2: Core Components (30-40 min)
- Task creation component
- Task visualization component
- Filter component
- Urgency calculation logic

### Phase 3: Styling and UX (20-30 min)
- Apply Tailwind CSS
- Responsive design
- Basic animations
- Mobile optimization

### Phase 4: Persistence and Refinement (15-20 min)
- LocalStorage integration
- Final adjustments
- Basic testing

**Total estimated: 1.5 - 2 hours**

## 🚀 Future Features (Not Priority)

1. **AI Voice Assistant**: Create tasks via voice commands
2. **Notifications**: Reminders based on urgency
3. **Cloud sync**: Migrate to Vercel + database
4. **Categories/Tags**: Additional organization
5. **Calendar view**: Alternative visualization

## ❓ Questions for Clarification

1. **Form location**: Do you prefer the form at the top or bottom? (Suggestion: bottom for mobile)
2. **Task view**: Vertical list or cards? (Suggestion: cards for mobile)
3. **Colors**: Do you have color preferences or should I use a modern default scheme?
4. **Sorting**: Sort by urgency + importance automatically?
5. **Editing**: Ability to edit tasks after creating them? (Suggestion: yes, with long press)

## ✅ Next Steps

1. Review this brief
2. Approve stack and design
3. Execute implementation
4. Test on localhost
5. Adjustments based on feedback

---

**Ready to proceed with implementation?**

