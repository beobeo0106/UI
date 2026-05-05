import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
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
import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { UserTableToolbar } from '../user-table-toolbar';
import { applyFilter, emptyRows, getComparator } from '../utils';

import type { UserProps } from '../user-table-row';

// ----------------------------------------------------------------------

type UserFormState = Partial<UserProps & { passwordHash: string }>;

export function UserView() {
  const table = useTable();
  const [users, setUsers] = useState<UserProps[]>([]);
  const [filterName, setFilterName] = useState('');

  const [openModal, setOpenModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserFormState>({
    name: '',
    email: '',
    role: 'Customer',
    passwordHash: '',
  });

  // 1. LẤY DANH SÁCH USER
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${CONFIG.serverUrl}/api/Users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Lỗi API:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 2. XOÁ USER
  const handleDeleteRow = useCallback(async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá người dùng này?')) {
      try {
        const response = await fetch(`${CONFIG.serverUrl}/api/Users/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setUsers((prev) => prev.filter((u) => u.id !== id));
        }
      } catch (error) {
        console.error('Lỗi xoá:', error);
      }
    }
  }, []);

  // 3. MỞ MODAL (THÊM HOẶC SỬA)
  const handleOpenModal = (user?: UserProps) => {
    if (user) {
      setCurrentUser({ ...user, passwordHash: '' });
    } else {
      setCurrentUser({ name: '', email: '', role: 'Customer', passwordHash: '' });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => setOpenModal(false);

  // 4. LƯU (SUBMIT FORM) - FIX LỖI 400 TẠI ĐÂY
  const handleSaveUser = async () => {
    const isEdit = !!currentUser.id;
    const url = isEdit ? `${CONFIG.serverUrl}/api/Users/${currentUser.id}` : `${CONFIG.serverUrl}/api/Users`;
    const method = isEdit ? 'PUT' : 'POST';

    // Chuẩn hoá dữ liệu trước khi gửi đi
    const payload = {
      ...currentUser,
      // Ép kiểu ID sang Number (int) để tránh lỗi 400
      id: isEdit ? Number(currentUser.id) : 0,
      // Đảm bảo không gửi giá trị undefined
      passwordHash: currentUser.passwordHash || ""
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchUsers();
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
    inputData: users,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <DashboardContent>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>Users</Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => handleOpenModal()}
        >
          New user
        </Button>
      </Box>

      <Card>
        <UserTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(e) => { setFilterName(e.target.value); table.onResetPage(); }}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={users.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) => table.onSelectAllRows(checked, users.map((u) => u.id))}
                headLabel={[
                  { id: 'name', label: 'Name' },
                  { id: 'email', label: 'Email' },
                  { id: 'role', label: 'Role' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
                  .map((row) => (
                    <UserTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onEditRow={() => handleOpenModal(row)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                    />
                  ))}
                <TableEmptyRows height={68} emptyRows={emptyRows(table.page, table.rowsPerPage, users.length)} />
                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={users.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>{currentUser.id ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Full Name"
            fullWidth
            value={currentUser.name}
            onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
          />
          <TextField
            label="Email Address"
            fullWidth
            value={currentUser.email}
            onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={currentUser.passwordHash}
            onChange={(e) => setCurrentUser({ ...currentUser, passwordHash: e.target.value })}
            helperText={currentUser.id ? "Để trống nếu không muốn đổi mật khẩu" : "Bắt buộc nhập"}
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={currentUser.role}
              label="Role"
              onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value as string })}
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Customer">Customer</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}

// useTable() giữ nguyên...
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