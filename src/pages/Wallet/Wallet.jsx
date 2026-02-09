import React from 'react';
import Navbar from '../../components/organisms/Navbar/Navbar';
import './Wallet.css';
import { CreditCard, Plus, ArrowUpRight, ArrowDownLeft, Wallet as WalletIcon } from 'lucide-react';

const Wallet = () => {
  const transactions = [
    { id: 1, title: "Refund for Stay in Paris", date: "Jan 12, 2024", amount: "+₹4,500", type: "credit" },
    { id: 2, title: "Booking: Beachfront Condo", date: "Dec 14, 2023", amount: "-₹18,500", type: "debit" },
    { id: 3, title: "Gift Card Redeemed", date: "Nov 28, 2023", amount: "+₹5,000", type: "credit" }
  ];

  return (
    <>
      <Navbar />
      <div className="wallet-container">
        <h1 className="page-title">Wallet</h1>
        
        {/* Balance Structure */}
        <div className="balance-card">
           <div className="balance-header">
              <span className="balance-label">Available Balance</span>
              <WalletIcon size={24} color="white" />
           </div>
           <div className="balance-amount">₹9,500</div>
           <div className="balance-expiry">Credits expire on Dec 31, 2026</div>
        </div>

        {/* Payment Methods */}
        <div className="section-header">
           <h2>Payment Methods</h2>
           <button className="add-btn"><Plus size={16} /> Add New</button>
        </div>
        
        <div className="cards-grid">
           <div className="payment-method-card">
              <div className="card-logo">VISA</div>
              <div className="card-number">•••• 4242</div>
              <div className="card-expiry">Expires 12/28</div>
           </div>
           
           <div className="payment-method-card mastercard">
              <div className="card-logo">Mastercard</div>
              <div className="card-number">•••• 8899</div>
              <div className="card-expiry">Expires 09/25</div>
           </div>
        </div>

        {/* Transactions */}
        <div className="section-header" style={{marginTop: '40px'}}>
           <h2>Transaction History</h2>
        </div>

        <div className="transactions-list">
           {transactions.map(t => (
             <div key={t.id} className="transaction-item">
                <div className={`transaction-icon ${t.type}`}>
                   {t.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div className="transaction-info">
                   <div className="t-title">{t.title}</div>
                   <div className="t-date">{t.date}</div>
                </div>
                <div className={`t-amount ${t.type}`}>{t.amount}</div>
             </div>
           ))}
        </div>

      </div>
    </>
  );
};

export default Wallet;
