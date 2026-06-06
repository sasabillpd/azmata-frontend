import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { CloudUpload, X, ImageIcon, Check } from 'lucide-react';

const STEPS = ['Alamat', 'Ringkasan', 'Pembayaran'];

const REKENING = {
  bank: 'Bank BCA',
  nomor: '1234 5678 9012',
  atas_nama: 'a.n. Ari Dwi Listyo Rini',
  batas: '24 jam setelah pesanan dibuat',
};

const PembayaranPage = () => {
  const { order_id } = useParams();
  const navigate = useNavigate();

  const [files, setFiles]         = useState([]);
  const [previews, setPreviews]   = useState([]);
  const [dragging, setDragging]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [timeLeft, setTimeLeft]   = useState(24 * 60 * 60);
  const [orderTotal, setOrderTotal] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [breakdown, setBreakdown] = useState(null);

  useEffect(() => {
    api.get(`/orders/${order_id}`)
      .then(res => {
        const d = res.data;
        setOrderTotal(d.total_price);
        setOrderData(d);
        setBreakdown({
          subtotal:        d.subtotal,
          shipping_cost:   d.shipping_cost,
          discount_amount: d.discount_amount,
          voucher_code:    d.voucher_code,
        });
      })
      .catch(() => {});
  }, [order_id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, '0');
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${h} : ${m} : ${s}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    toast.success('Disalin!');
  };

  const addFiles = (incoming) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const valid = [];
    for (const f of incoming) {
      if (!allowed.includes(f.type)) { toast.error(`${f.name}: hanya foto (JPG, PNG, WEBP)`); continue; }
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name}: ukuran maks 5 MB`); continue; }
      valid.push(f);
    }
    if (!valid.length) return;
    setFiles(prev => [...prev, ...valid]);
    setPreviews(prev => [...prev, ...valid.map(f => URL.createObjectURL(f))]);
  };

  const removeFile = (idx) => {
    URL.revokeObjectURL(previews[idx]);
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDrop        = (e) => { e.preventDefault(); setDragging(false); addFiles(Array.from(e.dataTransfer.files)); };
  const handleInputChange = (e) => { addFiles(Array.from(e.target.files)); e.target.value = ''; };

  const handleSubmit = async () => {
    if (!files.length) { toast.error('Pilih minimal 1 foto bukti transfer'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('bukti', f));
      await api.post(`/orders/${order_id}/payment`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Bukti pembayaran berhasil dikirim!');
      navigate('/profil', { state: { tab: 'pesanan' } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim bukti pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    background: '#fff',
    borderRadius: 20,
    border: '1px solid #ede9e0',
    overflow: 'hidden',
    boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
  };
  const cardHeader = {
    background: '#2d5a3d',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };
  const cardHeaderText = {
    fontFamily: "'Playfair Display',serif",
    fontSize: 15,
    fontWeight: 600,
    color: '#fff',
    margin: 0,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .pembayaran-root * { box-sizing: border-box; }
        .copy-btn:hover { background: #f0f7f2 !important; }
        .upload-zone:hover { border-color: #4a9e6b !important; background: #f5fbf7 !important; }
        .preview-item:hover .remove-btn { opacity: 1 !important; }
        .preview-item:hover .file-label { opacity: 1 !important; }
        .add-more:hover { border-color: #4a9e6b !important; }
      `}</style>

      <div className="pembayaran-root" style={{ minHeight: '100vh', background: '#faf9f6', fontFamily: "'DM Sans',sans-serif" }}>

        {/* Navbar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #f0ece4', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: '#1e1a14', textDecoration: 'none' }}>
            Azmata <em style={{ color: '#2d5a3d' }}>Cookies</em>
          </Link>
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b6357', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
            ‹ Kembali
          </button>
        </div>

        {/* Stepper */}
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 24px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
                    background: i <= 2 ? '#2d5a3d' : '#f0ece4',
                    color: '#fff',
                    boxShadow: i === 2 ? '0 0 0 3px rgba(45,90,61,0.15)' : 'none',
                  }}>
                    {i < 2 ? <Check size={13} strokeWidth={3} /> : i + 1}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: i === 2 ? 600 : 400, color: i === 2 ? '#1e1a14' : '#9a9080', fontFamily: "'DM Sans',sans-serif" }}>{s}</span>
                </div>
                {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: i < 2 ? '#2d5a3d' : '#e0ddd6', margin: '0 16px' }} />}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Countdown */}
            <div style={{ background: '#fffbf0', border: '1px solid #f5dfa0', borderRadius: 20, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: '#b45309', margin: '0 0 2px' }}>Selesaikan pembayaran dalam</p>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: '#92400e', margin: 0 }}>{formatTime(timeLeft)}</p>
                </div>
              </div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: '#9a9080' }}>Batas: {REKENING.batas}</p>
            </div>

            {/* Order ID badge */}
            {orderData && (
              <div style={{ ...cardStyle, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: '#9a9080', margin: '0 0 4px' }}>Nomor pesanan</p>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#1e1a14', margin: 0 }}>
                    {orderData.invoice_number || `INV-${new Date().toISOString().slice(2,10).replace(/-/g,'')}-???`}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: '#9a9080', margin: '0 0 4px' }}>Status</p>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 500, color: '#c8a96e', background: '#fdf5e6', border: '1px solid #f5dfa0', borderRadius: 20, padding: '4px 12px' }}>
                    {orderData.status || 'Menunggu Pembayaran'}
                  </span>
                </div>
              </div>
            )}

            {/* Info rekening */}
            <div style={cardStyle}>
              <div style={cardHeader}>
                <p style={cardHeaderText}>Transfer ke rekening</p>
              </div>
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 600, color: '#6b6357', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px' }}>Bank tujuan</p>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: '#3a3530', margin: 0 }}>{REKENING.bank}</p>
                </div>

                <div>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 600, color: '#6b6357', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>Nomor rekening</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#1e1a14' }}>{REKENING.nomor}</span>
                    <button
                      className="copy-btn"
                      onClick={() => copyToClipboard(REKENING.nomor)}
                      style={{ fontSize: 12, color: '#2d5a3d', border: '1.5px solid #c5dfc9', borderRadius: 8, padding: '4px 12px', background: '#fff', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'background 0.15s' }}>
                      Salin
                    </button>
                  </div>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: '#6b6357', margin: 0 }}>{REKENING.atas_nama}</p>
                </div>

                {/* ── Breakdown + Nominal transfer ── */}
                {orderTotal && (
                  <div style={{ borderTop: '1px solid #f0ece4', paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>

                    {/* Rincian harga */}
                    {breakdown && [
                      {
                        label: 'Subtotal produk',
                        value: breakdown.subtotal,
                        minus: false,
                      },
                      {
                        label: 'Ongkos kirim',
                        value: breakdown.shipping_cost,
                        minus: false,
                      },
                      {
                        label: breakdown.voucher_code
                          ? `Voucher (${breakdown.voucher_code})`
                          : 'Diskon voucher',
                        value: breakdown.discount_amount,
                        minus: true,
                      },
                    ].map(({ label, value, minus }) =>
                      value != null && Number(value) !== 0 ? (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: '#6b6357' }}>{label}</span>
                          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: minus ? '#e57373' : '#3a3530' }}>
                            {minus ? '− ' : ''}Rp {Number(value).toLocaleString('id-ID')}
                          </span>
                        </div>
                      ) : null
                    )}

                    {/* Total final */}
                    <div style={{ borderTop: '1px dashed #e0ddd6', paddingTop: 10 }}>
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 600, color: '#6b6357', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>
                        Nominal transfer (tepat)
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: '#2d5a3d' }}>
                          Rp {Number(orderTotal).toLocaleString('id-ID')}
                        </span>
                        <button
                          className="copy-btn"
                          onClick={() => copyToClipboard(String(orderTotal))}
                          style={{ fontSize: 12, color: '#2d5a3d', border: '1.5px solid #c5dfc9', borderRadius: 8, padding: '4px 12px', background: '#fff', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'background 0.15s' }}>
                          Salin
                        </button>
                      </div>
                      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: '#9a9080', margin: 0 }}>
                        Transfer nominal yang tepat agar verifikasi lebih cepat
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload bukti */}
            <div style={cardStyle}>
              <div style={cardHeader}>
                <p style={cardHeaderText}>Unggah bukti transfer</p>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>Hanya foto · Bisa lebih dari 1</span>
              </div>
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div
                  className="upload-zone"
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('fileInput').click()}
                  style={{
                    border: `2px dashed ${dragging ? '#2d5a3d' : '#d5e8dc'}`,
                    borderRadius: 16,
                    padding: '40px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    cursor: 'pointer',
                    background: dragging ? '#f0f9f4' : '#faf9f6',
                    transition: 'all 0.15s',
                  }}>
                  <CloudUpload size={32} style={{ color: dragging ? '#2d5a3d' : '#c5bfb5' }} />
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: '#3a3530', fontWeight: 500, margin: '0 0 4px' }}>
                      Seret foto ke sini atau klik untuk pilih
                    </p>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: '#9a9080', margin: 0 }}>
                      JPG, PNG, WEBP · Maks. 5 MB per foto
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#2d5a3d', color: '#fff', fontSize: 12, fontWeight: 500, padding: '8px 16px', borderRadius: 10, fontFamily: "'DM Sans',sans-serif" }}>
                    <ImageIcon size={13} /> Pilih foto
                  </div>
                </div>

                <input
                  id="fileInput"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleInputChange}
                />

                {previews.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {previews.map((src, idx) => (
                      <div
                        key={idx}
                        className="preview-item"
                        style={{ position: 'relative', aspectRatio: '1', borderRadius: 14, overflow: 'hidden', border: '1px solid #e0ddd6' }}>
                        <img src={src} alt={`Bukti ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          className="remove-btn"
                          onClick={() => removeFile(idx)}
                          style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, background: '#e57373', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0, transition: 'opacity 0.15s' }}>
                          <X size={12} style={{ color: '#fff' }} />
                        </button>
                        <div
                          className="file-label"
                          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: 11, textAlign: 'center', padding: '4px 8px', opacity: 0, transition: 'opacity 0.15s', fontFamily: "'DM Sans',sans-serif" }}>
                          {files[idx]?.name?.length > 16 ? files[idx].name.slice(0, 16) + '…' : files[idx]?.name}
                        </div>
                      </div>
                    ))}
                    <div
                      className="add-more"
                      onClick={() => document.getElementById('fileInput').click()}
                      style={{ aspectRatio: '1', borderRadius: 14, border: '2px dashed #d5e8dc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 4, transition: 'border-color 0.15s' }}>
                      <span style={{ fontSize: 24, color: '#c5bfb5' }}>+</span>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: '#9a9080' }}>Tambah</span>
                    </div>
                  </div>
                )}

                {files.length > 0 && (
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: '#9a9080', textAlign: 'center', margin: 0 }}>
                    {files.length} foto dipilih
                  </p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading || files.length === 0}
                  style={{
                    width: '100%',
                    height: 48,
                    borderRadius: 12,
                    border: 'none',
                    background: loading || files.length === 0 ? '#9dbfaa' : '#2d5a3d',
                    color: '#fff',
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: loading || files.length === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'background 0.15s',
                  }}>
                  {loading
                    ? <><div style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Mengirim...</>
                    : `Kirim ${files.length > 0 ? files.length + ' ' : ''}bukti pembayaran`}
                </button>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default PembayaranPage;