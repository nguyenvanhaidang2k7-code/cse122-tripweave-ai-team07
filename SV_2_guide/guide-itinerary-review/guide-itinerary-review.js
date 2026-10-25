/* =====================================================================
   TripWeave AI · guide-itinerary-review.js  (PHẦN 1/2)
   Màn hình: Review lịch trình — tab trạng thái, duyệt / từ chối.
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
const SCHEDULE = [
  { day: 1, city: 'Hà Nội',    acts: '09:00 tham quan • 14:00 trải nghiệm • 18:30 ăn tối' },
  { day: 2, city: 'Hạ Long',   acts: '09:00 tham quan • 14:00 trải nghiệm • 18:30 ăn tối' },
  { day: 3, city: 'Ninh Bình', acts: '09:00 tham quan • 14:00 trải nghiệm • 18:30 ăn tối' },
];
const DEFAULT_STATE = {
  stats: { collections: 12, reviews: 8, views: '3.2K', rating: '4.8' },
  collections: [
    { id: 'c1', name: 'Ẩm thực Hà Nội',       tag: 'Ẩm thực',  desc: 'Món ngon địa phương',     places: 6, archived: false },
    { id: 'c2', name: 'Điểm đến cuối tuần',   tag: 'Điểm đến', desc: 'Lịch trình ngắn',         places: 6, archived: false },
    { id: 'c3', name: 'Thiên nhiên miền Bắc', tag: 'Thiên nh', desc: 'Cảnh quan & trải nghiệm', places: 6, archived: false },
  ],
  itineraries: [
    { id: 't1', title: 'Hà Nội – Hạ Long – Ninh Bình', days: 5, places: 12, status: 'pending',  rejectReason: '', comments: {}, schedule: clone(SCHEDULE) },
    { id: 't2', title: 'Hà Nội – Hạ Long – Ninh Bình', days: 5, places: 12, status: 'pending',  rejectReason: '', comments: {}, schedule: clone(SCHEDULE) },
    { id: 't3', title: 'Hà Nội – Hạ Long – Ninh Bình', days: 5, places: 12, status: 'pending',  rejectReason: '', comments: {}, schedule: clone(SCHEDULE) },
  ],
  experiences: [
    { id: 'e1', title: 'Tham quan làng cổ',  cat: 'Văn hóa',     desc: 'Phù hợp nhóm khách yêu thích trải nghiệm địa phương.' },
    { id: 'e2', title: 'Ăn tối trên thuyền', cat: 'Ẩm thực',     desc: 'Phù hợp nhóm khách yêu thích trải nghiệm địa phương.' },
    { id: 'e3', title: 'Trekking nhẹ',       cat: 'Thiên nhiên', desc: 'Phù hợp nhóm khách yêu thích trải nghiệm địa phương.' },
  ],
  addedToCollection: {},
  location: { name: 'Văn Miếu – Quốc Tử Giám', category: 'Văn hóa', address: 'Đống Đa, Hà Nội', price: '30.000đ/người', desc: 'Di tích văn hóa nổi bật của Hà Nội...' },
  profile: { name: 'Nguyễn Văn Minh', role: 'Hướng dẫn viên', city: 'Hà Nội', rating: 4.8, reviews: 120, tours: 50, specialties: 'Văn hóa, Ẩm thực', region: 'Hà Nội & miền Bắc', experience: '5 năm', languages: 'Việt, Anh' },
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

/* ---------- 3) Header chung ---------- */
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

/* ---------- 4) Modal dùng chung ---------- */
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
/* ---------- 5) Trạng thái màn hình ---------- */
let currentTab = 'all';      // all | pending | approved | rejected
let rejectingId = null;      // id lịch trình đang mở modal từ chối

const BADGE = {
  pending:  '<span class="badge badge-pending">Chờ duyệt</span>',
  approved: '<span class="badge badge-approved">Đã duyệt</span>',
  rejected: '<span class="badge badge-rejected">Từ chối</span>',
};

/* ---------- 6) Render danh sách ---------- */
function renderSkeleton() {
  $('#itineraryList').innerHTML = Array.from({ length: 3 },
    () => '<div class="skeleton skel-row"></div>').join('');
}

function renderList() {
  let list = STATE.itineraries;
  if (currentTab !== 'all') list = list.filter((t) => t.status === currentTab);

  // Trạng thái RỖNG theo tab
  if (!list.length) {
    const msg = {
      all:      ['🗂️', 'Chưa có lịch trình nào', 'Khi có đề xuất mới từ điều phối viên, chúng sẽ xuất hiện tại đây.'],
      pending:  ['🎉', 'Không còn lịch trình chờ duyệt', 'Toàn bộ đề xuất đã được xử lý.'],
      approved: ['✅', 'Chưa có lịch trình đã duyệt', 'Các lịch trình bạn duyệt sẽ nằm ở tab này.'],
      rejected: ['📭', 'Chưa có lịch trình bị từ chối', 'Hy vọng không có lịch trình nào bị từ chối!'],
    }[currentTab];
    $('#itineraryList').innerHTML = `<div class="empty"><div class="empty-icon">${msg[0]}</div>
      <div class="empty-title">${msg[1]}</div><div class="empty-desc">${msg[2]}</div></div>`;
    return;
  }

  $('#itineraryList').innerHTML = list.map((t) => `
    <article class="card row-card">
      <div class="thumb thumb-md">Trip</div>
      <div class="row-info">
        <h3 class="row-title">${t.title}</h3>
        <p class="row-meta">${t.days} ngày • ${t.places} địa điểm • ${t.status === 'pending' ? 'Chờ review' : (t.status === 'approved' ? 'Đã review' : 'Bị từ chối')}</p>
        ${t.status === 'rejected' && t.rejectReason ? `<p class="reject-note">Lý do: ${t.rejectReason}</p>` : ''}
      </div>
      <div class="row-actions">
        ${BADGE[t.status]}
        <a class="btn btn-ghost" href="../guide-itinerary-detail/guide-itinerary-detail.html?id=${t.id}">Xem</a>
        ${t.status === 'pending' ? `
          <button class="btn btn-primary" data-approve="${t.id}" type="button">Duyệt</button>
          <button class="btn btn-danger" data-reject="${t.id}" type="button">Từ chối</button>` : ''}
      </div>
    </article>`).join('');
}

/* ---------- 7) Duyệt lịch trình ---------- */
async function approveTrip(id, btn) {
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Đang duyệt...';
  await wait(700); // giả lập gọi API

  const t = STATE.itineraries.find((x) => x.id === id);
  t.status = 'approved';
  pushActivity(`Đã duyệt lịch trình "${t.title}"`);
  saveState();
  renderList();
  showToast('Đã duyệt lịch trình. Trạng thái được cập nhật.');
}

/* ---------- 8) Từ chối lịch trình ---------- */
function openReject(id) {
  rejectingId = id;
  $('#rejectReason').value = '';
  $('#fieldReason').classList.remove('invalid');
  openModal('rejectModal');
}

async function confirmReject() {
  const reason = $('#rejectReason').value.trim();
  if (reason.length < 5) {
    $('#fieldReason').classList.add('invalid');
    showToast('Vui lòng nhập lý do từ chối (tối thiểu 5 ký tự).', 'error');
    return;
  }
  const btn = $('#confirmRejectBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Đang gửi...';
  await wait(600);

  const t = STATE.itineraries.find((x) => x.id === rejectingId);
  t.status = 'rejected';
  t.rejectReason = reason;
  pushActivity(`Đã từ chối lịch trình "${t.title}"`);
  saveState();
  btn.disabled = false;
  btn.textContent = 'Xác nhận từ chối';
  closeModal('rejectModal');
  renderList();
  showToast('Đã từ chối lịch trình kèm lý do.', 'info');
}

/* ---------- 9) Khởi động trang ---------- */
async function init() {
  initHeader();
  initModals();

  // Chuyển tab trạng thái
  $('#statusTabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    $$('#statusTabs .tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    currentTab = tab.dataset.status;
    renderList();
  });

  // Uỷ quyền nút Duyệt / Từ chối
  $('#itineraryList').addEventListener('click', (e) => {
    const approveBtn = e.target.closest('[data-approve]');
    const rejectBtn  = e.target.closest('[data-reject]');
    if (approveBtn) approveTrip(approveBtn.dataset.approve, approveBtn);
    if (rejectBtn)  openReject(rejectBtn.dataset.reject);
  });
  $('#confirmRejectBtn').addEventListener('click', confirmReject);

  renderSkeleton();
  await wait(750);
  if (DEMO === 'error') {
    $('#itineraryList').innerHTML = `<div class="error-block"><span>⚠️</span>
      <span><strong>Lỗi kết nối.</strong> Không tải được danh sách lịch trình.</span>
      <button class="btn btn-light" id="retryBtn" type="button">Thử lại</button></div>`;
    $('#retryBtn').addEventListener('click', () => location.reload());
    return;
  }
  if (DEMO === 'empty') STATE.itineraries = [];
  renderList();
  ready = true;
}

/* ---------- 10) Đồng bộ real-time giữa các tab (storage event) ---------- */
let ready = false; // trang đã hoàn tất render lần đầu chưa
function refreshView() {
  renderList();
}
window.addEventListener('storage', (e) => {
  if (e.key !== STORE_KEY) return; // chỉ quan tâm key chung
  STATE = loadState();             // nạp store mới nhất từ tab khác
  syncHeaderProfile();             // cập nhật avatar + menu theo hồ sơ mới
  if (ready) refreshView();        // render lại nội dung (nếu đã sẵn sàng)
});

document.addEventListener('DOMContentLoaded', init);
