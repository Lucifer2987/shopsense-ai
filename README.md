# ShopSense AI — Voice-Enabled Intelligent Grocery Shopping Assistant

ShopSense AI is a modern full-stack e-commerce and voice shopping assistant built for fast, natural grocery management in multiple Indian languages (Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, and English).

---

## 🌟 Key Features

- 🎙️ **Multi-Language Voice Shopping:** Speak natural grocery requests (*"bhai 2 litre doodh add kar de"*, *"find organic apples under 200"*, *"mera budget 1000 hai"*) in 12+ Indian languages.
- ⚡ **Real-time Live Transcript:** Visual soundwaves and streaming speech recognition powered by Web Speech API.
- 🧠 **AI-Powered Intent Parsing:** Gemini parses multilingual spoken text into actionable e-commerce intents (`ADD_ITEM`, `SEARCH_PRODUCT`, `SET_BUDGET`, `CREATE_CONTEXT`).
- 🛒 **Intuitive E-Commerce UI:** Clean grocery shelves, product steppers (`- 1 +`), quick-add cards, budget progress meters, and basket optimization.
- 📦 **PostgreSQL & Supabase Real-time Database:** Reliable product lookup, stock checking, and shopping list management.
- 🌓 **Light & Dark Theme:** Sleek modern interface with full theme persistence.

---

## 🏗️ Architecture

```
ShopSense AI
├── backend/                  # Flask REST API & AI Service
│   ├── app/
│   │   ├── routes/          # API Blueprints (products, voice, shopping, recommendations, etc.)
│   │   ├── schemas/         # Pydantic data schemas
│   │   └── services/        # Business logic (Gemini, Supabase, Product lookup, Shopping list)
│   ├── requirements.txt     # Python dependencies
│   └── run.py               # Flask server entry point
│
└── frontend/                 # Next.js 16 (Turbopack) & Tailwind CSS v4
    ├── src/
    │   ├── app/             # App Router pages and layout
    │   ├── components/      # E-Commerce & Voice UI components
    │   ├── context/         # App state & Theme context
    │   ├── hooks/           # Voice recognition & Product hooks
    │   └── lib/api/         # Typed API clients
    └── package.json         # Node.js dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- Supabase Project & Google Gemini API Key

---

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment configuration
cp .env.example .env
```

Configure your `.env` file:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
CORS_ORIGINS=http://localhost:3000
```

Start the backend:
```bash
python run.py
```
Backend will be available at `http://localhost:5000`.

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env.local
```

Start the frontend dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Environment & Security

All sensitive credentials (`.env`, `.env.local`, API keys) are strictly ignored via `.gitignore`. Always use `.env.example` templates for configuration.

---

## 📄 License

MIT License.
