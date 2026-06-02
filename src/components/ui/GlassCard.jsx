import React from 'react';
import { motion } from 'framer-motion';

export const GlassCard = ({ children, className = '', style = {}, ...props }) => {
  return (
    <motion.div
      className={`glass-panel ${className}`}
      style={{
        padding: 24,
        ...style
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
