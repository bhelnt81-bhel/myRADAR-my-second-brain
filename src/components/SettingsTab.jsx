import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Database, Send, Clock, User } from 'lucide-react';

const initialSettings = {
  userName: 'Santosh Kumar',
  userRole: 'Deputy Engineer (Estate)',
  sheetUrl: '',
  telegramToken: '',
  telegramChatId: '',
  workHourStart: '09:00',
  workHourEnd: '18:00',
  fontSize: 'Medium',
  fontStyle: 'Modern Sans',
};

export default function SettingsTab() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('myradar_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('myradar_settings', JSON.stringify(settings));
    setSavedMessage(true);
    
    // Dispatch a custom event to notify App.jsx of settings update in real-time
    window.dispatchEvent(new Event('myradar-settings-changed'));
    
    setTimeout(() => setSavedMessage(false), 2000);
  };

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 650, margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: 32, marginBottom: 8, fontWeight: 700 }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Configure your personal OS integrations, databases, and contextual preferences.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* User Profile */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <User color="var(--accent-academic)" size={20} />
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Personal Profile</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>Name</label>
              <input
                type="text"
                value={settings.userName}
                onChange={e => handleChange('userName', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>Role</label>
              <input
                type="text"
                value={settings.userRole}
                onChange={e => handleChange('userRole', e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Database Integration */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Database color="var(--accent-bhel)" size={20} />
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Cloud Database (Google Sheets)</h2>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>Google Sheets Web App URL</label>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={settings.sheetUrl}
              onChange={e => handleChange('sheetUrl', e.target.value)}
              style={inputStyle}
            />
            <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6, marginBottom: 0 }}>
              Insert the deployed Web App URL from your Apps Script to synchronize local storage with the master Google Sheet.
            </p>
          </div>
        </div>

        {/* Telegram Integration */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Send color="var(--accent-ai)" size={20} />
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Telegram Quick Capture</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>Bot API Token</label>
              <input
                type="password"
                placeholder="Ex: 123456789:ABCdefGhI..."
                value={settings.telegramToken}
                onChange={e => handleChange('telegramToken', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>Chat ID / Username</label>
              <input
                type="text"
                placeholder="Ex: 987654321"
                value={settings.telegramChatId}
                onChange={e => handleChange('telegramChatId', e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Context Switching Hours */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Clock color="var(--accent-intimus)" size={20} />
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Context Switcher Hours</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>Work Mode Start (BHEL/Intimus)</label>
              <input
                type="time"
                value={settings.workHourStart}
                onChange={e => handleChange('workHourStart', e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>Work Mode End (Study/Study Mode)</label>
              <input
                type="time"
                value={settings.workHourEnd}
                onChange={e => handleChange('workHourEnd', e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Display & Typography */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Settings color="var(--accent-ai)" size={20} />
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Display & Typography</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>Font Size</label>
              <select
                value={settings.fontSize || 'Medium'}
                onChange={e => handleChange('fontSize', e.target.value)}
                style={inputStyle}
              >
                <option value="Standard">Standard (Slightly Smaller)</option>
                <option value="Medium">Medium (Recommended)</option>
                <option value="Large">Large (High Readability)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>Font Style / Family</label>
              <select
                value={settings.fontStyle || 'Modern Sans'}
                onChange={e => handleChange('fontStyle', e.target.value)}
                style={inputStyle}
              >
                <option value="Modern Sans">Modern Sans (Inter)</option>
                <option value="Classic Serif">Classic Serif (Georgia)</option>
                <option value="High Contrast Slab">High Contrast Slab (Outfit)</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          style={{
            padding: '14px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}
        >
          <Save size={18} /> {savedMessage ? 'Settings Saved Successfully!' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 10,
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  color: 'white', fontSize: 14, outline: 'none'
};
