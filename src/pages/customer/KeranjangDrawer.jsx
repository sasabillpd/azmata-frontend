import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Minus, ShoppingBag, ArrowRight, X } from 'lucide-react';
import { useAuth, cartKey } from '../../context/AuthContext';
import api from '../../utils/axios';

const KeranjangDrawer = ({ cart, setCart, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const KEY = cartKey(user?.id);

  useEffect(() => {
    if (cart.length === 0) return;
    Promise.all(cart.map(item => api.get(`/products/${item.id}`)))
      .then(responses => {
        const withChecked = cart.map((item, i) => ({
          ...item,
          stock: responses[i].data.stock ?? item.stock,
          checked: Number(responses[i].data.stock) === 0 ? false : item.checked,
        }));
        setCart(withChecked);
        localStorage.setItem(KEY, JSON.stringify(withChecked));
      })
      .catch(() => {});
  }, []);

  const updateQty = (id, dir) => {
    const updated = cart.map(i => i.id === id ? { ...i, qty: i.qty + dir } : i).filter(i => i.qty > 0);
    setCart(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
  };

  const toggleCheck = (id) => {
    const updated = cart.map(i => i.id === id ? { ...i, checked: !i.checked } : i);
    setCart(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
  };

  const checkedItems = cart.filter(i => i.checked !== false && Number(i.stock) !== 0);
  const subtotal    = checkedItems.reduce((acc, i) => acc + Number(i.price) * i.qty, 0);
  const totalItems  = checkedItems.reduce((acc, i) => acc + i.qty, 0);

  const handleCheckout = () => {
    if (checkedItems.length === 0) { toast.error('Pilih item yang ingin di-checkout dulu'); return; }
    onClose();
    navigate('/checkout', { state: { items: checkedItems, fromDrawer: true } });
  };

  const sortedCart = [...cart].sort((a, b) => {
    if (Number(a.stock) === 0 && Number(b.stock) !== 0) return 1;
    if (Number(a.stock) !== 0 && Number(b.stock) === 0) return -1;
    return 0;
  });

  const getImage = (item) => {
    const f = [item.image_1, item.image_2, item.image_3, item.image_4].find(f => f);
    return f ? f : null;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        .drawer-root { font-family: 'DM Sans', sans-serif; }
        .drawer-check {
          width: 20px; height: 20px; border-radius: 6px; border: 2px solid #d5cfc4;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; cursor: pointer; transition: all 0.15s; background: #fff;
        }
        .drawer-check.checked { background: #2d5a3d; border-color: #2d5a3d; }
        .drawer-check.disabled { background: #f5f3ef; border-color: #e0ddd6; cursor: not-allowed; }
        .qty-mini {
          width: 26px; height: 26px; border-radius: 8px; border: 1.5px solid #d5e8dc;
          background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
          color: #2d5a3d; transition: all 0.15s;
        }
        .qty-mini:hover { background: #e8f5ee; border-color: #4a9e6b; }
        .qty-mini:disabled { color: #c5bfb5; border-color: #ede9e0; cursor: not-allowed; }
      `}</style>

      {/* Backdrop */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.18)', backdropFilter: 'blur(1px)' }} onClick={onClose} />

      {/* Drawer */}
      <div className="drawer-root" style={{
        position: 'fixed', top: 80, right: 24, zIndex: 9999,
        width: 400, background: '#fff', borderRadius: 20,
        boxShadow: '0 24px 64px rgba(0,0,0,0.14)', border: '1px solid #ede9e0',
        display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 104px)', overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0ece4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={16} style={{ color: '#2d5a3d' }} />
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 600, color: '#1e1a14' }}>Keranjang</span>
            {cart.length > 0 && (
              <span style={{ fontSize: 11, color: '#9a9080', fontFamily: "'DM Sans',sans-serif" }}>
                {checkedItems.length}/{cart.length} dipilih
              </span>
            )}
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f5f2ec', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b6357' }}>
            <X size={14} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {cart.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, color: '#3a3530', marginBottom: 6 }}>Keranjang kosong</p>
              <button onClick={() => { onClose(); navigate('/katalog'); }}
                style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: '#2d5a3d', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                Belanja sekarang
              </button>
            </div>
          ) : sortedCart.map(item => {
            const isChecked  = item.checked !== false;
            const outOfStock = Number(item.stock) === 0;
            const imgSrc     = getImage(item);

            return (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 20px', borderBottom: '1px solid #f5f2ec',
                background: outOfStock ? '#faf9f7' : '#fff', opacity: outOfStock ? 0.65 : 1,
                transition: 'background 0.15s',
              }}>
                {/* Checkbox */}
                <div
                  className={`drawer-check ${outOfStock ? 'disabled' : isChecked ? 'checked' : ''}`}
                  onClick={() => !outOfStock && toggleCheck(item.id)}
                >
                  {isChecked && !outOfStock && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>

                {/* Image */}
                <div style={{ width: 56, height: 56, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg,#f0ece4,#e8e2d8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {imgSrc
                    ? <img src={imgSrc} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: outOfStock ? 'grayscale(60%)' : 'none' }} onError={e => { e.target.style.display='none'; }} />
                    : <span style={{ fontSize: 22 }}>🍪</span>}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 600, color: '#1e1a14', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </p>
                  {outOfStock ? (
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: '#c8a96e', fontWeight: 500 }}>Stok habis</span>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <button className="qty-mini" onClick={() => updateQty(item.id, -1)} disabled={item.qty <= 1}><Minus size={11} /></button>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500, color: '#1e1a14', minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                      <button className="qty-mini" onClick={() => updateQty(item.id, 1)}><Plus size={11} /></button>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 700, color: outOfStock ? '#c5bfb5' : isChecked ? '#2d5a3d' : '#c5bfb5', margin: 0 }}>
                    Rp {(Number(item.price) * item.qty).toLocaleString('id-ID')}
                  </p>
                  {!outOfStock && (
                    <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: '#b5a99a', margin: '2px 0 0' }}>
                      @Rp {Number(item.price).toLocaleString('id-ID')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ background: '#2d5a3d', padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>
              <span>Subtotal ({totalItems} item)</span>
              <span>Rp {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 14 }}>
              <span>Ongkos kirim</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>Dihitung saat checkout</span>
            </div>
            <button onClick={handleCheckout} disabled={checkedItems.length === 0} style={{
              width: '100%', padding: '12px 0', borderRadius: 12, border: 'none',
              background: checkedItems.length === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.22)',
              color: '#fff', fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 600,
              cursor: checkedItems.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.15s', opacity: checkedItems.length === 0 ? 0.5 : 1,
            }}>
              Checkout ({checkedItems.length} item) <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default KeranjangDrawer;