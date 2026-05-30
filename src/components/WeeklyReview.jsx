import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Target, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

export default function WeeklyReview({ tasks = [] }) {
  const [activeTab, setActiveTab] = useState('analytics');

  // Stats calculation
  const domains = ['BHEL', 'Intimus', 'Academic', 'Trekking', 'AI & Tech'];
  const domainColors = {
    'BHEL': 'var(--accent-bhel)',
    'Intimus': 'var(--accent-intimus)',
    'Academic': 'var(--accent-academic)',
    'Trekking': 'var(--accent-trek)',
    'AI & Tech': 'var(--accent-ai)',
  };

  const domainStats = domains.map(d => {
    const dTasks = tasks.filter(t => t.domain === d);
    const completed = dTasks.filter(t => t.status === 'completed').length;
    const pending = dTasks.filter(t => t.status !== 'completed').length;
    const total = dTasks.length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    return { domain: d, completed, pending, total, progress, color: domainColors[d] || '#94a3b8' };
  });

  const totalCompleted = tasks.filter(t => t.status === 'completed').length;
  const totalPending = tasks.filter(t => t.status !== 'completed').length;

  const mockGoals = [
    { id: 1, title: 'Close Vendor Contract (Sehgal)', domain: 'BHEL', progress: 80 },
    { id: 2, title: 'Launch 2 Client Landing Pages', domain: 'Intimus', progress: 50 },
    { id: 3, title: 'Complete Marketing Mgmt Module', domain: 'Academic', progress: 30 },
  ];

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 8, fontWeight: 700 }}>Weekly Review</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Sunday 8 PM ritual. Review your progress, clear the inbox, and set goals.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, background: 'rgba(255,255,255,0.05)', padding: 6, borderRadius: 12 }}>
          <button 
            onClick={() => setActiveTab('analytics')}
            className="glass-button" 
            style={{ 
              padding: '8px 16px', borderRadius: 8, 
              background: activeTab === 'analytics' ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: 'none', color: activeTab === 'analytics' ? 'white' : 'var(--text-tertiary)'
            }}
          >
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab('goals')}
            className="glass-button" 
            style={{ 
              padding: '8px 16px', borderRadius: 8, 
              background: activeTab === 'goals' ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: 'none', color: activeTab === 'goals' ? 'white' : 'var(--text-tertiary)'
            }}
          >
            Goals
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Top Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              <div className="glass-panel" style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>{totalCompleted}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Tasks Completed</div>
              </div>
              <div className="glass-panel" style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent-bhel)' }}>{totalPending}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Pending Tasks</div>
              </div>
              <div className="glass-panel" style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent-academic)' }}>
                  {tasks.length > 0 ? Math.round((totalCompleted / tasks.length) * 100) : 0}%
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Completion Rate</div>
              </div>
            </div>

            {/* Domain Breakdown */}
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart2 size={20} color="var(--accent-ai)" /> Domain Breakdown
            </h2>
            <div className="glass-panel" style={{ padding: 24 }}>
              {domainStats.map((stat, i) => (
                <div key={stat.domain} style={{ marginBottom: i < domainStats.length - 1 ? 20 : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{stat.domain}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>({stat.completed}/{stat.total})</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: stat.color }}>{stat.progress}%</span>
                  </div>
                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${stat.progress}%` }} 
                      transition={{ duration: 1, delay: i * 0.1 }}
                      style={{ height: '100%', background: stat.color, borderRadius: 4 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-panel" style={{ padding: 24, marginTop: 24, background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <AlertCircle color="var(--accent-bhel)" size={20} />
                <h3 style={{ fontSize: 15, margin: 0, color: 'var(--text-primary)' }}>Bottleneck Detection</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                You have {totalPending} tasks rolling over. If BHEL tasks keep rolling over, consider delegating routine vendor follow-ups. Ensure your Academic tasks are scheduled for high-energy morning blocks.
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === 'goals' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Target color="var(--accent-academic)" size={20} />
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>Monthly Goals Alignment</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mockGoals.map((goal, i) => (
                <motion.div 
                  key={goal.id} 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: i * 0.1 }}
                  className="glass-panel" 
                  style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'center', borderLeft: `3px solid ${domainColors[goal.domain]}` }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: domainColors[goal.domain], fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
                      {goal.domain}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                      {goal.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${goal.progress}%`, height: '100%', background: domainColors[goal.domain] || 'white' }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{goal.progress}%</span>
                    </div>
                  </div>
                  <button className="glass-button" style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {goal.progress === 100 ? <CheckCircle2 color="var(--accent-academic)" /> : <Circle color="var(--text-tertiary)" />}
                  </button>
                </motion.div>
              ))}
            </div>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <button className="glass-button" style={{ padding: '12px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, background: 'var(--accent-intimus)', color: 'white', border: 'none' }}>
                + Add New Goal
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
