import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CheckSquare, Brain, FolderOpen, Settings, Plus, Mic } from 'lucide-react';
import Dashboard from './components/Dashboard';
import MasterQueue from './components/MasterQueue';
import QuickCapture from './components/QuickCapture';
import KnowledgeBase from './components/KnowledgeBase';
import AIPriorities from './components/AIPriorities';
import SettingsTab from './components/SettingsTab';
import { db } from './services/db';
import { ai } from './services/ai';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', background: 'rgba(255,0,0,0.1)' }}>
          <h2>Something went wrong.</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{this.state.error && this.state.error.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Phase 2 State
  const [energyLevel, setEnergyLevel] = useState(null);
  const [aiInsight, setAiInsight] = useState('');
  const [top3Ids, setTop3Ids] = useState([]);
  const [isPrioritizing, setIsPrioritizing] = useState(false);

  const [typography, setTypography] = useState(() => {
    const saved = localStorage.getItem('myradar_settings');
    const settings = saved ? JSON.parse(saved) : {};
    return {
      fontSize: settings.fontSize || 'Medium',
      fontStyle: settings.fontStyle || 'Modern Sans'
    };
  });

  const runAIPrioritization = async (tasksList, energy) => {
    const savedSettings = localStorage.getItem('myradar_settings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    
    if (!settings.geminiApiKey) {
      // Fallback to local heuristic priorities
      const fallbackPrioritized = tasksList.map(task => {
        const mapVal = (v) => v === 'High' ? 3 : v === 'Medium' ? 2 : 1;
        let score = (mapVal(task.urgency) * 0.35) + (mapVal(task.importance || 'Medium') * 0.30);
        if (task.domain === 'BHEL') score *= 1.5;
        
        let q = "Q4 — ELIMINATE";
        if (task.urgency === 'High' && (task.importance === 'High' || !task.importance)) q = "Q1 — DO NOW";
        else if (task.urgency !== 'High' && (task.importance === 'High' || !task.importance)) q = "Q2 — SCHEDULE";
        else if (task.urgency === 'High' && task.importance !== 'High') q = "Q3 — DELEGATE";
        
        return {
          ...task,
          priorityScore: Number(Math.min(10, score * 2.2).toFixed(1)),
          quadrant: q,
          microAction: `Spend 5 minutes drafting the outline / setting environment for: ${task.title}`,
          timeBlockSuggestion: task.urgency === 'High' ? 'Morning Focus Block' : 'Afternoon Review'
        };
      });

      setTasks(fallbackPrioritized);
      setAiInsight("Welcome back, Santosh! Please enter your Gemini API Key in Settings to unlock real-time contextual priorities, proactive daily briefings, and procrastination micro-actions.");
      const sortedIds = [...fallbackPrioritized]
        .filter(t => t.status !== 'completed')
        .sort((a,b) => b.priorityScore - a.priorityScore)
        .slice(0, 3)
        .map(t => t.id);
      setTop3Ids(sortedIds);
      return;
    }

    setIsPrioritizing(true);
    try {
      const result = await ai.prioritizeTasks(tasksList, settings, energy);
      if (result && result.tasks) {
        const updated = tasksList.map(task => {
          const aiTask = result.tasks.find(t => Number(t.id) === Number(task.id));
          if (aiTask) {
            return {
              ...task,
              urgency: aiTask.urgency,
              importance: aiTask.importance,
              priorityScore: aiTask.priorityScore,
              quadrant: aiTask.quadrant,
              microAction: aiTask.microAction,
              timeBlockSuggestion: aiTask.timeBlockSuggestion
            };
          }
          return task;
        });

        setTasks(updated);
        setAiInsight(result.insight || '');
        setTop3Ids(result.top3Ids || []);

        localStorage.setItem('myradar_prioritized_state', JSON.stringify({
          tasks: updated,
          insight: result.insight,
          top3Ids: result.top3Ids
        }));
      }
    } catch (e) {
      console.error("AI Prioritization failed", e);
    } finally {
      setIsPrioritizing(false);
    }
  };

  const handleCheckIn = async (energy) => {
    setEnergyLevel(energy);
    localStorage.setItem('myradar_energy_level', energy);
    localStorage.setItem('myradar_last_checkin_date', new Date().toDateString());
    await runAIPrioritization(tasks, energy);
  };

  useEffect(() => {
    // Setup History State for Back Button Support
    window.history.replaceState({ tab: 'dashboard' }, '');

    const handlePopState = (e) => {
      if (e.state && e.state.modal === 'capture') {
        setIsCaptureOpen(true);
      } else {
        setIsCaptureOpen(false);
      }
      if (e.state && e.state.tab) {
        setActiveTab(e.state.tab);
      } else {
        setActiveTab('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    const lastCheckin = localStorage.getItem('myradar_last_checkin_date');
    const today = new Date().toDateString();
    const savedEnergy = localStorage.getItem('myradar_energy_level');
    
    let currentEnergy = null;
    if (lastCheckin === today && savedEnergy) {
      currentEnergy = savedEnergy;
      setEnergyLevel(savedEnergy);
    }

    db.getTasks().then(data => {
      const cachedState = localStorage.getItem('myradar_prioritized_state');
      if (cachedState) {
        try {
          const parsed = JSON.parse(cachedState);
          const syncedTasks = data.map(dbTask => {
            const cachedTask = parsed.tasks.find(t => t.id === dbTask.id);
            if (cachedTask) {
              return {
                ...cachedTask,
                status: dbTask.status
              };
            }
            return dbTask;
          });
          setTasks(syncedTasks);
          setAiInsight(parsed.insight || '');
          setTop3Ids(parsed.top3Ids || []);
          setLoading(false);
          return;
        } catch (e) {
          console.error("Failed parsing cached AI priorities", e);
        }
      }

      setTasks(data);
      setLoading(false);
      if (currentEnergy) {
        runAIPrioritization(data, currentEnergy);
      }
    });

    const handleSettingsChange = () => {
      const saved = localStorage.getItem('myradar_settings');
      const settings = saved ? JSON.parse(saved) : {};
      setTypography({
        fontSize: settings.fontSize || 'Medium',
        fontStyle: settings.fontStyle || 'Modern Sans'
      });
    };

    window.addEventListener('myradar-settings-changed', handleSettingsChange);
    return () => {
      window.removeEventListener('myradar-settings-changed', handleSettingsChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleTabChange = (tabId) => {
    if (tabId === activeTab) return;
    setActiveTab(tabId);
    window.history.pushState({ tab: tabId }, '');
  };

  const handleOpenCapture = () => {
    setIsCaptureOpen(true);
    window.history.pushState({ tab: activeTab, modal: 'capture' }, '');
  };

  const handleCloseCapture = () => {
    setIsCaptureOpen(false);
    if (window.history.state && window.history.state.modal === 'capture') {
      window.history.back();
    }
  };

  const fontSizeClass = `font-size-${typography.fontSize.toLowerCase()}`;
  const fontStyleClass = `font-style-${typography.fontStyle.toLowerCase().replace(/\s+/g, '-')}`;

  const handleAddTask = async (newTask) => {
    const addedTask = await db.addTask(newTask);
    const updatedTasks = [...tasks, addedTask];
    setTasks(updatedTasks);
    if (energyLevel) {
      runAIPrioritization(updatedTasks, energyLevel);
    }
  };

  const handleUpdateTasks = (updatedTasks) => {
    setTasks(updatedTasks);
    const cachedState = localStorage.getItem('myradar_prioritized_state');
    if (cachedState) {
      try {
        const parsed = JSON.parse(cachedState);
        parsed.tasks = parsed.tasks.map(cachedTask => {
          const matchingDbTask = updatedTasks.find(t => t.id === cachedTask.id);
          if (matchingDbTask) {
            return {
              ...cachedTask,
              status: matchingDbTask.status
            };
          }
          return cachedTask;
        });
        localStorage.setItem('myradar_prioritized_state', JSON.stringify(parsed));
      } catch (e) {
        console.error(e);
      }
    }
  };


  const navItems = [
    { id: 'dashboard', label: 'Daily Briefing', icon: LayoutDashboard },
    { id: 'tasks', label: 'Master Queue', icon: CheckSquare },
    { id: 'brain', label: 'AI Priorities', icon: Brain },
    { id: 'knowledge', label: 'Knowledge Base', icon: FolderOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={`app-container ${fontSizeClass} ${fontStyleClass}`}>
      {/* Sidebar */}
      <nav className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">
            <Brain color="white" size={24} />
          </div>
          <div>
            <h1 className="logo-title">myRADAR</h1>
            <span className="logo-subtitle">Second Brain</span>
          </div>
        </div>

        <div className="sidebar-menu">
          <div className="sidebar-menu-title">Menu</div>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleTabChange(item.id)}
              >
                <Icon className="nav-icon" size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                <span className="nav-label">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <ErrorBoundary>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <Brain size={32} color="var(--text-tertiary)" />
              </motion.div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{ height: '100%' }}
              >
                <Dashboard 
                  tasks={tasks} 
                  energyLevel={energyLevel}
                  aiInsight={aiInsight}
                  top3Ids={top3Ids}
                  isPrioritizing={isPrioritizing}
                  onCheckIn={handleCheckIn}
                  onRecalculate={() => runAIPrioritization(tasks, energyLevel)}
                />
              </motion.div>
            )}
            {activeTab === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{ height: '100%' }}
              >
                <MasterQueue tasks={tasks} setTasks={handleUpdateTasks} />
              </motion.div>
            )}
            {activeTab === 'knowledge' && (
              <motion.div
                key="knowledge"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{ height: '100%' }}
              >
                <KnowledgeBase />
              </motion.div>
            )}
            {activeTab === 'brain' && (
              <motion.div
                key="brain"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{ height: '100%' }}
              >
                <AIPriorities tasks={tasks} energyLevel={energyLevel} />
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{ height: '100%' }}
              >
                <SettingsTab />
              </motion.div>
            )}
            {activeTab !== 'dashboard' && activeTab !== 'tasks' && activeTab !== 'knowledge' && activeTab !== 'brain' && activeTab !== 'settings' && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 16, color: 'var(--text-tertiary)' }}
              >
                <Brain size={64} opacity={0.2} />
                <h2>{navItems.find(n => n.id === activeTab)?.label} - Coming Soon</h2>
                <p>Module currently in development according to Phase 1 blueprint.</p>
              </motion.div>
            )}
          </AnimatePresence>
          )}
        </ErrorBoundary>
      </main>

      {/* Quick Capture FAB */}
      <motion.button 
        className="fab"
        whileTap={{ scale: 0.9 }}
        onClick={handleOpenCapture}
      >
        <Plus size={32} />
      </motion.button>

      <QuickCapture 
        isOpen={isCaptureOpen} 
        onClose={handleCloseCapture} 
        onAdd={handleAddTask} 
      />
    </div>
  );
}
