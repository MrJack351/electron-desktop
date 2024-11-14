const { Application } = require('ee-core');
const Log = require('ee-core/log');
const Services = require('ee-core/services');
const { app, BrowserWindow, WebContentsView,webContents ,ipcMain} = require('electron');
const request = require('./utils/request'); // 导入工具类
const path = require('path');
const fs = require('fs');
const {translateText,getLanguages} = require('./api/index')
const Addon = require("ee-core/addon");
const Storage = require("ee-core/storage");
const Database = require('./utils/DatabaseUtils');
class Index extends Application {
  constructor() {
    super();
    app.sdb = new Database();
    app.viewsMap = new Map();
    this.initializeDatabase()
  }

  /**
   * core app have been loaded
   */
  async ready () {
    // do some things

  }
  async initializeDatabase() {
    // 定义表结构
    const tables = {
      'cards': {
        columns: {
          card_id: 'TEXT PRIMARY KEY',
          platform: 'TEXT',
          platform_url: 'TEXT',
          card_name: 'TEXT',
          avatar_url: 'TEXT',
          window_id: 'INTEGER',
          active_status: 'TEXT',
          online_status: 'TEXT',
          show_badge: 'TEXT',
        },
        constraints: []
      },
      'card_config': {
        columns: {
          card_id: 'TEXT PRIMARY KEY',
          name: 'TEXT',
          user_agent: 'TEXT',
          cookie: 'TEXT',
          proxy_status: 'TEXT',
          proxy_type: 'TEXT',
          proxy_host: 'TEXT',
          proxy_port: 'TEXT',
          proxy_username: 'TEXT',
          proxy_password: 'TEXT',
        },
        constraints: []
      },
      'number_record': {
        columns: {
          card_id: 'TEXT',          // 会话ID
          platform: 'TEXT',          // 平台
          phone_number: 'TEXT',      // 号码
          phone_status: 'TEXT',      // 手机号码状态
          message: 'TEXT',           // 日志信息
          status: 'TEXT'             // 检测状态
        },
        constraints: [
          'PRIMARY KEY(phone_number)',               // 主键
          'UNIQUE(phone_number, platform)'           // 复合唯一约束
        ]
      },
      'user_portrait': {
        columns: {
          card_id: 'TEXT',          // 会话ID
          platform: 'TEXT',          // 平台
          nickname: 'TEXT',          // 昵称
          phone_number: 'TEXT',      // 手机号码
          country: 'TEXT',      // 国家
          gender: 'TEXT',           // 性别
          notes: 'TEXT'             // 备注
        },
        constraints: [
          'PRIMARY KEY(phone_number)',               // 主键
          'UNIQUE(phone_number, platform)'           // 复合唯一约束
        ]
      },
      'follow_up_record': {
        columns: {
          card_id: 'TEXT',          // 会话ID
          platform: 'TEXT',          // 平台
          phone_number: 'TEXT',      // 手机号码
          time: 'TEXT',      // 时间
          content: 'TEXT',           // 内容
        },
        constraints: [
          'PRIMARY KEY(phone_number)',               // 主键
          'UNIQUE(phone_number, platform)'           // 复合唯一约束
        ]
      }
    };

    // 同步每个表的结构
    for (const [tableName, { columns, constraints }] of Object.entries(tables)) {
      await app.sdb.syncTableStructure(tableName, columns, constraints);
    }

    console.log("所有表结构同步完成");
  }

  /**
   * electron app ready
   */
  async electronAppReady () {
    // do some things

  }

  /**
   * main window have been loaded
   */
  async windowReady () {
    // do some things
    // 延迟加载，无白屏
    const winOpt = this.config.windowsOption;
    if (winOpt.show === false) {
      const win = this.electron.mainWindow;
      win.once('ready-to-show', () => {
        win.show();
      })
    }
    //设置所有平台账号登录状态为false
    app.sdb.update('cards',{online_status:'false',avatar_url:'',show_badge:'false'},{})
    ipcMain.handle('language-list', async (event) => {
      return getLanguages()
    });
    ipcMain.handle('translate-text', async (event, args) => {
      const {text,local,target} = args
      return translateText(text,local,target)
    });
    ipcMain.handle('online-notify', async (event, args) => {
      const {online,platform,avatarUrl} = args;
      // 获取发送消息的渲染进程的 webContents 对象
      const senderWebContents = event.sender;
      const processId = senderWebContents.id;
      const mainId = Addon.get('window').getMWCid();
      const mainWin = BrowserWindow.fromId(mainId);
      if (mainWin && mainWin.webContents) {
        const card = await app.sdb.selectOne('cards',{window_id:processId})
        if (card) {
          const cardId = card.card_id;
          const onlineStatus = card.online_status;
          const result = (onlineStatus === String(online)); // 将 online 转换为字符串
          const status = String(online)
          if (!result) {
            await app.sdb.update('cards', { online_status: status, avatar_url: avatarUrl }, { platform: platform, card_id: cardId });
          mainWin.webContents.send('online-notify', { cardId: cardId, onlineStatus: online,avatarUrl:avatarUrl });
            Log.info(`登录状态发生改变已发送给渲染程序`);
          }
        }
        return {status:true,message:'状态修改成功！'}
      } else {
        return {status:false,message:'未找到的渲染进程！'};
      }
    });
    // 接收渲染进程发送的 IPC 消息，并执行 JS 操作
    ipcMain.on('execute-js-operation', async (event,url) => {
      const platforms = app.platforms ?? []
      try {
        // 获取发送该消息的渲染进程的 webContents
        const senderWebContents = event.sender;
        const fileName = platforms.find(item => item.url === url)?.platform;
        Log.info('fileName:', fileName,' url:',url);
        if (fileName) {
          // 获取要执行的 JavaScript 文件内容
          const scriptPath = path.join(__dirname, 'scripts', `${fileName}.js`);
          const scriptContent = fs.readFileSync(scriptPath, 'utf-8');
          // 在发送该消息的渲染进程中执行 JavaScript
          await senderWebContents.executeJavaScript(scriptContent);
          Log.info('脚本已成功在渲染进程中执行');
        }else {
          Log.error('没有找到该地址对应的js代码：',url)
        }
      } catch (error) {
        Log.error('执行脚本时出错:', error);
      }
    });
    ipcMain.on('message-notify', async (event,args) => {
      // 获取发送消息的渲染进程的 webContents 对象
      const senderWebContents = event.sender;
      const processId = senderWebContents.id;
    });
    // 监听来自渲染进程的 `号码过滤` 事件
    ipcMain.on('filter-notify', (event, data) => {
      // 处理接收到的数据
      Log.info("接收到的网页数据:", data);
      const {cardId,phoneNumber,platform,result:{ phone_status, message }} = data;
      // 写入数据库
      app.sdb.insert('number_record',{card_id:cardId,phone_number:phoneNumber,platform:platform,phone_status:phone_status,message:message,status:'true'});
      const mainId = Addon.get('window').getMWCid();
      const mainWin = BrowserWindow.fromId(mainId);
      if (mainWin && mainWin.webContents) {
        mainWin.webContents.send('number_filter-notify',data)
        Log.info('号码过滤消息推送成功：')
      }
    });
    ipcMain.handle('new-message-notify', (event, data) => {
      const {platform} = data;
      // 获取发送消息的渲染进程的 webContents 对象
      const senderWebContents = event.sender;
      const processId = senderWebContents.id;
      const card = app.sdb.selectOne('cards',{window_id:processId,platform:platform})
      // 处理接收到的数据
      Log.info("收到新消息:", platform,processId);
      if (!card) return;
      Log.info('获取到对应卡片数据：',card)
      //修改数据库字段并发送通知给主进程
      app.sdb.update('cards',{show_badge:'true'},{card_id:card.card_id,active_status:"false"});
      const mainId = Addon.get('window').getMWCid();
      const mainWin = BrowserWindow.fromId(mainId);
      if (mainWin && mainWin.webContents) {
        mainWin.webContents.send('new-message-notify', {cardId:card.card_id,platform:card.platform})
        Log.info('新消息提醒推送成功：')
      }
    });
    //用户画像按钮监听
    ipcMain.handle('show-user-portrait-panel', async (event, data) => {
      const {platform, phone_number} = data;
      if (phone_number==='' || phone_number===undefined) return;
      // 获取发送消息的渲染进程的 webContents 对象
      const senderWebContents = event.sender;
      const processId = senderWebContents.id;
      const card = app.sdb.selectOne('cards', {window_id: processId, platform: platform})
      if (!card) return;
      const mainId = Addon.get('window').getMWCid();
      const mainWin = BrowserWindow.fromId(mainId);
      if (mainWin && mainWin.webContents) {
        //构建数据
        const args = {card_id: card.card_id, platform: card.platform,phone_number:phone_number};
        const result = await Services.get('user').getUserPortrait(args)
        mainWin.webContents.send('open-user-portrait', result)
      }
    });
  }
  /**
   * before app close
   */
  async beforeClose () {
    // do some things

  }


}
Index.toString = () => '[class Index]';
module.exports = Index;
