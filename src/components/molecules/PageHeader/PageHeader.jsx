import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';

const PageHeader = ({ title }) => {
  const navigate = useNavigate();

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '1px solid #DDDDDD',
    background: 'white',
    cursor: 'pointer',
    padding: 0,
    transition: 'all 0.2s ease'
  };

  const handleHover = (e) => {
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
    e.currentTarget.style.transform = 'scale(1.05)';
  };

  const handleOut = (e) => {
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.transform = 'scale(1)';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button 
          onClick={() => navigate(-1)}
          style={buttonStyle}
          onMouseOver={handleHover}
          onMouseOut={handleOut}
          title="Go Back"
        >
          <ChevronLeft size={24} color="#222" />
        </button>
        <h1 className="page-title" style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#222', letterSpacing: '-0.5px' }}>
          {title}
        </h1>
      </div>
      
      <button 
        onClick={() => navigate('/')}
        style={{
          background: 'white',
          border: '1px solid #DDDDDD',
          borderRadius: '24px',
          padding: '8px 16px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '14px',
          color: '#222',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
          e.currentTarget.style.transform = 'scale(1.02)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        Back to home
      </button>
    </div>
  );
};

export default PageHeader;
