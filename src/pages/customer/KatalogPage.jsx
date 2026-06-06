import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerNavbar from '../../components/common/CustomerNavbar';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import KeranjangDrawer from './KeranjangDrawer';
import { useAuth, cartKey } from '../../context/AuthContext';

const SORT_OPTIONS = [
  { label: 'Terpopuler',      value: 'populer'    },
  { label: 'Harga terendah',  value: 'harga_asc'  },
  { label: 'Harga tertinggi', value: 'harga_desc' },
  { label: 'Terbaru',         value: 'terbaru'    },
];

const KatalogPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // ✅ di dalam component
  const KEY = cartKey(user?.id);

  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCats, setActiveCats] = useState([]);
  const [sortBy, setSortBy]         = useState('populer');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addingId, setAddingId]     = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem(KEY) || '[]')); }
    catch { setCart([]); }
  }, [KEY]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key !== KEY) return;
      try { setCart(JSON.parse(e.newValue || '[]')); }
      catch { setCart([]); }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [KEY]);

  useEffect(() => {
    const delay = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(delay);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    api.get('/products', { params: { search: debouncedSearch, category: activeCats[0], sort: sortBy } })
      .then(res => {
        const data = res.data.data || [];
        const sorted = [...data].sort((a, b) => {
          if (Number(a.stock) === 0 && Number(b.stock) !== 0) return 1;
          if (Number(a.stock) !== 0 && Number(b.stock) === 0) return -1;
          return 0;
        });
        setProducts(sorted);
      })
      .catch(() => toast.error('Gagal memuat produk'))
      .finally(() => setLoading(false));
  }, [debouncedSearch, activeCats, sortBy]);

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data)).catch(() => {});
  }, []);

  const toggleCategory = (id) => {
    if (id === 'all') { setActiveCats([]); return; }
    setActiveCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [id]);
  };

  const addToCart = (product) => {
    if (Number(product.stock) === 0) return;
    setAddingId(product.id);
    const existing = cart.find(i => i.id === product.id);
    const updated = existing
      ? cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      : [...cart, { ...product, qty: 1, checked: true }];
    setCart(updated);
    try { localStorage.setItem(KEY, JSON.stringify(updated)); } catch {}
    toast.success(`${product.name} ditambahkan`);
    setTimeout(() => setAddingId(null), 600);
  };

  const getImage = (product) => {
    const f = [product.image_1, product.image_2, product.image_3, product.image_4].find(f => f);
    return f ? `/uploads/${f}` : null;
  };

  const cartCount = cart.reduce((acc, i) => acc + i.qty, 0);
  const activeCatName = activeCats.length
    ? categories.find(c => c.id === activeCats[0])?.name || ''
    : 'Semua produk';

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f6', fontFamily: "'Georgia', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .katalog-root { font-family: 'DM Sans', sans-serif; }

        .cat-btn {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%; padding: 10px 14px; border-radius: 10px;
          border: none; background: transparent; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 13.5px;
          color: #5a5346; transition: all 0.18s ease; text-align: left;
        }
        .cat-btn:hover { background: #f0ece4; color: #2d2a24; }
        .cat-btn.active { background: #2d5a3d; color: #fff; font-weight: 500; }
        .cat-btn.active .cat-count { background: rgba(255,255,255,0.25); color: #fff; }

        .cat-count {
          font-size: 11px; padding: 2px 8px; border-radius: 20px;
          background: #ede9e0; color: #8a7f6f; font-weight: 500;
          flex-shrink: 0; margin-left: 8px;
        }

        .sort-btn {
          display: flex; align-items: center; gap: 8px;
          width: 100%; padding: 9px 14px; border-radius: 10px;
          border: none; background: transparent; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 13.5px;
          color: #7a7060; transition: all 0.18s; text-align: left;
        }
        .sort-btn:hover { color: #2d2a24; }
        .sort-btn.active { color: #2d5a3d; font-weight: 500; }
        .sort-dot {
          width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
          background: #d5cfc4; transition: background 0.18s;
        }
        .sort-btn.active .sort-dot { background: #2d5a3d; }

        .product-card {
          background: #fff;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid #ede9e0;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
          cursor: pointer;
          position: relative;
        }
        .product-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(45,90,61,0.12); }
        .product-card.out-of-stock { opacity: 0.55; cursor: default; }

        .product-img-wrap {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, #f0ece4 0%, #e8e2d8 100%);
        }
        .product-img { width: 100%; height: 200px; object-fit: cover; display: block; transition: transform 0.4s ease; }
        .product-card:hover .product-img { transform: scale(1.04); }

        .product-img-placeholder {
          width: 100%; height: 200px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #f0ece4 0%, #e8e2d8 100%);
          color: #b5a99a; gap: 8px;
        }

        .sold-out-badge {
          position: absolute; top: 12px; left: 12px;
          background: rgba(30,24,18,0.75); backdrop-filter: blur(4px);
          color: #fff; font-size: 11px; font-weight: 500;
          padding: 4px 10px; border-radius: 6px;
          font-family: 'DM Sans', sans-serif; letter-spacing: 0.5px;
        }

        .add-btn {
          width: 36px; height: 36px; border-radius: 50%;
          border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
          background: #2d5a3d; color: #fff; flex-shrink: 0;
          transition: all 0.2s ease; font-size: 20px; font-weight: 300; line-height: 1;
        }
        .add-btn:hover { background: #1e3e2b; transform: scale(1.1); }
        .add-btn:disabled { background: #d5cfc4; color: #a09588; cursor: not-allowed; transform: none; }
        .add-btn.adding { background: #4a9e6b; transform: scale(0.92); }

        .skeleton { background: linear-gradient(90deg, #f0ece4 25%, #e8e2d8 50%, #f0ece4 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 18px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        .filter-tag {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 20px; font-size: 12px;
          background: #e8f0eb; color: #2d5a3d; font-family: 'DM Sans', sans-serif;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .sidebar-overlay { display: block; }
        }
      `}</style>

      <div className="katalog-root">
        <CustomerNavbar onSearch={setSearch} onCartClick={() => setDrawerOpen(true)} cartCount={cartCount} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px', display: 'flex', gap: 28, alignItems: 'flex-start' }}>

          {/* ── SIDEBAR ── */}
          <aside style={{
            width: 228, flexShrink: 0, position: 'sticky', top: 24,
            background: '#fff', borderRadius: 20, border: '1px solid #ede9e0',
            padding: '28px 16px', boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
          }}>
            {/* Brand mark */}
            <div style={{ textAlign: 'center', marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid #f0ece4' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#2d5a3d,#4a9e6b)',
                margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>🍪</div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, color: '#5a5346', margin: 0 }}>Azmata Cookies</p>
            </div>

            {/* Kategori */}
            <div style={{ marginBottom: 28 }}>
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600,
                letterSpacing: '1.5px', color: '#b5a99a', textTransform: 'uppercase',
                marginBottom: 10, paddingLeft: 14,
              }}>Kategori</p>

              <button className={`cat-btn ${activeCats.length === 0 ? 'active' : ''}`} onClick={() => toggleCategory('all')}>
                <span>Semua produk</span>
                <span className="cat-count">{products.length}</span>
              </button>

              {categories.map(cat => (
                <button key={cat.id} className={`cat-btn ${activeCats.includes(cat.id) ? 'active' : ''}`}
                  onClick={() => toggleCategory(cat.id)}>
                  <span>{cat.name}</span>
                  <span className="cat-count">{cat.total || 0}</span>
                </button>
              ))}
            </div>

            {/* Urutkan */}
            <div>
              <p style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600,
                letterSpacing: '1.5px', color: '#b5a99a', textTransform: 'uppercase',
                marginBottom: 10, paddingLeft: 14,
              }}>Urutkan</p>

              {SORT_OPTIONS.map(opt => (
                <button key={opt.value} className={`sort-btn ${sortBy === opt.value ? 'active' : ''}`}
                  onClick={() => setSortBy(opt.value)}>
                  <span className="sort-dot" />
                  {opt.label}
                </button>
              ))}
            </div>
          </aside>

          {/* ── MAIN ── */}
          <main style={{ flex: 1, minWidth: 0 }}>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                <h1 style={{
                  fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700,
                  color: '#1e1a14', margin: 0, lineHeight: 1.2,
                }}>
                  {activeCats.length ? activeCatName : 'Semua Kue'}
                </h1>
                {!loading && (
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#9a9080',
                    fontWeight: 400,
                  }}>
                    {products.length} produk
                  </span>
                )}
              </div>

              {/* Active filter tags */}
              {(activeCats.length > 0 || sortBy !== 'populer') && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  {activeCats.length > 0 && (
                    <span className="filter-tag">
                      {activeCatName}
                      <button onClick={() => setActiveCats([])} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#2d5a3d' }}>
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {sortBy !== 'populer' && (
                    <span className="filter-tag">
                      {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                      <button onClick={() => setSortBy('populer')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#2d5a3d' }}>
                        <X size={12} />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Grid */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 300 }} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '80px 20px',
                background: '#fff', borderRadius: 20, border: '1px solid #ede9e0',
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#2d2a24', marginBottom: 8 }}>
                  Produk tidak ditemukan
                </p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#9a9080' }}>
                  Coba kata kunci atau filter yang berbeda
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                {products.map((product, idx) => {
                  const outOfStock = Number(product.stock) === 0;
                  const imgSrc = getImage(product);
                  const isAdding = addingId === product.id;

                  return (
                    <div
                      key={product.id}
                      className={`product-card ${outOfStock ? 'out-of-stock' : ''}`}
                      style={{ animationDelay: `${idx * 0.05}s` }}
                      onClick={() => { if (!outOfStock) navigate(`/produk/${product.id}`); }}
                    >
                      {/* Image */}
                      <div className="product-img-wrap">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={product.name}
                            className="product-img"
                            style={{ filter: outOfStock ? 'grayscale(60%)' : 'none' }}
                            onError={e => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="product-img-placeholder" style={{ display: imgSrc ? 'none' : 'flex' }}>
                          <span style={{ fontSize: 40 }}>🍪</span>
                          <span style={{ fontSize: 11, fontFamily: "'DM Sans',sans-serif" }}>Belum ada foto</span>
                        </div>
                        {outOfStock && <span className="sold-out-badge">Stok Habis</span>}
                      </div>

                      {/* Info */}
                      <div style={{ padding: '16px 18px 18px' }}>
                        <p style={{
                          fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500,
                          color: '#4a9e6b', textTransform: 'uppercase', letterSpacing: '0.8px',
                          margin: '0 0 5px',
                        }}>
                          {product.category_name}
                        </p>

                        <h3 style={{
                          fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600,
                          color: outOfStock ? '#9a9080' : '#1e1a14', margin: '0 0 14px',
                          lineHeight: 1.35,
                        }}>
                          {product.name}
                        </h3>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <p style={{
                              fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 700,
                              color: outOfStock ? '#b5a99a' : '#2d5a3d', margin: 0,
                            }}>
                              Rp {Number(product.price).toLocaleString('id-ID')}
                            </p>
                            {!outOfStock && (
                              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: '#b5a99a', margin: '2px 0 0' }}>
                                Sisa {product.stock} toples
                              </p>
                            )}
                          </div>

                          <button
                            className={`add-btn ${isAdding ? 'adding' : ''}`}
                            disabled={outOfStock}
                            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                            title={outOfStock ? 'Stok habis' : 'Tambah ke keranjang'}
                          >
                            {isAdding ? '✓' : '+'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {drawerOpen && (
        <KeranjangDrawer
          cart={cart}
          setCart={setCart}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
};

export default KatalogPage;