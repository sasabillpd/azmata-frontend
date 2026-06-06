import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag, Clock, TrendingUp, Users,
  ArrowRight, AlertTriangle, LayoutDashboard,
  Package, ClipboardList, BarChart2, LogOut,
  X, CreditCard, Users2,  Ticket, 
} from 'lucide-react';

const formatRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

const STATUS_STYLE = {
  'Menunggu Pembayaran': 'bg-gray-100 text-gray-500',
  'Menunggu Konfirmasi': 'bg-amber-100 text-amber-700',
  'Diproses':           'bg-blue-100 text-blue-700',
  'Dikirim':            'bg-purple-100 text-purple-700',
  'Selesai':            'bg-emerald-100 text-emerald-700',
  'Dibatalkan':         'bg-red-100 text-red-500',
};

const getNav = (role) => [
  { label: 'Dasbor',           icon: LayoutDashboard, to: '/admin' },
  { label: 'Pesanan',          icon: ClipboardList,   to: '/admin/pesanan' },
  { label: 'Konfirmasi Bayar', icon: CreditCard,      to: '/admin/bayar' },
  { label: 'Produk',           icon: Package,         to: '/admin/produk' },
  { label: 'Voucher',          icon: Ticket,          to: '/admin/voucher' },
  ...(role === 'super_admin' ? [{ label: 'Laporan',   icon: BarChart2, to: '/admin/laporan' }] : []),
  ...(role === 'super_admin' ? [{ label: 'Pengguna',  icon: Users2,    to: '/admin/pengguna' }] : []),
];

/* ══ LOGOUT MODAL ══ */
const LogoutModal = ({ onConfirm, onCancel }) => (
  <>
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(30,26,20,0.45)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.18s ease',
      }}
    />
    <div style={{
      position: 'fixed', top: '50%', left: '50%', zIndex: 51,
      transform: 'translate(-50%,-50%)',
      background: '#fff', borderRadius: 20,
      padding: '36px 32px 28px', width: 360,
      boxShadow: '0 24px 60px rgba(30,26,20,0.18)',
      animation: 'slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <button onClick={onCancel} style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: '#f5f1eb', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a7f6f' }}>
        <X size={14} />
      </button>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#fff3e8,#ffe0c8)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <LogOut size={24} color="#d97706" />
      </div>
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1e1a14', margin: '0 0 8px' }}>Keluar dari akun?</p>
      <p style={{ fontSize: 14, color: '#8a7f6f', margin: '0 0 28px', lineHeight: 1.6 }}>
        Kamu akan keluar dari sesi admin. Pastikan semua perubahan sudah tersimpan sebelum lanjut.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: '1.5px solid #ede9e0', background: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: '#5a5346', cursor: 'pointer', transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#faf9f6'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
        >Batal</button>
        <button onClick={onConfirm} style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#c0392b,#e74c3c)', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', transition: 'opacity 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >Ya, Keluar</button>
      </div>
    </div>
    <style>{`
      @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
      @keyframes slideUp { from { opacity:0; transform:translate(-50%,-44%) } to { opacity:1; transform:translate(-50%,-50%) } }
    `}</style>
  </>
);

/* ══ SIDEBAR ══ */
const Sidebar = ({ onLogoutClick, userRole }) => {
  const location = useLocation();
  const NAV = getNav(userRole);
  return (
    <aside style={{ width: 240, flexShrink: 0, height: '100vh', position: 'sticky', top: 0, background: '#1a3d2b', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ padding: '28px 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#2d5a3d,#4a9e6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🍪</div>
        <div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>Azmata</p>
          <p style={{ fontSize: 12, color: '#4a9e6b', margin: 0, fontWeight: 500 }}>
            {userRole === 'super_admin' ? 'Super Admin' : 'Panel admin'}
          </p>
        </div>
      </div>
      <nav style={{ flex: 1, padding: '20px 12px' }}>
        {NAV.map(({ label, icon: Icon, to }) => {
          const active = location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to));
          return (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 12, marginBottom: 4, background: active ? 'rgba(74,158,107,0.18)' : 'transparent', color: active ? '#fff' : 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: active ? 600 : 400, transition: 'all 0.16s', cursor: 'pointer', borderLeft: active ? '3px solid #4a9e6b' : '3px solid transparent' }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; } }}
              ><Icon size={17} />{label}</div>
            </Link>
          );
        })}
      </nav>
      <div style={{ padding: '0 12px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
        <button onClick={onLogoutClick} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '11px 14px', borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,120,100,0.8)', transition: 'all 0.16s', textAlign: 'left' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,80,60,0.12)'; e.currentTarget.style.color = '#ff8070'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,120,100,0.8)'; }}
        ><LogOut size={17} />Keluar</button>
      </div>
    </aside>
  );
};

/* ══ ADMIN DASHBOARD ══ */
const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    api.get('/reports/dashboard')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout?.(); navigate('/login'); };

  const { stats, recentOrders, lowStock, salesChart } = data || {};

  const statCards = [
    { label: 'Pesanan hari ini',       value: stats?.todayOrders || 0,        icon: ShoppingBag, accent: '#2d5a3d', bg: '#edf5f0', change: '+3 dari kemarin',  up: true },
    { label: 'Menunggu konfirmasi',    value: stats?.pending || 0,            icon: Clock,       accent: '#d97706', bg: '#fff8ee', change: 'Perlu tindakan',    up: false },
    { label: 'Pendapatan bulan ini',   value: formatRp(stats?.monthRevenue),  icon: TrendingUp,  accent: '#2d5a3d', bg: '#edf5f0', change: '+18% bulan lalu',  up: true },
    { label: 'Total pelanggan',        value: stats?.customers || 0,          icon: Users,       accent: '#3b6cb7', bg: '#eef2fb', change: '+4 bulan ini',      up: true },
  ];

  const maxBar = Math.max(...(salesChart?.map(d => d.pendapatan) || [1]));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .dash-table tr { transition: background 0.14s; }
        .dash-table tbody tr:hover { background: #faf9f6; }
        .stat-card { transition: transform 0.2s, box-shadow 0.2s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(45,90,61,0.1); }
        .bar-col { transition: height 0.4s cubic-bezier(0.4,0,0.2,1); }
        .low-stock-item { transition: background 0.14s; }
        .low-stock-item:hover { background: #f0f7f3 !important; }
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translate(-50%,-44%) } to { opacity:1; transform:translate(-50%,-50%) } }
        @keyframes spin    { to { transform:rotate(360deg) } }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#faf9f6', fontFamily: "'DM Sans', sans-serif" }}>

        <Sidebar onLogoutClick={() => setShowLogout(true)} userRole={user?.role} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <header style={{
              padding: '20px 32px', borderBottom: '1px solid #ede9e0', background: '#fff', display: 'flex', alignItems: 'center', 
              justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10,}}>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1e1a14', margin: 0 }}>Dasbor</h1>
              <p style={{ fontSize: 12, color: '#b5a99a', margin: '2px 0 0' }}>Selamat datang kembali 👋</p>
            </div>
            <div style={{ fontSize: 12, color: '#8a7f6f', background: '#f5f1eb', padding: '6px 14px', borderRadius: 20 }}>
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </header>

          <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid #2d5a3d', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
              </div>
            ) : (
              <>
                {/* STAT CARDS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
                  {statCards.map(({ label, value, icon: Icon, accent, bg, change, up }) => (
                    <div key={label} className="stat-card" style={{ background: '#fff', borderRadius: 18, padding: '22px 20px', border: '1px solid #ede9e0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={17} color={accent} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: up ? '#edf5f0' : '#fff8ee', color: up ? '#2d5a3d' : '#d97706' }}>{change}</span>
                      </div>
                      <p style={{ fontSize: 11, color: '#b5a99a', margin: '0 0 4px' }}>{label}</p>
                      <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#1e1a14', margin: 0 }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* CHART + LOW STOCK */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, marginBottom: 20 }}>
                  <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #ede9e0', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f5f1eb' }}>
                      <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 600, color: '#1e1a14' }}>Tren penjualan — 7 hari terakhir</span>
                      <Link to="/admin/laporan" style={{ fontSize: 12, color: '#2d5a3d', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>Lihat laporan <ArrowRight size={12} /></Link>
                    </div>
                    <div style={{ padding: '20px 22px' }}>
                      {salesChart?.length > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
                          {salesChart.map((d, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 10, color: '#b5a99a' }}>{(d.pendapatan / 1000).toFixed(0)}k</span>
                              <div className="bar-col" style={{ width: '100%', borderRadius: '6px 6px 0 0', background: 'linear-gradient(to top,#2d5a3d,#4a9e6b)', height: Math.max((d.pendapatan / maxBar) * 80, 8) }} />
                              <span style={{ fontSize: 10, color: '#b5a99a' }}>{d.hari}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5bfb4', fontSize: 13 }}>Belum ada data penjualan</div>
                      )}
                    </div>
                  </div>

                  <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #ede9e0', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #f5f1eb' }}>
                      <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 600, color: '#1e1a14' }}>Stok menipis</span>
                      <Link to="/admin/produk" style={{ fontSize: 12, color: '#2d5a3d', textDecoration: 'none', fontWeight: 500 }}>Kelola →</Link>
                    </div>
                    <div style={{ padding: '8px 10px' }}>
                      {lowStock?.length > 0 ? lowStock.map(p => (
                        <Link key={p.id} to={`/admin/produk?highlight=${p.id}`} style={{ textDecoration: 'none' }}>
                          <div className="low-stock-item" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, cursor: 'pointer' }}>
                            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f5f1eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>🍪</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 12, fontWeight: 500, color: '#1e1a14', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                              <p style={{ fontSize: 11, color: p.stock === 0 ? '#e74c3c' : '#d97706', margin: 0 }}>{p.stock === 0 ? 'Stok habis' : `Sisa ${p.stock} toples`}</p>
                            </div>
                            {p.stock === 0 ? <AlertTriangle size={14} color="#e74c3c" style={{ flexShrink: 0 }} /> : <span style={{ fontSize: 11, color: '#4a9e6b', fontWeight: 500, flexShrink: 0 }}>Edit →</span>}
                          </div>
                        </Link>
                      )) : (
                        <div style={{ padding: '28px 0', textAlign: 'center', fontSize: 13, color: '#b5a99a' }}>Semua stok aman ✅</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RECENT ORDERS */}
                <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #ede9e0', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f5f1eb' }}>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 600, color: '#1e1a14' }}>Pesanan terbaru</span>
                    <Link to="/admin/pesanan" style={{ fontSize: 12, color: '#2d5a3d', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>Lihat semua <ArrowRight size={12} /></Link>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="dash-table" style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans',sans-serif" }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #f5f1eb' }}>
                          {['No. Pesanan', 'Pelanggan', 'Total', 'Status', 'Waktu', 'Aksi'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '10px 22px', fontSize: 11, color: '#b5a99a', fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders?.length > 0 ? recentOrders.map(order => (
                          <tr key={order.id} style={{ borderBottom: '1px solid #f9f7f4' }}>
                            <td style={{ padding: '13px 22px', fontSize: 12, color: '#b5a99a', fontFamily: 'monospace' }}>{order.invoice_number || `#${String(order.id).padStart(4, '0')}`}</td>
                            <td style={{ padding: '13px 22px', fontSize: 13.5, color: '#1e1a14', fontWeight: 500 }}>{order.customer_name}</td>
                            <td style={{ padding: '13px 22px', fontFamily: "'Playfair Display',serif", fontSize: 14, fontWeight: 700, color: '#2d5a3d' }}>{formatRp(order.total_price)}</td>
                            <td style={{ padding: '13px 22px' }}>
                              <span style={{ fontSize: 11, fontWeight: 500, padding: '4px 11px', borderRadius: 20 }} className={STATUS_STYLE[order.status] || 'bg-gray-100 text-gray-500'}>{order.status}</span>
                            </td>
                            <td style={{ padding: '13px 22px', fontSize: 12, color: '#b5a99a' }}>{new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                            <td style={{ padding: '13px 22px' }}>
                              <Link to={`/admin/pesanan?highlight=${order.invoice_number}`} style={{ fontSize: 12, color: '#2d5a3d', textDecoration: 'none', fontWeight: 500 }}>Detail →</Link>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', fontSize: 13, color: '#b5a99a' }}>Belum ada pesanan</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {showLogout && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}
    </>
  );
};

export default AdminDashboard;