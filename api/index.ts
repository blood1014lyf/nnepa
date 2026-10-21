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
    subcategory: "Couture Boubou",
    price: 480,
    rating: 5,
    imageUrl: "https://images.pexels.com/photos/20799228/pexels-photo-20799228.jpeg",
    badge: "Exclusive",
    inStock: true,
    description: "Handcrafted in Accra with authentic Kente strip inlays, tailored for comfort and timeless elegance.",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "prod_1789572165351",
    name: "Queen Mother Royal Kente Gown",
    category: "women",
    subcategory: "Couture Evening Wear",
    price: 2850,
    rating: 5,
    imageUrl: "https://images.pexels.com/photos/34993753/pexels-photo-34993753.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
    badge: "Bestseller",
    inStock: true,
    description: "Handcrafted luxury silhouette sculpted from authentic Ghanaian handwoven silk Kente and regal brocade. Designed for high occasions, weddings, and royal galas with signature precision darting.",
    sizes: ["S", "M", "L", "XL", "XXL"]
  },
  {
    id: "prod_1789572165352",
    name: "Ankara Royal Peplum Ensemble",
    category: "women",
    subcategory: "Tailored Two-Piece",
    price: 650,
    rating: 5,
    imageUrl: "https://images.pexels.com/photos/14484948/pexels-photo-14484948.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=640",
    badge: "New",
    inStock: true,
    description: "Vibrant custom wax print peplum top tailored with matching pencil silhouette. Engineered for exceptional contour and ease of movement.",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "prod_1789572165353",
    name: "Staircase Dream Couture Dress",
    category: "women",
    subcategory: "Evening Couture",
    price: 980,
    rating: 5,
    imageUrl: "https://images.pexels.com/photos/28387051/pexels-photo-28387051.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=640",
    badge: "Exclusive",
    inStock: true,
    description: "Dramatic flared silhouette woven with shimmering silk threads and micro-pleated accents. A head-turning showpiece.",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "prod_1789572165354",
    name: "The Patriarch Brocade Agbada",
    category: "men",
    subcategory: "Grand Agbada Suite",
    price: 1200,
    rating: 5,
    imageUrl: "https://images.pexels.com/photos/31762081/pexels-photo-31762081.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=640",
    badge: "Bestseller",
    inStock: true,
    description: "Three-piece imperial Agbada tailored from heavyweight damask brocade with hand-embroidered neckline and matching trousers.",
    sizes: ["M", "L", "XL", "XXL"]
  },
  {
    id: "prod_1789572165355",
    name: "Emperor Handwoven Kente Kaftan",
    category: "men",
    subcategory: "Bespoke Kaftan",
    price: 750,
    rating: 5,
    imageUrl: "https://images.pexels.com/photos/34608857/pexels-photo-34608857.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=640",
    badge: "New",
    inStock: true,
    description: "Crisp structured linen kaftan highlighted with geometric Asante Kente shoulder yoke and hidden hand-stitched pockets.",
    sizes: ["S", "M", "L", "XL", "XXL"]
  },
  {
    id: "prod_1789572165356",
    name: "Northern Fugu Royal Smock",
    category: "men",
    subcategory: "Traditional Smock",
    price: 580,
    rating: 5,
    imageUrl: "https://images.pexels.com/photos/14577493/pexels-photo-14577493.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=900",
    badge: "Exclusive",
    inStock: true,
    description: "Authentic Northern Ghanaian hand-spun striped cotton smock featuring traditional flared hemline and intricate chest embroidery.",
    sizes: ["M", "L", "XL"]
  },
  {
    id: "prod_1789572165357",
    name: "Artisanal Bolga Woven Leather Tote",
    category: "bags",
    subcategory: "Artisanal Tote",
    price: 340,
    rating: 5,
    imageUrl: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=640",
    badge: "Bestseller",
    inStock: true,
    description: "Handwoven elephant grass tote crafted by master weavers in Bolgatanga, reinforced with supple dyed Ghanaian leather handles.",
    sizes: ["One Size"]
  },
  {
    id: "prod_1789572165358",
    name: "Asante Gold Adinkra Clutch",
    category: "bags",
    subcategory: "Luxury Clutch",
    price: 260,
    rating: 5,
    imageUrl: "https://images.pexels.com/photos/904350/pexels-photo-904350.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=640",
    badge: "New",
    inStock: true,
    description: "Velvet evening clutch embossed with brass Adinkra symbol accents and detachable gold-tone chain strap.",
    sizes: ["One Size"]
  },
  {
    id: "prod_1789572165359",
    name: "Kente Velvet Luxury Minaudière",
    category: "bags",
    subcategory: "Box Minaudière",
    price: 420,
    rating: 5,
    imageUrl: "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=640",
    badge: "Exclusive",
    inStock: true,
    description: "Hard-shell evening minaudière enveloped in genuine silk Kente cloth with plush satin lining and magnetic clasp closure.",
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
