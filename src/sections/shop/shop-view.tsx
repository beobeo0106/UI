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

import { fCurrency } from 'src/utils/format-number';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

export function ShopView() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State quản lý Giỏ hàng
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Lấy dữ liệu sản phẩm từ Backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${CONFIG.serverUrl}/api/v1/Products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Hàm thêm sản phẩm vào giỏ
  const handleAddToCart = (product: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        // Nếu đã có trong giỏ, tăng số lượng lên 1
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // Nếu chưa có, thêm mới với số lượng là 1
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Hàm xóa sản phẩm khỏi giỏ
  const handleRemoveFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Tính tổng tiền
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Hàm xử lý thanh toán
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }
    // Ở đây bạn có thể gọi API tạo đơn hàng (Order)
    alert(`Thanh toán thành công tổng số tiền: ${fCurrency(totalAmount)}`);
    setCart([]); // Xóa giỏ hàng sau khi thanh toán
    setIsCartOpen(false);
  };

  return (
    <DashboardContent>
      {/* Tiêu đề & Giỏ hàng */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5 }}>
        <Typography variant="h4">Cửa Hàng</Typography>
        
        <IconButton color="primary" onClick={() => setIsCartOpen(true)}>
          <Badge badgeContent={cart.reduce((total, item) => total + item.quantity, 0)} color="error">
            <Iconify icon="solar:cart-large-minimalistic-bold" width={28} />
          </Badge>
        </IconButton>
      </Box>

      {/* Danh sách sản phẩm */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid key={product.id} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <Box sx={{ pt: '100%', position: 'relative' }}>
                  <Box
                    component="img"
                    alt={product.name}
                    src={product.images && product.images.length > 0 
                          ? `${CONFIG.serverUrl}${product.images[0].imageUrl}` 
                          : product.coverUrl || '/assets/images/product/product_1.jpg'}
                    sx={{ top: 0, width: 1, height: 1, objectFit: 'cover', position: 'absolute' }}
                  />
                </Box>

                <Stack spacing={2} sx={{ p: 3 }}>
                  <Typography variant="subtitle2" noWrap>
                    {product.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mt: -1.5, display: 'block' }}>
                    {product.category?.name || 'Chưa phân loại'}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1">{fCurrency(product.price)}</Typography>
                    <Button 
                      size="small" 
                      variant="contained" 
                      color="primary"
                      onClick={() => handleAddToCart(product)}
                    >
                      Thêm vào giỏ
                    </Button>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Giao diện Sidebar Giỏ Hàng */}
      <Drawer anchor="right" open={isCartOpen} onClose={() => setIsCartOpen(false)}>
        <Box sx={{ width: 350, p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Giỏ Hàng Của Bạn</Typography>
            <IconButton onClick={() => setIsCartOpen(false)}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
            {cart.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mt: 5 }}>
                Chưa có sản phẩm nào.
              </Typography>
            ) : (
              cart.map((item) => (
                <Stack key={item.id} direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Box
                    component="img"
                    src={item.images && item.images.length > 0 ? `${CONFIG.serverUrl}${item.images[0].imageUrl}` : '/assets/images/product/product_1.jpg'}
                    sx={{ width: 50, height: 50, borderRadius: 1, objectFit: 'cover' }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2" noWrap sx={{ maxWidth: 150 }}>{item.name}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {fCurrency(item.price)} x {item.quantity}
                    </Typography>
                  </Box>
                  <IconButton color="error" size="small" onClick={() => handleRemoveFromCart(item.id)}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Stack>
              ))
            )}
          </Box>

          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Tổng cộng:</Typography>
              <Typography variant="subtitle1" color="error">{fCurrency(totalAmount)}</Typography>
            </Stack>
            <Button fullWidth variant="contained" color="primary" size="large" onClick={handleCheckout}>
              Thanh Toán
            </Button>
          </Box>
        </Box>
      </Drawer>
    </DashboardContent>
  );
}