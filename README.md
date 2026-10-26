🌏 TripWeave AI — README phần Sinh viên 1 (Du khách)
Học phần: CSE122 – Phát triển ứng dụng Web cơ bản
Đề tài: TripWeave AI – Xây hành trình du lịch theo sở thích
Phần phụ trách: Giao diện và luồng nghiệp vụ dành cho Du khách (Traveler)

1. Tên đề tài
TripWeave AI – Xây hành trình du lịch theo sở thích

TripWeave AI là nguyên mẫu website hỗ trợ người dùng khám phá điểm đến, xây dựng kế hoạch chuyến đi và tham khảo lịch trình được đề xuất theo thông tin đã nhập.
2. Tên trang đã thực hiện
Trong phạm vi Sinh viên 1, các trang thuộc vai trò Du khách (Traveler) gồm:
STT	Tên trang	Thư mục / tệp chính
1	Khám phá (Traveler Discover)	traveler-discover/traveler-discover.html
2	Lập kế hoạch chuyến đi (Trip Planner)	traveler-trip-planner/traveler-trip-planner.html
3	Lịch trình AI (AI Itinerary)	traveler-ai-itinerary/traveler-ai-itinerary.html
4	Giải thích đề xuất AI (AI Explanation)	traveler-ai-explanation/traveler-ai-explanation.html
5	Địa điểm đã lưu (Saved)	traveler-saved/traveler-saved.html
6	Thông báo (Notifications)	traveler-notifications/traveler-notifications.html
7	Cài đặt (Settings)	traveler-settings/traveler-settings.html
8	Trang điểm vào	index.html — tự chuyển đến trang Khám phá


Mỗi trang chức năng có các tệp HTML, CSS và JavaScript riêng. Một số thành phần và hành vi dùng chung được tổ chức trong common.css và common.js.
3. Mục đích của các trang
Phần Du khách được xây dựng để người dùng có thể thực hiện một luồng cơ bản từ khám phá điểm đến đến lập kế hoạch chuyến đi và xem lịch trình đề xuất. Các trang bổ trợ cho phép quản lý địa điểm yêu thích, theo dõi thông báo và chỉnh sửa thông tin giao diện cá nhân.
- Khám phá: giúp du khách xem và lọc các địa điểm du lịch, lưu nơi yêu thích hoặc chọn điểm đến để lên kế hoạch.
- Lập kế hoạch chuyến đi: thu thập thông tin chuyến đi như tên chuyến đi, điểm đến, thời gian, ngân sách, sở thích và ghi chú.
- Lịch trình AI: tạo lịch trình minh họa theo thông tin đã nhập, cho phép tạo lại phương án hoặc chấp nhận và lưu.
- Giải thích đề xuất AI: trình bày lý do của lịch trình dựa trên dữ liệu chuyến đi đã lưu.
- Địa điểm đã lưu: hiển thị và quản lý danh sách điểm đến yêu thích.
- Thông báo: hiển thị, lọc thông báo và hỗ trợ điều hướng đến trang liên quan.
- Cài đặt: cho phép chỉnh sửa thông tin hồ sơ và thay đổi giao diện sáng/tối.
4. Các chức năng chính
🔎 Khám phá địa điểm
- Hiển thị các điểm đến mẫu như Hà Nội, Hạ Long, Đà Nẵng, Sa Pa, Huế, Nha Trang, Đà Lạt và Phú Quốc.
- Lọc địa điểm theo khu vực hoặc loại hình du lịch.
- Lưu hoặc bỏ lưu địa điểm bằng biểu tượng yêu thích.
- Chọn địa điểm để chuyển sang luồng lập kế hoạch chuyến đi.
🧭 Lập kế hoạch và tạo lịch trình
- Nhập thông tin chuyến đi, thời gian, điểm đến, ngân sách, sở thích và ghi chú.
- Kiểm tra dữ liệu đầu vào trước khi tiếp tục.
- Xem trạng thái xử lý và lịch trình được mô phỏng theo ngày.
- Tạo lại lịch trình hoặc chấp nhận và lưu kết quả.
- Xem giải thích cho đề xuất dựa trên thông tin chuyến đi.
❤️ Quản lý dữ liệu cá nhân
- Xem danh sách địa điểm đã lưu và bỏ lưu khi cần.
- Xem và lọc thông báo theo nhóm.
- Chỉnh sửa tên/email hồ sơ.
- Chuyển đổi giao diện sáng/tối.
- Duy trì một số dữ liệu giữa các trang bằng localStorage.
📱 Trải nghiệm giao diện
- Điều hướng giữa các trang trong khu vực Du khách.
- Hiển thị dữ liệu mẫu để thuận tiện trình diễn.
- Bố cục responsive cho màn hình máy tính, máy tính bảng và điện thoại.
- Sử dụng các thành phần giao diện dùng chung nhằm giữ trải nghiệm nhất quán.
Lưu ý: Tính năng tạo lịch trình AI trong phiên bản này là mô phỏng bằng JavaScript và dữ liệu/quy tắc có sẵn ở phía trình duyệt; không phải lời gọi đến mô hình AI hoặc backend thật.

5. Công nghệ sử dụng
Công nghệ / công cụ	Vai trò
HTML5	Xây dựng cấu trúc và nội dung các trang.
CSS3	Thiết kế bố cục, thành phần giao diện, hiệu ứng và responsive.
JavaScript thuần	Xử lý sự kiện, lọc dữ liệu, kiểm tra biểu mẫu, điều hướng và kết xuất nội dung.
LocalStorage	Lưu dữ liệu mô phỏng như địa điểm yêu thích, thông tin chuyến đi, lịch trình, hồ sơ và thông báo.
Visual Studio Code	Môi trường phát triển và chỉnh sửa mã nguồn.
Live Server	Chạy thử website trong trình duyệt khi phát triển.
Git / GitHub	Quản lý phiên bản và cộng tác mã nguồn.


Dự án sử dụng HTML, CSS và JavaScript thuần, không yêu cầu cài đặt framework để chạy bản demo.
6. Link Figma / thiết kế
Link Figma https://www.canva.com/design/DAHX6UV0jDM/fmmHsKMUFF98uf8UI88SIg/edit MOBILE: https://www.canva.com/design/DAHYAPoJFks/5JXfWA-SVRJV-oFeRgjoYQ/edit
7. Link video demo
https://www.youtube.com/playlist?list=PLRN9y_MQt1O0
8. Link GitHub
- Repository cá nhân SV1: 
- Repository nhóm: 
