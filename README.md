# PaisaWapas Deal Gateway & Outclick Flow 🛍️💸

A modern, high-energy, responsive deal gateway for PaisaWapas that activates cashback before redirecting users to partner stores (e.g., Flipkart, Myntra, Amazon, Swiggy).

## ✨ Features

- **Exact Deal Showcase**: Displays verified partner deals, pricing, and live cashback calculations with the golden trio: Deal Price, PaisaWapas Cashback, and You Pay Effectively.
- **Dual View Modes (Web & Mobile)**: Includes an interactive toggle between standard desktop web layout and a realistic smartphone chassis view (with dynamic island, status bar, and native mobile dimensions).
- **Progressive Disclosure (Collapsible Dropdowns)**:
  - 📖 **How it works? (3 Simple Steps)**: Explains the cashback tracking process and wallet linking on demand.
  - 🛡️ **Tracking & Transfer Guarantees**: Highlights 24–48h auto-tracking, direct bank transfer via UPI, and spam-free privacy.
- **Phone Linking & OTP Verification**: Clean numeric input, auto-formatting (+91), clear button, validation, and demo OTP (`1234`) support.
- **Automated Store Redirection**: Visual 3-second countdown with animated progress bar redirecting to the partner store.
- **Testing Controls Drawer**: Slide-out panel allowing instant switching between deals (iPhone 15, Nike Shoes, Sony Headphones, Swiggy Meal), dark mode preview, and step navigation.

## 🚀 Getting Started

Simply open `index.html` in your browser or run a local server:

```bash
# Using Python
python3 -m http.server 3000

# Using Node.js
npx serve .
```

Visit `http://localhost:3000` to interact with the page.

## 🛠️ Tech Stack

- **HTML5**: Semantic markup with accessible `<details>`/`<summary>` components.
- **Vanilla CSS3**: Modern design system, HSL color tokens, glassmorphism, responsive media queries, and smooth micro-animations.
- **Vanilla JavaScript**: State-driven deal catalog, phone formatting, OTP handling, and simulated API flow.
