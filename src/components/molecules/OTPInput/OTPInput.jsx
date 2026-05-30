import React, { useState, useRef, useEffect } from 'react';
import './OTPInput.css';

const OTPInput = ({ length = 6, value = '', onChange, onComplete }) => {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    // Sync external value to internal state
    if (value) {
      const valArray = value.split('').slice(0, length);
      const newOtp = Array(length).fill('');
      valArray.forEach((char, i) => {
        newOtp[i] = char;
      });
      setOtp(newOtp);
    } else {
      setOtp(Array(length).fill(''));
    }
  }, [value, length]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newOtp = [...otp];
    // Take the last character entered
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);
    
    const combinedOtp = newOtp.join('');
    if (onChange) onChange(combinedOtp);

    // Auto-focus next input
    if (val && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    if (combinedOtp.length === length && onComplete) {
      onComplete(combinedOtp);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current is empty, focus previous
        inputRefs.current[index - 1].focus();
      } else {
        // Clear current
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        const combinedOtp = newOtp.join('');
        if (onChange) onChange(combinedOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < length; i++) {
      if (i < pastedData.length) {
        newOtp[i] = pastedData[i];
      }
    }
    setOtp(newOtp);
    const combinedOtp = newOtp.join('');
    if (onChange) onChange(combinedOtp);

    if (combinedOtp.length === length && onComplete) {
      onComplete(combinedOtp);
    }

    // Focus last filled input or next empty
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex].focus();
  };

  return (
    <div className="otp-input-container">
      {otp.map((data, index) => (
        <input
          key={index}
          type="text"
          maxLength="1"
          ref={ref => (inputRefs.current[index] = ref)}
          value={data}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className={`otp-box ${data ? 'filled' : ''}`}
        />
      ))}
    </div>
  );
};

export default OTPInput;
