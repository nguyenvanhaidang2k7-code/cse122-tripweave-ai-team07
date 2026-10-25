/* =====================================================================
   traveler-trip-planner.js – Màn hình "Lập kế hoạch chuyến đi"
   ---------------------------------------------------------------------
   - Form nhập: tên chuyến đi, điểm đến (chip chọn nhiều), ngày đi/về,
     ngân sách (chip chọn 1), sở thích (chip chọn nhiều), ghi chú.
   - Bấm "Tạo lịch trình AI": kiểm tra dữ liệu -> lưu vào localStorage
     với key "currentTrip" -> chuyển sang trang traveler-ai-itinerary.
   ===================================================================== */

/* ------------------- 1. DỮ LIỆU CÁC CHIP ------------------- */
const DEST_OPTIONS     = ['Hà Nội', 'Hạ Long', 'Ninh Bình', 'Đà Nẵng', 'Huế', 'Sa Pa', 'Đà Lạt', 'Phú Quốc'];
const BUDGET_OPTIONS   = ['Dưới 5 triệu', '5 – 10 triệu', 'Trên 10 triệu'];
const INTEREST_OPTIONS = ['Thiên nhiên', 'Ẩm thực', 'Văn hóa', 'Biển', 'Núi', 'Mua sắm'];

/* Trạng thái chip đang chọn:
   - destinations / interests: chọn nhiều -> dùng Set
   - budget: chọn 1 -> chuỗi */
const state = { destinations: new Set(), budget: '', interests: new Set() };

/* Viết tắt cho gọn */
const $ = (id) => document.getElementById(id);

/* ------------------- 2. RENDER CHIP & GẮN SỰ KIỆN ------------------- */
/* single = true: kiểu chọn 1 (ngân sách); false: chọn nhiều (điểm đến, sở thích) */
function renderChips(containerId, options, selected, single) {
  const box = $(containerId);
  box.innerHTML = options.map((opt) => {
    const isOn = single ? state.budget === opt : selected.has(opt);
    return '<button type="button" class="tag-chip tag-chip--selectable' +
           (isOn ? ' is-selected' : '') + '" data-value="' + opt + '">' + opt + '</button>';
  }).join('');

  box.querySelectorAll('.tag-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const value = chip.dataset.value;
      if (single) {
        // Chọn 1: bấm lại lần nữa thì bỏ chọn
        state.budget = state.budget === value ? '' : value;
        renderChips(containerId, options, selected, single);
      } else {
        // Chọn nhiều: có thì xóa, chưa có thì thêm
        if (selected.has(value)) selected.delete(value);
        else selected.add(value);
        chip.classList.toggle('is-selected');
      }
    });
  });
}

/* ------------------- 3. KIỂM TRA DỮ LIỆU + CHUYỂN TRANG ------------------- */
function showError(msg) {
  const el = $('errorMsg');
  el.textContent = msg;
  el.hidden = false;
}

function createTrip() {
  // Kiểm tra: phải chọn ít nhất 1 điểm đến
  if (state.destinations.size === 0) {
    showError('Vui lòng chọn ít nhất 1 điểm đến.');
    return;
  }
  // Kiểm tra: ngày kết thúc không được trước ngày bắt đầu
  const start = $('startDate').value;
  const end   = $('endDate').value;
  if (start && end && new Date(end) < new Date(start)) {
    showError('Ngày kết thúc phải sau ngày bắt đầu.');
    return;
  }

  $('errorMsg').hidden = true;

  // Gom dữ liệu form thành object trip
  const trip = {
    name:         $('tripName').value.trim() || 'Chuyến đi của tôi',
    destinations: Array.from(state.destinations),
    startDate:    start,
    endDate:      end,
    budget:       state.budget || 'Chưa xác định',
    interests:    Array.from(state.interests),
    note:         $('tripNote').value.trim()
  };

  // Lưu vào localStorage rồi chuyển sang trang AI Itinerary
  localStorage.setItem('currentTrip', JSON.stringify(trip));
  window.location.href = '../traveler-ai-itinerary/traveler-ai-itinerary.html';
}

/* ------------------- 4. KHỞI ĐỘNG ------------------- */
function init() {
  // Nếu user vừa bấm 1 địa điểm bên trang "Khám phá" -> chọn sẵn chip đó
  const picked = localStorage.getItem('pickedDestination');
  if (picked && DEST_OPTIONS.includes(picked)) {
    state.destinations.add(picked);
    localStorage.removeItem('pickedDestination'); // dùng xong thì xóa
  }

  // Nếu đang "Chỉnh sửa" từ trang AI Itinerary quay lại -> điền form cũ
  try {
    const old = JSON.parse(localStorage.getItem('currentTrip'));
    if (old) {
      $('tripName').value  = old.name || '';
      $('startDate').value = old.startDate || '';
      $('endDate').value   = old.endDate || '';
      $('tripNote').value  = old.note || '';
      (old.destinations || []).forEach((d) => state.destinations.add(d));
      (old.interests || []).forEach((i) => state.interests.add(i));
      state.budget = old.budget === 'Chưa xác định' ? '' : (old.budget || '');
    }
  } catch (err) {
    console.warn('Không đọc được currentTrip:', err);
  }

  renderChips('destChips', DEST_OPTIONS, state.destinations, false);
  renderChips('budgetChips', BUDGET_OPTIONS, null, true);
  renderChips('interestChips', INTEREST_OPTIONS, state.interests, false);

  $('createBtn').addEventListener('click', createTrip);
}

init();
