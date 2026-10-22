/* =====================================================================
   traveler-settings.js – Màn hình "Cài đặt"
   ---------------------------------------------------------------------
   Luồng xử lý (dễ thuyết trình):
     1. Đọc object "userProfile" từ localStorage (common.js seed mặc định
        tên "Nguyễn Thị Thanh Ngọc", email "ngocthanh@email.com", theme
        "light").
     2. Nút "Chỉnh sửa" -> hiện form inline sửa tên + email -> "Lưu
        thay đổi" ghi lại vào localStorage. Vì MỌI TRANG đều dùng
        common.js đọc cùng key này nên avatar/topbar ở các trang khác
        cũng tự cập nhật khi mở lại.
     3. Select "Giao diện" (Sáng/Tối) -> lưu theme vào userProfile và
        bật ngay body[data-theme] để thấy hiệu ứng tức thì.
     4. Nút "Đăng xuất" -> confirm -> quay về index.html.
     (Đổi mật khẩu / Liên kết tài khoản / Tùy chọn thông báo: chỉ alert
      demo vì bài tập chỉ làm frontend, không có backend.)
   ===================================================================== */

const PROFILE_KEY = 'userProfile'; // key dùng chung với common.js

const $ = (id) => document.getElementById(id);

/* Đọc localStorage an toàn: lỗi / chưa có thì trả về null */
function readJSON(key) {
  try { return JSON.parse(localStorage.getItem(key)); }
  catch (err) { console.warn('Không đọc được localStorage:', err); return null; }
}

/* Ghi object xuống localStorage dưới dạng chuỗi JSON */
function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (err) { console.warn('Không ghi được localStorage:', err); }
}

/* Viết tắt tên giống common.js: "Nguyễn Thị Ngân" -> "NN" */
function initialsOf(name) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'NN';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

/* Đọc hồ sơ + bù các trường còn thiếu bằng giá trị mặc định */
function loadProfile() {
  return Object.assign(
    { name: 'Nguyễn Thị Ngân', email: 'nguyenthingan@email.com', theme: 'light' },
    readJSON(PROFILE_KEY) || {}
  );
}

/* ------------------- HIỂN THỊ HỒ SƠ LÊN GIAO DIỆN ------------------- */
function renderProfile() {
  const profile = loadProfile();
  $('accountName').textContent   = profile.name;
  $('accountEmail').textContent  = profile.email;
  $('settingAvatar').textContent = initialsOf(profile.name);
  $('themeSelect').value         = profile.theme === 'dark' ? 'dark' : 'light';
}

/* ------------------- GẮN SỰ KIỆN CÁC NÚT ------------------- */
function init() {
  /* Nút "Chỉnh sửa": mở form inline, điền sẵn giá trị hiện tại */
  $('editProfileBtn').addEventListener('click', () => {
    const profile = loadProfile();
    $('editName').value  = profile.name;
    $('editEmail').value = profile.email;
    $('editForm').hidden = false;
    $('editName').focus();
  });

  /* Nút "Hủy": đóng form, không lưu gì cả */
  $('cancelEditBtn').addEventListener('click', () => { $('editForm').hidden = true; });

  /* Submit form: ghi userProfile mới -> cập nhật hiển thị ngay */
  $('editForm').addEventListener('submit', (event) => {
    event.preventDefault(); // chặn reload trang

    const profile = loadProfile();
    const newName  = $('editName').value.trim();
    const newEmail = $('editEmail').value.trim();
    if (!newName || !newEmail) return; // không cho lưu chuỗi rỗng

    profile.name  = newName;
    profile.email = newEmail;
    writeJSON(PROFILE_KEY, profile);

    renderProfile();

    /* Cập nhật LUÔN avatar trên topbar của chính trang này
       (các trang khác sẽ tự cập nhật khi mở lại, nhờ common.js) */
    const topAvatar = document.querySelector('.topbar__avatar');
    if (topAvatar) {
      topAvatar.textContent = initialsOf(profile.name);
      topAvatar.title = profile.name;
    }

    $('editForm').hidden = true;
    alert('Đã cập nhật thông tin tài khoản!');
  });

  /* Select Giao diện: lưu theme + áp dụng ngay lập tức */
  $('themeSelect').addEventListener('change', () => {
    const profile = loadProfile();
    profile.theme = $('themeSelect').value; // 'light' | 'dark'
    writeJSON(PROFILE_KEY, profile);
    document.body.dataset.theme = profile.theme; // common.css đổi biến màu
  });

  /* 3 nút demo (bài tập không có backend nên chỉ thông báo) */
  $('changePasswordBtn').addEventListener('click', () => alert('Tính năng demo: đổi mật khẩu cần có backend.'));
  $('manageLinksBtn').addEventListener('click', () => alert('Tính năng demo: quản lý liên kết Google / Facebook.'));
  $('notifPrefsBtn').addEventListener('click', () => alert('Tính năng demo: thiết lập loại thông báo muốn nhận.'));

  /* Đăng xuất: xác nhận rồi quay về trang mở đầu */
  $('logoutBtn').addEventListener('click', () => {
    if (confirm('Bạn muốn đăng xuất khỏi TripWeave AI?')) {
      window.location.href = '../index.html';
    }
  });
}

/* ------------------- KHỞI ĐỘNG ------------------- */
renderProfile();
init(); // script đặt cuối body nên DOM đã sẵn sàng
