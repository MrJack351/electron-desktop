'use strict';

const { Controller } = require('ee-core');
const Log = require('ee-core/log');
const Services = require('ee-core/services');
const Addon = require('ee-core/addon');

/**
 * Updater
 * @class
 */
class UpdaterController extends Controller {

    constructor(ctx) {
        super(ctx);
    }

    /**
     * 获取应用基础信息
     */
    appInfo() {
        const appInfo = {
            currentVersion: ""
        }
        appInfo.currentVersion = Services.get('updater').currentVersion();
        Log.info('当前版本信息：', appInfo.currentVersion);
        return appInfo;
    }

    /**
     * 检查是否有新版本
     */
    checkForUpdater() {
        Services.get('updater').checkUpdate();
        return;
    }

    /**
     * 下载新版本
     */
    downloadApp() {
        Services.get('updater').download();
        return;
    }

    /**
     * 安装新版本
     */
    relaunchApp() {
        Services.get('updater').relaunchApp();
        return;
    }
}

UpdaterController.toString = () => '[class UpdaterController]';
module.exports = UpdaterController;
