
export interface TeachingClass {
  id: string;
  courseCode: string;
  title: string;
  room: string;
  slots: string;
  startSlot: number;
  endSlot: number;
  teacher: string;
  weekRange: string;
  dayOfWeek: number; // 0 for Monday, 6 for Sunday
  session: 'Sang' | 'Chieu' | 'Toi';
}

export interface Statistics {
  totalClasses: number;
  totalPeriods: number;
  uniqueSubjects: number;
  uniqueRooms: Set<string>;
  dayDistribution: number[];
  roomUsage: Record<string, number>;
  subjectUsage: Record<string, number>;
}
