# SafariLog: Trip Route Planner with ELD Logs

A full-stack web application built with **Django (Backend)** and **React (Frontend)** that helps truck drivers plan trips, visualize routes, and generate compliant ELD (Electronic Logging Device) logs.

## 🔗 Live Demo
- **Frontend (Vercel):** [https://trip-route-planner.vercel.app](https://safari-log-two.vercel.app/)
- **Backend (Render):** [https://trip-planner-django.onrender.com](https://safarilog.onrender.com/)

## 🛠️ Technologies Used
- **Frontend:** React, Leaflet (maps), OpenRouteService API (routing), TailwindCSS
- **Backend:** Django REST Framework, PostgreSQL
- **Deployment:** Vercel (Frontend), Render (Backend)

## 📋 Features
1. **Trip Inputs:**
   - Current location, pickup/dropoff locations, current cycle hours.
2. **Route Visualization:**
   - Interactive map with route highlighting (via Leaflet).
3. **ELD Compliance:**
   - Auto-generated daily log sheets with rest stops based on FMCSA 70hrs/8days rule.
   - Fuel stop reminders (every 1,000 miles).
4. **Responsive UI:** Clean, driver-friendly interface.

## 🚀 Setup (Local Development)
1. **Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   python manage.py runserver
