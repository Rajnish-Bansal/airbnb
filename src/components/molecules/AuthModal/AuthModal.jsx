import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  
  const { requestOtp, confirmOtp, loginWithGoogle, loading, error, closeAuthModal } = useAuth();

  const googleLoginHandler = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userData = await loginWithGoogle({ credential: tokenResponse.access_token, isAccessToken: true });
        if (userData && onClose) {
          onClose(userData);
        }
      } catch (err) {
        console.error("Google login service failure:", err);
      }
    },
    onError: (error) => console.log('Login Failed:', error)
  });

  if (!isOpen) return null;

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    try {
      await requestOtp(phoneNumber);
      setStep(2);
    } catch (err) {
      console.error("Failed to request OTP:", err);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) return;
    
    try {
      const userData = await confirmOtp(phoneNumber, otp);
      if (userData && onClose) {
        onClose(userData);
      }
    } catch (err) {
      console.error("OTP verification failed:", err);
    }
  };

  const handleGoogleLogin = () => {
    googleLoginHandler();
  };

  return (
    <div className="auth-modal-overlay" onClick={() => closeAuthModal()}>
      <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
        <div className="auth-header" style={{ position: 'relative', justifyContent: 'center' }}>
           <h3>{step === 1 ? 'Log in or sign up' : 'Confirm your number'}</h3>
           <button className="close-btn" style={{ position: 'absolute', right: '16px' }} onClick={() => closeAuthModal()}>✕</button>
        </div>
        
        <div className="auth-body">
           {error && <div className="auth-error-message">{error}</div>}

           {step === 1 ? (
              <>
                <h2 className="auth-welcome">Welcome to Hostify</h2>
                <form onSubmit={handlePhoneSubmit}>
                   <div className="input-group">
                      <div className="phone-input-wrapper">
                        <div className="phone-prefix">
                           <span className="country-code">India (+91)</span>
                        </div>
                        <input 
                          type="tel" 
                          placeholder="Phone number" 
                          value={phoneNumber}
                          onChange={e => setPhoneNumber(e.target.value)}
                          className="auth-input phone-input"
                          autoFocus
                        />
                      </div>
                   </div>
                   
                   <p className="auth-disclaimer">
                     We'll call or text you to confirm your number. Standard message and data rates apply. <strong>Privacy Policy</strong>
                   </p>

                   <button type="submit" className="auth-submit-btn" disabled={loading}>
                     {loading ? 'Sending...' : 'Continue'}
                   </button>
                </form>

                <div className="auth-divider">or</div>
                
                <div className="social-buttons">
                   <button className="social-btn google-btn" onClick={handleGoogleLogin}>
                      <svg width="18" height="18" viewBox="0 0 18 18">
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184L12.048 13.56c-.413.275-.94.437-1.548.437-1.192 0-2.201-.805-2.56-1.888H4.975V14.31C6.459 16.518 9.1 18 9 18z" fill="#34A853"/>
                        <path d="M6.44 12.112c-.09-.275-.141-.568-.141-.872s.051-.597.141-.872V8.112H4.975c-.308.613-.485 1.303-.485 2.038s.177 1.425.485 2.038l1.465-2.076z" fill="#FBBC05"/>
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 6.459 0 3.818 1.482 2.333 3.69l1.465 2.076c.359-1.083 1.368-1.888 2.56-1.888z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                   </button>
                </div>
              </>
           ) : (
              <>
                <p className="otp-instruction">Enter the 6-digit code we sent to {phoneNumber}</p>
                <form onSubmit={handleOtpSubmit}>
                   <div className="input-group">
                      <input 
                        type="text" 
                        maxLength="6"
                        placeholder="- - - - - -" 
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        className="auth-input otp-input"
                        autoFocus
                      />
                   </div>
                   
                   <button type="submit" className="auth-submit-btn" disabled={loading} style={{ marginTop: '20px' }}>
                     {loading ? 'Verifying...' : 'Verify & Continue'}
                   </button>

                   <div className="resend-otp" onClick={() => setStep(1)} style={{ marginTop: '16px', textAlign: 'center', cursor: 'pointer', color: '#222', fontWeight: '600', textDecoration: 'underline' }}>
                      Back to phone number
                   </div>
                </form>
              </>
           )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
