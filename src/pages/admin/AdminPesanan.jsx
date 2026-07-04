import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Search, Ban, LayoutDashboard, Package,
  ClipboardList, BarChart2, LogOut, CreditCard,
  Users2, X, ChevronRight, Ticket, Truck, ExternalLink,
  MessageSquareWarning,
} from 'lucide-react';

/* ── helpers ── */
const formatRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

const STATUS_STYLE = {
  'Menunggu Pembayaran': { bg: '#f3f4f6', color: '#6b7280' },
  'Menunggu Konfirmasi': { bg: '#fef3c7', color: '#b45309' },
  'Diproses':            { bg: '#dbeafe', color: '#1d4ed8' },
  'Dikirim':             { bg: '#ede9fe', color: '#6d28d9' },
  'Selesai':             { bg: '#d1fae5', color: '#065f46' },
  'Dibatalkan':          { bg: '#fee2e2', color: '#b91c1c' },
};

const KOMPLAIN_STATUS_STYLE = {
  'Menunggu': { bg: '#fef3c7', color: '#b45309' },
  'Selesai':  { bg: '#d1fae5', color: '#065f46' },
};

const KomplainBadge = ({ status }) => {
  const s = KOMPLAIN_STATUS_STYLE[status] || { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span style={{ fontSize: 11, fontWeight: 500, padding: '4px 11px', borderRadius: 20, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>{status}</span>
  );
};

const STATUS_LIST = [
  'Aktif', 'Semua',
  'Menunggu Pembayaran', 'Menunggu Konfirmasi',
  'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan',
];

const ACTIVE_STATUSES = [
  'Menunggu Pembayaran', 'Menunggu Konfirmasi', 'Diproses', 'Dikirim',
];

const LOCKED_STATUSES = ['Dibatalkan', 'Selesai', 'Menunggu Konfirmasi'];

const KURIR_LIST = ['JNE', 'J&T', 'SiCepat', 'AnterAja', 'Ninja Xpress', 'Pos Indonesia'];

/* Link cek resi berdasarkan kurir */
const getCekResiUrl = (kurir, no_resi) => {
  const r = encodeURIComponent(no_resi || '');
  const map = {
    'JNE':          `https://www.jne.co.id/id/tracking/trace?awbNumber=${r}`,
    'J&T':          `https://www.jet.co.id/track/${r}`,
    'SiCepat':      `https://www.sicepat.com/checkAwb?awb=${r}`,
    'AnterAja':     `https://anteraja.id/tracking/${r}`,
    'Ninja Xpress': `https://www.ninjaxpress.co/id-id/tracking?id=${r}`,
    'Pos Indonesia': `https://www.posindonesia.co.id/id/tracking`,
  };
  return map[kurir] || `https://cekresi.com/?resi=${r}`;
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
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(30,26,20,0.45)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.18s ease' }} />
    <div style={{ position: 'fixed', top: '50%', left: '50%', zIndex: 51, transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 20, padding: '36px 32px 28px', width: 360, boxShadow: '0 24px 60px rgba(30,26,20,0.18)', animation: 'slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)', fontFamily: "'DM Sans', sans-serif" }}>
      <button onClick={onCancel} style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: '#f5f1eb', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a7f6f' }}><X size={14} /></button>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#fff3e8,#ffe0c8)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><LogOut size={24} color="#d97706" /></div>
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1e1a14', margin: '0 0 8px' }}>Keluar dari akun?</p>
      <p style={{ fontSize: 14, color: '#8a7f6f', margin: '0 0 28px', lineHeight: 1.6 }}>Kamu akan keluar dari sesi admin. Pastikan semua perubahan sudah tersimpan sebelum lanjut.</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: '1.5px solid #ede9e0', background: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: '#5a5346', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = '#faf9f6'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>Batal</button>
        <button onClick={onConfirm} style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#c0392b,#e74c3c)', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.88'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Ya, Keluar</button>
      </div>
    </div>
  </>
);

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

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLE[status] || { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span style={{ fontSize: 11, fontWeight: 500, padding: '4px 11px', borderRadius: 20, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>{status}</span>
  );
};

/* ══ TABEL KOMPLAIN ══ */
const KomplainTable = ({ list, loading, onOpen }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans', sans-serif" }}>
      <thead>
        <tr style={{ borderBottom: '1px solid #f5f1eb' }}>
          {['No. Pesanan', 'Pelanggan', 'Alasan', 'Status', 'Tanggal', 'Aksi'].map(h => (
            <th key={h} style={{ textAlign: 'left', padding: '10px 20px', fontSize: 10, color: '#b5a99a', fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {loading ? (
          [...Array(4)].map((_, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f9f7f4' }}>
              {[140, 180, 160, 100, 90, 70].map((w, j) => (
                <td key={j} style={{ padding: '14px 20px' }}>
                  <div style={{ height: 10, background: '#f0ede8', borderRadius: 6, width: w }} />
                </td>
              ))}
            </tr>
          ))
        ) : list.length === 0 ? (
          <tr>
            <td colSpan={6} style={{ padding: '56px', textAlign: 'center', fontSize: 13, color: '#b5a99a' }}>
              Belum ada komplain masuk
            </td>
          </tr>
        ) : list.map(k => (
          <tr key={k.id} className="orders-row" style={{ borderBottom: '1px solid #f9f7f4' }}>
            <td style={{ padding: '13px 20px', fontSize: 12, color: '#b5a99a', fontFamily: 'monospace' }}>
              {k.invoice_number || `#${String(k.id).padStart(4, '0')}`}
            </td>
            <td style={{ padding: '13px 20px' }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#1e1a14', margin: '0 0 2px' }}>{k.customer_name}</p>
              <p style={{ fontSize: 11, color: '#b5a99a', margin: 0 }}>{k.email}</p>
            </td>
            <td style={{ padding: '13px 20px', fontSize: 12, color: '#3a3530', maxWidth: 200 }}>{k.komplain_reason}</td>
            <td style={{ padding: '13px 20px' }}><KomplainBadge status={k.komplain_status || 'Menunggu'} /></td>
            <td style={{ padding: '13px 20px', fontSize: 12, color: '#b5a99a' }}>
              {k.komplain_created_at ? new Date(k.komplain_created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
            </td>
            <td style={{ padding: '13px 20px' }}>
              <button onClick={() => onOpen(k)} style={{ border: 'none', background: 'none', padding: 0, fontSize: 12, color: '#2d5a3d', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Tanggapi</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ══ DETAIL MODAL ══ */
const DetailModal = ({ detail, loadingDetail, onClose, onChangeStatus, LOCKED_STATUSES }) => (
  <>
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(30,26,20,0.4)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.18s ease' }} />
    <div style={{ position: 'fixed', top: '50%', left: '50%', zIndex: 51, transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(30,26,20,0.18)', animation: 'slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)', fontFamily: "'DM Sans', sans-serif" }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '22px 24px 18px', borderBottom: '1px solid #f5f1eb', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
        <div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: '#1e1a14', margin: '0 0 6px' }}>
            {detail.invoice_number || `#${String(detail.id).padStart(4, '0')}`}
          </p>
          <StatusBadge status={detail.status} />
        </div>
        <button onClick={onClose} style={{ border: 'none', background: '#f5f1eb', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a7f6f', flexShrink: 0 }}><X size={14} /></button>
      </div>

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Info pelanggan */}
        <div style={{ background: '#faf9f6', borderRadius: 14, padding: '16px 18px' }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#b5a99a', letterSpacing: '0.7px', textTransform: 'uppercase', margin: '0 0 12px' }}>Info Pelanggan</p>
          {[
            ['Nama', detail.customer_name],
            ['Email', detail.email],
            ['Telepon', detail.phone || '—'],
            ['Alamat', detail.shipping_address],
            ...(detail.note ? [['Catatan', detail.note]] : []),
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#b5a99a', flexShrink: 0 }}>{k}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#1e1a14', textAlign: 'right' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Info resi — muncul kalau status Dikirim */}
        {detail.status === 'Dikirim' && detail.kurir && (
          <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Truck size={14} color="#7c3aed" />
              <p style={{ fontSize: 10, fontWeight: 600, color: '#7c3aed', letterSpacing: '0.7px', textTransform: 'uppercase', margin: 0 }}>Info Pengiriman</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#8b5cf6' }}>Kurir</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1e1a14' }}>{detail.kurir}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#8b5cf6' }}>No. Resi</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e1a14', fontFamily: 'monospace' }}>{detail.no_resi}</span>
            </div>
            <a
              href={getCekResiUrl(detail.kurir, detail.no_resi)}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 12, color: '#7c3aed', fontWeight: 500, textDecoration: 'none' }}
            >
              <ExternalLink size={12} /> Cek status pengiriman
            </a>
          </div>
        )}

        {/* Alasan batal */}
        {detail.status === 'Dibatalkan' && detail.cancel_reason && (
          <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 14, padding: '14px 18px', display: 'flex', gap: 12 }}>
            <Ban size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#b91c1c', margin: '0 0 3px' }}>Alasan pembatalan</p>
              <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{detail.cancel_reason}</p>
            </div>
          </div>
        )}

        {/* Hint Menunggu Konfirmasi */}
        {detail.status === 'Menunggu Konfirmasi' && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '14px 18px' }}>
            <p style={{ fontSize: 12, color: '#92400e', margin: 0 }}>
              Pesanan ini menunggu konfirmasi pembayaran. Proses di halaman{' '}
              <a href="/admin/bayar" style={{ color: '#d97706', fontWeight: 600 }}>Konfirmasi Bayar</a>.
            </p>
          </div>
        )}

        {/* Item pesanan */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#b5a99a', letterSpacing: '0.7px', textTransform: 'uppercase', margin: '0 0 12px' }}>Item Pesanan</p>
          {loadingDetail ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2.5px solid #2d5a3d', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {detail.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#faf9f6', borderRadius: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: '#edf5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, overflow: 'hidden' }}>
                    {item.image
                      ? <img src={item.image} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : '🍪'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#1e1a14', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product_name}</p>
                    <p style={{ fontSize: 11, color: '#b5a99a', margin: 0 }}>{item.quantity} toples × {formatRp(item.price)}</p>
                  </div>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: 700, color: '#2d5a3d', flexShrink: 0 }}>{formatRp(item.quantity * item.price)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Total */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid #f5f1eb' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1e1a14' }}>Total Pembayaran</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#2d5a3d' }}>{formatRp(detail.total_price)}</span>
        </div>

        {/* Bukti bayar */}
        {detail.payment && (
          <div style={{ background: '#faf9f6', borderRadius: 14, padding: '16px 18px' }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#b5a99a', letterSpacing: '0.7px', textTransform: 'uppercase', margin: '0 0 12px' }}>Pembayaran</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: '#b5a99a' }}>Status</span>
              <StatusBadge status={detail.payment.status} />
            </div>
            {detail.payment.proof_image && (
              <img src={detail.payment.proof_image} alt="Bukti transfer" style={{ width: '100%', borderRadius: 10, objectFit: 'contain', maxHeight: 200, marginTop: 8 }} />
            )}
          </div>
        )}

        {/* Tombol ubah status */}
        {!LOCKED_STATUSES.includes(detail.status) && (
          <button onClick={onChangeStatus} style={{ width: '100%', height: 42, borderRadius: 12, border: '1.5px solid #c6dfc7', background: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: '#2d5a3d', cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#edf5f0'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >Ubah status pesanan</button>
        )}
      </div>
    </div>
  </>
);

const STATUS_OPTIONS = ['Menunggu Pembayaran', 'Diproses', 'Dikirim', 'Selesai'];

/* ══ UBAH STATUS MODAL ══ */
const UbahStatusModal = ({ selected, newStatus, setNewStatus, resiForm, setResiForm, updating, onConfirm, onCancel }) => {
  const needsResi = newStatus === 'Dikirim';
  const inputStyle = {
    width: '100%', height: 38, padding: '0 12px', fontSize: 13,
    border: '1.5px solid #ede9e0', borderRadius: 10, outline: 'none',
    fontFamily: "'DM Sans', sans-serif", color: '#1e1a14', background: '#fff',
    boxSizing: 'border-box', transition: 'border-color 0.15s',
  };

  return (
    <>
      <div onClick={onCancel} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(30,26,20,0.4)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.18s ease' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', zIndex: 51, transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 20, padding: '28px 28px 24px', width: 380, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(30,26,20,0.18)', animation: 'slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)', fontFamily: "'DM Sans', sans-serif" }}>
        <button onClick={onCancel} style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: '#f5f1eb', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a7f6f' }}><X size={14} /></button>

        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: '#1e1a14', margin: '0 0 4px' }}>Ubah status pesanan</p>
        <p style={{ fontSize: 12, color: '#b5a99a', margin: '0 0 20px' }}>
          {selected.invoice_number || `#${String(selected.id).padStart(4, '0')}`} · {selected.customer_name}
        </p>

        {/* Pilihan status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: needsResi ? 20 : 22 }}>
          {STATUS_OPTIONS.map(s => {
            const isActive = newStatus === s;
            return (
              <div key={s} onClick={() => setNewStatus(s)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, cursor: 'pointer', background: isActive ? '#edf5f0' : 'transparent', border: isActive ? '1px solid #c6dfc7' : '1px solid transparent', transition: 'all 0.14s' }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#faf9f6'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${isActive ? '#2d5a3d' : '#d1c9bc'}`, background: isActive ? '#2d5a3d' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.14s' }}>
                  {isActive && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                </div>
                <StatusBadge status={s} />
                {s === 'Dikirim' && <span style={{ fontSize: 10, color: '#8b5cf6', marginLeft: 'auto' }}>+ input resi</span>}
              </div>
            );
          })}
        </div>

        {/* Form resi — muncul kalau pilih Dikirim */}
        {needsResi && (
          <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 14, padding: '16px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Truck size={14} color="#7c3aed" />
              <p style={{ fontSize: 11, fontWeight: 600, color: '#7c3aed', letterSpacing: '0.6px', textTransform: 'uppercase', margin: 0 }}>Info Pengiriman</p>
            </div>

            {/* Pilih kurir */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#5a5346', marginBottom: 6 }}>
                Kurir <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {KURIR_LIST.map(k => {
                  const active = resiForm.kurir === k;
                  return (
                    <button key={k} onClick={() => setResiForm(f => ({ ...f, kurir: k }))} style={{ padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${active ? '#7c3aed' : '#ddd6fe'}`, background: active ? '#7c3aed' : '#fff', color: active ? '#fff' : '#6d28d9', fontSize: 11, fontWeight: active ? 600 : 400, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.14s' }}>
                      {k}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* No resi */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#5a5346', marginBottom: 6 }}>
                Nomor Resi <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <input
                value={resiForm.no_resi}
                onChange={e => setResiForm(f => ({ ...f, no_resi: e.target.value }))}
                placeholder="Contoh: 1234567890"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#ede9e0'}
              />
            </div>

            {(!resiForm.kurir || !resiForm.no_resi) && (
              <p style={{ fontSize: 11, color: '#a78bfa', margin: 0 }}>
                Kurir dan nomor resi wajib diisi untuk mengubah status ke Dikirim.
              </p>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: '1.5px solid #ede9e0', background: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: '#5a5346', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = '#faf9f6'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>Batal</button>
          <button
            onClick={onConfirm}
            disabled={updating || (needsResi && (!resiForm.kurir || !resiForm.no_resi.trim()))}
            style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: 'none', background: needsResi && (!resiForm.kurir || !resiForm.no_resi.trim()) ? '#e5e7eb' : 'linear-gradient(135deg,#2d5a3d,#4a9e6b)', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: needsResi && (!resiForm.kurir || !resiForm.no_resi.trim()) ? '#9ca3af' : '#fff', cursor: updating || (needsResi && (!resiForm.kurir || !resiForm.no_resi.trim())) ? 'not-allowed' : 'pointer', opacity: updating ? 0.7 : 1, transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {updating
              ? <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
              : 'Simpan'}
          </button>
        </div>
      </div>
    </>
  );
};

/* ══ MODAL TANGGAPI KOMPLAIN ══ */
const KOMPLAIN_ACTIONS = [
  { key: 'refund',      label: 'Refund',       desc: 'Pesanan dibatalkan & refund diproses ke rekening customer', color: '#dc2626', bg: '#fff5f5', border: '#fecaca' },
  { key: 'kirim_ulang', label: 'Kirim Ulang',  desc: 'Barang pengganti akan dikirim ulang ke customer',            color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  { key: 'tolak',       label: 'Tolak',        desc: 'Komplain ditolak, pesanan tetap berjalan seperti biasa',     color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
];

const KomplainModal = ({ komplain, form, setForm, resolving, onConfirm, onCancel }) => (
  <>
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(30,26,20,0.4)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.18s ease' }} />
    <div style={{ position: 'fixed', top: '50%', left: '50%', zIndex: 51, transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(30,26,20,0.18)', animation: 'slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)', fontFamily: "'DM Sans', sans-serif", padding: '28px 28px 24px' }}>
      <button onClick={onCancel} style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: '#f5f1eb', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a7f6f' }}><X size={14} /></button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <MessageSquareWarning size={18} color="#b45309" />
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700, color: '#1e1a14', margin: 0 }}>Tanggapi Komplain</p>
      </div>
      <p style={{ fontSize: 12, color: '#b5a99a', margin: '0 0 18px' }}>
        {komplain.invoice_number || `#${String(komplain.id).padStart(4, '0')}`} · {komplain.customer_name}
      </p>

      <div style={{ background: '#fff8ee', border: '1px solid #fde68a', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#b45309', margin: '0 0 4px' }}>Alasan komplain</p>
        <p style={{ fontSize: 13, color: '#92400e', margin: 0 }}>{komplain.komplain_reason}</p>
      </div>

      {komplain.komplain_foto && (
        <img src={komplain.komplain_foto} alt="Bukti komplain" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 10, border: '1px solid #ede9e0', marginBottom: 16 }} />
      )}

      <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#5a5346', marginBottom: 8 }}>Pilih tindakan</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {KOMPLAIN_ACTIONS.map(a => {
          const active = form.action === a.key;
          return (
            <div key={a.key} onClick={() => setForm(f => ({ ...f, action: a.key }))}
              style={{ padding: '12px 14px', borderRadius: 12, cursor: 'pointer', border: `1.5px solid ${active ? a.color : '#ede9e0'}`, background: active ? a.bg : '#fff', transition: 'all 0.14s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                <div style={{ width: 15, height: 15, borderRadius: '50%', border: `2px solid ${active ? a.color : '#d1c9bc'}`, background: active ? a.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {active && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: active ? a.color : '#1e1a14' }}>{a.label}</span>
              </div>
              <p style={{ fontSize: 11, color: '#8a7f6f', margin: '0 0 0 25px' }}>{a.desc}</p>
            </div>
          );
        })}
      </div>

      <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#5a5346', marginBottom: 6 }}>Catatan untuk pelanggan (opsional)</label>
      <textarea
        value={form.catatan}
        onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))}
        placeholder="Contoh: Mohon maaf atas ketidaknyamanannya, kami akan kirim ulang barang..."
        rows={4}
        style={{ width: '100%', padding: '10px 12px', fontSize: 13, border: '1.5px solid #ede9e0', borderRadius: 10, outline: 'none', fontFamily: "'DM Sans', sans-serif", color: '#1e1a14', resize: 'vertical', marginBottom: 20, boxSizing: 'border-box' }}
      />

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: '1.5px solid #ede9e0', background: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: '#5a5346', cursor: 'pointer' }}>Batal</button>
        <button onClick={onConfirm} disabled={resolving || !form.action}
          style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: 'none', background: !form.action ? '#e5e7eb' : 'linear-gradient(135deg,#2d5a3d,#4a9e6b)', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: !form.action ? '#9ca3af' : '#fff', cursor: resolving || !form.action ? 'not-allowed' : 'pointer', opacity: resolving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {resolving ? <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} /> : 'Simpan Tindakan'}
        </button>
      </div>
    </div>
  </>
);

/* ══════════════════════════════════════════
   ADMIN PESANAN
══════════════════════════════════════════ */
const AdminPesanan = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [activeStatus, setActive]         = useState('Aktif');
  const [search, setSearch]               = useState('');
  const [dateFrom, setDateFrom]           = useState('');
  const [dateTo, setDateTo]               = useState('');
  const [selected, setSelected]           = useState(null);
  const [newStatus, setNewStatus]         = useState('');
  const [resiForm, setResiForm]           = useState({ kurir: '', no_resi: '' });
  const [updating, setUpdating]           = useState(false);
  const [detail, setDetail]               = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [highlightInvoice, setHighlightInvoice] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const inv = params.get('highlight');
    if (!inv) return;
    setHighlightInvoice(inv);
    setActive('Semua'); 
    setTimeout(() => {
      const el = document.getElementById(`row-${inv}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 600); // tunggu data loaded
    setTimeout(() => setHighlightInvoice(null), 6000); 
  }, []);

  const [showLogout, setShowLogout] = useState(false);
  const [mainTab, setMainTab]             = useState('pesanan'); // 'pesanan' | 'komplain'
  const [komplainList, setKomplainList]   = useState([]);
  const [loadingKomplain, setLoadingKomplain] = useState(false);
  const [selectedKomplain, setSelectedKomplain] = useState(null);
  const [resolveForm, setResolveForm]     = useState({ action: '', catatan: '' });
  const [resolving, setResolving]         = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeStatus === 'Aktif') params.status = ACTIVE_STATUSES.join(',');
      else if (activeStatus !== 'Semua') params.status = activeStatus;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo)   params.date_to   = dateTo;
      const { data } = await api.get('/orders/admin/all', { params });
      setOrders(data);
    } catch {
      toast.error('Gagal memuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [activeStatus, dateFrom, dateTo]);

  const fetchKomplain = async () => {
    setLoadingKomplain(true);
    try {
      const { data } = await api.get('/orders/admin/komplain');
      setKomplainList(Array.isArray(data) ? data : data?.data ?? []);
    } catch {
      toast.error('Gagal memuat daftar komplain');
    } finally {
      setLoadingKomplain(false);
    }
  };

  useEffect(() => {
    if (mainTab === 'komplain') fetchKomplain();
  }, [mainTab]);

  const openKomplain = (k) => {
    setSelectedKomplain(k);
    setResolveForm({ action: '', catatan: '' });
  };

  const handleResolveKomplain = async () => {
    if (!selectedKomplain || !resolveForm.action) return;
    setResolving(true);
    try {
      await api.put(`/orders/${selectedKomplain.id}/komplain/resolve`, {
        action: resolveForm.action,
        catatan: resolveForm.catatan,
      });
      toast.success('Komplain berhasil ditindaklanjuti');
      setSelectedKomplain(null);
      fetchKomplain();
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menindaklanjuti komplain');
    } finally {
      setResolving(false);
    }
  };

  const filtered = orders.filter(o =>
    o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    String(o.id).includes(search)
  );

  const openDetail = async (order) => {
    setLoadingDetail(true);
    setDetail({ ...order, items: [], payment: null });
    try {
      const { data } = await api.get(`/orders/${order.id}`);
      setDetail(data);
    } catch {
      toast.error('Gagal memuat detail pesanan');
    } finally {
      setLoadingDetail(false);
    }
  };

  const openUbahStatus = (order) => {
    setSelected(order);
    setNewStatus(order.status);
    setResiForm({ kurir: '', no_resi: '' });
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || !selected) return;
    if (newStatus === 'Dikirim' && (!resiForm.kurir || !resiForm.no_resi.trim())) {
      toast.error('Kurir dan nomor resi wajib diisi');
      return;
    }
    setUpdating(true);
    try {
      const payload = { status: newStatus };
      if (newStatus === 'Dikirim') {
        payload.kurir   = resiForm.kurir;
        payload.no_resi = resiForm.no_resi.trim();
      }
      await api.put(`/orders/${selected.id}/status`, payload);
      toast.success('Status berhasil diperbarui');
      setSelected(null);
      fetchOrders();
      if (detail?.id === selected.id) setDetail(d => ({ ...d, status: newStatus, ...( newStatus === 'Dikirim' ? { kurir: resiForm.kurir, no_resi: resiForm.no_resi } : {}) }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui status');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => { logout?.(); navigate('/login'); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .orders-row { transition: background 0.14s; }
        .orders-row:hover { background: #faf9f6 !important; }
        .tab-btn { border: none; background: transparent; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        @keyframes spin    { to { transform:rotate(360deg) } }
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0;transform:translate(-50%,-44%) } to { opacity:1;transform:translate(-50%,-50%) } }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #d4cfc8; border-radius: 99px; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: '#faf9f6', fontFamily: "'DM Sans', sans-serif" }}>
        <Sidebar onLogoutClick={() => setShowLogout(true)} userRole={user?.role} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <header style={{ padding: '20px 32px', borderBottom: '1px solid #ede9e0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1e1a14', margin: 0 }}>Pesanan</h1>
              <p style={{ fontSize: 12, color: '#b5a99a', margin: '2px 0 0' }}>Kelola & pantau semua pesanan masuk</p>
            </div>
            <div style={{ fontSize: 12, color: '#8a7f6f', background: '#f5f1eb', padding: '6px 14px', borderRadius: 20 }}>
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </header>

          <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #ede9e0', overflow: 'hidden' }}>

              {/* Tab utama: Pesanan / Komplain */}
              <div style={{ display: 'flex', gap: 4, padding: '16px 20px 0' }}>
                {[
                  { key: 'pesanan', label: 'Semua Pesanan' },
                  { key: 'komplain', label: `Komplain${komplainList.length ? ` (${komplainList.length})` : ''}` },
                ].map(t => {
                  const active = mainTab === t.key;
                  return (
                    <button key={t.key} className="tab-btn" onClick={() => setMainTab(t.key)}
                      style={{ padding: '9px 16px', fontSize: 13, fontWeight: active ? 600 : 400, color: active ? '#fff' : '#5a5346', background: active ? '#2d5a3d' : '#f5f1eb', borderRadius: 10, transition: 'all 0.15s' }}>
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {mainTab === 'pesanan' ? (
              <>
              {/* Filter row */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f5f1eb', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200, maxWidth: 280, height: 36, background: '#faf9f6', border: '1px solid #ede9e0', borderRadius: 10, padding: '0 12px' }}>
                  <Search size={13} color="#c5bfb4" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau ID pesanan..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#1e1a14', fontFamily: "'DM Sans', sans-serif" }} />
                </div>
                {[
                  { label: 'Dari', value: dateFrom, onChange: e => setDateFrom(e.target.value), min: undefined },
                  { label: 's/d', value: dateTo,   onChange: e => setDateTo(e.target.value),   min: dateFrom || undefined },
                ].map(({ label, value, onChange, min }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: '#b5a99a', whiteSpace: 'nowrap' }}>{label}</span>
                    <input type="date" value={value} min={min} onChange={onChange} style={{ height: 36, padding: '0 12px', fontSize: 12, background: '#faf9f6', border: '1px solid #ede9e0', borderRadius: 10, color: '#1e1a14', outline: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }} />
                  </div>
                ))}
                {(dateFrom || dateTo) && (
                  <button onClick={() => { setDateFrom(''); setDateTo(''); }} style={{ height: 36, padding: '0 14px', borderRadius: 10, border: '1px solid #ede9e0', background: '#fff', fontSize: 12, color: '#8a7f6f', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }} onMouseEnter={e => e.currentTarget.style.background = '#faf9f6'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>Reset filter</button>
                )}
                <span style={{ fontSize: 11, color: '#b5a99a', marginLeft: 'auto' }}>{filtered.length} pesanan</span>
              </div>

              {/* Status tabs */}
              <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #f5f1eb', padding: '0 8px' }}>
                {STATUS_LIST.map(s => {
                  const active = activeStatus === s;
                  return (
                    <button key={s} className="tab-btn" onClick={() => setActive(s)} style={{ padding: '12px 14px', fontSize: 12, fontWeight: active ? 600 : 400, color: active ? '#2d5a3d' : '#b5a99a', borderBottom: active ? '2.5px solid #2d5a3d' : '2.5px solid transparent', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#5a5346'; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#b5a99a'; }}
                    >{s}</button>
                  );
                })}
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans', sans-serif" }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #f5f1eb' }}>
                      {['No. Pesanan', 'Pelanggan', 'Total', 'Status', 'Tanggal', 'Aksi'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 20px', fontSize: 10, color: '#b5a99a', fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(6)].map((_, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f9f7f4' }}>
                          {[140, 180, 100, 120, 90, 70].map((w, j) => (
                            <td key={j} style={{ padding: '14px 20px' }}>
                              <div style={{ height: 10, background: '#f0ede8', borderRadius: 6, width: w }} />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '56px', textAlign: 'center', fontSize: 13, color: '#b5a99a' }}>
                          {activeStatus === 'Aktif' ? 'Tidak ada pesanan aktif saat ini' : 'Tidak ada pesanan'}
                        </td>
                      </tr>
                    ) : filtered.map(order => (
                      <tr key={order.id} id={`row-${order.invoice_number}`} className="orders-row"
                        style={{ borderBottom: '1px solid #f9f7f4', background: highlightInvoice === order.invoice_number ? '#edf5f0' : 'transparent', transition: 'background 1s ease', }}>
                        <td style={{ padding: '13px 20px', fontSize: 12, color: '#b5a99a', fontFamily: 'monospace' }}>
                          {order.invoice_number || `#${String(order.id).padStart(4, '0')}`}
                        </td>
                        <td style={{ padding: '13px 20px' }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: '#1e1a14', margin: '0 0 2px' }}>{order.customer_name}</p>
                          <p style={{ fontSize: 11, color: '#b5a99a', margin: 0 }}>{order.email}</p>
                        </td>
                        <td style={{ padding: '13px 20px', fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, color: '#2d5a3d' }}>
                          {formatRp(order.total_price)}
                        </td>
                        <td style={{ padding: '13px 20px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <StatusBadge status={order.status} />
                            {order.status === 'Menunggu Konfirmasi' && (
                              <a href="/admin/bayar" style={{ fontSize: 10, color: '#d97706', textDecoration: 'none' }}>→ Konfirmasi Bayar</a>
                            )}
                            {order.status === 'Dikirim' && order.kurir && (
                              <span style={{ fontSize: 10, color: '#7c3aed' }}>{order.kurir} · {order.no_resi}</span>
                            )}
                            {order.status === 'Dibatalkan' && order.cancel_reason && (
                              <span style={{ fontSize: 10, color: '#b5a99a', maxWidth: 160 }}>{order.cancel_reason}</span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '13px 20px', fontSize: 12, color: '#b5a99a' }}>
                          {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '13px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <button onClick={() => openDetail(order)} style={{ border: 'none', background: 'none', padding: 0, fontSize: 12, color: '#2d5a3d', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Detail</button>
                            {!LOCKED_STATUSES.includes(order.status) && (
                              <>
                                <span style={{ color: '#ede9e0', fontSize: 14 }}>|</span>
                                <button onClick={() => openUbahStatus(order)} style={{ border: 'none', background: 'none', padding: 0, fontSize: 12, color: '#8a7f6f', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Ubah status</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
              ) : (
                <KomplainTable list={komplainList} loading={loadingKomplain} onOpen={openKomplain} />
              )}
            </div>
          </main>
        </div>
      </div>

      {detail && (
        <DetailModal
          detail={detail}
          loadingDetail={loadingDetail}
          onClose={() => setDetail(null)}
          onChangeStatus={() => { openUbahStatus(detail); setDetail(null); }}
          LOCKED_STATUSES={LOCKED_STATUSES}
        />
      )}

      {selected && (
        <UbahStatusModal
          selected={selected}
          newStatus={newStatus}
          setNewStatus={setNewStatus}
          resiForm={resiForm}
          setResiForm={setResiForm}
          updating={updating}
          onConfirm={handleUpdateStatus}
          onCancel={() => setSelected(null)}
        />
      )}

      {showLogout && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}

      {selectedKomplain && (
        <KomplainModal
          komplain={selectedKomplain}
          form={resolveForm}
          setForm={setResolveForm}
          resolving={resolving}
          onConfirm={handleResolveKomplain}
          onCancel={() => setSelectedKomplain(null)}
        />
      )}
    </>
  );
};

export default AdminPesanan;