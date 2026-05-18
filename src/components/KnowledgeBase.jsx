import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Download, ChevronRight } from 'lucide-react';

const initialDocs = [
  { id: 1, title: 'Hindi Admin Note (Standard)', domain: 'BHEL', tags: ['Draft', 'Official', 'Hindi'], content: 'विषय: ...\n\nमहोदय,\nउपरोक्त विषय के संदर्भ में अवगत कराना है कि...' },
  { id: 2, title: 'AC Disposal Note Format', domain: 'BHEL', tags: ['Draft', 'Accounts', 'Disposal'], content: 'Note for Approval\n\nSub: Proposal for disposal of unserviceable AC units...' },
  { id: 3, title: 'Guest House Booking SOP', domain: 'BHEL', tags: ['SOP', 'Estate'], content: '1. Receive booking request via email.\n2. Verify eligibility...\n3. Check availability in register.' },
  { id: 4, title: 'Intimus Client Onboarding', domain: 'Intimus', tags: ['SOP', 'Client'], content: '1. Send welcome email with questionnaire.\n2. Setup Slack channel...\n3. Initial consultation call.' },
  { id: 5, title: 'Himalayan Trek Gear List', domain: 'Trekking', tags: ['Checklist', 'Gear'], content: '- Down jacket\n- Thermal inners\n- Trekking poles\n- 60L Rucksack...' },
];

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);

  const filteredDocs = initialDocs.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    doc.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, marginBottom: 8, fontWeight: 700 }}>Knowledge Base</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Your SOPs, drafts, and templates. Search to instantly pull up what you need.
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} size={20} />
        <input 
          type="text" 
          placeholder="Search for 'Disposal Note' or 'Hindi'..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%', padding: '16px 16px 16px 48px', borderRadius: 12,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'white', fontSize: 16, outline: 'none'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 24, flex: 1, minHeight: 0 }}>
        {/* Document List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 8 }}>
          {filteredDocs.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedDoc(doc)}
              className="glass-panel"
              style={{
                padding: 16, cursor: 'pointer', 
                border: selectedDoc?.id === doc.id ? '1px solid var(--accent-ai)' : '1px solid rgba(255,255,255,0.1)',
                background: selectedDoc?.id === doc.id ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span className="domain-pill" style={{ fontSize: 11, padding: '2px 8px' }}>{doc.domain}</span>
                <ChevronRight size={16} color="var(--text-tertiary)" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>{doc.title}</h3>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {doc.tags.map(tag => (
                  <span key={tag} style={{ fontSize: 11, color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
          {filteredDocs.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>
              No documents found matching "{searchQuery}"
            </div>
          )}
        </div>

        {/* Document Viewer */}
        <div className="glass-panel" style={{ flex: 1.5, padding: 24, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {selectedDoc ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDoc.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px 0' }}>{selectedDoc.title}</h2>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Domain: {selectedDoc.domain}</div>
                  </div>
                  <button className="glass-button" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8 }}>
                    <Download size={14} /> Copy Text
                  </button>
                </div>
                <div style={{ width: '100%', height: 1, background: 'var(--border-color)', marginBottom: 24 }} />
                <pre style={{ 
                  whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 14, 
                  lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 
                }}>
                  {selectedDoc.content}
                </pre>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)', opacity: 0.5 }}>
              <FileText size={48} style={{ marginBottom: 16 }} />
              <p>Select a document to view its contents.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
