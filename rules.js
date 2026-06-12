// rules.js — LinkedIn Algorithm Rulebook (Foundry IQ Knowledge Source)
// Supports dynamic rule adjustment based on stored analytics data.

export const LINKEDIN_RULES = {
  hook: {
    rule: "Lines 1-2 must contain a metric, bold claim, or dramatic problem statement",
    patterns: [
      "I built X in Y days",
      "X% improvement after doing Y",
      "Most developers don't know this about X",
      "We hit X users. Here's what broke first.",
      "I was rejected 12 times. Then I shipped this."
    ],
    reason: "LinkedIn truncates after ~210 chars. Hook must compel the 'see more' click."
  },
  structure: {
    rule: "No paragraph > 2 sentences. Use line breaks aggressively for mobile.",
    maxSentencesPerParagraph: 2,
    reason: "Mobile dwell time increases 40% with whitespace. Algorithm rewards dwell time."
  },
  hashtags: {
    rule: "Use 3-5 hashtags. Place at end. Only use tags with >100k followers.",
    optimal: 4,
    min: 3,
    max: 5,
    highPerformanceTags: {
      ai: ["#AI", "#ArtificialIntelligence", "#MachineLearning", "#GenerativeAI"],
      webdev: ["#WebDevelopment", "#JavaScript", "#ReactJS", "#NodeJS", "#FullStack"],
      python: ["#Python", "#DataScience", "#MLOps", "#Automation"],
      career: ["#SoftwareEngineering", "#TechCareer", "#Hiring", "#OpenToWork"],
      microsoft: ["#MicrosoftAzure", "#CopilotAI", "#PowerPlatform", "#Azure"],
      general: ["#BuildInPublic", "#TechTwitter", "#100DaysOfCode", "#OpenSource"]
    },
    reason: "More than 5 tags triggers spam filter. Fewer than 3 limits distribution."
  },
  mentions: {
    rule: "Mention 1-2 orgs/tools used. Triggers their network notification.",
    reason: "Tagged entities re-share or comment, expanding reach 3-5x organically.",
    // Known LinkedIn pages for common tools — agent picks from these
    knownPages: {
      "vercel": "@Vercel",
      "github": "@GitHub",
      "microsoft": "@Microsoft",
      "openai": "@OpenAI",
      "google": "@Google",
      "aws": "@AmazonWebServices",
      "docker": "@Docker",
      "mongodb": "@MongoDB",
      "supabase": "@Supabase",
      "netlify": "@Netlify",
      "react": "@Meta",
      "nextjs": "@Vercel",
      "tailwind": "@TailwindCSS",
      "postgresql": "@PostgreSQL",
      "redis": "@Redis",
      "typescript": "@Microsoft",
      "groq": "@Groq",
      "huggingface": "@HuggingFace",
      "langchain": "@LangChain"
    }
  },
  cta: {
    rule: "End with a direct question to drive comments. Comments boost rank more than likes.",
    patterns: [
      "What would you have done differently?",
      "Have you faced this problem too?",
      "Drop a 🔥 if you found this useful.",
      "What's your take on this approach?"
    ],
    reason: "Comments signal 'meaningful conversation' to LinkedIn's feed algorithm."
  }
};

export const SCORING_WEIGHTS = {
  hookStrength: 30,
  structureScore: 20,
  hashtagOptimal: 15,
  hasMention: 10,
  hasCTA: 15,
  lengthOptimal: 10
};

// ─── POSTING TIME INTELLIGENCE ────────────────────────────────────────────────
// Based on LinkedIn algorithm research: feed ranking is highest when early
// engagement velocity is strong. These slots are when your target audience
// is most active and the feed is less saturated.
//
// Score 0-10: 10 = peak reach window, 0 = avoid
export const POSTING_TIME_DATA = {
  // [dayIndex 0=Sun..6=Sat][hourIndex 0-23] = score
  byAudience: {
    developers: {
      // Devs are active Tue-Thu mornings and lunch, Wed evening
      heatmap: {
        0: [0,0,0,0,0,0,0,1,2,2,2,2,2,2,1,1,1,1,1,1,0,0,0,0], // Sun
        1: [0,0,0,0,0,0,1,3,5,6,5,5,6,5,4,4,3,3,4,3,2,1,0,0], // Mon
        2: [0,0,0,0,0,0,1,4,7,9,8,7,8,7,6,5,4,4,5,4,3,2,1,0], // Tue ⭐
        3: [0,0,0,0,0,0,1,4,8,10,8,7,9,7,6,5,4,5,6,4,3,2,1,0],// Wed ⭐⭐
        4: [0,0,0,0,0,0,1,4,7,9,7,7,8,6,5,4,4,4,5,3,2,1,0,0], // Thu ⭐
        5: [0,0,0,0,0,0,1,3,5,6,5,4,5,4,3,3,2,2,2,1,1,0,0,0], // Fri
        6: [0,0,0,0,0,0,0,1,2,3,3,3,3,2,2,2,1,1,1,1,0,0,0,0]  // Sat
      },
      topSlots: [
        { day: 3, hour: 9,  label: "Wed 9:00 AM",  score: 10, reason: "Peak dev feed activity. Low competition." },
        { day: 2, hour: 9,  label: "Tue 9:00 AM",  score: 9,  reason: "High engagement Tuesday mornings." },
        { day: 4, hour: 9,  label: "Thu 9:00 AM",  score: 9,  reason: "Thu morning before weekend drop-off." },
        { day: 3, hour: 12, label: "Wed 12:00 PM", score: 8,  reason: "Lunch scroll window is highly active." },
        { day: 2, hour: 12, label: "Tue 12:00 PM", score: 7,  reason: "Mid-week lunch engagement." }
      ]
    },
    recruiters: {
      heatmap: {
        0: [0,0,0,0,0,0,0,1,1,2,2,2,1,1,1,1,1,0,0,0,0,0,0,0],
        1: [0,0,0,0,0,0,1,4,7,9,8,7,6,5,5,5,4,3,2,2,1,0,0,0], // Mon ⭐
        2: [0,0,0,0,0,0,1,4,7,9,8,7,7,6,5,5,4,3,3,2,1,0,0,0], // Tue ⭐
        3: [0,0,0,0,0,0,1,3,6,8,7,7,7,6,5,4,4,3,2,2,1,0,0,0], // Wed
        4: [0,0,0,0,0,0,1,3,6,8,7,6,6,5,5,4,3,3,2,2,1,0,0,0], // Thu
        5: [0,0,0,0,0,0,1,3,5,6,5,5,5,4,3,3,2,2,1,1,0,0,0,0], // Fri
        6: [0,0,0,0,0,0,0,1,2,2,2,2,2,1,1,1,1,0,0,0,0,0,0,0]
      },
      topSlots: [
        { day: 1, hour: 9,  label: "Mon 9:00 AM", score: 10, reason: "Recruiters start week reviewing candidates." },
        { day: 2, hour: 9,  label: "Tue 9:00 AM", score: 9,  reason: "High recruiter activity Tuesday mornings." },
        { day: 1, hour: 10, label: "Mon 10:00 AM",score: 8,  reason: "Post-standup browsing window." },
        { day: 3, hour: 9,  label: "Wed 9:00 AM", score: 7,  reason: "Mid-week talent sourcing." },
        { day: 2, hour: 10, label: "Tue 10:00 AM",score: 7,  reason: "Active search window." }
      ]
    },
    founders: {
      heatmap: {
        0: [0,0,0,0,0,0,0,1,2,3,3,3,2,2,2,2,2,1,1,1,0,0,0,0],
        1: [0,0,0,0,0,0,1,3,5,7,6,6,6,5,5,4,4,4,5,4,2,1,0,0],
        2: [0,0,0,0,0,0,1,3,5,7,7,6,6,6,5,5,4,4,5,4,3,1,0,0],
        3: [0,0,0,0,0,0,1,3,6,8,7,7,8,7,6,5,5,5,6,5,3,2,1,0], // Wed ⭐
        4: [0,0,0,0,0,0,1,3,5,7,6,6,7,6,5,5,4,4,5,4,2,1,0,0],
        5: [0,0,0,0,0,0,1,3,5,6,5,5,5,4,4,3,3,3,3,2,1,0,0,0],
        6: [0,0,0,0,0,0,0,2,3,4,4,4,3,3,2,2,2,2,1,1,0,0,0,0]
      },
      topSlots: [
        { day: 3, hour: 9,  label: "Wed 9:00 AM",  score: 10, reason: "Founders network most mid-week mornings." },
        { day: 3, hour: 12, label: "Wed 12:00 PM", score: 9,  reason: "Founders browse during working lunch." },
        { day: 2, hour: 9,  label: "Tue 9:00 AM",  score: 7,  reason: "Early week strategic content." },
        { day: 4, hour: 9,  label: "Thu 9:00 AM",  score: 7,  reason: "End-of-week network building." },
        { day: 0, hour: 10, label: "Sun 10:00 AM", score: 6,  reason: "Founders plan on Sundays, engage content." }
      ]
    },
    students: {
      heatmap: {
        0: [0,0,0,0,0,0,0,1,2,4,5,5,5,5,4,4,4,3,3,3,2,1,0,0],
        1: [0,0,0,0,0,0,1,2,4,5,5,5,5,5,4,4,4,4,4,4,3,2,1,0],
        2: [0,0,0,0,0,0,1,2,4,6,6,6,6,6,5,5,5,5,5,4,3,2,1,0],
        3: [0,0,0,0,0,0,1,2,4,6,6,7,7,6,5,5,5,5,6,5,3,2,1,0], // Wed ⭐
        4: [0,0,0,0,0,0,1,2,4,6,6,6,6,6,5,5,5,5,5,4,3,2,1,0],
        5: [0,0,0,0,0,0,1,2,3,5,5,5,5,5,4,4,3,3,4,4,4,3,1,0],
        6: [0,0,0,0,0,0,0,1,2,4,5,5,5,5,4,4,4,3,3,3,2,1,0,0]
      },
      topSlots: [
        { day: 3, hour: 12, label: "Wed 12:00 PM", score: 10, reason: "Students browse between classes at lunch." },
        { day: 3, hour: 18, label: "Wed 6:00 PM",  score: 8,  reason: "After-class engagement window." },
        { day: 2, hour: 18, label: "Tue 6:00 PM",  score: 7,  reason: "Evening study break scroll." },
        { day: 4, hour: 18, label: "Thu 6:00 PM",  score: 7,  reason: "Pre-weekend browsing." },
        { day: 0, hour: 11, label: "Sun 11:00 AM", score: 6,  reason: "Weekend morning motivation content." }
      ]
    },
    "data scientists": {
      heatmap: {
        0: [0,0,0,0,0,0,0,1,2,3,3,3,3,2,2,2,2,1,1,1,0,0,0,0],
        1: [0,0,0,0,0,0,1,3,5,7,7,6,6,6,5,4,4,4,4,3,2,1,0,0],
        2: [0,0,0,0,0,0,1,3,6,8,8,7,7,7,6,5,5,5,5,4,2,1,0,0], // Tue ⭐
        3: [0,0,0,0,0,0,1,3,6,9,9,8,8,7,6,5,5,5,5,4,3,2,1,0], // Wed ⭐⭐
        4: [0,0,0,0,0,0,1,3,6,8,7,7,7,6,5,5,4,4,4,3,2,1,0,0],
        5: [0,0,0,0,0,0,1,2,4,6,5,5,5,4,4,3,3,2,2,2,1,0,0,0],
        6: [0,0,0,0,0,0,0,1,2,3,3,3,3,2,2,2,1,1,1,0,0,0,0,0]
      },
      topSlots: [
        { day: 3, hour: 9,  label: "Wed 9:00 AM",  score: 10, reason: "Data/ML community peaks mid-week." },
        { day: 2, hour: 9,  label: "Tue 9:00 AM",  score: 9,  reason: "Research & paper sharing window." },
        { day: 3, hour: 10, label: "Wed 10:00 AM", score: 8,  reason: "Conference/paper discussion time." },
        { day: 4, hour: 9,  label: "Thu 9:00 AM",  score: 7,  reason: "Pre-weekend data content." },
        { day: 2, hour: 12, label: "Tue 12:00 PM", score: 6,  reason: "Lunch reading window." }
      ]
    }
  },

  // Trending topic categories on LinkedIn (updated knowledge base)
  trendingTopics: {
    ai_ml: {
      label: "AI & Machine Learning",
      momentum: "🔥 Exploding",
      score: 98,
      peakKeywords: ["LLM", "GPT", "agent", "RAG", "fine-tuning", "embedding", "vector", "prompt"],
      tip: "AI content gets 4× avg impressions right now. Lead with a specific model or technique name."
    },
    fullstack: {
      label: "Full-Stack Development",
      momentum: "📈 Rising",
      score: 82,
      peakKeywords: ["MERN", "Next.js", "React", "TypeScript", "API", "backend", "frontend", "deploy"],
      tip: "Show a before/after or a specific metric. 'I reduced load time by 60%' beats 'I optimized my app'."
    },
    devops_cloud: {
      label: "DevOps & Cloud",
      momentum: "📈 Rising",
      score: 79,
      peakKeywords: ["Docker", "Kubernetes", "CI/CD", "AWS", "Azure", "pipeline", "deploy", "serverless"],
      tip: "Architecture diagrams as carousels perform very well in this category."
    },
    career_growth: {
      label: "Career & Growth",
      momentum: "✅ Stable",
      score: 75,
      peakKeywords: ["hired", "rejected", "interview", "salary", "negotiation", "promotion", "burnout", "quit"],
      tip: "Vulnerability + outcome formula. 'I failed X times. Here's what changed.' outperforms pure advice."
    },
    open_source: {
      label: "Open Source",
      momentum: "✅ Stable",
      score: 71,
      peakKeywords: ["open source", "GitHub", "PR", "contributor", "repo", "stars", "fork"],
      tip: "Tag the project's official LinkedIn page if it exists. They often reshare."
    },
    data_science: {
      label: "Data Science",
      momentum: "📈 Rising",
      score: 80,
      peakKeywords: ["Python", "pandas", "model", "dataset", "EDA", "prediction", "accuracy", "SQL"],
      tip: "Visual outputs (charts, confusion matrices) as carousel slides get high saves."
    },
    security: {
      label: "Cybersecurity",
      momentum: "📈 Rising",
      score: 77,
      peakKeywords: ["security", "vulnerability", "hack", "breach", "CVE", "pentest", "auth", "zero-day"],
      tip: "Actionable security tips in numbered lists perform very well."
    },
    productivity: {
      label: "Developer Productivity",
      momentum: "✅ Stable",
      score: 68,
      peakKeywords: ["tool", "workflow", "automation", "script", "shortcut", "tips", "setup", "dotfiles"],
      tip: "Specific tool names in the hook increase saves. 'This one Cursor shortcut' > 'productivity tips'."
    }
  }
};

/**
 * updateRulesFromAnalytics
 */
export function updateRulesFromAnalytics(baseRules) {
  try {
    const raw = localStorage.getItem('vcagent_analytics');
    if (!raw) return baseRules;
    const records = JSON.parse(raw);
    if (!Array.isArray(records) || records.length < 3) return baseRules;

    const groups = {};
    records.forEach(r => {
      const c = r.hashtagCount;
      if (!groups[c]) groups[c] = [];
      groups[c].push(r.score);
    });

    let bestCount = baseRules.hashtags.optimal;
    let bestAvg = 0;
    Object.entries(groups).forEach(([count, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg > bestAvg) { bestAvg = avg; bestCount = parseInt(count); }
    });

    const clamped = Math.max(baseRules.hashtags.min, Math.min(baseRules.hashtags.max, bestCount));

    return {
      ...baseRules,
      hashtags: {
        ...baseRules.hashtags,
        optimal: clamped,
        reason: `${baseRules.hashtags.reason} [Analytics: ${clamped} hashtags averaging ${bestAvg.toFixed(0)}/100 this period]`
      }
    };
  } catch (_) {
    return baseRules;
  }
}

/**
 * detectTrendingTopics
 * Scans post text against the trending topic keyword list.
 * Returns matched topics sorted by relevance score.
 */
export function detectTrendingTopics(text) {
  const lower = text.toLowerCase();
  const matched = [];

  Object.entries(POSTING_TIME_DATA.trendingTopics).forEach(([key, topic]) => {
    const hits = topic.peakKeywords.filter(kw => lower.includes(kw.toLowerCase()));
    if (hits.length > 0) {
      matched.push({ ...topic, key, hits, relevance: hits.length });
    }
  });

  return matched.sort((a, b) => b.relevance - a.relevance);
}

/**
 * getBestPostingSlots
 * Returns the top 3 recommended posting slots for a given audience key.
 */
export function getBestPostingSlots(audienceKey) {
  const key = audienceKey.toLowerCase().replace(/[^a-z ]/g, '').trim();
  const data = POSTING_TIME_DATA.byAudience[key] || POSTING_TIME_DATA.byAudience['developers'];
  return data.topSlots.slice(0, 3);
}
