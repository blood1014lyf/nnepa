/**
 * Authoritative Server-Side Orders Database
 * Stores orders with sequential order numbers and cryptographically random public IDs.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export type OrderStatus = 'new' | 'confirmed' | 'shipped' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
  notes?: string;
}

export interface StoredOrder {
  orderNumber: number;         // Sequential: 1001, 1002, ...
  publicId: string;            // Hard-to-guess public ID: e.g. ord_7a8f1b2c3d4e
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const INITIAL_ORDER_NUMBER = 1001;

// Ensure database file exists
function ensureStorage(): void {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {}
  }
  if (!fs.existsSync(ORDERS_FILE)) {
    try {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify({ nextOrderNumber: INITIAL_ORDER_NUMBER, orders: [] }, null, 2));
    } catch {}
  }
}

interface StoragePayload {
  nextOrderNumber: number;
  orders: StoredOrder[];
}

function readStorage(): StoragePayload {
  ensureStorage();
  try {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.nextOrderNumber === 'number' && Array.isArray(parsed.orders)) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed reading orders storage:', err);
  }
  return { nextOrderNumber: INITIAL_ORDER_NUMBER, orders: [] };
}

function writeStorage(payload: StoragePayload): void {
  ensureStorage();
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed writing orders storage:', err);
  }
}

export async function createOrder(data: {
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}): Promise<StoredOrder> {
  const store = readStorage();
  const orderNumber = store.nextOrderNumber;
  store.nextOrderNumber += 1;

  // Cryptographically random, hard-to-guess public ID
  const publicId = `ord_${crypto.randomBytes(8).toString('hex')}`;
  const now = new Date().toISOString();

  const newOrder: StoredOrder = {
    orderNumber,
    publicId,
    customer: {
      name: data.customer.name.trim(),
      phone: data.customer.phone.trim(),
      address: data.customer.address.trim(),
      notes: data.customer.notes ? data.customer.notes.trim() : ''
    },
    items: data.items,
    subtotal: data.subtotal,
    deliveryFee: data.deliveryFee,
    total: data.total,
    status: 'new',
    createdAt: now,
    updatedAt: now
  };

  store.orders.unshift(newOrder);
  writeStorage(store);

  return newOrder;
}

export async function getOrderByPublicId(publicId: string): Promise<StoredOrder | null> {
  const store = readStorage();
  const found = store.orders.find((o) => o.publicId === publicId);
  return found || null;
}

export async function getOrderByNumber(orderNumber: number): Promise<StoredOrder | null> {
  const store = readStorage();
  const found = store.orders.find((o) => o.orderNumber === orderNumber);
  return found || null;
}

export async function listAllOrders(): Promise<StoredOrder[]> {
  const store = readStorage();
  return store.orders;
}

export async function updateOrderStatus(
  orderIdentifier: string | number,
  status: OrderStatus
): Promise<StoredOrder | null> {
  const store = readStorage();
  const orderIndex = store.orders.findIndex((o) => {
    if (typeof orderIdentifier === 'number') {
      return o.orderNumber === orderIdentifier;
    }
    return o.publicId === orderIdentifier || String(o.orderNumber) === orderIdentifier;
  });

  if (orderIndex === -1) {
    return null;
  }

  store.orders[orderIndex].status = status;
  store.orders[orderIndex].updatedAt = new Date().toISOString();
  writeStorage(store);

  return store.orders[orderIndex];
}
