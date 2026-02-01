
import { addDays, isWeekend, format, isAfter, endOfDay } from 'date-fns';
import { UserRole } from './types';

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
  return isAfter(new Date(), endOfDay(new Date(dueDate)));
};

export const formatPhoneNumber = (value: string): string => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');

  // 02 (Seoul) special case
  if (cleaned.startsWith('02')) {
    if (cleaned.length < 3) return cleaned;
    if (cleaned.length < 6) return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
    if (cleaned.length < 10) return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`;
  }

  // Mobile / VOIP / Other Area Codes
  if (cleaned.length < 4) return cleaned;
  if (cleaned.length < 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  if (cleaned.length < 11) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
};

export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN: return '관리자';
    case UserRole.SUPPORT_LEAD: return '지원책임';
    case UserRole.SUPPORT: return '지원담당';
    case UserRole.CUSTOMER: return '고객담당';
    default: return role;
  }
};
