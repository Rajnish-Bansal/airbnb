import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHost } from '../../context/HostContext';
import { Info, Plus, Pencil, Trash2, IndianRupee, ChevronDown } from 'lucide-react';
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
           <h1 className="step-title">Now, set your price</h1>
           <p className="step-subheading">You can change it anytime. Start with a base price or add room-specific rates.</p>
        </header>


        {/* Base Price Card */}
        <div className="pricing-main-card glass-card premium-border">
          <div className="card-header">
            <h3 className="section-title">Standard Pricing</h3>
          </div>
          
          <div className="price-inputs-grid">
            <div className="price-field-container">
              <label>Weekday Price <span style={{ color: 'var(--primary)' }}>*</span></label>
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
              <div className="price-input-wrapper large focus-glow">
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

          {/* Dynamic Price Breakdown */}
          {listingData.price > 0 && (
            <div className="price-breakdown-section">
              <div className="breakdown-divider"></div>
              
              <div className="breakdown-columns">
                <div className="breakdown-col">
                  <h4 className="breakdown-subtitle">You'll earn</h4>
                  <div className="breakdown-row highlight">
                    <span>Base price</span>
                    <span>₹{Number(listingData.price).toLocaleString()}</span>
                  </div>
                  <div className="breakdown-row">
                    <div className="info-wrap">
                      <span>Host service fee (3%)</span>
                      <Info size={14} className="info-icon" />
                    </div>
                    <span>-₹{(listingData.price * 0.03).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="breakdown-divider light"></div>
                  <div className="breakdown-row final">
                    <span>Your payout</span>
                    <span className="payout-amount">₹{(listingData.price * 0.97).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>

                <div className="breakdown-col guest-side">
                  <h4 className="breakdown-subtitle">Guest pays</h4>
                  <div className="breakdown-row">
                    <span>Base price</span>
                    <span>₹{Number(listingData.price).toLocaleString()}</span>
                  </div>
                  <div className="breakdown-row">
                    <div className="info-wrap">
                      <span>Guest service fee (14%)</span>
                      <Info size={14} className="info-icon" />
                    </div>
                    <span>₹{(listingData.price * 0.14).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="breakdown-row">
                    <span>Taxes (12% GST)</span>
                    <span>₹{(listingData.price * 0.12).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="breakdown-divider light"></div>
                  <div className="breakdown-row final">
                    <span>Total guest price</span>
                    <span className="guest-total">₹{(listingData.price * 1.26).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Room Categories Section */}
        <section className="room-categories-section">
          <div className="card-header">
            <h2 className="section-title">Room Categories</h2>
            {listingData.rooms?.length > 0 && !showCategoryForm && (
              <button className="add-category-inline-btn" onClick={() => setShowCategoryForm(true)}>
                <Plus size={16} /> Add Category
              </button>
            )}
          </div>
          <p className="section-desc">Add different room types or specific rates for certain categories.</p>

          <div className="room-list">
            {(listingData.rooms || []).map((room, index) => (
              <div key={index} className={`room-item-card glass-card premium-border ${editingIndex === index ? 'editing' : ''}`}>
                <div className="room-info">
                  <div className="room-header">
                    <span className="room-name">{room.category}</span>
                    <span className="room-count">{room.quantity} rooms</span>
                  </div>
                  <div className="room-price-details">
                    <span className="main-price">₹{Number(room.price).toLocaleString()} <small>weekday</small></span>
                    {room.weekendPrice && (
                      <span className="weekend-price">₹{Number(room.weekendPrice).toLocaleString()} <small>weekend</small></span>
                    )}
                  </div>
                  
                  {/* Per-room breakdown preview */}
                  <div className="room-payout-preview">
                    <span>Est. payout: ₹{(room.price * 0.97).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
                <div className="room-actions">
                  <button className="icon-btn edit-btn" onClick={() => handleEditRoom(index)}>
                    <Pencil size={18} />
                  </button>
                  <button className="icon-btn delete-btn" onClick={() => handleRemoveRoom(index)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!showCategoryForm ? (
            listingData.rooms?.length === 0 && (
              <button className="add-category-action focus-glow" onClick={() => setShowCategoryForm(true)}>
                <div className="tip-icon"><Plus size={24} /></div>
                <span>Add a room category or specific rate</span>
              </button>
            )
          ) : (
            <div className="add-category-form-card glass-card premium-border">
              <h3 className="form-title">{editingIndex !== null ? 'Edit Category' : 'Add New Category'}</h3>
              
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Category Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Deluxe Room, Sea View Suite"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Weekday Price</label>
                  <div className="price-input-small">
                    <span>₹</span>
                    <input 
                      type="number"
                      placeholder="0"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Weekend Price</label>
                  <div className="price-input-small">
                    <span>₹</span>
                    <input 
                      type="number"
                      placeholder="0"
                      value={newWeekendPrice}
                      onChange={(e) => setNewWeekendPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Quantity</label>
                  <input 
                    type="number"
                    min="1"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                  />
                </div>
              </div>

              {newPrice > 0 && (
                <div className="mini-breakdown">
                  <div className="mini-row">
                    <span>Est. host payout:</span>
                    <span className="text-green">₹{(newPrice * 0.97).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="mini-row">
                    <span>Est. guest total:</span>
                    <span className="text-pink">₹{(newPrice * 1.26).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button className="btn-ghost" onClick={cancelEdit}>Cancel</button>
                <button 
                  className="btn-solid" 
                  onClick={handleAddCategory}
                  disabled={!newCategory || !newPrice}
                >
                  {editingIndex !== null ? 'Update Category' : 'Add Category'}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Stay Requirements Section */}
        <section className="step-section" style={{ marginTop: '48px' }}>
          <h2 className="step-heading">Stay Requirements <span style={{ color: 'var(--primary)' }}>*</span></h2>
          <div className="glass-card premium-border" style={{ padding: '24px', borderRadius: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#222' }}>Minimum nights</label>
                <p style={{ fontSize: '14px', color: '#717171', marginBottom: '12px' }}>Minimum number of nights guests must book</p>
                <div className="guest-dropdown-wrapper glass-card premium-border" style={{ padding: '8px', borderRadius: '16px', maxWidth: '100%', position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <select 
                    className="guest-select"
                    value={listingData.minStay || 1}
                    onChange={(e) => updateListingData({ minStay: parseInt(e.target.value) })}
                    style={{ border: 'none', background: 'transparent', width: '100%', padding: '8px', fontSize: '16px', fontWeight: '400', color: '#717171', appearance: 'none', outline: 'none', cursor: 'pointer', zIndex: 1 }}
                  >
                    {[...Array(30)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i + 1 === 1 ? 'night' : 'nights'}
                      </option>
                    ))}
                  </select>
                  <div style={{ position: 'absolute', right: '16px', pointerEvents: 'none', color: '#717171', zIndex: 0 }}>
                    <ChevronDown size={20} />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#222' }}>Maximum nights</label>
                <p style={{ fontSize: '14px', color: '#717171', marginBottom: '12px' }}>Maximum number of nights guests can book</p>
                <div className="guest-dropdown-wrapper glass-card premium-border" style={{ padding: '8px', borderRadius: '16px', maxWidth: '100%', position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <select 
                    className="guest-select"
                    value={listingData.maxStay || 365}
                    onChange={(e) => updateListingData({ maxStay: parseInt(e.target.value) })}
                    style={{ border: 'none', background: 'transparent', width: '100%', padding: '8px', fontSize: '16px', fontWeight: '400', color: '#717171', appearance: 'none', outline: 'none', cursor: 'pointer', zIndex: 1 }}
                  >
                    <option value="7">7 nights</option>
                    <option value="14">14 nights</option>
                    <option value="30">30 nights</option>
                    <option value="60">60 nights</option>
                    <option value="90">90 nights</option>
                    <option value="180">180 nights</option>
                    <option value="365">365 nights (1 year)</option>
                  </select>
                  <div style={{ position: 'absolute', right: '16px', pointerEvents: 'none', color: '#717171', zIndex: 0 }}>
                    <ChevronDown size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cancellation Policy Section */}
        <section className="step-section">
          <h2 className="step-heading">Cancellation Policy <span style={{ color: 'var(--primary)' }}>*</span></h2>
          <div className="glass-card premium-border" style={{ padding: '24px', borderRadius: '24px' }}>
            <p style={{ fontSize: '14px', color: '#717171', marginBottom: '24px' }}>
              Choose a standard cancellation policy for your listing:
            </p>
            
            <div className="guest-dropdown-wrapper glass-card premium-border" style={{ padding: '8px', borderRadius: '16px', maxWidth: '100%', marginBottom: '24px', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select 
                className="guest-select cancel-select-no-arrow"
                value={listingData.cancellationPolicyType || 'Flexible'}
                onChange={(e) => updateListingData({ cancellationPolicyType: e.target.value })}
                style={{ border: 'none', background: 'transparent', width: '100%', padding: '8px', fontSize: '16px', fontWeight: '400', color: '#717171', appearance: 'none', outline: 'none', cursor: 'pointer', zIndex: 1 }}
              >
                <option value="Flexible">Flexible - Full refund 1 day prior to arrival</option>
                <option value="Moderate">Moderate - Full refund 5 days prior to arrival</option>
                <option value="Strict">Strict - 50% refund up to 1 week before arrival</option>
                <option value="Non-Refundable">Non-Refundable - No refunds after booking</option>
              </select>
              <div style={{ position: 'absolute', right: '16px', pointerEvents: 'none', color: '#717171', zIndex: 0 }}>
                <ChevronDown size={20} />
              </div>
            </div>

            <div style={{ padding: '16px', background: '#f7f7f7', borderRadius: '12px', border: '1px solid #e2e2e2' }}>
              <p style={{ fontSize: '13px', color: '#717171', margin: 0, lineHeight: '1.6' }}>
                Hint: A flexible policy attracts more bookings (recommended for new hosts), while a stricter policy gives you more certainty if guests cancel.
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
