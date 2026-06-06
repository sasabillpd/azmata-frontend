import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const handleNavClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = [
    ['tentang', 'Tentang Kami'],
    ['produk', 'Produk'],
    ['cara-pesan', 'Cara Pesan'],
    ['kontak', 'Kontak'],
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        .nav-link { font-family: 'DM Sans',sans-serif; font-size: 13px; color: #6b6357; text-decoration: none; transition: color 0.15s; }
        .nav-link:hover { color: #2d5a3d; }
        .nav-btn-outline:hover { background: #f5f2ec !important; }
        .nav-btn-solid:hover { background: #254d33 !important; }
        .nav-icon:hover { color: #2d5a3d !important; }
      `}</style>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: '#fff', borderBottom: '1px solid #f0ece4',
        boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
        fontFamily: "'DM Sans',sans-serif",
      }}>
        <div style={{
          maxWidth: 1152, margin: '0 auto', padding: '0 40px',
          height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: '#2d5a3d', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#a8d5b5' }} />
            </div>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, color: '#1e1a14' }}>
              Azmata <em style={{ color: '#2d5a3d' }}>Cookies</em>
            </span>
          </Link>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {navLinks.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="nav-link" onClick={e => handleNavClick(e, id)}>
                {label}
              </a>
            ))}
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {user ? (
              <>
                {user.role === 'pelanggan' && (
                  <Link to="/keranjang" className="nav-icon" style={{ color: '#6b6357', display: 'flex', alignItems: 'center' }}>
                    <ShoppingCart size={20} />
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" style={{
                    fontFamily: "'DM Sans',sans-serif", fontSize: 13, padding: '6px 14px',
                    background: '#f0f7f2', color: '#2d5a3d', borderRadius: 8, textDecoration: 'none', fontWeight: 500,
                  }}>
                    Dashboard Admin
                  </Link>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 12, borderLeft: '1px solid #f0ece4' }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', background: '#2d5a3d',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: '#fff',
                  }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: '#3a3530' }}>
                    {user.name?.split(' ')[0]}
                  </span>
                  <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9a9080', padding: 4, display: 'flex', alignItems: 'center' }}>
                    <LogOut size={15} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-btn-outline" style={{
                  fontFamily: "'DM Sans',sans-serif", fontSize: 13, padding: '7px 18px',
                  border: '1.5px solid #e0ddd6', color: '#3a3530', borderRadius: 8,
                  textDecoration: 'none', fontWeight: 500, transition: 'background 0.15s',
                }}>
                  Masuk
                </Link>
                <Link to="/register" className="nav-btn-solid" style={{
                  fontFamily: "'DM Sans',sans-serif", fontSize: 13, padding: '7px 18px',
                  background: '#2d5a3d', color: '#fff', borderRadius: 8,
                  textDecoration: 'none', fontWeight: 500, transition: 'background 0.15s',
                }}>
                  Daftar gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;