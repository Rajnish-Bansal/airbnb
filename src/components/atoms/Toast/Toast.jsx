import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ notification, onClear }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClear();
      }, 5000); // Clear after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [notification, onClear]);

  if (!notification) return null;

  return (
    <div className={`toast-container ${notification.type}`}>
      <div className="toast-content">
        <span className="toast-icon">
          {notification.type === 'error' ? '⚠️' : '✅'}
        </span>
        <span className="toast-message">{notification.message}</span>
      </div>
      <button className="toast-close" onClick={onClear}>&times;</button>
    </div>
  );
};

export default Toast;
