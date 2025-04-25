# Volunteer Center

## 📌 Overview

- **Volunteer Center** is a web-based application.
- Designed to facilitate:
  - Volunteer management
  - Event registration
  - Matching volunteers to events based on skills and availability
- Developed as part of **Group 20 COSC4353 (Software Design)** coursework.
- Focuses on:
  - Modular architecture
  - Authentication and validation

## 🛠️ Technologies Used

- **Programming Language:**
  - JavaScript (Node.js for backend)
  - Vite + JavaScript for frontend
- **Frameworks/Libraries:**
  - Express.js (Backend)
  - Vite (Frontend)
  - Jest (Testing)
- **Database:**
  - MySQL
- **Tools:**
  - Git
  - GitHub for version control

## 📂 Project Structure

- `controllers/` – Handles request logic and business operations
- `middleware/` – Authentication and session management
- `models/` – Database models and data validation
- `routes/` – API routes for events, volunteers, matching, etc.
- `scripts/` – Scripts for batch registration and UI functions
- `utils/` – Utility functions
- `views/` – Frontend views and templates
- `app.js` – Main server file
- `jest.config.js` – Jest testing configuration
- `package.json` – Project metadata and dependencies
- `vite.config.js` – Frontend build configuration
- `README.md` – Project documentation (this file)
## 🚀 How to Run the Project

### 📦 Install Dependencies

- Install all required project dependencies using the following command:

  ```bash
  npm install

## ⚙️ Set Up Environment Variables
- The project requires a connection to a database.

- To configure the database connection:

- Create a .env file in the root directory of the project.

- Inside the .env file, add the following database configuration:

```bash
DB_HOST=198.23.136.165
DB_USER=singhgang
DB_PASSWORD="GreatPassword!!!FRThisIsSoGood12#"
DB_NAME=volunteer_db
``` 
## ▶️ Start the Server
- To run the application, use the following command:
```bash
node app.js
``` 
