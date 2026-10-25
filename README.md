# TripWeave AI – Nền Tảng Hỗ Trợ Lập Kế Hoạch Du Lịch

## 📌 Giới thiệu
Du khách thường gặp khó khăn khi phải tìm kiếm thông tin ở nhiều nơi, đồng thời phải cân đối giữa sở thích cá nhân, khoảng cách địa lý, ngân sách và thời gian[cite: 1]. **TripWeave AI** tập trung minh họa giải pháp giúp các công cụ khám phá, lập lịch trình và gợi ý có hỗ trợ AI đơn giản hóa quá trình chuẩn bị chuyến đi, giúp mọi việc trở nên rõ ràng và thuận tiện hơn[cite: 1].

---

## 🛠 Chức năng chính
Hệ thống được tổ chức phân quyền theo các vai trò người dùng nhằm minh họa các luồng nghiệp vụ khác nhau trên cùng một nền tảng[cite: 1]:

- **Du khách (Traveler):** Khám phá địa điểm, lưu nội dung quan tâm, lập kế hoạch chuyến đi, xem lịch trình do AI gợi ý kèm lời giải thích cho các đề xuất, quản lý thông báo và cài đặt cá nhân[cite: 1].
- **Hướng dẫn viên (Guide):** Quản lý hồ sơ cá nhân, địa điểm và các trải nghiệm du lịch; tạo bộ sưu tập, theo dõi hoạt động và xem xét lịch trình[cite: 1].
- **Quản trị viên & Đối tác (Admin & Partner):**
  - **Quản trị viên:** Theo dõi tổng quan hệ thống, quản lý người dùng, nội dung, đối tác, đơn đặt (booking), đánh giá và doanh thu[cite: 1].
  - **Đối tác:** Có khu vực riêng để quản lý các hoạt động dịch vụ và hồ sơ đối tác[cite: 1].

---

## 💻 Công nghệ và Hướng dẫn chạy

### Công nghệ sử dụng
- Frontend cơ bản: **HTML, CSS, JavaScript**[cite: 1].

### Hướng dẫn khởi chạy
1. Để xem giao diện chính, mở tệp `index.html` trong trình duyệt web[cite: 1]. Trang này sẽ chuyển hướng đến khu vực khám phá dành cho Du khách[cite: 1].
2. Để xem các khu vực chức năng khác, truy cập trực tiếp các trang HTML trong thư mục vai trò tương ứng[cite: 1].

> **Lưu ý:** Đây là sản phẩm mô phỏng giao diện và luồng nghiệp vụ phục vụ cho mục đích học tập; các chức năng hiển thị trên giao diện không đồng nghĩa với việc đã kết nối dịch vụ hoặc dữ liệu backend thực tế[cite: 1].

---

## 👥 Phân chia công việc

| Thành viên | Mã sinh viên | Phần việc đảm nhận |
| :--- | :---: | :--- |
| **SV_1** - Nguyễn Thị Ngân | 2551060 | Giao diện và chức năng dành cho du khách: khám phá, lập kế hoạch và quản lý chuyến đi[cite: 1]. |
| **SV_2** - Nguyễn Thị Thanh Ngọc | 2551060656 | Giao diện và chức năng dành cho hướng dẫn viên[cite: 1]. |
| **SV_3** - Nguyễn Văn Hải Đăng | 2551060596 | Giao diện và chức năng dành cho quản trị viên, đối tác[cite: 1]. |

---

## 🤖 AI đã sử dụng & Mục đích sử dụng

Trong quá trình phát triển dự án, các công cụ Trí tuệ nhân tạo (AI) đã được ứng dụng để hỗ trợ và tối ưu hóa công việc[cite: 1]:

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