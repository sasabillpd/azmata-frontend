import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Search, Trash2, Shield, User,
  LayoutDashboard, Package, ClipboardList,
  BarChart2, LogOut, CreditCard, Users2, X, ShieldCheck, Ticket
} from 'lucide-react';

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
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(30,26,20,0.45)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.18s ease' }} />
    <div style={{ position: 'fixed', top: '50%', left: '50%', zIndex: 51, transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 20, padding: '36px 32px 28px', width: 360, boxShadow: '0 24px 60px rgba(30,26,20,0.18)', animation: 'slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)', fontFamily: "'DM Sans', sans-serif" }}>
      <button onClick={onCancel} style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: '#f5f1eb', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a7f6f' }}><X size={14} /></button>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#fff3e8,#ffe0c8)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><LogOut size={24} color="#d97706" /></div>
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1e1a14', margin: '0 0 8px' }}>Keluar dari akun?</p>
      <p style={{ fontSize: 14, color: '#8a7f6f', margin: '0 0 28px', lineHeight: 1.6 }}>Kamu akan keluar dari sesi admin. Pastikan semua perubahan sudah tersimpan.</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: '1.5px solid #ede9e0', background: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: '#5a5346', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = '#faf9f6'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
        >Batal</button>
        <button onClick={onConfirm} style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#c0392b,#e74c3c)', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >Ya, Keluar</button>
      </div>
    </div>
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

/* ══ ROLE BADGE ══ */
const RoleBadge = ({ role }) => {
  const styles = {
    super_admin: { bg: '#ede9fe', color: '#6d28d9', icon: <ShieldCheck size={11} />, label: 'Super Admin' },
    admin:       { bg: '#dbeafe', color: '#1d4ed8', icon: <Shield size={11} />,      label: 'Admin' },
    pelanggan:   { bg: '#f5f1eb', color: '#8a7f6f', icon: <User size={11} />,        label: 'Pelanggan' },
  };
  const s = styles[role] || styles.pelanggan;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 20, background: s.bg, color: s.color }}>
      {s.icon}{s.label}
    </div>
  );
};

/* ══ ADMIN PENGGUNA ══ */
const AdminPengguna = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [deleteId, setDeleteId]     = useState(null);
  const [showLogout, setShowLogout] = useState(false);

  // 🔒 Guard — hanya super_admin
  useEffect(() => {
    if (user && user.role !== 'super_admin') {
      toast.error('Akses ditolak');
      navigate('/admin');
    }
  }, [user, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch { toast.error('Gagal memuat pengguna'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole   = filterRole ? u.role === filterRole : true;
    return matchSearch && matchRole;
  });

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${deleteId}`);
      toast.success('Pengguna dihapus');
      setDeleteId(null);
      fetchUsers();
    } catch { toast.error('Gagal menghapus pengguna'); }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      toast.success('Role berhasil diubah');
      fetchUsers();
    } catch { toast.error('Gagal mengubah role'); }
  };

  const handleLogout = () => { logout?.(); navigate('/login'); };

  const Avatar = ({ name }) => (
    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#2d5a3d,#4a9e6b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
      {name?.charAt(0).toUpperCase()}
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .user-row { transition: background 0.14s; }
        .user-row:hover { background: #faf9f6 !important; }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translate(-50%,-44%)} to{opacity:1;transform:translate(-50%,-50%)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.5} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #d4cfc8; border-radius: 99px; }
        .role-select { font-size: 11px; border: 1px solid #ede9e0; border-radius: 8px; padding: 4px 8px; background: #fff; color: #1e1a14; cursor: pointer; outline: none; font-family: 'DM Sans', sans-serif; }
        .role-select:focus { border-color: #4a9e6b; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#faf9f6', fontFamily: "'DM Sans', sans-serif" }}>

        <Sidebar onLogoutClick={() => setShowLogout(true)} userRole={user?.role} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <header style={{
              padding: '20px 32px', borderBottom: '1px solid #ede9e0', background: '#fff', display: 'flex', alignItems: 'center', 
              justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10,}}>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1e1a14', margin: 0 }}>Pengguna</h1>
              <p style={{ fontSize: 12, color: '#b5a99a', margin: '2px 0 0' }}>Kelola akun pelanggan & admin</p>
            </div>
            <div style={{ fontSize: 12, color: '#8a7f6f', background: '#f5f1eb', padding: '6px 14px', borderRadius: 20 }}>
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </header>

          <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #ede9e0', overflow: 'hidden' }}>

              {/* Filter row */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f5f1eb', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxWidth: 280, height: 36, background: '#faf9f6', border: '1px solid #ede9e0', borderRadius: 10, padding: '0 12px' }}>
                  <Search size={13} color="#c5bfb4" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Cari nama atau email..."
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#1e1a14', fontFamily: "'DM Sans', sans-serif" }}
                  />
                </div>
                <select
                  value={filterRole}
                  onChange={e => setFilterRole(e.target.value)}
                  style={{ fontSize: 12, border: '1px solid #ede9e0', borderRadius: 10, padding: '0 12px', height: 36, background: '#faf9f6', color: '#1e1a14', cursor: 'pointer', outline: 'none', fontFamily: "'DM Sans', sans-serif" }}
                >
                  <option value="">Semua role</option>
                  <option value="pelanggan">Pelanggan</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <span style={{ fontSize: 11, color: '#b5a99a', marginLeft: 'auto' }}>{filtered.length} pengguna</span>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans', sans-serif" }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #f5f1eb' }}>
                      {['Pengguna', 'Email', 'Role', 'Telepon', 'Bergabung', 'Aksi'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 20px', fontSize: 10, color: '#b5a99a', fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(6)].map((_, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f9f7f4' }}>
                          {[160, 200, 80, 100, 90, 60].map((w, j) => (
                            <td key={j} style={{ padding: '14px 20px' }}>
                              <div style={{ height: 10, background: '#f0ede8', borderRadius: 6, width: w, animation: 'pulse 1.4s ease-in-out infinite' }} />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: '56px', textAlign: 'center', fontSize: 13, color: '#b5a99a' }}>Tidak ada pengguna ditemukan</td></tr>
                    ) : filtered.map(u => (
                      <tr key={u.id} className="user-row" style={{ borderBottom: '1px solid #f9f7f4' }}>
                        <td style={{ padding: '13px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Avatar name={u.name} />
                            <span style={{ fontSize: 13, fontWeight: 500, color: '#1e1a14' }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '13px 20px', fontSize: 13, color: '#8a7f6f' }}>{u.email}</td>
                        <td style={{ padding: '13px 20px' }}>
                          <RoleBadge role={u.role} />
                        </td>
                        <td style={{ padding: '13px 20px', fontSize: 13, color: '#8a7f6f' }}>{u.phone || '—'}</td>
                        <td style={{ padding: '13px 20px', fontSize: 12, color: '#b5a99a' }}>
                          {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '13px 20px' }}>
                          {u.role !== 'super_admin' && u.id !== user?.id ? (
                            <button onClick={() => setDeleteId(u.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid #fecaca', background: '#fff5f5', fontSize: 12, color: '#b91c1c', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.14s' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                              onMouseLeave={e => e.currentTarget.style.background = '#fff5f5'}
                            ><Trash2 size={11} /> Hapus</button>
                          ) : (
                            <span style={{ fontSize: 12, color: '#d4cfc8' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* MODAL HAPUS */}
      {deleteId && (
        <>
          <div onClick={() => setDeleteId(null)} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(30,26,20,0.4)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.18s ease' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', zIndex: 51, transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 20, width: 360, padding: '32px 28px 24px', boxShadow: '0 24px 60px rgba(30,26,20,0.18)', animation: 'slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)', fontFamily: "'DM Sans', sans-serif", textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Trash2 size={22} color="#e74c3c" /></div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#1e1a14', margin: '0 0 6px' }}>Hapus pengguna?</p>
            <p style={{ fontSize: 13, color: '#b5a99a', margin: '0 0 24px', lineHeight: 1.6 }}>Data pengguna yang dihapus tidak dapat dikembalikan.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, height: 42, borderRadius: 12, border: '1.5px solid #ede9e0', background: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: '#5a5346', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#faf9f6'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >Batal</button>
              <button onClick={handleDelete} style={{ flex: 1, height: 42, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#c0392b,#e74c3c)', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >Ya, hapus</button>
            </div>
          </div>
        </>
      )}

      {showLogout && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}
    </>
  );
};

export default AdminPengguna;