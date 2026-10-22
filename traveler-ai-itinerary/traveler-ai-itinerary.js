/* =====================================================================
   traveler-ai-itinerary.js
   ---------------------------------------------------------------------
   Mô phỏng luồng của màn hình "AI Itinerary":
     [Loading] progress 0% -> 100%  =>  [Result] danh sách ngày đi
     => bấm "Chấp nhận & Lưu" => ghi localStorage => sang trang giải thích.
   Dữ liệu đầu vào: key "currentTrip" trong localStorage
   (được trang traveler-trip-planner lưu khi bấm nút "Tiếp tục").
   ===================================================================== */

/* ------------------- 1. HẰNG SỐ & HÀM TIỆN ÍCH ------------------- */
const TRIP_KEY  = 'currentTrip'; // key lưu chuyến đi đang tạo (trang planner ghi)
const SAVED_KEY = 'savedTrip';   // key lưu lịch trình đã được chấp nhận
const LIST_KEY  = 'myTrips';     // mảng các chuyến đi đã lưu ("Chuyến đi của tôi")

/* Trip mặc định: dùng khi mở thẳng trang này (chưa qua trang lập kế hoạch) */
const DEFAULT_TRIP = {
  name:         'Du lịch miền Bắc',
  destinations: ['Hà Nội', 'Hạ Long', 'Ninh Bình'],
  startDate:    '2025-11-10',
  endDate:      '2025-11-13',
  budget:       '5.000.000 – 10.000.000',
  interests:    ['Thiên nhiên', 'Ẩm thực', 'Văn hóa']
};

/* Các mẫu hoạt động trong ngày. Bấm "Tạo lại" sẽ đổi variant
   => chọn mẫu khác, tạo cảm giác AI vừa sinh lại lịch trình mới. */
const ACTIVITY_SETS = [
  '09:00 tham quan • 14:00 trải nghiệm • 18:30 ăn tối',
  '08:30 check-in • 13:30 tham quan • 19:00 ăn tối',
  '09:30 trải nghiệm • 15:00 tham quan • 18:00 ăn tối'
];

/* Viết tắt cho gọn thay vì gõ document.getElementById nhiều lần */
const $ = (id) => document.getElementById(id);

/* Đọc object từ localStorage an toàn (lỗi thì trả về null) */
function readJSON(key) {
  try { return JSON.parse(localStorage.getItem(key)); }
  catch (err) { console.warn('Không đọc được localStorage:', err); return null; }
}

/* Đọc trip; nếu chưa có thì gộp với mặc định để không thiếu trường nào */
function loadTrip(key) {
  const data = readJSON(key || TRIP_KEY);
  return Object.assign({}, DEFAULT_TRIP, data || {});
}

/* Tính tổng số ngày (tính cả ngày đi lẫn ngày về) */
function countDays(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return 0;
  return Math.round((e - s) / 86400000) + 1; // 86400000 ms = 1 ngày
}

/* Chia số ngày cho các điểm đến:
   mỗi điểm đến ít nhất 1 ngày, ngày dư chia lần lượt từ điểm đến thứ 2.
   VD: 4 ngày / 3 điểm đến -> [1, 2, 1] => Hà Nội, Hạ Long, Hạ Long, Ninh Bình */
function splitDays(destinations, totalDays) {
  const n = destinations.length;
  if (n === 0) return [];
  if (totalDays <= n) return destinations.slice(0, totalDays).map(() => 1);
  const counts = new Array(n).fill(1);
  let extra = totalDays - n;
  let i = 1;
  while (extra > 0) { counts[i % n] += 1; extra -= 1; i += 1; }
  return counts;
}

/* Dựng mảng lịch trình: [{ day, city, activities }, ...] */
function buildItinerary(trip, variant) {
  const totalDays = Math.max(
    countDays(trip.startDate, trip.endDate),
    trip.destinations.length,
    1
  );
  const counts = splitDays(trip.destinations, totalDays);
  const activities = ACTIVITY_SETS[variant % ACTIVITY_SETS.length];
  const days = [];
  let dayNumber = 1;
  trip.destinations.forEach((city, idx) => {
    for (let k = 0; k < counts[idx]; k += 1) {
      days.push({ day: dayNumber, city: city, activities: activities });
      dayNumber += 1;
    }
  });
  return days;
}

/* ------------------- 2. LẤY CÁC PHẦN TỬ GIAO DIỆN ------------------- */
const loadingState = $('loadingState');
const resultState  = $('resultState');
const progressFill = $('progressFill');
const progressText = $('progressText');
const stepResult   = $('stepResult');
const dayList      = $('dayList');

/* ------------------- 3. TRẠNG THÁI CỦA TRANG ------------------- */
let progressTimer    = null; // id của setInterval (để dừng khi bấm "Hủy")
let variant          = 0;    // số lần bấm "Tạo lại"
let currentItinerary = [];   // lịch trình đang hiển thị trên màn hình

/* 3.1. Chạy hiệu ứng loading: mỗi 180ms tăng tiến độ ngẫu nhiên 4–12% */
function startLoading() {
  // Hiển thị đúng state: loading hiện, result ẩn
  resultState.hidden = true;
  loadingState.hidden = false;
  stepResult.classList.remove('is-done');

  let percent = 0;
  progressFill.style.width = '0%';
  progressText.textContent = 'Đang xử lý… 0%';

  progressTimer = setInterval(() => {
    percent = Math.min(percent + Math.floor(Math.random() * 9) + 4, 100);
    progressFill.style.width = percent + '%';
    progressText.textContent = 'Đang xử lý… ' + percent + '%';

    if (percent === 100) {
      clearInterval(progressTimer);
      progressTimer = null;
      progressText.textContent = 'Hoàn tất! Đang hiển thị kết quả…';
      setTimeout(showResult, 600); // nghỉ 0.6s rồi mới hiện kết quả cho "thật"
    }
  }, 180);
}

/* 3.2. Render kết quả lịch trình (useSaved = true: đọc bản đã lưu, không sinh lại) */
function showResult(useSaved) {
  let trip;
  if (useSaved) {
    trip = loadTrip(SAVED_KEY);
    currentItinerary = (trip.itinerary && trip.itinerary.length)
      ? trip.itinerary
      : buildItinerary(trip, variant);
  } else {
    trip = loadTrip(TRIP_KEY);
    currentItinerary = buildItinerary(trip, variant);
  }

  const totalDays = currentItinerary.length;
  $('resultTitle').textContent = 'Lịch trình gợi ý: ' + trip.destinations.join(' – ');
  $('resultMeta').textContent =
    totalDays + ' ngày ' + (totalDays - 1) + ' đêm • ' +
    trip.destinations.length + ' thành phố';

  // Render từng card ngày đi vào #dayList bằng innerHTML
  dayList.innerHTML = currentItinerary.map((d) =>
    '<article class="day-card">' +
      '<span class="tag-chip">Ngày ' + d.day + '</span>' +
      '<h3 class="day-card__city">' + d.city + '</h3>' +
      '<p class="day-card__activities">' + d.activities + '</p>' +
    '</article>'
  ).join('');

  // Sáng bước thứ 4 trên step bar
  stepResult.classList.add('is-done');

  loadingState.hidden = true;
  resultState.hidden = false;
}

/* 3.3. "Chấp nhận & Lưu": ghi localStorage rồi chuyển sang trang giải thích */
function acceptAndSave() {
  const trip = loadTrip(TRIP_KEY);
  const saved = Object.assign({}, trip, {
    itinerary: currentItinerary,
    totalDays: currentItinerary.length,
    savedAt: new Date().toISOString()
  });
  localStorage.setItem(SAVED_KEY, JSON.stringify(saved));

  // Thêm vào mảng "Chuyến đi của tôi" (phục vụ màn danh sách chuyến đi sau này)
  const list = readJSON(LIST_KEY) || [];
  list.push(saved);
  localStorage.setItem(LIST_KEY, JSON.stringify(list));

  // MỚI: đẩy 1 thông báo vào key "notifications" để màn "Thông báo" hiển thị
  // (badge đỏ trên chuông ở topbar cũng đếm từ key này – xem common.js).
  // unshift => thông báo mới nhất luôn nằm ĐẦU danh sách.
  const notifs = readJSON('notifications') || [];
  notifs.unshift({
    id:    'notif-' + Date.now(), // id duy nhất sinh từ timestamp
    type:  'system',               // nhóm "Hệ thống" (tab lọc bên màn Thông báo)
    tint:  'blue',                 // màu ô icon vuông bên trái
    title: 'AI đã tạo xong lịch trình cho chuyến đi của bạn!',
    body:  'Lịch trình ' + trip.destinations.join(' – ') + ' đã sẵn sàng.',
    time:  'Vừa xong',
    link:  '../traveler-ai-itinerary/traveler-ai-itinerary.html#saved'
  });
  localStorage.setItem('notifications', JSON.stringify(notifs));

  window.location.href = '../traveler-ai-explanation/traveler-ai-explanation.html';
}

/* ------------------- 4. GẮN SỰ KIỆN & KHỞI ĐỘNG ------------------- */
function init() {
  // Nút "Hủy": dừng loading ngay và quay lại trang lập kế hoạch
  $('cancelBtn').addEventListener('click', () => {
    if (progressTimer) clearInterval(progressTimer);
    window.location.href = '../traveler-trip-planner/traveler-trip-planner.html';
  });

  // Nút "Chấp nhận & Lưu"
  $('acceptBtn').addEventListener('click', acceptAndSave);

  // Nút "Chỉnh sửa": quay lại form để sửa thông tin chuyến đi
  $('editBtn').addEventListener('click', () => {
    window.location.href = '../traveler-trip-planner/traveler-trip-planner.html';
  });

  // Nút "Tạo lại": chạy lại loading với mẫu hoạt động khác
  $('regenBtn').addEventListener('click', () => {
    variant += 1;
    startLoading();
  });

  // Nút "Từ chối": hỏi xác nhận rồi quay lại trang lập kế hoạch
  $('rejectBtn').addEventListener('click', () => {
    if (confirm('Bạn muốn từ chối lịch trình AI vừa tạo?')) {
      window.location.href = '../traveler-trip-planner/traveler-trip-planner.html';
    }
  });

  // Mở trang kèm #saved (nút "Xem chuyến đi" bên trang giải thích):
  // bỏ qua loading, hiển thị ngay lịch trình đã lưu.
  if (window.location.hash === '#saved' && localStorage.getItem(SAVED_KEY)) {
    showResult(true);
  } else {
    startLoading();
  }
}

init(); // script đặt cuối body nên DOM đã sẵn sàng
