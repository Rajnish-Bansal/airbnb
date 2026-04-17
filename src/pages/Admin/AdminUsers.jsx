import React, { useState } from 'react';
import { Search, MoreVertical, Trash2, Ban } from 'lucide-react';

const AdminUsers = () => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hostify_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error("Failed to fetch user directory:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = usersList.filter(u => 
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page-container">
      <div className="admin-header-actions" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>User Management</h2>
        <div className="search-bar" style={{ position: 'relative' }}>
           <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#717171' }} />
           <input 
             type="text" 
             placeholder="Search users..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             style={{ 
               padding: '10px 10px 10px 40px', 
               borderRadius: '50px', 
               border: '1px solid #ddd', 
               width: '300px',
               outline: 'none'
             }}
           />
        </div>
      </div>

      <div className="admin-table-container" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9f9f9', borderBottom: '1px solid #eee' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '16px', fontWeight: '600', color: '#555' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '16px', fontWeight: '600', color: '#555' }}>Role</th>
              <th style={{ textAlign: 'left', padding: '16px', fontWeight: '600', color: '#555' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '16px', fontWeight: '600', color: '#555' }}>Joined</th>
              <th style={{ textAlign: 'right', padding: '16px', fontWeight: '600', color: '#555' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', background: '#e0e0e0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '500' }}>{u.name}</div>
                      <div style={{ fontSize: '12px', color: '#717171' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '12px', 
                    background: u.role === 'Host' ? '#e6f7ff' : '#f6ffed', 
                    color: u.role === 'Host' ? '#1890ff' : '#52c41a',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    background: u.status === 'Active' ? '#f6ffed' : '#fff1f0', 
                    color: u.status === 'Active' ? '#52c41a' : '#f5222d',
                    fontSize: '12px'
                  }}>
                    {u.status}
                  </span>
                </td>
                <td style={{ padding: '16px', color: '#717171' }}>{u.joinDate}</td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                     <button 
                        onClick={() => suspendUser(u.id)}
                        title={u.status === 'Active' ? "Suspend" : "Activate"} 
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#faad14' }}
                     >
                        <Ban size={18} />
                     </button>
                     <button 
                        onClick={() => deleteUser(u.id)}
                        title="Delete" 
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ff4d4f' }}
                     >
                        <Trash2 size={18} />
                     </button>
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

export default AdminUsers;
