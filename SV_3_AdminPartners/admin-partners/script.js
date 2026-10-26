/* =====================================================
   TRANG QUẢN TRỊ ĐỐI TÁC ĐỊA PHƯƠNG - TripWeave AI
   1) Mảng dữ liệu giả lập (mock data) đầy đủ ngay trong file.
   2) renderPartners() tự động đổ dữ liệu ra màn hình khi
      trang tải xong (DOMContentLoaded) -> không bao giờ trống.
   3) Chip lọc (Tất cả / Đang hoạt động / Chờ duyệt / Bị khóa)
      + ô tìm kiếm lọc trực tiếp trên mảng dữ liệu thật.
   4) Thêm đối tác, duyệt hồ sơ, khóa/mở khóa, xóa (có xác nhận).
   ===================================================== */
const $ = (s) => document.querySelector(s);
const KHO = 'tw_partners';

// ---------- 1) MẢNG DỮ LIỆU GIẢ LẬP (MOCK DATA) ----------
const DU_LIEU_GOC = [
  { id: 'p1', ten: 'Homestay Mai Châu Valley', email: 'maichauvalley@gmail.com', sdt: '0912 345 678', khuVuc: 'Hòa Bình', loai: 'Lưu trú', soTraiNghiem: 5, ngayThamGia: '03/2025', trangThai: 'hoatdong' },
  { id: 'p2', ten: 'Du thuyền Hạ Long Premium', email: 'halongpremium@gmail.com', sdt: '0913 456 789', khuVuc: 'Quảng Ninh', loai: 'Du thuyền', soTraiNghiem: 8, ngayThamGia: '05/2025', trangThai: 'hoatdong' },
  { id: 'p3', ten: 'Công ty Du lịch Xanh Việt', email: 'xanhviet.travel@gmail.com', sdt: '0914 567 890', khuVuc: 'Hà Nội', loai: 'Lữ hành', soTraiNghiem: 12, ngayThamGia: '07/2025', trangThai: 'hoatdong' },
  { id: 'p4', ten: 'Làng nghề gốm Bát Tràng', email: 'gombattrang@gmail.com', sdt: '0918 901 456', khuVuc: 'Hà Nội', loai: 'Tour trải nghiệm', soTraiNghiem: 3, ngayThamGia: '02/2026', trangThai: 'hoatdong' },
  { id: 'p5', ten: 'Sapa Eco Lodge', email: 'sapaecolodge@gmail.com', sdt: '0915 678 912', khuVuc: 'Lào Cai', loai: 'Lưu trú', soTraiNghiem: 4, ngayThamGia: '11/2026', trangThai: 'choduyet' },
  { id: 'p6', ten: 'Bếp Cô Lan - Ẩm thực Huế', email: 'lanhue.food@gmail.com', sdt: '0916 789 234', khuVuc: 'Thừa Thiên Huế', loai: 'Ẩm thực', soTraiNghiem: 0, ngayThamGia: '12/2026', trangThai: 'choduyet' },
  { id: 'p7', ten: 'Vũng Tàu Sea Tour', email: 'vungtauseatour@gmail.com', sdt: '0917 890 345', khuVuc: 'Bà Rịa - Vũng Tàu', loai: 'Tour trải nghiệm', soTraiNghiem: 3, ngayThamGia: '09/2025', trangThai: 'khoa' }
];

// Nhãn + màu huy hiệu theo trạng thái đối tác
const TRANG_THAI = {
  hoatdong: { label: 'Đang hoạt động', mau: 'success' },
  choduyet: { label: 'Chờ duyệt', mau: 'warning' },
  khoa: { label: 'Bị khóa', mau: 'danger' }
};

// ---------- TRẠNG THÁI TOÀN CỤC ----------
let ds = [];                                    // Danh sách đối tác đang hiển thị
let boLoc = { tuKhoa: '', trangThai: 'tatca' }; // Từ khóa tìm + chip lọc
let dangXemId = null;                           // Đối tác đang mở ở modal chi tiết
let hanhDongXacNhan = null;                     // Hàm chạy khi bấm "Đồng ý" ở modal xác nhận

// ---------- TIỆN ÍCH CHUNG ----------
function toast(thongDiep, loai = 'success') {
  const hop = document.createElement('div');
  hop.className = 'toast ' + loai;
  hop.textContent = thongDiep;
  $('#toast-box').appendChild(hop);
  setTimeout(() => hop.remove(), 2600);
}
function moModal(id) { document.getElementById(id).classList.add('open'); }
function dongModal(id) { document.getElementById(id).classList.remove('open'); }
document.addEventListener('click', (e) => { // Bấm ra ngoài thì đóng modal
  if (e.target.classList.contains('modal-overlay')) dongModal(e.target.id);
});

// LocalStorage "an toàn": trình duyệt có thể chặn (file://, private mode)
function docLS() { try { return localStorage.getItem(KHO); } catch (e) { return null; } }
function luuLS() { try { localStorage.setItem(KHO, JSON.stringify(ds)); } catch (e) { /* bỏ qua */ } }

// CHUẨN HÓA 1 bản ghi đối tác: thiếu trường nào điền mặc định trường đó
// -> dữ liệu cũ/hỏng trong LocalStorage không thể làm crash hàm render.
function chuanHoa(p) {
  if (!p || typeof p !== 'object') return null;
  return {
    id: String(p.id || 'p' + Math.random().toString(36).slice(2, 9)),
    ten: String(p.ten || p.name || 'Đối tác chưa đặt tên'),
    email: String(p.email || 'khong-ro@example.com'),
    sdt: String(p.sdt || '(chưa cập nhật)'),
    khuVuc: String(p.khuVuc || '(chưa xác định)'),
    loai: String(p.loai || 'Khác'),
    soTraiNghiem: Number(p.soTraiNghiem) >= 0 ? Number(p.soTraiNghiem) : 0,
    ngayThamGia: String(p.ngayThamGia || '12/2026'),
    trangThai: TRANG_THAI[p.trangThai] ? p.trangThai : 'choduyet'
  };
}

// NẠP DỮ LIỆU: ưu tiên LocalStorage, LUÔN trả về mảng hợp lệ.
// Trả về false nếu phải khôi phục dữ liệu mẫu (để hiện toast cảnh báo).
function napDuLieu() {
  try {
    const raw = docLS();
    if (!raw) { ds = DU_LIEU_GOC.map((o) => ({ ...o })); luuLS(); return true; }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('Sai định dạng');
    ds = parsed.map(chuanHoa).filter(Boolean); // chuẩn hóa + loại bản ghi rác
    if (!ds.length) throw new Error('Danh sách rỗng');
    luuLS();
    return true;
  } catch (e) {
    ds = DU_LIEU_GOC.map((o) => ({ ...o })); // tự khôi phục bộ mẫu
    luuLS();
    return false;
  }
}
// Nút "Khôi phục dữ liệu mẫu" trong trạng thái lỗi
function khoiPhucDuLieu() {
  try { localStorage.removeItem(KHO); } catch (e) { /* bỏ qua */ }
  napDuLieu();
  renderPartners();
  toast('Đã khôi phục dữ liệu mẫu.', 'info');
}

// Chữ cái đầu để vẽ avatar (Homestay Mai Châu -> "H")
const chuCaiDau = (ten) => String(ten || '?').trim().charAt(0).toUpperCase();

// ---------- 2) HÀM RENDER DANH SÁCH ĐỐI TÁC RA MÀN HÌNH ----------
function renderPartners(loading = false) {
  const box = $('#danh-sach');
  if (!box) return;
  // TRẠNG THÁI LOADING: 3 khối skeleton
  if (loading) { box.innerHTML = '<div class="skeleton"></div>'.repeat(3); return; }
  // LỌC THEO CHIP TRẠNG THÁI + TỪ KHÓA TÌM KIẾM (trên mảng ds thật)
  let ketQua = ds.slice();
  if (boLoc.trangThai !== 'tatca') ketQua = ketQua.filter((p) => p.trangThai === boLoc.trangThai);
  if (boLoc.tuKhoa) {
    const k = boLoc.tuKhoa.toLowerCase();
    ketQua = ketQua.filter((p) =>
      p.ten.toLowerCase().includes(k) ||
      p.email.toLowerCase().includes(k) ||
      p.khuVuc.toLowerCase().includes(k));
  }
  try {
    if (!ketQua.length) { // TRẠNG THÁI RỖNG
      box.innerHTML = `<div class="card empty-state"><span class="emoji">🏪</span>
        <p>Không có đối tác nào khớp bộ lọc.</p>
        <button class="btn btn-secondary" id="btn-xoa-loc" type="button">Xóa bộ lọc</button></div>`;
      $('#btn-xoa-loc').onclick = () => {
        boLoc = { tuKhoa: '', trangThai: 'tatca' };
        $('#search-input').value = '';
        ganChip('tatca');
        renderPartners(true);
        setTimeout(() => renderPartners(), 400);
      };
      return;
    }
    // TRẠNG THÁI THÀNH CÔNG: avatar chữ cái + tên + thông tin + huy hiệu + nút thao tác
    box.innerHTML = '<div class="list">' + ketQua.map((p) => {
      const tt = TRANG_THAI[p.trangThai];
      return `
      <div class="card row-card">
        <div class="avatar-letter">${chuCaiDau(p.ten)}</div>
        <div>
          <p class="row-title">${p.ten}</p>
          <p class="row-sub">${p.khuVuc} • ${p.loai} • ${p.soTraiNghiem} trải nghiệm • ${p.email}</p>
        </div>
        <div class="spacer"></div>
        <span class="badge ${tt.mau}">${tt.label}</span>
        <div class="row-actions">
          <button class="btn btn-secondary" data-xem="${p.id}" type="button">Chi tiết</button>
          ${p.trangThai === 'choduyet' ? `<button class="btn btn-primary" data-duyet="${p.id}" type="button">Duyệt</button>` : ''}
          <button class="btn ${p.trangThai === 'khoa' ? 'btn-primary' : 'btn-danger'}" data-khoa="${p.id}" type="button">
            ${p.trangThai === 'khoa' ? 'Mở khóa' : 'Khóa'}
          </button>
        </div>
      </div>`;
    }).join('') + '</div>';
  } catch (err) {
    // TRẠNG THÁI LỖI: không bao giờ để kẹt skeleton
    console.error('Lỗi render danh sách đối tác:', err);
    box.innerHTML = `<div class="card error-state"><span class="emoji">⚠️</span>
      <p>Không thể hiển thị danh sách đối tác.</p>
      <button class="btn btn-primary" id="btn-khoi-phuc" type="button">Khôi phục dữ liệu mẫu</button></div>`;
    $('#btn-khoi-phuc').onclick = khoiPhucDuLieu;
  }
}

// ---------- 3) TÌM KIẾM (debounce) + CHIP LỌC ----------
let henGioTim = null;
$('#search-input').addEventListener('input', (e) => {
  boLoc.tuKhoa = e.target.value.trim();
  clearTimeout(henGioTim);
  henGioTim = setTimeout(() => {
    renderPartners(true);
    setTimeout(() => renderPartners(), 400);
  }, 300);
});
function ganChip(giaTri) {
  boLoc.trangThai = giaTri;
  document.querySelectorAll('#chip-row .chip')
    .forEach((c) => c.classList.toggle('active', c.dataset.loc === giaTri));
}
$('#chip-row').addEventListener('click', (e) => {
  if (!e.target.classList.contains('chip')) return;
  ganChip(e.target.dataset.loc);
  renderPartners(true);
  setTimeout(() => renderPartners(), 400);
});
// ---------- BẤM NÚT TRONG DANH SÁCH: chi tiết / duyệt / khóa ----------
$('#danh-sach').addEventListener('click', (e) => {
  const nutXem = e.target.closest('[data-xem]');
  const nutDuyet = e.target.closest('[data-duyet]');
  const nutKhoa = e.target.closest('[data-khoa]');
  if (nutXem) moChiTiet(nutXem.dataset.xem);
  if (nutDuyet) duyetDoiTac(nutDuyet.dataset.duyet);
  if (nutKhoa) khoaMoKhoa(nutKhoa.dataset.khoa);
});

// DUYỆT đối tác đang chờ (UPDATE) - luôn xác nhận trước
function duyetDoiTac(id) {
  const p = ds.find((x) => x.id === id);
  if (!p || p.trangThai !== 'choduyet') return;
  moXacNhan('Duyệt hồ sơ đối tác "' + p.ten + '"? Sau khi duyệt, đối tác có thể đăng trải nghiệm lên hệ thống.', () => {
    p.trangThai = 'hoatdong';
    luuLS(); renderPartners();
    toast('Đã duyệt đối tác ' + p.ten + '.', 'success');
  });
}
// KHÓA / MỞ KHÓA đối tác (UPDATE) - luôn xác nhận trước
function khoaMoKhoa(id) {
  const p = ds.find((x) => x.id === id);
  if (!p) return;
  const laKhoa = p.trangThai !== 'khoa';
  moXacNhan((laKhoa ? 'Khóa đối tác "' : 'Mở khóa đối tác "') + p.ten + '"?', () => {
    p.trangThai = laKhoa ? 'khoa' : 'hoatdong';
    luuLS(); renderPartners();
    toast(laKhoa ? 'Đã khóa ' + p.ten + '.' : 'Đã mở khóa ' + p.ten + '.', 'success');
  });
}

// ---------- MODAL CHI TIẾT ĐỐI TÁC (READ + duyệt/khóa/xóa) ----------
function moChiTiet(id) {
  dangXemId = id;
  const p = ds.find((x) => x.id === id);
  if (!p) return;
  const tt = TRANG_THAI[p.trangThai];
  $('#ct-ten').textContent = p.ten;
  $('#ct-email').textContent = p.email;
  $('#ct-sdt').textContent = p.sdt;
  $('#ct-khu-vuc').textContent = p.khuVuc;
  $('#ct-loai').textContent = p.loai;
  $('#ct-so-tn').textContent = p.soTraiNghiem + ' trải nghiệm';
  $('#ct-ngay').textContent = p.ngayThamGia;
  $('#ct-trang-thai').innerHTML = `<span class="badge ${tt.mau}">${tt.label}</span>`;
  $('#ct-duyet').hidden = p.trangThai !== 'choduyet'; // chỉ hiện khi đang chờ duyệt
  $('#ct-khoa').textContent = p.trangThai === 'khoa' ? 'Mở khóa' : 'Khóa đối tác';
  moModal('modal-chi-tiet');
}
$('#ct-dong').onclick = () => dongModal('modal-chi-tiet');
$('#ct-duyet').onclick = () => { dongModal('modal-chi-tiet'); duyetDoiTac(dangXemId); };
$('#ct-khoa').onclick = () => { dongModal('modal-chi-tiet'); khoaMoKhoa(dangXemId); };
$('#ct-xoa').onclick = () => { // DELETE - luôn xác nhận
  const p = ds.find((x) => x.id === dangXemId);
  if (!p) return;
  moXacNhan('Xóa vĩnh viễn đối tác "' + p.ten + '"? Thao tác này không thể hoàn tác.', () => {
    ds = ds.filter((x) => x.id !== dangXemId);
    luuLS(); dongModal('modal-chi-tiet'); renderPartners();
    toast('Đã xóa đối tác.', 'success');
  });
};
// ---------- MODAL THÊM ĐỐI TÁC (CREATE) ----------
$('#btn-them').onclick = () => {
  $('#td-ten').value = ''; $('#td-email').value = '';
  $('#td-sdt').value = ''; $('#td-khu-vuc').value = '';
  $('#td-loai').value = 'Lưu trú';
  moModal('modal-them');
};
$('#td-huy').onclick = () => dongModal('modal-them');
$('#form-them').addEventListener('submit', (e) => {
  e.preventDefault();
  const ten = $('#td-ten').value.trim(), email = $('#td-email').value.trim();
  if (!ten) { toast('Vui lòng nhập tên đối tác.', 'error'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast('Email không hợp lệ.', 'error'); return; }
  if (ds.some((p) => p.email.toLowerCase() === email.toLowerCase())) {
    toast('Email đối tác đã tồn tại trong hệ thống.', 'error'); return;
  }
  ds.unshift({
    id: 'p' + Date.now(), ten, email,
    sdt: $('#td-sdt').value.trim() || '(chưa cập nhật)',
    khuVuc: $('#td-khu-vuc').value.trim() || '(chưa xác định)',
    loai: $('#td-loai').value,
    soTraiNghiem: 0, ngayThamGia: '12/2026', trangThai: 'hoatdong'
  });
  luuLS(); dongModal('modal-them');
  renderPartners(true);
  setTimeout(() => renderPartners(), 400);
  toast('Đã thêm đối tác ' + ten + '.', 'success');
});

// ---------- MODAL XÁC NHẬN DÙNG CHUNG ----------
function moXacNhan(thongBao, hanhDong) {
  $('#xn-thong-bao').textContent = thongBao;
  hanhDongXacNhan = hanhDong;
  moModal('modal-xac-nhan');
}``
$('#xn-huy').onclick = () => dongModal('modal-xac-nhan');
$('#xn-dong-y').onclick = () => {
  dongModal('modal-xac-nhan');
  if (hanhDongXacNhan) hanhDongXacNhan();
};

// ---------- HEADER: tìm kiếm toàn cục + chuông + avatar (mô phỏng) ----------
$('#global-search').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') toast('Tìm kiếm toàn cục: "' + e.target.value + '" (mô phỏng)', 'info');
});
$('#bell-btn').addEventListener('click', () => toast('Bạn có 5 thông báo mới (mô phỏng).', 'info'));
$('#avatar-btn').addEventListener('click', () => {
  if (confirm('Bạn muốn đăng xuất khỏi TripWeave AI?')) {
    try { localStorage.removeItem('tw_session'); } catch (e) { /* bỏ qua */ }
    location.href = '../login/index.html';
  }
});

// ---------- KHỞI ĐỘNG KHI TRANG TẢI XONG (DOMContentLoaded) ----------
function khoiDong() {
  renderPartners(true); // hiện skeleton (LOADING)
  setTimeout(() => {
    const ok = napDuLieu();
    if (!ok) toast('Dữ liệu cũ không hợp lệ - đã khôi phục dữ liệu mẫu.', 'info');
    renderPartners();   // đổ mock data ra màn hình (SUCCESS)
  }, 600);
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', khoiDong);
} else {
  khoiDong();
}
