import React, { useState } from 'react';
import Navbar from '../../components/organisms/Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';
import { useHost } from '../../context/HostContext'; // To show listings if host
import { ShieldCheck, Check, Star, User, Phone, Mail, MapPin, Briefcase } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { listings } = useHost();
  const [isEditing, setIsEditing] = useState(false);
  
  // Local state for editing form
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+91 98765 43210',
    bio: user?.bio || 'I love traveling and exploring new places!',
    location: user?.location || 'India',
    rating: user?.rating || '4.8'
  });

  const [verification, setVerification] = useState({
    email: true,
    phone: false // Default to unverified for demo
  });

  const handleVerify = (type) => {
    // Simulate API call
    setTimeout(() => {
      setVerification(prev => ({ ...prev, [type]: true }));
    }, 500);
  };

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="profile-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h2>Please log in to view your profile.</h2>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-grid">
          
          {/* Left Column: ID Card */}
          <div className="profile-left">
            <div className="profile-card">
              <div className="profile-avatar-large">
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  user.name?.charAt(0).toUpperCase()
                )}
              </div>
              
              <h1 className="profile-name">{isEditing ? 'Edit Profile' : user.name}</h1>
              
                {/* Badges and Rating */}
               <div className="profile-badge-row" style={{ flexDirection: 'column', gap: '4px' }}>
                  {user.isHost && (
                     <div className="superhost-badge">
                       <Star size={14} fill="#222" /> Superhost
                     </div>
                  )}
                  <div style={{ fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={14} fill="#222" /> {user.rating || formData.rating} Rating
                  </div>
               </div>

              {/* Edit Controls */}
              {/* Edit Controls */}
              {!isEditing && (
                 <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
              )}

              {/* Verified Info */}
              <div className="verification-section">
                <h3 className="verification-heading">{user.name}'s Confirmed Information</h3>
                <div className="verification-item">
                  <Check size={20} /> Identity
                </div>
                <div className="verification-item">
                  <Check size={20} /> Email address
                </div>
                <div className="verification-item">
                  <Check size={20} /> Phone number
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="profile-main-content">
            {/* Heading Removed */}
            
            {isEditing ? (
              <div className="edit-form">
                <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>Display Name</label>
                <input 
                  type="text" 
                  className="profile-input" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />

                <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>Email</label>
                <input 
                  type="email" 
                  className="profile-input" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />

                <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>Phone Number</label>
                <input 
                  type="tel" 
                  className="profile-input" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />

                <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>Location</label>
                <input 
                  type="text" 
                  className="profile-input" 
                  value={formData.location} 
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Where do you live?"
                />




                
                <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
                   <button className="save-profile-btn" onClick={handleSave} style={{ marginTop: 0, width: 'auto', padding: '12px 32px' }}>Save</button>
                   <button 
                     className="edit-profile-btn" 
                     onClick={() => setIsEditing(false)} 
                     style={{ marginTop: 0, width: 'auto', background: 'white', color: 'black', border: '1px solid #222' }}
                   >
                     Cancel
                   </button>
                </div>
              </div>
            ) : (
              <>
                <div className="profile-bio-section" style={{marginBottom: '32px'}}>
                  
                  <div className="profile-info-grid">
                    <div className="info-item">
                       <MapPin size={20} className="info-icon" /> Lives in {user.location || formData.location}
                    </div>

                  </div>
                </div>

                <div className="profile-divider"></div>

                <div className="profile-contact-section">
                   <h3 className="section-title">Contact Details</h3>
                   <div className="contact-list">
                     <div className="contact-item">
                        <Mail size={20} className="contact-icon" />
                        <div className="contact-text">
                          <span className="label">Email</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="value">{formData.email}</span>
                            {verification.email ? (
                              <span style={{ fontSize: '12px', color: '#008a05', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', background: '#e6fce8', padding: '2px 8px', borderRadius: '12px' }}>
                                <Check size={12} strokeWidth={3} /> Verified
                              </span>
                            ) : (
                              <button 
                                onClick={() => handleVerify('email')}
                                className="verify-btn"
                              >
                                Verify
                              </button>
                            )}
                          </div>
                        </div>
                     </div>
                     <div className="contact-item">
                        <Phone size={20} className="contact-icon" />
                        <div className="contact-text">
                          <span className="label">Phone Number</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <span className="value">{formData.phone}</span>
                             {verification.phone ? (
                               <span style={{ fontSize: '12px', color: '#008a05', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', background: '#e6fce8', padding: '2px 8px', borderRadius: '12px' }}>
                                 <Check size={12} strokeWidth={3} /> Verified
                               </span>
                             ) : (
                               <button 
                                onClick={() => handleVerify('phone')}
                                className="verify-btn"
                              >
                                Verify
                              </button>
                            )}
                          </div>
                        </div>
                     </div>
                   </div>
                </div>
              </>
            )}

            {/* Listings removed for Traveler View as requested */}
          </div>

        </div>
      </div>
    </>
  );
};

export default Profile;
