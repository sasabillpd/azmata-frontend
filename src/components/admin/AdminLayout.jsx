import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, ShoppingBag, CreditCard,
  Package, BarChart2, Users, LogOut, ChevronRight,   Ticket,
} from 'lucide-react';

const menus = [
  { label: 'Dasbor',           icon: LayoutDashboard, path: '/admin' },
  { label: 'Pesanan',          icon: ShoppingBag,     path: '/admin/pesanan' },
  { label: 'Konfirmasi Bayar', icon: CreditCard,      path: '/admin/bayar' },
  { label: 'Produk',           icon: Package,         path: '/admin/produk' },
  { label: 'Laporan',          icon: BarChart2,       path: '/admin/laporan' },
  { label: 'Pengguna',         icon: Users,           path: '/admin/pengguna' },
];

const AdminLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* ── SIDEBAR ── */}
      <aside className="w-52 flex-shrink-0 bg-emerald-900 flex flex-col fixed top-0 left-0 h-full z-40">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-emerald-800">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-white" />
            </div>
            <span className="text-sm font-semibold text-white">Azmata</span>
          </div>
          <div className="text-xs text-emerald-400 pl-9">Panel admin</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3">
          {menus.map(({ label, icon: Icon, path }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-colors text-sm
                  ${active
                    ? 'bg-white/10 text-white font-medium border-l-2 border-emerald-400'
                    : 'text-emerald-300 hover:bg-white/5 hover:text-white'}`}>
                <Icon size={16} className="flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-emerald-800">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">{user?.name}</div>
              <div className="text-xs text-emerald-400">Admin</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-emerald-400 hover:bg-white/5 hover:text-red-400 transition-colors text-xs">
            <LogOut size={14} />
            Keluar
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 ml-52">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 h-14 flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Admin</span>
            <ChevronRight size={14} />
            <span className="text-gray-700 font-medium">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-semibold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-700">{user?.name?.split(' ')[0]}</span>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;