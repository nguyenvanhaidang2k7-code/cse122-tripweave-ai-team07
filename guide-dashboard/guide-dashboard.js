/* =====================================================================
   TripWeave AI · guide-dashboard.js  (PHẦN 1/2)
   Màn hình: Trang chủ hướng dẫn viên
   ===================================================================== */

/* ---------- 1) Tiện ích DOM ---------- */
const $  = (sel, root = document) => root.querySelector(sel);
const clone = (obj) => JSON.parse(JSON.stringify(obj));
const wait  = (ms) => new Promise((res) => setTimeout(res, ms));

/* ---------- 2) Toast (thông báo góc phải dưới) ---------- */
function showToast(message, type = 'success') {
  const region = $('#toastRegion');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="dot"></span><span>${message}</span>`;
  region.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('leaving');
    setTimeout(() => toast.remove(), 260);
  }, 2600);
}

/* ---------- 3) Store chung giữa các trang (localStorage) ----------
   Mọi trang của role Guide cùng đọc/ghi một key nên dữ liệu được
   "liên kết chặt": duyệt lịch trình ở trang review sẽ làm danh sách
   chờ review ở trang chủ cạn dần.                                  */
const STORE_KEY = 'tripweave_guide_state_v1';

const DEFAULT_STATE = {
  stats: { collections: 12, reviews: 8, views: '3.2K', rating: '4.8' },
  collections: [
    { id: 'c1', name: 'Ẩm thực Hà Nội',       tag: 'Ẩm thực',  desc: 'Món ngon địa phương',     places: 6, archived: false },
    { id: 'c2', name: 'Điểm đến cuối tuần',   tag: 'Điểm đến', desc: 'Lịch trình ngắn',         places: 6, archived: false },
    { id: 'c3', name: 'Thiên nhiên miền Bắc', tag: 'Thiên nh', desc: 'Cảnh quan & trải nghiệm', places: 6, archived: false },
  ],
  itineraries: [
    { id: 't1', title: 'Hà Nội – Hạ Long – Ninh Bình', days: 5, places: 12, status: 'pending', rejectReason: '', comments: {},
      schedule: [
        { day: 1, city: 'Hà Nội',    acts: '09:00 tham quan • 14:00 trải nghiệm • 18:30 ăn tối' },
        { day: 2, city: 'Hạ Long',   acts: '09:00 tham quan • 14:00 trải nghiệm • 18:30 ăn tối' },
        { day: 3, city: 'Ninh Bình', acts: '09:00 tham quan • 14:00 trải nghiệm • 18:30 ăn tối' },
      ] },
    { id: 't2', title: 'Hà Nội – Hạ Long – Ninh Bình', days: 5, places: 12, status: 'pending', rejectReason: '', comments: {},
      schedule: [
        { day: 1, city: 'Hà Nội',    acts: '09:00 tham quan • 14:00 trải nghiệm • 18:30 ăn tối' },
        { day: 2, city: 'Hạ Long',   acts: '09:00 tham quan • 14:00 trải nghiệm • 18:30 ăn tối' },
        { day: 3, city: 'Ninh Bình', acts: '09:00 tham quan • 14:00 trải nghiệm • 18:30 ăn tối' },
      ] },
    { id: 't3', title: 'Hà Nội – Hạ Long – Ninh Bình', days: 5, places: 12, status: 'pending', rejectReason: '', comments: {},
      schedule: [
        { day: 1, city: 'Hà Nội',    acts: '09:00 tham quan • 14:00 trải nghiệm • 18:30 ăn tối' },
        { day: 2, city: 'Hạ Long',   acts: '09:00 tham quan • 14:00 trải nghiệm • 18:30 ăn tối' },
        { day: 3, city: 'Ninh Bình', acts: '09:00 tham quan • 14:00 trải nghiệm • 18:30 ăn tối' },
      ] },
  ],
  experiences: [
    { id: 'e1', title: 'Tham quan làng cổ',  cat: 'Văn hóa',     desc: 'Phù hợp nhóm khách yêu thích trải nghiệm địa phương.' },
    { id: 'e2', title: 'Ăn tối trên thuyền', cat: 'Ẩm thực',     desc: 'Phù hợp nhóm khách yêu thích trải nghiệm địa phương.' },
    { id: 'e3', title: 'Trekking nhẹ',       cat: 'Thiên nhiên', desc: 'Phù hợp nhóm khách yêu thích trải nghiệm địa phương.' },
  ],
  addedToCollection: {}, // expId -> collectionId
  location: {
    name: 'Văn Miếu – Quốc Tử Giám', category: 'Văn hóa',
    address: 'Đống Đa, Hà Nội', price: '30.000đ/người',
    desc: 'Di tích văn hóa nổi bật của Hà Nội...',
  },
  profile: {
    name: 'Nguyễn Văn Minh', role: 'Hướng dẫn viên', city: 'Hà Nội',
    rating: 4.8, reviews: 120, tours: 50,
    specialties: 'Văn hóa, Ẩm thực', region: 'Hà Nội & miền Bắc',
    experience: '5 năm', languages: 'Việt, Anh',
  },
  profileReviews: [
    { stars: 5, text: '“Lịch trình rất hợp lý.”' },
    { stars: 5, text: '“Gợi ý địa điểm hữu ích.”' },
    { stars: 4, text: '“Cần thêm lựa chọn ăn uống.”' },
  ],
  activities: ['Đã duyệt 3 địa điểm', 'Có 2 lịch trình mới', 'Thêm 1 trải nghiệm'],
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return clone(DEFAULT_STATE);
    return { ...clone(DEFAULT_STATE), ...JSON.parse(raw) };
  } catch (err) {
    return clone(DEFAULT_STATE);
  }
}
function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(STATE)); } catch (err) { /* bỏ qua */ }
}
let STATE = loadState();

/* Chế độ demo trạng thái: ?demo=empty hoặc ?demo=error */
const DEMO = new URLSearchParams(location.search).get('demo');

/* ---------- 4) Hành vi chung của top header ---------- */
/* Đồng bộ thông tin hồ sơ lên topbar: title + chữ viết tắt trên avatar + menu */
function syncHeaderProfile() {
  const p = STATE.profile;
  const btn = $('#avatarBtn');
  if (btn) {
    btn.title = `${p.name} — ${p.role}`;
    // Viết tắt tên hiển thị trên nút avatar (vd: Nguyễn Văn Minh -> NM)
    const w = p.name.trim().split(/\s+/);
    btn.textContent = ((w[0] ? w[0][0] : '') + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase();
  }
  if ($('#avatarMenuName')) $('#avatarMenuName').textContent = p.name;
  if ($('#avatarMenuRole')) $('#avatarMenuRole').textContent = p.role;
}

function initHeader() {
  syncHeaderProfile(); // cập nhật topbar theo STATE.profile mới nhất
  // Tìm kiếm toàn cục (demo)
  $('#globalSearch').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = $('#globalSearchInput').value.trim();
    if (!q) return showToast('Vui lòng nhập từ khoá cần tìm.', 'error');
    showToast(`Tìm kiếm demo: "${q}"`, 'info');
  });
  // Menu avatar
  const menu = $('#avatarMenu');
  $('#avatarBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
  });
  document.addEventListener('click', () => { menu.hidden = true; });
  $('#logoutBtn').addEventListener('click', () =>
    showToast('Demo: chức năng đăng xuất chưa nối backend.', 'info'));
  $('#syncBtn').addEventListener('click', () =>
    showToast('Đã đồng bộ dữ liệu hướng dẫn viên (demo).', 'success'));
}
/* ---------- 5) Mẫu HTML cho các UI states ---------- */
const emptyHtml = (icon, title, desc, action = '') => `
  <div class="empty">
    <div class="empty-icon">${icon}</div>
    <div class="empty-title">${title}</div>
    <div class="empty-desc">${desc}</div>
    ${action}
  </div>`;

const errorHtml = (msg) => `
  <div class="error-block">
    <span>⚠️</span>
    <span><strong>Lỗi kết nối.</strong> ${msg}</span>
    <button class="btn btn-light" id="retryBtn" type="button">Thử lại</button>
  </div>`;

/* ---------- 6) Render khối thống kê ---------- */
function renderStatsSkeleton() {
  $('#statsGrid').innerHTML = Array.from({ length: 4 },
    () => '<div class="skeleton skel-stat"></div>').join('');
}
function renderStats() {
  const s = STATE.stats; // chỉ dùng giá trị tĩnh cho Lượt xem/Đánh giá (không có mảng nguồn)
  // ĐẾM ĐỘNG trực tiếp từ mảng STATE — luôn khớp với trang Curated & Review lịch trình
  const activeCollections = STATE.collections.filter((c) => !c.archived).length;
  const pendingReviews = STATE.itineraries.filter((t) => t.status === 'pending').length;
  $('#statsGrid').innerHTML = `
    <div class="card stat-card"><span class="stat-label">Bộ sưu tập đang hoạt động</span><span class="stat-value c-green">${activeCollections}</span></div>
    <div class="card stat-card"><span class="stat-label">Lịch trình chờ review</span><span class="stat-value c-blue">${pendingReviews}</span></div>
    <div class="card stat-card"><span class="stat-label">Lượt xem</span><span class="stat-value c-violet">${s.views}</span></div>
    <div class="card stat-card"><span class="stat-label">Đánh giá</span><span class="stat-value c-orange">${s.rating} ★</span></div>`;
}

/* ---------- 6b) Widget "Bộ sưu tập đang hoạt động" (đồng bộ real-time từ trang Curated) ---------- */
function renderCollectionsSkeleton() {
  $('#collectionsList').innerHTML = Array.from({ length: 3 },
    () => '<div class="skeleton skel-row"></div>').join('');
}

function renderCollections() {
  const active = STATE.collections.filter((c) => !c.archived);
  $('#collectionsCount').textContent = `${active.length} bộ sưu tập`;

  // Trạng thái RỖNG: chưa có bộ sưu tập nào đang hoạt động
  if (!active.length) {
    $('#collectionsList').innerHTML = emptyHtml(
      '🗂️', 'Chưa có bộ sưu tập nào đang hoạt động',
      'Tạo bộ sưu tập ở trang Curated để chúng xuất hiện ngay tại đây.',
      '<a class="btn btn-primary" href="../guide-curated/guide-curated.html">Tạo bộ sưu tập</a>');
    return;
  }

  // Trạng thái BÌNH THƯỜNG: tối đa 4 bộ sưu tập MỚI NHẤT
  // (trang Curated thêm mới bằng push nên phần tử mới nằm cuối mảng)
  const latest = active.slice(-4).reverse();
  $('#collectionsList').innerHTML = latest.map((c) => `
    <article class="card row-card">
      <div class="thumb thumb-md">${c.tag}</div>
      <div class="row-info">
        <h3 class="row-title">${c.name}</h3>
        <p class="row-meta">${c.tag} • ${c.places} địa điểm • ${c.desc}</p>
      </div>
      <a class="btn btn-light" href="../guide-curated/guide-curated.html">Mở Curated</a>
    </article>`).join('');
}

/* ---------- 7) Render danh sách lịch trình chờ review ---------- */
function renderPendingSkeleton() {
  $('#pendingList').innerHTML = Array.from({ length: 3 },
    () => '<div class="skeleton skel-row"></div>').join('');
  $('#activityList').innerHTML = Array.from({ length: 3 },
    () => '<li><div class="skeleton skel-line" style="width:70%"></div></li>').join('');
}

function renderPending() {
  const list = STATE.itineraries.filter((t) => t.status === 'pending');
  $('#pendingCount').textContent = `${list.length} chờ review`;

  // Trạng thái RỖNG: không còn lịch trình nào chờ duyệt
  if (!list.length) {
    $('#pendingList').innerHTML = emptyHtml(
      '🎉', 'Tất cả đề xuất đã được xử lý xong!',
      'Không còn lịch trình nào chờ review — duyệt đề xuất mới hoặc tạo thêm bộ sưu tập nhé.',
      '<a class="btn btn-primary" href="../guide-curated/guide-curated.html">Tạo bộ sưu tập</a>');
    return;
  }

  // Trạng thái BÌNH THƯỜNG: danh sách thẻ hàng
  $('#pendingList').innerHTML = list.map((t, i) => `
    <article class="card row-card">
      <div class="thumb thumb-md">Ảnh ${i + 1}</div>
      <div class="row-info">
        <h3 class="row-title">${t.title}</h3>
        <p class="row-meta">Đề xuất mới • Chờ review</p>
      </div>
      <a class="btn btn-primary" href="../guide-itinerary-detail/guide-itinerary-detail.html?id=${t.id}">Xem review</a>
    </article>`).join('');
}

/* ---------- 8) Render hoạt động gần đây ---------- */
function renderActivities() {
  $('#activityList').innerHTML = STATE.activities
    .slice(0, 5)
    .map((a) => `<li>${a}</li>`)
    .join('');
}

/* ---------- 9) Khởi động trang ---------- */
async function init() {
  initHeader();

  // Trạng thái LOADING: khung xương trong lúc "gọi API"
  renderStatsSkeleton();
  renderCollectionsSkeleton();
  renderPendingSkeleton();
  await wait(800);

  // Trạng thái ERROR (demo bằng ?demo=error)
  if (DEMO === 'error') {
    $('#statsGrid').innerHTML = '';
    $('#collectionsCount').textContent = '';
    $('#collectionsList').innerHTML = errorHtml('Không tải được dữ liệu bộ sưu tập.');
    $('#pendingList').innerHTML = errorHtml('Không tải được dữ liệu lịch trình.');
    $('#activityList').innerHTML = '';
    return;
  }

  // Trạng thái EMPTY (demo bằng ?demo=empty, không ghi store)
  if (DEMO === 'empty') {
    STATE.itineraries.forEach((t) => { t.status = 'approved'; });
    STATE.collections.forEach((c) => { c.archived = true; }); // demo luôn Empty State của widget
  }

  // Trạng thái NORMAL / SUCCESS
  renderStats();
  renderCollections();
  renderPending();
  renderActivities();
  ready = true;
}

/* Nút "Thử lại" trong khối lỗi (event delegation) */
document.addEventListener('click', (e) => {
  if (e.target.id === 'retryBtn') location.reload();
});

/* ---------- 10) Đồng bộ real-time giữa các tab (storage event) ---------- */
let ready = false; // trang đã hoàn tất render lần đầu chưa
function refreshView() {
  renderStats();
  renderCollections();
  renderPending();
  renderActivities();
}
window.addEventListener('storage', (e) => {
  if (e.key !== STORE_KEY) return; // chỉ quan tâm key chung
  STATE = loadState();             // nạp store mới nhất từ tab khác
  syncHeaderProfile();             // cập nhật avatar + menu theo hồ sơ mới
  if (ready) refreshView();        // render lại nội dung (nếu đã sẵn sàng)
});

document.addEventListener('DOMContentLoaded', init);
