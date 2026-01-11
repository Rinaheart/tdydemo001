
import React, { useState, useCallback, useMemo } from 'react';
import { TeachingClass, Statistics } from './types';
import { parseScheduleHtml, calculateStatistics } from './utils/parser';
import WorkloadChart from './components/WorkloadChart';

const App: React.FC = () => {
  const [htmlInput, setHtmlInput] = useState<string>('');
  const [scheduleData, setScheduleData] = useState<TeachingClass[]>([]);
  const [isAnalyzed, setIsAnalyzed] = useState<boolean>(false);

  const stats = useMemo(() => calculateStatistics(scheduleData), [scheduleData]);

  const handleAnalyze = useCallback(() => {
    if (!htmlInput.trim()) {
      alert('Vui lòng dán mã nguồn HTML của lịch giảng vào ô bên dưới!');
      return;
    }
    try {
      const parsed = parseScheduleHtml(htmlInput);
      if (parsed.length === 0) {
        alert('Không tìm thấy dữ liệu lịch giảng hợp lệ. Vui lòng kiểm tra lại mã nguồn!');
        return;
      }
      setScheduleData(parsed);
      setIsAnalyzed(true);
    } catch (error) {
      console.error(error);
      alert('Đã xảy ra lỗi khi phân tích HTML!');
    }
  }, [htmlInput]);

  const handleReset = () => {
    setHtmlInput('');
    setScheduleData([]);
    setIsAnalyzed(false);
  };

  const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-indigo-700 text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Phân Tích Lịch Giảng v.01</h1>
              <p className="text-indigo-100 mt-1 opacity-90">Công cụ trích xuất và thống kê dữ liệu đào tạo cho Giảng viên</p>
            </div>
            {isAnalyzed && (
              <button 
                onClick={handleReset}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium transition-all backdrop-blur-sm"
              >
                Làm mới ứng dụng
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 -mt-6">
        {!isAnalyzed ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-8">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm">1</span>
                  Bắt đầu phân tích
                </h2>
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-lg">
                  <p className="text-amber-800 text-sm">
                    <strong>Hướng dẫn:</strong> Truy cập vào trang Lịch trình giảng dạy, nhấn <code>Ctrl + U</code> (Xem mã nguồn) hoặc nhấn chuột phải chọn "Xem nguồn trang", sau đó <code>Ctrl + A</code> (Chọn tất cả) và <code>Ctrl + C</code> (Sao chép). Dán toàn bộ vào ô dưới đây.
                  </p>
                </div>
                <textarea
                  className="w-full h-80 p-4 border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-slate-50"
                  placeholder="Dán mã nguồn HTML (<html>...</html>) tại đây..."
                  value={htmlInput}
                  onChange={(e) => setHtmlInput(e.target.value)}
                />
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleAnalyze}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold py-4 px-12 rounded-2xl shadow-lg transition-all transform hover:-translate-y-1"
                  >
                    Bắt đầu phân tích dữ liệu ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 mt-10">
            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <p className="text-sm font-medium text-slate-500 uppercase">Tổng số buổi dạy</p>
                <h4 className="text-3xl font-bold text-slate-900 mt-2">{stats.totalClasses}</h4>
                <div className="w-full h-1 bg-slate-100 mt-4 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <p className="text-sm font-medium text-slate-500 uppercase">Tổng số tiết thực hiện</p>
                <h4 className="text-3xl font-bold text-slate-900 mt-2">{stats.totalPeriods}</h4>
                <div className="w-full h-1 bg-slate-100 mt-4 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <p className="text-sm font-medium text-slate-500 uppercase">Số học phần đảm nhận</p>
                <h4 className="text-3xl font-bold text-slate-900 mt-2">{stats.uniqueSubjects}</h4>
                <div className="w-full h-1 bg-slate-100 mt-4 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <p className="text-sm font-medium text-slate-500 uppercase">Tổng số phòng học</p>
                <h4 className="text-3xl font-bold text-slate-900 mt-2">{stats.uniqueRooms.size}</h4>
                <div className="w-full h-1 bg-slate-100 mt-4 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chart */}
              <div className="lg:col-span-2">
                <WorkloadChart data={stats.dayDistribution} />
              </div>
              
              {/* Room Usage */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-500 mb-6 uppercase tracking-wider">Top phòng học sử dụng</h3>
                <div className="space-y-4">
                  {Object.entries(stats.roomUsage)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 6)
                    .map(([room, count]) => (
                      <div key={room} className="flex items-center justify-between">
                        <span className="text-slate-700 font-medium">Phòng {room}</span>
                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">{count} buổi</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">Danh sách các buổi giảng dạy chi tiết</h3>
                <span className="text-sm text-slate-500">Đã trích xuất {scheduleData.length} bản ghi</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
                      <th className="px-6 py-4">Môn học / Nhóm</th>
                      <th className="px-6 py-4">Thời gian</th>
                      <th className="px-6 py-4">Phòng</th>
                      <th className="px-6 py-4">Tiết</th>
                      <th className="px-6 py-4">Tuần</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {scheduleData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{item.courseCode}</div>
                          <div className="text-xs text-slate-500 mt-0.5 max-w-xs truncate" title={item.title}>{item.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            item.session === 'Sang' ? 'bg-amber-100 text-amber-700' : 
                            item.session === 'Chieu' ? 'bg-blue-100 text-blue-700' : 
                            'bg-indigo-100 text-indigo-700'
                          }`}>
                            {dayNames[item.dayOfWeek]} - {item.session}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-medium">{item.room}</td>
                        <td className="px-6 py-4 text-slate-700">{item.slots}</td>
                        <td className="px-6 py-4 text-slate-500 text-xs italic">{item.weekRange.replace('Từ ngày:', '')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-slate-200 py-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm italic">
            Phiên bản v.01 Beta - Dành riêng cho hệ thống UMS trường Y Dược
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
