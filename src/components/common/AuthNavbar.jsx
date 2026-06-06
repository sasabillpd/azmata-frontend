import { Link } from 'react-router-dom';

const AuthNavbar = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        .auth-navbar-back:hover { color: #1e1a14 !important; }
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
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: '#1e1a14' }}>
              Azmata <em style={{ color: '#2d5a3d' }}>Cookies</em>
            </span>
          </Link>

          <Link
            to="/"
            className="auth-navbar-back"
            style={{ fontSize: 13, color: '#6b6357', textDecoration: 'none', transition: 'color 0.15s' }}
          >
            ← Kembali ke beranda
          </Link>
        </div>
      </nav>
    </>
  );
};

export default AuthNavbar;