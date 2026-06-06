import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { Plus, Check, MapPin, ChevronDown, ArrowLeft, ArrowRight, CheckCircle2, Pencil } from 'lucide-react';

const STEPS = ['Alamat', 'Ringkasan', 'Pembayaran'];
const WILAYAH_BASE = 'https://www.emsifa.com/api-wilayah-indonesia/api';
const PROVINSI_JAWA = ['jawa barat', 'jawa tengah', 'di yogyakarta', 'dki jakarta', 'banten'];

const DetailPesananPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fromBuyNow = location.state?.fromBuyNow ?? false;

  const items = (() => {
    if (fromBuyNow) return location.state?.items ?? [];
    try {
      return location.state?.items ||
        JSON.parse(localStorage.getItem('cart') || '[]').filter(i => i.checked !== false);
    } catch { return []; }
  })();

  const formatRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  const totalItems = items.reduce((acc, i) => acc + i.qty, 0);
  const subtotal = items.reduce((acc, i) => acc + Number(i.price) * i.qty, 0);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);

  const [mode, setMode] = useState('saved');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [editingAddr, setEditingAddr] = useState(null); // alamat yang sedang diedit

  const emptyForm = {
    nama: '', telepon: '', detail: '',
    provinsi_id: '', provinsi_name: '',
    kota_id: '', kota_name: '',
    kecamatan_id: '', kecamatan_name: '',
    kelurahan_id: '', kelurahan_name: '',
    kode_pos: '', catatan: '',
  };

  const [form, setForm] = useState(emptyForm);
  const [saveAsNew, setSaveAsNew] = useState(false);

  const [provinsi, setProvinsi] = useState([]);
  const [kota, setKota] = useState([]);
  const [kecamatan, setKecamatan] = useState([]);
  const [kelurahan, setKelurahan] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);

  // ── Ongkir ──
  const selectedAddr = savedAddresses.find(a => a.id === selectedAddressId);

  const getOngkir = () => {
    const p = mode === 'saved'
      ? (selectedAddr?.provinsi_name || '').toLowerCase()
      : form.provinsi_name.toLowerCase();
    const k = mode === 'saved'
      ? (selectedAddr?.kota_name || selectedAddr?.kota || '').toLowerCase()
      : form.kota_name.toLowerCase();
    if (p.includes('jawa timur')) {
      if (k.includes('pasuruan')) return 0;
      return 10000;
    }
    if (PROVINSI_JAWA.some(j => p.includes(j))) return 15000;
    return 35000;
  };
  const ONGKIR = getOngkir();
  const total = subtotal + ONGKIR;
  // ────────────

  useEffect(() => {
    setLoadingAddresses(true);
    api.get('/addresses')
      .then(res => {
        const list = res.data || [];
        setSavedAddresses(list);
        const primary = list.find(a => a.is_primary) || list[0];
        if (primary) setSelectedAddressId(primary.id);
        if (!list.length) setMode('new');
      })
      .catch(() => setMode('new'))
      .finally(() => setLoadingAddresses(false));
  }, []);

  useEffect(() => {
    if (mode === 'new' && !provinsi.length) {
      fetch(`${WILAYAH_BASE}/provinces.json`).then(r => r.json()).then(setProvinsi).catch(() => {});
    }
  }, [mode]);

  const handleSelectProvinsi = (item) => {
    setForm(p => ({ ...p, provinsi_id: item.id, provinsi_name: item.name, kota_id: '', kota_name: '', kecamatan_id: '', kecamatan_name: '', kelurahan_id: '', kelurahan_name: '' }));
    setKota([]); setKecamatan([]); setKelurahan([]); setOpenDropdown(null);
    fetch(`${WILAYAH_BASE}/regencies/${item.id}.json`).then(r => r.json()).then(setKota).catch(() => {});
  };
  const handleSelectKota = (item) => {
    setForm(p => ({ ...p, kota_id: item.id, kota_name: item.name, kecamatan_id: '', kecamatan_name: '', kelurahan_id: '', kelurahan_name: '' }));
    setKecamatan([]); setKelurahan([]); setOpenDropdown(null);
    fetch(`${WILAYAH_BASE}/districts/${item.id}.json`).then(r => r.json()).then(setKecamatan).catch(() => {});
  };
  const handleSelectKecamatan = (item) => {
    setForm(p => ({ ...p, kecamatan_id: item.id, kecamatan_name: item.name, kelurahan_id: '', kelurahan_name: '' }));
    setKelurahan([]); setOpenDropdown(null);
    fetch(`${WILAYAH_BASE}/villages/${item.id}.json`).then(r => r.json()).then(setKelurahan).catch(() => {});
  };
  const handleSelectKelurahan = (item) => {
    setForm(p => ({ ...p, kelurahan_id: item.id, kelurahan_name: item.name }));
    setOpenDropdown(null);
  };

  // Buka form edit alamat tersimpan
  const handleEditAddr = (addr) => {
    setEditingAddr(addr);
    setForm({
      nama: addr.nama || '',
      telepon: addr.telepon || '',
      detail: addr.alamat || '',
      provinsi_id: addr.provinsi_id || '',
      provinsi_name: addr.provinsi_name || '',
      kota_id: addr.kota_id || '',
      kota_name: addr.kota_name || addr.kota || '',
      kecamatan_id: addr.kecamatan_id || '',
      kecamatan_name: addr.kecamatan_name || '',
      kelurahan_id: addr.kelurahan_id || '',
      kelurahan_name: addr.kelurahan_name || '',
      kode_pos: addr.kode_pos || '',
      catatan: addr.catatan || '',
    });
    setMode('edit');
    if (!provinsi.length) {
      fetch(`${WILAYAH_BASE}/provinces.json`).then(r => r.json()).then(setProvinsi).catch(() => {});
    }
  };

  const handleSaveEdit = async () => {
    if (!form.nama || !form.telepon || !form.detail) {
      toast.error('Lengkapi field yang wajib diisi'); return;
    }
    setLoading(true);
    try {
      await api.put(`/addresses/${editingAddr.id}`, {
        nama: form.nama, telepon: form.telepon, alamat: form.detail,
        kelurahan_name: form.kelurahan_name, kecamatan_name: form.kecamatan_name,
        kota_name: form.kota_name, provinsi_name: form.provinsi_name, kode_pos: form.kode_pos,
        catatan: form.catatan,
      });
      toast.success('Alamat berhasil diperbarui!');
      // refresh list
      const res = await api.get('/addresses');
      setSavedAddresses(res.data || []);
      setMode('saved');
      setEditingAddr(null);
      setForm(emptyForm);
    } catch { toast.error('Gagal menyimpan perubahan'); }
    finally { setLoading(false); }
  };

  const handleLanjut = () => {
    if (mode === 'saved') {
      if (!selectedAddressId) { toast.error('Pilih alamat pengiriman'); return; }
    } else if (mode === 'new') {
      if (!form.nama || !form.telepon || !form.detail || !form.provinsi_id || !form.kota_id || !form.kecamatan_id || !form.kelurahan_id) {
        toast.error('Lengkapi semua field yang wajib diisi'); return;
      }
    } else if (mode === 'edit') {
      toast.error('Simpan perubahan alamat terlebih dahulu'); return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buildShippingData = () => {
    if (mode === 'saved') {
      const addr = selectedAddr;
      return {
        shipping_name: addr.nama,
        shipping_phone: addr.telepon,
        shipping_address: `${addr.alamat}, ${addr.kelurahan_name || ''}, ${addr.kecamatan_name || ''}, ${addr.kota_name || addr.kota}, ${addr.provinsi_name || ''} ${addr.kode_pos || ''}`.trim(),
        shipping_city: addr.kota_name || addr.kota,
        shipping_zip: addr.kode_pos || '',
        note: addr.catatan || '',
      };
    }
    return {
      shipping_name: form.nama,
      shipping_phone: form.telepon,
      shipping_address: `${form.detail}, ${form.kelurahan_name}, ${form.kecamatan_name}, ${form.kota_name}, ${form.provinsi_name} ${form.kode_pos}`.trim(),
      shipping_city: form.kota_name,
      shipping_zip: form.kode_pos,
      note: form.catatan,
    };
  };

  const handleOrder = async () => {
    setLoading(true);
    try {
      if (mode === 'new' && saveAsNew) {
        await api.post('/addresses', {
          nama: form.nama, telepon: form.telepon, alamat: form.detail,
          kelurahan_name: form.kelurahan_name, kecamatan_name: form.kecamatan_name,
          kota_name: form.kota_name, provinsi_name: form.provinsi_name, kode_pos: form.kode_pos,
        });
      }
      const res = await api.post('/orders', {
        items: items.map(i => ({ product_id: i.id, qty: i.qty })),
        ...buildShippingData(),
      });
      if (!fromBuyNow) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        localStorage.setItem('cart', JSON.stringify(cart.filter(i => i.checked === false)));
      }
      toast.success('Pesanan berhasil dibuat!');
      navigate(`/pembayaran/${res?.data?.order_id || res?.data?.id || 'new'}`);
    } catch { toast.error('Gagal membuat pesanan'); }
    finally { setLoading(false); }
  };

  const displayAddressLine = mode === 'saved' && selectedAddr
    ? [selectedAddr.alamat, selectedAddr.kelurahan_name, selectedAddr.kecamatan_name, selectedAddr.kota_name || selectedAddr.kota, selectedAddr.provinsi_name, selectedAddr.kode_pos].filter(Boolean).join(', ')
    : [form.detail, form.kelurahan_name, form.kecamatan_name, form.kota_name, form.provinsi_name, form.kode_pos].filter(Boolean).join(', ');

  const cardStyle = { background: '#fff', borderRadius: 20, border: '1px solid #ede9e0', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' };
  const cardHeader = { background: '#2d5a3d', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' };
  const cardHeaderText = { fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 600, color: '#fff', margin: 0 };
  const inputStyle = { width: '100%', height: 40, padding: '0 12px', borderRadius: 10, border: '1.5px solid #e0ddd6', fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: 'none', color: '#1e1a14', background: '#fff', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 500, color: '#6b6357', marginBottom: 6, fontFamily: "'DM Sans',sans-serif" };

  const DropdownWilayah = ({ id, value, placeholder, options, onSelect, disabled }) => {
    const isOpen = openDropdown === id;
    return (
      <div style={{ position: 'relative' }}>
        <button type="button" disabled={disabled}
          onClick={() => setOpenDropdown(isOpen ? null : id)}
          style={{
            width: '100%', height: 40, padding: '0 12px', borderRadius: 10,
            border: `1.5px solid ${isOpen ? '#2d5a3d' : '#e0ddd6'}`,
            background: disabled ? '#faf9f6' : '#fff', fontSize: 13, textAlign: 'left',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
            fontFamily: "'DM Sans',sans-serif", color: value ? '#1e1a14' : '#b5a99a', boxSizing: 'border-box',
          }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || placeholder}</span>
          <ChevronDown size={13} style={{ color: '#9a9080', flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
        </button>
        {isOpen && (
          <div style={{ position: 'absolute', top: 44, left: 0, right: 0, zIndex: 50, background: '#fff', border: '1px solid #e0ddd6', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', maxHeight: 200, overflowY: 'auto' }}>
            {options.length === 0
              ? <div style={{ padding: '12px 16px', fontSize: 12, color: '#9a9080', display: 'flex', gap: 8, alignItems: 'center', fontFamily: "'DM Sans',sans-serif" }}>
                  <div style={{ width: 12, height: 12, border: '2px solid #2d5a3d', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Memuat...
                </div>
              : options.map(opt => (
                <button key={opt.id} type="button" onClick={() => onSelect(opt)}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13, background: value === opt.name ? '#f0f7f2' : 'transparent', color: value === opt.name ? '#2d5a3d' : '#3a3530', fontWeight: value === opt.name ? 500 : 400, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                  {opt.name}
                </button>
              ))}
          </div>
        )}
      </div>
    );
  };

  // Form alamat (dipakai untuk mode 'new' dan 'edit')
  const FormAlamat = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><label style={labelStyle}>Nama penerima *</label><input style={inputStyle} value={form.nama} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} placeholder="Nama lengkap" /></div>
        <div><label style={labelStyle}>Telepon *</label><input style={inputStyle} value={form.telepon} onChange={e => setForm(p => ({ ...p, telepon: e.target.value }))} placeholder="08xxxxxxxxxx" /></div>
      </div>
      <div>
        <label style={labelStyle}>Alamat lengkap *</label>
        <textarea style={{ ...inputStyle, height: 72, padding: '10px 12px', resize: 'none' }} value={form.detail} onChange={e => setForm(p => ({ ...p, detail: e.target.value }))} placeholder="Nama jalan, nomor rumah, RT/RW..." />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><label style={labelStyle}>Provinsi *</label><DropdownWilayah id="provinsi" value={form.provinsi_name} placeholder="Pilih provinsi..." options={provinsi} onSelect={handleSelectProvinsi} /></div>
        <div><label style={labelStyle}>Kota / Kabupaten *</label><DropdownWilayah id="kota" value={form.kota_name} placeholder="Pilih kota..." options={kota} onSelect={handleSelectKota} disabled={!form.provinsi_id} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><label style={labelStyle}>Kecamatan *</label><DropdownWilayah id="kecamatan" value={form.kecamatan_name} placeholder="Pilih kecamatan..." options={kecamatan} onSelect={handleSelectKecamatan} disabled={!form.kota_id} /></div>
        <div><label style={labelStyle}>Kelurahan *</label><DropdownWilayah id="kelurahan" value={form.kelurahan_name} placeholder="Pilih kelurahan..." options={kelurahan} onSelect={handleSelectKelurahan} disabled={!form.kecamatan_id} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><label style={labelStyle}>Kode pos</label><input style={inputStyle} value={form.kode_pos} onChange={e => setForm(p => ({ ...p, kode_pos: e.target.value }))} placeholder="12345" /></div>
      </div>
      <div>
        <label style={labelStyle}>Catatan untuk penjual (opsional)</label>
        <textarea style={{ ...inputStyle, height: 64, padding: '10px 12px', resize: 'none' }} value={form.catatan} onChange={e => setForm(p => ({ ...p, catatan: e.target.value }))} placeholder="Contoh: mohon dikemas rapi..." />
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .detail-root * { box-sizing: border-box; }
        .addr-card { border-radius: 14px; border: 1.5px solid #e0ddd6; padding: 14px 16px; cursor: pointer; transition: all 0.15s; }
        .addr-card:hover { border-color: #4a9e6b; background: #f5fbf7; }
        .addr-card.selected { border-color: #2d5a3d; background: #f0f9f4; }
        .step-btn { display: flex; align-items: center; justify-content: center; gap: 8px; height: 44px; padding: 0 24px; border-radius: 12px; border: none; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.18s; }
        .mode-tab { font-family: 'DM Sans', sans-serif; font-size: 12px; padding: 6px 14px; border-radius: 8px; border: none; cursor: pointer; transition: all 0.15s; }
        .edit-btn:hover { background: #edf5f0 !important; }
      `}</style>

      <div className="detail-root" style={{ minHeight: '100vh', background: '#faf9f6', fontFamily: "'DM Sans',sans-serif" }}
        onClick={() => openDropdown && setOpenDropdown(null)}>

        {/* Navbar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #f0ece4', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: '#1e1a14', textDecoration: 'none' }}>
            Azmata <em style={{ color: '#2d5a3d' }}>Cookies</em>
          </Link>
          <button onClick={() => step === 1 ? navigate(-1) : setStep(s => s - 1)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b6357', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
            <ArrowLeft size={14} />{step === 1 ? 'Kembali ke keranjang' : 'Edit alamat'}
          </button>
        </div>

        <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>

          {/* Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
                    background: i + 1 < step ? '#2d5a3d' : i + 1 === step ? '#2d5a3d' : '#f0ece4',
                    color: i + 1 <= step ? '#fff' : '#9a9080',
                    boxShadow: i + 1 === step ? '0 0 0 3px rgba(45,90,61,0.15)' : 'none',
                  }}>
                    {i + 1 < step ? <Check size={13} strokeWidth={3} /> : i + 1}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: i + 1 === step ? 600 : 400, color: i + 1 === step ? '#1e1a14' : '#9a9080', fontFamily: "'DM Sans',sans-serif" }}>{s}</span>
                </div>
                {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: i + 1 < step ? '#2d5a3d' : '#e0ddd6', margin: '0 16px' }} />}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* STEP 1: Alamat */}
              {step === 1 && (
                <div style={cardStyle}>
                  <div style={cardHeader}>
                    <p style={cardHeaderText}>Alamat pengiriman</p>
                    {savedAddresses.length > 0 && mode !== 'edit' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        {[['saved', 'Tersimpan'], ['new', '+ Alamat baru']].map(([m, label]) => (
                          <button key={m} className="mode-tab" onClick={() => { setMode(m); setForm(emptyForm); }}
                            style={{ background: mode === m ? '#fff' : 'transparent', color: mode === m ? '#2d5a3d' : 'rgba(255,255,255,0.75)', fontWeight: mode === m ? 600 : 400 }}>
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                    {mode === 'edit' && (
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontFamily: "'DM Sans',sans-serif" }}>Mode edit alamat</span>
                    )}
                  </div>

                  <div style={{ padding: 24 }} onClick={e => e.stopPropagation()}>

                    {/* Mode tersimpan */}
                    {mode === 'saved' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {loadingAddresses ? (
                          [...Array(2)].map((_, i) => (
                            <div key={i} style={{ height: 80, borderRadius: 14, background: 'linear-gradient(90deg,#f0ece4 25%,#e8e2d8 50%,#f0ece4 75%)', backgroundSize: '200% 100%' }} />
                          ))
                        ) : savedAddresses.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '32px 0' }}>
                            <MapPin size={28} style={{ color: '#c5bfb5', margin: '0 auto 10px', display: 'block' }} />
                            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: '#9a9080' }}>Belum ada alamat tersimpan</p>
                          </div>
                        ) : savedAddresses.map(addr => (
                          <div key={addr.id} className={`addr-card ${addr.id === selectedAddressId ? 'selected' : ''}`}
                            onClick={() => setSelectedAddressId(addr.id)}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                              <div style={{
                                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                                  border: `2px solid ${addr.id === selectedAddressId ? '#2d5a3d' : '#d5cfc4'}`,
                                  background: addr.id === selectedAddressId ? '#2d5a3d' : '#fff',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                                  overflow: 'hidden', fontSize: 0, 
                                }}>
                                {addr.id === selectedAddressId && <Check size={10} style={{ color: '#fff' }} strokeWidth={3} />}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                                  {addr.label && addr.label.trim() !== '' && addr.label !== '0' && (
                                    <span style={{ fontSize: 10, fontWeight: 500, color: '#2d5a3d', background: '#f0f7f2', border: '1px solid #c5dfc9', borderRadius: 20, padding: '2px 8px', fontFamily: "'DM Sans',sans-serif" }}>
                                      {addr.label}
                                    </span>
                                  )}
                                  {addr.is_primary && <span style={{ fontSize: 10, fontWeight: 500, color: '#c8a96e', background: '#fdf5e6', border: '1px solid #f5dfa0', borderRadius: 20, padding: '2px 8px', fontFamily: "'DM Sans',sans-serif" }}>Utama</span>}
                                </div>
                                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: '#1e1a14', margin: '0 0 3px' }}>{addr.nama} · {addr.telepon}</p>
                                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: '#6b6357', margin: 0, lineHeight: 1.5 }}>
                                  {[addr.alamat, addr.kelurahan_name, addr.kecamatan_name, addr.kota_name || addr.kota, addr.provinsi_name, addr.kode_pos].filter(Boolean).join(', ')}
                                </p>
                              </div>
                              {/* Tombol edit */}
                              <button
                                className="edit-btn"
                                onClick={e => { e.stopPropagation(); handleEditAddr(addr); }}
                                style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 8, border: '1px solid #e0ddd6', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.15s' }}>
                                <Pencil size={12} style={{ color: '#6b6357' }} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Mode baru */}
                    {mode === 'new' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <FormAlamat />
                        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                          <div onClick={() => setSaveAsNew(p => !p)} style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, border: `2px solid ${saveAsNew ? '#2d5a3d' : '#d5cfc4'}`, background: saveAsNew ? '#2d5a3d' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                            {saveAsNew && <Check size={10} style={{ color: '#fff' }} strokeWidth={3} />}
                          </div>
                          <span onClick={() => setSaveAsNew(p => !p)} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: '#6b6357' }}>Simpan alamat ini ke profil</span>
                        </label>
                      </div>
                    )}

                    {/* Mode edit */}
                    {mode === 'edit' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ background: '#fff8ee', border: '1px solid #fde68a', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#d97706', fontFamily: "'DM Sans',sans-serif" }}>
                          ✏️ Mengedit alamat: <strong>{editingAddr?.nama}</strong>
                        </div>
                        <FormAlamat />
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button onClick={() => { setMode('saved'); setEditingAddr(null); setForm(emptyForm); }}
                            style={{ flex: 1, height: 42, borderRadius: 10, border: '1.5px solid #e0ddd6', background: '#fff', fontSize: 13, color: '#6b6357', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                            Batal
                          </button>
                          <button onClick={handleSaveEdit} disabled={loading}
                            style={{ flex: 1, height: 42, borderRadius: 10, border: 'none', background: '#2d5a3d', color: '#fff', fontSize: 13, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            {loading ? <div style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : 'Simpan perubahan'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: Ringkasan */}
              {step === 2 && (
                <div style={cardStyle}>
                  <div style={cardHeader}><p style={cardHeaderText}>Konfirmasi pesanan</p></div>
                  <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ background: '#f0f9f4', borderRadius: 14, padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#2d5a3d', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'DM Sans',sans-serif" }}>Alamat Pengiriman</span>
                        <button onClick={() => setStep(1)} style={{ fontSize: 12, color: '#4a9e6b', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>↩ Ganti</button>
                      </div>
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, color: '#1e1a14', margin: '0 0 4px' }}>
                        {mode === 'saved' && selectedAddr ? `${selectedAddr.nama} · ${selectedAddr.telepon}` : `${form.nama} · ${form.telepon}`}
                      </p>
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: '#6b6357', margin: '0 0 4px', lineHeight: 1.5 }}>{displayAddressLine}</p>
                      {(mode === 'saved' ? selectedAddr?.catatan : form.catatan) && (
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: '#9a9080', margin: 0 }}>Catatan: {mode === 'saved' ? selectedAddr?.catatan : form.catatan}</p>
                      )}
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#6b6357', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'DM Sans',sans-serif" }}>Item Pesanan</span>
                        <span style={{ fontSize: 11, color: '#9a9080', fontFamily: "'DM Sans',sans-serif" }}>{totalItems} item</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {items.map(item => {
                          const imgFile = [item.image_1, item.image_2, item.image_3, item.image_4].find(f => f);
                          return (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#faf9f6', borderRadius: 12, padding: '12px 14px' }}>
                              <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg,#f0ece4,#e8e2d8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {imgFile ? <img src={`/uploads/${imgFile}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 22 }}>🍪</span>}
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
                      {[[agree1, setAgree1, 'Saya telah memeriksa alamat pengiriman dan item pesanan dengan benar'], [agree2, setAgree2, 'Saya memahami bahwa pesanan akan diproses setelah pembayaran dikonfirmasi']].map(([val, setter, text], i) => (
                        <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                          <input type="checkbox" checked={val} onChange={e => setter(e.target.checked)} style={{ marginTop: 2, accentColor: '#2d5a3d' }} />
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
                {step === 1 ? (
                  <button className="step-btn" onClick={handleLanjut} style={{ flex: 1, background: '#2d5a3d', color: '#fff' }}>
                    Lanjut ke ringkasan <ArrowRight size={15} />
                  </button>
                ) : (
                  <button className="step-btn" onClick={handleOrder} disabled={loading || !agree1 || !agree2}
                    style={{ flex: 1, background: loading || !agree1 || !agree2 ? '#9dbfaa' : '#2d5a3d', color: '#fff', cursor: loading || !agree1 || !agree2 ? 'not-allowed' : 'pointer' }}>
                    {loading
                      ? <div style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                      : <><CheckCircle2 size={15} /> Konfirmasi &amp; buat pesanan</>}
                  </button>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>
              <div style={{ background: '#2d5a3d', borderRadius: 20, padding: 24 }}>
                <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 18px' }}>Ringkasan</p>
                {[['Subtotal', `(${totalItems} item)`, formatRp(subtotal)], ['Ongkos kirim', '', ONGKIR === 0 ? 'Gratis' : formatRp(ONGKIR)]].map(([label, sub, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 8 }}>
                    <span>{label} <span style={{ opacity: 0.6 }}>{sub}</span></span>
                    <span style={{ color: label === 'Ongkos kirim' && ONGKIR === 0 ? '#a8d8b8' : 'rgba(255,255,255,0.8)' }}>{val}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: 12, paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 600, color: '#fff', fontSize: 15 }}>Total</span>
                  <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: '#fff', fontSize: 20 }}>{formatRp(total)}</span>
                </div>
              </div>

              <div style={{ ...cardStyle, padding: 20 }}>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: '#6b6357', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 12px' }}>Item pesanan</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {items.map(item => {
                    const imgFile = [item.image_1, item.image_2, item.image_3, item.image_4].find(f => f);
                    return (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg,#f0ece4,#e8e2d8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {imgFile ? <img src={`/uploads/${imgFile}`} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>🍪</span>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 12, fontWeight: 600, color: '#1e1a14', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: '#9a9080', margin: '1px 0 0' }}>x{item.qty}</p>
                        </div>
                        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 12, fontWeight: 700, color: '#2d5a3d', flexShrink: 0 }}>{formatRp(Number(item.price) * item.qty)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {step === 2 && (mode === 'saved' ? selectedAddr : form.nama) && (
                <div style={{ ...cardStyle, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <MapPin size={13} style={{ color: '#2d5a3d' }} />
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: '#1e1a14' }}>Dikirim ke</span>
                  </div>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: '#1e1a14', margin: '0 0 4px' }}>
                    {mode === 'saved' && selectedAddr ? selectedAddr.nama : form.nama}
                  </p>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: '#6b6357', margin: 0, lineHeight: 1.5 }}>{displayAddressLine}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailPesananPage;