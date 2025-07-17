# Prescripto Backend (Next.js)

## Overview
This is the backend for the Prescripto platform, built with Next.js API routes. It provides RESTful APIs for user, doctor, and admin management, appointment booking, authentication, and more.

## Features
- User, doctor, and admin authentication (JWT)
- User registration, login, profile, and email verification
- Doctor management (CRUD, availability, images)
- Appointment booking, listing, and cancellation
- Admin dashboard and statistics
- Email notifications (Nodemailer)
- Cloudinary image uploads
- Secure API endpoints with middleware
- Optimized MongoDB queries

## Folder Structure
```
backend-nextjs/
├── src/
│   ├── app/
│   │   ├── api/           # API route handlers (REST endpoints)
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # App layout
│   │   └── page.tsx       # Main page
│   ├── lib/               # Utility libraries (db, email, image, api-utils, etc.)
│   ├── middleware/        # Auth and request middleware
│   ├── models/            # Mongoose models
│   └── ...
├── package.json           # Project metadata and dependencies
├── next.config.js         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
├── vercel.json            # Vercel deployment config
└── README.md              # Project documentation
```

## How to Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up your environment variables (see below).
3. Start the development server:
   ```bash
   npm run dev
   ```
4. The API will be available at `http://localhost:3000/api` by default.

## Tech Stack
- Next.js (API routes)
- TypeScript
- MongoDB (Mongoose)
- Nodemailer
- Cloudinary
- JWT (jsonwebtoken)
- Tailwind CSS (for any admin UI)

## Environment Variables
Create a `.env.local` file in the root with:
```
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
CLOUDINARY_NAME=<cloudinary-cloud-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
EMAIL_USER=<smtp-user>
EMAIL_PASS=<smtp-pass>
EMAIL_FROM=<from-email>
```

## Deployment
- Deploy to Vercel, Railway, or your preferred Node.js host.
- Set all environment variables in your deployment dashboard.

## How to Contribute
1. Fork the repo
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your fork and open a Pull Request

## Contact
For questions or support, open an issue or contact the maintainer.

---

### GitHub Short Description
> Next.js backend for Prescripto: RESTful APIs for users, doctors, admins, appointments, and platform management. 