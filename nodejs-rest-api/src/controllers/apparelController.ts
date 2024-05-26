
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import Apparel from '../models/apparel';

const dataFilePath = path.join(__dirname, '../data/stock.json');

const readData = (): Apparel[] => {
  const jsonData = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(jsonData);
};

const writeData = (data: Apparel[]): void => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
};

export const updateSingleStock = (req: Request, res: Response): void => {
  const { code, size, quantity, price }: Apparel = req.body;
  const existingData = readData();

  const index = existingData.findIndex(item => item.code === code && item.size === size);
  if (index > -1) {
    existingData[index] = { code, size, quantity, price };
  } else {
    existingData.push({ code, size, quantity, price });
  }

  writeData(existingData);
  res.status(200).send('Stock updated successfully');
};


export const updateStock = (req: Request, res: Response): void => {
  const newData: Apparel[] = req.body;
  const existingData = readData();

  newData.forEach(newItem => {
    const index = existingData.findIndex(item => item.code === newItem.code && item.size === newItem.size);
    if (index > -1) {
      existingData[index] = newItem;
    } else {
      existingData.push(newItem);
    }
  });

  writeData(existingData);
  res.status(200).send('Stock updated successfully');
};

export const checkOrder = (req: Request, res: Response): void => {
  const order: Apparel[] = req.body;
  const existingData = readData();

  const canFulfill = order.every(orderItem => {
    const item = existingData.find(dataItem => dataItem.code === orderItem.code && dataItem.size === orderItem.size);
    return item && item.quantity >= orderItem.quantity;
  });

  res.status(200).json({ canFulfill });
};

export const getLowestCost = (req: Request, res: Response): void => {
  const order: Apparel[] = req.body;
  const existingData = readData();

  let totalCost = 0;
  let canFulfill = true;

  order.forEach(orderItem => {
    const item = existingData.find(dataItem => dataItem.code === orderItem.code && dataItem.size === orderItem.size);
    if (item && item.quantity >= orderItem.quantity) {
      totalCost += item.price * orderItem.quantity;
    } else {
      canFulfill = false;
    }
  });

  if (canFulfill) {
    res.status(200).json({ totalCost });
  } else {
    res.status(400).send('Order cannot be fulfilled');
  }
};
