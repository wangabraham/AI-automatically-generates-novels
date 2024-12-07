// prompt-editor-extended.js

class PromptEditor {
    static currentOperation = null;
    static currentTarget = null;

    static init() {
        // 添加HTML和样式
        if (!document.getElementById('prompt-editor-modal')) {
            document.body.insertAdjacentHTML('beforeend', `
                <div id="prompt-editor-modal" class="prompt-editor-modal">
                    <div class="prompt-editor-content">
                        <div class="prompt-editor-header">
                            <h3>编辑提示词</h3>
                            <span id="operation-type"></span>
                            <button class="close-button" onclick="PromptEditor.close()">&times;</button>
                        </div>
                        <div class="prompt-editor-body">
                            <div class="editor-section">
                                <label>提示词模板:</label>
                                <div id="prompt-template" class="readonly-text"></div>
                            </div>
                            <div class="editor-section">
                                <label>变量值:</label>
                                <div id="variable-values" class="readonly-text"></div>
                            </div>
                            <div class="editor-section">
                                <label>最终提示词:</label>
                                <textarea id="final-prompt" class="editable-prompt"></textarea>
                            </div>
                        </div>
                        <div class="prompt-editor-footer">
                            <button onclick="PromptEditor.sendToGen()">发送到AI</button>
                            <button onclick="PromptEditor.close()">取消</button>
                        </div>
                    </div>
                </div>
            `);

            document.head.insertAdjacentHTML('beforeend', `
                <style>
                    .prompt-editor-modal {
                        display: none;
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgba(0, 0, 0, 0.5);
                        z-index: 1000;
                    }

                    .prompt-editor-content {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background-color: white;
                        padding: 20px;
                        border-radius: 8px;
                        width: 80%;
                        max-width: 800px;
                        max-height: 90vh;
                        overflow-y: auto;
                    }

                    #operation-type {
                        color: #666;
                        margin-left: 20px;
                    }

                    .editor-section {
                        margin-bottom: 20px;
                    }

                    .readonly-text {
                        padding: 10px;
                        background-color: #f5f5f5;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        min-height: 60px;
                        max-height: 150px;
                        overflow-y: auto;
                        white-space: pre-wrap;
                        font-family: monospace;
                    }

                    .editable-prompt {
                        width: 100%;
                        min-height: 200px;
                        padding: 10px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        font-family: monospace;
                        resize: vertical;
                    }

                    .prompt-editor-footer {
                        display: flex;
                        justify-content: flex-end;
                        gap: 10px;
                    }

                    .prompt-editor-footer button {
                        padding: 8px 16px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }

                    .prompt-editor-footer button:first-child {
                        background-color: #4CAF50;
                        color: white;
                    }

                    .prompt-editor-footer button:last-child {
                        background-color: #f44336;
                        color: white;
                    }
                </style>
            `);
        }

        // 修改现有的函数以使用编辑器
        this.setupEventHandlers();
    }

    static setupEventHandlers() {
        // 修改生成大纲函数
        window.generateOutline = function() {
            const promptTemplate = $('#outline-prompt').val();
            PromptEditor.showForOperation('generateOutline', '生成大纲', promptTemplate);
        };

        // 修改重写大纲函数
        window.regenerateOutline = function() {
            const promptTemplate = $('#outline-prompt').val();
            PromptEditor.showForOperation('regenerateOutline', '重写大纲', promptTemplate);
        };

        // 修改根据大纲生成章节函数
        window.generateChaptersFromOutline = function() {
            const promptTemplate = $('#chapter-prompt').val();
            PromptEditor.showForOperation('generateChapters', '生成章节', promptTemplate);
        };

        // 修改生成正文函数
        window.generateContent = function(button) {
            const promptTemplate = $('#content-prompt').val();
            PromptEditor.currentTarget = $(button).closest('.chapter-container');
            PromptEditor.showForOperation('generateContent', '生成正文', promptTemplate);
        };

        // 修改重写正文函数
        window.regenerateContent = function(button) {
            const promptTemplate = $('#content-prompt').val();
            PromptEditor.currentTarget = $(button).closest('.chapter-container');
            PromptEditor.showForOperation('regenerateContent', '重写正文', promptTemplate);
        };

        // 修改右键菜单处理函数
        window.handleContextMenuAction = function(item) {
            $('#context-menu').hide();
            PromptEditor.showForContextMenu(item);
        };
    }

    static showForOperation(operation, operationName, promptTemplate) {
        this.currentOperation = operation;
        document.getElementById('operation-type').textContent = operationName;
        
        // 获取所有需要的变量值
        const variables = {
            '${background}': $('#background').val(),
            '${characters}': $('#characters').val(),
            '${relationships}': $('#relationships').val(),
            '${plot}': $('#plot').val(),
            '${style}': $('#style').val(),
            '${outline}': $('#outline').val()
        };

        // 如果是章节相关操作，添加章节特定的变量
        if (operation.includes('Content')) {
            variables['${chapter_outline}'] = this.currentTarget.find('.chapter-outline').val();
        }

        this.show(promptTemplate, variables);
    }

    static showForContextMenu(item) {
        this.currentOperation = 'contextMenu';
        document.getElementById('operation-type').textContent = item.name;
        
        const variables = {
            '${selected_text}': window.selectedText,
            '${background}': $('#background').val(),
            '${characters}': $('#characters').val(),
            '${relationships}': $('#relationships').val(),
            '${plot}': $('#plot').val(),
            '${style}': $('#style').val(),
            '${outline}': $('#outline').val()
        };

        this.show(item.prompt, variables);
    }

    static show(promptTemplate, variables) {
        // 显示提示词模板
        document.getElementById('prompt-template').textContent = promptTemplate;
        
        // 显示变量值
        let variableText = '';
        for (const [key, value] of Object.entries(variables)) {
            variableText += `${key}:\n${value}\n\n`;
        }
        document.getElementById('variable-values').textContent = variableText;
        
        // 生成并显示最终提示词
        let finalPrompt = promptTemplate;
        for (const [key, value] of Object.entries(variables)) {
            finalPrompt = finalPrompt.replace(new RegExp(key.replace('$', '\\$'), 'g'), value || '');
        }
        
        document.getElementById('final-prompt').value = finalPrompt;
        document.getElementById('prompt-editor-modal').style.display = 'block';
    }

static async sendToGen() {
        const finalPrompt = document.getElementById('final-prompt').value;
        const operation = this.currentOperation;
        const target = this.currentTarget;
        
        // 立即关闭编辑器窗口
        this.close();
        
        try {
            const response = await fetch('/gen', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ prompt: finalPrompt })
            });

            // 根据不同操作处理响应
            switch (operation) {
                case 'generateOutline':
                case 'regenerateOutline':
                    await this.handleStreamResponse(response, $('#outline')[0]);
                    break;
                    
                case 'generateChapters':
                    await this.handleStreamResponse(response, $('#chapter-temp-content')[0]);
                    showTempContainer();
                    break;
                    
                case 'generateContent':
                case 'regenerateContent':
                    await this.handleStreamResponse(response, target.find('.chapter-content-text')[0]);
                    break;
                    
                case 'contextMenu':
                    // 显示预览框
                    $('#preview-modal').css('display', 'block');
                    $('#preview-content').text('正在生成内容...');
                    await this.handleStreamResponse(response, $('#preview-content')[0]);
                    break;
            }
            
            // 如果不是右键菜单操作,保存状态
            if (operation !== 'contextMenu') {
                saveState();
            }
            
        } catch (error) {
            alert('生成内容时出错：' + error.message);
        }
    }

    static async handleStreamResponse(response, targetElement) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const {value, done} = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, {stream: true});
            if (targetElement.tagName === 'DIV') {
                targetElement.textContent = buffer;
            } else {
                targetElement.value = buffer;
                targetElement.scrollTop = targetElement.scrollHeight;
            }
        }
    }

    static close() {
        document.getElementById('prompt-editor-modal').style.display = 'none';
        this.currentOperation = null;
        this.currentTarget = null;
    }
}

// 页面加载完成后初始化编辑器
document.addEventListener('DOMContentLoaded', () => PromptEditor.init());

// 导出PromptEditor类
window.PromptEditor = PromptEditor;
