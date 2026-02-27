import React from 'react';
import { useHost } from '../../context/HostContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { ShoppingBag, Users as UsersIcon, List, AlertCircle, TrendingUp } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { listings } = useHost();
  const { user, allUsers } = useAuth(); 
  
  const pendingListings = listings.filter(l => l.status === 'Pending');
  const activeListings = listings.filter(l => l.status === 'Active' || l.status === 'Payment Required');
  
  // Calculate Stats
  const totalUsers = (allUsers?.length || 0) + (user ? 1 : 0); // Mock + Current
  
  // Mock Revenue Calculation: Sum of price * 3 (avg nights) for active listings
  const revenueValue = activeListings.reduce((acc, curr) => acc + (Number(curr.price) || 0) * 3, 0);
  const totalRevenue = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(revenueValue + 4500000); // Base revenue + dynamic
  
  const stats = [
    { label: 'Total Revenue', value: totalRevenue, icon: <TrendingUp size={24} />, color: '#1890ff', bg: '#e6f7ff' },
    { label: 'Total Users', value: totalUsers, icon: <UsersIcon size={24} />, color: '#52c41a', bg: '#f6ffed' },
    { label: 'Active Listings', value: activeListings.length, icon: <ShoppingBag size={24} />, color: '#722ed1', bg: '#f9f0ff' },
    { label: 'Pending Approval', value: pendingListings.length, icon: <AlertCircle size={24} />, color: '#faad14', bg: '#fffbe6' },
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
