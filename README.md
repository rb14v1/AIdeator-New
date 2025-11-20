## Aideator — Structured Idea Submission & Evaluation Platform

Aideator is a secure, enterprise-grade web platform designed to streamline structured idea submission and centralized evaluation. It features a conversational chatbot for users, a real-time analytics dashboard for admins, and robust role-based access control.

---

## 📌 Overview

- Conversational chatbot interface for guided idea submission
- Role-based authentication for Admin and User access
- Real-time admin dashboard with analytics and moderation tools
- PostgreSQL-backed data storage with audit-friendly persistence
- Scalable architecture for future AI scoring and multilingual support

---

## 🚀 Key Features

-  Two-way secure authentication (Admin/User)
-  Chatbot-driven idea capture (MCQ + descriptive)
-  Admin dashboard with rankings, trends, and approval history
-  Submission history and organization-wide visibility
-  Weekly activity charts and top idea rankings
-  Backend-native scoring and phase-based evaluation
-  Email notifications on approval/rejection

---

##  Tech Stack

| Layer        | Technology                     |
|--------------|--------------------------------|
| Frontend     | React.js + Tailwind CSS        |
| Backend      | Django + Django REST Framework |
| Database     | PostgreSQL                     |
| Auth         | JWT (SimpleJWT)                |
| Deployment   | AWS EC2 + Elastic Beanstalk    |
| Build Tools  | Vite                           |

---

##  Folder Structure

### Backend (`aideator/backend/`)
aideator/ # Django project (renamed from aideator_backend) 
├── settings.py 
├── urls.py 
├── wsgi.py conversations/ 

# Core app 
├── models.py 
├── views.py 
├── serializers.py 
├── admin.py 
├── services/ai_service.py 
├── utils/email.py 
├── tests.py
manage.py 
requirements.txt 
Procfile 
.ebextensions/

### Frontend (`aideator/frontend/`)
src/ 
├── components/Chatbot/ 
├── components/admin/ 
├── pages/ 
├── api/api.js 
├── App.jsx 
├── main.jsx public/ 
├── index.html 
vite.config.js 
package.json


---

## ⚙️ Setup Instructions

### Backend

```bash
# Clone repo
git clone https://gitlab.com/your-org/aideator.git
cd aideator/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env  # or create manually

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver
Frontend
bash
cd aideator/frontend
npm install
npm run dev
