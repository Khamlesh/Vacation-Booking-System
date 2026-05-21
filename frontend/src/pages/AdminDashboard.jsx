import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminReports from '../components/AdminReports';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [pendingHosts, setPendingHosts] = useState([]);
  
  // New user form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });

  // Edit user state
  const [editingUserId, setEditingUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', role: '' });

  // Tab state: 'overview' | 'analysis'
  const [activeTab, setActiveTab] = useState('overview');

  const CHART_COLORS = ['#FF385C', '#00A699', '#FFB400', '#717171', '#FF5A5F', '#00D1C1'];

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Not authorized');
      navigate('/unauthorized');
      return;
    }

    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data: usersData } = await axios.get('http://localhost:5000/api/users', config);
        setAllUsers(usersData);

        const { data: bookingsData } = await axios.get('http://localhost:5000/api/bookings', config);
        setAllBookings(bookingsData);

        const { data: listingsData } = await axios.get('http://localhost:5000/api/listings', config);
        setAllListings(listingsData);

        const { data: pendingData } = await axios.get('http://localhost:5000/api/users/pending-hosts', config);
        setPendingHosts(pendingData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [user, navigate]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      // Use the public register endpoint to create the user
      await axios.post('http://localhost:5000/api/auth/register', newUser);
      toast.success('Customer added successfully');
      
      // Refresh user list
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data: usersData } = await axios.get('http://localhost:5000/api/users', config);
      setAllUsers(usersData);
      
      // Reset form
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      setShowAddForm(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add customer');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      if (user._id === id) {
        toast.error('You cannot delete your own admin account from here.');
        return;
      }

      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`http://localhost:5000/api/users/${id}`, config);
      toast.success('User deleted');
      setAllUsers(allUsers.filter(u => u._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      if (user._id === id) {
        toast.error('You cannot change your own role from this interface.');
        return;
      }

      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`http://localhost:5000/api/users/${id}/role`, { role }, config);
      toast.success('User role updated');
      setAllUsers(allUsers.map(u => (u._id === id ? { ...u, role: data.user.role } : u)));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update role');
    }
  };

  const handleEditClick = (u) => {
    if (u._id === user._id) {
      toast.error('You cannot edit your own account from here.');
      return;
    }
    setEditingUserId(u._id);
    setEditFormData({ name: u.name, email: u.email, role: u.role });
  };

  const handleEditSubmit = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`http://localhost:5000/api/users/${id}`, editFormData, config);
      toast.success('User details updated');
      setAllUsers(allUsers.map(u => (u._id === id ? data.user : u)));
      setEditingUserId(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update user');
    }
  };

  const handleApproveHost = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/users/approve-host/${id}`, {}, config);
      toast.success('Host account approved');
      setPendingHosts(pendingHosts.filter(h => h._id !== id));
      
      // Refresh user list to show the new host
      const { data: usersData } = await axios.get('http://localhost:5000/api/users', config);
      setAllUsers(usersData);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to approve host');
    }
  };

  const handleRejectHost = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`http://localhost:5000/api/users/reject-host/${id}`, config);
      toast.success('Host request rejected and account deleted');
      setPendingHosts(pendingHosts.filter(h => h._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject host');
    }
  };

  const totalRevenue = allBookings
    .filter(b => b.paymentStatus !== 'cancelled')
    .reduce((acc, booking) => acc + booking.totalPrice, 0);

  const activeBookings = allBookings.filter(b => b.paymentStatus === 'paid').length;
  const cancelledBookings = allBookings.filter(b => b.paymentStatus === 'cancelled').length;
  const usersCount = allUsers.filter(u => u.role === 'user').length;
  const hostsCount = allUsers.filter(u => u.role === 'host').length;
  const adminsCount = allUsers.filter(u => u.role === 'admin').length;
  const totalListings = allListings.length;

  const userBookingStats = Object.values(allBookings.reduce((acc, booking) => {
    const userId = booking.user?._id || booking.user;
    const name = booking.user?.name || 'Unknown';
    const email = booking.user?.email || '';

    if (!acc[userId]) {
      acc[userId] = { userId, name, email, bookingCount: 0, revenue: 0, linkedBookings: [] };
    }

    acc[userId].bookingCount += 1;
    
    // Track the specific properties this customer booked
    const propertyName = booking.listing?.title || 'Unknown Property';
    if (!acc[userId].linkedBookings.includes(propertyName)) {
      acc[userId].linkedBookings.push(propertyName);
    }

    if (booking.paymentStatus !== 'cancelled') {
      acc[userId].revenue += booking.totalPrice;
    }

    return acc;
  }, {}));

  const hostListingSummary = Object.values(allListings.reduce((acc, listing) => {
    const hostId = listing.host?._id || listing.host;
    const hostName = listing.host?.name || 'Unknown Host';

    if (!acc[hostId]) {
      acc[hostId] = { hostId, hostName, listings: 0 };
    }

    acc[hostId].listings += 1;
    return acc;
  }, {}));

  // Analytics: Property Type Performance
  const propertyTypeStats = Object.values(allBookings.reduce((acc, booking) => {
    if (booking.paymentStatus === 'cancelled') return acc;
    const type = booking.listing?.propertyType || 'Unknown';
    if (!acc[type]) acc[type] = { type, count: 0, revenue: 0 };
    acc[type].count += 1;
    acc[type].revenue += booking.totalPrice;
    return acc;
  }, {})).sort((a, b) => b.count - a.count);

  // Analytics: Top Performing Hosts
  const hostPerformance = Object.values(allBookings.reduce((acc, booking) => {
    if (booking.paymentStatus === 'cancelled' || !booking.listing) return acc;
    const hostId = (booking.listing?.host?._id || booking.listing?.host)?.toString();
    if (!hostId) return acc;

    const hostObj = allUsers.find(u => u._id.toString() === hostId);
    const hostName = hostObj ? hostObj.name : 'Unknown Host';
    
    if (!acc[hostId]) acc[hostId] = { hostId, hostName, count: 0, revenue: 0 };
    acc[hostId].count += 1;
    acc[hostId].revenue += booking.totalPrice;
    return acc;
  }, {})).sort((a, b) => b.count - a.count).slice(0, 5); // Top 5 hosts

  // Analytics: Top Performing Properties
  const topProperties = Object.values(allBookings.reduce((acc, booking) => {
    if (booking.paymentStatus === 'cancelled') return acc;
    const listingId = booking.listing?._id;
    const title = booking.listing?.title || 'Unknown Property';
    
    if (!listingId) return acc;

    if (!acc[listingId]) acc[listingId] = { listingId, title, count: 0, revenue: 0 };
    acc[listingId].count += 1;
    acc[listingId].revenue += booking.totalPrice;
    return acc;
  }, {})).sort((a, b) => b.count - a.count).slice(0, 5); // Top 5 properties

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pb-16 w-full">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">Manage users, monitor bookings, and view system revenue.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl w-fit mt-4 lg:mt-0">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Management
          </button>
          <button 
            onClick={() => setActiveTab('analysis')}
            className={`px-6 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'analysis' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Analysis & Charts
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-2 rounded-xl text-sm font-semibold transition relative ${activeTab === 'requests' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Host Requests
            {pendingHosts.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                {pendingHosts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        
        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm flex flex-col justify-between">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">Total Users</p>
            <p className="mt-4 text-3xl font-bold text-slate-900">{allUsers.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm flex flex-col justify-between">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">Hosts</p>
            <p className="mt-4 text-3xl font-bold text-slate-900">{hostsCount}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm flex flex-col justify-between">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">Total Bookings</p>
            <p className="mt-4 text-3xl font-bold text-slate-900">{allBookings.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm flex flex-col justify-between">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">Total Listings</p>
            <p className="mt-4 text-3xl font-bold text-slate-900">{totalListings}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-brand text-white p-6 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
            <p className="text-xs uppercase tracking-[0.18em] text-white/80 font-semibold">Revenue</p>
            <p className="mt-4 text-3xl font-bold">₹{totalRevenue}</p>
          </div>
        </div>

        {activeTab === 'analysis' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Visual Analytics Row */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Property Type Bar Chart */}
              <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-900">Bookings by Property Type</h2>
                  <p className="text-sm text-slate-500">Visual comparison of category popularity.</p>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={propertyTypeStats}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                        cursor={{fill: '#f8fafc'}}
                      />
                      <Bar dataKey="count" name="Total Bookings" fill="#FF385C" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Host Revenue Distribution (Pie Chart) */}
              <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-900">Top Host Revenue Share</h2>
                  <p className="text-sm text-slate-500">Distribution of earnings across top 5 hosts.</p>
                </div>
                <div className="h-[300px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={hostPerformance}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="revenue"
                        nameKey="hostName"
                      >
                        {hostPerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius: '16px'}} />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>

            {/* Revenue Trend Area Chart */}
            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">Property Popularity Analysis</h2>
                <p className="text-sm text-slate-500">Comparison of bookings vs revenue for top 5 properties.</p>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProperties} layout="vertical" margin={{ left: 40, right: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="title" type="category" width={120} axisLine={false} tickLine={false} tick={{fontSize: 11}} />
                    <Tooltip contentStyle={{borderRadius: '16px'}} cursor={{fill: '#f8fafc'}} />
                    <Legend />
                    <Bar dataKey="count" name="Bookings" fill="#00A699" radius={[0, 4, 4, 0]} barSize={20} />
                    <Bar dataKey="revenue" name="Revenue (₹)" fill="#FFB400" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Existing Tables below but specifically for Analysis context */}
            <div className="grid xl:grid-cols-2 gap-8">
              <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden h-fit">
                <div className="px-6 py-5 border-b bg-slate-50">
                  <h2 className="text-lg font-semibold text-slate-900">Detailed Performance Table</h2>
                  <p className="text-sm text-slate-500 mt-1">Numerical breakdown of host performance.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left border-collapse">
                    <thead className="bg-slate-100 text-slate-700 text-xs uppercase tracking-[0.1em]">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Host</th>
                        <th className="px-4 py-3 font-semibold text-center">Bookings</th>
                        <th className="px-4 py-3 font-semibold text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hostPerformance.map((stat) => (
                        <tr key={stat.hostId} className="border-b last:border-b-0">
                          <td className="px-4 py-3 text-sm font-medium">{stat.hostName}</td>
                          <td className="px-4 py-3 text-sm text-center">{stat.count}</td>
                          <td className="px-4 py-3 text-sm font-bold text-emerald-600 text-right">₹{stat.revenue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col items-center justify-center min-h-[300px]">
                <h2 className="text-lg font-bold text-slate-900 mb-4 w-full">User Role Distribution</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Customers', value: usersCount },
                        { name: 'Hosts', value: hostsCount },
                        { name: 'Admins', value: adminsCount }
                      ]}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#FF385C" />
                      <Cell fill="#00A699" />
                      <Cell fill="#FFB400" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </section>
              <AdminReports />
            </div>
          </div>
        ) : activeTab === 'requests' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Host Requests Section */}
            <section className="rounded-3xl border-2 border-brand/20 bg-brand/5 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="px-6 py-5 border-b border-brand/10 bg-white/50 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Host Registration Requests</h2>
                  <p className="text-sm text-slate-600 mt-1">Verify and approve new property owners seeking host access.</p>
                </div>
                <span className="rounded-full bg-brand px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                  {pendingHosts.length} Pending
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse">
                  <thead className="bg-slate-50/80 text-slate-700 text-sm uppercase tracking-[0.15em]">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Name</th>
                      <th className="px-5 py-4 font-semibold">Email</th>
                      <th className="px-5 py-4 font-semibold">Contact Phone</th>
                      <th className="px-5 py-4 font-semibold text-right">Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingHosts.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-5 py-10 text-center text-slate-500 italic">No pending host requests at this time.</td>
                      </tr>
                    ) : (
                      pendingHosts.map(h => (
                        <tr key={h._id} className="border-b last:border-b-0 hover:bg-white/40 transition">
                          <td className="px-5 py-4 text-sm font-medium text-slate-900">{h.name}</td>
                          <td className="px-5 py-4 text-sm text-slate-600">{h.email}</td>
                          <td className="px-5 py-4 text-sm font-mono text-brand font-bold">{h.contactPhone || 'N/A'}</td>
                          <td className="px-5 py-4 text-right space-x-3">
                            <button 
                              onClick={() => handleApproveHost(h._id)}
                              className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-600 transition"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleRejectHost(h._id)}
                              className="rounded-full bg-white border border-red-200 px-4 py-2 text-xs font-bold text-red-600 shadow-sm hover:bg-red-50 transition"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Management Content (Users, Bookings, Summary) */}
            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b bg-slate-50">
                <h2 className="text-lg font-semibold text-slate-900">Recent Bookings</h2>
                <p className="text-sm text-slate-500 mt-1">Review booking history and payment status.</p>
              </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 text-sm uppercase tracking-[0.15em]">
                <tr>
                  <th className="px-5 py-4 font-semibold">Booking ID</th>
                  <th className="px-5 py-4 font-semibold">User</th>
                  <th className="px-5 py-4 font-semibold">Listing</th>
                  <th className="px-5 py-4 font-semibold">Amount</th>
                  <th className="px-5 py-4 font-semibold">Guests</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Dates</th>
                </tr>
              </thead>
              <tbody>
                {allBookings.map(booking => (
                  <tr key={booking._id} className="border-b last:border-b-0 hover:bg-slate-50">
                    <td className="px-5 py-4 text-sm font-mono text-slate-500">{booking._id.slice(-6)}</td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-900">{booking.user?.name || 'Unknown'}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{booking.listing?.title || 'Unknown'}</td>
                    <td className="px-5 py-4 text-sm font-bold text-emerald-600">₹{booking.totalPrice}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{booking.numberOfGuests || 1}</td>
                    <td className="px-5 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${booking.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : booking.paymentStatus === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">{new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="user-directory" className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b bg-slate-50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">User Directory</h2>
              <p className="text-sm text-slate-500 mt-1">Manage your registered users, add new customers, and edit roles.</p>
            </div>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-600 transition"
            >
              {showAddForm ? 'Cancel' : '+ Add Customer'}
            </button>
          </div>
          
          {showAddForm && (
            <div className="p-6 border-b border-slate-200 bg-slate-50/50">
              <form onSubmit={handleAddUser} className="grid gap-4 sm:grid-cols-4 items-end">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Name</label>
                  <input type="text" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full rounded-2xl border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand" placeholder="Full name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full rounded-2xl border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                  <input type="password" required minLength="6" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full rounded-2xl border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand" placeholder="Min 6 chars" />
                </div>
                <div>
                  <button type="submit" className="w-full rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition">
                    Create User
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 text-sm uppercase tracking-[0.15em]">
                <tr>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers
                  .filter(u => u.status !== 'pending')
                  .map(u => (
                  <tr key={u._id} className="border-b last:border-b-0 hover:bg-slate-50">
                    {editingUserId === u._id ? (
                      <>
                        <td className="px-5 py-4">
                          <input type="text" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="w-full rounded border-slate-300 px-2 py-1 text-sm outline-none focus:border-brand" />
                        </td>
                        <td className="px-5 py-4">
                          <input type="email" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} className="w-full rounded border-slate-300 px-2 py-1 text-sm outline-none focus:border-brand" />
                        </td>
                        <td className="px-5 py-4">
                          <select value={editFormData.role} onChange={e => setEditFormData({...editFormData, role: e.target.value})} className="w-full rounded border-slate-300 px-2 py-1 text-sm outline-none focus:border-brand">
                            <option value="user">User</option>
                            <option value="host">Host</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-5 py-4 text-right space-x-2">
                          <button onClick={() => handleEditSubmit(u._id)} className="rounded bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition">Save</button>
                          <button onClick={() => setEditingUserId(null)} className="rounded bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-300 transition">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-5 py-4 text-sm text-slate-700">{u.name}</td>
                        <td className="px-5 py-4 text-sm text-slate-700">{u.email}</td>
                        <td className="px-5 py-4 text-sm capitalize text-slate-700">{u.role}</td>
                        <td className="px-5 py-4 text-sm text-right space-x-2">
                          <button
                            onClick={() => handleEditClick(u)}
                            disabled={u._id === user._id}
                            className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            disabled={u._id === user._id}
                            className="rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid xl:grid-cols-2 gap-8">
          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden h-fit">
            <div className="px-6 py-5 border-b bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-900">User Booking Details</h2>
              <p className="text-sm text-slate-500 mt-1">See booking count and revenue per user.</p>
            </div>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 text-sm uppercase tracking-[0.15em] sticky top-0">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Customer</th>
                    <th className="px-5 py-4 font-semibold">Bookings</th>
                    <th className="px-5 py-4 font-semibold text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {userBookingStats.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-5 py-6 text-center text-sm text-slate-500">No booking data available.</td>
                    </tr>
                  ) : (
                    userBookingStats.map((stat) => (
                      <tr key={stat.userId} className="border-b last:border-b-0 hover:bg-slate-50">
                        <td className="px-5 py-4 text-sm text-slate-900 font-medium">{stat.name}<br/><span className="text-xs text-slate-500 font-normal">{stat.email}</span></td>
                        <td className="px-5 py-4 text-sm font-semibold text-slate-900">{stat.bookingCount}</td>
                        <td className="px-5 py-4 text-sm font-bold text-emerald-600 text-right">₹{stat.revenue}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden h-fit">
            <div className="px-6 py-5 border-b bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-900">Host Listings Summary</h2>
              <p className="text-sm text-slate-500 mt-1">View how many properties each host has listed.</p>
            </div>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-slate-100 text-slate-700 text-sm uppercase tracking-[0.15em] sticky top-0">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Host</th>
                    <th className="px-5 py-4 font-semibold">Listings</th>
                    <th className="px-5 py-4 font-semibold text-right">Actions</th>
                </tr>
                </thead>
                <tbody>
                  {hostListingSummary.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-5 py-6 text-center text-sm text-slate-500">No host listings available.</td>
                    </tr>
                  ) : (
                    hostListingSummary.map((host) => (
                      <tr key={host.hostId} className="border-b last:border-b-0 hover:bg-slate-50">
                        <td className="px-5 py-4 text-sm text-slate-900 font-medium">{host.hostName}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-slate-900">{host.listings}</td>
                        <td className="px-5 py-4 text-right">
                          <button 
                            onClick={() => {
                              const u = allUsers.find(userObj => userObj._id === host.hostId);
                              if (u) {
                                handleEditClick(u);
                                document.getElementById('user-directory')?.scrollIntoView({ behavior: 'smooth' });
                              } else {
                                toast.error('Host not found in user list.');
                              }
                            }}
                            className="rounded-full bg-slate-100 border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                          >
                            Edit Host
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-900">Access Control Summary</h2>
            <p className="text-sm text-slate-500 mt-1">Quick overview of role distribution and site access status.</p>
          </div>
          <div className="px-6 py-6 space-y-5">
            <div>
              <div className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
                <span>User accounts</span>
                <span>{usersCount}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-brand" style={{ width: `${allUsers.length ? (usersCount / allUsers.length) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
                <span>Host accounts</span>
                <span>{hostsCount}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${allUsers.length ? (hostsCount / allUsers.length) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
                <span>Admin accounts</span>
                <span>{adminsCount}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-rose-500" style={{ width: `${allUsers.length ? (adminsCount / allUsers.length) * 100 : 0}%` }} />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-800">Access control guidance</p>
              <p className="mt-2 text-sm text-slate-600">Use the user role dropdowns above to manage access. Keep admin privileges limited and host access controlled.</p>
            </div>
          </div>
        </section>
          </div>
        )}
    </div>
  </div>
);
};
export default AdminDashboard;
