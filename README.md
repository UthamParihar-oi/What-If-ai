# What If? — AI Scenario Simulator

> **Imagine the impossible. Explore the consequences.**

An interactive web application that uses AI to analyze hypothetical "What if?" scenarios and presents the consequences in an engaging, educational format. Built as a first-year engineering AI project.

---

## 🌟 Features

- **AI-Powered Analysis** — Enter any hypothetical scenario and get structured insights
- **Futuristic UI** — Dark space theme with glassmorphism, animated particles, and smooth animations
- **Structured Results** — Big Picture, Impact (5 categories), Challenges, Solutions, Long-term Future
- **Impact Indicators** — Visual meters for Technology, Society, Environment, Economy
- **Future Timeline** — Visual progression from NOW to 100 YEARS
- **Scenario Categories** — Environment, Space, Technology, Science, Society, Future
- **Random Scenarios** — One-click surprise scenarios
- **History** — localStorage-powered recent scenarios panel
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Accessible** — Semantic HTML, keyboard navigation, ARIA labels, good contrast
- **Secure** — API key never exposed to frontend

---

## 🛠 Technologies Used

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML5, CSS3 (Custom Properties, Grid, Flexbox), Vanilla JavaScript (ES6+) |
| **Backend** | Node.js, Express.js |
| **AI** | OpenAI API (GPT-4o-mini) with JSON structured output |
| **Styling** | CSS Custom Properties, Glassmorphism, CSS Animations |
| **Deployment** | Any Node.js hosting (Vercel, Railway, Render, etc.) |

---

## 🏗 Project Architecture

```
What-If-AI/
├── public/                 # Frontend (served statically)
│   ├── index.html         # Main HTML structure
│   ├── style.css          # Complete styling system
│   └── script.js          # All frontend logic
├── server.js              # Express backend + AI integration
├── package.json           # Dependencies and scripts
├── .env.example           # Environment template
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

### Data Flow

```
User enters scenario
        ↓
Frontend (script.js) validates & sends POST /api/simulate
        ↓
Backend (server.js) receives request
        ↓
Backend validates input, calls OpenAI API with system prompt
        ↓
OpenAI returns structured JSON
        ↓
Backend validates response, sends to frontend
        ↓
Frontend renders results in cards, indicators, timeline
```

---

## 🤖 How the AI Works

1. **System Prompt** — Defines the AI's role as an educational scenario analyzer
2. **Structured Output** — Uses OpenAI's JSON mode for reliable parsing
3. **Fallback Mode** — Works without API key using heuristic responses
4. **Safety** — Input validation filters dangerous content requests

### AI Response Structure

```json
{
  "summary": "Brief overall explanation",
  "impact": {
    "people": "...",
    "society": "...",
    "technology": "...",
    "environment": "...",
    "economy": "..."
  },
  "challenges": ["...", "...", "..."],
  "solutions": ["...", "...", "..."],
  "future": ["...", "...", "...", "...", "..."],
  "impactIndicators": {
    "technology": 70,
    "society": 65,
    "environment": 50,
    "economy": 60
  },
  "timeline": [
    {"period": "NOW", "description": "..."},
    {"period": "1 YEAR", "description": "..."},
    {"period": "10 YEARS", "description": "..."},
    {"period": "50 YEARS", "description": "..."},
    {"period": "100 YEARS", "description": "..."}
  ]
}
```

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js 18+ installed
- OpenAI API key (optional - works in demo mode without)

### Steps

1. **Clone or download the project**
   ```bash
   cd What-If-AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment** (optional but recommended)
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

4. **Run the server**
   ```bash
   npm start
   ```

5. **Open in browser**
   what-if-ai-production.up.railway.app

---

## 🔧 Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | No* | - | OpenAI API key for AI responses |
| `AI_MODEL` | No | `gpt-4o-mini` | Model to use |
| `PORT` | No | `3000` | Server port |
| `AI_TEMPERATURE` | No | `0.7` | Creativity (0-2) |
| `AI_MAX_TOKENS` | No | `2000` | Max response length |

*Without API key, runs in demo mode with generated responses.

---

## 🎯 Usage

1. **Enter a scenario** — Type any "What if?" question
2. **Click Explore** — Or press Enter
3. **View results** — 5 analysis cards + impact indicators + timeline
4. **Try examples** — Click example buttons or category cards
5. **Random** — Click 🎲 for surprise scenarios
6. **History** — Check the sidebar for previous explorations

### Example Scenarios

- What if humans could live on Mars?
- What if electricity disappeared for 7 days?
- What if AI controlled every traffic signal?
- What if humans never needed sleep?
- What if robots became common in every home?

---

## 🔒 Security

- **API Key Protection** — Never exposed to browser; only on backend
- **Input Validation** — Length limits, content filtering on server
- **Rate Limiting** — Recommended for production (add express-rate-limit)
- **HTTPS** — Required for production deployment
- **CORS** — Configure for your domain in production

---

## 📱 Responsive Breakpoints

| Device | Width | Layout |
|--------|-------|--------|
| Mobile | < 480px | Single column, stacked cards |
| Tablet | 480-768px | Two-column grid where appropriate |
| Laptop | 768-1024px | Full grid, sidebar history |
| Desktop | > 1024px | Full layout with all features |

---

## ♿ Accessibility

- Semantic HTML5 elements (`<header>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`)
- ARIA labels and roles throughout
- Keyboard-navigable (Tab, Enter, Escape)
- Focus visible outlines
- Color contrast ratios meet WCAG AA
- Reduced motion support
- Alt text for decorative elements (aria-hidden)

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Submit valid scenario → see results
- [ ] Submit empty scenario → see error
- [ ] Submit very long scenario → see validation error
- [ ] Click example buttons → fills input
- [ ] Click category cards → filters examples
- [ ] Click Random → fills input with random scenario
- [ ] Check history panel → shows recent searches
- [ ] Clear history → empties list
- [ ] Resize browser → responsive layout works
- [ ] Keyboard only navigation → all interactive elements reachable
- [ ] Screen reader → announces loading, results, errors

### API Testing

```bash
# Health check
curl http://localhost:3000/api/health

# Simulate scenario
curl -X POST http://localhost:3000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{"scenario": "What if humans could fly?"}'
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add `OPENAI_API_KEY` in Environment Variables
4. Deploy

### Railway / Render / Fly.io

1. Connect repository
2. Set environment variables
3. Deploy

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🔮 Future Improvements

- [ ] User accounts with cloud-synced history
- [ ] Scenario sharing via unique URLs
- [ ] Multi-language support
- [ ] Voice input for scenarios
- [ ] Export results as PDF/image
- [ ] Compare two scenarios side-by-side
- [ ] Community scenario library
- [ ] Advanced AI models (Claude, Gemini) as options
- [ ] Caching for repeated scenarios
- [ ] Rate limiting and usage analytics
- [ ] Dark/light theme toggle
- [ ] Scenario difficulty ratings

---

## 📚 Learning Outcomes

This project demonstrates:

- **Full-stack development** — Frontend + Backend separation
- **API Integration** — Secure proxy pattern for third-party APIs
- **AI Prompt Engineering** — Structured output, system prompts
- **Modern CSS** — Custom properties, Grid, Flexbox, Animations
- **Vanilla JS Architecture** — State management, event delegation, modules
- **Security Best Practices** — Environment variables, input validation
- **Accessibility** — Semantic HTML, ARIA, keyboard support
- **Responsive Design** — Mobile-first, progressive enhancement
- **Error Handling** — Graceful degradation, user-friendly messages
- **Project Organization** — Clean file structure, separation of concerns

---

## 🎓 Viva/Exam Preparation

### Problem Statement
> "Create an interactive web application that allows users to explore hypothetical scenarios through AI-powered analysis, presenting results in an educational and visually engaging format."

### Project Objective
> "Build a futuristic, responsive web application that demonstrates AI integration, modern frontend development, and secure backend practices — suitable for a first-year engineering AI project demonstration."

### How the Website Works
1. User enters a "What if?" question
2. Frontend validates and sends to backend API
3. Backend forwards to OpenAI with structured prompt
4. AI returns JSON with analysis
5. Frontend renders in interactive cards

### Where AI is Used
- **OpenAI GPT-4o-mini** via API
- **Backend-only** — API key never in frontend
- **Structured JSON output** — Guaranteed parseable format
- **Fallback mode** — Works without API key for demos

### Technologies Used
- HTML5, CSS3, JavaScript (ES6+)
- Node.js + Express.js
- OpenAI API
- CSS Custom Properties, Grid, Flexbox
- localStorage for history

### System Architecture
```
┌─────────────┐     POST /api/simulate     ┌─────────────┐
│   Browser   │ ─────────────────────────▶ │  Express    │
│  (Frontend) │ ◀───────────────────────── │  (Backend)  │
└─────────────┘       JSON Response        └──────┬──────┘
                                                   │
                                          ┌────────▼────────┐
                                          │   OpenAI API    │
                                          │  (GPT-4o-mini)  │
                                          └─────────────────┘
```

### Demonstration Flow
1. Open homepage → Show hero + examples
2. Click "What if humans could live on Mars?" → Auto-fills
3. Click Explore → Show loading animation
4. Results appear → Cards, indicators, timeline
5. Click category → Filter examples
6. Click Random → Surprise scenario
7. Show history panel → Previous searches
8. Mobile view → Responsive layout

### Likely Viva Questions & Answers

**Q: What is AI in your project?**
A: We use OpenAI's GPT-4o-mini model via API to analyze hypothetical scenarios and generate structured educational content (summary, impact, challenges, solutions, future timeline).

**Q: Why did you use an API instead of local AI?**
A: Local LLMs require significant computational resources (GPU, RAM) not available in typical student environments. API provides state-of-the-art models instantly with zero infrastructure.

**Q: Why is the API key kept in the backend?**
A: Security. If exposed in frontend JavaScript, anyone could steal the key and use it for their own purposes, incurring costs on our account. Backend acts as a secure proxy.

**Q: What technologies did you use?**
A: HTML5, CSS3, Vanilla JavaScript (ES6+), Node.js, Express.js, OpenAI API. No heavy frameworks — keeps code understandable for learning.

**Q: How does the user request reach the AI?**
A: User → Frontend (fetch POST) → Backend (Express route) → OpenAI API → Backend (validation) → Frontend (JSON) → UI Render

**Q: What happens if the AI does not respond?**
A: Backend catches errors (timeout, rate limit, invalid key) and returns a structured error. Frontend shows user-friendly message with retry button. Fallback mode provides demo responses without API key.

**Q: How do you handle structured output from AI?**
A: OpenAI's `response_format: { type: 'json_object' }` forces JSON. System prompt specifies exact schema. Backend validates required fields before sending to frontend.

**Q: How is the project accessible?**
A: Semantic HTML, ARIA labels, keyboard navigation, focus outlines, color contrast, reduced motion support, screen reader announcements for dynamic content.

---

## 📄 License

MIT License — Feel free to use for learning, modify, and share.

---

## 🙏 Acknowledgments

- OpenAI for the API
- Google Fonts (Space Grotesk, Inter)
- Inspiration from modern AI startup landing pages
- First-year engineering curriculum guidance

---

**Built with ❤️ as a first-year engineering AI project**