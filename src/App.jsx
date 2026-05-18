import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CheckSquare, Brain, FolderOpen, Settings, Plus, Mic } from 'lucide-react';
import Dashboard from './components/Dashboard';
import MasterQueue from './components/MasterQueue';
import QuickCapture from './components/QuickCapture';
import KnowledgeBase from './components/KnowledgeBase';
import { db } from './services/db';

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

  useEffect(() => {
    db.getTasks().then(data => {
      setTasks(data);
      setLoading(false);
    });
  }, []);

  const handleAddTask = async (newTask) => {
    const domainColors = {
      'BHEL': 'var(--accent-bhel)',
      'Intimus': 'var(--accent-intimus)',
      'Academic': 'var(--accent-academic)',
      'Trekking': 'var(--accent-trek)',
      'AI & Tech': 'var(--accent-ai)',
      'Personal': '#ec4899',
    };

    const taskWithColor = {
      ...newTask,
      domainColor: domainColors[newTask.domain] || '#94a3b8'
    };

    const addedTask = await db.addTask(taskWithColor);
    setTasks([...tasks, addedTask]);
  };

  const navItems = [
    { id: 'dashboard', label: 'Daily Briefing', icon: LayoutDashboard },
    { id: 'tasks', label: 'Master Queue', icon: CheckSquare },
    { id: 'brain', label: 'AI Priorities', icon: Brain },
    { id: 'knowledge', label: 'Knowledge Base', icon: FolderOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="app-container">
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
                onClick={() => setActiveTab(item.id)}
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
                <Dashboard tasks={tasks} />
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
                <MasterQueue tasks={tasks} setTasks={setTasks} />
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
            {activeTab !== 'dashboard' && activeTab !== 'tasks' && activeTab !== 'knowledge' && (
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
        onClick={() => setIsCaptureOpen(true)}
      >
        <Plus size={32} />
      </motion.button>

      <QuickCapture 
        isOpen={isCaptureOpen} 
        onClose={() => setIsCaptureOpen(false)} 
        onAdd={handleAddTask} 
      />
    </div>
  );
}
