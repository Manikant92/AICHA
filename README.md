# AICHA: AI-Powered Healthcare Assistant with Permit.io Authorization

AICHA is a modern healthcare management platform that leverages AI (Gemini), Supabase, and Permit.io to deliver secure, smart, and flexible healthcare features for doctors, nurses, and administrators.

---

## Key Features
- **AI-Powered Medical Analysis:** Run advanced medical analysis and get AI-generated treatment suggestions (powered by Gemini AI).
- **Role-Based Access Control:** Fine-grained permissions for admins, doctors, and nurses using Permit.io.
- **Secure Patient Data Management:** All patient records and user data are stored securely in Supabase.
- **Audit Logging:** Every important action and permission check is logged for compliance.
- **Real-Time User Management:** User roles and permissions are always up to date and synced between Supabase and Permit.io.

---

## How It Works
- **Gemini AI** powers the medical analysis and treatment suggestions.
- **Supabase** is used as the backend database for users, patients, and audit logs.
- **Permit.io** manages all access control, policies, and logs every permission check.
- When a user tries to access a feature (like running AI analysis), AICHA checks with Permit.io to see if they're allowed, based on their role, department, and other context.

---

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd <project-folder>
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the `backend` folder. **Do not hardcode any API keys or secrets in your code!**

Example `.env`:
```env
# Permit.io
PERMIT_API_KEY=your_permit_api_key
PERMIT_PROJECT_ID=your_permit_project_id
PERMIT_ENVIRONMENT=dev

# Supabase
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432

# Gemini AI (if using API keys)
GEMINI_API_KEY=your_gemini_api_key
```

Create a `.env` file in the `frontend` folder:
```env
REACT_APP_API_URL=http://localhost:3001  # Your backend API URL
```

> **Never commit your `.env` file or any sensitive keys to version control!**

### 4. Set Up Permit.io
#### Option A: Manual (Dashboard)
- Go to [Permit.io](https://permit.io) and create a project called "AICHA".
- Add resources (`patients`, `ai_analysis`, `treatment`), roles (`admin`, `doctor`, `nurse`), and set up policies as described in the blog.
- Generate your API key and add it to `.env`.

#### Option B: Automated (Script)
```bash
node scripts/permit-setup.js
```
This will create all resources, roles, and sync users automatically.

### 5. Run the Application
```bash
# Start the backend (from backend directory)
cd backend
npm start

# Start the frontend in a new terminal (from frontend directory)
cd frontend
npm start
```

The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:3001`.

---

## Usage
- Log in as an admin, doctor, or nurse.
- Try running AI analysis, suggesting treatments, or viewing patient records.
- All actions are checked with Permit.io for permission and logged for auditing.

---

## Blog
https://dev.to/manikant92/aicha-ai-powered-healthcare-assistant-with-permitio-authorization-2kpo