# TripWeave AI – Nền Tảng Hỗ Trợ Lập Kế Hoạch Du Lịch

## 📌 Giới thiệu
Du khách thường gặp khó khăn khi phải tìm kiếm thông tin ở nhiều nơi, đồng thời phải cân đối giữa sở thích cá nhân, khoảng cách địa lý, ngân sách và thời gian. **TripWeave AI** tập trung minh họa giải pháp giúp các công cụ khám phá, lập lịch trình và gợi ý có hỗ trợ AI đơn giản hóa quá trình chuẩn bị chuyến đi, giúp mọi việc trở nên rõ ràng và thuận tiện hơn.

---

## 🛠 Chức năng chính
Hệ thống được tổ chức phân quyền theo các vai trò người dùng nhằm minh họa các luồng nghiệp vụ khác nhau trên cùng một nền tảng:

- **Du khách (Traveler):** Khám phá địa điểm, lưu nội dung quan tâm, lập kế hoạch chuyến đi, xem lịch trình do AI gợi ý kèm lời giải thích cho các đề xuất, quản lý thông báo và cài đặt cá nhân.
- **Hướng dẫn viên (Guide):** Quản lý hồ sơ cá nhân, địa điểm và các trải nghiệm du lịch; tạo bộ sưu tập, theo dõi hoạt động và xem xét lịch trình.
- **Quản trị viên & Đối tác (Admin & Partner):**
  - **Quản trị viên:** Theo dõi tổng quan hệ thống, quản lý người dùng, nội dung, đối tác, đơn đặt (booking), đánh giá và doanh thu.
  - **Đối tác:** Có khu vực riêng để quản lý các hoạt động dịch vụ và hồ sơ đối tác.

---

## 📊 Bảng kiểm kê màn hình (Screen Inventory)

| Vai trò | Mục tiêu người dùng | Nhiệm vụ người dùng | Màn hình | Tệp (`.html`) | CRUD / Trạng thái | AI | Người phụ trách |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| **Du khách** | Khám phá địa điểm, xem chi tiết và lên kế hoạch đi lại | Tìm kiếm, lọc điểm đến, duyệt danh sách và khởi tạo chuyến đi | Discover | `traveler-discover.html` | R | - | SV1 - Nguyễn Thị Ngân |
| **Du khách** | Quản lý và tinh chỉnh hành trình cá nhân chi tiết | Tạo mới, chỉnh sửa, sắp xếp lịch trình theo ngày, lưu chuyến đi | Trip Planner | `traveler-trip-planner.html` | C/R/U | - | SV1 - Nguyễn Thị Ngân |
| **Du khách** | Tự động tạo lịch trình cá nhân hóa thông qua AI | Nhập tiêu chí (thời gian, sở thích, ngân sách), nhận lịch trình AI gợi ý & tùy chỉnh | AI Itinerary | `traveler-ai-itinerary.html` | C/R/U/D | **AI-1:** Itinerary Generator (Tạo lịch trình theo ngày) | SV1 - Nguyễn Thị Ngân |
| **Du khách** | Giải thích chi tiết lý do AI đề xuất địa điểm | Xem phân tích nguyên nhân AI lựa chọn điểm đến & hoạt động | AI Explanation | `traveler-ai-explanation.html` | R | **AI-1:** Explanations | SV1 - Nguyễn Thị Ngân |
| **Du khách** | Quản lý danh sách các điểm đến và hành trình đã lưu | Xem, xóa, lọc các bài viết/lịch trình đã yêu thích | Saved Items | `traveler-saved.html` | R/D | - | SV1 - Nguyễn Thị Ngân |
| **Du khách** | Theo dõi thông báo và cập nhật thông tin tài khoản | Xem thông báo hệ thống, chỉnh sửa hồ sơ và cài đặt cá nhân | Notifications & Settings | `traveler-notifications.html` / `traveler-settings.html` | R/U | - | SV1 - Nguyễn Thị Ngân |
| **Hướng dẫn viên** | Tổng quan hoạt động chuyên môn và yêu cầu review | Theo dõi thống kê lượt xem, yêu cầu tư vấn và đánh giá lịch trình | Guide Dashboard | `guide-dashboard.html` | R | - | SV2 - Nguyễn Thị Thanh Ngọc |
| **Hướng dẫn viên** | Biên soạn và quản lý bộ sưu tập địa điểm chuyên sâu | Tạo, cập nhật bộ sưu tập trải nghiệm độc đáo cho du khách | Curated Collections | `guide-curated.html` | C/R/U/D | - | SV2 - Nguyễn Thị Thanh Ngọc |
| **Hướng dẫn viên** | Đánh giá, duyệt và tư vấn lịch trình của du khách | Xem chi tiết chuyến đi du khách gửi, thẩm định tính hợp lý và phản hồi | Trip Review & Detail | `guide-itinerary-review.html` / `guide-itinerary-detail.html` | C/R/U | **AI-3:** Preference Summarizer (Tóm tắt sở thích du khách) | SV2 - Nguyễn Thị Thanh Ngọc |
| **Hướng dẫn viên** | Quản lý danh sách trải nghiệm và địa điểm thuộc quyền quản lý | Thêm mới địa điểm tour, chỉnh sửa thông tin chi tiết địa điểm | Experiences & Locations | `guide-experiences.html` / `guide-locations.html` | C/R/U/D | - | SV2 - Nguyễn Thị Thanh Ngọc |
| **Hướng dẫn viên** | Quản lý hồ sơ năng lực chuyên môn của HDV | Cập nhật thông tin giới thiệu, chứng chỉ và kinh nghiệm | Guide Profile | `guide-profile.html` | R/U | - | SV2 - Nguyễn Thị Thanh Ngọc |
| **Quản trị viên** | Kiểm duyệt nội dung và lộ trình toàn hệ thống | Phê duyệt/từ chối lịch trình, quét cảnh báo lộ trình quá tải | Content Moderation | `admin-content.html` | R/U/D | **AI-2:** Route Balance Assistant (Cảnh báo lịch quá dày/xa) | SV3 - Nguyễn Văn Hải Đăng |
| **Quản trị viên** | Giám sát tổng quan chỉ số hệ thống và phân tích doanh thu | Theo dõi biểu đồ tăng trưởng, lượt đặt tour và báo cáo tổng hợp | Admin Dashboard & Revenue | `admin-dashboard.html` / `admin-revenue.html` | R | - | SV3 - Nguyễn Văn Hải Đăng |
| **Quản trị viên** | Quản lý người dùng, đối tác và phân loại danh mục (Taxonomy) | Thêm/sửa/khóa tài khoản, quản lý danh sách đối tác và danh mục | User & Partner & Category Management | `admin-user-management.html` / `admin-partners.html` / `admin-settings.html` | C/R/U/D | - | SV3 - Nguyễn Văn Hải Đăng |
| **Đối tác** | Tổng quan hoạt động kinh doanh và dịch vụ của đối tác | Xem chỉ số tổng quan, doanh thu và danh sách dịch vụ | Partner Overview & Revenue | `partner-overview.html` / `partner-revenue.html` | R | - | SV3 - Nguyễn Văn Hải Đăng |
| **Đối tác** | Quản lý dịch vụ/trải nghiệm địa phương và đơn hàng | Đăng bán trải nghiệm, cập nhật giá, xử lý và xác nhận đơn đặt | Activity & Order Management | `partner-activity-management.html` / `partner-orders.html` | C/R/U/D | - | SV3 - Nguyễn Văn Hải Đăng |
| **Đối tác** | Quản lý hồ sơ và phản hồi đánh giá từ du khách | Cập nhật thông tin cơ sở, trả lời review của khách hàng | Partner Profile & Reviews | `partner-profile.html` / `partner-reviews.html` | R/U | - | SV3 - Nguyễn Văn Hải Đăng |
| **Dùng chung** | Xác thực người dùng và điều hướng chung | Đăng nhập hệ thống, xử lý trang lỗi điều hướng | Login & 404 Page | `login.html` / `404.html` / `index.html` | R | - | Cả nhóm (SV3 lead) |

---

## 💻 Công nghệ và Hướng dẫn chạy

### Công nghệ sử dụng
- Frontend cơ bản: **HTML, CSS, JavaScript**.

### Hướng dẫn khởi chạy
1. Để xem giao diện chính, mở tệp `index.html` trong trình duyệt web. Trang này sẽ chuyển hướng đến khu vực khám phá dành cho Du khách.
2. Để xem các khu vực chức năng khác, truy cập trực tiếp các trang HTML trong thư mục vai trò tương ứng.

> **Lưu ý:** Đây là sản phẩm mô phỏng giao diện và luồng nghiệp vụ phục vụ cho mục đích học tập; các chức năng hiển thị trên giao diện không đồng nghĩa với việc đã kết nối dịch vụ hoặc dữ liệu backend thực tế.

---

## 👥 Phân chia công việc

| Thành viên | Mã sinh viên | Phần việc đảm nhận |
| :--- | :---: | :--- |
| **SV_1** - Nguyễn Thị Ngân | 2551060613 | Giao diện và chức năng dành cho du khách: khám phá, lập kế hoạch và quản lý chuyến đi. |
| **SV_2** - Nguyễn Thị Thanh Ngọc | 2551060656 | Giao diện và chức năng dành cho hướng dẫn viên. |
| **SV_3** - Nguyễn Văn Hải Đăng | 2551060596 | Giao diện và chức năng dành cho quản trị viên, đối tác. |

---

## 🤖 AI đã sử dụng & Mục đích sử dụng

Trong quá trình phát triển dự án, các công cụ Trí tuệ nhân tạo (AI) đã được ứng dụng để hỗ trợ và tối ưu hóa công việc:

- **Gemini:** 
  - Hỗ trợ lên ý tưởng cấu trúc dự án, tham vấn giải pháp kỹ thuật và tối ưu nội dung tài liệu.
  - Phân tích luồng nghiệp vụ cho các vai trò (Du khách, Hướng dẫn viên, Admin/Đối tác).
- **ChatGPT:** 
  - Đóng vai trò trợ lý sinh mã nguồn (HTML/CSS/JS) cơ bản và tinh chỉnh logic xử lý giao diện.
  - Hỗ trợ viết và biên tập các đoạn văn bản mô tả, kịch bản nội dung cho giao diện mẫu.
- **Claude:** 
  - Hỗ trợ rà soát cấu trúc mã nguồn, tối ưu ngữ nghĩa HTML/CSS và tư vấn thiết kế UI/UX theo chuẩn giao diện hiện đại.
  - Hỗ trợ giải quyết các bế tắc về logic chia bố cục (layout) phức tạp.
- **Qwen:** 
  - Hỗ trợ tra cứu nhanh các mẫu giao diện, tối ưu hóa câu lệnh prompt và gợi ý thuật toán sắp xếp/lọc dữ liệu mẫu.
- **VibeCode:** 
  - Sử dụng công cụ AI coding assistant để tăng tốc độ gõ code, tự động hoàn thiện đoạn mã (code completion) và refactor code trực tiếp trong môi trường phát triển.
