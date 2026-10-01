# GIFTRIYA Custom E-commerce + Private Admin Panel

## Features
- Private admin login
- Add product like a seller listing: name, SKU, category, price, MRP, stock, description, image
- Publish product immediately to the storefront
- Delete listings
- SQLite database
- Image upload
- Responsive store

## Run locally
1. Install Node.js 20+
2. Open this folder in terminal
3. Run: npm install
4. Set credentials (recommended):
   Windows PowerShell:
   $env:ADMIN_USER="yourusername"
   $env:ADMIN_PASS="a-strong-password"
   $env:JWT_SECRET="a-long-random-secret"
5. Run: npm start
6. Open http://localhost:3000

IMPORTANT:
- The default credentials are admin / ChangeMe123! ONLY for local testing.
- Before putting the site online, set ADMIN_USER, ADMIN_PASS and JWT_SECRET as hosting environment variables.
- HTTPS should be enabled on the live domain.
- This is a starter full-stack implementation; payment gateway, order management, customer accounts, shipping integration, GST invoice and production hardening can be added next.
