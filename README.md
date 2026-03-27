# Fresh Site Reset

Extension cho Microsoft Edge theo chuẩn **Manifest V3**, giúp xóa sạch dữ liệu của đúng website đang mở trong tab hiện tại và đưa trang đó về trạng thái gần như **chưa từng truy cập**.

**Tác giả:** Nothing

---

## Tính năng chính

- Chỉ tác động đến **domain của tab đang active**
- Không làm mất phiên đăng nhập, cookies hay lịch sử của các website khác
- Xóa dữ liệu liên quan trực tiếp đến website hiện tại:
  - Cookies
  - Local Storage
  - Session Storage
  - Cache
  - Lịch sử duyệt web liên quan đến domain hiện tại
- Tự động **reload tab hiện tại** sau khi dọn dẹp xong
- Giao diện popup hiện đại, gọn gàng, dễ sử dụng

---

## Cấu trúc thư mục

```text
fresh-site-reset/
├─ manifest.json
├─ popup.html
├─ popup.css
├─ popup.js
├─ background.js
├─ README.md
└─ icons/
   └─ icon.svg
```

---

## Cách hoạt động

1. Người dùng mở website cần dọn dữ liệu.
2. Nhấn vào biểu tượng extension trên Edge.
3. Popup hiển thị nút **Làm mới trang này**.
4. Khi nhấn nút:
   - Extension xác định tab đang active
   - Lấy `origin` và `hostname` của website hiện tại
   - Xóa cookies, storage, cache và history gắn với domain đó
   - Tự động tải lại trang bằng `chrome.tabs.reload(...)`

---

## Quyền được sử dụng trong extension

### `tabs`
Dùng để lấy thông tin tab hiện tại và reload tab sau khi hoàn tất.

### `cookies`
Dùng để đọc và xóa cookies thuộc domain hiện tại.

### `browsingData`
Dùng để xóa cache, local storage, indexedDB, service workers và các dữ liệu web khác của đúng origin.

### `history`
Dùng để tìm và xóa các mục lịch sử liên quan đến hostname hiện tại.

### `storage`
Có thể dùng cho lưu trữ cấu hình mở rộng trong tương lai.

### `scripting`
Dùng để chạy đoạn script ngắn trong tab hiện tại nhằm xóa `sessionStorage` và làm sạch `localStorage` ngay trên context của trang.

---

## Cài đặt trên Microsoft Edge bằng Load unpacked

### Bước 1: Chuẩn bị thư mục extension
Tạo một thư mục, ví dụ:

```text
fresh-site-reset
```

Chép toàn bộ các file sau vào thư mục đó:

- `manifest.json`
- `popup.html`
- `popup.css`
- `popup.js`
- `background.js`
- `README.md`
- `icons/icon.svg`

---

### Bước 2: Mở trang quản lý extension của Edge
Mở Microsoft Edge và truy cập:

```text
edge://extensions/
```

---

### Bước 3: Bật chế độ Developer mode
Bật công tắc **Developer mode**.

---

### Bước 4: Nạp extension
Nhấn nút **Load unpacked** rồi chọn thư mục `fresh-site-reset`.

---

### Bước 5: Sử dụng extension
1. Mở website cần làm sạch dữ liệu
2. Nhấn vào icon extension
3. Nhấn nút **Làm mới trang này**
4. Chờ extension xử lý xong và tab sẽ tự reload

---

## Ghi chú kỹ thuật

- Extension chỉ xử lý website của **tab đang active**
- Không có thao tác xóa hàng loạt trên toàn trình duyệt
- `Session Storage` được xóa bằng `chrome.scripting.executeScript(...)`
- `History` được xử lý bằng cách tìm các URL khớp hostname rồi xóa từng mục
- `browsingData.remove` được giới hạn theo `origin`, giúp tránh ảnh hưởng đến các site khác

---

## Lưu ý về domain nhiều cấp

Hàm xác định domain gốc hiện tại đang dùng cách lấy 2 phần cuối của hostname, ví dụ:

- `app.example.com` → `example.com`

Cách này phù hợp cho phần lớn website phổ biến. Với các public suffix đặc biệt như `example.co.uk`, nếu cần độ chính xác tuyệt đối, có thể mở rộng thêm bằng Public Suffix List.

---

## Bản quyền

Designed and developed by **Nothing**.
