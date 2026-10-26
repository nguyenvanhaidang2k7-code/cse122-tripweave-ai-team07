# BÀI KIỂM TRA GIỮA KỲ - PHÁT TRIỂN ỨNG DỤNG WEB CƠ BẢN (CSE122)

## 1. Tên đề tài
TripWeave AI (Hệ thống Du lịch Thông minh)

## 2. Tên trang đã thực hiện
Trang **Quản trị đối tác địa phương** (Local Partners Management)

## 3. Mục đích của trang
- Giúp quản trị viên (Admin) hệ thống quản lý toàn diện thông tin của các đối tác cung cấp dịch vụ địa phương (homestay, du thuyền, lữ hành, ẩm thực, tour trải nghiệm,...).
- Hỗ trợ thao tác kiểm duyệt hồ sơ đối tác mới đăng ký, theo dõi trạng thái hoạt động (đang hoạt động, chờ duyệt, bị khóa) và xử lý các nghiệp vụ quản trị nhanh chóng.

## 4. Các chức năng chính
- **Render danh sách đối tác tự động:** Đổ dữ liệu động từ mảng giả lập (Mock Data) hoặc `LocalStorage` ra giao diện với thiết kế trực quan, avatar chữ cái và huy hiệu trạng thái.
- **Tìm kiếm thông minh:** Tìm kiếm theo thời gian thực (real-time) dựa trên tên đối tác, email hoặc khu vực.
- **Lọc theo trạng thái (Chip filter):** Chuyển đổi nhanh chóng giữa các trạng thái *Tất cả*, *Đang hoạt động*, *Chờ duyệt*, và *Bị khóa*.
- **Thêm đối tác mới (Create):** Mở Modal thêm mới với tính năng kiểm tra dữ liệu đầu vào (Form Validation) cơ bản như định dạng email, chống trùng lặp.
- **Xem chi tiết & Cập nhật trạng thái (Read, Update):** 
  - Xem thông tin chi tiết đối tác qua Modal.
  - Phê duyệt hồ sơ đối tác ở trạng thái "Chờ duyệt" sang "Hoạt động".
  - Khóa hoặc mở khóa tài khoản đối tác.
- **Xóa đối tác (Delete):** Xóa vĩnh viễn đối tác khỏi hệ thống kèm theo hộp thoại xác nhận (Confirmation Modal) an toàn.

## 5. Công nghệ sử dụng
- **HTML5:** Cấu trúc ngữ nghĩa chuẩn (Semantic HTML: `header`, `nav`, `main`, `div`, `form`, `input`, `select`, `button`...).
- **CSS3:** Flexbox, CSS Grid, biến màu CSS (`:root`), thiết kế Responsive tương thích tốt trên cả máy tính và điện thoại.
- **JavaScript (ES6):** Xử lý DOM, Arrow Function, mảng (Array methods), LocalStorage để lưu trữ dữ liệu, bắt sự kiện (Event Listener) và tương tác bất đồng bộ thông báo (Toast).

## 6. Link canva
https://canva.link/un73adr0v7ku5dr

## 7. Link Video
https://youtube.com/playlist?list=PLHxmAJIURQDw&si=n_VkOfHr5Bn1mKB5

## 8. Link GitHub
https://github.com/nguyenvanhaidang2k7-code/CSE122_GK_admin_partners_NguyenVanHaiDang_2551060596