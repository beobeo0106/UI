/* eslint-disable */
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { CONFIG } from 'src/config-global';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';

// 👇 THÊM: Import các thư viện dùng để làm Dropdown (Select)
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';

import { ProductItem } from '../product-item';

// ----------------------------------------------------------------------

const COLOR_OPTIONS = ['#00AB55', '#000000', '#FFFFFF', '#FFC0CB', '#FF4842', '#1890FF', '#94D82D', '#FFC107'];

export function ProductsView() {
  const [products, setProducts] = useState<any[]>([]);
  // 👇 THÊM: State để lưu danh sách danh mục lấy từ Backend
  const [categories, setCategories] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    slug: '', 
    price: 0,
    stock: 0,
    shortDesc: '',
    longDesc: '',
    brandId: 1, 
    categoryId: 1 // Sẽ được cập nhật khi chọn từ Dropdown
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);

  // 👇 THÊM: Hàm gọi API lấy danh mục
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${CONFIG.serverUrl}/api/v1/Categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu danh mục:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${CONFIG.serverUrl}/api/v1/Products`);
      
      const realData = response.data.map((item: any, index: number) => ({
        id: item.id.toString(),
        name: item.name,
        sku: item.sku,
        slug: item.slug, 
        price: item.price,
        stock: item.stock,
        shortDesc: item.shortDesc,
        longDesc: item.longDesc,
        brandId: item.brandId,
        categoryId: item.categoryId,
        category: item.category, // Lấy nguyên cục thông tin category để truyền qua ProductItem
        priceSale: null,
        colors: [COLOR_OPTIONS[1], COLOR_OPTIONS[2]], 
        status: item.stock > 0 ? 'sale' : 'out of stock',
        coverUrl: item.images && item.images.length > 0 
                  ? `${CONFIG.serverUrl}${item.images[0].imageUrl}` 
                  : `/assets/images/product/product_${(index % 24) + 1}.jpg`,
      }));

      setProducts(realData);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories(); // 👇 THÊM: Gọi API danh mục khi trang web vừa tải xong
  }, []);

  const handleOpenCreateForm = () => {
    setEditingId(null); 
    setFormData({ name: '', sku: '', slug: '', price: 0, stock: 0, shortDesc: '', longDesc: '', brandId: 1, categoryId: categories.length > 0 ? categories[0].id : 1 }); 
    setImageFile(null); 
    setOpenForm(true);
  };

  const handleOpenEditForm = (product: any) => {
    setEditingId(product.id); 
    setFormData({ 
      name: product.name, 
      sku: product.sku, 
      slug: product.slug || '',
      price: product.price, 
      stock: product.stock,
      shortDesc: product.shortDesc || '',
      longDesc: product.longDesc || '',
      brandId: product.brandId || 1,
      categoryId: product.categoryId || 1
    }); 
    setImageFile(null); 
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const uploadImage = async (productId: string | number) => {
    if (!imageFile) return; 

    const imageFormData = new FormData();
    imageFormData.append('file', imageFile); 
    imageFormData.append('isDefault', 'true');

    try {
      await axios.post(`${CONFIG.serverUrl}/api/v1/Products/${productId}/images`, imageFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log("Upload ảnh thành công!");
    } catch (error) {
      console.error("Lỗi khi upload ảnh:", error);
      alert("Lưu chữ thành công nhưng upload ảnh thất bại!");
    }
  };

  const handleSubmitForm = async () => {
    if (!formData.name || !formData.sku || !formData.slug) {
      alert('Vui lòng nhập Tên, Mã SKU và Slug sản phẩm!');
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${CONFIG.serverUrl}/api/v1/Products/${editingId}`, {
          ...formData,
          id: Number(editingId)
        });
        
        await uploadImage(editingId);
        alert('Cập nhật sản phẩm thành công!');
      } else {
        const response = await axios.post(`${CONFIG.serverUrl}/api/v1/Products`, formData);
        const newProductId = response.data.id; 
        
        await uploadImage(newProductId);
        alert('Thêm sản phẩm mới thành công!');
      }
      
      handleCloseForm();
      fetchProducts(); 
    } catch (error: any) {
      console.error('Lỗi khi lưu sản phẩm:', error.response?.data || error.message);
      alert(`Lưu thất bại! Lỗi: ${JSON.stringify(error.response?.data || error.message)}`);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống?')) return;
    try {
      await axios.delete(`${CONFIG.serverUrl}/api/v1/Products/${productId}`);
      alert('Đã xóa sản phẩm thành công!');
      fetchProducts(); 
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
      alert('Xóa thất bại. Vui lòng kiểm tra quyền Admin hoặc thử lại sau!');
    }
  };

  return (
    <DashboardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5 }}>
        <Typography variant="h4">Products (Admin)</Typography>

        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenCreateForm} 
        >
          Add product
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid key={product.id} size={{ xs: 12, sm: 6, md: 3 }}>
              <ProductItem 
                product={product} 
                onDelete={() => handleDeleteProduct(product.id)} 
                onEdit={() => handleOpenEditForm(product)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* ==================================================== */}
      <Dialog open={openForm} onClose={handleCloseForm} fullWidth maxWidth="md">
        <DialogTitle>{editingId ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              
              <Grid size={{ xs: 12 }}>
                <TextField label="Tên sản phẩm *" fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}/>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Đường dẫn (Slug) *" fullWidth value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })}/>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Mã SKU *" fullWidth value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })}/>
              </Grid>

              {/* 👇 THÊM: Ô Dropdown chọn danh mục ở đây */}
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="category-select-label">Danh mục sản phẩm</InputLabel>
                  <Select
                    labelId="category-select-label"
                    id="category-select"
                    value={formData.categoryId || ''}
                    label="Danh mục sản phẩm"
                    onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* ======================= */}

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Giá bán ($)" type="number" fullWidth value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}/>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Số lượng kho (Stock)" type="number" fullWidth value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}/>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Mô tả ngắn" fullWidth value={formData.shortDesc} onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}/>
              </Grid>
              <Grid size={{ xs: 12, md: 12 }}>
                <TextField label="Mô tả chi tiết" fullWidth multiline rows={4} value={formData.longDesc} onChange={(e) => setFormData({ ...formData, longDesc: e.target.value })}/>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button 
                  component="label" 
                  variant="outlined" 
                  startIcon={<Iconify icon={"eva:cloud-upload-fill" as any} />}
                  fullWidth 
                  sx={{ py: 2, borderStyle: 'dashed' }}
                  color={imageFile ? "success" : "primary"}
                >
                  {imageFile ? `Đã chọn: ${imageFile.name}` : 'Tải lên hình ảnh sản phẩm (JPG, PNG)'}
                  <input
                    type="file"
                    hidden
                    accept="image/png, image/jpeg, image/jpg, image/gif"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0]);
                      }
                    }}
                  />
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseForm} color="inherit">Hủy</Button>
          <Button onClick={handleSubmitForm} variant="contained" color="primary">
            Lưu Sản Phẩm
          </Button>
        </DialogActions>
      </Dialog>
      {/* ==================================================== */}

    </DashboardContent>
  );
}