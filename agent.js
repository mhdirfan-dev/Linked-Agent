// agent.js — LinkedAgent · Multi-step Reasoning Agent using GROQ API
// Features: Auto-Carousel PDF, Visual/Image Alt-Text, A/B Testing,
//           Dynamic Analytics, Post Intelligence Briefing, Schedule Planner

import { LINKEDIN_RULES, updateRulesFromAnalytics } from './rules.js';

// ─── GROQ CONFIG ──────────────────────────────────────────────────────────────
// 🔒 SECURITY: Do NOT commit a real key. Use config.js (gitignored) locally.
const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = window.__ENV__?.GROQ_API_KEY || "PASTE_YOUR_GROQ_KEY_HERE";

// ─── MAIN AGENT ENTRY ─────────────────────────────────────────────────────────
export async function runViralCraftAgent(rawDraft, audienceType, imageContext = null) {
  // Pull live-adjusted rules from analytics layer
  const liveRules = updateRulesFromAnalytics(LINKEDIN_RULES);
  const groundedRules = buildFoundryIQPrompt(liveRules);
  const userPrompt = buildAgentPrompt(rawDraft, audienceType, imageContext, liveRules);

  const response = await fetch(GROQ_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2500,
      messages: [
        { role: "system", content: groundedRules },
        { role: "user", content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`GROQ API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || "";

  try {
    let clean = rawText.replace(/```[\w]*\n?/g, "").replace(/```/g, "").trim();
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}') + 1;
    if (start === -1 || end === 0) throw new Error("No JSON object found");
    clean = clean.slice(start, end);
    try {
      return JSON.parse(clean);
    } catch (_) {
      clean = sanitizeJsonString(clean);
      return JSON.parse(clean);
    }
  } catch (e) {
    return { error: "Failed to parse agent output", raw: rawText };
  }
}

// ─── IMAGE / VISUAL PROCESSING ───────────────────────────────────────────────
/**
 * processImageFile
 * Reads ONE image File object → base64 dataUrl + context hint for agent prompt.
 */
export async function processImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        dataUrl: reader.result,
        fileName: file.name,
        type: file.type,
        caption: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
        contextHint: `User attached image: "${file.name}". Treat this as a technical screenshot or architecture diagram. Generate alt-text describing what the image likely shows based on the post draft, and ensure the hook references the visual.`
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * processImageFiles
 * Reads MULTIPLE File objects → array of image context objects.
 */
export async function processImageFiles(files) {
  return Promise.all(Array.from(files).map(f => processImageFile(f)));
}

// ─── CAROUSEL EXPORT (delegates to carousel.js) ──────────────────────────────
export { generateCarouselPDF } from './carousel.js';

// ─── ANALYTICS TRACKING (delegates to analytics.js) ─────────────────────────
export { trackPostPerformance, getAnalyticsSummary, clearAnalytics } from './analytics.js';

// ─── RULES / INTELLIGENCE (delegates to rules.js) ────────────────────────────
export { detectTrendingTopics, getBestPostingSlots } from './rules.js';

// ─── PROMPT BUILDERS ─────────────────────────────────────────────────────────
function buildFoundryIQPrompt(rules) {
  const hashtagRule = rules.hashtags;
  return `You are the LinkedIn Viral-Craft Agent grounded by Foundry IQ rules.

HOOK RULE: ${rules.hook.rule}
WHY: ${rules.hook.reason}

STRUCTURE RULE: ${rules.structure.rule}
WHY: ${rules.structure.reason}

HASHTAG RULE: Use exactly ${hashtagRule.optimal} hashtags (dynamically adjusted from analytics).
WHY: ${hashtagRule.reason}

MENTION RULE: ${rules.mentions.rule}
WHY: ${rules.mentions.reason}

CTA RULE: ${rules.cta.rule}
WHY: ${rules.cta.reason}

OUTPUT FORMAT: Always respond ONLY with valid JSON. No markdown, no preamble, no code fences.`;
}

function buildAgentPrompt(rawDraft, audienceType, imageContext, rules) {
  const hashtagPool = Object.values(rules.hashtags.highPerformanceTags).flat();
  const optimal = rules.hashtags.optimal;
  const knownPages = rules.mentions.knownPages;

  const imageSection = imageContext
    ? `\nIMAGE CONTEXT: ${imageContext.contextHint}\nGenerate descriptive alt-text for this image in the "alt_text" field.`
    : '';

  return `Analyze and transform this raw technical draft into 2 optimized LinkedIn post VARIANTS plus full metadata.

VARIANT A — EDUCATIONAL ANGLE: Deep-dive into the technical implementation. Audience: fellow engineers who want to learn.
VARIANT B — CAREER/GROWTH ANGLE: Overcome-a-bottleneck story. Audience: recruiters, founders, career-watchers.
${imageSection}

CRITICAL RULES FOR JSON OUTPUT:
1. Plain text only in post strings. No markdown, no **bold**. Use CAPS for emphasis.
2. Each post MUST end with exactly ${optimal} hashtags, space-separated.
3. Never cut off a post. Always close with hashtags then a closing quote.
4. No unescaped double quotes or backslashes inside strings.

RAW DRAFT:
"""
${rawDraft}
"""

TARGET AUDIENCE: ${audienceType}
AVAILABLE HASHTAGS (pick ${optimal} most relevant): ${hashtagPool.join(', ')}
KNOWN LINKEDIN PAGES FOR MENTIONS: ${JSON.stringify(knownPages)}

Execute these reasoning steps:
STEP 1 — Extract: Technology, achievement, key metric, pain point.
STEP 2 — Hook Generation: Write 2 hooks (educational: "Here's exactly how I..." / career: "I almost quit. Then...").
STEP 3 — Body Formatting: Max 2-sentence paragraphs with line breaks.
STEP 4 — Hashtag Selection: Pick exactly ${optimal} tags from pool. Return them as a plain array too.
STEP 5 — Mention Detection: From the KNOWN LINKEDIN PAGES list, identify 1-2 tools/companies in the draft. Return their @handles.
STEP 6 — CTA Addition: Engagement question at end.
STEP 7 — First Comment: Write a short first comment (50-80 words) to post immediately after publishing. This boosts early engagement. Include 2-3 extra hashtags NOT used in the main post.
STEP 8 — Checklist: Evaluate the post against each rule. Return pass/warn/fail for each check.
STEP 9 — Carousel Detection: If the draft contains a markdown table, numbered list >4 items, or bullet list >4 items, set "carousel_source" to that extracted text. Otherwise null.
STEP 10 — Scoring: Score each post 0-100.

Respond ONLY with this JSON (no markdown, no code fences):
{
  "extracted": {
    "technology": "string",
    "achievement": "string",
    "metric": "string or null",
    "audience": "string",
    "pain_point": "string or null"
  },
  "alt_text": "string or null",
  "carousel_source": "string or null",
  "reasoning_log": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Step 4: ...", "Step 5: ...", "Step 6: ...", "Step 7: ...", "Step 8: ..."],
  "variant_a": {
    "label": "Educational Deep-Dive",
    "angle": "educational",
    "post": "full post text ending with hashtags",
    "score": 85,
    "score_breakdown": { "hook": 28, "structure": 18, "hashtags": 15, "mentions": 8, "cta": 12, "length": 10 },
    "rules_applied": ["HOOK RULE: educational hook", "HASHTAG RULE: ${optimal} tags selected"],
    "metadata": {
      "char_count": 820,
      "word_count": 145,
      "reading_time_sec": 35,
      "hashtags": ["#JavaScript", "#ReactJS", "#NodeJS", "#FullStack"],
      "mentions": ["@GitHub", "@Vercel"],
      "hook_preview": "first 210 characters of the post",
      "first_comment": "short follow-up comment text with 2-3 extra hashtags",
      "checklist": [
        { "rule": "Hook under 210 chars", "status": "pass", "detail": "Hook is 187 chars" },
        { "rule": "Has strong metric or claim", "status": "pass", "detail": "Opens with a specific number" },
        { "rule": "No paragraph over 2 sentences", "status": "pass", "detail": "All paragraphs are 1-2 sentences" },
        { "rule": "3-5 hashtags at end", "status": "pass", "detail": "4 hashtags placed at end" },
        { "rule": "Has @mention", "status": "pass", "detail": "Mentions @GitHub" },
        { "rule": "Ends with CTA question", "status": "pass", "detail": "Ends with engagement question" },
        { "rule": "Word count 150-300", "status": "warn", "detail": "145 words — slightly under ideal range" }
      ]
    }
  },
  "variant_b": {
    "label": "Career / Growth Story",
    "angle": "career",
    "post": "full post text ending with hashtags",
    "score": 79,
    "score_breakdown": { "hook": 22, "structure": 18, "hashtags": 15, "mentions": 8, "cta": 15, "length": 10 },
    "rules_applied": ["HOOK RULE: story-based", "HASHTAG RULE: ${optimal} tags selected"],
    "metadata": {
      "char_count": 910,
      "word_count": 162,
      "reading_time_sec": 39,
      "hashtags": ["#TechCareer", "#SoftwareEngineering", "#BuildInPublic", "#OpenToWork"],
      "mentions": ["@GitHub"],
      "hook_preview": "first 210 characters of the post",
      "first_comment": "short follow-up comment text with 2-3 extra hashtags",
      "checklist": [
        { "rule": "Hook under 210 chars", "status": "pass", "detail": "Hook is 198 chars" },
        { "rule": "Has strong metric or claim", "status": "warn", "detail": "Story hook — no hard metric" },
        { "rule": "No paragraph over 2 sentences", "status": "pass", "detail": "All paragraphs are 1-2 sentences" },
        { "rule": "3-5 hashtags at end", "status": "pass", "detail": "4 hashtags placed at end" },
        { "rule": "Has @mention", "status": "pass", "detail": "Mentions @GitHub" },
        { "rule": "Ends with CTA question", "status": "pass", "detail": "Ends with engagement question" },
        { "rule": "Word count 150-300", "status": "pass", "detail": "162 words — within ideal range" }
      ]
    }
  },
  "iq_citation": "Rules sourced from: Foundry IQ / LinkedIn-Algorithm-Rulebook-v2.md (hashtag count auto-adjusted by analytics)"
}`;
}

// ─── JSON SANITISER ───────────────────────────────────────────────────────────
function sanitizeJsonString(str) {
  let result = "";
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const code = str.charCodeAt(i);

    if (escapeNext) { result += ch; escapeNext = false; continue; }
    if (ch === "\\" && inString) { result += ch; escapeNext = true; continue; }
    if (ch === '"') { inString = !inString; result += ch; continue; }
    if (inString && code >= 0x00 && code <= 0x1F) {
      const escapes = { "\n": "\\n", "\r": "\\r", "\t": "\\t", "\b": "\\b", "\f": "\\f" };
      result += escapes[ch] || "";
      continue;
    }
    result += ch;
  }
  return result;
}
