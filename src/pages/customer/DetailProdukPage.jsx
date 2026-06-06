import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import CustomerNavbar from '../../components/common/CustomerNavbar';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { Heart, ShoppingBag, Zap, ChevronLeft, ChevronRight, ArrowLeft, Star, Ticket } from 'lucide-react';
import KeranjangDrawer from './KeranjangDrawer';
import { useAuth, cartKey } from '../../context/AuthContext';

const ff = { serif: "'Playfair Display',serif", sans: "'DM Sans',sans-serif" };
const green = '#2d5a3d';
const border = '#ede9e0';
const cream = '#faf9f6';

const StarRating = ({ value, onChange, size = 22 }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[1, 2, 3, 4, 5].map(s => (
      <button key={s} type="button" onClick={() => onChange && onChange(s)}
        style={{ background: 'none', border: 'none', cursor: onChange ? 'pointer' : 'default', padding: 2, display: 'flex' }}>
        <Star size={size} style={{ fill: s <= value ? '#f59e0b' : 'none', color: s <= value ? '#f59e0b' : '#d5cfc4', transition: 'all 0.15s' }} />
      </button>
    ))}
  </div>
);

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const KEY = cartKey(user?.id);

  const [product, setProduct]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [activeImg, setActiveImg]   = useState(0);
  const [qty, setQty]               = useState(1);
  const [wished, setWished]         = useState(false);
  const [wishLoading, setWishLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addingCart, setAddingCart] = useState(false);

  // Reviews
  const [reviewData, setReviewData]     = useState({ stats: null, reviews: [] });
  const [reviewCheck, setReviewCheck]   = useState({ can_review: false, order_id: null, already_reviewed: false });
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewForm, setReviewForm]     = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem(KEY) || '[]')); }
    catch { setCart([]); }
  }, [KEY]);

  useEffect(() => {
  setLoading(true);
  api.get(`/products/${id}`)
    .then(res => setProduct(res.data))
    .catch(() => toast.error('Gagal memuat produk'))
    .finally(() => setLoading(false));

    api.get(`/wishlist/check/${id}`).then(res => setWished(res.data.wished)).catch(() => {});

    fetchReviews();
    if (user) {
    api.get(`/wishlist/check/${id}`).then(res => setWished(res.data.wished)).catch(() => {});
    api.get(`/reviews/check/${id}`).then(res => setReviewCheck(res.data)).catch(() => {});
  }
}, [id, user]);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await api.get(`/reviews/product/${id}`);
      setReviewData(res.data);
    } catch {}
    finally { setLoadingReviews(false); }
  };

  const images = (() => {
    if (!product) return [];
    return [product.image_1, product.image_2, product.image_3, product.image_4]
      .filter(Boolean).map(f => f);
  })();

  const changeImg = (dir) => setActiveImg(prev => (prev + images.length + dir) % images.length);
  const changeQty = (dir) => setQty(prev => Math.max(1, Math.min(product?.stock || 99, prev + dir)));

  const addToCart = () => {
    if (!product) return;
    setAddingCart(true);
    const existing = cart.find(i => i.id === product.id);
    const updated = existing
      ? cart.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i)
      : [...cart, { ...product, qty }];
    setCart(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
    toast.success(`${product.name} ditambahkan ke keranjang`);
    setTimeout(() => { setAddingCart(false); setDrawerOpen(true); }, 500);
  };

  const buyNow = () => {
    if (!product) return;
    navigate('/checkout', { state: { items: [{ ...product, qty }], fromBuyNow: true } });
  };

  const toggleWishlist = async () => {
    if (wishLoading) return;
    setWishLoading(true);
    try {
      const res = await api.post('/wishlist/toggle', { product_id: Number(id) });
      setWished(res.data.wished);
      toast.success(res.data.message);
    } catch { toast.error('Login dulu untuk menyimpan favorit'); }
    finally { setWishLoading(false); }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) { toast.error('Tulis komentar dulu ya'); return; }
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        product_id: Number(id),
        order_id: reviewCheck.order_id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      toast.success('Review berhasil dikirim!');
      setReviewCheck(p => ({ ...p, can_review: false, already_reviewed: true }));
      setReviewForm({ rating: 5, comment: '' });
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim review');
    } finally { setSubmittingReview(false); }
  };

  const cartCount = cart.reduce((acc, i) => acc + (i.qty || 1), 0);
  const subtotal = product ? Number(product.price) * qty : 0;
  const outOfStock = product && Number(product.stock) === 0;
  const stats = reviewData.stats;
  const avgRating = stats ? Number(stats.average) || 0 : 0;
  const totalReviews = stats ? Number(stats.total) || 0 : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .detail-root { font-family: 'DM Sans', sans-serif; background: ${cream}; min-height: 100vh; }
        .thumb-btn { width: 68px; height: 68px; border-radius: 12px; overflow: hidden; border: 2px solid transparent; cursor: pointer; padding: 0; transition: all 0.18s; flex-shrink: 0; }
        .thumb-btn.active { border-color: ${green}; box-shadow: 0 0 0 2px rgba(45,90,61,0.15); }
        .thumb-btn:not(.active):hover { border-color: #b5c9bc; }
        .thumb-btn img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .nav-arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.9); border: 1px solid #e0ddd6; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.18s; color: #3a3530; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .nav-arrow:hover { background: #fff; box-shadow: 0 4px 16px rgba(0,0,0,0.14); }
        .nav-arrow.left { left: 14px; } .nav-arrow.right { right: 14px; }
        .qty-btn { width: 36px; height: 36px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; color: ${green}; transition: background 0.15s; border-radius: 8px; }
        .qty-btn:hover { background: #e8f0eb; }
        .qty-btn:disabled { color: #c5bfb5; cursor: not-allowed; }
        .btn-cart { flex: 1; padding: 14px 20px; border-radius: 14px; border: 1.5px solid ${green}; background: transparent; color: ${green}; font-family: 'DM Sans',sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
        .btn-cart:hover { background: #f0f7f2; }
        .btn-cart:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-buy { flex: 1; padding: 14px 20px; border-radius: 14px; border: none; background: ${green}; color: #fff; font-family: 'DM Sans',sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
        .btn-buy:hover { background: #1e3e2b; }
        .btn-buy:disabled { background: #b5c9bc; cursor: not-allowed; }
        .btn-wish { width: 52px; height: 52px; border-radius: 14px; border: 1.5px solid #e0ddd6; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; color: #c5bfb5; }
        .btn-wish:hover { border-color: #f4a0a0; color: #e57373; background: #fff5f5; }
        .btn-wish.wished { border-color: #f4a0a0; color: #e57373; background: #fff5f5; }
        .stock-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 500; font-family: 'DM Sans',sans-serif; }
        .stock-badge.available { background: #e8f5ee; color: ${green}; }
        .stock-badge.empty { background: #f5f0e8; color: #9a7a4a; }
        .skeleton-pulse { background: linear-gradient(90deg, #f0ece4 25%, #e8e2d8 50%, #f0ece4 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .review-textarea { width: 100%; padding: 12px 14px; border-radius: 10px; border: 1.5px solid ${border}; font-family: 'DM Sans',sans-serif; font-size: 13px; color: #1e1a14; background: #fff; resize: none; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
        .review-textarea:focus { border-color: ${green}; box-shadow: 0 0 0 3px rgba(45,90,61,0.08); }
        .review-submit:hover:not(:disabled) { background: #1e3e2b !important; }
        .star-hover:hover svg { fill: #f59e0b !important; color: #f59e0b !important; }
      `}</style>

      <div className="detail-root">
        <CustomerNavbar onCartClick={() => setDrawerOpen(true)} cartCount={cartCount} />

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, fontFamily: ff.sans, fontSize: 13, color: '#9a9080' }}>
            <Link to="/katalog" style={{ color: '#9a9080', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ArrowLeft size={14} /> Katalog
            </Link>
            <span style={{ color: '#d5cfc4' }}>/</span>
            {loading
              ? <span style={{ width: 80, height: 14, borderRadius: 4, display: 'inline-block' }} className="skeleton-pulse" />
              : <span style={{ color: '#3a3530' }}>{product?.name}</span>}
          </nav>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, background: '#fff', borderRadius: 24, overflow: 'hidden', border: `1px solid ${border}` }}>
              <div style={{ padding: 32 }}>
                <div className="skeleton-pulse" style={{ width: '100%', aspectRatio: '4/3', borderRadius: 16, marginBottom: 16 }} />
                <div style={{ display: 'flex', gap: 10 }}>
                  {[...Array(4)].map((_, i) => <div key={i} className="skeleton-pulse" style={{ width: 68, height: 68, borderRadius: 12 }} />)}
                </div>
              </div>
              <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="skeleton-pulse" style={{ height: 36, borderRadius: 8, width: '70%' }} />
                <div className="skeleton-pulse" style={{ height: 16, borderRadius: 6, width: '40%' }} />
                <div className="skeleton-pulse" style={{ height: 44, borderRadius: 8, width: '50%' }} />
                <div className="skeleton-pulse" style={{ height: 80, borderRadius: 8 }} />
              </div>
            </div>
          ) : !product ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 24, border: `1px solid ${border}` }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
              <p style={{ fontFamily: ff.serif, fontSize: 20, color: '#2d2a24', marginBottom: 8 }}>Produk tidak ditemukan</p>
              <Link to="/katalog" style={{ fontFamily: ff.sans, fontSize: 14, color: green }}>Kembali ke katalog</Link>
            </div>
          ) : (
            <>
              {/* ── Product card ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, background: '#fff', borderRadius: 24, overflow: 'hidden', border: `1px solid ${border}`, boxShadow: '0 4px 32px rgba(0,0,0,0.06)', marginBottom: 24 }}>

                {/* LEFT: Images */}
                <div style={{ background: 'linear-gradient(145deg,#f5f2ec,#eee9df)', padding: 36, display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', aspectRatio: '4/3', background: '#e8e2d8' }}>
                    {images.length > 0 ? (
                      <img key={activeImg} src={images[activeImg]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#f0ece4,#e8e2d8)', color: '#b5a99a', gap: 12 }}>
                        <span style={{ fontSize: 56 }}>🍪</span>
                        <span style={{ fontSize: 13, fontFamily: ff.sans }}>Belum ada foto</span>
                      </div>
                    )}
                    {images.length > 1 && (
                      <>
                        <button className="nav-arrow left" onClick={() => changeImg(-1)}><ChevronLeft size={16} /></button>
                        <button className="nav-arrow right" onClick={() => changeImg(1)}><ChevronRight size={16} /></button>
                        <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                          {images.map((_, i) => (
                            <button key={i} onClick={() => setActiveImg(i)} style={{ width: i === activeImg ? 20 : 7, height: 7, borderRadius: 4, border: 'none', background: i === activeImg ? green : 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'all 0.2s', padding: 0 }} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  {images.length > 1 && (
                    <div style={{ display: 'flex', gap: 10 }}>
                      {images.map((img, i) => (
                        <button key={i} className={`thumb-btn ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                          <img src={img} alt={`${product.name} ${i + 1}`} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* RIGHT: Info */}
                <div style={{ padding: 40, display: 'flex', flexDirection: 'column' }}>
                  <p style={{ fontFamily: ff.sans, fontSize: 11, fontWeight: 500, color: '#4a9e6b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
                    {product.category_name}
                  </p>
                  <h1 style={{ fontFamily: ff.serif, fontSize: 30, fontWeight: 700, color: '#1e1a14', margin: '0 0 6px', lineHeight: 1.25 }}>{product.name}</h1>
                  <p style={{ fontFamily: ff.sans, fontSize: 13, color: '#b5a99a', margin: '0 0 16px' }}>per toples {product.weight || '350'}gr</p>

                  {/* Rating summary */}
                  {totalReviews > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                      <StarRating value={Math.round(avgRating)} size={14} />
                      <span style={{ fontFamily: ff.sans, fontSize: 13, fontWeight: 600, color: '#1e1a14' }}>{avgRating.toFixed(1)}</span>
                      <span style={{ fontFamily: ff.sans, fontSize: 12, color: '#9a9080' }}>({totalReviews} ulasan)</span>
                    </div>
                  )}

                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontFamily: ff.serif, fontSize: 32, fontWeight: 700, color: green, margin: '0 0 4px' }}>
                      Rp {Number(product.price).toLocaleString('id-ID')}
                    </p>
                    <p style={{ fontFamily: ff.sans, fontSize: 12, color: '#b5a99a', margin: 0 }}>harga per toples</p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                    <span className={`stock-badge ${outOfStock ? 'empty' : 'available'}`}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: outOfStock ? '#c8a96e' : '#4a9e6b', flexShrink: 0 }} />
                      {outOfStock ? 'Stok Habis' : `${product.stock} toples tersedia`}
                    </span>
                    <span style={{ fontFamily: ff.sans, fontSize: 12, color: '#b5a99a' }}>Min. 1 toples</span>
                  </div>

                  <div style={{ borderTop: `1px solid #f0ece4`, borderBottom: `1px solid #f0ece4`, padding: '20px 0', marginBottom: 28 }}>
                    <p style={{ fontFamily: ff.sans, fontSize: 14, color: '#6b6357', lineHeight: 1.7, margin: 0 }}>
                      {product.description || 'Kue kering berkualitas tinggi, dibuat dari bahan pilihan.'}
                    </p>
                  </div>

                  {/* Qty */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: ff.sans, fontSize: 14, color: '#6b6357' }}>Jumlah</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, border: `1.5px solid #e0ddd6`, borderRadius: 12, padding: '4px 6px', background: cream }}>
                      <button className="qty-btn" onClick={() => changeQty(-1)} disabled={qty <= 1}>−</button>
                      <span style={{ fontFamily: ff.serif, fontSize: 16, fontWeight: 600, color: '#1e1a14', minWidth: 32, textAlign: 'center' }}>{qty}</span>
                      <button className="qty-btn" onClick={() => changeQty(1)} disabled={outOfStock || qty >= (product?.stock || 99)}>+</button>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <p style={{ fontFamily: ff.sans, fontSize: 11, color: '#b5a99a', margin: '0 0 2px' }}>Subtotal</p>
                      <p style={{ fontFamily: ff.serif, fontSize: 20, fontWeight: 700, color: green, margin: 0 }}>Rp {subtotal.toLocaleString('id-ID')}</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                    <button className={`btn-cart ${addingCart ? 'adding' : ''}`} onClick={addToCart} disabled={outOfStock || addingCart}>
                      <ShoppingBag size={16} />{addingCart ? 'Ditambahkan ✓' : 'Keranjang'}
                    </button>
                    <button className="btn-buy" onClick={buyNow} disabled={outOfStock}>
                      <Zap size={16} />Beli sekarang
                    </button>
                    <button className={`btn-wish ${wished ? 'wished' : ''}`} onClick={toggleWishlist} disabled={wishLoading}>
                      <Heart size={18} fill={wished ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── REVIEW SECTION ── */}
              <div style={{ background: '#fff', borderRadius: 24, border: `1px solid ${border}`, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>

                {/* Header */}
                <div style={{ background: green, padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontFamily: ff.serif, fontSize: 16, fontWeight: 600, color: '#fff', margin: 0 }}>Ulasan Pelanggan</p>
                  {totalReviews > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StarRating value={Math.round(avgRating)} size={14} />
                      <span style={{ fontFamily: ff.sans, fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{avgRating.toFixed(1)}</span>
                      <span style={{ fontFamily: ff.sans, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>dari {totalReviews} ulasan</span>
                    </div>
                  )}
                </div>

                <div style={{ padding: 32 }}>

                  {/* Stats bar */}
                  {totalReviews > 0 && stats && (
                    <div style={{ display: 'flex', gap: 32, marginBottom: 32, paddingBottom: 28, borderBottom: `1px solid ${border}`, flexWrap: 'wrap', alignItems: 'center' }}>
                      {/* Big number */}
                      <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontFamily: ff.serif, fontSize: 48, fontWeight: 700, color: '#1e1a14', lineHeight: 1 }}>{avgRating.toFixed(1)}</div>
                        <StarRating value={Math.round(avgRating)} size={16} />
                        <div style={{ fontFamily: ff.sans, fontSize: 12, color: '#9a9080', marginTop: 6 }}>{totalReviews} ulasan</div>
                      </div>
                      {/* Bars */}
                      <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {[5, 4, 3, 2, 1].map(star => {
                          const count = Number(stats[`star${star}`]) || 0;
                          const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                          return (
                            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontFamily: ff.sans, fontSize: 12, color: '#6b6357', width: 8, flexShrink: 0 }}>{star}</span>
                              <Star size={11} style={{ fill: '#f59e0b', color: '#f59e0b', flexShrink: 0 }} />
                              <div style={{ flex: 1, height: 6, background: '#f0ece4', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: '#f59e0b', borderRadius: 4, transition: 'width 0.4s' }} />
                              </div>
                              <span style={{ fontFamily: ff.sans, fontSize: 11, color: '#9a9080', width: 20, flexShrink: 0 }}>{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Form tulis review */}
                  {user ? (
                    reviewCheck.can_review ? (
                      <div style={{ background: cream, borderRadius: 16, padding: 24, marginBottom: 28, border: `1px solid ${border}` }}>
                        <p style={{ fontFamily: ff.serif, fontSize: 15, fontWeight: 600, color: '#1e1a14', margin: '0 0 16px' }}>Tulis ulasanmu</p>
                        <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                          <div>
                            <label style={{ fontFamily: ff.sans, fontSize: 11, fontWeight: 500, color: '#6b6357', display: 'block', marginBottom: 8 }}>Rating</label>
                            <StarRating value={reviewForm.rating} onChange={r => setReviewForm(p => ({ ...p, rating: r }))} size={28} />
                          </div>
                          <div>
                            <label style={{ fontFamily: ff.sans, fontSize: 11, fontWeight: 500, color: '#6b6357', display: 'block', marginBottom: 8 }}>Komentar</label>
                            <textarea className="review-textarea" rows={3} placeholder="Ceritakan pengalamanmu dengan produk ini..."
                              value={reviewForm.comment} onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" disabled={submittingReview} className="review-submit"
                              style={{ height: 42, padding: '0 24px', background: submittingReview ? '#9dbfaa' : green, color: '#fff', fontFamily: ff.sans, fontSize: 13, fontWeight: 500, border: 'none', borderRadius: 10, cursor: submittingReview ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}>
                              {submittingReview ? 'Mengirim...' : 'Kirim ulasan'}
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : reviewCheck.already_reviewed ? (
                      <div style={{ background: '#f0f7f2', border: `1px solid #c5dfc9`, borderRadius: 12, padding: '12px 16px', marginBottom: 24, fontFamily: ff.sans, fontSize: 13, color: green }}>
                        ✓ Kamu sudah memberikan ulasan untuk produk ini.
                      </div>
                    ) : null
                  ) : (
                    <div style={{ background: cream, border: `1px solid ${border}`, borderRadius: 12, padding: '14px 18px', marginBottom: 24, fontFamily: ff.sans, fontSize: 13, color: '#6b6357' }}>
                      <Link to="/login" style={{ color: green, fontWeight: 500, textDecoration: 'none' }}>Masuk</Link> untuk menulis ulasan.
                    </div>
                  )}

                  {/* List reviews */}
                  {loadingReviews ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {[...Array(3)].map((_, i) => (
                        <div key={i} style={{ display: 'flex', gap: 14 }}>
                          <div className="skeleton-pulse" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div className="skeleton-pulse" style={{ height: 14, width: '30%', borderRadius: 6 }} />
                            <div className="skeleton-pulse" style={{ height: 12, width: '100%', borderRadius: 6 }} />
                            <div className="skeleton-pulse" style={{ height: 12, width: '70%', borderRadius: 6 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : reviewData.reviews.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9a9080' }}>
                      <div style={{ fontSize: 36, marginBottom: 12 }}>⭐</div>
                      <p style={{ fontFamily: ff.serif, fontSize: 16, color: '#6b6357', margin: '0 0 6px' }}>Belum ada ulasan</p>
                      <p style={{ fontFamily: ff.sans, fontSize: 13, color: '#9a9080', margin: 0 }}>Jadilah yang pertama mengulas produk ini</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {reviewData.reviews.map((r, idx) => (
                        <div key={r.id} style={{ padding: '20px 0', borderTop: idx > 0 ? `1px solid ${border}` : 'none', display: 'flex', gap: 16 }}>
                          {/* Avatar */}
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0f7f2', border: `1px solid #c5dfc9`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                            {r.user_avatar
                              ? <img src={r.user_avatar} alt={r.user_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <span style={{ fontFamily: ff.sans, fontSize: 13, fontWeight: 700, color: green }}>{r.user_name?.charAt(0).toUpperCase()}</span>}
                          </div>
                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, gap: 8, flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontFamily: ff.sans, fontSize: 13, fontWeight: 600, color: '#1e1a14' }}>{r.user_name}</span>
                                <StarRating value={r.rating} size={12} />
                              </div>
                              <span style={{ fontFamily: ff.sans, fontSize: 11, color: '#b5a99a', flexShrink: 0 }}>
                                {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                            </div>
                            {r.comment && (
                              <p style={{ fontFamily: ff.sans, fontSize: 13, color: '#6b6357', lineHeight: 1.65, margin: 0 }}>{r.comment}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {drawerOpen && <KeranjangDrawer cart={cart} setCart={setCart} onClose={() => setDrawerOpen(false)} />}
    </>
  );
};

export default ProductDetailPage;