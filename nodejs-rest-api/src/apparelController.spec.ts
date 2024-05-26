import request from 'supertest';
import app from './index';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(__dirname, 'data/stock.json');

const resetDataFile = () => {
  fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), 'utf8');
};

describe('Apparel API', () => {
  beforeEach(() => {
    resetDataFile();
  });

  it('should update the stock quality and price of one apparel code and size', async () => {
    const response = await request(app)
      .put('/api/apparel/update-single')
      .send({
        code: 'A001',
        size: 'M',
        quantity: 100,
        price: 20
      });

    expect(response.status).toBe(200);
    expect(response.text).toBe('Stock updated successfully');
  });

  it('should update the stock quality and price of several apparel codes and sizes', async () => {
    const response = await request(app)
      .put('/api/apparel/update')
      .send([
        { code: 'A002', size: 'L', quantity: 150, price: 25 },
        { code: 'A003', size: 'S', quantity: 50, price: 15 }
      ]);

    expect(response.status).toBe(200);
    expect(response.text).toBe('Stock updated successfully');
  });

  it('should check if an order can be fulfilled', async () => {
    await request(app)
      .put('/api/apparel/update')
      .send([
        { code: 'A002', size: 'L', quantity: 150, price: 25 }
      ]);

    const response = await request(app)
      .post('/api/apparel/check-order')
      .send([
        { code: 'A002', size: 'L', quantity: 100 }
      ]);

    expect(response.status).toBe(200);
    expect(response.body.canFulfill).toBe(true);
  });

  it('should return false if an order cannot be fulfilled', async () => {
    await request(app)
      .put('/api/apparel/update')
      .send([
        { code: 'A002', size: 'L', quantity: 50, price: 25 }
      ]);

    const response = await request(app)
      .post('/api/apparel/check-order')
      .send([
        { code: 'A002', size: 'L', quantity: 100 }
      ]);

    expect(response.status).toBe(200);
    expect(response.body.canFulfill).toBe(false);
  });

  it('should get the lowest cost to fulfill an order', async () => {
    await request(app)
      .put('/api/apparel/update')
      .send([
        { code: 'A002', size: 'L', quantity: 150, price: 25 }
      ]);

    const response = await request(app)
      .post('/api/apparel/lowest-cost')
      .send([
        { code: 'A002', size: 'L', quantity: 100 }
      ]);

    expect(response.status).toBe(200);
    expect(response.body.totalCost).toBe(2500); // 100 * 25
  });

  it('should return an error if the order cannot be fulfilled', async () => {
    await request(app)
      .put('/api/apparel/update')
      .send([
        { code: 'A002', size: 'L', quantity: 50, price: 25 }
      ]);

    const response = await request(app)
      .post('/api/apparel/lowest-cost')
      .send([
        { code: 'A002', size: 'L', quantity: 100 }
      ]);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Order cannot be fulfilled');
  });
});
