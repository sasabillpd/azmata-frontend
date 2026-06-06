import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import LupaSandiPage from './pages/auth/LupaSandiPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Customer pages
import KatalogPage from './pages/customer/KatalogPage';
import DetailProdukPage from './pages/customer/DetailProdukPage';
import KeranjangPage from './pages/customer/KeranjangPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import PembayaranPage from './pages/customer/PembayaranPage';
import RiwayatPesananPage from './pages/customer/RiwayatPesananPage';
import DetailPesananPage from './pages/customer/DetailPesananPage';
import ProfilPage from './pages/customer/ProfilPage';
import VoucherPage from './pages/customer/VoucherPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProduk from './pages/admin/AdminProduk';
import AdminPesanan from './pages/admin/AdminPesanan';
import AdminKonfirmasiBayar from './pages/admin/AdminKonfirmasiBayar';
import AdminVoucher          from './pages/admin/AdminVoucher'; 
import AdminLaporan from './pages/admin/AdminLaporan';
import AdminPengguna from './pages/admin/AdminPengguna';

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<LandingPage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      

      {/* Public — bisa diakses tanpa login */}
      <Route path="/katalog"    element={<KatalogPage />} />
      <Route path="/produk/:id" element={<DetailProdukPage />} />
      <Route path="/lupa-sandi" element={<LupaSandiPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* Customer — butuh login */}
      <Route path="/keranjang"            element={<ProtectedRoute><KeranjangPage /></ProtectedRoute>} />
      <Route path="/checkout"             element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
      <Route path="/pembayaran/:order_id" element={<ProtectedRoute><PembayaranPage /></ProtectedRoute>} />
      <Route path="/pesanan"              element={<ProtectedRoute><RiwayatPesananPage /></ProtectedRoute>} />
      <Route path="/pesanan/new"          element={<ProtectedRoute><DetailPesananPage /></ProtectedRoute>} />
      <Route path="/pesanan/:id"          element={<ProtectedRoute><DetailPesananPage /></ProtectedRoute>} />
      <Route path="/profil"               element={<ProtectedRoute><ProfilPage /></ProtectedRoute>} />
      <Route path="/voucher" element={<ProtectedRoute><VoucherPage /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin"          element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/produk"   element={<ProtectedRoute adminOnly><AdminProduk /></ProtectedRoute>} />
      <Route path="/admin/pesanan"  element={<ProtectedRoute adminOnly><AdminPesanan /></ProtectedRoute>} />
      <Route path="/admin/bayar"    element={<ProtectedRoute adminOnly><AdminKonfirmasiBayar /></ProtectedRoute>} />
      <Route path="/admin/voucher"  element={<ProtectedRoute adminOnly><AdminVoucher /></ProtectedRoute>} />
      <Route path="/admin/laporan"  element={<ProtectedRoute adminOnly><AdminLaporan /></ProtectedRoute>} />
      <Route path="/admin/pengguna" element={<ProtectedRoute adminOnly><AdminPengguna /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;