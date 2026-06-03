import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, CheckCircle2, RotateCcw, ListTree, Loader2 } from 'lucide-react';
import { Badge } from './ui/Badge';
import { ai } from '../services/ai';
import { useTasksContext } from '../context/TaskContext';

export default function TaskDetailsModal({ isOpen, task, onClose, onComplete, onRevert }) {
  const [duration, setDuration] = useState(25); // 25 or 45
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  
  const endTimeRef = useRef(null);
  const wakeLockRef = useRef(null);
  
  const { handleUpdateTaskData } = useTasksContext();

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch (err) {
      console.warn("Wake lock failed", err);
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current !== null) {
      await wakeLockRef.current.release().catch(e => console.warn(e));
      wakeLockRef.current = null;
    }
  };

  useEffect(() => {
    let interval = null;
    if (isActive) {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      }
      requestWakeLock();
      
      interval = setInterval(() => {
        const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          setIsActive(false);
          endTimeRef.current = null;
          releaseWakeLock();
          clearInterval(interval);
        }
      }, 1000);
    } else {
      endTimeRef.current = null;
      releaseWakeLock();
      clearInterval(interval);
    }
    return () => {
      clearInterval(interval);
      releaseWakeLock();
    };
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(duration * 60);
      setIsActive(false);
      endTimeRef.current = null;
    }
  }, [isOpen, task?.id, duration]);

  if (!task) return null;

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); endTimeRef.current = null; setTimeLeft(duration * 60); };
  
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleBreakdown = async () => {
    if (!ai.hasKey()) {
      alert("Please add your Gemini API Key in Settings to use AI Breakdown.");
      return;
    }
    setIsBreakingDown(true);
    try {
      const subtasks = await ai.breakdownTask(task);
      const subtaskObjects = subtasks.map(st => ({ ...st, done: false, id: Date.now() + Math.random() }));
      await handleUpdateTaskData(task.id, { subtasks: subtaskObjects });
    } catch (e) {
      console.error(e);
      alert("Failed to break down task.");
    } finally {
      setIsBreakingDown(false);
    }
  };

  const toggleSubtask = async (subtaskId) => {
    if (!task.subtasks) return;
    const updatedSubtasks = task.subtasks.map(st => st.id === subtaskId ? { ...st, done: !st.done } : st);
    await handleUpdateTaskData(task.id, { subtasks: updatedSubtasks });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="glass-panel"
            style={{ width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', padding: 32, position: 'relative' }}
          >
            <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <Badge color={task.domainColor}>{task.domain}</Badge>
              <Badge color={task.urgency === 'High' ? '#ef4444' : 'var(--text-secondary)'}>{task.urgency} Urgency</Badge>
            </div>
            
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>{task.title}</h2>
            
            {task.microAction && (
              <div style={{ padding: 16, background: 'rgba(239, 136, 62, 0.1)', borderRadius: 12, border: '1px solid rgba(239, 136, 62, 0.2)', marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#f0883e', textTransform: 'uppercase', marginBottom: 4 }}>⚡ AI First Step</div>
                <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{task.microAction}</div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 32, background: 'rgba(255,255,255,0.03)', borderRadius: 16, marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button 
                  onClick={() => { setDuration(25); endTimeRef.current = null; setTimeLeft(25*60); setIsActive(false); }}
                  style={{ padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', background: duration === 25 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)', color: 'white' }}
                >
                  25 min
                </button>
                <button 
                  onClick={() => { setDuration(45); endTimeRef.current = null; setTimeLeft(45*60); setIsActive(false); }}
                  style={{ padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', background: duration === 45 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)', color: 'white' }}
                >
                  45 min
                </button>
              </div>

              <div style={{ fontSize: 64, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '-0.05em', color: isActive ? 'var(--accent-ai)' : 'white' }}>
                {formatTime(timeLeft)}
              </div>
              
              <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                <button onClick={toggleTimer} className="glass-button" aria-label={isActive ? "Pause" : "Play"} style={{ width: 56, height: 56, borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)' }}>
                  {isActive ? <Pause size={24} color="#ef4444" /> : <Play size={24} color="#10b981" style={{ marginLeft: 4 }} />}
                </button>
                <button onClick={resetTimer} className="glass-button" aria-label="Reset Timer" style={{ width: 56, height: 56, borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RotateCcw size={20} color="var(--text-secondary)" />
                </button>
              </div>
            </div>

            {/* Subtasks Section */}
            <div style={{ marginBottom: 24 }}>
              {task.subtasks && task.subtasks.length > 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ListTree size={16} color="var(--text-secondary)" /> Task Breakdown
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {task.subtasks.map(st => (
                      <label key={st.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={st.done} 
                          onChange={() => toggleSubtask(st.id)}
                          style={{ marginTop: 2, accentColor: 'var(--accent-ai)', width: 16, height: 16 }}
                        />
                        <span style={{ fontSize: 14, color: st.done ? 'var(--text-tertiary)' : 'var(--text-primary)', textDecoration: st.done ? 'line-through' : 'none' }}>
                          {st.title}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleBreakdown}
                  disabled={isBreakingDown}
                  className="glass-button"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {isBreakingDown ? (
                    <><Loader2 className="spinning" size={16} /> Breaking down with AI...</>
                  ) : (
                    <><ListTree size={16} /> AI Task Breakdown</>
                  )}
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              {onRevert && (
                <button 
                  onClick={() => onRevert(task.id)}
                  style={{ flex: 1, padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 600, fontSize: 14, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
                >
                  Revert to Pending
                </button>
              )}
              <button 
                onClick={() => onComplete(task.id)}
                style={{ flex: 2, padding: 16, borderRadius: 12, background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: 'none', cursor: 'pointer' }}
              >
                <CheckCircle2 size={20} /> Mark Complete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
