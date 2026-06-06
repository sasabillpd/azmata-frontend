import { useState, useEffect } from 'react';
import { Ticket, Copy, Check, Clock, ShoppingBag, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import CustomerNavbar from '../../components/common/CustomerNavbar';
import KeranjangDrawer from './KeranjangDrawer';
import { useAuth, cartKey } from '../../context/AuthContext';
import api from '../../utils/axios';

// ── Design tokens (sama persis ProfilPage) ──
const ff    = { serif: "'Playfair Display',serif", sans: "'DM Sans',sans-serif" };
const green  = '#2d5a3d';
const border = '#ede9e0';
const cream  = '#faf9f6';

const VoucherPage = () => {
  const { user } = useAuth();
  const KEY = cartKey(user?.id);

  const [vouchers, setVouchers]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [copied, setCopied]         = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    const handler = (e) => {
      if (e.key !== KEY) return;
      try { setCart(JSON.parse(e.newValue || '[]')); }
      catch { setCart([]); }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [KEY]);

  useEffect(() => {
    api.get('/vouchers')
      .then(res => setVouchers(Array.isArray(res.data) ? res.data : []))
      .catch(() => setVouchers([]))
      .finally(() => setLoading(false));
  }, []);

  const cartCount = cart.reduce((acc, i) => acc + i.qty, 0);

  const handleCopy = (kode) => {
    navigator.clipboard.writeText(kode).then(() => {
      setCopied(kode);
      setTimeout(() => setCopied(null), 2200);
    });
  };

  const formatRp  = (n) => 'Rp\u00a0' + Number(n || 0).toLocaleString('id-ID');
  const fmtExpiry = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
  const daysLeft  = (d) => d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .vp * { box-sizing: border-box; }
        .vp-card { transition: box-shadow 0.15s, transform 0.15s; }
        .vp-card:hover { box-shadow: 0 8px 28px rgba(45,90,61,0.10) !important; transform: translateY(-2px); }
        .vp-copy-btn:hover { opacity: 0.88; }
      `}</style>

      <div className="vp" style={{ minHeight: '100vh', background: cream, fontFamily: ff.sans }}>
        <CustomerNavbar onCartClick={() => setDrawerOpen(true)} cartCount={cartCount} />

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, fontSize: 13, fontFamily: ff.sans }}>
            <Link to="/katalog" style={{ color: '#9a9080', textDecoration: 'none' }}>Katalog</Link>
            <span style={{ color: '#c5bfb5' }}>/</span>
            <span style={{ color: '#3a3530' }}>Voucher &amp; Promo</span>
          </div>

          {/* Page header */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontFamily: ff.serif, fontSize: 28, fontWeight: 700, color: '#1e1a14', margin: '0 0 6px' }}>
              Voucher &amp; Promo
            </h1>
            <p style={{ fontFamily: ff.sans, fontSize: 13, color: '#9a9080', margin: 0 }}>
              Salin kode dan gunakan saat checkout untuk mendapatkan diskon.
            </p>
          </div>

          {/* Hint strip */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            background: '#f0f7f2', border: `1px solid #c5dfc9`,
            borderRadius: 12, padding: '12px 16px', marginBottom: 24,
          }}>
            <Tag size={14} color={green} style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontFamily: ff.sans, fontSize: 12, color: '#2d5a3d', margin: 0, lineHeight: 1.6 }}>
              Salin kode voucher, lalu masukkan di kolom <strong>Kode Voucher</strong> pada halaman checkout.
            </p>
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{
                  height: 152, borderRadius: 16,
                  background: 'linear-gradient(90deg,#f0ece4 25%,#e8e2d8 50%,#f0ece4 75%)',
                  backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
                }} />
              ))}
            </div>
          ) : vouchers.length === 0 ? (
            <div style={{
              background: '#fff', borderRadius: 20, padding: '72px 20px',
              textAlign: 'center', border: `1px solid ${border}`,
            }}>
              <Ticket size={36} style={{ color: '#c5bfb5', margin: '0 auto 12px', display: 'block' }} />
              <p style={{ fontFamily: ff.serif, fontSize: 18, color: '#3a3530', margin: '0 0 6px' }}>
                Belum ada voucher tersedia
              </p>
              <p style={{ fontFamily: ff.sans, fontSize: 13, color: '#9a9080', margin: 0 }}>
                Promo akan hadir segera. Pantau terus halaman ini.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
              {vouchers.map(v => {
                const dl       = daysLeft(v.expired_at);
                const urgent   = dl !== null && dl <= 3;
                const lowStock = v.sisa_kuota !== null && v.sisa_kuota !== undefined && v.sisa_kuota <= 5;
                const isCopied = copied === v.kode;

                return (
                  <div key={v.id} className="vp-card" style={{
                    background: '#fff',
                    borderRadius: 16,
                    border: `1px solid ${border}`,
                    overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                    display: 'flex',
                  }}>
                    {/* Left accent strip */}
                    <div style={{
                      width: 5, flexShrink: 0,
                      background: v.tipe === 'persentase'
                        ? `linear-gradient(180deg, ${green} 0%, #6db88a 100%)`
                        : 'linear-gradient(180deg, #8b5e1c 0%, #d4a256 100%)',
                    }} />

                    <div style={{ flex: 1, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

                      {/* Top row: tipe badge + kuota */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <span style={{
                          fontFamily: ff.sans, fontSize: 10, fontWeight: 500,
                          letterSpacing: '1px', textTransform: 'uppercase',
                          color: v.tipe === 'persentase' ? green : '#8b5e1c',
                          background: v.tipe === 'persentase' ? '#f0f7f2' : '#fff8ee',
                          border: `1px solid ${v.tipe === 'persentase' ? '#c5dfc9' : '#f5dfa0'}`,
                          borderRadius: 20, padding: '3px 10px',
                        }}>
                          {v.tipe === 'persentase' ? 'Diskon %' : 'Potongan harga'}
                        </span>
                        {v.sisa_kuota !== null && v.sisa_kuota !== undefined && (
                          <span style={{
                            fontFamily: ff.sans, fontSize: 10, fontWeight: 500,
                            color: lowStock ? '#b45309' : '#6b6357',
                            background: lowStock ? '#fffbf0' : cream,
                            border: `1px solid ${lowStock ? '#f5dfa0' : border}`,
                            borderRadius: 20, padding: '3px 10px', flexShrink: 0,
                          }}>
                            {lowStock ? `⚠ ${v.sisa_kuota} sisa` : `${v.sisa_kuota} tersedia`}
                          </span>
                        )}
                      </div>

                      {/* Discount amount */}
                      <div>
                        <p style={{
                          fontFamily: ff.serif, fontSize: 36, fontWeight: 700,
                          color: '#1e1a14', margin: 0, lineHeight: 1,
                          letterSpacing: '-1px',
                        }}>
                          {v.tipe === 'persentase'
                            ? <>{v.nilai}<span style={{ fontFamily: ff.sans, fontSize: 16, fontWeight: 400, color: '#6b6357' }}>%</span></>
                            : formatRp(v.nilai)
                          }
                        </p>
                      </div>

                      {/* Divider */}
                      <hr style={{ border: 'none', borderTop: `1.5px dashed ${border}`, margin: 0 }} />

                      {/* Code + copy */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
                          background: cream, border: `1.5px dashed #c5bfb5`,
                          borderRadius: 10, padding: '8px 12px',
                        }}>
                          <Ticket size={12} color="#b5a99a" />
                          <span style={{
                            fontFamily: 'Courier New, monospace', fontSize: 14,
                            fontWeight: 700, color: '#1e1a14', letterSpacing: '2px', flex: 1,
                          }}>
                            {v.kode}
                          </span>
                        </div>
                        <button
                          className="vp-copy-btn"
                          onClick={() => handleCopy(v.kode)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            height: 38, padding: '0 16px', borderRadius: 10, border: 'none',
                            fontFamily: ff.sans, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                            transition: 'all 0.15s', flexShrink: 0,
                            background: isCopied ? '#f0f7f2' : green,
                            color: isCopied ? green : '#fff',
                            border: isCopied ? `1.5px solid #c5dfc9` : 'none',
                          }}
                        >
                          {isCopied
                            ? <><Check size={13} /> Tersalin</>
                            : <><Copy size={13} /> Salin</>
                          }
                        </button>
                      </div>

                      {/* Meta info */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        {v.min_belanja > 0 && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: ff.sans, fontSize: 11.5, color: '#6b6357' }}>
                            <ShoppingBag size={11} color="#9a9080" />
                            Min. {formatRp(v.min_belanja)}
                          </span>
                        )}
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          fontFamily: ff.sans, fontSize: 11.5,
                          color: urgent ? '#b45309' : '#6b6357',
                        }}>
                          <Clock size={11} color={urgent ? '#b45309' : '#9a9080'} />
                          {v.expired_at
                            ? urgent
                              ? (dl <= 0 ? 'Berakhir hari ini' : `Berakhir ${dl} hari lagi`)
                              : `s.d. ${fmtExpiry(v.expired_at)}`
                            : 'Tanpa batas waktu'
                          }
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {drawerOpen && (
        <KeranjangDrawer cart={cart} setCart={setCart} onClose={() => setDrawerOpen(false)} />
      )}
    </>
  );
};

export default VoucherPage;