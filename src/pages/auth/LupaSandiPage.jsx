import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/axios';
import { ArrowLeft, Mail, CheckCircle2, ArrowRight } from 'lucide-react';

const ff = { serif: "'Playfair Display',serif", sans: "'DM Sans',sans-serif" };
const green = '#2d5a3d';
const cream = '#faf9f6';
const border = '#ede9e0';

const LupaSandiPage = () => {
  const [step, setStep]       = useState(1);
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email wajib diisi'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Format email tidak valid'); return; }
    setLoading(true);
    try { await api.post('/auth/forgot-password', { email }); } catch {}
    finally { setLoading(false); setStep(2); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ai { transition: border-color 0.15s, box-shadow 0.15s; }
        .ai:focus { border-color: ${green} !important; box-shadow: 0 0 0 3px rgba(45,90,61,0.08); outline: none; }
        .ab:hover:not(:disabled) { background: #254d33 !important; }
        .al:hover { color: #254d33 !important; }
        @media (max-width: 860px) { .ap { display: none !important; } }
      `}</style>

      <div style={{ minHeight: '100vh', background: cream, fontFamily: ff.sans, display: 'flex', flexDirection: 'column' }}>

        {/* Navbar */}
        <nav style={{ background: '#fff', borderBottom: `1px solid ${border}`, padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: ff.serif, fontSize: 20, color: '#1e1a14', letterSpacing: '-0.3px' }}>
              Azmata <em style={{ color: green }}>Cookies</em>
            </span>
          </Link>
          <Link to="/login" className="al" style={{ fontFamily: ff.sans, fontSize: 13, color: '#9a9080', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.15s' }}>
            <ArrowLeft size={13} /> Kembali ke halaman masuk
          </Link>
        </nav>

        <div style={{ flex: 1, display: 'flex' }}>

          {/* Left panel */}
          <div className="ap" style={{ width: 380, flexShrink: 0, background: green, padding: '64px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', bottom: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
            <div style={{ position: 'absolute', top: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, marginBottom: 28 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#a8d5b5' }} />
                <span style={{ fontFamily: ff.sans, fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>Kue kering premium · Pasuruan</span>
              </div>
              <h2 style={{ fontFamily: ff.serif, fontSize: 30, fontWeight: 600, color: '#fff', lineHeight: 1.25, margin: '0 0 12px', letterSpacing: '-0.3px' }}>
                Lupa kata sandi?<br /><em style={{ fontStyle: 'italic', opacity: 0.85 }}>Tenang aja.</em>
              </h2>
              <p style={{ fontFamily: ff.sans, fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, margin: '0 0 36px' }}>
                Masukkan email yang terdaftar dan kami akan membantu kamu mengatur ulang kata sandi.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {['Masukkan email yang terdaftar', 'Cek inbox atau folder spam', 'Ikuti instruksi di email'].map((t, i) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: ff.sans, fontSize: 11, fontWeight: 700, color: '#a8d5b5' }}>{i + 1}</span>
                    </div>
                    <span style={{ fontFamily: ff.sans, fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
            <div style={{ width: '100%', maxWidth: 400 }}>

              {step === 1 ? (
                <>
                  <div style={{ width: 48, height: 48, background: '#f0f7f2', border: `1px solid #c5dfc9`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                    <Mail size={20} style={{ color: green }} />
                  </div>
                  <h1 style={{ fontFamily: ff.serif, fontSize: 26, fontWeight: 700, color: '#1e1a14', margin: '0 0 6px', letterSpacing: '-0.3px' }}>Reset kata sandi</h1>
                  <p style={{ fontFamily: ff.sans, fontSize: 13, color: '#9a9080', margin: '0 0 32px', lineHeight: 1.65 }}>
                    Masukkan email yang kamu gunakan saat mendaftar. Kami akan mengirimkan instruksi reset.
                  </p>
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                      <label style={{ display: 'block', fontFamily: ff.sans, fontSize: 11, fontWeight: 500, color: '#6b6357', marginBottom: 7 }}>Alamat email</label>
                      <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="kamu@email.com" className="ai"
                        style={{ width: '100%', height: 44, padding: '0 14px', borderRadius: 10, border: `1.5px solid ${error ? '#fca5a5' : border}`, fontSize: 13, fontFamily: ff.sans, color: '#1e1a14', background: '#fff' }} />
                      {error && <p style={{ fontFamily: ff.sans, fontSize: 11, color: '#e57373', margin: '5px 0 0' }}>{error}</p>}
                    </div>
                    <button type="submit" disabled={loading} className="ab"
                      style={{ height: 46, background: loading ? '#9dbfaa' : green, color: '#fff', fontFamily: ff.sans, fontSize: 14, fontWeight: 500, border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.15s' }}>
                      {loading
                        ? <div style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                        : <>Kirim instruksi reset <ArrowRight size={14} /></>}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div style={{ width: 56, height: 56, background: '#f0f7f2', border: `1px solid #c5dfc9`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                    <CheckCircle2 size={26} style={{ color: green }} />
                  </div>
                  <h1 style={{ fontFamily: ff.serif, fontSize: 26, fontWeight: 700, color: '#1e1a14', margin: '0 0 8px', letterSpacing: '-0.3px' }}>Email terkirim!</h1>
                  <p style={{ fontFamily: ff.sans, fontSize: 13, color: '#9a9080', margin: '0 0 14px', lineHeight: 1.65 }}>
                    Kami telah mengirimkan instruksi reset kata sandi ke:
                  </p>
                  <div style={{ background: '#f0f7f2', border: `1px solid #c5dfc9`, borderRadius: 10, padding: '10px 16px', marginBottom: 14, fontFamily: ff.sans, fontSize: 14, fontWeight: 600, color: green, textAlign: 'center' }}>
                    {email}
                  </div>
                  <p style={{ fontFamily: ff.sans, fontSize: 12, color: '#9a9080', lineHeight: 1.65, margin: '0 0 28px' }}>
                    Tidak menerima email? Cek folder <strong>spam</strong> atau tunggu beberapa menit. Link berlaku <strong>15 menit</strong>.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button onClick={() => { setStep(1); setEmail(''); }}
                      style={{ height: 44, background: '#fff', color: '#6b6357', fontFamily: ff.sans, fontSize: 13, border: `1.5px solid ${border}`, borderRadius: 10, cursor: 'pointer', transition: 'background 0.15s' }}>
                      Kirim ulang ke email lain
                    </button>
                    <Link to="/login" className="ab"
                      style={{ height: 44, background: green, color: '#fff', fontFamily: ff.sans, fontSize: 14, fontWeight: 500, borderRadius: 10, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.15s' }}>
                      Kembali ke halaman masuk <ArrowRight size={14} />
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LupaSandiPage;