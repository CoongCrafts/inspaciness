import { stringToNum } from '@/utils/number';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timeZone from 'dayjs/plugin/timezone';
import UTC from 'dayjs/plugin/utc';

dayjs.extend(relativeTime);
dayjs.extend(UTC);
dayjs.extend(timeZone);

export const fromNow = (timestamp: string | number) => {
  return dayjs(timestampToDate(timestamp)).fromNow();
};

export const timestampToDate = (timestamp: string | number) => {
  if (typeof timestamp === 'string') {
    timestamp = stringToNum(timestamp) as number;
  }

  return new Date(timestamp);
};

export const now = () => {
  return new Date();
};

export const formatDate = (timestamp: string | number) => {
  const date = timestampToDate(timestamp);

  return dayjs(date).format('YYYY-MM-DDThh:mm');
};
