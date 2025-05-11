# 🔐 Password Manager Project

A full-stack password manager built with React, Express.js, and MongoDB, featuring modern encryption techniques, password strength analytics, breach detection, and user-friendly UI. Designed with a zero-knowledge architecture and scalable deployment in mind.

## ✨ Features

- **AES-GCM encryption** for secure credential storage
- **Argon2id key derivation** with PBKDF2 for password-based encryption
- **Live password strength analysis** using entropy estimation and character-set heuristics
- **HaveIBeenPwned API integration** for real-time breach detection
- **Custom password generator** based on entropy targets and combinatorics
- **Dockerized backend** with GitHub Actions CI/CD pipeline
- **Azure integration** for deployment, secret storage (Key Vault), and database (Cosmos DB)
- **Edit/Add/Delete** passwords interface

## ⚙️ Technologies

- **Frontend:** React, Tailwind CSS
- **Backend:** Express.js, Node.js
- **Database:** MongoDB
- **Security:** AES-GCM, Argon2id, crypto, HaveIBeenPwned API
- **DevOps:** Docker, GitHub Actions, Azure App Services, Azure Key Vault

## 🛠 Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/chynphie/passop_mongo.git
cd passop_mongo
```

### 2. Set Environment Variables
Create a .env file in the root with the following:

```bash
MONGO_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
ENCRYPTION_KEY=<your_aes_gcm_key>
HIBP_API_KEY=<your_hibp_api_key> (optional)
```
### 3. Run Backend
```bash
cd backend
npm install
npm run dev
```
### 4. Run Frontend
```bash
cd frontend
npm install
npm start
```

## 🧪 Testing & CI/CD
- Automated linting and test scripts run on every push via GitHub Actions.
- Docker containers for staging and production environments.
- Deployable directly to Azure App Service via GitHub workflows.

## 📚 Future Enhancements
- Monte Carlo simulation to estimate brute-force compromise probability
- OAuth2 integration for third-party login (e.g., Google)
- Multi-device synchronization and biometric login

## 🧠 Inspiration
This project was built to explore real-world secure storage systems and apply coursework in:
- Cryptography
- -Combinatorics
- Probability and simulation
- Full-stack web development
