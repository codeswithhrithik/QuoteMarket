# QuoteCraft 💼 - Professional Quotation Maker & Manager (MERN)

A production-grade, full-stack **MERN (MongoDB, Express, React, Node.js)** web application built for business owners, contractors, freelancers, and sales teams to easily draft, customize, calculate, track, and share quotations.

---

## ✨ Key Features

1. **Owner Onboarding & Profile**:
   - Single unified Sign In & First-Time Owner Sign Up.
   - Company branding: Logo upload, business name, address, GSTIN/Tax ID, phone, email, currency symbol (`₹`, `$`, `€`, `£`), and currency words engine.
   - Bank details configuration for instant customer remittance.
   - Default terms & conditions and payment notes.

2. **Customer / Party Management**:
   - Save parties with Organization Name, Receiver Name (Attn), Billing Address, Phone, Email, and Tax ID.
   - Auto-population in Quotation Editor with inline "+ Add New Party" modal.

3. **Material & Item Catalog**:
   - Save reusable materials, products, and services with default rates, units (`pcs`, `kg`, `sq ft`, `hrs`, `meter`, `set`), and tax percentages.
   - Quick-add items from the catalog directly into quotations.

4. **Quotation Customization & Real-time Live Preview**:
   - **4 Professional Templates**:
     - 🏛️ **Classic Corporate**: Navy blue & gold accents, formal double borders, traditional tabular layout.
     - ✨ **Modern Minimalist**: Crisp typography, spacious padding, rounded cards, sleek accents.
     - 💼 **Executive Slate**: Charcoal dark banner, high-contrast company vs client summary, zebra-striped rows.
     - 🏭 **Industrial / Contractor**: High-contrast indigo headers, strong borders, bold itemization.
   - Real-time side-by-side live preview that updates instantly as you type!
   - Automatic Quotation Numbering (`QT-2026-0001`) and Auto-populated Date & Expiration date.
   - Editable Subject Line and Salutation / Inquiring Appreciation Note (*"Thank you for inquiring with us..."*).
   - Line items with Quantity, Unit, Rate, Discount %, Tax %, and Line Total.
   - **Live Amount in Words** calculated automatically in Indian (Lakh/Crore) or Western (Million/Billion) numbering.
   - Notes, Terms & Conditions, and Remarks areas.
   - Closing Thank You Note (*"Thank you for inquiring with us! We look forward to your business."*).
   - **Interactive Digital Signature Pad**: Draw on canvas with touch/mouse, type stylized signature, or upload image.

5. **Lifecycle & Status Workflow**:
   - Statuses: `Draft`, `Pending`, `In Process`, `Approved`, `Rejected`.
   - Update quotation status anytime with status transition audit trail.

6. **Sharing & Exporting**:
   - 📄 **High-Resolution PDF**: Multi-page aware client-side PDF download matching the exact chosen template.
   - 💬 **WhatsApp Sharing**: One-click direct link with structured quote summary, grand total, and online preview link.
   - ✉️ **Email Sharing**: Pre-composed email with subject line and quotation details.
   - 🌐 **Public Client View (`/view-quote/:token`)**:
     - Clients can view the quotation online without logging in.
     - Interactive **"Approve Quotation"** (with celebration confetti 🎉) or **"Decline / Request Revision"** with client remarks.

7. **Zero-Setup Resilient Database Layer**:
   - Works immediately out of the box with zero external database configuration needed (uses persistent local store in `server/data/`).
   - Seamlessly connects to MongoDB or MongoDB Atlas whenever `MONGO_URI` is provided in `server/.env`.

---

## 📂 Project Architecture

```
AG/
├── client/                     # React 19 + Vite 8 + Tailwind CSS v4 Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Navbar, Badge
│   │   │   ├── party/          # PartyModal, PartyPicker
│   │   │   ├── catalog/        # CatalogModal
│   │   │   └── quote/          # ItemList, SignaturePad, ShareModal
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── pages/              # Dashboard, QuotesList, QuoteEditor, Parties, Catalog, Settings, Auth, PublicQuote
│   │   ├── services/           # Axios API client with token interceptors
│   │   ├── templates/          # 4 Template Renderers (Classic, Modern, Slate, Indigo)
│   │   ├── utils/              # numberToWords, pdfGenerator, shareUtils
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   └── package.json
├── server/                     # Node.js + Express + Mongoose Backend
│   ├── config/
│   │   └── db.js               # Dual-mode DB adapter (MongoDB + LocalStore fallback)
│   ├── controllers/            # authController, partyController, catalogController, quoteController
│   ├── middleware/             # authMiddleware (JWT Verification)
│   ├── models/                 # User, Party, CatalogItem, Quotation
│   ├── routes/                 # authRoutes, partyRoutes, catalogRoutes, quoteRoutes
│   ├── utils/                  # numberToWords, generateQuoteNum
│   ├── .env.example            # Environment sample
│   ├── server.js               # Server entry point + static client serving
│   └── package.json
├── package.json                # Root automation scripts
└── README.md
```

---

## 🚀 Quick Start & How to Run

### 1. Prerequisites
- **Node.js** (v18 or newer recommended, v24 LTS installed)
- **npm** (v9 or newer)

### 2. Start the Application

You can start the application with a single command from the project root:

```bash
# Run the application (Starts the Express server which serves both API and built frontend)
npm start
```

Open your browser and navigate to:
👉 **`http://localhost:5000`**

### 3. Development Mode (Optional)

If you want live hot-reloading (HMR) for both client and server:

```bash
# Terminal 1: Backend Server (Port 5000)
npm run dev:server

# Terminal 2: Frontend Vite Dev Server (Port 5173)
npm run dev:client
```

Navigate to **`http://localhost:5173`**.

---

## ⚙️ Environment Configuration

Edit `server/.env`:

```env
# Server Port
PORT=5000

# MongoDB URI (Leave default or connect to MongoDB Atlas)
# mongodb+srv://<username>:<password>@cluster.mongodb.net/quotecraft
MONGO_URI=mongodb://127.0.0.1:27017/quotecraft

# JWT Token Secret
JWT_SECRET=quotecraft_secure_jwt_token_secret_key_2026

# Frontend Origin URL
CLIENT_URL=http://localhost:5173
```

---

## 🌐 Deployment Guide (Hosting)

### Deploying to Render / Railway / Heroku
1. Push this repository to GitHub.
2. In your hosting dashboard, set:
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**: Add `JWT_SECRET` and `MONGO_URI`.
3. Done! The Express server serves the compiled React client and handles all `/api` routes seamlessly.

### Deploying Frontend to Vercel
- If you prefer hosting the client on Vercel and backend on Render:
  - Root Directory: `client`
  - Set `VITE_API_BASE_URL` pointing to your deployed backend URL.

---

## 📄 License
MIT License. Built with clean code, modular folder structure, and extensive comments for production use.
