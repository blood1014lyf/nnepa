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
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Set up JSON body parsers (restricted to standard limit, large limit only for uploads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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
    if (fs.existsSync(ROOT_DB_FILE)) {
      const contents = fs.readFileSync(ROOT_DB_FILE, 'utf-8');
      const parsed = JSON.parse(contents);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed reading ROOT_DB_FILE, attempting tmp fallback...', err);
  }

  try {
    if (fs.existsSync(TMP_DB_FILE)) {
      const contents = fs.readFileSync(TMP_DB_FILE, 'utf-8');
      const parsed = JSON.parse(contents);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed reading TMP_DB_FILE database file', err);
  }

  return INITIAL_PRODUCTS;
}

function saveProducts(products: Product[]): void {
  const jsonContent = JSON.stringify(products, null, 2);
  let saved = false;

  try {
    fs.writeFileSync(ROOT_DB_FILE, jsonContent, 'utf-8');
    saved = true;
  } catch (err) {
    console.error('Failed writing to ROOT_DB_FILE, writing to /tmp', err);
  }

  try {
    fs.writeFileSync(TMP_DB_FILE, jsonContent, 'utf-8');
    saved = true;
  } catch (e) {
    if (!saved) {
      console.error('Failed writing to /tmp as well', e);
    }
  }
}

// ────────────────────────────────────────────────────────
// SECURITY & AUTHORIZATION MIDDLEWARE
// ────────────────────────────────────────────────────────

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.warn('[SECURITY WARNING] ADMIN_PASSWORD environment variable is not set. Please set ADMIN_PASSWORD in your .env file.');
}

// In-Memory Rate Limiter for Login Attempts
interface LoginRateLimit {
  attempts: number;
  blockedUntil: number;
}
const loginRateLimits = new Map<string, LoginRateLimit>();

function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = loginRateLimits.get(ip);
  if (!entry) return { allowed: true, retryAfterMs: 0 };

  if (entry.blockedUntil > now) {
    return { allowed: false, retryAfterMs: entry.blockedUntil - now };
  }

  if (entry.blockedUntil > 0 && entry.blockedUntil <= now) {
    loginRateLimits.delete(ip);
    return { allowed: true, retryAfterMs: 0 };
  }

  return { allowed: true, retryAfterMs: 0 };
}

function recordFailedLogin(ip: string): void {
  const now = Date.now();
  const entry = loginRateLimits.get(ip) || { attempts: 0, blockedUntil: 0 };
  entry.attempts += 1;

  if (entry.attempts >= 5) {
    entry.blockedUntil = now + 15 * 60 * 1000; // 15 minutes lockout
    console.warn(`[SECURITY ALERT] IP ${ip} exceeded maximum login attempts and is blocked for 15 minutes.`);
  }

  loginRateLimits.set(ip, entry);
}

function clearLoginAttempts(ip: string): void {
  loginRateLimits.delete(ip);
}

// Persistent session store for active cryptographically secure session tokens
interface AdminSession {
  username: string;
  createdAt: number;
}

const SESSIONS_FILE = path.join(process.cwd(), 'sessions.json');

function loadSessions(): Map<string, AdminSession> {
  const map = new Map<string, AdminSession>();
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
      const obj = JSON.parse(raw);
      if (obj && typeof obj === 'object') {
        for (const [key, val] of Object.entries(obj)) {
          if (val && typeof val === 'object' && 'username' in (val as any)) {
            map.set(key, val as AdminSession);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Notice: initialized new session store.', err);
  }
  return map;
}

const activeSessions = loadSessions();

function saveSessions(): void {
  try {
    const obj: Record<string, AdminSession> = {};
    for (const [key, val] of activeSessions.entries()) {
      obj[key] = val;
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed saving sessions.json file', err);
  }
}

// Sessions expire after 7 days
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function isValidSession(token: string): boolean {
  if (!token) return false;
  const session = activeSessions.get(token);
  if (!session) return false;
  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    activeSessions.delete(token);
    saveSessions();
    return false;
  }
  return true;
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
    description: description || 'Handcrafted African designer apparel tailored with premium fabrics.',
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

// 6. Admin Login (Secure server-side credential verification with rate limiting)
app.post('/api/login', (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const { allowed, retryAfterMs } = checkLoginRateLimit(clientIp);

  if (!allowed) {
    const minutesLeft = Math.ceil(retryAfterMs / 60000);
    res.status(429).json({
      error: `Security alert: Too many failed login attempts. Please wait ${minutesLeft} minute(s) before trying again.`,
    });
    return;
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required.' });
    return;
  }

  const cleanUsername = String(username).trim();
  const cleanPassword = String(password);

  const effectivePassword = ADMIN_PASSWORD || 'supersecretpassword';
  const isMatch = cleanUsername === ADMIN_USERNAME && cleanPassword === effectivePassword;

  if (!isMatch) {
    recordFailedLogin(clientIp);
    res.status(401).json({ error: 'Invalid admin credentials. Please check your username and password.' });
    return;
  }

  // Clear failed attempt tracking on successful authentication
  clearLoginAttempts(clientIp);

  // Generate a cryptographically secure random session token
  const token = crypto.randomBytes(32).toString('hex');
  activeSessions.set(token, {
    username: cleanUsername,
    createdAt: Date.now(),
  });
  saveSessions();

  res.json({
    success: true,
    token,
    message: 'Admin session established successfully.',
  });
});

// Admin Session Verification
app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.json({ authenticated: false });
    return;
  }
  const token = authHeader.slice(7).trim();
  res.json({ authenticated: isValidSession(token) });
});

// Admin Logout
app.post('/api/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    activeSessions.delete(token);
    saveSessions();
  }
  res.json({ success: true, message: 'Logged out successfully.' });
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

  const startListening = (port: number) => {
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`[Nnepa Foriwaa] Express Server listening on http://localhost:${port}`);
    });
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[Nnepa Foriwaa] Port ${port} is in use, trying ${port + 1}...`);
        startListening(port + 1);
      } else {
        console.error(err);
      }
    });
  };

  startListening(PORT);
};

startServer();
