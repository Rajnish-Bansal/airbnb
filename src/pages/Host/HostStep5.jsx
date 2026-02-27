import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHost } from '../../context/HostContext';
import './HostStep1.css';
import { Image as ImageIcon, Plus, Trash2, UploadCloud, Tag } from 'lucide-react';
import './HostStep5.css'; 

const HostStep5 = () => {
  const navigate = useNavigate();
  const { listingData, updateListingData, saveDraft } = useHost();
  const [dragActive, setDragActive] = useState(false);

  const handleSaveAndExit = () => {
    saveDraft(5);
    navigate('/become-a-host/dashboard');
  };

  const handleNext = () => {
    saveDraft(6);
    navigate('/become-a-host/step6');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    addPhotos(files);
  };

  const addPhotos = (files) => {
    const currentPhotoCount = (listingData.photos || []).length;
    const newPhotos = files.map((file, index) => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      file: file,
      category: currentPhotoCount === 0 && index === 0 ? 'cover' : 'other' // First photo is cover
    }));
    
    updateListingData({ 
      photos: [...(listingData.photos || []), ...newPhotos] 
    });
  };

  const removePhoto = (photoId) => {
    const updatedPhotos = (listingData.photos || []).filter(p => p.id !== photoId);
    updateListingData({ photos: updatedPhotos });
  };

  const handleCategoryChange = (photoId, newCategory) => {
    const updatedPhotos = (listingData.photos || []).map(photo => 
      photo.id === photoId ? { ...photo, category: newCategory } : photo
    );
    updateListingData({ photos: updatedPhotos });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addPhotos(Array.from(e.dataTransfer.files));
    }
  };

  const hasPhotos = (listingData.photos || []).length > 0;

  return (
    <div className="host-step-container aesthetic-bg">
      <div className="step-content">
        <header className="pricing-header">
           <h1 className="step-title">Make your place stand out</h1>
           <p className="step-subheading">Give your place a catchy title and add photos to attract guests.</p>
        </header>
        
        {/* Title Section */}
        <section className="step-section">
          <h2 className="step-heading">Property Title <span style={{ color: '#ff385c' }}>*</span></h2>
          <div className="glass-card premium-border" style={{ padding: '24px', borderRadius: '24px', marginBottom: '32px' }}>
            <textarea 
              className="host-textarea title-input" 
              placeholder="e.g. Peaceful villa in the heart of Delhi"
              value={listingData.title}
              onChange={(e) => updateListingData({ title: e.target.value })}
              style={{ 
                  fontSize: '20px', 
                  fontWeight: '600',
                  padding: '16px',
                  border: '2px solid #f0f0f0',
                  background: '#fcfcfc',
                  borderRadius: '12px',
                  width: '100%',
                  height: '60px',
                  outline: 'none',
                  resize: 'none',
                  overflow: 'hidden',
                  transition: 'all 0.3s'
              }}
            />
            <div className="char-count" style={{ marginTop: '8px', textAlign: 'right' }}>
              <div style={{ textAlign: 'right', fontSize: '12px', color: '#717171', marginTop: '8px', fontWeight: '600' }}>
              {(listingData.title || '').length} characters
            </div>
            </div>
          </div>
        </section>

        {/* Photos Section */}
        <section className="step-section">
          <h2 className="step-heading">Photos <span style={{ color: '#ff385c' }}>*</span></h2>
        {!hasPhotos ? (
          <div 
            className={`photo-upload-zone glass-card ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload').click()}
          >
            <input 
              id="file-upload"
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div className="upload-empty-state">
              <div className="upload-icon-container">
                <UploadCloud size={48} className="upload-cloud-icon" />
              </div>
              <h3 className="upload-instruction">Drag your photos here</h3>
              <p className="upload-limit">or click to browse from device</p>
              <button className="btn-solid upload-btn-aesthetic">
                <Plus size={18} /> Add photos
              </button>
            </div>
          </div>
        ) : (
          <div className="photos-preview-container">
            <div className="preview-actions">
               <button 
                 className="btn-add-more glass-card"
                 onClick={() => document.getElementById('file-upload-more').click()}
               >
                 <Plus size={20} /> Add more
               </button>
               <input 
                  id="file-upload-more"
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
            </div>

            <div className="photos-grid">
               {(listingData.photos || []).map((photo, index) => (
                 <div 
                   key={photo.id || index} 
                   className={`photo-card-wrapper ${index === 0 ? 'cover-photo-slot' : ''}`}
                 >
                   <div className="photo-card glass-card">
                     <img src={photo.url || photo} alt={`Preview ${index}`} />
                     
                     {/* Category Badge */}
                     <div style={{
                       position: 'absolute',
                       top: '12px',
                       left: '12px',
                       background: photo.category === 'cover' ? 'linear-gradient(135deg, #ff385c 0%, #bd1e59 100%)' : 'rgba(0, 0, 0, 0.7)',
                       color: 'white',
                       padding: '4px 10px',
                       borderRadius: '6px',
                       fontSize: '11px',
                       fontWeight: '600',
                       textTransform: 'capitalize',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '4px',
                       zIndex: 2
                     }}>
                       <Tag size={12} />
                       {photo.category || 'other'}
                     </div>

                     {/* Category Selector */}
                     <div style={{
                       position: 'absolute',
                       bottom: '12px',
                       left: '12px',
                       right: '12px',
                       zIndex: 2
                     }}>
                       <select
                         value={photo.category || 'other'}
                         onChange={(e) => handleCategoryChange(photo.id, e.target.value)}
                         onClick={(e) => e.stopPropagation()}
                         style={{
                           width: '100%',
                           padding: '8px 10px',
                           background: 'rgba(255, 255, 255, 0.95)',
                           backdropFilter: 'blur(10px)',
                           border: '1px solid rgba(0, 0, 0, 0.1)',
                           borderRadius: '8px',
                           fontSize: '13px',
                           fontWeight: '600',
                           cursor: 'pointer',
                           color: '#222'
                         }}
                       >
                         <option value="cover">Cover Photo</option>
                         <option value="bedroom">Bedroom</option>
                         <option value="bathroom">Bathroom</option>
                         <option value="kitchen">Kitchen</option>
                         <option value="living">Living Area</option>
                         <option value="dining">Dining Area</option>
                         <option value="outdoor">Outdoor Space</option>
                         <option value="amenities">Amenities</option>
                         <option value="other">Other</option>
                       </select>
                     </div>

                     <button 
                       className="delete-photo-btn"
                       onClick={(e) => {
                         e.stopPropagation();
                         removePhoto(photo.id);
                       }}
                       style={{ zIndex: 3 }}
                     >
                       <Trash2 size={16} />
                     </button>
                   </div>
                 </div>
               ))}
               
               {/* Add More slot to encourage reaching 5 photos */}
               {(listingData.photos || []).length < 10 && (
                 <div 
                   className="photo-card-wrapper placeholder-slot"
                   onClick={() => document.getElementById('file-upload-more').click()}
                 >
                   <div className="photo-card glass-card empty-slot">
                      <Plus size={24} color="#b0b0b0" />
                   </div>
                 </div>
               )}
            </div>
          </div>
        )}
        </section>
      </div>

      <div className="host-footer">
        <button className="back-btn" onClick={() => navigate('/become-a-host/step4')}>Back</button>
        <div className="footer-right">
           <button className="save-exit-btn" onClick={handleSaveAndExit}>Save & Exit</button>
           <button 
             className="next-btn btn-solid" 
             onClick={handleNext}
           >
             Save & Next
           </button>
        </div>
      </div>
    </div>
  );
};

export default HostStep5;
