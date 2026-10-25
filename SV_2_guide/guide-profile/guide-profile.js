/* =====================================================================
   TripWeave AI · guide-profile.js  (PHẦN 1/2)
   Màn hình: Hồ sơ hướng dẫn viên — hiển thị thông tin, đánh giá,
   chỉnh sửa hồ sơ qua modal có validation.
   ===================================================================== */

/* ---------- 1) Tiện ích ---------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const clone = (obj) => JSON.parse(JSON.stringify(obj));
const wait  = (ms) => new Promise((res) => setTimeout(res, ms));

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

/* ---------- 2) Store chung (localStorage) ---------- */
const STORE_KEY = 'tripweave_guide_state_v1';
const DEFAULT_STATE = {
  stats: { collections: 12, reviews: 8, views: '3.2K', rating: '4.8' },
  collections: [
    { id: 'c1', name: 'Ẩm thực Hà Nội',       tag: 'Ẩm thực',  desc: 'Món ngon địa phương',     places: 6, archived: false },
    { id: 'c2', name: 'Điểm đến cuối tuần',   tag: 'Điểm đến', desc: 'Lịch trình ngắn',         places: 6, archived: false },
    { id: 'c3', name: 'Thiên nhiên miền Bắc', tag: 'Thiên nh', desc: 'Cảnh quan & trải nghiệm', places: 6, archived: false },
  ],
  itineraries: [],
  experiences: [],
  addedToCollection: {},
  location: { name: 'Văn Miếu – Quốc Tử Giám', category: 'Văn hóa', address: 'Đống Đa, Hà Nội', price: '30.000đ/người', desc: 'Di tích văn hóa nổi bật của Hà Nội...' },
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
  } catch (err) { return clone(DEFAULT_STATE); }
}
function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(STATE)); } catch (err) { /* bỏ qua */ }
}
let STATE = loadState();
const DEMO = new URLSearchParams(location.search).get('demo');

function pushActivity(text) {
  STATE.activities.unshift(text);
  STATE.activities = STATE.activities.slice(0, 6);
}

/* ---------- 3) Header + modal dùng chung ---------- */
/* Đồng bộ thông tin hồ sơ lên topbar: title + chữ viết tắt trên avatar + menu */
function syncHeaderProfile() {
  const p = STATE.profile;
  const btn = $('#avatarBtn');
  if (btn) {
    btn.title = 'Đăng xuất';
    // Viết tắt tên hiển thị trên nút avatar (vd: Nguyễn Văn Minh -> NM)
    const w = p.name.trim().split(/\s+/);
    btn.textContent = ((w[0] ? w[0][0] : '') + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase();
  }
}

function initHeader() {
  syncHeaderProfile(); // cập nhật topbar theo STATE.profile mới nhất
  $('#globalSearch').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = $('#globalSearchInput').value.trim();
    if (!q) return showToast('Vui lòng nhập từ khoá cần tìm.', 'error');
    showToast(`Tìm kiếm demo: "${q}"`, 'info');
  });
  $('#avatarBtn').addEventListener('click', () => {
    if (!window.confirm('Bạn muốn đăng xuất khỏi TripWeave AI?')) return;
    try {
      localStorage.removeItem('tw_session');
    } catch (err) {
      console.warn('Không thể xóa phiên đăng nhập:', err);
    }
    window.location.href = '../../SV_3_AdminPartners/login/index.html';
  });
  $('#syncBtn').addEventListener('click', () => showToast('Đã đồng bộ dữ liệu hướng dẫn viên (demo).', 'success'));
}
function openModal(id)  { $('#' + id).classList.add('open'); }
function closeModal(id) { $('#' + id).classList.remove('open'); }
function initModals() {
  document.addEventListener('click', (e) => {
    const closer = e.target.closest('[data-close]');
    if (closer) closeModal(closer.dataset.close);
    if (e.target.classList.contains('modal-backdrop')) e.target.classList.remove('open');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') $$('.modal-backdrop.open').forEach((m) => m.classList.remove('open'));
  });
}
/* ---------- 4) Render hồ sơ ---------- */
function starRow(n) {
  // Vẽ n ngôi sao đầy + phần còn lại là sao rỗng (tối đa 5)
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function renderSkeleton() {
  $('.profile-head').outerHTML = '<div class="skeleton skel-head" id="skelHead"></div>';
  $('.profile-grid').outerHTML = '<div class="skeleton skel-panel" id="skelGrid"></div>';
}

function renderProfile() {
  const p = STATE.profile;
  $('#profileName').textContent = p.name;
  $('#profileRole').textContent = `${p.role} • ${p.city}`;
  $('#profileStats').innerHTML =
    `<span class="star">★</span> ${p.rating} <span>•</span> ${p.reviews} đánh giá <span>•</span> ${p.tours} tour`;

  $('#infoList').innerHTML = `
    <li><strong>Chuyên môn:</strong> ${p.specialties}</li>
    <li><strong>Khu vực:</strong> ${p.region}</li>
    <li><strong>Kinh nghiệm:</strong> ${p.experience}</li>
    <li><strong>Ngôn ngữ:</strong> ${p.languages}</li>`;

  $('#reviewList').innerHTML = STATE.profileReviews.map((r) => `
    <li><span class="stars">${starRow(r.stars)}</span><span>${r.text}</span></li>`).join('');
}

/* ---------- 5) Modal chỉnh sửa hồ sơ ---------- */
function openEdit() {
  const p = STATE.profile;
  $('#inpName').value = p.name;
  $('#inpCity').value = p.city;
  $('#inpSpecialties').value = p.specialties;
  $('#inpExperience').value = p.experience;
  $('#inpRegion').value = p.region;
  $('#inpLanguages').value = p.languages;
  ['fieldName', 'fieldExp'].forEach((id) => $('#' + id).classList.remove('invalid'));
  openModal('editModal');
}

async function saveProfile() {
  // Validation: tên không trống, kinh nghiệm phải chứa số
  const nameOk = $('#inpName').value.trim().length > 0;
  const expOk  = /\d/.test($('#inpExperience').value);
  $('#fieldName').classList.toggle('invalid', !nameOk);
  $('#fieldExp').classList.toggle('invalid', !expOk);
  if (!nameOk || !expOk) {
    showToast('Vui lòng kiểm tra lại trường bị lỗi.', 'error');
    return;
  }

  const btn = $('#saveProfileBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Đang lưu...';
  await wait(700); // giả lập gọi API

  STATE.profile = {
    ...STATE.profile,
    name: $('#inpName').value.trim(),
    city: $('#inpCity').value.trim() || STATE.profile.city,
    specialties: $('#inpSpecialties').value.trim(),
    experience: $('#inpExperience').value.trim(),
    region: $('#inpRegion').value.trim(),
    languages: $('#inpLanguages').value.trim(),
  };
  pushActivity('Đã cập nhật hồ sơ hướng dẫn viên');
  saveState();

  btn.disabled = false;
  btn.textContent = 'Lưu hồ sơ';
  closeModal('editModal');
  renderProfile();
  syncHeaderProfile(); // cập nhật avatar/topbar của chính tab này (storage event chỉ bắn sang tab khác)
  showToast('Đã lưu thay đổi hồ sơ.');
}

/* ---------- 6) Khởi động trang ---------- */
async function init() {
  initHeader();
  initModals();

  $('#editProfileBtn').addEventListener('click', openEdit);
  $('#saveProfileBtn').addEventListener('click', saveProfile);

  // Trạng thái LOADING
  renderSkeleton();
  await wait(750);

  // Trạng thái ERROR (demo)
  if (DEMO === 'error') {
    $('#skelHead')?.remove();
    const grid = $('#skelGrid');
    if (grid) grid.outerHTML = `<div class="error-block"><span>⚠️</span>
      <span><strong>Lỗi kết nối.</strong> Không tải được hồ sơ hướng dẫn viên.</span>
      <button class="btn btn-light" id="retryBtn" type="button">Thử lại</button></div>`;
    $('#retryBtn')?.addEventListener('click', () => location.reload());
    $('#editProfileBtn').disabled = true;
    return;
  }

  // Khôi phục lại DOM thật sau skeleton rồi render
  // (renderSkeleton đã thay 2 khối bằng skeleton nên nạp lại khung gốc)
  document.querySelector('.content').innerHTML = `
    <div class="content-rule" aria-hidden="true"></div>
    <section class="card profile-head">
      <div class="avatar-lg" aria-hidden="true"></div>
      <div class="row-info">
        <h1 class="profile-name" id="profileName">...</h1>
        <p class="row-meta" id="profileRole">...</p>
      </div>
      <div class="profile-stats" id="profileStats"></div>
    </section>
    <section class="profile-grid">
      <div class="card panel">
        <div class="panel-head"><h2>Thông tin</h2></div>
        <ul class="info-list" id="infoList"></ul>
      </div>
      <div class="card panel">
        <div class="panel-head"><h2>Đánh giá gần đây</h2></div>
        <ul class="review-list" id="reviewList"></ul>
      </div>
    </section>
    <div class="profile-foot">
      <button class="btn btn-primary btn-lg" id="editProfileBtn" type="button">Chỉnh sửa hồ sơ</button>
    </div>`;
  $('#editProfileBtn').addEventListener('click', openEdit);
  renderProfile();
  ready = true;
}

/* ---------- 10) Đồng bộ real-time giữa các tab (storage event) ---------- */
let ready = false; // trang đã hoàn tất render lần đầu chưa
function refreshView() {
  if ($('#profileName')) renderProfile(); // chỉ render khi DOM nội dung tồn tại
}
window.addEventListener('storage', (e) => {
  if (e.key !== STORE_KEY) return; // chỉ quan tâm key chung
  STATE = loadState();             // nạp store mới nhất từ tab khác
  syncHeaderProfile();             // cập nhật avatar + menu theo hồ sơ mới
  if (ready) refreshView();        // render lại nội dung (nếu đã sẵn sàng)
});

document.addEventListener('DOMContentLoaded', init);
