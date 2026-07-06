const fs = require('fs').promises;
const path = require('path');

const DATA_PATH = path.join(__dirname, '../../../data/items.json');

async function readItems() {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

async function writeItems(items) {
  await fs.writeFile(DATA_PATH, JSON.stringify(items, null, 2), 'utf8');
}

module.exports = { readItems, writeItems, DATA_PATH };
