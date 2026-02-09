import React, { useState, useEffect } from 'react';
import './LimitManagementModal.css';

const LimitManagementModal = ({ isOpen, onClose, currentLimit, currentUnits, onProceedToPay, onUpdateUnits }) => {
  const [targetUnits, setTargetUnits] = useState(currentUnits);
  const COST_PER_UNIT = 500;

  useEffect(() => {
    if (isOpen) setTargetUnits(currentUnits);
  }, [isOpen, currentUnits]);

  if (!isOpen) return null;

  // Logic:
  // 1. User selects desired Total Units (targetUnits)
  // 2. If targetUnits <= currentLimit -> Free update
  // 3. If targetUnits > currentLimit -> Pay for difference (targetUnits - currentLimit)

  const extraLimitNeeded = Math.max(0, targetUnits - currentLimit);
  const totalCost = extraLimitNeeded * COST_PER_UNIT;
  const isUpgrade = extraLimitNeeded > 0;

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setTargetUnits(val);
  };

  const handleProceed = () => {
    if (isUpgrade) {
        // Needs payment
        onProceedToPay({ 
            units: extraLimitNeeded, 
            cost: totalCost, 
            newLimit: currentLimit + extraLimitNeeded // which equals targetUnits
        });
        onClose();
    } else {
        // Just updating unit count within limit
        onUpdateUnits(targetUnits);
        onClose();
    }
  };

  return (
    <div className="limit-modal-overlay">
      <div className="limit-modal-content">
        <div className="limit-modal-header">
           <h2>Manage Slots</h2>
           <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="limit-body">
            <p className="limit-desc">
                Adjust your active inventory. Increasing beyond your current capacity of <strong>{currentLimit} slots</strong> will require an upgrade.
            </p>

            <div className="limit-controls">
                <div className="limit-display">
                    <div className="limit-box current">
                        <span className="lbl">Active Listings</span>
                        <span className="val">{currentUnits}</span>
                    </div>
                    <div className="arrow">➜</div>
                    <div className="limit-box new">
                        <span className="lbl">Target Slots</span>
                        <span className="val">{targetUnits}</span>
                    </div>
                </div>

                <div className="slider-container">
                    <input 
                        type="range" 
                        min={1} 
                        max={currentLimit + 10} 
                        value={targetUnits} 
                        onChange={handleSliderChange}
                        className="limit-slider"
                    />
                    <div className="slider-labels">
                        <span>1</span>
                        <span>{currentLimit} (Current)</span>
                        <span>{currentLimit + 10}</span>
                    </div>
                </div>

                <div className="cost-calculator">
                    <div className="calc-row">
                        <span>Current Slots:</span>
                        <strong>{currentLimit}</strong>
                    </div>
                     <div className="calc-row">
                        <span>Extra Slots Needed:</span>
                        <strong style={{ color: isUpgrade ? '#e31c5f' : '#047857' }}>{extraLimitNeeded}</strong>
                    </div>
                    {isUpgrade && (
                        <>
                            <div className="calc-row">
                                <span>Cost per Slot:</span>
                                <span>₹{COST_PER_UNIT}</span>
                            </div>
                            <div className="calc-row total">
                                <span>Upgrade Cost:</span>
                                <span className="price">₹{totalCost}</span>
                            </div>
                        </>
                    )}
                    {!isUpgrade && (
                         <div className="calc-row total">
                                <span>Cost:</span>
                                <span className="price" style={{ color: '#047857' }}>Free (Within Limit)</span>
                            </div>
                    )}
                </div>
            </div>

            <button 
                className="btn-proceed" 
                onClick={handleProceed}
                disabled={targetUnits === currentUnits}
            >
                {isUpgrade ? `Upgrade & Pay ₹${totalCost}` : 'Update Active Units'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default LimitManagementModal;
