# LinkedAgent 🔗⚡

**AI-powered LinkedIn post intelligence — from raw notes to algorithm-optimized, publish-ready content in seconds.**

> Built for the **[Agents League Hackathon 2026](https://aka.ms/agentsleague)** — Microsoft Foundry IQ · Reasoning Agents Track  
> Submission deadline: **June 14, 2026** · Winners announced: June 30, 2026

---

## 🎯 What It Does

LinkedAgent transforms rough technical notes into two fully optimized LinkedIn post variants using a **10-step AI reasoning chain** powered by GROQ (LLaMA 3.3 70B) and grounded by **Microsoft Foundry IQ** rules.

Every run produces:
- ✍️ **2 post variants** — Educational deep-dive vs Career/Growth story
- 📊 **Full metadata** — word count, char count, reading time
- #️⃣ **Hashtag set** — algorithmically selected, dynamically adjusted
- @ **Mention suggestions** — LinkedIn company page handles for tools detected in your draft
- 👁 **Hook preview** — exactly what shows before LinkedIn's "See more" cutoff
- 📬 **First comment** — ready to paste immediately after publishing for engagement velocity
- ✅ **Pre-publish checklist** — pass/warn/fail for every LinkedIn algorithm rule
- 📅 **Best posting time** — top 3 slots per audience with actual calendar dates
- 🔥 **Trending topic radar** — live keyword detection against 8 trending categories
- 🎠 **PDF carousel export** — auto-converts markdown lists/tables into swipeable slides
- 📈 **Dynamic analytics** — tracks your post history and auto-adjusts the hashtag count rule

---

## 🏗 Architecture

```
LinkedAgent
├── Microsoft Foundry IQ Layer
│   ├── rules.js          — LinkedIn algorithm rulebook (knowledge base)
│   ├── analytics.js      — Dynamic rule engine (live adjustment via localStorage)
│   └── updateRulesFromAnalytics() — Self-updating constraint system
│
├── GROQ Reasoning Agent
│   ├── agent.js          — 10-step multi-step reasoning prompt + JSON parser
│   ├── buildFoundryIQPrompt() — System prompt grounded in retrieved rules
│   └── buildAgentPrompt()    — User prompt with structured reasoning steps
│
├── Visual Intelligence
│   ├── processImageFile() — Image ingestion + alt-text generation context
│   └── carousel.js       — PDF carousel generator (jsPDF, multi-slide)
│
└── UI Layer
    ├── index.html        — Single-page app with all panels
    └── styles.css        — Dark glassmorphism UI, animated orbs, Inter font
```

### Microsoft IQ Integration

This project integrates **Foundry IQ** — the agentic knowledge retrieval layer:

- `rules.js` acts as the **Foundry IQ knowledge base** — a structured rulebook of LinkedIn algorithm constraints sourced from platform research
- `buildFoundryIQPrompt()` implements **grounded retrieval** — the agent's system prompt is constructed from retrieved rules with explicit citations
- `updateRulesFromAnalytics()` implements **dynamic rule updating** — the Foundry IQ layer is not static; it re-calibrates constraints based on post performance history
- Every agent response includes `iq_citation` — a sourced reference to the rule version used, exactly as Foundry IQ's cited, hallucination-reducing design intends

---

## ✨ Features

### 🧠 Reasoning Agent (GROQ + LLaMA 3.3 70B)
10-step structured reasoning: extract → hook → format → hashtags → mentions → CTA → first comment → checklist → carousel detection → scoring. Full reasoning log shown to user.

### 📅 Post Schedule Intelligence
Per-audience heatmap data (developers, recruiters, founders, students, data scientists) gives the top 3 next posting windows with actual calendar dates in the user's local timezone.

### 🔥 Trending Topic Radar
Real-time keyword scanning against 8 LinkedIn trending categories with momentum scores, matched keywords highlighted, and category-specific posting tips. Updates live as the user types with a 500ms debounce.

### 🎠 Auto-Carousel PDF Export
Detects markdown tables and lists (4+ items) in the draft. Exports a multi-page, styled PDF that LinkedIn renders as a swipeable carousel — typically 3× more impressions than plain posts.

### 📊 Dynamic Algorithm Tracking (Foundry IQ Live)
Every copied post is stored locally (localStorage). The analytics dashboard shows avg score, best angle, optimal hashtag count. The hashtag rule is automatically recalibrated for the next agent run based on what has historically performed best.

### 🖼 Visual / Image Processing
Drag-and-drop image upload. The agent generates descriptive alt-text and ensures the post hook references the attached visual.

### ✅ Pre-Publish Checklist
7-point checklist per variant: hook length, metric/claim presence, paragraph structure, hashtag count + placement, @mention, CTA question, word count range.

### 📬 First Comment Generation
The agent writes a ready-to-paste first comment (50-80 words) to post immediately after publishing — boosting early engagement velocity which the LinkedIn algorithm weighs heavily.

---

## 🚀 Quick Start

### 1. Get a GROQ API key (free)
Sign up at [console.groq.com](https://console.groq.com), create an API key.

### 2. Add your key to `config.js`
```js
window.__ENV__ = {
  GROQ_API_KEY: "gsk_your_real_key_here"
};
```
> `config.js` is in `.gitignore` — it will never be committed.

### 3. Run with a local server
ES modules require a server (not `file://`).

```bash
# Python
python -m http.server 8080

# Node
npx serve .

# VS Code: Right-click index.html → Open with Live Server
```

Open `http://localhost:8080`

---

## 📦 GitHub Push Guide

### First-time setup
```bash
git init
git add .
git commit -m "feat: LinkedAgent v1 — Agents League Hackathon 2026"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/linked-agent.git
git push -u origin main
```

### Before every push — safety checklist
```bash
# 1. Verify config.js is gitignored (should NOT appear in staged files)
git status

# 2. If config.js accidentally shows up, unstage it
git reset HEAD config.js

# 3. Confirm .gitignore has config.js listed
type .gitignore
```

### Ongoing updates
```bash
git add .
git status          # double-check — config.js should NOT be listed
git commit -m "your message"
git push
```

### ⚠️ API Key Safety Rules
- `config.js` → gitignored → **never committed** ✅
- `config.example.js` → placeholder only → **safe to commit** ✅  
- `agent.js` → contains placeholder `"PASTE_YOUR_GROQ_KEY_HERE"` → **safe to commit** ✅
- Never paste a real key into any file that is NOT in `.gitignore`

---

## 🌐 Deployment Guide

LinkedAgent is a **pure static site** (HTML + CSS + JS modules). No build step, no server needed.

### Option A — GitHub Pages (recommended, free)

1. Push to GitHub (see above)
2. Go to your repo → **Settings** → **Pages**
3. Source: **Deploy from a branch** → `main` → `/ (root)`
4. Click **Save**
5. Your site goes live at: `https://YOUR_USERNAME.github.io/linked-agent/`

> **Note:** GitHub Pages serves the `config.example.js` (safe placeholder). Visitors must add their own GROQ key. For a shared demo, see Option B.

### Option B — Netlify (instant, custom domain)

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir .
```

Or drag-and-drop the project folder to [app.netlify.com/drop](https://app.netlify.com/drop).

To set the API key as an environment variable on Netlify:
1. Site settings → **Environment variables** → Add `GROQ_API_KEY`
2. Add a `_headers` file or use a Netlify Edge Function to inject it into `window.__ENV__`

### Option C — Vercel

```bash
npm i -g vercel
vercel --prod
```

### Option D — Azure Static Web Apps (aligned with Microsoft hackathon)

1. Push to GitHub
2. Go to [portal.azure.com](https://portal.azure.com) → Create → **Static Web App**
3. Connect your GitHub repo, branch `main`, app location `/`
4. Deploy — Azure auto-builds from GitHub Actions

---

## 🏆 Hackathon Submission Notes

**Event:** Agents League Hackathon 2026  
**Track:** 🧠 Reasoning Agents (Microsoft Foundry)  
**Microsoft IQ Used:** Foundry IQ (agentic grounded knowledge retrieval)  
**Dates:** June 4–14, 2026  

### Judging Rubric Alignment

| Criterion | How LinkedAgent addresses it |
|---|---|
| **Accuracy & Relevance (20%)** | Directly solves LinkedIn content optimization with Foundry IQ grounded rules |
| **Reasoning & Multi-step Thinking (20%)** | Explicit 10-step reasoning chain, full reasoning log shown to user |
| **Creativity & Originality (15%)** | Live trending radar, self-updating analytics rules, PDF carousel, first comment generation |
| **User Experience (15%)** | Glassmorphism UI, animated background, loading steps, pre-publish checklist |
| **Reliability & Safety (20%)** | API key gitignored, JSON sanitizer, HTML escaping, graceful error states |
| **Community Vote (10%)** | Share at [aka.ms/agentsleague/discord](https://aka.ms/agentsleague/discord) |

### Demo Video Tips
1. Show the live trending radar updating as you type
2. Run the agent on a real draft — show the full reasoning log
3. Show the pre-publish checklist (all green)
4. Show the schedule planner with real dates
5. Export a PDF carousel
6. Show the analytics dashboard after copying a post

---

## 📁 File Structure

```
linked-agent/
├── index.html          # Full UI — all panels, animations, logic
├── agent.js            # GROQ reasoning agent, image processing, re-exports
├── rules.js            # Foundry IQ knowledge base + dynamic rule updater
├── analytics.js        # Post performance tracking + history
├── carousel.js         # PDF carousel generator (jsPDF)
├── styles.css          # LinkedIn-blue dark glassmorphism UI
├── config.js           # ⚠️ GITIGNORED — your real GROQ key goes here
├── config.example.js   # Safe placeholder — commit this
├── .gitignore          # Covers config.js, .env, node_modules, etc.
└── README.md           # This file
```

---

## 🛡 Security

- API key stored only in `config.js` (gitignored)
- All user content HTML-escaped before rendering (`escHtml()`)
- No data leaves the browser except the GROQ API call
- No backend, no database, no user accounts
- `sanitizeJsonString()` prevents malformed JSON from crashing the agent

---

*LinkedAgent — Built with GROQ, Microsoft Foundry IQ, and a deep understanding of how the LinkedIn algorithm actually works.*
#   L i n k e d - A g e n t  
 