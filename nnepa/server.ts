/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import 'dotenv/config';
import { createServer as createViteServer } from 'vite';

// Default mock database structure
import { PRODUCTS as INITIAL_PRODUCTS } from './src/data.ts';
import { Product } from './src/types.ts';

const app = express();
const PORT = 3000;

// Set up large JSON body parsers for base64 image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Ensure upload folders exist
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded assets statically and gracefully with custom router to bypass potential middleware/proxy interceptors
app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(UPLOADS_DIR, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.sendFile(filePath);
  } else {
    res.status(404).send('Image not found');
  }
});

app.use('/uploads', express.static(UPLOADS_DIR));

// DB Persistence Layer (Dynamic: Fallback to database.json or /tmp or memory)
const ROOT_DB_FILE = path.join(process.cwd(), 'database.json');
const TMP_DB_FILE = path.join('/tmp', 'database.json');

function loadProducts(): Product[] {
  try {
    if (fs.existsSync(TMP_DB_FILE)) {
      const contents = fs.readFileSync(TMP_DB_FILE, 'utf-8');
      return JSON.parse(contents);
    }
    if (fs.existsSync(ROOT_DB_FILE)) {
      const contents = fs.readFileSync(ROOT_DB_FILE, 'utf-8');
      return JSON.parse(contents);
    }
  } catch (err) {
    console.error('Failed reading database file, falling back to memory defaults', err);
  }

  // Pre-populate with our initial Cedis currency products
  const formattedDefaultProducts: Product[] = INITIAL_PRODUCTS.map((prod) => ({
    ...prod,
    price: Math.round(prod.price * 10), // Convert to GHS Ghanaian cedis (e.g. 2850 GHS)
    originalPrice: prod.originalPrice ? Math.round(prod.originalPrice * 10) : undefined,
    inStock: prod.id !== 'w3' && prod.id !== 'k3', // Mark a couple items out of stock for presentation
    description: prod.description || `${prod.name} - Handcrafted luxury piece tailored from pristine ${prod.subcategory || 'Ankara'} material. Directly sourced with trade equity. Designed for timeless elegance.`,
    sizes: prod.sizes || ['S', 'M', 'L', 'XL', 'XXL']
  }));

  saveProducts(formattedDefaultProducts);
  return formattedDefaultProducts;
}

function saveProducts(products: Product[]): void {
  try {
    fs.writeFileSync(ROOT_DB_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    // Read-only filesystem fallback for Vercel
    try {
      fs.writeFileSync(TMP_DB_FILE, JSON.stringify(products, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed writing to /tmp as well', e);
    }
  }
}

// ────────────────────────────────────────────────────────
// SECURITY & AUTHORIZATION MIDDLEWARE
// ────────────────────────────────────────────────────────

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== 'Bearer nnepa_foriwaa_luxury_token_2025') {
    res.status(403).json({ error: 'Forbidden: Valid curator authorization is required.' });
    return;
  }
  next();
}

// Inspect actual file content magic bytes to restrict to real image types
function isValidImageBuffer(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return true;
  }

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return true;
  }

  // GIF: 47 49 46 38 ("GIF8")
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return true;
  }

  // WEBP: RIFF .... WEBP
  if (buffer.length >= 12) {
    const isRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46; // "RIFF"
    const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50; // "WEBP"
    if (isRiff && isWebp) {
      return true;
    }
  }

  return false;
}

// ────────────────────────────────────────────────────────
// API ENDPOINTS
// ────────────────────────────────────────────────────────

// 1. Fetch all products
app.get('/api/products', (req, res) => {
  const currentProducts = loadProducts();
  res.json({ products: currentProducts });
});

// 1b. Bulk sync endpoint for stateless backend survival (automatic client rehydration)
app.post('/api/products/sync', requireAdmin, (req, res) => {
  const { products: syncList } = req.body;
  if (!syncList || !Array.isArray(syncList)) {
    res.status(400).json({ error: 'Products list array is required for synchronization.' });
    return;
  }

  const currentProducts = loadProducts();
  let updated = false;

  for (const syncProd of syncList) {
    // Only accept elements starting with "prod_" to prevent overriding default fixtures
    if (syncProd && typeof syncProd === 'object' && syncProd.id && syncProd.id.startsWith('prod_')) {
      if (!currentProducts.some((p) => p.id === syncProd.id)) {
        currentProducts.push(syncProd);
        updated = true;
      }
    }
  }

  if (updated) {
    saveProducts(currentProducts);
  }

  res.json({ success: true, count: currentProducts.length });
});

// 2. Add new product (Requires Authorized Admin Session)
app.post('/api/products', requireAdmin, (req, res) => {
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
    description: description || 'Elegant designer apparel tailored custom to emphasize royal stature and status.',
    sizes: sizes && Array.isArray(sizes) ? sizes : ['S', 'M', 'L', 'XL']
  };

  products.push(newProduct);
  saveProducts(products);

  res.status(201).json({ success: true, product: newProduct });
});

// 3. Edit dynamic product details (Requires Authorized Admin Session)
app.put('/api/products/:id', requireAdmin, (req, res) => {
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

// 4. Delete product (Requires Authorized Admin Session)
app.delete('/api/products/:id', requireAdmin, (req, res) => {
  const { id } = req.params;

  let products = loadProducts();
  const exists = products.some((p) => p.id === id);

  if (!exists) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  products = products.filter((p) => p.id !== id);
  saveProducts(products);

  res.json({ success: true, message: 'Product deleted successfully' });
});

// 5. Image upload directly to local /uploads folder (Requires Authorized Admin Session)
app.post('/api/upload', requireAdmin, (req, res) => {
  const { filename, base64Data } = req.body;

  if (!filename || !base64Data) {
    res.status(400).json({ error: 'Filename and base64Data elements are required.' });
    return;
  }

  try {
    // strip out any base64 uri prefixes if present
    const cleanData = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    const buffer = Buffer.from(cleanData, 'base64');

    // EXPLICIT CYBERSECURITY CHECKS
    // A. Enforce max file size: Reject anything over 5MB
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
    if (buffer.length > MAX_FILE_SIZE) {
      res.status(400).json({ error: 'Cybersecurity alert: Large payloads rejected. Maximum file size is 5MB.' });
      return;
    }

    // B. Validate actual file content (Verify magic bytes match real image headers)
    if (!isValidImageBuffer(buffer)) {
      res.status(400).json({ error: 'Cybersecurity warning: Disallowed file type. Only genuine JPG, PNG, GIF, and WEBP image formats are permitted.' });
      return;
    }

    // C. Sanitize and fully randomize filename to prevent collision, overwrite, or path traversal attacks
    const extRaw = path.extname(filename) || '.jpg';
    const ext = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extRaw.toLowerCase()) ? extRaw.toLowerCase() : '.jpg';
    
    // Completely randomize the filename to a secure random hex block
    const secureRandomName = crypto.randomBytes(16).toString('hex');
    const uniqueFilename = `garment_upload_${secureRandomName}${ext}`;
    const destinationPath = path.join(UPLOADS_DIR, uniqueFilename);

    // Write file securely
    try {
      fs.writeFileSync(destinationPath, buffer);
      res.json({ imageUrl: `/uploads/${uniqueFilename}` });
    } catch (writeErr) {
      // Return base64 data URL directly if serverless disk is read-only
      res.json({ imageUrl: base64Data });
    }
  } catch (err: any) {
    res.status(500).json({ error: `Upload workflow error: ${err.message}` });
  }
});

// 6. Admin Secure Login (Zero External DB reliance, simple single-user cPanel design)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'supersecretpassword';

  if (username === adminUsername && password === adminPassword) {
    res.json({ success: true, token: 'nnepa_foriwaa_luxury_token_2025' });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials. Please try again.' });
  }
});

// ────────────────────────────────────────────────────────
// VITE OR STATIC RUNTIME ENVIRONMENT SWITCH
// ────────────────────────────────────────────────────────

const startServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Nnepa Foriwaa] Express Server listening on http://localhost:${PORT}`);
  });
};

startServer();
