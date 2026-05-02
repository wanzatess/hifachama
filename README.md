# HiFaChama 💰

A full-stack financial management platform designed for Kenyan investment groups (chamas).

## Features
- User registration & authentication
- Chama group creation and management
- Contribution tracking and transaction history

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Django, Python |
| Database | PostgreSql |
| Auth | Django Authentication |

## Setup

### Prerequisites
- Python 3.x
- Node.js & npm

### Backend
```bash
# Clone the repo
git clone https://github.com/wanzatess/hifachama.git
cd hifachama

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env  # then fill in your values

# Run migrations
python manage.py migrate

# Start the backend server
python manage.py runserver
```

### Frontend
```bash
cd hifachama_frontend
npm install
npm run dev
```

The backend runs on http://localhost:8000 and the frontend on http://localhost:5173.

## About
Built to digitize the management of chamas — a cornerstone of savings culture in Kenya.
