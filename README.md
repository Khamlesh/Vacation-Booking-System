# Vacation Booking System

A full-stack vacation rental booking platform built with React, Express, MongoDB, and Stripe. The app supports guest bookings, host property management, admin approvals, reports, reviews, notifications, wishlists, and payment intent creation.

## Features

- User authentication with JWT
- Role-based access for users, hosts, and admins
- Host onboarding with admin approval
- Property listing creation, editing, deletion, and image uploads
- Listing search and detail pages
- Date-based booking flow with guest details
- Stripe payment intent support with local mock mode
- Booking cancellation and reschedule requests
- Reviews and ratings for listings
- User wishlist and profile management
- Notifications for booking and host workflows
- Admin dashboard for users, hosts, listings, and bookings
- Host and admin monthly reports
- PDF receipt generation on the frontend

## Tech Stack

**Frontend**

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Recharts
- React Toastify
- Stripe React SDK
- jsPDF

**Backend**

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- bcryptjs
- Multer for uploads
- Stripe
- dotenv

## Project Structure

```text
vaca/
  backend/
    controllers/       API controller logic
    middleware/        Auth and upload middleware
    models/            Mongoose schemas
    routes/            Express routes
    uploads/           Uploaded listing images
    utils/             Utility scripts
    server.js          Backend entry point
  frontend/
    public/            Static frontend assets
    src/
      components/      Reusable UI components
      context/         Auth context
      pages/           App pages
      utils/           Frontend utilities
    vite.config.js     Vite config
```

## Prerequisites

- Node.js
- npm
- MongoDB running locally or a MongoDB Atlas connection string
- Stripe keys, optional for real payments

## Getting Started

Clone the repository:

```bash
git clone <your-repository-url>
cd vaca
```

Install backend dependencies:

```bash
cd backend
npm install
```

Create a backend `.env` file:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/airbnb_clone
JWT_SECRET=replace_with_a_secure_secret
STRIPE_SECRET_KEY=mock
```

Use `STRIPE_SECRET_KEY=mock` or leave it unset to run payments in mock mode. Add a real Stripe secret key only when you want live Stripe payment intents.

Start the backend:

```bash
npm run dev
```

Install frontend dependencies in a new terminal:

```bash
cd frontend
npm install
```

Create a frontend `.env` file:

```env
VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
```

Start the frontend:

```bash
npm run dev
```

The frontend runs on the Vite dev server, usually:

```text
http://localhost:5173
```

The backend API runs on:

```text
http://localhost:5000
```

## Default Admin Account

When the backend starts, it seeds a default admin account:

```text
Email: admin@test.com
Password: 1234
```

Change these credentials before using the project outside local development.

## Available Scripts

Backend:

```bash
npm start      # Run server.js
npm run dev    # Run server with nodemon
npm run seed   # Seed sample data
```

Frontend:

```bash
npm run dev      # Start Vite development server
npm run build    # Build production frontend
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## API Overview

The backend exposes these route groups:

```text
/api/auth
/api/users
/api/listings
/api/bookings
/api/payments
/api/reviews
/api/notifications
/api/reports
```

Static uploaded images are served from:

```text
/uploads
```

## User Roles

- `user`: Browse listings, book stays, manage profile, wishlist, reviews, and bookings.
- `host`: Manage listings, booking requests, reschedules, notifications, and reports.
- `admin`: Manage users, host approvals, listings, bookings, and platform reports.

## Notes for GitHub

Do not commit sensitive environment files or installed dependencies. Keep these out of version control:

```text
node_modules/
.env
backend/uploads/
dist/
```

## License

This project is licensed under the ISC License.
