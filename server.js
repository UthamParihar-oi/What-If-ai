/**
 * What If? AI Scenario Simulator - Backend Server
 * Node.js + Express server that proxies requests to AI API
 * Keeps API key secure on the backend
 */

require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARE
// ========================================
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Request logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// ========================================
// CONFIGURATION
// ========================================
const CONFIG = {
    MAX_SCENARIO_LENGTH: 500,
    REQUEST_TIMEOUT: 60000, // 60 seconds
    AI_MODEL: process.env.AI_MODEL || 'gpt-4o-mini',
    AI_TEMPERATURE: 0.7,
    AI_MAX_TOKENS: 2000
};

// Validate environment
if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  WARNING: OPENAI_API_KEY not set in environment variables');
    console.warn('   Create a .env file with your API key (see .env.example)');
}

// ========================================
// AI SYSTEM PROMPT
// ========================================
const SYSTEM_PROMPT = `You are the AI engine for "What If? AI Scenario Simulator".

Analyze hypothetical scenarios in an educational, balanced, and easy-to-understand way.

Guidelines:
- Do not present speculation as established fact
- Clearly distinguish assumptions from likely consequences
- Analyze the scenario from multiple perspectives including society, technology, environment, and everyday life
- Keep answers concise and suitable for cards on a website
- Return structured JSON only - no additional text or formatting
- Do not provide dangerous instructions or advice
- Language should be accessible to college students
- Be creative but grounded in scientific principles

Return JSON with exactly these fields:
{
  "summary": "string - Brief overall explanation (2-3 sentences)",
  "impact": {
    "people": "string - Impact on individuals and daily life",
    "society": "string - Impact on social structures and culture",
    "technology": "string - Impact on technological development",
    "environment": "string - Impact on environment and ecology",
    "economy": "string - Impact on economy and markets"
  },
  "challenges": ["string", "string", "string", "string", "string"] - 3-5 major challenges,
  "solutions": ["string", "string", "string", "string"] - 3-4 realistic solutions/adaptations,
  "future": ["string", "string", "string", "string", "string"] - 5 timeline points (now, 1yr, 10yr, 50yr, 100yr),
  "impactIndicators": {
    "technology": number (0-100),
    "society": number (0-100),
    "environment": number (0-100),
    "economy": number (0-100)
  },
  "timeline": [
    {"period": "NOW", "description": "string"},
    {"period": "1 YEAR", "description": "string"},
    {"period": "10 YEARS", "description": "string"},
    {"period": "50 YEARS", "description": "string"},
    {"period": "100 YEARS", "description": "string"}
  ]
}`;

// ========================================
// VALIDATION
// ========================================
function validateScenario(scenario) {
    if (!scenario || typeof scenario !== 'string') {
        return { valid: false, error: 'Scenario is required' };
    }

    const trimmed = scenario.trim();

    if (trimmed.length === 0) {
        return { valid: false, error: 'Please enter a scenario first.' };
    }

    if (trimmed.length > CONFIG.MAX_SCENARIO_LENGTH) {
        return { valid: false, error: `Scenario too long. Maximum ${CONFIG.MAX_SCENARIO_LENGTH} characters.` };
    }

    // Basic content filtering
    const dangerousPatterns = [
        /\b(make|create|build|manufacture)\s+(bomb|weapon|explosive|poison|drug)\b/i,
        /\bhow\s+to\s+(harm|kill|hurt|attack)\b/i,
        /\b(instructions?|guide|tutorial)\s+for\s+(illegal|criminal|harmful)\b/i
    ];

    for (const pattern of dangerousPatterns) {
        if (pattern.test(trimmed)) {
            return { valid: false, error: 'This scenario involves potentially harmful content.' };
        }
    }

    return { valid: true, scenario: trimmed };
}

// ========================================
// AI API CALL
// ========================================
async function callAI(scenario) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error('AI service not configured. Please set OPENAI_API_KEY environment variable.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: CONFIG.AI_MODEL,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: scenario }
                ],
                temperature: CONFIG.AI_TEMPERATURE,
                max_tokens: CONFIG.AI_MAX_TOKENS,
                response_format: { type: 'json_object' }
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error?.message || `API error: ${response.status}`;

            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your OPENAI_API_KEY.');
            }
            if (response.status === 429) {
                throw new Error('API rate limit exceeded. Please try again later.');
            }
            if (response.status >= 500) {
                throw new Error('AI service temporarily unavailable. Please try again.');
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            throw new Error('Empty response from AI');
        }

        return JSON.parse(content);

    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.');
        }

        if (error instanceof SyntaxError) {
            throw new Error('Invalid response format from AI. Please try again.');
        }

        throw error;
    }
}

// ========================================
// FALLBACK RESPONSE (for testing without API key)
// ========================================
function generateFallbackResponse(scenario) {
    // Simple heuristic-based response for demo/testing
    const lower = scenario.toLowerCase();

    let summary = `This scenario explores a world where "${scenario}". The implications would be far-reaching across multiple domains of human experience.`;

    let impact = {
        people: 'Daily routines and quality of life would fundamentally shift as people adapt to new constraints and opportunities.',
        society: 'Social structures, cultural norms, and interpersonal relationships would evolve in response to the changed reality.',
        technology: 'Technological development would accelerate in some areas while facing novel challenges in others.',
        environment: 'Ecological systems would experience both direct and indirect effects from human behavioral changes.',
        economy: 'Markets would be disrupted as supply chains, labor markets, and consumer demands transform.'
    };

    let challenges = [
        'Initial adaptation period causing widespread disruption and uncertainty',
        'Inequitable access to benefits, potentially widening social gaps',
        'Regulatory and ethical frameworks struggling to keep pace with change',
        'Unintended consequences cascading through interconnected systems',
        'Psychological impact on populations facing radical lifestyle changes'
    ];

    let solutions = [
        'Phased implementation with robust social safety nets',
        'International cooperation on standards and equitable distribution',
        'Investment in education and reskilling programs',
        'Adaptive governance frameworks with built-in feedback loops'
    ];

    let future = [
        'Society grapples with immediate disruption and begins emergency adaptations',
        'New norms emerge as institutions adapt; early adopters gain advantages',
        'Transformed society with integrated systems; generational attitudes shift',
        'Fundamentally different civilization; original scenario is baseline reality',
        'Post-transition equilibrium; new challenges emerge from the solution itself'
    ];

    let impactIndicators = {
        technology: 70,
        society: 65,
        environment: 50,
        economy: 60
    };

    let timeline = [
        { period: 'NOW', description: 'Immediate chaos and adaptation as systems fail or transform. Emergency measures enacted.' },
        { period: '1 YEAR', description: 'New routines establish. Early innovations appear. Inequality spikes then stabilizes.' },
        { period: '10 YEARS', description: 'Society restructured around new reality. Generation growing up knows nothing else.' },
        { period: '50 YEARS', description: 'Fundamental institutions redesigned. Cultural memory of "before" fades.' },
        { period: '100 YEARS', description: 'New steady state. Original scenario is historical baseline. Next paradigm shift brewing.' }
    ];

    // Customize based on keywords
    if (lower.includes('mars') || lower.includes('space') || lower.includes('colon')) {
        impact.environment = 'Planetary protection protocols clash with terraforming ambitions. New ecosystems engineered.';
        impactIndicators.environment = 80;
        impactIndicators.technology = 85;
    }
    if (lower.includes('ai') || lower.includes('artificial intelligence')) {
        impact.technology = 'AI capabilities leap forward but alignment challenges intensify. Human-AI collaboration becomes norm.';
        impactIndicators.technology = 90;
        impactIndicators.society = 75;
    }
    if (lower.includes('sleep') || lower.includes('never needed')) {
        impact.people = '24/7 society emerges. Productivity metrics soar but burnout takes new forms. Leisure time redefined.';
        impactIndicators.society = 80;
        impactIndicators.economy = 85;
    }
    if (lower.includes('electricity') || lower.includes('power')) {
        impact.technology = 'Analog and mechanical systems renaissance. Decentralized energy solutions explode.';
        impactIndicators.technology = 40;
        impactIndicators.environment = 60;
    }

    return {
        summary,
        impact,
        challenges,
        solutions,
        future,
        impactIndicators,
        timeline
    };
}

// ========================================
// ROUTES
// ========================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        aiConfigured: !!process.env.OPENAI_API_KEY
    });
});

// Main simulation endpoint
app.post('/api/simulate', async (req, res) => {
    const startTime = Date.now();

    try {
        // Validate input
        const validation = validateScenario(req.body?.scenario);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        const scenario = validation.scenario;
        console.log(`Processing scenario: "${scenario.substring(0, 80)}..."`);

        let result;

        // Use AI if configured, otherwise fallback
        if (process.env.OPENAI_API_KEY) {
            try {
                result = await callAI(scenario);
            } catch (aiError) {
                console.error('AI Error:', aiError.message);
                // Fallback to generated response
                console.log('Falling back to generated response...');
                result = generateFallbackResponse(scenario);
                result._fallback = true;
                result._error = aiError.message;
            }
        } else {
            result = generateFallbackResponse(scenario);
            result._fallback = true;
            result._note = 'Running in demo mode - set OPENAI_API_KEY for AI-powered responses';
        }

        // Validate response structure
        const requiredFields = ['summary', 'impact', 'challenges', 'solutions', 'future', 'impactIndicators', 'timeline'];
        for (const field of requiredFields) {
            if (!(field in result)) {
                console.warn(`Missing field in AI response: ${field}`);
            }
        }

        // Ensure arrays have minimum items
        result.challenges = (result.challenges || []).slice(0, 5);
        result.solutions = (result.solutions || []).slice(0, 4);
        result.future = (result.future || []).slice(0, 5);

        const duration = Date.now() - startTime;
        console.log(`Completed in ${duration}ms`);

        res.json(result);

    } catch (error) {
        console.error('Simulation error:', error);
        res.status(500).json({
            error: error.message || 'Something went wrong while generating the scenario. Please try again.'
        });
    }
});

// Serve index.html for all other routes (SPA fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ========================================
// ERROR HANDLING
// ========================================
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error'
    });
});

// ========================================
// START SERVER
// ========================================
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║  What If? AI Scenario Simulator                              ║
║  Server running on http://0.0.0.0:${PORT}                        ║
║                                                              ║
║  API Endpoint: POST /api/simulate                            ║
║  Health Check: GET  /api/health                              ║
║                                                              ║
║  AI Configured: ${process.env.OPENAI_API_KEY ? 'Yes ✓' : 'No (using fallback)'}                               ║
╚══════════════════════════════════════════════════════════════╝
    `);
});

server.on('error', (err) => {
    console.error('Server listen error:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

