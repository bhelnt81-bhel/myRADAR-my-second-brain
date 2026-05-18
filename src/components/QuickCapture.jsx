import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Camera, Loader2 } from 'lucide-react';

export default function QuickCapture({ isOpen, onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('BHEL');
  const [urgency, setUrgency] = useState('Medium');
  const [energy, setEnergy] = useState('Medium');
  const [time, setTime] = useState('30m');

  const [isListening, setIsListening] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

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

  // Web Speech API Voice capture
  const handleVoiceCapture = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice dictation is not supported in this browser. Please try Chrome/Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Indian English / Hindustani accent support
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setTitle(speechToText);
      
      // Smart Heuristics: Auto-detect domain
      const text = speechToText.toLowerCase();
      if (text.includes('bhel') || text.includes('ac') || text.includes('disposal') || text.includes('office')) {
        setDomain('BHEL');
        setUrgency('High');
      } else if (text.includes('intimus') || text.includes('client') || text.includes('work') || text.includes('website')) {
        setDomain('Intimus');
      } else if (text.includes('study') || text.includes('academic') || text.includes('emba') || text.includes('case')) {
        setDomain('Academic');
      } else if (text.includes('trek') || text.includes('training') || text.includes('gear')) {
        setDomain('Trekking');
      } else if (text.includes('ai') || text.includes('tech') || text.includes('bot') || text.includes('claude')) {
        setDomain('AI & Tech');
      }
    };

    recognition.onerror = (e) => {
      console.error(e);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Mock Camera OCR Document Scanner
  const handleCameraOCR = () => {
    setIsScanning(true);
    setTimeout(() => {
      // Auto-extract task from a mock BHEL physical circular
      setTitle("Prepare AC fleet disposal note (File Ref: BHEL/EST/2026)");
      setDomain("BHEL");
      setUrgency("High");
      setEnergy("High");
      setTime("45m");
      setIsScanning(false);
    }, 2000);
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
            {/* Loading Overlay for OCR */}
            {isScanning && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(13, 17, 23, 0.9)', zIndex: 10, borderRadius: 16,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16
              }}>
                <Loader2 className="spinning" color="var(--accent-ai)" size={48} />
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white', margin: 0 }}>Scanning Printed BHEL Document...</h3>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>Extracting checklist & action items</p>
              </div>
            )}

            <button 
              onClick={onClose}
              style={{ position: 'absolute', top: 20, right: 20, color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Quick Capture</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Task Title {isListening && <span style={{ color: '#ef4444', fontSize: 11, marginLeft: 8 }}>🔴 Dictating... Speak now</span>}
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input 
                    autoFocus
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    style={{
                      flex: 1, padding: 12, borderRadius: 12,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white', fontSize: 15, outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleVoiceCapture}
                    style={{
                      width: 44, height: 44, borderRadius: 12, border: 'none', cursor: 'pointer',
                      background: isListening ? '#ef4444' : 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                    }}
                    title="Hinglish Voice Capture"
                  >
                    <Mic size={20} className={isListening ? 'pulse' : ''} />
                  </button>
                  <button
                    type="button"
                    onClick={handleCameraOCR}
                    style={{
                      width: 44, height: 44, borderRadius: 12, border: 'none', cursor: 'pointer',
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                    }}
                    title="OCR Document Scanner"
                  >
                    <Camera size={20} />
                  </button>
                </div>
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
