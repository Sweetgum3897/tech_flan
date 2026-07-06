const request = require('supertest');
const app = require('../app');

const mockItems = [
  { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
  { id: 2, name: 'Noise Cancelling Headphones', category: 'Electronics', price: 399 },
  { id: 3, name: 'Ultra-Wide Monitor', category: 'Electronics', price: 999 },
  { id: 4, name: 'Ergonomic Chair', category: 'Furniture', price: 799 },
  { id: 5, name: 'Standing Desk', category: 'Furniture', price: 1199 },
];

jest.mock('../data/itemsStore', () => ({
  readItems: jest.fn(),
  writeItems: jest.fn(),
  DATA_PATH: '/mock/items.json',
}));

jest.mock('../services/statsCache', () => ({
  invalidateCache: jest.fn(),
}));

const { readItems, writeItems } = require('../data/itemsStore');

describe('GET /api/items', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    readItems.mockResolvedValue([...mockItems]);
  });

  it('returns paginated items', async () => {
    const res = await request(app).get('/api/items?page=1&limit=2');

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2);
    expect(res.body.total).toBe(5);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(2);
    expect(res.body.totalPages).toBe(3);
  });

  it('filters items by search query', async () => {
    const res = await request(app).get('/api/items?q=laptop');

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].name).toBe('Laptop Pro');
    expect(res.body.total).toBe(1);
  });

  it('returns 500 when read fails', async () => {
    readItems.mockRejectedValue(new Error('Read failed'));

    const res = await request(app).get('/api/items');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Read failed');
  });
});

describe('GET /api/items/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    readItems.mockResolvedValue([...mockItems]);
  });

  it('returns a single item', async () => {
    const res = await request(app).get('/api/items/2');

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Noise Cancelling Headphones');
  });

  it('returns 404 when item is missing', async () => {
    const res = await request(app).get('/api/items/999');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Item not found');
  });
});

describe('POST /api/items', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    readItems.mockResolvedValue([...mockItems]);
    writeItems.mockResolvedValue();
  });

  it('creates a new item', async () => {
    const payload = { name: 'Desk Lamp', category: 'Furniture', price: 49 };

    const res = await request(app).post('/api/items').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Desk Lamp');
    expect(res.body.id).toBeDefined();
    expect(writeItems).toHaveBeenCalledTimes(1);
  });

  it('returns 400 for invalid payload', async () => {
    const res = await request(app).post('/api/items').send({ name: 'Incomplete' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('name, category, and price are required');
    expect(writeItems).not.toHaveBeenCalled();
  });
});
