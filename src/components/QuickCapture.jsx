import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function QuickCapture({ isOpen, onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('BHEL');
  const [urgency, setUrgency] = useState('Medium');
  const [energy, setEnergy] = useState('Medium');
  const [time, setTime] = useState('30m');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onAdd({
      title,
      domain,
      urgency,
      energy,
      time,
    });
    
    setTitle('');
    onClose();
  };

  const domains = [
    { id: 'BHEL', color: 'var(--accent-bhel)' },
    { id: 'Intimus', color: 'var(--accent-intimus)' },
    { id: 'Academic', color: 'var(--accent-academic)' },
    { id: 'Trekking', color: 'var(--accent-trek)' },
    { id: 'AI & Tech', color: 'var(--accent-ai)' },
    { id: 'Personal', color: '#ec4899' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="glass-panel"
            style={{ width: '100%', maxWidth: 500, padding: 24, position: 'relative' }}
          >
            <button 
              onClick={onClose}
              style={{ position: 'absolute', top: 20, right: 20, color: 'var(--text-secondary)' }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Quick Capture</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Task Title</label>
                <input 
                  autoFocus
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  style={{
                    width: '100%', padding: 12, borderRadius: 12,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', fontSize: 15, outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Domain</label>
                  <select 
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                    style={{
                      width: '100%', padding: 12, borderRadius: 12,
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white', fontSize: 14, outline: 'none',
                      appearance: 'none'
                    }}
                  >
                    {domains.map(d => <option key={d.id} value={d.id}>{d.id}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Time Estimate</label>
                  <input 
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    placeholder="e.g. 30m, 2h"
                    style={{
                      width: '100%', padding: 12, borderRadius: 12,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white', fontSize: 14, outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Urgency</label>
                  <select 
                    value={urgency}
                    onChange={e => setUrgency(e.target.value)}
                    style={{
                      width: '100%', padding: 12, borderRadius: 12,
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white', fontSize: 14, outline: 'none',
                      appearance: 'none'
                    }}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Energy Level</label>
                  <select 
                    value={energy}
                    onChange={e => setEnergy(e.target.value)}
                    style={{
                      width: '100%', padding: 12, borderRadius: 12,
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white', fontSize: 14, outline: 'none',
                      appearance: 'none'
                    }}
                  >
                    <option value="High">High Energy</option>
                    <option value="Medium">Medium Energy</option>
                    <option value="Low">Low Energy</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                style={{
                  width: '100%', padding: '14px 0', marginTop: 16,
                  borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  color: 'white', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer'
                }}
              >
                Add Task
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
