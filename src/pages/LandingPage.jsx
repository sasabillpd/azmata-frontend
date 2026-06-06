import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import { ArrowRight, CheckCircle2, Star, ShieldCheck, Clock, Package, Phone, Mail, MapPin, Plus } from 'lucide-react';

const features = [
  { icon: <ShieldCheck size={18} style={{ color: '#2d5a3d' }} />, title: 'Bahan premium tanpa pengawet', desc: 'Seluruh produk dibuat dari bahan segar pilihan tanpa bahan pengawet atau pewarna buatan.' },
  { icon: <Clock size={18} style={{ color: '#2d5a3d' }} />,        title: 'Dipanggang sesuai pesanan',   desc: 'Tidak ada stok lama. Setiap pesanan diproduksi segar agar cita rasa selalu optimal.' },
  { icon: <Star size={18} style={{ color: '#2d5a3d' }} />,         title: 'Rating tinggi dari pelanggan', desc: 'Ratusan pesanan terkirim dengan tingkat kepuasan pelanggan yang konsisten tinggi.' },
  { icon: <Package size={18} style={{ color: '#2d5a3d' }} />,      title: 'Kemasan higienis & aman',    desc: 'Dikemas dengan wadah tertutup rapat dan aman untuk menjaga kesegaran hingga tujuan.' },
];

const steps = [
  { num: '1', title: 'Pilih produk',            desc: 'Jelajahi katalog dan tambahkan kue kering favoritmu ke keranjang belanja.' },
  { num: '2', title: 'Isi alamat pengiriman',   desc: 'Masukkan detail alamat penerimaan pesananmu dengan lengkap dan benar.' },
  { num: '3', title: 'Transfer & upload bukti', desc: 'Transfer ke rekening kami, lalu unggah foto bukti transfer untuk konfirmasi.' },
  { num: '4', title: 'Terima pesananmu',        desc: 'Pesanan diproduksi fresh dan dikirim. Pantau status pengiriman secara real-time.' },
];

const testimonialsFallback = [
  { name: 'Sari Rahayu',    loc: 'Surabaya, Jawa Timur', init: 'SR', text: 'Nastar kejunya enak banget! Teksturnya lembut dan tidak terlalu manis. Sudah langganan tiap lebaran selama 3 tahun terakhir.' },
  { name: 'Budi Wicaksono', loc: 'Malang, Jawa Timur',   init: 'BW', text: 'Kastengel goudanya jadi favorit keluarga besar kami. Proses pemesanan via website sangat mudah dan pengiriman selalu tepat waktu.' },
  { name: 'Dewi Kusuma',    loc: 'Jakarta Selatan',       init: 'DK', text: 'Sudah pesan untuk hantaran lebaran kantor dan semua rekan sangat suka. Kemasannya rapi dan produknya premium!' },
];

const tickerItems = ['Butter Cookies','Semprit Coklat','Nastar Keju','Kastengel','Corn Flakes','Choc Chip','Putri Salju','Lidah Kucing'];

const MAPS_URL = 'https://maps.app.goo.gl/g14P9tZBQfxQj4AA7';
const API = 'https://azmata-backend-production.up.railway.app/api';
const WA_NUMBER = '6287846146746';

const kontak = [
  { icon: <Phone  size={18} style={{ color: '#2d5a3d' }} />, label: 'WhatsApp', val: '+62 878-4614-6746', sub: 'Senin–Sabtu, 08.00–17.00 WIB' },
  { icon: <Mail   size={18} style={{ color: '#2d5a3d' }} />, label: 'Email',    val: 'hello@azmatacookies.com', sub: 'Balas dalam 1x24 jam' },
  { icon: <MapPin size={18} style={{ color: '#2d5a3d' }} />, label: 'Lokasi',   val: 'Pasuruan, Jawa Timur',    sub: 'Pengiriman ke seluruh Indonesia', isMap: true },
];

const formatRp = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const getMainImage = (p) => {
  const img = p.image_1 || p.image_2 || p.image_3 || p.image_4;
  return img ? img : null;
};

const formatStat = (n) => {
  if (n === null || n === undefined) return null;
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'rb+';
  if (n >= 10)   return n + '+';
  return String(n);
};

const LandingPage = () => {
  const [products, setProducts]           = useState([]);
  const [heroProduct, setHeroProduct]     = useState(null);
  const [testimonials, setTestimonials]   = useState([]);
  const [loadingProd, setLoadingProd]     = useState(true);
  const [loadingTestim, setLoadingTestim] = useState(true);
  const [activeStep, setActiveStep]       = useState(0);

  const [contactName, setContactName]   = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg]     = useState('');

  const [stats, setStats] = useState({
    orders_completed: null,
    products_total:   null,
    rating_average:   null,
  });

  useEffect(() => {
    fetch(`${API}/stats`)
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API}/products`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.data ?? []);
        setProducts(list.slice(0, 4));
        setHeroProduct(list.find(p => p.stock > 0) || list[0] || null);
      })
      .catch(() => {})
      .finally(() => setLoadingProd(false));
  }, []);

  useEffect(() => {
    fetch(`${API}/reviews/top`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          setTestimonials(testimonialsFallback);
        } else {
          setTestimonials(data.map(row => ({
            name: row.user_name ?? 'Pelanggan',
            loc:  '',
            init: (row.user_name ?? 'P').slice(0, 2).toUpperCase(),
            text: row.comment,
          })));
        }
      })
      .catch(() => setTestimonials(testimonialsFallback))
      .finally(() => setLoadingTestim(false));
  }, []);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendWa = () => {
    const text = `Halo, saya ${contactName || 'pelanggan'} (${contactPhone || '-'}).\n\n${contactMsg || 'Saya ingin bertanya tentang produk Azmata Cookies.'}`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const ff         = { serif: "'Playfair Display',serif", sans: "'DM Sans',sans-serif" };
  const green      = '#2d5a3d';
  const greenLight = '#f0f7f2';
  const cream      = '#faf9f6';
  const border     = '#ede9e0';

  const ratingFormatted = stats.rating_average !== null
    ? Number(stats.rating_average).toFixed(1)
    : null;

  const statRows = [
    { val: formatStat(stats.orders_completed), label: 'Pesanan terkirim' },
    { val: formatStat(stats.products_total),   label: 'Varian produk'    },
    { val: ratingFormatted,                    label: 'Rating pelanggan'  },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-33.33%)} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        .lp-marquee { animation: marquee 22s linear infinite; }
        .lp-feature:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07) !important; transform: translateY(-2px); }
        .lp-feature { transition: all 0.2s; }
        .lp-produk:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.1) !important; transform: translateY(-3px); }
        .lp-produk { transition: all 0.2s; }
        .lp-testim:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.07) !important; }
        .lp-testim { transition: all 0.18s; }
        .lp-btn-solid:hover { background: #254d33 !important; }
        .lp-btn-outline:hover { background: #f5f2ec !important; }
        .lp-btn-ghost:hover { border-color: #4a9e6b !important; color: #2d5a3d !important; }
        .lp-footer-link:hover { color: #a8d5b5 !important; }
        .lp-contact-input:focus { border-color: #2d5a3d !important; background: #fff !important; }
        .lp-plus-btn:hover { background: #d5e8dc !important; }
        .lp-skeleton {
          background: linear-gradient(90deg, #ede9e0 25%, #f5f2ec 50%, #ede9e0 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 10px;
        }
        .lp-stat-skel {
          background: linear-gradient(90deg, #e8e2d8 25%, #f0ebe2 50%, #e8e2d8 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 6px;
          display: block;
          height: 34px;
          width: 56px;
          margin-bottom: 4px;
        }
        .lp-step { cursor: pointer; }
        .lp-step:hover .lp-step-num { box-shadow: 0 2px 10px rgba(45,90,61,0.18); }
        .lp-maps-link { color: #2d5a3d; text-decoration: none; }
        .lp-maps-link:hover { text-decoration: underline; }
        .lp-maps-link-light { color: #a8d5b5; text-decoration: none; }
        .lp-maps-link-light:hover { text-decoration: underline; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: ff.sans }}>
        <Navbar />

        {/* ── HERO ── */}
        <section id="tentang" style={{ maxWidth: 1152, margin: '0 auto', padding: '72px 40px', display: 'grid', gridTemplateColumns: '2fr 1fr', alignItems: 'center', gap: 60 }}>
          <div style={{ maxWidth: 520 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', border: `1px solid ${border}`, borderRadius: 20, marginBottom: 24 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4a9e6b' }} />
              <span style={{ fontFamily: ff.sans, fontSize: 12, color: '#9a9080' }}>
                Kue kering premium ·{' '}
                <a href={MAPS_URL} target="_blank" rel="noreferrer" className="lp-maps-link" style={{ fontWeight: 500 }}>
                  Pasuruan, Jawa Timur
                </a>
              </span>
            </div>
            <h1 style={{ fontFamily: ff.serif, fontSize: 40, fontWeight: 600, color: '#1e1a14', lineHeight: 1.2, letterSpacing: '-0.5px', margin: '0 0 16px' }}>
              Kue kering terbaik,<br />
              langsung dari{' '}
              <em style={{ color: green }}>dapur kami</em><br />
              ke pintu rumahmu
            </h1>
            <p style={{ fontFamily: ff.sans, fontSize: 14, color: '#6b6357', lineHeight: 1.7, margin: '0 0 28px', maxWidth: 380 }}>
              Dipesan fresh, dipanggang dengan bahan pilihan tanpa pengawet. Nikmati cita rasa autentik kue kering rumahan yang sudah dipercaya ratusan pelanggan.
            </p>
            <div style={{ display: 'flex', gap: 10, marginBottom: 36 }}>
              <Link to="/katalog" className="lp-btn-solid" style={{ fontFamily: ff.sans, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: green, color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'background 0.15s' }}>
                Lihat katalog <ArrowRight size={14} />
              </Link>
              <Link to="/register" className="lp-btn-outline" style={{ fontFamily: ff.sans, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', border: `1.5px solid ${border}`, color: '#3a3530', borderRadius: 10, fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'background 0.15s' }}>
                Daftar gratis
              </Link>
            </div>

            {/* ── STAT NUMBERS ── */}
            <div style={{ display: 'flex', gap: 36, paddingTop: 28, borderTop: `1px solid ${border}` }}>
              {statRows.map(({ val, label }) => (
                <div key={label}>
                  {val === null
                    ? <span className="lp-stat-skel" />
                    : <div style={{ fontFamily: ff.serif, fontSize: 30, fontWeight: 600, color: '#1e1a14' }}>{val}</div>
                  }
                  <div style={{ fontFamily: ff.sans, fontSize: 12, color: '#9a9080', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero card */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', maxWidth: 280, border: `1px solid ${border}`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              <div style={{ height: 180, background: greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                {heroProduct && getMainImage(heroProduct) ? (
                  <img src={getMainImage(heroProduct)} alt={heroProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontFamily: ff.sans, fontSize: 12, color: '#9a9080' }}>[ foto produk ]</span>
                )}
                {heroProduct && heroProduct.stock > 0 && (
                  <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: '#fff', border: `1px solid ${border}`, borderRadius: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4a9e6b' }} />
                    <span style={{ fontFamily: ff.sans, fontSize: 10, color: '#6b6357' }}>Fresh to order</span>
                  </div>
                )}
                {heroProduct && heroProduct.stock === 0 && (
                  <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 20 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#e74c3c' }} />
                    <span style={{ fontFamily: ff.sans, fontSize: 10, color: '#b91c1c' }}>Stok habis</span>
                  </div>
                )}
              </div>
              <div style={{ padding: 18 }}>
                <p style={{ fontFamily: ff.serif, fontSize: 14, fontWeight: 600, color: '#1e1a14', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {heroProduct?.name ?? 'Produk Pilihan'}
                </p>
                <p style={{ fontFamily: ff.sans, fontSize: 11, color: '#9a9080', margin: '0 0 14px' }}>
                  {heroProduct?.category_name ?? 'Kue Kering'} · tanpa pengawet
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: ff.serif, fontSize: 14, fontWeight: 700, color: green }}>
                    {heroProduct ? formatRp(heroProduct.price) : '—'}
                  </span>
                  <Link to="/katalog" className="lp-btn-solid" style={{ fontFamily: ff.sans, padding: '6px 12px', background: green, color: '#fff', fontSize: 11, borderRadius: 8, textDecoration: 'none', transition: 'background 0.15s' }}>
                    + Lihat katalog
                  </Link>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: '12px 18px', borderTop: `1px solid ${border}`, background: cream }}>
                {['Bahan alami','Fresh baked','Kemasan rapi'].map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={11} style={{ color: '#4a9e6b' }} />
                    <span style={{ fontFamily: ff.sans, fontSize: 10, color: '#6b6357' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── TICKER ── */}
        <div style={{ borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`, background: green, padding: '10px 0', overflow: 'hidden' }}>
          <div className="lp-marquee" style={{ display: 'flex', gap: 40, whiteSpace: 'nowrap', width: 'max-content' }}>
            {[...tickerItems,...tickerItems,...tickerItems].map((item, i) => (
              <span key={i} style={{ fontFamily: ff.serif, fontSize: 11, color: '#fff', letterSpacing: '2px', textTransform: 'uppercase', flexShrink: 0 }}>· {item}</span>
            ))}
          </div>
        </div>

        {/* ── KENAPA ── */}
        <section style={{ background: cream, borderTop: `1px solid ${border}` }}>
          <div style={{ maxWidth: 1152, margin: '0 auto', padding: '72px 40px' }}>
            <div style={{ marginBottom: 44 }}>
              <div style={{ fontFamily: ff.sans, fontSize: 11, fontWeight: 700, color: green, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 12 }}>Kenapa Azmata Cookies</div>
              <h2 style={{ fontFamily: ff.serif, fontSize: 28, fontWeight: 600, color: '#1e1a14', lineHeight: 1.3, margin: 0 }}>
                Dibuat dengan <em style={{ color: green }}>standar kualitas</em><br />yang tidak kami kompromikan
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
              {features.map(f => (
                <div key={f.title} className="lp-feature" style={{ background: '#fff', border: `1px solid ${border}`, borderRadius: 16, padding: 22 }}>
                  <div style={{ width: 38, height: 38, background: greenLight, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>{f.icon}</div>
                  <p style={{ fontFamily: ff.serif, fontSize: 14, fontWeight: 600, color: '#1e1a14', margin: '0 0 8px' }}>{f.title}</p>
                  <p style={{ fontFamily: ff.sans, fontSize: 12, color: '#6b6357', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRODUK UNGGULAN ── */}
        <section id="produk" style={{ background: green }}>
          <div style={{ maxWidth: 1152, margin: '0 auto', padding: '72px 40px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36 }}>
              <div>
                <div style={{ fontFamily: ff.sans, fontSize: 11, fontWeight: 700, color: '#a8d5b5', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 10 }}>Produk Unggulan</div>
                <h2 style={{ fontFamily: ff.serif, fontSize: 28, fontWeight: 600, color: '#fff', margin: 0, lineHeight: 1.3 }}>
                  Pilihan <em style={{ color: '#a8d5b5' }}>terbaru</em> dari dapur kami
                </h2>
              </div>
              <Link to="/katalog" style={{ fontFamily: ff.sans, fontSize: 13, color: '#a8d5b5', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                Lihat semua produk <ArrowRight size={14} />
              </Link>
            </div>

            {loadingProd ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ height: 160, background: 'rgba(255,255,255,0.12)' }} />
                    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ height: 10, background: 'rgba(255,255,255,0.12)', borderRadius: 6, width: '60%' }} />
                      <div style={{ height: 13, background: 'rgba(255,255,255,0.12)', borderRadius: 6 }} />
                      <div style={{ height: 13, background: 'rgba(255,255,255,0.12)', borderRadius: 6, width: '40%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                {products.map((p, i) => (
                  <div key={p.id} className="lp-produk" style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div style={{ height: 160, background: greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                      {getMainImage(p) ? (
                        <img src={getMainImage(p)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontFamily: ff.sans, fontSize: 11, color: '#9a9080' }}>[ foto ]</span>
                      )}
                      {p.stock > 0 ? (
                        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', background: green, color: '#fff', borderRadius: 20, fontFamily: ff.sans, fontSize: 10, fontWeight: 500 }}>
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#a8d5b5' }} />
                          Fresh to order
                        </div>
                      ) : (
                        <div style={{ position: 'absolute', top: 10, left: 10, padding: '3px 10px', background: '#fee2e2', color: '#b91c1c', borderRadius: 20, fontFamily: ff.sans, fontSize: 10, fontWeight: 500 }}>
                          Habis
                        </div>
                      )}
                      {i === 0 && p.stock > 0 && (
                        <div style={{ position: 'absolute', top: 10, right: 10, padding: '3px 10px', background: '#f59e0b', color: '#fff', borderRadius: 20, fontFamily: ff.sans, fontSize: 10, fontWeight: 500 }}>
                          Terlaris
                        </div>
                      )}
                    </div>
                    <div style={{ padding: 16 }}>
                      <p style={{ fontFamily: ff.sans, fontSize: 10, color: '#9a9080', letterSpacing: '1px', margin: '0 0 4px', textTransform: 'uppercase' }}>
                        {p.category_name ?? 'Kue Kering'}
                      </p>
                      <p style={{ fontFamily: ff.serif, fontSize: 14, fontWeight: 600, color: '#1e1a14', margin: '0 0 14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.name}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontFamily: ff.serif, fontSize: 14, fontWeight: 700, color: green }}>{formatRp(p.price)}</div>
                          <div style={{ fontFamily: ff.sans, fontSize: 11, color: p.stock > 0 ? '#9a9080' : '#e74c3c' }}>
                            {p.stock > 0 ? `Stok: ${p.stock} toples` : 'Stok habis'}
                          </div>
                        </div>
                        <Link
                          to="/katalog"
                          className="lp-plus-btn"
                          style={{
                            width: 30, height: 30, background: greenLight, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: green, textDecoration: 'none', transition: 'background 0.15s',
                            opacity: p.stock > 0 ? 1 : 0.35,
                            pointerEvents: p.stock > 0 ? 'auto' : 'none',
                          }}
                        >
                          <Plus size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── TESTIMONI ── */}
        <section style={{ background: cream, borderTop: `1px solid ${border}` }}>
          <div style={{ maxWidth: 1152, margin: '0 auto', padding: '72px 40px' }}>
            <div style={{ marginBottom: 44 }}>
              <div style={{ fontFamily: ff.sans, fontSize: 11, fontWeight: 700, color: green, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 12 }}>Testimoni Pelanggan</div>
              <h2 style={{ fontFamily: ff.serif, fontSize: 28, fontWeight: 600, color: '#1e1a14', margin: 0, lineHeight: 1.3 }}>
                <em style={{ color: green }}>Kata mereka</em> yang sudah<br />merasakan kelezatannya
              </h2>
            </div>
            {loadingTestim ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ background: '#fff', border: `1px solid ${border}`, borderRadius: 16, padding: 22 }}>
                    <div className="lp-skeleton" style={{ height: 12, width: '40%', marginBottom: 14 }} />
                    <div className="lp-skeleton" style={{ height: 12, width: '100%', marginBottom: 8 }} />
                    <div className="lp-skeleton" style={{ height: 12, width: '85%', marginBottom: 8 }} />
                    <div className="lp-skeleton" style={{ height: 12, width: '70%', marginBottom: 20 }} />
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div className="lp-skeleton" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div className="lp-skeleton" style={{ height: 11, width: '50%', marginBottom: 6 }} />
                        <div className="lp-skeleton" style={{ height: 10, width: '70%' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                {testimonials.map((t, idx) => (
                  <div key={idx} className="lp-testim" style={{ background: '#fff', border: `1px solid ${border}`, borderRadius: 16, padding: 22 }}>
                    <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                      {[...Array(5)].map((_,i) => <Star key={i} size={12} style={{ fill: '#f59e0b', color: '#f59e0b' }} />)}
                    </div>
                    <p style={{ fontFamily: ff.sans, fontSize: 13, color: '#6b6357', lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 16px' }}>"{t.text}"</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: ff.sans, fontSize: 11, fontWeight: 700, color: green, flexShrink: 0 }}>
                        {t.init}
                      </div>
                      <div>
                        <p style={{ fontFamily: ff.sans, fontSize: 12, fontWeight: 600, color: '#1e1a14', margin: 0 }}>{t.name}</p>
                        {t.loc && <p style={{ fontFamily: ff.sans, fontSize: 11, color: '#9a9080', margin: 0 }}>{t.loc}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── CARA PESAN ── */}
        <section id="cara-pesan" style={{ borderTop: `1px solid ${border}` }}>
          <div style={{ maxWidth: 1152, margin: '0 auto', padding: '72px 40px' }}>
            <div style={{ marginBottom: 44 }}>
              <div style={{ fontFamily: ff.sans, fontSize: 11, fontWeight: 700, color: green, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 12 }}>Cara Pesan</div>
              <h2 style={{ fontFamily: ff.serif, fontSize: 28, fontWeight: 700, color: '#1e1a14', margin: 0, lineHeight: 1.3 }}>
                <em style={{ color: green }}>Empat langkah</em> mudah,<br />kue sampai ke pintumu
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32 }}>
              {steps.map((s, i) => {
                const isActive = i === activeStep;
                return (
                  <div key={s.num} className="lp-step" onClick={() => setActiveStep(i)} style={{ userSelect: 'none' }}>
                    <div className="lp-step-num" style={{
                      width: 36, height: 36, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: ff.serif, fontSize: 14, fontWeight: 600, marginBottom: 16,
                      background: isActive ? green : '#fff',
                      color: isActive ? '#fff' : '#9a9080',
                      border: isActive ? 'none' : `1.5px solid ${border}`,
                      transition: 'all 0.2s',
                    }}>
                      {s.num}
                    </div>
                    <p style={{ fontFamily: ff.serif, fontSize: 14, fontWeight: 600, color: isActive ? green : '#1e1a14', margin: '0 0 8px', transition: 'color 0.2s' }}>
                      {s.title}
                    </p>
                    <p style={{ fontFamily: ff.sans, fontSize: 12, color: '#6b6357', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── KONTAK ── */}
        <section id="kontak" style={{ borderTop: `1px solid ${border}` }}>
          <div style={{ maxWidth: 1152, margin: '0 auto', padding: '72px 40px' }}>
            <div style={{ marginBottom: 44 }}>
              <div style={{ fontFamily: ff.sans, fontSize: 11, fontWeight: 700, color: green, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 12 }}>Kontak</div>
              <h2 style={{ fontFamily: ff.serif, fontSize: 28, fontWeight: 600, color: '#1e1a14', margin: 0, lineHeight: 1.3 }}>
                Ada pertanyaan? Kami<br /><em style={{ color: green }}>siap membantu</em> kamu
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {kontak.map(item => (
                  <div key={item.label} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 42, height: 42, background: greenLight, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <div>
                      <p style={{ fontFamily: ff.sans, fontSize: 11, color: '#9a9080', margin: '0 0 3px' }}>{item.label}</p>
                      <p style={{ fontFamily: ff.sans, fontSize: 14, fontWeight: 500, color: '#1e1a14', margin: '0 0 2px' }}>
                        {item.isMap ? (
                          <a href={MAPS_URL} target="_blank" rel="noreferrer" className="lp-maps-link" style={{ fontWeight: 500 }}>
                            {item.val}
                          </a>
                        ) : item.val}
                      </p>
                      <p style={{ fontFamily: ff.sans, fontSize: 12, color: '#9a9080', margin: 0 }}>{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form WA */}
              <div style={{ background: cream, borderRadius: 20, padding: 28, border: `1px solid ${border}` }}>
                <p style={{ fontFamily: ff.sans, fontSize: 14, fontWeight: 600, color: '#1e1a14', margin: '0 0 20px' }}>Kirim pesan langsung</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input
                    type="text"
                    placeholder="Nama kamu"
                    className="lp-contact-input"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    style={{ width: '100%', height: 42, padding: '0 14px', fontFamily: ff.sans, fontSize: 13, border: `1.5px solid ${border}`, borderRadius: 10, background: '#fff', outline: 'none', color: '#1e1a14', transition: 'all 0.15s', boxSizing: 'border-box' }}
                  />
                  <input
                    type="text"
                    placeholder="Nomor WhatsApp"
                    className="lp-contact-input"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    style={{ width: '100%', height: 42, padding: '0 14px', fontFamily: ff.sans, fontSize: 13, border: `1.5px solid ${border}`, borderRadius: 10, background: '#fff', outline: 'none', color: '#1e1a14', transition: 'all 0.15s', boxSizing: 'border-box' }}
                  />
                  <textarea
                    placeholder="Pesan atau pertanyaanmu..."
                    rows={4}
                    className="lp-contact-input"
                    value={contactMsg}
                    onChange={e => setContactMsg(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', fontFamily: ff.sans, fontSize: 13, border: `1.5px solid ${border}`, borderRadius: 10, background: '#fff', outline: 'none', color: '#1e1a14', resize: 'none', transition: 'all 0.15s', boxSizing: 'border-box' }}
                  />
                  <button
                    className="lp-btn-solid"
                    onClick={handleSendWa}
                    style={{ width: '100%', height: 44, background: green, color: '#fff', fontFamily: ff.sans, fontSize: 13, fontWeight: 500, border: 'none', borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s' }}
                  >
                    Kirim via WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ background: green }}>
          <div style={{ maxWidth: 1152, margin: '0 auto', padding: '72px 40px', textAlign: 'center' }}>
            <div style={{ fontFamily: ff.sans, fontSize: 11, color: '#a8d5b5', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>Siap pesan sekarang?</div>
            <h2 style={{ fontFamily: ff.serif, fontSize: 32, fontWeight: 600, color: '#fff', lineHeight: 1.3, margin: '0 0 12px' }}>
              Rasakan kelezatan kue kering<br />premium Azmata hari ini
            </h2>
            <p style={{ fontFamily: ff.sans, fontSize: 13, color: '#a8d5b5', marginBottom: 36 }}>Daftar gratis, tidak perlu kartu kredit. Pesan dalam hitungan menit.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link to="/register" className="lp-btn-outline" style={{ fontFamily: ff.sans, padding: '10px 28px', background: '#fff', color: green, borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none', border: 'none', transition: 'background 0.15s' }}>
                Buat akun gratis
              </Link>
              <Link to="/katalog" className="lp-btn-ghost" style={{ fontFamily: ff.sans, padding: '10px 28px', border: `1.5px solid rgba(255,255,255,0.3)`, color: '#a8d5b5', borderRadius: 10, fontSize: 13, textDecoration: 'none', transition: 'all 0.15s' }}>
                Lihat katalog dulu
              </Link>
            </div>
            <p style={{ fontFamily: ff.sans, fontSize: 12, color: 'rgba(168,213,181,0.6)', marginTop: 24 }}>
              Sudah dipercaya{' '}
              {stats.orders_completed !== null
                ? `${formatStat(stats.orders_completed)} pelanggan`
                : 'ratusan pelanggan'}
              {' '}di seluruh Jawa Timur
            </p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ background: '#1a3626', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: 1152, margin: '0 auto', padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: ff.sans, fontSize: 12, color: '#a8d5b5', fontWeight: 500 }}>
              Azmata Cookies ·{' '}
              <a href={MAPS_URL} target="_blank" rel="noreferrer" className="lp-maps-link-light">
                Pasuruan, Jawa Timur
              </a>
            </span>
            <div style={{ display: 'flex', gap: 28 }}>
              {[['tentang','Tentang Kami'],['produk','Produk'],['cara-pesan','Cara Pesan'],['kontak','Kontak']].map(([id, label]) => (
                <a key={id} href={`#${id}`} className="lp-footer-link" onClick={e => handleNavClick(e, id)}
                  style={{ fontFamily: ff.sans, fontSize: 12, color: '#6b9e7a', textDecoration: 'none', transition: 'color 0.15s', cursor: 'pointer' }}>
                  {label}
                </a>
              ))}
            </div>
            <span style={{ fontFamily: ff.sans, fontSize: 12, color: '#3a6348' }}>© 2024 Azmata Cookies</span>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;