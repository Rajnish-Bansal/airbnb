import React, { useState } from 'react';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, mode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // We'll pass the login function from parent or use context directly if wrapped
  // simpler to pass `onLogin` prop for decoupled UI or use hook strictly inside
  
  // Note: For cleaner architecture, let's assume the parent passes the handler
  // But wait, to make it self-contained, I'll use the hook here if I am sure it's inside the provider.
  // It is safe to assume it's used inside App which is wrapped.
  
  // Actually, to avoid circular dependencies or import issues if used outside, 
  // I will emit events, BUT standard react pattern is to use the hook.
  
  // Let's rely on props for the `onComplete` action to keep it reusable.
  
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate
    if (!email || !password) return;
    
    // Simulate API call
    setTimeout(() => {
        // Return dummy data
        const userData = { email, password };
        if (typeof onClose === 'function') onClose(userData); // treat onClose as "Success" with data
    }, 500);
  };

  return (
    <div className="auth-modal-overlay" onClick={() => onClose(null)}>
      <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
        <div className="auth-header" style={{ position: 'relative', justifyContent: 'center' }}>
           <h3>{isLogin ? 'Log in' : 'Sign up'}</h3>
           <button className="close-btn" style={{ position: 'absolute', right: '16px' }} onClick={() => onClose(null)}>✕</button>
        </div>
        
        <div className="auth-body">
           <h2 className="auth-welcome">Welcome to Airbnb</h2>
           
           <form onSubmit={handleSubmit}>
              <div className="input-group">
                 <input 
                   type="email" 
                   placeholder="Email" 
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                   className="auth-input top"
                 />
                 <input 
                   type="password" 
                   placeholder="Password" 
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                   className="auth-input bottom"
                 />
              </div>
              
              <p className="auth-disclaimer">
                We'll call or text you to confirm your number. Standard message and data rates apply. Privacy Policy
              </p>

              <button type="submit" className="auth-submit-btn">
                {isLogin ? 'Continue' : 'Agree and continue'}
              </button>
           </form>
           
           <div className="auth-divider">or</div>
           
           <div className="social-buttons">
              <button className="social-btn">Continue with Facebook</button>
              <button className="social-btn">Continue with Google</button>
              <button className="social-btn">Continue with Apple</button>
           </div>
           
           <div className="auth-switch">
              {isLogin ? (
                 <>Don't have an account? <span onClick={() => setIsLogin(false)}>Sign up</span></>
              ) : (
                 <>Already have an account? <span onClick={() => setIsLogin(true)}>Log in</span></>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
