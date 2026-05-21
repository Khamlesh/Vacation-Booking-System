import { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { generateReceipt } from '../utils/generateReceipt';
import { Download, CheckCircle } from 'lucide-react';

const BOOKING_CONFIRMATION_KEY = 'bookingConfirmationData';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [confirmation, setConfirmation] = useState(location.state?.confirmation || null);

  useEffect(() => {
    if (location.state?.confirmation) {
      setConfirmation(location.state.confirmation);
      sessionStorage.setItem(BOOKING_CONFIRMATION_KEY, JSON.stringify(location.state.confirmation));
      return;
    }

    const stored = sessionStorage.getItem(BOOKING_CONFIRMATION_KEY);
    if (stored) {
      setConfirmation(JSON.parse(stored));
    }
  }, [location.state]);

  const handleDownloadReceipt = () => {
    // Normalize confirmation to booking structure for generateReceipt
    const normalizedBooking = {
      _id: confirmation.bookingId || 'N/A',
      listing: {
        title: confirmation.listingTitle || 'Stay',
        location: 'Refer to booking'
      },
      checkIn: confirmation.checkIn,
      checkOut: confirmation.checkOut,
      totalPrice: confirmation.totalPrice || confirmation.chargeAmount || 0,
      paymentStatus: 'paid'
    };
    generateReceipt(normalizedBooking, user || { name: confirmation.guestName });
  };

  if (!confirmation) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 text-center">
        <p className="text-xl font-semibold text-slate-900">No booking confirmation available</p>
        <p className="mt-3 text-sm text-slate-600">It looks like you landed here without completing a reservation.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-rose-600 transition"
        >
          Browse stays
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pb-16">
      <div className="rounded-[32px] border border-emerald-200 bg-emerald-50 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <CheckCircle size={24} />
          </div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-700 font-semibold">Booking confirmed</p>
        </div>
        <h1 className="text-4xl font-bold text-slate-900">Your vacation stay is reserved</h1>
        <p className="mt-3 text-sm text-slate-600">We have received your payment and your reservation details are below.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Booking ID</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{confirmation.bookingId || 'N/A'}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Guest name</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{confirmation.guestName || 'N/A'}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Phone</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{confirmation.guestPhone || 'N/A'}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Stay</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{confirmation.listingTitle || 'Stay details'}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Payment method</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{confirmation.paymentMethod ? confirmation.paymentMethod.toUpperCase() : 'Card'}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Check-in</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{new Date(confirmation.checkIn).toLocaleDateString()}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Check-out</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{new Date(confirmation.checkOut).toLocaleDateString()}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total paid</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">₹{confirmation.totalPrice || confirmation.chargeAmount || 0}</p>
          </div>
          <div className="rounded-3xl bg-emerald-100 p-6 shadow-sm border border-emerald-200">
            <p className="text-sm text-emerald-700 font-bold uppercase tracking-wider">Property Manager Details</p>
            <div className="mt-3 space-y-2">
              <p className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-lg opacity-60">📞</span> {confirmation.hostPhone || 'N/A'}
              </p>
              <p className="text-base font-semibold text-slate-700 flex items-center gap-2">
                <span className="text-lg opacity-60">✉️</span> {confirmation.hostEmail || 'N/A'}
              </p>
            </div>
            <p className="text-xs text-emerald-600 mt-3 font-medium italic">Save these details for check-in coordination</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <button
            onClick={() => navigate('/user-dashboard')}
            className="rounded-full bg-brand px-8 py-4 text-sm font-bold text-white hover:bg-rose-600 transition shadow-lg shadow-brand/20"
          >
            Go to Dashboard
          </button>
          <button
            onClick={handleDownloadReceipt}
            className="rounded-full flex items-center justify-center gap-2 border border-slate-300 bg-white px-8 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <Download size={18} />
            Download Receipt
          </button>
          <button
            onClick={() => navigate('/')}
            className="rounded-full border border-slate-300 bg-white px-8 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            Keep Browsing
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
