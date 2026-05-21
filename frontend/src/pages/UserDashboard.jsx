import { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  Bell, 
  Download, 
  Calendar, 
  MapPin, 
  Phone, 
  CreditCard,
  History,
  TrendingUp,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Mail,
  Home,
  Save,
  Trash2,
  Heart
} from 'lucide-react';

// Components
import DashboardSidebar from '../components/DashboardSidebar';
import SpendingChart from '../components/SpendingChart';
import { generateReceipt } from '../utils/generateReceipt';

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  failed: 'bg-rose-100 text-rose-800 border-rose-200',
  cancelled: 'bg-slate-100 text-slate-800 border-slate-200',
};

const UserDashboard = () => {
  const { user, logout, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Support redirect from ListingDetail with pre-selected tab
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'overview');
  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    contactPhone: user?.contactPhone || '',
    address: user?.address || ''
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      // Fetch data independently to prevent total crash if one fails
      const fetchAll = async () => {
        // Bookings
        try {
          const { data } = await axios.get('http://localhost:5000/api/bookings/mybookings', config);
          setBookings(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error('Failed to load bookings', err);
        }

        // Notifications
        try {
          const { data } = await axios.get('http://localhost:5000/api/notifications', config);
          setNotifications(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error('Failed to load notifications', err);
        }

        // Wishlist
        try {
          const { data } = await axios.get('http://localhost:5000/api/users/wishlist', config);
          setWishlist(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error('Failed to load wishlist', err);
        }

        // Profile
        try {
          const { data } = await axios.get('http://localhost:5000/api/users/profile', config);
          if (data) {
            setProfileData({
              name: data.name || '',
              email: data.email || '',
              contactPhone: data.contactPhone || '',
              address: data.address || ''
            });
          }
        } catch (err) {
          console.error('Failed to load profile', err);
        }
      };

      await fetchAll();
      setIsLoading(false);
    };

    fetchData();
  }, [user, navigate]);

  // Re-fetch wishlist every time user switches to wishlist tab to get fresh data
  useEffect(() => {
    if (activeTab === 'wishlist' && user) {
      const fetchWishlist = async () => {
        setWishlistLoading(true);
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data } = await axios.get('http://localhost:5000/api/users/wishlist', config);
          setWishlist(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error('Failed to refresh wishlist', err);
        } finally {
          setWishlistLoading(false);
        }
      };
      fetchWishlist();
    }
  }, [activeTab, user]);

  const stats = useMemo(() => {
    const paidBookings = bookings.filter(b => b.paymentStatus === 'paid');
    const upcomingCount = bookings.filter(b => b.checkIn && new Date(b.checkIn) >= new Date() && b.paymentStatus !== 'cancelled').length;
    const totalSpend = paidBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    
    return {
      upcoming: upcomingCount,
      totalSpend: totalSpend,
      completed: bookings.filter(b => b.checkOut && new Date(b.checkOut) < new Date() && b.paymentStatus === 'paid').length,
      activeBookings: bookings.length
    };
  }, [bookings]);

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/bookings/${id}/cancel`, {}, config);
      toast.success('Booking cancelled');
      setBookings(bookings.map(b => b._id === id ? { ...b, paymentStatus: 'cancelled' } : b));
    } catch (err) {
      toast.error('Failed to cancel booking');
    }
  };

  const markNotificationRead = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, config);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
      console.error('Failed to mark notification as read');
    }
  };

  const handleRemoveFromWishlist = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`http://localhost:5000/api/users/wishlist/${id}`, {}, config);
      setWishlist(wishlist.filter(item => item._id !== id));
      toast.success('Removed from wishlist');
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put('http://localhost:5000/api/users/profile', profileData, config);
      
      // Preserve the auth token — profile endpoint doesn't re-issue it
      const updatedUser = { ...user, ...data, token: user.token };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success('Profile updated successfully! ✅');
    } catch (err) {
      console.error('Profile update error:', err);
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleRescheduleResponse = async (bookingId, action) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}/respond-reschedule`, { action }, config);
      toast.success(`Reschedule request ${action}!`);
      
      // Refresh bookings
      const { data } = await axios.get('http://localhost:5000/api/bookings/mybookings', config);
      setBookings(data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to respond to request');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-brand border-r-transparent"></div>
          <p className="mt-4 text-slate-600 font-medium text-lg">Preparing your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-slate-500 mt-1">Here's what's happening with your travels.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-all relative"
              >
                <Bell size={20} className="text-slate-600" />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 h-3 w-3 bg-brand rounded-full border-2 border-white"></span>
                )}
              </button>
              
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl border border-slate-200 shadow-xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Notifications</h3>
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-500">{notifications.length} New</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <AlertCircle size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No new notifications</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n._id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => markNotificationRead(n._id)}>
                          <p className="text-sm text-slate-800 font-medium">{n.message}</p>
                          <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <Link to="/" className="hidden md:flex items-center gap-2 bg-brand text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-brand/20 hover:scale-105 transition-transform">
              Book a new stay
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <DashboardSidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            user={user} 
            onLogout={logout} 
          />

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Upcoming Stays', value: stats.upcoming, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Total Spending', value: `₹${stats.totalSpend}`, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Completed Trips', value: stats.completed, icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Total Bookings', value: stats.activeBookings, icon: History, color: 'text-amber-600', bg: 'bg-amber-50' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className={`h-12 w-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-4`}>
                        <stat.icon className={stat.color} size={24} />
                      </div>
                      <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Charts and Activity */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Spending Overview</h2>
                        <p className="text-sm text-slate-500">Your travel investment over time</p>
                      </div>
                      <TrendingUp className="text-brand opacity-50" size={24} />
                    </div>
                    <SpendingChart bookings={bookings} />
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h2>
                    <div className="space-y-6">
                      {bookings.slice(0, 3).map((booking, i) => (
                        <div key={i} className="flex gap-4">
                          <div className="relative">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${i === 0 ? 'bg-brand' : 'bg-slate-200'}`}>
                              {i === 0 ? <CheckCircle2 size={18} /> : <History size={18} className="text-slate-500" />}
                            </div>
                            {i < 2 && <div className="absolute top-10 left-1/2 w-0.5 h-12 bg-slate-100 -translate-x-1/2"></div>}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {booking.paymentStatus === 'paid' ? 'Booking Confirmed' : 'Booking Initiated'}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">{booking.listing?.title}</p>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{new Date(booking.createdAt || booking.checkIn).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                      {bookings.length === 0 && (
                        <p className="text-slate-400 text-sm italic">No recent activity yet.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reschedule Requests Alert */}
                {bookings.filter(b => b.rescheduleRequest?.status === 'pending').map(b => (
                  <div key={b._id} className="bg-brand/10 border border-brand/20 p-6 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-brand text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20">
                         <Calendar size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Reschedule Request for "{b.listing?.title}"</h3>
                        <p className="text-sm text-slate-600">The host has proposed new dates: <b>{new Date(b.rescheduleRequest.checkIn).toLocaleDateString()} - {new Date(b.rescheduleRequest.checkOut).toLocaleDateString()}</b></p>
                      </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                      <button onClick={() => handleRescheduleResponse(b._id, 'accepted')} className="flex-1 md:flex-none bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-md">Accept New Dates</button>
                      <button onClick={() => handleRescheduleResponse(b._id, 'declined')} className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all">Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">My Trips</h2>
                  <div className="flex gap-2">
                    <span className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium text-slate-600">
                      Total: {bookings.length}
                    </span>
                  </div>
                </div>

                {bookings.length === 0 ? (
                  <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
                    <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MapPin size={40} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">No trips found</h3>
                    <p className="text-slate-500 mt-2 max-w-xs mx-auto">Explore amazing places and start your journey today.</p>
                    <Link to="/" className="inline-block mt-8 bg-brand text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-brand/20 hover:scale-105 transition-transform">
                      Explore Destinations
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                    {bookings.map((booking) => (
                      <div key={booking._id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition-all group">
                        <div className="relative h-48">
                          <img 
                            src={booking.listing?.images?.[0]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'} 
                            alt={booking.listing?.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md ${statusStyles[booking.paymentStatus] || 'bg-white'}`}>
                            {booking.paymentStatus?.toUpperCase()}
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-slate-900 truncate">{booking.listing?.title}</h3>
                          <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                            <MapPin size={14} />
                            <span>{booking.listing?.location}</span>
                          </div>

                          <div className="mt-6 grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl">
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Check-in</p>
                              <p className="text-sm font-bold text-slate-900">{booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Check-out</p>
                              <p className="text-sm font-bold text-slate-900">{booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div className="col-span-2 border-t border-slate-200 pt-2 mt-2">
                              {booking.refundAmount > 0 && (
                                <div className="mb-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-between">
                                  <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Refund Pending</span>
                                  <span className="text-sm font-bold text-emerald-700">₹{booking.refundAmount}</span>
                                </div>
                              )}
                              {booking.pendingAmount > 0 && (
                                <div className="mb-2 p-2 bg-amber-50 rounded-lg border border-amber-100 flex items-center justify-between">
                                  <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Additional Payment</span>
                                  <span className="text-sm font-bold text-amber-700">₹{booking.pendingAmount}</span>
                                </div>
                              )}
                              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Property Manager Contact</p>
                              <div className="space-y-1 mt-1">
                                <p className="text-sm font-bold text-brand flex items-center gap-1">
                                  <Phone size={12} /> {booking.listing?.host?.contactPhone || 'Phone unavailable'}
                                </p>
                                <p className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                                  <Mail size={12} /> {booking.listing?.host?.email || 'Email unavailable'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 flex flex-wrap gap-2">
                            {booking.paymentStatus === 'paid' && booking.pendingAmount === 0 && (
                              <button 
                                onClick={() => generateReceipt(booking, user)}
                                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
                              >
                                <Download size={16} />
                                Receipt
                              </button>
                            )}
                            {booking.pendingAmount > 0 && (
                              <div className="flex gap-2 w-full">
                                <button 
                                  onClick={() => navigate(`/listings/${booking.listing?._id}`)}
                                  className="flex-1 bg-brand text-white py-3 rounded-xl text-sm font-bold hover:bg-rose-600 transition-colors whitespace-nowrap"
                                >
                                  Pay Online (₹{booking.pendingAmount})
                                </button>
                                <button 
                                  onClick={() => toast.info(`Confirmed: You can pay the additional ₹${booking.pendingAmount} directly at the property during check-in. ✅`)}
                                  className="flex-1 border border-slate-200 text-slate-700 py-3 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors whitespace-nowrap"
                                >
                                  Pay at Property
                                </button>
                              </div>
                            )}
                            {(booking.paymentStatus === 'pending' || booking.paymentStatus === 'failed') && booking.pendingAmount === 0 && (
                              <button 
                                onClick={() => navigate(`/listings/${booking.listing?._id}`)}
                                className="flex-1 bg-brand text-white py-3 rounded-xl text-sm font-bold hover:bg-rose-600 transition-colors"
                              >
                                Pay Now
                              </button>
                            )}
                            {booking.paymentStatus !== 'cancelled' && (
                              <button 
                                onClick={() => handleCancelBooking(booking._id)}
                                className="px-4 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Your Wishlist</h2>
                  <span className="text-sm text-slate-500">{wishlist.length} saved properties</span>
                </div>
                
                {wishlist.length === 0 ? (
                   <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center">
                    <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                      <Heart size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Your wishlist is empty</h3>
                    <p className="text-slate-500 mt-2 max-w-xs mx-auto">Save your favorite properties to view them later.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                    {wishlist.map((item) => (
                      <div key={item._id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition-all group">
                        <div className="relative h-48">
                          <img 
                            src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'} 
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <button 
                            onClick={() => handleRemoveFromWishlist(item._id)}
                            className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div className="p-6">
                          <h3 className="text-lg font-bold text-slate-900 truncate">{item.title}</h3>
                          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                            <MapPin size={14} /> {item.location}
                          </p>
                          <div className="mt-4 flex items-center justify-between">
                            <p className="font-bold text-brand">₹{item.price} <span className="text-xs font-normal text-slate-400">/ night</span></p>
                            <Link to={`/listings/${item._id}`} className="text-xs font-bold uppercase tracking-wider text-slate-900 hover:text-brand transition-colors">
                              View details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'finance' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">Refunds & Payments</h2>
                  <p className="text-slate-500 mt-1">Manage your transaction history and pending refunds from rescheduled stays.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl">
                    <p className="text-emerald-600 text-sm font-bold uppercase tracking-widest mb-1">Total Refunds</p>
                    <p className="text-3xl font-black text-emerald-700">₹{bookings.reduce((sum, b) => sum + (b.refundAmount || 0), 0)}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl">
                    <p className="text-amber-600 text-sm font-bold uppercase tracking-widest mb-1">Pending Payments</p>
                    <p className="text-3xl font-black text-amber-700">₹{bookings.reduce((sum, b) => sum + (b.pendingAmount || 0), 0)}</p>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                   <div className="p-6 border-b border-slate-100 font-bold text-slate-900 bg-slate-50/50">Recent Financial Activity</div>
                   <div className="divide-y divide-slate-100">
                      {bookings.filter(b => (b.refundAmount > 0 || b.pendingAmount > 0)).length === 0 ? (
                        <div className="p-12 text-center text-slate-400 italic">No financial adjustments found.</div>
                      ) : (
                        bookings.filter(b => (b.refundAmount > 0 || b.pendingAmount > 0)).map(b => (
                          <div key={b._id} className="p-6 flex items-center justify-between">
                            <div>
                               <p className="font-bold text-slate-900">{b.listing?.title}</p>
                               <p className="text-xs text-slate-500">Rescheduled stay adjustment</p>
                            </div>
                            <div className="text-right">
                               {b.refundAmount > 0 && <p className="text-emerald-600 font-bold">+ ₹{b.refundAmount} (Refund)</p>}
                               {b.pendingAmount > 0 && <p className="text-rose-600 font-bold">- ₹{b.pendingAmount} (Due)</p>}
                               <p className="text-[10px] text-slate-400 uppercase tracking-tighter mt-1">{new Date(b.updatedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Edit Profile</h2>
                <p className="text-slate-500 text-sm mb-6">Update your personal details, contact info, and address. All changes are saved to the database.</p>
                
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-brand rounded-3xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand/20">
                        {profileData.name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{profileData.name}</h3>
                        <p className="text-sm text-slate-500 capitalize">{user?.role} Account</p>
                      </div>
                    </div>
                  </div>
                  
                  <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <UserIcon size={16} /> Full Name
                        </label>
                        <input 
                          type="text" 
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <Mail size={16} /> Email Address
                        </label>
                        <input 
                          type="email" 
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                          placeholder="your@email.com"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <Phone size={16} /> Phone Number
                        </label>
                        <input 
                          type="tel" 
                          value={profileData.contactPhone}
                          onChange={(e) => setProfileData({...profileData, contactPhone: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <Home size={16} /> Address
                        </label>
                        <input 
                          type="text" 
                          value={profileData.address}
                          onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                          placeholder="Your residential address"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <button 
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="flex items-center gap-2 bg-brand text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-brand/20 hover:scale-105 transition-all disabled:opacity-50"
                      >
                        {isUpdatingProfile ? 'Saving...' : (
                          <>
                            <Save size={18} />
                            Save Profile Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
