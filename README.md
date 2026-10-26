# TripWeave AI — Module Quản trị viên & Đối tác (SV3)

## 1. Giới thiệu dự án

**TripWeave AI** là ứng dụng web hỗ trợ du khách khám phá địa điểm và xây dựng lịch trình phù hợp với sở thích cá nhân.

**SV3 phụ trách luồng Quản trị viên và Đối tác**, tập trung vào quản lý hoạt động của hệ thống, kiểm duyệt nội dung và hỗ trợ đối tác địa phương theo dõi dịch vụ.

## 2. Vấn đề và mục tiêu

- Quản trị viên cần theo dõi người dùng, đối tác, nội dung và đơn đặt trên cùng một hệ thống.
- Đối tác địa phương cần công cụ quản lý trải nghiệm, đơn đặt, đánh giá, doanh thu và hồ sơ.
- Các thao tác quản trị cần có trạng thái rõ ràng, phản hồi trực quan và bước xác nhận phù hợp.

**Mục tiêu:** Xây dựng giao diện quản trị viên và đối tác trực quan, nhất quán, hỗ trợ các luồng quản lý và kiểm duyệt chính của TripWeave AI.

## 3. Chức năng chính

| Chức năng | Mô tả |
|---|---|
| **Đăng nhập và đăng ký** | Chọn vai trò, kiểm tra thông tin biểu mẫu, tạo tài khoản mô phỏng và điều hướng theo vai trò. |
| **Dashboard quản trị** | Theo dõi thống kê tổng quan, biểu đồ và các đối tác nổi bật. |
| **Quản lý người dùng** | Xem, thêm, khóa/mở khóa và xóa tài khoản người dùng. |
| **Quản lý nội dung** | Duyệt, yêu cầu chỉnh sửa hoặc từ chối trải nghiệm; hỗ trợ rà soát và cân bằng lịch trình bằng luồng AI mô phỏng. |
| **Quản lý đối tác** | Xem, thêm, duyệt hồ sơ, khóa hoặc mở khóa đối tác địa phương. |
| **Quản lý đơn đặt** | Theo dõi đơn đặt trên toàn hệ thống hoặc các đơn của đối tác; tìm kiếm, lọc, xem chi tiết và cập nhật trạng thái. |
| **Quản lý doanh thu** | Xem thống kê, biểu đồ doanh thu và mô phỏng xuất báo cáo. |
| **Cài đặt hệ thống** | Điều chỉnh tùy chọn hiển thị tìm kiếm, bảo mật, thông báo và danh mục hoạt động. |
| **Khu vực đối tác** | Xem tổng quan; quản lý trải nghiệm, đơn đặt, đánh giá, doanh thu và hồ sơ đối tác. |
| **Trang 404** | Thông báo đường dẫn không hợp lệ và cung cấp liên kết tới các màn hình chính. |

## 4. Luồng nghiệp vụ

- **Đăng nhập:** Chọn vai trò và nhập thông tin. Quản trị viên được chuyển tới Dashboard; đối tác được chuyển tới trang Tổng quan. Các vai trò chưa triển khai hiển thị thông báo phù hợp.
- **Đăng ký:** Chọn vai trò, điền thông tin và xác nhận biểu mẫu. Tài khoản được lưu trong dữ liệu mô phỏng; hồ sơ đối tác mới có trạng thái chờ duyệt.
- **Quản trị hệ thống:** Từ Dashboard, quản trị viên truy cập các khu vực người dùng, nội dung, đối tác, đơn đặt, doanh thu và cài đặt. Các thao tác xóa, khóa hoặc từ chối nội dung có hộp thoại xác nhận.
- **Quản lý đối tác:** Đối tác theo dõi hoạt động trên trang Tổng quan, sau đó quản lý trải nghiệm, xử lý đơn đặt, phản hồi đánh giá và cập nhật hồ sơ.
- **Đăng xuất:** Chọn avatar để kết thúc phiên và quay lại trang đăng nhập.
- **Điều hướng lỗi:** Trang 404 hỗ trợ quay lại, truy cập nhanh các màn hình gợi ý hoặc trở về trang đăng nhập.

## 5. Quản lý dữ liệu

Dữ liệu demo được lưu trong **LocalStorage** của trình duyệt, không yêu cầu kết nối backend. Các khóa dữ liệu chính gồm:

| Khóa | Nội dung |
|---|---|
| `tw_session` | Phiên đăng nhập và vai trò hiện tại. |
| `tw_users`, `tw_partners` | Người dùng và hồ sơ đối tác. |
| `tw_activities` | Trải nghiệm và trạng thái kiểm duyệt. |
| `tw_orders` | Thông tin đơn đặt. |
| `tw_reviews` | Đánh giá và phản hồi của đối tác. |
| `tw_revenue`, `tw_admin_revenue` | Dữ liệu doanh thu đối tác và toàn hệ thống. |
| `tw_profile` | Hồ sơ đối tác. |
| `tw_categories`, `tw_settings` | Danh mục hoạt động và cấu hình hệ thống. |
| `tw_admin_stats` | Dữ liệu thống kê Dashboard quản trị. |
| `tw_broken_links` | Các báo cáo liên kết hỏng từ trang 404. |

Dữ liệu mẫu được khởi tạo trên trình duyệt để các màn hình có thể trình diễn ngay. Đây là dữ liệu mô phỏng, không đại diện cho dữ liệu dịch vụ thực tế.

## 6. Công nghệ và công cụ sử dụng

- **HTML5:** Xây dựng cấu trúc và nội dung giao diện.
- **CSS3:** Thiết kế giao diện, bố cục responsive, biểu đồ và các thành phần tương tác.
- **JavaScript (ES6):** Xử lý sự kiện, kiểm tra biểu mẫu, cập nhật giao diện và thao tác với LocalStorage.
- **Git / GitHub:** Quản lý mã nguồn và phối hợp làm việc nhóm.
- **Canva:** Thiết kế giao diện.
- **Trello:** Quản lý công việc và theo dõi tiến độ dự án.

## 7. AI hỗ trợ
- **Gemini:** :lên cách thức
- **ChatGPT:** :trợ lý
- **Claude:** :rà soát, kiểm tra
- **VibeCode:** 
  - Sử dụng công cụ AI coding assistant để tăng tốc độ gõ code

## 8. Link thiết kế Canva

https://canva.link/un73adr0v7ku5dr

## 9. Link GitHub Repository

https://github.com/nguyenvanhaidang2k7-code/cse122-tripweave-ai-team07/tree/feature/sv3-Admin%26Partnes

## 10. Link video thuyết trình

https://www.youtube.com/playlist?list=PLENeMoVzLPHs
