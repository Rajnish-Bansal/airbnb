import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/organisms/Navbar/Navbar';
import './Auth.css';
import bgImage from '../../assets/goa.png'; // Using Goa image for background

const Signup = () => {
  const navigate = useNavigate();
  const { login, allUsers } = useAuth();
  
  // State for inputs
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  // State for logic
  const [isPhone, setIsPhone] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Detect input type
  useEffect(() => {
    // Simple regex for phone (digits only, 10 chars) - flexible for generic input
    const phoneRegex = /^[0-9]{10}$/; 
    setIsPhone(phoneRegex.test(identifier));
  }, [identifier]);

  const handleSendOtp = () => {
    if (!identifier) return;
    setLoading(true);
    // Simulate OTP API call
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      alert(`OTP sent to ${identifier} (Simulated: 1234)`);
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!identifier) return;

    if (isPhone && !otp) {
      alert("Please enter the OTP");
      return;
    }
    if (!isPhone && !password) {
      alert("Please enter a password");
      return;
    }

    setLoading(true);
    
    // Check if user is a host in DB (Simulated - technically a signup wouldn't be in DB yet unless pre-approved)
    const emailToUse = isPhone ? null : identifier;
    const userInDb = allUsers?.find(u => u.email === emailToUse);
    const isHost = userInDb?.role === 'Host';

    // Simulate API call and login
    setTimeout(() => {
       const userData = { 
           email: emailToUse, 
           phone: isPhone ? identifier : null,
           name: "New User",
           isHost: isHost
       };
       login(userData);
       setLoading(false);

       if (isHost) {
          navigate('/become-a-host');
       } else {
          navigate('/');
       }
    }, 1500);
  };

  return (
    <>
      <Navbar />
      <div className="auth-page-container" style={{ 
        backgroundImage: `url(${bgImage})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        {/* Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)', // Dark overlay
          backdropFilter: 'blur(4px)', // Glass blur
          zIndex: 0
        }}></div>

        <div className="auth-card" style={{ position: 'relative', zIndex: 1 }}>
          <div className="auth-header">
             <h3>Sign up</h3>
          </div>
          
          <div className="auth-body">
             <h2 className="auth-welcome">Welcome to Airbnb</h2>
             
             <form onSubmit={handleSubmit}>
                <div className="input-group">
                   <input 
                     type="text" 
                     placeholder="Email or Phone Number" 
                     value={identifier}
                     onChange={e => setIdentifier(e.target.value)}
                     className={`auth-input ${((!isPhone && identifier.length > 0) || (isPhone && otpSent)) ? 'top' : 'single'}`}
                   />
                   
                   {/* Logic for Email -> Password */}
                   {!isPhone && identifier.length > 0 && (
                       <input 
                         type="password" 
                         placeholder="Password" 
                         value={password}
                         onChange={e => setPassword(e.target.value)}
                         className="auth-input bottom"
                       />
                   )}

                   {/* Logic for Phone -> OTP */}
                   {isPhone && otpSent && (
                       <input 
                         type="text" 
                         placeholder="Enter OTP (1234)" 
                         value={otp}
                         onChange={e => setOtp(e.target.value)}
                         className="auth-input bottom"
                       />
                   )}
                </div>

                {isPhone && !otpSent ? (
                   <button 
                      type="button" 
                      onClick={handleSendOtp} 
                      className="auth-submit-btn"
                      disabled={loading || identifier.length < 10}
                      style={{ marginTop: '16px' }}
                   >
                      {loading ? 'Sending...' : 'Continue'}
                   </button>
                ) : (
                   <button 
                      type="submit" 
                      className="auth-submit-btn"
                      disabled={loading || (!password && !otp)}
                      style={{ marginTop: '16px' }}
                   >
                      {loading ? 'Processing...' : 'Agree and continue'}
                   </button>
                )}
                
                <p className="auth-disclaimer">
                  We'll call or text you to confirm your number. Standard message and data rates apply. Privacy Policy
                </p>
             </form>
             
             <div className="auth-divider">or</div>
             
             <div className="social-buttons">
                <button className="social-btn">Continue with Facebook</button>
                <button className="social-btn">Continue with Google</button>
                <button className="social-btn">Continue with Apple</button>
             </div>
             
             <div className="auth-switch">
                Already have an account? <Link to="/login">Log in</Link>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
