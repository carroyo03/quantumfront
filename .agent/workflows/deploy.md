---
description: How to deploy the QuantumCoach application to the web
---

1. Ensure the code is pushed to a GitHub repository.
2. Deploy the backend to a service like Render or Railway.
   - Point the build to the `backend/` directory.
   - Use `pip install -r requirements.txt` as the build command.
   - Use `python app.py` or a production WSGI server as the start command.
3. Update `API_BASE_URL` in `script.js` to the live backend URL.
4. Deploy the root directory to a static hosting provider like Netlify, Vercel, or GitHub Pages.
5. Setup CORS on the backend if necessary to allow requests from the frontend domain.
