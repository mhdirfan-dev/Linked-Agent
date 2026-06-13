# LinkedAgent 🔗⚡

**AI-powered LinkedIn post intelligence — from raw notes to algorithm-optimized, publish-ready content in seconds.**

> Built for the **[Agents League Hackathon 2026](https://aka.ms/agentsleague)** — Microsoft Foundry IQ · Reasoning Agents Track
>
> Submission deadline: **June 14, 2026** · Winners announced: **June 30, 2026**
>
> 🔗 **Live demo:** https://linked-agent.vercel.app/
>
> 🎥 **Demo video:** _add your video link here_

---

## 🎯 What It Does

LinkedAgent transforms rough technical notes into two fully optimized LinkedIn post variants using a **10-step AI reasoning chain** powered by GROQ (LLaMA 3.3 70B) and grounded by a **Foundry IQ–style rules layer**.

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
├── Foundry IQ–style Knowledge Layer
│   ├── rules.js                    — LinkedIn algorithm rulebook (knowledge base)
│   ├── analytics.js                — Dynamic rule engine (live adjustment via localStorage)
│   └── updateRulesFromAnalytics()  — Self-updating constraint system
│
├── GROQ Reasoning Agent
│   ├── agent.js                — 10-step multi-step reasoning prompt + JSON parser
│   ├── buildFoundryIQPrompt()  — System prompt grounded in retrieved rules
│   └── buildAgentPrompt()      — User prompt with structured reasoning steps
│
├── Visual Intelligence
│   ├── processImageFile()  — Image ingestion + alt-text generation context
│   └── carousel.js         — PDF carousel generator (jsPDF, multi-slide)
│
└── UI Layer
    ├── index.html   — Single-page app with all panels
    ├── about.html   — Project overview / architecture page
    └── styles.css   — Dark glassmorphism UI, animated orbs, Inter font
```

### Microsoft IQ–style Integration

This project implements a **Foundry IQ–style grounded knowledge layer**:

- `rules.js` acts as the **knowledge base** — a structured rulebook of LinkedIn algorithm constraints sourced from platform research.
- `buildFoundryIQPrompt()` implements **grounded retrieval** — the agent's system prompt is constructed from these rules, with explicit citations in the output.
- `updateRulesFromAnalytics()` implements **dynamic rule updating** — the knowledge layer is not static; it re-calibrates constraints based on post performance history.
- Every agent response includes `iq_citation` — a sourced reference to the rule version used, following the cited, hallucination-reducing pattern that Foundry IQ promotes.

> **Note:** The current implementation is a local, rules-based system that follows the Foundry IQ grounded-retrieval pattern. A direct integration with the hosted Foundry IQ service is planned as future work (see [Limitations](#-limitations--future-work)).

---

## ✨ Features

### 🧠 Reasoning Agent (GROQ + LLaMA 3.3 70B)

10-step structured reasoning: extract → hook → format → hashtags → mentions → CTA → first comment → checklist → carousel detection → scoring. Full reasoning log shown to the user.

### 📅 Post Schedule Intelligence

Per-audience heatmap data (developers, recruiters, founders, students, data scientists) gives the top 3 next posting windows with actual calendar dates in the user's local timezone.

### 🔥 Trending Topic Radar

Real-time keyword scanning against 8 LinkedIn trending categories with momentum scores, matched keywords highlighted, and category-specific posting tips. Updates live as the user types, with a 500ms debounce.

### 🎠 Auto-Carousel PDF Export

Detects markdown tables and lists (4+ items) in the draft. Exports a multi-page, styled PDF that LinkedIn renders as a swipeable carousel — typically 3× more impressions than plain posts.

### 📊 Dynamic Algorithm Tracking (Foundry IQ–style Live Layer)

Every copied post is stored locally (`localStorage`). The analytics dashboard shows avg score, best angle, and optimal hashtag count. The hashtag rule is automatically recalibrated for the next agent run based on what has historically performed best.

### 🖼 Visual / Image Processing

Drag-and-drop image upload, up to 8 images. The agent generates descriptive alt-text and ensures the post hook references the attached visual.

### ✅ Pre-Publish Checklist

7-point checklist per variant: hook length, metric/claim presence, paragraph structure, hashtag count + placement, @mention, CTA question, word count range.

### 📬 First Comment Generation

The agent writes a ready-to-paste first comment (50–80 words) to post immediately after publishing — boosting early engagement velocity, which the LinkedIn algorithm weighs heavily.

---

## 🚀 Quick Start

### 1. Get a GROQ API key (free)

Sign up at [console.groq.com](https://console.groq.com) and create an API key.

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

Then open `http://localhost:8080`.

---

## 📦 GitHub Push Guide

### First-time setup

```bash
git init
git add .
git commit -m "feat: LinkedAgent v1 — Agents League Hackathon 2026"
git branch -M main
git remote add origin https://github.com/mhdirfan-dev/Linked-Agent.git
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
git status   # double-check — config.js should NOT be listed
git commit -m "your message"
git push
```

### ⚠️ API Key Safety Rules

- `config.js` → gitignored → **never committed** ✅
- `config.example.js` → placeholder only → **safe to commit** ✅
- `agent.js` → contains placeholder `"PASTE_YOUR_GROQ_KEY_HERE"` → **safe to commit** ✅
- Never paste a real key into any file that is **not** in `.gitignore`

---

## 🌐 Deployment

LinkedAgent is currently deployed on **Vercel**: https://linked-agent.vercel.app/

It is a **pure static site** (HTML + CSS + JS modules) with one serverless function (`api/env.js`) that injects the GROQ API key from environment variables at request time. No build step is required beyond Vercel's default static deployment.

To redeploy your own copy:

```bash
npm i -g vercel
vercel --prod
```

Set `GROQ_API_KEY` as an environment variable in your Vercel project settings (Project → Settings → Environment Variables).

---

## 🏆 Hackathon Submission Notes

**Event:** Agents League Hackathon 2026
**Track:** 🧠 Reasoning Agents (Microsoft Foundry)
**Dates:** June 4–14, 2026

### How LinkedAgent Addresses the Judging Criteria

**Accuracy & Relevance** — Directly solves LinkedIn content optimization using a structured, research-based rulebook (`rules.js`) covering hooks, structure, hashtags, mentions, and CTAs.

**Reasoning & Multi-step Thinking** — A single GROQ call executes an explicit 10-step reasoning chain (extract → hook → format → hashtags → mentions → CTA → first comment → checklist → carousel detection → scoring), and the full reasoning log is shown to the user — nothing is hidden.

**Creativity & Originality** — Live trending-topic radar, a self-updating analytics rule engine, automatic PDF carousel generation from markdown tables/lists, and automatic first-comment generation for engagement velocity.

**User Experience** — Dark glassmorphism UI, animated background, step-by-step loading indicators, side-by-side A/B variant comparison, and a clear pre-publish checklist.

**Reliability & Safety** — All user-rendered content is HTML-escaped (`escHtml()`); a custom `sanitizeJsonString()` repairs malformed JSON from the LLM before parsing; the app degrades gracefully with visible error states; the GROQ key is kept out of the committed source via `config.js`/environment variables.

### Demo Video Checklist

1. Show the live trending radar updating as you type
2. Run the agent on a real draft — show the full reasoning log
3. Show the pre-publish checklist
4. Show the schedule planner with real calendar dates
5. Export a PDF carousel from a markdown table
6. Show the analytics dashboard update after copying a post

---

## 📁 File Structure

```
linked-agent/
├── index.html          # Full UI — all panels, animations, logic
├── about.html          # Project overview / architecture page
├── agent.js            # GROQ reasoning agent, image processing, re-exports
├── rules.js            # Foundry IQ–style knowledge base + dynamic rule updater
├── analytics.js        # Post performance tracking + history
├── carousel.js         # PDF carousel generator (jsPDF)
├── styles.css          # Dark glassmorphism UI
├── config.js           # ⚠️ GITIGNORED — your real GROQ key goes here
├── config.example.js   # Safe placeholder — commit this
├── api/
│   └── env.js           # Vercel serverless function — injects GROQ key at runtime
├── .gitignore           # Covers config.js, .env, node_modules, etc.
└── README.md            # This file
```

---

## 🛡 Security

- API key is not committed to source control (`config.js` is gitignored; production uses Vercel environment variables via `api/env.js`)
- All user content is HTML-escaped before rendering (`escHtml()`)
- No backend database, no user accounts, no third-party trackers
- `sanitizeJsonString()` prevents malformed JSON from crashing the agent

---

## ⚠️ Limitations / Future Work

- The knowledge layer (`rules.js`) is currently a local, hardcoded rulebook rather than a live call to the hosted Microsoft Foundry IQ service. It follows the same grounded-retrieval-with-citations pattern, and direct Foundry IQ integration is a planned next step.
- The GROQ API key is injected into the browser at runtime via a serverless endpoint; a future version would proxy the GROQ call entirely server-side so the key never reaches the client.
- Analytics are stored per-browser in `localStorage`; there is no cross-device or server-side history yet.

---

*LinkedAgent — Built with GROQ, a Foundry IQ–style grounded reasoning layer, and a deep understanding of how the LinkedIn algorithm actually works.*