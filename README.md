<div align="center">

<h1>ShopSense AI</h1>
<p><strong>Voice-Enabled Intelligent Grocery Shopping for India</strong></p>

<p>
  <img src="https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Flask-3.1-blue?style=flat-square&logo=flask" alt="Flask" />
  <img src="https://img.shields.io/badge/Gemini-2.19-orange?style=flat-square&logo=google" alt="Gemini" />
  <img src="https://img.shields.io/badge/Supabase-2.31-green?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Python-3.10+-yellow?style=flat-square&logo=python" alt="Python" />
</p>

<p>
  ShopSense is a real grocery e-commerce website with AI-powered voice shopping built in.<br/>
  Shop by speaking naturally in Hindi, Hinglish, English, or 12 Indian languages.
</p>

</div>

---

## 📸 Screenshots

<!-- Replace the placeholder below with your actual screenshot paths -->

| <img width="1602" height="981" alt="image" src="https://github.com/user-attachments/assets/fe734ffb-9c80-4916-85b6-07850271c736" />
 | <img width="598" height="591" alt="image" src="https://github.com/user-attachments/assets/948e622f-5623-4158-9ef1-062bac5abe55" />
 | <img width="1917" height="969" alt="image" src="https://github.com/user-attachments/assets/b107b94f-1e61-4e79-8738-88653c10c499" />
|

> **How to add:** Place your screenshot files in the repo root or `/docs/screenshots/` and update the table above.

---

## 🏗️ Architecture

<img width="1401" height="1756" alt="ShopeSenseAI_Arch" src="https://github.com/user-attachments/assets/621006f5-100b-48ef-98ff-fc68d62a8ef1" />

---

## ✨ Features

- 🎙️ **Voice Shopping in 12 Indian Languages** — Speak naturally in Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Gujarati, Punjabi, Kannada, Malayalam, Urdu, or English
- 🛒 **Real E-Commerce Experience** — Product catalog, categories, search, cart, checkout flow
- 🧠 **AI Intent Parsing** — Gemini converts spoken grocery requests into structured shopping commands
- 📦 **Context-Aware Suggestions** — Say *"kal 4 log aa rahe hain"* and get smart guest-ready product recommendations
- ⚡ **12-Minute Instant Delivery UX** — Designed like modern quick-commerce apps
- 🌓 **Light & Dark Mode** — Full theme support with smooth transitions
- 💰 **Budget-Aware Shopping** — Set a budget, track spending in real time
- 🔄 **Basket Optimizer** — Find cheaper brand alternatives for your current cart

### Voice Command Examples

```
"bhai 2 litre doodh add kar de"      → ADD_ITEM: Milk ×2
"bread aur eggs bhi daal de"          → ADD_ITEM: Bread, Eggs
"find organic apples under 200"       → SEARCH_PRODUCT
"mera budget 1000 hai"                → SET_BUDGET: ₹1000
"kal 4 friends aa rahe hain"          → CREATE_CONTEXT: 4 guests
```

---

## 🗂️ Project Structure

```
shopsense-ai/
├── backend/                          # Flask REST API
│   ├── app/
│   │   ├── routes/                   # API Blueprints
│   │   │   ├── health.py
│   │   │   ├── products.py
│   │   │   ├── voice.py
│   │   │   ├── shopping.py
│   │   │   ├── recommendations.py
│   │   │   ├── basket.py
│   │   │   ├── context.py
│   │   │   └── history.py
│   │   ├── schemas/                  # Pydantic data models
│   │   │   ├── intent.py
│   │   │   ├── shopping.py
│   │   │   └── common.py
│   │   └── services/                 # Business logic
│   │       ├── gemini_service.py     # Google Gemini AI
│   │       ├── supabase_service.py   # Database client
│   │       ├── product_service.py    # Product lookup + Hinglish normalization
│   │       ├── intent_service.py     # Voice intent parsing
│   │       ├── shopping_service.py   # Shopping list management
│   │       ├── recommendation_service.py
│   │       ├── basket_service.py
│   │       └── context_service.py
│   ├── tests/                        # Automated test suite
│   ├── requirements.txt
│   ├── run.py                        # Flask server entry point
│   └── .env.example
│
└── frontend/                         # Next.js 16 + Tailwind CSS v4
    └── src/
        ├── app/                      # App Router pages + layout
        ├── components/
        │   ├── ecommerce/            # Product catalog UI
        │   │   ├── ProductCard.tsx
        │   │   ├── ProductSectionRow.tsx
        │   │   ├── CategoryIconGrid.tsx
        │   │   ├── ProductGrid.tsx
        │   │   ├── ProductFilters.tsx
        │   │   └── PromoBanners.tsx
        │   ├── voice/                # Voice shopping components
        │   │   ├── FloatingVoiceAssistant.tsx
        │   │   └── VoiceAssistantModal.tsx
        │   ├── shopping/             # Cart + Basket optimizer
        │   │   ├── ShoppingListDrawer.tsx
        │   │   └── BasketOptimizerModal.tsx
        │   ├── context/              # AI shopping context
        │   │   ├── ContextShoppingStrip.tsx
        │   │   └── CreateContextModal.tsx
        │   ├── layout/               # Header, Mobile Nav
        │   └── recommendations/      # Personalized suggestions
        ├── context/                  # React state (App + Theme)
        ├── hooks/                    # useProducts, useVoiceAssistant
        ├── lib/api/                  # Typed API clients
        └── types/                    # TypeScript interfaces
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |
| Supabase account | — |
| Google AI Studio API key | — |

---

### 1. Clone the Repository

```bash
git clone https://github.com/Lucifer2987/shopsense-ai.git
cd shopsense-ai
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
```

Edit `backend/.env` with your credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_google_gemini_api_key
CORS_ORIGINS=http://localhost:3000
```

Start the Flask development server:

```bash
python run.py
```

Backend API available at `http://localhost:5000`.

---

### 3. Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the Next.js development server:

```bash
npm run dev
```

Frontend available at `http://localhost:3000`.

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check + DB status |
| `GET` | `/api/products` | List products (search, filter, category) |
| `GET` | `/api/products/:id` | Get single product by ID |
| `POST` | `/api/voice/command` | Send voice/text command to Gemini |
| `POST` | `/api/shopping/lists` | Create a shopping list |
| `GET` | `/api/shopping/lists/:id` | Get list with all items |
| `POST` | `/api/shopping/lists/:id/items` | Add item to list |
| `PATCH` | `/api/shopping/items/:id` | Update item quantity / completion |
| `DELETE` | `/api/shopping/items/:id` | Remove item from list |
| `POST` | `/api/context` | Create a shopping context |
| `GET` | `/api/recommendations` | Get personalized recommendations |
| `POST` | `/api/basket/optimize` | Find cheaper brand alternatives |

### Voice Command Request

```http
POST /api/voice/command
Content-Type: application/json

{
  "text": "bhai 2 litre doodh add kar de",
  "list_id": "uuid-of-shopping-list",
  "user_id": "uuid-of-user"
}
```

### Voice Command Response

```json
{
  "success": true,
  "message": "Added 2.0 litre of Amul Taaza Milk to your list.",
  "data": {
    "intent": "ADD_ITEM",
    "added": [
      {
        "product": "Amul Taaza Milk",
        "brand": "Amul",
        "quantity": 2,
        "unit": "litre",
        "price": 62
      }
    ]
  }
}
```

---

## 🌐 Supported Languages

| Language | BCP-47 Code | Sample Command |
|----------|-------------|----------------|
| English / Hinglish | `en-IN` | *"Add 2 litres of milk"* |
| Hindi | `hi-IN` | *"दो लीटर दूध जोड़ें"* |
| Bengali | `bn-IN` | *"২ লিটার দুধ যোগ করুন"* |
| Tamil | `ta-IN` | *"2 லிட்டர் பால் சேர்"* |
| Telugu | `te-IN` | *"2 లీటర్ పాలు జోడించు"* |
| Marathi | `mr-IN` | *"2 लिटर दूध घाला"* |
| Gujarati | `gu-IN` | *"2 લિટર દૂધ ઉમેરો"* |
| Punjabi | `pa-IN` | *"2 ਲੀਟਰ ਦੁੱਧ ਪਾਓ"* |
| Kannada | `kn-IN` | *"2 ಲೀಟರ್ ಹಾಲು ಸೇರಿಸಿ"* |
| Malayalam | `ml-IN` | *"2 ലിറ്റർ പാൽ ചേർക്കൂ"* |
| Urdu | `ur-IN` | *"2 لیٹر دودھ شامل کریں"* |
| Odia | `or-IN` | *"2 ଲିଟର ଦୁଧ ଯୋଡ"* |

---

## 🗄️ Database Schema

The project uses **Supabase (PostgreSQL)** with the following core tables:

| Table | Description |
|-------|-------------|
| `products` | Grocery product catalog (name, brand, price, category, unit, stock) |
| `profiles` | User profiles (linked to Supabase Auth) |
| `shopping_lists` | Named shopping lists per user |
| `shopping_items` | Items in each list (product_id, quantity, unit, is_completed) |
| `shopping_contexts` | AI shopping contexts (party, gathering, breakfast, etc.) |
| `shopping_history` | Past commands and purchases |

---

## 🛡️ Environment & Security

> ⚠️ **Never commit real API keys.**

All secret credentials are protected via `.gitignore`:

- `backend/.env` — Supabase URL, Service Role Key, Gemini API Key
- `frontend/.env.local` — Public API URL

Only `.env.example` template files (with placeholder values) are committed to version control.

---

## 🧪 Testing

```bash
cd backend

# Activate virtual environment first
venv\Scripts\activate

# Run all tests
pytest tests/

# Run specific test file
pytest tests/test_products.py -v

# Run Hinglish voice pipeline tests
python tests/test_hinglish_add_item.py

# Run end-to-end voice pipeline test
python tests/e2e_voice_test.py
```

---

## 🛠️ Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.10+ | Runtime |
| Flask | 3.1+ | REST API framework |
| Flask-CORS | 6.0+ | Cross-Origin Resource Sharing |
| Google GenAI | 2.19+ | Gemini AI intent parsing |
| Supabase | 2.31+ | PostgreSQL database client |
| Pydantic | 2.10+ | Data validation and schemas |
| python-dotenv | 1.2+ | Environment variable loading |
| pytest | 8.0+ | Testing framework |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.3.2 | React framework (App Router + Turbopack) |
| React | 19.2.8 | UI library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Utility-first styling |
| Lucide React | 1.33 | Icon system |
| Web Speech API | Native | Browser voice recognition |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature`
3. Commit your changes — `git commit -m "feat: add your feature"`
4. Push to the branch — `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">
  <p>Built with ❤️ for India's grocery shoppers</p>
  <p>
    <a href="https://github.com/Lucifer2987/shopsense-ai">⭐ Star this repo</a> ·
    <a href="https://github.com/Lucifer2987/shopsense-ai/issues">🐛 Report a bug</a> ·
    <a href="https://github.com/Lucifer2987/shopsense-ai/issues">✨ Request a feature</a>
  </p>
</div>
