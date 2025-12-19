# SafeStream

SafeStream is a secure video streaming and management platform built with the MERN stack (MongoDB, Express, React, Node.js). It features user authentication, role-based access control, video uploading, processing, and streaming capabilities.

## Tech Stack

-   **Frontend**: React, Vite, TypeScript, TailwindCSS, Axios, Lucide React
-   **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose), JWT, Multer
-   **DevOps**: Docker, Docker Compose

## Prerequisites

Before you begin, ensure you have the following installed:
-   [Node.js](https://nodejs.org/) (v16 or higher)
-   [MongoDB](https://www.mongodb.com/) (Local or Atlas URI)
-   [Docker](https://www.docker.com/) (Optional, for containerized run)

## Getting Started

Choose one of the following methods to start the application.

### Option 1: Docker Setup (Recommended)

If you have Docker installed, you can start the entire stack with a single command:

```bash
docker-compose up --build
```
This will start:
-   MongoDB on port 27017
-   Backend on port 5000
-   Frontend on port 80 (mapped to localhost:80)

### Option 2: Manual Development Setup

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd Pulse Talent Team
```

#### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/safestream # Or your MongoDB Atlas URI
JWT_SECRET=your_super_secret_key
# Optional: FFmpeg path if not globally installed
```

Start the backend server:
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

#### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

## Usage Guide

### Authentication
-   **Register**: Create a new account. You can choose a role (Viewer, Editor, Admin) during registration (for demo purposes).
-   **Login**: Access your dashboard using email and password.

### Video Management
-   **Upload**: Editors and Admins can upload videos. You must provide a Title and Video File. Description is optional.
-   **Watch**: Click on any video thumbnail to stream it.
-   **Dashboard**: View all available videos.

### Admin Features
-   **User Management**: Admins can view and delete users.

## API Endpoints

### Auth (`/api/auth`)
-   `POST /register`: Register a new user.
-   `POST /login`: Authenticate user and get token.

### Videos (`/api/videos`)
-   `GET /`: Get all videos (filtered by user/role).
-   `POST /`: Upload a new video (Editor/Admin only).
-   `GET /:id`: Get video metadata.
-   `GET /:id/stream`: Stream video content.

### Users (`/api/users`)
-   `GET /`: List all users (Admin only).
-   `DELETE /:id`: Delete a user (Admin only).

## Testing
-   **Backend**: Run `npm test` in the backend directory to run Jest tests.
-   **Frontend**: Run `npm test` in the frontend directory to run Vitest tests.
