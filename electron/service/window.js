'use strict';

const { Controller } = require('ee-core');
const Log = require('ee-core/log');
const Addon = require('ee-core/addon');
const { app, BrowserWindow, WebContentsView ,session} = require('electron');
const path = require('path');
const fs = require('fs');
const platforms = [
    { platform: 'Telegram', url: 'https://web.telegram.org/a/' },
    { platform: 'TelegramK', url: 'https://web.telegram.org/k/' },
    { platform: 'WhatsApp', url: 'https://web.whatsapp.com/' },
    // { platform: 'Telegram', url: 'https://www.browserscan.net/zh/' },
    // { platform: 'WhatsApp', url: 'https://ipcs.vip/' },
];
const { Service } = require('ee-core');
/**
 * 示例服务（service层为单例）
 * @class
 */
class WindowService extends Service {

    constructor(ctx) {
        super(ctx);
        app.platforms = app.platforms || platforms;
    }

    async addCard(args, event) {
        const {cardId, platform} = args;
        const url = platforms.find(item => item.platform === platform)?.url;
        if (!url) return {message:'未找到对应平台的URL',status:false};
        // const mainId = Addon.get('window').getMWCid();
        // const mainWin = BrowserWindow.fromId(mainId);
        // 检查是否已存在会话
        const cardCache = await app.sdb.selectOne('cards',{'card_id':cardId})
        if (cardCache) {
            return {status:false,message:'创建失败，已存在该窗口'};
        }
        //生成随机ua
        const userAgent = this._generateRandomDesktopUA();
        await app.sdb.insert('cards', {
            card_id: cardId,
            platform: platform,
            platform_url: url,
            active_status: 'false',
            online_status: 'false',
            show_badge: 'false'
        })
        await app.sdb.insert('card_config', {card_id: cardId, user_agent: userAgent})
        Log.info('新窗口创建成功')
        return {status:true,message:"创建成功"};
    }

    async refreshCard(args, event) {
        const { platform, cardId } = args;
        const cardInfo = await app.sdb.selectOne('cards',{card_id:cardId,platform:platform})
        if (cardInfo) {
            try{
                // 销毁原有的 view
                this._destroyView(cardId);
                // 创建新会话视图
                const view = this._createWebView(cardId)
                app.viewsMap.set(cardId, view);
                const id = view.webContents.id
                await app.sdb.update('cards',{window_id:id},{card_id:cardId})
                await this._loadConfig(cardId);
                await view.webContents.loadURL(cardInfo.platform_url);
                if (cardInfo.active_status === 'true') {
                    this._addListener(view)
                }
                return {status:true,message:'刷新成功'};
            }catch(error){
                return {status:false,message:error.message};
            }
        }else {
            return {status:false,message:'找不到会话信息'};
        }
    }

    async deleteCard(args, event) {
        const { platform, cardId } = args;
        try {
            const count = await app.sdb.delete('cards',{card_id:cardId,platform:platform})
            await app.sdb.delete('card_config',{card_id:cardId})
            await app.sdb.delete('number_record',{card_id:cardId,platform:platform})
            if (count >0) {
                this._destroyView(cardId);
                return {status:true,message:'删除会话成功'};
            }else return { status: false, message: '没有找到符合条件的会话' };
        } catch (err) {
            Log.error('删除数据时出错:', err);
            return {status:false,message:'删除会话时出错'};
        }
    }

    async selectCard(args, event) {
        const { cardId,platform } = args;
        Log.info('卡片切换：',args)
        const cardInfo = await app.sdb.selectOne('cards',{card_id:cardId,platform:platform});
        if (cardInfo) {
            const window = app.viewsMap.get(cardId);
            if (window && !window.webContents.isDestroyed()) {
                this._addListener(window)
                //先修改所有数据状态为false
                await app.sdb.update('cards',{active_status:"false"},{platform:platform})
                await app.sdb.update('cards',{active_status: "true",show_badge:'false'},{card_id:cardId,platform:platform})
                return {status:true,message:'切换会话成功'};
            }
            Log.info('创建新会话：',cardId)
            // 创建新会话视图
            const view = this._createWebView(cardId);
            app.viewsMap.set(cardId, view);
            const id = view.webContents.id
            await app.sdb.update('cards',{active_status: "false"},{platform:platform})
            await app.sdb.update('cards',{window_id:id,active_status:"true"},{card_id:cardId,platform:platform})
            await this._loadConfig(cardId);
            await view.webContents.loadURL(cardInfo.platform_url);
            this._addListener(view)
            return {status:true,message:'加载新会话成功'};
        }
        return {status:false,message:'没有找到该会话信息'};
    }
    //初始化卡片，不显示
    async initCard(args, event) {
        const { cardId,platform } = args;
        Log.info('初始化卡片会话：',args)
        const cardInfo = await app.sdb.selectOne('cards',{card_id:cardId,platform:platform});
        if (cardInfo) {
            const window = app.viewsMap.get(cardId);
            if (window && !window.webContents.isDestroyed()) {
                return {status:true,message:'启动会话成功'};
            }
            // 创建新会话视图
            const view = this._createWebView(cardId);
            app.viewsMap.set(cardId, view);
            const id = view.webContents.id
            await app.sdb.update('cards',{window_id:id},{card_id:cardId,platform:platform})
            await this._loadConfig(cardId);
            await view.webContents.loadURL(cardInfo.platform_url);
            return {status:true,message:'启动会话成功'};
        }
        return {status:false,message:'找不到该会话信息'};
    }
    async getCards(args, event) {
        const { platform } = args;
        return await app.sdb.select('cards', {platform: platform});
    }

    async saveCardConfig(args, event) {
        const { card_id ,name} = args;
        const config = await app.sdb.selectOne('card_config',{card_id:card_id})
        const card = await app.sdb.selectOne('card_config',{card_id:card_id})
        if (config) {
            const count = await app.sdb.update('card_config',args,{card_id:card_id})
            if (name !== undefined && name !== '') {
                await app.sdb.update('cards', {card_name:name},{card_id:card_id})
            }
            if (count >0) {
                return {status:true,message:'保存成功'}
            }else {
                return {status:false,message:'找不到对应配置数据'}
            }
        }
        return {status:false,message:'找不到对应配置数据'}
    }

    async getCardConfig(args, event) {
        const { cardId } = args;
        // 查找数据库中对应的平台和 cardId 的记录
        const data = await app.sdb.selectOne('card_config',{card_id:cardId})
        if (data) {
            return data;
        }else {
            return {}
        }
    }

    async hideAllWindow() {
        app.viewsMap.forEach((view, key) => {
            if (view && !view.webContents.isDestroyed()) {
                view.setVisible(false);
            }
        });
    }
    async logOut(args, event) {
        // 获取主窗口 ID，确保不销毁其 WebContents
        const mainId = Addon.get('window').getMWCid();
        const mainWin = BrowserWindow.fromId(mainId);
        app.viewsMap.forEach((view, key) => {
            this._destroyView(key)
        });
        await app.sdb.update('cards',{show_badge:'false',online_status:'false',avatar_url:''},{})
        mainWin.setTitle('setToolbox')
    }

    async filterNumber(args, event) {
        const { platform, cardId, phoneNumber } = args;
        //查询手机号码是否存在检测记录
        const record = app.sdb.selectOne('number_record',{platform:platform,phone_number:phoneNumber})
        if (record) {
            const data = {platform:platform,cardId:record.card_id,phoneNumber:phoneNumber,phoneStatus:record.phone_status,status:record.status}
            return {status:true,message:'检测成功，存在检测记录',data:data};
        }
        const url = platforms.find(item => item.platform === platform)?.url;
        const view = app.viewsMap.get(cardId);
        // const scriptPath = path.join(__dirname, '../scripts/WhatsAppNumberFilter.js');
        // const scriptCode = fs.readFileSync(scriptPath, 'utf8');
        // 将参数插入到 scriptCode 中
        const scriptCode = `
          (function() {
            const cardId = "${cardId}";
            const phoneNumber = "${phoneNumber}";
            const platform = "${platform}";
        
            // 延时 5 秒执行
            setTimeout(() => {
              // 这里可以执行您的代码，并使用 phoneNumber 和 platform 变量
              const node = document.querySelector("div.x12lqup9.x1o1kx08");
              const result = { phone_status: '', message: '' };
        
              if (node) {
                  result.phone_status = 'false';
                  result.message = node.textContent;
              } else {
                  result.phone_status = 'true';
                  result.message = '号码存在存入数据成功';
              }
        
              // 通过 window.electronAPI 发送结果到主进程
              window.electronAPI.sendFilterNotify({
                cardId: cardId,
                phoneNumber: phoneNumber,
                platform: platform,
                result: result
              });
            }, 5000); // 延迟 5000 毫秒（5 秒）
          })();
        `;
        // 监听网页加载完成事件
        view.webContents.once('did-finish-load', () => {
            view.webContents.executeJavaScript(scriptCode)
        });
        try{
            // 加载目标 URL
            await view.webContents.loadURL(url + `send?phone=${phoneNumber}`);
            return {status:true,message:'加载成功'};
        }catch(e){
            return {status:false,message:`加载地址出现错误：${e.message}`};
        }


    }
    async getPhoneNumberList(args, event) {
        const { platform, cardId } = args;
        try{
            const data = await app.sdb.select('number_record',{platform:platform})
            return {status:true,message:'查询成功',data:data};
        }catch(e){
            return {status:false,message:'查询出错',data:[]}
        }
    }
    async deletePhoneNumber(args, event) {
        const {platform, phoneNumber } = args;
        try{
            await app.sdb.delete('number_record',{platform:platform,phone_number:phoneNumber})
            return {status:true,message:'删除成功'};
        }catch(e){
            return {status:false,message:'删除出错'}
        }
    }
    async sendMessage(args, event) {
        const { platform, cardId, phoneNumber } = args;
        const url = platforms.find(item => item.platform === platform)?.url;
        const view = app.viewsMap.get(cardId);
        try{
            // 加载目标 URL
            await view.webContents.loadURL(url + `send?phone=${phoneNumber}`);
            return {status:true,message:'加载成功'};
        }catch(e){
            return {status:false,message:`加载地址出现错误：${e.message}`};
        }
    }

    _resizeView(mainWin, view) {
        if (mainWin && view) {
            const [width, height] = mainWin.getContentSize();
            view.setBounds({ x: 291, y: 0, width: width - 289, height });
        }
    }
    async _applyProxySettings(webContents, config) {
        if (!webContents) {
            Log.error('webContents 是必须的');
            return;
        }
        // 如果没有传入 config，删除现有的代理设置
        if (!config) {
            Log.info('当前会话未提供代理config，删除现有的代理设置');
            webContents.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36")
            webContents.session.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36", "zh-CN")
            await webContents.session.setProxy({proxyRules: '',mode: 'system'}, () => {
                Log.info('代理设置已删除');
            });
            return;
        }

        // 检查 config 中的必要属性是否为空字符串或未定义
        const requiredFields = ['proxyType', 'host', 'port'];
        for (const field of requiredFields) {
            if (!config[field] || config[field].trim() === '') {
                Log.warn(`代理配置缺失或无效: ${field} 是必须的`);
                // 删除原有的代理设置
                webContents.session.setProxy({proxyRules: ''}, () => {
                    Log.info('代理设置已删除');
                });
                return;
            }
        }

        let proxyConfig = '';
        // 根据代理模式构建代理配置
        switch (config.proxyType) {
            case 'noProxy':
                proxyConfig = 'direct://';
                return;
            case 'http':
                proxyConfig = `http://${config.host}:${config.port}`;
                break;
            case 'https':
                proxyConfig = `https://${config.host}:${config.port}`;
                break;
            case 'socks4':
                proxyConfig = `socks4://${config.host}:${config.port}`;
                break;
            case 'socks5':
                proxyConfig = `socks5://${config.host}:${config.port}`;
                break;
            default:
                Log.warn('未知的代理类型，使用直接连接');
                proxyConfig = 'direct://';
                break;
        }

        Log.info('配置代理：', proxyConfig);

        // 将代理设置到 webContents 的 session 中
        await webContents.session.setProxy({proxyRules: proxyConfig}, () => {
            Log.info(`代理设置为: ${proxyConfig}`);
        });

        // 监听登录事件以处理代理身份验证
        if (config.username && config.password) {
            webContents.on('login', (event, request, authInfo, callback) => {
                event.preventDefault();
                if (authInfo.isProxy && authInfo.host === config.host && authInfo.port === Number(config.port)) {
                    Log.info('提供代理凭据');
                    callback(config.username, config.password);
                }
            });
        } else {
            Log.info('代理配置中没有提供用户名和密码，跳过身份验证配置');
        }
    }
    _addListener(view) {
        this.hideAllWindow()
        const mainId = Addon.get('window').getMWCid();
        const mainWin = BrowserWindow.fromId(mainId);
        if (view && !view.webContents.isDestroyed()) {
            const [width, height] = mainWin.getContentSize();
            view.setBounds({ x: 291, y: 0, width: width - 289, height });
            mainWin.contentView.addChildView(view);
            mainWin.removeAllListeners('resize');
            mainWin.on('resize', () => this._resizeView(mainWin, view));
            this._resizeView(mainWin, view);
            view.setVisible(true);
            view.webContents.openDevTools()
        }
    }
    _createWebView(cardId) {
        const view = new WebContentsView({
            webPreferences: {
                sandbox: true,
                devTools: false,
                partition: `persist:${cardId}`,
                nodeIntegration: false,
                contextIsolation: true,
                preload: path.join(__dirname, '../preload/bridge.js') // 指定 preload 脚本路径
            },
        });
        // const mySession = session.fromPartition(`persist:${cardId}`);
        // mySession.webRequest.onCompleted({ urls: ['*://*/*'] }, (details) => {
        //     Log.info('请求 URL:', details.url);
        //     Log.info('请求方法:', details.method);
        //     Log.info('服务器 IP:', details.ip);
        //     Log.info('请求时间戳:', details.timestamp);
        //     Log.info('请求资源类型:', details.resourceType);
        // });
        return view;
    }
    _generateRandomDesktopUA() {
        const browsers = [
            {
                name: 'Chrome',
                versions: Array.from({ length: 31 }, (_, i) => 100 + i), // 生成版本号 100 到 130
                userAgentTemplate: 'Mozilla/5.0 ({os}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version}.0.0.0 Safari/537.36'
            }
        ];

        const operatingSystems = [
            'Windows NT 10.0; Win64; x64',
            'Windows NT 6.1; Win64; x64', // Windows 7
        ];

        // 随机选择浏览器
        const browser = browsers[Math.floor(Math.random() * browsers.length)];
        // 随机选择版本号
        const version = browser.versions[Math.floor(Math.random() * browser.versions.length)];
        // 随机选择操作系统
        const os = operatingSystems[Math.floor(Math.random() * operatingSystems.length)];

        // 使用模板生成 UA 字符串
        return browser.userAgentTemplate.replace('{version}', version).replace('{os}', os);
    }

    async _loadConfig(cardId) {
        const view = app.viewsMap.get(cardId);

        // 检查 view 是否存在
        if (!view || !view.webContents) {
            Log.error('无效的 view 对象，无法加载配置');
            return; // 提前返回，避免后续操作
        }
        // 查询配置信息
        const dbConfig = await app.sdb.selectOne('card_config', { card_id: cardId });

        if (!dbConfig) {
            Log.warn('未找到配置，未进行任何设置');
            return; // 配置未找到，提前返回
        }

        // 将数据库字段映射为代码中使用的字段名
        const config = {
            userAgent: dbConfig.user_agent || null,
            cookie: dbConfig.cookie || null,
            proxyType: dbConfig.proxy_type || null,
            proxyStatus: dbConfig.proxy_status || null,
            host: dbConfig.proxy_host || null,
            port: dbConfig.proxy_port || null,
            username: dbConfig.proxy_username || null,
            password: dbConfig.proxy_password || null
        };

        // 设置 User-Agent
        if (config.userAgent) {
            view.webContents.setUserAgent(config.userAgent);
            Log.info('User-Agent 已设置:', config.userAgent);
        }

        // 设置代理（仅在代理信息完整时）
        if (config.proxyStatus === 'true' && config.proxyType && config.host && config.port) {
            await this._applyProxySettings(view.webContents, config);
            Log.info('代理配置已应用:', { proxyType: config.proxyType, host: config.host, port: config.port, username: config.username });
        } else {
            // 如果没有代理信息，则清除代理设置
            await this._applyProxySettings(view.webContents, null);
            Log.info('代理配置已清除');
        }

        // 设置 Cookies
        if (config.cookie) {
            this._setCookies(view.webContents, config.cookie);
            Log.info('Cookies 已设置');
        }
    }

    // 示例 _setCookies 方法
    _setCookies(webContents, cookie) {
        const session = webContents.session;
        if (session && cookie) {
            session.cookies.set(cookie)
                .then(() => {
                    Log.info('Cookies 设置成功:', cookie);
                })
                .catch((error) => {
                    Log.error('设置 Cookies 时出错:', error);
                });
        }
    }

    _destroyView(cardId) {
        try {
            // 从 app.viewsMap 获取 WebContentsView
            const view = app.viewsMap.get(cardId);
            // 检查 view 是否存在且未销毁
            if (view && !view.webContents.isDestroyed()) {
                view.setVisible(false)
                const mainId = Addon.get('window').getMWCid();
                const mainWindow = BrowserWindow.fromId(mainId);
                Log.info('mainId:', mainId);
                if (mainWindow) {
                    // 销毁 WebContents 以释放资源
                    view.webContents.destroy()
                    mainWindow.contentView.removeChildView(view);
                    // 从 app.viewsMap 中删除该视图的引用
                    app.viewsMap.delete(cardId);
                }
            } else {
                console.warn(`未找到 cardId 为 ${cardId} 的有效视图或视图已被销毁`);
            }
        } catch (error) {
            console.error(`销毁 WebContentsView 时出错: ${error.message}`);
        }
    }

    _getSystemLanguage() {
        // 使用环境变量 `LANG` 来获取系统语言（在 Linux 和 macOS 上适用）
        if (process.env.LANG) {
            return process.env.LANG.split('.')[0]; // `LANG` 格式可能是 `en_US.UTF-8`
        }

        // 使用 `Intl.DateTimeFormat` 获取系统区域设置（适用于跨平台）
        return Intl.DateTimeFormat().resolvedOptions().locale;
    }

}

WindowService.toString = () => '[class WindowService]';
module.exports = WindowService;
