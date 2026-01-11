
/**
 * Parses UMS schedule HTML into an array of teaching objects.
 */
export const parseScheduleHtml = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const classes = [];
  
  const rows = Array.from(doc.querySelectorAll('tr'));
  let currentWeek = '';

  rows.forEach((row) => {
    // Check if it's a week header row
    const weekTd = row.querySelector('.hitec-td-tkbTuan');
    if (weekTd) {
      currentWeek = weekTd.textContent?.trim() || '';
      return;
    }

    // Process cells in Sang/Chieu/Toi rows
    const cells = Array.from(row.querySelectorAll('td'));
    if (cells.length >= 7) {
      let session = 'Sáng';
      const firstCell = cells[0];
      if (firstCell.classList.contains('hitec-td-tkbChieu')) session = 'Chiều';
      if (firstCell.classList.contains('hitec-td-tkbToi')) session = 'Tối';

      // Day columns usually start from index 1 to 7 (Mon-Sun)
      cells.forEach((cell, dayIndex) => {
        // dayIndex 0 is usually the "Session" label, but we check if it has content
        const anchors = Array.from(cell.querySelectorAll('a'));
        anchors.forEach((a) => {
          const title = a.getAttribute('title') || '';
          const dataContent = a.getAttribute('data-content') || '';
          const courseCode = a.querySelector('strong')?.textContent || '';

          const roomMatch = dataContent.match(/Phòng học: ([^<]*)/);
          const slotsMatch = dataContent.match(/Tiết: (\d+) - (\d+)/);
          const teacherMatch = dataContent.match(/Giáo viên: ([^<]*)/);

          const room = roomMatch ? roomMatch[1].trim() : 'N/A';
          const startSlot = parseInt(slotsMatch ? slotsMatch[1] : 0);
          const endSlot = parseInt(slotsMatch ? slotsMatch[2] : 0);
          const teacher = teacherMatch ? teacherMatch[1].trim() : 'N/A';

          classes.push({
            id: Math.random().toString(36).substring(2, 11),
            courseCode,
            title,
            room,
            slots: `${startSlot} - ${endSlot}`,
            startSlot,
            endSlot,
            teacher,
            weekRange: currentWeek,
            dayOfWeek: dayIndex - 1, // Normalized: 0 for Mon, 6 for Sun (assuming index 0 is session label)
            session
          });
        });
      });
    }
  });

  return classes;
};

/**
 * Calculates summary statistics from the parsed class array.
 */
export const calculateStatistics = (classes) => {
  const stats = {
    totalClasses: classes.length,
    totalPeriods: 0,
    uniqueSubjects: new Set(classes.map(c => c.courseCode)).size,
    uniqueRooms: new Set(classes.map(c => c.room)),
    dayDistribution: [0, 0, 0, 0, 0, 0, 0], // Mon-Sun
    roomUsage: {},
    subjectUsage: {},
  };

  classes.forEach(c => {
    stats.totalPeriods += (c.endSlot - c.startSlot + 1);
    // Boundary check for dayOfWeek
    if (c.dayOfWeek >= 0 && c.dayOfWeek < 7) {
        stats.dayDistribution[c.dayOfWeek]++;
    }
    
    stats.roomUsage[c.room] = (stats.roomUsage[c.room] || 0) + 1;
    stats.subjectUsage[c.title] = (stats.subjectUsage[c.title] || 0) + 1;
  });

  return stats;
};
