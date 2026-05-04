import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [userBookings, setUserBookings] = useState([
    {
      id: 1,
      title: "Modern Loft in Downtown",
      location: "San Francisco",
      address: "789 Mission Street, San Francisco, CA 94103, USA",
      dates: "Dec 12 - Dec 18",
      guests: "1 guest",
      price: "₹18,500",
      status: "Confirmed",
      host: {
        name: "Sarah",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop"
      },
      code: "HMZX7892",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop"
    },
    {
       id: 3,
       title: "Secluded Treehouse",
       location: "Kerala",
       address: "123 Rainforest Lane, Wayanad, Kerala 673121, India",
       dates: "Jan 15 - Jan 20",
       guests: "1 guest",
       price: "₹45,000",
       status: "Pending Approval",
       host: {
         name: "Arjun",
         image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop"
       },
       code: "REQ9988",
       image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop"
     }
  ]);

  const addBooking = (booking) => {
    const newBooking = {
      ...booking,
      id: Date.now(),
      status: 'Confirmed',
      code: 'RES' + Math.floor(1000 + Math.random() * 9000)
    };
    setUserBookings(prev => [newBooking, ...prev]);
  };

  const cancelBooking = (id) => {
    setUserBookings(prev => prev.filter(b => b.id !== id));
  };

  return (
    <BookingContext.Provider value={{ userBookings, addBooking, cancelBooking }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
