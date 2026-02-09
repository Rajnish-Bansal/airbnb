import React from 'react';
import Navbar from '../../components/organisms/Navbar/Navbar';
import './Wishlist.css';
import { Star } from 'lucide-react';

const Wishlist = () => {
  const wishlistItems = [
    {
      id: 1,
      title: "Luxury Villa in Bali",
      location: "Bali, Indonesia",
      rating: 4.95,
      price: "₹15,000 / night",
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Beachfront Condo",
      location: "Miami, USA",
      rating: 4.88,
      price: "₹18,500 / night",
      image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Swiss Alps Chalet",
      location: "Zermatt, Switzerland",
      rating: 5.0,
      price: "₹25,000 / night",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop"
    }
  ];

  return (
    <>
      <Navbar />
      <div className="page-container">
        <h1 className="page-title">Wishlist</h1>
        
        <div className="wishlist-grid">
           {wishlistItems.map(item => (
             <div key={item.id} className="wishlist-card">
               <div className="wishlist-image" style={{backgroundImage: `url(${item.image})`}}>
                 <div className="saved-badge">
                   <Star size={16} fill="white" stroke="white" />
                 </div>
               </div>
               <div className="wishlist-info">
                  <div className="wishlist-header">
                     <h3 className="wishlist-title">{item.title}</h3>
                     <span className="rating"><Star size={14} fill="#222" /> {item.rating}</span>
                  </div>
                  <p className="wishlist-location">{item.location}</p>
                  <p className="wishlist-price">{item.price}</p>
               </div>
             </div>
           ))}
        </div>
      </div>
    </>
  );
};

export default Wishlist;
