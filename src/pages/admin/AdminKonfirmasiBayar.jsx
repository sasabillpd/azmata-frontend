import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  CheckCircle, XCircle, Eye, Upload, X, AlertTriangle,
  LayoutDashboard, Package, ClipboardList,
  BarChart2, LogOut, CreditCard, Users2,
  RefreshCw, Clock, BadgeCheck, Ticket,
} from 'lucide-react';

/* ── helpers ── */
const formatRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

const REJECT_REASONS = [
  'Bukti transfer tidak jelas / buram',
  'Nominal transfer tidak sesuai',
  'Bukti transfer sudah kadaluarsa',
  'Rekening tujuan tidak sesuai',
  'Stok produk habis',
  'Lainnya',
];

const REFUND_STATUS_LABEL = {
  'Menunggu Rekening':               { label: 'Menunggu rekening customer',      color: '#d97706', bg: '#fff8ee', border: '#fde68a' },
  'Menunggu Konfirmasi Super Admin': { label: 'Menunggu konfirmasi super admin', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  'Selesai':                         { label: 'Refund selesai',                  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
};

/* ── nav ── */
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
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(30,26,20,0.45)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.18s ease' }} />
    <div style={{ position: 'fixed', top: '50%', left: '50%', zIndex: 51, transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 20, padding: '36px 32px 28px', width: 360, boxShadow: '0 24px 60px rgba(30,26,20,0.18)', animation: 'slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)', fontFamily: "'DM Sans', sans-serif" }}>
      <button onClick={onCancel} style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: '#f5f1eb', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a7f6f' }}><X size={14} /></button>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#fff3e8,#ffe0c8)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><LogOut size={24} color="#d97706" /></div>
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1e1a14', margin: '0 0 8px' }}>Keluar dari akun?</p>
      <p style={{ fontSize: 14, color: '#8a7f6f', margin: '0 0 28px', lineHeight: 1.6 }}>Kamu akan keluar dari sesi admin. Pastikan semua perubahan sudah tersimpan.</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: '1.5px solid #ede9e0', background: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: '#5a5346', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = '#faf9f6'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>Batal</button>
        <button onClick={onConfirm} style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#c0392b,#e74c3c)', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.88'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Ya, Keluar</button>
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
          <p style={{ fontSize: 12, color: '#4a9e6b', margin: 0, fontWeight: 500 }}>{userRole === 'super_admin' ? 'Super Admin' : 'Panel admin'}</p>
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

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
const AdminKonfirmasiBayar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === 'super_admin';

  /* state */
  const [activeTab, setActiveTab]         = useState('konfirmasi');
  const [payments, setPayments]           = useState([]);
  const [refunds, setRefunds]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [loadingRefund, setLoadingRefund] = useState(true);
  const [preview, setPreview]             = useState(null);
  const [processing, setProc]             = useState(null);
  const [showLogout, setShowLogout]       = useState(false);

  /* modal tolak */
  const [showReject, setShowReject]       = useState(false);
  const [rejectTarget, setRejectTarget]   = useState(null);
  const [rejectForm, setRejectForm]       = useState({ reject_reason: '', custom_reason: '' });

  /* modal konfirmasi refund (super admin) */
  const [showConfirmRefund, setShowConfirmRefund] = useState(false);
  const [confirmTarget, setConfirmTarget]         = useState(null);
  const [refundProof, setRefundProof]             = useState(null);
  const [refundPreview, setRefundPreview]         = useState(null);
  const fileRef = useRef();

  /* ── AUTO-REFRESH interval ref ── */
  const pollRef = useRef(null);

  /* ── fetch ── */
  const fetchPayments = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get('/payments?status=Menunggu');
      setPayments(data);
    } catch { if (!silent) toast.error('Gagal memuat data pembayaran'); }
    finally { if (!silent) setLoading(false); }
  }, []);

  const fetchRefunds = useCallback(async (silent = false) => {
    if (!silent) setLoadingRefund(true);
    try {
      const { data } = await api.get('/payments?status=Ditolak');
      setRefunds(data);
    } catch { if (!silent) toast.error('Gagal memuat data refund'); }
    finally { if (!silent) setLoadingRefund(false); }
  }, []);

  /* initial load */
  useEffect(() => {
    fetchPayments();
    fetchRefunds();
  }, [fetchPayments, fetchRefunds]);

  /* ── AUTO-REFRESH: aktif kalau tab refund atau selesai, silent poll tiap 30 detik ── */
  useEffect(() => {
    if (activeTab === 'refund' || activeTab === 'selesai') {
      pollRef.current = setInterval(() => {
        fetchRefunds(true); // silent = tidak tampilkan loading spinner
      }, 30_000);
    }
    return () => clearInterval(pollRef.current);
  }, [activeTab, fetchRefunds]);

  /* ── konfirmasi ── */
  const handleConfirm = async (order_id) => {
    setProc(order_id);
    try {
      await api.put(`/payments/${order_id}/confirm`);
      toast.success('Pembayaran dikonfirmasi!');
      fetchPayments();
    } catch { toast.error('Gagal mengkonfirmasi'); }
    finally { setProc(null); }
  };

  /* ── tolak ── */
  const openReject = (payment) => {
    setRejectTarget(payment);
    setRejectForm({ reject_reason: '', custom_reason: '' });
    setShowReject(true);
  };

  const getAlasan = () =>
    (rejectForm.reject_reason === 'Lainnya' ? rejectForm.custom_reason : rejectForm.reject_reason).trim();

  const handleReject = async () => {
    const alasan = getAlasan();
    if (!alasan) { toast.error('Pilih atau isi alasan penolakan'); return; }
    setProc(rejectTarget.order_id);
    try {
      const fd = new FormData();
      fd.append('reject_reason', alasan);
      await api.put(`/payments/${rejectTarget.order_id}/reject`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Pembayaran ditolak & pengajuan refund dikirim ke super admin');
      setShowReject(false);
      fetchPayments();
      fetchRefunds();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menolak pembayaran'); }
    finally { setProc(null); }
  };

  /* ── konfirmasi refund (super admin) ── */
  const openConfirmRefund = (refund) => {
    setConfirmTarget(refund);
    setRefundProof(null);
    setRefundPreview(null);
    setShowConfirmRefund(true);
  };

  const handleRefundFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) { toast.error('Hanya foto yang diizinkan'); return; }
    if (f.size > 5 * 1024 * 1024)    { toast.error('Maks. 5MB'); return; }
    setRefundProof(f);
    setRefundPreview(URL.createObjectURL(f));
  };

  const handleConfirmRefund = async () => {
    if (!refundProof) { toast.error('Upload bukti transfer refund terlebih dahulu'); return; }
    setProc(confirmTarget.order_id);
    try {
      const fd = new FormData();
      fd.append('refund_proof', refundProof);
      await api.put(`/payments/${confirmTarget.order_id}/confirm-refund`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Refund dikonfirmasi! Notifikasi dikirim ke customer');
      setShowConfirmRefund(false);
      fetchRefunds();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal mengkonfirmasi refund'); }
    finally { setProc(null); }
  };

  const handleLogout = () => { logout?.(); navigate('/login'); };

  /* ── derived data: pisah pending vs selesai ── */
  const pendingRefunds       = refunds.filter(r => r.refund_status !== 'Selesai');
  const selesaiRefunds       = refunds.filter(r => r.refund_status === 'Selesai');
  const pendingRefundCount   = pendingRefunds.filter(r => r.refund_status === 'Menunggu Konfirmasi Super Admin').length;
  const waitingRekeningCount = pendingRefunds.filter(r => r.refund_status === 'Menunggu Rekening').length;

  const inputStyle = {
    width: '100%', height: 40, padding: '0 12px',
    fontSize: 13, border: '1.5px solid #ede9e0', borderRadius: 10, outline: 'none',
    fontFamily: "'DM Sans', sans-serif", color: '#1e1a14',
    background: '#fff', transition: 'border-color 0.15s', boxSizing: 'border-box',
  };

  /* ── reusable refund card renderer ── */
  const renderRefundCard = (r) => {
    const statusInfo = REFUND_STATUS_LABEL[r.refund_status] || { label: r.refund_status, color: '#8a7f6f', bg: '#f5f1eb', border: '#ede9e0' };
    const canConfirm = isSuperAdmin && r.refund_status === 'Menunggu Konfirmasi Super Admin';
    return (
      <div key={r.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #ede9e0', padding: '18px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#b5a99a' }}>
                {r.invoice_number || `#${String(r.order_id).padStart(4, '0')}`}
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: statusInfo.bg, color: statusInfo.color, border: `1px solid ${statusInfo.border}` }}>
                {statusInfo.label}
              </span>
            </div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#2d5a3d', margin: 0 }}>{formatRp(r.total_price)}</p>
            <p style={{ fontSize: 13, color: '#1e1a14', margin: 0 }}>{r.customer_name}</p>
            <p style={{ fontSize: 11, color: '#b5a99a', margin: 0 }}>{r.email}{r.phone ? ` · ${r.phone}` : ''}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            {r.proof_image && (
              <button onClick={() => setPreview(r.proof_image)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#2d5a3d', fontWeight: 500, background: '#edf5f0', border: 'none', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.background = '#d5ede2'}
                onMouseLeave={e => e.currentTarget.style.background = '#edf5f0'}
              ><Eye size={12} /> Lihat bukti bayar</button>
            )}
            {r.refund_proof && (
              <button onClick={() => setPreview(r.refund_proof)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#7c3aed', fontWeight: 500, background: '#f5f3ff', border: 'none', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.background = '#ede9fe'}
                onMouseLeave={e => e.currentTarget.style.background = '#f5f3ff'}
              ><Eye size={12} /> Lihat bukti refund</button>
            )}
            {canConfirm && (
              <button onClick={() => openConfirmRefund(r)} disabled={processing === r.order_id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, border: 'none', background: '#7c3aed', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", opacity: processing === r.order_id ? 0.6 : 1 }}
                onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
                onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
              ><BadgeCheck size={13} /> Konfirmasi Refund</button>
            )}
          </div>
        </div>

        {r.reject_reason && (
          <div style={{ marginTop: 14, background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px' }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#b91c1c', letterSpacing: '0.6px', textTransform: 'uppercase', margin: '0 0 4px' }}>Alasan penolakan</p>
            <p style={{ fontSize: 13, color: '#7f1d1d', margin: 0 }}>{r.reject_reason}</p>
          </div>
        )}

        {r.refund_rekening ? (
          <div style={{ marginTop: 10, background: '#edf5f0', border: '1px solid #b5ddc8', borderRadius: 10, padding: '10px 14px' }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#2d5a3d', letterSpacing: '0.6px', textTransform: 'uppercase', margin: '0 0 4px' }}>Rekening tujuan refund</p>
            <p style={{ fontSize: 13, color: '#1a3d2b', margin: 0, fontWeight: 500 }}>
              {r.refund_bank} · {r.refund_rekening} · a.n. {r.refund_atas_nama}
            </p>
          </div>
        ) : (
          r.refund_status !== 'Selesai' && (
            <div style={{ marginTop: 10, background: '#fff8ee', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={13} color="#d97706" />
              <p style={{ fontSize: 12, color: '#d97706', margin: 0 }}>Menunggu customer mengisi nomor rekening di halaman profil mereka.</p>
            </div>
          )
        )}

        {/* Timestamp selesai */}
        {r.refund_status === 'Selesai' && r.refund_confirmed_at && (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle size={12} color="#16a34a" />
            <p style={{ fontSize: 11, color: '#16a34a', margin: 0 }}>
              Selesai {new Date(r.refund_confirmed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .kb-row { transition: background 0.14s; }
        .kb-row:hover { background: #faf9f6 !important; }
        .kb-input:focus { border-color: #4a9e6b !important; }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translate(-50%,-44%)} to{opacity:1;transform:translate(-50%,-50%)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #d4cfc8; border-radius: 99px; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#faf9f6', fontFamily: "'DM Sans', sans-serif" }}>
        <Sidebar onLogoutClick={() => setShowLogout(true)} userRole={user?.role} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Top bar */}
          <header style={{ padding: '20px 32px', borderBottom: '1px solid #ede9e0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1e1a14', margin: 0 }}>Konfirmasi Bayar</h1>
              <p style={{ fontSize: 12, color: '#b5a99a', margin: '2px 0 0' }}>Verifikasi bukti transfer & kelola proses refund</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* indikator auto-refresh aktif */}
              {(activeTab === 'refund' || activeTab === 'selesai') && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, padding: '4px 12px' }}>
                  <RefreshCw size={10} />
                  Auto-refresh 30 dtk
                </div>
              )}
              <div style={{ fontSize: 12, color: '#8a7f6f', background: '#f5f1eb', padding: '6px 14px', borderRadius: 20 }}>
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </header>

          <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>

            {/* ── TABS ── */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              {[
                {
                  key: 'konfirmasi',
                  label: 'Konfirmasi Pembayaran',
                  count: payments.length,
                  countBg: '#fff8ee', countColor: '#d97706',
                },
                {
                  key: 'refund',
                  label: 'Perlu Refund',
                  count: pendingRefundCount + waitingRekeningCount,
                  countBg: '#f5f3ff', countColor: '#7c3aed',
                },
                {
                  key: 'selesai',
                  label: 'Refund Selesai',
                  count: selesaiRefunds.length,
                  countBg: '#f0fdf4', countColor: '#16a34a',
                },
              ].map(tab => {
                const active = activeTab === tab.key;
                return (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 20px', borderRadius: 12,
                    border: active ? '1.5px solid #2d5a3d' : '1.5px solid #ede9e0',
                    background: active ? '#1a3d2b' : '#fff',
                    color: active ? '#fff' : '#5a5346',
                    fontSize: 13, fontWeight: active ? 600 : 400,
                    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.16s',
                  }}>
                    {tab.label}
                    {tab.count > 0 && (
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: active ? 'rgba(255,255,255,0.2)' : tab.countBg, color: active ? '#fff' : tab.countColor }}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ══ TAB: KONFIRMASI PEMBAYARAN ══ */}
            {activeTab === 'konfirmasi' && (
              <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #ede9e0', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f5f1eb' }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: '#1e1a14' }}>Menunggu konfirmasi</span>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: '4px 12px', borderRadius: 20, background: '#fff8ee', color: '#d97706' }}>{payments.length} pending</span>
                </div>

                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid #2d5a3d', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                  </div>
                ) : payments.length === 0 ? (
                  <div style={{ padding: '64px 0', textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                    <p style={{ fontSize: 13, color: '#b5a99a', margin: 0 }}>Tidak ada pembayaran yang perlu dikonfirmasi</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #f5f1eb' }}>
                          {['No. Pesanan', 'Pelanggan', 'Total', 'Bukti Transfer', 'Waktu Upload', 'Aksi'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '10px 22px', fontSize: 10, color: '#b5a99a', fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map(p => (
                          <tr key={p.id} className="kb-row" style={{ borderBottom: '1px solid #f9f7f4' }}>
                            <td style={{ padding: '13px 22px', fontSize: 12, color: '#b5a99a', fontFamily: 'monospace' }}>
                              {p.invoice_number || `#${String(p.order_id).padStart(4, '0')}`}
                            </td>
                            <td style={{ padding: '13px 22px' }}>
                              <p style={{ fontSize: 13, fontWeight: 500, color: '#1e1a14', margin: '0 0 2px' }}>{p.customer_name}</p>
                              <p style={{ fontSize: 11, color: '#b5a99a', margin: 0 }}>{p.email}</p>
                              {p.phone && <p style={{ fontSize: 11, color: '#b5a99a', margin: 0 }}>{p.phone}</p>}
                            </td>
                            <td style={{ padding: '13px 22px', fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, color: '#2d5a3d' }}>
                              {formatRp(p.total_price)}
                            </td>
                            <td style={{ padding: '13px 22px' }}>
                              {p.proof_image ? (
                                <button onClick={() => setPreview(p.proof_image)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#2d5a3d', fontWeight: 500, background: '#edf5f0', border: 'none', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                                  onMouseEnter={e => e.currentTarget.style.background = '#d5ede2'}
                                  onMouseLeave={e => e.currentTarget.style.background = '#edf5f0'}
                                ><Eye size={12} /> Lihat bukti</button>
                              ) : (
                                <span style={{ fontSize: 12, color: '#b5a99a' }}>Belum diupload</span>
                              )}
                            </td>
                            <td style={{ padding: '13px 22px', fontSize: 12, color: '#b5a99a' }}>
                              {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td style={{ padding: '13px 22px' }}>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => handleConfirm(p.order_id)} disabled={processing === p.order_id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: 'none', background: '#edf5f0', color: '#2d5a3d', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", opacity: processing === p.order_id ? 0.5 : 1 }}
                                  onMouseEnter={e => e.currentTarget.style.background = '#d5ede2'}
                                  onMouseLeave={e => e.currentTarget.style.background = '#edf5f0'}
                                ><CheckCircle size={12} /> Konfirmasi</button>
                                <button onClick={() => openReject(p)} disabled={processing === p.order_id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: 'none', background: '#fff5f5', color: '#b91c1c', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", opacity: processing === p.order_id ? 0.5 : 1 }}
                                  onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                                  onMouseLeave={e => e.currentTarget.style.background = '#fff5f5'}
                                ><XCircle size={12} /> Tolak</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ══ TAB: PERLU REFUND ══ */}
            {activeTab === 'refund' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {isSuperAdmin && pendingRefundCount > 0 && (
                  <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <BadgeCheck size={18} color="#7c3aed" />
                    <p style={{ fontSize: 13, color: '#6d28d9', margin: 0 }}>
                      Ada <strong>{pendingRefundCount}</strong> pengajuan refund yang menunggu konfirmasi kamu sebagai super admin.
                    </p>
                  </div>
                )}

                {!isSuperAdmin && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <RefreshCw size={16} color="#16a34a" />
                    <p style={{ fontSize: 13, color: '#15803d', margin: 0 }}>
                      Pengajuan refund di bawah akan diproses oleh super admin. Kamu hanya perlu memantau statusnya.
                    </p>
                  </div>
                )}

                {loadingRefund ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid #2d5a3d', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                  </div>
                ) : pendingRefunds.length === 0 ? (
                  <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #ede9e0', padding: '64px 0', textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                    <p style={{ fontSize: 13, color: '#b5a99a', margin: 0 }}>Tidak ada pesanan yang perlu direfund</p>
                  </div>
                ) : (
                  pendingRefunds.map(r => renderRefundCard(r))
                )}
              </div>
            )}

            {/* ══ TAB: REFUND SELESAI ══ */}
            {activeTab === 'selesai' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircle size={16} color="#16a34a" />
                  <p style={{ fontSize: 13, color: '#15803d', margin: 0 }}>
                    Semua refund di bawah sudah berhasil diproses. Bukti transfer tersimpan untuk arsip.
                  </p>
                </div>

                {loadingRefund ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid #2d5a3d', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                  </div>
                ) : selesaiRefunds.length === 0 ? (
                  <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #ede9e0', padding: '64px 0', textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                    <p style={{ fontSize: 13, color: '#b5a99a', margin: 0 }}>Belum ada refund yang selesai diproses</p>
                  </div>
                ) : (
                  selesaiRefunds.map(r => renderRefundCard(r))
                )}
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ══ PREVIEW BUKTI ══ */}
      {preview && (
        <>
          <div onClick={() => setPreview(null)} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(30,26,20,0.55)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.18s ease' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', zIndex: 51, transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 20, width: 420, overflow: 'hidden', boxShadow: '0 24px 60px rgba(30,26,20,0.18)', animation: 'slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f5f1eb' }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: '#1e1a14' }}>Bukti transfer</span>
              <button onClick={() => setPreview(null)} style={{ border: 'none', background: '#f5f1eb', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a7f6f' }}><X size={13} /></button>
            </div>
            <div style={{ padding: 16 }}>
              <img src={preview} alt="Bukti" style={{ width: '100%', borderRadius: 12, maxHeight: 380, objectFit: 'contain' }} />
            </div>
          </div>
        </>
      )}

      {/* ══ MODAL TOLAK ══ */}
      {showReject && rejectTarget && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(30,26,20,0.45)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.18s ease' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', zIndex: 51, transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(30,26,20,0.18)', animation: 'slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)', fontFamily: "'DM Sans', sans-serif" }}>

            <div style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f5f1eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={16} color="#e74c3c" />
                </div>
                <div>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: '#1e1a14', margin: 0 }}>Tolak Pembayaran</p>
                  <p style={{ fontSize: 11, color: '#b5a99a', margin: 0 }}>
                    {rejectTarget.invoice_number || `#${String(rejectTarget.order_id).padStart(4, '0')}`} · {rejectTarget.customer_name}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowReject(false)} style={{ border: 'none', background: '#f5f1eb', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a7f6f' }}><X size={14} /></button>
            </div>

            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>

              {/* Info pelanggan */}
              <div style={{ background: '#faf9f6', borderRadius: 12, border: '1px solid #ede9e0', padding: '14px 16px' }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: '#b5a99a', letterSpacing: '0.7px', textTransform: 'uppercase', margin: '0 0 8px' }}>Info Pelanggan</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#1e1a14', margin: '0 0 2px' }}>{rejectTarget.customer_name}</p>
                <p style={{ fontSize: 12, color: '#b5a99a', margin: 0 }}>{rejectTarget.email}</p>
                {rejectTarget.phone && <p style={{ fontSize: 12, color: '#b5a99a', margin: 0 }}>{rejectTarget.phone}</p>}
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: '#2d5a3d', margin: '6px 0 0' }}>{formatRp(rejectTarget.total_price)}</p>
              </div>

              {/* Alasan penolakan */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#5a5346', marginBottom: 10 }}>
                  Alasan penolakan <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {REJECT_REASONS.map(reason => {
                    const active = rejectForm.reject_reason === reason;
                    return (
                      <div key={reason} onClick={() => setRejectForm(f => ({ ...f, reject_reason: reason }))} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, cursor: 'pointer', border: `1.5px solid ${active ? '#f5b8b1' : '#ede9e0'}`, background: active ? '#fff5f5' : '#fff', transition: 'all 0.15s' }}
                        onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#faf9f6'; }}
                        onMouseLeave={e => { if (!active) e.currentTarget.style.background = '#fff'; }}
                      >
                        <div style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, border: `2px solid ${active ? '#e74c3c' : '#d4cfc8'}`, background: active ? '#e74c3c' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                          {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                        </div>
                        <span style={{ fontSize: 13, color: '#5a5346' }}>{reason}</span>
                      </div>
                    );
                  })}
                </div>
                {rejectForm.reject_reason === 'Lainnya' && (
                  <textarea value={rejectForm.custom_reason} onChange={e => setRejectForm(f => ({ ...f, custom_reason: e.target.value }))} rows={2} placeholder="Tulis alasan penolakan..." className="kb-input"
                    style={{ ...inputStyle, height: 'auto', padding: '10px 12px', marginTop: 10, resize: 'none', lineHeight: 1.6 }} />
                )}
              </div>

              {/* Info rekening — pakai fallback ke data users kalau payments belum ter-update */}
              {(() => {
                const rek = rejectTarget.bank_account_number || rejectTarget.u_bank_account_number;
                const bank = rejectTarget.bank_name || rejectTarget.u_bank_name;
                const nama = rejectTarget.bank_account_name || rejectTarget.u_bank_account_name;
                return (
                  <div style={{ background: rek ? '#edf5f0' : '#fff8ee', border: `1px solid ${rek ? '#b5ddc8' : '#fde68a'}`, borderRadius: 12, padding: '14px 16px' }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: rek ? '#2d5a3d' : '#d97706', letterSpacing: '0.6px', textTransform: 'uppercase', margin: '0 0 6px' }}>
                      Rekening refund customer
                    </p>
                    {rek ? (
                      <>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#1a3d2b', margin: '0 0 2px' }}>{bank}</p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#1a3d2b', fontFamily: 'monospace', margin: '0 0 2px' }}>{rek}</p>
                        <p style={{ fontSize: 12, color: '#2d5a3d', margin: 0 }}>a.n. {nama}</p>
                      </>
                    ) : (
                      <p style={{ fontSize: 12, color: '#92400e', margin: 0, lineHeight: 1.6 }}>
                        Customer belum mengisi rekening bank. Refund tetap bisa diajukan — super admin akan menunggu customer melengkapi rekeningnya sebelum transfer.
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Info super admin proses */}
              <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10 }}>
                <BadgeCheck size={15} color="#7c3aed" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: '#6d28d9', margin: 0, lineHeight: 1.6 }}>
                  Upload bukti transfer refund dilakukan oleh <strong>super admin</strong>. Setelah kamu klik "Tolak & Ajukan Refund", pengajuan akan otomatis masuk ke antrian super admin.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 14, borderTop: '1px solid #f5f1eb' }}>
                <button onClick={() => setShowReject(false)} style={{ width: '100%', height: 42, borderRadius: 12, border: '1.5px solid #ede9e0', background: '#fff', fontSize: 13, color: '#5a5346', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                  onMouseEnter={e => e.currentTarget.style.background = '#faf9f6'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >Batal</button>

                <button onClick={handleReject} disabled={processing === rejectTarget.order_id} style={{ width: '100%', height: 42, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#c0392b,#e74c3c)', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: processing === rejectTarget.order_id ? 0.6 : 1 }}>
                  {processing === rejectTarget.order_id
                    ? <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                    : <><XCircle size={13} /> Tolak & Ajukan Refund ke Super Admin</>
                  }
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══ MODAL KONFIRMASI REFUND (super admin only) ══ */}
      {showConfirmRefund && confirmTarget && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(30,26,20,0.45)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.18s ease' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', zIndex: 51, transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460, boxShadow: '0 24px 60px rgba(30,26,20,0.18)', animation: 'slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)', fontFamily: "'DM Sans', sans-serif" }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f5f1eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BadgeCheck size={16} color="#7c3aed" />
                </div>
                <div>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: '#1e1a14', margin: 0 }}>Konfirmasi Refund</p>
                  <p style={{ fontSize: 11, color: '#b5a99a', margin: 0 }}>
                    {confirmTarget.invoice_number || `#${String(confirmTarget.order_id).padStart(4, '0')}`} · {confirmTarget.customer_name}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowConfirmRefund(false)} style={{ border: 'none', background: '#f5f1eb', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a7f6f' }}><X size={14} /></button>
            </div>

            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              <div style={{ background: '#edf5f0', border: '1px solid #b5ddc8', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: '#2d5a3d', letterSpacing: '0.7px', textTransform: 'uppercase', margin: '0 0 6px' }}>Transfer refund ke</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1a3d2b', margin: '0 0 2px' }}>{confirmTarget.refund_bank}</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#1a3d2b', margin: '0 0 2px', fontFamily: 'monospace' }}>{confirmTarget.refund_rekening}</p>
                <p style={{ fontSize: 12, color: '#2d5a3d', margin: '0 0 8px' }}>a.n. {confirmTarget.refund_atas_nama}</p>
                <div style={{ borderTop: '1px solid #b5ddc8', paddingTop: 8 }}>
                  <p style={{ fontSize: 10, color: '#2d5a3d', margin: '0 0 2px' }}>Jumlah refund</p>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#2d5a3d', margin: 0 }}>{formatRp(confirmTarget.total_price)}</p>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#5a5346', marginBottom: 4 }}>
                  Bukti transfer refund <span style={{ color: '#e74c3c' }}>*</span>
                </label>
                <p style={{ fontSize: 11, color: '#b5a99a', margin: '0 0 10px' }}>Upload screenshot atau foto bukti transfer yang sudah kamu lakukan.</p>
                {refundPreview ? (
                  <div style={{ position: 'relative' }}>
                    <img src={refundPreview} alt="Bukti refund" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10, border: '1px solid #ede9e0' }} />
                    <button onClick={() => { setRefundProof(null); setRefundPreview(null); }} style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: '50%', background: '#e74c3c', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><X size={11} /></button>
                  </div>
                ) : (
                  <div onClick={() => fileRef.current?.click()} style={{ height: 96, border: '2px dashed #ddd6fe', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 6, transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.background = '#f5f3ff'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#ddd6fe'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Upload size={18} color="#a78bfa" />
                    <span style={{ fontSize: 12, color: '#a78bfa' }}>Klik untuk upload foto bukti refund</span>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleRefundFile} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8, borderTop: '1px solid #f5f1eb' }}>
                <button onClick={() => setShowConfirmRefund(false)} style={{ width: '100%', height: 42, borderRadius: 12, border: '1.5px solid #ede9e0', background: '#fff', fontSize: 13, color: '#5a5346', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                  onMouseEnter={e => e.currentTarget.style.background = '#faf9f6'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >Batal</button>

                <button onClick={handleConfirmRefund} disabled={processing === confirmTarget.order_id || !refundProof} style={{ width: '100%', height: 42, borderRadius: 12, border: 'none', background: !refundProof ? '#f0ede8' : '#7c3aed', fontSize: 13, fontWeight: 600, color: !refundProof ? '#b5a99a' : '#fff', cursor: !refundProof ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: processing === confirmTarget.order_id ? 0.6 : 1 }}>
                  {processing === confirmTarget.order_id
                    ? <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                    : <><BadgeCheck size={13} /> Konfirmasi — Refund Selesai</>
                  }
                </button>
                {!refundProof && <p style={{ fontSize: 11, color: '#b5a99a', textAlign: 'center', margin: 0 }}>Upload bukti transfer untuk mengaktifkan tombol</p>}
              </div>
            </div>
          </div>
        </>
      )}

      {showLogout && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}
    </>
  );
};

export default AdminKonfirmasiBayar;