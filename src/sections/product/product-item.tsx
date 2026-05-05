/* eslint-disable */
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton'; 

// 1. QUAN TRỌNG: Thêm dòng import này để lấy link Somee
import { CONFIG } from 'src/config-global'; 

import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { ColorPreview } from 'src/components/color-utils';
import { Iconify } from 'src/components/iconify'; 

// ----------------------------------------------------------------------

export type ProductItemProps = {
  id: string;
  name: string;
  price: number;
  status: string;
  coverUrl: string;
  colors: string[];
  priceSale: number | null;
  // 👇 THÊM ĐOẠN NÀY: Khai báo để React biết có thêm dữ liệu danh mục
  category?: {
    name: string;
  };
};

export function ProductItem({ product, onDelete, onEdit }: { product: ProductItemProps; onDelete: () => void; onEdit: () => void }) {
  
  const renderDeleteBtn = (
    <IconButton
      onClick={onDelete}
      sx={{
        position: 'absolute',
        zIndex: 9,
        top: 8,
        left: 8, 
        color: 'error.main',
        bgcolor: 'background.paper',
        '&:hover': { bgcolor: 'error.lighter' },
      }}
    >
      <Iconify icon="solar:trash-bin-trash-bold" />
    </IconButton>
  );
  
  const renderEditBtn = (
    <IconButton
      onClick={onEdit}
      sx={{
        position: 'absolute', zIndex: 9, top: 8, left: 48, 
        color: 'info.main', bgcolor: 'background.paper',
        '&:hover': { bgcolor: 'info.lighter' },
      }}
    >
      <Iconify icon="solar:pen-bold" />
    </IconButton>
  );

  const renderStatus = (
    <Label
      variant="inverted"
      color={(product.status === 'sale' && 'error') || 'info'}
      sx={{
        zIndex: 9,
        top: 16,
        right: 16,
        position: 'absolute',
        textTransform: 'uppercase',
      }}
    >
      {product.status}
    </Label>
  );

  const renderImg = (
    <Box
      component="img"
      alt={product.name}
      // Chỉ cần dùng đường dẫn gốc từ Database (ví dụ: /uploads/products/...)
      // Vercel sẽ tự động hiểu và lấy ảnh từ Somee qua file vercel.json ở trên
      src={product.coverUrl} 
      sx={{
        top: 0,
        width: 1,
        height: 1,
        objectFit: 'cover',
        position: 'absolute',
      }}
    />
  );

  const renderPrice = (
    <Typography variant="subtitle1">
      <Typography
        component="span"
        variant="body1"
        sx={{
          color: 'text.disabled',
          textDecoration: 'line-through',
        }}
      >
        {product.priceSale && fCurrency(product.priceSale)}
      </Typography>
      &nbsp;
      {fCurrency(product.price)}
    </Typography>
  );

  return (
    <Card>
      <Box sx={{ pt: '100%', position: 'relative' }}>
        {product.status && renderStatus}
        
        {renderDeleteBtn} 
        {renderEditBtn}
        
        {renderImg}
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Link color="inherit" underline="hover" variant="subtitle2" noWrap>
          {product.name}
        </Link>

        {/* 👇 THÊM ĐOẠN NÀY: Hiển thị tên danh mục màu xám nhỏ nhắn */}
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.secondary', 
            mt: -1.5, 
            display: 'block' 
          }}
        >
          {product.category?.name || 'Chưa phân loại'}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <ColorPreview colors={product.colors} />
          {renderPrice}
        </Box>
      </Stack>
    </Card>
  );
}