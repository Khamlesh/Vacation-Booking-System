import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Heart, 
  User,
  LogOut,
  ChevronRight,
  CreditCard
} from 'lucide-react';

const DashboardSidebar = ({ activeTab, setActiveTab, user, onLogout }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'My Bookings', icon: Briefcase },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'finance', label: 'Refunds & Payments', icon: CreditCard },
    { id: 'settings', label: 'Profile', icon: User },
  ];

  return (
    <aside className="w-full lg:w-64 flex flex-col gap-2">
      <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-md p-4 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-2 mb-8 mt-2">
          <div className="h-10 w-10 rounded-full bg-brand flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand/20">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-slate-900 truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand text-white shadow-md shadow-brand/20' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={isActive ? 'text-white' : 'text-slate-500'} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={16} />}
              </button>
            );
          })}
        </nav>

        <div className="mt-8 pt-4 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>
      
      {/* Help Card */}
      <div className="rounded-3xl bg-brand p-6 text-white shadow-lg shadow-brand/20 hidden lg:block">
        <p className="font-semibold mb-2">Need help?</p>
        <p className="text-xs text-white/80 leading-relaxed mb-4">
          Our support team is available 24/7 to assist you.
        </p>
        <div className="space-y-2 mb-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">Admin Support</p>
          <p className="text-xs font-medium">support@vacation.com</p>
          <p className="text-xs font-medium">+91 98765 43210</p>
        </div>
        <button className="w-full bg-white text-brand py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors">
          Open Support Ticket
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
