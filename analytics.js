// analytics.js — Dynamic Algorithm Tracking (Foundry IQ Live Layer)
// Stores post performance metrics in localStorage.
// Feeds back into rules.js to auto-adjust hashtag strategy.

const STORAGE_KEY = 'vcagent_analytics';
const MAX_RECORDS = 100; // keep last 100 posts

/**
 * trackPostPerformance
 * Call this when a user copies/publishes a post variant.
 * @param {object} variant - The variant object from agent output (variant_a or variant_b)
 */
export function trackPostPerformance(variant) {
  try {
    const records = loadRecords();

    // Count hashtags in the post text
    const hashtagMatches = (variant.post || '').match(/#\w+/g) || [];
    const hashtagCount = hashtagMatches.length;

    const record = {
      id: Date.now(),
      date: new Date().toISOString(),
      score: variant.score || 0,
      angle: variant.angle || 'unknown',   // 'educational' or 'career'
      hashtagCount,
      label: variant.label || '',
      // Placeholder for future real metrics integration
      impressions: null,
      comments: null,
      clicks: null
    };

    records.unshift(record); // newest first
    const trimmed = records.slice(0, MAX_RECORDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    return record;
  } catch (e) {
    console.warn('Analytics tracking failed:', e);
    return null;
  }
}

/**
 * getAnalyticsSummary
 * Returns a summary object for display in the UI dashboard.
 */
export function getAnalyticsSummary() {
  const records = loadRecords();
  if (records.length === 0) {
    return { total: 0, avgScore: 0, bestAngle: 'N/A', bestHashtagCount: 4, history: [] };
  }

  const avgScore = records.reduce((a, r) => a + r.score, 0) / records.length;

  // Best angle by average score
  const byAngle = {};
  records.forEach(r => {
    if (!byAngle[r.angle]) byAngle[r.angle] = [];
    byAngle[r.angle].push(r.score);
  });
  let bestAngle = 'N/A', bestAngleScore = 0;
  Object.entries(byAngle).forEach(([angle, scores]) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg > bestAngleScore) { bestAngleScore = avg; bestAngle = angle; }
  });

  // Best hashtag count by average score
  const byCount = {};
  records.forEach(r => {
    const c = r.hashtagCount;
    if (!byCount[c]) byCount[c] = [];
    byCount[c].push(r.score);
  });
  let bestHashtagCount = 4, bestCountScore = 0;
  Object.entries(byCount).forEach(([count, scores]) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg > bestCountScore) { bestCountScore = avg; bestHashtagCount = parseInt(count); }
  });

  // Last 10 for sparkline
  const history = records.slice(0, 10).map(r => ({
    date: r.date.slice(0, 10),
    score: r.score,
    angle: r.angle,
    hashtagCount: r.hashtagCount
  }));

  return {
    total: records.length,
    avgScore: Math.round(avgScore),
    bestAngle,
    bestHashtagCount,
    history
  };
}

/**
 * clearAnalytics — wipes stored data (used by reset button in UI)
 */
export function clearAnalytics() {
  localStorage.removeItem(STORAGE_KEY);
}

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (_) {
    return [];
  }
}
