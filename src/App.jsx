import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CheckSquare, Brain, FolderOpen, Settings, Plus, Mic } from 'lucide-react';
import Dashboard from './components/Dashboard';
import MasterQueue from './components/MasterQueue';
import QuickCapture from './components/QuickCapture';

const initialTasks = [
  { id: 1, title: 'Draft Disposal Note for 56 ACs', domain: 'BHEL', domainColor: 'var(--accent-bhel)', urgency: 'High', energy: 'High', time: '45m', status: 'pending' },
  { id: 2, title: 'Finalize MSME Pitch Deck', domain: 'Intimus', domainColor: 'var(--accent-intimus)', urgency: 'High', energy: 'Medium', time: '30m', status: 'pending' },
  { id: 3, title: 'Complete HBS Case Study reading', domain: 'Academic', domainColor: 'var(--accent-academic)', urgency: 'Medium', energy: 'High', time: '60m', status: 'pending' },
  { id: 4, title: 'Vendor Payment Escalation (Sehgal)', domain: 'BHEL', domainColor: 'var(--accent-bhel)', urgency: 'High', energy: 'Medium', time: '15m', status: 'pending' },
  { id: 5, title: 'Review Claude API docs for Bot', domain: 'AI & Tech', domainColor: 'var(--accent-ai)', urgency: 'Low', energy: 'Low', time: '20m', status: 'pending' },
  { id: 6, title: 'Book Himalayan Trek Guide', domain: 'Trekking', domainColor: 'var(--accent-trek)', urgency: 'Medium', energy: 'Low', time: '10m', status: 'completed' },
];

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
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);

  const handleAddTask = (newTask) => {
    const domainColors = {
      'BHEL': 'var(--accent-bhel)',
      'Intimus': 'var(--accent-intimus)',
      'Academic': 'var(--accent-academic)',
      'Trekking': 'var(--accent-trek)',
      'AI & Tech': 'var(--accent-ai)',
      'Personal': '#ec4899',
    };

    setTasks([...tasks, {
      ...newTask,
      id: Date.now(),
      status: 'pending',
      domainColor: domainColors[newTask.domain] || '#94a3b8'
    }]);
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
            {activeTab !== 'dashboard' && activeTab !== 'tasks' && (
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
