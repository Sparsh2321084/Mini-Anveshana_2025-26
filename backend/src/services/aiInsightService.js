const CONFIG = {
  enabled: process.env.AI_INSIGHTS_ENABLED !== 'false',
  ollamaUrl: process.env.OLLAMA_URL || 'http://100.85.46.14:11434',
  model: process.env.OLLAMA_MODEL || 'qwen2.5-coder:0.5b',
  maxHistory: Number.parseInt(process.env.AI_MAX_HISTORY || '10', 10),
  maxTokens: Number.parseInt(process.env.AI_MAX_TOKENS || '220', 10),
  timeoutMs: Number.parseInt(process.env.AI_TIMEOUT_MS || '25000', 10)
};

function getHumidity(sensorData, quality) {
  if (typeof sensorData?.humidity === 'number') {
    return sensorData.humidity;
  }

  const humidityText = quality?.humidity || '0';
  return Number.parseFloat(String(humidityText).replace('%', '')) || 0;
}

function getRiskLevel(score) {
  if (score >= 85) return 'low';
  if (score >= 60) return 'medium';
  return 'high';
}

function buildDrivers(sensorData, quality, history) {
  const drivers = [];
  const humidity = getHumidity(sensorData, quality);

  if (humidity > 16) {
    drivers.push('Moisture has crossed the short-term safe storage band.');
  } else if (humidity > 14) {
    drivers.push('Moisture is above the ideal storage zone and needs monitoring.');
  } else {
    drivers.push('Moisture is currently within a safe storage band.');
  }

  if ((sensorData?.temperature || 0) > 30) {
    drivers.push('Higher temperature is increasing spoilage pressure.');
  }

  if (sensorData?.motion) {
    drivers.push('Motion activity suggests a security or handling event.');
  }

  if (history.length >= 6) {
    const recent = history.slice(-6);
    const averageHumidity = recent.reduce((sum, entry) => sum + (entry.humidity || 0), 0) / recent.length;

    if (humidity - averageHumidity > 1.5) {
      drivers.push('Humidity is trending upward compared with recent readings.');
    }
  }

  return drivers.slice(0, 3);
}

function buildActions(sensorData, quality) {
  const actions = [...(quality?.details?.recommendations || [])];

  if ((sensorData?.temperature || 0) > 30 && actions.length < 3) {
    actions.push('Check ventilation airflow around the grain stack.');
  }

  if (sensorData?.motion && actions.length < 4) {
    actions.push('Review the storage area for unauthorized movement or handling.');
  }

  if (actions.length === 0) {
    actions.push('Maintain current operating conditions and continue monitoring.');
  }

  return actions.slice(0, 4);
}

function buildFallbackInsight(sensorData, quality, history = []) {
  const score = quality?.score || 0;
  const riskLevel = getRiskLevel(score);
  const drivers = buildDrivers(sensorData, quality, history);
  const actions = buildActions(sensorData, quality);

  let headline = 'Storage conditions look steady';
  let summary = 'Current readings remain within a safe operating range, so the grain can stay under routine monitoring without immediate intervention.';

  if (riskLevel === 'high') {
    headline = 'Storage conditions need immediate correction';
    summary = 'The latest readings point to a meaningful spoilage risk, with moisture or heat now high enough to threaten grain quality if operators do not respond quickly.';
  } else if (riskLevel === 'medium') {
    headline = 'Storage conditions are starting to drift';
    summary = 'The grain is still in a manageable state, but the trend is moving away from the ideal storage window and should be corrected before the risk deepens.';
  }

  return {
    headline,
    summary,
    riskLevel,
    topDrivers: drivers,
    actions,
    source: 'fallback',
    updatedAt: new Date().toISOString()
  };
}

function buildHistoryDigest(history = []) {
  return history.slice(-CONFIG.maxHistory).map((entry) => ({
    temperature: entry.temperature,
    humidity: entry.humidity,
    motion: Boolean(entry.motion),
    timestamp: entry.timestamp
  }));
}

function buildPrompt(sensorData, quality, history) {
  const payload = {
    current: {
      temperature: sensorData?.temperature ?? null,
      humidity: sensorData?.humidity ?? null,
      motion: Boolean(sensorData?.motion),
      timestamp: sensorData?.timestamp || new Date().toISOString()
    },
    quality: {
      score: quality?.score ?? null,
      grade: quality?.grade ?? null,
      status: quality?.status ?? null,
      shelfLife: quality?.shelfLife ?? null,
      issues: quality?.details?.issues || [],
      recommendations: quality?.details?.recommendations || []
    },
    recentHistory: buildHistoryDigest(history)
  };

  return [
    'You are an agricultural grain-storage analyst.',
    'Return ONLY valid JSON with keys: headline, summary, riskLevel, topDrivers, actions.',
    'riskLevel must be one of: low, medium, high.',
    'Write like an experienced operations analyst speaking to warehouse staff.',
    'headline should sound natural, specific, and executive-ready, not robotic or generic.',
    'summary should be 1 to 2 sentences, clear and practical, explaining what changed and why it matters.',
    'topDrivers must contain 2 to 3 short bullet-style strings.',
    'actions must contain 2 to 4 practical operator actions.',
    'Avoid hype, filler, repeated sensor values, and phrases like "the data indicates" or "real-time monitoring suggests".',
    'Do not include markdown, explanations, or extra keys.',
    JSON.stringify(payload)
  ].join('\n');
}

function stripCodeFences(text) {
  return String(text || '')
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function normalizeInsight(parsed, fallback) {
  const modelDrivers = Array.isArray(parsed?.topDrivers)
    ? parsed.topDrivers.map((item) => String(item).trim()).filter(Boolean)
    : [];
  const modelActions = Array.isArray(parsed?.actions)
    ? parsed.actions.map((item) => String(item).trim()).filter(Boolean)
    : [];

  const topDrivers = [...modelDrivers, ...fallback.topDrivers]
    .filter((item, index, array) => item && array.indexOf(item) === index)
    .slice(0, 3);
  const actions = [...modelActions, ...fallback.actions]
    .filter((item, index, array) => item && array.indexOf(item) === index)
    .slice(0, 4);

  return {
    headline: typeof parsed?.headline === 'string' && parsed.headline.trim() ? parsed.headline.trim() : fallback.headline,
    summary: typeof parsed?.summary === 'string' && parsed.summary.trim() ? parsed.summary.trim() : fallback.summary,
    riskLevel: ['low', 'medium', 'high'].includes(parsed?.riskLevel) ? parsed.riskLevel : fallback.riskLevel,
    topDrivers,
    actions,
    source: 'ollama',
    updatedAt: new Date().toISOString()
  };
}

async function generateStorageInsight(sensorData, quality, history = []) {
  const fallback = buildFallbackInsight(sensorData, quality, history);

  if (!CONFIG.enabled) {
    return fallback;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONFIG.timeoutMs);

  try {
    const response = await fetch(`${CONFIG.ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: CONFIG.model,
        prompt: buildPrompt(sensorData, quality, history),
        stream: false,
        format: 'json',
        options: {
          num_predict: CONFIG.maxTokens,
          temperature: 0.2
        }
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed with status ${response.status}`);
    }

    const result = await response.json();
    const parsed = JSON.parse(stripCodeFences(result.response));

    return normalizeInsight(parsed, fallback);
  } catch (error) {
    console.warn('AI insight fallback activated:', error.message);
    return fallback;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  generateStorageInsight,
  buildFallbackInsight,
  AI_CONFIG: CONFIG
};
