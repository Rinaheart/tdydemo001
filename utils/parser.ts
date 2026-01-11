
import { TeachingClass } from '../types';

export const parseScheduleHtml = (html: string): TeachingClass[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const classes: TeachingClass[] = [];
  
  const rows = Array.from(doc.querySelectorAll('tr'));
  let currentWeek = '';

  rows.forEach((row) => {
    // Check if it's a week row
    const weekTd = row.querySelector('.hitec-td-tkbTuan');
    if (weekTd) {
      currentWeek = weekTd.textContent?.trim() || '';
      return;
    }

    // Process cells in Sang/Chieu/Toi rows
    const cells = Array.from(row.querySelectorAll('td'));
    if (cells.length >= 7) {
      // Determine session type based on class
      let session: 'Sang' | 'Chieu' | 'Toi' = 'Sang';
      const firstCell = cells[0];
      if (firstCell.classList.contains('hitec-td-tkbChieu')) session = 'Chieu';
      if (firstCell.classList.contains('hitec-td-tkbToi')) session = 'Toi';

      cells.forEach((cell, dayIndex) => {
        const anchors = Array.from(cell.querySelectorAll('a'));
        anchors.forEach((a) => {
          const title = a.getAttribute('title') || '';
          const dataContent = a.getAttribute('data-content') || '';
          const courseCode = a.querySelector('strong')?.textContent || '';

          // Parse data-content (Format: Phòng học: .B.102<br />Tiết: 1 - 4 (Thực dạy <b>0</b> tiết)<br />Giáo viên: ...)
          const roomMatch = dataContent.match(/Phòng học: ([^<]*)/);
          const slotsMatch = dataContent.match(/Tiết: (\d+) - (\d+)/);
          const teacherMatch = dataContent.match(/Giáo viên: ([^<]*)/);

          const room = roomMatch ? roomMatch[1].trim() : 'N/A';
          const startSlot = slotsMatch ? parseInt(slotsMatch[1]) : 0;
          const endSlot = slotsMatch ? parseInt(slotsMatch[2]) : 0;
          const teacher = teacherMatch ? teacherMatch[1].trim() : 'N/A';

          classes.push({
            id: Math.random().toString(36).substr(2, 9),
            courseCode,
            title,
            room,
            slots: `${startSlot} - ${endSlot}`,
            startSlot,
            endSlot,
            teacher,
            weekRange: currentWeek,
            dayOfWeek: dayIndex,
            session
          });
        });
      });
    }
  });

  return classes;
};

export const calculateStatistics = (classes: TeachingClass[]) => {
  const stats = {
    totalClasses: classes.length,
    totalPeriods: 0,
    uniqueSubjects: new Set(classes.map(c => c.courseCode)).size,
    uniqueRooms: new Set(classes.map(c => c.room)),
    dayDistribution: [0, 0, 0, 0, 0, 0, 0],
    roomUsage: {} as Record<string, number>,
    subjectUsage: {} as Record<string, number>,
  };

  classes.forEach(c => {
    stats.totalPeriods += (c.endSlot - c.startSlot + 1);
    stats.dayDistribution[c.dayOfWeek]++;
    
    stats.roomUsage[c.room] = (stats.roomUsage[c.room] || 0) + 1;
    stats.subjectUsage[c.title] = (stats.subjectUsage[c.title] || 0) + 1;
  });

  return stats;
};
