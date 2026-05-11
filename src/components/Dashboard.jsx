import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, ArrowRight, TrendingUp, AlertTriangle, Brain } from 'lucide-react';

const quadrants = [
  { q: "Q1 — DO NOW", label: "Urgent & Important", bg: "rgba(239, 68, 68, 0.05)", border: "var(--accent-bhel)", tasks: ["Vendor Payment Escalation (Sehgal)", "Guest House AC Failure"] },
  { q: "Q2 — SCHEDULE", label: "Important, Not Urgent", bg: "rgba(16, 185, 129, 0.05)", border: "var(--accent-academic)", tasks: ["EMBA Marketing Block", "Intimus Website Redesign"] },
  { q: "Q3 — DELEGATE", label: "Urgent, Not Important", bg: "rgba(249, 115, 22, 0.05)", border: "var(--accent-intimus)", tasks: ["Routine Form Submission", "Draft standard circular"] },
  { q: "Q4 — ELIMINATE", label: "Not Urgent/Important", bg: "rgba(100, 116, 139, 0.05)", border: "var(--text-tertiary)", tasks: ["Low-value meetings", "Endless scrolling"] },
];

const TaskItem = ({ task, index }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="task-card"
  >
    <div style={{ width: 4, height: 40, background: task.domainColor, borderRadius: 2 }} />
    <div style={{ flex: 1 }}>
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
      <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{task.title}</h3>
    </div>
    <button className="glass-button" style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ArrowRight size={18} />
    </button>
  </motion.div>
);

export default function Dashboard({ tasks }) {
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const topTasks = pendingTasks.slice(0, 3);
  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            Good Morning, Santosh <span className="emoji-large">🌅</span>
          </h1>
          <p className="dashboard-subtitle">
            Here is your AI-curated Daily Briefing for Tuesday.
          </p>
        </div>
        <div className="glass-panel stats-panel">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-bhel)' }}>8</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Overdue</div>
          </div>
          <div style={{ width: 1, height: 30, background: 'var(--border-color)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-academic)' }}>5</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Focus Hrs</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Top Tasks */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Zap color="var(--accent-intimus)" size={20} />
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Top 3 Recommended Actions</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topTasks.map((task, i) => <TaskItem key={task.id} task={task} index={i} />)}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 40, marginBottom: 20 }}>
            <TrendingUp color="var(--accent-ai)" size={20} />
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>AI Priority Matrix</h2>
          </div>

          <div className="matrix-grid">
            {quadrants.map((q, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="glass-panel" 
                style={{ borderTop: `3px solid ${q.border}`, padding: 20, background: q.bg }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, color: q.border, textTransform: 'uppercase', marginBottom: 4 }}>{q.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{q.q}</div>
                <ul style={{ paddingLeft: 16, margin: 0, color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
                  {q.tasks.map((t, j) => <li key={j} style={{ marginBottom: 4 }}>{t}</li>)}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Insights */}
        <div>
          <div className="glass-panel" style={{ padding: 24, background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Brain color="var(--accent-ai)" size={24} />
              <h3 style={{ fontSize: 16, margin: 0 }}>Brain Insight</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
              You have a high-energy BHEL task (Disposal Note) and an Academic case study today. Suggest tackling the BHEL note before 11 AM while focus is peak, and saving the MSME pitch deck for the afternoon slump.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: 12 }}>Optimization</span>
              <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: 12 }}>Energy Match</span>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: 24, marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <AlertTriangle color="var(--accent-bhel)" size={20} />
              <h3 style={{ fontSize: 16, margin: 0 }}>Radar Alerts</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Quarterly Audit Approaches</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>BHEL Domain • Due in 4 days</div>
              </div>
              <div style={{ width: '100%', height: 1, background: 'var(--border-color)' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Trek Preparation Lagging</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>Personal Domain • Missed 2 workouts</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
