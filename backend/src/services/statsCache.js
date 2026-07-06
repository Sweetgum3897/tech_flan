const fs = require('fs');
const { readItems, DATA_PATH } = require('../data/itemsStore');
const { computeStats } = require('../utils/stats');

let cachedStats = null;

async function refreshStats() {
  const items = await readItems();
  cachedStats = computeStats(items);
  return cachedStats;
}

async function getStats() {
  if (!cachedStats) {
    await refreshStats();
  }
  return cachedStats;
}

function invalidateCache() {
  cachedStats = null;
}

fs.watch(DATA_PATH, () => {
  invalidateCache();
});

module.exports = { getStats, refreshStats, invalidateCache };
