import React, { useState } from 'react';
import { useHost } from '../../context/HostContext';
import { Search, Eye, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminListings = () => {
  const { listings, approveListing, rejectListing, deleteListing } = useHost();
  const [filter, setFilter] = useState('All'); // All, Pending, Active, Rejected
  const [searchTerm, setSearchTerm] = useState('');

  const filteredListings = listings.filter(l => {
    const matchesFilter = filter === 'All' ? true : 
                          filter === 'Active' ? (l.status === 'Active' || l.status === 'Payment Required') :
                          l.status === filter;
    const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return '#52c41a';
      case 'Pending': return '#faad14';
      case 'Rejected': return '#f5222d';
      case 'Payment Required': return '#1890ff';
      default: return '#8c8c8c';
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-header-actions" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Listing Management</h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          {['All', 'Pending', 'Active', 'Rejected'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? '#222' : 'white',
                color: filter === f ? 'white' : '#222',
                border: '1px solid #ddd',
                padding: '8px 16px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-table-container" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9f9f9', borderBottom: '1px solid #eee' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '16px', fontWeight: '600', color: '#555' }}>Property</th>
              <th style={{ textAlign: 'left', padding: '16px', fontWeight: '600', color: '#555' }}>Location</th>
              <th style={{ textAlign: 'left', padding: '16px', fontWeight: '600', color: '#555' }}>Type</th>
              <th style={{ textAlign: 'left', padding: '16px', fontWeight: '600', color: '#555' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '16px', fontWeight: '600', color: '#555' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredListings.length === 0 ? (
                <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#888' }}>
                        No listings found
                    </td>
                </tr>
            ) : filteredListings.map((l) => (
              <tr key={l.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', background: '#eee' }}>
                       {l.photos && l.photos[0] ? (
                           <img src={typeof l.photos[0] === 'string' ? l.photos[0] : l.photos[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                       ) : (
                           <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#aaa' }}>No Image</div>
                       )}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{l.title || 'Untitled'}</div>
                      <div style={{ fontSize: '12px', color: '#717171' }}>ID: {String(l.id).slice(-6)}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px', color: '#444' }}>{l.location}</td>
                <td style={{ padding: '16px', color: '#444' }}>{l.type}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '12px', 
                    border: `1px solid ${getStatusColor(l.status)}`,
                    color: getStatusColor(l.status),
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {l.status}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                     <Link to={`/rooms/${l.id}`} title="View" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: '#f0f0f0', color: '#222' }}>
                        <Eye size={16} />
                     </Link>
                     
                     <button 
                        onClick={() => deleteListing(l.id)}
                        title="Delete" 
                        style={{ border: 'none', width: '32px', height: '32px', borderRadius: '50%', background: '#fff1f0', color: '#ff4d4f', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                     >
                        <Trash2 size={16} />
                     </button>

                     {l.status === 'Pending' && (
                        <>
                            <button 
                                onClick={() => approveListing(l.id)}
                                title="Approve" 
                                style={{ border: 'none', width: '32px', height: '32px', borderRadius: '50%', background: '#f6ffed', color: '#52c41a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <CheckCircle size={16} />
                            </button>
                            <button 
                                onClick={() => rejectListing(l.id)}
                                title="Reject" 
                                style={{ border: 'none', width: '32px', height: '32px', borderRadius: '50%', background: '#fff1f0', color: '#f5222d', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <XCircle size={16} />
                            </button>
                        </>
                     )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminListings;
