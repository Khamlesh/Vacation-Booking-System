import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); 
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await register(name, email, password, role, contactPhone);
            console.log('Registration Response:', user);
            
            if (role === 'host' || user.status === 'pending') {
                toast.success(
                    <div>
                        <p className="font-bold">Application Received!</p>
                        <p className="text-xs mt-1">Your host account is currently <strong>on hold</strong>. Our administrators will review your business details and contact you shortly.</p>
                    </div>, 
                    { autoClose: 8000 }
                );
                navigate('/login');
            } else {
                toast.success('Welcome to the family! Your account has been created successfully.');
                if (user.role === 'admin') navigate('/admin-dashboard');
                else if (user.role === 'host') navigate('/host-dashboard');
                else navigate('/user-dashboard');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="min-h-[calc(100vh-160px)] flex items-center justify-center bg-slate-100 px-4 py-10 sm:px-6 lg:px-8">
            <div className="max-w-6xl w-full grid gap-8 lg:grid-cols-[1.2fr_1fr] items-center">
                <div className="rounded-[32px] bg-white p-10 shadow-2xl ring-1 ring-slate-200/80 overflow-hidden">
                    <div className="flex items-center justify-between gap-4 rounded-3xl bg-brand/5 p-6">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-brand font-semibold">Join the family</p>
                            <h2 className="mt-4 text-4xl font-black text-slate-900">Create an account</h2>
                        </div>
                        <div className="rounded-3xl bg-brand px-4 py-3 text-sm font-semibold text-white">3 roles</div>
                    </div>

                    <div className="mt-10 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">User</p>
                            <p className="mt-3 font-semibold text-slate-900">Book stays</p>
                            <p className="mt-2 text-sm text-slate-600">Search, reserve and manage trips effortlessly.</p>
                        </div>
                        <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Host</p>
                            <p className="mt-3 font-semibold text-slate-900">List properties</p>
                            <p className="mt-2 text-sm text-slate-600">Control availability and grow your rental income.</p>
                        </div>
                        <div className="rounded-3xl border border-slate-200 p-5 bg-slate-50">
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Admin</p>
                            <p className="mt-3 font-semibold text-slate-900">Manage system</p>
                            <p className="mt-2 text-sm text-slate-600">View reports, approve hosts, and monitor bookings.</p>
                        </div>
                    </div>

                    <div className="mt-10 grid gap-4 rounded-[32px] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                        <div className="flex items-start gap-4">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/20 text-brand font-semibold">✓</span>
                            <p className="leading-6">Fast onboarding as a basic user. Host accounts require administrative verification.</p>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/20 text-brand font-semibold">✓</span>
                            <p className="leading-6">Secure JWT authentication and session persistence.</p>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/20 text-brand font-semibold">✓</span>
                            <p className="leading-6">Professional platform for property management and guest relations.</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-[32px] bg-white p-8 shadow-2xl ring-1 ring-slate-200/80">
                    <div className="mb-8">
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand">Create account</p>
                        <h2 className="mt-4 text-3xl font-bold text-slate-900">Register your profile</h2>
                        <p className="mt-3 text-sm text-slate-500">Create an account to start booking amazing trips. Host access must be granted by an Admin.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                                placeholder="Jane Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
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
                            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                                placeholder="Create a secure password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Select Your Role</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 appearance-none bg-white"
                            >
                                <option value="user">Traveler (User)</option>
                                <option value="host">Property Owner (Host)</option>
                            </select>
                        </div>
                        {role === 'host' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Business Contact Phone</label>
                                <input
                                    type="tel"
                                    value={contactPhone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                    required
                                    className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                                    placeholder="+91 98765 43210"
                                />
                                <p className="mt-2 text-xs text-slate-500 italic text-center">Admin will verify this information before granting access.</p>
                            </div>
                        )}
                        <button type="submit" className="w-full rounded-3xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-rose-600">
                            {role === 'host' ? 'Request Host Access' : 'Create Account'}
                        </button>
                    </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="font-semibold text-brand hover:text-rose-600">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
