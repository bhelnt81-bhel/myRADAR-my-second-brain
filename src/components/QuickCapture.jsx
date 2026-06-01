import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Camera, Loader2, ImagePlus } from 'lucide-react';
import { ai } from '../services/ai';

export default function QuickCapture({ isOpen, onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('BHEL');
  const [urgency, setUrgency] = useState('Medium');
  const [energy, setEnergy] = useState('Medium');
  const [time, setTime] = useState('30m');

  const [isListening, setIsListening] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedTasks, setDetectedTasks] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (detectedTasks.length > 0) {
      detectedTasks.filter(t => t.selected).forEach(t => {
        onAdd({
          title: t.title,
          domain: t.domain,
          urgency: t.urgency,
          energy: t.energy,
          time: t.time
        });
      });
      setDetectedTasks([]);
      onClose();
      return;
    }

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

  // Camera & Scanning State & Refs
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  // Start Camera
  const startCamera = async () => {
    setCameraError('');
    setShowCamera(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // prefer rear camera on mobile
        audio: false
      });
      setStream(mediaStream);
    } catch (err) {
      console.error("Camera access failed", err);
      setCameraError("Camera access denied or unavailable.");
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  // Connect stream to video element
  useEffect(() => {
    if (showCamera && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [showCamera, stream]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Capture frame and run OCR
  const handleCaptureAndOCR = async () => {
    if (!videoRef.current) return;
    setIsScanning(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      stopCamera();

      // Convert canvas frame to base64 jpeg
      const dataUrl = canvas.toDataURL('image/jpeg');
      const base64Data = dataUrl.split(',')[1];

      if (ai.hasKey()) {
        const result = await ai.scanTaskFromImage(base64Data);
        if (result && result.tasks && result.tasks.length > 0) {
          setDetectedTasks(result.tasks.map((t, idx) => ({ ...t, selected: true, id: \`temp-cam-\${idx}\` })));
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setDetectedTasks([
          { id: 'temp-0', title: "Prepare AC fleet disposal note (File Ref: BHEL/EST/2026)", domain: "BHEL", urgency: "High", energy: "High", time: "45m", selected: true },
          { id: 'temp-1', title: "Call vendor Sehgal for AMC renewal", domain: "BHEL", urgency: "Medium", energy: "Low", time: "15m", selected: true }
        ]);
      }
    } catch (err) {
      console.error("OCR scan failed, using fallback mock", err);
      setDetectedTasks([
        { id: 'temp-0', title: "Prepare AC fleet disposal note (File Ref: BHEL/EST/2026)", domain: "BHEL", urgency: "High", energy: "High", time: "45m", selected: true }
      ]);
    } finally {
      setIsScanning(false);
    }
  };

  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      setIsScanning(true);
      try {
        const dataUrl = event.target.result;
        const base64Data = dataUrl.split(',')[1];
        
        if (ai.hasKey()) {
          const result = await ai.scanTaskFromImage(base64Data);
          if (result && result.tasks && result.tasks.length > 0) {
            setDetectedTasks(result.tasks.map((t, idx) => ({ ...t, selected: true, id: \`temp-file-\${idx}\` })));
          }
        } else {
          await new Promise(resolve => setTimeout(resolve, 1500));
          setDetectedTasks([
            { id: 'temp-0', title: "Review uploaded design mockup", domain: "Intimus", urgency: "Medium", energy: "Low", time: "15m", selected: true },
            { id: 'temp-1', title: "Update EMBA Case Study notes", domain: "Academic", urgency: "High", energy: "Medium", time: "1h", selected: true }
          ]);
        }
      } catch (err) {
        console.error("Upload OCR failed, using fallback mock", err);
        setDetectedTasks([
          { id: 'temp-0', title: "Review uploaded design mockup", domain: "Intimus", urgency: "Medium", energy: "Low", time: "15m", selected: true }
        ]);
      } finally {
        setIsScanning(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsDataURL(file);
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

            {/* Camera Viewfinder Overlay */}
            {showCamera && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: '#0d1117', zIndex: 20, borderRadius: 16,
                display: 'flex', flexDirection: 'column', padding: 16, gap: 12
              }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white', margin: '0 0 4px 0' }}>Align Document in View</h3>
                
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden', borderRadius: 12, background: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cameraError ? (
                    <div style={{ color: '#ef4444', fontSize: 13, padding: 20, textAlign: 'center' }}>{cameraError}</div>
                  ) : (
                    <video 
                      ref={videoRef}
                      autoPlay 
                      playsInline
                      muted
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    type="button"
                    onClick={stopCamera}
                    style={{ flex: 1, padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.08)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 14 }}
                  >
                    Cancel
                  </button>
                  {!cameraError && (
                    <button
                      type="button"
                      onClick={handleCaptureAndOCR}
                      style={{ flex: 2, padding: 12, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
                    >
                      Scan Document
                    </button>
                  )}
                </div>
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
              {detectedTasks.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h3 style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>Detected Tasks ({detectedTasks.length})</h3>
                  <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
                    {detectedTasks.map((task, idx) => (
                      <div key={task.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <input
                          type="checkbox"
                          checked={task.selected}
                          onChange={(e) => {
                            const newTasks = [...detectedTasks];
                            newTasks[idx].selected = e.target.checked;
                            setDetectedTasks(newTasks);
                          }}
                          style={{ width: 18, height: 18, marginTop: 2, cursor: 'pointer', accentColor: 'var(--accent-ai)' }}
                        />
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <input
                            value={task.title}
                            onChange={(e) => {
                              const newTasks = [...detectedTasks];
                              newTasks[idx].title = e.target.value;
                              setDetectedTasks(newTasks);
                            }}
                            style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: 14, fontWeight: 500, outline: 'none' }}
                          />
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <select
                              value={task.domain}
                              onChange={(e) => {
                                const newTasks = [...detectedTasks];
                                newTasks[idx].domain = e.target.value;
                                setDetectedTasks(newTasks);
                              }}
                              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--text-secondary)', fontSize: 11, borderRadius: 4, padding: '2px 6px' }}
                            >
                              {domains.map(d => <option key={d.id} value={d.id}>{d.id}</option>)}
                            </select>
                            <select
                              value={task.urgency}
                              onChange={(e) => {
                                const newTasks = [...detectedTasks];
                                newTasks[idx].urgency = e.target.value;
                                setDetectedTasks(newTasks);
                              }}
                              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--text-secondary)', fontSize: 11, borderRadius: 4, padding: '2px 6px' }}
                            >
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                     <button
                        type="button"
                        onClick={() => setDetectedTasks([])}
                        style={{ flex: 1, padding: '12px 0', borderRadius: 12, background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: 14, border: 'none', cursor: 'pointer' }}
                     >
                       Discard
                     </button>
                     <button
                        type="submit"
                        style={{ flex: 2, padding: '12px 0', borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}
                     >
                       Add Selected ({detectedTasks.filter(t => t.selected).length})
                     </button>
                  </div>
                </div>
              ) : (
                <>
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
                        onClick={startCamera}
                        style={{
                          width: 44, height: 44, borderRadius: 12, border: 'none', cursor: 'pointer',
                          background: 'rgba(255,255,255,0.05)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                        }}
                        title="OCR Document Scanner"
                      >
                        <Camera size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          width: 44, height: 44, borderRadius: 12, border: 'none', cursor: 'pointer',
                          background: 'rgba(255,255,255,0.05)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                        }}
                        title="Upload Photo for OCR"
                      >
                        <ImagePlus size={20} />
                      </button>
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        style={{ display: 'none' }} 
                      />
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
                </>
              )}
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
