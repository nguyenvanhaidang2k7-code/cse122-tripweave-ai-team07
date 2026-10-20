/* =====================================================================
   TripWeave AI · guide-locations.js  (PHẦN 1/2)
   Màn hình: Địa điểm — form cập nhật thông tin địa điểm,
   validation, bản đồ mô phỏng thả ghim, lưu với trạng thái loading.
   ===================================================================== */

/* ---------- 1) Tiện ích ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
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
  location: {
    name: 'Văn Miếu – Quốc Tử Giám', category: 'Văn hóa',
    address: 'Đống Đa, Hà Nội', price: '30.000đ/người',
    desc: 'Di tích văn hóa nổi bật của Hà Nội...',
  },
  profile: { name: 'Nguyễn Văn Minh', role: 'Hướng dẫn viên', city: 'Hà Nội', rating: 4.8, reviews: 120, tours: 50, specialties: 'Văn hóa, Ẩm thực', region: 'Hà Nội & miền Bắc', experience: '5 năm', languages: 'Việt, Anh' },
  profileReviews: [],
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

/* ---------- 3) Hành vi chung của top header ---------- */
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
  $('#globalSearch').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = $('#globalSearchInput').value.trim();
    if (!q) return showToast('Vui lòng nhập từ khoá cần tìm.', 'error');
    showToast(`Tìm kiếm demo: "${q}"`, 'info');
  });
  const menu = $('#avatarMenu');
  $('#avatarBtn').addEventListener('click', (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; });
  document.addEventListener('click', () => { menu.hidden = true; });
  $('#logoutBtn').addEventListener('click', () => showToast('Demo: chức năng đăng xuất chưa nối backend.', 'info'));
  $('#syncBtn').addEventListener('click', () => showToast('Đã đồng bộ dữ liệu hướng dẫn viên (demo).', 'success'));
}

/* ---------- 4) Điền dữ liệu hiện có vào form ---------- */
function fillForm() {
  const l = STATE.location;
  $('#locName').value = l.name || '';
  $('#locCategory').value = l.category || 'Văn hóa';
  $('#locAddress').value = l.address || '';
  $('#locPrice').value = l.price || '';
  $('#locDesc').value = l.desc || '';
  ['fieldName', 'fieldAddress', 'fieldPrice', 'fieldDesc']
    .forEach((id) => $('#' + id).classList.remove('invalid'));
}
/* ---------- 5) Validation form ---------- */
function validateForm() {
  const nameOk    = $('#locName').value.trim().length > 0;
  const addressOk = $('#locAddress').value.trim().length > 0;
  const price     = $('#locPrice').value.trim();
  const priceOk   = /\d/.test(price) && price.length >= 3; // cần chứa số + đơn vị
  const descOk    = $('#locDesc').value.trim().length >= 10;
  $('#fieldName').classList.toggle('invalid', !nameOk);
  $('#fieldAddress').classList.toggle('invalid', !addressOk);
  $('#fieldPrice').classList.toggle('invalid', !priceOk);
  $('#fieldDesc').classList.toggle('invalid', !descOk);
  return nameOk && addressOk && priceOk && descOk;
}

/* ---------- 6) Bản đồ mô phỏng: thả ghim tại vị trí click ---------- */
function initMap() {
  const box = $('#mapBox');
  box.addEventListener('click', (e) => {
    const rect = box.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pin = $('#mapPin');
    pin.hidden = false;
    pin.style.left = x + 'px';
    pin.style.top = y + 'px';
    // Toạ độ demo suy ra từ vị trí click
    const lat = (21.0285 + (rect.height / 2 - y) / 4000).toFixed(4);
    const lng = (105.8042 + (x - rect.width / 2) / 4000).toFixed(4);
    $('#mapCoords').textContent = `Vĩ độ ${lat} · Kinh độ ${lng}`;
    showToast('Đã thả ghim vị trí mới trên bản đồ (demo).', 'info');
  });
}

/* ---------- 7) Lưu địa điểm ---------- */
async function handleSave(e) {
  e.preventDefault();

  // Trạng thái ERROR: dữ liệu không hợp lệ
  if (!validateForm()) {
    showToast('Dữ liệu chưa hợp lệ, hãy kiểm tra các trường đỏ.', 'error');
    return;
  }

  // Trạng thái LOADING trên nút lưu
  const btn = $('#saveBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Đang lưu...';
  await wait(900); // giả lập gọi API

  STATE.location = {
    name: $('#locName').value.trim(),
    category: $('#locCategory').value,
    address: $('#locAddress').value.trim(),
    price: $('#locPrice').value.trim(),
    desc: $('#locDesc').value.trim(),
  };
  pushActivity(`Đã cập nhật địa điểm "${STATE.location.name}"`);
  saveState();

  // Trạng thái SUCCESS
  btn.disabled = false;
  btn.textContent = 'Lưu địa điểm';
  showToast('Đã lưu thông tin địa điểm thành công.');
}

/* ---------- 8) Khởi động trang ---------- */
async function init() {
  initHeader();
  initMap();

  $('#locationForm').addEventListener('submit', handleSave);
  $('#resetBtn').addEventListener('click', () => {
    fillForm();
    showToast('Đã hoàn tác thay đổi chưa lưu.', 'info');
  });

  // Trạng thái LOADING: khung xương cho các ô nhập
  const card = $('.form-card');
  card.classList.add('loading');
  await wait(700);
  card.classList.remove('loading');

  // Trạng thái ERROR (demo)
  if (DEMO === 'error') {
    card.innerHTML = `<div class="error-block"><span>⚠️</span>
      <span><strong>Lỗi kết nối.</strong> Không tải được thông tin địa điểm.</span>
      <button class="btn btn-light" id="retryBtn" type="button">Thử lại</button></div>`;
    $('#retryBtn').addEventListener('click', () => location.reload());
    return;
  }

  fillForm();
  ready = true;
}

/* ---------- 10) Đồng bộ real-time giữa các tab (storage event) ---------- */
let ready = false; // trang đã hoàn tất render lần đầu chưa
function refreshView() {
  // Không điền lại form để tránh mất bản nháp người dùng đang nhập dở.
}
window.addEventListener('storage', (e) => {
  if (e.key !== STORE_KEY) return; // chỉ quan tâm key chung
  STATE = loadState();             // nạp store mới nhất từ tab khác
  syncHeaderProfile();             // cập nhật avatar + menu theo hồ sơ mới
  if (ready) refreshView();        // render lại nội dung (nếu đã sẵn sàng)
});

document.addEventListener('DOMContentLoaded', init);
