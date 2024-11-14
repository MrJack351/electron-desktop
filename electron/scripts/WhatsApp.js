// whatsapp-content.js

function printElementEvery5Seconds() {
    setInterval(() => {
        const element = document.querySelector("#app > div > div.two._aigs.x1n2onr6.x13vifvy.x17qophe.x78zum5.xh8yej3.x5yr21d.x6ikm8r.x10wlt62.x1iek97a.x1w3jsh0.xf8xn22.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1g0ag68.xcgwb2z.x4afe7t.x1alahoq.x1j6awrg.x1m1drc7.x1n449xj.x162n7g1.xitxdhh.x134s4mn.x1s928wv.x1setqd9 > header > div > div > div > div > span > div > div.x1c4vz4f.xs83m0k.xdl72j9.x1g77sc7.xeuugli.x2lwn1j.xozqiw3.x1oa3qoh.x12fk4p8.xyorhqc > div:nth-child(1) > div")
        if (element) {
            const avatar = document.querySelector("#app > div > div.two._aigs.x1n2onr6.x13vifvy.x17qophe.x78zum5.xh8yej3.x5yr21d.x6ikm8r.x10wlt62.x1iek97a.x1w3jsh0.xf8xn22.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1g0ag68.xcgwb2z.x4afe7t.x1alahoq.x1j6awrg.x1m1drc7.x1n449xj.x162n7g1.xitxdhh.x134s4mn.x1s928wv.x1setqd9 > header > div > div > div > div > span > div > div.x1c4vz4f.xs83m0k.xdl72j9.x1g77sc7.xeuugli.x2lwn1j.xozqiw3.x1oa3qoh.x12fk4p8.xyorhqc > div:nth-child(2) > div > div > div > div > img")
            const url = avatar?.src || '';
            window.electronAPI.sendMsg({platform:'WhatsApp',online: true,avatarUrl:url}).then(res=>{
                console.log('用户已登录：',res)
            })
        } else {
            window.electronAPI.sendMsg({platform:'WhatsApp',online: false,avatarUrl: ''}).then(res=>{
                console.log('用户未登录：',res)
            })
        }
    }, 5000); // 每隔5000毫秒（5秒）调用一次
}
// 调用函数
printElementEvery5Seconds();

let languages = []
function notify() {
    window.electronAPI.newMsgNotify({platform:'WhatsApp'})
}
monitorMainNode()

//初始化语言列表
function getLanguageList() {
    window.electronAPI.languageList().then((response) => {
        languages = response.data;
    })
}
function sendMsg() {
    // 假设你要替换的按钮是发送按钮
    // let sendButton = document.querySelector('button.x1c4vz4f.x2lah0s.xdl72j9.xfect85.x1iy03kw.x1lfpgzf');
    let sendButton = document.querySelector('footer span[data-icon="send"]').parentNode;
    if (sendButton) {
        sendButton.click();
    }else {
        console.log('发送按钮不存在！')
    }
}
function startMonitor() {
    // 获取可编辑的 div 消息输入框 元素
    let editableDiv = document.querySelector('footer div[aria-owns="emoji-suggestion"][contenteditable="true"]')
    // 处理消息翻译
    if (editableDiv) {
        // 自定义新的监听函数
        editableDiv.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && !event.ctrlKey) {
                let loadingNode = document.getElementById('editDivLoadingNode');
                if (loadingNode) {
                    // 阻止默认行为
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();  // 防止事件继续传递到插件
                    console.log('消息处理中：')
                    return;
                }
                // 显示加载中的节点
                loadingNode = generateLoadingNode();
                loadingNode.id = 'editDivLoadingNode';

                // 获取所有需要翻译的文本元素
                let msgElements = document.querySelectorAll('span.selectable-text.copyable-text[data-lexical-text="true"]');
                //判断发送的内容是否全是表情
                if (editableDiv.querySelector('span') && msgElements.length<=0) {
                    sendMsg()
                    // 阻止默认行为
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();  // 防止事件继续传递到插件)
                    return;
                }
                if (msgElements.length <= 0) {
                    // 阻止默认行为
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();  // 防止事件继续传递到插件
                    console.log('没有要翻译的内容！')
                    return;
                }
                operationNode('add',loadingNode,editableDiv.parentNode.parentNode)

                // 调用异步翻译函数
                getContentWithLineBreaks().then(async (msgArr) => {
                    if (msgArr.length > 0) {
                        try {
                            // 使用 Promise.all 确保所有的翻译都完成后再继续
                            await Promise.all(
                                msgArr.map((msg, i) => {
                                    if (msg)
                                        msgElements[i].firstChild.textContent = msg.translated;
                                })
                            );

                            // 移除加载节点
                            operationNode('remove',loadingNode)

                            // 发送消息，确保翻译完成后再发送
                            sendMsg();
                        } catch (error) {
                            // 翻译失败或部分失败时处理
                            console.error("翻译过程出错: ", error);
                        } finally {
                            operationNode('remove',loadingNode)
                        }
                    } else {
                        // 如果没有内容翻译，直接解锁
                        operationNode('remove',loadingNode)
                    }
                }).catch((error) => {
                    // 在发生错误时也要移除加载节点并解锁
                    console.error("翻译出错: ");
                    operationNode('remove',loadingNode)
                });

                // 阻止默认行为
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();  // 防止事件继续传递到插件
            }
        }, true);  // 捕获阶段监听
    }

}
//移除加载节点
function removeLoadingNode() {
    let loadingNode = document.getElementById('editDivLoadingNode');
    if (loadingNode) {
        loadingNode.remove();
    }
}
function addTranslateButtonWithSelect() {
    let targetNode = document.querySelector('footer').firstChild.firstChild.firstChild.firstChild.firstChild;
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
    }
    .popup {
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
    .popup.visible {
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
        .popup {
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
        .popup {
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
        }
    }
    `;
    document.head.appendChild(style);

    // 创建按钮
    const button = document.createElement('button');
    // button.textContent = "选择语言";
    button.classList.add('translate-btn');
    // 插入自定义 SVG 图标到按钮
    const svgIcon = `<svg t="1728245126352" class="custom-svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
     p-id="11370" data-spm-anchor-id="a313x.search_index.0.i11.241d3a812zSb3L" width="26" height="26">
    <path
        d="M846.04 866.77c-17.08 2.03-32.57-10.18-34.59-27.26-0.22-1.9-0.27-3.81-0.15-5.71v-123c0-33.73-22.17-33.73-30.53-33.73-21.28-0.46-38.91 16.43-39.36 37.72-0.01 0.46-0.01 0.92 0 1.37v117.66c-0.76 18.9-16.71 33.61-35.61 32.84-17.83-0.72-32.12-15.01-32.84-32.84V647.68c-1.23-17.23 11.74-32.19 28.97-33.41 1.69-0.12 3.39-0.1 5.08 0.05a31.953 31.953 0 0 1 31.33 17.76 89.435 89.435 0 0 1 54.99-17.76c54.11 0 86.45 33.59 86.45 90.03V833.8a32.25 32.25 0 0 1-8.88 23.72 34.026 34.026 0 0 1-24.82 9.33l-0.04-0.08z m-233.12-7.46h-134.7c-42.77 0-61.85-18.96-61.85-61.57V608.07c0-42.52 19.09-61.57 61.85-61.57h128.74c17.92 0 32.45 14.53 32.45 32.45s-14.53 32.45-32.45 32.45H490.73c-1.22-0.08-2.45 0.09-3.6 0.5 0.13 0-0.15 0.8-0.15 2.89v52.58h106c16.33-1.66 30.91 10.24 32.57 26.57 0.17 1.68 0.2 3.37 0.08 5.06 0.98 16.66-11.73 30.97-28.4 31.95-1.41 0.08-2.83 0.07-4.24-0.05H486.9V791c-0.04 1.06 0.08 2.13 0.35 3.15 1.12 0.15 2.25 0.23 3.38 0.24h122.31c16.96-1.07 31.58 11.81 32.65 28.76 0.07 1.16 0.08 2.33 0.02 3.5 1.35 16.68-11.07 31.3-27.75 32.65-1.64 0.13-3.28 0.13-4.92 0h-0.02zM327.54 482.85c-17.36 2.36-33.34-9.8-35.7-27.16-0.3-2.21-0.37-4.44-0.2-6.67V370.5h-85.27c-45.86 0-66.31-20.52-66.31-66.31v-93.87c0-45.58 20.52-65.9 66.31-65.9h85.27v-31.53c-1.38-17.11 11.37-32.11 28.48-33.49 1.92-0.15 3.84-0.13 5.76 0.07 30.26 0 36.63 18.17 36.63 33.42v31.59h86.09c45.86 0 66.33 20.34 66.33 65.88v93.89c0 45.86-20.52 66.29-66.33 66.29h-86.05v78.52c1.25 17.47-11.9 32.65-29.37 33.91-1.88 0.13-3.76 0.1-5.63-0.1v-0.02zM217.21 211.27c-6.47 0-7.07 0.6-7.07 7.07v78.2c0 6.53 0.6 7.15 7.07 7.15h74.43v-92.42h-74.43z m145.35 92.38h75.29c6.29 0 7.09-0.8 7.09-7.07v-78.25c0-6.29-0.8-7.09-7.09-7.09h-75.31v92.42h0.02z m151.42 655.91C266.43 958.82 66.36 757.55 67.1 510c0.1-35 4.31-69.86 12.52-103.88 4.81-19 23.92-30.68 43.03-26.29 19.1 4.61 30.86 23.81 26.29 42.91-48.93 202.33 75.42 406.01 277.75 454.94a376.924 376.924 0 0 0 87.29 10.56c19.69 0.02 35.64 15.99 35.63 35.69-0.02 19.67-15.96 35.61-35.63 35.63z m398.49-310.05c-19.69 0-35.66-15.96-35.66-35.65 0-2.95 0.37-5.9 1.09-8.76 51.31-201.82-70.7-407.02-272.52-458.33-29.89-7.6-60.59-11.5-91.43-11.62-19.68 0-35.64-15.95-35.64-35.63 0-19.68 15.95-35.64 35.63-35.64h0.01c247.57 0.76 447.65 202.08 446.89 449.65-0.11 36.8-4.76 73.44-13.83 109.1-4 15.8-18.23 26.88-34.54 26.88z"
        fill="#bfbfbf" p-id="11371"></path>
    </svg>
`;

    // 将 SVG 图标添加到按钮中
    button.innerHTML = svgIcon;
    targetNode.appendChild(button)

    // 创建弹窗
    const popup = document.createElement('div');
    popup.classList.add('popup');

    const localLangBox = document.createElement('div');
    localLangBox.classList.add('select-box');
    localLangBox.textContent = "Local：" + languages.find(lang => lang.code === getLocalLanguage()).displayName;

    // 目标语言选择框
    const targetLangBox = document.createElement('div');
    targetLangBox.classList.add('select-box');
    targetLangBox.textContent = "Target：" + languages.find(lang => lang.code === getTargetLanguage()).displayName;

    popup.appendChild(localLangBox);
    popup.appendChild(targetLangBox);
    document.body.appendChild(popup);

    // 点击按钮时显示弹窗
    button.addEventListener('click', function (event) {
        event.stopPropagation();
        popup.classList.toggle('visible');
        positionPopup(button, popup);
    });

    // 点击页面其他地方时隐藏弹窗
    document.addEventListener('click', function (event) {
        // 判断点击的元素是否是弹窗或按钮，或者是语言列表中的元素
        if (!popup.contains(event.target) &&
            !button.contains(event.target) &&
            !event.target.classList.contains('language-option')) {
            // 如果点击的不是弹窗、按钮或语言选项，则隐藏弹窗和语言列表
            popup.classList.remove('visible');
            hideLanguageLists(); // 隐藏语言列表
        }
    });

    // 本地语言列表
    const localLangList = createLanguageList(languages, function(selectedLang) {
        localLangBox.textContent = "Local：" + localStorage.getItem('localLanguage');
    }, 'localLanguage');  // 存储到 localStorage 的 localLanguage 键

    // 目标语言列表
    const targetLangList = createLanguageList(languages, function(selectedLang) {
        targetLangBox.textContent = "Target：" + localStorage.getItem('targetLanguage');
    }, 'targetLanguage');  // 存储到 localStorage 的 targetLanguage 键

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
                onSelect(language.displayName); // 回调函数中使用语言名称
                list.classList.remove('visible'); // 只隐藏当前的语言选择列表
                if(storageKey === 'localLanguage') {
                    let newStr = getLocalLanguage();
                    localLangBox.textContent = "Local：" + languages.find(lang => lang.code === getLocalLanguage()).displayName;
                    if (oldStr !== newStr) {
                        //查询所有的自定节点并删除
                        let customNodes = document.querySelectorAll('div[class="custom-translate-node"]');
                        customNodes.forEach((customNode)=>{
                            let span = customNode.parentNode;
                            span.removeAttribute('data-id');
                            span.removeAttribute('data-language-type');
                            span.removeAttribute('data-translate-status');
                            // customNode.remove();
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

async function getContentWithLineBreaks() {
    let editableDiv = document.querySelector('footer div[aria-owns="emoji-suggestion"][contenteditable="true"]');
    if (!editableDiv) {
        return [];
    }

    // 获取所有 <p> 标签
    let paragraphs = editableDiv.querySelectorAll('p');

    // 用于存储翻译后的文本内容数组
    let contentPromises = Array.from(paragraphs).map(async (p, index) => {
        let text = p.innerText.trim();  // 获取 <p> 标签中的文本内容并去除前后空格
        if (text !== "") {
            let translatedText = await translateText(text, getTargetLanguage());
            if (translatedText) {
                saveMessage(text, translatedText, getTargetLanguage());
            }else {
                throw new Error('翻译失败：请求结果为空！')
            }
            return {
                original: text,  // 原始文本
                translated: translatedText,  // 翻译后的文本
                index: index  // 段落的索引
            };
        }
    });

    // 使用 Promise.all 等待所有翻译任务完成后返回结果
    const content = await Promise.all(contentPromises);

    // 过滤掉 undefined 值（因为有可能有空的 <p> 标签导致翻译结果为空）
    return content.filter(item => item !== undefined);
}
// 该函数将在页面内执行，用于监听 #main 节点的加载和子节点变化
function monitorMainNode() {
    // 监听整个 body 的 DOM 变化，等待 #main 节点的出现
    const observer = new MutationObserver((mutationsList, observer) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                //设置授权码
                // 检查是否已经存在 id="main" 的节点
                const mainNode = document.getElementById('pane-side');
                if (mainNode) {
                    // 停止对 body 的观察，避免不必要的性能开销
                    observer.disconnect();
                    // 开始监听 #main 节点的子节点变化
                    observePaneSide(mainNode);
                    getLanguageList()
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
        const observer = new MutationObserver((mutationsList) => {
            mutationsList.forEach(mutation => {
                // 确保是属性变化事件，并且是 aria-selected 属性
                if (mutation.type === 'attributes' && mutation.attributeName === 'aria-selected') {
                    const targetNode = mutation.target;
                    // 检查 aria-selected 属性值
                    if (targetNode.getAttribute('aria-selected') === 'true') {
                        removeLoadingNode()
                        startMonitor()
                        //添加翻译语言按钮
                        addTranslateButtonWithSelect();
                    }
                }
            });
        });

        // 配置 MutationObserver，监听 aria-selected 属性变化
        const config = { attributes: true, subtree: true, attributeFilter: ['aria-selected'] };
        // 监听 pane-side 节点
        observer.observe(paneSideNode, config);
    }

    // 处理消息列表翻译
    async function processMessageList() {
        let messageSpans = document.querySelectorAll('span[dir] > span:not([data-translate-status])');
        // 过滤：检查每个 span 是否位于 role="application" 的 div 之下
        let filteredSpans = Array.from(messageSpans).filter(span => {
            let parent = span.closest('div[role="application"]'); // 查找最近的父级 div[role="application"]
            return parent !== null;  // 如果找到了，则保留该 span
        });

        // 先标记所有需要处理的消息为 'processing' 状态
        for (let span of filteredSpans) {
            markMessageAsProcessing(span);  // 立即标记并触发重绘

        }
        for (let span of filteredSpans) {
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
        let msg = span.textContent.trim();
        if (msg === '') return;  // 如果消息为空，直接退出

        // 插入加载中的节点
        let loadingNode = generateLoadingNode();
        // span.appendChild(loadingNode);
        operationNode('add',loadingNode,span)
        // 使用 closest() 方法找到最近的包含 data-id 的父节点
        let dataId = span.closest('[data-id]').getAttribute('data-id');
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
            span.setAttribute('data-message-id', dataId);

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

            // 可以选择插入“翻译失败”提示节点（可选）
            // let errorNode = document.createElement('div');
            // errorNode.textContent = '翻译失败';
            // errorNode.style.color = 'red';  // 错误提示样式
            // span.appendChild(errorNode);
            // operationNode('add',errorNode,span)
            // console.error(`消息翻译失败: `, error);
        }
    }
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
async function generateSign(appKey, query, salt, appSecret) {
    const text = appKey + query + salt + appSecret;

    // 将字符串转换为 ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    // 使用 SubtleCrypto 生成 SHA-256 哈希
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // 将 ArrayBuffer 转换为 16 进制字符串
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
}
// 节点操作函数，增加或是删除，并且每次只能调用一次，必须等待渲染完毕后才允许下次调用
function operationNode(action, node, parentNode = undefined) {
    if (action === null || !node) {
        // 如果操作无效，直接解锁
        return;
    }
    let scrollContainer = document.querySelector('div[role=application]').parentNode;
    // 添加或删除节点
    if (action === 'add') {
        if (!parentNode) {
            // 如果没有传递父节点，则默认不操作
            return;
        }
        parentNode.appendChild(node);
        if (scrollContainer) {
            requestAnimationFrame(() => {
                document.querySelector('div[role=application]').parentNode.scrollTop += node.offsetHeight;
            })
        }
    }
    if (action === 'remove') {
        if (scrollContainer){
            requestAnimationFrame(() => {
                document.querySelector('div[role=application]').parentNode.scrollTop -= node.offsetHeight;
            })
        }
        node.remove();
    }

}
// 获取存储的语言
function getLocalLanguage() {
    const storedLanguage = localStorage.getItem('localLanguage');
    return storedLanguage || 'zh';  // 默认语言为 '中文'
}
// 获取存储的语言
function getTargetLanguage() {
    const storedLanguage = localStorage.getItem('targetLanguage');
    return storedLanguage || 'en';  // 默认语言为 '英语'
}

// 打开或创建数据库，并在升级时使用复合主键
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TranslationDB', 1);
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

// ws增加设置按钮
(function() {
    var button = document.createElement('button');
    button.id = 'settings-button';

    var svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgIcon.setAttribute('t', '1731075937285');
    svgIcon.setAttribute('class', 'icon');
    svgIcon.setAttribute('viewBox', '0 0 1024 1024');
    svgIcon.setAttribute('version', '1.1');
    svgIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgIcon.setAttribute('p-id', '4322');
    svgIcon.setAttribute('width', '48');
    svgIcon.setAttribute('height', '48');
    svgIcon.innerHTML = `
      <path d="M640 512c0-35.328-12.544-65.47456-37.504-90.43456A123.34592 123.34592 0 0 0 512 384c-35.328 0-65.536 12.48256-90.496 37.504C396.544 446.52544 384 476.672 384 512c0 35.38944 12.48256 65.536 37.504 90.496C446.464 627.456 476.672 640 512 640s65.46944-12.48256 90.496-37.504C627.456 577.536 640 547.38944 640 512z m256 56.50944c0 4.03456-1.28 7.87456-4.02944 11.52a15.14496 15.14496 0 0 1-9.984 6.528l-92.48256 13.952a320.07168 320.07168 0 0 1-19.52256 45.50656c11.64288 16.64 29.50656 39.68 53.504 68.99712 3.12832 3.41504 4.92544 7.84384 5.05344 12.48256a16.72192 16.72192 0 0 1-4.48 11.52c-9.02656 12.34944-25.6 30.336-49.536 54.016-24.064 23.68-39.68 35.52256-47.04256 35.52256a24.42752 24.42752 0 0 1-12.99456-4.48l-68.992-54.08256c-14.72 7.68-29.824 14.08-45.50656 19.00544-5.30944 45.37856-10.17344 76.35456-14.53056 92.99456-2.29888 9.344-8.32 14.01344-17.98144 14.01344H456.51456a18.90816 18.90816 0 0 1-12.288-4.224 14.73024 14.73024 0 0 1-5.76-10.752L424.51456 788.992a309.7088 309.7088 0 0 1-45.056-18.56L308.992 824.00256a17.98144 17.98144 0 0 1-12.48256 4.48 17.21344 17.21344 0 0 1-12.544-5.504c-41.984-37.94944-69.44256-65.92-82.432-83.96288a19.584 19.584 0 0 1 0.45056-23.04c5.05344-6.97856 13.50144-18.048 25.53344-33.28 12.032-15.104 20.992-26.88 27.008-35.2a247.5264 247.5264 0 0 1-20.48-49.54112l-91.52-13.44a15.78496 15.78496 0 0 1-10.496-6.272 18.92352 18.92352 0 0 1-4.03456-11.776V455.48544c0-3.968 1.28-7.808 4.03456-11.52a14.97088 14.97088 0 0 1 9.472-6.46144L234.496 423.48544c4.67456-15.36 11.136-30.65344 19.456-46.01344A1129.1392 1129.1392 0 0 0 200.448 308.48a18.75456 18.75456 0 0 1-4.992-11.96544c0-3.328 1.47456-7.168 4.48-11.52 8.704-12.032 25.088-29.952 49.28-53.76s39.936-35.77856 47.29856-35.77856c4.28544 0 8.64256 1.664 12.99456 5.05856l68.992 53.504a278.3744 278.3744 0 0 1 45.44-19.00544c5.376-45.37344 10.24-76.35456 14.53056-92.99456C440.832 132.67456 446.78656 128 456.51456 128h110.976c4.66944 0 8.76544 1.408 12.28288 4.224a14.72 14.72 0 0 1 5.76 10.752l13.95712 92.032c16.32256 5.31456 31.36 11.52 44.98944 18.56l71.04-53.56544a16.24576 16.24576 0 0 1 11.97056-4.48c4.352 0 8.50944 1.664 12.53888 4.992 43.008 39.68 70.46656 68.03456 82.43712 84.992 2.49344 3.10784 3.74272 7.02976 3.52256 11.008 0 4.03456-1.28 7.87456-3.968 11.52-5.05344 7.04-13.50656 18.11456-25.53344 33.28s-20.992 26.88-27.008 35.2c8.704 16.64 15.488 33.024 20.48 49.024l91.52 14.01856a15.64672 15.64672 0 0 1 10.50112 6.20544c2.65216 3.37408 4.0704 7.552 4.02944 11.84256v110.976-0.07168z" fill="#38A65A" p-id="4323"></path>
    `;
    button.appendChild(svgIcon);

    button.style.position = 'fixed';
    button.style.top = '50%';
    button.style.right = '0';
    button.style.transform = 'translateY(-50%)';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.zIndex = '1000';

    button.addEventListener('click', function() {
        var element = document.querySelector('div#main');
        // 获取 React 的属性对象
        for (let key in element) {
            if (key.startsWith('__reactProps$')) {
                var reactProps = element[key];
                // console.log(reactProps);
                break;
            }
        }
        if(reactProps.children.key){
            userNum = reactProps.children.key
            window.electronAPI.showUserPortraitPanel({platform:'WhatsApp',phone_number:userNum});
            console.log(userNum);
        }
        // 这里可以添加更多逻辑，比如显示一个设置面板或跳转到设置页面
    });

    document.body.appendChild(button);
})();


//定义全局监听开关
let isGlobalObserverEnabled = false;
// 配置 MutationObserver 选项
const config = {
    childList: true, // 监听直接子节点的增删
    subtree: true    // 监听整个子树
};
// 检查当前页面是否在浏览（前台/后台）
function checkPageVisibility() {
    if (document.visibilityState === 'visible') {
        isGlobalObserverEnabled = false;
        console.log("页面正在被浏览（处于前台）");
        // 你可以在这里触发其他逻辑，比如暂停定时器等
    } else {
        isGlobalObserverEnabled = true;
        console.log("页面未被浏览（处于后台）");
        // 可以在这里添加后台时的逻辑，比如暂停视频、停止动画等
    }
}
// 监听 visibilitychange 事件
document.addEventListener("visibilitychange", checkPageVisibility);
// 初始化时检查一次页面状态
checkPageVisibility();
// 函数：监听指定元素的变化
function listenToElementChanges(targetElementSelector) {
    const targetElement = document.querySelector(targetElementSelector);

    if (!targetElement) {
        console.log('Target element not found!');
        return;
    }

    const observer = new MutationObserver((mutationsList, observer) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList' || mutation.type === 'attributes') {
                // 触发新消息
                if(isGlobalObserverEnabled){
                    console.log(`有新消息触发`);
                    // 你可以在这里处理变化，比如记录、通知等
                    notify()
                }


            }
        }
    });

    const config = { childList: true, attributes: true, subtree: true };
    observer.observe(targetElement, config);

    console.log(`Started listening to changes in element: ${targetElementSelector}`);
}

// 函数：监听指定节点是否存在
function listenForNodeExistence(nodeSelector) {
    const observer = new MutationObserver((mutationsList, observer) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                const node = document.querySelector(nodeSelector);
                if (node) {
                    console.log(`Node ${nodeSelector} found!`);
                    observer.disconnect(); // 断开监听器
                    listenToElementChanges(nodeSelector); // 开始监听目标元素变化
                }
            }
        }
    });

    const config = { childList: true, subtree: true };
    observer.observe(document.body, config);

    console.log(`Started watching for node existence: ${nodeSelector}`);
}

// 调用函数：首先监听目标节点的存在，然后监听元素的变化
//document.querySelector("#app > div > div.two._aigs.x1n2onr6.x13vifvy.x17qophe.x78zum5.xh8yej3.x5yr21d.x6ikm8r.x10wlt62.x1iek97a.x1w3jsh0.xf8xn22.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1g0ag68.xcgwb2z.x4afe7t.x1alahoq.x1j6awrg.x1m1drc7.x1n449xj.x162n7g1.xitxdhh.x134s4mn.x1s928wv.x1setqd9 > header > div > div > div > div > span > div > div:nth-child(1) > div._ajv7._ajv8._ajvb > div > div")
listenForNodeExistence('#app > div > div.two._aigs.x1n2onr6.x13vifvy.x17qophe.x78zum5.xh8yej3.x5yr21d.x6ikm8r.x10wlt62.x1iek97a.x1w3jsh0.xf8xn22.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1g0ag68.xcgwb2z.x4afe7t.x1alahoq.x1j6awrg.x1m1drc7.x1n449xj.x162n7g1.xitxdhh.x134s4mn.x1s928wv.x1setqd9 > header > div > div > div > div > span > div > div:nth-child(1) > div._ajv7._ajv8._ajvb > div > div');

