import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, ArrowRight, CheckCircle2, Circle } from 'lucide-react';

// Shared mock data (eventually moved to global state/context)
const mockTasks = [
  { id: 1, title: 'Draft Disposal Note for 56 ACs', domain: 'BHEL', domainColor: 'var(--accent-bhel)', urgency: 'High', energy: 'High', time: '45m', status: 'pending' },
  { id: 2, title: 'Finalize MSME Pitch Deck', domain: 'Intimus', domainColor: 'var(--accent-intimus)', urgency: 'High', energy: 'Medium', time: '30m', status: 'pending' },
  { id: 3, title: 'Complete HBS Case Study reading', domain: 'Academic', domainColor: 'var(--accent-academic)', urgency: 'Medium', energy: 'High', time: '60m', status: 'pending' },
  { id: 4, title: 'Vendor Payment Escalation (Sehgal)', domain: 'BHEL', domainColor: 'var(--accent-bhel)', urgency: 'High', energy: 'Medium', time: '15m', status: 'pending' },
  { id: 5, title: 'Review Claude API docs for Bot', domain: 'AI & Tech', domainColor: 'var(--accent-ai)', urgency: 'Low', energy: 'Low', time: '20m', status: 'pending' },
  { id: 6, title: 'Book Himalayan Trek Guide', domain: 'Trekking', domainColor: 'var(--accent-trek)', urgency: 'Medium', energy: 'Low', time: '10m', status: 'completed' },
];

const domains = [
  { id: 'All', label: 'All Domains', color: 'var(--text-secondary)' },
  { id: 'BHEL', label: 'BHEL Estate', color: 'var(--accent-bhel)' },
  { id: 'Intimus', label: 'Intimus', color: 'var(--accent-intimus)' },
  { id: 'Academic', label: 'Academic', color: 'var(--accent-academic)' },
  { id: 'Trekking', label: 'Trekking', color: 'var(--accent-trek)' },
  { id: 'AI & Tech', label: 'AI & Tech', color: 'var(--accent-ai)' },
];

export default function MasterQueue() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredTasks = activeFilter === 'All' 
    ? mockTasks 
    : mockTasks.filter(t => t.domain === activeFilter);

  const pendingTasks = filteredTasks.filter(t => t.status !== 'completed');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  return (
    <div className="page-container">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, marginBottom: 8, fontWeight: 700 }}>Master Queue</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Your central nervous system. Everything you need to do, organized by domain.
        </p>
      </div>

      {/* Domain Filters */}
      <div className="filters-container">
        {domains.map(domain => (
          <button
            key={domain.id}
            onClick={() => setActiveFilter(domain.id)}
            className="filter-button"
            style={{
              background: activeFilter === domain.id ? `${domain.color}20` : 'rgba(255,255,255,0.05)',
              color: activeFilter === domain.id ? domain.color : 'var(--text-secondary)',
              border: `1px solid ${activeFilter === domain.id ? domain.color : 'transparent'}`,
            }}
          >
            {domain.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Pending Actions ({pendingTasks.length})</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AnimatePresence>
            {pendingTasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="task-card"
                style={{ alignItems: 'center' }}
              >
                <button style={{ color: 'var(--text-tertiary)', padding: 0, display: 'flex' }}>
                  <Circle size={22} />
                </button>
                
                <div style={{ flex: 1, marginLeft: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="domain-pill" style={{ color: task.domainColor, background: `${task.domainColor}20` }}>
                      {task.domain}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {task.time}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Zap size={12} /> {task.energy} Energy
                    </span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{task.title}</h3>
                </div>
                
                <button className="glass-button" style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                  Start
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {pendingTasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)' }}>
              No pending tasks in this domain. You're all caught up!
            </div>
          )}
        </div>

        {/* Completed Section */}
        {completedTasks.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16 }}>Completed Today</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, opacity: 0.6 }}>
              {completedTasks.map(task => (
                <div key={task.id} className="task-card" style={{ padding: '12px 20px', alignItems: 'center' }}>
                  <CheckCircle2 size={22} color="var(--accent-academic)" />
                  <div style={{ flex: 1, marginLeft: 8 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', margin: 0, textDecoration: 'line-through' }}>{task.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
