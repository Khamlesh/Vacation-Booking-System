import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Plane, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between h-24">
          <Link to="/" className="flex items-center gap-3 text-slate-900 font-semibold text-xl">
            <div className="flex items-center justify-center w-12 h-12 rounded-3xl bg-brand/10 text-brand shadow-sm">
              <Plane size={20} />
            </div>
            <div>
              <div>Vacation Booking</div>
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Premium stays</div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700">
            <Link to="/" className="hover:text-brand transition">Home</Link>
            <Link to="/search" className="hover:text-brand transition">Search</Link>
            <Link to="/user-dashboard" className="hover:text-brand transition">My Trips</Link>
            {(user?.role === 'host' || user?.role === 'admin') && (
              <Link to="/host-dashboard" className="hover:text-brand transition">Host</Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin-dashboard" className="hover:text-brand transition">Admin</Link>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {user ? (
              <>
                <Link to="/host-dashboard" className="hidden sm:inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition">
                  Become a host
                </Link>
                <div className="rounded-full bg-slate-100 px-4 py-2 flex items-center gap-2 text-slate-800 font-semibold shadow-sm">
                  <User size={16} />
                  <span>{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-700 hover:text-brand font-medium">Login</Link>
                <Link to="/register" className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 transition shadow-sm">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
