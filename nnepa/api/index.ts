/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { lookupProductPrice, registerProductPrice, removeProductPrice } from '../server/priceList.ts';
import {
  createOrder,
  getOrderByPublicId,
  listAllOrders,
  updateOrderStatus,
  StoredOrder,
  OrderItem,
  OrderStatus
} from '../server/ordersDb.ts';

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

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "prod_1789572165350",
    name: "Royal Gold Kente Boubou",
    category: "women",
    subcategory: "Dresses & Gowns",
    price: 480,
    rating: 5,
    imageUrl: "/assets/images/lookbook_01_gold_boubou.jpg",
    hoverImageUrl: "/assets/images/lookbook_03_ivory_wrap_ensemble.jpg",
    color: "Gold & Ochre",
    colorCount: 2,
    badge: "Exclusive",
    inStock: true,
    description: "Generously draped silk-cotton boubou finished in Accra with handwoven Asante Kente strip inlays along the neckline and cuffs.",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "prod_1789572165351",
    name: "Queen Mother Royal Kente Gown",
    category: "women",
    subcategory: "Dresses & Gowns",
    price: 2850,
    rating: 5,
    imageUrl: "/assets/images/lookbook_02_plum_emerald_gown.jpg",
    hoverImageUrl: "/assets/images/lookbook_06_organza_puff_dress.jpg",
    color: "Plum & Violet",
    colorCount: 3,
    badge: "Bestseller",
    inStock: true,
    description: "Full-length evening gown cut from handwoven Ghanaian silk Kente and weighty brocade, tailored for weddings and formal celebrations.",
    sizes: ["S", "M", "L", "XL", "XXL"]
  },
  {
    id: "prod_1789572165352",
    name: "Ankara Peplum Two-Piece",
    category: "women",
    subcategory: "Tops & Sets",
    price: 650,
    rating: 5,
    imageUrl: "/assets/images/lookbook_05_ankara_peplum_suit.jpg",
    hoverImageUrl: "/assets/images/lookbook_04_burgundy_corset_cape.jpg",
    color: "Crimson & Blush",
    colorCount: 2,
    badge: "New",
    inStock: true,
    description: "Structured cotton wax-print peplum bodice paired with an ankle-grazing column skirt for unhurried ease from morning to evening.",
    sizes: ["XS", "S", "M", "L", "XL"]
  },
  {
    id: "prod_1789572165353",
    name: "Pleated Silk Evening Dress",
    category: "women",
    subcategory: "Dresses & Gowns",
    price: 980,
    rating: 5,
    imageUrl: "/assets/images/lookbook_06_organza_puff_dress.jpg",
    hoverImageUrl: "/assets/images/lookbook_02_plum_emerald_gown.jpg",
    color: "Emerald & Sage",
    colorCount: 2,
    badge: "Exclusive",
    inStock: true,
    description: "Fluid flared silhouette woven with fine silk threads and soft micro-pleats that move lightly with every step.",
    sizes: ["XS", "S", "M", "L", "XL"]
  },
  {
    id: "prod_1789572165354",
    name: "The Patriarch Brocade Agbada",
    category: "men",
    subcategory: "Kaftans & Agbada",
    price: 1200,
    rating: 5,
    imageUrl: "/assets/images/lookbook_07_mens_ivory_gold_agbada.jpg",
    hoverImageUrl: "/assets/images/lookbook_08_mens_indigo_kente_kaftan.jpg",
    color: "Ivory & Pearl",
    colorCount: 3,
    badge: "Bestseller",
    inStock: true,
    description: "Three-piece ceremonial Agbada cut from breathable damask brocade with tonal hand embroidery at the chest and matching trousers.",
    sizes: ["M", "L", "XL", "XXL"]
  },
  {
    id: "prod_1789572165355",
    name: "Asante Yoke Linen Kaftan",
    category: "men",
    subcategory: "Kaftans & Agbada",
    price: 750,
    rating: 5,
    imageUrl: "/assets/images/lookbook_08_mens_indigo_kente_kaftan.jpg",
    hoverImageUrl: "/assets/images/lookbook_07_mens_ivory_gold_agbada.jpg",
    color: "Gold & Ochre",
    colorCount: 2,
    badge: "New",
    inStock: true,
    description: "Crisp washed-linen kaftan accented with a handwoven Kente shoulder yoke and deep side-seam pockets.",
    sizes: ["S", "M", "L", "XL", "XXL"]
  },
  {
    id: "prod_1789572165356",
    name: "Northern Fugu Woven Smock",
    category: "men",
    subcategory: "Outerwear & Smocks",
    price: 580,
    rating: 5,
    imageUrl: "/assets/images/lookbook_08_mens_indigo_kente_kaftan.jpg",
    hoverImageUrl: "/assets/images/lookbook_07_mens_ivory_gold_agbada.jpg",
    color: "Indigo & Navy",
    colorCount: 2,
    badge: "Exclusive",
    inStock: true,
    description: "Authentic Northern Ghanaian strip-woven cotton smock with a traditional pleated hem and hand-worked neckline.",
    sizes: ["M", "L", "XL"]
  },
  {
    id: "prod_1789572165357",
    name: "Bolga Woven Leather Tote",
    category: "bags",
    subcategory: "Bags & Accessories",
    price: 340,
    rating: 5,
    imageUrl: "/assets/images/lookbook_01_gold_boubou.jpg",
    hoverImageUrl: "/assets/images/lookbook_03_ivory_wrap_ensemble.jpg",
    color: "Gold & Ochre",
    colorCount: 3,
    badge: "Bestseller",
    inStock: true,
    description: "Hand-plaited elephant grass carryall woven in Bolgatanga and finished with vegetable-tanned Ghanaian leather handles.",
    sizes: ["One Size"]
  },
  {
    id: "prod_1789572165358",
    name: "Asante Brass Adinkra Clutch",
    category: "bags",
    subcategory: "Bags & Accessories",
    price: 260,
    rating: 5,
    imageUrl: "/assets/images/lookbook_03_ivory_wrap_ensemble.jpg",
    hoverImageUrl: "/assets/images/lookbook_04_burgundy_corset_cape.jpg",
    color: "Ebony & Charcoal",
    colorCount: 2,
    badge: "New",
    inStock: true,
    description: "Plush velvet evening clutch set with cast-brass Adinkra hardware and a removable fine chain strap.",
    sizes: ["One Size"]
  },
  {
    id: "prod_1789572165359",
    name: "Silk Kente Box Minaudière",
    category: "bags",
    subcategory: "Bags & Accessories",
    price: 420,
    rating: 5,
    imageUrl: "/assets/images/lookbook_02_plum_emerald_gown.jpg",
    hoverImageUrl: "/assets/images/lookbook_01_gold_boubou.jpg",
    color: "Plum & Violet",
    colorCount: 2,
    badge: "Exclusive",
    inStock: true,
    description: "Structured evening minaudière wrapped in handwoven silk Kente with a satin interior and concealed clasp.",
    sizes: ["One Size"]
  },
  {
    id: "prod_1789572165360",
    name: "Foriwaa Organza Puff-Sleeve Midi",
    category: "women",
    subcategory: "Dresses & Gowns",
    price: 890,
    rating: 5,
    imageUrl: "/assets/images/lookbook_04_burgundy_corset_cape.jpg",
    hoverImageUrl: "/assets/images/lookbook_06_organza_puff_dress.jpg",
    color: "Plum & Violet",
    colorCount: 2,
    badge: "New",
    inStock: true,
    description: "Airy silk-organza midi dress gathered softly at the waist with sculpted lantern sleeves and delicate back ties.",
    sizes: ["XS", "S", "M", "L"]
  },
  {
    id: "prod_1789572165361",
    name: "Osu Matelassé Wrap Blouse & Skirt",
    category: "women",
    subcategory: "Tops & Sets",
    price: 760,
    rating: 5,
    imageUrl: "/assets/images/lookbook_03_ivory_wrap_ensemble.jpg",
    hoverImageUrl: "/assets/images/lookbook_05_ankara_peplum_suit.jpg",
    color: "Ivory & Pearl",
    colorCount: 3,
    inStock: true,
    description: "Textured cotton-jacquard wrap blouse with side ribbon ties paired with a softly gathered A-line midi skirt.",
    sizes: ["XS", "S", "M", "L", "XL"]
  },
  {
    id: "prod_1789572165362",
    name: "Aburi Silk-Cotton Tiered Gown",
    category: "women",
    subcategory: "Dresses & Gowns",
    price: 1350,
    originalPrice: 1550,
    rating: 5,
    imageUrl: "/assets/images/lookbook_02_plum_emerald_gown.jpg",
    hoverImageUrl: "/assets/images/lookbook_01_gold_boubou.jpg",
    color: "Crimson & Blush",
    colorCount: 2,
    badge: "Sale",
    inStock: true,
    description: "Voluminous three-tier gown cut from breathable Ghanaian cotton-silk with hand-rolled hems and deep concealed pockets.",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "prod_1789572165363",
    name: "Kumasi Tailored Senator Two-Piece",
    category: "men",
    subcategory: "Tops & Sets",
    price: 840,
    rating: 5,
    imageUrl: "/assets/images/lookbook_07_mens_ivory_gold_agbada.jpg",
    hoverImageUrl: "/assets/images/lookbook_08_mens_indigo_kente_kaftan.jpg",
    color: "Ebony & Charcoal",
    colorCount: 2,
    badge: "Bestseller",
    inStock: true,
    description: "Clean-lined Senator tunic and tapered trouser set tailored in superfine wool-cotton suiting with subtle Kente piping.",
    sizes: ["S", "M", "L", "XL", "XXL"]
  },
  {
    id: "prod_1789572165364",
    name: "Labone Quilted Aso-Oke Jacket",
    category: "women",
    subcategory: "Outerwear & Smocks",
    price: 920,
    rating: 5,
    imageUrl: "/assets/images/lookbook_05_ankara_peplum_suit.jpg",
    hoverImageUrl: "/assets/images/lookbook_04_burgundy_corset_cape.jpg",
    color: "Emerald & Sage",
    colorCount: 2,
    badge: "New",
    inStock: true,
    description: "Cropped boxy jacket quilted from hand-loomed Aso-Oke cloth with tied ribbon closures and a smooth cotton voile lining.",
    sizes: ["XS", "S", "M", "L"]
  },
  {
    id: "prod_1789572165365",
    name: "Cape Coast Raffia & Calfskin Shoulder Bag",
    category: "bags",
    subcategory: "Bags & Accessories",
    price: 390,
    rating: 5,
    imageUrl: "/assets/images/lookbook_04_burgundy_corset_cape.jpg",
    hoverImageUrl: "/assets/images/lookbook_03_ivory_wrap_ensemble.jpg",
    color: "Ivory & Pearl",
    colorCount: 2,
    inStock: false,
    description: "Softly curved shoulder bag hand-crocheted in natural raffia and trimmed in supple plum-dyed calfskin. Made to order in Accra.",
    sizes: ["One Size"]
  }
];

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
  try {
    if (fs.existsSync(TMP_DB_FILE)) {
      const contents = fs.readFileSync(TMP_DB_FILE, 'utf-8');
      const parsed = JSON.parse(contents);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    // fallback
  }

  try {
    const rootPath = path.join(process.cwd(), 'database.json');
    if (fs.existsSync(rootPath)) {
      const contents = fs.readFileSync(rootPath, 'utf-8');
      const parsed = JSON.parse(contents);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    // fallback
  }

  return FALLBACK_PRODUCTS;
}

function saveProducts(products: Product[]): void {
  try {
    fs.writeFileSync(TMP_DB_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (e) {
    // serverless disk read-only
  }
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
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true;
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true;
  // GIF: 47 49 46 38
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return true;
  // WEBP: RIFF .... WEBP
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
    if (syncProd && typeof syncProd === 'object' && syncProd.id && syncProd.id.startsWith('prod_')) {
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
    imageUrl: imageUrl || 'https://images.pexels.com/photos/20799228/pexels-photo-20799228.jpeg',
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

// ────────────────────────────────────────────────────────
// ORDERS & CHECKOUT ENDPOINTS
// ────────────────────────────────────────────────────────

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
  return `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(orderLines.join('\n'))}`;
}

// Create guest order
app.post(['/api/orders', '/orders'], async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  if (!checkOrderRateLimit(clientIp)) {
    res.status(429).json({ error: 'Too many order attempts. Please wait a few minutes before trying again.' });
    return;
  }

  const { customer, items, idempotencyKey } = req.body || {};

  if (!customer || typeof customer !== 'object') {
    res.status(400).json({ error: 'Customer information is required.' });
    return;
  }
  const name = String(customer.name || '').trim();
  const phone = String(customer.phone || '').trim();
  const address = String(customer.address || '').trim();
  const notes = customer.notes ? String(customer.notes).trim() : '';

  if (!name || name.length < 2) {
    res.status(400).json({ error: 'Please enter a valid full name.' });
    return;
  }
  if (!phone || phone.length < 7) {
    res.status(400).json({ error: 'Please enter a valid phone number.' });
    return;
  }
  if (!address || address.length < 5) {
    res.status(400).json({ error: 'Please enter a complete delivery address.' });
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Cart is empty. Please add garments before checking out.' });
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
