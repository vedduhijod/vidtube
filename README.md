# vidtube
This project demonstrates how to design and implement a scalable backend for a video hosting platform, covering real-world features and best practices.

🔧 Tech Stack
Backend Framework: Node.js with Express

Database: MongoDB with Mongoose ODM

Authentication: JWT (Access + Refresh Tokens), bcrypt for password hashing

Validation & Middleware: Custom middleware for error handling, validation, async flow

Modular Architecture: MVC pattern with clean route-controller-service separation

✨ Features
User signup, login, and secure authentication flow

Access & Refresh token implementation using cookies

Full CRUD APIs for videos, playlists, comments, and subscriptions

Like, dislike, watch history, and view tracking systems

Channel creation and user profile management

Middleware for auth protection, request validation, and error handling

Organized folder structure for scalability and maintainability

📁 Project Structure
bash
Copy
Edit
chai-backend/
│
├── controllers/        # Business logic for each route
├── models/             # Mongoose schemas
├── routes/             # API route definitions
├── middlewares/        # Custom middleware (auth, error handling, etc.)
├── utils/              # Utility functions and helpers
├── config/             # Environment and DB config
├── .env.sample         # Sample environment variables
└── server.js           # Entry point
