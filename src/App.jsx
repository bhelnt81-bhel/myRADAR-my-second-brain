import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CheckSquare, Brain, FolderOpen, Settings, Plus, Mic } from 'lucide-react';
import Dashboard from './components/Dashboard';
import MasterQueue from './components/MasterQueue';

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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);

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
        <div style={{ marginBottom: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 40, height: 40, borderRadius: 12, 
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
          }}>
            <Brain color="white" size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, margin: 0, fontWeight: 700, letterSpacing: '0.02em' }}>myRADAR</h1>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Second Brain</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 12, paddingLeft: 16 }}>Menu</div>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                {item.label}
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
                <Dashboard />
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
                <MasterQueue />
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
    </div>
  );
}
