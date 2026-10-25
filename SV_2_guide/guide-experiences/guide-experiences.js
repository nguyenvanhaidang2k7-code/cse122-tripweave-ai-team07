/* =====================================================================
   TripWeave AI · guide-experiences.js  (PHẦN 1/2)
   Màn hình: Trải nghiệm — lọc danh mục, thêm vào bộ sưu tập.
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
  experiences: [
    { id: 'e1', title: 'Tham quan làng cổ',  cat: 'Văn hóa',     desc: 'Phù hợp nhóm khách yêu thích trải nghiệm địa phương.' },
    { id: 'e2', title: 'Ăn tối trên thuyền', cat: 'Ẩm thực',     desc: 'Phù hợp nhóm khách yêu thích trải nghiệm địa phương.' },
    { id: 'e3', title: 'Trekking nhẹ',       cat: 'Thiên nhiên', desc: 'Phù hợp nhóm khách yêu thích trải nghiệm địa phương.' },
  ],
  addedToCollection: {}, // expId -> collectionId
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
/* ---------- 4) Trạng thái màn hình ---------- */
let currentCat = 'all';  // danh mục đang lọc
let addingExpId = null;  // trải nghiệm đang mở modal thêm

/* ---------- 5) Render lưới trải nghiệm ---------- */
function renderSkeleton() {
  $('#expGrid').innerHTML = Array.from({ length: 3 },
    () => '<div class="skeleton skel-card"></div>').join('');
}

function renderGrid() {
  let list = STATE.experiences;
  if (currentCat !== 'all') list = list.filter((e) => e.cat === currentCat);

  // Trạng thái RỖNG
  if (!list.length) {
    $('#expGrid').innerHTML = `<div class="empty"><div class="empty-icon">🌿</div>
      <div class="empty-title">Chưa có trải nghiệm nào trong danh mục này</div>
      <div class="empty-desc">Hãy thử danh mục khác hoặc quay lại sau.</div></div>`;
    return;
  }

  $('#expGrid').innerHTML = list.map((e) => {
    const colId = STATE.addedToCollection[e.id];
    const col = colId ? STATE.collections.find((c) => c.id === colId) : null;
    return `
    <article class="card exp-card">
      <div class="exp-media">${e.title}</div>
      <h3>${e.title}</h3>
      <span class="tag">${e.cat}</span>
      <p class="exp-desc">${e.desc}</p>
      ${col ? `<span class="exp-added">✓ Đã thêm vào: ${col.name}</span>` : ''}
      <button class="btn btn-primary btn-block" data-add="${e.id}" type="button" ${col ? 'disabled' : ''}>
        ${col ? 'Đã thêm vào bộ sưu tập ✓' : 'Thêm vào bộ sưu tập'}
      </button>
    </article>`;
  }).join('');
}

/* ---------- 6) Modal thêm vào bộ sưu tập ---------- */
function openAdd(expId) {
  addingExpId = expId;
  const exp = STATE.experiences.find((e) => e.id === expId);
  const activeCols = STATE.collections.filter((c) => !c.archived);

  $('#addModalTitle').textContent = `Thêm "${exp.title}" vào bộ sưu tập`;
  const select = $('#collectionSelect');
  if (!activeCols.length) {
    select.innerHTML = '';
    $('#fieldCollection').classList.add('invalid');
  } else {
    $('#fieldCollection').classList.remove('invalid');
    select.innerHTML = activeCols
      .map((c) => `<option value="${c.id}">${c.name} (${c.tag})</option>`)
      .join('');
  }
  openModal('addModal');
}

async function confirmAdd() {
  const colId = $('#collectionSelect').value;
  if (!colId) {
    showToast('Chưa có bộ sưu tập nào đang hoạt động để thêm.', 'error');
    return;
  }
  const btn = $('#confirmAddBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Đang thêm...';
  await wait(600);

  const col = STATE.collections.find((c) => c.id === colId);
  const exp = STATE.experiences.find((e) => e.id === addingExpId);
  STATE.addedToCollection[exp.id] = colId;
  col.places += 1; // bộ sưu tập tăng thêm 1 địa điểm
  pushActivity(`Thêm 1 trải nghiệm vào "${col.name}"`);
  saveState();

  btn.disabled = false;
  btn.textContent = 'Thêm vào bộ sưu tập';
  closeModal('addModal');
  renderGrid();
  showToast(`Đã thêm "${exp.title}" vào "${col.name}".`);
}

/* ---------- 7) Khởi động trang ---------- */
async function init() {
  initHeader();
  initModals();

  // Lọc theo danh mục
  $('#catChips').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    $$('#catChips .chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    currentCat = chip.dataset.cat;
    renderGrid();
  });

  // Uỷ quyền nút thêm
  $('#expGrid').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (btn && !btn.disabled) openAdd(btn.dataset.add);
  });
  $('#confirmAddBtn').addEventListener('click', confirmAdd);

  renderSkeleton();
  await wait(750);
  if (DEMO === 'error') {
    $('#expGrid').innerHTML = `<div class="error-block"><span>⚠️</span>
      <span><strong>Lỗi kết nối.</strong> Không tải được danh sách trải nghiệm.</span>
      <button class="btn btn-light" id="retryBtn" type="button">Thử lại</button></div>`;
    $('#retryBtn').addEventListener('click', () => location.reload());
    return;
  }
  if (DEMO === 'empty') STATE.experiences = [];
  renderGrid();
  ready = true;
}

/* ---------- 10) Đồng bộ real-time giữa các tab (storage event) ---------- */
let ready = false; // trang đã hoàn tất render lần đầu chưa
function refreshView() {
  renderGrid();
}
window.addEventListener('storage', (e) => {
  if (e.key !== STORE_KEY) return; // chỉ quan tâm key chung
  STATE = loadState();             // nạp store mới nhất từ tab khác
  syncHeaderProfile();             // cập nhật avatar + menu theo hồ sơ mới
  if (ready) refreshView();        // render lại nội dung (nếu đã sẵn sàng)
});

document.addEventListener('DOMContentLoaded', init);
