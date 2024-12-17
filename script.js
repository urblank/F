// 豆包 AI 配置
const ARK_BASE_URL = 'http://lxhapi.peking.show/api/ark';
const ARK_MODEL_ID = 'ep-20241217183544-fz5kb';

// 全局变量
let chatContainer;
let userInput;
let chatHistory = [];
let isProcessing = false;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    chatContainer = document.getElementById('chatContainer');
    userInput = document.getElementById('userInput');

    // 监听输入框的回车事件
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 自动调整输入框高度
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // 添加欢迎消息
    addMessage("你好！我是F，有什么我可以帮你的吗？", 'ai');
});

// 发送消息
async function sendMessage() {
    if (isProcessing) return;
    
    const message = userInput.value.trim();
    if (!message) return;
    
    isProcessing = true;
    try {
        // 添加用户消息
        addMessage(message, 'user');
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // 显示加载状态
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'message ai-message';
        const aiContentDiv = document.createElement('div');
        aiContentDiv.className = 'message-content';
        aiContentDiv.textContent = '正在思考...';  // 添加加载提示
        aiMessageDiv.appendChild(aiContentDiv);
        chatContainer.appendChild(aiMessageDiv);
        
        // 检查服务器连接
        try {
            const response = await fetch(`${ARK_BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: ARK_MODEL_ID,
                    messages: [
                        {
                            role: "system",
                            content: "你是F，是由FF0000开发的 AI 人工智能助手."
                        },
                        ...chatHistory,
                        { role: "user", content: message }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`服务器响应错误 (${response.status})`);
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content;
            aiContentDiv.textContent = aiResponse;

            // 更新对话历史
            chatHistory.push(
                { role: "user", content: message },
                { role: "assistant", content: aiResponse }
            );

        } catch (error) {
            console.error('网络错误:', error);
            aiContentDiv.textContent = '抱歉，连接服务器失败。请检查服务器是否正在运行，或稍后重试。';
            aiContentDiv.style.color = '#ff4444';
        }

    } catch (error) {
        console.error('错误详情:', error);
        addMessage(`抱歉，发生了错误：${error.message}`, 'ai');
    } finally {
        isProcessing = false;
    }
}

// 添加消息到聊天界面
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;
    
    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 清空对话
function clearChat() {
    chatHistory = [];
    chatContainer.innerHTML = '';
    addMessage("对话已清空。有什么我可以帮你的吗？", 'ai');
}

// 作品集展示功能
function showPortfolio(id) {
    alert(`作品 ${id} 的详情将在这里展示`);
}

// 平滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
}); 