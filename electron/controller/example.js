'use strict';

const { Controller } = require('ee-core');
const Log = require('ee-core/log');
const Services = require('ee-core/services');
const Addon = require('ee-core/addon');
const Ps = require('ee-core/ps');
/**
 * example
 * @class
 */
class ExampleController extends Controller {

  constructor(ctx) {
    super(ctx);
  }


  /**
   * 所有方法接收两个参数
   * @param args 前端传的参数
   * @param event - ipc通信时才有值。详情见：控制器文档
   */

  /**
   * test
   */
  async test (args,event) {
    const result = await Services.get('example').test('electron');
    Log.info('service result:', result);

    return 'hello electron-egg';
  }

  async addWindow(args, event) {
    // 从 args 参数中解析出传入的数据
    const windowOptions = {
      type: args.type,
      content: args.content,
      windowName: args.windowName,
      windowTitle: args.windowTitle,
    };

    // 调用 createWindow 方法来创建窗口
    const winContentsId = this.createWindow(windowOptions);

    // 返回窗口的内容 ID 或其他相关信息
    return winContentsId;
  }

  /**
   * 打开新窗口
   */
  createWindow (args) {
    const { type, content, windowName, windowTitle } = args;
    let contentUrl = null;
    if (type == 'html') {
      contentUrl = path.join('file://', electronApp.getAppPath(), content)
    } else if (type == 'web') {
      contentUrl = content;
    } else if (type == 'vue') {
      let addr = 'http://localhost:8080'
      if (Ps.isProd()) {
        const mainServer = Conf.getValue('mainServer');
        if (Conf.isFileProtocol(mainServer)) {
          addr = mainServer.protocol + path.join(Ps.getHomeDir(), mainServer.indexPath);
        } else {
          addr = mainServer.protocol + mainServer.host + ':' + mainServer.port;
        }
      }
      contentUrl = addr + content;
    } else {
      // some
    }
    console.log('contentUrl: ', contentUrl);
    let opt = {
      title: windowTitle
    }
    const win = Addon.get('window').create(windowName, opt);

    const winContentsId = win.webContents.id;

    // load page
    win.loadURL(contentUrl);

    return winContentsId;
  }

}

ExampleController.toString = () => '[class ExampleController]';
module.exports = ExampleController;
