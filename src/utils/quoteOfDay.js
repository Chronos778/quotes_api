const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Mulberry32 pseudo-random number generator
const getSeededRandom = (seed) => {
  let t = seed + 0x6D2B79F5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const getQuoteOffsetForDate = (count, date = new Date()) => {
  const total = Number(count);
  if (!Number.isInteger(total) || total <= 0) {
    return null;
  }

  // Create a unique integer seed for the UTC date (e.g., 20260709)
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // 1-12
  const day = date.getUTCDate(); // 1-31
  const seed = year * 10000 + month * 100 + day;

  // Generate a deterministic random fraction between 0 and 1
  const randomFraction = getSeededRandom(seed);
  
  // Pick a random offset based on the total count
  return Math.floor(randomFraction * total);
};

module.exports = {
  getQuoteOffsetForDate
};
