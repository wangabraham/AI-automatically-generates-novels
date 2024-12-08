// book-splitter-enhanced.js

class BookSplitter {
    constructor() {
        this.createFloatingBall();
        this.createModal();
        this.bindEvents();
        this.initializeFromStorage();
        // Enhanced chapter pattern matching
        this.splitPattern = new RegExp(
            '(?:^|\\n)(?:' + 
            '第[0-9一二三四五六七八九十百千万零]+[章节回]\\s*[:：]?.*|' + // 第X章/节/回
            '章节[0-9]+.*|' + // 章节X
            '###第[0-9一二三四五六七八九十百千万零]+章.*###|' + // ###第X章###
            '.*第[0-9一二三四五六七八九十百千万零]+章.*|' + // 任意字符第X章
            '章节[一二三四五六七八九十百千万零]+.*' + // 章节一/二/三
            ')',
            'gm'
        );
        this.chapters = [];
        this.maxRetries = 3;
    }

    createFloatingBall() {
        const ball = document.createElement('div');
        ball.id = 'floating-ball';
        ball.innerHTML = '拆书';
        ball.style.cssText = `
            position: fixed;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            width: 60px;
            height: 60px;
            background: #1a73e8;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 9999;
            user-select: none;
            transition: background-color 0.3s;
        `;
        document.body.appendChild(ball);
        this.makeDraggable(ball);
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'book-splitter-modal';
        modal.innerHTML = `
            <div class="splitter-content">
                <h2>拆书工具</h2>
                <div class="splitter-buttons">
                    <input type="file" id="book-file" accept=".txt" style="display: none">
                    <button id="import-book">导入文本</button>
                    <button id="start-split">开始分割</button>
                    <button id="split-all">全部拆书</button>
                    <button id="export-data">导出数据</button>
                    <button id="clear-data">清除数据</button>
                </div>
                <div class="prompt-section">
                    <h3>拆书提示词</h3>
                    <textarea id="split-prompt" rows="4" placeholder="输入拆书提示词...">请分析这一章节的内容，提供以下信息：
1. 章节主要情节概述
2. 重要人物及其行为
3. 关键场景描写
4. 情节发展和转折点
5. 与整体故事的关联</textarea>
                </div>
                <div class="loading-indicator" style="display: none;">
                    <div class="spinner"></div>
                    <span class="loading-text">处理中...</span>
                </div>
                <div id="chapters-container">
                    <div class="chapters-scroll">
                    </div>
                </div>
                <div id="status-message" class="status-message"></div>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            #book-splitter-modal {
                display: none;
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 20px rgba(0,0,0,0.2);
                z-index: 9998;
                width: 800px;
                height: 600px;
                overflow: hidden;
            }
            .splitter-content {
                height: 100%;
                display: flex;
                flex-direction: column;
            }
            .splitter-buttons {
                margin: 20px 0;
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }
            .splitter-buttons button {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                background: #1a73e8;
                color: white;
                cursor: pointer;
                transition: background 0.3s;
            }
            .splitter-buttons button:hover {
                background: #1557b0;
            }
            #chapters-container {
                flex: 1;
                overflow: hidden;
                position: relative;
            }
            .chapters-scroll {
                height: 100%;
                overflow-y: auto;
                padding-right: 10px;
            }
            .chapter-container {
                margin: 10px 0;
                border: 1px solid #ddd;
                border-radius: 4px;
                transition: all 0.3s;
            }
            .chapter-header {
                padding: 10px;
                background: #f5f5f5;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .chapter-content {
                padding: 10px;
                display: none;
                transition: all 0.3s;
            }
            .chapter-content.show {
                display: block;
            }
            #split-prompt {
                width: 100%;
                margin: 10px 0;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                resize: vertical;
            }
            .chapter-textarea {
                width: 100%;
                min-height: 100px;
                margin: 10px 0;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                resize: vertical;
            }
            .analysis-content {
                width: 100%;
                min-height: 100px;
                margin: 10px 0;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                background: #f9f9f9;
            }
            .loading-indicator {
                text-align: center;
                margin: 10px 0;
            }
            .spinner {
                width: 30px;
                height: 30px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #1a73e8;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto;
            }
            .status-message {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 10px 20px;
                border-radius: 4px;
                background: rgba(0,0,0,0.8);
                color: white;
                display: none;
                z-index: 10000;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .retry-button {
                background: #dc3545 !important;
                margin-left: 10px;
            }
            .success {
                background: #28a745 !important;
            }
            .error {
                background: #dc3545 !important;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(modal);
    }

    showStatus(message, type = 'info') {
        const status = document.getElementById('status-message');
        status.textContent = message;
        status.className = `status-message ${type}`;
        status.style.display = 'block';
        setTimeout(() => {
            status.style.display = 'none';
        }, 3000);
    }

    initializeFromStorage() {
        try {
            const savedData = localStorage.getItem('bookSplitterData');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.chapters = data.chapters || [];
                document.getElementById('split-prompt').value = data.prompt || '';
                this.renderSavedChapters();
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }

    saveToStorage() {
        try {
            const data = {
                chapters: this.chapters,
                prompt: document.getElementById('split-prompt').value
            };
            localStorage.setItem('bookSplitterData', JSON.stringify(data));
            this.showStatus('数据已保存', 'success');
        } catch (error) {
            this.showStatus('保存数据失败', 'error');
        }
    }

    async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    async splitBook(content) {
        const chaptersContainer = document.querySelector('.chapters-scroll');
        chaptersContainer.innerHTML = '';
        this.chapters = [];

        // 使用正则表达式找到所有章节标题
        const matches = content.match(this.splitPattern);
        if (!matches) {
            this.showStatus('未找到任何章节', 'error');
            return;
        }

        // 获取每章节的内容
        for (let i = 0; i < matches.length; i++) {
            const title = matches[i].trim();
            const nextTitle = matches[i + 1];
            let chapterContent = '';

            if (nextTitle) {
                const startIndex = content.indexOf(title) + title.length;
                const endIndex = content.indexOf(nextTitle);
                chapterContent = content.substring(startIndex, endIndex).trim();
            } else {
                const startIndex = content.indexOf(title) + title.length;
                chapterContent = content.substring(startIndex).trim();
            }

            this.chapters.push({
                title,
                content: chapterContent,
                analysis: ''
            });

            await this.createChapterElement(title, chapterContent, this.chapters.length - 1);
            this.showStatus(`已处理 ${this.chapters.length} 章`, 'success');
        }

        this.saveToStorage();
    }

    async createChapterElement(title, content, index) {
        const container = document.createElement('div');
        container.className = 'chapter-container';
        container.innerHTML = `
            <div class="chapter-header">
                <span>${title}</span>
                <span class="toggle-icon">▼</span>
            </div>
            <div class="chapter-content">
                <textarea class="chapter-textarea" readonly>${content}</textarea>
                <button class="analyze-chapter">拆解本章</button>
                <button class="retry-chapter retry-button" style="display: none;">重试</button>
                <div class="analysis-content" style="display: none;"></div>
            </div>
        `;

        document.querySelector('.chapters-scroll').appendChild(container);

        const header = container.querySelector('.chapter-header');
        const content_div = container.querySelector('.chapter-content');
        const analyzeBtn = container.querySelector('.analyze-chapter');
        const retryBtn = container.querySelector('.retry-chapter');

        header.addEventListener('click', () => {
            content_div.classList.toggle('show');
            header.querySelector('.toggle-icon').textContent = 
                content_div.classList.contains('show') ? '▼' : '▶';
        });

        analyzeBtn.addEventListener('click', () => this.analyzeChapter(container, index));
        retryBtn.addEventListener('click', () => this.analyzeChapter(container, index, true));

        return new Promise(resolve => setTimeout(resolve, 100)); // 添加延迟以实现动画效果
    }

    async analyzeChapter(container, index, isRetry = false, retryCount = 0) {
        const prompt = document.getElementById('split-prompt').value;
        const content = this.chapters[index].content;
        const title = this.chapters[index].title;
        const analysisContent = container.querySelector('.analysis-content');
        const analyzeBtn = container.querySelector('.analyze-chapter');
        const retryBtn = container.querySelector('.retry-chapter');

        analyzeBtn.disabled = true;
        analysisContent.style.display = 'block';
        analysisContent.textContent = '正在分析...';

        try {
            const response = await fetch('/gen', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: `${prompt}\n\n章节标题：${title}\n\n章节内容：${content}`
                })
            });

            if (!response.ok) throw new Error('分析请求失败');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let analysisText = '';

            while (true) {
                const {value, done} = await reader.read();
                if (done) break;
                
                analysisText += decoder.decode(value, {stream: true});
                analysisContent.textContent = analysisText;
            }

            this.chapters[index].analysis = analysisText;
            this.saveToStorage();
            analyzeBtn.disabled = false;
            retryBtn.style.display = 'none';
            this.showStatus('分析完成', 'success');

        } catch (error) {
            console.error('Analysis failed:', error);
            if (retryCount < this.maxRetries) {
                analysisContent.textContent = `分析失败，已重试 ${retryCount + 1}/${this.maxRetries} 次...`;
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this.analyzeChapter(container, index, true, retryCount + 1);
            } else {
                analysisContent.textContent = '分析失败';
                analyzeBtn.disabled = false;
                retryBtn.style.display = 'inline-block';
                this.showStatus('分析失败，请重试', 'error');
            }
        }
    }

    async analyzeAllChapters() {
        const chaptersCount = this.chapters.length;
        for (let i = 0; i < chaptersCount; i++) {
            const container = document.querySelectorAll('.chapter-container')[i];
            this.showStatus(`正在分析第 ${i + 1}/${chaptersCount} 章`, 'info');
            await this.analyzeChapter(container, i);
        }
        this.showStatus('全部分析完成', 'success');
    }

    exportData() {
        const data = {
		prompt: document.getElementById('split-prompt').value,
            chapters: this.chapters
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'book-analysis.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showStatus('数据导出成功', 'success');
    }

    clearData() {
        if (confirm('确定要清除所有数据吗？此操作不可恢复。')) {
            localStorage.removeItem('bookSplitterData');
            this.chapters = [];
            document.querySelector('.chapters-scroll').innerHTML = '';
            document.getElementById('split-prompt').value = '';
            this.showStatus('数据已清除', 'success');
        }
    }

    makeDraggable(element) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        element.addEventListener('mousedown', (e) => {
            isDragging = true;
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;

                // 限制在窗口范围内
                const maxX = window.innerWidth - element.offsetWidth;
                const maxY = window.innerHeight - element.offsetHeight;
                const x = Math.max(0, Math.min(maxX, e.clientX - element.offsetWidth / 2));
                const y = Math.max(0, Math.min(maxY, e.clientY - element.offsetHeight / 2));

                element.style.left = `${x}px`;
                element.style.top = `${y}px`;
                element.style.right = 'auto';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // 防止文本选择
        element.addEventListener('dragstart', (e) => e.preventDefault());
    }

    async renderSavedChapters() {
        const chaptersContainer = document.querySelector('.chapters-scroll');
        chaptersContainer.innerHTML = '';
        for (let i = 0; i < this.chapters.length; i++) {
            const chapter = this.chapters[i];
            await this.createChapterElement(chapter.title, chapter.content, i);
            const container = document.querySelectorAll('.chapter-container')[i];
            const analysisContent = container.querySelector('.analysis-content');
            if (chapter.analysis) {
                analysisContent.style.display = 'block';
                analysisContent.textContent = chapter.analysis;
            }
        }
    }

    bindEvents() {
        const ball = document.getElementById('floating-ball');
        const modal = document.getElementById('book-splitter-modal');

        ball.addEventListener('click', () => {
            modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
        });

        document.getElementById('import-book').addEventListener('click', () => {
            document.getElementById('book-file').click();
        });

        document.getElementById('book-file').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 20 * 1024 * 1024) {
                this.showStatus('文件大小不能超过20MB', 'error');
                return;
            }

            try {
                const content = await this.readFile(file);
                this.showStatus('文件导入成功，正在分析章节...', 'info');
                await this.splitBook(content);
            } catch (error) {
                this.showStatus('文件读取失败', 'error');
                console.error('File reading error:', error);
            }
        });

        document.getElementById('start-split').addEventListener('click', async () => {
            if (this.chapters.length === 0) {
                this.showStatus('请先导入文本文件', 'error');
                return;
            }
            await this.splitBook(this.bookContent);
        });

        document.getElementById('split-all').addEventListener('click', async () => {
            if (this.chapters.length === 0) {
                this.showStatus('请先导入并分割文本', 'error');
                return;
            }
            await this.analyzeAllChapters();
        });

        document.getElementById('export-data').addEventListener('click', () => {
            if (this.chapters.length === 0) {
                this.showStatus('没有可导出的数据', 'error');
                return;
            }
            this.exportData();
        });

        document.getElementById('clear-data').addEventListener('click', () => {
            this.clearData();
        });

        // 关闭模态框
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // 自动保存提示词更改
        document.getElementById('split-prompt').addEventListener('input', () => {
            this.saveToStorage();
        });

        // 防止意外关闭
        window.addEventListener('beforeunload', (e) => {
            if (this.chapters.length > 0) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }
}

// 初始化拆书工具
document.addEventListener('DOMContentLoaded', () => {
    window.bookSplitter = new BookSplitter();
});
