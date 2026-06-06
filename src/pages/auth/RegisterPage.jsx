import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

const ff = { serif: "'Playfair Display',serif", sans: "'DM Sans',sans-serif" };
const green = '#2d5a3d';
const cream = '#faf9f6';
const border = '#ede9e0';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Nama depan wajib diisi';
    if (!form.email.trim()) e.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Format email tidak valid';
    if (!form.phone.trim()) e.phone = 'Nomor telepon wajib diisi';
    if (!form.password) e.password = 'Kata sandi wajib diisi';
    else if (form.password.length < 6) e.password = 'Minimal 6 karakter';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Kata sandi tidak cocok';
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    try {
      const fullName = `${form.firstName} ${form.lastName}`.trim();
      await register({ name: fullName, email: form.email, phone: form.phone, password: form.password });
      toast.success('Registrasi berhasil! Silakan masuk.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  const inputBase = (hasErr) => ({
    width: '100%',
    height: 44,
    padding: '0 14px',
    borderRadius: 10,
    border: `1.5px solid ${hasErr ? '#fca5a5' : border}`,
    fontSize: 13,
    fontFamily: ff.sans,
    color: '#1e1a14',
    background: '#fff',
  });

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
        <nav style={{ background: '#fff', borderBottom: `1px solid ${border}`, padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: ff.serif, fontSize: 20, color: '#1e1a14', letterSpacing: '-0.3px' }}>
              Azmata <em style={{ color: green }}>Cookies</em>
            </span>
          </Link>
          <span style={{ fontFamily: ff.sans, fontSize: 13, color: '#9a9080' }}>
            Sudah punya akun?{' '}
            <Link to="/login" className="al" style={{ color: green, textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s' }}>Masuk di sini</Link>
          </span>
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
                Bergabung dan<br />mulai memesan 🍪
              </h2>
              <p style={{ fontFamily: ff.sans, fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, margin: '0 0 36px' }}>
                Daftar sekarang dan nikmati kemudahan memesan kue kering premium langsung dari rumah produksi kami.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'Katalog produk lengkap dengan foto & harga',
                  'Pemesanan online tanpa harus chat manual',
                  'Pantau status pesanan secara real-time',
                ].map(t => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="9" height="9"><polyline points="1,5 3.5,7.5 8,2" fill="none" stroke="#a8d5b5" strokeWidth="1.8" /></svg>
                    </div>
                    <span style={{ fontFamily: ff.sans, fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form panel */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
            <div style={{ width: '100%', maxWidth: 440 }}>

              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: ff.serif, fontSize: 26, fontWeight: 700, color: '#1e1a14', margin: '0 0 6px', letterSpacing: '-0.3px' }}>Buat akun baru</h1>
                <p style={{ fontFamily: ff.sans, fontSize: 13, color: '#9a9080', margin: 0 }}>
                  Sudah punya akun?{' '}
                  <Link to="/login" className="al" style={{ color: green, textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s' }}>Masuk di sini</Link>
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Nama */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: ff.sans, fontSize: 11, fontWeight: 500, color: '#6b6357', marginBottom: 7 }}>Nama depan</label>
                    <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Budi" className="ai" style={inputBase(!!errors.firstName)} />
                    {errors.firstName && <p style={{ fontFamily: ff.sans, fontSize: 11, color: '#e57373', margin: '5px 0 0' }}>{errors.firstName}</p>}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: ff.sans, fontSize: 11, fontWeight: 500, color: '#6b6357', marginBottom: 7 }}>Nama belakang</label>
                    <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Santoso" className="ai" style={inputBase(false)} />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontFamily: ff.sans, fontSize: 11, fontWeight: 500, color: '#6b6357', marginBottom: 7 }}>Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="kamu@email.com" className="ai" style={inputBase(!!errors.email)} />
                  {errors.email && <p style={{ fontFamily: ff.sans, fontSize: 11, color: '#e57373', margin: '5px 0 0' }}>{errors.email}</p>}
                </div>

                {/* Telepon */}
                <div>
                  <label style={{ display: 'block', fontFamily: ff.sans, fontSize: 11, fontWeight: 500, color: '#6b6357', marginBottom: 7 }}>Nomor telepon</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="08xxxxxxxxxx" className="ai" style={inputBase(!!errors.phone)} />
                  {errors.phone && <p style={{ fontFamily: ff.sans, fontSize: 11, color: '#e57373', margin: '5px 0 0' }}>{errors.phone}</p>}
                </div>

                {/* Password */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: ff.sans, fontSize: 11, fontWeight: 500, color: '#6b6357', marginBottom: 7 }}>Kata sandi</label>
                    <div style={{ position: 'relative' }}>
                      <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Min. 6 karakter" className="ai" style={{ ...inputBase(!!errors.password), paddingRight: 40 }} />
                      <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9a9080', display: 'flex', padding: 0 }}>
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {errors.password && <p style={{ fontFamily: ff.sans, fontSize: 11, color: '#e57373', margin: '5px 0 0' }}>{errors.password}</p>}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: ff.sans, fontSize: 11, fontWeight: 500, color: '#6b6357', marginBottom: 7 }}>Konfirmasi</label>
                    <div style={{ position: 'relative' }}>
                      <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange} placeholder="Ulangi sandi" className="ai" style={{ ...inputBase(!!errors.confirmPassword), paddingRight: 40 }} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9a9080', display: 'flex', padding: 0 }}>
                        {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p style={{ fontFamily: ff.sans, fontSize: 11, color: '#e57373', margin: '5px 0 0' }}>{errors.confirmPassword}</p>}
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading} className="ab"
                  style={{ height: 46, background: loading ? '#9dbfaa' : green, color: '#fff', fontFamily: ff.sans, fontSize: 14, fontWeight: 500, border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.15s', marginTop: 4 }}>
                  {loading
                    ? <div style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    : <>Buat akun sekarang <ArrowRight size={14} /></>}
                </button>
              </form>

              <p style={{ fontFamily: ff.sans, fontSize: 12, color: '#c5bfb5', textAlign: 'center', marginTop: 20 }}>
                Dengan mendaftar, kamu menyetujui <span style={{ color: '#9a9080', cursor: 'pointer' }}>Syarat & Ketentuan</span>
              </p>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;