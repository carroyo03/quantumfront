# 🚀 Deployment Guide: QuantumPortfolio Coach

To move from `localhost` to the live web, follow these steps.

## 1. Prepare your Repository
Make sure all your files are in a GitHub repository.
- `index.html`, `styles.css`, `script.js` (Root)
- `backend/` folder (with `app.py` and `requirements.txt`)

## 2. Deploy the Backend (Python/FastAPI)
I recommend **Render.com** (Free/Easy):
1. Create a Render account.
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository.
4. Set the following:
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py` (or `gunicorn app:app` if using a production server)
5. Copy the URL Render gives you (e.g., `https://quantum-coach-api.onrender.com`).

## 3. Connect the Frontend
1. Open your `script.js`.
2. Find this line:
   ```javascript
   const API_BASE_URL = 'http://localhost:8000';
   ```
3. Update it with your Render URL:
   ```javascript
   const API_BASE_URL = 'https://your-app-name.onrender.com';
   ```
4. Push this change to GitHub.

## 4. Deploy the Frontend (HTML/CSS/JS)
I recommend **Netlify** or **Vercel**:
1. Connect your GitHub repo.
2. Select the root folder.
3. Deploy.
4. You'll get a URL like `https://quantum-coach.netlify.app`.

## 5. Environment Variables (Security)
In production, you'll want to add your OpenAI API Key or other secrets to the Render dashboard's "Environment Variables" section, rather than keeping them in the code.

---
**Need help with a specific part of this? Just ask!**
