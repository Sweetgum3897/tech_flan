function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function computeStats(items) {
  return {
    total: items.length,
    averagePrice: mean(items.map((item) => item.price)),
  };
}

module.exports = { mean, computeStats };
