import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HostLanding = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/become-a-host/step1');
  }, [navigate]);

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontSize: '18px', color: '#64748b' }}>
      Directing you to the listing setup...
    </div>
  );
};

export default HostLanding;
