import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import './SubscriptionModal.css';

const SubscriptionModal = ({ isOpen, onClose, onConfirm, listingTitle, basePricePerUnit = 499, currentUnits = 0, totalInventory = 1 }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const availableToActivate = Math.max(0, totalInventory - currentUnits);
  const [targetUnits, setTargetUnits] = useState(Math.min(1, availableToActivate));

  React.useEffect(() => {
    if (isOpen) setTargetUnits(Math.min(1, availableToActivate));
  }, [isOpen, availableToActivate]);

  const finalPrice = targetUnits * basePricePerUnit;

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirm({ unitsActivated: targetUnits, finalPrice });
      onClose();
    }, 1500);
  };

  return (
    <div className="sub-modal-overlay">
      <div className="sub-modal-content">
        <div className="sub-modal-header">
          <h2>Activate Units</h2>
          <button className="close-btn-rounded" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="order-summary-pristine">
          {/* Listing info */}
          <div className="listing-info-block">
            <strong className="listing-name-bold">{listingTitle}</strong>
            <span className="listing-stats-subtext">
              {totalInventory} total &nbsp;|&nbsp; {currentUnits} active &nbsp;|&nbsp; {availableToActivate} available
            </span>
          </div>

          {availableToActivate > 0 ? (
            <>
              {/* Inline stepper */}
              <div className="unit-selector-row">
                <span className="unit-selector-label">How many units?</span>
                <div className="unit-selector-controls">
                  <button
                    type="button"
                    className="unit-btn unit-btn-minus"
                    onClick={() => setTargetUnits(u => Math.max(1, u - 1))}
                    disabled={targetUnits <= 1}
                  >
                    &#8722;
                  </button>
                  <span className="unit-count-display">{targetUnits}</span>
                  <button
                    type="button"
                    className="unit-btn unit-btn-plus"
                    onClick={() => setTargetUnits(u => Math.min(availableToActivate, u + 1))}
                    disabled={targetUnits >= availableToActivate}
                  >
                    &#43;
                  </button>
                </div>
              </div>

              {/* Divider & Total */}
              <div className="total-divider"></div>
              <div className="summary-row total-row-bold">
                <span>Total</span>
                <span>&#8377;{finalPrice}</span>
              </div>

              {/* CTA */}
              <button
                className="btn-pay-solid"
                onClick={handlePay}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Checkout \u2022 \u20B9${finalPrice}`}
              </button>
            </>
          ) : (
            <div className="all-active-notice">
              All units are currently active!
            </div>
          )}
        </div>

        <div className="secure-badge-pill">
          <Lock size={12} className="lock-icon" />
          <span>256-bit SSL Encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;

