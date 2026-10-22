/* =====================================================================
   traveler-saved.js – Màn hình "Đã lưu"
   ---------------------------------------------------------------------
   Luồng xử lý (dễ thuyết trình):
     1. Đọc mảng "savedItems" trong localStorage.
        (common.js đã seed sẵn 6 card mặc định giống mockup nếu lần đầu
         mở web; trang Khám phá cũng ghi thêm vào key này khi bấm tim.)
     2. Render lưới card 3 cột vào #savedGrid bằng innerHTML.
     3. Bấm nút tim trên card -> xóa phần tử khỏi mảng -> ghi lại
        localStorage -> render lại ngay. Mở trang Khám phá sẽ thấy card
        đó không còn được tim nữa (vì 2 trang đọc/ghi CÙNG 1 key).
   ===================================================================== */

const SAVED_KEY = 'savedItems'; // key dùng chung với trang Khám phá

const $ = (id) => document.getElementById(id);

/* Icon tim (svg) dùng cho nút "bỏ lưu" */
const HEART_SVG =
  '<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"></path></svg>';

/* Icon sao chấm điểm (vd: 4.7) */
const STAR_SVG =
  '<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6z"></path></svg>';

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

/* ------------------- RENDER LƯỚI CARD ĐÃ LƯU ------------------- */
function renderSaved() {
  const list = readJSON(SAVED_KEY) || [];

  // Không còn mục nào -> hiện khung trống + nút quay lại trang Khám phá
  if (list.length === 0) {
    $('savedGrid').innerHTML =
      '<div class="saved-empty">' +
        '<p class="saved-empty__text">Bạn chưa lưu địa điểm hay lịch trình nào.</p>' +
        '<a class="btn btn--primary" href="../traveler-discover/traveler-discover.html">Khám phá địa điểm</a>' +
      '</div>';
    return;
  }

  // Hiển thị các địa điểm đã lưu kèm ảnh
  $('savedGrid').innerHTML = list.map((item) =>
    '<article class="saved-card">' +
      '<div class="saved-card__thumb">' +
        '<img src="../traveler-discover/' + (item.image || '') +
        '" alt="' + item.title + '">' +
        '<button class="saved-card__unsave" data-id="' + item.id + '" title="Bỏ lưu">' + HEART_SVG + '</button>' +
      '</div>' +
      '<h3 class="saved-card__title">' + item.title + '</h3>' +
      '<p class="saved-card__sub">' + item.sub + '</p>' +
      '<p class="saved-card__meta">' +
        '<span class="saved-card__rating">' + STAR_SVG + item.rating + '</span>' +
        '<span class="saved-card__dot">•</span>' +
        '<span>' + item.type + '</span>' +
      '</p>' +
    '</article>'
  ).join('');

  // Gắn sự kiện "bỏ lưu" cho từng nút tim vừa render
  document.querySelectorAll('.saved-card__unsave').forEach((btn) => {
    btn.addEventListener('click', () => unsave(btn.dataset.id));
  });
}

/* ------------------- BỎ LƯU: xóa khỏi localStorage ------------------- */
function unsave(id) {
  const list = readJSON(SAVED_KEY) || [];
  const item = list.find((el) => el.id === id);
  if (!item) return;

  // Hỏi lại cho chắc trước khi xóa (giống UX các app thật)
  if (!confirm('Bỏ lưu "' + item.title + '" khỏi danh sách đã lưu?')) return;

  // Lọc bỏ phần tử có id trùng rồi ghi lại mảng mới
  writeJSON(SAVED_KEY, list.filter((el) => el.id !== id));
  renderSaved(); // render lại lưới card ngay lập tức
}

renderSaved(); // script đặt cuối body nên DOM đã sẵn sàng
