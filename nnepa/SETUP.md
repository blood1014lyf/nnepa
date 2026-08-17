# 👑 Adunni Luxe — cPanel Shared Hosting & MySQL Setup Guide

Adunni Luxe is built on a modular, modern full-stack React and Express server architecture, making it ready for Namecheap Shared Hosting or any standard cPanel web hosting environment. 

This guide outlines exactly how to configure the files, set up the MySQL Database, and bring your digital fashion showroom online.

---

## 📂 Project Archive Layout
Once compiled in production, the workspace consists of:
* `/dist` — Optimized React static assets (fully compiled HTML, CSS styles, and JS slices).
* `/dist/server.cjs` — Optimized, self-contained single Node.js backend server.
* `/database.json` — Pre-loaded local database store acting as your data repository.
* `/uploads` — Local media directory where newly uploaded product images are saved.

---

## ⚙️ Setup Phase 1: Database Initialization
Our server uses **dynamic binding**. If a MySQL instance is configured via environment variables, the system queries it. Otherwise, it defaults to using local file persistence (`database.json`), ensuring it works out-of-the-box.

### 1. Create MySQL Database in cPanel:
1. Log into your cPanel and search for **"MySQL Database Wizard"**.
2. Define a database name, e.g., `adunniluxe_db`.
3. Create a database user, e.g., `adunni_merchant`, and generate a secure password.
4. Grant the user **"ALL PRIVILEGES"** on the database.

### 2. Import SQL Schema in phpMyAdmin:
1. Go back to cPanel Home and click **"phpMyAdmin"**.
2. Select your newly created database `adunniluxe_db` in the left sidebar.
3. Click on the **"SQL"** tab at the top.
4. Copy and paste the database schema below and press **"Go"**:

```sql
-- SQL Database Table Structure for Adunni Luxe Fashion
CREATE TABLE IF NOT EXISTS `products` (
  `id` varchar(50) NOT NULL PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `category` enum('women', 'men', 'kids') NOT NULL,
  `subcategory` varchar(100) NOT NULL DEFAULT 'Ready-to-Wear',
  `price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `rating` int(11) NOT NULL DEFAULT 5,
  `image_url` varchar(2048) NOT NULL,
  `badge` enum('None', 'Bestseller', 'New', 'Sale', 'Exclusive') DEFAULT NULL,
  `in_stock` tinyint(1) NOT NULL DEFAULT 1,
  `description` text DEFAULT NULL,
  `sizes` varchar(100) NOT NULL DEFAULT 'S,M,L,XL,XXL',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Pre-populate Initial Imperial Ghana Cedis Collection
INSERT INTO `products` (`id`, `name`, `category`, `subcategory`, `price`, `original_price`, `image_url`, `badge`, `in_stock`, `description`) VALUES
('w1', 'Ankara Wrap Gown', 'women', 'Gown', 2850.00, NULL, 'https://images.pexels.com/photos/32290810/pexels-photo-32290810.jpeg', 'Bestseller', 1, 'Imperial Ankara wrap dress detailed with fine weave cotton, hand tailored within Accra.'),
('w2', 'Kente Luxury Set', 'women', 'Two-Piece', 3400.00, NULL, 'https://images.pexels.com/photos/29857668/pexels-photo-29857668.jpeg', 'New', 1, 'Genuine premium weave Ghana Kente, hand tailored under master direction in Accra.'),
('w3', 'Vibrant Ankara Flare', 'women', 'Flare Dress', 1950.00, 2600.00, 'https://images.pexels.com/photos/33561263/pexels-photo-33561263.jpeg', 'Sale', 0, 'Flare Ankara luxury with beautiful prints, custom ordered fits.'),
('m1', 'Royal Agbada Set', 'men', 'Agbada', 5200.00, NULL, 'https://images.pexels.com/photos/29488868/pexels-photo-29488868.jpeg', 'Bestseller', 1, 'Master hand embroidered royal Agbada, deep rich fabrics woven with thread counts.');
```

---

## 🚀 Setup Phase 2: Host Deployment Configurations

### Strategy A: Dedicated cPanel Node.js App (Preferred)
Many shared hosting providers (like Namecheap Stellar Plus) support Node.js via cPanel's **"Setup Node.js App"** portal:

1. Compress and upload your project files to the server using the **File Manager**.
2. Log into cPanel, search for **"Setup Node.js App"**, and click **"Create Application"**.
3. Choose Node.js version **18+** or **20+**.
4. Set **Application startup file** to `dist/server.cjs`.
5. Set **Application URL** to your domain (e.g., `https://adunniluxe.com`).
6. Scroll down to **Environment variables** to map your database fields:
   * `DB_HOST` = `localhost`
   * `DB_NAME` = `adunniluxe_db`
   * `DB_USER` = `adunni_merchant`
   * `DB_PASSWORD` = `[your_secure_password]`
7. Click **"Run JS Install"** and click **"Restart App"**.

---

### Strategy B: Static Hosting + PHP Proxy API (Zero Node.js dependency)
If Node.js is disabled on your hosting plan, you can run the site statically with a PHP file to handle products directly from MySQL.

1. Upload the contents of the `/dist` directory directly to `public_html`.
2. Inside `/public_html`, create a folder named `api`.
3. Create a file at `public_html/api/index.php` with this MySQL routing script:

```php
<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$conn = new mysqli("localhost", "adunni_merchant", "your_password", "adunniluxe_db");

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

$method = $_SERVER['REQUEST_METHOD'];

// 1. GET ALL PRODUCTS
if ($method === 'GET') {
    $result = $conn->query("SELECT * FROM products ORDER BY created_at DESC");
    $products = [];
    while($row = $result->fetch_assoc()) {
        $products[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'category' => $row['category'],
            'subcategory' => $row['subcategory'],
            'price' => (float)$row['price'],
            'originalPrice' => $row['original_price'] ? (float)$row['original_price'] : null,
            'rating' => (int)$row['rating'],
            'imageUrl' => $row['image_url'],
            'badge' => $row['badge'] === 'None' ? null : $row['badge'],
            'inStock' => (bool)$row['in_stock'],
            'description' => $row['description'],
            'sizes' => explode(',', $row['sizes'])
        ];
    }
    echo json_encode(["products" => $products]);
}

// 2. ADMIN LOGIN
if ($method === 'POST' && strpos($_SERVER['REQUEST_URI'], 'login') !== false) {
    $data = json_decode(file_get_contents('php://input'), true);
    if ($data['username'] === 'admin' && $data['password'] === 'adunni2025') {
        echo json_encode(["success" => true, "token" => "php_authorized_token"]);
    } else {
        http_response_code(401);
        echo json_encode(["error" => "Invalid credentials"]);
    }
}

$conn->close();
?>
```

Your system is now ready for world-class, premium fashion management! 
👑 *Tailored for elegance.*
