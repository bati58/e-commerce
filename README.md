## MERN E-Commerce Application

Full-stack e-commerce web app built with **MongoDB, Express, React, Node.js**, JWT authentication, and **Stripe** payments.  
Backend is designed to deploy on **Render**, frontend on **Vercel**.

### 1. Features

- **Products**
  - List all products (`/api/products`)
  - View single product (`/api/products/:id`)
  - Dynamic product display on homepage and product listing page
- **Authentication**
  - JWT-based signup/login
  - Protected routes for checkout and orders
- **Cart & Orders**
  - Client-side cart with add/update/remove
  - Server-side cart validation
  - Orders saved in MongoDB with status (`pending`, `paid`, `failed`)
- **Payments (Stripe)**
  - Payment Intent flow (test mode)
  - Webhook endpoint to mark orders as `paid`
- **Deployment ready**
  - Environment variables for secrets and URLs
  - CORS configured between frontend and backend

---

### 2. Project Structure

```text
e-commerce/
  backend/
    src/
      config/db.js
      middleware/
      models/
      routes/
      utils/
      server.js
    .env.example
    package.json

  frontend/
    src/
      components/
      pages/
      state/
      utils/
      App.jsx
      main.jsx
      styles.css
    .env.example
    index.html
    vite.config.js
    package.json
```

---

### 3. Backend Setup (Local)

1. **Install dependencies**

```bash
cd backend
npm install
```

2. **Create `.env` from example**

```bash
cp .env.example .env      # use copy command on Windows
```

Edit `.env`:

- `MONGO_URI` – your MongoDB Atlas connection string  
- `JWT_SECRET` – strong random string  
- `STRIPE_SECRET_KEY` – Stripe secret key (test mode)  
- `STRIPE_WEBHOOK_SECRET` – Stripe webhook signing secret  
- `FRONTEND_URL` – `http://localhost:5173` in development  
- `PORT` – usually `5000`

3. **Run backend**

```bash
cd backend
npm run dev
```

API base URL (local): `http://localhost:5000/api`

---

### 4. Frontend Setup (Local)

1. **Install dependencies**

```bash
cd frontend
npm install
```

2. **Create `.env` from example**

```bash
cp .env.example .env      # or create manually on Windows
```

Edit `.env`:

- `VITE_API_URL` – backend URL, e.g. `http://localhost:5000/api`
- `VITE_STRIPE_PUBLISHABLE_KEY` – Stripe publishable key

3. **Run frontend**

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in the browser.

---

### 5. Core Backend Endpoints

- **Products**
  - `GET /api/products` – list products, optional `?search=term`
  - `GET /api/products/:id` – single product
- **Users**
  - `POST /api/users/register`
  - `POST /api/users/login`
  - `GET /api/users/me` (protected)
- **Cart**
  - `POST /api/cart/validate` (protected) – validate items and compute total
- **Orders**
  - `POST /api/orders` (protected) – create new order
  - `GET /api/orders/my-orders` (protected) – list user orders
- **Payments (Stripe)**
  - `POST /api/payments/create-payment-intent` (protected)
  - `POST /api/payments/webhook` – Stripe webhook (raw body)

---

### 6. Stripe Webhook (Local)

1. Install the Stripe CLI and log in.  
2. Start backend on port `5000`.  
3. Run:

```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

4. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET` in `.env`.

---

### 7. Deployment – Backend (Render)

1. Push repo to GitHub.
2. On Render:
   - Create a **New Web Service** from this repo.
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
3. Configure **Environment Variables** in Render UI:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `FRONTEND_URL` – will be your Vercel URL, e.g. `https://your-frontend.vercel.app`
   - `PORT` – `10000` or leave default, Render sets `PORT` automatically.
4. Deploy and note the backend base URL, e.g. `https://your-backend.onrender.com`.

Update Stripe webhook endpoint to:

- `https://your-backend.onrender.com/api/payments/webhook`

---

### 8. Deployment – Frontend (Vercel)

1. Install Vercel CLI or use the Vercel dashboard.
2. In Vercel, create a new project from this repo:
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
3. Set **Environment Variables** in Vercel:
   - `VITE_API_URL` – your Render backend URL with `/api`, e.g.  
     `https://your-backend.onrender.com/api`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
4. Deploy. Your frontend will be accessible at a Vercel URL, e.g.  
   `https://your-frontend.vercel.app`

Make sure `FRONTEND_URL` in the backend `.env` matches this Vercel URL to allow CORS.

---

### 9. Git & GitHub

From the project root:

```bash
git add .
git commit -m "Initial MERN e-commerce app"
git branch -M main
git remote add origin https://github.com/<your-username>/mern-ecommerce.git
git push -u origin main
```

---

### 10. Production Notes

- Use strong secrets for `JWT_SECRET` and Stripe keys.
- Configure Stripe in **test mode** first, then switch to **live keys**.
- Restrict allowed origins in CORS as tightly as possible in `server.js`.
- Consider adding:
  - Admin product management
  - Pagination and better filters
  - More robust inventory management and email notifications

