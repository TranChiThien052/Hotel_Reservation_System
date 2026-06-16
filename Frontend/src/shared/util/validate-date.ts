import dayjs, { Dayjs } from 'dayjs';

/**
 * Date "Từ ngày"
 * Không cho chọn lớn hơn "Đến ngày"
 */
export const disableStartDate = (current: Dayjs, endDate?: Dayjs | null) => {
  if (!endDate) return false;

  return current.isAfter(endDate, 'day');
};

/**
 * Date "Đến ngày"
 * Không cho chọn nhỏ hơn "Từ ngày"
 */
export const disableEndDate = (current: Dayjs, startDate?: Dayjs | null) => {
  if (!startDate) return false;

  return current.isBefore(startDate, 'day');
};

/**
 * Date "Từ ngày"
 * Không cho chọn nhỏ hơn ngày hiện tại và không cho chọn lớn hơn "Đến ngày"
 */
export const disableStartDateNotPast = (current: Dayjs, endDate?: Dayjs | null) => {
  const isPastDate = current && current < dayjs().startOf('day');

  const isAfterEndDate = endDate && current.isAfter(endDate, 'day');

  return isPastDate || isAfterEndDate;
};

/**
 * Date "Đến ngày"
 * Không cho chọn nhỏ hơn ngày hiện tại và không cho chọn lớn hơn "Từ ngày"
 */
export const disableEndDateNotPast = (current: Dayjs, startDate?: Dayjs | null) => {
  const isPastDate = current && current < dayjs().startOf('day');

  const isBeforeStartDate = startDate && current.isBefore(startDate, 'day');

  return isPastDate || isBeforeStartDate;
};
