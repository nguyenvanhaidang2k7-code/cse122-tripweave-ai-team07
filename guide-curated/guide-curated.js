/* =====================================================================
   TripWeave AI · guide-curated.js  (PHẦN 1/2)
   Màn hình: Curated — CRUD bộ sưu tập + tìm kiếm + AI tóm tắt sở thích (Preference Summarizer)
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
    { id: 'c1', name: 'Ẩm thực Hà Nội',       tag: 'Ẩm thực',  desc: 'Món ngon địa phương',     places: 6, archived: false,
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&auto=format&fit=crop' },
    { id: 'c2', name: 'Điểm đến cuối tuần',   tag: 'Điểm đến', desc: 'Lịch trình ngắn',         places: 6, archived: false,
      image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&auto=format&fit=crop' },
    { id: 'c3', name: 'Thiên nhiên miền Bắc', tag: 'Thiên nhiên', desc: 'Cảnh quan & trải nghiệm', places: 6, archived: false,
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&auto=format&fit=crop' },
  ],
  itineraries: [],
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

/* Ghi nhật ký hoạt động (hiển thị ở Trang chủ) */
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

/* ---------- 4) Đóng / mở modal (dùng chung) ---------- */
function openModal(id)  { $('#' + id).classList.add('open'); }
function closeModal(id) { $('#' + id).classList.remove('open'); }
function initModals() {
  // Nút ✕, nút Hủy và click ra ngoài nền đều đóng modal
  document.addEventListener('click', (e) => {
    const closer = e.target.closest('[data-close]');
    if (closer) closeModal(closer.dataset.close);
    if (e.target.classList.contains('modal-backdrop')) e.target.classList.remove('open');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') $$('.modal-backdrop.open').forEach((m) => m.classList.remove('open'));
  });
}
/* ---------- 5) Trạng thái cục bộ của màn hình ---------- */
let currentFilter = 'active';   // 'active' | 'archived'
let currentQuery  = '';         // từ khoá tìm kiếm
let editingId     = null;       // id bộ sưu tập đang sửa (null = tạo mới)

/* ---------- 6) Render danh sách bộ sưu tập ---------- */
function renderSkeleton() {
  $('#collectionList').innerHTML = Array.from({ length: 3 },
    () => '<div class="skeleton skel-row"></div>').join('');
}

function renderList() {
  const archived = currentFilter === 'archived';
  let list = STATE.collections.filter((c) => c.archived === archived);

  // Bộ lọc tìm kiếm theo tên hoặc danh mục
  if (currentQuery) {
    const q = currentQuery.toLowerCase();
    list = list.filter((c) =>
      c.name.toLowerCase().includes(q) || c.tag.toLowerCase().includes(q));
  }

  // Trạng thái RỖNG
  if (!list.length) {
    $('#collectionList').innerHTML = currentQuery
      ? `<div class="empty"><div class="empty-icon">🔍</div>
           <div class="empty-title">Không tìm thấy bộ sưu tập phù hợp</div>
           <div class="empty-desc">Thử từ khoá khác cho "${currentQuery}".</div></div>`
      : `<div class="empty"><div class="empty-icon">📁</div>
           <div class="empty-title">${archived ? 'Chưa có bộ sưu tập nào được lưu trữ' : 'Chưa có bộ sưu tập nào'}</div>
           <div class="empty-desc">${archived ? 'Các bộ sưu tập lưu trữ sẽ xuất hiện tại đây.' : 'Bắt đầu bằng cách tạo bộ sưu tập đầu tiên của bạn.'}</div>
           ${archived ? '' : '<button class="btn btn-primary" id="emptyCreateBtn" type="button">+ Tạo bộ sưu tập</button>'}</div>`;
    const emptyBtn = $('#emptyCreateBtn');
    if (emptyBtn) emptyBtn.addEventListener('click', () => openForm(null));
    return;
  }

  // Trạng thái BÌNH THƯỜNG
  $('#collectionList').innerHTML = list.map((c) => `
    <article class="card row-card">
      <div class="thumb thumb-md">
        <img src="${c.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&auto=format&fit=crop'}" alt="${c.name}" loading="lazy" />
      </div>
      <div class="row-info">
        <h3 class="row-title">${c.name}</h3>
        <p class="row-meta">${c.desc} • ${c.places} địa điểm</p>
      </div>
      <div class="row-actions">
        <button class="btn btn-ghost" data-edit="${c.id}" type="button">Sửa</button>
        <button class="btn btn-primary" data-view="${c.id}" type="button">Xem</button>
      </div>
    </article>`).join('');
}

/* ---------- 7) Modal tạo / sửa ---------- */
function clearFormErrors() {
  ['fieldName', 'fieldDesc', 'fieldPlaces'].forEach((id) =>
    $('#' + id).classList.remove('invalid'));
}

function openForm(id) {
  editingId = id;
  clearFormErrors();
  $('#aiPrefZone').innerHTML = '';   // xoá kết quả AI của lần mở trước
  $('#aiPrefBtn').disabled = false;  // reset nút AI nếu modal bị đóng giữa chừng
  aiPrefBusy = false;
  if (id) {
    const c = STATE.collections.find((x) => x.id === id);
    $('#formModalTitle').textContent = 'Sửa bộ sưu tập';
    $('#inpName').value = c.name;
    $('#inpTag').value = c.tag;
    $('#inpPlaces').value = c.places;
    $('#inpDesc').value = c.desc;
    $('#inpImage').value = c.image || '';
    $('#archiveBtn').hidden = false;
    $('#archiveBtn').textContent = c.archived ? 'Khôi phục' : 'Lưu trữ';
  } else {
    $('#formModalTitle').textContent = 'Tạo bộ sưu tập';
    $('#inpName').value = '';
    $('#inpTag').value = 'Ẩm thực';
    $('#inpPlaces').value = 6;
    $('#inpDesc').value = '';
    $('#inpImage').value = '';
    $('#archiveBtn').hidden = true;
  }
  openModal('formModal');
}

/* Kiểm tra dữ liệu form (validation) */
function validateForm() {
  const nameOk   = $('#inpName').value.trim().length >= 3;
  const descOk   = $('#inpDesc').value.trim().length >= 10;
  const places   = Number($('#inpPlaces').value);
  const placesOk = Number.isFinite(places) && places >= 1 && places <= 50;
  $('#fieldName').classList.toggle('invalid', !nameOk);
  $('#fieldDesc').classList.toggle('invalid', !descOk);
  $('#fieldPlaces').classList.toggle('invalid', !placesOk);
  return nameOk && descOk && placesOk;
}

/* Lưu (tạo mới hoặc cập nhật) */
async function saveCollection() {
  if (!validateForm()) {
    showToast('Vui lòng kiểm tra lại các trường bị lỗi.', 'error');
    return;
  }
  const btn = $('#saveCollectionBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Đang lưu...';
  await wait(700); // giả lập gọi API

  const data = {
    name: $('#inpName').value.trim(),
    tag: $('#inpTag').value,
    places: Number($('#inpPlaces').value),
    desc: $('#inpDesc').value.trim(),
    image: $('#inpImage').value.trim() || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&auto=format&fit=crop',
  };
  if (editingId) {
    Object.assign(STATE.collections.find((c) => c.id === editingId), data);
    pushActivity(`Đã cập nhật bộ sưu tập "${data.name}"`);
    showToast('Đã cập nhật bộ sưu tập.');
  } else {
    STATE.collections.push({ id: 'c' + Date.now(), archived: false, ...data });
    pushActivity(`Đã tạo bộ sưu tập "${data.name}"`);
    showToast('Đã tạo bộ sưu tập mới.');
  }
  saveState();
  btn.disabled = false;
  btn.textContent = 'Lưu bộ sưu tập';
  closeModal('formModal');
  renderList();
}

/* Lưu trữ / khôi phục */
function toggleArchive() {
  const c = STATE.collections.find((x) => x.id === editingId);
  c.archived = !c.archived;
  pushActivity(c.archived ? `Đã lưu trữ "${c.name}"` : `Đã khôi phục "${c.name}"`);
  saveState();
  closeModal('formModal');
  renderList();
  showToast(c.archived ? 'Đã lưu trữ bộ sưu tập.' : 'Đã khôi phục bộ sưu tập.', 'info');
}

/* ---------- 8) Modal xem chi tiết ---------- */
function openView(id) {
  const c = STATE.collections.find((x) => x.id === id);
  $('#viewModalTitle').textContent = c.name;
  $('#viewModalBody').innerHTML = `
    <p class="view-line"><strong>Danh mục:</strong> ${c.tag}</p>
    <p class="view-line"><strong>Mô tả:</strong> ${c.desc}</p>
    <p class="view-line"><strong>Số địa điểm:</strong> ${c.places}</p>
    <p class="view-line"><strong>Trạng thái:</strong> ${c.archived ? 'Đã lưu trữ' : 'Đang hoạt động'}</p>
    <div class="thumb" style="width:100%;height:160px"><img src="${c.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&auto=format&fit=crop'}" alt="${c.name}" loading="lazy" /></div>`;
  openModal('viewModal');
}
/* ---------- 9) AI mô phỏng: Preference Summarizer (tóm tắt sở thích) ----------
   Giúp hướng dẫn viên nắm bắt nhanh sở thích của khách hàng/chủ đề.
   Quy trình chuẩn 5 bước:
   B1 Input    -> tên bộ sưu tập (#inpName) hoặc mô tả hiện tại (#inpDesc)
   B2 Loading  -> spinner + "AI đang tổng hợp và phân tích sở thích..." (~1.1s)
   B3 Result   -> đoạn tóm tắt sở thích ngắn gọn, súc tích
   B4 Explain  -> dòng ghi chú lý do ngay bên dưới kết quả
   B5 Controls -> Dùng gợi ý (Accept) / Chỉnh sửa (Edit) / Tạo lại (Regenerate) / Bỏ qua (Reject) */
const AI_PREFS = [
  'Khách hàng ưa chuộng nhịp độ chậm, tập trung vào trải nghiệm văn hóa bản địa lâu năm và ẩm thực truyền thống ít thương mại hóa.',
  'Nhóm khách hàng thích khám phá điểm đến mới lạ vào dịp cuối tuần, ưu tiên lộ trình ngắn gọn, tiện di chuyển và có không gian chụp ảnh đẹp.',
  'Định hướng không gian thiên nhiên hoang dã, kết hợp các hoạt động trekking nhẹ nhàng và tìm hiểu hệ sinh thái địa phương.',
];
const AI_PREF_NOTE = 'Giải thích: Tổng hợp dựa trên hành vi, từ khóa chủ đề và nhóm khách hàng mục tiêu.';
let aiPrefIndex = 0;     // xoay vòng các mẫu để "Tạo lại" luôn cho ra tóm tắt khác
let aiPrefBusy  = false; // chặn bấm liên tiếp khi đang ở trạng thái LOADING

/* Đọc nội dung khung kết quả: div khi đang xem, textarea khi đang chỉnh sửa */
function readAiPrefText() {
  const box = $('#aiPrefResult');
  if (!box) return '';
  return (box.tagName === 'TEXTAREA' ? box.value : box.textContent).trim();
}

/* EDIT: bật / tắt chế độ chỉnh sửa trực tiếp ngay trên khung kết quả */
function toggleAiPrefEdit(btn) {
  const box = $('#aiPrefResult');
  if (!box) return;
  const value = readAiPrefText();
  if (box.tagName !== 'TEXTAREA') {
    // Đổi khung đọc thành ô textarea rồi focus cho hướng dẫn viên sửa tay
    const ta = document.createElement('textarea');
    ta.className = 'ai-result ai-edit';
    ta.id = 'aiPrefResult';
    ta.rows = 3;
    ta.value = value;
    box.replaceWith(ta);
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);
    btn.textContent = 'Xong';
  } else {
    // Kết thúc chỉnh sửa: trả về khung đọc, giữ nguyên nội dung đã sửa
    const div = document.createElement('div');
    div.className = 'ai-result';
    div.id = 'aiPrefResult';
    div.textContent = value;
    box.replaceWith(div);
    btn.textContent = 'Chỉnh sửa';
  }
}

async function runAiPreference() {
  if (aiPrefBusy) return;            // đang xử lý -> bỏ qua lượt bấm trùng
  aiPrefBusy = true;

  const zone    = $('#aiPrefZone');
  const trigger = $('#aiPrefBtn');
  trigger.disabled = true;

  /* B1 — INPUT: ưu tiên tên bộ sưu tập, kế đến mô tả hiện tại, cuối cùng là danh mục */
  const topic = $('#inpName').value.trim() || $('#inpDesc').value.trim() || $('#inpTag').value;

  /* B2 — LOADING: spinner + câu thông báo trạng thái (giả lập gọi AI 1.1s) */
  zone.innerHTML = `
    <div class="ai-result ai-loading">
      <span class="spinner dark" role="status" aria-label="AI đang xử lý"></span>
      <span>AI đang tổng hợp và phân tích sở thích...</span>
    </div>
    <div class="ai-note">Dữ liệu đầu vào: "${topic}"</div>`;
  await wait(1100);

  /* B3 — RESULT: lấy mẫu tóm tắt sở thích kế tiếp */
  const text = AI_PREFS[aiPrefIndex % AI_PREFS.length];
  aiPrefIndex++;

  /* B4 — EXPLAIN (lý do) + B5 — CONTROLS (bộ nút tương tác) */
  zone.innerHTML = `
    <div class="ai-result" id="aiPrefResult">${text}</div>
    <div class="ai-note">${AI_PREF_NOTE}</div>
    <div class="ai-actions">
      <button class="btn btn-primary btn-sm" id="aiPrefAccept" type="button">Dùng gợi ý</button>
      <button class="btn btn-ghost btn-sm" id="aiPrefEdit" type="button">Chỉnh sửa</button>
      <button class="btn btn-ghost btn-sm" id="aiPrefRegen" type="button">Tạo lại</button>
      <button class="btn btn-light btn-sm" id="aiPrefReject" type="button">Bỏ qua</button>
    </div>`;

  aiPrefBusy = false;                // hết LOADING -> cho phép bấm "Tạo lại"
  trigger.disabled = false;

  /* ACCEPT: đưa kết quả tóm tắt vào ô mô tả (#inpDesc) và ẩn panel */
  $('#aiPrefAccept').addEventListener('click', () => {
    const finalText = readAiPrefText();
    if (!finalText) return showToast('Nội dung tóm tắt đang trống, hãy tạo lại.', 'error');
    $('#inpDesc').value = finalText;
    $('#fieldDesc').classList.remove('invalid');
    zone.innerHTML = '';
    showToast('Đã áp dụng tóm tắt sở thích từ AI.', 'success');
  });

  /* EDIT: focus chỉnh sửa trực tiếp nội dung tóm tắt */
  $('#aiPrefEdit').addEventListener('click', (e) => toggleAiPrefEdit(e.currentTarget));

  /* REGENERATE: chạy lại hiệu ứng loading để lấy mẫu tóm tắt khác */
  $('#aiPrefRegen').addEventListener('click', runAiPreference);

  /* REJECT: đóng / làm trống khung kết quả AI */
  $('#aiPrefReject').addEventListener('click', () => { zone.innerHTML = ''; });
}

/* ---------- 10) Khởi động trang ---------- */
async function init() {
  initHeader();
  initModals();

  // Tìm kiếm lọc trực tiếp khi gõ
  $('#collectionSearch').addEventListener('input', (e) => {
    currentQuery = e.target.value.trim();
    renderList();
  });

  // Chuyển tab bộ lọc trạng thái
  $('#statusChips').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    $$('#statusChips .chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    currentFilter = chip.dataset.filter;
    renderList();
  });

  // Nút tạo mới + lưu + lưu trữ + AI tóm tắt sở thích
  $('#createBtn').addEventListener('click', () => openForm(null));
  $('#saveCollectionBtn').addEventListener('click', saveCollection);
  $('#archiveBtn').addEventListener('click', toggleArchive);
  $('#aiPrefBtn').addEventListener('click', runAiPreference);

  // Uỷ quyền sự kiện cho các nút Sửa / Xem trong danh sách
  $('#collectionList').addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit]');
    const viewBtn = e.target.closest('[data-view]');
    if (editBtn) openForm(editBtn.dataset.edit);
    if (viewBtn) openView(viewBtn.dataset.view);
  });

  // Trạng thái LOADING rồi mới render
  renderSkeleton();
  await wait(750);
  if (DEMO === 'error') {
    $('#collectionList').innerHTML = `<div class="error-block"><span>⚠️</span>
      <span><strong>Lỗi kết nối.</strong> Không tải được danh sách bộ sưu tập.</span>
      <button class="btn btn-light" id="retryBtn" type="button">Thử lại</button></div>`;
    $('#retryBtn').addEventListener('click', () => location.reload());
    return;
  }
  if (DEMO === 'empty') STATE.collections = [];
  renderList();
}

document.addEventListener('DOMContentLoaded', init);
