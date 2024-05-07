import dayjs from "dayjs";

const getNextDayAtTen = () => {
  return dayjs().add(1, "day").startOf("day").hour(10);
};

const nextDayAtTen = getNextDayAtTen();

const getSevenDaysLaterAtMidnight = () => {
  return dayjs().add(7, "day").startOf("day").hour(23).minute(59);
};

const sevenDaysLaterAtMidnight = getSevenDaysLaterAtMidnight();

export { nextDayAtTen, sevenDaysLaterAtMidnight };
