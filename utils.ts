
import { addDays, isWeekend, format, isAfter } from 'date-fns';

/**
 * Calculates a date after N business days (excluding Saturday and Sunday).
 */
export const addBusinessDays = (startDate: Date, days: number): Date => {
  let count = 0;
  let currentDate = startDate;
  while (count < days) {
    currentDate = addDays(currentDate, 1);
    if (!isWeekend(currentDate)) {
      count++;
    }
  }
  return currentDate;
};

export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'yyyy-MM-dd HH:mm');
};

export const isOverdue = (dueDate: string): boolean => {
  return isAfter(new Date(), new Date(dueDate));
};
