/**
 * What If? AI Scenario Simulator - Frontend JavaScript
 * Handles all client-side interactions, API communication, and UI updates
 */

// ========================================
// CONFIGURATION & CONSTANTS
// ========================================
const CONFIG = {
    API_ENDPOINT: '/api/simulate',
    MAX_SCENARIO_LENGTH: 500,
    HISTORY_KEY: 'whatif_history',
    MAX_HISTORY_ITEMS: 10,
    LOADING_STAGES: [
        { progress: 10, message: 'Initializing neural pathways...' },
        { progress: 30, message: 'Analyzing scenario parameters...' },
        { progress: 55, message: 'Simulating consequences...' },
        { progress: 80, message: 'Generating insights...' },
        { progress: 100, message: 'Complete!' }
    ]
};

// Example scenarios by category
const SCENARIOS_BY_CATEGORY = {
    environment: [
        "What if electricity disappeared for 7 days?",
        "What if the oceans became fresh water?",
        "What if Earth's atmosphere lost 50% of its oxygen?",
        "What if all glaciers melted overnight?",
        "What if humans could photosynthesize?"
    ],
    space: [
        "What if humans could live on Mars?",
        "What if Earth had two moons?",
        "What if gravity suddenly became half as strong?",
        "What if we discovered a habitable exoplanet next door?",
        "What if the Sun disappeared for 24 hours?"
    ],
    technology: [
        "What if AI controlled every traffic signal?",
        "What if AI became the main teacher in schools?",
        "What if teleportation became possible?",
        "What if brain-computer interfaces were universal?",
        "What if quantum computers broke all encryption?"
    ],
    science: [
        "What if humans never needed sleep?",
        "What if humans could breathe underwater?",
        "What if we could edit any gene perfectly?",
        "What if room-temperature superconductors existed?",
        "What if we could harness zero-point energy?"
    ],
    society: [
        "What if everyone could speak every language?",
        "What if robots became household workers?",
        "What if universal basic income was global?",
        "What if memories could be shared like files?",
        "What if aging was cured?"
    ],
    future: [
        "What if humans colonized Mars?",
        "What if AI governed a country?",
        "What if we achieved digital immortality?",
        "What if FTL travel was invented?",
        "What if we made contact with aliens?"
    ]
};

// All scenarios for random selection
const ALL_SCENARIOS = Object.values(SCENARIOS_BY_CATEGORY).flat();

// Category metadata
const CATEGORIES = [
    { id: 'environment', icon: '🌍', name: 'Environment', color: '#22c55e' },
    { id: 'space', icon: '🚀', name: 'Space', color: '#6366f1' },
    { id: 'technology', icon: '🤖', name: 'Technology', color: '#06b6d4' },
    { id: 'science', icon: '🧬', name: 'Science', color: '#f59e0b' },
    { id: 'society', icon: '🏙️', name: 'Society', color: '#a855f7' },
    { id: 'future', icon: '⏳', name: 'Future', color: '#f472b6' }
];

// Impact dimensions for indicators
const IMPACT_DIMENSIONS = [
    { key: 'technology', label: 'Technology', icon: '🤖' },
    { key: 'society', label: 'Society', icon: '👥' },
    { key: 'environment', label: 'Environment', icon: '🌱' },
    { key: 'economy', label: 'Economy', icon: '💰' }
];

// Timeline periods
const TIMELINE_PERIODS = [
    { period: 'NOW', label: 'Immediate' },
    { period: '1 YEAR', label: 'Short-term' },
    { period: '10 YEARS', label: 'Medium-term' },
    { period: '50 YEARS', label: 'Long-term' },
    { period: '100 YEARS', label: 'Distant future' }
];

// ========================================
// STATE MANAGEMENT
// ========================================
const state = {
    currentScenario: '',
    currentCategory: null,
    history: [],
    isLoading: false,
    abortController: null
};

// ========================================
// DOM ELEMENT REFERENCES
// ========================================
const elements = {
    // Form
    scenarioForm: document.getElementById('scenario-form'),
    scenarioInput: document.getElementById('scenario-input'),
    exploreBtn: document.getElementById('explore-btn'),
    randomBtn: document.getElementById('random-btn'),

    // Examples & Categories
    examplesGrid: document.getElementById('examples-grid'),
    categoriesGrid: document.getElementById('categories-grid'),

    // Sections
    heroSection: document.getElementById('hero'),
    categoriesSection: document.getElementById('categories'),
    loadingSection: document.getElementById('loading'),
    resultsSection: document.getElementById('results'),
    errorSection: document.getElementById('error'),

    // Loading
    progressBar: document.getElementById('progress-bar'),

    // Results
    resultsScenario: document.getElementById('results-scenario'),
    newScenarioBtn: document.getElementById('new-scenario-btn'),
    indicatorsGrid: document.getElementById('indicators-grid'),

    // Cards
    summaryContent: document.getElementById('summary-content'),
    impactContent: document.getElementById('impact-content'),
    challengesContent: document.getElementById('challenges-content'),
    solutionsContent: document.getElementById('solutions-content'),
    futureContent: document.getElementById('future-content'),
    timelineSection: document.getElementById('timeline'),
    timelineContent: document.getElementById('timeline-content'),

    // Error
    errorMessage: document.getElementById('error-message'),
    retryBtn: document.getElementById('retry-btn'),

    // History
    historyList: document.getElementById('history-list'),
    historyEmpty: document.getElementById('history-empty'),
    clearHistoryBtn: document.getElementById('clear-history-btn'),
    navToggle: document.querySelector('.nav-toggle'),
    navMenu: document.getElementById('nav-menu')
};

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    loadHistory();
    renderExamples();
    renderCategories();
    renderHistory();
    setupEventListeners();
    initStarsCanvas();
}

// ========================================
// EVENT LISTENERS
// ========================================
function setupEventListeners() {
    // Form submission
    elements.scenarioForm.addEventListener('submit', handleFormSubmit);

    // Random scenario
    elements.randomBtn.addEventListener('click', handleRandomScenario);

    // New scenario button
    elements.newScenarioBtn.addEventListener('click', resetToHero);

    // Retry button
    elements.retryBtn.addEventListener('click', retryLastScenario);

    // Clear history
    elements.clearHistoryBtn.addEventListener('click', clearHistory);

    // Navigation toggle
    elements.navToggle.addEventListener('click', toggleNavMenu);

    // Close nav on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeNavMenu);
    });

    // Keyboard navigation for example buttons
    document.addEventListener('keydown', handleGlobalKeydown);

    // Input validation feedback
    elements.scenarioInput.addEventListener('input', validateInput);
}

// ========================================
// FORM HANDLING
// ========================================
async function handleFormSubmit(event) {
    event.preventDefault();

    const scenario = elements.scenarioInput.value.trim();

    if (!scenario) {
        showError('Please enter a scenario first.');
        elements.scenarioInput.focus();
        return;
    }

    if (scenario.length > CONFIG.MAX_SCENARIO_LENGTH) {
        showError(`Scenario is too long. Maximum ${CONFIG.MAX_SCENARIO_LENGTH} characters.`);
        return;
    }

    state.currentScenario = scenario;
    await simulateScenario(scenario);
}

function validateInput() {
    const value = elements.scenarioInput.value.trim();
    const isValid = value.length > 0 && value.length <= CONFIG.MAX_SCENARIO_LENGTH;
    elements.exploreBtn.disabled = !isValid || state.isLoading;
}

// ========================================
// SCENARIO SIMULATION (API CALL)
// ========================================
async function simulateScenario(scenario) {
    setLoading(true);
    showLoadingSection();
    hideError();
    hideResults();

    // Add to history immediately for responsiveness
    addToHistory(scenario);

    // Animate loading progress
    animateLoadingProgress();

    try {
        state.abortController = new AbortController();

        const response = await fetch(CONFIG.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ scenario }),
            signal: state.abortController.signal
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        displayResults(data, scenario);

    } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Simulation error:', error);
        showError(error.message || 'Something went wrong while generating the scenario. Please try again.');
    } finally {
        setLoading(false);
    }
}

function retryLastScenario() {
    if (state.currentScenario) {
        simulateScenario(state.currentScenario);
    }
}

// ========================================
// LOADING ANIMATION
// ========================================
function animateLoadingProgress() {
    let stageIndex = 0;

    function nextStage() {
        if (stageIndex >= CONFIG.LOADING_STAGES.length || !state.isLoading) return;

        const stage = CONFIG.LOADING_STAGES[stageIndex];
        elements.progressBar.style.width = `${stage.progress}%`;
        elements.progressBar.setAttribute('aria-valuenow', stage.progress);

        // Update subtitle
        const subtitle = elements.loadingSection.querySelector('.loading-subtitle');
        if (subtitle) subtitle.textContent = stage.message;

        stageIndex++;
        if (stageIndex < CONFIG.LOADING_STAGES.length) {
            setTimeout(nextStage, 800 + Math.random() * 400);
        }
    }

    nextStage();
}

// ========================================
// RESULTS DISPLAY
// ========================================
function displayResults(data, scenario) {
    hideLoadingSection();
    showResultsSection();

    // Update scenario display
    elements.resultsScenario.textContent = `"${scenario}"`;

    // Summary / Big Picture
    elements.summaryContent.innerHTML = formatText(data.summary || 'No summary available.');

    // Impact
    renderImpact(data.impact || {});

    // Challenges
    renderList(data.challenges || [], elements.challengesContent, 'challenge');

    // Solutions
    renderList(data.solutions || [], elements.solutionsContent, 'solution');

    // Future
    renderList(data.future || [], elements.futureContent, 'future');

    // Impact Indicators
    renderImpactIndicators(data.impactIndicators || {});

    // Timeline (if provided)
    if (data.timeline && data.timeline.length > 0) {
        renderTimeline(data.timeline);
    } else {
        hideTimeline();
    }

    // Scroll to results
    elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function formatText(text) {
    if (!text) return '';
    // Convert line breaks to paragraphs
    return text
        .split('\n')
        .filter(p => p.trim())
        .map(p => `<p>${escapeHtml(p.trim())}</p>`)
        .join('');
}

function renderImpact(impact) {
    if (!impact || Object.keys(impact).length === 0) {
        elements.impactContent.innerHTML = '<p class="impact-category-text">No impact data available.</p>';
        return;
    }

    const categories = [
        { key: 'people', label: 'People' },
        { key: 'society', label: 'Society' },
        { key: 'technology', label: 'Technology' },
        { key: 'environment', label: 'Environment' },
        { key: 'economy', label: 'Economy' }
    ];

    elements.impactContent.innerHTML = categories
        .filter(cat => impact[cat.key])
        .map(cat => `
            <div class="impact-category">
                <div class="impact-category-name">${cat.label}</div>
                <div class="impact-category-text">${escapeHtml(impact[cat.key])}</div>
            </div>
        `).join('');
}

function renderList(items, container, type) {
    if (!items || items.length === 0) {
        container.innerHTML = `<li>No ${type}s available.</li>`;
        return;
    }

    container.innerHTML = items
        .map(item => `<li>${escapeHtml(item)}</li>`)
        .join('');
}

function renderImpactIndicators(indicators) {
    if (!indicators || Object.keys(indicators).length === 0) {
        // Generate default indicators based on impact categories
        indicators = {
            technology: 65,
            society: 55,
            environment: 45,
            economy: 60
        };
    }

    elements.indicatorsGrid.innerHTML = IMPACT_DIMENSIONS.map(dim => {
        const value = Math.max(0, Math.min(100, indicators[dim.key] || 50));
        return `
            <div class="indicator-item">
                <div class="indicator-label">
                    <span>${dim.icon} ${dim.label}</span>
                    <span class="indicator-value">${value}%</span>
                </div>
                <div class="indicator-bar">
                    <div class="indicator-fill" style="width: 0%" data-target="${value}"></div>
                </div>
            </div>
        `;
    }).join('');

    // Animate bars
    requestAnimationFrame(() => {
        document.querySelectorAll('.indicator-fill').forEach(bar => {
            const target = parseInt(bar.dataset.target, 10);
            bar.style.width = `${target}%`;
        });
    });
}

function renderTimeline(timeline) {
    if (!timeline || timeline.length === 0) {
        hideTimeline();
        return;
    }

    elements.timelineContent.innerHTML = timeline.map((item, index) => {
        const period = TIMELINE_PERIODS[index] || { period: `${index + 1} STAGE`, label: '' };
        return `
            <div class="timeline-item" role="listitem">
                <div class="timeline-marker">${period.period}</div>
                <div class="timeline-content">
                    <div class="timeline-period">${period.period} — ${period.label}</div>
                    <div class="timeline-description">${escapeHtml(item.description || item)}</div>
                </div>
            </div>
        `;
    }).join('');

    elements.timelineSection.classList.remove('hidden');
}

function hideTimeline() {
    elements.timelineSection.classList.add('hidden');
}

// ========================================
// EXAMPLE SCENARIOS
// ========================================
function renderExamples(categoryId = null) {
    const scenarios = categoryId
        ? SCENARIOS_BY_CATEGORY[categoryId] || ALL_SCENARIOS
        : ALL_SCENARIOS.slice(0, 8); // Show first 8 by default

    elements.examplesGrid.innerHTML = scenarios.map(scenario => `
        <button type="button" class="example-btn" data-scenario="${escapeHtml(scenario)}" aria-label="Try: ${escapeHtml(scenario)}">
            ${escapeHtml(scenario)}
        </button>
    `).join('');

    // Add click handlers
    elements.examplesGrid.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const scenario = btn.dataset.scenario;
            elements.scenarioInput.value = scenario;
            validateInput();
            elements.scenarioInput.focus();

            // Visual feedback
            btn.style.transform = 'scale(0.98)';
            setTimeout(() => btn.style.transform = '', 100);
        });
    });
}

// ========================================
// CATEGORIES
// ========================================
function renderCategories() {
    elements.categoriesGrid.innerHTML = CATEGORIES.map(cat => `
        <button type="button" class="category-card" data-category="${cat.id}" aria-label="${cat.name} category" style="--cat-color: ${cat.color};">
            <span class="category-icon">${cat.icon}</span>
            <span class="category-name">${cat.name}</span>
            <span class="category-count">${(SCENARIOS_BY_CATEGORY[cat.id] || []).length} scenarios</span>
        </button>
    `).join('');

    // Add click handlers
    elements.categoriesGrid.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const categoryId = card.dataset.category;
            handleCategorySelect(categoryId, card);
        });
    });
}

function handleCategorySelect(categoryId, cardElement) {
    // Update active state
    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active'));
    cardElement.classList.add('active');

    state.currentCategory = categoryId;
    renderExamples(categoryId);

    // Smooth scroll to examples
    elements.examplesGrid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ========================================
// RANDOM SCENARIO
// ========================================
function handleRandomScenario() {
    const randomScenario = ALL_SCENARIOS[Math.floor(Math.random() * ALL_SCENARIOS.length)];
    elements.scenarioInput.value = randomScenario;
    validateInput();
    elements.scenarioInput.focus();

    // Visual feedback
    elements.randomBtn.style.transform = 'scale(0.98) rotate(10deg)';
    setTimeout(() => elements.randomBtn.style.transform = '', 200);
}

// ========================================
// HISTORY MANAGEMENT (localStorage)
// ========================================
function loadHistory() {
    try {
        const stored = localStorage.getItem(CONFIG.HISTORY_KEY);
        state.history = stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.warn('Failed to load history:', e);
        state.history = [];
    }
}

function saveHistory() {
    try {
        localStorage.setItem(CONFIG.HISTORY_KEY, JSON.stringify(state.history));
    } catch (e) {
        console.warn('Failed to save history:', e);
    }
}

function addToHistory(scenario) {
    // Remove if already exists
    state.history = state.history.filter(item => item !== scenario);

    // Add to beginning
    state.history.unshift(scenario);

    // Limit size
    if (state.history.length > CONFIG.MAX_HISTORY_ITEMS) {
        state.history = state.history.slice(0, CONFIG.MAX_HISTORY_ITEMS);
    }

    saveHistory();
    renderHistory();
}

function renderHistory() {
    if (state.history.length === 0) {
        elements.historyList.innerHTML = '';
        elements.historyEmpty.style.display = 'block';
        return;
    }

    elements.historyEmpty.style.display = 'none';
    elements.historyList.innerHTML = state.history.map((scenario, index) => `
        <li class="history-item" data-scenario="${escapeHtml(scenario)}" role="button" tabindex="0" aria-label="Load scenario: ${escapeHtml(scenario)}">
            <span class="history-item-number">${index + 1}</span>
            <span class="history-item-text">${escapeHtml(scenario)}</span>
        </li>
    `).join('');

    // Add click/keyboard handlers
    elements.historyList.querySelectorAll('.history-item').forEach(item => {
        const scenario = item.dataset.scenario;

        item.addEventListener('click', () => loadHistoryScenario(scenario));
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                loadHistoryScenario(scenario);
            }
        });
    });
}

function loadHistoryScenario(scenario) {
    elements.scenarioInput.value = scenario;
    validateInput();
    simulateScenario(scenario);
    closeHistoryPanel();
}

function clearHistory() {
    state.history = [];
    saveHistory();
    renderHistory();
}

// ========================================
// UI STATE MANAGEMENT
// ========================================
function setLoading(loading) {
    state.isLoading = loading;
    elements.exploreBtn.disabled = loading || !elements.scenarioInput.value.trim();
    elements.randomBtn.disabled = loading;

    if (loading) {
        elements.exploreBtn.classList.add('loading');
    } else {
        elements.exploreBtn.classList.remove('loading');
    }
}

function showLoadingSection() {
    elements.heroSection.style.display = 'none';
    if (elements.categoriesSection) elements.categoriesSection.style.display = 'none';
    elements.loadingSection.classList.remove('hidden');
    elements.progressBar.style.width = '0%';
    elements.progressBar.setAttribute('aria-valuenow', 0);
}

function hideLoadingSection() {
    elements.loadingSection.classList.add('hidden');
}

function showResultsSection() {
    elements.resultsSection.classList.remove('hidden');
}

function hideResults() {
    elements.resultsSection.classList.add('hidden');
}

function showError(message) {
    hideLoadingSection();
    hideResults();
    elements.errorMessage.textContent = message;
    elements.errorSection.classList.remove('hidden');
}

function hideError() {
    elements.errorSection.classList.add('hidden');
}

function resetToHero() {
    hideResults();
    hideError();
    elements.heroSection.style.display = '';
    if (elements.categoriesSection) elements.categoriesSection.style.display = '';
    elements.scenarioInput.value = '';
    validateInput();
    elements.scenarioInput.focus();
    state.currentScenario = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================
// NAVIGATION & PANELS
// ========================================
function toggleNavMenu() {
    const isExpanded = elements.navToggle.getAttribute('aria-expanded') === 'true';
    elements.navToggle.setAttribute('aria-expanded', !isExpanded);
    elements.navMenu.classList.toggle('open');
}

function closeNavMenu() {
    elements.navToggle.setAttribute('aria-expanded', 'false');
    elements.navMenu.classList.remove('open');
}

// ========================================
// HISTORY PANEL (sidebar)
// ========================================
function closeHistoryPanel() {
    // If we implement a toggle button for history, close it here
}

// ========================================
// STARFIELD CANVAS ANIMATION
// ========================================
function initStarsCanvas() {
    const canvas = document.getElementById('stars-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let stars = [];
    let animationId = null;
    let lastTime = 0;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createStars() {
        stars = [];
        const count = Math.min(200, Math.floor((canvas.width * canvas.height) / 15000));

        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.2,
                speed: Math.random() * 0.2 + 0.05,
                hue: Math.random() * 60 + 240 // Blue to purple range
            });
        }
    }

    function draw(time) {
        if (!state.isLoading && document.hidden) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw gradient background
        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
        );
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.03)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update and draw stars
        stars.forEach(star => {
            star.y += star.speed;
            star.opacity += (Math.random() - 0.5) * 0.02;
            star.opacity = Math.max(0.1, Math.min(0.8, star.opacity));

            if (star.y > canvas.height) {
                star.y = -star.size;
                star.x = Math.random() * canvas.width;
            }

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${star.hue}, 70%, 70%, ${star.opacity})`;
            ctx.fill();
        });

        // Draw occasional connections
        if (Math.random() < 0.02) {
            const i = Math.floor(Math.random() * stars.length);
            const j = Math.floor(Math.random() * stars.length);
            if (i !== j) {
                const dx = stars[i].x - stars[j].x;
                const dy = stars[i].y - stars[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(stars[i].x, stars[i].y);
                    ctx.lineTo(stars[j].x, stars[j].y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.05 * (1 - dist / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        animationId = requestAnimationFrame(draw);
    }

    function start() {
        resize();
        createStars();
        draw(0);
    }

    function stop() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }

    window.addEventListener('resize', () => {
        resize();
        createStars();
    });

    // Pause when tab not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stop();
        } else {
            start();
        }
    });

    start();
}

// ========================================
// GLOBAL KEYBOARD HANDLING
// ========================================
function handleGlobalKeydown(event) {
    // Escape key closes modals/panels
    if (event.key === 'Escape') {
        closeNavMenu();
        closeHistoryPanel();
    }

    // Enter in example buttons
    if (event.target.classList.contains('example-btn') && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        event.target.click();
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Expose for debugging
window.WhatIfApp = {
    state,
    elements,
    simulateScenario,
    addToHistory,
    clearHistory
};