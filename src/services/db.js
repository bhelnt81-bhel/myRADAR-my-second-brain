// Database service supporting Phase 1 LocalStorage persistence and Google Sheets synchronization.
const DB_KEY = 'myradar_tasks';
const META_KEY = 'myradar_metadata';

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
    let localTasks = initialTasks;
    let localMeta = { aiInsight: '', top3Ids: [], energyLevel: null };
    
    try {
      const storedTasks = localStorage.getItem(DB_KEY);
      if (storedTasks) localTasks = JSON.parse(storedTasks);
      else localStorage.setItem(DB_KEY, JSON.stringify(initialTasks));
      
      const storedMeta = localStorage.getItem(META_KEY);
      if (storedMeta) localMeta = JSON.parse(storedMeta);
    } catch(e) {}

    const sheetUrl = getSheetUrl();
    if (sheetUrl) {
      try {
        const urlWithCacheBuster = sheetUrl + (sheetUrl.includes('?') ? '&' : '?') + 't=' + new Date().getTime();
        const response = await fetch(urlWithCacheBuster, { cache: 'no-store' });
        if (response.ok) {
          const remoteData = await response.json();
          let remoteTasks = Array.isArray(remoteData) ? remoteData : (remoteData.tasks || []);
          let metadata = Array.isArray(remoteData) ? { aiInsight: '', top3Ids: [], energyLevel: null } : (remoteData.metadata || {});

          const formattedTasks = remoteTasks.map(t => ({
            ...t,
            domainColor: domainColors[t.domain] || '#94a3b8'
          }));
          
          localStorage.setItem(DB_KEY, JSON.stringify(formattedTasks));
          localStorage.setItem(META_KEY, JSON.stringify(metadata));
          
          return { tasks: formattedTasks, metadata };
        }
      } catch (err) {
        console.warn("Failed to fetch from Google Sheets, using cached tasks", err);
      }
    }

    return new Promise((resolve) => {
      setTimeout(() => resolve({ tasks: localTasks, metadata: localMeta }), 100);
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
        await fetch(sheetUrl, {
          method: 'POST', mode: 'cors', headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ action: 'addTask', task: newTask })
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
          method: 'POST', mode: 'cors', headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ action: 'updateTaskStatus', id: taskId, status })
        });
      } catch (err) {
        console.warn("Failed to update task status in Google Sheets", err);
      }
    }

    return updatedTasks;
  },

  updateTask: async (taskId, updates) => {
    const stored = localStorage.getItem(DB_KEY);
    const tasks = stored ? JSON.parse(stored) : [];
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
    localStorage.setItem(DB_KEY, JSON.stringify(updatedTasks));

    const sheetUrl = getSheetUrl();
    if (sheetUrl) {
      try {
        await fetch(sheetUrl, {
          method: 'POST', mode: 'cors', headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ action: 'updateTask', id: taskId, updates })
        });
      } catch (err) {
        console.warn("Failed to update task in Google Sheets", err);
      }
    }
    
    return updatedTasks;
  },
  
  syncPriorities: async (tasks, insight, top3Ids, energyLevel) => {
    const sheetUrl = getSheetUrl();
    if (!sheetUrl) return false;
    
    // Save metadata locally just in case
    const currentMeta = JSON.parse(localStorage.getItem(META_KEY) || '{}');
    localStorage.setItem(META_KEY, JSON.stringify({ ...currentMeta, aiInsight: insight, top3Ids, energyLevel }));
    
    try {
      await fetch(sheetUrl, {
        method: 'POST', mode: 'cors', headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'syncPriorities', tasks, insight, top3Ids, energyLevel })
      });
      return true;
    } catch (err) {
      console.warn("Failed to sync AI priorities to Google Sheets", err);
      return false;
    }
  }
};
