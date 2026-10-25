/* =====================================================================
   traveler-ai-explanation.js – Màn hình "Giải thích đề xuất AI"
   ---------------------------------------------------------------------
   - Đọc lịch trình đã lưu từ localStorage (key "savedTrip",
     do trang traveler-ai-itinerary ghi khi bấm "Chấp nhận & Lưu").
   - Sinh các khối lý do giải thích vì sao AI đề xuất lịch trình này:
     điểm đến, số ngày, ngân sách, sở thích, ghi chú của người dùng.
   ===================================================================== */

/* Viết tắt cho gọn */
const $ = (id) => document.getElementById(id);

/* Đọc object từ localStorage an toàn */
function readJSON(key) {
  try { return JSON.parse(localStorage.getItem(key)); }
  catch (err) { console.warn('Không đọc được localStorage:', err); return null; }
}
/* ------------------- 1. SINH DANH SÁCH LÝ DO ------------------- */
/* Mỗi lý do = { label, text }; dựa trên dữ liệu trip thực tế đã lưu */
function buildReasons(trip) {
  const reasons = [];
  const days = trip.totalDays || (trip.itinerary ? trip.itinerary.length : 0);

  // Lý do 1: điểm đến — dựa trên danh sách điểm đến người dùng chọn
  if (trip.destinations && trip.destinations.length) {
    reasons.push({
      label: 'Điểm đến',
      text: 'Bạn đã chọn ' + trip.destinations.join(', ') +
            '. AI sắp xếp các điểm này theo thứ tự di chuyển hợp lý để tiết kiệm thời gian đi lại.'
    });
  }

  // Lý do 2: thời gian — số ngày được tính từ ngày bắt đầu/kết thúc
  if (days > 0) {
    reasons.push({
      label: 'Thời gian',
      text: 'Chuyến đi kéo dài ' + days + ' ngày. Mỗi ngày AI bố trí 2–3 hoạt động chính, tránh lịch quá dày gây mệt.'
    });
  }

  // Lý do 3: ngân sách — hoạt động được chọn theo mức ngân sách
  if (trip.budget && trip.budget !== 'Chưa xác định') {
    reasons.push({
      label: 'Ngân sách',
      text: 'Với ngân sách "' + trip.budget + '", AI ưu tiên các hoạt động và nơi lưu trú phù hợp khả năng chi trả của bạn.'
    });
  }

  // Lý do 4: sở thích — lịch trình nghiêng về các chủ đề đã chọn
  if (trip.interests && trip.interests.length) {
    reasons.push({
      label: 'Sở thích',
      text: 'Lịch trình nghiêng về: ' + trip.interests.join(', ') +
            ' — đúng với những gì bạn quan tâm nhất.'
    });
  }

  // Lý do 5: ghi chú — nếu người dùng có ghi chú thêm
  if (trip.note) {
    reasons.push({
      label: 'Ghi chú của bạn',
      text: 'AI đã cân nhắc yêu cầu riêng: "' + trip.note + '".'
    });
  }

  return reasons;
}

/* ------------------- 2. KHỞI ĐỘNG: RENDER TRANG ------------------- */
function init() {
  const trip = readJSON('savedTrip');

  if (!trip) {
    // Chưa có chuyến đi nào được lưu: báo cho người dùng biết
    $('reasonList').innerHTML =
      '<div class="reason"><p class="reason__text">' +
      'Chưa có lịch trình nào được lưu. Hãy vào trang Lập kế hoạch để tạo chuyến đi mới.' +
      '</p></div>';
    $('successTag').textContent = 'Chưa có dữ liệu';
    return;
  }

  // Cập nhật tag thành công kèm tên chuyến đi
  $('successTag').textContent = 'Đã lưu: ' + trip.name;

  // Render các khối lý do
  const reasons = buildReasons(trip);
  $('reasonList').innerHTML = reasons.map((r) =>
    '<div class="reason">' +
      '<p class="reason__label">' + r.label + '</p>' +
      '<p class="reason__text">' + r.text + '</p>' +
    '</div>'
  ).join('');
}

init();
