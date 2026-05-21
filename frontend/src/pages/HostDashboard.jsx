import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Calendar, Save, XCircle, Home, Plus, Edit, Trash2, Bell, Phone, Mail } from 'lucide-react';

import HostReports from '../components/HostReports';

const HostDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [myListings, setMyListings] = useState([]);
  const [hostBookings, setHostBookings] = useState([]);
  const [hostSummary, setHostSummary] = useState({ total: 0, active: 0, revenue: 0 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newListing, setNewListing] = useState({ 
    title: '', 
    description: '', 
    propertyType: 'Apartment', 
    location: '', 
    price: '',
    maxGuests: 2,
    checkInTime: '14:00',
    checkOutTime: '11:00',
    amenities: 'Wifi, Kitchen, AC, Parking'
  });
  const [imageFiles, setImageFiles] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [reschedulingId, setReschedulingId] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ checkIn: '', checkOut: '' });

  useEffect(() => {
    if (!user || (user.role !== 'host' && user.role !== 'admin')) {
      toast.error('Not authorized');
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const [{ data: listingsData }, { data: bookingsData }, { data: notifData }] = await Promise.all([
          axios.get('http://localhost:5000/api/listings/host', config),
          axios.get('http://localhost:5000/api/bookings/host', config),
          axios.get('http://localhost:5000/api/notifications', config)
        ]);
        setNotifications(notifData);
        setMyListings(listingsData);
        setHostBookings(bookingsData);
        setHostSummary({
          total: bookingsData.length,
          active: bookingsData.filter(b => b.paymentStatus !== 'cancelled').length,
          revenue: bookingsData.reduce((sum, booking) => sum + (booking.paymentStatus !== 'cancelled' ? booking.totalPrice : 0), 0)
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [user, navigate]);

  const handleDeleteListing = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`http://localhost:5000/api/listings/${id}`, config);
      toast.success('Listing deleted');
      setMyListings(myListings.filter(l => l._id !== id));
    } catch (err) {
      toast.error('Failed to delete listing');
    }
  };

  const handleDismissNotification = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, config);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
      console.error('Failed to dismiss notification');
    }
  };

  const handleAddListing = async (e) => {
    e.preventDefault();
    const hasImages = imageFiles && imageFiles.length > 0;
    if (!hasImages && !editingId) return toast.error('Please select at least one image');
    setUploading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      let uploadedImages = [];
      if (hasImages) {
        const formData = new FormData();
        for (let i = 0; i < imageFiles.length; i++) {
          formData.append('images', imageFiles[i]);
        }
        try {
          const uploadRes = await axios.post('http://localhost:5000/api/listings/upload', formData, config);
          uploadedImages = Array.isArray(uploadRes.data) ? uploadRes.data : [];
        } catch (uploadErr) {
          console.error('Image upload failed, saving with placeholders', uploadErr);
          toast.warning('Image upload failed. Using placeholders.');
          uploadedImages = [
            { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6', filename: 'placeholder1' }
          ];
        }
      }

      const payload = {
        ...newListing,
        price: Number(newListing.price) || 0,
        maxGuests: Number(newListing.maxGuests) || 2,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
        amenities: newListing.amenities.split(',').map(a => a.trim()).filter(a => a !== '')
      };

      if (editingId) {
        const { data } = await axios.put(`http://localhost:5000/api/listings/${editingId}`, payload, config);
        setMyListings(myListings.map(l => l._id === editingId ? data : l));
        toast.success('Property Updated!');
      } else {
        const { data } = await axios.post('http://localhost:5000/api/listings', payload, config);
        setMyListings([data, ...myListings]);
        toast.success('Property Added!');
      }

      setShowAddForm(false);
      setEditingId(null);
      setNewListing({ title: '', description: '', propertyType: 'Apartment', location: '', price: '', maxGuests: 2, checkInTime: '14:00', checkOutTime: '11:00', amenities: 'Wifi, Kitchen, AC, Parking' });
      setImageFiles(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save listing');
    } finally {
      setUploading(false);
    }
  };

  const handleEditClick = (listing) => {
    setNewListing({
      title: listing.title,
      description: listing.description,
      propertyType: listing.propertyType,
      location: listing.location,
      price: listing.price,
      maxGuests: listing.maxGuests || 2,
      checkInTime: listing.checkInTime || '14:00',
      checkOutTime: listing.checkOutTime || '11:00',
      amenities: listing.amenities?.join(', ') || 'Wifi, Kitchen, AC, Parking'
    });
    setEditingId(listing._id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/bookings/${reschedulingId}/request-reschedule`, rescheduleData, config);
      toast.success('Reschedule request sent! Guest will be notified for approval.');
      setReschedulingId(null);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to send request';
      toast.error(msg);
      console.error('Reschedule error:', err);
    }
  };

  const startReschedule = (booking) => {
    setReschedulingId(booking._id);
    setRescheduleData({
      checkIn: new Date(booking.checkIn).toISOString().split('T')[0],
      checkOut: new Date(booking.checkOut).toISOString().split('T')[0]
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pb-12 w-full">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold">Host Dashboard</h1>
        <button onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); setNewListing({ title: '', description: '', propertyType: 'Apartment', location: '', price: '', maxGuests: 2, checkInTime: '14:00', checkOutTime: '11:00', amenities: 'Wifi, Kitchen, AC, Parking' }); setImageFiles(null); }} className="bg-brand text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-brand/20 hover:scale-105 transition-all">
          {showAddForm ? 'Cancel' : '+ Add New Property'}
        </button>
      </div>

      {/* Notifications Section */}
      {notifications.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Bell className="text-brand" /> Booking Alerts
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {notifications.map(n => (
              <div key={n._id} className="bg-white border border-slate-200 p-6 rounded-[32px] shadow-sm relative overflow-hidden group hover:border-brand/30 transition-all">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand"></div>
                <div className="flex justify-between items-start">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(n.createdAt).toLocaleDateString()}</p>
                   <button onClick={() => handleDismissNotification(n._id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><XCircle size={18}/></button>
                </div>
                <p className="mt-2 text-slate-900 font-bold leading-tight">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid gap-5 xl:grid-cols-3 mb-10 text-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-widest text-slate-500">Total bookings</p>
          <p className="mt-2 text-4xl font-bold text-slate-900">{hostSummary.total}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-widest text-slate-500">Active bookings</p>
          <p className="mt-2 text-4xl font-bold text-slate-900">{hostSummary.active}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm uppercase tracking-widest text-slate-500">Revenue</p>
          <p className="mt-2 text-4xl font-bold text-brand">₹{hostSummary.revenue}</p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <form onSubmit={handleAddListing} className="bg-white border border-slate-200 p-8 rounded-[40px] shadow-xl mb-12 animate-in zoom-in-95 duration-300">
           <div className="grid gap-6 md:grid-cols-2">
              <input required placeholder="Property Title" className="w-full border border-slate-200 rounded-2xl px-5 py-4 bg-slate-50 outline-none" value={newListing.title} onChange={e => setNewListing({...newListing, title: e.target.value})} />
              <input required placeholder="Location" className="w-full border border-slate-200 rounded-2xl px-5 py-4 bg-slate-50 outline-none" value={newListing.location} onChange={e => setNewListing({...newListing, location: e.target.value})} />
              <select className="w-full border border-slate-200 rounded-2xl px-5 py-4 bg-slate-50 outline-none" value={newListing.propertyType} onChange={e => setNewListing({...newListing, propertyType: e.target.value})}>
                <option>Apartment</option><option>House</option><option>Cabin</option><option>Villa</option>
              </select>
              <input required type="number" placeholder="Price per Night (₹)" className="w-full border border-slate-200 rounded-2xl px-5 py-4 bg-slate-50 outline-none" value={newListing.price} onChange={e => setNewListing({...newListing, price: e.target.value})} />
              <input required type="number" placeholder="Max Guests" className="w-full border border-slate-200 rounded-2xl px-5 py-4 bg-slate-50 outline-none" value={newListing.maxGuests} onChange={e => setNewListing({...newListing, maxGuests: e.target.value})} />
              <input required placeholder="Amenities (Wifi, AC, Pool)" className="w-full border border-slate-200 rounded-2xl px-5 py-4 bg-slate-50 outline-none" value={newListing.amenities} onChange={e => setNewListing({...newListing, amenities: e.target.value})} />
              <textarea required placeholder="Description" className="w-full border border-slate-200 rounded-2xl px-5 py-4 bg-slate-50 outline-none md:col-span-2 min-h-[100px]" value={newListing.description} onChange={e => setNewListing({...newListing, description: e.target.value})}></textarea>
              <div className="md:col-span-2 border-2 border-dashed border-slate-200 rounded-3xl p-6 text-center bg-slate-50">
                <input type="file" multiple accept="image/*" onChange={e => setImageFiles(e.target.files)} className="mb-2" />
                <p className="text-xs text-slate-400">Upload photos of your property</p>
              </div>
           </div>
           <div className="mt-8 flex gap-4">
              <button disabled={uploading} type="submit" className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 disabled:opacity-50">
                {uploading ? 'Saving...' : editingId ? 'Update Listing' : 'Publish Property'}
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="px-8 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
           </div>
        </form>
      )}

      {/* Bookings Summary Table */}
      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm mb-12">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
           <h2 className="text-xl font-bold text-slate-900">Guest Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold border-b">
              <tr>
                <th className="px-6 py-4">Guest</th>
                <th className="px-6 py-4">Property</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {hostBookings.map(booking => (
                <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{booking.user?.name || 'Guest'}</td>
                  <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]">{booking.listing?.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {reschedulingId === booking._id ? (
                      <div className="flex flex-col gap-1">
                        <input type="date" className="border rounded px-2 py-1 text-xs" value={rescheduleData.checkIn} onChange={e => setRescheduleData({...rescheduleData, checkIn: e.target.value})} />
                        <input type="date" className="border rounded px-2 py-1 text-xs" value={rescheduleData.checkOut} onChange={e => setRescheduleData({...rescheduleData, checkOut: e.target.value})} />
                      </div>
                    ) : (
                      <span className="text-slate-600 font-medium">{new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">₹{booking.totalPrice}</td>
                  <td className="px-6 py-4">
                    {reschedulingId === booking._id ? (
                      <div className="flex gap-2">
                        <button onClick={handleRescheduleSubmit} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-sm"><Save size={14}/></button>
                        <button onClick={() => setReschedulingId(null)} className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"><XCircle size={14}/></button>
                      </div>
                    ) : (
                      <button onClick={() => startReschedule(booking)} className="flex items-center gap-2 text-brand font-bold hover:underline">
                        <Calendar size={14} /> Reschedule
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {hostBookings.length === 0 && <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">No active bookings yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {myListings.map(listing => (
          <div key={listing._id} className="bg-white border border-slate-200 p-5 rounded-[32px] shadow-sm hover:shadow-xl transition-all group">
            <div className="aspect-video rounded-[24px] overflow-hidden mb-4 relative">
              <img src={listing.images[0]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={listing.title} />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                {listing.propertyType}
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{listing.title}</h3>
            <p className="text-slate-500 text-sm mt-1">{listing.location}</p>
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
              <p className="font-bold text-brand">₹{listing.price} <span className="text-xs text-slate-400 font-normal">/ night</span></p>
              <div className="flex gap-2">
                <button onClick={() => handleEditClick(listing)} className="p-2 text-slate-400 hover:text-brand transition-colors"><Edit size={18}/></button>
                <button onClick={() => handleDeleteListing(listing._id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={18}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <HostReports />
    </div>
  );
};

export default HostDashboard;
