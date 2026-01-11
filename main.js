
import { parseScheduleHtml, calculateStatistics } from './utils/parser.js';
import { renderWorkloadChart } from './utils/chart.js';

// Realistic sample data for demonstration
const SAMPLE_UMS_HTML = `
<table>
  <tbody>
    <tr><td colspan="8" class="hitec-td-tkbTuan">Tuần 35: Từ ngày 26/08/2024 đến ngày 01/09/2024</td></tr>
    <tr>
      <td class="hitec-td-tkbSang">Sáng</td>
      <td>
        <a title="Cơ sở dữ liệu - Nhóm 1" data-content="Phòng học: .B.201<br />Tiết: 1 - 4 (Thực dạy <b>4</b> tiết)<br />Giáo viên: TS. Lê Văn B" class="hitec-tkb-monhoc">
          <strong>CSDL01</strong>
        </a>
      </td>
      <td></td>
      <td>
        <a title="Lập trình Web - Nhóm 2" data-content="Phòng học: .C.105<br />Tiết: 2 - 5 (Thực dạy <b>4</b> tiết)<br />Giáo viên: ThS. Nguyễn Thị C" class="hitec-tkb-monhoc">
          <strong>WEB02</strong>
        </a>
      </td>
      <td></td>
      <td>
        <a title="Toán rời rạc" data-content="Phòng học: .A.101<br />Tiết: 1 - 3 (Thực dạy <b>3</b> tiết)<br />Giáo viên: ThS. Hoàng Văn X" class="hitec-tkb-monhoc">
          <strong>TRR01</strong>
        </a>
      </td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td class="hitec-td-tkbChieu">Chiều</td>
      <td></td>
      <td>
        <a title="An toàn thông tin" data-content="Phòng học: .A.302<br />Tiết: 7 - 10 (Thực dạy <b>4</b> tiết)<br />Giáo viên: GS. Trịnh Văn D" class="hitec-tkb-monhoc">
          <strong>ATTT03</strong>
        </a>
      </td>
      <td></td>
      <td>
         <a title="Hệ điều hành" data-content="Phòng học: .B.201<br />Tiết: 6 - 9 (Thực dạy <b>4</b> tiết)<br />Giáo viên: TS. Nguyễn Văn E" class="hitec-tkb-monhoc">
          <strong>HDH01</strong>
        </a>
      </td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr><td colspan="8" class="hitec-td-tkbTuan">Tuần 36: Từ ngày 02/09/2024 đến ngày 08/09/2024</td></tr>
    <tr>
       <td class="hitec-td-tkbSang">Sáng</td>
       <td></td><td></td><td></td>
       <td>
        <a title="Cơ sở dữ liệu - Nhóm 1" data-content="Phòng học: .B.201<br />Tiết: 1 - 4 (Thực dạy <b>4</b> tiết)<br />Giáo viên: TS. Lê Văn B" class="hitec-tkb-monhoc">
          <strong>CSDL01</strong>
        </a>
      </td>
      <td></td><td></td><td></td>
    </tr>
  </tbody>
</table>
`;

// State Management
let appState = {
  isAnalyzed: false,
  scheduleData: [],
  stats: null
};

const mainContent = document.getElementById('main-content');
const headerActions = document.getElementById('header-actions');

/**
 * Renders the initial input screen
 */
function renderInputScreen() {
  headerActions.innerHTML = '';
  mainContent.innerHTML = `
    <div class="max-w-4xl mx-auto fade-in">
      <div class="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div class="p-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm">1</span>
              Bắt đầu phân tích
            </h2>
            <button
              id="btn-load-sample"
              class="text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors"
            >
              Dùng dữ liệu mẫu
            </button>
          </div>
          
          <div class="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg">
            <p class="text-amber-800 text-sm leading-relaxed">
              <strong>Hướng dẫn:</strong> Truy cập vào trang Lịch trình giảng dạy UMS, nhấn <code>Ctrl + U</code> (Xem mã nguồn), sau đó <code>Ctrl + A</code> (Chọn tất cả) và <code>Ctrl + C</code> (Sao chép). Dán toàn bộ vào ô dưới đây.
            </p>
          </div>
          <textarea
            id="html-input"
            class="w-full h-80 p-4 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-slate-50 transition-all"
            placeholder="Dán mã nguồn HTML (<html>...</html>) tại đây..."
          ></textarea>
          <div class="mt-8 flex justify-center gap-4">
            <button
              id="btn-analyze"
              class="bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold py-4 px-12 rounded-2xl shadow-lg transition-all transform hover:-translate-y-1 active:scale-95"
            >
              Bắt đầu phân tích ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-analyze').addEventListener('click', handleAnalyze);
  document.getElementById('btn-load-sample').addEventListener('click', handleLoadSample);
}

/**
 * Renders the dashboard with stats and charts
 */
function renderDashboard() {
  const { stats, scheduleData } = appState;
  const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

  // Update Header Actions
  headerActions.innerHTML = `
    <button id="btn-reset" class="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium transition-all backdrop-blur-sm">
      Làm mới ứng dụng
    </button>
  `;
  document.getElementById('btn-reset').addEventListener('click', () => {
    appState.isAnalyzed = false;
    renderInputScreen();
  });

  // Update Main Content
  mainContent.innerHTML = `
    <div class="space-y-8 mt-10 fade-in">
      <!-- Stats Dashboard -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        ${renderStatCard('Tổng số buổi dạy', stats.totalClasses, 'bg-blue-500')}
        ${renderStatCard('Tổng số tiết dạy', stats.totalPeriods, 'bg-emerald-500')}
        ${renderStatCard('Số học phần', stats.uniqueSubjects, 'bg-orange-500')}
        ${renderStatCard('Số phòng học', stats.uniqueRooms.size, 'bg-purple-500')}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Chart Container -->
        <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <h3 class="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Mật độ tiết giảng theo thứ</h3>
           <div id="workload-chart-container"></div>
        </div>
        
        <!-- Room Usage List -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 class="text-sm font-semibold text-slate-500 mb-6 uppercase tracking-wider">Top phòng học sử dụng</h3>
          <div class="space-y-4">
            ${Object.entries(stats.roomUsage)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([room, count]) => `
                <div class="flex items-center justify-between">
                  <span class="text-slate-700 font-medium">Phòng ${room}</span>
                  <span class="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">${count} buổi</span>
                </div>
              `).join('')}
          </div>
        </div>
      </div>

      <!-- Detailed Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-800">Danh sách chi tiết</h3>
          <span class="text-sm text-slate-500">Đã trích xuất ${scheduleData.length} bản ghi</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
                <th class="px-6 py-4">Môn học</th>
                <th class="px-6 py-4">Thời gian</th>
                <th class="px-6 py-4">Phòng</th>
                <th class="px-6 py-4">Tiết</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm">
              ${scheduleData.map(item => `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="font-semibold text-slate-900">${item.courseCode}</div>
                    <div class="text-xs text-slate-500 mt-0.5 max-w-xs truncate" title="${item.title}">${item.title}</div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 rounded text-xs font-bold ${getSessionClass(item.session)}">
                      ${dayNames[item.dayOfWeek] || 'N/A'} - ${item.session}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-slate-700 font-medium">${item.room}</td>
                  <td class="px-6 py-4 text-slate-700">${item.slots}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Render D3 Chart
  renderWorkloadChart('workload-chart-container', stats.dayDistribution);
}

function renderStatCard(label, value, colorClass) {
  return `
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <p class="text-sm font-medium text-slate-500 uppercase">${label}</p>
      <h4 class="text-3xl font-bold text-slate-900 mt-2">${value}</h4>
      <div class="w-full h-1 bg-slate-100 mt-4 rounded-full overflow-hidden">
        <div class="h-full ${colorClass}" style="width: 100%"></div>
      </div>
    </div>
  `;
}

function getSessionClass(session) {
  if (session === 'Sáng') return 'bg-amber-100 text-amber-700';
  if (session === 'Chiều') return 'bg-blue-100 text-blue-700';
  return 'bg-indigo-100 text-indigo-700';
}

/**
 * Event Handler for Sample Data Button
 */
function handleLoadSample() {
  const textarea = document.getElementById('html-input');
  textarea.value = SAMPLE_UMS_HTML;
  textarea.classList.add('ring-2', 'ring-emerald-500', 'bg-emerald-50');
  setTimeout(() => {
    textarea.classList.remove('ring-2', 'ring-emerald-500', 'bg-emerald-50');
  }, 1000);
}

/**
 * Event Handler for Analyze Button
 */
function handleAnalyze() {
  const input = document.getElementById('html-input').value;
  if (!input.trim()) {
    alert('Vui lòng dán mã nguồn HTML!');
    return;
  }

  try {
    const data = parseScheduleHtml(input);
    if (data.length === 0) {
      alert('Không tìm thấy dữ liệu lịch giảng. Vui lòng kiểm tra lại mã nguồn đã dán!');
      return;
    }

    appState.scheduleData = data;
    appState.stats = calculateStatistics(data);
    appState.isAnalyzed = true;
    
    renderDashboard();
  } catch (error) {
    console.error(error);
    alert('Lỗi khi phân tích dữ liệu: ' + error.message);
  }
}

// Initial Kickoff
document.addEventListener('DOMContentLoaded', renderInputScreen);
