import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Plus, Pencil, Trash2, X, Upload, Search,
  LayoutDashboard, Package, ClipboardList,
  BarChart2, LogOut, CreditCard, Users2, Ticket,
} from 'lucide-react';

/* ── helpers ── */
const formatRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const getMainImage = (p) => {
  const img = p.image_1 || p.image_2 || p.image_3 || p.image_4;
  return img ? img : null;
};

const SLOTS = [0, 1, 2, 3];
const emptyForm = {
  name: '', description: '', price: '', stock: '', category_id: '',
  images: [null, null, null, null],
};

/* ── nav ── */
const getNav = (role) => [
  { label: 'Dasbor',           icon: LayoutDashboard, to: '/admin' },
  { label: 'Pesanan',          icon: ClipboardList,   to: '/admin/pesanan' },
  { label: 'Konfirmasi Bayar', icon: CreditCard,      to: '/admin/bayar' },
  { label: 'Produk',           icon: Package,         to: '/admin/produk' },
  { label: 'Voucher',          icon: Ticket,          to: '/admin/voucher' },
  ...(role === 'super_admin' ? [{ label: 'Laporan',   icon: BarChart2, to: '/admin/laporan' }] : []),
  ...(role === 'super_admin' ? [{ label: 'Pengguna',  icon: Users2,    to: '/admin/pengguna' }] : []),
];

const LogoutModal = ({ onConfirm, onCancel }) => (
  <>
    <div onClick={onCancel} style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(30,26,20,0.45)', backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.18s ease',
    }} />
    <div style={{
      position: 'fixed', top: '50%', left: '50%', zIndex: 51,
      transform: 'translate(-50%,-50%)',
      background: '#fff', borderRadius: 20,
      padding: '36px 32px 28px', width: 360,
      boxShadow: '0 24px 60px rgba(30,26,20,0.18)',
      animation: 'slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <button onClick={onCancel} style={{
        position: 'absolute', top: 16, right: 16,
        border: 'none', background: '#f5f1eb', borderRadius: 8,
        width: 30, height: 30, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a7f6f',
      }}><X size={14} /></button>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: 'linear-gradient(135deg,#fff3e8,#ffe0c8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
      }}><LogOut size={24} color="#d97706" /></div>
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1e1a14', margin: '0 0 8px' }}>
        Keluar dari akun?
      </p>
      <p style={{ fontSize: 14, color: '#8a7f6f', margin: '0 0 28px', lineHeight: 1.6 }}>
        Kamu akan keluar dari sesi admin. Pastikan semua perubahan sudah tersimpan sebelum lanjut.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} style={{
          flex: 1, padding: '11px 0', borderRadius: 12,
          border: '1.5px solid #ede9e0', background: '#fff',
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
          color: '#5a5346', cursor: 'pointer',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#faf9f6'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
        >Batal</button>
        <button onClick={onConfirm} style={{
          flex: 1, padding: '11px 0', borderRadius: 12,
          border: 'none', background: 'linear-gradient(135deg,#c0392b,#e74c3c)',
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
          color: '#fff', cursor: 'pointer',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >Ya, Keluar</button>
      </div>
    </div>
  </>
);

const Sidebar = ({ onLogoutClick, userRole }) => {
  const location = useLocation();
  const NAV = getNav(userRole);
  return (
    <aside style={{
      width: 240, flexShrink: 0,
      height: '100vh', position: 'sticky', top: 0,
      background: '#1a3d2b',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        padding: '28px 24px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'linear-gradient(135deg,#2d5a3d,#4a9e6b)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, flexShrink: 0,
        }}>🍪</div>
        <div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>Azmata</p>
          <p style={{ fontSize: 12, color: '#4a9e6b', margin: 0, fontWeight: 500 }}>
            {userRole === 'super_admin' ? 'Super Admin' : 'Panel admin'}
          </p>
        </div>
      </div>
      <nav style={{ flex: 1, padding: '20px 12px' }}>
        {NAV.map(({ label, icon: Icon, to }) => {
          const active = location.pathname === to ||
            (to !== '/admin' && location.pathname.startsWith(to));
          return (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px', borderRadius: 12, marginBottom: 4,
                background: active ? 'rgba(74,158,107,0.18)' : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                fontSize: 14, fontWeight: active ? 600 : 400,
                transition: 'all 0.16s', cursor: 'pointer',
                borderLeft: active ? '3px solid #4a9e6b' : '3px solid transparent',
              }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; } }}
              >
                <Icon size={17} />{label}
              </div>
            </Link>
          );
        })}
      </nav>
      <div style={{ padding: '0 12px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
        <button onClick={onLogoutClick} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          width: '100%', padding: '11px 14px', borderRadius: 12,
          border: 'none', background: 'transparent', cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,120,100,0.8)',
          transition: 'all 0.16s', textAlign: 'left',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,80,60,0.12)'; e.currentTarget.style.color = '#ff8070'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,120,100,0.8)'; }}
        >
          <LogOut size={17} />Keluar
        </button>
      </div>
    </aside>
  );
};

const Field = ({ label, required, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8a7f6f', marginBottom: 6, letterSpacing: '0.3px' }}>
      {label}{required && <span style={{ color: '#e74c3c', marginLeft: 3 }}>*</span>}
    </label>
    {children}
  </div>
);

const inputBase = {
  width: '100%', height: 40, padding: '0 12px',
  fontSize: 13, border: '1.5px solid #ede9e0',
  borderRadius: 10, outline: 'none',
  fontFamily: "'DM Sans', sans-serif", color: '#1e1a14',
  background: '#fff', transition: 'border-color 0.15s',
  boxSizing: 'border-box',
};

const AdminProduk = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [editData, setEditData]     = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [previews, setPreviews]     = useState([null, null, null, null]);
  const [saving, setSaving]         = useState(false);
  const [deleteId, setDeleteId]     = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  const fileRefs = SLOTS.map(() => useRef());

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([api.get('/products'), api.get('/categories')]);
      setProducts(Array.isArray(p.data) ? p.data : p.data.data ?? []);
      setCategories(Array.isArray(c.data) ? c.data : c.data.data ?? []);
    } catch { toast.error('Gagal memuat data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const targetId = params.get('highlight');
    if (!targetId) return;
    setHighlightId(Number(targetId));
    setTimeout(() => {
      const el = document.getElementById(`prod-row-${targetId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 600);
    setTimeout(() => setHighlightId(null), 4000);
  }, []);

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category_name?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditData(null);
    setForm(emptyForm);
    setPreviews([null, null, null, null]);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditData(p);
    setForm({ name: p.name, description: p.description || '', price: p.price, stock: p.stock, category_id: p.category_id || '', images: [null, null, null, null] });
    setPreviews([
      p.image_1 ? p.image_1 : null,
      p.image_2 ? p.image_2 : null,
      p.image_3 ? p.image_3 : null,
      p.image_4 ? p.image_4 : null,
    ]);
    setShowModal(true);
  };

  const handleFile = (e, i) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(f => { const images = [...f.images]; images[i] = file; return { ...f, images }; });
    setPreviews(prev => { const next = [...prev]; next[i] = URL.createObjectURL(file); return next; });
  };

  const removeImage = (i) => {
    setForm(f => { const images = [...f.images]; images[i] = null; return { ...f, images }; });
    setPreviews(prev => { const next = [...prev]; next[i] = null; return next; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error('Nama dan harga wajib diisi'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('price', form.price);
      fd.append('stock', form.stock || 0);
      fd.append('category_id', form.category_id);
      form.images.forEach((img, i) => { if (img) fd.append(`image_${i}`, img); });
      if (editData) {
        await api.put(`/products/${editData.id}`, fd);
        toast.success('Produk berhasil diperbarui');
      } else {
        await api.post('/products', fd);
        toast.success('Produk berhasil ditambahkan');
      }
      setShowModal(false);
      fetchAll();
    } catch { toast.error('Gagal menyimpan produk'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/products/${deleteId}`);
      toast.success('Produk dihapus');
      setDeleteId(null);
      fetchAll();
    } catch { toast.error('Gagal menghapus produk'); }
  };

  const handleLogout = () => { logout?.(); navigate('/login'); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .prod-row { transition: background 0.14s; }
        .prod-row:hover { background: #faf9f6 !important; }
        .prod-input:focus { border-color: #4a9e6b !important; }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translate(-50%,-44%)} to{opacity:1;transform:translate(-50%,-50%)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.5} }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #d4cfc8; border-radius: 99px; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#faf9f6', fontFamily: "'DM Sans', sans-serif" }}>

        <Sidebar onLogoutClick={() => setShowLogout(true)} userRole={user?.role} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <header style={{
              padding: '20px 32px', borderBottom: '1px solid #ede9e0', background: '#fff', display: 'flex', alignItems: 'center', 
              justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10,}}>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1e1a14', margin: 0 }}>
                Produk
              </h1>
              <p style={{ fontSize: 12, color: '#b5a99a', margin: '2px 0 0' }}>Kelola katalog produk kue kamu</p>
            </div>
            <div style={{ fontSize: 12, color: '#8a7f6f', background: '#f5f1eb', padding: '6px 14px', borderRadius: 20 }}>
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </header>

          <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #ede9e0', overflow: 'hidden' }}>

              <div style={{
                padding: '16px 20px', borderBottom: '1px solid #f5f1eb',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  flex: 1, maxWidth: 280, height: 36,
                  background: '#faf9f6', border: '1px solid #ede9e0',
                  borderRadius: 10, padding: '0 12px',
                }}>
                  <Search size={13} color="#c5bfb4" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Cari produk atau kategori..."
                    style={{
                      flex: 1, background: 'transparent', border: 'none', outline: 'none',
                      fontSize: 13, color: '#1e1a14', fontFamily: "'DM Sans', sans-serif",
                    }}
                  />
                </div>
                <span style={{ fontSize: 11, color: '#b5a99a', marginLeft: 'auto' }}>{filtered.length} produk</span>
                <button onClick={openAdd} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '0 18px', height: 36, borderRadius: 10,
                  border: 'none', background: 'linear-gradient(135deg,#2d5a3d,#4a9e6b)',
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                  color: '#fff', cursor: 'pointer', transition: 'opacity 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <Plus size={15} /> Tambah produk
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans', sans-serif" }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #f5f1eb' }}>
                      {['Produk', 'Kategori', 'Harga', 'Stok', 'Aksi'].map(h => (
                        <th key={h} style={{
                          textAlign: 'left', padding: '10px 20px',
                          fontSize: 10, color: '#b5a99a', fontWeight: 600,
                          letterSpacing: '0.6px', textTransform: 'uppercase',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(6)].map((_, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f9f7f4' }}>
                          {[200, 100, 90, 70, 120].map((w, j) => (
                            <td key={j} style={{ padding: '14px 20px' }}>
                              <div style={{ height: 10, background: '#f0ede8', borderRadius: 6, width: w, animation: 'pulse 1.4s ease-in-out infinite' }} />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '56px', textAlign: 'center', fontSize: 13, color: '#b5a99a' }}>
                          Belum ada produk. Klik "Tambah produk" untuk mulai.
                        </td>
                      </tr>
                    ) : filtered.map(p => (
                      <tr key={p.id} id={`prod-row-${p.id}`} className="prod-row"
                        style={{ borderBottom: '1px solid #f9f7f4', background: highlightId === p.id ? '#ffd7d7' : 'transparent', transition: 'background 1s ease', }}>
                        <td style={{ padding: '13px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#edf5f0', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                              {getMainImage(p)
                                ? <img src={getMainImage(p)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : '🍪'}
                            </div>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 500, color: '#1e1a14', margin: '0 0 2px' }}>{p.name}</p>
                              <p style={{ fontSize: 11, color: '#b5a99a', margin: 0, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {p.description || '—'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '13px 20px' }}>
                          <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: '#f5f1eb', color: '#8a7f6f' }}>
                            {p.category_name || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '13px 20px', fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, color: '#2d5a3d' }}>
                          {formatRp(p.price)}
                        </td>
                        <td style={{ padding: '13px 20px' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: p.stock === 0 ? '#e74c3c' : p.stock < 5 ? '#d97706' : '#1e1a14' }}>
                            {p.stock}
                          </span>
                          <span style={{ fontSize: 11, color: '#b5a99a', marginLeft: 4 }}>toples</span>
                          {p.stock === 0 && (
                            <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: '#fee2e2', color: '#b91c1c' }}>Habis</span>
                          )}
                        </td>
                        <td style={{ padding: '13px 20px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => openEdit(p)} style={{
                              display: 'flex', alignItems: 'center', gap: 6,
                              padding: '6px 12px', borderRadius: 8,
                              border: '1px solid #ede9e0', background: '#fff',
                              fontSize: 12, color: '#5a5346', cursor: 'pointer',
                              fontFamily: "'DM Sans', sans-serif", transition: 'all 0.14s',
                            }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = '#4a9e6b'; e.currentTarget.style.color = '#2d5a3d'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = '#ede9e0'; e.currentTarget.style.color = '#5a5346'; }}
                            >
                              <Pencil size={11} /> Edit
                            </button>
                            {user?.role === 'super_admin' && (
                              <button onClick={() => setDeleteId(p.id)} style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '6px 12px', borderRadius: 8,
                                border: '1px solid #fecaca', background: '#fff5f5',
                                fontSize: 12, color: '#b91c1c', cursor: 'pointer',
                                fontFamily: "'DM Sans', sans-serif", transition: 'background 0.14s',
                              }}
                                onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                                onMouseLeave={e => e.currentTarget.style.background = '#fff5f5'}
                              >
                                <Trash2 size={11} /> Hapus
                              </button>
                            )}
                          </div>
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

      {showModal && (
        <>
          <div onClick={() => setShowModal(false)} style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(30,26,20,0.4)', backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.18s ease',
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', zIndex: 51,
            transform: 'translate(-50%,-50%)',
            background: '#fff', borderRadius: 20,
            width: '100%', maxWidth: 520,
            maxHeight: '92vh', overflowY: 'auto',
            boxShadow: '0 24px 60px rgba(30,26,20,0.18)',
            animation: 'slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px 16px',
              borderBottom: '1px solid #f5f1eb',
              position: 'sticky', top: 0, background: '#fff', zIndex: 1,
            }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: '#1e1a14', margin: 0 }}>
                {editData ? 'Edit produk' : 'Tambah produk baru'}
              </p>
              <button onClick={() => setShowModal(false)} style={{
                border: 'none', background: '#f5f1eb', borderRadius: 8,
                width: 30, height: 30, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a7f6f',
              }}><X size={14} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              <Field label="Foto produk (maks. 4 foto)">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                  {SLOTS.map(i => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div
                        onClick={() => fileRefs[i].current?.click()}
                        style={{
                          aspectRatio: '1/1', border: '2px dashed #ede9e0', borderRadius: 12,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', overflow: 'hidden', background: '#faf9f6',
                          position: 'relative', transition: 'border-color 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#4a9e6b'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#ede9e0'}
                      >
                        {previews[i] ? (
                          <img src={previews[i]} alt={`foto ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <>
                            <Upload size={15} color="#c5bfb4" style={{ marginBottom: 4 }} />
                            <span style={{ fontSize: 10, color: '#b5a99a' }}>Foto {i + 1}</span>
                          </>
                        )}
                        {i === 0 && (
                          <span style={{
                            position: 'absolute', top: 5, left: 5,
                            fontSize: 9, background: '#2d5a3d', color: '#fff',
                            padding: '2px 6px', borderRadius: 4, fontWeight: 600,
                          }}>Utama</span>
                        )}
                      </div>
                      {previews[i] && (
                        <button type="button" onClick={() => removeImage(i)} style={{
                          fontSize: 10, color: '#e74c3c', background: 'none',
                          border: 'none', cursor: 'pointer', textAlign: 'center',
                          fontFamily: "'DM Sans', sans-serif",
                        }}>Hapus</button>
                      )}
                      <input ref={fileRefs[i]} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e, i)} />
                    </div>
                  ))}
                </div>
              </Field>

              <Field label="Nama produk" required>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nastar Keju Premium"
                  className="prod-input"
                  style={inputBase}
                />
              </Field>

              <Field label="Deskripsi">
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Deskripsi produk..."
                  className="prod-input"
                  style={{ ...inputBase, height: 'auto', padding: '10px 12px', resize: 'none', lineHeight: 1.6 }}
                />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Harga (Rp)" required>
                  <input
                    type="number" value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="65000"
                    className="prod-input"
                    style={inputBase}
                  />
                </Field>
                <Field label="Stok (toples)">
                  <input
                    type="number" value={form.stock}
                    onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                    placeholder="20"
                    className="prod-input"
                    style={inputBase}
                  />
                </Field>
              </div>

              <Field label="Kategori">
                <select
                  value={form.category_id}
                  onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                  className="prod-input"
                  style={{ ...inputBase, cursor: 'pointer' }}
                >
                  <option value="">Pilih kategori</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>

              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{
                  flex: 1, height: 42, borderRadius: 12,
                  border: '1.5px solid #ede9e0', background: '#fff',
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
                  color: '#5a5346', cursor: 'pointer', transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#faf9f6'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >Batal</button>
                <button type="submit" disabled={saving} style={{
                  flex: 1, height: 42, borderRadius: 12,
                  border: 'none', background: 'linear-gradient(135deg,#2d5a3d,#4a9e6b)',
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                  color: '#fff', cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {saving
                    ? <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                    : editData ? 'Simpan perubahan' : 'Tambah produk'
                  }
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {deleteId && (
        <>
          <div onClick={() => setDeleteId(null)} style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(30,26,20,0.4)', backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.18s ease',
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', zIndex: 51,
            transform: 'translate(-50%,-50%)',
            background: '#fff', borderRadius: 20, width: 360,
            padding: '32px 28px 24px',
            boxShadow: '0 24px 60px rgba(30,26,20,0.18)',
            animation: 'slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)',
            fontFamily: "'DM Sans', sans-serif", textAlign: 'center',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Trash2 size={22} color="#e74c3c" />
            </div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#1e1a14', margin: '0 0 6px' }}>
              Hapus produk?
            </p>
            <p style={{ fontSize: 13, color: '#b5a99a', margin: '0 0 24px', lineHeight: 1.6 }}>
              Produk yang dihapus tidak dapat dikembalikan.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{
                flex: 1, height: 42, borderRadius: 12,
                border: '1.5px solid #ede9e0', background: '#fff',
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
                color: '#5a5346', cursor: 'pointer', transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#faf9f6'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >Batal</button>
              <button onClick={handleDelete} style={{
                flex: 1, height: 42, borderRadius: 12,
                border: 'none', background: 'linear-gradient(135deg,#c0392b,#e74c3c)',
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                color: '#fff', cursor: 'pointer', transition: 'opacity 0.15s',
              }}
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

export default AdminProduk;