
// Define the interface for a teaching class session extracted from UMS
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
  dayOfWeek: number;
  session: 'Sang' | 'Chieu' | 'Toi';
}
