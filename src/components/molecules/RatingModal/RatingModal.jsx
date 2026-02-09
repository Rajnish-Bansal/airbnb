import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import './RatingModal.css';

const RatingModal = ({ isOpen, onClose, booking, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    onSubmit({ rating, comment, booking });
    setRating(0);
    setComment('');
    onClose();
  };

  return (
    <div className="rating-modal-overlay" onClick={onClose}>
      <div className="rating-modal-content" onClick={e => e.stopPropagation()}>
        <div className="rating-modal-header">
          <h2>Rate your stay</h2>
          <button className="close-modal-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="rating-modal-body">
          <div className="booking-info">
            <div className="rating-modal-booking-image" style={{backgroundImage: `url(${booking.image})`}}></div>
            <div>
              <h3>{booking.title}</h3>
              <p>{booking.location}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="rating-stars">
              <label>Your rating</label>
              <div className="stars-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={40}
                    className="star-icon"
                    fill={star <= (hoverRating || rating) ? '#FFD700' : 'none'}
                    stroke={star <= (hoverRating || rating) ? '#FFD700' : '#ddd'}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </div>
            </div>

            <div className="rating-comment">
              <label>Your review (optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with future guests..."
                rows={5}
              />
            </div>

            <div className="rating-modal-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="submit-rating-btn">
                Submit Review
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
