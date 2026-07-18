# KBinge Backend API

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000)
![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)

A robust and scalable RESTful backend service for the KBinge platform. This API powers the core functionality of the application, providing secure user authentication (signup, login, and session management), exploring and fetching an extensive catalog of dramas, searching for specific titles, and managing user profiles. Built with performance in mind, it leverages cloud media management for efficient image handling and provides comprehensive endpoints to ensure a seamless client-side experience.

## 🚀 Tech Stack

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)](https://jwt.io/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=Cloudinary&logoColor=white)](https://cloudinary.com/)
[![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)](https://swagger.io/)
[![Nodemailer](https://img.shields.io/badge/Nodemailer-009639?style=for-the-badge&logo=maildotru&logoColor=white)](https://nodemailer.com/)

## ✨ Key Features

- **Robust Authentication & Security**: 
  - Secure user registration and login utilizing **bcrypt** for password hashing.
  - Stateless authentication using **JSON Web Tokens (JWT)** to manage user sessions securely.
  - Cross-Origin Resource Sharing (**CORS**) enabled for seamless and secure client-server communication.
- **Media Management**: Integrated with **Cloudinary** (via Multer) for highly efficient cloud-based image and media uploading.
- **Interactive API Documentation**: Fully documented API endpoints using **Swagger UI**, making testing and frontend integration a breeze.
- **Data Validation & Integrity**: Schema-based data modeling with Mongoose and rigorous request validation using Joi.
- **Email Notifications**: Integrated mailing service powered by Nodemailer.

## 📂 Project Structure

```text
KBinge-Backend/
├── config/           # Configuration files and external service setups
├── controllers/      # Business logic for handling API requests
├── models/           # Mongoose schemas and database models
├── public/           # Static assets
├── routes/           # Express API route definitions
├── swagger/          # Swagger documentation configuration and schemas
├── server.js         # Application entry point
├── package.json      # Project dependencies and npm scripts
└── .env              # Environment variables (not tracked in git)
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v14 or higher recommended)
- MongoDB database (Local instance or MongoDB Atlas)
- Cloudinary account for media storage

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd KBinge-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add the following essential configurations:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   SALT_ROUNDS=20
   EMAIL_USER="example@email.com"
   EMAIL_PASS="xxxx xxxx xxxx xxxx"
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:3000` (or your configured `PORT`).

## 📚 API Documentation

Once the server is running, you can access the interactive Swagger API documentation by navigating to:
```
http://localhost:3000/api-docs
```
*(Note: The exact path depends on your swagger setup, but `/api-docs` is standard)*

## 📜 Scripts

- `npm start`: Starts the server in production mode.
- `npm run dev`: Starts the server in development mode using `nodemon` for auto-reloading.
