import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Mail, Lock, User, Shield, Briefcase, ArrowRight, Copy, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const copyCredentials = async (emailValue, passwordValue) => {
    try {
      await navigator.clipboard.writeText(`Email: ${emailValue}\nPassword: ${passwordValue}`);
      toast.success('Credentials copied to clipboard');
    } catch (err) {
      toast.error('Unable to copy credentials');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      toast.success('Logged in successfully');
      if (user.role === 'admin') navigate('/admin-dashboard');
      else if (user.role === 'host') navigate('/host-dashboard');
      else navigate('/user-dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px]">
      <div className="max-w-6xl w-full grid gap-0 lg:grid-cols-[1.2fr_1fr] items-stretch shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-[48px] overflow-hidden bg-white">
        {/* Left Side: Brand & Value Prop */}
        <div className="relative hidden lg:flex flex-col justify-between p-12 text-white bg-slate-950 overflow-hidden">
          {/* Animated Background Gradients */}
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-brand/20 blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 blur-[120px]"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-slate-100 font-bold border border-white/10">
              <Shield size={14} className="text-brand" />
              Vacation Booking System
            </div>
            <h1 className="mt-12 text-6xl font-black leading-[1.1] tracking-tight">
              Unlock your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-rose-400 to-amber-400">travel hub</span>
            </h1>
            <p className="mt-8 text-lg leading-relaxed text-slate-400 max-w-md font-medium">
              Experience the future of property management and guest stays in one seamless ecosystem.
            </p>
          </div>

          <div className="relative z-10 grid gap-6">
            <div className="flex items-center gap-5 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:bg-brand/20 transition-colors">
                <User size={22} className="text-brand" />
              </div>
              <div>
                <p className="text-sm font-bold text-white uppercase tracking-wider">Guest Portal</p>
                <p className="text-xs text-slate-400 mt-1">Book stays and manage your upcoming trips.</p>
              </div>
            </div>
            <div className="flex items-center gap-5 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:bg-blue-500/20 transition-colors">
                <Briefcase size={22} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white uppercase tracking-wider">Host Dashboard</p>
                <p className="text-xs text-slate-400 mt-1">Manage your properties and track earnings.</p>
              </div>
            </div>
            <div className="flex items-center gap-5 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:bg-emerald-500/20 transition-colors">
                <Shield size={22} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white uppercase tracking-wider">System Control</p>
                <p className="text-xs text-slate-400 mt-1">Full oversight of the entire platform.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-10 lg:p-16 flex flex-col justify-center">
          <div className="mb-10 text-center lg:text-left">
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand bg-brand/5 px-3 py-1 rounded-full">Secure Sign In</span>
            <h2 className="mt-6 text-4xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="mt-3 text-slate-500 font-medium">Please enter your details to access your portal.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-12 py-4 text-sm text-slate-900 outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/5"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-12 py-4 text-sm text-slate-900 outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/5"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-end pr-1">
                <Link to="/forgot-password" size={20} className="text-xs font-bold text-brand hover:text-rose-600 transition tracking-wide">
                  Recovery Password?
                </Link>
              </div>
            </div>
            <button type="submit" className="group w-full rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-slate-950/20 transition-all hover:bg-slate-900 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
              Sign In to Dashboard
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-12">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold"><span className="bg-white px-4 text-slate-400">Demo Access</span></div>
            </div>
            
            <div className="grid gap-3">
              {[
                { role: 'Customer', email: 'john@test.com', pass: 'password123', color: 'text-brand' },
                { role: 'Host', email: 'host@test.com', pass: 'password123', color: 'text-blue-500' },
                { role: 'Admin', email: 'admin@test.com', pass: 'password123', color: 'text-emerald-500' }
              ].map((acc) => (
                <div key={acc.role} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${acc.color.replace('text', 'bg')}`}></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{acc.role}</p>
                      <p className="text-xs font-bold text-slate-700">{acc.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => copyCredentials(acc.email, acc.pass)}
                    className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
                    title="Copy Credentials"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm font-medium text-slate-500">
              New here? <Link to="/register" className="text-brand font-bold hover:underline underline-offset-4">Create your account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
