const express = require('express');
const { readItems, writeItems } = require('../data/itemsStore');
const { invalidateCache } = require('../services/statsCache');

const router = express.Router();

function filterItems(items, q) {
  if (!q) return items;
  const query = q.toLowerCase();
  return items.filter((item) => item.name.toLowerCase().includes(query));
}

function paginateItems(items, page, limit) {
  const safeLimit = Math.max(1, Math.min(limit, 100));
  const safePage = Math.max(1, page);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const offset = (safePage - 1) * safeLimit;

  return {
    items: items.slice(offset, offset + safeLimit),
    total,
    page: safePage,
    limit: safeLimit,
    totalPages,
  };
}

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const data = await readItems();
    const q = req.query.q || '';
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    const filtered = filterItems(data, q);
    res.json(paginateItems(filtered, page, limit));
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readItems();
    const item = data.find((i) => i.id === parseInt(req.params.id, 10));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    const { name, category, price } = req.body;

    if (!name || !category || price == null) {
      const err = new Error('name, category, and price are required');
      err.status = 400;
      throw err;
    }

    const data = await readItems();
    const item = {
      id: Date.now(),
      name: String(name),
      category: String(category),
      price: Number(price),
    };

    data.push(item);
    await writeItems(data);
    invalidateCache();
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
