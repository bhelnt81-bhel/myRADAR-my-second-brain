import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CheckSquare, Brain, FolderOpen, Settings, Plus, BarChart2 } from 'lucide-react';
import Dashboard from './components/Dashboard';
import MasterQueue from './components/MasterQueue';
import QuickCapture from './components/QuickCapture';
import KnowledgeBase from './components/KnowledgeBase';
import AIPriorities from './components/AIPriorities';
import SettingsTab from './components/SettingsTab';
import WeeklyReview from './components/WeeklyReview';
import { TaskProvider, useTasksContext } from './context/TaskContext';
import { SettingsProvider, useSettingsContext } from './context/SettingsContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
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

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
    style={{ height: '100%' }}
  >
    {children}
  </motion.div>
);

const DashboardWrapper = () => {
  const { tasks, energyLevel, aiInsight, top3Ids, isPrioritizing, handleCheckIn, forceRecalculate, handleResetEnergy, loading } = useTasksContext();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
        <Brain size={32} color="var(--text-tertiary)" />
      </motion.div>
    </div>
  );
  return (
    <Dashboard 
      tasks={tasks} energyLevel={energyLevel} aiInsight={aiInsight} top3Ids={top3Ids}
      isPrioritizing={isPrioritizing} onCheckIn={handleCheckIn} onRecalculate={forceRecalculate}
      onResetEnergy={handleResetEnergy}
    />
  );
};

const MasterQueueWrapper = () => {
  const { tasks, handleUpdateTasks } = useTasksContext();
  return <MasterQueue tasks={tasks} setTasks={handleUpdateTasks} />;
};

const AIPrioritiesWrapper = () => {
  const { tasks, energyLevel } = useTasksContext();
  return <AIPriorities tasks={tasks} energyLevel={energyLevel} />;
};

const WeeklyReviewWrapper = () => {
  const { tasks } = useTasksContext();
  return <WeeklyReview tasks={tasks} />;
};

const Layout = () => {
  const { typography } = useSettingsContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const { handleAddTask } = useTasksContext();
  
  const fontSizeClass = `font-size-${typography.fontSize.toLowerCase()}`;
  const fontStyleClass = `font-style-${typography.fontStyle.toLowerCase().replace(/\s+/g, '-')}`;

  const navItems = [
    { id: 'dashboard', path: '/', label: 'Daily Briefing', icon: LayoutDashboard },
    { id: 'tasks', path: '/tasks', label: 'Master Queue', icon: CheckSquare },
    { id: 'brain', path: '/brain', label: 'AI Priorities', icon: Brain },
    { id: 'knowledge', path: '/knowledge', label: 'Knowledge Base', icon: FolderOpen },
    { id: 'review', path: '/review', label: 'Weekly Review', icon: BarChart2 },
    { id: 'settings', path: '/settings', label: 'Settings', icon: Settings },
  ];

  const hour = new Date().getHours();
  const isWorkHours = hour >= 9 && hour < 18;
  const ambientGlow = isWorkHours 
    ? 'radial-gradient(circle at top right, rgba(255, 69, 58, 0.08), transparent 50%)' 
    : 'radial-gradient(circle at top right, rgba(94, 92, 230, 0.1), transparent 50%)';

  return (
    <div className={`app-container ${fontSizeClass} ${fontStyleClass}`} style={{ backgroundImage: ambientGlow, backgroundColor: 'var(--bg-base)' }}>
      <nav className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon"><Brain color="white" size={24} /></div>
          <div><h1 className="logo-title">myRADAR</h1><span className="logo-subtitle">Second Brain</span></div>
        </div>
        <div className="sidebar-menu">
          <div className="sidebar-menu-title">Menu</div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button key={item.id} className={`nav-item ${isActive ? 'active' : ''}`} onClick={() => navigate(item.path)}>
                <Icon className="nav-icon" size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="nav-label">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
      <main className="main-content">
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageWrapper><DashboardWrapper /></PageWrapper>} />
              <Route path="/tasks" element={<PageWrapper><MasterQueueWrapper /></PageWrapper>} />
              <Route path="/brain" element={<PageWrapper><AIPrioritiesWrapper /></PageWrapper>} />
              <Route path="/knowledge" element={<PageWrapper><KnowledgeBase /></PageWrapper>} />
              <Route path="/review" element={<PageWrapper><WeeklyReviewWrapper /></PageWrapper>} />
              <Route path="/settings" element={<PageWrapper><SettingsTab /></PageWrapper>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </ErrorBoundary>
      </main>
      <motion.button className="fab" aria-label="Quick Capture" whileTap={{ scale: 0.9 }} onClick={() => setIsCaptureOpen(true)}>
        <Plus size={32} />
      </motion.button>
      <QuickCapture isOpen={isCaptureOpen} onClose={() => setIsCaptureOpen(false)} onAdd={handleAddTask} />
    </div>
  );
};

export default function App() {
  return (
    <SettingsProvider>
      <TaskProvider>
        <Router>
          <Layout />
        </Router>
      </TaskProvider>
    </SettingsProvider>
  );
}
