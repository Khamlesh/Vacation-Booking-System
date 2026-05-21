import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !newPassword) return toast.error('Please fill in all fields');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    
    setLoading(true);
    try {
      // Direct reset API call
      await axios.post('http://localhost:5000/api/users/reset-password', { email, newPassword });
      toast.success('Password successfully reset! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center bg-slate-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-md w-full rounded-[32px] bg-white p-8 shadow-2xl ring-1 ring-slate-200/80">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand">Account Recovery</p>
          <h2 className="mt-4 text-3xl font-bold text-slate-900">Forgot Password</h2>
          <p className="mt-3 text-sm text-slate-500">Enter your registered email address and we'll send you a link to reset your password.</p>
        </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength="6"
                className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                placeholder="Enter new password"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full rounded-3xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand hover:bg-rose-600'}`}
            >
              {loading ? 'Processing...' : 'Confirm Reset'}
            </button>
            <div className="text-center mt-4">
              <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-brand transition">
                Back to Login
              </Link>
            </div>
          </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
