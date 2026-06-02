import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettingsContext = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [typography, setTypography] = useState(() => {
    const saved = localStorage.getItem('myradar_settings');
    const settings = saved ? JSON.parse(saved) : {};
    return {
      fontSize: settings.fontSize || 'Medium',
      fontStyle: settings.fontStyle || 'Modern Sans'
    };
  });

  useEffect(() => {
    const handleSettingsChange = () => {
      const saved = localStorage.getItem('myradar_settings');
      const settings = saved ? JSON.parse(saved) : {};
      setTypography({
        fontSize: settings.fontSize || 'Medium',
        fontStyle: settings.fontStyle || 'Modern Sans'
      });
    };

    window.addEventListener('myradar-settings-changed', handleSettingsChange);
    return () => {
      window.removeEventListener('myradar-settings-changed', handleSettingsChange);
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ typography, setTypography }}>
      {children}
    </SettingsContext.Provider>
  );
};
