import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Mail } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginWithGoogle, login } = useAuth(); // Assuming useAuth has a generic login or we'll add one
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Update global context with admin user
      login(data.user);
      localStorage.setItem('hostify_token', data.token);
      
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f7f7f7',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '400px', 
        background: 'white', 
        borderRadius: '16px', 
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          background: '#fff0f3', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 24px',
          color: 'var(--primary)'
        }}>
          <Shield size={32} />
        </div>
        
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#222' }}>Admin Portal</h1>
        <p style={{ color: '#717171', marginBottom: '32px' }}>Please sign in to continue</p>

        {error && (
          <div style={{ 
            background: '#fff1f0', 
            border: '1px solid #ffccc7', 
            color: '#ff4d4f', 
            padding: '10px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#717171' }} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 48px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '24px', position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#717171' }} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 48px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <button type="submit" style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(to right, var(--primary), #e61e4d)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div style={{ marginTop: '24px', fontSize: '12px', color: '#999' }}>
          Restricted Access area. Unauthorized access is prohibited.
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
