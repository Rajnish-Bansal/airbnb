import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useHost } from '../../context/HostContext';
import { useAuth } from '../../context/AuthContext';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, parseISO, isWithinInterval } from 'date-fns';
import { ChevronLeft, ChevronRight, Download, Trash2, Camera, Upload, Link2, Star, Eye, DollarSign, Calendar, TrendingUp, IndianRupee, Info, MessageSquare, CreditCard, ShieldCheck, Wallet } from 'lucide-react';
import './HostDashboard.css';
import { generateICalData } from '../../utils/icalGenerator';
import ConfirmationModal from '../../components/molecules/ConfirmationModal/ConfirmationModal';
import SubscriptionModal from '../../components/molecules/SubscriptionModal/SubscriptionModal';
import LimitManagementModal from '../../components/molecules/LimitManagementModal/LimitManagementModal';
import PricingModal from '../../components/molecules/PricingModal/PricingModal';
import { fetchPayoutStats, fetchHostAnalytics, updateListingPricing } from '../../services/api';

const HostDashboard = () => {
  const { listings, updateListingStatus, loadListingForEdit, deleteListing, resetListingData, activateUnits } = useHost();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Performance Analytics State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Read from URL, fallback to defaults
  const activeTab = searchParams.get('tab') || 'overview';
  const listingFilter = searchParams.get('filter') || 'All';

  // Helper functions to update URL
  const setActiveTab = (tab) => {
    setSearchParams(prev => {
      prev.set('tab', tab);
      // Optional: Reset filter when switching away from listings tab
      if (tab !== 'listings') prev.delete('filter');
      return prev;
    });
  };

  const setListingFilter = (filter) => {
    setSearchParams(prev => {
      prev.set('filter', filter);
      return prev;
    });
  };

  const [selectedListingId, setSelectedListingId] = useState('all');
  const selectedListing = selectedListingId === 'all' ? null : listings.find(l => l.id === selectedListingId);

  // Unsaved Changes State for Calendar
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handlePriceChange = () => {
     setHasUnsavedChanges(true);
  };

  const handleSaveChanges = () => {
     // In a real app, this would trigger an API call to save all modified dates
     setHasUnsavedChanges(false);
     
     if (selectedDatesToBlock.length > 0) {
        if (selectedListingId === 'all') {
           alert("Please select a specific listing to block dates for.");
           return;
        }

         const activeLimit = selectedListing ? getListingLimit(selectedListing.id) : 1;

         // Double Booking Check based on unit count
         const hasConflict = selectedDatesToBlock.some(dateStr => {
            const blockDate = new Date(dateStr);
            blockDate.setHours(0,0,0,0);
            
            // Count existing reservations/blocks for this date
            const existingCount = reservations.filter(res => {
               if (res.listingId !== Number(selectedListingId)) return false;
               
               const start = new Date(res.startDate);
               start.setHours(0,0,0,0);
               const end = new Date(res.endDate);
               end.setHours(0,0,0,0);
               
               return blockDate >= start && blockDate <= end;
            }).length;

            return existingCount >= activeLimit;
         });

         if (hasConflict) {
            alert("Double Booking Prevented: One or more of the selected dates already have a guest reservation. Please deselect them and try again.");
            return;
         }

        const newBlocks = selectedDatesToBlock.map((dateStr, i) => ({
           id: Date.now() + i,
           listingId: Number(selectedListingId),
           guest: 'Unavailable',
           dates: format(new Date(dateStr), 'MMM dd'),
           startDate: dateStr,
           endDate: dateStr,
           price: '-',
           status: 'Unavailable'
        }));

        setReservations(prev => [...prev, ...newBlocks]);
        setIsBlockingMode(false);
        setSelectedDatesToBlock([]);
     }

     alert("Changes saved successfully!");
  };

  const handleCancelChanges = () => {
     // In a real app, this would reset the local state arrays to match the server data
     setHasUnsavedChanges(false);
     setIsBlockingMode(false);
     setSelectedDatesToBlock([]);
  };

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);

  const handleDeleteClick = (id) => {
    setListingToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (listingToDelete) {
      deleteListing(listingToDelete);
      setIsDeleteModalOpen(false);
      setListingToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setListingToDelete(null);
  };

  // Subscription Modal State
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [listingToSubscribe, setListingToSubscribe] = useState(null);
  
  // Pricing Modal State
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [listingToPrice, setListingToPrice] = useState(null);

  // Limit Manager State
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  
  // Inventory Management State (now driven by listing.activeSubscriptionUnits from HostContext)
  
  // Messages State
  const [mockMessages, setMockMessages] = useState([
    { id: 1, guest: 'Alice Johnson', text: 'Hi, is early check-in possible?', time: '10:00 AM', isHost: false },
    { id: 2, guest: 'Charlie Brown', text: 'Thank you for the wonderful stay!', time: 'Yesterday', isHost: false },
  ]);
  const [activeMessageGuest, setActiveMessageGuest] = useState('Alice Johnson');
  const [newMessageText, setNewMessageText] = useState('');

  const handleSendMessage = () => {
    if (!newMessageText.trim()) return;
    setMockMessages(prev => [...prev, {
      id: Date.now(),
      guest: activeMessageGuest,
      text: newMessageText,
      time: 'Just now',
      isHost: true
    }]);
    setNewMessageText('');
  };

  // iCal Automated Sync State
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncUrl, setSyncUrl] = useState('');
  const [syncedCalendars, setSyncedCalendars] = useState([]); // Array of URLs

  const handleMockAutoSync = (url) => {
    if (selectedListingId === 'all') {
      alert("Please select a specific listing to enable auto-sync.");
      return;
    }

    const today = new Date();
    const mockBlockStart = new Date(today);
    mockBlockStart.setDate(mockBlockStart.getDate() + 14); // 2 weeks out
    
    const mockBlockEnd = new Date(mockBlockStart);
    mockBlockEnd.setDate(mockBlockEnd.getDate() + 2); // 3 days block

    const newBlocks = eachDayOfInterval({start: mockBlockStart, end: mockBlockEnd}).map((day, i) => ({
       id: Date.now() + i + 2000,
       listingId: Number(selectedListingId),
       guest: 'Auto Synced',
       dates: format(new Date(day), 'MMM dd'),
       startDate: day.toISOString(),
       endDate: day.toISOString(),
       price: '-',
       status: 'Unavailable'
    }));

    setReservations(prev => [...prev, ...newBlocks]);
    try {
      alert(`Successfully synced events from ${new URL(url).hostname}. Added 3 blocked dates.`);
    } catch {
      alert(`Successfully synced events from external calendar. Added 3 blocked dates.`);
    }
  };

  // Replace faux state limits with real data logic
  const getListingLimit = (id) => {
     const listing = listings.find(l => l.id === id);
     return listing?.activeSubscriptionUnits || 0;
  };

  const getListingTotalInventory = (id) => {
     const listing = listings.find(l => l.id === id);
     if (!listing) return 1;
     // If listing has units defined directly, use that
     if (listing.unitCount) return listing.unitCount;
     // For hotels/complexes, calculate total physical inventory from rooms
     if (listing.rooms && listing.rooms.length > 0) {
        return listing.rooms.reduce((acc, room) => acc + (parseInt(room.quantity) || 0), 0);
     }
     return 1;
  };

  const handleSubscribe = (id) => {
     const listing = listings.find(l => l.id === id);
     if (listing) {
        setListingToSubscribe(listing);
        setIsSubModalOpen(true);
     }
  };

  const handlePaymentSuccess = (data) => {
     if (listingToSubscribe) {
         // data = { unitsActivated: number, finalPrice: number }
         activateUnits(listingToSubscribe.id, data.unitsActivated);
         alert(`Success! You have activated ${data.unitsActivated} unit(s) for ${listingToSubscribe.title}.`);
     }
     
     setIsSubModalOpen(false);
     setListingToSubscribe(null);
  };

  const handleEdit = (listing) => {
    loadListingForEdit(listing);
    navigate('/become-a-host/step1');
  };

  const handleOpenPricing = (listing) => {
    setListingToPrice(listing);
    setIsPricingModalOpen(true);
  };

  const handleUpdatePricing = async (listingId, pricingData) => {
    const updatedListing = await updateListingPricing(listingId, pricingData);
    // Ideally update local listings state or context here
    alert("Pricing updated successfully!");
    window.location.reload(); // Quick way to sync for now
  };

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTxnTab, setActiveTxnTab] = useState('bookings');
  const [txnStartDate, setTxnStartDate] = useState('');
  const [txnEndDate, setTxnEndDate] = useState('');

  // Profile State
  const [profile, setProfile] = useState({
    name: user?.name || 'Host User',
    email: user?.email || 'host@example.com',
    phone: '+91 98765 43210',
    bio: 'Superhost since 2023. I love hosting travelers from around the world!',
    avatar: null 
  });

  const handleProfileUpdate = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile(prev => ({ ...prev, avatar: URL.createObjectURL(file) }));
    }
  };


  // Financial Details State
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifsc: '',
    holderName: '',
    bankName: ''
  });

  const [taxInfo, setTaxInfo] = useState({
    pan: '',
    gstin: ''
  });

  // Host Type State
  const [hostType, setHostType] = useState('individual'); // 'individual' or 'company'
  const [companyDetails, setCompanyDetails] = useState({
    name: '',
    pan: '',
    gstin: ''
  });



  const handleTaxUpdate = (e) => {
    const { name, value } = e.target;
    setTaxInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleCompanyUpdate = (e) => {
    const { name, value } = e.target;
    setCompanyDetails(prev => ({ ...prev, [name]: value }));
  };

  const POPULAR_BANKS = [
    'State Bank of India',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'Kotak Mahindra Bank',
    'Punjab National Bank',
    'Bank of Baroda',
    'Canara Bank',
    'Union Bank of India',
    'IndusInd Bank',
    'IDFC First Bank',
    'Yes Bank'
  ];

  const handleBankUpdate = (e) => {
    const { name, value } = e.target;
    setBankDetails(prev => ({ ...prev, [name]: value }));
  };
  
  // Real Payout Data State
  const [payoutData, setPayoutData] = useState(null);
  const [loadingPayouts, setLoadingPayouts] = useState(true);

  React.useEffect(() => {
    const getPayoutStats = async () => {
      try {
        const data = await fetchPayoutStats();
        setPayoutData(data);
      } catch (err) {
        console.error("Failed to fetch payout stats:", err);
      } finally {
        setLoadingPayouts(false);
      }
    };
    if (activeTab === 'financials' || activeTab === 'overview') {
      getPayoutStats();
    }
  }, [activeTab]);

  React.useEffect(() => {
    const getAnalytics = async () => {
      try {
        setLoadingAnalytics(true);
        const data = await fetchHostAnalytics();
        setAnalyticsData(data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoadingAnalytics(false);
      }
    };
    if (activeTab === 'performance' || activeTab === 'overview') {
      getAnalytics();
    }
  }, [activeTab]);

  // Mock Data for "Interactive" feel
  const stats = {
    earnings: '₹45,000',
    views: 128,
    bookings: 3,
    rating: 4.8
  };

  // Mock Reservations with listingId (Now stateful so we can add blocks)
  const [reservations, setReservations] = useState([
    { id: 1, listingId: 1700001, guest: 'Alice Johnson', dates: 'Oct 12 - 15', startDate: '2025-10-12', endDate: '2025-10-15', price: '₹12,400', status: 'Confirmed', img: 'https://i.pravatar.cc/150?u=alice', rating: 4.9 },
    { id: 2, listingId: 1700001, guest: 'Bob Smith', dates: 'Nov 02 - 05', startDate: '2025-11-02', endDate: '2025-11-05', price: '₹8,200', status: 'Pending', img: 'https://i.pravatar.cc/150?u=bob', rating: 4.5 },
    { id: 3, listingId: 1700002, guest: 'Charlie Brown', dates: 'Feb 10 - 14', startDate: '2026-02-10', endDate: '2026-02-14', price: '₹34,000', status: 'Confirmed', img: 'https://i.pravatar.cc/150?u=charlie', rating: 5.0 },
    { id: 4, listingId: 1700003, guest: 'David Lee', dates: 'Feb 12 - 15', startDate: '2026-02-12', endDate: '2026-02-15', price: '₹30,000', status: 'Confirmed', img: 'https://i.pravatar.cc/150?u=david', rating: 4.2 },
    // Mock high-volume overlapping bookings
    { id: 5, listingId: 1700001, guest: 'Eve A', dates: 'Mar 10 - 12', startDate: '2026-03-10', endDate: '2026-03-12', price: '₹4,000', status: 'Confirmed', img: 'https://i.pravatar.cc/150?u=5', rating: 4.8 },
    { id: 6, listingId: 1700002, guest: 'Frank B', dates: 'Mar 10 - 12', startDate: '2026-03-10', endDate: '2026-03-12', price: '₹5,000', status: 'Confirmed', img: 'https://i.pravatar.cc/150?u=6', rating: 4.7 },
    { id: 7, listingId: 1700003, guest: 'Grace C', dates: 'Mar 10 - 12', startDate: '2026-03-10', endDate: '2026-03-12', price: '₹6,000', status: 'Confirmed', img: 'https://i.pravatar.cc/150?u=7', rating: 4.9 },
    { id: 8, listingId: 1700001, guest: 'Heidi D', dates: 'Mar 10 - 12', startDate: '2026-03-10', endDate: '2026-03-12', price: '₹4,000', status: 'Confirmed', img: 'https://i.pravatar.cc/150?u=8', rating: 5.0 },
    { id: 9, listingId: 1700002, guest: 'Ivan E', dates: 'Mar 10 - 12', startDate: '2026-03-10', endDate: '2026-03-12', price: '₹5,000', status: 'Confirmed', img: 'https://i.pravatar.cc/150?u=9', rating: 4.6 },
    { id: 10, listingId: 1700003, guest: 'Judy F', dates: 'Mar 10 - 12', startDate: '2026-03-10', endDate: '2026-03-12', price: '₹6,000', status: 'Confirmed', img: 'https://i.pravatar.cc/150?u=10', rating: 4.9 },
    { id: 11, listingId: 1700001, guest: 'Kevin G', dates: 'Mar 10 - 12', startDate: '2026-03-10', endDate: '2026-03-12', price: '₹4,000', status: 'Confirmed', img: 'https://i.pravatar.cc/150?u=11', rating: 4.8 },
    { id: 12, listingId: 1700002, guest: 'Liam H', dates: 'Mar 10 - 12', startDate: '2026-03-10', endDate: '2026-03-12', price: '₹5,000', status: 'Confirmed', img: 'https://i.pravatar.cc/150?u=12' },
    { id: 13, listingId: 1700003, guest: 'Mia I', dates: 'Mar 10 - 12', startDate: '2026-03-10', endDate: '2026-03-12', price: '₹6,000', status: 'Confirmed', img: 'https://i.pravatar.cc/150?u=13' },
    { id: 14, listingId: 1700001, guest: 'Noah J', dates: 'Mar 10 - 12', startDate: '2026-03-10', endDate: '2026-03-12', price: '₹4,000', status: 'Confirmed', img: 'https://i.pravatar.cc/150?u=14' },
  ]);

  // Inline Block Dates State
  const [isBlockingMode, setIsBlockingMode] = useState(false);
  const [selectedDatesToBlock, setSelectedDatesToBlock] = useState([]);

  const toggleDateSelection = (dateString) => {
    setSelectedDatesToBlock(prev => 
      prev.includes(dateString) 
        ? prev.filter(d => d !== dateString)
        : [...prev, dateString]
    );
  };





  const handleRemoveBlock = (blockId) => {
    setReservations(prev => prev.filter(res => res.id !== blockId));
  };

  // Mock Transactions Data
  const mockTransactions = [
    { id: 'TX-1001', date: '2025-10-15', type: 'Payout', description: 'Payout for Alice Johnson', amount: 12400, status: 'Completed', method: 'Bank Transfer •••• 4242' },
    { id: 'TX-1002', date: '2025-11-01', type: 'Payment', description: 'Professional Host Plan (Monthly)', amount: -999, status: 'Completed', method: 'Visa •••• 1234', propertyName: 'Seaside Villa', expiryDate: '2025-12-01' },
    { id: 'TX-1003', date: '2025-11-05', type: 'Payout', description: 'Payout for Bob Smith', amount: 8200, status: 'Completed', method: 'Bank Transfer •••• 4242' },
    { id: 'TX-1004', date: '2025-12-01', type: 'Payment', description: 'Professional Host Plan (Monthly)', amount: -999, status: 'Completed', method: 'Visa •••• 1234', propertyName: 'Seaside Villa', expiryDate: '2026-01-01' },
    { id: 'TX-1005', date: '2026-01-01', type: 'Payment', description: 'Professional Host Plan (Monthly)', amount: -999, status: 'Completed', method: 'Visa •••• 1234', propertyName: 'Seaside Villa', expiryDate: '2026-02-01' },
    { id: 'TX-1006', date: '2026-02-01', type: 'Payment', description: 'Professional Host Plan (Monthly)', amount: -999, status: 'Completed', method: 'Visa •••• 1234', propertyName: 'Mountain Retreat', expiryDate: '2026-03-01' },
    { id: 'TX-1007', date: '2026-02-14', type: 'Payout', description: 'Payout for Charlie Brown', amount: 34000, status: 'Completed', method: 'Bank Transfer •••• 4242' },
  ];

  /* Calendar Logic */
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getDailyReservations = (day) => {
     return reservations.filter(res => {
        if (selectedListingId !== 'all' && res.listingId != selectedListingId) return false;
        
        // Hide unavailable blocks from the "All Listings" view
        if (selectedListingId === 'all' && res.status === 'Unavailable') return false;

        // Simple check if day matches start or is within range (simulated)
        const start = new Date(res.startDate);
        const end = new Date(res.endDate);
        // Reset times for accurate comparison
        start.setHours(0,0,0,0);
        end.setHours(0,0,0,0);
        day.setHours(0,0,0,0);
        
        return day >= start && day <= end;
     });
  };

  const handleCreateNew = () => {
    resetListingData();
    navigate('/become-a-host/step1');
  };

  const handleExportCal = () => {
    const data = generateICalData(reservations, listings, selectedListingId);
    const blob = new Blob([data], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Hostify_calendar_${selectedListingId === 'all' ? 'all' : selectedListingId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCal = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (selectedListingId === 'all') {
      alert("Please select a specific listing to import calendar data.");
      return;
    }

    // Mock importing logic - adds some blocks 7 days from now to simulate parsed external reservations
    const today = new Date();
    const mockBlockStart = new Date(today);
    mockBlockStart.setDate(mockBlockStart.getDate() + 7);
    
    const mockBlockEnd = new Date(mockBlockStart);
    mockBlockEnd.setDate(mockBlockEnd.getDate() + 3);

    const newBlocks = eachDayOfInterval({start: mockBlockStart, end: mockBlockEnd}).map((day, i) => ({
       id: Date.now() + i + 1000,
       listingId: Number(selectedListingId),
       guest: 'iCal Import',
       dates: format(new Date(day), 'MMM dd'),
       startDate: day.toISOString(),
       endDate: day.toISOString(),
       price: '-',
       status: 'Unavailable' // imported as unavailable chunk
    }));

     setReservations(prev => [...prev, ...newBlocks]);
     alert(`${file.name} imported successfully. 4 new blocks added.`);
     e.target.value = null;
   };

   // Mock Guest Reviews Data
   const [guestReviews] = useState([
     {
        id: 'R-001',
        guestName: 'Sarah Jenkins',
        guestPhoto: '👩🏽',
        listingName: 'Luxury Seaside Villa',
        date: 'October 2025',
        rating: 5,
        text: 'Absolutely stunning property! The views were breathtaking and the host was incredibly responsive. We will definitely be coming back next summer.',
        responseTime: 'Responded in 1 hour'
     },
     {
        id: 'R-002',
        guestName: 'David Chen',
        guestPhoto: '👨🏻',
        listingName: 'Mountain Retreat in Manali',
        date: 'November 2025',
        rating: 4,
        text: 'Great cabin with lots of charm. It got a bit cold at night, but the fireplace made up for it. Perfect location for hiking.',
        responseTime: ''
     },
     {
        id: 'R-003',
        guestName: 'Emily & Tom',
        guestPhoto: '👫🏼',
        listingName: 'Cozy Downtown Apartment',
        date: 'December 2025',
        rating: 5,
        text: 'The best location! We walked everywhere. The apartment was spotless and exactly as pictured. Highly recommend for a city break.',
        responseTime: 'Responded in 30 mins'
     },
     {
        id: 'R-004',
        guestName: 'Michael Rossi',
        guestPhoto: '👨🏽‍rt',
        listingName: 'Luxury Seaside Villa',
        date: 'January 2026',
        rating: 5,
        text: 'Five stars across the board. The amenities were top-notch and the check-in process was seamless. A true luxury experience.',
        responseTime: ''
     }
   ]);

  const filteredListings = listings.filter(listing => {
    if (listingFilter === 'All') return true;
    if (listingFilter === 'Active') return listing.status === 'Active';
    if (listingFilter === 'Inactive') return listing.status === 'Inactive' || listing.status === 'Payment Required';
    if (listingFilter === 'Pending Approval') return listing.status === 'Pending';
    return true;
  });

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
           <span className="brand-icon">🏠</span> Host Panel
        </div>
        
        <div className="sidebar-action">
           <button onClick={handleCreateNew} className="create-new-btn-sidebar">
             + Create New Listing
           </button>
        </div>

        <nav className="sidebar-nav">
           <button onClick={() => setActiveTab('overview')} className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}>
             Dashboard
           </button>
           <button onClick={() => setActiveTab('listings')} className={`nav-item ${activeTab === 'listings' ? 'active' : ''}`}>
             My Listings
           </button>
           <button onClick={() => setActiveTab('performance')} className={`nav-item ${activeTab === 'performance' ? 'active' : ''}`}>
                         Performance
                     </button>
           <button onClick={() => setActiveTab('bookings')} className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`}>
             Reservations <span className="badge-count">2</span>
           </button>
           <button onClick={() => setActiveTab('calendar')} className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}>
             Calendar
           </button>
           <button onClick={() => setActiveTab('monthly-plans')} className={`nav-item ${activeTab === 'monthly-plans' ? 'active' : ''}`}>
             Monthly Plans
           </button>
            <button onClick={() => setActiveTab('financials')} className={`nav-item ${activeTab === 'financials' ? 'active' : ''}`}>
             Financials & Payouts
            </button>
           <button onClick={() => setActiveTab('messages')} className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}>
             Messages <span className="badge-count">1</span>
           </button>
           <button onClick={() => setActiveTab('reviews')} className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`}>
             Guest Reviews
           </button>

        </nav>
        <div className="sidebar-footer">
           <Link to="/" className="exit-link">Exit to Hostify</Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="main-header">
           <h2>{activeTab === 'overview' ? 'Dashboard Overview' : activeTab === 'listings' ? 'My Listings' : activeTab === 'bookings' ? 'Reservations' : activeTab === 'calendar' ? 'Calendar & Availability' : activeTab === 'financials' ? 'Financials & Payouts' : activeTab === 'reviews' ? 'Guest Reviews' : activeTab === 'payout-details' ? 'Tax Profile' : activeTab === 'profile' ? 'My Profile' : 'Monthly Plans'}</h2>
        </header>

        {activeTab === 'performance' && (
          <div className="performance-tab-content">
             <div className="performance-hero-stats">
               <div className="perf-metric-box">
                  <div className="p-label">Profile Views</div>
                  <div className="p-value">{analyticsData?.viewsCount?.toLocaleString() || '0'}</div>
                  <div className="p-trend positive">↑ {analyticsData?.viewsTrend}% vs last month</div>
               </div>
               <div className="perf-metric-box">
                  <div className="p-label">Conversion Rate</div>
                  <div className="p-value">{analyticsData?.conversionRate || '0'}%</div>
                  <div className="p-trend">Industry avg: 2.1%</div>
               </div>
               <div className="perf-metric-box">
                  <div className="p-label">Booking Lead Time</div>
                  <div className="p-value">{analyticsData?.bookingLeadTime || '0'} days</div>
                  <div className="p-trend">Average time guests book in advance</div>
               </div>
             </div>

             <div className="performance-charts-grid">
                <div className="chart-card-premium">
                   <h3>Views Over Time</h3>
                   <div className="css-bar-chart">
                      {analyticsData?.performanceByMonth?.map(item => (
                        <div key={item.month} className="bar-group">
                           <div className="bar-wrapper">
                              <div 
                                className="bar-fill blue" 
                                style={{ height: `${(item.views / 1500) * 100}%` }}
                              ></div>
                           </div>
                           <span className="bar-label">{item.month}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="chart-card-premium">
                   <h3>Bookings Conversion</h3>
                   <div className="css-bar-chart">
                      {analyticsData?.performanceByMonth?.map(item => (
                        <div key={item.month} className="bar-group">
                           <div className="bar-wrapper">
                              <div 
                                className="bar-fill green" 
                                style={{ height: `${(item.bookings / 40) * 100}%` }}
                              ></div>
                           </div>
                           <span className="bar-label">{item.month}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="performance-tips-banner">
                <div className="tip-icon">💡</div>
                <div className="tip-text">
                   <h4>Want more views?</h4>
                   <p>Update your photos to include more natural lighting. Properties with high-quality first photos get 40% more clicks.</p>
                </div>
                <button className="btn-tip">Improve Listing</button>
             </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="reviews-tab-content">
             <div className="reviews-summary-card">
                <div className="review-score-big">4.8</div>
                <div className="review-stars-big">
                   {[1,2,3,4,5].map(star => <Star key={star} size={24} fill="#FFB800" color="#FFB800" />)}
                </div>
                <div className="review-total-count">Average from {guestReviews.length} reviews</div>
             </div>
             
             <div className="reviews-grid">
                {guestReviews.map(review => (
                   <div key={review.id} className="review-card-premium">
                      <div className="review-card-header">
                         <div className="reviewer-avatar">{review.guestPhoto}</div>
                         <div className="reviewer-info">
                            <h4>{review.guestName}</h4>
                            <span className="reviewer-date">{review.date}</span>
                         </div>
                      </div>
                      <div className="review-listing-ref">
                         stayed at <strong>{review.listingName}</strong>
                      </div>
                      <div className="review-stars-small">
                         {[...Array(5)].map((_, i) => (
                           <Star key={i} size={14} fill={i < review.rating ? "#FFB800" : "#E2E8F0"} color={i < review.rating ? "#FFB800" : "#E2E8F0"} />
                         ))}
                      </div>
                      <p className="review-text-content">"{review.text}"</p>
                      <div className="review-card-actions">
                         <button className="btn-reply-review">Reply to {review.guestName.split(' ')[0]}</button>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'overview' && (
           <div className="overview-content">
              {/* Stats Cards Overhaul */}
              <div className="stats-grid-premium">
                  <div className="stat-card-premium">
                     <div className="stat-header-premium">
                        <span className="stat-label-premium">Net Earnings</span>
                        <IndianRupee className="stat-icon-premium" size={20} />
                     </div>
                     <div className="stat-value-premium">₹{payoutData?.summary?.totalPaid.toLocaleString('en-IN') || '0'}</div>
                     <div className="stat-trend-premium positive">Life-time received</div>
                  </div>

                  <div className="stat-card-premium">
                     <div className="stat-header-premium">
                        <span className="stat-label-premium">Available Balance</span>
                        <Wallet className="stat-icon-premium" size={20} />
                     </div>
                     <div className="stat-value-premium">₹{payoutData?.summary?.availableBalance.toLocaleString('en-IN') || '0'}</div>
                     <div className="stat-trend-premium">Ready for withdrawal</div>
                  </div>

                  <div className="stat-card-premium">
                     <div className="stat-header-premium">
                        <span className="stat-label-premium">Upcoming Payouts</span>
                        <Calendar className="stat-icon-premium" size={20} />
                     </div>
                     <div className="stat-value-premium">₹{payoutData?.summary?.pendingBalance.toLocaleString('en-IN') || '0'}</div>
                     <div className="stat-trend-premium">Expected this month</div>
                  </div>

                  <div className="stat-card-premium">
                     <div className="stat-header-premium">
                        <span className="stat-label-premium">Gross Volume</span>
                        <TrendingUp className="stat-icon-premium" size={20} />
                     </div>
                     <div className="stat-value-premium">₹{payoutData?.summary?.totalGross.toLocaleString('en-IN') || '0'}</div>
                     <div className="stat-trend-premium positive">Total bookings value</div>
                  </div>
               </div>

              {/* Recent Activity / Action Items */}
              <div className="section-container">
                 <h3>Pending Actions</h3>
                 <div className="action-list">
                    {listings.filter(l => l.status === 'Payment Required').map(l => (
                      <div key={l.id} className="action-item warning">
                         <span className="action-icon">💳</span>
                         <div className="action-text">
                            <strong>Subscription Required</strong>
                            <p>Activate "{l.title}" to start receiving bookings.</p>
                         </div>
                         <button className="action-btn" onClick={() => handleSubscribe(l.id)}>Pay Now</button>
                      </div>
                    ))}
                    {listings.filter(l => l.status === 'Pending').length > 0 && (
                      <div className="action-item warning">
                         <span className="action-icon">⏳</span>
                         <div className="action-text">
                            <strong>Listing Pending Approval</strong>
                            <p>Your listing "{listings.find(l => l.status === 'Pending')?.title}" is under review.</p>
                         </div>
                      </div>
                    )}
                    <div className="action-item">
                       <span className="action-icon">📱</span>
                       <div className="action-text">
                          <strong>Verify Phone Number</strong>
                          <p>Add a phone number to get 30% more bookings.</p>
                       </div>
                       <button className="action-btn">Verify</button>
                    </div>
                 </div>
              </div>

               {/* Recent Bookings Section */}
               <div className="section-container" style={{ marginTop: '32px' }}>
                  <div className="section-header-row">
                     <h3>Recent Bookings</h3>
                     <button className="btn-link" onClick={() => setActiveTab('bookings')}>View All</button>
                  </div>
                  <div className="recent-bookings-list">
                     {reservations.slice(0, 3).map(res => (
                        <div key={res.id} className="recent-booking-item">
                           <div className="rb-guest">
                              <div className="user-avatar small">{res.guest.charAt(0)}</div>
                              <div>
                                 <span className="rb-name">{res.guest}</span>
                                 <span className="rb-sub">{res.dates}</span>
                              </div>
                           </div>
                           <div className="rb-property">
                              {listings.find(l => l.id === res.listingId)?.title || 'Listing'}
                           </div>
                           <div className={`rb-status ${res.status.toLowerCase()}`}>
                              {res.status}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
        )}

        {activeTab === 'listings' && (
             <div className="listings-content">
                <div className="listings-header-wrapper">
                   <div className="listing-filters-tabs">
                     {['All', 'Active', 'Inactive', 'Pending Approval'].map(filter => {
                       let count = 0;
                       if (filter === 'All') count = listings.length;
                       else if (filter === 'Active') count = listings.filter(l => l.status === 'Active').length;
                       else if (filter === 'Inactive') count = listings.filter(l => l.status === 'Inactive' || l.status === 'Payment Required').length;
                       else if (filter === 'Pending Approval') count = listings.filter(l => l.status === 'Pending').length;

                       return (
                         <button
                           key={filter}
                           className={`filter-tab-pill ${listingFilter === filter ? 'active' : ''}`}
                           onClick={() => setListingFilter(filter)}
                         >
                           {filter} <span className="tab-count">{count}</span>
                         </button>
                       );
                     })}
                   </div>
                </div>
                
                <div className="listings-grid-v2">
                       {filteredListings.map(listing => {
                        const createdAt = listing.createdAt ? new Date(listing.createdAt) : new Date();
                        const expiryDate = new Date(createdAt);
                        expiryDate.setMonth(createdAt.getMonth() + 1);
                        
                        const isValidDate = !isNaN(expiryDate.getTime());
                        const diffInDays = isValidDate ? Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24)) : 0;
                        const isExpired = listing.status === 'Active' && diffInDays <= 0;
                        const isExpiringSoon = listing.status === 'Active' && diffInDays > 0 && diffInDays <= 7;
                        const isPending = listing.status === 'Pending';
                        const currentStatus = isExpired ? 'Expired' : listing.status;
                        

                        // Calculate pending requests
                        const pendingRequests = reservations.filter(r => r.listingId === listing.id && r.status === 'Pending').length;

                        return (
                            <div key={listing.id} className={`listing-card-premium ${isExpired ? 'is-expired' : isPending ? 'is-pending' : 'is-active'}`}>
                              {/* Top Status Header */}
                              <div className="card-top-header">
                                 <div className="status-indicator">
                                    <span className="status-icon">{isExpired ? '✕' : isPending ? '⏳' : '✓'}</span>
                                    <div className="status-text-group">
                                       <span className="status-text">{isExpired ? 'EXPIRED LISTING' : isPending ? 'PENDING APPROVAL' : 'ACTIVE LISTING'}</span>
                                    </div>
                                 </div>
                                 <div className="status-date">
                                    {isExpired ? `Expired on ${expiryDate.toLocaleDateString()}` : isPending ? `Submitted on ${createdAt.toLocaleDateString()}` : `Valid until ${expiryDate.toLocaleDateString()}`}
                                 </div>
                                 <button 
                                    className="btn-delete-card" 
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       handleDeleteClick(listing.id);
                                    }}
                                 >
                                    <Trash2 size={14} />
                                 </button>
                              </div>

                              <div className="card-image-wrapper">
                                  {(() => {
                                    const hasPhoto = listing.photos && listing.photos.length > 0;
                                    if (!hasPhoto) {
                                      return (
                                        <div className="no-photo-placeholder">
                                          <span className="placeholder-emoji">🏠</span>
                                          <span className="placeholder-text">No photo added</span>
                                        </div>
                                      );
                                    }
                                    let imgUrl = '';
                                    const photo = listing.photos[0];
                                    if (typeof photo === 'string') imgUrl = photo;
                                    else if (photo instanceof File) imgUrl = URL.createObjectURL(photo);
                                    else if (photo && photo.url) imgUrl = photo.url;
                                    return (
                                      <>
                                        <img src={imgUrl} alt={listing.title} className={isExpired || isPending ? 'desaturated' : ''} />
                                        {isExpired && (
                                          <div className="expired-banner">
                                            <span>EXPIRED</span>
                                            <div className="status-tooltip-container">
                                              <Info size={14} className="info-icon-trigger" />
                                              <div className="status-tooltip">
                                                <p className="tooltip-title">Expiry Consequences:</p>
                                                <ul>
                                                  <li>• Not visible to potential guests</li>
                                                  <li>• No new bookings accepted</li>
                                                  <li>• Removed from search results</li>
                                                </ul>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                        {isPending && (
                                          <div className="pending-banner">
                                            <span>IN REVIEW</span>
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                              </div>

                              <div className="card-content-premium">
                                 <div className="content-main-info">
                                    <div className="title-row">
                                       <h4 className="premium-card-title">{listing.title || 'Untitled Listing'}</h4>
                                       <div className="premium-rating">
                                          <Star size={14} fill="#FFB800" color="#FFB800" />
                                          <span className="rating-val">{listing.rating > 0 ? listing.rating.toFixed(1) : 'New'}</span>
                                          <span className="rating-count">({listing.reviewCount || Math.floor(Math.random() * 50) + 5})</span>
                                       </div>
                                    </div>
                                    <p className="premium-location">{listing.location}</p>
                                 </div>

                                 <div className="premium-metrics-grid">
                                    <div className="metric-item">
                                       <span className="metric-label">Property Type</span>
                                       <span className="metric-value">{listing.type || 'Property'}</span>
                                    </div>
                                    <div className="metric-item">
                                       <span className="metric-label">Capacity</span>
                                       <span className="metric-value">{listing.guests || 2} guests</span>
                                    </div>
                                    <div className="metric-item">
                                       <span className="metric-label">Total Views</span>
                                       <span className="metric-value">124</span>
                                    </div>
                                    <div className="metric-item">
                                       <span className="metric-label">Active Units</span>
                                       <span className="metric-value">{getListingLimit(listing.id)}/{getListingTotalInventory(listing.id)}</span>
                                    </div>
                                 </div>

                                 <div className="premium-pricing-row">
                                    <span className="premium-price">₹{listing.price || 0}</span>
                                    <span className="premium-price-label">/ night</span>
                                 </div>

                                 {/* Action Buttons */}
                                 <div className="premium-card-actions">
                                    {isExpired ? (
                                       <div className="expired-actions-stack">
                                          <button 
                                             className="btn-renew-primary"
                                             onClick={(e) => { e.stopPropagation(); handleSubscribe(listing.id); }}
                                          >
                                             <span className="renew-icon">🔄</span> Renew & Go Live <span className="arrow">→</span>
                                          </button>
                                          <div className="secondary-actions-row">
                                             <button className="btn-premium-secondary" onClick={() => handleEdit(listing)}>Edit</button>
                                             <button className="btn-premium-secondary">Preview</button>
                                          </div>
                                       </div>
                                    ) : isPending ? (
                                       <div className="pending-actions-row">
                                          <button className="btn-premium-secondary disabled" disabled>Awaiting Approval</button>
                                          <button className="btn-premium-secondary" onClick={() => handleEdit(listing)}>Edit Listing</button>
                                       </div>
                                    ) : (
                                       <div className="active-actions-row">
                                          <button className="btn-premium-secondary" onClick={() => handleEdit(listing)}>Edit Listing</button>
                                          <button className="btn-premium-secondary" onClick={() => handleOpenPricing(listing)}>Manage Pricing</button>
                                          <button className="btn-premium-secondary">View Public</button>
                                       </div>
                                    )}
                                 </div>
                              </div>
                            </div>
                        );
                     })}
                       {filteredListings.length === 0 && <div className="no-data">No listings match the selected filter.</div>}
                </div>
             </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          title="Delete Listing"
          message="Are you sure you want to delete this listing? This action cannot be undone."
          confirmText="Yes, Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isDestructive={true}
        />

        <SubscriptionModal 
          isOpen={isSubModalOpen}
          onClose={() => setIsSubModalOpen(false)}
          onConfirm={handlePaymentSuccess}
          listingTitle={listingToSubscribe?.title}
          basePricePerUnit={499}
          currentUnits={listingToSubscribe ? getListingLimit(listingToSubscribe.id) : 0}
          totalInventory={listingToSubscribe ? getListingTotalInventory(listingToSubscribe.id) : 1}
        />

        <PricingModal 
           isOpen={isPricingModalOpen}
           onClose={() => setIsPricingModalOpen(false)}
           listing={listingToPrice}
           onUpdate={handleUpdatePricing}
         />

        {activeTab === 'bookings' && (
           <div className="bookings-content">
              <div className="bookings-table">
                 <div className="table-header">
                    <div>Sl No.</div>
                    <div>Guest</div>
                    <div>Dates</div>
                    <div>Listing</div>
                    <div>Price</div>
                    <div>Status</div>
                    <div>Action</div>
                 </div>
                 {reservations.map((res, index) => (
                    <div key={res.id} className="table-row">
                       <div className="col-sl">{index + 1}</div>
                       <div className="col-guest">
                          <img src={res.img} alt="" className="guest-avatar" />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                             <span style={{ fontWeight: '600' }}>{res.guest}</span>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#717171' }}>
                                <Star size={10} fill="var(--primary)" color="var(--primary)" />
                                <span>{res.rating || 'New'}</span>
                             </div>
                          </div>
                       </div>
                       <div className="col-date">{res.dates}</div>
                       <div className="col-listing">{listings[0]?.title || 'Seaside Villa'}</div>
                       <div className="col-price">{res.price}</div>
                       <div className="col-status"><span className={`status-dot ${res.status.toLowerCase()}`}></span> {res.status}</div>
                       <div className="col-action">
                          {res.status === 'Pending' ? (
                             <>
                               <button className="btn-accept">Accept</button>
                               <button className="btn-decline">Decline</button>
                             </>
                          ) : (
                             <button className="btn-link">Message</button>
                          )}
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'calendar' && (
           <div className="calendar-content">
              <div className="calendar-container">
                 <div className="calendar-controls">
                    <div className="cal-header-left">
                       <h3>{format(currentMonth, 'MMMM yyyy')}</h3>
                       <div className="cal-nav-btns">
                          <button onClick={prevMonth} className="btn-icon"><ChevronLeft size={20}/></button>
                          <button onClick={nextMonth} className="btn-icon"><ChevronRight size={20}/></button>
                       </div>
                    </div>
                    


                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                       <div className="cal-listing-selector">
                           <select 
                              value={selectedListingId} 
                              onChange={(e) => setSelectedListingId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                              className="listing-dropdown"
                           >
                              <option value="all">All Listings</option>
                              {listings.map(l => (
                                 <option key={l.id} value={l.id}>{l.title}</option>
                              ))}
                           </select>
                       </div>

                       <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                             className="btn-outline-small" 
                             onClick={handleExportCal}
                             title="Export iCal"
                          >
                             <Download size={16} /> Export
                          </button>

                          <button 
                             className="btn-outline-small" 
                             onClick={() => {
                               if (selectedListingId === 'all') {
                                 alert("Please select a specific listing to setup automated sync.");
                               } else {
                                 setIsSyncModalOpen(true);
                               }
                             }}
                             title="Add Sync Link"
                          >
                             <Link2 size={16} /> Sync Link
                          </button>

                          <label className="btn-outline-small" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                             <Upload size={16} /> Import
                             <input 
                                type="file" 
                                accept=".ics" 
                                style={{ display: 'none' }}
                                onChange={handleImportCal}
                             />
                          </label>
                       </div>
                    </div>

                     <div className="cal-legend">
                        <span className="legend-item"><span className="dot booked"></span> Booked</span>
                        <span className="legend-item"><span className="dot available"></span> Available</span>
                        <span className="legend-item"><span className="dot offline"></span> Unavailable</span>
                        
                        {!isBlockingMode && (
                           <button className="btn-block-dates" style={{marginLeft: 'auto'}} onClick={() => setIsBlockingMode(true)}>
                             Mark dates as unavailable
                           </button>
                        )}
                     </div>
                 </div>
                 
                        <div className="weekdays-grid">
                           {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                              <div key={day} className="weekday-header">{day}</div>
                           ))}
                        </div>
                        
                        <div className="days-grid">
                            {calendarDays.map((day, idx) => {
                              const dailyReservations = getDailyReservations(new Date(day));
                              const activeLimit = selectedListing ? getListingLimit(selectedListing.id) : 1;
                              const isToday = isSameDay(day, new Date());
                              const isPastDay = day < new Date(new Date().setHours(0,0,0,0));
                              const isCurrentMonth = isSameMonth(day, currentMonth);
                              const totalBlocks = dailyReservations.length;
                              const hasBooking = totalBlocks > 0;
                              const isFull = totalBlocks >= activeLimit;
                              
                              return (
                                 <div key={day.toString()} className={`day-cell ${!isCurrentMonth ? 'outside' : ''} ${hasBooking ? 'booked' : ''} ${isFull ? 'fully-booked' : ''} ${isToday ? 'today' : ''} ${isBlockingMode ? 'blocking-mode-cell' : ''} ${isPastDay ? 'past-day' : ''}`}>
                                    {isBlockingMode && !isPastDay && !isFull && (
                                      <input 
                                        type="checkbox" 
                                        className="day-block-checkbox"
                                        checked={selectedDatesToBlock.includes(day.toISOString())}
                                        onChange={() => toggleDateSelection(day.toISOString())}
                                      />
                                    )}
                                    <div className="day-number">{format(day, 'd')}</div>
                                    {activeLimit > 1 && (
                                        <div className="unit-counter" style={{ fontSize: '11px', color: isFull ? '#fff' : 'var(--primary)', fontWeight: 'bold', marginTop: '2px' }}>
                                          {totalBlocks}/{activeLimit} Booked
                                        </div>
                                    )}
                                    <div className="day-price">
                                       {selectedListingId === 'all' ? (
                                          ''
                                       ) : (
                                          <div className="month-price-input-wrapper">
                                             <span className="currency-symbol">₹</span>
                                             <input 
                                                type="number" 
                                                className="month-price-input" 
                                                defaultValue={selectedListing?.price || '0'} 
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={handlePriceChange}
                                                disabled={isPastDay}
                                             />
                                          </div>
                                       )}
                                    </div>
                                    
                                    <div className="bookings-stack">
                                       {dailyReservations.map((res, i) => (
                                           <div 
                                             key={res.id} 
                                             className={`booking-strip ${res.status === 'Unavailable' ? 'blocked-strip' : ''}`} 
                                             style={{
                                                backgroundColor: res.status === 'Unavailable' ? '#a3a3a3' : (i % 2 === 0 ? 'var(--primary)' : '#222'),
                                             }}
                                           >
                                             {res.status === 'Unavailable' ? (
                                                <div className="booking-strip-unavailable">
                                                   <span className="unavailable-text-label">
                                                      Unavailable
                                                   </span>
                                                   {!isPastDay && (
                                                      <button 
                                                         className="unblock-text-btn" 
                                                         onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveBlock(res.id);
                                                         }}
                                                      >
                                                         Mark available
                                                      </button>
                                                   )}
                                                </div>
                                             ) : (
                                                <span className="booking-strip-title">
                                                   {selectedListingId === 'all' 
                                                      ? (listings.find(l => l.id === res.listingId)?.title?.split(' ').slice(0, 2).join(' ') || 'Listing')
                                                      : res.guest.split(' ')[0]}
                                                </span>
                                             )}
                                           </div>
                                       ))}
                                    </div>
                                 </div>
                              );
                           })}
                        </div>

                  {/* Save Changes Floating Action Bar */}
                  {(hasUnsavedChanges || selectedDatesToBlock.length > 0) && (
                     <div className="save-action-bar">
                        <div className="save-action-content">
                           <span>You have unsaved changes to your calendar.</span>
                           <div className="save-action-btns">
                              <button className="btn-cancel" onClick={handleCancelChanges}>Discard</button>
                              <button className="btn-save" onClick={handleSaveChanges}>Save Changes</button>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
           </div>
        )}

        {activeTab === 'monthly-plans' && (
           <div className="monthly-plans-content">
               <div className="pricing-container-single">
                  <div className="pricing-card premium-featured">
                     <div className="plan-badge">Most Popular</div>
                     <div className="plan-header-redesign">
                        <h3>Host Premium</h3>
                        <div className="price-stack">
                           <span className="currency">₹</span>
                           <span className="amount">499</span>
                           <span className="period">/ month</span>
                        </div>
                        <p className="plan-subtitle">Everything you need to host like a pro.</p>
                     </div>
                     
                     <div className="plan-divider"></div>

                     <div className="features-grid">
                        <ul className="plan-features-list">
                           <li>
                              <span className="check-icon">✓</span>
                              <span><strong>24/7 Priority Support</strong> (Phone & Chat)</span>
                           </li>
                           <li>
                              <span className="check-icon">✓</span>
                              <span><strong>Add-on Inventory</strong> (Pay as you grow)</span>
                           </li>
                        </ul>
                        <ul className="plan-features-list">
                           <li>
                              <span className="check-icon">✓</span>
                              <span><strong>Advanced Analytics</strong> & Insights</span>
                           </li>
                           <li>
                              <span className="check-icon">✓</span>
                              <span><strong>Smart Pricing Tools</strong> & Automation</span>
                           </li>
                        </ul>
                     </div>

                     <div className="plan-action-area">
                        <button className="btn-activate-premium" onClick={() => setIsSubModalOpen(true)}>
                           Get Started with Premium
                        </button>
                     </div>
                  </div>
               </div>
           </div>
        )}

         {activeTab === 'financials' && (
            <div className="financials-layout-premium">
               {/* Financial Summary Cards */}
               <div className="financials-hero-section">
                  <div className="balance-card-main">
                     <div className="balance-label">Available for Withdrawal</div>
                     <div className="balance-amount-large">₹{payoutData?.summary?.availableBalance.toLocaleString('en-IN') || '0'}</div>
                     <button className="btn-withdraw-now" disabled={!payoutData?.summary?.availableBalance}>
                        <Wallet size={18} /> Withdraw Funds
                     </button>
                     <p className="balance-subtext">Transfer time: 2-3 business days</p>
                  </div>
                  
                  <div className="summary-side-cards">
                     <div className="summary-mini-card">
                        <div className="mini-card-header">
                           <Calendar size={16} /> Upcoming
                        </div>
                        <div className="mini-card-value">₹{payoutData?.summary?.pendingBalance.toLocaleString('en-IN') || '0'}</div>
                        <div className="mini-card-desc">Held in escrow (Check-in + 24h)</div>
                     </div>
                     <div className="summary-mini-card">
                        <div className="mini-card-header">
                           <ShieldCheck size={16} /> Total Net
                        </div>
                        <div className="mini-card-value">₹{payoutData?.summary?.totalNet?.toLocaleString('en-IN') || '0'}</div>
                        <div className="mini-card-desc">Gross minus Est. Transaction Fees</div>
                     </div>
                  </div>
               </div>

               <div className="financials-grid-content">
                  {/* Transaction History Sub-Tab */}
                  <div className="txn-history-section">
                     <div className="section-header-row">
                        <h3>Payout History</h3>
                        <div className="header-actions">
                           <button className="btn-action-outline"><Download size={14} /> Export</button>
                        </div>
                     </div>
                     
                     <div className="premium-txn-list">
                        {loadingPayouts ? (
                          <div className="loading-shimmer-payouts">Loading financial records...</div>
                        ) : payoutData?.transactions?.length > 0 ? (
                          payoutData.transactions.map(tx => (
                            <div key={tx.id} className="premium-txn-item">
                               <div className="txn-info-group">
                                  <div className="txn-icon-circle"><CreditCard size={16} /></div>
                                  <div className="txn-main-details">
                                     <div className="txn-title">{tx.propertyName}</div>
                                     <div className="txn-meta">Code: {tx.bookingCode} • Check-in: {new Date(tx.checkIn).toLocaleDateString()}</div>
                                  </div>
                               </div>
                               <div className="txn-financial-group">
                                  <div className="txn-amount-net">₹{tx.netAmount.toLocaleString('en-IN')}</div>
                                  <div className={`txn-status-badge ${tx.status.toLowerCase()}`}>
                                     {tx.status}
                                  </div>
                               </div>
                            </div>
                          ))
                        ) : (
                          <div className="empty-payouts">No transactions found yet.</div>
                        )}
                     </div>
                  </div>

                  {/* Bank & Tax Details Section */}
                  <div className="financial-settings-section">
                     <div className="settings-card-premium">
                        <h3>Bank Account</h3>
                        <p className="card-desc">Where you want to receive your money.</p>
                        
                        {bankDetails.accountNumber ? (
                           <div className="saved-bank-box">
                              <div className="bank-info-main">
                                 <div className="bank-logo-placeholder">🏦</div>
                                 <div className="bank-names">
                                    <div className="bank-primary-name">{bankDetails.bankName}</div>
                                    <div className="bank-acc-hidden">•••• {bankDetails.accountNumber.slice(-4)}</div>
                                 </div>
                              </div>
                              <button className="btn-edit-small" onClick={() => setActiveTab('payout-details')}>Edit</button>
                           </div>
                        ) : (
                           <div className="empty-bank-box" onClick={() => setActiveTab('payout-details')}>
                              <span className="plus-icon">+</span>
                              <span>Add bank account</span>
                           </div>
                        )}

                        <div className="divider-lite"></div>

                        <h3>Tax Information</h3>
                        <div className="tax-summary-mini">
                           <div className="tax-row">
                              <span>Entity Type</span>
                              <strong>{hostType === 'individual' ? 'Individual' : 'Business'}</strong>
                           </div>
                           <div className="tax-row">
                              <span>PAN Number</span>
                              <strong>{hostType === 'individual' ? taxInfo.pan || 'Not Provided' : companyDetails.pan || 'Not Provided'}</strong>
                           </div>
                        </div>
                        <button className="btn-full-width-outline" onClick={() => setActiveTab('payout-details')}>Manage Tax Profile</button>
                     </div>

                     <div className="service-fee-info-card">
                        <div className="info-card-icon"><Info size={18} /></div>
                        <div className="info-card-text">
                           <h4>Platform Fee Structure</h4>
                           <p>You are on a <strong>Flat Monthly Fee</strong> plan. We charge <strong>0% Commission</strong> per booking. Only estimated payment processing fees are deducted.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'payout-details' && (
            <div className="financials-content">
               <div className="financials-card">
                  <div className="financials-header">
                     <div className="header-icon-wrapper">
                        <span className="secure-lock">🔒</span>
                     </div>
                     <div className="header-text">
                        <h3>Payout & Tax Setup</h3>
                        <p>Securely manage your payout and tax details. These are never shared with guests.</p>
                     </div>
                  </div>

                  <div className="financials-section">
                     <h4>Tax Information</h4>
                     
                     <div className="host-type-selector">
                        <label className={`type-option ${hostType === 'individual' ? 'active' : ''}`}>
                           <input type="radio" name="hostType" value="individual" checked={hostType === 'individual'} onChange={() => setHostType('individual')} />
                           Individual
                        </label>
                        <label className={`type-option ${hostType === 'company' ? 'active' : ''}`}>
                           <input type="radio" name="hostType" value="company" checked={hostType === 'company'} onChange={() => setHostType('company')} />
                           Company / Business
                        </label>
                     </div>

                     <div className="financials-form-grid">
                        {hostType === 'individual' ? (
                           <>
                              <div className="form-group">
                                 <label>PAN Number</label>
                                 <input type="text" name="pan" value={taxInfo.pan} onChange={handleTaxUpdate} placeholder="e.g. ABCDE1234F" />
                              </div>
                              <div className="form-group">
                                 <label>GSTIN (Optional)</label>
                                 <input type="text" name="gstin" value={taxInfo.gstin} onChange={handleTaxUpdate} placeholder="GST Number" />
                              </div>
                           </>
                        ) : (
                           <>
                              <div className="form-group full-width">
                                 <label>Company Name</label>
                                 <input type="text" name="name" value={companyDetails.name} onChange={handleCompanyUpdate} placeholder="Registered Company Name" />
                              </div>
                              <div className="form-group">
                                 <label>Company PAN</label>
                                 <input type="text" name="pan" value={companyDetails.pan} onChange={handleCompanyUpdate} placeholder="Company PAN" />
                              </div>
                              <div className="form-group">
                                 <label>GSTIN (Mandatory)</label>
                                 <input type="text" name="gstin" value={companyDetails.gstin} onChange={handleCompanyUpdate} placeholder="GST Number" />
                              </div>
                           </>
                        )}
                     </div>
                  </div>

                  <div className="separator-line"></div>

                   <div className="financials-section">
                      <h4>Bank Account Details</h4>
                      <div className="financials-form-grid">
                         <div className="form-group full-width">
                            <label>Account Holder Name</label>
                            <input type="text" name="holderName" value={bankDetails.holderName} onChange={handleBankUpdate} placeholder="Name as per bank records" />
                         </div>
                         <div className="form-group full-width">
                            <label>Bank Name</label>
                            <select 
                              name="bankName" 
                              value={bankDetails.bankName} 
                              onChange={handleBankUpdate}
                            >
                               <option value="">Select your bank</option>
                               {POPULAR_BANKS.map(bank => (
                                  <option key={bank} value={bank}>{bank}</option>
                               ))}
                            </select>
                         </div>
                         <div className="form-group">
                            <label>Account Number</label>
                            <input type="text" name="accountNumber" value={bankDetails.accountNumber} onChange={handleBankUpdate} placeholder="Enter account number" />
                         </div>
                         <div className="form-group">
                            <label>IFSC Code</label>
                            <input type="text" name="ifsc" value={bankDetails.ifsc} onChange={handleBankUpdate} placeholder="e.g. HDFC0001234" />
                         </div>
                      </div>
                   </div>

                  <div className="financials-actions">
                     <button className="btn-primary">Save Financial Details</button>
                  </div>
               </div>

               <div className="financials-sidebar">
                  <div className="secure-note-card">
                     <h4>Why is this needed?</h4>
                     <p>We need your bank details to send you payouts for your bookings. Tax info is required for regulatory compliance.</p>
                     <div className="secure-badge">
                        <span>🔒 256-bit SSL Encrypted</span>
                     </div>
                  </div>
               </div>
            </div>
         )}
         
         {activeTab === 'messages' && (
            <div className="messages-content">
               <div className="messages-sidebar-layout">
                  <div className="messages-list">
                     {['Alice Johnson', 'Charlie Brown'].map(guest => (
                       <div 
                         key={guest} 
                         className={`message-thread-item ${activeMessageGuest === guest ? 'active' : ''}`}
                         onClick={() => setActiveMessageGuest(guest)}
                       >
                         <div className="message-avatar">{guest.charAt(0)}</div>
                         <div className="message-preview">
                           <h4>{guest}</h4>
                           <p>Click to view conversation</p>
                         </div>
                       </div>
                     ))}
                  </div>
                  <div className="messages-chat-window">
                     <div className="chat-header">
                       <h4>{activeMessageGuest}</h4>
                     </div>
                     <div className="chat-history">
                       {mockMessages.filter(m => m.guest === activeMessageGuest).map(msg => (
                         <div key={msg.id} className={`chat-bubble-wrapper ${msg.isHost ? 'host' : 'guest'}`}>
                           <div className="chat-bubble">{msg.text}</div>
                           <span className="chat-time">{msg.time}</span>
                         </div>
                       ))}
                     </div>
                     <div className="chat-input-area">
                       <input 
                         type="text" 
                         value={newMessageText} 
                         onChange={(e) => setNewMessageText(e.target.value)}
                         placeholder="Type a message..."
                         onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                       />
                       <button className="btn-primary" onClick={handleSendMessage}>Send</button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </main>
      
      <LimitManagementModal
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        listingId={selectedListingId}
        currentLimit={getListingLimit(selectedListingId)}
        onSave={(newLimit) => setInventoryLimits(prev => ({...prev, [selectedListingId]: newLimit}))}
      />

      {/* iCal Automated Sync Modal */}
      {isSyncModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h3>Automated Calendar Sync</h3>
            <p className="modal-desc">Paste an iCal (.ics) link from another platform (like VRBO or Booking.com) to automatically keep your availability in sync.</p>
            
            <div style={{ marginTop: '20px', marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Calendar URL</label>
              <input 
                type="url" 
                value={syncUrl} 
                onChange={(e) => setSyncUrl(e.target.value)} 
                placeholder="https://..." 
                className="modal-input"
              />
            </div>
            
            <div className="modal-actions">
              <button className="btn-outline" onClick={() => { setIsSyncModalOpen(false); setSyncUrl(''); }}>Cancel</button>
              <button 
                className="btn-primary" 
                onClick={() => {
                  if (syncUrl) {
                    setSyncedCalendars(prev => [...prev, syncUrl]);
                    setIsSyncModalOpen(false);
                    handleMockAutoSync(syncUrl);
                    setSyncUrl('');
                  }
                }}
              >
                Add & Sync Now
              </button>
            </div>
          </div>
        </div>
      )}
      



    </div>
  );
};

export default HostDashboard;
