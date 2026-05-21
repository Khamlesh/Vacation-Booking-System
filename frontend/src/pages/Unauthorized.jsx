import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-10 shadow-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-600">Access denied</p>
        <h1 className="mt-6 text-4xl font-bold text-slate-900">You do not have permission</h1>
        <p className="mt-4 text-sm text-slate-600">This page is restricted to users with the right role. Please return home or contact an administrator if you think this is a mistake.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/" className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-rose-600 transition">
            Return to Home
          </Link>
          <Link to="/login" className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
            Sign in with another account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
