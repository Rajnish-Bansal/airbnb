import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHost } from '../../context/HostContext';
import { Info, Plus, Pencil, Trash2, IndianRupee, Sparkles } from 'lucide-react';
import './HostStep6.css'; 

const HostStep6 = () => {
  const navigate = useNavigate();
  const { listingData, updateListingData, saveDraft } = useHost();
  
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newPrice, setNewPrice] = useState(''); // Weekday Price
  const [newWeekendPrice, setNewWeekendPrice] = useState('');
  const [newQuantity, setNewQuantity] = useState('1');
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAddCategory = () => {
    if (newCategory && newPrice) {
      const newRoom = {
        category: newCategory,
        price: newPrice,
        weekendPrice: newWeekendPrice,
        quantity: parseInt(newQuantity) || 1
      };
      
      let updatedRooms;
      if (editingIndex !== null) {
        updatedRooms = [...(listingData.rooms || [])];
        updatedRooms[editingIndex] = newRoom;
        setEditingIndex(null);
      } else {
        updatedRooms = [...(listingData.rooms || []), newRoom];
      }
      
      updateListingData({ rooms: updatedRooms });
      setNewCategory('');
      setNewPrice('');
      setNewWeekendPrice('');
      setNewQuantity('1');
      setShowCategoryForm(false);
    }
  };

  const handleEditRoom = (index) => {
    const room = (listingData.rooms || [])[index];
    if (!room) return;
    setNewCategory(room.category);
    setNewPrice(room.price);
    setNewWeekendPrice(room.weekendPrice || '');
    setNewQuantity(room.quantity?.toString() || '1');
    setEditingIndex(index);
    setShowCategoryForm(true);
  };

  const handleRemoveRoom = (index) => {
    const updatedRooms = (listingData.rooms || []).filter((_, i) => i !== index);
    updateListingData({ rooms: updatedRooms });
    if (editingIndex === index) {
       setEditingIndex(null);
       setShowCategoryForm(false);
    }
  };

  const cancelEdit = () => {
    setNewCategory('');
    setNewPrice('');
    setNewWeekendPrice('');
    setNewQuantity('1');
    setEditingIndex(null);
    setShowCategoryForm(false);
  };

  const handleSaveAndExit = () => {
    saveDraft(6);
    navigate('/become-a-host/dashboard');
  };

  const handleNext = () => {
    saveDraft(7);
    navigate('/become-a-host/step7');
  };

  return (
    <div className="host-step-container aesthetic-bg">
      <div className="step-content">
        <header className="pricing-header">
           <Sparkles className="header-decoration" />
           <h1 className="step-title">Set your pricing</h1>
           <p className="step-subheading">You can change it anytime. Start with a base price or add room-specific rates.</p>
        </header>
        
        {/* Helper Tip */}
        <div className="pricing-tip glass-card">
          <Info size={20} className="tip-icon" />
          <p>Places like yours usually rent for <strong>Rs 2,500 – Rs 4,500</strong> in your area.</p>
        </div>

        {/* Base Price Card */}
        <div className="pricing-main-card glass-card premium-border">
          <div className="card-header">
            <h3 className="section-title">Standard Pricing</h3>
            <span className="badge gradient-badge">Recommended</span>
          </div>
          
          <div className="price-inputs-grid">
            <div className="price-field-container">
              <label>Weekday Price</label>
              <div className="price-input-wrapper large focus-glow">
                 <span className="currency gradient-text">₹</span>
                 <input 
                   type="number"
                   placeholder="0"
                   value={listingData.price}
                   onChange={(e) => updateListingData({ price: e.target.value })}
                 />
                 <span className="per-night">per night</span>
              </div>
            </div>

            <div className="price-field-container">
              <label>Weekend Price</label>
              <div className="price-input-wrapper focus-glow">
                 <span className="currency gradient-text">₹</span>
                 <input 
                   type="number"
                   placeholder="0"
                   value={listingData.weekendPrice}
                   onChange={(e) => updateListingData({ weekendPrice: e.target.value })}
                 />
                 <span className="per-night">per night</span>
              </div>
            </div>
          </div>
        </div>

        {/* Room Categories Section */}
        <div className="room-categories-section">
          <div className="section-header">
            <h3 className="section-title">Room Categories</h3>
            <p className="section-desc">Add specific pricing for different room types (e.g. Deluxe, Suite).</p>
          </div>

          {(listingData.rooms || []).length > 0 && (
            <div className="room-list">
               {(listingData.rooms || []).map((room, index) => (
                  <div 
                    key={index} 
                    className={`room-item-card ${editingIndex === index ? 'editing' : ''}`}
                  >
                    <div className="room-info">
                       <div className="room-main">
                         <span className="room-name">{room.category}</span>
                         <span className="room-count">x{room.quantity || 1} units</span>
                       </div>
                       <div className="room-price-details">
                         <span className="main-price">₹{room.price}</span>
                         {room.weekendPrice && (
                           <span className="weekend-price">₹{room.weekendPrice} weekend</span>
                         )}
                       </div>
                    </div>
                    <div className="room-actions">
                      <button onClick={() => handleEditRoom(index)} className="action-btn edit" title="Edit">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleRemoveRoom(index)} className="action-btn delete" title="Remove">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
               ))}
            </div>
          )}

          {!showCategoryForm ? (
             <button 
               onClick={() => {
                 setNewCategory('');
                 setNewPrice('');
                 setNewWeekendPrice('');
                 setEditingIndex(null);
                 setShowCategoryForm(true);
               }}
               className="add-category-action"
             >
               <Plus size={20} />
               <span>Add a room category</span>
             </button>
           ) : (
             <div className="add-category-form-card">
                <h4 className="form-subtitle">
                  {editingIndex !== null ? 'Edit category' : 'Add new category'}
                </h4>
                
                <div className="form-group">
                   <label>Category Name</label>
                   <input 
                     type="text" 
                     placeholder="e.g. Deluxe Garden View"
                     value={newCategory}
                     onChange={(e) => setNewCategory(e.target.value)}
                   />
                </div>

                <div className="form-row">
                   <div className="form-group small">
                      <label>Weekday Price</label>
                      <div className="form-input-wrapper">
                         <span className="prefix">₹</span>
                         <input 
                           type="number" 
                           placeholder="0"
                           value={newPrice}
                           onChange={(e) => setNewPrice(e.target.value)}
                         />
                      </div>
                   </div>
                   <div className="form-group small">
                      <label>Weekend Price</label>
                      <div className="form-input-wrapper">
                         <span className="prefix">₹</span>
                         <input 
                           type="number" 
                           placeholder="0"
                           value={newWeekendPrice}
                           onChange={(e) => setNewWeekendPrice(e.target.value)}
                         />
                      </div>
                   </div>
                </div>

                <div className="form-group">
                   <label>Number of rooms</label>
                   <input 
                     type="number" 
                     min="1"
                     value={newQuantity}
                     onChange={(e) => setNewQuantity(e.target.value)}
                   />
                </div>

                <div className="form-footer-actions">
                   <button onClick={cancelEdit} className="btn-link">Cancel</button>
                   <button 
                     onClick={handleAddCategory}
                     disabled={!newCategory || !newPrice}
                     className="btn-solid"
                   >
                     {editingIndex !== null ? 'Save changes' : 'Add category'}
                   </button>
                </div>
             </div>
           )}
        </div>

        {/* Stay Requirements Section */}
        <section className="step-section" style={{ marginTop: '48px' }}>
          <h2 className="step-heading">Stay Requirements</h2>
          <div className="glass-card premium-border" style={{ padding: '24px', borderRadius: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#222' }}>Minimum nights</label>
                <p style={{ fontSize: '14px', color: '#717171', marginBottom: '12px' }}>Minimum number of nights guests must book</p>
                <div className="guest-dropdown-wrapper glass-card premium-border" style={{ padding: '8px', borderRadius: '16px', maxWidth: '100%' }}>
                  <select 
                    className="guest-select"
                    value={listingData.minStay || 1}
                    onChange={(e) => updateListingData({ minStay: parseInt(e.target.value) })}
                    style={{ border: 'none', background: 'transparent' }}
                  >
                    {[...Array(30)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i + 1 === 1 ? 'night' : 'nights'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#222' }}>Maximum nights</label>
                <p style={{ fontSize: '14px', color: '#717171', marginBottom: '12px' }}>Maximum number of nights guests can book</p>
                <div className="guest-dropdown-wrapper glass-card premium-border" style={{ padding: '8px', borderRadius: '16px', maxWidth: '100%' }}>
                  <select 
                    className="guest-select"
                    value={listingData.maxStay || 365}
                    onChange={(e) => updateListingData({ maxStay: parseInt(e.target.value) })}
                    style={{ border: 'none', background: 'transparent' }}
                  >
                    <option value="7">7 nights</option>
                    <option value="14">14 nights</option>
                    <option value="30">30 nights</option>
                    <option value="60">60 nights</option>
                    <option value="90">90 nights</option>
                    <option value="180">180 nights</option>
                    <option value="365">365 nights (1 year)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cancellation Policy Section */}
        <section className="step-section">
          <h2 className="step-heading">Cancellation Policy</h2>
          <div className="glass-card premium-border" style={{ padding: '24px', borderRadius: '24px' }}>
            <p style={{ fontSize: '14px', color: '#717171', marginBottom: '24px' }}>
              Customize your cancellation policy by filling in the blanks below:
            </p>
            
            <div style={{ fontSize: '16px', lineHeight: '2.2', color: '#222' }}>
              <p style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                <span>Guests can cancel and get a <strong>full refund</strong> up to</span>
                <input 
                  type="number" 
                  min="0"
                  max="30"
                  value={listingData.cancellationPolicy?.fullRefundDays || 1}
                  onChange={(e) => updateListingData({ 
                    cancellationPolicy: { 
                      ...listingData.cancellationPolicy, 
                      fullRefundDays: parseInt(e.target.value) || 0 
                    }
                  })}
                  style={{
                    width: '70px',
                    padding: '8px 12px',
                    border: '2px solid #e2e2e2',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    textAlign: 'center',
                    margin: '0 4px',
                    background: '#f7f7f7'
                  }}
                />
                <select
                  value={listingData.cancellationPolicy?.fullRefundUnit || 'days'}
                  onChange={(e) => updateListingData({ 
                    cancellationPolicy: { 
                      ...listingData.cancellationPolicy, 
                      fullRefundUnit: e.target.value 
                    }
                  })}
                  style={{
                    padding: '8px 12px',
                    border: '2px solid #e2e2e2',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: '0 4px',
                    background: '#f7f7f7',
                    cursor: 'pointer'
                  }}
                >
                  <option value="hours">hour(s)</option>
                  <option value="days">day(s)</option>
                </select>
                <span>before check-in.</span>
              </p>

              <p style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                <span>If cancelled between</span>
                <input 
                  type="number" 
                  min="0"
                  max="30"
                  value={listingData.cancellationPolicy?.partialRefundDays || 0}
                  onChange={(e) => updateListingData({ 
                    cancellationPolicy: { 
                      ...listingData.cancellationPolicy, 
                      partialRefundDays: parseInt(e.target.value) || 0 
                    }
                  })}
                  style={{
                    width: '70px',
                    padding: '8px 12px',
                    border: '2px solid #e2e2e2',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    textAlign: 'center',
                    margin: '0 4px',
                    background: '#f7f7f7'
                  }}
                />
                <select
                  value={listingData.cancellationPolicy?.partialRefundUnit || 'days'}
                  onChange={(e) => updateListingData({ 
                    cancellationPolicy: { 
                      ...listingData.cancellationPolicy, 
                      partialRefundUnit: e.target.value 
                    }
                  })}
                  style={{
                    padding: '8px 12px',
                    border: '2px solid #e2e2e2',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: '0 4px',
                    background: '#f7f7f7',
                    cursor: 'pointer'
                  }}
                >
                  <option value="hours">hour(s)</option>
                  <option value="days">day(s)</option>
                </select>
                <span>and</span>
                <input 
                  type="number" 
                  min="0"
                  max="30"
                  value={listingData.cancellationPolicy?.fullRefundDays || 1}
                  disabled
                  style={{
                    width: '70px',
                    padding: '8px 12px',
                    border: '2px solid #e2e2e2',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    textAlign: 'center',
                    margin: '0 4px',
                    background: '#ebebeb',
                    color: '#717171'
                  }}
                />
                <select
                  value={listingData.cancellationPolicy?.fullRefundUnit || 'days'}
                  disabled
                  style={{
                    padding: '8px 12px',
                    border: '2px solid #e2e2e2',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: '0 4px',
                    background: '#ebebeb',
                    color: '#717171',
                    cursor: 'not-allowed'
                  }}
                >
                  <option value="hours">hour(s)</option>
                  <option value="days">day(s)</option>
                </select>
                <span>before check-in, guests get a</span>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  step="5"
                  value={listingData.cancellationPolicy?.partialRefundPercent || 50}
                  onChange={(e) => updateListingData({ 
                    cancellationPolicy: { 
                      ...listingData.cancellationPolicy, 
                      partialRefundPercent: parseInt(e.target.value) || 0 
                    }
                  })}
                  style={{
                    width: '70px',
                    padding: '8px 12px',
                    border: '2px solid #e2e2e2',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    textAlign: 'center',
                    margin: '0 4px',
                    background: '#f7f7f7'
                  }}
                />
                <span>% refund.</span>
              </p>

              <p style={{ marginBottom: '0', color: '#717171', fontSize: '14px' }}>
                No refund if cancelled less than {listingData.cancellationPolicy?.partialRefundDays || 0} {listingData.cancellationPolicy?.partialRefundUnit || 'day(s)'} before check-in.
              </p>
            </div>

            <div style={{ marginTop: '24px', padding: '16px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
              <p style={{ fontSize: '13px', color: '#0369a1', margin: 0, lineHeight: '1.6' }}>
                <strong>💡 Tip:</strong> A flexible policy (24 hours or 1-2 days) attracts more bookings, while a stricter policy (7+ days) gives you more certainty.
              </p>
            </div>
          </div>
        </section>

      </div>

      <div className="host-footer">
        <button className="back-btn" onClick={() => navigate('/become-a-host/step5')}>Back</button>
        <div className="footer-right">
           <button className="save-exit-btn" onClick={handleSaveAndExit}>Save & Exit</button>
           <button className="next-btn" onClick={handleNext}>Save & Next</button>
        </div>
      </div>
    </div>
  );
};

export default HostStep6;
