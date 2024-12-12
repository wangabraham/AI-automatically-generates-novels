// theme-switcher.js
class EnhancedStyleSwitcher {
    constructor() {
        this.themes = this.initializeThemes();
        this.layouts = this.initializeLayouts();
        this.currentTheme = 'elegant';
        this.currentLayout = 'grid';
        this.textAreas = [];
        this.menuOpen = false;
        this.activeTextArea = null;
        this.animationsEnabled = true;
        this.init();
    }

    init() {
        this.createSwitcher();
        this.initializeTextAreas();
        this.initializeResizeObserver();
        this.loadSavedSettings();
    }

    initializeThemes() {
        return {
            elegant: {
                vars: {
                    '--primary-color': '#2196F3',
                    '--secondary-color': '#1976D2',
                    '--accent-color': '#00BCD4',
                    '--bg-light': '#E3F2FD',
                    '--bg-dark': '#BBDEFB',
                    '--text-color': '#333',
                    '--text-secondary': '#666',
                    '--border-color': '#BBDEFB',
                    '--shadow': '0 4px 12px rgba(33, 150, 243, 0.1)',
                    '--shadow-hover': '0 8px 24px rgba(33, 150, 243, 0.2)',
                    '--transition': 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }
            },
            apple: {
                vars: {
                    '--primary-color': '#000000',
                    '--secondary-color': '#333333',
                    '--accent-color': '#666666',
                    '--bg-light': '#ffffff',
                    '--bg-dark': '#f5f5f7',
                    '--text-color': '#1d1d1f',
                    '--text-secondary': '#86868b',
                    '--border-color': '#d2d2d7',
                    '--shadow': '0 2px 8px rgba(0, 0, 0, 0.05)',
                    '--shadow-hover': '0 4px 16px rgba(0, 0, 0, 0.1)',
                    '--transition': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }
            },
            dark: {
                vars: {
                    '--primary-color': '#455A64',
                    '--secondary-color': '#263238',
                    '--accent-color': '#607D8B',
                    '--bg-light': '#37474F',
                    '--bg-dark': '#263238',
                    '--text-color': '#ECEFF1',
                    '--text-secondary': '#B0BEC5',
                    '--border-color': '#546E7A',
                    '--shadow': '0 4px 12px rgba(0, 0, 0, 0.3)',
                    '--shadow-hover': '0 8px 24px rgba(0, 0, 0, 0.4)',
                    '--transition': 'all 0.3s ease'
                }
            },
            nature: {
                vars: {
                    '--primary-color': '#4CAF50',
                    '--secondary-color': '#388E3C',
                    '--accent-color': '#8BC34A',
                    '--bg-light': '#E8F5E9',
                    '--bg-dark': '#C8E6C9',
                    '--text-color': '#1B5E20',
                    '--text-secondary': '#2E7D32',
                    '--border-color': '#A5D6A7',
                    '--shadow': '0 4px 12px rgba(76, 175, 80, 0.1)',
                    '--shadow-hover': '0 8px 24px rgba(76, 175, 80, 0.2)',
                    '--transition': 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }
            },
            sunset: {
                vars: {
                    '--primary-color': '#FF9800',
                    '--secondary-color': '#F57C00',
                    '--accent-color': '#FFB74D',
                    '--bg-light': '#FFF3E0',
                    '--bg-dark': '#FFE0B2',
                    '--text-color': '#E65100',
                    '--text-secondary': '#EF6C00',
                    '--border-color': '#FFCC80',
                    '--shadow': '0 4px 12px rgba(255, 152, 0, 0.1)',
                    '--shadow-hover': '0 8px 24px rgba(255, 152, 0, 0.2)',
                    '--transition': 'all 0.3s ease-in-out'
                }
            }
        };
    }

    initializeLayouts() {
        return {
            grid: {
                containerStyle: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px',
                    padding: '20px',
                    width: '100%',
                    boxSizing: 'border-box'
                }
            },
            apple: {
                containerStyle: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '30px',
                    padding: '30px',
                    width: '100%',
                    boxSizing: 'border-box',
                    background: '#f5f5f7'
                }
            },
            masonry: {
                containerStyle: {
                    columnCount: 'auto',
                    columnWidth: '350px',
                    columnGap: '20px',
                    padding: '20px',
                    width: '100%',
                    boxSizing: 'border-box'
                }
            },
            centered: {
                containerStyle: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px',
                    padding: '20px',
                    width: '100%',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    boxSizing: 'border-box'
                }
            }
        };
    }

    createSwitcher() {
        const switcher = document.createElement('div');
        switcher.className = 'enhanced-theme-switcher';
        
        const switcherHTML = `
            <div class="theme-ball">
                <div class="theme-text">主题切换</div>
                <div class="theme-menu">
                    <div class="menu-section">
                        <h3>主题风格</h3>
                        <button class="theme-btn" data-theme="elegant">优雅蓝</button>
                        <button class="theme-btn" data-theme="apple">苹果白</button>
                        <button class="theme-btn" data-theme="dark">冷峻黑</button>
                        <button class="theme-btn" data-theme="nature">自然绿</button>
                        <button class="theme-btn" data-theme="sunset">夕阳橙</button>
                    </div>
                    <div class="menu-section">
                        <h3>布局方式</h3>
                        <button class="layout-btn" data-layout="grid">网格</button>
                        <button class="layout-btn" data-layout="apple">苹果</button>
                        <button class="layout-btn" data-layout="masonry">瀑布</button>
                        <button class="layout-btn" data-layout="centered">居中</button>
                    </div>
                    <div class="menu-section">
                        <h3>编辑模式</h3>
                        <button class="edit-btn" id="toggleFocus">专注模式</button>
                        <button class="edit-btn" id="toggleAutoCenter">自动居中</button>
                    </div>
                    <div class="menu-section">
                        <h3>其他设置</h3>
                        <button class="edit-btn" id="resetData">清除数据</button>
                        <button class="edit-btn" id="toggleAnimations">动画开关</button>
                    </div>
                </div>
            </div>
        `;

        switcher.innerHTML = switcherHTML;
        this.addSwitcherStyles();
        document.body.appendChild(switcher);
        
        this.initializeButtons(switcher);
        this.initializeDragging(switcher);
        this.initializeMenuBehavior(switcher);
    }

    addSwitcherStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            .enhanced-theme-switcher {
                position: fixed !important;
                right: 15% !important;
                bottom: 15% !important;
                z-index: 9999;
                pointer-events: auto;
                touch-action: none;
                user-select: none;
            }

            .theme-ball {
                width: 60px;
                height: 60px;
                background: var(--primary-color);
                border-radius: 30px;
                cursor: pointer;
                box-shadow: var(--shadow);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .theme-ball:hover {
                width: 120px;
                border-radius: 30px;
            }

            .theme-text {
                color: white;
                font-size: 14px;
                white-space: nowrap;
                opacity: 0;
                transition: opacity 0.3s;
            }

            .theme-ball:hover .theme-text {
                opacity: 1;
            }

            .theme-menu {
                position: absolute;
                bottom: 100%;
                right: 0;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 20px;
                margin-bottom: 15px;
                box-shadow: var(--shadow);
                display: none;
                flex-direction: column;
                gap: 15px;
                min-width: 250px;
                transform-origin: bottom right;
                animation: dynamicIslandShow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            @keyframes dynamicIslandShow {
                from {
                    transform: scale(0.9);
                    opacity: 0;
                }
                to {
                    transform: scale(1);
                    opacity: 1;
                }
            }

            .text-area {
                width: 100%;
                resize: vertical;
                border: none;
                background: var(--bg-light);
                color: var(--text-color);
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 16px;
                line-height: 1.6;
                padding: 20px;
                border-radius: 14px;
                box-shadow: var(--shadow);
                transition: var(--transition);
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
                height: 150px;
                min-height: 100px;
                margin: 0;
                box-sizing: border-box;
                display: block;
            }

            .text-area:focus {
                outline: none;
                box-shadow: var(--shadow-hover);
            }

            .menu-section {
                border-bottom: 1px solid var(--border-color);
                padding-bottom: 15px;
            }

            .menu-section:last-child {
                border-bottom: none;
                padding-bottom: 0;
            }

            .menu-section h3 {
                color: var(--text-secondary);
                font-size: 14px;
                margin: 0 0 10px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .menu-section h3::before {
                content: '';
                width: 4px;
                height: 14px;
                background: var(--primary-color);
                border-radius: 2px;
            }

            .theme-btn, .layout-btn, .edit-btn {
                width: 100%;
                padding: 12px;
                border: none;
                border-radius: 10px;
                background: var(--bg-light);
                color: var(--text-color);
                font-weight: 500;
                cursor: pointer;
                transition: var(--transition);
                text-align: left;
                display: flex;
                align-items: center;
                justify-content: space-between;
                position: relative;
                overflow: hidden;
            }

            .theme-btn:hover, .layout-btn:hover, .edit-btn:hover {
                background: var(--bg-dark);
                transform: translateX(5px);
            }

            .active-mode {
                background: var(--primary-color) !important;
                color: white !important;
            }

            .focus-mode .text-area:not(:focus) {
                opacity: 0.5;
            }

            .focus-mode .text-area:focus {
                position: fixed !important;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 80%;
                max-width: 600px;
                height: 60vh;
                z-index: 1000;
            }

            .overlay {
                display: none;
                position: fixed !important;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 999;
                backdrop-filter: blur(3px);
            }

            .focus-mode .overlay.active {
                display: block;
            }

            .auto-center .text-area:focus {
                position: relative;
                margin: 20px auto;
                width: 80%;
                max-width: 600px;
            }

            .notification-container {
                position: fixed !important;
                top: 20px;
                right: 15% !important;
                z-index: 10000;
            }

            .notification {
                background: white;
                border-radius: 8px;
                box-shadow: var(--shadow);
                margin-bottom: 10px;
                transform-origin: top right;
                animation: notificationSlide 0.3s ease, notificationFade 0.3s ease 2.7s;
                padding: 12px 20px;
            }

            @keyframes notificationSlide {
                from { transform: translateX(100%); opacity: 0;
}
                to { transform: translateX(0); opacity: 1; }
            }

            @keyframes notificationFade {
                to { opacity: 0; transform: translateY(-10px); }
            }

            @media (max-width: 768px) {
                .theme-menu {
                    width: calc(100vw - 40px);
                    right: 20px;
                }

                .text-area {
                    font-size: 16px;
                }

                .focus-mode .text-area:focus {
                    width: 95%;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    initializeButtons(switcher) {
        // 主题按钮
        switcher.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.target.dataset.theme;
                this.applyTheme(theme);
            });
        });

        // 布局按钮
        switcher.querySelectorAll('.layout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const layout = e.target.dataset.layout;
                this.applyLayout(layout);
                this.updateActiveButtons('layout-btn', layout);
            });
        });

        // 功能按钮
        const focusBtn = switcher.querySelector('#toggleFocus');
        const autoCenterBtn = switcher.querySelector('#toggleAutoCenter');
        const resetBtn = switcher.querySelector('#resetData');
        const animationsBtn = switcher.querySelector('#toggleAnimations');
        
        focusBtn.addEventListener('click', () => this.toggleFocusMode());
        autoCenterBtn.addEventListener('click', () => this.toggleAutoCenter());
        resetBtn.addEventListener('click', () => this.resetAllData());
        animationsBtn.addEventListener('click', () => this.toggleAnimations());
    }

    initializeDragging(element) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        const dragStart = (e) => {
            if (e.target.closest('.theme-menu')) return;
            
            isDragging = true;
            
            if (e.type === "touchstart") {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
            } else {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
            }
        };

        const dragMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();

            let clientX, clientY;
            if (e.type === "touchmove") {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            currentX = clientX - initialX;
            currentY = clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            const maxX = window.innerWidth - element.offsetWidth;
            const maxY = window.innerHeight - element.offsetHeight;

            currentX = Math.min(Math.max(0, currentX), maxX);
            currentY = Math.min(Math.max(0, currentY), maxY);

            element.style.transform = `translate(${currentX}px, ${currentY}px)`;
        };

        const dragEnd = () => {
            isDragging = false;
            this.saveSwitcherPosition(element);
        };

        element.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);

        element.addEventListener('touchstart', dragStart, { passive: false });
        document.addEventListener('touchmove', dragMove, { passive: false });
        document.addEventListener('touchend', dragEnd);
    }

    initializeMenuBehavior(switcher) {
        const themeBall = switcher.querySelector('.theme-ball');
        const themeMenu = switcher.querySelector('.theme-menu');
        
        themeBall.addEventListener('click', (e) => {
            if (e.target.closest('.theme-menu')) return;
            this.menuOpen = !this.menuOpen;
            themeMenu.style.display = this.menuOpen ? 'flex' : 'none';
            if (this.menuOpen) {
                themeMenu.classList.add('show');
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.enhanced-theme-switcher')) {
                this.menuOpen = false;
                themeMenu.style.display = 'none';
            }
        });
    }

    initializeTextAreas() {
        this.textAreas = Array.from(document.querySelectorAll('.text-area'));
        this.textAreas.forEach(textArea => {
            this.setupTextArea(textArea);
        });

        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);
    }

    setupTextArea(textArea) {
        textArea.addEventListener('focus', () => {
            this.activeTextArea = textArea;
            textArea.style.boxShadow = 'var(--shadow-hover)';
            if (document.body.classList.contains('focus-mode')) {
                document.querySelector('.overlay').classList.add('active');
            }
        });

        textArea.addEventListener('blur', () => {
            this.activeTextArea = null;
            textArea.style.boxShadow = 'var(--shadow)';
            if (document.body.classList.contains('focus-mode')) {
                document.querySelector('.overlay').classList.remove('active');
            }
        });

        textArea.addEventListener('change', () => {
            this.saveTextAreaContent(textArea);
        });

        this.loadTextAreaContent(textArea);
    }

    applyTheme(themeName) {
        if (!this.themes[themeName]) return;

        const theme = this.themes[themeName];
        const root = document.documentElement;

        Object.entries(theme.vars).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        this.currentTheme = themeName;
        this.updateActiveButtons('theme-btn', themeName);
        this.saveSettings();
        this.showNotification(`主题已切换到: ${themeName}`, 'success');
    }

    applyLayout(layoutName) {
        if (!this.layouts[layoutName]) return;

        const layout = this.layouts[layoutName];
        const containers = document.querySelectorAll('.container');

        containers.forEach(container => {
            Object.assign(container.style, layout.containerStyle);
            
            const textAreas = container.querySelectorAll('.text-area');
            textAreas.forEach(textArea => {
                switch(layoutName) {
                    case 'grid':
                        textArea.style.height = '15px';
                        break;
                    case 'apple':
                        textArea.style.height = '150px';
                        break;
                    case 'masonry':
                        textArea.style.height = 'auto';
                        textArea.style.minHeight = '100px';
                        break;
                    case 'centered':
                        textArea.style.height = '200px';
                        textArea.style.maxWidth = '400px';
                        break;
                }
            });
        });

        this.currentLayout = layoutName;
        this.saveSettings();
        this.showNotification(`布局已切换到: ${layoutName}`, 'success');
    }

    toggleFocusMode() {
        const focusBtn = document.querySelector('#toggleFocus');
        const isFocusMode = document.body.classList.toggle('focus-mode');
        
        focusBtn.classList.toggle('active-mode');
        this.showNotification(`专注模式已${isFocusMode ? '开启' : '关闭'}`, 'info');
        this.saveSettings();
    }

    toggleAutoCenter() {
        const autoCenterBtn = document.querySelector('#toggleAutoCenter');
        const isAutoCenter = document.body.classList.toggle('auto-center');
        
        autoCenterBtn.classList.toggle('active-mode');
        this.showNotification(`自动居中已${isAutoCenter ? '开启' : '关闭'}`, 'info');
        this.saveSettings();
    }

    toggleAnimations() {
        this.animationsEnabled = !this.animationsEnabled;
        document.documentElement.style.setProperty('--transition', 
            this.animationsEnabled ? this.themes[this.currentTheme].vars['--transition'] : 'none');
        
        this.saveSettings();
        this.showNotification(`动画效果已${this.animationsEnabled ? '开启' : '关闭'}`, 'success');
    }

    updateActiveButtons(className, activeValue) {
        document.querySelectorAll(`.${className}`).forEach(btn => {
            btn.classList.remove('active-mode');
            if (btn.dataset.theme === activeValue || btn.dataset.layout === activeValue) {
                btn.classList.add('active-mode');
            }
        });
    }

    saveSettings() {
        const settings = {
            theme: this.currentTheme,
            layout: this.currentLayout,
            position: this.getSwitcherPosition(),
            focusMode: document.body.classList.contains('focus-mode'),
            autoCenter: document.body.classList.contains('auto-center'),
            animations: this.animationsEnabled
        };
        localStorage.setItem('theme-switcher-settings', JSON.stringify(settings));
    }

    loadSavedSettings() {
        const savedSettings = localStorage.getItem('theme-switcher-settings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            
            this.applyTheme(settings.theme);
            this.applyLayout(settings.layout);
            this.restoreSwitcherPosition(settings.position);
            
            if (settings.focusMode) {
                document.body.classList.add('focus-mode');
                document.querySelector('#toggleFocus').classList.add('active-mode');
            }
            
            if (settings.autoCenter) {
                document.body.classList.add('auto-center');
                document.querySelector('#toggleAutoCenter').classList.add('active-mode');
            }
            
            this.animationsEnabled = settings.animations ?? true;
            if (!this.animationsEnabled) {
                document.documentElement.style.setProperty('--transition', 'none');
            }
        }
    }

    initializeResizeObserver() {
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.target.classList.contains('text-area')) {
                    this.adjustTextAreaSize(entry.target);
                }
            }
        });

        this.textAreas.forEach(textArea => {
            resizeObserver.observe(textArea);
        });
    }

    adjustTextAreaSize(textArea) {
        if (document.body.classList.contains('auto-center') && textArea === this.activeTextArea) {
            const viewportHeight = window.innerHeight;
            const textAreaHeight = textArea.offsetHeight;
            textArea.style.marginTop = `${(viewportHeight - textAreaHeight) / 2}px`;
        } else {
            textArea.style.marginTop = '';
        }
    }

    getSwitcherPosition() {
        const switcher = document.querySelector('.enhanced-theme-switcher');
        const transform = switcher.style.transform;
        const matches = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
        return matches ? {
            x: parseFloat(matches[1]),
            y: parseFloat(matches[2])
        } : { x: 0, y: 0 };
    }

    saveSwitcherPosition(element) {
        const transform = element.style.transform;
        localStorage.setItem('theme-switcher-position', transform);
    }

    restoreSwitcherPosition(position) {
        const switcher = document.querySelector('.enhanced-theme-switcher');
        if (switcher) {
            const savedPosition = localStorage.getItem('theme-switcher-position');
            if (savedPosition) {
                switcher.style.transform = savedPosition;
            }
        }
    }

    saveTextAreaContent(textArea) {
        const id = textArea.id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
        if (!textArea.id) textArea.id = id;
        localStorage.setItem(`textarea-content-${id}`, textArea.value);
    }

    loadTextAreaContent(textArea) {
        const id = textArea.id;
        if (id) {
            const savedContent = localStorage.getItem(`textarea-content-${id}`);
            if (savedContent) {
                textArea.value = savedContent;
            }
        }
    }

    resetAllData() {
        if (confirm('确定要清除所有本地存储的数据吗？此操作不可撤销。')) {
            localStorage.clear();
            this.showNotification('所有数据已清除，页面将在3秒后刷新...', 'success');
            setTimeout(() => window.location.reload(), 3000);
        }
    }

    showNotification(message, type = 'info') {
        if (!document.querySelector('.notification-container')) {
            const container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
            </div>
        `;

        document.querySelector('.notification-container').appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

// 初始化主题切换器
document.addEventListener('DOMContentLoaded', () => {
    const styleSwitcher = new EnhancedStyleSwitcher();
});
