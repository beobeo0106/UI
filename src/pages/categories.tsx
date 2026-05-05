import { CONFIG } from 'src/config-global';

// Đã trỏ đường dẫn về thư mục category mà ta sẽ tạo ở Bước 2
import { CategoryView } from 'src/sections/category/view'; 

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
        <title> {`Categories - ${CONFIG.appName}`}</title>
      <CategoryView />
    </>
  );
}