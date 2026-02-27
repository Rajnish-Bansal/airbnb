import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/organisms/Navbar/Navbar';
import './Auth.css';
import bgImage from '../../assets/goa.png';

const Login = () => {
  const navigate = useNavigate();
  const { login, allUsers } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;

    // Check if user is a host in DB
    const userInDb = allUsers?.find(u => u.email === email);
    const isHost = userInDb?.role === 'Host';

    // Simulate API call and login
    const userData = { email, password, isHost };
    login(userData);
    
    // Redirect to host landing or home
    if (isHost) {
      navigate('/become-a-host');
    } else {
      navigate('/');
    }
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
             <h3>Log in</h3>
          </div>
          
          <div className="auth-body">
             <h2 className="auth-welcome">Welcome back</h2>
             
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
                
                <button type="submit" className="auth-submit-btn">
                  Continue
                </button>
             </form>
             
             <div className="auth-divider">or</div>
             
             <div className="social-buttons">
                <button className="social-btn">Continue with Facebook</button>
                <button className="social-btn">Continue with Google</button>
                <button className="social-btn">Continue with Apple</button>
             </div>
             
             <div className="auth-switch">
                Don't have an account? <Link to="/signup">Sign up</Link>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
