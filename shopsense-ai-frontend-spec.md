# ShopSense AI — Production-Quality Frontend

Build the complete frontend for the existing **ShopSense AI** project.

The backend is already implemented, tested, and working.

Your job is ONLY to build the frontend and integrate it with the existing backend.

---

## 1. Absolute Rule — Backend Is Read-Only

**THE BACKEND IS COMPLETE, TESTED, AND MUST NOT BE MODIFIED.**

You are working ONLY on the frontend.

DO NOT modify ANY file inside:

```
/backend
```

DO NOT:

- modify Flask code
- modify backend routes
- modify backend services
- modify backend schemas
- modify backend business logic
- modify Gemini integration
- modify Supabase integration
- modify Supabase configuration
- modify database schema
- modify database data
- modify backend environment variables
- modify backend dependencies
- rename backend endpoints
- remove backend endpoints
- change backend request formats
- change backend response formats
- refactor backend code
- "improve" backend code
- reseed the database

Treat the backend as a **BLACK BOX API**.

You MAY inspect backend files ONLY to understand:

- available endpoints
- request formats
- response formats
- error formats
- available functionality
- data structures

You MUST NOT edit them.

If an API integration issue occurs:

1. Inspect the existing backend contract.
2. Fix the frontend request.
3. Fix frontend TypeScript types if needed.
4. Fix frontend response parsing if needed.
5. Fix frontend state management if needed.

DO NOT modify the backend.

If something genuinely cannot be implemented without a backend change:

**STOP and report the exact issue instead of modifying the backend.**

Before finishing, inspect the final diff and VERIFY:

**NO files inside `/backend` were modified.**

---

## 2. Product Vision

ShopSense AI is an intelligent grocery shopping experience.

The core idea is:

> A modern e-commerce shopping website with an intelligent voice-first shopping assistant built into it.

**IMPORTANT:**

**E-COMMERCE FIRST. AI SECOND.**

The application must NOT look like an AI chatbot with an e-commerce page attached.

It should look like a real, polished grocery e-commerce platform where AI is the intelligence layer.

Think:

- Premium grocery e-commerce
- \+ Voice shopping assistant
- \+ Personalized recommendations
- \+ Context-aware shopping

The user should immediately understand:

- I can browse products
- I can search
- I can filter
- I can add products
- I can manage my shopping list
- I can see prices
- I can manage my basket
- I can use voice to shop faster
- The system learns useful shopping context

---

## 3. Technology

Use the existing Next.js project.

Technology:

- Next.js
- TypeScript
- App Router
- Tailwind CSS
- ESLint
- React
- Lucide icons
- shadcn/ui where useful
- Framer Motion only when genuinely useful

Do not introduce unnecessary frameworks.

Do not introduce Redux unless genuinely necessary.

Prefer:

- React state
- Context where appropriate
- custom hooks

---

## 4. Inspect Before Coding

Before writing code:

1. Inspect the entire frontend structure.
2. Inspect `package.json`.
3. Inspect the existing Next.js configuration.
4. Inspect the backend ONLY to understand API contracts.
5. Identify all relevant API endpoints.
6. Identify actual request/response formats.
7. Plan the frontend architecture.
8. Then begin implementation.

DO NOT blindly generate imaginary APIs.

Use the actual backend implementation as the source of truth.

---

## 5. Backend Architecture

The existing architecture is:

```
Next.js Frontend
        ↓
Flask Backend
        ↓
Supabase
```

The frontend communicates ONLY with the Flask backend.

DO NOT access Supabase directly from the browser.

DO NOT expose:

- `SUPABASE_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

to the frontend.

Use:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

for local development.

---

## 6. E-Commerce First — Most Important Design Rule

The application MUST visually feel like a real modern grocery e-commerce website.

The hierarchy is:

1. E-commerce shopping
2. Product discovery
3. Search and filters
4. Shopping list / basket
5. Recommendations
6. AI voice assistant

The AI should feel naturally embedded inside the shopping experience.

**NOT:** AI chatbot + some product cards

**Instead:** E-commerce platform + intelligent AI interaction layer

If all AI elements were temporarily hidden, the application should STILL look like a complete, polished grocery e-commerce website.

---

## 7. E-Commerce Visual Language

Use familiar e-commerce patterns:

- prominent search
- categories
- product cards
- product images
- product name
- brand
- unit
- price
- availability
- filters
- sorting
- add buttons
- quantity controls
- shopping list
- basket
- recommendations
- recently relevant products where backend supports them

Do NOT invent:

- fake discounts
- fake reviews
- fake ratings
- fake stock
- fake prices
- fake recommendations

Only show information provided by the backend.

---

## 8. Design Personality

The UI should feel:

- premium
- clean
- calm
- modern
- trustworthy
- slightly futuristic
- practical
- human-designed

The user should feel like they are using a real product, not looking at a coding demo.

Quality references:

- Apple
- Linear
- Arc
- Notion
- premium e-commerce platforms

Do NOT copy their UI. Use them only as references for restraint and polish.

---

## 9. Avoid the Generic AI Look

DO NOT use:

- excessive purple gradients
- neon blue/purple glow
- giant glowing circles
- floating AI particles
- animated gradient backgrounds
- excessive glass cards
- every component being rounded
- giant hero text
- excessive shadows
- "✨ AI Powered" everywhere
- random emojis
- excessive badges
- excessive animation
- generic AI dashboard layouts
- giant chatbot interfaces

The UI must feel intentionally designed.

---

## 10. Subtle Glassmorphism

Use glassmorphism selectively. Do NOT make the entire website glass.

Glass effects may be used for:

- voice assistant panel
- floating navigation
- small floating controls
- recommendation highlights
- dialogs/modals

Use:

- subtle backdrop blur
- low-opacity surfaces
- thin borders
- restrained shadows

Product grids and content-heavy areas should mostly use solid/adaptive surfaces.

The goal: **Premium + subtle + modern.** NOT: Glassmorphism showcase.

---

## 11. Light + Dark Mode

Implement proper Light and Dark modes.

Modes: ☀ Light / 🌙 Dark

Requirements:

- persistent preference
- respect system preference initially
- smooth subtle transition
- semantic CSS variables
- accessible contrast

**Light mode:**

- warm white/off-white background
- white product surfaces
- charcoal text
- muted gray text
- restrained accent

**Dark mode:**

- near-black/charcoal background
- slightly lighter surfaces
- soft white text
- muted gray secondary text
- restrained accent

Use ONE primary accent. Do not use rainbow gradients.

---

## 12. Header

The header should strongly communicate e-commerce.

**Desktop:**

```
ShopSense
[ Search products... ]
Theme  Account  Basket
```

**Mobile:**

```
ShopSense
Search
Basket
Theme
```

Search should be prominent.

The basket should always be easy to access.

The voice interaction should also be easy to reach.

---

## 13. Homepage

The homepage should feel like a premium grocery store.

Suggested structure:

```
Header
  ↓
Categories
  ↓
Voice shopping assistant
  ↓
Recommended products
  ↓
Your shopping list
  ↓
Smart suggestions
  ↓
Basket summary
```

The exact layout can differ, but e-commerce hierarchy must remain dominant.

Example:

```
--------------------------------------------------
ShopSense

Search products...                 🛒
--------------------------------------------------
Categories

Dairy    Bakery    Fruits    Snacks    Beverages
--------------------------------------------------
What are you shopping for?

          🎙
     Talk to ShopSense
--------------------------------------------------
Recommended for you

[ Milk ] [ Bread ] [ Eggs ] [ Apples ]
--------------------------------------------------
Your Shopping List

Milk                         ×2
Bread                        ×1
Eggs                        ×12
--------------------------------------------------
Smart Suggestions
--------------------------------------------------
```

---

## 14. Product Discovery

Product discovery should be one of the main experiences.

Users should be able to:

- browse products
- search
- filter
- sort
- inspect products
- add products
- change quantity

The experience should resemble a real grocery e-commerce website.

---

## 15. Product Cards

Product cards are extremely important. They should feel like real e-commerce product cards.

Include when available:

- product image
- product name
- brand
- unit
- price
- availability
- add button
- quantity controls

Example:

```
┌──────────────────────────────┐
│                              │
│        PRODUCT IMAGE         │
│                              │
├──────────────────────────────┤
│ Amul Milk                    │
│ 1 litre                      │
│                              │
│ ₹62                          │
│                              │
│              [ + Add ]       │
└──────────────────────────────┘
```

Do NOT turn every product card into an AI card.

---

## 16. Search Experience

Search must feel like normal e-commerce search.

Examples: `milk`, `organic apples`, `bread`, `chips`

The user should get product results.

Search and voice are two ways to interact with the same shopping system. Voice is an intelligent shortcut.

---

## 17. Category Experience

Create a visually clean category browsing experience.

Examples: Dairy, Bakery, Fruits, Vegetables, Snacks, Beverages, Breakfast

Only show categories supported by available product data.

Categories should feel like genuine e-commerce navigation, not dashboard filters.

---

## 18. Voice — Hero Differentiator

Voice is the most important AI interaction.

However: **VOICE MUST ENHANCE THE E-COMMERCE EXPERIENCE.** It must NOT replace normal browsing.

Users should be able to:

- search manually
- browse products
- add products manually
- use filters
- use voice when convenient

The microphone should be visually important but not dominate the entire application.

---

## 19. Voice States

Implement: `IDLE`, `LISTENING`, `PROCESSING`, `SUCCESS`, `ERROR`

**IDLE:**
```
🎙
Tap to speak
```

**LISTENING:**
```
Listening...
"bhai 2 litre doodh..."
```
Use a subtle microphone animation. Do NOT create a giant neon glow.

**PROCESSING:**
```
Understanding...
```
Use subtle animation.

**SUCCESS:**
```
✓ Added 2 litres of Milk
```

**ERROR:**
```
I couldn't understand that.
Try: "Add 2 litres of milk"
```

---

## 20. Live Transcript

Show live speech recognition transcript.

Example:

```
Listening...
"bhai 2 litre doodh add kar de"
```

After processing:

```
You said:
"bhai 2 litre doodh add kar de"

ShopSense:
"Done. Added 2 litres of Milk."
```

Keep the UI compact and natural. Do NOT build a giant chat interface.

---

## 21. Language Auto-Detection

Do NOT create a mandatory language dropdown. Users simply speak.

At minimum the current experience supports:

- English
- Hindi
- Hinglish

Use the existing backend/STT capabilities.

Display detected language subtly: `Hindi detected` or `English detected`

Do not make language selection part of the main shopping workflow.

---

## 22. Shopping List

Create a proper e-commerce-style shopping list.

Each item should display:

- product image where available
- product name
- brand
- unit
- quantity
- price
- subtotal

Example:

```
┌─────────────────────────────────────┐
│ ○ Milk                              │
│   Amul · 1 litre                    │
│   −   2   +                   ₹124 │
└─────────────────────────────────────┘
```

Support: increase quantity, decrease quantity, mark complete, remove, edit.

---

## 23. Basket

The basket should feel like a real e-commerce basket.

Display: items, quantities, individual prices, subtotals, total, budget status where available.

Example:

```
Your Basket

Milk ×2                  ₹124
Bread ×1                 ₹45
Eggs ×12                 ₹78
----------------------------
Total                    ₹247
```

Make the basket easy to access from the header.

---

## 24. Smart Recommendations

Create a section: **Smart for you**

Recommendations should be visually integrated into the shopping experience.

Example:

```
🥛 Milk
You usually buy this every 6 days.
[Add]
```

or:

```
🍞 Bread
You may be running low.
[Add]
```

Only display reasons provided by the backend. Do not fabricate recommendation logic.

---

## 25. Recommendation Explanations

When clicked:

```
Why this?

✓ You usually buy this every 6 days
✓ Last purchase was 7 days ago
✓ Currently in stock
✓ Fits your usual budget
```

Only display real backend-supported information.

---

## 26. Context-Aware Shopping

Create a subtle context section.

Example:

```
Current shopping plan

Friends coming tomorrow

5 people
Budget ₹1500
```

This should feel useful rather than intrusive. Allow the user to inspect and clear context.

---

## 27. Basket Optimizer

Create an intelligent basket optimization experience.

Example:

```
Your Basket
₹1,724

Budget
₹1,500

You're ₹224 over budget.

ShopSense found:
Save ₹58 by switching cereal.
Save ₹50 by switching cola.

Potential total:
₹1,493

[Review changes]
```

**IMPORTANT:** Never automatically replace products. The user must explicitly approve optimization changes.

---

## 28. Confirmation UX

Use confirmations for meaningful actions.

**Remove product:**
```
Remove Milk?
[Cancel] [Remove]
```

**Basket optimization:**
```
Apply these substitutions?
[Review] [Apply]
```

Avoid confirmation dialogs for trivial actions.

---

## 29. Loading States

Every API operation should have a clear state.

Examples: `Searching products...`, `Adding to list...`, `Finding recommendations...`, `Optimizing basket...`

Use skeleton loaders where useful.

---

## 30. Error States

Never show raw technical errors to normal users.

**Bad:** `500 INTERNAL SERVER ERROR`

**Good:**
```
Something went wrong while loading your list.
[Try again]
```

**Network failure:**
```
Can't reach ShopSense right now.
Check your connection and try again.
```

---

## 31. Empty States

**Empty shopping list:**
```
Your list is empty.
Tell ShopSense what you need.
🎙 Start speaking
```

**No products:**
```
No products found.
Try another search or remove a filter.
```

**No recommendations:**
```
Keep shopping and I'll learn your preferences.
```

---

## 32. API Architecture

Create a clean API layer.

Suggested:

```
src/
  lib/
    api/
      client.ts
      products.ts
      shopping.ts
      voice.ts
      recommendations.ts
      context.ts
      basket.ts
```

Do not scatter `fetch()` calls throughout UI components.

Use:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Use the actual backend API contracts.

---

## 33. TypeScript

Create types matching actual backend responses.

Suggested:

```
src/
  types/
    product.ts
    shopping.ts
    voice.ts
    recommendation.ts
    context.ts
    basket.ts
```

Avoid `any` wherever possible.

---

## 34. Custom Hooks

Use reusable hooks where useful:

```
useVoiceCommand()
useShoppingList()
useProducts()
useRecommendations()
useContext()
useBasket()
useTheme()
```

Keep API/business logic out of visual components.

---

## 35. Component Architecture

Suggested:

```
components/
├── layout/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── MobileNav.tsx
│
├── ecommerce/
│   ├── CategoryNav.tsx
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   ├── ProductSearch.tsx
│   └── ProductFilters.tsx
│
├── voice/
│   ├── VoiceAssistant.tsx
│   ├── VoiceButton.tsx
│   ├── Transcript.tsx
│   └── VoiceStatus.tsx
│
├── shopping/
│   ├── ShoppingList.tsx
│   ├── ShoppingItem.tsx
│   ├── BasketSummary.tsx
│   └── BasketOptimizer.tsx
│
├── recommendations/
│   ├── RecommendationCard.tsx
│   └── RecommendationReason.tsx
│
└── ui/
```

Adapt this if the existing project has a better structure.

Do not over-componentize trivial markup.

---

## 36. Responsive Design

Test: `375px`, `390px`, `430px`, `768px`, `1024px`, `1440px`

Mobile should feel intentionally designed.

Desktop should provide a richer e-commerce browsing experience.

The voice button must remain easy to access on mobile.

---

## 37. Mobile Navigation

Mobile navigation should prioritize: Home, Shop, Voice, List, Basket

The microphone should have strong visual priority.

Keep navigation minimal.

---

## 38. Desktop Navigation

Desktop may use: Home, Shop, Categories, My List, Recommendations

Header: Search, Theme, Account, Basket

Keep the navigation clean.

---

## 39. Animation

Use subtle animation only.

**Good:**

- microphone pulse
- add-to-list interaction
- quantity update
- product hover
- modal entrance
- recommendation expansion
- theme transition

**Avoid:**

- floating particles
- animated backgrounds
- excessive parallax
- constant motion
- giant glowing animations

Animation should communicate state.

---

## 40. Accessibility

Support:

- keyboard navigation
- visible focus
- semantic HTML
- aria labels
- accessible icon buttons
- sufficient contrast
- readable font sizes

Microphone must have an accessible label.

---

## 41. No Hardcoded Data

Do NOT create fake frontend product arrays.

Do NOT hardcode: products, prices, stock, recommendations, history, user data

All dynamic information must come from the backend.

---

## 42. Merchant Mode — Not Now

DO NOT implement:

- store owner dashboard
- merchant dashboard
- store registration
- store inventory management
- multi-store marketplace

These will be implemented later.

However, keep the architecture modular enough that we can later add Shopper Mode / Store Mode without rewriting the entire application.

---

## 43. Security

Never expose server-side credentials.

DO NOT put these in frontend code:

- `SUPABASE_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

The frontend should only know: `NEXT_PUBLIC_API_URL`

---

## 44. Code Style

Write human-readable production-quality code.

Avoid:

- giant components
- duplicate logic
- unnecessary abstractions
- unnecessary libraries
- excessive comments
- generated-looking comments

Use very few comments. Do NOT write obvious comments such as `// This button opens the microphone`.

Only comment unusual or non-obvious implementation decisions.

The code should look like it was written and maintained by a real engineering team.

---

## 45. Real E-Commerce Feel

The final UI should have the visual hierarchy of an actual grocery shopping website.

When a user opens the application, the first impression should be:

> "This is a grocery e-commerce platform."

NOT:

> "This is an AI demo."

The AI should reveal itself through the experience.

**Normal e-commerce:** Search → Milk → Add

**AI-enhanced:**
```
🎙 "bhai 2 litre doodh add kar de"
→ Milk found
→ quantity 2
→ added to list
→ recommendation appears
```

AI makes the shopping experience faster and smarter.

---

## 46. Demo Experience

The first 30 seconds should be impressive.

Ideal evaluator flow:

```
Open app
 ↓
See premium grocery e-commerce UI
 ↓
See categories and products
 ↓
Tap microphone
 ↓
"bhai 2 litre doodh add kar de"
 ↓
Live transcript
 ↓
Processing
 ↓
Success
 ↓
Milk appears in shopping list
 ↓
Recommendation appears
 ↓
Basket updates
```

This must feel smooth and intentional.

---

## 47. Testing

Actually run the application. Verify:

- Next.js starts
- TypeScript compiles
- ESLint works
- homepage loads
- products load from backend
- search works
- filters work
- categories work
- product add works
- shopping list updates
- quantity controls work
- voice button works
- speech recognition works where browser supports it
- transcript appears
- backend voice command works
- recommendations load
- context loads
- basket loads
- basket optimizer loads
- confirmation flows work
- light mode works
- dark mode works
- theme persists
- mobile layout works
- desktop layout works
- API errors are handled
- empty states work
- loading states work

Test these actual voice/text commands:

- "Add milk"
- "bhai 2 litre doodh add kar de"
- "find organic apples under 200"
- "mera budget 1000 hai"
- "kal 5 friends aa rahe hain"

Do NOT fake responses.

---

## 48. Final Backend Safety Check

Before finishing, inspect the final change set. Run:

```
git diff
```

or an equivalent change inspection.

VERIFY:

- NO files inside `/backend` were modified
- NO backend API was changed
- NO backend route was changed
- NO Supabase configuration was changed
- NO database schema was changed
- NO Gemini backend configuration was changed

If any backend file was accidentally modified: **REVERT IT before finishing.**

---

## 49. Final Report

After implementation, provide a concise report:

1. Frontend files created/modified
2. Pages implemented
3. Components implemented
4. API integrations
5. Voice functionality
6. Language detection behavior
7. Light/dark mode
8. Responsive behavior
9. Tests performed
10. Commands to run
11. Any genuine remaining issue

---

## Final Principle

Build ShopSense AI as:

**A PREMIUM GROCERY E-COMMERCE WEBSITE WITH AN INTELLIGENT VOICE SHOPPING ASSISTANT.**

**E-COMMERCE FIRST. AI SECOND.**

Make it look human-designed.

Make it feel like a real product.

Make the shopping experience the hero.

Make AI the invisible intelligence that makes the experience better.

**AND DO NOT MODIFY THE BACKEND.**
