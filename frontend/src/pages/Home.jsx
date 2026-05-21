import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, Star } from 'lucide-react';

const formatPrice = (value) => {
  const price = typeof value === 'number' ? value : Number(value);
  const normalizedPrice = Number.isFinite(price) ? Math.max(2000, price) : 0;
  return normalizedPrice.toLocaleString('en-IN');
};

const Home = () => {
  const [listings, setListings] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [propertyType, setPropertyType] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [minRating, setMinRating] = useState('All');
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchListings = async () => {
    try {
      let url = `http://localhost:5000/api/listings?`;
      if (keyword) url += `keyword=${keyword}&`;
      if (propertyType !== 'All') url += `propertyType=${propertyType}&`;
      if (minRating !== 'All') url += `minRating=${minRating}&`;
      
      if (priceRange === 'Under ₹5000') url += `maxPrice=5000&`;
      if (priceRange === '₹5000-₹10000') url += `minPrice=5000&maxPrice=10000&`;
      if (priceRange === 'Over ₹10000') url += `minPrice=10000&`;

      const { data } = await axios.get(url);
      setListings(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = () => {
    setSearched(true);
    fetchListings();
  };

  useEffect(() => {
    if (searched) {
      fetchListings();
    }
  }, [propertyType, priceRange, minRating]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pb-16">
      <div className="mb-8 p-4 sm:p-6 bg-white rounded-3xl shadow-lg border border-slate-200 relative z-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3">
            <Search size={18} className="text-brand" />
            <input
              type="text"
              placeholder="Search by city or location..."
              className="w-full bg-transparent text-sm text-slate-800 outline-none"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              className={`flex-1 md:flex-none rounded-full border ${showFilters ? 'border-brand text-brand bg-rose-50' : 'border-slate-200 text-slate-700 bg-slate-50'} px-6 py-3 text-sm font-semibold transition`}
            >
              Filters
            </button>
            <button onClick={handleSearch} className="flex-1 md:flex-none rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white shadow hover:bg-rose-600 transition">
              Search
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-6 pt-6 border-t border-slate-100 grid gap-4 sm:grid-cols-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Property Type</label>
              <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand transition">
                <option value="All">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="cabin">Cabin</option>
                <option value="villa">Villa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Price Range</label>
              <select value={priceRange} onChange={e => setPriceRange(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand transition">
                <option value="All">Any Price</option>
                <option value="Under ₹5000">Under ₹5,000</option>
                <option value="₹5000-₹10000">₹5,000 - ₹10,000</option>
                <option value="Over ₹10000">Over ₹10,000</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Minimum Rating</label>
              <select value={minRating} onChange={e => setMinRating(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand transition">
                <option value="All">Any Rating</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <section className="rounded-[40px] bg-white p-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)] overflow-hidden mb-12 hero-gradient">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div>
            <p className="text-brand font-semibold uppercase tracking-[0.35em] mb-4">Vacation Booking</p>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-tight mb-6">Find extraordinary stays, anywhere in India.</h1>
            <p className="max-w-2xl text-lg text-slate-600 mb-8">Discover homes, cabins and boutique stays handpicked for comfort, design and unforgettable trips.</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Places</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">3,500+</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Hosts</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">Active</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Cities</p>
                <p className="mt-3 text-xl font-semibold text-slate-900">50+</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[32px] overflow-hidden bg-slate-900 shadow-2xl">
              <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=900" alt="Stay hero" className="h-full w-full object-cover" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] overflow-hidden bg-slate-800">
                <img src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=600" alt="Stay detail" className="h-full w-full object-cover" />
              </div>
              <div className="rounded-[28px] overflow-hidden bg-slate-800">
                <img src="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&q=80&w=600" alt="Stay detail" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand font-semibold">Explore stays</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Homes for every type of trip</h2>
          </div>
          <button className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 transition">
            View all homes
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {['Entire homes', 'Private rooms', 'Beach stays'].map((tag) => (
            <div key={tag} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg transition">
              <p className="text-sm text-slate-500">{tag}</p>
              <p className="mt-4 text-xl font-semibold text-slate-900">Stay in comfort</p>
              <p className="mt-3 text-sm text-slate-500">Handpicked spaces for your trip.</p>
            </div>
          ))}
        </div>
      </section>

      {searched ? (
        <section>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Search Results</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">Available Properties</h2>
            </div>
            <p className="text-sm text-slate-500">{listings.length} homes found.</p>
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">No properties found</h3>
              <p className="mt-2 text-slate-600">Try adjusting your filters or searching for a different city.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map(listing => (
                <Link key={listing._id} to={`/listings/${listing._id}`} className="group block rounded-[32px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl overflow-hidden">
                  <div className="relative overflow-hidden h-72">
                    <img
                      src={listing.images[0]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800'}
                      alt={listing.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-4 top-4 flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm">
                        <Star size={14} className="text-amber-500" />
                        {listing.ratings ? listing.ratings.toFixed(1) : 'New'}
                      </span>
                      <span className="rounded-full bg-slate-800/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">{listing.propertyType || 'Entire Place'}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                      <MapPin size={16} />
                      <span>{listing.location || 'Unknown location'}</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900 mb-3 line-clamp-2">{listing.title}</h3>
                    <p className="text-sm text-slate-500 mb-6">{listing.description ? `${listing.description.slice(0, 120)}...` : 'Enjoy a stylish retreat with modern amenities.'}</p>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-lg font-semibold text-slate-900">₹{formatPrice(listing.price)}<span className="text-sm text-slate-500">/night</span></span>
                      <button className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 transition shadow-sm">
                        Book
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-200 shadow-inner">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready for your next getaway?</h2>
          <p className="text-lg text-slate-600">Enter a location in the search bar above to discover amazing properties across India.</p>
        </div>
      )}
    </div>
  );
};

export default Home;
