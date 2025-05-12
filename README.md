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

### 2. Run Backend
```bash
cd backend
npm init
npm install express
node server.js
```
### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev
```

### 📸User Interface:
<img width="1762" alt="image" src="https://github.com/user-attachments/assets/d690aac6-35a9-4e6f-a29b-84dcd180b0b4" />
<img width="2005" alt="image" src="https://github.com/user-attachments/assets/47ea65a4-9944-4b4a-953c-9b1d6d8ec5d2" />



## 🧪 Testing & CI/CD
- Automated linting and test scripts run on every push via GitHub Actions.
- Docker containers for staging and production environments.
- Deployable directly to Azure App Service via GitHub workflows.

## 📚 Future Enhancements
- Monte Carlo simulation to estimate brute-force compromise probability
- OAuth2 integration for third-party login (e.g., Google)
- Multi-device synchronization and biometric login
