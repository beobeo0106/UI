/* eslint-disable */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { CONFIG } from 'src/config-global';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import InputBase from '@mui/material/InputBase';

import { fCurrency } from 'src/utils/format-number';
import { Iconify } from 'src/components/iconify';

export function ShopView() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${CONFIG.serverUrl}/api/v1/Products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Lỗi lấy sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToCart = (product: any) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) return prevCart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => setCart((prev) => prev.filter((item) => item.id !== productId));
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const handleCheckout = () => {
    if (cart.length === 0) return alert("Giỏ hàng đang trống!");
    alert(`Thanh toán thành công: ${fCurrency(totalAmount)}`);
    setCart([]); setIsCartOpen(false);
  };

  return (
    <Box sx={{ bgcolor: '#eaeded', minHeight: '100vh', pb: 10 }}>
      {/* 1. AMAZON HEADER */}
      <Box sx={{ bgcolor: '#131921', color: 'white', px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 3 }}>
        {/* Logo giả lập */}
        <Typography variant="h5" sx={{ fontWeight: 'bold', letterSpacing: -1, cursor: 'pointer' }}>
          amazon<Box component="span" sx={{ color: '#ff9900' }}>.vn</Box>
        </Typography>

        {/* Thanh tìm kiếm */}
        <Box sx={{ flexGrow: 1, display: 'flex', bgcolor: 'white', borderRadius: 1, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: '#f3f3f3', px: 2, py: 1, color: 'text.secondary', borderRight: '1px solid #ddd', display: { xs: 'none', md: 'block' } }}>
            All
          </Box>
          <InputBase placeholder="Search Amazon" sx={{ px: 2, flexGrow: 1, color: 'black' }} />
          <Box sx={{ bgcolor: '#febd69', px: 2, display: 'flex', alignItems: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#f3a847' } }}>
            {/* Đã thêm as any để bypass lỗi icon */}
            <Iconify icon={"eva:search-fill" as any} color="black" width={24} />
          </Box>
        </Box>

        {/* Nút Giỏ hàng */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', cursor: 'pointer', gap: 0.5 }} onClick={() => setIsCartOpen(true)}>
          <Badge badgeContent={cart.reduce((total, item) => total + item.quantity, 0)} color="error" sx={{ '& .MuiBadge-badge': { right: 5, top: 5, fontWeight: 'bold' } }}>
            {/* Đã thêm as any */}
            <Iconify icon={"solar:cart-large-minimalistic-bold" as any} width={38} color="white" />
          </Badge>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', display: { xs: 'none', md: 'block' }, mb: 0.5 }}>Cart</Typography>
        </Box>
      </Box>

      {/* 2. SUB-HEADER MENU */}
      <Box sx={{ bgcolor: '#232f3e', color: 'white', px: 2, py: 1, display: 'flex', gap: 3, overflowX: 'auto', typography: 'body2' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', fontWeight: 'bold' }}>
          {/* Đã thêm as any */}
          <Iconify icon={"eva:menu-fill" as any} /> All
        </Box>
        {['Today\'s Deals', 'Customer Service', 'Registry', 'Gift Cards', 'Sell'].map((item) => (
          <Box key={item} sx={{ cursor: 'pointer', whiteSpace: 'nowrap', '&:hover': { outline: '1px solid white', outlineOffset: '-1px' } }}>{item}</Box>
        ))}
      </Box>

      {/* 3. HERO BANNER */}
      <Box 
        sx={{ 
          height: { xs: 200, md: 350 }, 
          background: 'linear-gradient(to bottom, #d9a7c7, #eaeded)', 
          position: 'relative' 
        }}
      >
        <Typography variant="h3" sx={{ textAlign: 'center', pt: 5, color: '#333', fontWeight: 'bold' }}>
          Kitchen essentials
          <Typography variant="h5" sx={{ display: 'block', fontWeight: 'normal' }}>Under $50</Typography>
        </Typography>
      </Box>

      {/* 4. MAIN GRID */}
      <Container maxWidth="xl" sx={{ mt: { xs: -5, md: -15 }, position: 'relative', zIndex: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}><CircularProgress /></Box>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 0 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }} noWrap>
                    {product.name}
                  </Typography>
                  
                  <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Box
                      component="img"
                      src={product.images && product.images.length > 0 ? `${CONFIG.serverUrl}${product.images[0].imageUrl}` : product.coverUrl || '/assets/images/product/product_1.jpg'}
                      sx={{ height: 200, objectFit: 'contain' }}
                    />
                  </Box>

                  <Typography variant="h5" sx={{ mb: 1 }}>{fCurrency(product.price)}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2, flexGrow: 1 }}>
                    {product.category?.name || 'Chưa phân loại'}
                  </Typography>

                  <Button 
                    fullWidth 
                    variant="contained" 
                    sx={{ bgcolor: '#ffd814', color: 'black', borderRadius: 5, '&:hover': { bgcolor: '#f7ca00' }, textTransform: 'none', fontWeight: 'bold' }}
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to cart
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* 5. SIDEBAR GIỎ HÀNG */}
      <Drawer anchor="right" open={isCartOpen} onClose={() => setIsCartOpen(false)}>
        <Box sx={{ width: { xs: '100vw', sm: 400 }, p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight="bold">Subtotal</Typography>
            {/* Đã thêm as any */}
            <IconButton onClick={() => setIsCartOpen(false)}><Iconify icon={"mingcute:close-line" as any} /></IconButton>
          </Box>
          <Typography variant="h4" color="error" fontWeight="bold" sx={{ mb: 3 }}>{fCurrency(totalAmount)}</Typography>
          <Button fullWidth variant="contained" sx={{ bgcolor: '#ffd814', color: 'black', borderRadius: 5, py: 1.5, mb: 3, '&:hover': { bgcolor: '#f7ca00' } }} onClick={handleCheckout}>
            Proceed to Checkout
          </Button>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
            {cart.map((item) => (
              <Stack key={item.id} direction="row" spacing={2} sx={{ mb: 3 }}>
                <Box component="img" src={item.images && item.images.length > 0 ? `${CONFIG.serverUrl}${item.images[0].imageUrl}` : '/assets/images/product/product_1.jpg'} sx={{ width: 80, height: 80, objectFit: 'contain' }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</Typography>
                  <Typography variant="body2" sx={{ color: '#B12704', fontWeight: 'bold' }}>{fCurrency(item.price)}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Qty: {item.quantity}</Typography>
                </Box>
                {/* Đã thêm as any */}
                <IconButton color="error" size="small" onClick={() => handleRemoveFromCart(item.id)} sx={{ alignSelf: 'flex-start' }}><Iconify icon={"solar:trash-bin-trash-bold" as any} /></IconButton>
              </Stack>
            ))}
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}