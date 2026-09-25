# 🛡️ Digital Footprint Exposer — Security Self-Audit Platform

An interactive security self-audit web application prototype designed to diagnose credential exposure across breach corpuses without compromising privacy during the evaluation process.

Built with **React (Vite)** on the frontend and **Node.js (Express)** on the backend.

---

## 🌟 Key Features

### 1. 🔐 Live Password Breach Check ($k$-Anonymity Model)
- **Zero-Knowledge Privacy:** Passwords never leave the browser in plaintext or full hash.
- **Client-Side SHA-1 Hashing:** Uses the browser's native **Web Crypto API** (`window.crypto.subtle`) to hash the password locally into 40 hexadecimal characters.
- **5-Character Prefix Partitioning:** Only the first 5 characters (e.g. `CBFDA`, out of $16^5 = 1,048,576$ buckets) are transmitted to the backend proxy.
- **Direct Have I Been Pwned (HIBP) Integration:** Calls the free, unauthenticated `https://api.pwnedpasswords.com/range/{prefix}` endpoint with `Add-Padding: true` for differential privacy side-channel protection.
- **Local Suffix Matching:** The browser evaluates the remaining 35 characters locally against the returned candidate list to count breaches.

### 2. 📧 Email & Username Exposure Check (Simulated Dataset)
- **Educational Incident Model:** Evaluates identities against 12 realistic mock security incidents (e.g., *SocialAppX*, *CloudShop*, *CryptoVault*, *HealthPulse*, *TechForge*).
- **Incident Categorization:** Classifies leaks by category (Social, FinTech, E-Commerce, Healthcare) and severity (*Critical, High, Medium, Low*).
- **Exfiltrated Data Pills:** Highlights specific leaked data fields, including hashed/plaintext passwords, payment card snippets, GPS coordinates, and OAuth tokens.
- **Transparent Labelling:** Explicitly badged as a **Simulated Demo Dataset** to adhere to ethical auditing practices.

### 3. 📊 Combined Digital Footprint Risk Score
- **0–100 Unified Score:** Combines password breach frequency, identity exposure breadth, and data criticality.
- **Tier Classification:** Dynamically categorized into **Low**, **Medium**, **High**, or **Critical Risk**.
- **Actionable Remediation Roadmap:** Formulates personalized next steps aligned with **NIST SP 800-63B** guidelines (FIDO2 WebAuthn Passkeys, Password Managers, and OAuth token revocation).

### 4. ⚡ 1-Click Persona Quick-Tests
- **High-Risk Persona:** Pre-loads `password123` & `john.doe@example.com` (Millions of breaches, Critical score).
- **Developer/Crypto Persona:** Pre-loads `admin2024!` & `developer@web.io` (Tech leak, High score).
- **Clean/Hardened Persona:** Pre-loads high-entropy credentials (0 breaches, Low score).

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Client Browser (Zero-Knowledge Zone)"]
        PW["Plaintext Password"] -->|Web Crypto API| SHA["Full SHA-1 (40 hex chars)"]
        SHA -->|Split| P5["Prefix (5 hex chars)"]
        SHA -->|Split| S35["Suffix (35 hex chars)<br/>Kept local in memory"]
    end

    subgraph Server["Backend API (Node.js/Express)"]
        P5 -->|GET /api/pwned-password/:prefix| Proxy["Express Router"]
    end

    subgraph Remote["Troy Hunt / HIBP Infrastructure"]
        Proxy -->|GET /range/:prefix| HIBP["HIBP Pwned Passwords API"]
        HIBP -->|16^5 Hash Bucket (~500 - 3000 suffixes)| Cache["Padded Response Payload"]
    end

    Cache --> Proxy
    Proxy -->|Payload List| Client
    Client --> Match{"Local Suffix Match"}
    Match -->|Found| Breach["Display Breach Count"]
    Match -->|Not Found| Clean["0 Breaches Detected"]
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm`

### 1. Backend Setup
```bash
cd backend
npm install
npm start
# Server starts on http://localhost:5001
```

### 2. Frontend Setup
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
# Vite dev server starts on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security & Privacy FAQ

### Q: Why is SHA-1 used when it is cryptographically deprecated?
SHA-1 is deprecated for collision resistance (digital signatures). For $k$-anonymity lookup indices against known breach wordlists, collision attacks cannot recover the user's plaintext password. Furthermore, $140$ bits of entropy remain strictly on the client.

### Q: What does someone intercepting the network see?
They only observe an HTTPS GET request for a 5-character prefix (e.g. `/api/pwned-password/5BAA6`). That single prefix matches hundreds of thousands of different passwords.

---

## 📄 License
MIT License. Created for educational and security self-audit demonstration purposes.
