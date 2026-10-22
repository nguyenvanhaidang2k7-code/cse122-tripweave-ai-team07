/* =====================================================================
   traveler-discover.js – Màn hình "Khám phá" (trang chủ của du khách)
   ---------------------------------------------------------------------
   - Hiển thị banner + tag lọc + lưới 4 card địa điểm gợi ý.
   - Bấm tag: lọc danh sách card theo vùng miền / loại hình.
   - Bấm card: lưu tên địa điểm vào localStorage (key "pickedDestination")
     rồi chuyển sang trang Lập kế hoạch chuyến đi.
   - Bấm nút TIM ở góc card: thêm / xóa địa điểm trong key "savedItems"
     (màn "Đã lưu" – traveler-saved – đọc key này để render danh sách).
   ===================================================================== */

/* ------------------- 1. DỮ LIỆU ĐỊA ĐIỂM (giống mockup) -------------------
   rating + thumb: 2 trường bổ sung để khi bấm tim lưu địa điểm,
   màn "Đã lưu" có đủ dữ liệu render card (điểm sao + chữ ảnh giả). */
const DESTINATIONS = [
  {
    name: 'Hà Nội',
    region: 'Miền Bắc',
    type: 'Văn hóa',
    meta: '36 địa điểm nổi bật',
    image: 'images/ha-noi.png',
    rating: 4.6,
    thumb: 'Phố cổ'
  },
  {
    name: 'Hạ Long',
    region: 'Miền Bắc',
    type: 'Biển',
    meta: '28 địa điểm nổi bật',
    image: 'images/ha-long.png',
    rating: 4.7,
    thumb: 'Vịnh biển'
  },
  {
    name: 'Đà Nẵng',
    region: 'Miền Trung',
    type: 'Biển',
    meta: '45 địa điểm nổi bật',
    image: 'images/da-nang.png',
    rating: 4.7,
    thumb: 'Bãi biển'
  },
  {
    name: 'Sa Pa',
    region: 'Miền Bắc',
    type: 'Núi',
    meta: '19 địa điểm nổi bật',
    image: 'images/sa-pa.png',
    rating: 4.5,
    thumb: 'Phố núi'
  },
  {
    name: 'Huế',
    region: 'Miền Trung',
    type: 'Văn hóa',
    meta: '32 địa điểm nổi bật',
    image: 'images/hue.png',
    rating: 4.6,
    thumb: 'Kinh thành'
  },
  {
    name: 'Nha Trang',
    region: 'Miền Trung',
    type: 'Biển',
    meta: '27 địa điểm nổi bật',
    image: 'images/nha-trang.png',
    rating: 4.6,
    thumb: 'Bãi biển'
  },
  {
    name: 'Đà Lạt',
    region: 'Miền Nam',
    type: 'Núi',
    meta: '38 địa điểm nổi bật',
    image: 'images/da-lat.png',
    rating: 4.8,
    thumb: 'Đồi núi'
  },
  {
    name: 'Phú Quốc',
    region: 'Miền Nam',
    type: 'Biển',
    meta: '41 địa điểm nổi bật',
    image: 'images/phu-quoc.png',
    rating: 4.7,
    thumb: 'Đảo xanh'
  }
];

/* Danh sách tag lọc: "Tất cả" luôn hiển thị, còn lại ghép từ dữ liệu */
const FILTERS = ['Tất cả', 'Miền Bắc', 'Miền Trung', 'Miền Nam', 'Biển', 'Núi', 'Văn hóa'];

/* Tag đang được chọn */
let activeFilter = 'Tất cả';

/* Viết tắt cho gọn */
const $ = (id) => document.getElementById(id);

/* ------------------- 2. RENDER TAG LỌC ------------------- */
function renderFilters() {
  $('filters').innerHTML = FILTERS.map((f) =>
    '<button class="filter-chip' + (f === activeFilter ? ' is-active' : '') +
    '" data-filter="' + f + '">' + f + '</button>'
  ).join('');

  // Gắn sự kiện: bấm tag nào thì lọc theo tag đó
  document.querySelectorAll('.filter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      activeFilter = chip.dataset.filter;
      renderFilters();
      renderCards();
    });
  });
}

/* ------------------- 3. LƯU / BỎ LƯU ĐỊA ĐIỂM (nút tim) ------------------- */
const SAVED_KEY = 'savedItems'; // key dùng chung với màn "Đã lưu"

/* Icon tim gắn ở góc trên phải mỗi card địa điểm */
const HEART_SVG =
  '<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"></path></svg>';

/* Đọc localStorage an toàn: lỗi / chưa có thì trả về null */
function readJSON(key) {
  try { return JSON.parse(localStorage.getItem(key)); }
  catch (err) { console.warn('Không đọc được localStorage:', err); return null; }
}

/* Địa điểm này đang được lưu chưa? (so theo tên) */
function isSaved(name) {
  return (readJSON(SAVED_KEY) || []).some((item) => item.title === name);
}

/* Bấm tim: thêm / xóa địa điểm trong mảng "savedItems" */
function toggleSave(name) {
  const list = readJSON(SAVED_KEY) || [];
  if (isSaved(name)) {
    // Đã lưu rồi -> bỏ lưu (lọc bỏ phần tử trùng tên)
    localStorage.setItem(SAVED_KEY, JSON.stringify(
      list.filter((item) => item.title !== name)
    ));
  } else {
    // Chưa lưu -> thêm object đúng "chuẩn" mà màn Đã lưu cần để render
    const d = DESTINATIONS.find((item) => item.name === name);
  list.push({
    id:     'dest-' + name,
    thumb:  d.thumb,
    title:  d.name,
    image:  d.image,
    sub:    d.region + ', Việt Nam',
    rating: d.rating,
    type:   'Địa điểm'
  });

    localStorage.setItem(SAVED_KEY, JSON.stringify(list));
  }
}

/* ------------------- 4. RENDER LƯỚI CARD ------------------- */
function renderCards() {
  // Lọc theo tag đang chọn ("Tất cả" thì lấy hết)
  const list = activeFilter === 'Tất cả'
    ? DESTINATIONS
    : DESTINATIONS.filter((d) => d.region === activeFilter || d.type === activeFilter);

  $('cards').innerHTML = list.map((d) =>
    '<article class="card" data-name="' + d.name + '">' +
      '<img class="card__img" src="' + d.image +
      '" alt="Ảnh du lịch ' + d.name + '">' +
      // Nút tim: đã lưu thì thêm class is-saved (tim xanh đặc)
      '<button class="card__heart' + (isSaved(d.name) ? ' is-saved' : '') +
      '" data-save="' + d.name + '" title="Lưu / bỏ lưu địa điểm">' + HEART_SVG + '</button>' +
      '<div class="card__body">' +
        '<h3 class="card__title">' + d.name + '</h3>' +
        '<p class="card__meta">' + d.meta + '</p>' +
        '<span class="tag-chip">' + d.type + '</span>' +
      '</div>' +
    '</article>'
  ).join('');

  // Gắn sự kiện: bấm card -> lưu địa điểm -> sang trang lập kế hoạch
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('click', () => {
      localStorage.setItem('pickedDestination', card.dataset.name);
      window.location.href = '../traveler-trip-planner/traveler-trip-planner.html';
    });
  });

  // Gắn sự kiện nút tim: stopPropagation để KHÔNG bị coi là bấm card
  document.querySelectorAll('.card__heart').forEach((heart) => {
    heart.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleSave(heart.dataset.save);       // cập nhật localStorage
      heart.classList.toggle('is-saved');   // đổi màu tim ngay lập tức
    });
  });
}

/* ------------------- 5. KHỞI ĐỘNG ------------------- */
renderFilters();
renderCards();