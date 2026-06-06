import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx-js-style';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  TrendingUp, ShoppingBag, Users, Award,
  LayoutDashboard, Package, ClipboardList,
  BarChart2, LogOut, CreditCard, Users2, X, Download, Ticket,
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

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLE[status] || { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
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

/* ══ EXCEL DOWNLOAD ══ */
const downloadExcel = (data, from, to) => {
  const wb = XLSX.utils.book_new();
  const periodLabel = from && to ? `${from} s/d ${to}` : 'Semua Periode';
  const printDate   = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  /* ── style definitions ── */
  const S = {
    brandTitle: {
      font:      { name: 'Arial', sz: 18, bold: true, color: { rgb: 'FFFFFF' } },
      fill:      { fgColor: { rgb: '1A3D2B' }, patternType: 'solid' },
      alignment: { horizontal: 'center', vertical: 'center' },
    },
    brandSub: {
      font:      { name: 'Arial', sz: 10, color: { rgb: 'A8D5B5' } },
      fill:      { fgColor: { rgb: '1A3D2B' }, patternType: 'solid' },
      alignment: { horizontal: 'center', vertical: 'center' },
    },
    brandMeta: {
      font:      { name: 'Arial', sz: 9, color: { rgb: 'C8E6D0' } },
      fill:      { fgColor: { rgb: '2D5A3D' }, patternType: 'solid' },
      alignment: { horizontal: 'center', vertical: 'center' },
    },
    sectionHeader: {
      font:      { name: 'Arial', sz: 10, bold: true, color: { rgb: 'FFFFFF' } },
      fill:      { fgColor: { rgb: '2D5A3D' }, patternType: 'solid' },
      alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
    },
    colHeader: {
      font:      { name: 'Arial', sz: 10, bold: true, color: { rgb: 'FFFFFF' } },
      fill:      { fgColor: { rgb: '4A9E6B' }, patternType: 'solid' },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        top:    { style: 'thin', color: { rgb: '2D5A3D' } },
        bottom: { style: 'thin', color: { rgb: '2D5A3D' } },
        left:   { style: 'thin', color: { rgb: '2D5A3D' } },
        right:  { style: 'thin', color: { rgb: '2D5A3D' } },
      },
    },
    kpiLabel: {
      font:      { name: 'Arial', sz: 10, color: { rgb: '2D5A3D' } },
      fill:      { fgColor: { rgb: 'EDF5F0' }, patternType: 'solid' },
      alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
      border: {
        top: { style: 'thin', color: { rgb: 'B5DDC8' } }, bottom: { style: 'thin', color: { rgb: 'B5DDC8' } },
        left: { style: 'thin', color: { rgb: 'B5DDC8' } }, right: { style: 'thin', color: { rgb: 'B5DDC8' } },
      },
    },
    kpiValue: {
      font:      { name: 'Arial', sz: 12, bold: true, color: { rgb: '1A3D2B' } },
      fill:      { fgColor: { rgb: 'EDF5F0' }, patternType: 'solid' },
      alignment: { horizontal: 'right', vertical: 'center', indent: 1 },
      border: {
        top: { style: 'thin', color: { rgb: 'B5DDC8' } }, bottom: { style: 'thin', color: { rgb: 'B5DDC8' } },
        left: { style: 'thin', color: { rgb: 'B5DDC8' } }, right: { style: 'thin', color: { rgb: 'B5DDC8' } },
      },
    },
    rowA: (align = 'left') => ({
      font:      { name: 'Arial', sz: 10, color: { rgb: '1E1A14' } },
      fill:      { fgColor: { rgb: 'FFFFFF' }, patternType: 'solid' },
      alignment: { horizontal: align, vertical: 'center', indent: align === 'left' ? 1 : 0 },
      border: {
        top: { style: 'hair', color: { rgb: 'E5E0D8' } }, bottom: { style: 'hair', color: { rgb: 'E5E0D8' } },
        left: { style: 'hair', color: { rgb: 'E5E0D8' } }, right: { style: 'hair', color: { rgb: 'E5E0D8' } },
      },
    }),
    rowB: (align = 'left') => ({
      font:      { name: 'Arial', sz: 10, color: { rgb: '1E1A14' } },
      fill:      { fgColor: { rgb: 'F7F5F0' }, patternType: 'solid' },
      alignment: { horizontal: align, vertical: 'center', indent: align === 'left' ? 1 : 0 },
      border: {
        top: { style: 'hair', color: { rgb: 'E5E0D8' } }, bottom: { style: 'hair', color: { rgb: 'E5E0D8' } },
        left: { style: 'hair', color: { rgb: 'E5E0D8' } }, right: { style: 'hair', color: { rgb: 'E5E0D8' } },
      },
    }),
    moneyA: {
      font:      { name: 'Arial', sz: 10, bold: true, color: { rgb: '2D5A3D' } },
      fill:      { fgColor: { rgb: 'FFFFFF' }, patternType: 'solid' },
      alignment: { horizontal: 'right', vertical: 'center' },
      border: {
        top: { style: 'hair', color: { rgb: 'E5E0D8' } }, bottom: { style: 'hair', color: { rgb: 'E5E0D8' } },
        left: { style: 'hair', color: { rgb: 'E5E0D8' } }, right: { style: 'hair', color: { rgb: 'E5E0D8' } },
      },
    },
    moneyB: {
      font:      { name: 'Arial', sz: 10, bold: true, color: { rgb: '2D5A3D' } },
      fill:      { fgColor: { rgb: 'F7F5F0' }, patternType: 'solid' },
      alignment: { horizontal: 'right', vertical: 'center' },
      border: {
        top: { style: 'hair', color: { rgb: 'E5E0D8' } }, bottom: { style: 'hair', color: { rgb: 'E5E0D8' } },
        left: { style: 'hair', color: { rgb: 'E5E0D8' } }, right: { style: 'hair', color: { rgb: 'E5E0D8' } },
      },
    },
    rank: (stripe) => ({
      font:      { name: 'Arial', sz: 10, bold: true, color: { rgb: 'FFFFFF' } },
      fill:      { fgColor: { rgb: stripe ? '4A9E6B' : '2D5A3D' }, patternType: 'solid' },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'hair', color: { rgb: 'E5E0D8' } }, bottom: { style: 'hair', color: { rgb: 'E5E0D8' } },
        left: { style: 'hair', color: { rgb: 'E5E0D8' } }, right: { style: 'hair', color: { rgb: 'E5E0D8' } },
      },
    }),
    footer: {
      font:      { name: 'Arial', sz: 9, italic: true, color: { rgb: 'B5A99A' } },
      fill:      { fgColor: { rgb: 'FAF9F6' }, patternType: 'solid' },
      alignment: { horizontal: 'center', vertical: 'center' },
    },
    spacer: {
      fill: { fgColor: { rgb: 'FAF9F6' }, patternType: 'solid' },
    },
  };

  /* ── helpers ── */
  const cell = (ws, ref, value, style, fmt) => {
    ws[ref] = { v: value, t: typeof value === 'number' ? 'n' : 's', s: style };
    if (fmt) ws[ref].z = fmt;
  };
  const setRef = (ws, maxR, maxC) => {
    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: maxR, c: maxC } });
  };
  const merge = (ws, rs, re, cs, ce) => {
    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push({ s: { r: rs, c: cs }, e: { r: re, c: ce } });
  };
  const banner = (ws, cols, title, sub, meta) => {
    for (let c = 0; c <= cols; c++) {
      cell(ws, XLSX.utils.encode_cell({ r: 0, c }), c === 0 ? title : '', S.brandTitle);
      cell(ws, XLSX.utils.encode_cell({ r: 1, c }), c === 0 ? sub   : '', S.brandSub);
      if (meta !== undefined)
        cell(ws, XLSX.utils.encode_cell({ r: 2, c }), c === 0 ? meta  : '', S.brandMeta);
    }
    merge(ws, 0, 0, 0, cols);
    merge(ws, 1, 1, 0, cols);
    if (meta !== undefined) merge(ws, 2, 2, 0, cols);
  };
  const spacerRow = (ws, r, cols) => {
    for (let c = 0; c <= cols; c++)
      cell(ws, XLSX.utils.encode_cell({ r, c }), '', S.spacer);
  };
  const footerRow = (ws, r, cols) => {
    for (let c = 0; c <= cols; c++)
      cell(ws, XLSX.utils.encode_cell({ r, c }), c === 0 ? `© ${new Date().getFullYear()} Azmata — Laporan dibuat otomatis` : '', S.footer);
    merge(ws, r, r, 0, cols);
  };

  /* ══════════════════════════════════════════
     SHEET 1 — RINGKASAN
  ══════════════════════════════════════════ */
  const ws1 = {};
  const COLS1 = 3;

  banner(ws1, COLS1, 'AZMATA — LAPORAN PENJUALAN', `Periode: ${periodLabel}`, `Dicetak: ${printDate}`);
  spacerRow(ws1, 3, COLS1);

  // Section: KPI
  for (let c = 0; c <= COLS1; c++) cell(ws1, XLSX.utils.encode_cell({ r: 4, c }), c === 0 ? 'RINGKASAN PERFORMA' : '', S.sectionHeader);
  merge(ws1, 4, 4, 0, COLS1);

  const kpis = [
    ['Total Pendapatan', Number(data?.summary?.total_pendapatan || 0), '"Rp "#,##0'],
    ['Pesanan Selesai',  Number(data?.summary?.total_pesanan    || 0), '#,##0'],
    ['Total Pelanggan',  Number(data?.summary?.total_pelanggan   || 0), '#,##0'],
  ];
  kpis.forEach(([label, value, fmt], i) => {
    const r = 5 + i;
    cell(ws1, XLSX.utils.encode_cell({ r, c: 0 }), label, S.kpiLabel);
    cell(ws1, XLSX.utils.encode_cell({ r, c: 1 }), value, S.kpiValue, fmt);
    cell(ws1, XLSX.utils.encode_cell({ r, c: 2 }), '', S.kpiValue);
    cell(ws1, XLSX.utils.encode_cell({ r, c: 3 }), '', S.kpiValue);
    merge(ws1, r, r, 1, 3);
  });

  spacerRow(ws1, 8, COLS1);

  // Section: Status
  for (let c = 0; c <= 1; c++) cell(ws1, XLSX.utils.encode_cell({ r: 9, c }), c === 0 ? 'PESANAN PER STATUS' : '', S.sectionHeader);
  merge(ws1, 9, 9, 0, 1);
  cell(ws1, XLSX.utils.encode_cell({ r: 10, c: 0 }), 'Status', S.colHeader);
  cell(ws1, XLSX.utils.encode_cell({ r: 10, c: 1 }), 'Jumlah Pesanan', S.colHeader);

  (data?.byStatus || []).forEach((s, i) => {
    const r   = 11 + i;
    const row = i % 2 === 0 ? S.rowA : S.rowB;
    cell(ws1, XLSX.utils.encode_cell({ r, c: 0 }), s.status, row('left'));
    cell(ws1, XLSX.utils.encode_cell({ r, c: 1 }), Number(s.jumlah || 0), row('right'), '#,##0');
  });

  const statusLen  = (data?.byStatus || []).length;
  const footerRow1 = 12 + statusLen;
  footerRow(ws1, footerRow1, COLS1);

  ws1['!cols']     = [{ wch: 32 }, { wch: 22 }, { wch: 14 }, { wch: 14 }];
  ws1['!rows']     = [{ hpt: 36 }, { hpt: 20 }, { hpt: 16 }];
  ws1['!tabColor'] = { rgb: '2D5A3D' };
  setRef(ws1, footerRow1, COLS1);
  XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan');

  /* ══════════════════════════════════════════
     SHEET 2 — PRODUK TERLARIS
  ══════════════════════════════════════════ */
  if (data?.topProducts?.length > 0) {
    const ws2  = {};
    const COLS2 = 4;

    banner(ws2, COLS2, 'PRODUK TERLARIS — AZMATA', `Periode: ${periodLabel}`);
    spacerRow(ws2, 2, COLS2);

    ['#', 'Nama Produk', 'Kategori', 'Terjual (toples)', 'Total Pendapatan'].forEach((h, c) => {
      cell(ws2, XLSX.utils.encode_cell({ r: 3, c }), h, S.colHeader);
    });

    data.topProducts.forEach((p, i) => {
      const r      = 4 + i;
      const stripe = i % 2 === 1;
      const rowS   = stripe ? S.rowB : S.rowA;
      const moneyS = stripe ? S.moneyB : S.moneyA;
      cell(ws2, XLSX.utils.encode_cell({ r, c: 0 }), i + 1, S.rank(stripe));
      cell(ws2, XLSX.utils.encode_cell({ r, c: 1 }), p.name, rowS('left'));
      cell(ws2, XLSX.utils.encode_cell({ r, c: 2 }), p.category_name || '—', rowS('left'));
      cell(ws2, XLSX.utils.encode_cell({ r, c: 3 }), Number(p.total_terjual || 0), rowS('right'), '#,##0');
      cell(ws2, XLSX.utils.encode_cell({ r, c: 4 }), Number(p.total_pendapatan || 0), moneyS, '"Rp "#,##0');
    });

    const lastRow2 = 4 + data.topProducts.length;
    footerRow(ws2, lastRow2, COLS2);

    ws2['!cols']     = [{ wch: 5 }, { wch: 32 }, { wch: 20 }, { wch: 18 }, { wch: 24 }];
    ws2['!rows']     = [{ hpt: 36 }, { hpt: 20 }];
    ws2['!tabColor'] = { rgb: '4A9E6B' };
    setRef(ws2, lastRow2, COLS2);
    XLSX.utils.book_append_sheet(wb, ws2, 'Produk Terlaris');
  }

  /* ══════════════════════════════════════════
     SHEET 3 — RIWAYAT PESANAN
  ══════════════════════════════════════════ */
  if (data?.orders?.length > 0) {
    const ws3  = {};
    const COLS3 = 5;

    banner(ws3, COLS3, 'RIWAYAT PESANAN — AZMATA', `Periode: ${periodLabel}  |  ${data.orders.length} pesanan`);
    spacerRow(ws3, 2, COLS3);

    ['No. Pesanan', 'Pelanggan', 'Total', 'Status Pesanan', 'Status Bayar', 'Tanggal'].forEach((h, c) => {
      cell(ws3, XLSX.utils.encode_cell({ r: 3, c }), h, S.colHeader);
    });

    data.orders.forEach((o, i) => {
      const r      = 4 + i;
      const stripe = i % 2 === 1;
      const rowS   = stripe ? S.rowB : S.rowA;
      const moneyS = stripe ? S.moneyB : S.moneyA;
      cell(ws3, XLSX.utils.encode_cell({ r, c: 0 }), o.invoice_number|| `#${String(o.id).padStart(4, '0')}`, rowS('center'));
      cell(ws3, XLSX.utils.encode_cell({ r, c: 1 }), o.customer_name, rowS('left'));
      cell(ws3, XLSX.utils.encode_cell({ r, c: 2 }), Number(o.total_price || 0), moneyS, '"Rp "#,##0');
      cell(ws3, XLSX.utils.encode_cell({ r, c: 3 }), o.status, rowS('left'));
      cell(ws3, XLSX.utils.encode_cell({ r, c: 4 }), o.payment_status || '—', rowS('left'));
      cell(ws3, XLSX.utils.encode_cell({ r, c: 5 }), new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }), rowS('center'));
    });

    const lastRow3 = 4 + data.orders.length;
    footerRow(ws3, lastRow3, COLS3);

    ws3['!cols']     = [{ wch: 13 }, { wch: 28 }, { wch: 22 }, { wch: 24 }, { wch: 18 }, { wch: 16 }];
    ws3['!rows']     = [{ hpt: 36 }, { hpt: 20 }];
    ws3['!tabColor'] = { rgb: '1D4ED8' };
    setRef(ws3, lastRow3, COLS3);
    XLSX.utils.book_append_sheet(wb, ws3, 'Riwayat Pesanan');
  }

  /* ══════════════════════════════════════════
     SHEET 4 — PENDAPATAN PER BULAN
  ══════════════════════════════════════════ */
  if (data?.byMonth?.length > 0) {
    const ws4  = {};
    const COLS4 = 2;

    banner(ws4, COLS4, 'PENDAPATAN PER BULAN — AZMATA', `Periode: ${periodLabel}`);
    spacerRow(ws4, 2, COLS4);

    ['Bulan', 'Jumlah Pesanan', 'Pendapatan (Rp)'].forEach((h, c) => {
      cell(ws4, XLSX.utils.encode_cell({ r: 3, c }), h, S.colHeader);
    });

    data.byMonth.forEach((d, i) => {
      const r      = 4 + i;
      const stripe = i % 2 === 1;
      const rowS   = stripe ? S.rowB : S.rowA;
      const moneyS = stripe ? S.moneyB : S.moneyA;
      cell(ws4, XLSX.utils.encode_cell({ r, c: 0 }), d.bulan, rowS('center'));
      cell(ws4, XLSX.utils.encode_cell({ r, c: 1 }), Number(d.jumlah_pesanan || 0), rowS('right'), '#,##0');
      cell(ws4, XLSX.utils.encode_cell({ r, c: 2 }), Number(d.pendapatan || 0), moneyS, '"Rp "#,##0');
    });

    const lastRow4 = 4 + data.byMonth.length;
    footerRow(ws4, lastRow4, COLS4);

    ws4['!cols']     = [{ wch: 16 }, { wch: 20 }, { wch: 24 }];
    ws4['!rows']     = [{ hpt: 36 }, { hpt: 20 }];
    ws4['!tabColor'] = { rgb: 'D97706' };
    setRef(ws4, lastRow4, COLS4);
    XLSX.utils.book_append_sheet(wb, ws4, 'Per Bulan');
  }

  const safePeriod = from && to ? `_${from}_sd_${to}` : '';
  XLSX.writeFile(wb, `Laporan_Azmata${safePeriod}.xlsx`);
  toast.success('Laporan berhasil diunduh!');
};

/* ══ ADMIN LAPORAN ══ */
const AdminLaporan = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [from, setFrom]               = useState('');
  const [to, setTo]                   = useState('');
  const [showLogout, setShowLogout]   = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fetchLaporan = async (fromDate = from, toDate = to) => {
    setLoading(true);
    try {
      const params = {};
      if (fromDate && toDate) { params.from = fromDate; params.to = toDate; }
      const { data: res } = await api.get('/reports/laporan', { params });
      setData(res);
    } catch { toast.error('Gagal memuat laporan'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLaporan(); }, []);

  const handleLogout = () => { logout?.(); navigate('/login'); };

  const handleDownload = () => {
    if (!data) return;
    setDownloading(true);
    try { downloadExcel(data, from, to); }
    catch (err) { toast.error('Gagal mengunduh laporan'); console.error(err); }
    finally { setDownloading(false); }
  };

  const maxBar = Math.max(...(data?.byMonth?.map(d => d.pendapatan) || [1]));

  const summaryCards = [
    { label: 'Total pendapatan', value: formatRp(data?.summary?.total_pendapatan), icon: TrendingUp, accent: '#2d5a3d', bg: '#edf5f0' },
    { label: 'Pesanan selesai',  value: data?.summary?.total_pesanan  || 0,        icon: ShoppingBag, accent: '#1d4ed8', bg: '#dbeafe' },
    { label: 'Total pelanggan',  value: data?.summary?.total_pelanggan || 0,       icon: Users,       accent: '#6d28d9', bg: '#ede9fe' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .lap-row { transition: background 0.14s; }
        .lap-row:hover { background: #faf9f6 !important; }
        .lap-input:focus { border-color: #4a9e6b !important; }
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

          {/* ── Top bar ── */}
          <header style={{ padding: '20px 32px', borderBottom: '1px solid #ede9e0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1e1a14', margin: 0 }}>Laporan</h1>
              <p style={{ fontSize: 12, color: '#b5a99a', margin: '2px 0 0' }}>Ringkasan penjualan & performa toko</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 12, color: '#8a7f6f', background: '#f5f1eb', padding: '6px 14px', borderRadius: 20 }}>
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              {data && !loading && (
                <button onClick={handleDownload} disabled={downloading} style={{ display: 'flex', alignItems: 'center', gap: 7, height: 36, padding: '0 16px', borderRadius: 10, border: 'none', background: downloading ? '#b0c8b8' : 'linear-gradient(135deg,#2d5a3d,#4a9e6b)', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#fff', cursor: downloading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(45,90,61,0.18)', transition: 'opacity 0.15s' }}
                  onMouseEnter={e => { if (!downloading) e.currentTarget.style.opacity = '0.88'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                  title={from && to ? `Unduh laporan ${from} s/d ${to}` : 'Unduh semua laporan'}
                >
                  {downloading
                    ? <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                    : <Download size={14} />}
                  {downloading ? 'Mengunduh…' : 'Unduh Excel'}
                </button>
              )}
            </div>
          </header>

          <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>

            {/* ── Filter ── */}
            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #ede9e0', padding: '16px 20px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: '#8a7f6f', fontWeight: 500 }}>Periode:</span>
              {[
                { value: from, setter: setFrom, label: 'Dari', min: undefined },
                { value: to,   setter: setTo,   label: 's/d',  min: from || undefined },
              ].map(({ value, setter, label, min }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: '#b5a99a' }}>{label}</span>
                  <input type="date" value={value} min={min} onChange={e => setter(e.target.value)} className="lap-input"
                    style={{ height: 36, padding: '0 12px', fontSize: 12, background: '#faf9f6', border: '1px solid #ede9e0', borderRadius: 10, color: '#1e1a14', outline: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.15s' }}
                  />
                </div>
              ))}
              <button onClick={() => fetchLaporan(from, to)} style={{ height: 36, padding: '0 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#2d5a3d,#4a9e6b)', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >Tampilkan</button>
              {(from || to) && (
                <button onClick={() => { setFrom(''); setTo(''); fetchLaporan('', ''); }} style={{ height: 36, padding: '0 14px', borderRadius: 10, border: '1px solid #ede9e0', background: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#8a7f6f', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#faf9f6'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >Reset</button>
              )}
              {from && to && (
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#4a9e6b', fontWeight: 500, background: '#edf5f0', padding: '4px 12px', borderRadius: 20 }}>
                  {from} — {to}
                </span>
              )}
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid #2d5a3d', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
              </div>
            ) : (
              <>
                {/* ── Summary cards ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 }}>
                  {summaryCards.map(({ label, value, icon: Icon, accent, bg }) => (
                    <div key={label} style={{ background: '#fff', borderRadius: 18, padding: '22px 20px', border: '1px solid #ede9e0', transition: 'transform 0.2s, box-shadow 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(45,90,61,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                    >
                      <div style={{ width: 38, height: 38, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                        <Icon size={17} color={accent} />
                      </div>
                      <p style={{ fontSize: 11, color: '#b5a99a', margin: '0 0 4px' }}>{label}</p>
                      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: '#1e1a14', margin: 0 }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* ── Chart + Status ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, marginBottom: 16 }}>
                  <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #ede9e0', overflow: 'hidden' }}>
                    <div style={{ padding: '18px 22px', borderBottom: '1px solid #f5f1eb' }}>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: '#1e1a14' }}>Pendapatan per bulan</span>
                    </div>
                    <div style={{ padding: '20px 22px' }}>
                      {data?.byMonth?.length > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
                          {data.byMonth.map((d, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 10, color: '#b5a99a', textAlign: 'center' }}>{(d.pendapatan / 1000).toFixed(0)}k</span>
                              <div style={{ width: '100%', borderRadius: '6px 6px 0 0', background: 'linear-gradient(to top,#2d5a3d,#4a9e6b)', height: Math.max((d.pendapatan / maxBar) * 100, 6), transition: 'height 0.4s' }} />
                              <span style={{ fontSize: 10, color: '#b5a99a', textAlign: 'center' }}>{d.bulan?.slice(5)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#b5a99a' }}>Belum ada data</div>
                      )}
                    </div>
                  </div>

                  <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #ede9e0', overflow: 'hidden' }}>
                    <div style={{ padding: '18px 20px', borderBottom: '1px solid #f5f1eb' }}>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: '#1e1a14' }}>Pesanan per status</span>
                    </div>
                    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {data?.byStatus?.map(s => (
                        <div key={s.status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
                          <StatusBadge status={s.status} />
                          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: '#1e1a14' }}>{s.jumlah}</span>
                        </div>
                      ))}
                      {!data?.byStatus?.length && (
                        <p style={{ fontSize: 13, color: '#b5a99a', textAlign: 'center', padding: '16px 0', margin: 0 }}>Belum ada data</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Produk terlaris ── */}
                <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #ede9e0', overflow: 'hidden', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 22px', borderBottom: '1px solid #f5f1eb' }}>
                    <Award size={15} color="#2d5a3d" />
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: '#1e1a14' }}>Produk terlaris</span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans', sans-serif" }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #f5f1eb' }}>
                          {['Produk', 'Kategori', 'Total Terjual', 'Pendapatan'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '10px 22px', fontSize: 10, color: '#b5a99a', fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data?.topProducts?.length > 0 ? data.topProducts.map((p, i) => (
                          <tr key={i} className="lap-row" style={{ borderBottom: '1px solid #f9f7f4' }}>
                            <td style={{ padding: '13px 22px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#edf5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#2d5a3d', flexShrink: 0 }}>{i + 1}</div>
                                <span style={{ fontSize: 13, fontWeight: 500, color: '#1e1a14' }}>{p.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: '13px 22px' }}>
                              <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: '#f5f1eb', color: '#8a7f6f' }}>{p.category_name || '—'}</span>
                            </td>
                            <td style={{ padding: '13px 22px', fontSize: 13, fontWeight: 600, color: '#1e1a14' }}>{p.total_terjual} toples</td>
                            <td style={{ padding: '13px 22px', fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, color: '#2d5a3d' }}>{formatRp(p.total_pendapatan)}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', fontSize: 13, color: '#b5a99a' }}>Belum ada data penjualan</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ── Riwayat pesanan ── */}
                <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #ede9e0', overflow: 'hidden' }}>
                  <div style={{ padding: '18px 22px', borderBottom: '1px solid #f5f1eb' }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 600, color: '#1e1a14' }}>Riwayat pesanan (50 terbaru)</span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans', sans-serif" }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #f5f1eb' }}>
                          {['No.', 'Pelanggan', 'Total', 'Status', 'Pembayaran', 'Tanggal'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '10px 22px', fontSize: 10, color: '#b5a99a', fontWeight: 600, letterSpacing: '0.6px', textTransform: 'uppercase' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data?.orders?.length > 0 ? data.orders.map(o => (
                          <tr key={o.id} className="lap-row" style={{ borderBottom: '1px solid #f9f7f4' }}>
                            <td style={{ padding: '12px 22px', fontSize: 12, color: '#b5a99a', fontFamily: 'monospace' }}>
                              {o.invoice_number || `#${String(o.id).padStart(4, '0')}`}
                            </td>
                            <td style={{ padding: '12px 22px', fontSize: 13, fontWeight: 500, color: '#1e1a14' }}>{o.customer_name}</td>
                            <td style={{ padding: '12px 22px', fontFamily: "'Playfair Display', serif", fontSize: 13, fontWeight: 700, color: '#2d5a3d' }}>{formatRp(o.total_price)}</td>
                            <td style={{ padding: '12px 22px' }}><StatusBadge status={o.status} /></td>
                            <td style={{ padding: '12px 22px' }}>
                              <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: o.payment_status === 'Dikonfirmasi' ? '#d1fae5' : o.payment_status === 'Ditolak' ? '#fee2e2' : '#f3f4f6', color: o.payment_status === 'Dikonfirmasi' ? '#065f46' : o.payment_status === 'Ditolak' ? '#b91c1c' : '#6b7280' }}>
                                {o.payment_status || '—'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 22px', fontSize: 12, color: '#b5a99a' }}>
                              {new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', fontSize: 13, color: '#b5a99a' }}>Belum ada riwayat pesanan</td></tr>
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

export default AdminLaporan;