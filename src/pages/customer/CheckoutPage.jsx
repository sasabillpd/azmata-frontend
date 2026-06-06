import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Minus, ArrowLeft, ArrowRight, CheckCircle2, MapPin, Check, ChevronDown, X, Ticket, Tag } from 'lucide-react';
import api from '../../utils/axios';
import { useAuth, cartKey } from '../../context/AuthContext';

const WILAYAH_BASE = 'https://www.emsifa.com/api-wilayah-indonesia/api';
const STEPS = ['Keranjang', 'Alamat', 'Konfirmasi'];
const PROVINSI_JAWA = ['jawa barat', 'jawa tengah', 'di yogyakarta', 'dki jakarta', 'banten'];

const emptyForm = {
  nama: '', telepon: '', detail: '',
  provinsi_id: '', provinsi_name: '',
  kota_id: '', kota_name: '',
  kecamatan_id: '', kecamatan_name: '',
  kelurahan_id: '', kelurahan_name: '',
  kode_pos: '', catatan: '',
};

/* ─────────────── Hitung ongkir ─────────────── */
const hitungOngkir = (addr) => {
  if (!addr) return 0;
  const p = (addr.provinsi_name || '').toLowerCase();
  const k = (addr.kota_name || addr.kota || '').toLowerCase();
  if (p.includes('jawa timur')) {
    if (k.includes('pasuruan')) return 0;
    return 10000;
  }
  if (PROVINSI_JAWA.some(j => p.includes(j))) return 15000;
  return 35000;
};

const DropdownWilayah = ({ id, value, placeholder, options, onSelect, disabled, openId, setOpenId }) => {
  const isOpen = openId === id;
  return (
    <div style={{ position: 'relative' }}>
      <button type="button" disabled={disabled} onClick={() => setOpenId(isOpen ? null : id)} style={{
        width: '100%', height: 40, padding: '0 12px', borderRadius: 10,
        border: `1.5px solid ${isOpen ? '#2d5a3d' : '#e0ddd6'}`,
        background: disabled ? '#faf9f6' : '#fff', fontSize: 13, textAlign: 'left',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        fontFamily: "'DM Sans',sans-serif", color: value ? '#1e1a14' : '#b5a99a',
        transition: 'border-color 0.15s',
      }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || placeholder}</span>
        <ChevronDown size={13} style={{ color: '#9a9080', flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>
      {isOpen && (
        <div style={{
          position: 'absolute', top: 44, left: 0, right: 0, zIndex: 50,
          background: '#fff', border: '1px solid #e0ddd6', borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', maxHeight: 200, overflowY: 'auto',
        }}>
          {options.length === 0
            ? <div style={{ padding: '12px 16px', fontSize: 12, color: '#9a9080', display: 'flex', gap: 8, alignItems: 'center', fontFamily: "'DM Sans',sans-serif" }}>
                <div style={{ width: 12, height: 12, border: '2px solid #2d5a3d', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Memuat...
              </div>
            : options.map(opt => (
              <button key={opt.id} type="button" onClick={() => { onSelect(opt); setOpenId(null); }} style={{
                width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13,
                background: value === opt.name ? '#f0f7f2' : 'transparent',
                color: value === opt.name ? '#2d5a3d' : '#3a3530',
                fontWeight: value === opt.name ? 500 : 400, border: 'none', cursor: 'pointer',
                fontFamily: "'DM Sans',sans-serif", transition: 'background 0.1s',
              }}>
                {opt.name}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

const ModalAlamatBaru = ({ onClose, onSaved }) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [provinsi, setProvinsi] = useState([]);
  const [kota, setKota] = useState([]);
  const [kecamatan, setKecamatan] = useState([]);
  const [kelurahan, setKelurahan] = useState([]);

  useEffect(() => {
    fetch(`${WILAYAH_BASE}/provinces.json`).then(r => r.json()).then(setProvinsi).catch(() => {});
  }, []);

  const handleProvinsi = (item) => {
    setForm(f => ({ ...f, provinsi_id: item.id, provinsi_name: item.name, kota_id: '', kota_name: '', kecamatan_id: '', kecamatan_name: '', kelurahan_id: '', kelurahan_name: '' }));
    setKota([]); setKecamatan([]); setKelurahan([]);
    fetch(`${WILAYAH_BASE}/regencies/${item.id}.json`).then(r => r.json()).then(setKota).catch(() => {});
  };
  const handleKota = (item) => {
    setForm(f => ({ ...f, kota_id: item.id, kota_name: item.name, kecamatan_id: '', kecamatan_name: '', kelurahan_id: '', kelurahan_name: '' }));
    setKecamatan([]); setKelurahan([]);
    fetch(`${WILAYAH_BASE}/districts/${item.id}.json`).then(r => r.json()).then(setKecamatan).catch(() => {});
  };
  const handleKecamatan = (item) => {
    setForm(f => ({ ...f, kecamatan_id: item.id, kecamatan_name: item.name, kelurahan_id: '', kelurahan_name: '' }));
    setKelurahan([]);
    fetch(`${WILAYAH_BASE}/villages/${item.id}.json`).then(r => r.json()).then(setKelurahan).catch(() => {});
  };
  const handleKelurahan = (item) => setForm(f => ({ ...f, kelurahan_id: item.id, kelurahan_name: item.name }));

  const handleSave = async () => {
    if (!form.nama || !form.telepon || !form.detail || !form.provinsi_id || !form.kota_id || !form.kecamatan_id || !form.kelurahan_id) {
      toast.error('Lengkapi semua field yang wajib diisi'); return;
    }
    setSaving(true);
    try {
      const res = await api.post('/addresses', {
        nama: form.nama, telepon: form.telepon, alamat: form.detail,
        kelurahan_name: form.kelurahan_name, kecamatan_name: form.kecamatan_name,
        kota_name: form.kota_name, provinsi_name: form.provinsi_name,
        kode_pos: form.kode_pos, catatan: form.catatan,
      });
      toast.success('Alamat berhasil disimpan!');
      onSaved(res.data);
    } catch { toast.error('Gagal menyimpan alamat'); }
    finally { setSaving(false); }
  };

  const inputStyle = {
    width: '100%', height: 40, padding: '0 12px', borderRadius: 10,
    border: '1.5px solid #e0ddd6', fontSize: 13, fontFamily: "'DM Sans',sans-serif",
    outline: 'none', color: '#1e1a14', background: '#fff', boxSizing: 'border-box',
  };
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 500, color: '#6b6357', marginBottom: 6, fontFamily: "'DM Sans',sans-serif" };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, boxShadow: '0 32px 80px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto', fontFamily: "'DM Sans',sans-serif" }} onClick={e => e.stopPropagation()}>
        <div style={{ position: 'sticky', top: 0, background: '#fff', padding: '18px 24px', borderBottom: '1px solid #f0ece4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 600, color: '#1e1a14' }}>Tambah alamat baru</span>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f5f2ec', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b6357' }}><X size={14} /></button>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }} onClick={() => setOpenId(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={labelStyle}>Nama penerima *</label><input style={inputStyle} value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))} placeholder="Nama lengkap" /></div>
            <div><label style={labelStyle}>Telepon *</label><input style={inputStyle} value={form.telepon} onChange={e => setForm(f => ({ ...f, telepon: e.target.value }))} placeholder="08xxxxxxxxxx" /></div>
          </div>
          <div><label style={labelStyle}>Alamat lengkap *</label><textarea style={{ ...inputStyle, height: 72, padding: '10px 12px', resize: 'none' }} value={form.detail} onChange={e => setForm(f => ({ ...f, detail: e.target.value }))} placeholder="Nama jalan, nomor rumah, RT/RW..." /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} onClick={e => e.stopPropagation()}>
            <div><label style={labelStyle}>Provinsi *</label><DropdownWilayah id="prov" value={form.provinsi_name} placeholder="Pilih provinsi..." options={provinsi} onSelect={handleProvinsi} openId={openId} setOpenId={setOpenId} /></div>
            <div><label style={labelStyle}>Kota / Kabupaten *</label><DropdownWilayah id="kota" value={form.kota_name} placeholder="Pilih kota..." options={kota} onSelect={handleKota} disabled={!form.provinsi_id} openId={openId} setOpenId={setOpenId} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} onClick={e => e.stopPropagation()}>
            <div><label style={labelStyle}>Kecamatan *</label><DropdownWilayah id="kec" value={form.kecamatan_name} placeholder="Pilih kecamatan..." options={kecamatan} onSelect={handleKecamatan} disabled={!form.kota_id} openId={openId} setOpenId={setOpenId} /></div>
            <div><label style={labelStyle}>Kelurahan *</label><DropdownWilayah id="kel" value={form.kelurahan_name} placeholder="Pilih kelurahan..." options={kelurahan} onSelect={handleKelurahan} disabled={!form.kecamatan_id} openId={openId} setOpenId={setOpenId} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={labelStyle}>Kode pos</label><input style={inputStyle} value={form.kode_pos} onChange={e => setForm(f => ({ ...f, kode_pos: e.target.value }))} placeholder="12345" /></div>
          </div>
          <div><label style={labelStyle}>Catatan (opsional)</label><textarea style={{ ...inputStyle, height: 64, padding: '10px 12px', resize: 'none' }} value={form.catatan} onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))} placeholder="Contoh: mohon dikemas rapi..." /></div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, height: 42, borderRadius: 10, border: '1.5px solid #e0ddd6', background: '#fff', fontSize: 13, color: '#6b6357', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Batal</button>
            <button onClick={handleSave} disabled={saving} style={{ flex: 1, height: 42, borderRadius: 10, border: 'none', background: '#2d5a3d', color: '#fff', fontSize: 13, fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {saving ? <div style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : 'Simpan alamat'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const KEY = cartKey(user?.id);

  const fromBuyNow = location.state?.fromBuyNow ?? false;
  const fromDrawer = location.state?.fromDrawer ?? false;

  const [step, setStep]                       = useState(1);
  const [loading, setLoading]                 = useState(false);
  const [agreed, setAgreed]                   = useState(false);
  const [showModalAlamat, setShowModalAlamat] = useState(false);
  const [addresses, setAddresses]             = useState([]);
  const [loadingAddr, setLoadingAddr]         = useState(true);
  const [selectedAddrId, setSelectedAddrId]   = useState(null);

  // ── Voucher state ──
  const [voucherCode, setVoucherCode]             = useState('');
  const [voucherApplied, setVoucherApplied]       = useState(null);
  const [applyingVoucher, setApplyingVoucher]     = useState(false);
  const [publicVouchers, setPublicVouchers]       = useState([]);
  const [loadingPubVoucher, setLoadingPubVoucher] = useState(true);

  const [cart, setCart] = useState(() => {
    if (fromDrawer || fromBuyNow) return location.state?.items ?? [];
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  });

  useEffect(() => {
    setLoadingAddr(true);
    api.get('/addresses').then(res => {
      const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setAddresses(list);
      const primary = list.find(a => a.is_primary) || list[0];
      if (primary) setSelectedAddrId(primary.id);
    }).catch(() => {}).finally(() => setLoadingAddr(false));
  }, []);

  useEffect(() => {
    setLoadingPubVoucher(true);
    api.get('/vouchers')
      .then(res => setPublicVouchers(res.data || []))
      .catch(() => {})
      .finally(() => setLoadingPubVoucher(false));
  }, []);

  /* ─── Derived values ─── */
  const selectedAddr = addresses.find(a => a.id === selectedAddrId);

  // Ongkir reaktif: re-kalkulasi setiap kali selectedAddr berubah
  const ONGKIR = useMemo(() => hitungOngkir(selectedAddr), [selectedAddr]);

  const subtotal   = cart.reduce((acc, i) => acc + Number(i.price) * i.qty, 0);
  const discount   = voucherApplied?.diskon || 0;
  const total      = subtotal + ONGKIR - discount;
  const totalItems = cart.reduce((acc, i) => acc + i.qty, 0);

  const formatRp  = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  const getImage  = (item) => { const f = [item.image_1, item.image_2, item.image_3, item.image_4].find(f => f); return f ? f : null; };
  const formatAlamat = (addr) => {
    if (!addr) return '';
    return [addr.alamat, addr.kelurahan_name, addr.kecamatan_name, addr.kota_name || addr.kota, addr.provinsi_name, addr.kode_pos].filter(Boolean).join(', ');
  };

  // Label info ongkir untuk ditampilkan ke user
  const ongkirLabel = useMemo(() => {
    if (!selectedAddr) return null;
    const p = (selectedAddr.provinsi_name || '').toLowerCase();
    const k = (selectedAddr.kota_name || selectedAddr.kota || '').toLowerCase();
    if (p.includes('jawa timur') && k.includes('pasuruan')) return 'Pasuruan – Gratis ongkir 🎉';
    if (p.includes('jawa timur')) return 'Jawa Timur';
    if (PROVINSI_JAWA.some(j => p.includes(j))) return 'Jawa & sekitarnya';
    return 'Luar Jawa';
  }, [selectedAddr]);

  /* ─── Apply voucher ─── */
  const applyVoucher = async (kodeOverride) => {
    const kode = (kodeOverride || voucherCode).trim();
    if (!kode) { toast.error('Masukkan kode voucher dulu'); return; }
    setApplyingVoucher(true);
    try {
      const { data } = await api.post('/vouchers/validate', { kode, total_belanja: subtotal });
      setVoucherApplied(data);
      setVoucherCode(data.kode);
      toast.success(data.message);
    } catch (err) {
      setVoucherApplied(null);
      toast.error(err.response?.data?.message || 'Kode voucher tidak valid');
    } finally { setApplyingVoucher(false); }
  };

  const removeVoucher = () => { setVoucherApplied(null); setVoucherCode(''); toast('Voucher dihapus'); };

  const handleAlamatSaved = (newAddr) => { setAddresses(prev => [...prev, newAddr]); setSelectedAddrId(newAddr.id); setShowModalAlamat(false); };
  const updateQty  = (id, dir) => { const updated = cart.map(i => i.id === id ? { ...i, qty: i.qty + dir } : i).filter(i => i.qty > 0); setCart(updated); if (!fromBuyNow && !fromDrawer) localStorage.setItem(KEY, JSON.stringify(updated)); };
  const removeItem = (id) => { const updated = cart.filter(i => i.id !== id); setCart(updated); if (!fromBuyNow && !fromDrawer) localStorage.setItem(KEY, JSON.stringify(updated)); toast.success('Item dihapus'); };

  const handleNext = () => {
    if (step === 1) { if (cart.length === 0) { toast.error('Keranjang kosong'); return; } setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (step === 2) { if (!selectedAddrId) { toast.error('Pilih alamat pengiriman'); return; } setStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };

  const handleSubmit = async () => {
    if (!agreed) { toast.error('Centang persetujuan dulu ya'); return; }
    if (!selectedAddrId) { toast.error('Pilih alamat pengiriman'); return; }
    setLoading(true);
    try {
      const addr = selectedAddr;
      const { data } = await api.post('/orders', {
        items: cart.map(i => ({ product_id: i.id, quantity: i.qty })),
        shipping_name:    addr.nama,
        shipping_phone:   addr.telepon,
        shipping_address: formatAlamat(addr),
        shipping_city:    addr.kota_name || addr.kota,
        shipping_zip:     addr.kode_pos || '',
        note:             addr.catatan || '',
        shipping_cost:    ONGKIR,                         // ← ongkir sesuai alamat
        voucher_code:     voucherApplied?.kode || null,   // ← kode voucher
      });
      if (fromDrawer) {
        const checkedIds = new Set(cart.map(i => i.id));
        const remaining = JSON.parse(localStorage.getItem(KEY) || '[]').filter(i => !checkedIds.has(i.id));
        localStorage.setItem(KEY, JSON.stringify(remaining));
      } else if (!fromBuyNow) { localStorage.removeItem(KEY); }
      toast.success('Pesanan berhasil dibuat!');
      navigate(`/pembayaran/${data.order_id}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal membuat pesanan'); }
    finally { setLoading(false); }
  };

  const cardStyle      = { background: '#fff', borderRadius: 20, border: '1px solid #ede9e0', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' };
  const cardHeader     = { background: '#2d5a3d', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' };
  const cardHeaderText = { fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 600, color: '#fff', margin: 0 };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .checkout-root * { box-sizing: border-box; }
        .addr-card { border-radius: 14px; border: 1.5px solid #e0ddd6; padding: 14px 16px; cursor: pointer; transition: all 0.15s; }
        .addr-card:hover { border-color: #4a9e6b; background: #f5fbf7; }
        .addr-card.selected { border-color: #2d5a3d; background: #f0f9f4; }
        .step-btn { display: flex; align-items: center; justify-content: center; gap: 8px; height: 44px; padding: 0 24px; border-radius: 12px; border: none; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.18s; }
        .voucher-hint { border-radius: 10px; border: 1.5px dashed #c5dfc9; padding: 10px 12px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: space-between; }
        .voucher-hint:hover { border-color: #2d5a3d; background: #f5fbf7; }
      `}</style>

      <div className="checkout-root" style={{ minHeight: '100vh', background: '#faf9f6', fontFamily: "'DM Sans',sans-serif" }}>

        {/* Navbar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #f0ece4', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: '#1e1a14', textDecoration: 'none' }}>
            Azmata <em style={{ color: '#2d5a3d' }}>Cookies</em>
          </Link>
          <Link to="/katalog" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b6357', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Lanjut belanja
          </Link>
        </div>

        <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>

          {/* Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", background: i + 1 < step ? '#2d5a3d' : i + 1 === step ? '#2d5a3d' : '#f0ece4', color: i + 1 <= step ? '#fff' : '#9a9080', boxShadow: i + 1 === step ? '0 0 0 3px rgba(45,90,61,0.15)' : 'none' }}>
                    {i + 1 < step ? <Check size={13} strokeWidth={3} /> : i + 1}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: i + 1 === step ? 600 : 400, color: i + 1 === step ? '#1e1a14' : '#9a9080', fontFamily: "'DM Sans',sans-serif" }}>{s}</span>
                </div>
                {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: i + 1 < step ? '#2d5a3d' : '#e0ddd6', margin: '0 16px' }} />}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

            {/* ── Main content ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* STEP 1: Keranjang */}
              {step === 1 && (
                <div style={cardStyle}>
                  <div style={cardHeader}>
                    <p style={cardHeaderText}>Item pesanan</p>
                    {!fromBuyNow && !fromDrawer && cart.length > 0 && (
                      <button onClick={() => { setCart([]); localStorage.setItem(KEY, '[]'); toast.success('Keranjang dikosongkan'); }} style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Hapus semua</button>
                    )}
                  </div>
                  <div>
                    {cart.length === 0 ? (
                      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
                        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: '#3a3530' }}>Keranjang kosong</p>
                        <Link to="/katalog" style={{ fontSize: 13, color: '#2d5a3d', fontFamily: "'DM Sans',sans-serif" }}>Belanja sekarang</Link>
                      </div>
                    ) : cart.map((item, idx) => {
                      const imgSrc = getImage(item);
                      return (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 24px', borderBottom: idx < cart.length - 1 ? '1px solid #f5f2ec' : 'none' }}>
                          <div style={{ width: 72, height: 72, borderRadius: 14, overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg,#f0ece4,#e8e2d8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {imgSrc ? <img src={imgSrc} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} /> : <span style={{ fontSize: 28 }}>🍪</span>}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 600, color: '#1e1a14', margin: '0 0 4px' }}>{item.name}</p>
                            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: '#9a9080', margin: '0 0 10px' }}>per toples {item.weight || 350}gr</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <button onClick={() => updateQty(item.id, 1)} style={{ width: 28, height: 28, borderRadius: 8, border: '1.5px solid #d5e8dc', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2d5a3d' }}><Plus size={12} /></button>
                              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 500, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                              <button onClick={() => updateQty(item.id, -1)} style={{ width: 28, height: 28, borderRadius: 8, border: '1.5px solid #d5e8dc', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2d5a3d' }}><Minus size={12} /></button>
                              {!fromBuyNow && !fromDrawer && (
                                <button onClick={() => removeItem(item.id)} style={{ fontSize: 12, color: '#e57373', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4, fontFamily: "'DM Sans',sans-serif" }}>hapus</button>
                              )}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: '#2d5a3d', margin: 0 }}>{formatRp(Number(item.price) * item.qty)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: Alamat */}
              {step === 2 && (
                <div style={cardStyle}>
                  <div style={cardHeader}><p style={cardHeaderText}>Alamat pengiriman</p></div>
                  <div style={{ padding: 24 }}>
                    {loadingAddr ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[...Array(2)].map((_, i) => <div key={i} style={{ height: 80, borderRadius: 14, background: 'linear-gradient(90deg,#f0ece4 25%,#e8e2d8 50%,#f0ece4 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />)}
                      </div>
                    ) : addresses.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <MapPin size={28} style={{ color: '#c5bfb5', margin: '0 auto 12px' }} />
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: '#9a9080', marginBottom: 12 }}>Belum ada alamat tersimpan</p>
                        <button onClick={() => setShowModalAlamat(true)} style={{ fontSize: 13, color: '#2d5a3d', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>+ Tambah alamat sekarang</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {addresses.map(addr => {
                          const ongkirAddr = hitungOngkir(addr);
                          return (
                            <div key={addr.id} className={`addr-card ${addr.id === selectedAddrId ? 'selected' : ''}`} onClick={() => setSelectedAddrId(addr.id)}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${addr.id === selectedAddrId ? '#2d5a3d' : '#d5cfc4'}`, background: addr.id === selectedAddrId ? '#2d5a3d' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, transition: 'all 0.15s' }}>
                                  {addr.id === selectedAddrId && <Check size={10} style={{ color: '#fff' }} strokeWidth={3} />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  {addr.is_primary && <span style={{ fontSize: 10, fontWeight: 500, color: '#c8a96e', background: '#fdf5e6', border: '1px solid #f5dfa0', borderRadius: 20, padding: '2px 8px', marginBottom: 6, display: 'inline-block', fontFamily: "'DM Sans',sans-serif" }}>Utama</span>}
                                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: '#1e1a14', margin: '0 0 3px' }}>{addr.nama} · {addr.telepon}</p>
                                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: '#6b6357', margin: '0 0 6px', lineHeight: 1.5 }}>{formatAlamat(addr)}</p>
                                  {/* ── Preview ongkir per alamat ── */}
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: "'DM Sans',sans-serif", color: ongkirAddr === 0 ? '#2d5a3d' : '#6b6357', background: ongkirAddr === 0 ? '#e8f5ed' : '#f5f2ec', borderRadius: 6, padding: '2px 8px' }}>
                                    🚚 Ongkir: {ongkirAddr === 0 ? 'Gratis' : formatRp(ongkirAddr)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <button onClick={() => setShowModalAlamat(true)} style={{ height: 44, borderRadius: 12, border: '1.5px dashed #c5dfc9', background: 'transparent', color: '#2d5a3d', fontSize: 13, fontFamily: "'DM Sans',sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
                          <Plus size={14} /> Tambah alamat baru
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: Konfirmasi */}
              {step === 3 && (
                <div style={cardStyle}>
                  <div style={cardHeader}><p style={cardHeaderText}>Konfirmasi pesanan</p></div>
                  <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ background: '#f0f9f4', borderRadius: 14, padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#2d5a3d', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'DM Sans',sans-serif" }}>Alamat Pengiriman</span>
                        <button onClick={() => setStep(2)} style={{ fontSize: 12, color: '#4a9e6b', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>↩ Ganti</button>
                      </div>
                      {selectedAddr && <>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: '#1e1a14', margin: '0 0 4px' }}>{selectedAddr.nama} · {selectedAddr.telepon}</p>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: '#6b6357', margin: '0 0 8px', lineHeight: 1.5 }}>{formatAlamat(selectedAddr)}</p>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: "'DM Sans',sans-serif", color: ONGKIR === 0 ? '#2d5a3d' : '#6b6357', background: ONGKIR === 0 ? '#e8f5ed' : '#f0ece4', borderRadius: 6, padding: '2px 8px' }}>
                          🚚 Ongkir: {ONGKIR === 0 ? 'Gratis' : formatRp(ONGKIR)} {ongkirLabel ? `· ${ongkirLabel}` : ''}
                        </span>
                      </>}
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#6b6357', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'DM Sans',sans-serif" }}>Item Pesanan</span>
                        <span style={{ fontSize: 11, color: '#9a9080', fontFamily: "'DM Sans',sans-serif" }}>{totalItems} item</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {cart.map(item => {
                          const imgSrc = getImage(item);
                          return (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#faf9f6', borderRadius: 12, padding: '12px 14px' }}>
                              <div style={{ width: 42, height: 42, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg,#f0ece4,#e8e2d8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {imgSrc ? <img src={imgSrc} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>🍪</span>}
                              </div>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 600, color: '#1e1a14', margin: '0 0 2px' }}>{item.name}</p>
                                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: '#9a9080', margin: 0 }}>x{item.qty} toples</p>
                              </div>
                              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 700, color: '#2d5a3d' }}>{formatRp(Number(item.price) * item.qty)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4, borderTop: '1px solid #f0ece4' }}>
                      {['Saya telah memeriksa alamat pengiriman dan item pesanan dengan benar', 'Saya memahami bahwa pesanan akan diproses setelah pembayaran dikonfirmasi'].map((text, i) => (
                        <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 2, accentColor: '#2d5a3d' }} />
                          <span style={{ fontSize: 12, color: '#6b6357', lineHeight: 1.5, fontFamily: "'DM Sans',sans-serif" }}>{text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div style={{ display: 'flex', gap: 10 }}>
                {step > 1 && (
                  <button className="step-btn" onClick={() => setStep(s => s - 1)} style={{ background: '#fff', border: '1.5px solid #e0ddd6', color: '#6b6357' }}>
                    <ArrowLeft size={14} /> Kembali
                  </button>
                )}
                {step < 3 ? (
                  <button className="step-btn" onClick={handleNext} style={{ flex: 1, background: '#2d5a3d', color: '#fff' }}>
                    {step === 1 ? 'Lanjut ke alamat' : 'Lanjut ke konfirmasi'} <ArrowRight size={15} />
                  </button>
                ) : (
                  <button className="step-btn" onClick={handleSubmit} disabled={loading || !agreed} style={{ flex: 1, background: loading || !agreed ? '#9dbfaa' : '#2d5a3d', color: '#fff', cursor: loading || !agreed ? 'not-allowed' : 'pointer' }}>
                    {loading
                      ? <div style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                      : <><CheckCircle2 size={15} /> Buat pesanan & lanjut bayar</>}
                  </button>
                )}
              </div>
            </div>

            {/* ── SIDEBAR ── */}
            <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>

              {/* Ringkasan harga */}
              <div style={{ background: '#2d5a3d', borderRadius: 20, padding: 24 }}>
                <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 18px' }}>Ringkasan</p>

                {/* Subtotal */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>
                  <span>Subtotal <span style={{ opacity: 0.6 }}>({totalItems} item)</span></span>
                  <span>{formatRp(subtotal)}</span>
                </div>

                {/* Ongkir — reaktif */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>
                  <span>
                    Ongkos kirim
                    {ongkirLabel && <span style={{ display: 'block', fontSize: 10, opacity: 0.6, marginTop: 1 }}>{ongkirLabel}</span>}
                  </span>
                  <span style={{ color: ONGKIR === 0 ? '#a8d8b8' : 'rgba(255,255,255,0.8)' }}>
                    {!selectedAddr
                      ? <span style={{ fontSize: 11, opacity: 0.55, fontStyle: 'italic' }}>pilih alamat</span>
                      : ONGKIR === 0 ? 'Gratis' : formatRp(ONGKIR)}
                  </span>
                </div>

                {/* Diskon voucher */}
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: '#a8d8b8', marginBottom: 8 }}>
                    <span>Diskon voucher</span><span>- {formatRp(discount)}</span>
                  </div>
                )}

                {/* Total */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: 12, paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600, color: '#fff', fontSize: 15 }}>Total</span>
                  <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#fff', fontSize: 20 }}>{formatRp(total)}</span>
                </div>
              </div>

              {/* Voucher box */}
              <div style={{ ...cardStyle, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Ticket size={14} color="#2d5a3d" />
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: '#1e1a14', margin: 0 }}>Kode voucher</p>
                </div>
                {voucherApplied ? (
                  <div style={{ background: '#f0f9f4', border: '1.5px solid #b5ddc0', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={16} color="#2d5a3d" />
                      <div>
                        <p style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#2d5a3d', margin: 0 }}>{voucherApplied.kode}</p>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: '#4a9e6b', margin: '2px 0 0' }}>Hemat {formatRp(voucherApplied.diskon)}</p>
                      </div>
                    </div>
                    <button onClick={removeVoucher} style={{ width: 26, height: 26, borderRadius: 8, border: 'none', background: '#fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={12} color="#c0392b" />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', height: 40 }}>
                    <input
                      type="text" placeholder="Masukkan kode..."
                      value={voucherCode} onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && applyVoucher()}
                      style={{ flex: 1, padding: '0 12px', borderRadius: '10px 0 0 10px', border: '1.5px solid #e0ddd6', borderRight: 'none', fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: 'none', color: '#1e1a14' }}
                    />
                    <button onClick={() => applyVoucher()} disabled={applyingVoucher} style={{ padding: '0 16px', background: applyingVoucher ? '#9dbfaa' : '#2d5a3d', color: '#fff', border: 'none', borderRadius: '0 10px 10px 0', fontSize: 13, fontWeight: 500, cursor: applyingVoucher ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {applyingVoucher ? <div style={{ width: 12, height: 12, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : 'Terapkan'}
                    </button>
                  </div>
                )}
                {!voucherApplied && publicVouchers.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 600, color: '#b5a99a', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Tag size={11} /> Voucher tersedia
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {loadingPubVoucher
                        ? [...Array(2)].map((_, i) => <div key={i} style={{ height: 44, borderRadius: 10, background: '#f0ece4', animation: 'shimmer 1.4s infinite' }} />)
                        : publicVouchers.map(v => (
                          <div key={v.id} className="voucher-hint" onClick={() => applyVoucher(v.kode)}>
                            <div>
                              <p style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#2d5a3d', margin: 0 }}>{v.kode}</p>
                              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: '#6b6357', margin: '2px 0 0' }}>
                                Diskon {v.tipe === 'persentase' ? `${v.nilai}%` : formatRp(v.nilai)}
                                {v.min_belanja > 0 ? ` · min. ${formatRp(v.min_belanja)}` : ''}
                              </p>
                            </div>
                            <span style={{ fontSize: 11, color: '#4a9e6b', fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>Pakai →</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Alamat terpilih */}
              {step >= 2 && selectedAddr && (
                <div style={{ ...cardStyle, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <MapPin size={13} style={{ color: '#2d5a3d' }} />
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: '#1e1a14' }}>Alamat terpilih</span>
                  </div>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: '#1e1a14', margin: '0 0 4px' }}>{selectedAddr.nama}</p>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: '#6b6357', margin: '0 0 8px', lineHeight: 1.5 }}>{formatAlamat(selectedAddr)}</p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: "'DM Sans',sans-serif", color: ONGKIR === 0 ? '#2d5a3d' : '#6b6357', background: ONGKIR === 0 ? '#e8f5ed' : '#f5f2ec', borderRadius: 6, padding: '2px 8px' }}>
                    🚚 {ONGKIR === 0 ? 'Gratis ongkir' : formatRp(ONGKIR)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModalAlamat && <ModalAlamatBaru onClose={() => setShowModalAlamat(false)} onSaved={handleAlamatSaved} />}
    </>
  );
};

export default CheckoutPage;