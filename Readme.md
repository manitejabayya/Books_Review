# Books Review Platform

A full-stack web application for discovering, reviewing, and rating books. Built with a Node.js/Express/MongoDB backend and a React/Tailwind frontend.

---

## Table of Contents

- [Features](#features)
- [Architecture Decisions](#architecture-decisions)
- [Setup Instructions](#setup-instructions)
- [Known Limitations](#known-limitations)

---

## Features

- User authentication (JWT-based)
- Add, browse, and search books by genre, author, and keywords
- Write, edit, and moderate reviews with a 5-star rating system
- Community features: helpful votes, notifications, and recommendations
- Responsive, modern UI with React and Tailwind CSS

---

## Architecture Decisions

### Backend

- **Node.js + Express**: RESTful API for all resources (books, users, reviews, notifications).
- **MongoDB + Mongoose**: Flexible schema for books, users, reviews, and notifications.
- **Authentication**: JWT tokens, with middleware for protected routes and role-based access.
- **Cloudinary**: For book cover image uploads and management.
- **Validation**: Express-validator for request validation; Mongoose for schema validation.
- **Error Handling**: Centralized error middleware for consistent API responses.
- **Rate Limiting & Security**: Helmet and express-rate-limit for basic API security.
- **Advanced Querying**: Custom middleware for filtering, searching, sorting, and pagination.

### Frontend

- **React**: SPA with React Router for navigation.
- **Context API**: For global authentication state.
- **Axios**: For API requests, with token management.
- **Tailwind CSS**: For rapid, responsive UI development.
- **Component Structure**: Modular, with separation for authentication, book browsing, and review features.

---

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Books_Review
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

- Copy `config/config.env` and update with your MongoDB URI, JWT secret, and Cloudinary credentials.

**Start the backend server:**

```bash
# For development (with nodemon)
npm run dev

# For production
npm start
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

**Start the frontend dev server:**

```bash
npm run dev
```

- The frontend will run on [http://localhost:5173](http://localhost:5173) by default.
- The backend runs on [http://localhost:5000](http://localhost:5000) by default.

### 4. Seeding Images (Optional)

If you want to migrate or seed images to Cloudinary:

```bash
cd ../Backend
npm run seed
```

---

## Known Limitations

- **Email Verification**: Email verification is not implemented; accounts are active upon registration.
- **No Social Login**: Only email/password authentication is supported.
- **No Real-Time Updates**: Notifications are fetched via API, not pushed in real-time (no websockets).
- **Basic Moderation**: Review moderation is present but limited; no advanced spam detection.
- **No Unit/Integration Tests**: Automated tests are not included.
- **Deployment**: The project is configured for local development; environment variables and CORS may need adjustment for production.
- **Image Uploads**: Only Cloudinary is supported for image hosting.

---

## License

MIT
