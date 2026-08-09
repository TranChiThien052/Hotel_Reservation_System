import dayjs, { Dayjs } from 'dayjs';


export const disableStartDate = (current: Dayjs, endDate?: Dayjs | null) => {
  if (!endDate) return false;

  return current.isAfter(endDate, 'day');
};

export const disableEndDate = (current: Dayjs, startDate?: Dayjs | null) => {
  if (!startDate) return false;

  return current.isBefore(startDate, 'day');
};


export const disableStartDateNotPast = (current: Dayjs, endDate?: Dayjs | null) => {
  const isPastDate = current && current < dayjs().startOf('day');

  const isAfterEndDate = endDate && current.isAfter(endDate, 'day');

  return isPastDate || isAfterEndDate;
};


export const disableEndDateNotPast = (current: Dayjs, startDate?: Dayjs | null) => {
  const isPastDate = current && current < dayjs().startOf('day');

  const isBeforeStartDate = startDate && current.isBefore(startDate, 'day');

  return isPastDate || isBeforeStartDate;
};
