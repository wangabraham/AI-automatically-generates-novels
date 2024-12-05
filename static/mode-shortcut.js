// 定义默认的快捷短语和评分提示词
const DEFAULT_SHORTCUTS = [
    "帮我生成补充",
    "增强情绪渲染——情绪+比喻/通感/夸张/反问/设问",
    "填充对话细节——常用人物+动作/神态+语言",
    "生成旁观者的5条犀利评论",
    "描写角色的表情细节和肢体动作",
    "丰富人物描写——人物+外貌/神态/动作+比喻/象征/夸张"
];

const DEFAULT_SCORE_PROMPTS = {
    outline: `请对以下章节细纲进行100分制评分，评分维度包括：
1. 情节连贯性 (20分)
2. 人物塑造 (20分)
3. 冲突设置 (20分)
4. 悬念铺垫 (20分)
5. 细节描写 (20分)

请给出详细的评分理由和改进建议。

章节细纲内容：
{content}`,
    
    content: `请对以下章节正文进行100分制评分，评分维度包括：
1. 文字流畅度 (20分)
2. 场景描写 (20分)
3. 人物刻画 (20分)
4. 情感表达 (20分)
5. 整体结构 (20分)

请给出详细的评分理由和改进建议。

章节正文内容：
{content}`
};

// 注入CSS样式
const styles = `
    /* 顶部按钮样式 */
    #mode-controls {
        display: flex;
        margin-right: 20px;
    }

    .mode-label {
        margin-right: 10px;
        color: #666;
    }

    .mode-switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 24px;
    }

    .mode-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .mode-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
        border-radius: 24px;
    }

    .mode-slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
    }

    input:checked + .mode-slider {
        background-color: #4CAF50;
    }

    input:checked + .mode-slider:before {
        transform: translateX(36px);
    }

    /* 快捷短语下拉框样式 */
    #shortcuts-dropdown {
        position: fixed;
        z-index: 1100;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        padding: 10px;
        min-width: 300px;
        max-height: 400px;
        overflow-y: auto;
    }

    #shortcuts-search {
        width: calc(100% - 20px);
        margin-bottom: 10px;
        padding: 5px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .shortcut-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
        border-bottom: 1px solid #eee;
        cursor: pointer;
    }

    .shortcut-item:hover {
        background-color: #f5f5f5;
    }

    .shortcut-text {
        flex-grow: 1;
        margin-right: 10px;
    }

    /* 预览框样式 */
    .preview-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1100;
        width: 80%;
        max-width: 800px;
        max-height: 80vh;
        display: none;
    }

    .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }

    .close-button {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        padding: 5px;
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 1050;
        display: none;
    }

    /* 使用说明样式 */
    .help-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1100;
        width: 80%;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        display: none;
    }

    .help-content {
        margin-top: 15px;
    }

    .help-section {
        margin-bottom: 20px;
    }

    .help-section h3 {
        color: #333;
        margin-bottom: 10px;
    }

    .help-list {
        padding-left: 20px;
    }

    .help-list li {
        margin-bottom: 5px;
    }

    /* 按钮样式 */
    .primary-button {
        background-color: #4CAF50;
        color: white;
        padding: 8px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .primary-button:hover {
        background-color: #45a049;
    }

    .secondary-button {
        background-color: #f5f5f5;
        color: #333;
        padding: 8px 15px;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .secondary-button:hover {
        background-color: #e8e8e8;
    }

    /* 简易模式样式 */
    .simple-mode .hide-in-simple {
        display: none !important;
    }

    .simple-mode .show-in-simple {
        display: block !important;
    }

    /* AI评分按钮样式 */
    .score-button {
        background-color: #2196F3;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
        margin-right: 5px;
    }

    .score-button:hover {
        background-color: #1976D2;
    }
`;

// 注入样式
const styleElement = document.createElement('style');
styleElement.textContent = styles;
document.head.appendChild(styleElement);
// 初始化页面元素
function initializeElements() {
    // 添加模式切换到配置按钮区域
    $('#config-buttons').prepend(`
        <div id="mode-controls">
            <span class="mode-label">编辑模式:</span>
            <label class="mode-switch">
                <input type="checkbox" id="mode-toggle">
                <span class="mode-slider"></span>
            </label>
            <span class="mode-label" id="mode-text">专业模式</span>
        </div>
    `);

    // 添加快捷短语下拉框
    if (!$('#shortcuts-dropdown').length) {
        $('body').append(`
            <div id="shortcuts-dropdown" style="display:none;">
                <input type="text" id="shortcuts-search" placeholder="搜索快捷短语...">
                <div id="shortcuts-list"></div>
                <div style="margin-top:10px;">
                    <input type="text" id="new-shortcut" placeholder="添加新的快捷短语" style="width:200px;">
                    <button id="add-shortcut" class="primary-button">添加</button>
                </div>
            </div>
        `);
    }

    // 添加使用说明模态框
    if (!$('.help-modal').length) {
        $('body').append(`
            <div class="modal-overlay"></div>
            <div class="help-modal">
                <div class="preview-header">
                    <h3>使用说明</h3>
                    <button class="close-button" onclick="closeHelpModal()">&times;</button>
                </div>
                <div class="help-content">
                    <div class="help-section">
                        <h3>快捷键</h3>
                        <ul class="help-list">
                            <li><strong>Shift + L</strong>: 打开快捷短语菜单</li>
                            <li><strong>Esc</strong>: 关闭当前窗口</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h3>简易模式特点</h3>
                        <ul class="help-list">
                            <li>专注于章节编写</li>
                            <li>支持细纲和正文编辑</li>
                            <li>保留右键增强功能</li>
                            <li>支持AI辅助评分</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h3>右键功能说明</h3>
                        <ul class="help-list">
                            <li>选中文本后右键可以使用增强功能</li>
                            <li>支持情感渲染、对话完善等</li>
                            <li>可以在配置中自定义右键菜单项</li>
                        </ul>
                    </div>
                </div>
            </div>
        `);
    }

    // 更新预览框添加关闭按钮
    const previewModal = $('#preview-modal');
    if (!previewModal.find('.preview-header').length) {
        previewModal.prepend(`
            <div class="preview-header">
                <button class="close-button" onclick="closePreviewModal()">&times;</button>
            </div>
        `);
    }
}

// 初始化快捷短语功能
function initializeShortcuts() {
    let shortcuts = JSON.parse(localStorage.getItem('shortcuts') || JSON.stringify(DEFAULT_SHORTCUTS));

    // 更新快捷短语列表
    function updateShortcutsList(searchTerm = '') {
        const list = $('#shortcuts-list');
        list.empty();

        const filteredShortcuts = shortcuts.filter(shortcut =>
            shortcut.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filteredShortcuts.forEach((shortcut, index) => {
            list.append(`
                <div class="shortcut-item">
                    <span class="shortcut-text">${shortcut}</span>
                    <button class="delete-shortcut" data-index="${index}">删除</button>
                </div>
            `);
        });

        localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
    }

    // 搜索功能
    $('#shortcuts-search').on('input', function() {
        updateShortcutsList($(this).val());
    });

    // 快捷键绑定
    $(document).on('keydown', function(e) {
        if (e.shiftKey && e.key.toLowerCase() === 'l') {
            const activeElement = document.activeElement;
            if (activeElement.tagName === 'TEXTAREA') {
                const dropdown = $('#shortcuts-dropdown');
                const rect = activeElement.getBoundingClientRect();

                // 保存当前文本框的选区
                window.currentTextarea = activeElement;
                window.currentSelectionStart = activeElement.selectionStart;
                window.currentSelectionEnd = activeElement.selectionEnd;

                dropdown.css({
                    top: (rect.bottom + window.scrollY) + 'px',
                    left: rect.left + 'px',
                    display: 'block'
                });

                $('#shortcuts-search').val('').focus();
                updateShortcutsList();
                e.preventDefault();
            }
        }
    });

    // 添加新快捷短语
    $('#add-shortcut').click(function() {
        const newShortcut = $('#new-shortcut').val().trim();
        if (newShortcut) {
            shortcuts.push(newShortcut);
            $('#new-shortcut').val('');
            updateShortcutsList();
        }
    });

    // 删除快捷短语
    $(document).on('click', '.delete-shortcut', function(e) {
        e.stopPropagation();
        const index = $(this).parent().index();
        if (confirm('确定要删除这个快捷短语吗？')) {
            shortcuts.splice(index, 1);
            updateShortcutsList($('#shortcuts-search').val());
        }
    });

    // 选择快捷短语
    $(document).on('click', '.shortcut-text', function() {
        const shortcut = $(this).text();
        if (window.currentTextarea) {
            const textarea = window.currentTextarea;
            const start = window.currentSelectionStart;
            const end = window.currentSelectionEnd;
            const text = textarea.value;

            textarea.value = text.substring(0, start) + shortcut + text.substring(end);
            textarea.selectionStart = start + shortcut.length;
            textarea.selectionEnd = start + shortcut.length;

            // 触发textarea的input事件
            $(textarea).trigger('input');
            textarea.focus();
        }
        $('#shortcuts-dropdown').hide();
    });
}

// 更新UI模式
function updateUIMode(isSimpleMode) {
    if (isSimpleMode) {
        $('body').addClass('simple-mode');
        $('#mode-text').text('简易模式');

        // 检查并创建默认章节
        if ($('.chapter-container').length === 0) {
            addChapterWithContent('新章节细纲', '', false);
        }

        // 隐藏非必要元素
        $('.settings-panel, #outline, #chapter-temp-container').addClass('hide-in-simple');
        $('.chapter-buttons button')
            .not(':contains("生成正文"), :contains("切换"), .score-button')
            .addClass('hide-in-simple');

        // 显示必要元素
        $('.chapter-header, .chapter-outline, .chapter-content-text').addClass('show-in-simple');

        // 显示使用说明
        showHelpModal();
    } else {
        $('body').removeClass('simple-mode');
        $('#mode-text').text('专业模式');
        $('.hide-in-simple, .show-in-simple').removeClass('hide-in-simple show-in-simple');
        $('.settings-panel, #outline, #chapter-temp-container').show();
        $('.chapter-buttons button').show();
    }

    localStorage.setItem('editorMode', isSimpleMode ? 'simple' : 'professional');
}

// 显示使用说明
function showHelpModal() {
    $('.modal-overlay, .help-modal').show();
}

// 关闭使用说明
function closeHelpModal() {
    $('.modal-overlay, .help-modal').hide();
}

// 关闭预览框
function closePreviewModal() {
    $('#preview-modal').hide();
}

// AI评分功能
async function getAIScore(content, type) {
    const savedPrompts = JSON.parse(localStorage.getItem('scorePrompts') || JSON.stringify(DEFAULT_SCORE_PROMPTS));
    const prompt = savedPrompts[type].replace('{content}', content);

    try {
        const response = await fetch('/gen', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({prompt})
        });

        const previewContent = $('#preview-content');
        const previewModal = $('#preview-modal');

        previewContent.text('正在评分...');
        previewModal.show();

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const {value, done} = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, {stream: true});
            previewContent.text(buffer);
        }
    } catch (error) {
        alert('评分过程中出错：' + error.message);
    }
}

// 更新右键菜单处理
function showContextMenu(e, config, target) {
    e.preventDefault();
    selectedText = window.getSelection().toString();
    if (!selectedText) return;

    currentTarget = target;
    const menu = $('#context-menu');
    menu.empty();

    try {
        const menuConfig = JSON.parse(config);
        menuConfig.menu.forEach(item => {
            const menuItem = $('<div class="context-menu-item"></div>')
                .text(item.name)
                .on('click', () => handleContextMenuAction(item));
            menu.append(menuItem);
        });

        menu.css({
            display: 'block',
            left: Math.min(e.pageX, window.innerWidth - menu.width() - 10) + 'px',
            top: Math.min(e.pageY, window.innerHeight - menu.height() - 10) + 'px'
        });

        // 点击其他地方关闭菜单
        const closeContextMenu = (e) => {
            if (!$(e.target).closest('#context-menu').length) {
                menu.hide();
                $(document).off('click', closeContextMenu);
            }
        };

        setTimeout(() => {
            $(document).on('click', closeContextMenu);
        }, 0);
    } catch (error) {
        console.error('解析菜单配置出错:', error);
    }
}

// 处理右键菜单动作
async function handleContextMenuAction(item) {
    $('#context-menu').hide();

    const previewModal = $('#preview-modal');
    $('#preview-content').text('正在生成内容...');
    previewModal.show();

    let prompt = item.prompt
        .replace('${selected_text}', selectedText)
        .replace('${background}', $('#background').val())
        .replace('${characters}', $('#characters').val())
        .replace('${relationships}', $('#relationships').val())
        .replace('${plot}', $('#plot').val())
        .replace('${style}', $('#style').val())
        .replace('${outline}', $('#outline').val());

    try {
        const response = await fetch('/gen', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ prompt })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const {value, done} = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, {stream: true});
            $('#preview-content').text(buffer);
        }
    } catch (error) {
        $('#preview-content').text('生成内容时出错：' + error.message);
    }
}

// 应用预览内容
function applyChanges() {
    const previewContent = $('#preview-content').text();
    if (currentTarget && selectedText) {
        const newContent = currentTarget.value.replace(selectedText, previewContent);
        currentTarget.value = newContent;

        // 触发input事件以保存更改
        $(currentTarget).trigger('input');

        // 保持光标位置
        const selectionStart = currentTarget.selectionStart;
        currentTarget.focus();
        currentTarget.setSelectionRange(selectionStart, selectionStart);
    }
    closePreviewModal();
}


// 页面初始化
$(document).ready(function() {
    initializeElements();
    initializeShortcuts();

    // 绑定模式切换事件
    $('#mode-toggle').on('change', function() {
        updateUIMode(this.checked);
    });

    // 绑定导入导出事件
    $('#exportBtn').click(exportConfig);
    $('#importBtn').click(importConfig);

    // 从localStorage恢复模式
    const savedMode = localStorage.getItem('editorMode') || 'professional';
    $('#mode-toggle').prop('checked', savedMode === 'simple');
    updateUIMode(savedMode === 'simple');

    // ESC键关闭所有弹窗
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape') {
            $('#shortcuts-dropdown, #preview-modal, .modal-overlay, .help-modal').hide();
        }
    });

    // 绑定预览框的应用和取消按钮
    $('.preview-modal').on('click', '.close-button', closePreviewModal);
    $('.preview-modal').find('.chapter-buttons').html(`
        <button onclick="applyChanges()" class="primary-button">应用</button>
        <button onclick="closePreviewModal()" class="secondary-button">取消</button>
    `);
});
