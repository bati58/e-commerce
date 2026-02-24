## MERN E-Commerce Application

Full-stack e-commerce app built with MongoDB, Express, React, and Node.js.
The project includes JWT authentication, product discovery flows, cart and checkout, order history, account dashboard, and mobile-focused UX.

### Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose, JWT
- Frontend: React (Vite), React Router, Axios
- Styling: custom CSS (`frontend/src/styles.css`)

### Implemented Features

- Homepage
  - Hero section with CTA
  - Category grid
  - Featured, new arrivals, best sellers, limited offers rails
  - Trust and testimonial sections
- Product listing page
  - Search, sorting, pagination
  - Filtering by price, brand, ratings, size, color, availability, discount
  - Wishlist toggle and wishlist view mode (`/products?wishlist=1`)
  - Mobile collapsible filters
- Product detail page
  - Product gallery and details
  - Variant selection and quantity controls
  - Add to cart flow
- Cart page
  - Quantity updates, remove item, promo code, order summary
  - Estimated delivery and savings display
- Checkout page
  - Guest checkout supported
  - Shipping form, payment method selection, validation messages
  - Sticky order summary and place-order flow
- Account and orders
  - Protected account dashboard (`/account`)
  - Profile, orders, order tracking, wishlist summary, addresses, payments, returns, settings
  - Protected orders page (`/orders`)
- Mobile UX
  - Mobile top header and fixed bottom navigation
  - Sticky mobile cart bar
  - Thumb-friendly controls
  - Responsive layouts across key pages

### Project Structure

```text
e-commerce/
  backend/
    src/
      config/
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
    package.json
```

### Local Setup

#### 1. Backend

```bash
cd backend
npm install
```

Create `.env` from example:

```bash
cp .env.example .env
```

Set backend environment variables:

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `FRONTEND_URL` - frontend URL for CORS in production
- `PORT` - backend port (default `5000`)
- `STRIPE_SECRET_KEY` - optional, only needed if Stripe routes are enabled
- `STRIPE_WEBHOOK_SECRET` - optional, only needed if Stripe routes are enabled

Run backend:

```bash
npm run dev
```

Backend API base URL (local): `http://localhost:5000/api`

#### 2. Frontend

```bash
cd frontend
npm install
```

Create `.env` from example:

```bash
cp .env.example .env
```

Set frontend environment variables:

- `VITE_API_URL` - backend API URL, for example `http://localhost:5000/api`

Run frontend:

```bash
npm run dev
```

Open `http://localhost:5173`.

### API Endpoints (Currently Mounted)

- Health
  - `GET /api/health`
- Products
  - `GET /api/products`
  - `GET /api/products/:id`
- Users
  - `POST /api/users/register`
  - `POST /api/users/login`
  - `GET /api/users/me` (protected)
- Cart
  - `POST /api/cart/validate` (protected)
- Orders
  - `POST /api/orders` (protected)
  - `GET /api/orders/my-orders` (protected)

### Stripe Notes

Stripe route handlers exist in `backend/src/routes/paymentRoutes.js`, but they are not mounted in `backend/src/server.js` right now.

If you want Stripe payment endpoints active, mount them in `server.js`:

```js
import paymentRoutes from "./routes/paymentRoutes.js";
app.use("/api/payments", paymentRoutes);
```

Then configure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in backend `.env`.

### Build Commands

- Frontend production build:

```bash
cd frontend
npm run build
```

- Backend production start:

```bash
cd backend
npm start
```

### Deployment

- Backend can be deployed on Render (root: `backend`)
- Frontend can be deployed on Vercel (root: `frontend`, output: `dist`)
- Set `FRONTEND_URL` on backend to your deployed frontend URL to satisfy CORS
