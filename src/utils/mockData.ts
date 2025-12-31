import { Task } from '../types';
import { calculateUrgency } from './urgency';

/**
 * Genera datos de prueba (mock data) para la aplicación
 * Incluye tareas con diferentes niveles de urgencia e importancia
 */
export function generateMockTasks(): Task[] {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  // Tarea para hoy a las 3 PM (15:00), duración 3 horas
  const task1: Task = {
    id: '1',
    title: 'Revisar propuesta del cliente',
    importance: 5,
    startDate: new Date(today.getTime() + 15 * 60 * 60 * 1000), // 3 PM hoy
    duration: 3, // 3 horas para daily view
    progress: 30,
    completed: false,
    urgency: 0,
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
  };
  task1.urgency = calculateUrgency(task1);

  // Tarea para hoy a las 9 AM, duración 2 horas
  const task2: Task = {
    id: '2',
    title: 'Preparar presentación del proyecto',
    importance: 4,
    startDate: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9 AM hoy
    duration: 2, // 2 horas
    progress: 0,
    completed: false,
    urgency: 0,
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
  };
  task2.urgency = calculateUrgency(task2);

  // Tarea para hoy a las 11 AM, duración 4 horas
  const task3: Task = {
    id: '3',
    title: 'Actualizar documentación técnica',
    importance: 3,
    startDate: new Date(today.getTime() + 11 * 60 * 60 * 1000), // 11 AM hoy
    duration: 4, // 4 horas
    progress: 60,
    completed: false,
    urgency: 0,
    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
  };
  task3.urgency = calculateUrgency(task3);

  // Tarea para hoy a las 2 PM, duración 1.5 horas
  const task4: Task = {
    id: '4',
    title: 'Reunión con equipo',
    importance: 2,
    startDate: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 2 PM hoy
    duration: 1.5, // 1.5 horas
    progress: 10,
    completed: false,
    urgency: 0,
    createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
  };
  task4.urgency = calculateUrgency(task4);

  // Tarea sin fecha de inicio
  const task5: Task = {
    id: '5',
    title: 'Aprender nueva tecnología',
    importance: 4,
    startDate: null,
    duration: 0,
    progress: 0,
    completed: false,
    urgency: 0,
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
  };
  task5.urgency = calculateUrgency(task5);

  // Tarea para hoy a las 10 AM, duración 2 horas, casi completada
  const task6: Task = {
    id: '6',
    title: 'Configurar servidor de desarrollo',
    importance: 5,
    startDate: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10 AM hoy
    duration: 2, // 2 horas
    progress: 95,
    completed: false,
    urgency: 0,
    createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
  };
  task6.urgency = calculateUrgency(task6);

  // Tarea para hoy a las 5 PM, duración 1 hora
  const task7: Task = {
    id: '7',
    title: 'Reunión con equipo de diseño',
    importance: 3,
    startDate: new Date(today.getTime() + 17 * 60 * 60 * 1000), // 5 PM hoy
    duration: 1, // 1 hora
    progress: 0,
    completed: false,
    urgency: 0,
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
  };
  task7.urgency = calculateUrgency(task7);
  
  // Tarea para mañana (para weekly view)
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const task8: Task = {
    id: '8',
    title: 'Planificar vacaciones de verano',
    importance: 2,
    startDate: tomorrow,
    duration: 2, // 2 días para weekly view
    progress: 0,
    completed: false,
    urgency: 0,
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
  };
  task8.urgency = calculateUrgency(task8);

  return [task1, task2, task3, task4, task5, task6, task7, task8];
}

