# SkillLink 🇳🇴

> Connects people with local opportunities — a community platform for small jobs, services, and micro-businesses.

---

## 🔭 Vision

SkillLink helps people in Norway — including refugees, students, and local communities — find work, offer skills, and connect with opportunities in a simple and accessible way.

---

## ✨ Features (MVP)

- 🔐 User authentication (signup / login)
- 📝 Post jobs or offer services
- 📍 Browse nearby opportunities
- 💬 Chat between users
- 🤖 AI assistant for guidance

---

## 🛠️ Tech Stack

| Layer    | Technology              |
| -------- | ----------------------- |
| Frontend | Next.js (React)         |
| Backend  | Node.js (API routes)    |
| Database | Supabase (PostgreSQL)   |
| Auth     | Supabase Auth           |
| AI       | OpenAI API              |
| Maps     | OpenStreetMap           |

---

## 🏗️ Architecture

```
User → Frontend → Backend API → Services → Database + AI
```

---

## 🔒 Security & Privacy

- No personal data stored in the repository
- Secure authentication via Supabase
- Environment variables required for all API keys

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/skilllink.git
cd skilllink
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add environment variables

Create a `.env.local` file in the project root and add the required keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the app

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 🤝 Contributing

This project is open-source and aims to support civic tech initiatives like **Code for Norway**.

Feel free to open issues and submit pull requests!

---

## 🔮 Future Features

- ⭐ Ratings & reviews
- 🗺️ Location-based search
- 📱 Mobile app
- 💳 Payment integration
- 🛡️ Advanced trust & safety system

---

## 📄 License

MIT License
