/* =====================================================================
   TripWeave AI · guide-itinerary-detail.js  (PHẦN 1/2)
   Màn hình: Chi tiết lịch trình — nhận xét từng ngày, sửa lịch
   trình, duyệt lịch trình + AI gợi ý nhận xét.
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
    { id: 't1', title: 'Hà Nội – Hạ Long – Ninh Bình', days: 5, places: 12, status: 'pending', rejectReason: '', comments: {}, schedule: clone(SCHEDULE) },
    { id: 't2', title: 'Hà Nội – Hạ Long – Ninh Bình', days: 5, places: 12, status: 'pending', rejectReason: '', comments: {}, schedule: clone(SCHEDULE) },
    { id: 't3', title: 'Hà Nội – Hạ Long – Ninh Bình', days: 5, places: 12, status: 'pending', rejectReason: '', comments: {}, schedule: clone(SCHEDULE) },
  ],
  experiences: [],
  addedToCollection: {},
  location: { name: 'Văn Miếu – Quốc Tử Giám', category: 'Văn hóa', address: 'Đống Đa, Hà Nội', price: '30.000đ/người', desc: 'Di tích văn hóa nổi bật của Hà Nội...' },
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

/* ---------- 3) Xác định lịch trình đang xem (?id=t1) ---------- */
const tripId = new URLSearchParams(location.search).get('id') || STATE.itineraries[0]?.id;
let trip = STATE.itineraries.find((t) => t.id === tripId) || STATE.itineraries[0];

function pushActivity(text) {
  STATE.activities.unshift(text);
  STATE.activities = STATE.activities.slice(0, 6);
}

/* ---------- 4) Header + modal dùng chung ---------- */
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
/* ---------- 5) Render tiêu đề + danh sách ngày ---------- */
const BADGE = {
  pending:  ['badge-pending',  'Chờ duyệt'],
  approved: ['badge-approved', 'Đã duyệt'],
  rejected: ['badge-rejected', 'Từ chối'],
};

function renderSkeleton() {
  $('#dayList').innerHTML = Array.from({ length: 3 },
    () => '<div class="skeleton skel-row"></div>').join('');
}

function renderHead() {
  if (!trip) return;
  $('#tripTitle').textContent = `Lịch trình: ${trip.title}`;
  const [cls, label] = BADGE[trip.status];
  const badge = $('#tripBadge');
  badge.className = `badge ${cls}`;
  badge.textContent = label;

  // Nút duyệt chỉ dùng được khi còn chờ duyệt
  const approveBtn = $('#approveTripBtn');
  if (trip.status === 'approved') {
    approveBtn.disabled = true;
    approveBtn.textContent = 'Đã duyệt ✓';
  } else if (trip.status === 'rejected') {
    approveBtn.disabled = true;
    approveBtn.textContent = 'Đã từ chối';
  } else {
    approveBtn.disabled = false;
    approveBtn.textContent = 'Duyệt';
  }
}

function renderDays() {
  if (!trip) {
    $('#dayList').innerHTML = `<div class="empty"><div class="empty-icon">🧭</div>
      <div class="empty-title">Không tìm thấy lịch trình</div>
      <div class="empty-desc">Lịch trình bạn mở không tồn tại hoặc đã bị xoá.</div>
      <a class="btn btn-primary" href="../guide-itinerary-review/guide-itinerary-review.html">Về danh sách review</a></div>`;
    return;
  }
  $('#dayList').innerHTML = trip.schedule.map((d, i) => `
    <article class="card day-card">
      <div class="day-badge">Ngày ${d.day}</div>
      <div class="day-city">${d.city}</div>
      <div class="day-body">
        <p class="day-acts">${d.acts}</p>
        ${trip.comments[i] ? `<div class="day-comment">💬 Nhận xét: ${trip.comments[i]}</div>` : ''}
      </div>
      <button class="btn btn-ghost" data-comment="${i}" type="button">
        ${trip.comments[i] ? 'Đã nhận xét ✓' : 'Nhận xét'}
      </button>
    </article>`).join('');
}

/* ---------- 6) Modal nhận xét + AI gợi ý ---------- */
let commentDay = null; // chỉ số ngày đang nhận xét

function openComment(dayIndex) {
  commentDay = dayIndex;
  const d = trip.schedule[dayIndex];
  $('#commentModalTitle').textContent = `Nhận xét Ngày ${d.day} — ${d.city}`;
  $('#commentInput').value = trip.comments[dayIndex] || '';
  $('#fieldComment').classList.remove('invalid');
  $('#aiZone').innerHTML = '';
  openModal('commentModal');
}

function saveComment() {
  const text = $('#commentInput').value.trim();
  if (!text) {
    $('#fieldComment').classList.add('invalid');
    showToast('Nhận xét không được để trống.', 'error');
    return;
  }
  trip.comments[commentDay] = text;
  pushActivity(`Đã nhận xét Ngày ${trip.schedule[commentDay].day} của "${trip.title}"`);
  saveState();
  closeModal('commentModal');
  renderDays();
  showToast('Đã lưu nhận xét cho ngày này.');
}

/* AI mô phỏng: Input -> Loading -> Result + giải thích -> Accept/Edit/Reject/Regenerate */
const AI_SUGGESTIONS = [
  'Ngày đi hợp lý, tuy nhiên nên bắt đầu lúc 08:30 để tránh giờ cao điểm khi di chuyển.',
  'Cân đối tốt giữa tham quan và ẩm thực; nên thêm 30 phút nghỉ trưa trước giờ trải nghiệm.',
  'Lịch di chuyển thuận tiện; gợi ý thêm một điểm dừng chụp ảnh vào khung giờ 16:00.',
];
let aiIndex = 0;

async function runAiSuggest() {
  const zone = $('#aiZone');
  const d = trip.schedule[commentDay];
  // LOADING
  zone.innerHTML = `<div class="ai-result"><span class="spinner dark" style="display:inline-block;vertical-align:-2px"></span> AI đang phân tích Ngày ${d.day} (${d.city})...</div>`;
  await wait(1200);
  // RESULT + giải thích + điều khiển
  const text = AI_SUGGESTIONS[aiIndex % AI_SUGGESTIONS.length];
  aiIndex++;
  zone.innerHTML = `
    <div class="ai-result">${text}</div>
    <div class="ai-note">Giải thích: AI dựa trên mật độ hoạt động • thời gian di chuyển • cân bằng trải nghiệm trong ngày.</div>
    <div class="ai-actions">
      <button class="btn btn-primary btn-sm" id="aiAccept" type="button">Chấp nhận</button>
      <button class="btn btn-ghost btn-sm" id="aiRegen" type="button">Tạo lại</button>
      <button class="btn btn-light btn-sm" id="aiReject" type="button">Từ chối</button>
    </div>`;
  // Accept: đưa gợi ý vào ô nhập (vẫn có thể sửa tay = Edit)
  $('#aiAccept').addEventListener('click', () => {
    $('#commentInput').value = text;
    $('#fieldComment').classList.remove('invalid');
    zone.innerHTML = '';
    showToast('Đã chấp nhận gợi ý của AI. Bạn có thể sửa lại trước khi lưu.', 'success');
  });
  $('#aiRegen').addEventListener('click', runAiSuggest); // Regenerate
  $('#aiReject').addEventListener('click', () => { zone.innerHTML = ''; }); // Reject
}
/* ---------- 7) Modal sửa lịch trình ---------- */
function openEdit() {
  if (!trip) return;
  $('#editModalBody').innerHTML = trip.schedule.map((d, i) => `
    <div class="edit-day">
      <div class="edit-day-title">Ngày ${d.day}</div>
      <div class="field">
        <label for="editCity${i}">Thành phố</label>
        <input class="input" id="editCity${i}" value="${d.city}" />
      </div>
      <div class="field">
        <label for="editActs${i}">Hoạt động trong ngày</label>
        <input class="input" id="editActs${i}" value="${d.acts}" />
      </div>
    </div>`).join('');
  openModal('editModal');
}

function saveEdit() {
  let ok = true;
  trip.schedule.forEach((d, i) => {
    const city = $('#editCity' + i).value.trim();
    const acts = $('#editActs' + i).value.trim();
    if (!city || !acts) ok = false;
    d.city = city;
    d.acts = acts;
  });
  if (!ok) {
    showToast('Các trường thành phố / hoạt động không được trống.', 'error');
    return;
  }
  pushActivity(`Đã chỉnh sửa lịch trình "${trip.title}"`);
  saveState();
  closeModal('editModal');
  renderDays();
  showToast('Đã lưu thay đổi lịch trình.');
}

/* ---------- 8) Duyệt lịch trình ---------- */
async function approveTrip() {
  if (!trip) {
    showToast('Không tìm thấy lịch trình để duyệt.', 'error');
    return;
  }
  const btn = $('#approveTripBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Đang duyệt...';
  await wait(800);
  trip.status = 'approved';
  pushActivity(`Đã duyệt lịch trình "${trip.title}"`);
  saveState();
  renderHead();
  showToast('Đã duyệt lịch trình. Trạng thái cập nhật trên toàn hệ thống.');
}

/* ---------- 9) Khởi động trang ---------- */
async function init() {
  initHeader();
  initModals();

  $('#dayList').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-comment]');
    if (btn) openComment(Number(btn.dataset.comment));
  });
  $('#saveCommentBtn').addEventListener('click', saveComment);
  $('#aiSuggestBtn').addEventListener('click', runAiSuggest);
  $('#editTripBtn').addEventListener('click', openEdit);
  $('#saveEditBtn').addEventListener('click', saveEdit);
  $('#approveTripBtn').addEventListener('click', approveTrip);

  renderSkeleton();
  await wait(750);
  renderHead();
  renderDays();
  ready = true;
}

/* ---------- 10) Đồng bộ real-time giữa các tab (storage event) ---------- */
let ready = false; // trang đã hoàn tất render lần đầu chưa
function refreshView() {
  // Nạp lại đúng lịch trình đang mở từ store mới rồi render lại
  trip = STATE.itineraries.find((t) => t.id === tripId) || STATE.itineraries[0];
  renderHead();
  renderDays();
}
window.addEventListener('storage', (e) => {
  if (e.key !== STORE_KEY) return; // chỉ quan tâm key chung
  STATE = loadState();             // nạp store mới nhất từ tab khác
  syncHeaderProfile();             // cập nhật avatar + menu theo hồ sơ mới
  if (ready) refreshView();        // render lại nội dung (nếu đã sẵn sàng)
});

document.addEventListener('DOMContentLoaded', init);
