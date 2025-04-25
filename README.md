📌 Overview
The Volunteer Matching System is a full-stack web application designed to connect volunteers with available events based on their skills, preferences, and availability. The system supports user registration, profile management, event matching, notifications, and volunteer history tracking.

## 📂 Project Structure

volunteer-matching-system/ ├── controllers/ # Handles business logic and route control ├── middleware/ # Session management, authentication ├── models/ # Database models and schema validation ├── routes/ # API route definitions ├── scripts/ # Utility scripts (e.g., for seeding or setup) ├── utils/ # Helper functions ├── views/ # Frontend views (HTML, CSS, JS) ├── app.js # Entry point for the Express server ├── jest.config.js # Jest configuration for testing ├── package.json # Node.js project configuration ├── vite.config.js # Vite configuration for frontend build

⚙️ Getting Started
✅ Prerequisites
Node.js (v14+ recommended)

MySQL or a compatible SQL database

Git

📥 Clone the Repository
bash
Copy
Edit
git clone https://github.com/rossvc/software-design.git
Navigate into the project folder:

bash
Copy
Edit
cd software-design
📦 Install Dependencies
bash
Copy
Edit
npm install
This will install all required backend and frontend packages.

🚀 Running the Application
The app consists of a server (backend) and frontend views powered by Vite.

1️⃣ Start the Server
In your terminal, run:

bash
Copy
Edit
node app.js
This will start the Express server and handle API routes, session management, authentication, and matching logic.

🗄️ Database Configuration
Make sure your MySQL server is running and configured correctly.

Database connection settings are located in your models or config folder.

Adjust your database credentials (host, user, password, database) as needed.

✨ Features
User registration and authentication

Volunteer profile with skill and availability selection

Event listing and matching based on volunteer skills and preferences

Notifications for reminders and updates

Volunteer history tracking

Batch registration and matching functionality

PDF/CSV reporting feature for volunteer data

