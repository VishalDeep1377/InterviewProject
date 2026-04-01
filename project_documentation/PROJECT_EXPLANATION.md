# 📄 Project Portfolio: PO Insight System - Intelligence Suite

## 📜 Executable Summary
The **PO Insight System** is a next-generation business automation platform designed to revolutionize the fashion sourcing industry. It automates the extraction of line-level data from unstructured PDF purchase orders, transforming them into high-fidelity, real-time analytics. Built with a **"Deep Glass" professional aesthetic**, it features a neural-link **AI Assistant** and a secure **JWT identity gateway** for global supply chain intelligence.

---

## 🏗️ Technical Architecture & Stack

### **1. Frontend: Cinematic Performance**
- **Framework**: [Next.js](https://nextjs.org/) (App Router) for high-performance server-side rendering and routing.
- **Visuals**: [Framer Motion](https://www.framer.com/motion/) for cinematic staggered animations and fluid transitions.
- **Styling**: Vanilla CSS + [TailwindCSS](https://tailwindcss.com/) for a modern, glassmorphic UI.
- **Charts**: [Recharts](https://recharts.org/) for interactive financial visualizations (Area, Pie, and Bar charts).
- **Icons**: [Lucide React](https://lucide.dev/) for a pixel-perfect professional icon set.

### **2. Backend: Scalable Intelligence**
- **Engine**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) REST API.
- **ORM**: [Prisma](https://www.prisma.io/) as a type-safe database interface.
- **Database**: [SQLite](https://sqlite.org/) for agile development (supports PostgreSQL for production).
- **Security**: [Bcrypt.js](https://www.npmjs.com/package/bcryptjs) for password hashing and [JSON Web Token (JWT)](https://jwt.io/) for stateless session security.
- **PDF Extraction**: [PDF-Parse](https://www.npmjs.com/package/pdf-parse) combined with a custom **Regex Engine** for brand-specific OCR data mapping.

---

## 🛠️ Operational Workflow: How it Runs

1. **Identity Phase**: The user registers or logs in via the secure auth portal. The backend issues a signed JWT stored safely in the frontend's `localStorage` for session persistence.
2. **Extraction Phase**: When a PDF is uploaded, the backend regex engine identifies brand-specific patterns (like *Boohoo* or *Coast*). It maps raw text to a unified Prisma Schema (Supply, Brand, Category, Order).
3. **Analytics Phase**: The dashboard uses **Real-Time Polling** (every 30s) to fetch the latest aggregates. Our **AI Intelligence Engine** automatically detects logistics anomalies (e.g., delays > 30 days).
4. **Integration Phase**: Users can "Sync" purchase orders via a simulated API endpoint, pushing data directly to a buyer's ERP system.

---

## 💡 Potential Interview Questions & Answers

### **Q1: Why did you use Regex instead of an LLM for PDF extraction?**
> *"Regex offers **deterministic accuracy** and high performance for standardized industrial documents. Unlike LLMs, Regex ensures that a price like '£1,000.00' is never hallucinated, which is critical for financial ledger accuracy. We added an AI Assistant layer on top for natural language queries, merging best-in-class reliability with modern intelligence."*

### **Q2: How do you handle concurrency if multiple files are uploaded at once?**
> *"We implement `prisma.$transaction`. This ensures that each PO and its hundreds of line-items are either fully saved or rolled back on error, maintaining strict database integrity even during high-volume batch processing."*

### **Q3: What makes this 'Advanced++' compared to a basic dashboard?**
> *"It's the synergy of **Professional Visual Identity** (Deep Glass aesthetics with cinematic motion) and **Autonomous Intelligence** (the Floating AI Assistant). It doesn't just show data; it analyzes risks automatically and allows users to 'talk' to their supply chain via the AI Command Center."*

---

## 🏁 Technical Deliverables Checklist
- [x] **Secure Auth**: Full registration/login suite.
- [x] **Extraction engine**: Brand-aware PDF parsing.
- [x] **Real-Time FX**: Live USD/GBP currency conversion.
- [x] **AI Insights**: Automated anomaly detection.
- [x] **Advanced Visuals**: Cinematic UI with Framer Motion.
