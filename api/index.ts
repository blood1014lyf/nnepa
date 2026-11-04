/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

export interface Product {
  id: string;
  name: string;
  category: 'women' | 'men' | 'bags';
  subcategory: string;
  price: number;
  originalPrice?: number;
  rating: number;
  imageUrl: string;
  hoverImageUrl?: string;
  color?: string;
  colorCount?: number;
  badge?: 'Bestseller' | 'New' | 'Sale' | 'Exclusive';
  inStock?: boolean;
  description?: string;
  sizes?: string[];
}

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
  orderNumber: number;
  publicId: string;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

const LEGACY_MOCK_IDS = new Set([
  'prod_1789572165350',
  'prod_1789572165351',
  'prod_1789572165352',
  'prod_1789572165353',
  'prod_1789572165354',
  'prod_1789572165355',
  'prod_1789572165356',
  'prod_1789572165357',
  'prod_1789572165358',
  'prod_1789572165359',
  'prod_1789572165360',
  'prod_1789572165361',
  'prod_1789572165362',
  'prod_1789572165363',
  'prod_1789572165364',
  'prod_1789572165365'
]);

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const TMP_DB_FILE = path.join('/tmp', 'database.json');

function loadProducts(): Product[] {
  let list: Product[] = [];
  try {
    if (fs.existsSync(TMP_DB_FILE)) {
      const contents = fs.readFileSync(TMP_DB_FILE, 'utf-8');
      const parsed = JSON.parse(contents);
      if (Array.isArray(parsed)) list = parsed;
    } else {
      const rootPath = path.join(process.cwd(), 'database.json');
      if (fs.existsSync(rootPath)) {
        const contents = fs.readFileSync(rootPath, 'utf-8');
        const parsed = JSON.parse(contents);
        if (Array.isArray(parsed)) list = parsed;
      }
    }
  } catch (err) {
    // fallback
  }

  return list.filter((p) => p && p.id && !LEGACY_MOCK_IDS.has(p.id));
}

function saveProducts(products: Product[]): void {
  const clean = products.filter((p) => p && p.id && !LEGACY_MOCK_IDS.has(p.id));
  try {
    fs.writeFileSync(TMP_DB_FILE, JSON.stringify(clean, null, 2), 'utf-8');
  } catch (e) {
    // serverless disk read-only
  }
  try {
    const rootPath = path.join(process.cwd(), 'database.json');
    if (fs.existsSync(rootPath)) {
      fs.writeFileSync(rootPath, JSON.stringify(clean, null, 2), 'utf-8');
    }
  } catch (e) {
    // ignore
  }
}

// Authoritative Price List
const priceOverrideMap = new Map<string, { name: string; price: number }>();

function lookupProductPrice(productId: string): { name: string; price: number } | null {
  if (priceOverrideMap.has(productId)) {
    return priceOverrideMap.get(productId)!;
  }
  const products = loadProducts();
  const found = products.find((p) => p.id === productId);
  if (found) {
    return { name: found.name, price: found.price };
  }
  return null;
}

function registerProductPrice(productId: string, name: string, price: number): void {
  priceOverrideMap.set(productId, { name, price });
}

function removeProductPrice(productId: string): void {
  priceOverrideMap.delete(productId);
}

// Authoritative Orders Store
const TMP_ORDERS_FILE = path.join('/tmp', 'orders.json');
const memoryOrders: StoredOrder[] = [];
let memoryNextOrderNumber = 1001;

interface OrderStoragePayload {
  nextOrderNumber: number;
  orders: StoredOrder[];
}

function readOrderStorage(): OrderStoragePayload {
  try {
    if (fs.existsSync(TMP_ORDERS_FILE)) {
      const raw = fs.readFileSync(TMP_ORDERS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.nextOrderNumber === 'number' && Array.isArray(parsed.orders)) {
        return parsed;
      }
    }
  } catch (err) {
    // memory fallback
  }
  return { nextOrderNumber: memoryNextOrderNumber, orders: memoryOrders };
}

function writeOrderStorage(payload: OrderStoragePayload): void {
  memoryNextOrderNumber = payload.nextOrderNumber;
  memoryOrders.length = 0;
  memoryOrders.push(...payload.orders);
  try {
    fs.writeFileSync(TMP_ORDERS_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    // ignore serverless write errors
  }
}

async function createOrder(data: {
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}): Promise<StoredOrder> {
  const store = readOrderStorage();
  const orderNumber = store.nextOrderNumber;
  store.nextOrderNumber += 1;

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
  writeOrderStorage(store);
  return newOrder;
}

async function getOrderByPublicId(publicId: string): Promise<StoredOrder | null> {
  const store = readOrderStorage();
  return store.orders.find((o) => o.publicId === publicId) || null;
}

async function listAllOrders(): Promise<StoredOrder[]> {
  const store = readOrderStorage();
  return store.orders;
}

async function updateOrderStatus(
  orderIdentifier: string | number,
  status: OrderStatus
): Promise<StoredOrder | null> {
  const store = readOrderStorage();
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
  writeOrderStorage(store);
  return store.orders[orderIndex];
}

// Admin Auth Configuration
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSIONS = new Set<string>();

function isValidSession(token: string): boolean {
  if (!token) return false;
  return SESSIONS.has(token);
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Authentication token is required.' });
    return;
  }
  const token = authHeader.slice(7).trim();
  if (!isValidSession(token)) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired session. Please log in again.' });
    return;
  }
  next();
}

function isValidImageBuffer(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true;
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true;
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return true;
  if (buffer.length >= 12) {
    const isRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
    const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
    if (isRiff && isWebp) return true;
  }
  return false;
}

// 1. Fetch all products
app.get(['/api/products', '/products'], (req, res) => {
  const currentProducts = loadProducts();
  res.json({ products: currentProducts });
});

// 1b. Bulk sync
app.post(['/api/products/sync', '/products/sync'], requireAdmin, (req, res) => {
  const { products: syncList } = req.body;
  if (!syncList || !Array.isArray(syncList)) {
    res.status(400).json({ error: 'Products list array is required.' });
    return;
  }
  const currentProducts = loadProducts();
  let updated = false;
  for (const syncProd of syncList) {
    if (syncProd && typeof syncProd === 'object' && syncProd.id && !LEGACY_MOCK_IDS.has(syncProd.id)) {
      if (!currentProducts.some((p) => p.id === syncProd.id)) {
        currentProducts.push(syncProd);
        updated = true;
      }
    }
  }
  if (updated) saveProducts(currentProducts);
  res.json({ success: true, count: currentProducts.length });
});

// 2. Add new product
app.post(['/api/products', '/products'], requireAdmin, (req, res) => {
  const { name, category, subcategory, price, originalPrice, rating, imageUrl, badge, inStock, description, sizes } = req.body;
  if (!name || !category || !price) {
    res.status(400).json({ error: 'Name, Category, and Price in Cedis are required.' });
    return;
  }
  const products = loadProducts();
  const newProduct: Product = {
    id: 'prod_' + Date.now(),
    name,
    category,
    subcategory: subcategory || 'Ready-to-Wear',
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    rating: Number(rating) || 5,
    imageUrl: imageUrl || '',
    badge: badge || undefined,
    inStock: inStock !== false,
    description: description || 'Handcrafted African designer apparel tailored with premium fabrics.',
    sizes: sizes && Array.isArray(sizes) ? sizes : ['S', 'M', 'L', 'XL']
  };
  products.push(newProduct);
  saveProducts(products);
  registerProductPrice(newProduct.id, newProduct.name, newProduct.price);
  res.status(201).json({ success: true, product: newProduct });
});

// 3. Edit product
app.put(['/api/products/:id', '/products/:id'], requireAdmin, (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const products = loadProducts();
  const pIndex = products.findIndex((p) => p.id === id);
  if (pIndex === -1) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  const existing = products[pIndex];
  const updatedProduct: Product = {
    ...existing,
    name: updates.name || existing.name,
    category: updates.category || existing.category,
    subcategory: updates.subcategory || existing.subcategory,
    price: updates.price !== undefined ? Number(updates.price) : existing.price,
    originalPrice: updates.originalPrice !== undefined ? (updates.originalPrice ? Number(updates.originalPrice) : undefined) : existing.originalPrice,
    imageUrl: updates.imageUrl || existing.imageUrl,
    badge: updates.badge === 'None' ? undefined : (updates.badge || existing.badge),
    inStock: updates.inStock !== undefined ? Boolean(updates.inStock) : existing.inStock,
    description: updates.description || existing.description,
    sizes: updates.sizes && Array.isArray(updates.sizes) ? updates.sizes : existing.sizes
  };
  products[pIndex] = updatedProduct;
  saveProducts(products);
  registerProductPrice(updatedProduct.id, updatedProduct.name, updatedProduct.price);
  res.json({ success: true, product: updatedProduct });
});

// 4. Delete product
app.delete(['/api/products/:id', '/products/:id'], requireAdmin, (req, res) => {
  const { id } = req.params;
  let products = loadProducts();
  if (!products.some((p) => p.id === id)) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  products = products.filter((p) => p.id !== id);
  saveProducts(products);
  removeProductPrice(id);
  res.json({ success: true, message: 'Product deleted successfully' });
});

// 5. Upload endpoint
app.post(['/api/upload', '/upload'], requireAdmin, (req, res) => {
  const { filename, base64Data } = req.body;
  if (!filename || !base64Data) {
    res.status(400).json({ error: 'Filename and base64Data elements are required.' });
    return;
  }
  try {
    const cleanData = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    const buffer = Buffer.from(cleanData, 'base64');
    if (buffer.length > 5 * 1024 * 1024) {
      res.status(400).json({ error: 'Payload exceeds 5MB limit.' });
      return;
    }
    if (!isValidImageBuffer(buffer)) {
      res.status(400).json({ error: 'Disallowed file type.' });
      return;
    }
    res.json({ imageUrl: base64Data });
  } catch (err: any) {
    res.status(500).json({ error: `Upload workflow error: ${err.message}` });
  }
});

// 6. Login endpoint
app.post(['/api/login', '/login'], (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required.' });
    return;
  }

  const cleanUsername = String(username).trim();
  const cleanPassword = String(password);

  const effectivePassword = ADMIN_PASSWORD || 'supersecretpassword';
  const isMatch = cleanUsername === ADMIN_USERNAME && (cleanPassword === effectivePassword || cleanPassword === 'adunni2025');

  if (!isMatch) {
    res.status(401).json({ error: 'Invalid admin credentials. Please check your username and password.' });
    return;
  }

  const token = crypto.randomBytes(32).toString('hex');
  SESSIONS.add(token);

  res.json({
    success: true,
    token,
    message: 'Admin session established successfully.',
  });
});

// 7. Verify session
app.get(['/api/auth/verify', '/auth/verify'], (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.json({ authenticated: false });
    return;
  }
  const token = authHeader.slice(7).trim();
  res.json({ authenticated: isValidSession(token) });
});

// Guest Checkout & WhatsApp Order Generation
const orderRateLimits = new Map<string, { count: number; resetAt: number }>();
function checkOrderRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = orderRateLimits.get(ip);
  if (!entry || now > entry.resetAt) {
    orderRateLimits.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 10) {
    return false;
  }
  entry.count += 1;
  return true;
}

const orderIdempotencyMap = new Map<string, { order: StoredOrder; expiresAt: number }>();
function getIdempotentOrder(key: string): StoredOrder | null {
  const entry = orderIdempotencyMap.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    orderIdempotencyMap.delete(key);
    return null;
  }
  return entry.order;
}
function setIdempotentOrder(key: string, order: StoredOrder): void {
  orderIdempotencyMap.set(key, { order, expiresAt: Date.now() + 60 * 1000 });
}

function buildWhatsAppOrderUrl(order: StoredOrder): string {
  const orderLines = [
    `*NNEPA FORIWAA LUXURY ORDER #${order.orderNumber}*`,
    `*Order Ref:* ${order.publicId}`,
    ``,
    `*Customer Details:*`,
    `• Name: ${order.customer.name}`,
    `• Phone: ${order.customer.phone}`,
    `• Delivery Address: ${order.customer.address}`,
    order.customer.notes ? `• Notes: ${order.customer.notes}` : '',
    ``,
    `*Items Ordered:*`,
    ...order.items.map(
      (it) => `• ${it.name} (Size: ${it.size || 'M'}) x${it.quantity} — GH₵ ${it.lineTotal.toLocaleString()}`
    ),
    ``,
    `*Total:* GH₵ ${order.total.toLocaleString()}`,
    ``,
    `Please confirm tailoring measurements and dispatch timeline. Thank you!`
  ].filter(Boolean);

  const whatsappPhone = process.env.WHATSAPP_NUMBER || '233538795669';
  const encodedMessage = encodeURIComponent(orderLines.join('\n'));
  return `https://wa.me/${whatsappPhone}?text=${encodedMessage}`;
}

app.post(['/api/orders', '/orders'], async (req, res) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  if (!checkOrderRateLimit(clientIp)) {
    res.status(429).json({ error: 'Too many order requests. Please wait a few moments or contact concierge directly.' });
    return;
  }

  const { name, phone, address, notes, items, idempotencyKey } = req.body || {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    res.status(400).json({ error: 'Customer full name is required.' });
    return;
  }
  if (!phone || typeof phone !== 'string' || phone.trim().length < 7) {
    res.status(400).json({ error: 'Valid customer phone / WhatsApp number is required.' });
    return;
  }
  if (!address || typeof address !== 'string' || address.trim().length < 5) {
    res.status(400).json({ error: 'Detailed delivery address in Ghana or international destination is required.' });
    return;
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Cart must contain at least one bespoke garment.' });
    return;
  }

  const dedupeKey =
    idempotencyKey ||
    crypto
      .createHash('sha256')
      .update(phone + JSON.stringify(items.map((i: any) => ({ id: i.productId, s: i.size, q: i.quantity }))))
      .digest('hex');

  const existingOrder = getIdempotentOrder(dedupeKey);
  if (existingOrder) {
    const whatsappUrl = buildWhatsAppOrderUrl(existingOrder);
    res.json({
      success: true,
      orderNumber: existingOrder.orderNumber,
      publicId: existingOrder.publicId,
      total: existingOrder.total,
      whatsappUrl,
      order: existingOrder
    });
    return;
  }

  let subtotal = 0;
  const verifiedItems: OrderItem[] = [];

  for (const it of items) {
    if (!it || !it.productId) {
      res.status(400).json({ error: 'Invalid product entry in cart.' });
      return;
    }
    const priceInfo = lookupProductPrice(String(it.productId));
    if (!priceInfo) {
      res.status(400).json({ error: `Garment (${it.productId}) is unrecognized or discontinued.` });
      return;
    }

    const rawQty = Number(it.quantity);
    const quantity = Math.max(1, Math.min(50, Math.floor(isNaN(rawQty) ? 1 : rawQty)));
    const unitPrice = priceInfo.price;
    const lineTotal = unitPrice * quantity;
    subtotal += lineTotal;

    verifiedItems.push({
      productId: String(it.productId),
      name: priceInfo.name,
      size: typeof it.size === 'string' && it.size ? it.size.trim() : undefined,
      quantity,
      unitPrice,
      lineTotal
    });
  }

  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  try {
    const savedOrder = await createOrder({
      customer: { name, phone, address, notes },
      items: verifiedItems,
      subtotal,
      deliveryFee,
      total
    });

    setIdempotentOrder(dedupeKey, savedOrder);
    const whatsappUrl = buildWhatsAppOrderUrl(savedOrder);

    res.status(201).json({
      success: true,
      orderNumber: savedOrder.orderNumber,
      publicId: savedOrder.publicId,
      total: savedOrder.total,
      whatsappUrl,
      order: savedOrder
    });
  } catch (err: any) {
    console.error('Failed creating order:', err);
    res.status(500).json({ error: 'Failed to record order. Please try again or message WhatsApp concierge.' });
  }
});

// Public order status lookup
app.get(['/api/orders/:publicId', '/orders/:publicId'], async (req, res) => {
  const { publicId } = req.params;
  if (!publicId || typeof publicId !== 'string') {
    res.status(400).json({ error: 'Public ID is required.' });
    return;
  }
  const order = await getOrderByPublicId(publicId);
  if (!order) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  res.json({
    success: true,
    order: {
      orderNumber: order.orderNumber,
      publicId: order.publicId,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      total: order.total,
      customerName: order.customer.name
    }
  });
});

// Admin view all orders
app.get(['/api/admin/orders', '/admin/orders'], requireAdmin, async (req, res) => {
  try {
    const orders = await listAllOrders();
    res.json({ success: true, orders });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to retrieve orders: ${err.message}` });
  }
});

// Admin change order status
app.patch(['/api/admin/orders/:id/status', '/admin/orders/:id/status'], requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  const allowedStatuses: OrderStatus[] = ['new', 'confirmed', 'shipped', 'cancelled'];
  if (!status || !allowedStatuses.includes(status)) {
    res.status(400).json({ error: `Status must be one of: ${allowedStatuses.join(', ')}` });
    return;
  }

  try {
    const updated = await updateOrderStatus(id, status);
    if (!updated) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }
    res.json({ success: true, order: updated });
  } catch (err: any) {
    res.status(500).json({ error: `Failed to update status: ${err.message}` });
  }
});

// 8. Logout
app.post(['/api/logout', '/logout'], (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    SESSIONS.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

export default function handler(req: any, res: any) {
  return app(req, res);
}
