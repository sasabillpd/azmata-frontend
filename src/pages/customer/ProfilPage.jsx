import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  User, Shield, ShoppingBag, MapPin, LogOut, Camera,
  Plus, Trash2, Star, Heart, ChevronDown, Eye, EyeOff,
  Check, Package, CreditCard,
} from 'lucide-react';
import CustomerNavbar from '../../components/common/CustomerNavbar';
import { useAuth, cartKey } from '../../context/AuthContext';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import KeranjangDrawer from './KeranjangDrawer';

// ── Constants ────────────────────────────────────────────────
const MENU = [
  { key: 'info',     label: 'Informasi akun',  icon: User },
  { key: 'sandi',    label: 'Keamanan & sandi', icon: Shield },
  { key: 'pesanan',  label: 'Riwayat pesanan',  icon: ShoppingBag },
  { key: 'alamat',   label: 'Alamat tersimpan', icon: MapPin },
  { key: 'rekening', label: 'Rekening bank',    icon: CreditCard },
  { key: 'favorit',  label: 'Favorit',          icon: Heart },
];

const BANK_LIST = ['BCA', 'BNI', 'BRI', 'Mandiri', 'BSI', 'CIMB Niaga', 'Danamon', 'Permata', 'BTN', 'Lainnya'];
const WILAYAH_BASE = 'https://www.emsifa.com/api-wilayah-indonesia/api';

const STATUS_STYLE = {
  'Menunggu Pembayaran': { color: '#b45309', bg: '#fffbf0', border: '#f5dfa0' },
  'Menunggu Konfirmasi': { color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  'Diproses':            { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  'Dikirim':             { color: '#4338ca', bg: '#eef2ff', border: '#c7d2fe' },
  'Selesai':             { color: '#2d5a3d', bg: '#f0f9f4', border: '#c5dfc9' },
  'Dibatalkan':          { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

const getCekResiUrl = (kurir, no_resi) => {
  const r = encodeURIComponent(no_resi || '');
  const map = {
    'JNE':           `https://www.jne.co.id/id/tracking/trace?awbNumber=${r}`,
    'J&T':           `https://www.jet.co.id/track/${r}`,
    'SiCepat':       `https://www.sicepat.com/checkAwb?awb=${r}`,
    'AnterAja':      `https://anteraja.id/tracking/${r}`,
    'Ninja Xpress':  `https://www.ninjaxpress.co/id-id/tracking?id=${r}`,
    'Pos Indonesia': `https://www.posindonesia.co.id/id/tracking`,
  };
  return map[kurir] || `https://cekresi.com/?resi=${r}`;
};

const CANCEL_REASONS = [
  'Salah pilih produk',
  'Ingin mengubah alamat pengiriman',
  'Menemukan harga lebih murah',
  'Berubah pikiran',
  'Lainnya',
];

// ── Design tokens ────────────────────────────────────────────
const ff   = { serif: "'Playfair Display',serif", sans: "'DM Sans',sans-serif" };
const green = '#2d5a3d';
const border = '#ede9e0';
const cream  = '#faf9f6';

// ── Shared styles ────────────────────────────────────────────
const inputStyle = {
  width: '100%', height: 40, padding: '0 12px', borderRadius: 10,
  border: `1.5px solid ${border}`, fontSize: 13, fontFamily: ff.sans,
  outline: 'none', color: '#1e1a14', background: '#fff', boxSizing: 'border-box',
};
const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 500, color: '#6b6357',
  marginBottom: 6, fontFamily: ff.sans,
};
const cardStyle = {
  background: '#fff', borderRadius: 20,
  border: `1px solid ${border}`, overflow: 'hidden',
  boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
};
const cardHeader = {
  background: green, padding: '16px 24px',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
};
const cardHeaderText = {
  fontFamily: ff.serif, fontSize: 15, fontWeight: 600, color: '#fff', margin: 0,
};
const btnPrimary = (loading) => ({
  height: 40, padding: '0 20px', background: loading ? '#9dbfaa' : green,
  color: '#fff', fontFamily: ff.sans, fontSize: 13, fontWeight: 500,
  border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer',
  transition: 'background 0.15s',
});
const btnSecondary = {
  height: 40, padding: '0 20px', background: '#fff',
  color: '#6b6357', fontFamily: ff.sans, fontSize: 13,
  border: `1.5px solid ${border}`, borderRadius: 10, cursor: 'pointer',
};

// ── SectionCard ──────────────────────────────────────────────
const SectionCard = ({ title, children }) => (
  <div style={cardStyle}>
    <div style={cardHeader}><p style={cardHeaderText}>{title}</p></div>
    <div style={{ padding: 24 }}>{children}</div>
  </div>
);

// ── WilayahDropdown ──────────────────────────────────────────
const WilayahDropdown = ({ id, label, value, placeholder, options, onSelect, disabled, openId, setOpenId, onOpen }) => {
  const isOpen = openId === id;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <button type="button" disabled={disabled}
          onClick={() => { if (onOpen) onOpen(); setOpenId(isOpen ? null : id); }}
          style={{
            width: '100%', height: 40, padding: '0 12px', borderRadius: 10,
            border: `1.5px solid ${isOpen ? green : border}`,
            background: disabled ? cream : '#fff', fontSize: 13, textAlign: 'left',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
            fontFamily: ff.sans, color: value ? '#1e1a14' : '#b5a99a', boxSizing: 'border-box',
          }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || placeholder}</span>
          <ChevronDown size={13} style={{ color: '#9a9080', flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
        </button>
        {isOpen && (
          <div style={{
            position: 'absolute', top: 44, left: 0, right: 0, zIndex: 50,
            background: '#fff', border: `1px solid ${border}`, borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)', maxHeight: 200, overflowY: 'auto',
          }}>
            {options.length === 0
              ? <div style={{ padding: '12px 16px', fontSize: 12, color: '#9a9080', display: 'flex', gap: 8, alignItems: 'center', fontFamily: ff.sans }}>
                  <div style={{ width: 12, height: 12, border: `2px solid ${green}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Memuat...
                </div>
              : options.map(opt => (
                <button key={opt.id} type="button" onClick={() => { onSelect(opt); setOpenId(null); }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13,
                    background: value === opt.name ? '#f0f7f2' : 'transparent',
                    color: value === opt.name ? green : '#3a3530',
                    fontWeight: value === opt.name ? 500 : 400,
                    border: 'none', cursor: 'pointer', fontFamily: ff.sans,
                  }}>
                  {opt.name}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main ─────────────────────────────────────────────────────
const ProfilPage = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fileRef = useRef();

  const [active, setActive] = useState('info');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem(cartKey(user?.id))) || []; } catch { return []; }
  });

  // INFO
  const [form, setForm] = useState({ first_name: user?.name?.split(' ')[0] || '', last_name: user?.name?.split(' ').slice(1).join(' ') || '', email: user?.email || '', phone: user?.phone || '' });
  const [photo, setPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [profileData, setProfileData] = useState(null);

  // SANDI
  const [sandi, setSandi] = useState({ lama: '', baru: '', konfirmasi: '' });
  const [loadingSandi, setLoadingSandi] = useState(false);
  const [showSandi, setShowSandi] = useState({ lama: false, baru: false, konfirmasi: false });
  const [lastPasswordChange, setLastPasswordChange] = useState(null);

  // PESANAN
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersFetched, setOrdersFetched] = useState(false);
  const [orderFilter, setOrderFilter] = useState('Semua');
  const [cancelModal, setCancelModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); 
  const [cancelingId, setCancelingId] = useState(null);

  // ALAMAT
  const [addresses, setAddresses] = useState([]);
  const [loadingAlamat, setLoadingAlamat] = useState(false);
  const [alamatFetched, setAlamatFetched] = useState(false);
  const [showAlamatForm, setShowAlamatForm] = useState(false);
  const [savingAlamat, setSavingAlamat] = useState(false);
  const [alamatForm, setAlamatForm] = useState({ label:'', nama:'', telepon:'', detail:'', provinsi_id:'', provinsi_name:'', kota_id:'', kota_name:'', kecamatan_id:'', kecamatan_name:'', kelurahan_id:'', kelurahan_name:'', kode_pos:'' });
  const [provinsiList, setProvinsiList] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  const [kecamatanList, setKecamatanList] = useState([]);
  const [kelurahanList, setKelurahanList] = useState([]);

  // REKENING
  const [rekening, setRekening] = useState({ bank_name: '', bank_account_number: '', bank_account_name: '' });
  const [loadingRekening, setLoadingRekening] = useState(false);
  const [rekeningFetched, setRekeningFetched] = useState(false);

  // FAVORIT
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [wishlistFetched, setWishlistFetched] = useState(false);

  useEffect(() => {
    api.get('/profile').then(res => {
      setProfileData(res.data);
      setLastPasswordChange(res.data.password_updated_at ? new Date(res.data.password_updated_at) : null);
      setForm({ first_name: res.data.name?.split(' ')[0] || '', last_name: res.data.name?.split(' ').slice(1).join(' ') || '', email: res.data.email || '', phone: res.data.phone || '' });
      if (res.data.avatar) setPhoto(res.data.avatar);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (location.state?.tab) {
      const tab = location.state.tab;
      setActive(tab);
      if (tab === 'alamat')   fetchAlamat();
      if (tab === 'pesanan')  fetchOrders();
      if (tab === 'favorit')  fetchWishlist();
      if (tab === 'rekening') fetchRekening();
    }
  }, []);

  const handleMenu = (key) => {
    setActive(key);
    if (key === 'pesanan'  && !ordersFetched)   fetchOrders();
    if (key === 'alamat'   && !alamatFetched)   fetchAlamat();
    if (key === 'favorit'  && !wishlistFetched) fetchWishlist();
    if (key === 'rekening' && !rekeningFetched) fetchRekening();
  };

  const fetchOrders = async () => { setLoadingOrders(true); try { const res = await api.get('/orders/my-orders'); setOrders(Array.isArray(res.data) ? res.data : res.data?.data ?? []); setOrdersFetched(true); } catch { toast.error('Gagal memuat pesanan'); } finally { setLoadingOrders(false); } };
  const fetchAlamat = async () => { setLoadingAlamat(true); try { const res = await api.get('/addresses'); setAddresses(Array.isArray(res.data) ? res.data : res.data?.data ?? []); setAlamatFetched(true); } catch { toast.error('Gagal memuat alamat'); } finally { setLoadingAlamat(false); } };
  const fetchWishlist = async () => { setLoadingWishlist(true); try { const res = await api.get('/wishlist'); setWishlist(res.data || []); setWishlistFetched(true); } catch { toast.error('Gagal memuat favorit'); } finally { setLoadingWishlist(false); } };
  const fetchRekening = async () => { try { const res = await api.get('/profile/bank'); setRekening({ bank_name: res.data.bank_name || '', bank_account_number: res.data.bank_account_number || '', bank_account_name: res.data.bank_account_name || '' }); setRekeningFetched(true); } catch { toast.error('Gagal memuat rekening'); } };
  const fetchProvinsi = () => { if (provinsiList.length > 0) return; fetch(`${WILAYAH_BASE}/provinces.json`).then(r => r.json()).then(setProvinsiList).catch(() => {}); };

  const handleSaveInfo = async () => {
    setLoadingInfo(true);
    try {
      const fd = new FormData();
      fd.append('first_name', form.first_name); fd.append('last_name', form.last_name);
      fd.append('email', form.email); fd.append('phone', form.phone);
      if (photoFile) fd.append('avatar', photoFile);
      const res = await api.put('/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const updatedUser = res.data.user || {};
      if (updatedUser.name || updatedUser.avatar) updateUser({ ...(updatedUser.name && { name: updatedUser.name }), ...(updatedUser.avatar && { avatar: updatedUser.avatar }) });
      toast.success('Profil berhasil disimpan');
    } catch { toast.error('Gagal menyimpan profil'); } finally { setLoadingInfo(false); }
  };

  const handleSaveSandi = async () => {
    if (sandi.baru !== sandi.konfirmasi) { toast.error('Konfirmasi sandi tidak cocok'); return; }
    if (sandi.baru.length < 8) { toast.error('Sandi minimal 8 karakter'); return; }
    setLoadingSandi(true);
    try {
      const res = await api.put('/profile/password', { current_password: sandi.lama, new_password: sandi.baru });
      toast.success('Sandi berhasil diubah');
      setLastPasswordChange(new Date(res.data.password_updated_at || Date.now()));
      setSandi({ lama: '', baru: '', konfirmasi: '' });
    } catch { toast.error('Sandi lama tidak sesuai'); } finally { setLoadingSandi(false); }
  };

  const handleSaveAlamat = async () => {
    if (!alamatForm.nama || !alamatForm.detail || !alamatForm.provinsi_id || !alamatForm.kota_id || !alamatForm.kecamatan_id || !alamatForm.kelurahan_id) { toast.error('Lengkapi field yang wajib diisi'); return; }
    setSavingAlamat(true);
    try {
      const res = await api.post('/addresses', { label: alamatForm.label, nama: alamatForm.nama, telepon: alamatForm.telepon, alamat: alamatForm.detail, provinsi_name: alamatForm.provinsi_name, kota_name: alamatForm.kota_name, kecamatan_name: alamatForm.kecamatan_name, kelurahan_name: alamatForm.kelurahan_name, kode_pos: alamatForm.kode_pos });
      setAddresses(prev => [...prev, res.data]);
      setShowAlamatForm(false);
      setAlamatForm({ label:'', nama:'', telepon:'', detail:'', provinsi_id:'', provinsi_name:'', kota_id:'', kota_name:'', kecamatan_id:'', kecamatan_name:'', kelurahan_id:'', kelurahan_name:'', kode_pos:'' });
      setKotaList([]); setKecamatanList([]); setKelurahanList([]);
      toast.success('Alamat berhasil disimpan');
    } catch { toast.error('Gagal menyimpan alamat'); } finally { setSavingAlamat(false); }
  };

  const handleDeleteAlamat = async (id) => { try { await api.delete(`/addresses/${id}`); setAddresses(prev => prev.filter(a => a.id !== id)); toast.success('Alamat dihapus'); } catch { toast.error('Gagal menghapus alamat'); } };
  const handleSetUtama = async (id) => { try { await api.put(`/addresses/${id}/primary`); setAddresses(prev => prev.map(a => ({ ...a, is_primary: a.id === id }))); toast.success('Alamat utama diperbarui'); } catch { toast.error('Gagal memperbarui'); } };

  const handleSaveRekening = async () => {
    if (!rekening.bank_name || !rekening.bank_account_number || !rekening.bank_account_name) { toast.error('Semua field rekening wajib diisi'); return; }
    setLoadingRekening(true);
    try { await api.put('/profile/bank', rekening); toast.success('Rekening berhasil disimpan'); } catch { toast.error('Gagal menyimpan rekening'); } finally { setLoadingRekening(false); }
  };

  // ── PATCH: cancel order dengan cek needs_refund ──────────────
  const handleCancelOrder = async () => {
    if (!cancelModal?.reason) { toast.error('Pilih alasan pembatalan'); return; }
    setCancelingId(cancelModal.id);
    try {
      await api.put(`/orders/${cancelModal.id}/cancel`, {
        reason: cancelModal.reason,
        needs_refund: cancelModal.needsRefund,
      });
      setOrders(prev => prev.map(o =>
        o.id === cancelModal.id
          ? { ...o, status: 'Dibatalkan', cancel_reason: cancelModal.reason }
          : o
      ));
      toast.success(
        cancelModal.needsRefund
          ? 'Pesanan dibatalkan — refund akan diproses super admin'
          : 'Pesanan berhasil dibatalkan'
      );
      setCancelModal(null);
    } catch { toast.error('Gagal membatalkan pesanan'); }
    finally { setCancelingId(null); }
  };

  const removeWishlist = async (productId) => { try { await api.delete(`/wishlist/${productId}`); setWishlist(prev => prev.filter(w => (w.product_id ?? w.id) !== productId)); toast.success('Dihapus dari favorit'); } catch { toast.error('Gagal menghapus'); } };

  const avatarUrl = photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=2d5a3d&color=fff&size=80`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .profil-root * { box-sizing: border-box; }
        .menu-btn:hover { background: #f5f2ec !important; color: #1e1a14 !important; }
        .menu-btn.active { background: #f0f7f2 !important; color: #2d5a3d !important; }
        .addr-card-item { transition: all 0.15s; }
        .addr-card-item:hover { border-color: #4a9e6b !important; background: #f5fbf7 !important; }
        .order-tab:hover { border-color: #4a9e6b !important; color: #2d5a3d !important; }
        .notif-danger { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 12px 16px; }
        .cancel-reason:hover .cancel-dot { border-color: #e57373 !important; }
        .cancel-reason:hover span { color: #1e1a14 !important; }
        .wishlist-card { transition: box-shadow 0.15s; }
        .wishlist-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.08) !important; }
        .input-focus:focus { border-color: #2d5a3d !important; }
      `}</style>

      <div className="profil-root" style={{ minHeight: '100vh', background: cream, fontFamily: ff.sans }} onClick={() => openDropdown && setOpenDropdown(null)}>
        <CustomerNavbar onCartClick={() => setDrawerOpen(true)} cartCount={cart.reduce((sum, i) => sum + (i.quantity || 1), 0)} />

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, fontFamily: ff.sans, fontSize: 13 }}>
            <Link to="/katalog" style={{ color: '#9a9080', textDecoration: 'none' }}>Katalog</Link>
            <span style={{ color: '#c5bfb5' }}>/</span>
            <span style={{ color: '#3a3530' }}>{MENU.find(m => m.key === active)?.label}</span>
          </div>

          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

            {/* ── SIDEBAR ── */}
            <aside style={{ width: 220, flexShrink: 0 }}>
              <div style={{ background: '#fff', borderRadius: 20, border: `1px solid ${border}`, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
                <div style={{ background: green, padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ position: 'relative' }}>
                    <img src={avatarUrl} alt={user?.name} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.25)' }} />
                    <button onClick={() => fileRef.current.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, background: '#fff', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
                      <Camera size={10} style={{ color: green }} />
                    </button>
                    <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files[0]; if (!f) return; if (f.size > 2*1024*1024) { toast.error('Maks. 2MB'); return; } setPhotoFile(f); setPhoto(URL.createObjectURL(f)); }} />
                  </div>
                  <p style={{ fontFamily: ff.sans, fontSize: 13, fontWeight: 600, color: '#fff', textAlign: 'center', margin: 0 }}>{user?.name}</p>
                  <span style={{ fontFamily: ff.sans, fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
                    Member sejak {profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : '-'}
                  </span>
                </div>

                <div style={{ padding: 8 }}>
                  {MENU.map(({ key, label, icon: Icon }) => {
                    const isActive = active === key;
                    return (
                      <button key={key} onClick={() => handleMenu(key)} className={`menu-btn ${isActive ? 'active' : ''}`}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: 'none', background: isActive ? '#f0f7f2' : 'transparent', color: isActive ? green : '#6b6357', fontFamily: ff.sans, fontSize: 13, fontWeight: isActive ? 500 : 400, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', marginBottom: 2 }}>
                        <Icon size={14} style={{ color: isActive ? green : '#9a9080', flexShrink: 0 }} />
                        {label}
                      </button>
                    );
                  })}
                  <div style={{ borderTop: `1px solid ${border}`, marginTop: 4, paddingTop: 4 }}>
                    <button onClick={() => setShowLogoutModal(true)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: 'none', background: 'transparent', color: '#6b6357', fontFamily: ff.sans, fontSize: 13, cursor: 'pointer', textAlign: 'left' }}>
                      <LogOut size={14} style={{ color: '#9a9080' }} /> Keluar
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* ── MAIN ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* INFORMASI AKUN */}
              {active === 'info' && (
                <SectionCard title="Informasi pribadi">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 18, borderBottom: `1px solid ${border}` }}>
                      <img src={avatarUrl} alt="Foto profil" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: `2px solid #f0f7f2` }} />
                      <div>
                        <p style={{ fontFamily: ff.sans, fontSize: 13, fontWeight: 500, color: '#3a3530', margin: '0 0 3px' }}>Foto profil</p>
                        <p style={{ fontFamily: ff.sans, fontSize: 11, color: '#9a9080', margin: '0 0 10px' }}>JPG atau PNG, maks. 2MB</p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => fileRef.current.click()} style={{ fontFamily: ff.sans, fontSize: 12, color: green, border: `1.5px solid #c5dfc9`, borderRadius: 8, padding: '4px 12px', background: '#fff', cursor: 'pointer' }}>Ganti foto</button>
                          {photo && <button onClick={() => { setPhoto(null); setPhotoFile(null); }} style={{ fontFamily: ff.sans, fontSize: 12, color: '#e57373', border: '1.5px solid #fca5a5', borderRadius: 8, padding: '4px 12px', background: '#fff', cursor: 'pointer' }}>Hapus</button>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {[['first_name','Nama depan'],['last_name','Nama belakang']].map(([k,l]) => (
                        <div key={k}><label style={labelStyle}>{l}</label><input className="input-focus" style={inputStyle} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} /></div>
                      ))}
                    </div>
                    <div><label style={labelStyle}>Email</label><input className="input-focus" type="email" style={inputStyle} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
                    <div><label style={labelStyle}>Telepon</label><input className="input-focus" type="tel" style={inputStyle} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, borderTop: `1px solid ${border}` }}>
                      <button onClick={handleSaveInfo} disabled={loadingInfo} style={btnPrimary(loadingInfo)}>
                        {loadingInfo ? 'Menyimpan...' : 'Simpan perubahan'}
                      </button>
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* KEAMANAN */}
              {active === 'sandi' && (
                <SectionCard title="Keamanan & sandi">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <p style={{ fontFamily: ff.sans, fontSize: 12, color: '#9a9080', margin: 0 }}>
                      {lastPasswordChange ? `Terakhir diubah ${lastPasswordChange.toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}` : 'Belum pernah diubah'}
                    </p>
                    {[['lama','Sandi lama'],['baru','Sandi baru'],['konfirmasi','Konfirmasi sandi baru']].map(([k,l]) => (
                      <div key={k}>
                        <label style={labelStyle}>{l}</label>
                        <div style={{ position: 'relative' }}>
                          <input className="input-focus" type={showSandi[k] ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: 40 }} value={sandi[k]} onChange={e => setSandi(p => ({ ...p, [k]: e.target.value }))} />
                          <button type="button" onClick={() => setShowSandi(p => ({ ...p, [k]: !p[k] }))} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9a9080', display: 'flex', alignItems: 'center' }}>
                            {showSandi[k] ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>
                    ))}
                    <div style={{ background: '#f0f7f2', border: `1px solid #c5dfc9`, borderRadius: 10, padding: '10px 14px' }}>
                      <p style={{ fontFamily: ff.sans, fontSize: 12, color: green, margin: 0 }}>Minimal 8 karakter — kombinasi huruf besar, kecil, dan angka.</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 8, borderTop: `1px solid ${border}` }}>
                      <button onClick={() => setSandi({ lama:'', baru:'', konfirmasi:'' })} style={btnSecondary}>Batal</button>
                      <button onClick={handleSaveSandi} disabled={loadingSandi} style={btnPrimary(loadingSandi)}>
                        {loadingSandi ? 'Menyimpan...' : 'Simpan sandi'}
                      </button>
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* RIWAYAT PESANAN */}
              {active === 'pesanan' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <p style={{ fontFamily: ff.serif, fontSize: 18, fontWeight: 600, color: '#1e1a14', margin: 0 }}>Riwayat pesanan</p>

                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                    {['Semua', 'Menunggu Pembayaran', 'Menunggu Konfirmasi', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'].map(tab => {
                      const isActive = orderFilter === tab;
                      const count = tab !== 'Semua' ? orders.filter(o => o.status === tab).length : 0;
                      return (
                        <button key={tab} className="order-tab" onClick={() => setOrderFilter(tab)}
                          style={{ flexShrink: 0, fontFamily: ff.sans, fontSize: 12, padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${isActive ? green : border}`, background: isActive ? green : '#fff', color: isActive ? '#fff' : '#6b6357', cursor: 'pointer', fontWeight: isActive ? 500 : 400, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {tab}
                          {count > 0 && (
                            <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: isActive ? 'rgba(255,255,255,0.2)' : '#f0ece4', color: isActive ? '#fff' : '#6b6357', fontWeight: 600 }}>{count}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {loadingOrders ? (
                    [...Array(3)].map((_, i) => (
                      <div key={i} style={{ background: '#fff', borderRadius: 16, padding: 20, border: `1px solid ${border}`, height: 100, backgroundImage: 'linear-gradient(90deg,#f0ece4 25%,#e8e2d8 50%,#f0ece4 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                    ))
                  ) : (() => {
                    const filtered = orderFilter === 'Semua' ? orders : orders.filter(o => o.status === orderFilter);
                    if (!filtered.length) return (
                      <div style={{ background: '#fff', borderRadius: 20, padding: '60px 20px', textAlign: 'center', border: `1px solid ${border}` }}>
                        <Package size={36} style={{ color: '#c5bfb5', margin: '0 auto 12px', display: 'block' }} />
                        <p style={{ fontFamily: ff.sans, fontSize: 13, color: '#9a9080', margin: '0 0 8px' }}>{orderFilter === 'Semua' ? 'Belum ada pesanan.' : `Tidak ada pesanan "${orderFilter}".`}</p>
                        {orderFilter === 'Semua' && <Link to="/katalog" style={{ fontFamily: ff.sans, fontSize: 13, color: green }}>Mulai belanja</Link>}
                      </div>
                    );
                    return filtered.map(order => {
                      const st = STATUS_STYLE[order.status] || { color: '#6b6357', bg: '#f5f2ec', border: border };
                      return (
                        <div key={order.id} style={{ background: '#fff', borderRadius: 20, border: `1px solid ${border}`, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: `1px solid ${border}`, background: cream }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontFamily: ff.sans, fontSize: 12, fontWeight: 600, color: '#6b6357' }}>
                                {order.invoice_number || `#${String(order.id).padStart(5,'0')}`}
                              </span>
                              <span style={{ fontFamily: ff.sans, fontSize: 12, color: '#9a9080' }}>{new Date(order.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}</span>
                            </div>
                            <span style={{ fontFamily: ff.sans, fontSize: 11, fontWeight: 500, color: st.color, background: st.bg, border: `1px solid ${st.border}`, borderRadius: 20, padding: '3px 10px' }}>{order.status}</span>
                          </div>

                          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {(order.items || []).map(item => {
                              const imgFile = [item.image_1, item.image_2, item.image_3, item.image_4].find(f => f != null && f !== '');
                              return (
                                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                  <div style={{ width: 52, height: 52, borderRadius: 12, background: '#f0f7f2', flexShrink: 0, overflow: 'hidden', border: `1px solid #c5dfc9`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {imgFile
                                      ? <img src={imgFile} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display='none'; }} />
                                      : <span style={{ fontSize: 22 }}>🍪</span>}
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontFamily: ff.serif, fontSize: 13, fontWeight: 600, color: '#1e1a14', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product_name}</p>
                                    <p style={{ fontFamily: ff.sans, fontSize: 11, color: '#9a9080', margin: 0 }}>x{item.quantity} toples</p>
                                  </div>
                                  <span style={{ fontFamily: ff.serif, fontSize: 13, fontWeight: 700, color: green, flexShrink: 0 }}>Rp {(Number(item.price) * item.quantity).toLocaleString('id-ID')}</span>
                                </div>
                              );
                            })}
                          </div>

                          {order.status === 'Dibatalkan' && order.cancel_reason && (
                            <div style={{ margin: '0 20px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px' }}>
                              <p style={{ fontFamily: ff.sans, fontSize: 11, fontWeight: 600, color: '#dc2626', margin: '0 0 3px' }}>Alasan pembatalan</p>
                              <p style={{ fontFamily: ff.sans, fontSize: 12, color: '#ef4444', margin: 0 }}>{order.cancel_reason}</p>
                            </div>
                          )}

                          {order.payment_status === 'Ditolak' && (
                            <div style={{ margin: '0 20px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <p style={{ fontFamily: ff.sans, fontSize: 11, fontWeight: 600, color: '#dc2626', margin: 0 }}>Pembayaran ditolak admin</p>
                              {order.reject_reason && <p style={{ fontFamily: ff.sans, fontSize: 12, color: '#ef4444', margin: 0 }}>Alasan: {order.reject_reason}</p>}

                              {order.refund_status ? (
                                /* ── Tipe REFUND: order dibatalkan, dana dikembalikan ── */
                                order.refund_bank
                                  ? <p style={{ fontFamily: ff.sans, fontSize: 12, color: '#6b6357', margin: 0 }}>Refund ke: <strong>{order.refund_bank}</strong> {order.refund_rekening} a.n. {order.refund_atas_nama}</p>
                                  : <p style={{ fontFamily: ff.sans, fontSize: 12, color: '#b45309', margin: 0 }}>⚠ Lengkapi rekening bank di menu <button onClick={() => handleMenu('rekening')} style={{ color: green, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: ff.sans, fontSize: 12, padding: 0 }}>Rekening bank</button> untuk proses refund.</p>
                              ) : (
                                /* ── Tipe PENOLAKAN: minta upload ulang bukti transfer ── */
                                <p style={{ fontFamily: ff.sans, fontSize: 12, color: '#6b6357', margin: 0 }}>
                                  Silakan upload ulang bukti transfer yang sesuai lewat tombol <strong>"Bayar sekarang"</strong> di bawah.
                                </p>
                              )}

                              {order.refund_proof && (
                                <div>
                                  <p style={{ fontFamily: ff.sans, fontSize: 11, color: '#9a9080', margin: '4px 0' }}>Bukti refund dari admin:</p>
                                  <img src={order.refund_proof} alt="Bukti refund" style={{ width: '100%', maxHeight: 160, objectFit: 'contain', borderRadius: 8, border: '1px solid #fecaca' }} />
                                </div>
                              )}
                            </div>
                          )}
                            {order.status === 'Dikirim' && order.kurir && (
                              <div style={{ margin: '0 20px 12px', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 12, padding: '12px 16px' }}>
                                <p style={{ fontFamily: ff.sans, fontSize: 11, fontWeight: 600, color: '#7c3aed', margin: '0 0 8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>🚚 Info Pengiriman</p>
                                <p style={{ fontFamily: ff.sans, fontSize: 12, color: '#6b6357', margin: '0 0 4px' }}>
                                  Kurir: <strong>{order.kurir}</strong>
                                </p>
                                <p style={{ fontFamily: ff.sans, fontSize: 12, color: '#6b6357', margin: '0 0 8px' }}>
                                  No. Resi: <strong style={{ fontFamily: 'monospace', fontSize: 13 }}>{order.no_resi}</strong>
                                </p>
                                <a href={getCekResiUrl(order.kurir, order.no_resi)} target="_blank" rel="noreferrer"
                                  style={{ fontFamily: ff.sans, fontSize: 12, color: '#7c3aed', fontWeight: 500, textDecoration: 'none' }}>
                                  → Cek status pengiriman
                                </a>
                              </div>
                            )}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: `1px solid ${border}` }}>
                            <span style={{ fontFamily: ff.sans, fontSize: 13, color: '#6b6357' }}>
                              Total: <span style={{ fontFamily: ff.serif, fontWeight: 700, color: '#1e1a14' }}>Rp {Number(order.total_price).toLocaleString('id-ID')}</span>
                            </span>
                            <div style={{ display: 'flex', gap: 8 }}>
                              {order.status === 'Menunggu Pembayaran' && (
                                <Link to={`/pembayaran/${order.id}`} style={{ fontFamily: ff.sans, fontSize: 12, fontWeight: 500, color: '#fff', background: green, borderRadius: 10, padding: '6px 16px', textDecoration: 'none' }}>Bayar sekarang</Link>
                              )}
                              {/* PATCH: tombol batalkan dengan cek needsRefund */}
                              {order.status === 'Menunggu Pembayaran' && (
                              <button
                                onClick={() => {
                                  setCancelModal({ id: order.id, reason: '', needsRefund: false });
                                }}
                                style={{ fontFamily: ff.sans, fontSize: 12, fontWeight: 500, color: '#dc2626', background: '#fff', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '6px 16px', cursor: 'pointer' }}>
                                Batalkan
                              </button>
                            )}

                            {order.status === 'Dikirim' && (
                              <button
                                onClick={() => setConfirmModal({ id: order.id })}
                                style={{
                                  fontFamily: ff.sans, fontSize: 12, fontWeight: 500,
                                  color: '#fff', background: green,
                                  border: 'none', borderRadius: 10,
                                  padding: '6px 16px', cursor: 'pointer'
                                }}>
                                Konfirmasi Terima Barang
                              </button>
                            )}

                            {order.status === 'Menunggu Konfirmasi' && (
                              <div style={{ fontFamily: ff.sans, fontSize: 11, color: '#9a9080', fontStyle: 'italic' }}>
                                Tidak dapat dibatalkan
                              </div>
                            )}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}

              {/* ALAMAT */}
              {active === 'alamat' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontFamily: ff.serif, fontSize: 18, fontWeight: 600, color: '#1e1a14', margin: 0 }}>Alamat tersimpan</p>
                    <button onClick={() => setShowAlamatForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: ff.sans, fontSize: 13, fontWeight: 500, color: '#fff', background: green, border: 'none', borderRadius: 10, padding: '8px 16px', cursor: 'pointer' }}>
                      <Plus size={14} /> Tambah alamat
                    </button>
                  </div>

                  {loadingAlamat ? (
                    [...Array(2)].map((_, i) => <div key={i} style={{ height: 88, borderRadius: 16, backgroundImage: 'linear-gradient(90deg,#f0ece4 25%,#e8e2d8 50%,#f0ece4 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />)
                  ) : addresses.length === 0 && !showAlamatForm ? (
                    <div style={{ background: '#fff', borderRadius: 20, padding: '60px 20px', textAlign: 'center', border: `1px solid ${border}` }}>
                      <MapPin size={36} style={{ color: '#c5bfb5', margin: '0 auto 10px', display: 'block' }} />
                      <p style={{ fontFamily: ff.sans, fontSize: 13, color: '#9a9080', margin: 0 }}>Belum ada alamat tersimpan.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {addresses.map(addr => (
                        <div key={addr.id} className="addr-card-item" style={{ background: addr.is_primary ? '#f5fbf7' : '#fff', borderRadius: 16, padding: '14px 18px', border: `1.5px solid ${addr.is_primary ? '#c5dfc9' : border}` }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: addr.is_primary ? '#f0f7f2' : '#f5f2ec', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <MapPin size={14} style={{ color: addr.is_primary ? green : '#9a9080' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 5 }}>
                                {addr.label && addr.label.trim() !== '' && addr.label !== '0' && <span style={{ fontFamily: ff.sans, fontSize: 10, fontWeight: 500, color: green, background: '#f0f7f2', border: `1px solid #c5dfc9`, borderRadius: 20, padding: '2px 8px' }}>{addr.label}</span>}
                                {addr.is_primary && <span style={{ fontFamily: ff.sans, fontSize: 10, fontWeight: 500, color: '#b45309', background: '#fffbf0', border: `1px solid #f5dfa0`, borderRadius: 20, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 3 }}><Check size={8} strokeWidth={3} /> Utama</span>}
                              </div>
                              <p style={{ fontFamily: ff.sans, fontSize: 13, fontWeight: 600, color: '#1e1a14', margin: '0 0 3px' }}>{addr.nama} · {addr.telepon}</p>
                              <p style={{ fontFamily: ff.sans, fontSize: 12, color: '#6b6357', margin: 0, lineHeight: 1.5 }}>{[addr.alamat, addr.kelurahan_name, addr.kecamatan_name, addr.kota_name || addr.kota, addr.provinsi_name, addr.kode_pos].filter(Boolean).join(', ')}</p>
                            </div>
                            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                              {!addr.is_primary && (
                                <button onClick={() => handleSetUtama(addr.id)} title="Jadikan utama" style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${border}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9a9080' }}>
                                  <Star size={13} />
                                </button>
                              )}
                              <button onClick={() => handleDeleteAlamat(addr.id)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #fca5a5', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e57373' }}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {showAlamatForm && (
                    <SectionCard title="Tambah alamat baru">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} onClick={e => e.stopPropagation()}>
                        <div><label style={labelStyle}>Label (opsional)</label><input className="input-focus" style={inputStyle} placeholder="Rumah, Kantor, dll..." value={alamatForm.label} onChange={e => setAlamatForm(p => ({ ...p, label: e.target.value }))} /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div><label style={labelStyle}>Nama penerima *</label><input className="input-focus" style={inputStyle} value={alamatForm.nama} onChange={e => setAlamatForm(p => ({ ...p, nama: e.target.value }))} /></div>
                          <div><label style={labelStyle}>Telepon</label><input className="input-focus" style={inputStyle} value={alamatForm.telepon} onChange={e => setAlamatForm(p => ({ ...p, telepon: e.target.value }))} /></div>
                        </div>
                        <div><label style={labelStyle}>Alamat lengkap *</label><textarea className="input-focus" rows={2} style={{ ...inputStyle, height: 72, padding: '10px 12px', resize: 'none' }} value={alamatForm.detail} onChange={e => setAlamatForm(p => ({ ...p, detail: e.target.value }))} placeholder="Nama jalan, nomor rumah, RT/RW..." /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <WilayahDropdown id="prov" label="Provinsi *" value={alamatForm.provinsi_name} placeholder="Pilih provinsi..." options={provinsiList}
                            onSelect={item => { setAlamatForm(p => ({...p, provinsi_id:item.id, provinsi_name:item.name, kota_id:'', kota_name:'', kecamatan_id:'', kecamatan_name:'', kelurahan_id:'', kelurahan_name:''})); setKotaList([]); setKecamatanList([]); setKelurahanList([]); fetch(`${WILAYAH_BASE}/regencies/${item.id}.json`).then(r=>r.json()).then(setKotaList).catch(()=>{}); }}
                            openId={openDropdown} setOpenId={setOpenDropdown} onOpen={fetchProvinsi} />
                          <WilayahDropdown id="kota" label="Kota / Kabupaten *" value={alamatForm.kota_name} placeholder="Pilih kota..." options={kotaList} disabled={!alamatForm.provinsi_id}
                            onSelect={item => { setAlamatForm(p => ({...p, kota_id:item.id, kota_name:item.name, kecamatan_id:'', kecamatan_name:'', kelurahan_id:'', kelurahan_name:''})); setKecamatanList([]); setKelurahanList([]); fetch(`${WILAYAH_BASE}/districts/${item.id}.json`).then(r=>r.json()).then(setKecamatanList).catch(()=>{}); }}
                            openId={openDropdown} setOpenId={setOpenDropdown} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <WilayahDropdown id="kec" label="Kecamatan *" value={alamatForm.kecamatan_name} placeholder="Pilih kecamatan..." options={kecamatanList} disabled={!alamatForm.kota_id}
                            onSelect={item => { setAlamatForm(p => ({...p, kecamatan_id:item.id, kecamatan_name:item.name, kelurahan_id:'', kelurahan_name:''})); setKelurahanList([]); fetch(`${WILAYAH_BASE}/villages/${item.id}.json`).then(r=>r.json()).then(setKelurahanList).catch(()=>{}); }}
                            openId={openDropdown} setOpenId={setOpenDropdown} />
                          <WilayahDropdown id="kel" label="Kelurahan *" value={alamatForm.kelurahan_name} placeholder="Pilih kelurahan..." options={kelurahanList} disabled={!alamatForm.kecamatan_id}
                            onSelect={item => setAlamatForm(p => ({...p, kelurahan_id:item.id, kelurahan_name:item.name}))}
                            openId={openDropdown} setOpenId={setOpenDropdown} />
                        </div>
                        <div><label style={labelStyle}>Kode pos</label><input className="input-focus" style={{ ...inputStyle, width: 160 }} value={alamatForm.kode_pos} onChange={e => setAlamatForm(p => ({ ...p, kode_pos: e.target.value }))} placeholder="12345" /></div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 8, borderTop: `1px solid ${border}` }}>
                          <button onClick={() => setShowAlamatForm(false)} style={btnSecondary}>Batal</button>
                          <button onClick={handleSaveAlamat} disabled={savingAlamat} style={btnPrimary(savingAlamat)}>{savingAlamat ? 'Menyimpan...' : 'Simpan alamat'}</button>
                        </div>
                      </div>
                    </SectionCard>
                  )}
                </div>
              )}

              {/* REKENING BANK */}
              {active === 'rekening' && (
                <SectionCard title="Rekening bank">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ background: '#fffbf0', border: `1px solid #f5dfa0`, borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 12 }}>
                      <CreditCard size={15} style={{ color: '#b45309', flexShrink: 0, marginTop: 1 }} />
                      <p style={{ fontFamily: ff.sans, fontSize: 12, color: '#92400e', lineHeight: 1.6, margin: 0 }}>
                        Rekening ini digunakan untuk proses <strong>refund</strong> jika pesanan yang sudah dibayar dibatalkan. Pastikan data rekening benar.
                      </p>
                    </div>
                    <div>
                      <label style={labelStyle}>Bank *</label>
                      <div style={{ position: 'relative' }}>
                        <select value={rekening.bank_name} onChange={e => setRekening(p => ({ ...p, bank_name: e.target.value }))}
                          style={{ ...inputStyle, appearance: 'none', paddingRight: 36, cursor: 'pointer' }}>
                          <option value="">Pilih bank...</option>
                          {BANK_LIST.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <ChevronDown size={13} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9a9080', pointerEvents: 'none' }} />
                      </div>
                    </div>
                    <div><label style={labelStyle}>Nomor rekening *</label><input className="input-focus" style={inputStyle} type="text" value={rekening.bank_account_number} onChange={e => setRekening(p => ({ ...p, bank_account_number: e.target.value }))} placeholder="Contoh: 1234567890" /></div>
                    <div><label style={labelStyle}>Nama pemilik rekening *</label><input className="input-focus" style={inputStyle} type="text" value={rekening.bank_account_name} onChange={e => setRekening(p => ({ ...p, bank_account_name: e.target.value }))} placeholder="Sesuai nama di buku tabungan" /></div>
                    {rekening.bank_name && rekening.bank_account_number && rekening.bank_account_name && (
                      <div style={{ background: '#f0f7f2', border: `1px solid #c5dfc9`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Check size={14} style={{ color: green, flexShrink: 0 }} />
                        <div>
                          <p style={{ fontFamily: ff.sans, fontSize: 12, fontWeight: 600, color: green, margin: '0 0 2px' }}>{rekening.bank_name} — {rekening.bank_account_number}</p>
                          <p style={{ fontFamily: ff.sans, fontSize: 11, color: '#4a9e6b', margin: 0 }}>a.n. {rekening.bank_account_name}</p>
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8, borderTop: `1px solid ${border}` }}>
                      <button onClick={handleSaveRekening} disabled={loadingRekening} style={btnPrimary(loadingRekening)}>{loadingRekening ? 'Menyimpan...' : 'Simpan rekening'}</button>
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* FAVORIT */}
              {active === 'favorit' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <p style={{ fontFamily: ff.serif, fontSize: 18, fontWeight: 600, color: '#1e1a14', margin: 0 }}>Favorit</p>
                  {loadingWishlist ? (
                    <p style={{ fontFamily: ff.sans, fontSize: 13, color: '#9a9080' }}>Memuat favorit...</p>
                  ) : !wishlist.length ? (
                    <div style={{ background: '#fff', borderRadius: 20, padding: '60px 20px', textAlign: 'center', border: `1px solid ${border}` }}>
                      <Heart size={36} style={{ color: '#c5bfb5', margin: '0 auto 12px', display: 'block' }} />
                      <p style={{ fontFamily: ff.sans, fontSize: 13, color: '#9a9080', margin: '0 0 8px' }}>Belum ada produk favorit.</p>
                      <Link to="/katalog" style={{ fontFamily: ff.sans, fontSize: 13, color: green }}>Jelajahi katalog</Link>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      {wishlist.map(item => {
                        const imgSrc = item.image_1 || item.image_2 || item.image_3 || item.image_4;
                        return (
                          <div key={item.id} className="wishlist-card" style={{ background: '#fff', borderRadius: 18, padding: 16, border: `1px solid ${border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                            <Link to={`/produk/${item.product_id}`} style={{ textDecoration: 'none' }}>
                              <div style={{ width: '100%', height: 140, borderRadius: 12, background: '#f0f7f2', marginBottom: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {imgSrc
                                  ? <img src={imgSrc} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  : <span style={{ fontSize: 40 }}>🍪</span>}
                              </div>
                            </Link>
                            <p style={{ fontFamily: ff.sans, fontSize: 11, color: '#9a9080', margin: '0 0 3px' }}>{item.category_name}</p>
                            <p style={{ fontFamily: ff.serif, fontSize: 14, fontWeight: 600, color: '#1e1a14', margin: '0 0 12px' }}>{item.name}</p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontFamily: ff.serif, fontSize: 14, fontWeight: 700, color: green }}>
                                Rp {Number(item.price).toLocaleString('id-ID')}
                              </span>
                              <button onClick={() => removeWishlist(item.product_id)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #fca5a5', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e57373' }}>
                                <Heart size={13} style={{ fill: '#e57373' }} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ── CANCEL MODAL (PATCH) ── */}
        {cancelModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 380, boxShadow: '0 32px 80px rgba(0,0,0,0.18)', overflow: 'hidden', fontFamily: ff.sans }}>
              <div style={{ background: '#dc2626', padding: '16px 24px' }}>
                <p style={{ fontFamily: ff.serif, fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 4px' }}>Batalkan pesanan?</p>
                <p style={{ fontFamily: ff.sans, fontSize: 12, color: 'rgba(255,255,255,0.75)', margin: 0 }}>Pesanan yang dibatalkan tidak dapat dikembalikan.</p>
              </div>
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* PATCH: info refund jika sudah bayar */}
                {cancelModal.needsRefund && (
                  <div style={{ background: '#fffbf0', border: '1px solid #f5dfa0', borderRadius: 10, padding: '10px 14px' }}>
                    <p style={{ fontFamily: ff.sans, fontSize: 12, color: '#92400e', margin: 0, lineHeight: 1.6 }}>
                      Kamu sudah upload bukti bayar. Setelah dibatalkan, refund akan diproses oleh super admin ke rekening bank kamu.
                    </p>
                    {!rekening.bank_account_number && (
                      <p style={{ fontFamily: ff.sans, fontSize: 12, color: '#dc2626', margin: '6px 0 0', lineHeight: 1.6 }}>
                        ⚠ Rekening belum diisi —{' '}
                        <button
                          onClick={() => { setCancelModal(null); handleMenu('rekening'); }}
                          style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: ff.sans, fontSize: 12, padding: 0 }}>
                          isi sekarang
                        </button>
                        {' '}agar refund bisa diproses.
                      </p>
                    )}
                  </div>
                )}

                <p style={{ fontFamily: ff.sans, fontSize: 13, fontWeight: 500, color: '#3a3530', margin: 0 }}>Alasan pembatalan</p>
                {CANCEL_REASONS.map(reason => (
                  <label key={reason} className="cancel-reason" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <div className="cancel-dot" onClick={() => setCancelModal(p => ({ ...p, reason }))}
                      style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${cancelModal.reason === reason ? '#dc2626' : border}`, background: cancelModal.reason === reason ? '#dc2626' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                      {cancelModal.reason === reason && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />}
                    </div>
                    <span onClick={() => setCancelModal(p => ({ ...p, reason }))} style={{ fontFamily: ff.sans, fontSize: 13, color: '#6b6357' }}>{reason}</span>
                  </label>
                ))}

                <div style={{ display: 'flex', gap: 10, marginTop: 8, paddingTop: 16, borderTop: `1px solid ${border}` }}>
                  <button onClick={() => setCancelModal(null)} style={{ flex: 1, height: 42, borderRadius: 10, border: `1.5px solid ${border}`, background: '#fff', fontFamily: ff.sans, fontSize: 13, color: '#6b6357', cursor: 'pointer' }}>Kembali</button>
                  <button onClick={handleCancelOrder} disabled={!!cancelingId || !cancelModal.reason} style={{ flex: 1, height: 42, borderRadius: 10, border: 'none', background: !cancelModal.reason ? '#f87171' : '#dc2626', color: '#fff', fontFamily: ff.sans, fontSize: 13, fontWeight: 500, cursor: !cancelModal.reason ? 'not-allowed' : 'pointer', opacity: !cancelModal.reason ? 0.6 : 1 }}>
                    {cancelingId ? 'Membatalkan...' : 'Ya, batalkan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal konfirmasi terima barang */}
        {confirmModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: 28, maxWidth: 400, width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
              <p style={{ fontFamily: ff.serif, fontSize: 17, fontWeight: 600, color: '#1e1a14', margin: '0 0 10px' }}>Konfirmasi Terima Barang</p>
              <p style={{ fontFamily: ff.sans, fontSize: 13, color: '#6b6357', margin: '0 0 24px', lineHeight: 1.6 }}>
                Pastikan kamu sudah menerima barang dalam kondisi baik. Setelah dikonfirmasi, pesanan tidak bisa dibatalkan.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setConfirmModal(null)}
                  style={{ flex: 1, height: 42, borderRadius: 10, border: '1.5px solid #e0ddd6', background: '#fff', fontSize: 13, color: '#6b6357', cursor: 'pointer', fontFamily: ff.sans }}>
                  Batal
                </button>
                <button
                  onClick={async () => {
                    try {
                      await api.patch(`/orders/${confirmModal.id}/confirm-received`);
                      toast.success('Pesanan dikonfirmasi selesai!');
                      setConfirmModal(null);
                      // refresh orders
                      const res = await api.get('/orders/my-orders');
                      setOrders(Array.isArray(res.data) ? res.data : res.data?.data ?? []);
                    } catch {
                      toast.error('Gagal mengkonfirmasi pesanan');
                    }
                  }}
                  style={{ flex: 1, height: 42, borderRadius: 10, border: 'none', background: green, color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: ff.sans }}>
                  Ya, sudah diterima
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── LOGOUT MODAL ── */}
        {showLogoutModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ background: '#fff', borderRadius: 20, padding: 36, width: 320, boxShadow: '0 32px 80px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, fontFamily: ff.sans }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LogOut size={22} style={{ color: '#d97706' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: ff.serif, fontSize: 18, fontWeight: 600, color: '#1e1a14', margin: '0 0 6px' }}>Keluar dari akun?</p>
                <p style={{ fontFamily: ff.sans, fontSize: 13, color: '#9a9080', margin: 0 }}>Kamu akan keluar dari akun Azmata Cookies.</p>
              </div>
              <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                <button onClick={() => setShowLogoutModal(false)} style={{ flex: 1, height: 42, borderRadius: 10, border: `1.5px solid ${border}`, background: '#fff', fontFamily: ff.sans, fontSize: 13, color: '#6b6357', cursor: 'pointer' }}>Batal</button>
                <button onClick={() => { logout(); navigate('/login'); }} style={{ flex: 1, height: 42, borderRadius: 10, border: 'none', background: '#d92206', color: '#fff', fontFamily: ff.sans, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Keluar</button>
              </div>
            </div>
          </div>
        )}

        {drawerOpen && <KeranjangDrawer cart={cart} setCart={setCart} onClose={() => setDrawerOpen(false)} />}
      </div>
    </>
  );
};

export default ProfilPage;