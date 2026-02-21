# Helpdesk Customer Support Widget System

A comprehensive customer support system with a real-time chat widget, admin dashboard, and scalable backend.

## Features

- **Real-time Chat**: Powered by Socket.io for instant messaging.
- **Admin Dashboard**: Manage websites, chats, and view analytics.
- **Embeddable Widget**: Easy-to-integrate widget for any website.
- **Multi-website Support**: Manage multiple websites from a single admin panel.
- **Role-based Access**: Super Admin, Admin, and Agent roles.
- **Authentication**: Secure JWT-based authentication.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes, Socket.io (Custom Server)
- **Database**: MySQL, Prisma ORM
- **Authentication**: JWT, bcrypt

## Prerequisites

- Node.js (v18+)
- MySQL Database

## Setup Instructions

1.  **Clone the repository** (if applicable) or navigate to the project directory.

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory (already created) and update the `DATABASE_URL` with your MySQL credentials.
    ```env
    DATABASE_URL="mysql://user:password@localhost:3306/helpdesk"
    JWT_SECRET="your-secret-key"
    NEXTAUTH_URL="http://localhost:3000"
    ```

4.  **Database Setup**
    Initialize the database schema:
    ```bash
    npx prisma db push
    ```

5.  **Seed the Database**
    Create the initial Super Admin account:
    ```bash
    npx prisma db seed
    ```
    Default credentials:
    - Email: `admin@example.com`
    - Password: `admin123`

6.  **Run the Development Server**
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:3000`.

## Usage

1.  **Admin Login**: Go to `http://localhost:3000/admin/login` and log in with the default credentials.
2.  **Create Website**: Navigate to "Websites" and add a new website. Copy the generated API Key.
3.  **Test Widget**: Go to `http://localhost:3000/widget-demo`. Follow the instructions to simulate embedding the widget using your API Key.
4.  **Chat**: Open the widget demo in one browser window (Visitor) and the Admin Dashboard > Chats in another (Admin). Send messages to test real-time communication.

## Production Deployment

- Build the application: `npm run build`
- Start the production server: `npm start`
- Ensure your database and Redis (if used for Socket.io scaling) are properly secured.
- Update `CORS_ORIGIN` and other environment variables for the production domain.
