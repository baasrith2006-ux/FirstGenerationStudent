# PathWise Enterprise Edition 🏛️🚀

> **Empowering First-Generation Students with AI-Driven Personalized Learning.**

PathWise is a professional, high-performance learning companion built to MNC standards. It features a hardened Node.js backend, a cloud-native Supabase database, and a Google Material Design 3 frontend.

## 🌟 Key Pillars

### 🔐 Security & Resilience
- **Helmet.js Hardening**: Protection against XSS, clickjacking, and other common attacks.
- **Strict Rate Limiting**: AI endpoints protected against DDoS and brute-force abuse.
- **Schema Validation**: All data is strictly validated using Joi before hitting the database.
- **Enterprise Logging**: Structured JSON logging powered by Winston for professional observability.

### 🧠 AI Features
- **Study DNA Profile**: Behavioral analysis of your learning patterns.
- **Academic GPS**: Dynamic curriculum mapping.
- **AI Mentor Chat**: Personalized 24/7 tutor with persistent memory.
- **Adaptive Testing**: Intelligent difficulty adjustment based on performance.

### 🏗️ Technical Architecture
- **Frontend**: Vanilla JS + Google Material Design 3.
- **Backend**: Node.js + Express (Modular architecture).
- **Database**: Supabase (PostgreSQL).
- **DevOps**: Docker & Docker Compose ready.

## 🚀 Getting Started

### Prerequisites
- Node.js v20+
- Supabase Project

### Environment Setup
Create a `.env` in the `backend/` folder:
```env
PORT=5000
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
NODE_ENV=production
```

### Installation
```bash
# Install backend dependencies
cd backend
npm install

# Run the project
npm run start
```

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built with ❤️ by the PathWise Enterprise Team.*
