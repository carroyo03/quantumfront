/**
 * QuantumCoach Frontend - Connected to Python Backend
 * Integrates with FastAPI backend for real portfolio optimization
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const API_BASE_URL = 'http://localhost:8000';  // Python backend

    // --- State Management ---
    let currentOnboardingSlide = 0;
    const totalOnboardingSlides = 3;
    let isDarkMode = false;
    let isBenchmarkActive = false;
    let isBackendConnected = false;

    // --- Fallback Asset Universe (used when backend is offline) ---
    const ASSET_UNIVERSE = {
        conservative: [
            { name: 'Iberdrola (IBE.MC)', weight: 45, color: '#14B8A6' },
            { name: 'Red Eléctrica (REE.MC)', weight: 25, color: '#0D9488' },
            { name: 'Bonos Tesoro ES', weight: 20, color: '#0F172A' },
            { name: 'Oro/Cash', weight: 10, color: '#64748B' }
        ],
        aggressive: [
            { name: 'Bitcoin (BTC)', weight: 20, color: '#F7931A' },
            { name: 'Nasdaq 100 (QQQ)', weight: 40, color: '#14B8A6' },
            { name: 'Inditex (ITX.MC)', weight: 25, color: '#0D9488' },
            { name: 'Solaria (SLR.MC)', weight: 15, color: '#0F172A' }
        ]
    };

    const GLOSSARY = {
        'qaoa': { title: 'QAOA', text: 'Quantum Approximate Optimization Algorithm. Un algoritmo híbrido que usa procesadores cuánticos para encontrar la combinación óptima de activos de forma más eficiente que un PC normal.' },
        'sharpe': { title: 'Ratio de Sharpe', text: 'Mide cuánta rentabilidad extra obtienes por cada unidad de riesgo. A mayor ratio, mejor es la gestión del riesgo de la cartera.' },
        'inflación': { title: 'Inflación', text: 'El aumento de los precios que hace que tu dinero valga menos. Nuestro objetivo es que tu rentabilidad sea siempre superior al IPC español.' },
        'ibex 35': { title: 'IBEX 35', text: 'El índice que agrupa a las 35 empresas con más liquidez que cotizan en la bolsa española.' },
        'var': { title: 'Value at Risk (VaR)', text: 'La pérdida máxima esperada en un período determinado con un nivel de confianza dado (ej: 95%).' },
        'volatilidad': { title: 'Volatilidad', text: 'Medida de las fluctuaciones en el precio de un activo. Mayor volatilidad = mayor riesgo.' }
    };

    // --- DOM Elements ---
    const onboardingModal = document.getElementById('onboarding-modal');
    const onboardingNextBtn = document.getElementById('onboarding-next');
    const onboardingSlides = document.querySelectorAll('.onboarding-slide');
    const onboardingDots = document.querySelectorAll('.dot');

    const welcomeScreen = document.getElementById('welcome-screen');
    const chatScreen = document.getElementById('chat-screen');
    const profileScreen = document.getElementById('profile-screen');
    const welcomeInput = document.getElementById('welcome-input');
    const welcomeSendBtn = document.getElementById('welcome-send');
    const shortcuts = document.querySelectorAll('.shortcut-btn');

    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');

    const navHome = document.getElementById('nav-home');
    const navChat = document.getElementById('nav-chat');
    const navProfile = document.getElementById('nav-profile');
    const navItems = document.querySelectorAll('.nav-item');

    const loadingOverlay = document.getElementById('loading-overlay');
    const newChatBtn = document.getElementById('new-chat-btn');
    const benchmarkToggleBtn = document.getElementById('benchmark-toggle-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings-modal');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    const chartModal = document.getElementById('chart-modal');
    const closeChartModal = document.getElementById('close-chart-modal');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabViews = document.querySelectorAll('.tab-view');

    const glossaryModal = document.getElementById('glossary-modal');
    const closeGlossaryBtn = document.getElementById('close-glossary-modal');
    const glossaryTitle = document.getElementById('glossary-title');
    const glossaryText = document.getElementById('glossary-text');

    const toast = document.getElementById('toast');

    // --- API Functions ---

    async function checkBackendConnection() {
        try {
            const response = await fetch(`${API_BASE_URL}/`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                isBackendConnected = true;
                console.log('✅ Backend conectado:', await response.json());
                showToast('Backend cuántico conectado');
                return true;
            }
        } catch (error) {
            console.warn('⚠️ Backend no disponible, usando modo offline:', error.message);
            isBackendConnected = false;
        }
        return false;
    }

    async function fetchFromBackend(endpoint, options = {}) {
        if (!isBackendConnected) {
            throw new Error('Backend not connected');
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return response.json();
    }

    async function sendChatMessage(message) {
        return fetchFromBackend('/api/chat', {
            method: 'POST',
            body: JSON.stringify({
                message: message,
                benchmark_active: isBenchmarkActive,
                language: 'es'
            })
        });
    }

    async function fetchMarketStatus() {
        try {
            const data = await fetchFromBackend('/api/market-status');
            updateMarketPulse(data);
        } catch (error) {
            // Fallback to random simulation
            simulateMarketPulse();
        }
    }

    function updateMarketPulse(data) {
        const pulse = document.getElementById('market-pulse');
        if (pulse) {
            const isUp = data.is_up;
            pulse.style.backgroundColor = isUp ? '#22C55E' : '#EF4444';
            pulse.style.boxShadow = `0 0 10px ${isUp ? '#22C55E' : '#EF4444'}`;
            pulse.title = `IBEX 35: ${data.change_percent > 0 ? '+' : ''}${data.change_percent}%`;
        }
    }

    function simulateMarketPulse() {
        const pulse = document.getElementById('market-pulse');
        if (pulse) {
            const isUp = Math.random() > 0.3;
            pulse.style.backgroundColor = isUp ? '#22C55E' : '#EF4444';
            pulse.style.boxShadow = `0 0 10px ${isUp ? '#22C55E' : '#EF4444'}`;
        }
    }

    // --- Interactions ---

    // Modal Tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabViews.forEach(v => v.classList.remove('active'));
            btn.classList.add('active');
            const viewId = btn.getAttribute('data-tab') + '-view';
            const view = document.getElementById(viewId);
            if (view) view.classList.add('active');
        });
    });

    // Shortcuts
    shortcuts.forEach(btn => {
        btn.addEventListener('click', () => {
            const query = btn.getAttribute('data-query');
            welcomeInput.value = query;
            startChatFromWelcome();
        });
    });

    // Benchmark Toggle
    benchmarkToggleBtn.addEventListener('click', () => {
        isBenchmarkActive = !isBenchmarkActive;
        benchmarkToggleBtn.classList.toggle('active', isBenchmarkActive);
        showToast(isBenchmarkActive ? "Benchmark Cuántico Activado" : "Benchmark Desactivado");
    });

    // Onboarding Next Button
    onboardingNextBtn.addEventListener('click', () => {
        if (currentOnboardingSlide < totalOnboardingSlides - 1) {
            currentOnboardingSlide++;
            updateOnboarding();
        } else {
            dismissOnboarding();
        }
    });

    // Skip Onboarding
    const skipOnboardingBtn = document.getElementById('skip-onboarding');
    skipOnboardingBtn?.addEventListener('click', () => {
        dismissOnboarding();
    });

    // Clickable dots for navigation
    onboardingDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentOnboardingSlide = index;
            updateOnboarding();
        });

        // Keyboard navigation for dots
        dot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                currentOnboardingSlide = index;
                updateOnboarding();
            }
        });
    });

    function dismissOnboarding() {
        onboardingModal.classList.remove('active');
        checkBackendConnection();
        // Save to localStorage so returning users don't see it again
        try {
            localStorage.setItem('quantumcoach_onboarded', 'true');
        } catch (e) {
            // localStorage might not be available
        }
    }

    function updateOnboarding() {
        // Update slides
        onboardingSlides.forEach((slide, idx) => {
            slide.classList.toggle('active', idx === currentOnboardingSlide);
        });

        // Update dots with ARIA states
        onboardingDots.forEach((dot, idx) => {
            const isActive = idx === currentOnboardingSlide;
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        // Update progress text
        const progressText = document.getElementById('onboarding-progress-text');
        if (progressText) {
            progressText.textContent = `${currentOnboardingSlide + 1} de ${totalOnboardingSlides}`;
        }

        // Update button text
        const nextBtnText = document.getElementById('next-btn-text');
        if (nextBtnText) {
            nextBtnText.textContent = currentOnboardingSlide === totalOnboardingSlides - 1
                ? 'Empezar a Optimizar'
                : 'Siguiente';
        }
    }

    // Check if user has already completed onboarding
    try {
        const hasOnboarded = localStorage.getItem('quantumcoach_onboarded');
        if (hasOnboarded === 'true') {
            onboardingModal.classList.remove('active');
            checkBackendConnection();
        }
    } catch (e) {
        // localStorage might not be available
    }

    // --- Navigation Logic ---
    function switchScreen(screenId) {
        // Hide all screens
        welcomeScreen.classList.add('hidden');
        chatScreen.classList.add('hidden');
        profileScreen.classList.add('hidden');

        // Show targets screen
        const target = document.getElementById(screenId);
        if (target) target.classList.remove('hidden');

        // Update Nav active state
        navItems.forEach(item => {
            const itemId = item.id.replace('nav-', '');
            const screenName = screenId.replace('-screen', '');
            item.classList.toggle('active', itemId === screenName);
        });
    }

    navHome?.addEventListener('click', () => switchScreen('welcome-screen'));
    navChat?.addEventListener('click', () => switchScreen('chat-screen'));
    navProfile?.addEventListener('click', () => switchScreen('profile-screen'));

    // Start Chat
    function startChatFromWelcome() {
        const text = welcomeInput.value.trim();
        if (text) {
            switchScreen('chat-screen');
            addMessage('user', text);
            processMessage(text);
            resetTextarea(welcomeInput, 'welcome-char-counter');
        }
    }

    // Character counter elements
    const welcomeCharCounter = document.getElementById('welcome-char-counter');
    const chatCharCounter = document.getElementById('chat-char-counter');
    const MAX_CHARS = 255;

    // Auto-expand textarea function
    function autoExpandTextarea(textarea) {
        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto';
        // Set height to scrollHeight (content height)
        const newHeight = Math.min(textarea.scrollHeight, 120); // max 120px
        textarea.style.height = newHeight + 'px';
    }

    // Update character counter
    function updateCharCounter(textarea, counterElement) {
        const length = textarea.value.length;
        const remaining = MAX_CHARS - length;

        if (counterElement) {
            counterElement.textContent = `${length}/${MAX_CHARS}`;

            // Update visual state
            counterElement.classList.remove('warning', 'limit');
            if (remaining <= 0) {
                counterElement.classList.add('limit');
            } else if (remaining <= 30) {
                counterElement.classList.add('warning');
            }
        }
    }

    // Reset textarea after sending
    function resetTextarea(textarea, counterId) {
        textarea.value = '';
        textarea.style.height = 'auto';
        const counter = document.getElementById(counterId);
        if (counter) {
            counter.textContent = '0/255';
            counter.classList.remove('warning', 'limit');
        }
    }

    // Welcome input handlers
    welcomeInput.addEventListener('input', () => {
        autoExpandTextarea(welcomeInput);
        updateCharCounter(welcomeInput, welcomeCharCounter);
    });

    welcomeInput.addEventListener('keydown', (e) => {
        // Submit on Enter (without Shift)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            startChatFromWelcome();
        }
        // Shift+Enter allows newline (default behavior)
    });

    welcomeSendBtn.addEventListener('click', startChatFromWelcome);

    // Chat input handlers
    chatInput.addEventListener('input', () => {
        autoExpandTextarea(chatInput);
        updateCharCounter(chatInput, chatCharCounter);
    });

    chatInput.addEventListener('keydown', (e) => {
        // Submit on Enter (without Shift)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const text = chatInput.value.trim();
            if (text) {
                addMessage('user', text);
                resetTextarea(chatInput, 'chat-char-counter');
                processMessage(text);
            }
        }
        // Shift+Enter allows newline (default behavior)
    });

    chatSendBtn.addEventListener('click', () => {
        const text = chatInput.value.trim();
        if (text) {
            addMessage('user', text);
            resetTextarea(chatInput, 'chat-char-counter');
            processMessage(text);
        }
    });

    // --- Core Logic ---

    function addMessage(type, content) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;

        if (typeof content === 'string') {
            // Round any decimals found in the text (e.g. 8.69% -> 9%, 0.98 -> 1)
            let processedText = content.replace(/(\d+\.\d+)(%?)/g, (match, num, percent) => {
                return Math.round(parseFloat(num)) + percent;
            });

            // Parse markdown-style formatting
            let html = parseMarkdown(processedText);

            // Auto-link glossary terms
            Object.keys(GLOSSARY).forEach(term => {
                const regex = new RegExp(`\\b(${term})\\b`, 'gi');
                html = html.replace(regex, `<span class="term-link" data-term="$1">$1</span>`);
            });

            msgDiv.innerHTML = html;

            // Add click listeners to terms
            msgDiv.querySelectorAll('.term-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    const term = e.target.getAttribute('data-term').toLowerCase();
                    const entry = GLOSSARY[term];
                    if (entry) {
                        glossaryTitle.innerText = entry.title;
                        glossaryText.innerText = entry.text;
                        glossaryModal.classList.add('active');
                    }
                });
            });
        } else {
            msgDiv.appendChild(content);
        }

        chatMessages.appendChild(msgDiv);

        // Scroll behavior: 'top' = scroll to show message top, 'bottom' = scroll to absolute bottom, 'none' = don't scroll
        // Default: user messages scroll to bottom, first bot message scrolls to top
        const scrollMode = arguments[2] || (type === 'bot' ? 'top' : 'bottom');

        if (scrollMode === 'top') {
            // Scroll so the message top is visible with some padding
            const messageTop = msgDiv.offsetTop - 20;
            chatMessages.scrollTo({ top: messageTop, behavior: 'smooth' });
        } else if (scrollMode === 'bottom') {
            chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
        }
        // 'none' = don't scroll

        return msgDiv;
    }

    function parseMarkdown(text) {
        // Convert markdown to HTML
        let html = text
            // Bold
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            // Headers
            .replace(/^### (.+)$/gm, '<h4>$1</h4>')
            .replace(/^## (.+)$/gm, '<h3>$1</h3>')
            // Line breaks
            .replace(/\n/g, '<br>')
            // Lists
            .replace(/^- (.+)/gm, '<li>$1</li>');

        // Wrap lists
        html = html.replace(/(<li>.+<\/li>)+/g, '<ul>$&</ul>');

        return `<p>${html}</p>`;
    }

    function showTyping() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator-container';
        typingDiv.style.marginBottom = '16px';
        typingDiv.innerHTML = `<div class="typing-indicator" style="display:inline-flex;"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div><span style="font-size: 12px; color: var(--text-muted); margin-left: 8px;">Coach Q está procesando en ${isBackendConnected ? 'QPU simulado' : 'modo offline'}…</span>`;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
        return typingDiv;
    }

    async function processMessage(text) {
        const typing = showTyping();

        try {
            if (isBackendConnected) {
                // Use real backend
                const response = await sendChatMessage(text);
                typing.remove();

                // Add bot message - this is the first one, so scroll to top
                addMessage('bot', response.message, 'top');

                // If portfolio data is available, show portfolio card - don't re-scroll
                if (response.portfolio) {
                    showPortfolioFromAPI(response.portfolio, 'none');
                }

                // Show suggested actions
                if (response.suggested_actions && response.suggested_actions.length > 0) {
                    showSuggestedActions(response.suggested_actions);
                }
            } else {
                // Fallback to offline mode
                await new Promise(r => setTimeout(r, isBenchmarkActive ? 2500 : 1500));
                typing.remove();
                processMessageOffline(text);
            }
        } catch (error) {
            typing.remove();
            console.error('Error processing message:', error);

            // Fallback to offline mode
            addMessage('bot', "⚠️ No puedo conectar con el servidor cuántico. Usando modo offline...");
            await new Promise(r => setTimeout(r, 500));
            processMessageOffline(text);
        }
    }

    function processMessageOffline(text) {
        const lowerText = text.toLowerCase();

        if (lowerText.includes('conservadora') || lowerText.includes('españa') || lowerText.includes('ibex') || lowerText.includes('seguro')) {
            addMessage('bot', "Mínima Varianza detectada. Aquí tienes tu distribución optimizada:", 'top');
            showPortfolioResponse('conservative', 'none');
        } else if (lowerText.includes('agresiva') || lowerText.includes('cripto') || lowerText.includes('tech') || lowerText.includes('arriesgada')) {
            addMessage('bot', "Máximo crecimiento calibrado. He detectado potencial en estos activos:", 'top');
            showPortfolioResponse('aggressive', 'none');
        } else if (lowerText.includes('inflación') || lowerText.includes('batir')) {
            addMessage('bot', "Para batir la inflación española actual, mi algoritmo sugiere una mezcla con activos reales y dividendos sólidos. He recalibrado el solver QAOA para maximizar el retorno real.", 'top');
            showPortfolioResponse('conservative', 'none');
        } else if (lowerText.includes('quién eres') || lowerText.includes('hola')) {
            addMessage('bot', "¡Hola! Soy Coach Q. Utilizo algoritmos cuánticos para optimizar tus ahorros desde 50€/mes. Haz clic en términos como QAOA o Ratio de Sharpe para aprender más.", 'top');
        } else {
            addMessage('bot', "Interesante. ¿Buscas seguridad en el IBEX 35 o prefieres la frontera eficiente con tecnológicas internacionales?", 'top');
        }
    }

    function showPortfolioFromAPI(portfolio, scrollMode = 'top') {
        const assets = portfolio.assets;
        const metrics = portfolio.metrics;
        const benchmark = portfolio.benchmark;

        const card = document.createElement('div');
        card.className = 'portfolio-card';

        // Benchmark comparison (if active)
        let benchmarkHtml = '';
        if (benchmark) {
            benchmarkHtml = `
                <div class="benchmark-badge">⚛️ Quantum Advantage: +${Math.round(benchmark.quantum_advantage)}%</div>
                <div class="benchmark-comparison">
                    <div class="comparison-item">
                        <span class="comparison-label">QAOA (Cuántico)</span>
                        <span class="comparison-value quantum">${Math.round(benchmark.qaoa_return)}%</span>
                    </div>
                    <div class="comparison-item">
                        <span class="comparison-label">CLÁSICO</span>
                        <span class="comparison-value classical">${Math.round(benchmark.classical_return)}%</span>
                    </div>
                    <div class="comparison-item time">
                        <span class="comparison-label">⏱ Tiempo</span>
                        <span class="comparison-value">${Math.round(benchmark.qaoa_time_ms)}ms vs ${Math.round(benchmark.classical_time_ms)}ms</span>
                    </div>
                </div>`;
        }

        // Asset table
        let tableHtml = `<table class="portfolio-table"><tbody>`;
        assets.forEach(a => {
            tableHtml += `<tr>
                <td><span class="asset-dot" style="background-color: ${a.color}"></span>${a.name}</td>
                <td><strong>${Math.round(a.weight)}%</strong></td>
            </tr>`;
        });
        tableHtml += `</tbody></table>`;

        // Metrics row
        const metricsHtml = `
            <div class="metrics-row">
                <div class="metric-card">
                    <span class="metric-value">+${Math.round(metrics.expected_return)}%</span>
                    <span class="metric-label">Rentabilidad</span>
                </div>
                <div class="metric-card">
                    <span class="metric-value">${Math.round(metrics.volatility)}%</span>
                    <span class="metric-label">Volatilidad</span>
                </div>
                <div class="metric-card">
                    <span class="metric-value">${Math.round(metrics.sharpe_ratio)}</span>
                    <span class="metric-label">Sharpe</span>
                </div>
                <div class="metric-card">
                    <span class="metric-value">${Math.round(metrics.var_95)}%</span>
                    <span class="metric-label">VaR 95%</span>
                </div>
            </div>`;

        // Chart
        const canvasId = `chart-${Math.random().toString(36).substr(2, 5)}`;

        card.innerHTML = `
            ${benchmarkHtml}
            ${tableHtml}
            ${metricsHtml}
            <div class="chart-container" style="height:160px;">
                <canvas id="${canvasId}"></canvas>
            </div>
            <p class="disclaimer-text">${portfolio.disclaimer}</p>`;

        addMessage('bot', card, scrollMode);

        // Render chart
        setTimeout(() => {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: assets.map(a => a.name),
                    datasets: [{
                        data: assets.map(a => Math.round(a.weight)),
                        backgroundColor: assets.map(a => a.color),
                        borderWidth: 2,
                        borderColor: isDarkMode ? '#1E293B' : '#ffffff'
                    }]
                },
                options: {
                    cutout: '70%',
                    plugins: {
                        legend: { display: false }
                    },
                    maintainAspectRatio: false
                }
            });
        }, 100);

        // Click to expand chart
        card.querySelector('.chart-container').addEventListener('click', () => {
            openChartModal(assets, metrics.expected_return);
        });
    }

    function showSuggestedActions(actions) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'suggested-actions';

        actions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = 'action-btn';
            btn.textContent = action;
            btn.addEventListener('click', () => {
                addMessage('user', action);
                processMessage(action);
                actionsDiv.remove();
            });
            actionsDiv.appendChild(btn);
        });

        chatMessages.appendChild(actionsDiv);
        // Note: Don't scroll here - let the initial bot message control scroll position
    }

    function showPortfolioResponse(type, scrollMode = 'top') {
        const assets = ASSET_UNIVERSE[type];
        const metrics = type === 'conservative'
            ? { ret: '5.2', risk: 'Bajo', sharpe: '1.4', volatility: '12.5', var95: '-2.1' }
            : { ret: '21.4', risk: 'Alto', sharpe: '0.9', volatility: '35.2', var95: '-15.3' };

        // Message is now handled in processMessageOffline to ensure proper sequence
        // addMessage('bot', ...);

        const card = document.createElement('div');
        card.className = 'portfolio-card';

        let benchmarkHtml = '';
        if (isBenchmarkActive) {
            const classicalValue = type === 'conservative' ? '5%' : '17%';
            const quantumAdvantage = type === 'conservative' ? '8' : '24';
            benchmarkHtml = `
                <div class="benchmark-badge">⚛️ Quantum Advantage: +${quantumAdvantage}%</div>
                <div class="benchmark-comparison">
                    <div class="comparison-item">
                        <span class="comparison-label">QAOA (Cuántico)</span>
                        <span class="comparison-value quantum">${metrics.ret}%</span>
                    </div>
                    <div class="comparison-item">
                        <span class="comparison-label">CLÁSICO</span>
                        <span class="comparison-value classical">${classicalValue}</span>
                    </div>
                </div>`;
        }

        let tableHtml = `<table class="portfolio-table"><tbody>`;
        assets.forEach(a => tableHtml += `<tr><td><span class="asset-dot" style="background-color: ${a.color}"></span>${a.name}</td><td><strong>${Math.round(a.weight)}%</strong></td></tr>`);
        tableHtml += `</tbody></table>`;

        const canvasId = `chart-${Math.random().toString(36).substr(2, 5)}`;
        card.innerHTML = `${benchmarkHtml}${tableHtml}
            <div class="metrics-row">
                <div class="metric-card">
                    <span class="metric-value">+${Math.round(parseFloat(metrics.ret))}%</span>
                    <span class="metric-label">Rent</span>
                </div>
                <div class="metric-card">
                    <span class="metric-value">${Math.round(parseFloat(metrics.volatility))}%</span>
                    <span class="metric-label">Volatilidad</span>
                </div>
                <div class="metric-card">
                    <span class="metric-value">${Math.round(parseFloat(metrics.sharpe))}</span>
                    <span class="metric-label">Sharpe</span>
                </div>
            </div>
            <div class="chart-container" style="height:140px;"><canvas id="${canvasId}"></canvas></div>
            <p class="disclaimer-text">⚠️ Esto NO es asesoramiento financiero. Herramienta educativa.</p>`;

        addMessage('bot', card, scrollMode);

        setTimeout(() => {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: assets.map(a => a.name),
                    datasets: [{
                        data: assets.map(a => Math.round(a.weight)),
                        backgroundColor: assets.map(a => a.color),
                        borderWidth: 0
                    }]
                },
                options: {
                    cutout: '75%',
                    plugins: { legend: { display: false } },
                    maintainAspectRatio: false
                }
            });
        }, 100);

        card.querySelector('.chart-container').addEventListener('click', () => openChartModal(type, assets, metrics.ret));
    }

    let modalChartInstance = null;
    let projectionChartInstance = null;

    function openChartModal(assetsOrType, assetsData, annualRetRaw) {
        const assets = typeof assetsOrType === 'string' ? ASSET_UNIVERSE[assetsOrType] : assetsOrType;
        const annualRet = parseFloat(annualRetRaw || (typeof assetsOrType !== 'string' ? assetsData : 5));

        chartModal.classList.add('active');

        // Distribution Chart
        const ctxD = document.getElementById('modal-chart').getContext('2d');
        if (modalChartInstance) modalChartInstance.destroy();
        modalChartInstance = new Chart(ctxD, {
            type: 'pie',
            data: {
                labels: assets.map(a => a.name),
                datasets: [{
                    data: assets.map(a => a.weight),
                    backgroundColor: assets.map(a => a.color),
                    borderWidth: 2,
                    borderColor: isDarkMode ? '#1E293B' : '#ffffff'
                }]
            },
            options: {
                plugins: { legend: { position: 'bottom' } },
                maintainAspectRatio: false
            }
        });

        // Projection Chart
        const ctxP = document.getElementById('projection-chart').getContext('2d');
        if (projectionChartInstance) projectionChartInstance.destroy();

        const monthlyInversion = 100;
        const years = 5;
        const labels = Array.from({ length: years + 1 }, (_, i) => `Año ${i}`);

        const quantumData = [monthlyInversion * 12];
        const bankData = [monthlyInversion * 12];
        const rQ = annualRet / 100;
        const rB = 0.005;

        for (let i = 1; i <= years; i++) {
            quantumData.push((quantumData[i - 1] + (monthlyInversion * 12)) * (1 + rQ));
            bankData.push((bankData[i - 1] + (monthlyInversion * 12)) * (1 + rB));
        }

        projectionChartInstance = new Chart(ctxP, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Quantum Coach',
                        data: quantumData,
                        borderColor: '#14B8A6',
                        backgroundColor: 'rgba(20, 184, 166, 0.1)',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Cuenta Ahorro Banco',
                        data: bankData,
                        borderColor: '#64748B',
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.1
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
                scales: { y: { ticks: { callback: v => v.toLocaleString() + '€' } } }
            }
        });

        const diff = Math.round(quantumData[years] - bankData[years]);
        const summary = document.getElementById('projection-summary');
        if (summary) {
            summary.innerHTML = `En 5 años, con <strong>100€/mes</strong>, tendrías aproximadamente <strong>${diff.toLocaleString()}€ más</strong> usando Coach Q frente a un banco tradicional.`;
        }
    }

    // Modal Closers
    if (closeChartModal) {
        closeChartModal.addEventListener('click', () => chartModal.classList.remove('active'));
    }
    chartModal?.addEventListener('click', (e) => {
        if (e.target === chartModal) chartModal.classList.remove('active');
    });

    closeGlossaryBtn?.addEventListener('click', () => glossaryModal.classList.remove('active'));
    glossaryModal?.addEventListener('click', (e) => {
        if (e.target === glossaryModal) glossaryModal.classList.remove('active');
    });

    settingsBtn?.addEventListener('click', () => settingsModal.classList.add('active'));
    closeSettingsBtn?.addEventListener('click', () => settingsModal.classList.remove('active'));
    settingsModal?.addEventListener('click', (e) => {
        if (e.target === settingsModal) settingsModal.classList.remove('active');
    });

    newChatBtn?.addEventListener('click', () => {
        loadingOverlay.classList.remove('hidden');
        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
            chatMessages.innerHTML = '';
            addMessage('bot', `Sensores listos. ${isBackendConnected ? '🟢 Conectado al QPU simulado.' : '🔴 Modo offline activo.'} ¿Qué optimizamos hoy?`);
        }, 1000);
    });

    darkModeToggle?.addEventListener('change', () => {
        isDarkMode = darkModeToggle.checked;
        document.body.classList.toggle('dark-mode', isDarkMode);
    });

    function showToast(message) {
        const toastMsg = document.getElementById('toast-message');
        if (toastMsg) toastMsg.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // Market Pulse - fetch from backend or simulate
    setInterval(() => {
        if (isBackendConnected) {
            fetchMarketStatus();
        } else {
            simulateMarketPulse();
        }
    }, 5000);

    // --- Profile Logic ---
    const profileUpload = document.getElementById('profile-upload');
    const profileImgDisplay = document.getElementById('profile-img-display');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Handle photo upload simulation
    profileUpload?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target.result;
                // Update all avatar instances
                document.querySelectorAll('img[alt="Avatar"], #profile-img-display').forEach(img => {
                    img.src = dataUrl;
                });
                showToast("Foto de perfil actualizada ✨");
            };
            reader.readAsDataURL(file);
        }
    });

    saveProfileBtn?.addEventListener('click', () => {
        showToast("Perfil guardado correctamente");
        closeProfile();
    });

    logoutBtn?.addEventListener('click', () => {
        if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
            localStorage.removeItem('quantumcoach_onboarded');
            location.reload();
        }
    });

    // Initial backend check
    checkBackendConnection();
});
