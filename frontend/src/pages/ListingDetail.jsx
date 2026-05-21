import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css';
import { differenceInDays } from 'date-fns';
import { Heart, Star } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const isStripeEnabled = Boolean(stripePublicKey) && !stripePublicKey.toLowerCase().includes('mock');
const stripePromise = isStripeEnabled ? loadStripe(stripePublicKey) : null;

const CheckoutForm = ({ totalPrice, paymentMethod, chargeAmount, handlePaymentSuccess, setProcessing, setPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useContext(AuthContext);

  if (!stripe || !elements) {
    return (
      <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        Payment gateway is loading, please wait a moment.
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);

    try {
      setPaymentError?.('');
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        'http://localhost:5000/api/payments/create-payment-intent',
        { amount: Math.max(1, Math.round(chargeAmount)), description: `Booking payment for ${chargeAmount} INR via ${paymentMethod === 'googlepay' ? 'Google Pay' : paymentMethod === 'upi' ? 'UPI' : 'Card'}` },
        config
      );

      if (!data?.clientSecret) {
        throw new Error('Payment gateway did not return a valid client secret.');
      }

      if (data.mode === 'mock') {
        handlePaymentSuccess(`mock_${Date.now()}`);
        setProcessing(false);
        return;
      }

      const payload = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) }
      });

      if (payload?.error) {
        const message = payload.error.message || 'Payment failed';
        console.error('Stripe payment error', payload.error);
        setPaymentError?.(message);
        toast.error(`Payment failed: ${message}`);
        setProcessing(false);
      } else if (payload?.paymentIntent?.id) {
        handlePaymentSuccess(payload.paymentIntent.id);
      } else {
        throw new Error('Payment was not completed.');
      }
    } catch (err) {
      console.error('Payment flow failed', err);
      setPaymentError?.(err.response?.data?.error || err.message || 'Payment intent failed');
      toast.error(err.response?.data?.error || err.message || 'Payment intent failed');
      setProcessing(false);
    }
  };

  const methodLabels = {
    card: 'Credit / Debit Card',
    googlepay: 'Google Pay',
    upi: 'UPI'
  };

  const selectedMethodTitle = methodLabels[paymentMethod] || 'Card';

  return (
    <form onSubmit={handleSubmit} className="mt-4 border-t pt-4">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 mb-4">
        <p className="text-sm text-slate-600">Paying with</p>
        <p className="mt-2 text-lg font-semibold text-slate-900">{selectedMethodTitle}</p>
        <p className="mt-2 text-sm text-slate-500">Enter the secure payment details below to complete booking.</p>
        {paymentMethod !== 'card' && (
          <p className="mt-2 text-xs text-slate-500">Google Pay/UPI is currently simulated in this demo. Card entry is reused for the checkout flow.</p>
        )}
      </div>
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-3">{paymentMethod === 'card' ? 'Card Details' : 'Payment details'}</label>
        <div className="rounded-2xl bg-white p-3 shadow-inner">
          <CardElement
            options={{
              hidePostalCode: true,
              style: {
                base: {
                  fontSize: '16px',
                  color: '#0f172a',
                  '::placeholder': { color: '#94a3b8' },
                  fontFamily: 'Inter, system-ui, sans-serif'
                },
                invalid: {
                  color: '#ef4444'
                }
              }
            }}
          />
        </div>
      </div>
      <button type="submit" disabled={!stripe} className="w-full bg-brand text-white py-3 rounded-lg font-semibold hover:bg-rose-600 transition shadow disabled:bg-gray-400">
        {processing ? 'Processing payment...' : 'Pay & confirm booking'}
      </button>
    </form>
  );
};

const MockPaymentForm = ({ totalPrice, paymentMethod, chargeAmount, handlePaymentSuccess, processing, setProcessing, setPaymentError }) => {
  const methodLabels = {
    card: 'Credit / Debit Card',
    googlepay: 'Google Pay',
    upi: 'UPI'
  };
  const selectedMethodTitle = methodLabels[paymentMethod] || 'Card';

  const handleMockPayment = async (e) => {
    e.preventDefault();
    console.log('Mock payment button clicked', { paymentMethod, chargeAmount });
    toast.info('Simulating payment processing...');
    setProcessing(true);
    setPaymentError('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      handlePaymentSuccess(`mock_payment_intent_${Date.now()}`);
    } catch (err) {
      setPaymentError('Simulated payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleMockPayment} className="mt-4 border-t pt-4">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 mb-4">
        <p className="text-sm text-slate-600">Stripe is not configured for this environment. Use the simulated checkout to complete the booking.</p>
        <p className="mt-3 text-sm font-semibold text-slate-900">Selected method: {selectedMethodTitle}</p>
      </div>
      <button type="submit" className="w-full bg-brand text-white py-3 rounded-lg font-semibold hover:bg-rose-600 transition shadow disabled:bg-gray-400" disabled={processing}>
        {processing ? 'Processing booking...' : `Simulate ${selectedMethodTitle} payment ₹${chargeAmount}`}
      </button>
    </form>
  );
};

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const [listing, setListing] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 86400000),
      key: 'selection'
    }
  ]);
  const [shownDate, setShownDate] = useState(new Date());
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [expectedCheckInTime, setExpectedCheckInTime] = useState('14:00');
  const [expectedCheckOutTime, setExpectedCheckOutTime] = useState('11:00');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentError, setPaymentError] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [reserveLoading, setReserveLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [reserveError, setReserveError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState('5');
  const [bookingConfirmation, setBookingConfirmation] = useState(null);

  useEffect(() => {
    if (user) {
      setGuestName(user.name || '');
      setGuestPhone(user.contactPhone || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchListingAndBookings = async () => {
      try {
        const [listingRes, bookingsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/listings/${id}`),
          axios.get(`http://localhost:5000/api/bookings/listing/${id}`)
        ]);
        
        setListing(listingRes.data);
        
        const dates = [];
        bookingsRes.data.forEach(booking => {
          let current = new Date(booking.checkIn);
          current.setHours(0,0,0,0);
          const end = new Date(booking.checkOut);
          end.setHours(0,0,0,0);
          while (current <= end) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
          }
        });
        console.log('Booked dates:', dates);
        setBookedDates(dates.filter(d => d instanceof Date && !isNaN(d.getTime())));
        setFetchError('');
      } catch (err) {
        console.error('Listing fetch failed', err);
        setFetchError('Unable to load the listing right now. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/reviews/${id}`);
        setReviews(data);
      } catch (err) {
        console.error('Review fetch failed', err);
      }
    };

    fetchListingAndBookings();
    fetchReviews();
  }, [id]);

  if (isLoading) {
    return <div className="text-center mt-20">Loading listing details...</div>;
  }

  if (fetchError) {
    return (
      <div className="text-center mt-20 px-4">
        <p className="text-xl font-semibold text-slate-900">Unable to load this listing</p>
        <p className="mt-3 text-sm text-slate-600">{fetchError}</p>
      </div>
    );
  }

  if (!listing || !listing._id) {
    return (
      <div className="text-center mt-20 px-4">
        <p className="text-xl font-semibold text-slate-900">Listing information is unavailable</p>
        <p className="mt-3 text-sm text-slate-600">Please try again later or return to the home page.</p>
      </div>
    );
  }

  const paymentMethods = [
    { key: 'card', title: 'Credit / Debit Card', description: 'Visa, Mastercard, Amex', icon: '💳' },
    { key: 'googlepay', title: 'Google Pay', description: 'Fast wallet checkout', icon: '📱' },
    { key: 'upi', title: 'UPI', description: 'PhonePe, Paytm, GPay UPI', icon: '₹' }
  ];

  const methodLabel = paymentMethods.find((method) => method.key === paymentMethod)?.title || 'Card';

  const displayPrice = listing.price || 0;
  const days = differenceInDays(dateRange[0].endDate, dateRange[0].startDate) || 1;
  const totalPrice = days * displayPrice;
  const chargeAmount = Math.max(1, totalPrice);

  const beginCheckout = async () => {
    if (!user) {
      toast.error('Please login to book');
      return navigate('/login');
    }

    if (!listing?._id) {
      const missingListingError = 'Selected listing is unavailable. Please try again later.';
      console.error(missingListingError);
      setReserveError(missingListingError);
      return;
    }

    if (!guestName.trim()) {
      setReserveError('Please provide your full name for the reservation.');
      return;
    }

    if (!guestPhone.trim()) {
      setReserveError('Please provide a phone number for booking confirmation.');
      return;
    }

    const hasValidDates = dateRange?.[0]?.startDate && dateRange?.[0]?.endDate;
    if (!hasValidDates || differenceInDays(dateRange[0].endDate, dateRange[0].startDate) < 0) {
      const invalidDatesError = 'Please select valid check-in and check-out dates.';
      console.error(invalidDatesError, dateRange);
      setReserveError(invalidDatesError);
      return;
    }

    if (totalPrice < 0) {
      const invalidPriceError = 'Booking amount is invalid.';
      console.error(invalidPriceError, { totalPrice });
      setReserveError(invalidPriceError);
      return;
    }

    setReserveError('');
    setBookingError('');
    setPaymentError('');
    setReserveLoading(true);
    toast.info('Initializing secure checkout...');

    try {
      console.log('Begin checkout triggered', { 
        listingId: listing._id, 
        userEmail: user?.email, 
        totalPrice,
        days,
        startDate: dateRange[0].startDate,
        endDate: dateRange[0].endDate
      });
      setShowPayment(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Checkout initialization failed', err);
      setReserveError(err?.message || 'Unable to start checkout. Please try again.');
    } finally {
      setReserveLoading(false);
    }
  };

  const handleBookingSuccess = async (paymentIntentId) => {
    if (!paymentIntentId) {
      const missingIntentError = 'Payment confirmation is missing. Please try again.';
      console.error(missingIntentError);
      setBookingError(missingIntentError);
      return;
    }

    if (!listing?._id) {
      const missingListingError = 'Selected listing is unavailable. Please choose another property.';
      console.error(missingListingError);
      setBookingError(missingListingError);
      return;
    }

    if (!dateRange?.[0]?.startDate || !dateRange?.[0]?.endDate) {
      const invalidDatesError = 'Selected dates are invalid. Please review your booking dates.';
      console.error(invalidDatesError);
      setBookingError(invalidDatesError);
      return;
    }

    const bookingAmount = paymentMethod === 'googlepay' ? chargeAmount : totalPrice;
    setProcessing(true);
    setBookingError('');

    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.post(
        'http://localhost:5000/api/bookings',
        {
          listingId: listing._id,
          guestName,
          guestPhone,
          numberOfGuests,
          expectedCheckInTime,
          expectedCheckOutTime,
          checkIn: dateRange[0].startDate,
          checkOut: dateRange[0].endDate,
          totalPrice: bookingAmount,
          paymentIntentId
        },
        config
      );

      console.log('Booking created successfully', data);
      toast.success('Successfully booked & paid!');
      setShowPayment(false);
      const confirmationPayload = {
        bookingId: data._id || null,
        listingTitle: listing.title,
        listingLocation: listing.location,
        guestName,
        guestPhone,
        checkIn: dateRange[0].startDate,
        checkOut: dateRange[0].endDate,
        totalPrice: bookingAmount,
        paymentMethod,
        paymentIntentId,
        hostPhone: data.listing?.host?.contactPhone || 'N/A',
        hostEmail: data.listing?.host?.email || 'N/A'
      };
      confirmationPayload.paymentMethod = paymentMethod;
      confirmationPayload.chargeAmount = chargeAmount;
      sessionStorage.setItem('bookingConfirmationData', JSON.stringify(confirmationPayload));
      setBookingConfirmation(confirmationPayload);
      navigate('/booking-confirmation', { state: { confirmation: confirmationPayload } });
    } catch (err) {
      console.error('Booking failed', err);
      const errorMessage = err.response?.data?.error || err.message || 'Booking failed. Please try again.';
      setBookingError(errorMessage);
      toast.error(errorMessage);
      setShowPayment(false);
    } finally {
      setProcessing(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Login to review');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('http://localhost:5000/api/reviews', {
        listingId: listing._id,
        rating: reviewRating,
        comment: reviewText
      }, config);
      toast.success('Review submitted');
      setReviews([...reviews, data.review]);
      setReviewText('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to save to wishlist');
      return navigate('/login');
    }
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`http://localhost:5000/api/users/wishlist/${listing._id}`, {}, config);
      const added = !isWishlisted;
      setIsWishlisted(added);
      if (added) {
        toast.success('Saved to wishlist! View it in your dashboard.');
        setTimeout(() => navigate('/user-dashboard', { state: { activeTab: 'wishlist' } }), 1200);
      } else {
        toast.info('Removed from wishlist');
      }
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">{listing.title}</h1>
          <p className="text-gray-600 mt-2 underline font-medium">{listing.location}</p>
        </div>
        <button
          onClick={toggleWishlist}
          className={`flex gap-2 items-center underline hover:bg-gray-100 p-2 rounded-lg transition ${isWishlisted ? 'text-brand' : 'text-slate-700'}`}
        >
          <Heart size={20} className={isWishlisted ? 'fill-brand text-brand' : ''} />
          {isWishlisted ? 'Saved' : 'Save'}
        </button>
      </div>

      {bookingConfirmation && (
        <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-700 font-semibold">Booking confirmed</p>
          <h2 className="mt-4 text-2xl font-semibold text-slate-900">Your reservation is complete</h2>
          <p className="mt-2 text-sm text-slate-600">Your payment has been processed and your booking is confirmed. Save this confirmation for your trip.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Booking ID</p>
              <p className="mt-2 font-semibold text-slate-900">{bookingConfirmation.bookingId || 'N/A'}</p>
            </div>
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Amount paid</p>
              <p className="mt-2 font-semibold text-slate-900">₹{bookingConfirmation.totalPrice}</p>
            </div>
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Check-in</p>
              <p className="mt-2 font-semibold text-slate-900">{new Date(bookingConfirmation.checkIn).toLocaleDateString()}</p>
            </div>
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Check-out</p>
              <p className="mt-2 font-semibold text-slate-900">{new Date(bookingConfirmation.checkOut).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => navigate('/user-dashboard')} className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-rose-600 transition">View dashboard</button>
            <button onClick={() => setBookingConfirmation(null)} className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">Hide confirmation</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="rounded-2xl overflow-hidden aspect-video md:col-span-2 shadow">
          <img src={listing.images[0]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'} alt="thumbnail" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12 pb-12 border-b">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Hosted by {listing.host?.name || 'Unknown'}</h2>
          <div className="flex flex-wrap items-center gap-3 text-slate-700 mb-6 font-medium">
             <span className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-full text-xs text-slate-500 italic">📞 Contact hidden until booked</span>
             <span className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-full text-xs text-slate-500 italic">✉️ Email hidden until booked</span>
          </div>
          <hr className="my-6"/>
          <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
          <hr className="my-6"/>
          <h3 className="text-xl font-semibold mb-4">What this place offers</h3>
          <ul className="grid grid-cols-2 gap-4">
            {listing.amenities?.map((amenity, i) => (
              <li key={i} className="flex gap-2 items-center text-gray-700">✔️ {amenity}</li>
            ))}
          </ul>
          <hr className="my-6"/>
          <h3 className="text-xl font-semibold mb-4">Property details</h3>
          <div className="grid grid-cols-2 gap-4 text-gray-700">
            <div className="flex gap-2 items-center">
              <span className="font-semibold">Max Guests:</span> {listing.maxGuests || 2}
            </div>
            <div className="flex gap-2 items-center">
              <span className="font-semibold">Check-in:</span> {listing.checkInTime || '14:00'}
            </div>
            <div className="flex gap-2 items-center">
              <span className="font-semibold">Check-out:</span> {listing.checkOutTime || '11:00'}
            </div>
          </div>
        </div>
        
        {/* Booking Widget */}
        <div className="border rounded-xl p-6 shadow-xl sticky top-24 self-start bg-white">
          <div className="flex flex-col gap-4 mb-6">
            <div>
              <p className="text-sm text-slate-500">Price per night</p>
              <h2 className="text-3xl font-bold text-slate-900">₹{displayPrice}</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
              <Star size={16} className="text-amber-500" />
              {listing.ratings > 0 ? listing.ratings.toFixed(1) : 'New'}
            </div>
          </div>
          
          <div className="border rounded-xl overflow-hidden mb-4 p-2 custom-date-range">
             <DateRange
              ranges={dateRange}
              onChange={item => {
                setDateRange([item.selection]);
                if (item.selection.startDate) setShownDate(item.selection.startDate);
              }}
              shownDate={shownDate}
              onShownDateChange={setShownDate}
              minDate={new Date()}
              maxDate={listing.availableTo ? new Date(listing.availableTo) : new Date(new Date().setFullYear(new Date().getFullYear() + 5))}
              disabledDates={bookedDates}
              rangeColors={['#FF385C']}
              className="w-full mx-auto flex justify-center !text-sm"
            />
          </div>
          <div className="grid gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Full name</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Your full name"
                className="mt-2 w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Phone number</label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="Mobile number"
                className="mt-2 w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Number of guests</label>
              <select
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(Number(e.target.value))}
                className="mt-2 w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                {[...Array(listing.maxGuests || 2)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1} Guest{i > 0 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 mb-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Expected Check-in</label>
              <input
                type="time"
                value={expectedCheckInTime}
                onChange={(e) => setExpectedCheckInTime(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Expected Check-out</label>
              <input
                type="time"
                value={expectedCheckOutTime}
                onChange={(e) => setExpectedCheckOutTime(e.target.value)}
                className="mt-2 w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
          </div>

          {!showPayment ? (
            <>
              <button
                onClick={beginCheckout}
                disabled={reserveLoading}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg active:scale-95 ${reserveLoading ? 'bg-slate-300 text-slate-600 cursor-not-allowed' : 'bg-brand text-white hover:bg-rose-600 hover:shadow-brand/20'}`}
              >
                {reserveLoading ? 'Preparing checkout...' : 'Reserve'}
              </button>
              {reserveError && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  ⚠️ {reserveError}
                </div>
              )}
            </>
          ) : (
            <>
              {bookingError && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-bold animate-shake">
                  ❌ Booking Error: {bookingError}
                </div>
              )}
              {paymentError && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-bold">
                  ❌ Payment Error: {paymentError}
                </div>
              )}
              <div className="mb-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">Total payment amount</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">₹{chargeAmount}</p>
              </div>
              <div className="mb-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700 mb-4">Choose your payment method</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.key}
                      type="button"
                      onClick={() => setPaymentMethod(method.key)}
                      className={`rounded-3xl border p-4 text-left transition ${paymentMethod === method.key ? 'border-brand bg-brand/10' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <p className="font-semibold text-slate-900">{method.title}</p>
                          <p className="text-sm text-slate-500">{method.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4 rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">Selected method</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{methodLabel}</p>
              </div>
              {isStripeEnabled && stripePromise ? (
                <Elements stripe={stripePromise}>
                  <CheckoutForm
                    totalPrice={totalPrice}
                    paymentMethod={paymentMethod}
                    chargeAmount={chargeAmount}
                    handlePaymentSuccess={handleBookingSuccess}
                    setProcessing={setProcessing}
                    setPaymentError={setPaymentError}
                  />
                </Elements>
              ) : (
                <MockPaymentForm
                  totalPrice={totalPrice}
                  paymentMethod={paymentMethod}
                  chargeAmount={chargeAmount}
                  handlePaymentSuccess={handleBookingSuccess}
                  processing={processing}
                  setProcessing={setProcessing}
                  setPaymentError={setPaymentError}
                />
              )}
            </>
          )}
          
          <p className="text-center text-sm text-gray-500 mt-4">You won't be charged yet</p>
          
          <div className="mt-6 flex justify-between font-semibold border-t pt-4">
            <span>Total before taxes</span>
            <span>₹{totalPrice}</span>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="py-12 w-full">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2"><Star className="fill-current"/> {listing.ratings > 0 ? listing.ratings.toFixed(1) : 'No reviews'} ({reviews.length} reviews)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {reviews.map(r => (
            <div key={r._id} className="mb-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 uppercase">{r.user?.name?.charAt(0) || 'A'}</div>
                <div>
                  <h4 className="font-semibold">{r.user?.name || 'Anonymous'}</h4>
                  <p className="text-sm text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-gray-700">{r.comment}</p>
            </div>
          ))}
        </div>

        {user && (
          <form className="max-w-xl border p-4 rounded-xl shadow-sm" onSubmit={submitReview}>
            <h3 className="font-semibold mb-2">Leave a review</h3>
            <select value={reviewRating} onChange={e => setReviewRating(e.target.value)} className="border p-2 rounded mb-2 w-full outline-none">
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Good</option>
              <option value="3">3 - Average</option>
              <option value="2">2 - Poor</option>
              <option value="1">1 - Terrible</option>
            </select>
            <textarea required value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your experience..." className="w-full border rounded p-2 outline-none mb-2 min-h-24"></textarea>
            <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium">Submit</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ListingDetail;
