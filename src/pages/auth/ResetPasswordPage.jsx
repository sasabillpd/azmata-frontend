import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff, KeyRound, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

const ff = { serif: "'Playfair Display',serif", sans: "'DM Sans',sans-serif" };
const green = '#2d5a3d';
const border = '#ede9e0';
const cream = '#faf9f6';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword]       = useState('');
  const [konfirmasi, setKonfirmasi]   = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [showKonfirm, setShowKonfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);
  const [tokenValid, setTokenValid]   = useState(true);

  useEffect(() => { if (!token) setTokenValid(false); }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) { toast.error('Password minimal 8 karakter'); return; }
    if (password !== konfirmasi) { toast.error('Konfirmasi password tidak cocok'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('kadaluarsa') || msg.includes('valid')) setTokenValid(false);
      else toast.error(msg || 'Gagal mereset password');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError) => ({
    width: '100%', height: 44, padding: '0 14px', borderRadius: 10,
    border: `1.5px solid ${hasError ? '#fca5a5' : border}`,
    fontSize: 13, fontFamily: ff.sans, color: '#1e1a14', background: '#fff',
    transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box',
  });

  const renderContent = () => {
    if (!tokenValid) return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <XCircle size={28} style={{ color: '#e57373' }} />
        </div>
        <h1 style={{ fontFamily: ff.serif, fontSize: 24, fontWeight: 700, color: '#1e1a14', margin: '0 0 8px' }}>Link tidak valid</h1>
        <p style={{ fontFamily: ff.sans, fontSize: 13, color: '#9a9080', lineHeight: 1.6, margin: '0 0 28px' }}>
          Link reset kata sandi sudah kadaluarsa atau tidak valid. Silakan minta link baru.
        </p>
        <Link to="/lupa-sandi" className="rp-btn"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, background: green, color: '#fff', fontFamily: ff.sans, fontSize: 14, fontWeight: 500, borderRadius: 10, textDecoration: 'none', transition: 'background 0.15s' }}>
          Minta link baru <ArrowRight size={14} />
        </Link>
      </div>
    );

    if (success) return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0f7f2', border: '1px solid #c5dfc9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle2 size={28} style={{ color: green }} />
        </div>
        <h1 style={{ fontFamily: ff.serif, fontSize: 24, fontWeight: 700, color: '#1e1a14', margin: '0 0 8px' }}>Kata sandi berhasil direset!</h1>
        <p style={{ fontFamily: ff.sans, fontSize: 13, color: '#9a9080', lineHeight: 1.6, margin: '0 0 28px' }}>
          Kata sandumu sudah diperbarui. Kamu akan diarahkan ke halaman masuk dalam 3 detik...
        </p>
        <Link to="/login" className="rp-btn"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 46, background: green, color: '#fff', fontFamily: ff.sans, fontSize: 14, fontWeight: 500, borderRadius: 10, textDecoration: 'none', transition: 'background 0.15s' }}>
          Masuk sekarang <ArrowRight size={14} />
        </Link>
      </div>
    );

    return (
      <>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: '#f0f7f2', border: '1px solid #c5dfc9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <KeyRound size={22} style={{ color: green }} />
        </div>

        <h1 style={{ fontFamily: ff.serif, fontSize: 24, fontWeight: 700, color: '#1e1a14', margin: '0 0 6px' }}>Buat kata sandi baru</h1>
        <p style={{ fontFamily: ff.sans, fontSize: 13, color: '#9a9080', margin: '0 0 28px', lineHeight: 1.6 }}>
          Masukkan kata sandi baru yang kuat untuk akunmu.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#6b6357', marginBottom: 6, fontFamily: ff.sans }}>
              Kata sandi baru
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="rp-input"
                style={{ ...inputStyle(false), paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPass(p => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9a9080', display: 'flex', padding: 0 }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#6b6357', marginBottom: 6, fontFamily: ff.sans }}>
              Konfirmasi kata sandi
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showKonfirm ? 'text' : 'password'} value={konfirmasi}
                onChange={e => setKonfirmasi(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="rp-input"
                style={{ ...inputStyle(konfirmasi && password !== konfirmasi), paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowKonfirm(p => !p)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9a9080', display: 'flex', padding: 0 }}>
                {showKonfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {konfirmasi && password !== konfirmasi && (
              <p style={{ fontFamily: ff.sans, fontSize: 11, color: '#e57373', margin: '5px 0 0' }}>Kata sandi tidak cocok</p>
            )}
          </div>

          <div style={{ background: '#f0f7f2', border: '1px solid #c5dfc9', borderRadius: 10, padding: '10px 14px' }}>
            <p style={{ fontFamily: ff.sans, fontSize: 12, color: green, margin: 0 }}>Minimal 8 karakter — kombinasi huruf dan angka.</p>
          </div>

          <button type="submit" disabled={loading || (konfirmasi && password !== konfirmasi)} className="rp-btn"
            style={{ height: 46, background: loading || (konfirmasi && password !== konfirmasi) ? '#9dbfaa' : green, color: '#fff', fontFamily: ff.sans, fontSize: 14, fontWeight: 500, border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.15s', marginTop: 2 }}>
            {loading
              ? <div style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              : <>Simpan kata sandi baru <ArrowRight size={14} /></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/login" className="rp-link"
            style={{ fontFamily: ff.sans, fontSize: 13, color: '#9a9080', textDecoration: 'none', transition: 'color 0.15s' }}>
            Kembali ke halaman masuk
          </Link>
        </div>
      </>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .rp-input:focus { border-color: ${green} !important; box-shadow: 0 0 0 3px rgba(45,90,61,0.08); outline: none; }
        .rp-btn:hover:not(:disabled) { background: #1e3e2b !important; }
        .rp-link:hover { color: #1e3e2b !important; }
      `}</style>

      <div style={{ minHeight: '100vh', background: cream, fontFamily: ff.sans, display: 'flex', flexDirection: 'column' }}>

        {/* Navbar */}
        <nav style={{ background: '#fff', borderBottom: `1px solid ${border}`, padding: '0 40px', height: 60, display: 'flex', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: ff.serif, fontSize: 20, color: '#1e1a14' }}>
              Azmata <em style={{ color: green }}>Cookies</em>
            </span>
          </Link>
        </nav>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <div style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 24, border: `1px solid ${border}`, padding: '40px 36px', boxShadow: '0 2px 24px rgba(0,0,0,0.05)' }}>
            {renderContent()}
          </div>
        </div>

      </div>
    </>
  );
};

export default ResetPasswordPage;