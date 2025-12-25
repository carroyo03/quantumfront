# QuantumCoach - Quantum Portfolio Optimizer

A full-stack application that combines a beautiful mobile-first frontend with a Python FastAPI backend for quantum portfolio optimization. Designed for Spanish Gen Z retail investors.

## 🏗️ Architecture

```
optimizer/
├── index.html          # Frontend - Mobile-first chat UI
├── styles.css          # Styling with dark mode support
├── script.js           # Frontend logic with API integration
└── backend/
    ├── app.py          # FastAPI server
    └── requirements.txt
```

## 🚀 Quick Start

### Option 1: Full Stack (Recommended)

#### 1. Start the Python Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python app.py
```

The backend will run on `http://localhost:8000`

#### 2. Serve the Frontend

Open a new terminal:

```bash
# From the optimizer directory
python3 -m http.server 3000
```

Then open `http://localhost:3000` in your browser.

### Option 2: Frontend Only (Offline Mode)

If you just want to see the UI without the backend:

```bash
# Simply open index.html in a browser
open index.html

# Or serve it
python3 -m http.server 3000
```

The frontend will work in offline mode with simulated data.

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/api/profiles` | GET | Get available portfolio profiles |
| `/api/assets` | GET | Get available assets |
| `/api/chat` | POST | Main chat endpoint |
| `/api/optimize` | POST | Direct optimization API |
| `/api/market-status` | GET | Get market status |

### Example Chat Request

```bash
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Quiero una cartera conservadora", "benchmark_active": true}'
```

## 📊 Features

### Frontend
- 📱 **Mobile-first design** with device frame preview
- 🌙 **Dark mode** support
- 💬 **Chat interface** with typing indicators
- 📈 **Interactive charts** (pie charts, projections)
- 📖 **Glossary popup** for financial terms
- ⚡ **Offline fallback** when backend is unavailable

### Backend
- 🔬 **Simulated QAOA optimization** (ready for real quantum integration)
- 📊 **Portfolio profiles**: Conservative, Balanced, Growth, Aggressive
- 🇪🇸 **Spanish market focus**: IBEX 35, ETFs, Crypto
- 📉 **Real financial metrics**: Sharpe Ratio, VaR, Volatility
- 🆚 **Benchmark comparison**: QAOA vs Classical optimization

## 🔧 Connecting to Real Quantum Backend

The backend is designed to integrate with the actual quantum optimization engine from:
[github.com/carroyo03/quantum_portfolio_optimizer](https://github.com/carroyo03/quantum_portfolio_optimizer)

To integrate:

1. Clone the quantum_portfolio_optimizer repo
2. Import the quantum solver modules:
   ```python
   from src.optimization.quantum_solver import QuantumSolver, QAOAConfig
   from src.optimization.qubo_engine import QUBOEngine
   from src.data.data_engine import DataEngine
   ```
3. Replace `simulate_qaoa_optimization()` with real quantum calls

## 📋 Portfolio Profiles

| Profile | Risk Aversion | Focus |
|---------|---------------|-------|
| Conservador España | 0.8 | IBEX 35 + Bonds |
| Equilibrado Global | 0.5 | Global ETFs + Spain |
| Crecimiento Tech | 0.3 | US Tech + Global |
| Agresivo Crypto | 0.15 | Crypto + High Volatility |

## 🛡️ Disclaimer

⚠️ This is an **educational tool**, NOT financial advice. The optimization results are simulated and do not guarantee real-world returns. Always consult a qualified financial advisor before making investment decisions.

## 📚 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Chart.js
- **Backend**: Python 3.11+, FastAPI, Pydantic, Uvicorn
- **Design**: Mobile-first, Glassmorphism, Inter font

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | `#14B8A6` (Teal) |
| Primary Dark | `#0D9488` |
| Background Dark | `#0F172A` |
| Text Main | `#1E293B` |
| Border Radius | 16px / 24px |

## 📦 Dependencies

### Frontend
- Chart.js (CDN)
- Inter Font (Google Fonts)

### Backend
```
fastapi>=0.109.0
uvicorn>=0.27.0
pydantic>=2.5.0
```

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Submit a Pull Request

## 📄 License

MIT License - See LICENSE file

## 👤 Author

Based on the [QuantumCoach](https://github.com/carroyo03/quantum_portfolio_optimizer) project by carroyo03.
