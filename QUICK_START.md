# Quick Start: Setting Up Your AI App

## 🎯 Recommended Stack for AI Apps

### **Backend: FastAPI (Python)**
- Fast, modern, async
- Perfect for AI/ML model serving
- Auto-generated API docs

### **Frontend: Next.js 14 (React + TypeScript)**
- Server-side rendering
- Great developer experience
- Easy deployment

### **Database: PostgreSQL + Redis**
- PostgreSQL: Main database
- Redis: Caching & sessions

### **Vector DB: Pinecone or Qdrant**
- For embeddings & RAG applications

### **AI: OpenAI + LangChain**
- OpenAI: GPT models, embeddings
- LangChain: Orchestration & chains

---

## 🚀 Installation Commands

### 1. Backend Setup (FastAPI)

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn[standard] pydantic pydantic-settings
pip install sqlalchemy asyncpg redis
pip install openai langchain python-dotenv
pip install python-jose[cryptography] passlib[bcrypt]
```

### 2. Frontend Setup (Next.js)

```bash
# Create Next.js app
npx create-next-app@latest frontend --typescript --tailwind --app

# Install additional packages
cd frontend
npm install axios @tanstack/react-query zustand react-hook-form zod
```

### 3. Database Setup

```bash
# PostgreSQL (using Docker)
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Redis (using Docker)
docker run --name redis -p 6379:6379 -d redis
```

---

## 📁 Project Structure

```
argus/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── api/
│   │   │   └── routes/      # API endpoints
│   │   ├── models/          # Database models
│   │   ├── services/        # Business logic
│   │   └── core/            # Config, security
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js app directory
│   │   ├── components/      # React components
│   │   └── lib/             # Utilities
│   ├── package.json
│   └── .env.local
└── docker-compose.yml       # Optional: for local dev
```

---

## 🔑 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/argus
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_key_here
SECRET_KEY=your_secret_key_here
ENVIRONMENT=development
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Argus
```

---

## 🎬 Next Steps

1. **Initialize Git:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Start Backend:**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

3. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

---

## 📚 Key Libraries Summary

| Category | Library | Purpose |
|---------|---------|---------|
| **Backend** | FastAPI | Web framework |
| **Backend** | SQLAlchemy | ORM |
| **Backend** | OpenAI | AI models |
| **Backend** | LangChain | AI orchestration |
| **Frontend** | Next.js | React framework |
| **Frontend** | TanStack Query | Data fetching |
| **Frontend** | Zustand | State management |
| **Database** | PostgreSQL | Main database |
| **Cache** | Redis | Caching |
| **Vector DB** | Pinecone/Qdrant | Embeddings storage |

---

## 💡 Pro Tips

1. **Use TypeScript** - Catch errors early
2. **Start with managed services** - Pinecone, Vercel, Railway
3. **Use Docker** - Consistent environments
4. **Implement rate limiting** - Protect your API
5. **Add logging** - Monitor your app
6. **Write tests** - Ensure reliability
7. **Use environment variables** - Never commit secrets

---

Ready to build! 🚀
