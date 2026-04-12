import React from 'react';
import Navbar from '../../components/organisms/Navbar/Navbar';
import './Notifications.css';

const Notifications = () => {
  const notifications = [
    {
      id: 1,
      title: "Booking Confirmed",
      message: "Your reservation for 'Mountain Retreat' has been confirmed by the host.",
      date: "2 hours ago",
      read: false
    },
    {
      id: 2,
      title: "Welcome to Hostify",
      message: "Finish setting up your profile to start your journey.",
      date: "1 day ago",
      read: true
    },
    {
      id: 3,
      title: "Price Drop Alert",
      message: "A property in your wishlist 'Goa Beach House' has dropped in price.",
      date: "3 days ago",
      read: true
    }
  ];

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="content-wrapper">
          <h1 className="page-title">Notifications</h1>
          
          <div className="notifications-list">
            {notifications.map(note => (
              <div key={note.id} className={`notification-item ${!note.read ? 'unread' : ''}`}>
                <div className="note-content">
                  <h3 className="note-title">{note.title}</h3>
                  <p className="note-message">{note.message}</p>
                  <span className="note-date">{note.date}</span>
                </div>
                {!note.read && <div className="unread-dot"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Notifications;
