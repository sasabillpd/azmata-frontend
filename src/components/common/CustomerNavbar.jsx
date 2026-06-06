import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Bell, Ticket, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';

const CustomerNavbar = ({ onSearch, onCartClick, cartCount = 0 }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef();

  const [notifs, setNotifs]       = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [unread, setUnread]       = useState(0);

  // ── Voucher banner ──
  const [vouchers, setVouchers]         = useState([]);
  const [voucherIdx, setVoucherIdx]     = useState(0);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  // ───────────────────

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notifications');
      const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setNotifs(list);
      setUnread(list.filter(n => !n.is_read).length);
    } catch {}
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  // Ambil voucher publik
  useEffect(() => {
    api.get('/vouchers')
      .then(res => setVouchers(res.data || []))
      .catch(() => {});
  }, []);

  // Auto-rotate banner setiap 4 detik
  useEffect(() => {
    if (vouchers.length <= 1) return;
    const t = setInterval(() => setVoucherIdx(i => (i + 1) % vouchers.length), 4000);
    return () => clearInterval(t);
  }, [vouchers.length]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpenNotif = async () => {
    setShowNotif(prev => !prev);
    if (!showNotif && unread > 0) {
      try {
        await api.put('/notifications/read-all');
        setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnread(0);
      } catch {}
    }
  };

  const handleClickNotif = (notif) => {
    setShowNotif(false);
    if (notif.order_id) navigate('/profil', { state: { tab: 'pesanan' } });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Baru saja';
    if (mins < 60) return `${mins} mnt lalu`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} jam lalu`;
    return `${Math.floor(hrs / 24)} hari lalu`;
  };

  const STATUS_ICON = {
    'Menunggu Konfirmasi': '🕐', 'Diproses': '📦',
    'Dikirim': '🚚', 'Selesai': '✅', 'Dibatalkan': '❌',
    'voucher': '🎟️',
  };

  const avatarUrl = user?.avatar
    ? `/uploads/${user.avatar}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=2d5a3d&color=fff&size=40`;

  const formatRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

  const currentVoucher = vouchers[voucherIdx];
  const showBanner = !bannerDismissed && vouchers.length > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(12px); } to { opacity:1; transform:translateX(0); } }
        .cn-root * { box-sizing: border-box; }
        .cn-icon-btn { width:38px; height:38px; border-radius:50%; background:#f5f2ec; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#6b6357; transition:background 0.15s; }
        .cn-icon-btn:hover { background:#ede9e0; }
        .cn-notif-item:hover { background:#faf9f6 !important; }
        .cn-search:focus { border-color:#2d5a3d !important; background:#fff !important; }
        .cn-user-btn:hover { background:#ede9e0 !important; }
        .voucher-banner-text { animation: slideIn 0.3s ease; }
        .voucher-nav-btn { width:22px; height:22px; border-radius:50%; border:none; background:rgba(255,255,255,0.2); cursor:pointer; display:flex; align-items:center; justify-content:center; color:#fff; transition:background 0.15s; flex-shrink:0; }
        .voucher-nav-btn:hover { background:rgba(255,255,255,0.35); }
        .voucher-dot { width:5px; height:5px; border-radius:50%; background:rgba(255,255,255,0.4); transition:background 0.2s; flex-shrink:0; }
        .voucher-dot.active { background:#fff; }

        /* ── Voucher icon button in navbar ── */
        .cn-voucher-link {
          width: 38px; height: 38px;
          border-radius: 50%;
          background: #f5f2ec;
          display: flex; align-items: center; justify-content: center;
          color: #6b6357;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          position: relative;
        }
        .cn-voucher-link:hover {
          background: #e8f5ed;
          color: #2d5a3d;
        }
        .cn-voucher-link .cn-voucher-dot {
          position: absolute;
          top: -2px; right: -2px;
          width: 9px; height: 9px;
          background: #2d5a3d;
          border-radius: 50%;
          border: 2px solid #fff;
        }
      `}</style>

      {/* ── Voucher Banner ── */}
      {showBanner && currentVoucher && (
        <div style={{
          background: 'linear-gradient(90deg, #1a3d2b 0%, #2d5a3d 50%, #1a3d2b 100%)',
          padding: '0 24px',
          height: 38,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          fontFamily: "'DM Sans',sans-serif",
          gap: 12,
        }}>
          {/* Nav prev */}
          {vouchers.length > 1 && (
            <button className="voucher-nav-btn" onClick={() => setVoucherIdx(i => (i - 1 + vouchers.length) % vouchers.length)}>
              <ChevronLeft size={12} />
            </button>
          )}

          {/* Konten — klik banner → ke halaman voucher */}
          <Link to="/voucher" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Ticket size={13} color="rgba(255,255,255,0.8)" />
            <span key={voucherIdx} className="voucher-banner-text" style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: 6 }}>
              Gunakan kode
              <span style={{
                fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
                background: 'rgba(255,255,255,0.15)', color: '#fff',
                padding: '1px 8px', borderRadius: 4, letterSpacing: '0.5px',
              }}>
                {currentVoucher.kode}
              </span>
              dan hemat
              <strong style={{ color: '#a8d8b8' }}>
                {currentVoucher.tipe === 'persentase'
                  ? `${currentVoucher.nilai}%`
                  : formatRp(currentVoucher.nilai)}
              </strong>
              {currentVoucher.min_belanja > 0 &&
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
                  · min. {formatRp(currentVoucher.min_belanja)}
                </span>
              }
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
                · Lihat semua
                <ChevronRight size={10} />
              </span>
            </span>
          </Link>

          {/* Dots */}
          {vouchers.length > 1 && (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {vouchers.map((_, i) => (
                <div key={i} className={`voucher-dot ${i === voucherIdx ? 'active' : ''}`}
                  onClick={() => setVoucherIdx(i)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </div>
          )}

          {/* Nav next */}
          {vouchers.length > 1 && (
            <button className="voucher-nav-btn" onClick={() => setVoucherIdx(i => (i + 1) % vouchers.length)}>
              <ChevronRight size={12} />
            </button>
          )}

          {/* Dismiss */}
          <button onClick={() => setBannerDismissed(true)} style={{
            position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
            width: 20, height: 20, borderRadius: '50%', border: 'none',
            background: 'rgba(255,255,255,0.15)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={10} color="rgba(255,255,255,0.7)" />
          </button>
        </div>
      )}

      {/* ── Navbar utama ── */}
      <nav className="cn-root" style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#fff', borderBottom: '1px solid #f0ece4',
        boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
        fontFamily: "'DM Sans',sans-serif",
      }}>
        <div style={{
          maxWidth: 1152, margin: '0 auto', padding: '0 40px',
          height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
        }}>

          {/* Logo */}
          <Link to="/katalog" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: '#1e1a14' }}>
              Azmata <em style={{ color: '#2d5a3d' }}>Cookies</em>
            </span>
          </Link>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 440, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9a9080' }} />
            <input
              className="cn-search"
              placeholder="Cari kue kering..."
              onChange={e => onSearch?.(e.target.value)}
              style={{
                width: '100%', height: 38, paddingLeft: 36, paddingRight: 12,
                fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: '#1e1a14',
                border: '1.5px solid #e0ddd6', borderRadius: 20,
                background: '#faf9f6', outline: 'none', transition: 'all 0.15s',
              }}
            />
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

            {/* Notifikasi */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button className="cn-icon-btn" onClick={handleOpenNotif}>
                <Bell size={17} />
                {unread > 0 && (
                  <span style={{
                    position: 'absolute', top: -3, right: -3,
                    width: 18, height: 18, background: '#e57373', color: '#fff',
                    fontSize: 10, fontWeight: 600, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'DM Sans',sans-serif",
                  }}>
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              {showNotif && (
                <div style={{
                  position: 'absolute', right: 0, top: 46, width: 320,
                  background: '#fff', borderRadius: 20, border: '1px solid #ede9e0',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.12)', overflow: 'hidden',
                  zIndex: 100, animation: 'fadeIn 0.15s ease',
                  fontFamily: "'DM Sans',sans-serif",
                }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid #f5f2ec', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, fontWeight: 600, color: '#1e1a14' }}>Notifikasi</span>
                    {unread === 0 && notifs.length > 0 && (
                      <span style={{ fontSize: 11, color: '#9a9080' }}>Semua sudah dibaca</span>
                    )}
                  </div>

                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {notifs.length === 0 ? (
                      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <Bell size={28} style={{ color: '#d5cfc4', margin: '0 auto 8px', display: 'block' }} />
                        <p style={{ fontSize: 13, color: '#9a9080', margin: 0 }}>Belum ada notifikasi</p>
                      </div>
                    ) : notifs.map(notif => (
                      <button key={notif.id} className="cn-notif-item"
                        onClick={() => handleClickNotif(notif)}
                        style={{
                          width: '100%', textAlign: 'left', display: 'flex', alignItems: 'flex-start',
                          gap: 12, padding: '12px 20px', border: 'none', cursor: 'pointer',
                          background: !notif.is_read ? '#f5fbf7' : '#fff', transition: 'background 0.1s',
                        }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%', background: '#f0f7f2',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, fontSize: 16,
                        }}>
                          {STATUS_ICON[notif.status] || '📋'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: '#1e1a14', margin: '0 0 2px', lineHeight: 1.4 }}>
                            {notif.message || notif.title}
                          </p>
                          {notif.order_id && (
                            <p style={{ fontSize: 11, color: '#9a9080', margin: '0 0 2px' }}>
                              Pesanan #{String(notif.order_id).padStart(5, '0')}
                            </p>
                          )}
                          <p style={{ fontSize: 11, color: '#b5a99a', margin: 0 }}>{formatTime(notif.created_at)}</p>
                        </div>
                        {!notif.is_read && (
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2d5a3d', flexShrink: 0, marginTop: 6 }} />
                        )}
                      </button>
                    ))}
                  </div>

                  <div style={{ padding: '12px 20px', borderTop: '1px solid #f5f2ec' }}>
                    <Link to="/profil" state={{ tab: 'pesanan' }} onClick={() => setShowNotif(false)}
                      style={{ fontSize: 12, color: '#2d5a3d', textDecoration: 'none', fontWeight: 500 }}>
                      Lihat semua pesanan →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <button className="cn-icon-btn" onClick={onCartClick} style={{ position: 'relative' }}>
              <ShoppingCart size={17} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: -3, right: -3,
                  width: 18, height: 18, background: '#2d5a3d', color: '#fff',
                  fontSize: 10, fontWeight: 600, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* User */}
            <Link to="/profil" className="cn-user-btn" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              paddingLeft: 8, paddingRight: 14, height: 38,
              borderRadius: 20, background: '#f5f2ec',
              textDecoration: 'none', transition: 'background 0.15s',
            }}>
              <img src={avatarUrl} alt={user?.name}
                style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: '#3a3530' }}>
                {user?.name?.split(' ')[0] || 'User'}
              </span>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default CustomerNavbar;