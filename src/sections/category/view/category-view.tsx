import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { TableEmptyRows } from '../table-empty-rows';
import { CategoryTableRow } from '../category-table-row';
import { CategoryTableHead } from '../category-table-head';
import { CategoryTableToolbar } from '../category-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

import type { CategoryProps } from '../category-table-row';

// ----------------------------------------------------------------------

type CategoryFormState = Partial<CategoryProps>;

export function CategoryView() {
  const table = useTable();
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [filterName, setFilterName] = useState('');

  const [openModal, setOpenModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<CategoryFormState>({
    name: '',
    slug: '',
    parentId: null,
  });

  // 1. LẤY DANH SÁCH CATEGORY
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${CONFIG.serverUrl}/api/v1/Categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Lỗi API:', error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 2. XOÁ CATEGORY
  const handleDeleteRow = useCallback(async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá danh mục này?')) {
      try {
        const response = await fetch(`${CONFIG.serverUrl}/api/v1/Categories/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setCategories((prev) => prev.filter((c) => c.id !== id));
        } else {
          alert('Không thể xóa! Có thể danh mục này đang chứa sản phẩm.');
        }
      } catch (error) {
        console.error('Lỗi xoá:', error);
      }
    }
  }, []);

  // 3. MỞ MODAL (THÊM HOẶC SỬA)
  const handleOpenModal = (category?: CategoryProps) => {
    if (category) {
      setCurrentCategory(category);
    } else {
      setCurrentCategory({ name: '', slug: '', parentId: null });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  // 4. LƯU (SUBMIT FORM)
  const handleSaveCategory = async () => {
    const isEdit = !!currentCategory.id;
    const url = isEdit ? `${CONFIG.serverUrl}/api/v1/Categories/${currentCategory.id}` : `${CONFIG.serverUrl}/api/Categories`;
    const method = isEdit ? 'PUT' : 'POST';

    // Tạo slug tự động nếu người dùng không nhập
    const generatedSlug = currentCategory.slug || currentCategory.name?.toLowerCase().replace(/ /g, '-');

    const payload = {
      ...currentCategory,
      id: isEdit ? Number(currentCategory.id) : 0,
      slug: generatedSlug,
      parentId: currentCategory.parentId ? Number(currentCategory.parentId) : null,
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchCategories();
        handleCloseModal();
      } else {
        const errorData = await response.json();
        console.error('Lỗi từ Server:', errorData);
        alert('Lỗi lưu dữ liệu! Hãy kiểm tra lại thông tin.');
      }
    } catch (error) {
      console.error('Lỗi lưu:', error);
    }
  };

  const dataFiltered = applyFilter({
    inputData: categories,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <DashboardContent>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>Categories</Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => handleOpenModal()}
        >
          New category
        </Button>
      </Box>

      <Card>
        <CategoryTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(e) => { setFilterName(e.target.value); table.onResetPage(); }}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <CategoryTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={categories.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) => table.onSelectAllRows(checked, categories.map((c) => c.id.toString()))}
                headLabel={[
                  { id: 'name', label: 'Tên danh mục' },
                  { id: 'slug', label: 'Đường dẫn (Slug)' },
                  { id: 'parentId', label: 'Parent ID' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
                  .map((row) => (
                    <CategoryTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id.toString())}
                      onSelectRow={() => table.onSelectRow(row.id.toString())}
                      onEditRow={() => handleOpenModal(row)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                    />
                  ))}
                <TableEmptyRows height={68} emptyRows={emptyRows(table.page, table.rowsPerPage, categories.length)} />
                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={categories.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      {/* DIALOG FORM THÊM/SỬA */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>{currentCategory.id ? 'Sửa danh mục' : 'Thêm danh mục mới'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Tên danh mục"
            fullWidth
            value={currentCategory.name}
            onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
          />
          <TextField
            label="Đường dẫn (Slug)"
            fullWidth
            value={currentCategory.slug}
            onChange={(e) => setCurrentCategory({ ...currentCategory, slug: e.target.value })}
            helperText="Để trống để hệ thống tự động tạo từ tên danh mục"
          />
          <TextField
            label="Parent ID"
            type="number"
            fullWidth
            value={currentCategory.parentId || ''}
            onChange={(e) => setCurrentCategory({ ...currentCategory, parentId: e.target.value ? Number(e.target.value) : null })}
            helperText="Nhập ID của danh mục cha (Để trống nếu đây là danh mục gốc)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Hủy bỏ</Button>
          <Button onClick={handleSaveCategory} variant="contained" color="primary">Lưu lại</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}

// useTable() giữ nguyên
export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback((id: string) => {
    const isAsc = orderBy === id && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(id);
  }, [order, orderBy]);

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) { setSelected(newSelecteds); return; }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback((inputValue: string) => {
    const newSelected = selected.includes(inputValue)
      ? selected.filter((value) => value !== inputValue)
      : [...selected, inputValue];
    setSelected(newSelected);
  }, [selected]);

  const onResetPage = useCallback(() => setPage(0), []);
  const onChangePage = useCallback((event: unknown, newPage: number) => setPage(newPage), []);
  const onChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    onResetPage();
  }, [onResetPage]);

  return { page, order, onSort, orderBy, selected, rowsPerPage, onSelectRow, onResetPage, onChangePage, onSelectAllRows, onChangeRowsPerPage };
}