import React, { useState } from 'react';
import './SubscriptionModal.css';

const SubscriptionModal = ({ isOpen, onClose, onConfirm, listingTitle, planPrice = 999, itemName = "Annual Host Subscription", description, currentLimit }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetLimit, setTargetLimit] = useState(currentLimit || 1);

  // Sync target limit when modal opens or currentLimit changes
  React.useEffect(() => {
     if (isOpen && currentLimit) {
         setTargetLimit(currentLimit);
     }
  }, [isOpen, currentLimit]);

  const extraUnits = Math.max(0, targetLimit - (currentLimit || 1));
  const upgradeCost = extraUnits * 500; // Cost per unit
  const finalPrice = planPrice + upgradeCost;
  
  if (!isOpen) return null;

  const handlePayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      onConfirm({ newLimit: targetLimit });
      onClose();
    }, 2000);
  };

  return (
    <div className="sub-modal-overlay">
      <div className="sub-modal-content">
        <div className="sub-modal-header">
           <h2>Secure Checkout</h2>
           <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="order-summary">
           <div className="summary-row">
              <span className="item-name">{itemName}</span>
              <span className="item-price">₹{planPrice}</span>
           </div>
           
           {/* Recharge Upgrade Option */}
           {currentLimit && (
             <div className="upgrade-section" style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', alignItems: 'center' }}>
                   <span style={{ fontWeight: 600, color: '#475569' }}>Want to increase capacity?</span>
                   <span style={{ fontSize: '12px', color: '#64748b' }}>Current: {currentLimit} units</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <input 
                      type="range" 
                      min={currentLimit} 
                      max={currentLimit + 20} 
                      value={targetLimit} 
                      onChange={(e) => setTargetLimit(parseInt(e.target.value))}
                      style={{ flex: 1, accentColor: '#2563eb', cursor: 'pointer' }}
                   />
                   <span style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a', minWidth: '24px', textAlign: 'center' }}>
                      {targetLimit}
                   </span>
                </div>
                
                {extraUnits > 0 && (
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '13px', color: '#2563eb' }}>
                      <span>+ {extraUnits} extra unit(s)</span>
                      <span>+ ₹{upgradeCost}</span>
                   </div>
                )}
             </div>
           )}

           <div className="summary-row total" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <span>Total Pay</span>
              <span>₹{finalPrice}</span>
           </div>
           <p className="listing-ref">{description || <span>For: <strong>{listingTitle}</strong></span>}</p>
        </div>

        <form className="payment-form" onSubmit={handlePayment}>
           <div className="form-group">
              <label>Card Number</label>
              <div className="card-input-wrapper">
                 <span className="card-icon">💳</span>
                 <input type="text" placeholder="0000 0000 0000 0000" className="card-input" required />
              </div>
           </div>
           
           <div className="form-row">
              <div className="form-group">
                 <label>Expiry</label>
                 <input type="text" placeholder="MM/YY" className="card-input" required />
              </div>
              <div className="form-group">
                 <label>CVC</label>
                 <input type="text" placeholder="123" className="card-input" required />
              </div>
           </div>

           <button type="submit" className="btn-pay" disabled={isProcessing}>
             {isProcessing ? 'Processing...' : `Pay ₹${planPrice}`}
           </button>
        </form>
        
        <div className="secure-badge">
           🔒 256-bit SSL Encrypted Payment
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
