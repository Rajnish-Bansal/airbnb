import React from 'react';
import { useHost } from '../../context/HostContext';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Shield } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { listings, approveListing, rejectListing } = useHost();
  
  const pendingListings = listings.filter(l => l.status === 'Pending');
  const otherListings = listings.filter(l => l.status !== 'Pending');

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-brand">
          <Shield size={24} className="admin-icon" />
          <h1>Admin Portal</h1>
        </div>
        <div className="admin-user">
          Administrator
        </div>
      </header>

      <main className="admin-main">
        <section className="admin-section">
          <h2>⚠️ Pending Approval ({pendingListings.length})</h2>
          
          {pendingListings.length === 0 ? (
            <div className="empty-state">
              <p>No listings waiting for approval.</p>
            </div>
          ) : (
            <div className="admin-grid">
              {pendingListings.map(listing => (
                <div key={listing.id} className="admin-card pending">
                   <div className="card-header">
                      <span className="badge pending">Pending</span>
                      <span className="date">{new Date(listing.createdAt).toLocaleDateString()}</span>
                   </div>
                   
                   <div className="card-body">
                      <h3>{listing.title || 'Untitled Listing'}</h3>
                      <p>{listing.location}</p>
                      <div className="card-meta">
                         <span>{listing.type}</span> • <span>₹{listing.price}/night</span>
                      </div>
                   </div>

                   <div className="card-actions">
                      <button className="btn-reject" onClick={() => rejectListing(listing.id)}>
                        <XCircle size={16} /> Reject
                      </button>
                      <button className="btn-approve" onClick={() => approveListing(listing.id)}>
                        <CheckCircle size={16} /> Approve
                      </button>
                   </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="admin-section">
          <h2>All Listings ({otherListings.length})</h2>
          <div className="simple-table">
             <div className="table-row header">
                <div>ID</div>
                <div>Title</div>
                <div>Host</div>
                <div>Status</div>
             </div>
             {otherListings.map(l => (
               <div key={l.id} className="table-row">
                  <div>{String(l.id).slice(-4)}</div>
                  <div>{l.title}</div>
                  <div>{l.location}</div>
                  <div><span className={`status-pill ${l.status.toLowerCase().replace(' ', '-')}`}>{l.status}</span></div>
               </div>
             ))}
          </div>
        </section>
      </main>

      <Link to="/" className="back-link">Back to Home</Link>
    </div>
  );
};

export default AdminDashboard;
