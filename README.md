# Typing Mastery

**Typing Mastery** is a sophisticated web application built to enhance typing speed and accuracy through a high performance, responsive interface. Inspired by a vintage wooden aesthetic, the platform offers a focused environment for users to practice solo or compete in multiplayer challenges. It handles data with precision, offering persistent game sessions and deep statistical insights for registered members.

---

## Technologies Used

### Frontend
* **React.js:** Core framework for component based architecture.
* **Tailwind CSS:** Custom vintage themed styling with high performance utility classes.
* **React Router:** Secure navigation and protected route management.
* **Socket.io-client:** Real time bi directional communication for multiplayer races.
* **Axios:** Configured with `withCredentials` for secure cookie based API calls.
* **Lucide React:** Vector based iconography for a minimalist UI.

### Backend
* **Node.js & Express:** Scalable server environment and RESTful API design.
* **JWT (JSON Web Tokens):** Secure authentication managed via **HttpOnly Cookies**.
* **Socket.io:** WebSocket integration for managing game rooms and live progress tracking.
* **Cookie-parser:** Middleware for parsing and managing secure browser cookies.
* **Bcrypt:** Secure hashing for user password protection.

### Database & Deployment
* **MySQL:** Relational data storage for users, games, and leaderboards.
* **Sequelize ORM:** Advanced modeling and migration management.
* **Railway:** Database hosting and management (MySQL).
* **Netlify:** Frontend deployment and serverless function hosting.

---

##  Project Setup

### 1. Database Setup (Railway)
1.  Create a new project on [Railway.app](https://railway.app/).
2.  Add a **MySQL** service to your project.
3.  Copy the provided **Connection URL** (format: `mysql://user:password@host:port/database_name`). 
4.  No manual table creation is required; the backend migrations will handle the schema.

### 2. Backend Setup (Netlify Functions / Express)
1.  Navigate to your server directory: `cd server`.
2.  Install dependencies: `npm install`.
3.  Create a `.env` file with the following variables:
    ```env
    PORT=5000
    DATABASE_URL=your_railway_MySQL_url
    JWT_SECRET=your_secure_random_string
    NODE_ENV=production
    FRONTEND_URL=[https://your-app-name.netlify.app](https://your-app-name.netlify.app)
    ```
4.  Initialize the database: `npx sequelize-cli db:migrate`.
5.  Link your repository to **Netlify** and configure the build settings for serverless functions.

### 3. Frontend Setup
1.  Navigate to your client directory: `cd client`.
2.  Install dependencies: `npm install`.
3.  Configure your API base URL in your configuration file or environment variables:
    ```env
    VITE_API_URL=[https://your-backend-api.netlify.app/api](https://your-backend-api.netlify.app/api)
    VITE_SOCKET_URL=[https://your-backend-api.netlify.app]
    ```
4.  Launch the development environment: `npm run dev`.
5.  Deploy the project: `npm run build`.

---
##  Key Features & Implementation Logic

### Session Persistence: Uses sessionStorage for tab-level isolation, allowing users to refresh the browser during a test and resume progress without data loss.

### Real Time Multiplayer: Leverages Socket.io for room orchestration, live opponent progress broadcasting, and synchronized race countdowns.

### HttpOnly Authentication: Secures user sessions with JWTs stored in HttpOnly cookies, rendering them invisible to client-side scripts to prevent XSS theft.

### Sanitized Input: Integrates DOMPurify across all auth forms to strip malicious code while preserving password integrity.

### Optimized Database Queries: Uses Sequelize ORM with MySQL to handle relational data, migrations, and automated user statistics updates.
---

##  Future Enhancements
* **Achievement Badges:** Unlock Different badges based on speed milestones.
* **Specialized Lessons:** Drills focused on coding syntax (Python, C++, Java) or medical terminology, or any other things.
* **Global Chat:** A vintage telegram style lobby chat for users waiting for multiplayer races.
* **Ghost Mode:** Race against your own previous personal best "ghost" in solo practice.

---

## Join the Typing Guild!
Got a feature idea that’s faster than a `150 WPM` sprint? Found a bug that needs to be squashed like a mosquito on a wooden desk? **This project is wide open for your magic!** Whether you're a CSS wizard or a Backend brawler, feel free to fork it, fix it, and flip it. Pull requests are the fuel that keeps this vintage machine running don't be shy, let's build something legendary together! 

---

##  License & Love
* **License:** Distributed under the **MIT License**.
* **Support:** If this project helped you find your rhythm, **drop a ⭐ on the repo** it keeps the coffee brewing!

**Made with ❤️ by Saad**
