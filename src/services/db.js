// Database service supporting Phase 1 LocalStorage persistence and Google Sheets synchronization.
const DB_KEY = 'myradar_tasks';

const initialTasks = [
  { id: 1, title: 'Draft Disposal Note for 56 ACs', domain: 'BHEL', domainColor: 'var(--accent-bhel)', urgency: 'High', importance: 'High', energy: 'High', time: '45m', status: 'pending', deadlineDays: 2 },
  { id: 2, title: 'Finalize MSME Pitch Deck', domain: 'Intimus', domainColor: 'var(--accent-intimus)', urgency: 'High', importance: 'High', energy: 'Medium', time: '30m', status: 'pending', deadlineDays: 5 },
  { id: 3, title: 'Complete HBS Case Study reading', domain: 'Academic', domainColor: 'var(--accent-academic)', urgency: 'Medium', importance: 'Medium', energy: 'High', time: '60m', status: 'pending', deadlineDays: 10 },
  { id: 4, title: 'Vendor Payment Escalation (Sehgal)', domain: 'BHEL', domainColor: 'var(--accent-bhel)', urgency: 'High', importance: 'Low', energy: 'Medium', time: '15m', status: 'pending', deadlineDays: 1 },
  { id: 5, title: 'Review Claude API docs for Bot', domain: 'AI & Tech', domainColor: 'var(--accent-ai)', urgency: 'Low', importance: 'Medium', energy: 'Low', time: '20m', status: 'pending', deadlineDays: 30 },
  { id: 6, title: 'Book Himalayan Trek Guide', domain: 'Trekking', domainColor: 'var(--accent-trek)', urgency: 'Medium', importance: 'High', energy: 'Low', time: '10m', status: 'completed', deadlineDays: 45 },
];

const domainColors = {
  'BHEL': 'var(--accent-bhel)',
  'Intimus': 'var(--accent-intimus)',
  'Academic': 'var(--accent-academic)',
  'Trekking': 'var(--accent-trek)',
  'AI & Tech': 'var(--accent-ai)',
  'Personal': '#ec4899',
};

function getSheetUrl() {
  try {
    const saved = localStorage.getItem('myradar_settings');
    if (saved) {
      const settings = JSON.parse(saved);
      return settings.sheetUrl || null;
    }
  } catch (e) {
    console.error("Error reading settings for sheetUrl", e);
  }
  return null;
}

export const db = {
  getTasks: async () => {
    // Return a promise with a slight timeout to simulate network delay for local,
    // or run direct fetch if sheetUrl is configured.
    const localData = localStorage.getItem(DB_KEY);
    const tasks = localData ? JSON.parse(localData) : initialTasks;
    if (!localData) {
      localStorage.setItem(DB_KEY, JSON.stringify(initialTasks));
    }

    const sheetUrl = getSheetUrl();
    if (sheetUrl) {
      try {
        const response = await fetch(sheetUrl);
        if (response.ok) {
          const remoteTasks = await response.json();
          if (Array.isArray(remoteTasks)) {
            // Apply domain colors
            const formattedTasks = remoteTasks.map(t => ({
              ...t,
              domainColor: domainColors[t.domain] || '#94a3b8'
            }));
            localStorage.setItem(DB_KEY, JSON.stringify(formattedTasks));
            return formattedTasks;
          }
        }
      } catch (err) {
        console.warn("Failed to fetch from Google Sheets, using cached tasks", err);
      }
    }

    return new Promise((resolve) => {
      setTimeout(() => resolve(tasks), 100);
    });
  },

  addTask: async (task) => {
    const stored = localStorage.getItem(DB_KEY);
    const tasks = stored ? JSON.parse(stored) : [];
    
    const newTask = {
      ...task,
      id: Date.now(),
      status: 'pending',
      domainColor: domainColors[task.domain] || '#94a3b8',
      createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    localStorage.setItem(DB_KEY, JSON.stringify(tasks));

    const sheetUrl = getSheetUrl();
    if (sheetUrl) {
      try {
        // Send as text/plain to avoid CORS preflight OPTIONS pre-request
        await fetch(sheetUrl, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'text/plain'
          },
          body: JSON.stringify({
            action: 'addTask',
            task: newTask
          })
        });
      } catch (err) {
        console.warn("Failed to push new task to Google Sheets, saved locally", err);
      }
    }

    return newTask;
  },

  updateTaskStatus: async (taskId, status) => {
    const stored = localStorage.getItem(DB_KEY);
    const tasks = stored ? JSON.parse(stored) : [];
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status } : t);
    localStorage.setItem(DB_KEY, JSON.stringify(updatedTasks));

    const sheetUrl = getSheetUrl();
    if (sheetUrl) {
      try {
        await fetch(sheetUrl, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'text/plain'
          },
          body: JSON.stringify({
            action: 'updateTaskStatus',
            id: taskId,
            status: status
          })
        });
      } catch (err) {
        console.warn("Failed to update task status in Google Sheets, updated locally", err);
      }
    }

    return updatedTasks;
  }
};

