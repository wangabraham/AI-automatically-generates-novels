// textarea-collapse.js

document.addEventListener('DOMContentLoaded', function() {
    // 为每个文本域创建折叠包装器
    function createCollapseWrapper(textarea) {
        // 获取原始textarea的属性
        const originalId = textarea.id;
        const originalClass = textarea.className;
        const label = textarea.previousElementSibling;
        const labelText = label ? label.textContent : originalId;
        
        // 创建包装器
        const wrapper = document.createElement('div');
        wrapper.className = 'textarea-collapse-wrapper';
        
        // 创建折叠按钮
        const collapseBtn = document.createElement('div');
        collapseBtn.className = 'textarea-collapse-btn';
        collapseBtn.innerHTML = `
            <span class="collapse-text">${labelText}</span>
            <span class="collapse-icon">▶</span>
        `;
        
        // 创建内容容器
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'textarea-content-wrapper collapsed';
        
        // 调整textarea的样式
        textarea.style.maxHeight = '350px';
        textarea.style.overflowY = 'auto';
        
        // 将textarea包装起来
        textarea.parentNode.insertBefore(wrapper, textarea);
        contentWrapper.appendChild(textarea);
        wrapper.appendChild(collapseBtn);
        wrapper.appendChild(contentWrapper);
        
        // 添加点击事件
        collapseBtn.addEventListener('click', function() {
            contentWrapper.classList.toggle('collapsed');
            collapseBtn.querySelector('.collapse-icon').textContent = 
                contentWrapper.classList.contains('collapsed') ? '▶' : '▼';
            
            // 保存折叠状态
            saveCollapseStates();
        });
        
        return wrapper;
    }
    
    // 添加必要的样式
    const style = document.createElement('style');
    style.textContent = `
        .textarea-collapse-wrapper {
            margin: 5px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        
        .textarea-collapse-btn {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background-color: #f5f5f5;
            cursor: pointer;
            user-select: none;
        }
        
        .textarea-collapse-btn:hover {
            background-color: #e8e8e8;
        }
        
        .collapse-text {
            font-weight: bold;
            color: #333;
        }
        
        .textarea-content-wrapper {
            max-height: 350px;
            overflow: hidden;
            transition: max-height 0.3s ease-out;
        }
        
        .textarea-content-wrapper.collapsed {
            max-height: 0;
        }
        
        .textarea-content-wrapper textarea {
            border-top: 1px solid #ddd;
            margin: 0;
            border-radius: 0 0 4px 4px;
            width: 100%;
            box-sizing: border-box;
            resize: vertical;
            min-height: 100px;
            max-height: 350px !important;
        }
        
        .textarea-content-wrapper textarea:focus {
            outline: none;
            border-color: #4a90e2;
        }
        
        /* 美化滚动条 */
        .textarea-content-wrapper textarea::-webkit-scrollbar {
            width: 8px;
        }
        
        .textarea-content-wrapper textarea::-webkit-scrollbar-track {
            background: #f1f1f1;
        }
        
        .textarea-content-wrapper textarea::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
        }
        
        .textarea-content-wrapper textarea::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
    `;
    document.head.appendChild(style);
    
    // 目标文本域配置
    const targetAreas = {
        basicSettings: [
            'background',
            'characters',
            'relationships',
            'plot',
            'style'
        ],
        promptSettings: [
            'outline-prompt',
            'chapter-prompt',
            'content-prompt'
        ],
        menuSettings: [
            'outline-menu-config',
            'chapter-menu-config',
            'content-menu-config'
        ]
    };
    
    // 为所有目标文本域添加折叠功能
    Object.values(targetAreas).flat().forEach(id => {
        const textarea = document.getElementById(id);
        if (textarea) {
            createCollapseWrapper(textarea);
        }
    });
    
    // 保存折叠状态到localStorage
    function saveCollapseStates() {
        const states = {};
        document.querySelectorAll('.textarea-collapse-wrapper').forEach(wrapper => {
            const textarea = wrapper.querySelector('textarea');
            if (textarea && textarea.id) {
                states[textarea.id] = wrapper.querySelector('.textarea-content-wrapper').classList.contains('collapsed');
            }
        });
        localStorage.setItem('textareaCollapseStates', JSON.stringify(states));
        
        if (typeof saveState === 'function') {
            saveState();
        }
    }
    
    // 加载折叠状态
    function loadCollapseStates() {
        try {
            const savedStates = JSON.parse(localStorage.getItem('textareaCollapseStates'));
            if (savedStates) {
                document.querySelectorAll('.textarea-collapse-wrapper').forEach(wrapper => {
                    const textarea = wrapper.querySelector('textarea');
                    const contentWrapper = wrapper.querySelector('.textarea-content-wrapper');
                    const collapseIcon = wrapper.querySelector('.collapse-icon');
                    
                    if (textarea && textarea.id && savedStates.hasOwnProperty(textarea.id)) {
                        if (savedStates[textarea.id]) {
                            contentWrapper.classList.add('collapsed');
                            collapseIcon.textContent = '▶';
                        } else {
                            contentWrapper.classList.remove('collapsed');
                            collapseIcon.textContent = '▼';
                        }
                    }
                });
            }
        } catch (e) {
            console.error('Failed to load collapse states:', e);
        }
    }
    
    // 初始化时加载状态
    loadCollapseStates();
    
    // 添加全局展开/折叠按钮
    const controlPanel = document.createElement('div');
    controlPanel.className = 'collapse-control-panel';
    controlPanel.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: white;
        padding: 5px;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        z-index: 1000;
    `;
    
    controlPanel.innerHTML = `
        <button onclick="expandAllTextareas()" style="margin-right: 5px;">展开全部</button>
        <button onclick="collapseAllTextareas()">折叠全部</button>
    `;
    
    document.body.appendChild(controlPanel);
    
    // 定义全局展开/折叠函数
    window.expandAllTextareas = function() {
        document.querySelectorAll('.textarea-content-wrapper').forEach(wrapper => {
            wrapper.classList.remove('collapsed');
            wrapper.previousElementSibling.querySelector('.collapse-icon').textContent = '▼';
        });
        saveCollapseStates();
    };
    
    window.collapseAllTextareas = function() {
        document.querySelectorAll('.textarea-content-wrapper').forEach(wrapper => {
            wrapper.classList.add('collapsed');
            wrapper.previousElementSibling.querySelector('.collapse-icon').textContent = '▶';
        });
        saveCollapseStates();
    };
    
    // 初始化时触发一次全部折叠
    window.collapseAllTextareas();
});
