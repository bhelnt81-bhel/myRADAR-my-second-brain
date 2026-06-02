import React from 'react';

export const Badge = ({ children, color, style = {}, type = 'domain' }) => {
  if (type === 'score') {
    return (
      <span style={{ fontSize: 10, background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', padding: '2px 6px', borderRadius: 10, color: 'white', fontWeight: 700, ...style }}>
        {children}
      </span>
    );
  }

  return (
    <span className="domain-pill" style={{ color: color, background: `${color}20`, padding: '2px 8px', fontSize: 10, ...style }}>
      {children}
    </span>
  );
};
