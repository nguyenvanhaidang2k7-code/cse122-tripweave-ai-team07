/* =====================================================================
   common.js – JS DÙNG CHUNG CHO MỌI MÀN HÌNH (TripWeave AI)
   ---------------------------------------------------------------------
   Cách dùng: mỗi trang thêm dòng sau CUỐI <body>, NGAY TRƯỚC script riêng:
       <script src="../common.js"></script>
   Khi trang load xong, file này TỰ ĐỘNG chạy 4 việc:
     1. seedData()         – lần đầu mở web (localStorage trống) thì ghi
                             dữ liệu mặc định giống mockup vào 3 key:
                             "userProfile", "savedItems", "notifications".
     2. applyUserProfile() – điền viết tắt tên vào ô avatar xanh trên
                             topbar ("Nguyễn Thị Thanh Ngọc" -> "NT") và
                             áp dụng theme sáng/tối đã lưu ở màn Cài đặt.
     3. setupBell()        – biến icon chuông thành nút bấm sang trang
                             Thông báo + gắn badge đỏ đếm số thông báo.
      4. setupMobileNav()   – chèn thanh điều hướng dưới đáy màn hình
                              (bottom nav) cho giao diện mobile <= 900px.
   Lưu ý: toàn bộ biến/hàm nằm gọn trong IIFE nên KHÔNG bị trùng tên
   với biến của file js riêng từng trang (vd: $, readJSON...).
   ===================================================================== */
(function () {
  'use strict';

  /* ------------------- 1. HÀM TIỆN ÍCH localStorage ------------------- */
  /* Đọc object JSON an toàn: lỗi / chưa có thì trả về null */
  function readJSON(key) {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch (err) { console.warn('Không đọc được localStorage:', err); return null; }
  }

  /* Ghi object xuống localStorage dưới dạng chuỗi JSON */
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (err) { console.warn('Không ghi được localStorage:', err); }
  }

  /* ------------------- 2. DỮ LIỆU MẶC ĐỊNH (giống mockup Canva) ------------------- */
  /* Hồ sơ người dùng: màn Cài đặt đọc/ghi key này để sửa tên, email, theme */
  const DEFAULT_PROFILE = {
    name:  'Nguyễn Thị Thanh Ngọc',
    email: 'ngocthanh@email.com',
    theme: 'light'
  };

  /* 6 thông báo mặc định của màn "Thông báo".
     type : 'system' | 'offer' | 'update' -> dùng cho tab lọc
     tint : màu ô icon vuông bên trái     -> 'blue' | 'green' | 'purple' | 'red'
     link : trang sẽ mở khi bấm vào thông báo (đường dẫn tương đối
            TÍNH TỪ thư mục traveler-notifications) */
  const DEFAULT_NOTIFICATIONS = [
    { id: 'notif-1', type: 'system', tint: 'blue',   title: 'AI đã tạo xong lịch trình cho chuyến đi của bạn!', body: 'Lịch trình Hà Nội – Hạ Long – Ninh Bình đã sẵn sàng.',         time: '2 giờ trước',  link: '../traveler-ai-itinerary/traveler-ai-itinerary.html#saved' },
    { id: 'notif-2', type: 'offer',  tint: 'green',  title: 'Ưu đãi đặc biệt',                                    body: 'Giảm 20% khi đặt khách sạn tại Đà Nẵng trong tháng 10.',    time: '5 giờ trước',  link: '../traveler-discover/traveler-discover.html' },
    { id: 'notif-3', type: 'system', tint: 'purple', title: 'Có 2 bình luận mới',                                 body: 'Bài viết của bạn “Top 10 bãi biển đẹp nhất Việt Nam”.',     time: '1 ngày trước', link: '../traveler-saved/traveler-saved.html' },
    { id: 'notif-4', type: 'update', tint: 'red',    title: 'Cập nhật hệ thống',                                  body: 'Chúng tôi đã cải tiến tính năng tìm kiếm. Khám phá ngay!',  time: '1 ngày trước', link: '../traveler-discover/traveler-discover.html' },
    { id: 'notif-5', type: 'offer',  tint: 'blue',   title: 'Địa điểm bạn đã lưu có giá tốt',                     body: 'Vịnh Hạ Long đang có ưu đãi đặc biệt từ 2.500.000đ/người.', time: '2 ngày trước', link: '../traveler-saved/traveler-saved.html' },
    { id: 'notif-6', type: 'system', tint: 'green',  title: 'Nhắc nhở',                                           body: 'Bạn còn 3 ngày để hoàn thành chuyến đi Đà Lạt.',            time: '3 ngày trước', link: '../traveler-trip-planner/traveler-trip-planner.html' }
  ];

  /* ------------------- 3. VIỆC 1: SEED DỮ LIỆU LẦN ĐẦU ------------------- */
  /* Chỉ ghi khi key CHƯA tồn tại => không đè mất dữ liệu người dùng đã tạo */
  function seedData() {
      if (!localStorage.getItem('userProfile'))
          writeJSON('userProfile', DEFAULT_PROFILE);

      if (!localStorage.getItem('savedItems'))
          writeJSON('savedItems', []);

      if (!localStorage.getItem('notifications'))
          writeJSON('notifications', DEFAULT_NOTIFICATIONS);
  }

  /* ------------------- 4. VIỆC 2: AVATAR + THEME THEO HỒ SƠ ------------------- */
  /* Viết tắt tên: lấy chữ cái đầu của 2 tiếng đầu tiên
     VD: "Nguyễn Thị Thanh Ngọc" -> "NT" */
  function initialsOf(name) {
    const words = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return 'NT';
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }

  /* Điền avatar chữ + title trên topbar và bật theme đã lưu (mọi trang) */
  function applyUserProfile() {
    const profile = Object.assign({}, DEFAULT_PROFILE, readJSON('userProfile') || {});

    const avatar = document.querySelector('.topbar__avatar');
    if (avatar) {
      avatar.textContent = initialsOf(profile.name);
      avatar.title = profile.name;
    }

    /* body[data-theme="dark"] sẽ được CSS trong common.css đổi biến màu */
    document.body.dataset.theme = profile.theme === 'dark' ? 'dark' : 'light';
  }

/* ------------------- AVATAR: HIỆN THÔNG TIN TRANG WEB ------------------- */
function setupAvatar() {
  const avatar = document.querySelector('.topbar__avatar');

  if (!avatar) return;

  // Cho biết avatar có thể bấm được
  avatar.style.cursor = 'pointer';
  avatar.title = 'Xem thông tin TripWeave AI';

  // Tránh tạo bảng thông tin nhiều lần
  let popup = document.querySelector('.profile-popup');

  if (!popup) {
    popup = document.createElement('div');
    popup.className = 'profile-popup';

    popup.innerHTML = `
      <h3>TripWeave AI</h3>
      <p><strong>Người dùng:</strong> <span class="profile-name"></span></p>
      <p><strong>Email:</strong> <span class="profile-email"></span></p>
      <p><strong>Vai trò:</strong> Du khách</p>
      <p><strong>Chức năng:</strong> Khám phá địa điểm, lập lịch trình và lưu địa điểm yêu thích.</p>
      <button type="button" class="profile-close">Đóng</button>
    `;

    document.body.appendChild(popup);
  }

  // Cập nhật thông tin theo hồ sơ đang lưu
  function updatePopup() {
    const profile = Object.assign(
      {},
      DEFAULT_PROFILE,
      readJSON('userProfile') || {}
    );

    popup.querySelector('.profile-name').textContent = profile.name;
    popup.querySelector('.profile-email').textContent = profile.email;
  }

  updatePopup();

  // Bấm avatar để mở hoặc đóng bảng
  avatar.addEventListener('click', function (event) {
    event.stopPropagation();
    updatePopup();
    popup.classList.toggle('is-open');
  });

  // Bấm nút Đóng
  popup.querySelector('.profile-close').addEventListener('click', function () {
    popup.classList.remove('is-open');
  });

  // Bấm ra ngoài bảng thì đóng
  document.addEventListener('click', function (event) {
    if (!popup.contains(event.target) && !avatar.contains(event.target)) {
      popup.classList.remove('is-open');
    }
  });
}

  /* ------------------- 5. VIỆC 3: CHUÔNG THÔNG BÁO ------------------- */
  function setupBell() {
    const bell = document.querySelector('.topbar__bell');
    if (!bell) return;

    /* Bấm chuông -> sang trang Thông báo (mọi trang đều nằm sâu 1 cấp
       nên đường dẫn tương đối này đúng cho toàn bộ màn hình) */
    bell.addEventListener('click', () => {
      window.location.href = '../traveler-notifications/traveler-notifications.html';
    });

    /* Badge đỏ nhỏ đếm tổng số thông báo hiện có trong localStorage */
    const count = (readJSON('notifications') || []).length;
    if (count > 0) {
      const badge = document.createElement('span');
      badge.className = 'topbar__badge';
      badge.textContent = count > 9 ? '9+' : String(count);
      bell.appendChild(badge);
    }
  }

  /* ------------------- 6. VIỆC 4: THANH ĐIỀU HƯỚNG MOBILE ------------------- */
  /* 5 mục của bottom nav (icon svg + nhãn). Mảng "match" chứa các đoạn đường
     dẫn nhận diện trang đang mở để tô xanh (is-active); màn AI Itinerary và
     Giải thích AI được tính là nối tiếp của luồng "Chuyến đi". */
  const MOBILE_NAV_ITEMS = [
    { href: '../traveler-discover/traveler-discover.html',
      match: ['traveler-discover'],
      label: 'Khám phá',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><path d="M9 22V12h6v10"></path></svg>' },
    { href: '../traveler-trip-planner/traveler-trip-planner.html',
      match: ['traveler-trip-planner', 'traveler-ai-itinerary', 'traveler-ai-explanation'],
      label: 'Chuyến đi',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"></path><path d="M9 4v14"></path><path d="M15 6v14"></path></svg>' },
    { href: '../traveler-saved/traveler-saved.html',
      match: ['traveler-saved'],
      label: 'Đã lưu',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>' },
    { href: '../traveler-notifications/traveler-notifications.html',
      match: ['traveler-notifications'],
      label: 'Thông báo',
      badge: true,
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.7 21a2 2 0 0 1-3.4 0"></path></svg>' },
    { href: '../traveler-settings/traveler-settings.html',
      match: ['traveler-settings'],
      label: 'Cài đặt',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 21v-7"></path><path d="M4 10V3"></path><path d="M12 21v-9"></path><path d="M12 8V3"></path><path d="M20 21v-5"></path><path d="M20 12V3"></path><path d="M1 14h6"></path><path d="M9 8h6"></path><path d="M17 16h6"></path></svg>' }
  ];

  /* Chèn thẻ <nav class="mobile-nav"> vào cuối <body>. Ẩn/hiện theo độ rộng
     màn hình là việc của common.css (desktop: display:none; <= 900px: hiện)
     nên ở đây không cần kiểm tra kích thước. */
  function setupMobileNav() {
    if (document.querySelector('.mobile-nav')) return; // tránh chèn 2 lần

    const path  = window.location.pathname;
    const count = (readJSON('notifications') || []).length; // đếm cho badge

    const nav = document.createElement('nav');
    nav.className = 'mobile-nav';
    nav.innerHTML = MOBILE_NAV_ITEMS.map((item) => {
      const active = item.match.some((m) => path.indexOf(m) > -1) ? ' is-active' : '';
      const badge = (item.badge && count > 0)
        ? '<span class="mobile-nav__badge">' + (count > 9 ? '9+' : count) + '</span>'
        : '';
      return '<a class="mobile-nav__item' + active + '" href="' + item.href + '">' +
               item.icon + '<span>' + item.label + '</span>' + badge +
             '</a>';
    }).join('');

    document.body.appendChild(nav);
  }

  /* ------------------- CHẠY NGAY KHI TRANG LOAD XONG ------------------- */
  seedData();
  applyUserProfile();
  setupAvatar();
  setupBell();
  setupMobileNav();
})();
