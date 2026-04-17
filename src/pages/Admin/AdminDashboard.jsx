import React from 'react';
import { useHost } from '../../context/HostContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { ShoppingBag, Users as UsersIcon, List, AlertCircle, TrendingUp } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [realStats, setRealStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const { listings } = useHost();
  
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('hostify_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setRealStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const pendingListings = listings.filter(l => l.status === 'Pending');
  
  const stats = [
    { 
      label: 'Total Revenue', 
      value: realStats?.totalRevenue || '₹0.00', 
      icon: <TrendingUp size={24} />, 
      color: '#1890ff', 
      bg: '#e6f7ff' 
    },
    { 
      label: 'Total Users', 
      value: realStats?.totalUsers || 0, 
      icon: <UsersIcon size={24} />, 
      color: '#52c41a', 
      bg: '#f6ffed' 
    },
    { 
      label: 'Active Listings', 
      value: realStats?.activeListings || 0, 
      icon: <ShoppingBag size={24} />, 
      color: '#722ed1', 
      bg: '#f9f0ff' 
    },
    { 
      label: 'Pending Approval', 
      value: realStats?.pendingListings || pendingListings.length, 
      icon: <AlertCircle size={24} />, 
      color: '#faad14', 
      bg: '#fffbe6' 
    },
  ];

  return (
    <div className="admin-dashboard">
      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ color: stat.color, backgroundColor: stat.bg }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content-grid">
        {/* Recent Activity / Pending Approvals */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3>Pending Approvals</h3>
            <Link to="/admin/listings" className="see-all-link">See All</Link>
          </div>
          
          <div className="recent-list">
            {pendingListings.length === 0 ? (
              <div className="empty-state-small">No pending approvals.</div>
            ) : (
              pendingListings.slice(0, 5).map(l => (
                <div key={l.id} className="recent-item">
                   <div className="item-icon-wrapper">
                     <List size={16} />
                   </div>
                   <div className="item-details">
                     <span className="item-title">{l.title}</span>
                     <span className="item-subtitle">{l.location}</span>
                   </div>
                   <span className="item-status pending">Pending</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Health / Quick Actions (Placeholder) */}
        <div className="dashboard-section">
           <div className="section-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="quick-actions-grid">
             <Link to="/admin/users" className="action-card">
                <UsersIcon size={20} />
                <span>Manage Users</span>
             </Link>
             <Link to="/admin/listings" className="action-card">
                <List size={20} />
                <span>Review Listings</span>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
