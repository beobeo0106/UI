import packageJson from '../package.json';

// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
  serverUrl: string; // Khai báo thêm kiểu dữ liệu cho API
};

export const CONFIG: ConfigValue = {
  appName: 'Minimal UI',
  appVersion: packageJson.version,
  serverUrl: '', // Điền link Backend Somee (Bắt buộc có https:/http://e-commerce-vnb.somee.com/)
};