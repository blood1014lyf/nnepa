/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { PRODUCTS as INITIAL_PRODUCTS } from '../src/data.ts';
import { Product } from '../src/types.ts';

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const TMP_DB_FILE = path.join('/tmp', 'database.json');

function loadProducts(): Product[] {
  try {
    if (fs.existsSync(TMP_DB_FILE)) {
      const contents = fs.readFileSync(TMP_DB_FILE, 'utf-8');
      return JSON.parse(contents);
    }
  } catch (err) {
    console.error('Failed reading database file in serverless environment', err);
  }

  const formattedDefaultProducts: Product[] = INITIAL_PRODUCTS.map((prod) => ({
    ...prod,
    price: Math.round(prod.price * 10),
    originalPrice: prod.originalPrice ? Math.round(prod.originalPrice * 10) : undefined,
    inStock: prod.id !== 'w3' && prod.id !== 'k3',
    description: prod.description || `${prod.name} - Handcrafted luxury piece tailored from pristine ${prod.subcategory || 'Ankara'} material. Directly sourced with trade equity. Designed for timeless elegance.`,
    sizes: prod.sizes || ['S', 'M', 'L', 'XL', 'XXL']
  }));

  saveProducts(formattedDefaultProducts);
  return formattedDefaultProducts;
}

function saveProducts(products: Product[]): void {
  try {
    fs.writeFileSync(TMP_DB_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed writing products to /tmp in serverless environment', e);
  }
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== 'Bearer nnepa_foriwaa_luxury_token_2025') {
    res.status(403).json({ error: 'Forbidden: Valid curator authorization is required.' });
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
app.get('/api/products', (req, res) => {
  const currentProducts = loadProducts();
  res.json({ products: currentProducts });
});

// 1b. Bulk sync
app.post('/api/products/sync', requireAdmin, (req, res) => {
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

// 3. Edit product
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

// 4. Delete product
app.delete('/api/products/:id', requireAdmin, (req, res) => {
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

// 5. Upload endpoint (returns direct base64 in serverless environment)
app.post('/api/upload', requireAdmin, (req, res) => {
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
    // In serverless Vercel, return base64Data URL directly for instant reliable rendering
    res.json({ imageUrl: base64Data });
  } catch (err: any) {
    res.status(500).json({ error: `Upload workflow error: ${err.message}` });
  }
});

// 6. Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'supersecretpassword';
  if (username === adminUsername && password === adminPassword) {
    res.json({ success: true, token: 'nnepa_foriwaa_luxury_token_2025' });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials.' });
  }
});

export default app;
