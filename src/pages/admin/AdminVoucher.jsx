import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ClipboardList, BarChart2,
  LogOut, X, CreditCard, Users2, Ticket,
  Plus, Trash2, Edit2, CheckCircle, XCircle, Search,
  Tag, Calendar, Percent, Hash, AlertTriangle, Clock, ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';

/* ══ HELPERS ══ */
const formatRp  = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const fmtDate   = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const isExpired = (d) => d && new Date(d) < new Date();

/* ══ NAV ══ */
const getNav = (role) => [
  { label: 'Dasbor',           icon: LayoutDashboard, to: '/admin' },
  { label: 'Pesanan',          icon: ClipboardList,   to: '/admin/pesanan' },
  { label: 'Konfirmasi Bayar', icon: CreditCard,      to: '/admin/bayar' },
  { label: 'Produk',           icon: Package,         to: '/admin/produk' },
  { label: 'Voucher',          icon: Ticket,          to: '/admin/voucher' },
  ...(role === 'super_admin' ? [{ label: 'Laporan',  icon: BarChart2, to: '/admin/laporan' }] : []),
  ...(role === 'super_admin' ? [{ label: 'Pengguna', icon: Users2,    to: '/admin/pengguna' }] : []),
];

/* ══ LOGOUT MODAL ══ */
const LogoutModal = ({ onConfirm, onCancel }) => (
  <>
    <div onClick={onCancel} style={{ position:'fixed',inset:0,zIndex:50,background:'rgba(30,26,20,0.45)',backdropFilter:'blur(4px)',animation:'fadeIn 0.18s ease' }} />
    <div style={{ position:'fixed',top:'50%',left:'50%',zIndex:51,transform:'translate(-50%,-50%)',background:'#fff',borderRadius:20,padding:'36px 32px 28px',width:360,boxShadow:'0 24px 60px rgba(30,26,20,0.18)',animation:'slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)',fontFamily:"'DM Sans',sans-serif" }}>
      <button onClick={onCancel} style={{ position:'absolute',top:16,right:16,border:'none',background:'#f5f1eb',borderRadius:8,width:30,height:30,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#8a7f6f' }}><X size={14} /></button>
      <div style={{ width:56,height:56,borderRadius:16,background:'linear-gradient(135deg,#fff3e8,#ffe0c8)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20 }}><LogOut size={24} color="#d97706" /></div>
      <p style={{ fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:'#1e1a14',margin:'0 0 8px' }}>Keluar dari akun?</p>
      <p style={{ fontSize:14,color:'#8a7f6f',margin:'0 0 28px',lineHeight:1.6 }}>Kamu akan keluar dari sesi admin. Pastikan semua perubahan sudah tersimpan sebelum lanjut.</p>
      <div style={{ display:'flex',gap:10 }}>
        <button onClick={onCancel} style={{ flex:1,padding:'11px 0',borderRadius:12,border:'1.5px solid #ede9e0',background:'#fff',fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:500,color:'#5a5346',cursor:'pointer' }}>Batal</button>
        <button onClick={onConfirm} style={{ flex:1,padding:'11px 0',borderRadius:12,border:'none',background:'linear-gradient(135deg,#c0392b,#e74c3c)',fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,color:'#fff',cursor:'pointer' }}>Ya, Keluar</button>
      </div>
    </div>
    <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translate(-50%,-44%)}to{opacity:1;transform:translate(-50%,-50%)}}`}</style>
  </>
);

/* ══ SIDEBAR ══ */
const Sidebar = ({ onLogoutClick, userRole }) => {
  const location = useLocation();
  const NAV = getNav(userRole);
  return (
    <aside style={{ width:240,flexShrink:0,height:'100vh',position:'sticky',top:0,background:'#1a3d2b',display:'flex',flexDirection:'column',fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ padding:'28px 24px 24px',borderBottom:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',gap:14 }}>
        <div style={{ width:44,height:44,borderRadius:12,background:'linear-gradient(135deg,#2d5a3d,#4a9e6b)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0 }}>🍪</div>
        <div>
          <p style={{ fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:'#fff',margin:'0 0 2px' }}>Azmata</p>
          <p style={{ fontSize:12,color:'#4a9e6b',margin:0,fontWeight:500 }}>{userRole === 'super_admin' ? 'Super Admin' : 'Panel admin'}</p>
        </div>
      </div>
      <nav style={{ flex:1,padding:'20px 12px' }}>
        {NAV.map(({ label, icon: Icon, to }) => {
          const active = location.pathname === to || (to !== '/admin' && location.pathname.startsWith(to));
          return (
            <Link key={to} to={to} style={{ textDecoration:'none' }}>
              <div style={{ display:'flex',alignItems:'center',gap:12,padding:'11px 14px',borderRadius:12,marginBottom:4,background:active?'rgba(74,158,107,0.18)':'transparent',color:active?'#fff':'rgba(255,255,255,0.55)',fontSize:14,fontWeight:active?600:400,transition:'all 0.16s',cursor:'pointer',borderLeft:active?'3px solid #4a9e6b':'3px solid transparent' }}
                onMouseEnter={e=>{ if(!active){e.currentTarget.style.background='rgba(255,255,255,0.06)';e.currentTarget.style.color='rgba(255,255,255,0.8)';} }}
                onMouseLeave={e=>{ if(!active){e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(255,255,255,0.55)';} }}
              ><Icon size={17} />{label}</div>
            </Link>
          );
        })}
      </nav>
      <div style={{ padding:'16px 12px 24px',borderTop:'1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={onLogoutClick} style={{ display:'flex',alignItems:'center',gap:12,width:'100%',padding:'11px 14px',borderRadius:12,border:'none',background:'transparent',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",fontSize:14,color:'rgba(255,120,100,0.8)',transition:'all 0.16s',textAlign:'left' }}
          onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,80,60,0.12)';e.currentTarget.style.color='#ff8070'; }}
          onMouseLeave={e=>{ e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(255,120,100,0.8)'; }}
        ><LogOut size={17} />Keluar</button>
      </div>
    </aside>
  );
};

/* ══ VOUCHER FORM MODAL ══ */
const VoucherModal = ({ initial, onSave, onClose }) => {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    kode: '', tipe: 'persentase', nilai: '', min_belanja: '',
    kuota: '', expired_at: '', aktif: true, tampil_publik: false,
    max_diskon: '', jam_mulai: '', jam_selesai: '',
    hari_berlaku: '', kategori_produk: '', khusus_baru: false,
    ...initial,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.kode.trim())  return setErr('Kode voucher wajib diisi.');
    if (form.nilai === '')  return setErr('Nilai diskon wajib diisi.');
    if (form.tipe === 'persentase' && (Number(form.nilai) < 0 || Number(form.nilai) > 100))
      return setErr('Persentase harus antara 0–100.');
    if (form.jam_mulai && !form.jam_selesai) return setErr('Jam selesai wajib diisi jika jam mulai diisi.');
    if (form.jam_selesai && !form.jam_mulai) return setErr('Jam mulai wajib diisi jika jam selesai diisi.');
    setSaving(true); setErr('');
    try {
      if (isEdit) await api.put(`/vouchers/${initial.id}`, form);
      else        await api.post('/vouchers', form);
      onSave();
    } catch (e) {
      setErr(e?.response?.data?.message || 'Gagal menyimpan voucher.');
    } finally { setSaving(false); }
  };

  const inp = (style = {}) => ({
    width: '100%', padding: '8px 10px', borderRadius: 8,
    border: '1px solid #ede9e0', fontFamily: "'DM Sans',sans-serif",
    fontSize: 13, color: '#1e1a14', background: '#faf9f6',
    outline: 'none', boxSizing: 'border-box', ...style,
  });

  const HARI_OPTIONS = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
  const HARI_VALUES  = ['senin','selasa','rabu','kamis','jumat','sabtu','minggu'];
  const selectedHari = form.hari_berlaku
    ? form.hari_berlaku.split(',').map(h => h.trim().toLowerCase()).filter(Boolean)
    : [];
  const toggleHari = (h) => {
    const next = selectedHari.includes(h)
      ? selectedHari.filter(x => x !== h)
      : [...selectedHari, h];
    set('hari_berlaku', next.join(','));
  };

  const Divider = () => (
    <div style={{ height: 1, background: '#f0ece4', margin: '4px 0' }} />
  );

  const SectionLabel = ({ children, optional }) => (
    <p style={{
      fontSize: 11, fontWeight: 600, color: '#b5a99a',
      textTransform: 'uppercase', letterSpacing: '0.6px',
      margin: '0 0 12px',
    }}>
      {children}
      {optional && <span style={{ textTransform: 'none', fontWeight: 400, fontSize: 10, marginLeft: 6 }}>(opsional)</span>}
    </p>
  );

  const FieldLabel = ({ children, hint }) => (
    <div style={{ marginBottom: 5 }}>
      <p style={{ fontSize: 12, fontWeight: 500, color: '#8a7f6f', margin: 0 }}>{children}</p>
      {hint && <p style={{ fontSize: 11, color: '#c5bfb4', margin: '2px 0 0' }}>{hint}</p>}
    </div>
  );

  const TOGGLES = [
    { key: 'aktif',         label: 'Voucher aktif',             desc: 'Voucher bisa digunakan pengguna' },
    { key: 'tampil_publik', label: 'Tampil di halaman publik',  desc: 'Ditampilkan sebagai hint di checkout' },
    { key: 'khusus_baru',  label: 'Khusus pembeli pertama',    desc: 'Hanya untuk user yang belum pernah order' },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(30,26,20,0.45)', backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', zIndex: 51,
        transform: 'translate(-50%,-50%)',
        background: '#fff', borderRadius: 20,
        width: 500, maxWidth: '94vw',
        boxShadow: '0 24px 60px rgba(30,26,20,0.18)',
        fontFamily: "'DM Sans',sans-serif",
        display: 'flex', flexDirection: 'column',
        maxHeight: '92vh',
      }}>

        {/* ── Header ── */}
        <div style={{ padding: '20px 24px 18px', borderBottom: '1px solid #f0ece4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#edf5f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ticket size={18} color="#2d5a3d" />
            </div>
            <div>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 700, color: '#1e1a14', margin: 0 }}>
                {isEdit ? 'Edit Voucher' : 'Tambah Voucher'}
              </p>
              <p style={{ fontSize: 12, color: '#b5a99a', margin: '2px 0 0' }}>
                {isEdit ? `Kode: ${initial.kode}` : 'Buat kode diskon baru'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: '#f5f1eb', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a7f6f' }}>
            <X size={14} />
          </button>
        </div>

        {/* ── Body (scrollable) ── */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* INFO DASAR */}
          <div>
            <SectionLabel>Info Dasar</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* Kode */}
              <div>
                <FieldLabel>Kode Voucher</FieldLabel>
                <input
                  value={form.kode}
                  onChange={e => set('kode', e.target.value.toUpperCase())}
                  placeholder="contoh: LEBARAN20"
                  style={inp({ fontFamily: 'monospace', letterSpacing: '0.5px', fontSize: 13 })}
                />
              </div>

              {/* Tipe + Nilai */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <FieldLabel>Tipe Diskon</FieldLabel>
                  <select value={form.tipe} onChange={e => set('tipe', e.target.value)} style={inp()}>
                    <option value="persentase">Persentase (%)</option>
                    <option value="nominal">Nominal (Rp)</option>
                  </select>
                </div>
                <div>
                  <FieldLabel>{`Nilai ${form.tipe === 'persentase' ? '(%)' : '(Rp)'}`}</FieldLabel>
                  <input
                    type="number"
                    value={form.nilai}
                    onChange={e => set('nilai', e.target.value)}
                    placeholder={form.tipe === 'persentase' ? '10' : '20000'}
                    style={inp()}
                  />
                </div>
              </div>

              {/* Maks diskon + Min belanja */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <FieldLabel hint="Hanya untuk tipe persen">Maks. Potongan (Rp)</FieldLabel>
                  <input
                    type="number"
                    value={form.max_diskon}
                    onChange={e => set('max_diskon', e.target.value)}
                    placeholder="kosong = tanpa batas"
                    disabled={form.tipe === 'nominal'}
                    style={inp({ opacity: form.tipe === 'nominal' ? 0.45 : 1 })}
                  />
                </div>
                <div>
                  <FieldLabel>Min. Belanja (Rp)</FieldLabel>
                  <input
                    type="number"
                    value={form.min_belanja}
                    onChange={e => set('min_belanja', e.target.value)}
                    placeholder="0 = tanpa syarat"
                    style={inp()}
                  />
                </div>
              </div>

              {/* Kuota + Expired */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <FieldLabel>Kuota Pemakaian</FieldLabel>
                  <input
                    type="number"
                    value={form.kuota}
                    onChange={e => set('kuota', e.target.value)}
                    placeholder="kosong = tak terbatas"
                    style={inp()}
                  />
                </div>
                <div>
                  <FieldLabel>Kedaluwarsa</FieldLabel>
                  <input
                    type="date"
                    value={form.expired_at ? form.expired_at.slice(0, 10) : ''}
                    onChange={e => set('expired_at', e.target.value)}
                    style={inp()}
                  />
                </div>
              </div>
            </div>
          </div>

          <Divider />

          {/* BATASAN WAKTU */}
          <div>
            <SectionLabel optional>Batasan Waktu</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <FieldLabel hint="misal 20:00">Jam Mulai</FieldLabel>
                <input type="time" value={form.jam_mulai || ''} onChange={e => set('jam_mulai', e.target.value)} style={inp()} />
              </div>
              <div>
                <FieldLabel hint="misal 23:59">Jam Selesai</FieldLabel>
                <input type="time" value={form.jam_selesai || ''} onChange={e => set('jam_selesai', e.target.value)} style={inp()} />
              </div>
            </div>
            <FieldLabel hint="Kosong = berlaku semua hari">Hari Berlaku</FieldLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {HARI_OPTIONS.map((label, i) => {
                const val = HARI_VALUES[i];
                const on  = selectedHari.includes(val);
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => toggleHari(val)}
                    style={{
                      padding: '5px 13px', borderRadius: 20, cursor: 'pointer',
                      fontSize: 12, fontFamily: "'DM Sans',sans-serif",
                      border: `1.5px solid ${on ? '#2d5a3d' : '#ede9e0'}`,
                      background: on ? '#edf5f0' : '#fff',
                      color: on ? '#2d5a3d' : '#8a7f6f',
                      fontWeight: on ? 600 : 400,
                      transition: 'all 0.15s',
                    }}
                  >{label}</button>
                );
              })}
            </div>
          </div>

          <Divider />

          {/* BATASAN PRODUK */}
          <div>
            <SectionLabel optional>Batasan Produk</SectionLabel>
            <FieldLabel hint="Pisah dengan koma — kosong = semua produk">Kategori Produk</FieldLabel>
            <input
              value={form.kategori_produk || ''}
              onChange={e => set('kategori_produk', e.target.value)}
              placeholder="contoh: coklat, thumbprint, palm cheese"
              style={inp({ marginTop: 6 })}
            />
          </div>

          <Divider />

          {/* PENGATURAN (TOGGLES) */}
          <div>
            <SectionLabel>Pengaturan</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TOGGLES.map(({ key, label, desc }) => (
                <div
                  key={key}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', borderRadius: 10,
                    border: '1px solid #ede9e0',
                    background: form[key] ? '#f5faf7' : '#faf9f6',
                  }}
                >
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#1e1a14', margin: '0 0 2px' }}>{label}</p>
                    <p style={{ fontSize: 11, color: '#b5a99a', margin: 0 }}>{desc}</p>
                  </div>
                  <div
                    onClick={() => set(key, !form[key])}
                    style={{
                      width: 38, height: 22, borderRadius: 11, flexShrink: 0,
                      background: form[key] ? '#2d5a3d' : '#ded9d0',
                      cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 3,
                      left: form[key] ? 17 : 3,
                      width: 16, height: 16, borderRadius: '50%',
                      background: '#fff', transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ERROR */}
          {err && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#c0392b' }}>
              <AlertTriangle size={14} />{err}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f0ece4', display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #ede9e0', background: '#fff', fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, color: '#5a5346', cursor: 'pointer' }}
          >Batal</button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2d5a3d,#4a9e6b)', fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
          >{saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Voucher'}</button>
        </div>
      </div>
    </>
  );
};

/* ══ DELETE CONFIRM ══ */
const DeleteModal = ({ voucher, onConfirm, onCancel }) => (
  <>
    <div onClick={onCancel} style={{ position:'fixed',inset:0,zIndex:50,background:'rgba(30,26,20,0.45)',backdropFilter:'blur(4px)' }} />
    <div style={{ position:'fixed',top:'50%',left:'50%',zIndex:51,transform:'translate(-50%,-50%)',background:'#fff',borderRadius:20,padding:'36px 32px 28px',width:360,boxShadow:'0 24px 60px rgba(30,26,20,0.18)',fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ width:56,height:56,borderRadius:16,background:'linear-gradient(135deg,#fef2f2,#fee2e2)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20 }}><Trash2 size={24} color="#c0392b" /></div>
      <p style={{ fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:'#1e1a14',margin:'0 0 8px' }}>Hapus voucher ini?</p>
      <p style={{ fontSize:14,color:'#8a7f6f',margin:'0 0 6px',lineHeight:1.6 }}>Voucher <strong style={{ color:'#1e1a14' }}>{voucher?.kode}</strong> akan dihapus permanen dan tidak bisa digunakan lagi.</p>
      <div style={{ display:'flex',gap:10,marginTop:24 }}>
        <button onClick={onCancel} style={{ flex:1,padding:'11px 0',borderRadius:12,border:'1.5px solid #ede9e0',background:'#fff',fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:500,color:'#5a5346',cursor:'pointer' }}>Batal</button>
        <button onClick={onConfirm} style={{ flex:1,padding:'11px 0',borderRadius:12,border:'none',background:'linear-gradient(135deg,#c0392b,#e74c3c)',fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,color:'#fff',cursor:'pointer' }}>Ya, Hapus</button>
      </div>
    </div>
  </>
);

/* ══ MAIN PAGE ══ */
const AdminVoucher = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === 'super_admin';

  const [vouchers, setVouchers]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [showLogout, setShowLogout] = useState(false);
  const [modal, setModal]           = useState(null);
  const [selected, setSelected]     = useState(null);

  const fetchVouchers = () => {
    setLoading(true);
    api.get('/vouchers')
      .then(r => setVouchers(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVouchers(); }, []);

  const handleLogout = () => { logout?.(); navigate('/login'); };
  const handleSaved  = () => { setModal(null); setSelected(null); fetchVouchers(); };
  const handleDelete = async () => {
    await api.delete(`/vouchers/${selected.id}`).catch(() => {});
    setModal(null); setSelected(null); fetchVouchers();
  };

  const filtered = vouchers.filter(v =>
    v.kode?.toLowerCase().includes(search.toLowerCase())
  );

  /* badge helpers */
  const statusBadge = (v) => {
    if (!v.aktif)                return { label:'Nonaktif',    style:{ background:'#f3f4f6',color:'#6b7280' } };
    if (isExpired(v.expired_at)) return { label:'Kedaluwarsa', style:{ background:'#fef2f2',color:'#c0392b' } };
    if (v.kuota !== null && v.sisa_kuota !== undefined && v.sisa_kuota <= 0)
                                 return { label:'Habis',       style:{ background:'#fff8ee',color:'#d97706' } };
    return                              { label:'Aktif',       style:{ background:'#edf5f0',color:'#2d5a3d' } };
  };

  /* badge tipe khusus */
  const tipeBadge = (v) => {
    const badges = [];
    if (v.hari_berlaku)    badges.push({ icon:<Clock size={10}/>,   label: v.hari_berlaku.split(',').map(h=>h.charAt(0).toUpperCase()+h.slice(1)).join(', ') });
    if (v.jam_mulai)       badges.push({ icon:<Clock size={10}/>,   label: `${v.jam_mulai?.slice(0,5)}–${v.jam_selesai?.slice(0,5)}` });
    if (v.kategori_produk) badges.push({ icon:<ShoppingBag size={10}/>, label: v.kategori_produk });
    if (v.khusus_baru)     badges.push({ icon:<Tag size={10}/>,     label: 'Pembeli baru' });
    return badges;
  };

  /* stat cards */
  const totalVoucher  = vouchers.length;
  const aktifCount    = vouchers.filter(v => v.aktif && !isExpired(v.expired_at)).length;
  const nonaktifCount = vouchers.filter(v => !v.aktif || isExpired(v.expired_at)).length;
  const publikCount   = vouchers.filter(v => v.tampil_publik && v.aktif).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box}body{margin:0}
        .v-row{transition:background 0.14s}
        .v-row:hover{background:#faf9f6!important}
        .v-card{transition:transform 0.2s,box-shadow 0.2s}
        .v-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(45,90,61,0.1)}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translate(-50%,-44%)}to{opacity:1;transform:translate(-50%,-50%)}}
      `}</style>

      <div style={{ display:'flex',minHeight:'100vh',background:'#faf9f6',fontFamily:"'DM Sans',sans-serif" }}>
        <Sidebar onLogoutClick={() => setShowLogout(true)} userRole={user?.role} />

        <div style={{ flex:1,display:'flex',flexDirection:'column',minWidth:0 }}>
          {/* HEADER */}
          <header style={{ padding:'20px 32px',borderBottom:'1px solid #ede9e0',background:'#fff',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10 }}>
            <div>
              <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:'#1e1a14',margin:0 }}>Voucher</h1>
              <p style={{ fontSize:12,color:'#b5a99a',margin:'2px 0 0' }}>
                {isSuperAdmin ? 'Kelola kode diskon untuk pelanggan' : 'Lihat daftar voucher yang aktif'}
              </p>
            </div>
            {/* Tombol tambah hanya untuk super_admin */}
            {isSuperAdmin && (
              <button onClick={() => setModal('add')} style={{ display:'flex',alignItems:'center',gap:8,padding:'10px 18px',borderRadius:12,border:'none',background:'linear-gradient(135deg,#2d5a3d,#4a9e6b)',color:'#fff',fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,cursor:'pointer' }}>
                <Plus size={15} />Tambah Voucher
              </button>
            )}
          </header>

          <main style={{ flex:1,padding:'28px 32px',overflowY:'auto' }}>
            {/* STAT CARDS */}
            <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24 }}>
              {[
                { label:'Total Voucher',    value:totalVoucher,  icon:Ticket,      accent:'#2d5a3d', bg:'#edf5f0' },
                { label:'Aktif',            value:aktifCount,    icon:CheckCircle, accent:'#2d5a3d', bg:'#edf5f0' },
                { label:'Nonaktif/Expired', value:nonaktifCount, icon:XCircle,     accent:'#c0392b', bg:'#fef2f2' },
                { label:'Tampil Publik',    value:publikCount,   icon:Tag,         accent:'#3b6cb7', bg:'#eef2fb' },
              ].map(({ label, value, icon: Icon, accent, bg }) => (
                <div key={label} className="v-card" style={{ background:'#fff',borderRadius:18,padding:'22px 20px',border:'1px solid #ede9e0' }}>
                  <div style={{ width:38,height:38,borderRadius:12,background:bg,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14 }}>
                    <Icon size={17} color={accent} />
                  </div>
                  <p style={{ fontSize:11,color:'#b5a99a',margin:'0 0 4px' }}>{label}</p>
                  <p style={{ fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:700,color:'#1e1a14',margin:0 }}>{value}</p>
                </div>
              ))}
            </div>

            {/* TABLE CARD */}
            <div style={{ background:'#fff',borderRadius:18,border:'1px solid #ede9e0',overflow:'hidden' }}>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 22px',borderBottom:'1px solid #f5f1eb',gap:12 }}>
                <span style={{ fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:600,color:'#1e1a14' }}>Daftar Voucher</span>
                <div style={{ position:'relative',maxWidth:280,width:'100%' }}>
                  <Search size={14} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#b5a99a' }} />
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari kode voucher..." style={{ width:'100%',padding:'8px 12px 8px 34px',borderRadius:10,border:'1.5px solid #ede9e0',fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'#1e1a14',background:'#faf9f6',outline:'none',boxSizing:'border-box' }} />
                </div>
              </div>

              {loading ? (
                <div style={{ display:'flex',justifyContent:'center',padding:60 }}>
                  <div style={{ width:28,height:28,borderRadius:'50%',border:'2.5px solid #2d5a3d',borderTopColor:'transparent',animation:'spin 0.7s linear infinite' }} />
                </div>
              ) : (
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%',borderCollapse:'collapse',fontFamily:"'DM Sans',sans-serif" }}>
                    <thead>
                      <tr style={{ borderBottom:'1px solid #f5f1eb' }}>
                        {['Kode','Tipe','Nilai','Min. Belanja','Kuota','Kedaluwarsa','Status','Publik', ...(isSuperAdmin ? ['Aksi'] : [])].map(h => (
                          <th key={h} style={{ textAlign:'left',padding:'10px 18px',fontSize:11,color:'#b5a99a',fontWeight:600,letterSpacing:'0.6px',textTransform:'uppercase',whiteSpace:'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length > 0 ? filtered.map(v => {
                        const badge  = statusBadge(v);
                        const extras = tipeBadge(v);
                        return (
                          <tr key={v.id} className="v-row" style={{ borderBottom:'1px solid #f9f7f4' }}>
                            {/* Kode */}
                            <td style={{ padding:'13px 18px' }}>
                              <div>
                                <span style={{ fontFamily:'monospace',fontSize:13,fontWeight:700,color:'#2d5a3d',background:'#edf5f0',padding:'3px 10px',borderRadius:6 }}>{v.kode}</span>
                                {/* badge khusus kecil */}
                                {extras.length > 0 && (
                                  <div style={{ display:'flex',flexWrap:'wrap',gap:4,marginTop:5 }}>
                                    {extras.map((ex, i) => (
                                      <span key={i} style={{ display:'flex',alignItems:'center',gap:3,fontSize:10,color:'#8a7f6f',background:'#f5f1eb',padding:'2px 7px',borderRadius:10 }}>
                                        {ex.icon}{ex.label}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                            {/* Tipe */}
                            <td style={{ padding:'13px 18px',fontSize:12,color:'#5a5346' }}>
                              <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                                {v.tipe === 'persentase' ? <Percent size={13} color="#8a7f6f" /> : <Hash size={13} color="#8a7f6f" />}
                                {v.tipe === 'persentase' ? 'Persen' : 'Nominal'}
                              </div>
                            </td>
                            {/* Nilai */}
                            <td style={{ padding:'13px 18px',fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:'#1e1a14' }}>
                              <div>
                                {v.tipe === 'persentase' ? `${v.nilai}%` : formatRp(v.nilai)}
                                {v.max_diskon && (
                                  <p style={{ fontSize:10,color:'#b5a99a',margin:'2px 0 0' }}>maks {formatRp(v.max_diskon)}</p>
                                )}
                              </div>
                            </td>
                            {/* Min belanja */}
                            <td style={{ padding:'13px 18px',fontSize:13,color:'#8a7f6f' }}>
                              {v.min_belanja > 0 ? formatRp(v.min_belanja) : <span style={{ color:'#c5bfb4' }}>—</span>}
                            </td>
                            {/* Kuota */}
                            <td style={{ padding:'13px 18px',fontSize:13,color:'#8a7f6f' }}>
                              {v.kuota ? `${v.sisa_kuota ?? v.kuota} / ${v.kuota}` : <span style={{ color:'#c5bfb4' }}>∞</span>}
                            </td>
                            {/* Expired */}
                            <td style={{ padding:'13px 18px',fontSize:12,color: isExpired(v.expired_at)?'#c0392b':'#8a7f6f' }}>
                              <div style={{ display:'flex',alignItems:'center',gap:5 }}>
                                <Calendar size={12} />{fmtDate(v.expired_at)}
                              </div>
                            </td>
                            {/* Status */}
                            <td style={{ padding:'13px 18px' }}>
                              <span style={{ fontSize:11,fontWeight:600,padding:'4px 11px',borderRadius:20,...badge.style }}>{badge.label}</span>
                            </td>
                            {/* Publik */}
                            <td style={{ padding:'13px 18px',textAlign:'center' }}>
                              {v.tampil_publik
                                ? <CheckCircle size={16} color="#2d5a3d" />
                                : <XCircle size={16} color="#ded9d0" />}
                            </td>
                            {/* Aksi — hanya super_admin */}
                            {isSuperAdmin && (
                              <td style={{ padding:'13px 18px' }}>
                                <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                                  <button onClick={()=>{ setSelected(v); setModal('edit'); }} style={{ display:'flex',alignItems:'center',gap:5,padding:'6px 11px',borderRadius:8,border:'1.5px solid #ede9e0',background:'#fff',fontSize:12,color:'#2d5a3d',fontWeight:500,cursor:'pointer',fontFamily:"'DM Sans',sans-serif" }}>
                                    <Edit2 size={12} />Edit
                                  </button>
                                  <button onClick={()=>{ setSelected(v); setModal('delete'); }} style={{ display:'flex',alignItems:'center',gap:5,padding:'6px 11px',borderRadius:8,border:'1.5px solid #fecaca',background:'#fef2f2',fontSize:12,color:'#c0392b',fontWeight:500,cursor:'pointer',fontFamily:"'DM Sans',sans-serif" }}>
                                    <Trash2 size={12} />Hapus
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      }) : (
                        <tr><td colSpan={isSuperAdmin ? 9 : 8} style={{ padding:48,textAlign:'center',fontSize:13,color:'#b5a99a' }}>
                          {search ? `Tidak ada voucher dengan kode "${search}"` : 'Belum ada voucher.'}
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* INFO BOX */}
            <div style={{ marginTop:20,padding:'18px 22px',borderRadius:16,border:'1.5px solid #c8e8d4',background:'#f0f7f3',display:'flex',gap:14,alignItems:'flex-start' }}>
              <div style={{ width:36,height:36,borderRadius:10,background:'#2d5a3d',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><Ticket size={17} color="#fff" /></div>
              <div>
                <p style={{ fontSize:13,fontWeight:600,color:'#1e1a14',margin:'0 0 4px' }}>Cara kerja voucher</p>
                <p style={{ fontSize:12,color:'#5a5346',margin:0,lineHeight:1.7 }}>
                  Voucher <strong>Tampil Publik ✓</strong> muncul sebagai hint di checkout.{' '}
                  Voucher <strong>tidak publik</strong> hanya bisa dipakai jika pelanggan tahu kodenya.{' '}
                  Batasan <strong>jam, hari, & kategori produk</strong> dicek otomatis saat validasi.{' '}
                  {isSuperAdmin
                    ? 'Kamu bisa tambah, edit, dan hapus voucher.'
                    : 'Hanya super admin yang bisa menambah atau mengubah voucher.'}
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>

      {showLogout && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}
      {modal === 'add'    && <VoucherModal initial={null}     onSave={handleSaved} onClose={()=>setModal(null)} />}
      {modal === 'edit'   && <VoucherModal initial={selected} onSave={handleSaved} onClose={()=>setModal(null)} />}
      {modal === 'delete' && <DeleteModal  voucher={selected} onConfirm={handleDelete} onCancel={()=>setModal(null)} />}
    </>
  );
};

export default AdminVoucher;