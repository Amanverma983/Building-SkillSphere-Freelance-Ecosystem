# SkillSphere – Intelligent Hyperlocal Freelance Ecosystem

<div align="center">
  <h3>A complete production-ready MERN stack platform connecting local freelancers and clients</h3>
  <p>AI-powered matching • Real-time chat • Escrow payments • Reputation system • Admin dashboard</p>
</div>

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, Redux Toolkit, React Query, Tailwind CSS, React Router DOM, Axios, Socket.IO Client |
| **Backend** | Node.js, Express.js, Socket.IO, JWT Auth, Nodemailer |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Payments** | Razorpay (Escrow + Milestone system) |
| **File Storage** | Cloudinary |
| **Deployment** | Vercel (Frontend), Render/Railway (Backend), MongoDB Atlas |

---

## 📁 Project Structure

```
skillsphere/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── adminController.js       # Admin user/gig management
│   │   ├── analyticsController.js   # Freelancer + admin analytics
│   │   ├── authController.js        # Auth: register, login, 2FA, reset
│   │   ├── chatController.js        # Real-time messaging
│   │   ├── disputeController.js     # Dispute creation and resolution
│   │   ├── gigController.js         # Gig marketplace CRUD + AI recommendations
│   │   ├── notificationController.js # In-app notifications
│   │   ├── paymentController.js     # Razorpay escrow + milestone payments
│   │   ├── profileController.js     # Freelancer/client profile management
│   │   ├── proposalController.js    # Bidding and proposal lifecycle
│   │   ├── reviewController.js      # Star ratings and reputation
│   │   └── schedulerController.js  # Availability calendar bookings
│   ├── middleware/
│   │   ├── auth.js                  # JWT protect + RBAC authorize
│   │   ├── error.js                 # Global error handler
│   │   ├── rateLimiter.js           # API + auth rate limiting
│   │   └── validator.js             # express-validator chains
│   ├── models/
│   │   ├── AdminLog.js
│   │   ├── Client.js
│   │   ├── Dispute.js
│   │   ├── Freelancer.js
│   │   ├── Gig.js
│   │   ├── Message.js
│   │   ├── Notification.js
│   │   ├── Payment.js
│   │   ├── Proposal.js
│   │   ├── Review.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── analyticsRoutes.js
│   │   ├── authRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── disputeRoutes.js
│   │   ├── gigRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── proposalRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── schedulerRoutes.js
│   ├── services/
│   │   ├── aiMatchingService.js     # Skill matching + hyperlocal recommendations
│   │   ├── notificationService.js  # Realtime + email notification dispatch
│   │   └── socketService.js        # Socket.IO connection management
│   ├── utils/
│   │   ├── cloudinary.js           # Cloudinary upload helper
│   │   ├── sendEmail.js            # Nodemailer email helper
│   │   └── totp.js                 # Custom 2FA TOTP implementation
│   ├── .env                        # Local env variables
│   ├── .env.example                # Env variables template
│   ├── package.json
│   ├── seedData.js                 # Database seeder script
│   └── server.js                  # Express server entrypoint
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx           # Navigation with notifications dropdown
    │   │   └── ProtectedRoute.jsx   # RBAC route guard component
    │   ├── context/
    │   │   └── SocketContext.jsx    # Socket.IO React Context Provider
    │   ├── pages/
    │   │   ├── AdminDashboard.jsx
    │   │   ├── BrowseFreelancers.jsx
    │   │   ├── BrowseGigs.jsx
    │   │   ├── Chat.jsx
    │   │   ├── ClientDashboard.jsx
    │   │   ├── ClientGigDetails.jsx
    │   │   ├── FreelancerAnalytics.jsx
    │   │   ├── FreelancerDashboard.jsx
    │   │   ├── FreelancerProfile.jsx
    │   │   ├── GigDetails.jsx
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── PostGig.jsx
    │   │   └── Register.jsx
    │   ├── store/
    │   │   ├── authSlice.js         # Redux auth state management
    │   │   └── index.js             # Redux store configuration
    │   ├── utils/
    │   │   └── api.js               # Axios instance with JWT + refresh interceptors
    │   ├── App.jsx                  # React Router + all routes
    │   ├── index.css                # Tailwind + glassmorphism + animations
    │   └── main.jsx                 # React entrypoint with providers
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- **Node.js** v18 or above
- **MongoDB** – local instance OR MongoDB Atlas cluster
- **Git**

### 1. Clone or Navigate to Project

```bash
cd skillsphere
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Copy and configure environment variables:

```bash
# The .env file is already pre-filled with local defaults.
# Edit to connect your MongoDB Atlas URI and real service credentials.
```

Start the backend server:

```bash
npm run dev
```

Backend will start at: `http://localhost:5000`

### 3. Seed the Database

```bash
npm run seed
```

This will populate:
- 1 Admin account
- 2 Client accounts
- 3 Freelancer accounts (with profiles, skills, portfolios)
- 3 Gigs (published, in-progress, hourly)
- 3 Proposals
- 2 Reviews
- 2 Payments (escrow + released)

**Login credentials after seeding:**

| Role | Email | Password |
|---|---|---|
| Admin | admin@skillsphere.com | Admin@123 |
| Client | rahul@techstartup.com | Client@123 |
| Client | priya@digitalagency.com | Client@123 |
| Freelancer | arjun@devmaster.in | Freelancer@123 |
| Freelancer | sneha@designstudio.in | Freelancer@123 |
| Freelancer | vivek@fullstack.dev | Freelancer@123 |

### 4. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend will start at: `http://localhost:5173`

The Vite dev server is already proxied to forward `/api` and `/socket.io` requests to `http://localhost:5000`.

---

## 🔌 API Reference

### Authentication
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login (returns JWT + cookie) |
| POST | `/api/auth/verify-2fa` | Public | Verify 2FA OTP code |
| POST | `/api/auth/refresh` | Public | Refresh access token |
| GET | `/api/auth/verify-email` | Public | Verify email via token |
| POST | `/api/auth/forgot-password` | Public | Send reset password email |
| PUT | `/api/auth/reset-password` | Public | Set new password |
| POST | `/api/auth/google` | Public | Google OAuth login |
| GET | `/api/auth/me` | Protected | Get current user |
| GET | `/api/auth/logout` | Protected | Logout |
| POST | `/api/auth/enable-2fa` | Protected | Enable 2FA |

### Gigs / Marketplace
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/gigs` | Public | Browse gigs with filters |
| GET | `/api/gigs/:id` | Public | Get gig details |
| POST | `/api/gigs` | Client | Post a new gig |
| PUT | `/api/gigs/:id` | Client | Update gig |
| DELETE | `/api/gigs/:id` | Client/Admin | Delete gig |
| GET | `/api/gigs/recommendations/freelancer` | Freelancer | AI-matched personalized gigs |
| GET | `/api/gigs/:id/recommendations/freelancers` | Client | AI-matched freelancers for a gig |

### Proposals
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/proposals` | Freelancer | Submit a proposal |
| GET | `/api/proposals/my` | Freelancer | My submitted proposals |
| GET | `/api/proposals/gig/:gigId` | Client | All proposals for a gig |
| PUT | `/api/proposals/:id/status` | Client | Accept/Reject/Negotiate |

### Payments (Razorpay Escrow)
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/payments/order` | Client | Create Razorpay order |
| POST | `/api/payments/verify` | Client | Verify payment and escrow |
| POST | `/api/payments/release/:id` | Client/Admin | Release escrow to freelancer |
| POST | `/api/payments/refund/:id` | Admin | Refund payment to client |
| GET | `/api/payments/history` | Auth | Transaction history |

---

## 🌐 Deployment Guide

### MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and create a free cluster
2. Create a database user with read/write permissions
3. Whitelist your server IP in Network Access settings (or use `0.0.0.0/0` for all IPs)
4. Copy the connection string and set as `MONGODB_URI` in your `.env`:
   ```
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/skillsphere?retryWrites=true&w=majority
   ```
5. Enable MongoDB Atlas Search on your cluster for full-text search capabilities

### Backend Deployment on Render

1. Create a new account at [render.com](https://render.com)
2. Click **New Web Service** → Connect your GitHub repository
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node server.js`
5. Add all environment variables from `.env.example` in the **Environment** section
6. Set `NODE_ENV=production`
7. Click **Deploy**

### Frontend Deployment on Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to `frontend/` directory
3. Run `vercel --prod`
4. Set the environment variable in Vercel dashboard:
   ```
   VITE_API_URL=https://your-render-backend-url.onrender.com/api
   ```
5. Add a `vercel.json` file if needed for SPA routing:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/" }]
   }
   ```

### Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard and copy your Cloud Name, API Key, and API Secret
3. Set in backend `.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### Razorpay Setup

1. Create an account at [razorpay.com](https://razorpay.com)
2. Go to **Settings → API Keys** and generate test keys
3. Set in backend `.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
   RAZORPAY_KEY_SECRET=your_key_secret
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   ```
4. In production, switch to live API keys after KYC verification

### Email (Nodemailer) Setup

For production, use a transactional email provider:

**Using Mailtrap (Development Testing):**
1. Sign up at [mailtrap.io](https://mailtrap.io)
2. Get SMTP credentials from your inbox settings

**Using SendGrid (Production):**
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

---

## 🔒 Security Features

- ✅ **JWT Access Tokens** (15 min expiry) + **Refresh Tokens** (7 day expiry)
- ✅ **Role-Based Access Control** (Client, Freelancer, Admin)
- ✅ **Password Hashing** with bcryptjs (10 salt rounds)
- ✅ **Two-Factor Authentication** (TOTP-based)
- ✅ **Rate Limiting** (API: 100 req/15min, Auth: 15 req/hour)
- ✅ **Helmet.js** HTTP security headers
- ✅ **CORS** configured for specific origin
- ✅ **Input Validation** with express-validator
- ✅ **Secure HTTP-only Cookies** for tokens
- ✅ **Razorpay Signature Verification** for payment integrity
- ✅ **Cloudinary** secure file storage

---

## 📦 Module Summary

| Module | Status | Description |
|---|---|---|
| Authentication | ✅ | JWT, 2FA, Google OAuth, email verification, password reset |
| AI Matching | ✅ | Skill overlap scoring, hyperlocal filtering, recommendations |
| Freelancer Profiles | ✅ | Portfolio, skills, experience, availability, public slug |
| Gig Marketplace | ✅ | Post, browse, search (text + location + filters) |
| Proposals & Bidding | ✅ | Submit, accept/reject/negotiate, milestone imports |
| Real-time Chat | ✅ | Socket.IO, typing indicators, read receipts, file sharing |
| Escrow Payments | ✅ | Razorpay integration, milestone funding, release, refund |
| Reputation System | ✅ | Reviews, weighted score, auto-aggregation |
| Admin Dashboard | ✅ | Analytics, user management, disputes, audit logs |
| Search Engine | ✅ | MongoDB text search + geospatial $near queries |
| Notifications | ✅ | In-app (real-time via Socket.IO) + email triggers |
| Availability Scheduler | ✅ | Booking slots, calendar date blocking |
| Dispute Resolution | ✅ | Open/Reviewing/Resolved states, admin mediation |
| Project Tracker | ✅ | Milestone status tracking within gig contracts |
| Analytics Dashboard | ✅ | Monthly earnings chart, KPIs, reputation breakdown |

---

## 🙋 Support

For questions, bug reports, or feature requests, please open an issue in this repository.

---

*Built with ❤️ using MERN Stack — SkillSphere v1.0.0*
