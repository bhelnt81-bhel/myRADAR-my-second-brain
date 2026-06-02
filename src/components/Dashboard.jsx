import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, TrendingUp, AlertTriangle, Brain, RefreshCw } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Badge } from './ui/Badge';
import TaskDetailsModal from './TaskDetailsModal';
import { db } from '../services/db';
import { useTasksContext } from '../context/TaskContext';

const TaskItem = ({ task, index, onStart }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="task-card"
    style={{ 
      position: 'relative', 
      border: task.status === 'in_progress' ? `1px solid ${task.domainColor}` : '1px solid rgba(255, 255, 255, 0.04)',
      boxShadow: task.status === 'in_progress' ? `0 0 10px ${task.domainColor}40` : 'none',
      alignItems: 'center'
    }}
  >
    <div style={{ width: 4, height: 48, background: task.domainColor, borderRadius: 2, flexShrink: 0 }} />
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
        <Badge color={task.domainColor}>{task.domain}</Badge>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={11} aria-hidden="true" /> <span className="sr-only">Time limit:</span> {task.time}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Zap size={11} aria-hidden="true" /> <span className="sr-only">Energy:</span> {task.energy}
        </span>
        {task.status === 'in_progress' && (
          <Badge color="#10b981">In Progress</Badge>
        )}
        {task.priorityScore !== undefined && (
          <Badge type="score">Score: {task.priorityScore}</Badge>
        )}
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{task.title}</h3>
      {task.microAction && (
        <div style={{ fontSize: 11, color: '#f0883e', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span aria-hidden="true">⚡</span> <span className="sr-only">First Step:</span> {task.microAction}
        </div>
      )}
    </div>
    <button 
      onClick={() => onStart(task)} 
      className="glass-button" 
      style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, flexShrink: 0 }}
    >
      Start
    </button>
  </motion.div>
);

export default function Dashboard({ tasks, energyLevel, aiInsight, top3Ids, isPrioritizing, onCheckIn, onRecalculate }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const { handleUpdateTasks } = useTasksContext();
  
  const pendingTasks = tasks.filter(t => t.status !== 'completed');

  const handleStartTask = async (task) => {
    setSelectedTask(task);
    if (task.status !== 'in_progress') {
      const updatedTasks = await db.updateTaskStatus(task.id, 'in_progress');
      handleUpdateTasks(updatedTasks);
      
      // Update selected task reference so modal reflects the new status
      const activeTask = updatedTasks.find(t => t.id === task.id);
      setSelectedTask(activeTask);
    }
  };

  const handleCompleteTask = async (taskId) => {
    const updatedTasks = await db.updateTaskStatus(taskId, 'completed');
    handleUpdateTasks(updatedTasks);
    setSelectedTask(null);
  };

  const handleRevertTask = async (taskId) => {
    const updatedTasks = await db.updateTaskStatus(taskId, 'pending');
    handleUpdateTasks(updatedTasks);
    setSelectedTask(null);
  };

  if (isPrioritizing) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
            <Brain size={48} color="var(--accent-ai)" />
          </motion.div>
          <h3 style={{ fontSize: 18, fontWeight: 600 }}>Consulting your Second Brain...</h3>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 13, margin: 0 }}>Synthesizing BHEL guidelines, Intimus operations, and EMBAcase files.</p>
        </div>
      </div>
    );
  }

  if (!energyLevel) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <GlassCard 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ padding: 40, maxWidth: 500, width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 24 }}
        >
          <div>
            <Brain size={48} color="var(--accent-ai)" style={{ margin: '0 auto 16px auto', display: 'block' }} />
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Daily Check-In</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Good morning, Santosh. Select your current energy level so the AI Priority Engine can sort your queue.
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { id: 'High', label: 'High Energy ⚡', desc: 'Ready for deep focus work (Drafting Notes, Case Studies)', color: 'var(--accent-academic)' },
              { id: 'Medium', label: 'Medium Energy ⚖️', desc: 'Standard operations, reviews, and client updates', color: 'var(--accent-trek)' },
              { id: 'Low', label: 'Low Energy 🔋', desc: 'Shallow tasks, vendor follow-ups, inbox clearance', color: 'var(--accent-intimus)' },
            ].map(level => (
              <button
                key={level.id}
                onClick={() => onCheckIn(level.id)}
                className="glass-button"
                aria-label={`Select ${level.id} energy level`}
                style={{
                  padding: '16px 20px', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4,
                  border: `1px solid rgba(255,255,255,0.08)`, textTransform: 'none', textAlign: 'left', width: '100%'
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 700, color: level.color }}>{level.label}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{level.desc}</span>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>
    );
  }

  const mappedTopTasks = (top3Ids || []).map(id => pendingTasks.find(t => t.id === id)).filter(Boolean);
  const displayTopTasks = mappedTopTasks.length > 0 
    ? mappedTopTasks 
    : [...pendingTasks].sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0)).slice(0, 5);

  const getQ = (t, qVal) => t.quadrant === qVal || (!t.quadrant && qVal === 'Q1 — DO NOW' && t.urgency === 'High' && (t.importance === 'High' || !t.importance));
  const getQ2 = (t) => t.quadrant === 'Q2 — SCHEDULE' || (!t.quadrant && t.urgency !== 'High' && (t.importance === 'High' || !t.importance));
  const getQ3 = (t) => t.quadrant === 'Q3 — DELEGATE' || (!t.quadrant && t.urgency === 'High' && t.importance === 'Low');
  const getQ4 = (t) => t.quadrant === 'Q4 — ELIMINATE' || (!t.quadrant && t.urgency !== 'High' && t.importance === 'Low');

  const q1 = pendingTasks.filter(t => getQ(t, 'Q1 — DO NOW'));
  const q2 = pendingTasks.filter(getQ2);
  const q3 = pendingTasks.filter(getQ3);
  const q4 = pendingTasks.filter(getQ4);

  const quadrants = [
    { q: "Q1 — DO NOW", label: "Urgent & Important", bg: "rgba(239, 68, 68, 0.05)", border: "var(--accent-bhel)", tasks: q1.length > 0 ? q1.map(t => t.title) : ["No urgent tasks"] },
    { q: "Q2 — SCHEDULE", label: "Important, Not Urgent", bg: "rgba(16, 185, 129, 0.05)", border: "var(--accent-academic)", tasks: q2.length > 0 ? q2.map(t => t.title) : ["No scheduled tasks"] },
    { q: "Q3 — DELEGATE", label: "Urgent, Not Important", bg: "rgba(249, 115, 22, 0.05)", border: "var(--accent-intimus)", tasks: q3.length > 0 ? q3.map(t => t.title) : ["Nothing to delegate"] },
    { q: "Q4 — ELIMINATE", label: "Not Urgent/Important", bg: "rgba(100, 116, 139, 0.05)", border: "var(--text-tertiary)", tasks: q4.length > 0 ? q4.map(t => t.title) : ["Clear inbox"] },
  ];

  return (
    <div className="page-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            Good Morning, Santosh <span className="emoji-large" aria-hidden="true">🌅</span>
          </h1>
          <p className="dashboard-subtitle">
            AI-curated Daily Briefing • <strong>{energyLevel} Energy Mode</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button 
            onClick={onRecalculate}
            className="glass-button"
            aria-label="Recalculate AI Priorities"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600 }}
          >
            <RefreshCw size={14} aria-hidden="true" /> Recalculate AI
          </button>
          
          <div className="glass-panel stats-panel" role="status" aria-label="Task Status">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-bhel)' }}>{q1.length}</div>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Urgent</div>
            </div>
            <div style={{ width: 1, height: 24, background: 'var(--border-color)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-academic)' }}>{pendingTasks.length}</div>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Pending</div>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-grid">
        <section aria-labelledby="top-actions-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Zap color="var(--accent-intimus)" size={20} aria-hidden="true" />
            <h2 id="top-actions-title" style={{ fontSize: 18, fontWeight: 600 }}>Top Recommended Actions</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {displayTopTasks.length > 0 ? (
              displayTopTasks.map((task, i) => (
                <TaskItem key={task.id} task={task} index={i} onStart={handleStartTask} />
              ))
            ) : (
              <div style={{ color: 'var(--text-tertiary)', padding: 16, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 12, textAlign: 'center' }}>
                All caught up! Add tasks using the Quick Capture FAB.
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 40, marginBottom: 20 }}>
            <TrendingUp color="var(--accent-ai)" size={20} aria-hidden="true" />
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>AI Priority Matrix</h2>
          </div>

          <div className="matrix-grid">
            {quadrants.map((q, i) => (
              <GlassCard 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                style={{ borderTop: `3px solid ${q.border}`, padding: 20, background: q.bg }}
              >
                <div style={{ fontSize: 10, fontWeight: 600, color: q.border, textTransform: 'uppercase', marginBottom: 4 }}>{q.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>{q.q}</div>
                <ul style={{ paddingLeft: 16, margin: 0, color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.6 }}>
                  {q.tasks.map((t, j) => <li key={j} style={{ marginBottom: 4 }}>{t}</li>)}
                </ul>
              </GlassCard>
            ))}
          </div>
        </section>

        <aside aria-label="AI Insights and Alerts">
          <GlassCard style={{ padding: 24, background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Brain color="var(--accent-ai)" size={24} aria-hidden="true" />
              <h3 style={{ fontSize: 15, margin: 0 }}>Brain Insight</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
              {aiInsight || "No custom briefing insight generated. Perform check-in or Recalculate to generate tailored feedback."}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontSize: 10, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 12 }}>Context Switching</span>
              <span style={{ fontSize: 10, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 12 }}>{energyLevel} Energy</span>
            </div>
          </GlassCard>

          <GlassCard style={{ padding: 24, marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <AlertTriangle color="var(--accent-bhel)" size={20} aria-hidden="true" />
              <h3 style={{ fontSize: 15, margin: 0 }}>Radar Alerts</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {pendingTasks.filter(t => t.urgency === 'High').slice(0, 2).map((t, idx) => (
                <div key={t.id}>
                  {idx > 0 && <div style={{ width: '100%', height: 1, background: 'var(--border-color)', margin: '12px 0' }} />}
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>{t.domain} Domain • High Urgency</div>
                </div>
              ))}
              {pendingTasks.filter(t => t.urgency === 'High').length === 0 && (
                <div style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>No high urgency radar alerts pending.</div>
              )}
            </div>
          </GlassCard>
        </aside>
      </div>

      <TaskDetailsModal 
        isOpen={!!selectedTask} 
        task={selectedTask} 
        onClose={() => setSelectedTask(null)} 
        onComplete={handleCompleteTask}
        onRevert={handleRevertTask}
      />
    </div>
  );
}
