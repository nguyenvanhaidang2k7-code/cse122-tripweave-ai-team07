/* =====================================================================
   traveler-notifications.js – Màn hình "Thông báo"
   ---------------------------------------------------------------------
   Luồng xử lý (dễ thuyết trình):
     1. Đọc mảng "notifications" từ localStorage (common.js seed sẵn 6
        mục mặc định; trang AI Itinerary còn ghi THÊM mục mới mỗi lần
        người dùng bấm "Chấp nhận & Lưu" lịch trình).
     2. Render hàng tab lọc [Tất cả | Hệ thống | Ưu đãi | Cập nhật].
     3. Bấm tab -> lọc danh sách theo trường "type" của từng thông báo
        rồi render lại (không cần load lại trang).
     4. Bấm vào 1 thông báo -> mở trang liên quan nhờ trường "link"
        (vd: thông báo AI -> trang AI Itinerary kèm anchor #saved).
   ===================================================================== */

const NOTIF_KEY = 'notifications'; // key dùng chung với common.js + AI Itinerary

const $ = (id) => document.getElementById(id);

/* 4 tab lọc: label hiển thị + type tương ứng trong dữ liệu */
const TABS = [
  { label: 'Tất cả',   type: 'all'    },
  { label: 'Hệ thống', type: 'system' },
  { label: 'Ưu đãi',   type: 'offer'  },
  { label: 'Cập nhật', type: 'update' }
];

let activeType = 'all'; // tab đang chọn (mặc định: Tất cả)

/* Mũi tên › ở cuối mỗi hàng thông báo */
const CHEVRON_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"></path></svg>';

/* Đọc localStorage an toàn: lỗi / chưa có thì trả về null */
function readJSON(key) {
  try { return JSON.parse(localStorage.getItem(key)); }
  catch (err) { console.warn('Không đọc được localStorage:', err); return null; }
}

/* ------------------- RENDER HÀNG TAB LỌC ------------------- */
function renderTabs() {
  $('notifTabs').innerHTML = TABS.map((tab) =>
    '<button class="notif-tab' + (tab.type === activeType ? ' is-active' : '') +
    '" data-type="' + tab.type + '">' + tab.label + '</button>'
  ).join('');

  // Bấm tab nào -> đổi activeType rồi render lại cả tab lẫn danh sách
  document.querySelectorAll('.notif-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      activeType = tab.dataset.type;
      renderTabs();
      renderList();
    });
  });
}

/* ------------------- RENDER DANH SÁCH THÔNG BÁO ------------------- */
function renderList() {
  const list = readJSON(NOTIF_KEY) || [];

  // Lọc theo tab đang chọn ("Tất cả" thì lấy nguyên mảng)
  const shown = activeType === 'all'
    ? list
    : list.filter((n) => n.type === activeType);

  if (shown.length === 0) {
    $('notifList').innerHTML = '<p class="notif-empty">Không có thông báo nào thuộc mục này.</p>';
    return;
  }

  $('notifList').innerHTML = shown.map((n) =>
    '<article class="notif-item" data-link="' + n.link + '">' +
      '<span class="notif-item__icon notif-item__icon--' + n.tint + '"></span>' +
      '<div class="notif-item__body">' +
        '<h3 class="notif-item__title">' + n.title + '</h3>' +
        '<p class="notif-item__text">' + n.body + '</p>' +
      '</div>' +
      '<span class="notif-item__time">' + n.time + '</span>' +
      '<span class="notif-item__chevron">' + CHEVRON_SVG + '</span>' +
    '</article>'
  ).join('');

  // Bấm vào thông báo -> mở trang tương ứng (trường "link" của dữ liệu)
  document.querySelectorAll('.notif-item').forEach((item) => {
    item.addEventListener('click', () => { window.location.href = item.dataset.link; });
  });
}

/* ------------------- KHỞI ĐỘNG ------------------- */
renderTabs();
renderList(); // script đặt cuối body nên DOM đã sẵn sàng
