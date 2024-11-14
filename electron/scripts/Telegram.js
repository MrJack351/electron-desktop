function printElementEvery5Seconds() {
    setInterval(() => {
        const element = document.querySelector("#LeftColumn-main > div.NewChatButton");
        if (element) {
            window.electronAPI.sendMsg({platform:'Telegram',online: true,avatarUrl:'https://upload.wikimedia.org/wikipedia/commons/8/83/Telegram_2019_Logo.svg'}).then(res=>{
                // console.log('用户已登录：',res)
            })
        } else {
            window.electronAPI.sendMsg({platform:'Telegram',online: false,avatarUrl:''}).then(res=>{
                // console.log('用户未登录：',res)
            })
        }
    }, 5000); // 每隔5000毫秒（5秒）调用一次
}
// 调用函数
printElementEvery5Seconds();
let languages = []
//------------------------------------------新消息监听开始
//定义全局监听开关
let isGlobalObserverEnabled = false;
// 配置 MutationObserver 选项
const jtConfig = {
    childList: true, // 监听直接子节点的增删
    subtree: true    // 监听整个子树
};
// 检查当前页面是否在浏览（前台/后台）
function checkPageVisibility() {
    if (document.visibilityState === 'visible') {
        isGlobalObserverEnabled = false;
        console.log("页面正在被浏览（处于前台）");
        console.log(isGlobalObserverEnabled);
        // 你可以在这里触发其他逻辑，比如暂停定时器等
    } else {
        isGlobalObserverEnabled = true;
        console.log("页面未被浏览（处于后台）");
        console.log(isGlobalObserverEnabled);
        // 可以在这里添加后台时的逻辑，比如暂停视频、停止动画等
    }
}
// 监听 visibilitychange 事件
document.addEventListener("visibilitychange", checkPageVisibility);
// 初始化时检查一次页面状态
checkPageVisibility();
// 创建 MutationObserver 实例
const jtObserver = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            // 检查是否存在指定的元素
            const chatBadge = document.querySelector("div.ChatBadge.unread:not(.muted)");
            if (chatBadge) {
                if (isGlobalObserverEnabled) {
                    console.log(isGlobalObserverEnabled);
                    console.log("此处推送新消息通知代码:", chatBadge);
                    window.electronAPI.newMsgNotify({platform:'Telegram'})
                }

            }
        }
    }
});


function checkAndExecute() {
    const targetElement = document.querySelector("#LeftColumn-main > div.Transition > div > div");
    if (targetElement) {
        // 目标节点（替换成你需要监听的父节点）
        let jtTargetNode = document.querySelector("#LeftColumn-main > div.Transition > div > div"); // 替换成要监控的父元素
        // 开始观察目标节点
        if (jtTargetNode) {
            jtObserver.observe(jtTargetNode, jtConfig);
        } else {
            console.log("找不到目标节点");
        }
    } else {
        console.log("Element not found, retrying...");
        setTimeout(checkAndExecute, 1000); // 每隔1秒再次检查
    }
}
// 开始执行检测
checkAndExecute();


// ---------------------------------------------新消息监听代码段结束


// ---------------------------------------------监听键盘事件

(function() {
    let inputElement = null; // 保存当前的输入框元素

    // 监听输入框焦点状态和内容变化
    function checkInputFocusAndContent(inputElement) {
        // 监听焦点事件
        inputElement.addEventListener('focus', () => {
            console.log('输入框焦点获取');  // 当输入框获取焦点时打印信息
        });

        // 监听输入内容变化
        inputElement.addEventListener('input', (event) => {
            startMonitor();
            console.log('当前输入值:', event.target.textContent);  // 输出当前输入框的内容
        });

        // 监听失去焦点事件，失去焦点时移除监听器并重新等待焦点
        inputElement.addEventListener('blur', () => {
            console.log('输入框失去焦点');
            // 等待新的输入框获取焦点时重新启动监听
            waitForInputFocus();
        });
    }

    // 等待输入框获取焦点
    function waitForInputFocus() {
        const observer = new MutationObserver((mutationsList, observer) => {
            const newInputElement = document.querySelector('div[contenteditable="true"]'); // 查找页面中的输入框

            if (newInputElement && newInputElement !== inputElement) {
                inputElement = newInputElement; // 更新当前输入框元素
                checkInputFocusAndContent(inputElement);  // 给找到的输入框添加焦点和内容监听
                observer.disconnect();  // 停止观察，防止多次监听
            }
        });

        // 配置 MutationObserver，监听 DOM 树的变化（节点添加）
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // 初始启动等待输入框获取焦点
    waitForInputFocus();
})();
// ---------------------------------------------监听键盘事件结束



function observeNewMessages() {
    // 选择包含所有消息的父元素
    // const targetNode = document.querySelector('ul.chatlist');
    const targetNode = document.querySelector('div.chat-list');

    if (!targetNode) {
        console.log('无法找到消息列表父节点');
        return;
    }
    // 用于存储已经被监听的未读消息节点，防止重复监听
    const observedNodes = new Set();

    // MutationObserver 回调函数
    const callback = function(mutationsList, observer) {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                // 遍历新增的子节点
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        // 使用 `closest` 找到最近的 `a` 标签
                        const aTagNode = node.closest('a');
                        if (aTagNode) {
                            // console.log('aTagNode节点：', aTagNode);
                            const isMuted = aTagNode.classList.contains('is-muted'); // 判断是否是静音对话
                            // 如果没有静音类，表示这是未静音的消息
                            if (!isMuted) {
                                // 查找未读消息数的节点
                                const unreadBadge = aTagNode.querySelector('div.dialog-subtitle-badge-unread');
                                if (unreadBadge && !observedNodes.has(unreadBadge)) {
                                    // console.log('新的未读消息：',unreadBadge)
                                    // 添加对消息数量的监听，并防止重复监听
                                    observedNodes.add(unreadBadge);  // 记录已经监听的节点
                                    console.log('新的未读消息：',unreadBadge)
                                    // notify()
                                }
                            }
                        }
                    }
                });
            }
        }
    };

    // 创建 MutationObserver 实例
    const observer = new MutationObserver(callback);

    // 开始观察 `ul.chatlist` 节点的子节点变化
    observer.observe(targetNode, { childList: true, subtree: true });
}
monitorMainNode()
//初始化语言列表
function getLanguageList() {
    window.electronAPI.languageList().then((response) => {
        languages = response.data;
    })
}
// 该函数将在页面内执行，用于监听 #main 节点的加载和子节点变化
function monitorMainNode() {
    // 监听整个 body 的 DOM 变化，等待 #main 节点的出现
    const observer = new MutationObserver((mutationsList, observer) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                // 左侧会话列表节点
                // console.log("左侧会话列表节点")
                const mainNode = document.getElementById('LeftColumn-main');
                // console.log(mainNode)
                if (mainNode) {
                    // 停止对 body 的观察，避免不必要的性能开销
                    observer.disconnect();
                    // 开始监听 #main 节点的子节点变化
                    observePaneSide(mainNode);
                    removeLoadingNode()
                    getLanguageList()
                    // 调用主函数，开始观察
                    observeNewMessages();
                    //定时查找消息节点列表
                    setInterval(processMessageList,500)
                    break;
                }
            }
        }
    });
    // 开始观察 body 的子节点变化
    observer.observe(document.body, { childList: true, subtree: true });

    // 监听 pane-side 子节点的 aria-selected 变化
    function observePaneSide(paneSideNode) {
        setTimeout(()=>{
            removeLoadingNode()
            addTranslateButtonWithSelect()
            console.log('开始监听左侧消息会话节点变化：', paneSideNode);
        },3000)

        const observer = new MutationObserver((mutationsList) => {
            mutationsList.forEach(function(mutation) {
                // 判断是否是class属性的变化
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (mutation.target.tagName.toLowerCase() === 'a'){
                        if (mutation.target.classList.contains('active')) {
                            //左侧会话列表选中
                            addTranslateButtonWithSelect()
                        }
                    }
                }
            });
        });

        // const config = { childList: true, subtree: true };
        // 配置MutationObserver的选项
        const config = {
            attributes: true,      // 观察属性的变化
            childList: true,       // 观察子节点的添加或删除
            subtree: true,         // 观察目标节点及其后代节点
            attributeFilter: ['class']  // 只观察class属性的变化
        };
        // 监听 pane-side 节点
        observer.observe(paneSideNode, config);
    }

    // 处理消息列表翻译
    async function processMessageList() {
        let messageSpans = document.querySelectorAll("div.text-content.clearfix.with-meta:not([data-translate-status])");



        // 过滤：检查每个 span 是否位于 role="application" 的 div 之下
        let filteredSpans = Array.from(messageSpans).filter(span => {
            let parent = span.closest('div.messages-container'); // 查找最近的父级 div[role="application"]
            return parent !== null;  // 如果找到了，则保留该 span
        });

        // 先标记所有需要处理的消息为 'processing' 状态
        for (let span of filteredSpans) {
            markMessageAsProcessing(span);  // 立即标记并触发重绘
        }
        for (let span of filteredSpans) {
            // 异步调用翻译函数
            processMessageTranslation(span);  // 异步处理翻译
            new Promise(resolve => setTimeout(resolve, 500))
        }

    }

    // 标记消息为处理中，防止重复处理，确保立即生效
    function markMessageAsProcessing(span) {
        span.setAttribute('data-translate-status', 'processing');
        // 触发重新渲染，确保属性变更立即生效
        span.offsetHeight;  // 强制浏览器重新计算布局，确保属性更改立即生效
    }

    function generateTranslateNode(msg = '') {
        // 创建一个新的自定义元素
        let customElement = document.createElement('div');
        customElement.classList.add('custom-translate-node'); // 使用类名控制样式
        customElement.textContent = msg;

        // 动态添加样式
        let style = document.createElement('style');
        style.innerHTML = `
    .custom-translate-node {
        font-size: 12px;
        padding-top: 5px;
        padding-bottom: 12px;
        margin-top: 5px;
        border-top: 1px dashed #ccc;  /* 默认浅色模式的虚线 */
        display: block;
        opacity: 0;
        transform: translateX(0px); /* 初始左移 20px，防止超出容器太多 */
        animation: waveIn 1s ease forwards; /* 应用动画 */
        overflow: hidden; /* 确保动画不会超出当前组件的可视区域 */
    }

    /* 定义从左到右的动画 */
    @keyframes waveIn {
        0% {
            opacity: 0;
            transform: translateX(0px); /* 从左侧偏移 20px */
        }
        100% {
            opacity: 1;
            transform: translateX(0); /* 最终位置恢复到初始位置 */
        }
    }

    /* 浅色模式样式 */
    @media (prefers-color-scheme: light) {
        .custom-translate-node {
            color: blue;  /* 浅色模式字体颜色 */
            border-top: 1px dashed #ccc; /* 浅色模式下的边框 */
        }
    }

    /* 深色模式样式 */
    @media (prefers-color-scheme: dark) {
        .custom-translate-node {
            color: lightblue;  /* 深色模式字体颜色 */
            border-top: 1px dashed #444; /* 深色模式下的边框 */
        }
    }
`;
        document.head.appendChild(style);

        return customElement;
    }

    // 异步处理翻译逻辑
    async function processMessageTranslation(span) {
        let msg = undefined;
        let msgSpan = span.querySelector('span.translatable-message');
        if (msgSpan) {
            msg = msgSpan.textContent;
        }else {
            msg = Array.from(span.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE)  // 只保留文本节点
                .map(node => node.textContent.trim())              // 去除每个文本节点的多余空格
                .join('');
        }
        if (msg === '') return;  // 如果消息为空，直接退出
        // 插入加载中的节点
        let loadingNode = generateLoadingNode();
        operationNode('add',loadingNode,span)
        let translatedText = undefined;
        try {
            // 查询缓存中是否存在翻译结果
            let message = await getMessage(msg, getLocalLanguage());
            if (message) {
                translatedText = message.translatedText;
            } else {
                // 异步翻译消息
                translatedText = await translateText(msg, getLocalLanguage());
            }

            // 如果翻译结果为空，抛出错误
            if (!translatedText) {
                throw new Error("翻译结果为空");
            }

            // 移除加载中的节点
            operationNode('remove',loadingNode)

            // 标记该消息已翻译，并添加相关属性
            span.setAttribute('data-translate-status', 'Translated');
            span.setAttribute('data-language-type', getLocalLanguage());

            // 缓存翻译结果到数据库
            saveMessage(msg, translatedText, getLocalLanguage());

            // 插入翻译结果到页面
            let translationNode = generateTranslateNode(translatedText);
            operationNode('add',translationNode,span)

        } catch (error) {
            // 错误处理：移除加载中的节点
            operationNode('remove',loadingNode)

            // 错误处理：标记翻译失败，并提供反馈
            span.setAttribute('data-translate-status', 'failed');
        }
    }
}
function startMonitor() {
    // 获取可编辑的 div 消息输入框 元素
    // let editableDiv = document.querySelector('div[contenteditable="true"]')
    let editableDiv = document.querySelector('div[contenteditable="true"]')


    if (editableDiv) {
        // 确保只添加一次事件监听器，防止重复添加
        editableDiv.removeEventListener('keydown', handleKeydown, true);  // 先移除旧的监听器
        editableDiv.addEventListener('keydown', handleKeydown, true);  // 再添加新的监听器
    }
}
// 回车键监听函数
function handleKeydown(event) {
    let editableDiv = document.querySelector('div[contenteditable="true"]');
    if (event.key === 'Enter' && !event.shiftKey) {

        let loadingNode = document.getElementById('editDivLoadingNode');

        if (loadingNode) {
            console.log('消息正在处理:');
            // 阻止默认行为
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();  // 防止事件继续传递到插件
            return;
        }
        console.log('回车监听触发:');
        console.log(editableDiv.textContent);

        // 存储最终的内容
        let contents = '';
        // 遍历子节点，提取文本、表情符号和换行符
        editableDiv.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                // 如果是文本节点，直接添加文本内容
                contents += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'IMG' && node.classList.contains('emoji')) {
                // 如果是表情符号的图片标签，添加 alt 属性中的表情符号
                contents += node.alt;
            } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
                // 如果是 <br> 标签，添加换行符
                contents += '\n';
            }
        });

        // 输出结果
        console.log(contents);
        contents = contents.split('\n');
        console.log(contents)
        if (contents.length<=1) {
            let string = contents[0];
            if (string.trim() === '' || string.trim() === undefined) {
                console.log('消息为空:');
                // 阻止默认行为
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();  // 防止事件继续传递到插件
                return;
            }
        }
        // 显示加载中的节点
        loadingNode = generateLoadingNode();
        loadingNode.id = 'editDivLoadingNode';
        operationNode('add', loadingNode, editableDiv.parentNode);
        console.log('回车监听触发:',contents);
        console.log(typeof contents)

        getContentWithLineBreaks(contents).then(msgArr => {
            // 如果msgArr为空或者所有翻译内容都为空则不调用sendMsg
            if (msgArr.length > 0 && msgArr.some(item => item.translated)) {
                // 用换行符拼接翻译后的内容
                // editableDiv.textContent = msgArr
                editableDiv.innerText = msgArr
                    .map(item => item.translated)  // 提取 `translated` 字段
                    .filter(text => text !== null && text.trim() !== "")  // 过滤掉 null 值和空翻译
                    .join('\n');
                // const event = new Event('input', {
                //     bubbles: true,
                //     cancelable: true,
                //   });
                //   inputBox.dispatchEvent(event);
                const event = new Event('input', {
                    bubbles: true,
                    cancelable: true,
                });
                editableDiv.dispatchEvent(event)
                sendMsg();
            } else {
                console.warn('翻译结果为空，不发送消息。');
            }
            // 无论翻译是否成功，都移除loadingNode
            operationNode('remove', loadingNode);
        });

        // 阻止默认行为
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();  // 防止事件继续传递到插件
    }
}
//模拟发送消息
function sendMsg() {
    // 假设你要替换的按钮是发送按钮
    // let sendButton = document.querySelector('button.x1c4vz4f.x2lah0s.xdl72j9.xfect85.x1iy03kw.x1lfpgzf');
    let sendButton = document.querySelectorAll('button.Button.send.main-button.default.secondary.round.click-allowed')[0]
    let loadingNode = document.getElementById('editDivLoadingNode')
    if (loadingNode){
        loadingNode.remove()
    }
    if (sendButton) {
        sendButton.click();
    }else {
        console.log('发送按钮不存在！')
    }
}
//移除加载节点
function removeLoadingNode() {
    console.log('移除加载节点402')
    let loadingNode = document.getElementById('editDivLoadingNode');
    if (loadingNode) {
        loadingNode.remove();
    }
}
//添加翻译语言选项
function addTranslateButtonWithSelect() {
    // let btn = document.getElementById('customLanguageNode');
    // if (btn){
    //     return;
    // }
    // let targetNode = document.querySelector('.toggle-emoticons');NewChatButton
    // let targetNode = document.querySelector('button.Button.symbol-menu-button.default.translucent.round');

    let targetNode = document.querySelector('div.NewChatButton');
    console.log("targetNode")
    console.log(targetNode)


    if (!document.querySelector('div.NewChatButton')){
        console.log('目标按钮不存在：无法新增翻译按钮！')
        return;
    }

    targetNode.style.display = 'flex';
    targetNode.style.gap = '10px';


    // 创建样式
    const style = document.createElement('style');
    style.textContent = `
    .translate-btn {
        font-size: 16px;
        cursor: pointer;
        border: none;
        border-radius: 50%;
        color: #fff;
        transition: background-color 0.2s ease;
    }
    .custom-svg path {
        fill: gray;
        pointer-events: none;  /* 确保SVG不会阻挡点击 */
    }
    .select-box-popup {
        background-color: #3390EC; /* 设置背景颜色为 #3390EC */
        position: absolute;
        border: 1px solid #ccc;
        border-radius: 5px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        padding: 10px;
        background-color: #fff;
        width: 200px;
        display: none;
        z-index: 1000;
    }
    .select-box-popup.visible {
        display: block;
    }
    .select-box {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        margin-bottom: 10px;
        cursor: pointer;
        background-color: #f9f9f9;
    }
    .select-box:hover {
        background-color: #f0f0f0;
    }
    .language-list {
        display: none;
        position: absolute;
        background-color: #fff;
        border: 1px solid #ccc;
        border-radius: 5px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        max-height: 150px;
        overflow-y: auto;
        z-index: 1001;
    }
    .language-list.visible {
        display: block;
    }
    .language-option {
        padding: 8px;
        cursor: pointer;
    }
    .language-option:hover {
        background-color: #f0f0f0;
    }

    /* 浅色模式 */
    @media (prefers-color-scheme: light) {
        .select-box-popup {
            background-color: #fff;
            color: #000;
            border: 1px solid #ccc;
        }
        .select-box {
            background-color: #f9f9f9;
            color: #000;
        }
        .select-box:hover {
            background-color: #f0f0f0;
        }
        .language-list {
            background-color: #fff;
            color: #000;
        }
        .language-option:hover {
            background-color: #f0f0f0;
        }
    }

    /* 深色模式 */
    @media (prefers-color-scheme: dark) {
        .select-box-popup {
            background-color: #333;
            color: #fff;
            border: 1px solid #555;
        }
        .select-box {
            background-color: #444;
            color: #fff;
        }
        .select-box:hover {
            background-color: #555;
        }
        .language-list {
            background-color: #444;
            color: #fff;
        }
        .language-option:hover {
            background-color: #555;
        }
        .custom-svg path {
            fill: lightgray;
            pointer-events: none;  /* 确保SVG不会阻挡点击 */
        }
    }
    `;
    document.head.appendChild(style);
    // customNode.id = 'customLanguageNode';
    // 创建按钮
    const svgCode = `
<svg t="1730776267573" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="60161" width="56" height="56"><path d="M512 512H0A512 512 0 1 0 512 0 512 512 0 0 0 0 512z" fill="#3390EC" p-id="60162" data-spm-anchor-id="a313x.search_index.0.i40.b40c3a81NDqV67" class="selected"></path><path d="M326.180571 630.052571v26.368a52.48 52.48 0 0 0 48.530286 52.370286H431.140571a26.258286 26.258286 0 1 1 0 52.48h-52.48a104.96 104.96 0 0 1-104.96-104.96v-26.258286a26.258286 26.258286 0 1 1 52.48 0z m344.283429-149.174857l104.96 262.436572a13.129143 13.129143 0 0 1-12.214857 17.993143h-28.306286a13.129143 13.129143 0 0 1-12.178286-8.228572l-28.196571-70.473143h-107.117714l-28.16 70.473143a13.129143 13.129143 0 0 1-12.214857 8.228572h-28.233143a13.129143 13.129143 0 0 1-12.178286-17.993143l104.96-262.436572a13.129143 13.129143 0 0 1 12.178286-8.228571h34.706285a13.129143 13.129143 0 0 1 12.214858 8.228571z m-29.257143 67.437715l-32.914286 81.737142h65.462858z m-236.178286-272.530286v39.350857h91.721143a13.129143 13.129143 0 0 1 13.129143 13.129143v157.44a13.129143 13.129143 0 0 1-13.129143 13.129143h-91.830857v65.609143a13.129143 13.129143 0 0 1-13.129143 13.129142h-26.258285a13.129143 13.129143 0 0 1-13.129143-13.129142V498.834286H260.571429a13.129143 13.129143 0 0 1-13.129143-13.129143V328.265143a13.129143 13.129143 0 0 1 13.129143-13.129143h91.721142V275.785143a13.129143 13.129143 0 0 1 13.129143-13.129143h26.258286a13.129143 13.129143 0 0 1 13.238857 13.129143z m236.178286 13.129143a104.96 104.96 0 0 1 104.96 104.96v26.258285a26.258286 26.258286 0 1 1-52.48 0v-26.258285a52.48 52.48 0 0 0-52.48-52.48h-52.589714a26.258286 26.258286 0 0 1 0-52.48z m-288.914286 78.592H299.922286v78.738285h52.370285z m104.96 0h-52.333714v78.738285h52.48z" fill="#ffffff" p-id="60163" data-spm-anchor-id="a313x.search_index.0.i39.b40c3a81NDqV67" class=""></path></svg>
    `;
    const button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = svgCode;
    // 如果按钮不足两个子元素，则直接插入到末尾

    targetNode.insertBefore(button, targetNode.firstChild);
    // 获取所有 .Button 按钮元素
    let buttons = document.querySelectorAll('.NewChatButton .Button');
    buttons.forEach(button => {
        button.style.display = 'inline-flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
    });

    button.style.background = 'none';       // 移除按钮的背景
    button.style.border = 'none';           // 移除按钮的边框
    button.style.padding = '0';             // 移除按钮的内边距
    button.style.margin = '0';              // 移除按钮的外边距
    button.style.cursor = 'pointer';        // 鼠标悬停时显示手形
    button.style.display = 'inline-flex';   // 使按钮大小适应内部内容
    button.style.alignItems = 'center';     // 垂直居中对齐内容
    button.style.justifyContent = 'center'; // 水平居中对齐内容
    button.style.outline = 'none';          // 移除按钮被点击或聚焦时的轮廓

    button.classList.add('translate-btn');
    let customNode = button;
    customNode.classList.add('translate-btn');
    customNode.id = 'customLanguageNode';
    // customNode.appendChild(button)
    // targetNode.insertAdjacentElement('afterend',customNode)

    // 创建弹窗
    const popup = document.createElement('div');
    popup.id = 'custom-popup';
    popup.classList.add('select-box-popup');
    // 本地语言选择框
    const localLangBox = document.createElement('div');
    localLangBox.classList.add('select-box');
    console.log("Local：" + languages.find(lang => lang.code === getLocalLanguage()).displayName)
    localLangBox.textContent = "Local：" + languages.find(lang => lang.code === getLocalLanguage()).displayName;

    // 目标语言选择框
    const targetLangBox = document.createElement('div');
    targetLangBox.classList.add('select-box');
    // console.log( languages.find(lang => lang.code === getTargetLanguage()).displayName)

    targetLangBox.textContent = "Target：" + languages.find(lang => lang.code === getTargetLanguage()).displayName;

    popup.appendChild(localLangBox);
    popup.appendChild(targetLangBox);

    document.body.appendChild(popup);

    // 点击按钮时显示弹窗
    customNode.addEventListener('click', function (event) {
        event.stopPropagation();
        popup.classList.toggle('visible');
        positionPopup(customNode, popup);
    });
    // 点击页面其他地方时隐藏弹窗
    document.addEventListener('click', function (event) {
        // 判断点击的元素是否是弹窗或按钮，或者是语言列表中的元素
        if (!popup.contains(event.target) &&
            !customNode.contains(event.target) &&
            !event.target.classList.contains('language-option')) {
            // 如果点击的不是弹窗、按钮或语言选项，则隐藏弹窗和语言列表
            popup.classList.remove('visible');
            hideLanguageLists(); // 隐藏语言列表
        }
    });

    // 本地语言列表
    const localLangList = createLanguageList(languages, function(selectedLang) {
        localLangBox.textContent = "Local：" + languages.find(lang => lang.code === getLocalLanguage()).displayName;
    }, 'localLanguage-tg');  // 存储到 localStorage 的 localLanguage 键

    // 目标语言列表
    const targetLangList = createLanguageList(languages, function(selectedLang) {
        targetLangBox.textContent = "Target：" + languages.find(lang => lang.code === getTargetLanguage()).displayName;
    }, 'targetLanguage-tg');  // 存储到 localStorage 的 targetLanguage 键

    document.body.appendChild(localLangList);
    document.body.appendChild(targetLangList);

    // 点击本地语言选择框时显示列表
    localLangBox.addEventListener('click', function(event) {
        event.stopPropagation();
        toggleLanguageList(localLangList, localLangBox);
        targetLangList.classList.remove('visible'); // 隐藏目标语言选择框的列表
    });

    // 点击目标语言选择框时显示列表
    targetLangBox.addEventListener('click', function(event) {
        event.stopPropagation();
        toggleLanguageList(targetLangList, targetLangBox);
        localLangList.classList.remove('visible'); // 隐藏本地语言选择框的列表
    });

    // 创建语言列表函数
    function createLanguageList(languages, onSelect, storageKey) {
        const list = document.createElement('div');
        list.classList.add('language-list');

        languages.forEach(language => {
            const option = document.createElement('div');
            option.classList.add('language-option');
            option.textContent = language.displayName; // 显示语言的名称
            option.dataset.languageCode = language.code; // 存储语言的代码

            option.addEventListener('click', function() {
                let oldStr = getLocalLanguage();
                // 根据传入的 storageKey，保存到 localStorage 中的不同键
                localStorage.setItem(storageKey, language.code);
                onSelect(language.name); // 回调函数中使用语言名称
                list.classList.remove('visible'); // 只隐藏当前的语言选择列表
                if(storageKey === 'localLanguage-tg') {
                    let newStr = getLocalLanguage();
                    localLangBox.textContent = "Local：" + languages.find(lang => lang.code === getLocalLanguage()).displayName;
                    if (oldStr !== newStr) {
                        //查询所有的自定节点并删除
                        let customNodes = document.querySelectorAll('div[class="custom-translate-node"]');
                        customNodes.forEach((customNode)=>{
                            let span = customNode.parentNode;
                            span.removeAttribute('data-language-type');
                            span.removeAttribute('data-translate-status');
                            operationNode('remove', customNode);
                        })
                    }
                }else {
                    targetLangBox.textContent = "Target：" + languages.find(lang => lang.code === getTargetLanguage()).displayName;
                }
            });
            list.appendChild(option);
        });
        return list;
    }

    // 切换语言列表显示
    function toggleLanguageList(list, selectBox) {
        if (list.classList.contains('visible')) {
            list.classList.remove('visible');
        } else {
            positionList(selectBox, list); // 将语言列表显示在选择框上方
            list.classList.add('visible');
        }
    }

    // 隐藏所有语言列表
    function hideLanguageLists() {
        localLangList.classList.remove('visible');
        targetLangList.classList.remove('visible');
    }

    // 设置弹窗位置
    function positionPopup(button, popup) {
        const rect = button.getBoundingClientRect();
        const top = rect.top - popup.offsetHeight - 5 + window.scrollY;
        const left = rect.left + window.scrollX;
        popup.style.top = `${top}px`;
        popup.style.left = `${left}px`;
    }

    // 设置语言列表的位置，语言列表的底部贴在选择框的顶部
    function positionList(selectBox, list) {
        const rect = selectBox.getBoundingClientRect(); // 获取选择框的位置信息
        const listHeight = selectBox.offsetHeight; // 获取语言列表的高度
        const top = rect.top - 152 + window.scrollY;  // 列表的底部贴在选择框的顶部
        const left = rect.left + selectBox.offsetWidth + window.scrollX;  // 水平对齐选择框的左边缘
        list.style.position = 'absolute';
        list.style.top = `${top}px`;  // 设置列表的顶部位置
        list.style.left = `${left}px`;  // 设置列表的左边位置
    }
}
async function translateText(text, targetLanguage) {
    const args = {
        local: getLocalLanguage(),  // 假设源语言为中文，可以根据需求动态设置
        target: targetLanguage,
        text: text,
    };
    return window.electronAPI.translateText(args)
}
async function getContentWithLineBreaks(contents) {
    // 用于存储翻译后的文本内容数组
    let contentPromises = contents.map(async (text, index) => {
        text = text.trim();  // 去掉每个字符串的前后空格
        if (text !== "") {  // 如果不是空字符串
            // 如果缓存中没有，调用 API 翻译
            let translatedText = await translateText(text, getTargetLanguage());
            // 如果翻译成功，保存结果到缓存
            if (translatedText) {
                saveMessage(text, translatedText, getTargetLanguage());
            }
            // 返回翻译结果和原始文本
            return {
                original: text,  // 原始文本
                translated: translatedText,  // 翻译后的文本
                index: index  // 段落的索引（用于保持顺序）
            };
        }
    });

    // 使用 Promise.all 等待所有翻译任务完成后返回结果
    const content = await Promise.all(contentPromises);

    // 过滤掉 undefined 值（因为有可能某些字符串为空）
    return content.filter(item => item !== undefined);
}
function generateLoadingNode() {
    // 创建一个容器节点
    let loadingNode = document.createElement('div');
    loadingNode.style.display = 'flex';  // 使用 flex 布局横向排列波浪点
    loadingNode.style.gap = '4px';  // 每个波浪点之间的间隔
    loadingNode.style.paddingTop = '5px';  // 上边距
    loadingNode.style.marginTop = '5px';  // 外边距

    // 创建 3 个波浪点，形成波浪效果
    for (let i = 0; i < 3; i++) {
        let waveDot = document.createElement('div');
        waveDot.classList.add('wave-dot');  // 使用类名来控制样式
        waveDot.style.animationDelay = `${i * 0.2}s`;  // 延迟每个点的动画开始时间
        loadingNode.appendChild(waveDot);
    }

    // 动画效果的 CSS 样式
    let style = document.createElement('style');
    style.innerHTML = `
        /* 通用波浪点样式 */
        .wave-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            animation: wave 1.2s ease-in-out infinite;
        }

        /* 动画效果 */
        @keyframes wave {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.5); opacity: 1; }
        }

        /* 浅色模式下的样式 */
        @media (prefers-color-scheme: light) {
            .wave-dot {
                background-color: blue;  /* 浅色模式下的波浪点颜色 */
            }
        }

        /* 深色模式下的样式 */
        @media (prefers-color-scheme: dark) {
            .wave-dot {
                background-color: lightblue;  /* 深色模式下的波浪点颜色 */
            }
        }
    `;
    document.head.appendChild(style);

    return loadingNode;
}
// 节点操作函数，增加或是删除，并且每次只能调用一次，必须等待渲染完毕后才允许下次调用
function operationNode(action, node, parentNode = undefined) {
    if (action === null || !node) {
        // 如果操作无效，直接解锁
        return;
    }
    let scrollContainer = document.querySelector('div.messages-container');

    // 添加或删除节点
    if (action === 'add') {
        if (!parentNode) {
            // 如果没有传递父节点，则默认不操作
            return;
        }
        parentNode.appendChild(node);
        if (scrollContainer) {
            requestAnimationFrame(() => {
                document.querySelector('div.messages-container').scrollTop += node.offsetHeight;
            })
        }
    }
    if (action === 'remove') {
        if (scrollContainer) {
            requestAnimationFrame(() => {
                document.querySelector('div.messages-container').scrollTop -= node.offsetHeight;
            })
        }
        node.remove();
    }
}
// 获取存储的语言
function getLocalLanguage() {
    return localStorage.getItem('localLanguage-tg') || 'zh';  // 默认语言为 '中文'
}
// 获取存储的语言
function getTargetLanguage() {
    return localStorage.getItem('targetLanguage-tg') || 'en';  // 默认语言为 '英文'
}
// 打开或创建数据库，并在升级时使用复合主键
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TelegramDB', 1);

        request.onupgradeneeded = function(event) {
            const db = event.target.result;

            // 如果对象存储不存在，创建一个新的，使用 'originalText' 和 'language' 作为复合主键
            if (!db.objectStoreNames.contains('messages')) {
                const store = db.createObjectStore('messages', { keyPath: ['originalText', 'language'] });
                store.createIndex('originalText', 'originalText', { unique: false });
                store.createIndex('language', 'language', { unique: false });
            }
        };

        request.onsuccess = function(event) {
            resolve(event.target.result); // 返回数据库实例
        };

        request.onerror = function(event) {
            reject(`数据库打开失败: ${event.target.errorCode}`);
        };
    });
}

// 检查是否已经存在翻译记录并存储
async function saveMessage(originalText, translatedText, language) {
    const db = await openDatabase();

    // 1. 先检查是否存在相同的 originalText 和 language 的记录
    const existingMessage = await getMessage(originalText, language);

    if (existingMessage) {
        return Promise.resolve(); // 已存在，直接返回
    }

    // 2. 如果不存在，则开启新的事务存储新记录
    const transaction = db.transaction(['messages'], 'readwrite');
    const store = transaction.objectStore('messages');

    const message = {
        originalText,         // 原始文本
        translatedText,       // 翻译后的文本
        language              // 语言类型
    };

    return new Promise((resolve, reject) => {
        const request = store.put(message); // 使用 put 来插入或更新消息记录
        request.onsuccess = function() {
            resolve();
        };

        request.onerror = function(event) {
            console.error('存储消息失败', event.target.error);
            reject(event.target.error);
        };
    });
}

// 根据 originalText 和 language 获取翻译记录
async function getMessage(originalText, language) {
    const db = await openDatabase();
    const transaction = db.transaction(['messages'], 'readonly');
    const store = transaction.objectStore('messages');

    return new Promise((resolve, reject) => {
        // 通过主键组合（originalText, language）直接查询
        const request = store.get([originalText, language]);

        request.onsuccess = function(event) {
            const record = event.target.result;

            if (record) {
                resolve(record); // 找到匹配的记录，返回
            } else {
                resolve(null); // 没有找到匹配的记录
            }
        };

        request.onerror = function(event) {
            reject(`获取消息失败: ${event.target.errorCode}`);
        };
    });
}
//   TG设置推送
(function() {
    var button = document.createElement('div');
    button.id = 'settings-button';

    var svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgIcon.setAttribute('t', '1731076975100');
    svgIcon.setAttribute('class', 'icon');
    svgIcon.setAttribute('viewBox', '0 0 1024 1024');
    svgIcon.setAttribute('version', '1.1');
    svgIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgIcon.setAttribute('p-id', '4772');
    svgIcon.setAttribute('width', '48');
    svgIcon.setAttribute('height', '48');
    svgIcon.innerHTML = `
<path d="M30.866286 591.506286a484.790857 484.790857 0 0 1 0-159.012572c53.686857 1.316571 101.961143-24.429714 120.758857-69.778285 18.797714-45.348571 2.852571-97.718857-36.059429-134.729143A484.790857 484.790857 0 0 1 227.986286 115.565714c37.083429 38.912 89.453714 54.857143 134.802285 36.132572 45.348571-18.797714 71.021714-67.145143 69.705143-120.832 52.662857-8.777143 106.422857-8.777143 159.085715 0-1.316571 53.76 24.429714 102.034286 69.705142 120.832 45.348571 18.724571 97.718857 2.779429 134.729143-36.132572a484.790857 484.790857 0 0 1 112.493715 112.493715c-38.912 37.010286-54.857143 89.380571-36.059429 134.729142 18.724571 45.348571 67.072 71.094857 120.758857 69.778286 8.777143 52.662857 8.777143 106.349714 0 159.012572-53.76-1.316571-102.034286 24.429714-120.758857 69.778285-18.797714 45.348571-2.852571 97.718857 36.059429 134.729143a484.937143 484.937143 0 0 1-112.420572 112.493714c-37.083429-38.912-89.453714-54.857143-134.802286-36.132571-45.348571 18.797714-71.021714 67.145143-69.705142 120.832a484.937143 484.937143 0 0 1-159.085715 0c1.316571-53.76-24.429714-102.034286-69.705143-120.832-45.348571-18.724571-97.718857-2.779429-134.729142 36.132571a484.717714 484.717714 0 0 1-112.493715-112.493714c38.912-37.010286 54.857143-89.380571 36.059429-134.729143-18.797714-45.348571-67.072-71.094857-120.758857-69.778285zM512 658.285714a146.285714 146.285714 0 1 0 0-292.571428 146.285714 146.285714 0 0 0 0 292.571428z" fill="#06b480" p-id="9357" data-spm-anchor-id="a313x.search_index.0.i16.60803a81AbYBMp" class="selected"></path>
    `;

    button.appendChild(svgIcon);

    button.style.position = 'fixed';
    button.style.top = '50%';
    button.style.right = '20px';
    button.style.transform = 'translateY(-50%)';
    button.style.width = '48px';
    button.style.height = '48px';
    button.style.borderRadius = '50%';
    button.style.border = 'none';
    // button.style.backgroundColor = '#ffffff';
    button.style.backgroundColor = 'transparent';

    button.style.cursor = 'pointer';
    button.style.zIndex = '1000';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.addEventListener('click', function() {
        const hashData = window.location.hash.substring(1);
        // 过滤掉以 "-" 开头的部分
        const filteredData = hashData.split('/').filter(item => !item.startsWith('-')).join('/');
        if(filteredData){
            console.log(filteredData);
            window.electronAPI.showUserPortraitPanel({platform:'Telegram',phone_number:filteredData})
        }
        // 这里可以添加更多逻辑，比如显示一个设置面板或跳转到设置页面
    });
    document.body.appendChild(button);
})();
