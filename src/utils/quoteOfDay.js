const MS_PER_DAY = 1000 * 60 * 60 * 24;

const getUtcDayOfYear = (date = new Date()) => {
  const year = date.getUTCFullYear();
  const startOfYearUtc = Date.UTC(year, 0, 1);
  const todayUtc = Date.UTC(year, date.getUTCMonth(), date.getUTCDate());
  return Math.floor((todayUtc - startOfYearUtc) / MS_PER_DAY);
};

const getQuoteOffsetForDate = (count, date = new Date()) => {
  const total = Number(count);
  if (!Number.isInteger(total) || total <= 0) {
    return null;
  }

  return getUtcDayOfYear(date) % total;
};

module.exports = {
  getQuoteOffsetForDate
};
