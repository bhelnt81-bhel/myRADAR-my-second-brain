// Mock database service using LocalStorage for Phase 1 persistence.
// This simulates the async calls we will eventually make to the Google Sheets backend.

const DB_KEY = 'myradar_tasks';

const initialTasks = [
  { id: 1, title: 'Draft Disposal Note for 56 ACs', domain: 'BHEL', domainColor: 'var(--accent-bhel)', urgency: 'High', importance: 'High', energy: 'High', time: '45m', status: 'pending', deadlineDays: 2 },
  { id: 2, title: 'Finalize MSME Pitch Deck', domain: 'Intimus', domainColor: 'var(--accent-intimus)', urgency: 'High', importance: 'High', energy: 'Medium', time: '30m', status: 'pending', deadlineDays: 5 },
  { id: 3, title: 'Complete HBS Case Study reading', domain: 'Academic', domainColor: 'var(--accent-academic)', urgency: 'Medium', importance: 'Medium', energy: 'High', time: '60m', status: 'pending', deadlineDays: 10 },
  { id: 4, title: 'Vendor Payment Escalation (Sehgal)', domain: 'BHEL', domainColor: 'var(--accent-bhel)', urgency: 'High', importance: 'Low', energy: 'Medium', time: '15m', status: 'pending', deadlineDays: 1 },
  { id: 5, title: 'Review Claude API docs for Bot', domain: 'AI & Tech', domainColor: 'var(--accent-ai)', urgency: 'Low', importance: 'Medium', energy: 'Low', time: '20m', status: 'pending', deadlineDays: 30 },
  { id: 6, title: 'Book Himalayan Trek Guide', domain: 'Trekking', domainColor: 'var(--accent-trek)', urgency: 'Medium', importance: 'High', energy: 'Low', time: '10m', status: 'completed', deadlineDays: 45 },
];

export const db = {
  getTasks: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stored = localStorage.getItem(DB_KEY);
        if (stored) {
          resolve(JSON.parse(stored));
        } else {
          localStorage.setItem(DB_KEY, JSON.stringify(initialTasks));
          resolve(initialTasks);
        }
      }, 300); // simulate network delay
    });
  },

  addTask: async (task) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stored = localStorage.getItem(DB_KEY);
        const tasks = stored ? JSON.parse(stored) : [];
        const newTask = {
          ...task,
          id: Date.now(),
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        tasks.push(newTask);
        localStorage.setItem(DB_KEY, JSON.stringify(tasks));
        resolve(newTask);
      }, 300);
    });
  },

  updateTaskStatus: async (taskId, status) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stored = localStorage.getItem(DB_KEY);
        const tasks = stored ? JSON.parse(stored) : [];
        const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status } : t);
        localStorage.setItem(DB_KEY, JSON.stringify(updatedTasks));
        resolve(updatedTasks);
      }, 300);
    });
  }
};
