/* eslint-disable */
import { useState, useCallback } from 'react';
import axios from 'axios';
import { CONFIG } from 'src/config-global';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SignInView() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  
  const [username, setUsername] = useState('admin@shop.com'); 
  const [password, setPassword] = useState('Password123!');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignIn = useCallback(async () => {
    try {
      setErrorMessage(''); 
      
      const response = await axios.post(`${CONFIG.serverUrl}/api/v1/Auth/login`, {
        email: username,
        password: password
      });

      const token = response.data.token; 
      
      if (token) {
        localStorage.setItem('accessToken', token); 

        // 👇 ĐÃ THÊM: XỬ LÝ ĐIỀU HƯỚNG THEO ROLE
        let userRole = response.data.role; // Thử lấy trực tiếp từ response (nếu BE có trả)

        // Nếu BE không trả role ở ngoài, ta tự giải mã (Decode) token JWT để lấy Role
        if (!userRole) {
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);
            // Trong C# Identity, role thường nằm ở 1 trong 2 key này:
            userRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role;
          } catch (e) {
            console.error("Không thể giải mã Token:", e);
          }
        }

        // KIỂM TRA ROLE VÀ CHUYỂN TRANG
        if (userRole === 'Admin') {
          router.push('/products'); // Admin thì cho vào trang Quản lý sản phẩm
        } else {
          router.push('/shop'); // Customer (hoặc các role khác) thì đẩy qua trang Mua sắm
        }
        // ===========================================

      } else {
        setErrorMessage('Không nhận được Token từ server!');
      }

    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      setErrorMessage('Sai tài khoản hoặc mật khẩu!');
    }
  }, [router, username, password]);

  const renderForm = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        flexDirection: 'column',
      }}
    >
      <TextField
        fullWidth
        name="username"
        label="Tài khoản / Email"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <Link variant="body2" color="inherit" sx={{ mb: 1.5 }}>
        Forgot password?
      </Link>

      <TextField
        fullWidth
        name="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type={showPassword ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />
      
      {errorMessage && (
        <Typography color="error" variant="body2" sx={{ mb: 3, width: '100%', textAlign: 'left' }}>
          {errorMessage}
        </Typography>
      )}

      <Button
        fullWidth
        size="large"
        type="button" 
        color="inherit"
        variant="contained"
        onClick={handleSignIn}
      >
        Sign in
      </Button>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Typography variant="h5">Sign in</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          Don’t have an account?
          <Link variant="subtitle2" sx={{ ml: 0.5 }}>
            Get started
          </Link>
        </Typography>
      </Box>
      {renderForm}
      <Divider sx={{ my: 3, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}
        >
          OR
        </Typography>
      </Divider>
      <Box
        sx={{
          gap: 1,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:google" />
        </IconButton>
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:github" />
        </IconButton>
        <IconButton color="inherit">
          <Iconify width={22} icon="socials:twitter" />
        </IconButton>
      </Box>
    </>
  );
}