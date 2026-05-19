import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Award, FileText, AlertCircle, Copy, Check, HelpCircle, Loader2 } from 'lucide-react';
import { ai } from '../services/ai';

const initialGoals = {
  BHEL: 'Complete disposal of 56 unserviceable AC units',
  Intimus: 'Acquire 3 new MSME clients in NCR',
  Academic: 'Solve 10 marketing case studies for EMBA prep',
  Trekking: 'Walk 10,000 steps daily for altitude training',
  'AI & Tech': 'Build and deploy myRADAR Phase 2',
};

// Hindi note drafting templates and helper
const hindiTemplates = {
  disposal: {
    label: 'AC/Asset Disposal',
    hindi: (brief) => `विषय: अनुपयोगी एयर कंडीशनरों (AC) के निपटान (Disposal) की स्वीकृति हेतु प्रस्ताव।\n\nमहोदय,\nसविनय निवेदन है कि हमारे कार्यालय/गेस्ट हाउस परिसर में पिछले कई वर्षों से लगभग ${brief || '५६'} अनुपयोगी एयर कंडीशनर (AC) स्टोर में रखे हुए हैं। तकनीकी टीम द्वारा निरीक्षण के उपरांत इन्हें पूरी तरह से अनुपयोगी घोषित कर दिया गया है। ये उपकरण अनावश्यक रूप से मूल्यवान स्थान घेर रहे हैं।\n\nअतः आपसे अनुरोध है कि उक्त अनुपयोगी संपत्तियों के उचित निपटान (Disposal) हेतु निविदा प्रक्रिया (Tendering) शुरू करने की स्वीकृति प्रदान करने की कृपा करें।\n\nभवदीय,\nसंतोष कुमार\nउप अभियंता (Estate)`
  },
  payment: {
    label: 'Vendor Payment Release',
    hindi: (brief) => `विषय: मेसर्स सहगल इलेक्ट्रिकल्स के लंबित भुगतान को जारी करने के संबंध में।\n\nमहोदय,\nअवगत कराना है कि मेसर्स सहगल इलेक्ट्रिकल्स द्वारा हमारे गेस्ट हाउस में किए गए विद्युत मरम्मत कार्य का बिल प्राप्त हुआ है। कार्य का भौतिक सत्यापन संबंधित कनिष्ठ अभियंता द्वारा सफलतापूर्वक कर लिया गया है और कार्य संतोषजनक पाया गया है।\n\nअतः अनुबंध की शर्तों के अनुसार, उक्त कार्य के लिए लंबित राशि ${brief || 'रु. ४५,०००/-'} का भुगतान वेंडर को जारी करने की संस्तुति की जाती है। वित्तीय स्वीकृति प्रदान करने की कृपा करें।\n\nभवदीय,\nसंतोष कुमार\nउप अभियंता (Estate)`
  },
  approval: {
    label: 'General Sanction Request',
    hindi: (brief) => `विषय: ${brief || 'विद्युत सामग्री की खरीद'} हेतु प्रशासनिक एवं वित्तीय स्वीकृति के संबंध में।\n\nमहोदय,\nउपरोक्त विषय के संदर्भ में अवगत कराना है कि कार्यालय के सुचारू संचालन हेतु निम्नलिखित वस्तुओं/कार्यों की तत्काल आवश्यकता है। अनुमानित लागत लगभग ${brief || 'रु. २५,०००/-'} है जिसका विवरण फाइल में संलग्न है।\n\nअतः विभाग हित में उक्त सामग्री की खरीद हेतु आवश्यक प्रशासनिक एवं वित्तीय स्वीकृति प्रदान करने की कृपा करें।\n\nभवदीय,\nसंतोष कुमार\nउप अभियंता (Estate)`
  }
};

export default function AIPriorities({ tasks, energyLevel }) {
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('myradar_goals');
    return saved ? JSON.parse(saved) : initialGoals;
  });
  
  const [editingDomain, setEditingDomain] = useState(null);
  const [goalInput, setGoalInput] = useState('');
  
  // Hindi Note Generator State
  const [briefInput, setBriefInput] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('disposal');
  const [draftedHindi, setDraftedHindi] = useState('');
  const [copied, setCopied] = useState(false);

  // AI Chat Assistant State
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Procrastination state
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  
  const handleSaveGoal = (domain) => {
    const updated = { ...goals, [domain]: goalInput };
    setGoals(updated);
    localStorage.setItem('myradar_goals', JSON.stringify(updated));
    setEditingDomain(null);
  };

  const generateHindiNote = () => {
    if (!briefInput.trim()) {
      setDraftedHindi(hindiTemplates[selectedTemplate].hindi(''));
    } else {
      setDraftedHindi(hindiTemplates[selectedTemplate].hindi(briefInput));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draftedHindi);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAskAIChat = async (e) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    setChatLoading(true);
    setChatResponse('');
    try {
      const savedSettings = localStorage.getItem('myradar_settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      const res = await ai.askAIChat(chatQuery, tasks, settings, energyLevel);
      setChatResponse(res);
    } catch (err) {
      setChatResponse("Failed to connect to the AI Assistant. Check your API Key in Settings.");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h1 style={{ fontSize: 32, marginBottom: 8, fontWeight: 700 }}>AI Priorities (Brain)</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Personalized guidance, automated admin note drafting, and goal trackers.
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Left Column: Goals, Chat, & Procrastination */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Goal Alignment */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Award color="var(--accent-academic)" size={24} />
              <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Active Monthly Goals</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Object.entries(goals).map(([domain, goal]) => (
                <div key={domain} style={{ paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)' }}>{domain}</span>
                    {editingDomain === domain ? (
                      <button 
                        onClick={() => handleSaveGoal(domain)}
                        style={{ fontSize: 11, color: '#3fb950', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      >
                        Save
                      </button>
                    ) : (
                      <button 
                        onClick={() => { setEditingDomain(domain); setGoalInput(goal); }}
                        style={{ fontSize: 11, color: 'var(--accent-ai)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  {editingDomain === domain ? (
                    <input 
                      type="text" 
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      style={{
                        width: '100%', padding: '8px 12px', borderRadius: 8,
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white', fontSize: 13, outline: 'none'
                      }}
                    />
                  ) : (
                    <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)' }}>{goal || 'No goal set yet.'}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive AI Query: What should I do now? */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <HelpCircle color="var(--accent-ai)" size={24} />
              <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>What should I do now?</h2>
            </div>
            
            <form onSubmit={handleAskAIChat} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
                Query your Second Brain dynamically in plain language.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <input
                  type="text"
                  placeholder="e.g. I have 30 mins and low energy, what should I start?"
                  value={chatQuery}
                  onChange={e => setChatQuery(e.target.value)}
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', fontSize: 13, outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatQuery.trim()}
                  style={{
                    padding: '0 16px', borderRadius: 10,
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    color: 'white', fontWeight: 600, fontSize: 13, border: 'none',
                    display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer'
                  }}
                >
                  {chatLoading ? <Loader2 className="spinning" size={14} /> : 'Ask'}
                </button>
              </div>
              
              <AnimatePresence>
                {chatResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
                      fontSize: 13, lineHeight: 1.6
                    }}
                  >
                    {chatResponse}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* Procrastination Detector */}
          <div className="glass-panel" style={{ padding: 24, background: 'rgba(239, 68, 68, 0.02)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <AlertCircle color="#ef4444" size={24} />
              <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Procrastination Detector</h2>
            </div>
            
            {pendingTasks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
                  The following tasks have been sitting in your queue. Here are recommended micro-actions to break the ice:
                </p>
                {pendingTasks.slice(0, 2).map(task => (
                  <div key={task.id} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: 14, borderLeft: `3px solid ${task.domainColor}` }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{task.title}</div>
                    <div style={{ fontSize: 12, color: '#f0883e', display: 'flex', alignItems: 'center', gap: 4 }}>
                      💡 Recommended first step: {task.microAction || "spend just 5 minutes writing the title / opening email draft."}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: 13 }}>No pending tasks to analyze! You're completely focused.</p>
            )}
          </div>
        </div>

        {/* Right Column: Hindi Admin Note Generator */}
        <div>
          <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <FileText color="var(--accent-bhel)" size={24} />
              <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>BHEL Hindi Admin Note Generator</h2>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
              Convert English briefs into standard BHEL Hindi official drafts instantly.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>Select Template Type</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.entries(hindiTemplates).map(([key, temp]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTemplate(key)}
                    style={{
                      padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 600,
                      background: selectedTemplate === key ? 'var(--accent-bhel)' : 'rgba(255,255,255,0.05)',
                      color: selectedTemplate === key ? 'white' : 'var(--text-secondary)'
                    }}
                  >
                    {temp.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>Brief Parameters (e.g. "56 AC units", "Flat D1", "Rs. 45,000")</label>
              <input
                type="text"
                value={briefInput}
                onChange={(e) => setBriefInput(e.target.value)}
                placeholder="Type specific values to insert into note..."
                style={{
                  width: '100%', padding: 12, borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', fontSize: 14, outline: 'none'
                }}
              />
            </div>

            <button
              onClick={generateHindiNote}
              style={{
                width: '100%', padding: '12px 0', borderRadius: 12,
                background: 'linear-gradient(135deg, #ef4444, #f97316)',
                color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer'
              }}
            >
              Draft Hindi Note 📝
            </button>

            <AnimatePresence>
              {draftedHindi && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Hindi Draft Output:</span>
                    <button 
                      onClick={handleCopy}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: 12, color: copied ? '#3fb950' : 'var(--text-secondary)',
                        background: 'transparent', border: 'none', cursor: 'pointer'
                      }}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy Text'}
                    </button>
                  </div>
                  <pre style={{
                    whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13,
                    lineHeight: 1.6, color: '#e6edf3', background: 'rgba(0,0,0,0.2)',
                    padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)',
                    margin: 0
                  }}>
                    {draftedHindi}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
