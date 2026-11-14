HisabBook MongoDB deployment package

Files:
- server.js
- package.json
- public/index.html

Render settings:
- Runtime: Node
- Build Command: npm install
- Start Command: npm start

Render Environment Variables (add in Render dashboard, never in GitHub):
- MONGODB_URI = your MongoDB Atlas connection string, with the database name hisabbook
- APP_PASSWORD = choose a strong private password for opening the app
- JWT_SECRET = a long random secret (at least 32 characters)

Important:
- Do not paste secrets into chat or commit them to GitHub.
- In MongoDB Atlas Network Access, allow access from Render. For a beginner setup, 0.0.0.0/0 works but is broader than ideal; use the narrowest access method Atlas/Render supports for your setup.
- Existing entries currently stored only in the old browser do not automatically migrate to MongoDB. Export a HisabBook JSON backup and restore/import it after deployment if you have existing records. Keep a separate backup.
