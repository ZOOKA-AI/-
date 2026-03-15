# 😂 Random Joke Generator

[![Live Demo](https://img.shields.io/badge/Live%20Demo-zooka--ai.github.io-brightgreen?style=for-the-badge)](https://zooka-ai.github.io/-/joke-generator/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![JokeAPI](https://img.shields.io/badge/JokeAPI-v2-orange?style=for-the-badge)](https://v2.jokeapi.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

> A production-ready, monetization-optimized Random Joke Generator — one file, zero dependencies, infinitely funny.

![Screenshot](screenshot.png)

---

## ✨ Features

### Core
- 🎲 Fetch random jokes from [JokeAPI v2](https://v2.jokeapi.dev/)
- 🗂️ 7 category chips: `Any` · `Programming` · `Pun` · `Misc` · `Dark` · `Spooky` · `Christmas`
- 🥁 Two-part jokes — setup visible first, delivery hidden behind **"Show Punchline 👇"**
- 🛡️ Safe Mode toggle (ON by default) — filters NSFW / racist / sexist / explicit content
- ⏳ Loading spinner while fetching
- ⚠️ Full error handling with friendly message + retry button
- 🚀 Auto-fetches one joke on page load
- 🔢 Joke counter — `"Joke #5 🎲"` above every joke
- 🔐 XSS prevention via `escapeHTML()` before every `innerHTML` injection

### 💰 Monetization
| Feature | Details |
|---------|---------|
| **Google AdSense slots** | `#ad-top`, `#ad-mid`, `#ad-bottom` — swap placeholders for real ad code |
| **Mid-page ad reveal** | `#ad-mid` fades in automatically after every 3rd joke |
| **Email subscription** | Validates input, shows success message — hook up Mailchimp / ConvertKit |
| **Affiliate banner** | Amazon Associates link below the joke card |
| **Social sharing** | Share on X (Twitter), Facebook, or copy to clipboard |

### 🎨 UI / UX
- 🌑 Dark **glassmorphism** design with deep blue gradient background
- 🌈 Gradient title text (yellow → orange → red)
- ☀️ Dark / Light mode toggle — preference saved to `localStorage`
- 📱 Fully responsive for mobile (`max-width: 480px`)
- ✨ Smooth CSS animations: `fadeSlide`, spinning loader, button hover lift

### 🔍 SEO
- Full `<meta>` tags (description, Open Graph, Twitter Card)
- `<link rel="canonical">` tag
- Schema.org JSON-LD (`WebApplication` type)

---

## 🚀 How to Run Locally

```bash
# No build step needed — just open the file!
open joke-generator/index.html
# or double-click it in your file manager
```

---

## 💰 Monetization Guide

### 1. Google AdSense
Replace the three `.ad-slot` `<div>` elements with your real AdSense `<ins>` tags:
```html
<!-- Before (placeholder) -->
<div id="ad-top" class="ad-slot">📢 Ad Space...</div>

<!-- After (real AdSense) -->
<ins class="adsbygoogle" id="ad-top"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="XXXXXXXXXX"
     data-ad-format="auto"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
```

### 2. Amazon Associates Affiliate Link
Find this line in `index.html` and replace the `href`:
```html
<a href="https://amzn.to/joke-books" ...>Browse Now 🛒</a>
```

### 3. Email Marketing (Mailchimp / ConvertKit)
Locate the comment `<!-- Connect to Mailchimp / ConvertKit API endpoint here -->` and add a `fetch()` call to your list's API endpoint inside the `submit` handler.

### 4. Google Analytics GA4
Add your GA4 `<script>` tag at the bottom of `<head>`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 5. Deploy
| Platform | Command |
|----------|---------|
| **GitHub Pages** | Push to `main` — enable Pages in repo settings |
| **Vercel** | `vercel --prod` in the `joke-generator/` folder |
| **Netlify** | Drag & drop `joke-generator/` on [app.netlify.com](https://app.netlify.com) |

---

## 🛠️ Tech Stack

| Technology | Usage |
|-----------|-------|
| HTML5 | Structure & semantic markup |
| CSS3 | Glassmorphism design, animations, responsive layout |
| Vanilla JavaScript (ES2017+) | Async/await fetch, DOM manipulation, Clipboard API, localStorage |
| [JokeAPI v2](https://v2.jokeapi.dev/) | Free external joke API |

---

## 📂 File Structure

```
joke-generator/
├── index.html      ← Complete single-file app (CSS + JS included)
└── README.md       ← This file
```

---

## 📋 Monetization Checklist

- [ ] Replace `#ad-top` / `#ad-mid` / `#ad-bottom` with real Google AdSense code
- [ ] Replace affiliate link with your real Amazon Associates link
- [ ] Connect email form to Mailchimp or ConvertKit API
- [ ] Add Google Analytics GA4 tag
- [ ] Deploy to Vercel / Netlify with a custom domain
- [ ] Submit `sitemap.xml` to Google Search Console

---

## 📄 License

MIT © [ZOOKA-AI](https://github.com/ZOOKA-AI)
