import React, { useState, useEffect } from 'react';
import Navbar from '../../components/organisms/Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';
import { useHost } from '../../context/HostContext';
import { ShieldCheck, Check, Star, User, Phone, Mail, Briefcase, Camera, Sparkles } from 'lucide-react';
import { fetchUserProfile, updateUserProfile, uploadImage, sendOtp, verifyOtp } from '../../services/api';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { listings } = useHost();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  
  // Local state for editing form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    avatar: '',
    governmentId: '',
    password: '',
    isPhoneVerified: false,
    isIdVerified: false
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await fetchUserProfile();
      const parts = (data.name || '').trim().split(/\s+/);
      const first = parts[0] || '';
      const last = parts.slice(1).join(' ') || '';
      setFirstName(first);
      setLastName(last);

      setFormData({
        name: data.name || user.name || '',
        email: data.email || user.email || '',
        phone: data.phone || '',
        bio: data.bio || '',
        avatar: data.avatar || '',
        governmentId: data.governmentId || '',
        isPhoneVerified: !!data.phone && (data.isPhoneVerified || false),
        isIdVerified: data.isIdVerified || false
      });
      // Sync with AuthContext in case it's stale
      updateUser(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIdUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const imageUrl = await uploadImage(file);
      setFormData(prev => ({ ...prev, governmentId: imageUrl, isIdVerified: true })); // Immediately verified for demo
      const updatedUser = await updateUserProfile({ governmentId: imageUrl, isIdVerified: true });
      updateUser(updatedUser);
    } catch {
      alert('Failed to upload ID. Please try again.');
    }
  };

  const handleSendOtp = async () => {
    if (!formData.phone) return;
    try {
      setOtpError('');
      await sendOtp(formData.phone);
      setIsOtpSent(true);
    } catch (err) {
      setOtpError(err.message || 'Failed to send OTP.');
    }
  };

  const handleConfirmOtp = async () => {
    if (!otpCode) return;
    try {
      setOtpError('');
      await verifyOtp(formData.phone, otpCode);
      const updatedUser = await updateUserProfile({ phone: formData.phone, isPhoneVerified: true });
      setFormData(prev => ({ ...prev, isPhoneVerified: true }));
      updateUser(updatedUser);
      setIsOtpSent(false);
      setOtpCode('');
    } catch (err) {
      setOtpError(err.message || 'Invalid OTP code.');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const imageUrl = await uploadImage(file);
      setFormData(prev => ({ ...prev, avatar: imageUrl }));
      await updateUserProfile({ avatar: imageUrl });
      updateUser({ avatar: imageUrl });
    } catch {
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const data = await updateUserProfile(formData);
      updateUser(data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save profile: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user || loading) {
    return (
      <>
        <Navbar />
        <div className="profile-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div className="loading-shimmer-profile">
             {loading ? 'Curating your traveller profile...' : 'Please log in to view your profile.'}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-container">
        
        {saveSuccess && (
          <div className="profile-toast-success-premium">
            <Sparkles size={18} /> Profile updated successfully!
          </div>
        )}

        <div className="profile-grid">
          
          {/* Left Column: ID Card & Identity */}
          <div className="profile-left">
            <div className="profile-card premium-card">
              <div className="profile-avatar-wrapper">
                <div 
                  className="profile-avatar-large"
                  style={{ 
                    backgroundImage: formData.avatar ? `url(${formData.avatar})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: '#1f1f1f'
                  }}
                >
                  {!formData.avatar && (formData.name?.charAt(0) || user.name?.charAt(0))}
                </div>
                <label className="avatar-floating-btn">
                  <Camera size={16} />
                  <input type="file" onChange={handleAvatarChange} hidden accept="image/*" />
                </label>
              </div>
              
              <h1 className="profile-name">{user.name}</h1>
              
              <div className="profile-badge-row">
                 <div className="rating-badge-mini">
                   <Star size={14} fill="#222" /> 4.8 Rating
                 </div>
              </div>

              <div className="meta-info-row-sidebar">
                <div className="meta-item-sidebar">
                  <Briefcase size={16} />
                  <span>Joined in {new Date(user.createdAt || Date.now()).getFullYear()}</span>
                </div>
              </div>

              <div className="verification-section-premium">
                <h3 className="verification-heading-mini">Identity & Trust</h3>
                <div className={`v-item-minimal ${formData.isIdVerified ? 'verified' : 'pending'}`}>
                  <ShieldCheck size={18} /> {formData.isIdVerified ? 'Identity Verified' : 'Identity Not Verified'}
                </div>
                <div className={`v-item-minimal ${formData.isPhoneVerified ? 'verified' : 'pending'}`}>
                  <Phone size={18} /> {formData.isPhoneVerified ? 'Phone Verified' : 'Phone Not Verified'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Info Form */}
          <div className="profile-main-content">
            <div className="edit-form-premium">
              <div className="edit-heading-group">
                <h2 className="edit-heading">Personal Information</h2>
                <p className="edit-subheading">Update your traveller profile, manage your phone number, and verify your identity.</p>
              </div>
              
              <div className="form-grid-premium">
                <div className="form-group-premium">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    value={firstName} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setFirstName(val);
                      setFormData(prev => ({ ...prev, name: `${val} ${lastName}`.trim() }));
                    }}
                    placeholder="E.g., Rajnish"
                  />
                </div>

                <div className="form-group-premium">
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    value={lastName} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setLastName(val);
                      setFormData(prev => ({ ...prev, name: `${firstName} ${val}`.trim() }));
                    }}
                    placeholder="E.g., Bansal"
                  />
                </div>



                <div className="form-group-premium full-width-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={!!user.email}
                    title={user.email ? "Email cannot be changed currently" : "Add your email address"}
                    className={user.email ? "disabled-input" : ""}
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="form-group-premium full-width-group">
                  <div className="label-with-badge">
                    <label>Phone Number</label>
                    <span className={`status-badge ${formData.isPhoneVerified ? 'badge-verified' : 'badge-pending'}`}>
                      {formData.isPhoneVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  <div className="phone-input-wrapper custom-limited-width">
                    <input 
                    type="tel" 
                    value={formData.phone} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ 
                        ...prev, 
                        phone: val, 
                        isPhoneVerified: val === user.phone && user.isPhoneVerified
                      }));
                      setIsOtpSent(false);
                    }}
                    placeholder="Enter your phone number"
                    />
                    {!formData.isPhoneVerified && (
                      <button 
                        type="button" 
                        className="btn-verify-mini" 
                        disabled={!formData.phone || formData.phone.replace(/\D/g, '').length !== 10}
                        onClick={handleSendOtp}
                      >
                        Send OTP
                      </button>
                    )}
                  </div>
                  {!formData.isPhoneVerified && (
                    <span className="input-hint-text">Required for booking approvals and host trust.</span>
                  )}
                </div>

                {!user.googleId && (
                  <div className="form-group-premium full-width-group password-toggle-group">
                    <button 
                      type="button" 
                      className="btn-toggle-password-panel"
                      onClick={() => setShowPasswordSection(!showPasswordSection)}
                    >
                      {showPasswordSection ? 'Hide Password Options' : 'Change Password'}
                    </button>
                    {showPasswordSection && (
                      <div className="password-input-panel">
                        <label>New Password</label>
                        <input 
                          type="password" 
                          value={formData.password} 
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          placeholder="Enter your new password"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="profile-divider-thick"></div>

              <div className="id-verification-section">
                 <h3 className="section-title-alt">Government ID Verification</h3>
                 <p className="id-desc">Securely upload your Aadhar card, PAN card, or Passport to complete identity verification. This increases host response rate and helps with instant booking.</p>
                 
                 <div className="id-upload-box">
                    {formData.governmentId ? (
                       <div className="id-preview-box">
                          <div className="id-thumbnail">
                             <img src={formData.governmentId} alt="Government ID" />
                          </div>
                          <div className="id-status-msg">
                             <span className="verified-text">✓ ID Uploaded & Verified</span>
                             <label className="btn-reupload">
                                Change
                                <input type="file" onChange={handleIdUpload} hidden accept="image/*" />
                             </label>
                          </div>
                       </div>
                    ) : (
                       <label className="id-upload-placeholder">
                          <div className="id-upload-icon"><ShieldCheck size={32} /></div>
                          <div className="id-upload-text">
                             <strong>Click to upload your ID</strong>
                             <span>Supports JPG, PNG (Max 5MB)</span>
                          </div>
                          <input type="file" onChange={handleIdUpload} hidden accept="image/*" />
                       </label>
                    )}
                 </div>
              </div>
              
              <div className="form-actions-premium">
                  <button className="btn-save-primary" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isOtpSent && (
        <div className="otp-custom-modal-overlay">
          <div className="otp-custom-modal">
            <h3 className="modal-title-premium">Phone Verification</h3>
            <p className="modal-desc-premium">Please enter the 6-digit verification code sent to <strong>{formData.phone}</strong>.</p>
            <div className="modal-form-premium">
              <input 
                type="text" 
                maxLength="6" 
                placeholder="6-digit OTP" 
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="modal-input-premium"
              />
              {otpError && <span className="otp-error-msg">{otpError}</span>}
              <div className="modal-actions-premium">
                <button type="button" className="btn-cancel-modal-premium" onClick={() => { setIsOtpSent(false); setOtpCode(''); setOtpError(''); }}>
                  Cancel
                </button>
                <button type="button" className="btn-confirm-modal-premium" onClick={handleConfirmOtp}>
                  Verify OTP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
