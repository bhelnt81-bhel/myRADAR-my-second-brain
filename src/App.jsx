import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CheckSquare, Brain, FolderOpen, Settings, Plus, Mic } from 'lucide-react';
import Dashboard from './components/Dashboard';

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
        
        <div className="glass-panel" style={{ padding: 16, marginTop: 'auto', background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>SS</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Santosh</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>BHEL / Intimus</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
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
          {activeTab !== 'dashboard' && (
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
      </main>

      {/* Quick Capture FAB */}
      <motion.button 
        className="fab"
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsCaptureOpen(true)}
      >
        <Plus size={32} />
      </motion.button>

      {/* Quick Capture Modal Overlay */}
      <AnimatePresence>
        {isCaptureOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
            }}
            onClick={() => setIsCaptureOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="glass-panel"
              style={{ width: '90%', maxWidth: 600, padding: 32, position: 'relative' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ fontSize: 24, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="gradient-text" style={{ backgroundImage: 'linear-gradient(to right, #3b82f6, #8b5cf6)' }}>Quick Capture</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
              </h2>
              
              <textarea 
                autoFocus
                placeholder="What's on your mind? (e.g. 'Draft disposal note for 56 ACs by Friday' or 'Call Intimus client about payment')"
                style={{
                  width: '100%', height: 150, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 16, padding: 20, color: 'white', fontSize: 16, fontFamily: 'inherit', resize: 'none',
                  outline: 'none', marginBottom: 24
                }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="glass-button" style={{ padding: '10px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                    <Mic size={16} /> Voice Input
                  </button>
                </div>
                <button 
                  style={{ 
                    background: 'white', color: 'black', border: 'none', padding: '12px 24px', 
                    borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' 
                  }}
                  onClick={() => setIsCaptureOpen(false)}
                >
                  Save to Brain ⚡
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
