import React, { useState, useEffect } from 'react';
import Navbar from '../../components/organisms/Navbar/Navbar';
import './Wallet.css';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Plus, ArrowUpRight, ArrowDownLeft, Wallet as WalletIcon, Loader2, ChevronLeft } from 'lucide-react';
import { fetchTransactions } from '../../services/api';

const Wallet = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await fetchTransactions();
        setTransactions(data);
      } catch (err) {
        console.error('Failed to load transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTransactions();
  }, []);



  return (
    <>
      <Navbar />
      <div className="wallet-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
            onMouseOver={(e) => e.currentTarget.style.background = '#f7f7f7'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="page-title" style={{ margin: 0 }}>Payments & Transactions</h1>
        </div>
        




        <div className="transactions-list">
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <Loader2 className="animate-spin" size={32} color="var(--primary)" />
              </div>
            ) : transactions.length > 0 ? (
              transactions.map(t => (
                <div key={t._id} className="transaction-item">
                   <div className={`transaction-icon ${t.type.toLowerCase()}`}>
                      {t.type === 'Credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                   </div>
                   <div className="transaction-info">
                      <div className="t-title">{t.description || t.category}</div>
                      <div className="t-date" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                        <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                        <span style={{ opacity: 0.5 }}>•</span>
                        <span>Ref: {t._id.substring(t._id.length - 8).toUpperCase()}</span>
                        {t.metadata?.bookingCode && (
                          <>
                            <span style={{ opacity: 0.5 }}>•</span>
                            <span>Booking ID: {t.metadata.bookingCode}</span>
                          </>
                        )}
                      </div>
                   </div>
                   <div className={`t-amount ${t.type.toLowerCase()}`}>
                     {t.type === 'Credit' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                   </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#717171' }}>
                No transactions found.
              </div>
            )}
         </div>

      </div>
    </>
  );
};

export default Wallet;
